import { useSolicitudes } from '../context/SolicitudesContext';
import { CheckCircle, XCircle, Clock, Check, X } from 'lucide-react';

export default function MisSolicitudesPage() {
  const { solicitudes } = useSolicitudes();

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

  return (
    <div className="p-6 max-w-[1920px] mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mis Solicitudes</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Detalle</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Observaciones de Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {solicitudes.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No has realizado ninguna solicitud.</td>
              </tr>
            ) : (
              solicitudes.map((sol) => (
                <tr key={sol.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{new Date(sol.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 uppercase text-xs font-bold text-gray-500">{sol.tipo}</td>
                  <td className="px-6 py-4">
                    {sol.tipo === 'insumo' ? (
                      <span>{sol.cantidad}x {sol.insumo?.nombre || 'Insumo'}</span>
                    ) : (
                      <span>Préstamo de Equipo <br/><span className="text-xs text-gray-400">{sol.fecha_inicio} a {sol.fecha_fin}</span></span>
                    )}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(sol.estado)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 italic">
                    {sol.observaciones_admin || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
