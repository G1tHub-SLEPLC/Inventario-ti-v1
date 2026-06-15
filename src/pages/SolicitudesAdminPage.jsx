import { useState, useMemo } from 'react';
import { useSolicitudes } from '../context/SolicitudesContext';
import { useInventario } from '../context/InventarioContext';
import { supabase } from '../lib/supabaseClient';
import { Check, X, Clock, Download, Printer, AlertTriangle } from 'lucide-react';
import { logAuditoria } from '../utils/auditoria';
import { exportToExcelAndPDF } from '../utils/exportUtils';
import { sendInsumoAprobadoEmail } from '../utils/emailUtils';
import { useAuth } from '../context/AuthContext';
import { useSort } from '../hooks/useSort';
import { SortableHeader } from '../components/SortableHeader';

export default function SolicitudesAdminPage() {
  const { solicitudes, updateEstadoSolicitud, refetch: refetchSolicitudes } = useSolicitudes();
  const { equipos, showToast, refetchInventario, broadcastEquiposChanges, updateEquipo } = useInventario();
  const { perfil } = useAuth();
  const { sorted: sortedSolicitudes, sortKey: solSortKey, sortDir: solSortDir, handleSort: handleSolSort } = useSort(solicitudes);

  const atrasosPorUsuario = useMemo(() => {
    return solicitudes.reduce((acc, sol) => {
      if (sol.estado === 'devuelto_atrasado') {
        acc[sol.usuario_id] = (acc[sol.usuario_id] || 0) + 1;
      }
      return acc;
    }, {});
  }, [solicitudes]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [accion, setAccion] = useState(''); // 'aprobar', 'rechazado', 'devolver'
  const [devolucionStatus, setDevolucionStatus] = useState('a_tiempo');

  const handleOpenModal = (solicitud, tipoAccion) => {
    setSelectedSolicitud(solicitud);
    setAccion(tipoAccion);
    setObservaciones('');
    setDevolucionStatus('a_tiempo');
    setIsModalOpen(true);
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!selectedSolicitud) return;

    let nuevoEstado = accion === 'aprobar' ? 'aprobado' : (accion === 'rechazado' ? 'rechazado' : (devolucionStatus === 'atrasado' ? 'devuelto_atrasado' : 'devuelto'));
    const adminName = perfil?.nombre || perfil?.email || 'Admin';
    const obsPrefix = `[${accion === 'aprobar' ? 'Aprobado' : (accion === 'rechazado' ? 'Rechazado' : 'Devuelto')} por: ${adminName}]`;
    const observacionFinal = observaciones.trim() ? `${obsPrefix} ${observaciones.trim()}` : obsPrefix;

    try {
      if (accion === 'aprobar') {
        if (selectedSolicitud.tipo === 'insumo') {
          const { data: insumoActual, error: errorInsumo } = await supabase
            .from('insumos')
            .select('cantidad_disponible')
            .eq('id', selectedSolicitud.insumo_id)
            .single();

          if (errorInsumo) throw errorInsumo;
          if (insumoActual.cantidad_disponible < selectedSolicitud.cantidad) {
            showToast('Error', 'No hay stock suficiente para aprobar esta solicitud.', 'error');
            return;
          }

          const { error: updError } = await supabase
            .from('insumos')
            .update({ cantidad_disponible: insumoActual.cantidad_disponible - selectedSolicitud.cantidad })
            .eq('id', selectedSolicitud.insumo_id);

          if (updError) throw updError;
          await refetchSolicitudes();

          const userName = selectedSolicitud.perfil?.nombre || selectedSolicitud.perfil?.correo || 'Usuario';
          const userEmail = selectedSolicitud.perfil?.correo || selectedSolicitud.perfil?.email;

          if (userEmail) {
            sendInsumoAprobadoEmail({
              userEmail: userEmail,
              userName: userName,
              insumoNombre: insumoActual.nombre,
              cantidad: selectedSolicitud.cantidad,
              observaciones: observacionFinal
            });
          }
        } else if (selectedSolicitud.tipo === 'prestamo') {
          const equipoReal = equipos.find(eq => eq.id === selectedSolicitud.equipo_id || eq['Nº de serie'] === selectedSolicitud.equipo_id);
          if (equipoReal) {
            const idx = equipos.findIndex(eq => eq.id === equipoReal.id);
            if (idx >= 0) {
              const updatedEq = {
                ...equipoReal,
                estado: 'EN PRESTAMO',
                usuario_asignado_id: selectedSolicitud.usuario_id,
                devolucion_fecha: selectedSolicitud.fecha_fin,
                devolucion_hora: selectedSolicitud.hora_fin
              };
              await updateEquipo(idx, updatedEq);
              if (broadcastEquiposChanges) broadcastEquiposChanges();
            }
          }
        }
      } else if (accion === 'devolver' || (accion === 'rechazado' && selectedSolicitud.tipo === 'prestamo')) {
        const equipoReal = equipos.find(eq => eq.id === selectedSolicitud.equipo_id || eq['Nº de serie'] === selectedSolicitud.equipo_id);
        if (equipoReal) {
          const idx = equipos.findIndex(eq => eq.id === equipoReal.id);
          if (idx >= 0) {
            const updatedEq = {
              ...equipoReal,
              estado: 'PARA PRESTAMO',
              usuario_asignado_id: null,
            };
            delete updatedEq.devolucion_fecha;
            delete updatedEq.devolucion_hora;
            await updateEquipo(idx, updatedEq);
            if (broadcastEquiposChanges) broadcastEquiposChanges();
          }
        }
      }

      await updateEstadoSolicitud(selectedSolicitud.id, nuevoEstado, observacionFinal);

      const userName = selectedSolicitud.perfil?.nombre || selectedSolicitud.perfil?.correo || 'Usuario';
      const actionText = accion === 'aprobar' ? 'Aprobó' : (accion === 'rechazado' ? 'Rechazó' : 'Registró Devolución');
      let typeText = '';
      if (selectedSolicitud.tipo === 'insumo') {
        typeText = `solicitud de insumo: ${selectedSolicitud.insumo?.nombre || 'Desconocido'} (${selectedSolicitud.cantidad}x)`;
      } else {
        const eqObj = equipos.find(eq => eq.id === selectedSolicitud.equipo_id || eq['N° de serie'] === selectedSolicitud.equipo_id);
        const eqName = eqObj ? `${eqObj.Marca} ${eqObj.Modelo}` : `ID: ${selectedSolicitud.equipo_id}`;
        typeText = `préstamo de equipo: ${eqName}`;
      }
      await logAuditoria('solicitudes', `${actionText} Solicitud`, `${actionText} ${typeText} para ${userName}. Observaciones: ${observacionFinal}`, userName);

      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      showToast('Error', 'No se pudo procesar la solicitud.', 'error');
    }
  };

  const getStatusBadge = (estado) => {
    const baseClass = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase border whitespace-nowrap";
    switch (estado) {
      case 'pendiente': return <span className={`${baseClass} bg-amber-100 text-amber-600 border-amber-600`}><Clock size={12} strokeWidth={2.5} /> Pendiente</span>;
      case 'aprobado': return <span className={`${baseClass} bg-green-300 text-green-800 border-green-600`}><Check size={12} strokeWidth={2.5} /> Aprobado</span>;
      case 'rechazado': return <span className={`${baseClass} bg-rose-200 text-red-600 border-red-600`}><X size={12} strokeWidth={2.5} /> Rechazado</span>;
      case 'devuelto': return <span className={`${baseClass} bg-blue-200 text-blue-600 border-blue-600`}><Check size={12} strokeWidth={2.5} /> Devuelto</span>;
      case 'devuelto_atrasado': return <span className={`${baseClass} bg-orange-200 text-orange-600 border-orange-600`}><AlertTriangle size={12} strokeWidth={2.5} /> Devuelto (Atraso)</span>;
      default: return <span className={`${baseClass} bg-gray-50 text-gray-700 border-gray-200`}>{estado}</span>;
    }
  };

  const exportData = (format) => {
    const cols = ['Fecha', 'Usuario', 'Tipo', 'Detalle', 'Estado', 'Observaciones Admin'];
    const formatter = (row) => {
      let detalle = '';
      if (row.tipo === 'insumo') {
        detalle = `${row.cantidad}x ${row.insumo?.nombre || 'Insumo eliminado'}`;
      } else {
        const equipoObj = equipos.find(eq => eq.id === row.equipo_id || eq['N° de serie'] === row.equipo_id);
        const equipoNombre = equipoObj ? `${equipoObj.Marca} ${equipoObj.Modelo}` : `Equipo ID: ${row.equipo_id}`;
        detalle = `${equipoNombre} (${row.fecha_inicio} ${row.hora_inicio || ''} a ${row.fecha_fin} ${row.hora_fin || ''}) - Por: ${row.perfil?.nombre || 'Usuario'}`;
      }

      return {
        'Fecha': new Date(row.created_at).toLocaleDateString(),
        'Usuario': row.perfil?.nombre || row.perfil?.correo || 'Usuario',
        'Tipo': row.tipo.toUpperCase(),
        'Detalle': detalle,
        'Estado': row.estado.toUpperCase(),
        'Observaciones Admin': row.observaciones_admin || '—'
      };
    };

    exportToExcelAndPDF(format, solicitudes, cols, 'Gestión de Solicitudes', 'solicitudes_reporte', formatter);
  };

  return (
    <div className="p-6 max-w-[1920px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Solicitudes</h1>
        <div className="flex gap-2">
          <button onClick={() => exportData('xlsx')} className="flex items-center gap-2 bg-green-200 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-300 shadow-sm font-medium transition-colors text-sm">
            <Download size={14} /> Excel
          </button>
          <button onClick={() => exportData('pdf')} className="flex items-center gap-2 bg-rose-200 text-rose-800 px-3 py-1.5 rounded-lg hover:bg-rose-300 shadow-sm font-medium transition-colors text-sm">
            <Printer size={14} /> PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto table-scroll border border-gray-200">
        <table className="min-w-full text-sm text-left whitespace-nowrap">
          <thead className="uppercase text-xs border-b border-gray-200">
            <tr>
              <SortableHeader label="Fecha" sortKey="created_at" currentKey={solSortKey} currentDir={solSortDir} onSort={handleSolSort} className="px-6 py-3" />
              <SortableHeader label="Usuario" sortKey="perfil" currentKey={solSortKey} currentDir={solSortDir} onSort={handleSolSort} className="px-6 py-3" />
              <SortableHeader label="Tipo" sortKey="tipo" currentKey={solSortKey} currentDir={solSortDir} onSort={handleSolSort} className="px-6 py-3" />
              <th className="px-6 py-3">Detalle</th>
              <SortableHeader label="Estado" sortKey="estado" currentKey={solSortKey} currentDir={solSortDir} onSort={handleSolSort} className="px-6 py-3" />
              <th className="px-6 py-3">Observaciones</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {solicitudes.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No hay solicitudes recientes.</td>
              </tr>
            ) : (
              sortedSolicitudes.map((sol) => (
                <tr key={sol.id} className="hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-none">
                  <td className="px-6 py-4 text-gray-500">{new Date(sol.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{sol.perfil?.nombre || sol.perfil?.correo || 'Usuario'}</div>
                    {sol.estado === 'pendiente' && sol.tipo === 'prestamo' && atrasosPorUsuario[sol.usuario_id] > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200 w-fit font-bold">
                        <AlertTriangle size={10} /> Historial Atrasos ({atrasosPorUsuario[sol.usuario_id]})
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 uppercase text-xs font-bold text-gray-500">{sol.tipo}</td>
                  <td className="px-6 py-4">
                    {sol.tipo === 'insumo' ? (
                      <span>{sol.cantidad}x {sol.insumo?.nombre || 'Insumo eliminado'}</span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">
                          {(() => {
                            const equipoObj = equipos.find(eq => eq.id === sol.equipo_id || eq['N° de serie'] === sol.equipo_id);
                            return equipoObj ? `${equipoObj.Marca} ${equipoObj.Modelo}` : `Equipo ID: ${sol.equipo_id}`;
                          })()}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">Por: {sol.perfil?.nombre || sol.perfil?.correo || 'Usuario'}</span>
                        <span className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">
                          {sol.fecha_inicio} {sol.hora_inicio ? sol.hora_inicio.slice(0, 5) : ''} a {sol.fecha_fin} {sol.hora_fin ? sol.hora_fin.slice(0, 5) : ''}
                        </span>
                        {sol.motivo && <span className="text-xs text-gray-500 mt-1 italic block overflow-hidden text-ellipsis max-w-xs">Motivo: {sol.motivo}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(sol.estado)}</td>
                  <td className="px-6 py-4 text-gray-500 italic whitespace-normal min-w-[200px] break-words">{sol.observaciones_admin || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    {sol.estado === 'pendiente' && (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenModal(sol, 'aprobar')} className="flex items-center gap-1 bg-green-300 text-green-800 border border-green-600 hover:bg-green-400 font-bold px-2.5 py-1 rounded text-xs transition shadow-sm">
                          <Check size={12} strokeWidth={3} /> Aprobar
                        </button>
                        <button onClick={() => handleOpenModal(sol, 'rechazado')} className="flex items-center gap-1 bg-rose-200 text-red-600 border border-red-600 hover:bg-rose-300 font-bold px-2.5 py-1 rounded text-xs transition shadow-sm">
                          <X size={12} strokeWidth={3} /> Rechazar
                        </button>
                      </div>
                    )}
                    {sol.estado === 'aprobado' && sol.tipo === 'prestamo' && (
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <button onClick={() => handleOpenModal(sol, 'devolver')} className="text-blue-600 hover:text-blue-800 font-bold px-2 py-1 bg-blue-50 rounded text-xs transition border border-blue-200 shadow-sm">Registrar Devolución</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {accion === 'aprobar' ? 'Aprobar Solicitud' : (accion === 'devolver' ? 'Registrar Devolución' : 'Rechazar Solicitud')}
            </h2>
            <form onSubmit={handleConfirm} className="space-y-4">
              {accion === 'devolver' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado de la Devolución</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="devolucionStatus" value="a_tiempo" checked={devolucionStatus === 'a_tiempo'} onChange={() => setDevolucionStatus('a_tiempo')} className="text-[#006BB9] focus:ring-[#006BB9]" />
                      <span className="text-sm text-gray-700">A tiempo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="devolucionStatus" value="atrasado" checked={devolucionStatus === 'atrasado'} onChange={() => setDevolucionStatus('atrasado')} className="text-orange-600 focus:ring-orange-600" />
                      <span className="text-sm text-gray-700">Con Atraso</span>
                    </label>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {accion === 'rechazar' ? 'Observaciones (obligatorio)' : 'Observaciones (opcional)'}
                </label>
                <textarea
                  required={accion === 'rechazar'}
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-blue-500 focus:ring-blue-500"
                  rows="3"
                  placeholder={accion === 'rechazar' ? "Indique el motivo del rechazo..." : "Ej: Aprobado para entrega en bodega 2..."}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancelar</button>
                <button type="submit" className={`px-4 py-2 text-white rounded ${accion === 'aprobar' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
