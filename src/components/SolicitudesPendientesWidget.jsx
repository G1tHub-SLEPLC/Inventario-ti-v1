import React, { useState } from 'react';
import { useSolicitudes } from '../context/SolicitudesContext';
import { useInventario } from '../context/InventarioContext';
import { supabase } from '../lib/supabaseClient';
import { Clock, Check, X } from 'lucide-react';
import { logAuditoria } from '../utils/auditoria';
import { sendInsumoAprobadoEmail } from '../utils/emailUtils';
import { useAuth } from '../context/AuthContext';

export default function SolicitudesPendientesWidget() {
  const { solicitudes, updateEstadoSolicitud, refetch: refetchSolicitudes } = useSolicitudes();
  const { equipos, showToast, refetch: refetchInventario } = useInventario();
  const { perfil } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [accion, setAccion] = useState('');

  const pendientes = (solicitudes || []).filter(s => s.estado === 'pendiente');

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
          await refetchSolicitudes();

          // Send Email
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
             const { error: eqError } = await supabase
               .from('equipos')
               .update({ 
                 estado: 'EN PRESTAMO',
                 usuario_asignado_id: selectedSolicitud.usuario_id 
               })
               .eq('id', equipoReal.id);
               
             if (eqError) throw eqError;
             await refetchInventario();
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

  const getStatusBadge = () => {
    const baseClass = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase border whitespace-nowrap";
    return <span className={`${baseClass} bg-amber-100 text-amber-600 border-amber-600`}><Clock size={12} strokeWidth={2.5}/> Pendiente</span>;
  };


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#25306B] flex items-center gap-2">
          <Clock className="text-rose-500" /> Solicitudes Pendientes ({pendientes.length})
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left whitespace-nowrap">
          <thead className="uppercase text-[11px] font-bold tracking-wider text-gray-500 border-b border-gray-100 bg-slate-50">
            <tr>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Detalle</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pendientes.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 bg-gray-50/50">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Check size={24} className="text-emerald-400" />
                    <span>No hay solicitudes pendientes en este momento.</span>
                  </div>
                </td>
              </tr>
            ) : (
              pendientes.map((sol) => (
              <tr key={sol.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-6 py-4 text-gray-600 font-medium">{new Date(sol.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-bold text-[#25306B]">{sol.perfil?.nombre || sol.perfil?.correo || 'Usuario'}</td>
                <td className="px-6 py-4">
                   <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">
                     {sol.tipo}
                   </span>
                </td>
                <td className="px-6 py-4">
                  {sol.tipo === 'insumo' ? (
                    <span className="font-medium text-gray-800">{sol.cantidad}x {sol.insumo?.nombre || 'Insumo eliminado'}</span>
                  ) : (
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                         {(() => {
                           const equipoObj = equipos.find(eq => eq.id === sol.equipo_id || eq['N° de serie'] === sol.equipo_id);
                           return equipoObj ? `${equipoObj.Marca} ${equipoObj.Modelo}` : `Equipo ID: ${sol.equipo_id}`;
                         })()}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        {sol.fecha_inicio} {sol.hora_inicio ? sol.hora_inicio.slice(0,5) : ''} a {sol.fecha_fin} {sol.hora_fin ? sol.hora_fin.slice(0,5) : ''}
                      </span>
                      {sol.motivo && <span className="text-xs text-gray-500 mt-1 italic block overflow-hidden text-ellipsis max-w-xs">Motivo: {sol.motivo}</span>}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">{getStatusBadge()}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleOpenModal(sol, 'aprobar')} className="flex items-center gap-1.5 bg-green-300 text-green-800 border border-green-400 hover:bg-green-400 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm">
                      <Check size={14} strokeWidth={3} /> Aprobar
                    </button>
                    <button onClick={() => handleOpenModal(sol, 'rechazado')} className="flex items-center gap-1.5 bg-rose-200 text-red-600 border border-red-600 hover:bg-rose-300 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm">
                      <X size={14} strokeWidth={3} /> Rechazar
                    </button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 transform transition-all scale-100">
            <h2 className="text-xl font-bold mb-4 text-[#25306B]">
              {accion === 'aprobar' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
            </h2>
            <form onSubmit={handleConfirm} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones (Opcional)</label>
                <textarea 
                  value={observaciones} 
                  onChange={e => setObservaciones(e.target.value)} 
                  className="w-full rounded-xl border-gray-300 shadow-sm border p-3 focus:border-[#006BB9] focus:ring-[#006BB9] transition-shadow bg-gray-50 text-sm" 
                  rows="3"
                  placeholder="Añada una justificación o comentario para el usuario..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className={`px-5 py-2.5 text-white font-semibold rounded-xl shadow-sm transition-colors ${accion === 'aprobar' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                  {accion === 'aprobar' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
