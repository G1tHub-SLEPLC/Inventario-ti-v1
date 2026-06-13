import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInventario } from '../context/InventarioContext';
import { supabase } from '../lib/supabaseClient';
import { MonitorSmartphone, AlertTriangle, User } from 'lucide-react';
import { isSameUser } from '../utils/userUtils';

const COLUMNS = [
  'Descripción del Bien', 'Marca', 'Modelo', 'Nº de serie',
  'ID Publicación',
  'Orden de Compra', 'Factura', 'Proveedor', 'SubDirección', 'Usuario'
];

function isAvailable(usuario) {
  const v = (usuario || '').toLowerCase().trim();
  return v === '' || v === 'disponible' || v === 'bodega' || v === 'sin asignar' || v === '—' || v === '-';
}

function getEstadoFinal(row) {
  if (!row) return 'DISPONIBLE';
  const isDisp = isAvailable(row['Usuario']);
  const dbEstado = (row.estado || '').trim().toUpperCase();

  if (!isDisp) {
    if (dbEstado === 'EN PRESTAMO' || dbEstado === 'EN PRÉSTAMO') return 'EN PRESTAMO';
    if (dbEstado === 'BAJA' || dbEstado === 'DE BAJA') return 'DE BAJA';
    return 'ASIGNADO';
  } else {
    if (dbEstado === 'ASIGNADO') return 'DISPONIBLE';
    if (dbEstado === 'EN PRESTAMO' || dbEstado === 'EN PRÉSTAMO') return 'EN PRESTAMO';
    if (dbEstado === 'BAJA' || dbEstado === 'DE BAJA') return 'DE BAJA';
    if (dbEstado === 'PARA PRESTAMO' || dbEstado === 'PARA PRÉSTAMO') return 'PARA PRESTAMO';
    return dbEstado || 'DISPONIBLE';
  }
}

function safe(v) {
  return (v == null || String(v).trim() === '') ? '—' : String(v).trim();
}

function getBadgeClass(estado, isUserBadge = false) {
  const base = "font-sans px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase whitespace-nowrap border";
  if (isUserBadge) return `${base} bg-blue-50 text-blue-700 border-blue-200`;

  if (estado === 'DISPONIBLE') return `${base} bg-green-300 text-green-700 border-green-600`;
  if (estado === 'PARA PRESTAMO' || estado === 'PARA PRÉSTAMO') return `${base} bg-indigo-300 text-indigo-700 border-indigo-600`;
  if (estado === 'EN PRESTAMO' || estado === 'EN PRÉSTAMO') return `${base} bg-amber-300 text-amber-700 border-amber-600`;
  if (estado === 'BAJA' || estado === 'DE BAJA') return `${base} bg-rose-300 text-red-700 border-red-600`;
  return `${base} bg-lime-300 text-lime-700 border-lime-600`; // ASIGNADO
}

