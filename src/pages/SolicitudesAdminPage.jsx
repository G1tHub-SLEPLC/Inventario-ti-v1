import { useState } from 'react';
import { useSolicitudes } from '../context/SolicitudesContext';
import { useInventario } from '../context/InventarioContext';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, XCircle, Clock, Download, Printer, Check, X } from 'lucide-react';
import { logAuditoria } from '../utils/auditoria';
import { exportToExcelAndPDF } from '../utils/exportUtils';
import { sendInsumoAprobadoEmail } from '../utils/emailUtils';
import { useAuth } from '../context/AuthContext';

export default function SolicitudesAdminPage() {
  const { solicitudes, updateEstadoSolicitud } = useSolicitudes();
  const { equipos, showToast } = useInventario();
  const { perfil } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [accion, setAccion] = useState(''); // 'aprobar' o 'rechazar'

  const handleOpenModal = (solicitud, tipoAccion) => {
    setSelectedSolicitud(solicitud);
    setAccion(tipoAccion);
    setObservaciones('');
    setIsModalOpen(true);
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    const nuevoEstado = accion === 'aprobar' ? 'aprobado' : 'rechazado';
    const adminName = perfil?.nombre || perfil?.email || 'Admin';
    const obsPrefix = `[${accion === 'aprobar' ? 'Aprobado' : 'Rechazado'} por: ${adminName}]`;
    const observacionFinal = observaciones.trim() ? `${obsPrefix} ${observaciones.trim()}` : obsPrefix;
    
    try {
      if (accion === 'aprobar') {
        if (selectedSolicitud.tipo === 'insumo') {
          // Descontar stock
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

          // Restar stock
          const { error: updError } = await supabase
            .from('insumos')
            .update({ cantidad_disponible: insumoActual.cantidad_disponible - selectedSolicitud.cantidad })
            .eq('id', selectedSolicitud.insumo_id);
            
          if (updError) throw updError;

          // Send Email
          const userName = selectedSolicitud.perfil?.nombre || selectedSolicitud.perfil?.correo || 'Usuario';
          const userEmail = selectedSolicitud.perfil?.correo || selectedSolicitud.perfil?.email; // supabase auth emails might be in 'email' or 'correo' depends on the profile structure
          
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
          // Cambiar estado del equipo a 'EN PRESTAMO' y asignar el usuario
          // selectedSolicitud.equipo_id holds the serial or string ID
          const equipoReal = equipos.find(eq => eq.id === selectedSolicitud.equipo_id || eq['Nº de serie'] === selectedSolicitud.equipo_id);
          
          if (equipoReal) {
             const { error: eqError } = await supabase
               .from('equipos')
               .update({ 
                 estado: 'EN PRESTAMO',
                 usuario_asignado_id: selectedSolicitud.usuario_id 
               })
               .eq('id', equipoReal.id);
               
             if (eqError) throw eqError;
          }
        }
      }

      await updateEstadoSolicitud(selectedSolicitud.id, nuevoEstado, observacionFinal);
      
      // Log to Auditoria
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

  const getStatusBadge = (estado) => {
    const baseClass = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase border whitespace-nowrap";
    switch(estado) {
      case 'pendiente': return <span className={`${baseClass} bg-amber-50 text-amber-700 border-amber-200`}><Clock size={12} strokeWidth={2.5}/> Pendiente</span>;
      case 'aprobado': return <span className={`${baseClass} bg-emerald-50 text-emerald-700 border-emerald-200`}><Check size={12} strokeWidth={2.5}/> Aprobado</span>;
      case 'rechazado': return <span className={`${baseClass} bg-rose-50 text-rose-700 border-rose-200`}><X size={12} strokeWidth={2.5}/> Rechazado</span>;
      case 'devuelto': return <span className={`${baseClass} bg-blue-50 text-blue-700 border-blue-200`}><Check size={12} strokeWidth={2.5}/> Devuelto</span>;
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
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Usuario</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Detalle</th>
              <th className="px-6 py-3">Estado</th>
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
              solicitudes.map((sol) => (
                <tr key={sol.id} className="hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-none">
                  <td className="px-6 py-4 text-gray-500">{new Date(sol.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{sol.perfil?.nombre || sol.perfil?.correo || 'Usuario'}</td>
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
                          {sol.fecha_inicio} {sol.hora_inicio ? sol.hora_inicio.slice(0,5) : ''} a {sol.fecha_fin} {sol.hora_fin ? sol.hora_fin.slice(0,5) : ''}
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
                        <button onClick={() => handleOpenModal(sol, 'aprobar')} className="text-emerald-600 hover:text-emerald-800 font-bold px-2 py-1 bg-emerald-50 rounded text-xs transition">Aprobar</button>
                        <button onClick={() => handleOpenModal(sol, 'rechazado')} className="text-red-600 hover:text-red-800 font-bold px-2 py-1 bg-red-50 rounded text-xs transition">Rechazar</button>
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
              {accion === 'aprobar' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
            </h2>
            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Observaciones (opcional)</label>
                <textarea 
                  value={observaciones} 
                  onChange={e => setObservaciones(e.target.value)} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-blue-500 focus:ring-blue-500" 
                  rows="3"
                  placeholder="Ej: Aprobado para entrega en bodega 2..."
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
