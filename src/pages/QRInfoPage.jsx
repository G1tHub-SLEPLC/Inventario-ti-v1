import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import EstadoBadge from '../components/EstadoBadge';
import { Package } from 'lucide-react';

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
          const { data, error } = await supabase.from('equipos').select('*').eq('id', equipoId).single();
          if (data) setEquipos([data]);
        } else if (usuarioNombre) {
          // Buscamos todos los equipos asignados a este usuario
          const { data, error } = await supabase.from('equipos')
            .select('*')
            .ilike('Usuario', `%${usuarioNombre}%`);
          if (data) setEquipos(data);
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
