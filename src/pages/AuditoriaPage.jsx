import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { exportToExcelAndPDF } from '../utils/exportUtils';
import { Download, Printer, Search, ShieldCheck } from 'lucide-react';

function getInitials(name) {
  if (!name || name === '—' || name === '-') return '??';
  const words = String(name).trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroModulo, setFiltroModulo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();

    const channel = supabase.channel('auditoria_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'auditoria' }, (payload) => {
        // Al recibir un nuevo registro, recargar la lista
        loadLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('auditoria')
      .select('*, perfiles:usuario_id(nombre, email)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando auditoría:', error);
    } else {
      const formatted = data.map(log => ({
        ...log,
        usuario_nombre: log.perfiles?.nombre || log.perfiles?.email || 'Sistema / Desconocido'
      }));
      setLogs(formatted || []);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => {
    const matchModulo = filtroModulo ? log.modulo === filtroModulo : true;
    const searchString = `${log.usuario_nombre} ${log.accion} ${log.detalles}`.toLowerCase();
    const matchSearch = searchTerm ? searchString.includes(searchTerm.toLowerCase()) : true;
    return matchModulo && matchSearch;
  });

  const exportData = (format) => {
    const columns = ['Fecha', 'Módulo', 'Usuario que ejecutó', 'Usuario Afectado', 'Acción', 'Detalles', 'Observaciones'];
    
    const rowFormatter = (row, cols) => {
      let mainText = row.detalles || '—';
      let diffText = '—';

      if (mainText.includes('Cambios detectados:')) {
        const parts = mainText.split('Cambios detectados:');
        mainText = parts[0].trim();
        diffText = parts[1].trim();
      }

      const dateStr = new Date(row.created_at).toLocaleString();
      return {
        'Fecha': dateStr,
        'Módulo': row.modulo.toUpperCase(),
        'Usuario que ejecutó': row.usuario_nombre,
        'Usuario Afectado': row.usuario_afectado || '—',
        'Acción': row.accion,
        'Detalles': mainText,
        'Observaciones': diffText
      };
    };

    exportToExcelAndPDF(
      format, 
      filteredLogs, 
      columns, 
      'Registro de Auditoría y Trazabilidad', 
      'auditoria_export', 
      rowFormatter
    );
  };

  return (
    <div className="p-6 max-w-[1920px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldCheck className="text-[#006BB9]" size={28} /> 
          Auditoría del Sistema
        </h1>
        
        <div className="flex gap-2">
          <button onClick={() => loadLogs()} className="flex items-center gap-2 bg-blue-50 text-[#006BB9] px-3 py-1.5 rounded-lg hover:bg-blue-100 shadow-sm font-medium transition-colors text-sm border border-blue-200">
            Actualizar
          </button>
          <button onClick={() => exportData('xlsx')} className="flex items-center gap-2 bg-green-200 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-300 shadow-sm font-medium transition-colors text-sm">
            <Download size={14} /> Excel
          </button>
          <button onClick={() => exportData('pdf')} className="flex items-center gap-2 bg-rose-200 text-rose-800 px-3 py-1.5 rounded-lg hover:bg-rose-300 shadow-sm font-medium transition-colors text-sm">
            <Printer size={14} /> PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar en registros (usuario, acción, detalles)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none bg-white"
            />
          </div>
          <div className="w-full sm:w-64">
            <select 
              value={filtroModulo} 
              onChange={(e) => setFiltroModulo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg text-sm p-2 focus:ring-2 focus:ring-[#006BB9] focus:outline-none bg-white"
            >
              <option value="">Todos los Módulos</option>
              <option value="equipos">Equipos</option>
              <option value="insumos">Insumos</option>
              <option value="solicitudes">Solicitudes</option>
              <option value="usuarios">Usuarios</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto table-scroll">
          <table className="min-w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Fecha y Hora</th>
                <th className="px-6 py-3">Módulo</th>
                <th className="px-6 py-3">Usuario que ejecutó</th>
                <th className="px-6 py-3">Usuario Modificado</th>
                <th className="px-6 py-3">Acción</th>
                <th className="px-6 py-3">Detalles</th>
                <th className="px-6 py-3">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">Cargando registros...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500 italic">No hay registros de auditoría que coincidan con la búsqueda.</td></tr>
              ) : (
                filteredLogs.map((log) => {
                  let mainText = log.detalles || '—';
                  let diffText = null;

                  if (mainText.includes('Cambios detectados:')) {
                    const parts = mainText.split('Cambios detectados:');
                    mainText = parts[0].trim();
                    diffText = parts[1].trim();
                  }

                  return (
                    <tr key={log.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-3 text-gray-500 font-mono text-xs">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="px-6 py-3"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">{log.modulo}</span></td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 p-0.5 pr-2.5 rounded-full text-[12px] font-bold border border-blue-200 shadow-sm">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black uppercase shrink-0">
                            {getInitials(log.usuario_nombre)}
                          </span>
                          <span title={log.usuario_nombre}>{log.usuario_nombre}</span>
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap bg-emerald-50/50">
                        {log.usuario_afectado && log.usuario_afectado !== '-' ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 p-0.5 pr-2.5 rounded-full text-[12px] font-bold border border-emerald-200 shadow-sm">
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black uppercase shrink-0">
                              {getInitials(log.usuario_afectado)}
                            </span>
                            <span title={log.usuario_afectado}>{log.usuario_afectado}</span>
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium">-</span>
                        )}
                      </td>
                      <td className="px-6 py-3 font-semibold text-[#25306B]">{log.accion}</td>
                      <td className="px-6 py-3 text-gray-600 min-w-[200px] max-w-[300px] whitespace-normal break-words">{mainText}</td>
                      <td className="px-6 py-3 text-gray-600 min-w-[250px] max-w-[400px] whitespace-normal break-words">
                        {diffText && diffText !== '—' ? (
                          <ul className="space-y-1 font-mono text-xs text-slate-500 list-disc list-inside">
                            {diffText.split('|').map((diffItem, i) => (
                              <li key={i} className="leading-relaxed">{diffItem.trim()}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="italic text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
