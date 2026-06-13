import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Package } from 'lucide-react';

const EstadoBadge = ({ estado }) => {
  const est = (estado || 'DISPONIBLE').toUpperCase();
  const isDisp = est === 'DISPONIBLE';
  return (
    <span className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase border whitespace-nowrap ${
      isDisp ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
    }`}>
      {est}
    </span>
  );
};

// Misma función fromDbRow usada en InventarioContext
function fromDbRow(dbRow) {
  const detalles = { ...(dbRow.detalles || {}) };
  if (detalles['Codigo Compra Agil / Licitación / Codigo Convenio Marco'] !== undefined) {
    detalles['ID Publicación'] = detalles['Codigo Compra Agil / Licitación / Codigo Convenio Marco'];
    delete detalles['Codigo Compra Agil / Licitación / Codigo Convenio Marco'];
  }
  return {
    id: dbRow.id,
    'Nº de serie': dbRow.serial,
    'Orden de Compra': dbRow.orden_compra,
    'Factura': dbRow.factura,
    hasOcFile: dbRow.has_oc_file,
    hasFacturaFile: dbRow.has_factura_file,
    estado: dbRow.estado || 'DISPONIBLE',
    usuario_asignado_id: dbRow.usuario_asignado_id || null,
    ...detalles
  };
}

export default function QRInfoPage() {
  const [searchParams] = useSearchParams();
  const equipoId = searchParams.get('equipo');
  const usuarioNombre = searchParams.get('usuario');

  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (equipoId) {
          let foundData = null;
          const searchVal = equipoId.trim();
          
          // Intentar buscar por ID numérico
          if (!isNaN(searchVal) && searchVal !== '') {
            const { data } = await supabase.from('equipos').select('*').eq('id', Number(searchVal)).limit(1);
            if (data && data.length > 0) foundData = data[0];
          }
          
          // Buscar por columna "serial" (nombre real en la DB)
          if (!foundData) {
            const { data } = await supabase.from('equipos').select('*').eq('serial', searchVal).limit(1);
            if (data && data.length > 0) foundData = data[0];
          }

          // Buscar con ilike en serial por si hay diferencias de case
          if (!foundData) {
            const { data } = await supabase.from('equipos').select('*').ilike('serial', `%${searchVal}%`).limit(1);
            if (data && data.length > 0) foundData = data[0];
          }

          if (foundData) {
            setEquipos([fromDbRow(foundData)]);
          }
        } else if (usuarioNombre) {
          // Traer todos y filtrar por usuario (que está dentro de detalles JSON)
          const { data } = await supabase.from('equipos').select('*');
          if (data) {
            const parsed = data.map(fromDbRow);
            const filtered = parsed.filter(eq => {
              const user = (eq['Usuario'] || '').toLowerCase();
              return user.includes(usuarioNombre.toLowerCase());
            });
            setEquipos(filtered);
          }
        }
      } catch (err) {
        console.error("Error cargando info de QR:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [equipoId, usuarioNombre]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006BB9]"></div>
      </div>
    );
  }

  if (equipos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
        <Package size={48} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Información no encontrada</h2>
        <p className="text-gray-600">No hay datos disponibles para este código QR.</p>
      </div>
    );
  }

  const isUserView = !!usuarioNombre;

  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-[#25306B] text-white p-5 sm:p-6 text-center">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {isUserView ? `Equipos Asignados` : `Información del Equipo`}
          </h1>
          <p className="text-sm sm:text-base opacity-90 mt-1 font-medium">
            {isUserView ? usuarioNombre : 'SLEP LOS COPIHUES'}
          </p>
        </div>
        
        <div className="p-4 sm:p-6 bg-slate-50/50">
          {/* VISTA MÓVIL (Tarjetas) */}
          <div className="md:hidden space-y-4">
            {equipos.map((equipo, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-3">
                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{equipo['Descripción del Bien'] || 'Equipo sin descripción'}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{equipo['Marca'] || 'Sin Marca'} - {equipo['Modelo'] || 'Sin Modelo'}</p>
                  </div>
                  <EstadoBadge estado={equipo.estado} />
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm pt-1">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Nº Serie</span>
                    <span className="font-mono text-gray-800 font-medium">{equipo['Nº de serie'] || '—'}</span>
                  </div>
                  {!isUserView && (
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Usuario</span>
                      <span className="text-gray-800 font-medium">{equipo['Usuario'] || '—'}</span>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Ubicación</span>
                    <span className="text-gray-800 font-medium">{equipo['SubDirección'] || '—'}</span>
                  </div>
                  {!isUserView && (
                    <>
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Proveedor</span>
                        <span className="text-gray-800 font-medium">{equipo['Proveedor'] || '—'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Garantía</span>
                        <span className="text-gray-800 font-medium">{equipo['Garantia (Meses)'] ? `${equipo['Garantia (Meses)']} Meses` : '—'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* VISTA ESCRITORIO (Tabla) */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Marca/Modelo</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nº Serie</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                  {!isUserView && <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>}
                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ubicación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {equipos.map((equipo, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-gray-900 font-medium">{equipo['Descripción del Bien'] || '—'}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {equipo['Marca'] || '—'} / {equipo['Modelo'] || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-700">{equipo['Nº de serie'] || '—'}</td>
                    <td className="py-3 px-4">
                      <EstadoBadge estado={equipo.estado} />
                    </td>
                    {!isUserView && (
                      <td className="py-3 px-4 text-gray-700">
                        {equipo['Usuario'] && equipo['Usuario'].trim().toLowerCase() !== 'disponible' 
                          ? equipo['Usuario'] 
                          : <span className="text-gray-400 italic">Sin asignar</span>}
                      </td>
                    )}
                    <td className="py-3 px-4 text-gray-700">{equipo['SubDirección'] || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
