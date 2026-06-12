import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInventario } from '../context/InventarioContext';
import { MonitorSmartphone, AlertTriangle } from 'lucide-react';

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

export default function QRInfoPage() {
  const { equipos, loading } = useInventario();
  const [searchParams] = useSearchParams();
  
  const searchSerial = useMemo(() => {
    return (searchParams.get('q') || searchParams.get('search') || '').trim().toLowerCase();
  }, [searchParams]);

  const targetEquipo = useMemo(() => {
    if (!searchSerial || equipos.length === 0) return null;
    return equipos.find(eq => {
      const serial = (eq['Nº de serie'] || '').trim().toLowerCase();
      return serial === searchSerial;
    });
  }, [searchSerial, equipos]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-gray-500 font-medium">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006BB9] mb-2"></div>
        Cargando información...
      </div>
    );
  }

  if (!searchSerial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl max-w-sm text-center space-y-3">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Parámetro de búsqueda faltante</h2>
          <p className="text-xs text-gray-500">Por favor, escanea un código QR válido para ver la información del equipo.</p>
        </div>
      </div>
    );
  }

  if (!targetEquipo) {
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

  const columnsToShow = [...COLUMNS, 'Estado'];

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-[1280px] space-y-4">
        {/* Encabezado simple pero premium */}
        <div className="flex items-center gap-2 px-1">
          <MonitorSmartphone className="text-[#006BB9]" size={20} />
          <h1 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Ficha Técnica del Equipo
          </h1>
        </div>

        {/* Tabla Responsiva */}
        <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="min-w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#25306B] text-white border-b border-gray-200 uppercase font-bold text-[10px] tracking-wide">
                  {columnsToShow.map(c => (
                    <th key={c} className="px-4 py-3 whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
                <tr className="hover:bg-slate-50 transition-colors">
                  {columnsToShow.map(c => {
                    if (c === 'Estado') {
                      const estadoFinal = getEstadoFinal(targetEquipo);
                      return (
                        <td key={c} className="px-4 py-3 whitespace-nowrap align-middle">
                          <span className={getBadgeClass(estadoFinal)}>
                            {estadoFinal}
                          </span>
                        </td>
                      );
                    }

                    if (c === 'Usuario') {
                      const value = targetEquipo['Usuario'];
                      const isDisp = isAvailable(value);
                      if (!isDisp) {
                        return (
                          <td key={c} className="px-4 py-3 whitespace-nowrap align-middle">
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 p-0.5 pr-2.5 rounded-full text-[11px] font-bold border border-blue-200">
                              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-black uppercase shrink-0">
                                {getInitials(value)}
                              </span>
                              <span title={value}>{value}</span>
                            </span>
                          </td>
                        );
                      } else {
                        return (
                          <td key={c} className="px-4 py-3 text-gray-400 whitespace-nowrap align-middle">
                            —
                          </td>
                        );
                      }
                    }

                    const val = safe(targetEquipo[c]);
                    return (
                      <td key={c} className="px-4 py-3 max-w-[220px] break-words whitespace-normal align-middle">
                        {val}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
