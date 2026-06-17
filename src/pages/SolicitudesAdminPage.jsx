import { useState, useMemo } from 'react';
import { useSolicitudes } from '../context/SolicitudesContext';
import { useInventario } from '../context/InventarioContext';
import { supabase } from '../lib/supabaseClient';
import { Check, X, Clock, Download, Printer, AlertTriangle, FileText } from 'lucide-react';
import { logAuditoria } from '../utils/auditoria';
import { exportToExcelAndPDF } from '../utils/exportUtils';
import { sendInsumoAprobadoEmail } from '../utils/emailUtils';
import { useAuth } from '../context/AuthContext';
import { useSort } from '../hooks/useSort';
import { SortableHeader } from '../components/SortableHeader';
import { generateActaDocx } from '../utils/docxUtils';
import { getActaFirmadaUrl } from '../utils/storageUtils';

export default function SolicitudesAdminPage() {
  const { solicitudes, updateEstadoSolicitud, refetch: refetchSolicitudes } = useSolicitudes();
  const { equipos, showToast, refetchInventario, broadcastEquiposChanges, updateEquipo } = useInventario();
  const { perfil } = useAuth();
  const { sorted: sortedSolicitudes, sortKey: solSortKey, sortDir: solSortDir, handleSort: handleSolSort } = useSort(solicitudes);

  const [searchTerm, setSearchTerm] = useState('');

  const atrasosPorUsuario = useMemo(() => {
    return solicitudes.reduce((acc, sol) => {
      if (sol.estado === 'devuelto_atrasado') {
        acc[sol.usuario_id] = (acc[sol.usuario_id] || 0) + 1;
      }
      return acc;
    }, {});
  }, [solicitudes]);

  const filteredSortedSolicitudes = useMemo(() => {
    if (!searchTerm.trim()) return sortedSolicitudes;
    const term = searchTerm.toLowerCase();
    return sortedSolicitudes.filter(sol => {
      const tipoMatch = sol.tipo?.toLowerCase().includes(term);
      const estadoMatch = sol.estado?.toLowerCase().includes(term);
      const userMatch = sol.perfil?.nombre?.toLowerCase().includes(term) || sol.perfil?.correo?.toLowerCase().includes(term) || sol.perfil?.email?.toLowerCase().includes(term);
      const insumoMatch = sol.insumo?.nombre?.toLowerCase().includes(term);
      const obsMatch = sol.observaciones_admin?.toLowerCase().includes(term);
      const dateStr = new Date(sol.created_at).toLocaleDateString().includes(term);
      return tipoMatch || estadoMatch || userMatch || insumoMatch || obsMatch || dateStr;
    });
  }, [sortedSolicitudes, searchTerm]);

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

    let nuevoEstado = accion === 'aprobar' ? 'aprobado' : (accion === 'rechazar' ? 'rechazado' : (devolucionStatus === 'atrasado' ? 'devuelto_atrasado' : 'devuelto'));
    const adminName = perfil?.nombre || perfil?.email || 'Admin';
    const obsPrefix = `[${accion === 'aprobar' ? 'Aprobado' : (accion === 'rechazar' ? 'Rechazado' : 'Devuelto')} por: ${adminName}]`;
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
            showToast('Stock insuficiente', 'No hay suficientes insumos para aprobar la solicitud', 'warning');
            return;
          }

          const { error: insumoUpdateError } = await supabase
            .from('insumos')
            .update({ cantidad_disponible: insumoActual.cantidad_disponible - selectedSolicitud.cantidad })
            .eq('id', selectedSolicitud.insumo_id);

          if (insumoUpdateError) throw insumoUpdateError;

          if (selectedSolicitud.perfil?.correo || selectedSolicitud.perfil?.email) {
            sendInsumoAprobadoEmail({
              userEmail: selectedSolicitud.perfil.correo || selectedSolicitud.perfil.email,
              userName: selectedSolicitud.perfil.nombre || 'Usuario',
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
      } else if (accion === 'devolver' || (accion === 'rechazar' && selectedSolicitud.tipo === 'prestamo')) {
        const equipoReal = equipos.find(eq => eq.id === selectedSolicitud.equipo_id || eq['Nº de serie'] === selectedSolicitud.equipo_id);
        if (equipoReal) {
          const idx = equipos.findIndex(eq => eq.id === equipoReal.id);
          if (idx >= 0) {
            const updatedEq = {
              ...equipoReal,
              estado: 'PARA PRESTAMO',
              usuario_asignado_id: null,
              'Usuario': 'Disponible',
              'SubDirección': ''
            };
            delete updatedEq.devolucion_fecha;
            delete updatedEq.devolucion_hora;
            delete updatedEq.fecha_asignacion;
            await updateEquipo(idx, updatedEq);
            if (broadcastEquiposChanges) broadcastEquiposChanges();
          }
        }
      }

      await updateEstadoSolicitud(selectedSolicitud.id, nuevoEstado, observacionFinal);
      
      const userName = selectedSolicitud.perfil?.nombre || selectedSolicitud.perfil?.correo || 'Usuario';
      const actionText = accion === 'aprobar' ? 'Aprobó' : 'Rechazó';
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

  const handleVerActa = async (path) => {
    if (!path) return;
    const url = await getActaFirmadaUrl(path);
    if (url) {
      window.open(url, '_blank');
    } else {
      showToast('Error', 'No se pudo abrir el acta', 'error');
    }
  };

  const handleGenerateActa = async (sol) => {
    try {
      const adminMatch = sol.observaciones_admin ? sol.observaciones_admin.match(/\[Aprobado por:\s*(.*?)\]/) : null;
      const approvedByName = adminMatch ? adminMatch[1].trim() : null;

      let currentAdminName = perfil?.nombre || 'Administrador TI';
      let currentAdminRut = perfil?.rut || '—';
      let currentAdminSub = perfil?.subdireccion || 'Tecnologías de la Información';

      if (approvedByName && approvedByName !== currentAdminName) {
         // Si fue aprobado por otro admin, buscamos sus datos
         const { data: admins } = await supabase.from('perfiles').select('*').eq('rol', 'admin_ti');
         if (admins) {
            const otherAdmin = admins.find(a => a.nombre === approvedByName || a.email === approvedByName);
            if (otherAdmin) {
               currentAdminName = otherAdmin.nombre || approvedByName;
               currentAdminRut = otherAdmin.rut || '—';
               currentAdminSub = otherAdmin.subdireccion || 'Tecnologías de la Información';
            }
         }
      }

      const adminName = currentAdminName;
      const adminRut = currentAdminRut;
      const userName = sol.perfil?.nombre || 'Usuario';
      const userRut = sol.perfil?.rut || '—';

      const equipoObj = equipos.find(eq => eq.id === sol.equipo_id || eq['Nº de serie'] === sol.equipo_id);
      const equipoStr = equipoObj ? `${equipoObj.Marca || ''} ${equipoObj.Modelo || ''}` : `ID: ${sol.equipo_id}`;
      const serieStr = equipoObj ? equipoObj['Nº de serie'] : '—';
      const estadoStr = equipoObj ? equipoObj.estado : '—';

      const d = new Date();
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const dia = d.getDate().toString().padStart(2, '0');
      const mes = meses[d.getMonth()];
      const ano = d.getFullYear().toString();

      const data = {
        ti_nombre: adminName,
        ti_rut: adminRut,
        ti_subdireccion: currentAdminSub,
        solicitante_nombre: userName,
        solicitante_rut: userRut,
        solicitante_subdireccion: sol.perfil?.subdireccion || '—',
        fecha_inicio: sol.fecha_inicio || '',
        fecha_fin: sol.fecha_fin || '',
        hora_inicio: sol.hora_inicio || '',
        hora_fin: sol.hora_fin || '',
        fecha_entrega: new Date().toLocaleDateString(),
        dia: dia,
        día: dia,
        DIA: dia,
        DÍA: dia,
        Día: dia,
        mes: mes,
        año: ano,
        equipos: [
          {
            tipo: equipoObj ? equipoObj['Descripción del Bien'] || 'Equipo' : 'Equipo',
            marca_modelo: equipoObj ? `${equipoObj.Marca || ''} ${equipoObj.Modelo || ''}`.trim() : '',
            serie: serieStr,
            codigo_interno: equipoObj ? (equipoObj.id || equipoObj['ID Publicación'] || '') : '',
            estado: estadoStr
          }
        ]
      };

      const result = await generateActaDocx(data);
      if (!result.success) {
         showToast('Error', result.error || 'No se pudo generar el acta', 'error');
      }
    } catch(err) {
       console.error(err);
       showToast('Error', 'Hubo un error al crear el acta.', 'error');
    }
  };

  const getStatusBadge = (sol) => {
    const baseClass = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase border whitespace-nowrap";
    if (sol.estado === 'aprobado' && sol.tipo === 'prestamo') {
      return <span className={`${baseClass} bg-amber-100 text-amber-700 border-amber-400`}><Clock size={12} strokeWidth={2.5} /> En Préstamo</span>;
    }
    switch (sol.estado) {
      case 'pendiente': return <span className={`${baseClass} bg-amber-100 text-amber-600 border-amber-600`}><Clock size={12} strokeWidth={2.5} /> Pendiente</span>;
      case 'aprobado': return <span className={`${baseClass} bg-green-300 text-green-800 border-green-600`}><Check size={12} strokeWidth={2.5} /> Aprobado</span>;
      case 'rechazado': return <span className={`${baseClass} bg-rose-200 text-red-600 border-red-600`}><X size={12} strokeWidth={2.5} /> Rechazado</span>;
      case 'devuelto': return <span className={`${baseClass} bg-blue-200 text-blue-600 border-blue-600`}><Check size={12} strokeWidth={2.5} /> Devuelto</span>;
      case 'devuelto_atrasado': return <span className={`${baseClass} bg-orange-200 text-orange-600 border-orange-600`}><AlertTriangle size={12} strokeWidth={2.5} /> Devuelto (Atraso)</span>;
      default: return <span className={`${baseClass} bg-gray-50 text-gray-700 border-gray-200`}>{sol.estado}</span>;
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

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Buscar solicitudes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#006BB9] focus:border-transparent"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
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
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {filteredSortedSolicitudes.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500 italic">
                  {searchTerm.trim() ? "No se encontraron resultados para la búsqueda." : "No hay solicitudes registradas."}
                </td>
              </tr>
            ) : (
              filteredSortedSolicitudes.map((sol) => (
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
                  <td className="px-6 py-4">
                    {getStatusBadge(sol)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 italic whitespace-normal min-w-[200px] break-words">{sol.observaciones_admin || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    {sol.estado === 'pendiente' && (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenModal(sol, 'aprobar')} className="flex items-center gap-1 bg-green-300 text-green-800 border border-green-600 hover:bg-green-400 font-bold px-2.5 py-1 rounded text-xs transition shadow-sm">
                          <Check size={12} strokeWidth={3} /> Aprobar
                        </button>
                        <button onClick={() => handleOpenModal(sol, 'rechazar')} className="flex items-center gap-1 bg-rose-200 text-red-600 border border-red-600 hover:bg-rose-300 font-bold px-2.5 py-1 rounded text-xs transition shadow-sm">
                          <X size={12} strokeWidth={3} /> Rechazar
                        </button>
                      </div>
                    )}
                    {sol.estado === 'aprobado' && sol.tipo === 'prestamo' && (
                      <div className="flex items-center justify-center mt-2">
                        {sol.acta_firmada_url ? (
                          <button onClick={() => handleVerActa(sol.acta_firmada_url)} className="flex items-center gap-1 bg-emerald-100 text-emerald-700 border border-emerald-400 hover:bg-emerald-200 font-bold px-2.5 py-1 rounded text-xs transition shadow-sm" title="Ver Acta Firmada">
                            <FileText size={12} strokeWidth={3} /> Ver Acta Firmada
                          </button>
                        ) : (
                          <button onClick={() => handleGenerateActa(sol)} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 border border-indigo-400 hover:bg-indigo-200 font-bold px-2.5 py-1 rounded text-xs transition shadow-sm">
                            <Download size={12} strokeWidth={3} /> Acta
                          </button>
                        )}
                      </div>
                    )}
                    {sol.estado === 'aprobado' && (
                      <div className="flex items-center justify-center mt-2 gap-2">
                        <button onClick={() => handleOpenModal(sol, 'devolver')} className="flex items-center gap-1 bg-blue-200 text-blue-700 border border-blue-600 hover:bg-blue-300 font-bold px-2.5 py-1 rounded text-xs transition shadow-sm">
                          <Clock size={12} strokeWidth={3} /> Registrar Devolución
                        </button>
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
