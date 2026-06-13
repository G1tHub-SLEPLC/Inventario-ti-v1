import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { exportToExcelAndPDF } from '../utils/exportUtils';
import { Download, Printer, Search, ShieldCheck, AlertTriangle, Trash2 } from 'lucide-react';
import { useInventario } from '../context/InventarioContext';
import { useAuth } from '../context/AuthContext';
import { useSort } from '../hooks/useSort';
import { SortableHeader } from '../components/SortableHeader';

function getInitials(name) {
  if (!name || name === '—' || name === '-') return '??';
  const words = String(name).trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function AuditoriaPage() {
  const { session } = useAuth();
  const { clearInventario, equipos, showToast } = useInventario();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroModulo, setFiltroModulo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { sorted: sortedLogs, sortKey: audSortKey, sortDir: audSortDir, handleSort: handleAudSort } = useSort(logs);
  
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [clearError, setClearError] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [deleteOptions, setDeleteOptions] = useState({
    equipos: true,
    insumos: false,
    solicitudes: false,
    entregas: false,
    auditoria: false
  });
  
  const isAnyOptionSelected = Object.values(deleteOptions).some(v => v);

  const handleClearDatabase = async (e) => {
    e.preventDefault();
    setClearError('');
    setIsClearing(true);
    
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: adminPassword
      });
      
      if (authError) {
        setClearError(`Error de autenticación: ${authError.message}`);
        setIsClearing(false);
        return;
      }
      
      const deletedItems = [];

      if (deleteOptions.solicitudes) {
        const { error } = await supabase.from('solicitudes').delete().not('created_at', 'is', null);
        if (error) throw new Error('Error al borrar Solicitudes: ' + error.message);
        deletedItems.push('Solicitudes y Préstamos');
      } else if (deleteOptions.entregas) {
        const { error } = await supabase.from('solicitudes').delete().eq('tipo', 'insumo').eq('estado', 'aprobado');
        if (error) throw new Error('Error al borrar Entregas: ' + error.message);
        deletedItems.push('Historial de Entregas');
      }
      
      if (deleteOptions.insumos) {
        const { error } = await supabase.from('insumos').delete().not('created_at', 'is', null);
        if (error) throw new Error('Error al borrar Insumos: ' + error.message);
        deletedItems.push('Insumos y Stock');
      }
      
      if (deleteOptions.equipos) {
        await clearInventario(true);
        deletedItems.push('Equipos');
      }
      
      if (deleteOptions.auditoria) {
        const { error } = await supabase.from('auditoria').delete().not('created_at', 'is', null);
        if (error) throw new Error('Error al borrar Auditoría: ' + error.message);
        deletedItems.push('Historial de Auditoría');
      }

      setIsClearModalOpen(false);
      setAdminPassword('');
      setDeleteOptions({ equipos: true, insumos: false, solicitudes: false, entregas: false, auditoria: false });
      
      showToast('Borrado Exitoso', `Se eliminó correctamente: ${deletedItems.join(', ')}.`, 'success');
      loadLogs();
    } catch (err) {
      console.error('Error al borrar:', err);
      setClearError(err.message || 'Ocurrió un error al intentar borrar los datos.');
      showToast('Error', err.message || 'Error al intentar borrar.', 'error');
    }
    setIsClearing(false);
  };

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

  const filteredLogs = (sortedLogs || logs).filter(log => {
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
          <button onClick={() => loadLogs()} className="flex items-center gap-2 bg-blue-50 text-[#006BB9] px-3 py-1.5 rounded-lg hover:bg-blue-100 shadow-sm font-medium transition-colors text-sm border border-blue-200 cursor-pointer">
            Actualizar
          </button>
          <button onClick={() => exportData('xlsx')} className="flex items-center gap-2 bg-green-200 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-300 shadow-sm font-medium transition-colors text-sm cursor-pointer">
            <Download size={14} /> Excel
          </button>
          <button onClick={() => exportData('pdf')} className="flex items-center gap-2 bg-rose-200 text-rose-800 px-3 py-1.5 rounded-lg hover:bg-rose-300 shadow-sm font-medium transition-colors text-sm cursor-pointer">
            <Printer size={14} /> PDF
          </button>
          <button 
            onClick={() => setIsClearModalOpen(true)}
            className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-lg shadow-sm font-medium transition-colors text-sm cursor-pointer"
          >
            <Trash2 size={14} /> Limpiar Base de Datos
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
                <SortableHeader label="Fecha y Hora" sortKey="created_at" currentKey={audSortKey} currentDir={audSortDir} onSort={handleAudSort} className="px-6 py-3" />
                <SortableHeader label="Módulo" sortKey="modulo" currentKey={audSortKey} currentDir={audSortDir} onSort={handleAudSort} className="px-6 py-3" />
                <SortableHeader label="Usuario que ejecutó" sortKey="usuario_nombre" currentKey={audSortKey} currentDir={audSortDir} onSort={handleAudSort} className="px-6 py-3" />
                <SortableHeader label="Usuario Modificado" sortKey="usuario_afectado" currentKey={audSortKey} currentDir={audSortDir} onSort={handleAudSort} className="px-6 py-3" />
                <SortableHeader label="Acción" sortKey="accion" currentKey={audSortKey} currentDir={audSortDir} onSort={handleAudSort} className="px-6 py-3" />
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

      {isClearModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-red-600 p-6 flex flex-col items-center justify-center text-white">
              <AlertTriangle className="w-12 h-12 mb-2" strokeWidth={1.5} />
              <h2 className="text-xl font-bold text-center">¡Peligro! Borrado Permanente</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 text-center mb-4 leading-normal">
                Estás a punto de eliminar información de forma irreversible de la base de datos de Supabase. Esta acción no se puede deshacer.
              </p>

              <div className="bg-red-50 p-4 rounded-lg mb-4 text-left border border-red-100">
                <p className="text-sm font-semibold text-red-800 mb-2">Selecciona qué información borrar:</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={deleteOptions.equipos} onChange={(e) => setDeleteOptions({...deleteOptions, equipos: e.target.checked})} className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer" />
                    <span className="text-sm text-red-900">Equipos ({equipos.length} registros)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={deleteOptions.insumos} onChange={(e) => setDeleteOptions({...deleteOptions, insumos: e.target.checked})} className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer" />
                    <span className="text-sm text-red-900">Insumos y Stock</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={deleteOptions.solicitudes} onChange={(e) => setDeleteOptions({...deleteOptions, solicitudes: e.target.checked})} className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer" />
                    <span className="text-sm text-red-900">Solicitudes y Préstamos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={deleteOptions.entregas} onChange={(e) => setDeleteOptions({...deleteOptions, entregas: e.target.checked})} className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer" />
                    <span className="text-sm text-red-900">Historial de Entregas (Insumos)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={deleteOptions.auditoria} onChange={(e) => setDeleteOptions({...deleteOptions, auditoria: e.target.checked})} className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer" />
                    <span className="text-sm text-red-900">Historial de Auditoría</span>
                  </label>
                </div>
              </div>

              <form onSubmit={handleClearDatabase} className="space-y-4 text-left">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Para confirmar, ingresa tu contraseña de administrador:
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 bg-white"
                    placeholder="Contraseña"
                    required
                  />
                  {clearError && <p className="text-red-600 text-xs mt-1.5 font-semibold leading-tight">{clearError}</p>}
                </div>

                <div className="flex gap-3 pt-4 border-t mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsClearModalOpen(false);
                      setAdminPassword('');
                      setClearError('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isClearing || !adminPassword || !isAnyOptionSelected}
                    className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isClearing ? 'Verificando...' : 'Borrar Selección'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
