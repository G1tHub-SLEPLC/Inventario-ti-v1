import { useState, useMemo } from 'react';
import { useSolicitudes } from '../context/SolicitudesContext';
import { useInventario } from '../context/InventarioContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Clock, Check, X, AlertTriangle, Download } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { generateActaDocx } from '../utils/docxUtils';

export default function MisSolicitudesPage() {
  const { solicitudes } = useSolicitudes();
  const { equipos, showToast } = useInventario();
  const { session } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (estado) => {
    const baseClass = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase border whitespace-nowrap";
    switch(estado) {
      case 'pendiente': return <span className={`${baseClass} bg-amber-100 text-amber-600 border-amber-600`}><Clock size={12} strokeWidth={2.5}/> Pendiente</span>;
      case 'aprobado': return <span className={`${baseClass} bg-green-300 text-green-800 border-green-600`}><Check size={12} strokeWidth={2.5}/> Aprobado</span>;
      case 'rechazado': return <span className={`${baseClass} bg-rose-200 text-red-600 border-red-600`}><X size={12} strokeWidth={2.5}/> Rechazado</span>;
      case 'devuelto': return <span className={`${baseClass} bg-blue-200 text-blue-600 border-blue-600`}><Check size={12} strokeWidth={2.5}/> Devuelto</span>;
      case 'devuelto_atrasado': return <span className={`${baseClass} bg-orange-200 text-orange-600 border-orange-600`}><AlertTriangle size={12} strokeWidth={2.5}/> Devuelto (Atraso)</span>;
      default: return <span className={`${baseClass} bg-gray-50 text-gray-700 border-gray-200`}>{estado}</span>;
    }
  };

  const handleGenerateActa = async (sol) => {
    try {
      // Intentar obtener un admin_ti
      const { data: admins } = await supabase.from('perfiles').select('*').eq('rol', 'admin_ti').limit(1);
      const admin = admins && admins.length > 0 ? admins[0] : null;

      const adminName = admin?.nombre || 'Administrador TI';
      const adminRut = admin?.rut || '—';
      const adminSub = admin?.subdireccion || 'Tecnologías de la Información';

      const userName = session?.user?.user_metadata?.nombre || sol.perfil?.nombre || 'Usuario';
      const userRut = session?.user?.user_metadata?.rut || sol.perfil?.rut || '—';
      const userSub = session?.user?.user_metadata?.subdireccion || sol.perfil?.subdireccion || '—';

      const equipoObj = equipos.find(eq => eq.id === sol.equipo_id || eq['Nº de serie'] === sol.equipo_id);
      const equipoStr = equipoObj ? `${equipoObj.Marca || ''} ${equipoObj.Modelo || ''}` : `ID: ${sol.equipo_id}`;
      const serieStr = equipoObj ? equipoObj['Nº de serie'] : '—';
      const estadoStr = equipoObj ? equipoObj.estado : '—';

      const data = {
        ti_nombre: adminName,
        ti_rut: adminRut,
        ti_subdireccion: adminSub,
        solicitante_nombre: userName,
        solicitante_rut: userRut,
        solicitante_subdireccion: userSub,
        equipos: [
          {
            tipo: equipoObj ? equipoObj['Tipo de equipo'] || 'Equipo' : 'Equipo',
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

  const filteredSolicitudes = useMemo(() => {
    if (!searchTerm.trim()) return solicitudes;
    const term = searchTerm.toLowerCase();
    return solicitudes.filter(sol => {
      const tipoMatch = sol.tipo?.toLowerCase().includes(term);
      const estadoMatch = sol.estado?.toLowerCase().includes(term);
      const insumoMatch = sol.insumo?.nombre?.toLowerCase().includes(term);
      const obsMatch = sol.observaciones_admin?.toLowerCase().includes(term);
      const dateStr = new Date(sol.created_at).toLocaleDateString().includes(term);
      return tipoMatch || estadoMatch || insumoMatch || obsMatch || dateStr;
    });
  }, [solicitudes, searchTerm]);

  return (
    <div className="p-6 max-w-[1920px] mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mis Solicitudes</h1>

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

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Detalle</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Observaciones de Admin</th>
              <th className="px-6 py-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSolicitudes.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  {searchTerm.trim() ? "No se encontraron resultados para la búsqueda." : "No has realizado ninguna solicitud."}
                </td>
              </tr>
            ) : (
              filteredSolicitudes.map((sol) => (
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
                  <td className="px-6 py-4 text-center">
                    {sol.estado === 'aprobado' && sol.tipo === 'prestamo' && (
                      <button 
                        onClick={() => handleGenerateActa(sol)} 
                        className="flex items-center justify-center mx-auto gap-1 bg-indigo-100 text-indigo-700 border border-indigo-400 hover:bg-indigo-200 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm"
                        title="Descargar Acta de Préstamo"
                      >
                        <Download size={14} className="stroke-[2.5]"/> Acta
                      </button>
                    )}
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