function getInitials(name) {
  if (!name || name === '—') return '??';
  const words = String(name).trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function formatEmailName(email) {
  if (!email) return '';
  return email.split('@')[0]
    .split(/[\.\-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function QRInfoPage() {
  const { equipos, loading } = useInventario();
  const [searchParams] = useSearchParams();
  
  const searchSerial = useMemo(() => {
    return (searchParams.get('q') || searchParams.get('search') || '').trim().toLowerCase();
  }, [searchParams]);

  const searchUserId = useMemo(() => {
    return (searchParams.get('user') || '').trim();
  }, [searchParams]);

  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (!searchUserId) return;
    
    async function loadUserProfile() {
      setLoadingProfile(true);
      try {
        const { data, error } = await supabase.from('perfiles').select('nombre, email').eq('id', searchUserId).single();
        if (error || !data) {
          setProfileError(true);
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setProfileError(true);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadUserProfile();
  }, [searchUserId]);

  const targetEquipos = useMemo(() => {
    if (loading || equipos.length === 0) return [];
    
    if (searchUserId) {
      if (!profile) return [];
      const uName = profile.nombre || '';
      return equipos.filter(eq => {
        if (eq.usuario_asignado_id === searchUserId) return true;
        
        // fallback legacy check using system equivalence:
        return eq['Usuario'] && isSameUser(eq['Usuario'], uName);
      });
    }

    if (searchSerial) {
      const found = equipos.find(eq => {
        const serial = (eq['Nº de serie'] || '').trim().toLowerCase();
        return serial === searchSerial;
      });
      return found ? [found] : [];
    }

    return [];
  }, [searchUserId, profile, searchSerial, equipos, loading]);

  if (loading || (searchUserId && loadingProfile)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-gray-500 font-medium">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006BB9] mb-2"></div>
        Cargando información...
      </div>
    );
  }

  // Errores o parámetros faltantes
  if (!searchUserId && !searchSerial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl max-w-sm text-center space-y-3">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Parámetro de búsqueda faltante</h2>
          <p className="text-xs text-gray-500">Por favor, escanea un código QR válido para ver la información.</p>
        </div>
      </div>
    );
  }

  if (searchUserId && profileError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl max-w-sm text-center space-y-3">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Funcionario no encontrado</h2>
          <p className="text-xs text-gray-500">No se pudo cargar el perfil del funcionario solicitado.</p>
        </div>
      </div>
    );
  }

  if (searchSerial && targetEquipos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl max-w-sm text-center space-y-3">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Equipo no encontrado</h2>
          <p className="text-xs text-gray-500">No se encontró ningún equipo con el número de serie <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1 rounded">{searchParams.get('q') || searchParams.get('search')}</span>.</p>
        </div>
      </div>
    );
  }

  if (searchUserId && targetEquipos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl max-w-sm text-center space-y-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
            <User size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">{profile?.nombre || formatEmailName(profile?.email)}</h2>
          <p className="text-xs text-gray-500 font-bold">{profile?.email}</p>
          <p className="text-xs text-gray-400 mt-2 border-t pt-2">El funcionario no registra ningún equipo tecnológico asignado actualmente en el inventario.</p>
        </div>
      </div>
    );
  }

  const columnsToShow = [...COLUMNS, 'Estado'];

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center justify-center gap-4">
      
      {/* Información del Funcionario (si es QR de usuario) */}
      {searchUserId && profile && (
        <div className="w-full max-w-[1280px] bg-white rounded-2xl border border-gray-200 p-4 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide">
              {profile.nombre || formatEmailName(profile.email)}
            </h2>
            <p className="text-[11px] text-gray-500 font-mono">{profile.email}</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1280px] space-y-4">
        {/* Encabezado simple pero premium */}
        <div className="flex items-center gap-2 px-1">
          <MonitorSmartphone className="text-[#006BB9]" size={20} />
          <h1 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            {searchUserId ? 'Equipos Asignados' : 'Ficha Técnica del Equipo'}
          </h1>
        </div>

        {/* Tabla Responsiva */}
        <div className="w-full rounded-2xl border border-gray-200 md:bg-white md:shadow-lg overflow-hidden">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="min-w-full text-left border-collapse text-xs md:table">
              <thead className="hidden md:table-header-group">
                <tr className="bg-[#25306B] text-white border-b border-gray-200 uppercase font-bold text-[10px] tracking-wide">
                  {columnsToShow.map(c => (
                    <th key={c} className="px-4 py-3 whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 font-medium block md:table-row-group">
                {targetEquipos.map((eq, idx) => (
                  <tr 
                    key={eq.id || idx} 
                    className="hover:bg-slate-50 transition-colors flex flex-col md:table-row mb-5 md:mb-0 border border-gray-200 md:border-0 rounded-xl md:rounded-none p-4 md:p-0 bg-white md:bg-transparent shadow-xs md:shadow-none"
                  >
                    {columnsToShow.map(c => {
                      let cellContent = null;
                      if (c === 'Estado') {
                        const estadoFinal = getEstadoFinal(eq);
                        cellContent = (
                          <span className={getBadgeClass(estadoFinal)}>
                            {estadoFinal}
                          </span>
                        );
                      } else if (c === 'Usuario') {
                        const value = eq['Usuario'];
                        const isDisp = isAvailable(value);
                        if (!isDisp) {
                          cellContent = (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 p-0.5 pr-2.5 rounded-full text-[11px] font-bold border border-blue-200">
                              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-black uppercase shrink-0">
                                {getInitials(value)}
                              </span>
                              <span title={value}>{value}</span>
                            </span>
                          );
                        } else {
                          cellContent = <span className="text-gray-400">—</span>;
                        }
                      } else {
                        cellContent = <span className="break-words max-w-full">{safe(eq[c])}</span>;
                      }

                      return (
                        <td 
                          key={c} 
                          className="px-3 py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center md:table-cell border-b border-slate-100 last:border-0 md:border-b-0 text-left sm:text-right md:text-left gap-1"
                        >
                          <span className="font-bold text-[#25306B] md:hidden text-[10px] uppercase tracking-wider shrink-0">
                            {c}
                          </span>
                          <div className="text-gray-700 md:text-inherit font-medium text-xs sm:text-right md:text-left truncate-normal">
                            {cellContent}
                          </div>
                        </td>
                      );
                    })}
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
