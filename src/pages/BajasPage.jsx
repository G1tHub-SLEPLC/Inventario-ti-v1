import { useState, useMemo } from 'react';
import { useInventario } from '../context/InventarioContext';
import { useSolicitudes } from '../context/SolicitudesContext';
import { Trash2, Monitor, Database, Download, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import { exportToExcelAndPDF } from '../utils/exportUtils';
import { useSort } from '../hooks/useSort';
import { SortableHeader } from '../components/SortableHeader';

export default function BajasPage() {
  const { equipos } = useInventario();
  const { solicitudes, insumos } = useSolicitudes();
  const [activeTab, setActiveTab] = useState('equipos'); // 'equipos' | 'insumos'

  const equiposBaja = useMemo(() => {
    return equipos.filter(eq => {
      const e = (eq.estado || '').trim().toUpperCase();
      return e === 'BAJA' || e === 'DE BAJA';
    });
  }, [equipos]);

  const insumosBaja = useMemo(() => {
    return solicitudes.filter(sol => sol.estado === 'baja').map(sol => {
      const insumoData = insumos.find(i => i.id === sol.insumo_id);
      return {
        ...sol,
        insumo: insumoData || { nombre: sol.insumo?.nombre || 'Insumo desconocido' }
      };
    });
  }, [solicitudes, insumos]);

  const { sorted: sortedEquipos, sortKey: eqSortKey, sortDir: eqSortDir, handleSort: handleEqSort } = useSort(equiposBaja, 'Nº de serie', 'asc');
  const { sorted: sortedInsumos, sortKey: insSortKey, sortDir: insSortDir, handleSort: handleInsSort } = useSort(insumosBaja, 'created_at', 'desc');

  const handleExportExcel = () => {
    let dataToExport = [];
    let sheetName = '';

    if (activeTab === 'equipos') {
      sheetName = 'Equipos de Baja';
      dataToExport = sortedEquipos.map(eq => ({
        'ID Equipo': eq.id,
        'Descripción': eq['Descripción del Bien'],
        'Marca': eq['Marca'],
        'Modelo': eq['Modelo'],
        'Nº de Serie': eq['Nº de serie'],
        'Motivo de Baja': eq.motivo_baja || 'No especificado'
      }));
    } else {
      sheetName = 'Insumos de Baja';
      dataToExport = sortedInsumos.map(sol => ({
        'Fecha de Baja': new Date(sol.created_at).toLocaleString(),
        'Insumo': sol.insumo?.nombre || 'Desconocido',
        'Cantidad': sol.cantidad,
        'Usuario Asignado': sol.usuario_nombre || sol.perfil?.nombre || 'Desconocido',
        'Motivo de Baja': sol.motivo_baja || 'No especificado'
      }));
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${sheetName}.xlsx`);
  };

  const handleExportPDF = () => {
    const title = activeTab === 'equipos' ? 'Reporte de Equipos de Baja' : 'Reporte de Insumos de Baja';
    const filename = activeTab === 'equipos' ? 'Equipos_de_Baja.pdf' : 'Insumos_de_Baja.pdf';
    
    let columns = [];
    let rows = [];

    if (activeTab === 'equipos') {
      columns = [
        { header: 'Descripción', dataKey: 'desc' },
        { header: 'Marca', dataKey: 'marca' },
        { header: 'Modelo', dataKey: 'modelo' },
        { header: 'Serie', dataKey: 'serie' },
        { header: 'Motivo de Baja', dataKey: 'motivo' }
      ];
      rows = sortedEquipos.map(eq => ({
        desc: eq['Descripción del Bien'],
        marca: eq['Marca'],
        modelo: eq['Modelo'],
        serie: eq['Nº de serie'],
        motivo: eq.motivo_baja || 'No especificado'
      }));
    } else {
      columns = [
        { header: 'Fecha', dataKey: 'fecha' },
        { header: 'Insumo', dataKey: 'insumo' },
        { header: 'Cant.', dataKey: 'cant' },
        { header: 'Usuario', dataKey: 'usuario' },
        { header: 'Motivo de Baja', dataKey: 'motivo' }
      ];
      rows = sortedInsumos.map(sol => ({
        fecha: new Date(sol.created_at).toLocaleDateString(),
        insumo: sol.insumo?.nombre || 'Desconocido',
        cant: sol.cantidad,
        usuario: sol.usuario_nombre || sol.perfil?.nombre || 'Desconocido',
        motivo: sol.motivo_baja || 'No especificado'
      }));
    }

    exportToExcelAndPDF([], columns, rows, title, filename);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#112A46] tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
              <Trash2 size={24} className="stroke-[2.5px]" />
            </div>
            Registro de Bajas
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2 font-medium max-w-2xl leading-relaxed">
            Historial centralizado de todos los equipos y activos tecnológicos que han sido dados de baja, reportados como pérdida o dañados.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportExcel}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold hover:bg-emerald-100 transition-colors border border-emerald-200"
          >
            <Download size={18} /> Excel
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-xl font-bold hover:bg-rose-100 transition-colors border border-rose-200"
          >
            <Printer size={18} /> PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl w-full md:w-max mx-auto shadow-inner border border-gray-200/50">
        <button
          onClick={() => setActiveTab('equipos')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${activeTab === 'equipos' ? 'bg-white text-[#006BB9] shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
        >
          <Monitor size={16} /> Equipos ({equiposBaja.length})
        </button>
        <button
          onClick={() => setActiveTab('insumos')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${activeTab === 'insumos' ? 'bg-white text-[#006BB9] shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
        >
          <Database size={16} /> Insumos ({insumosBaja.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {activeTab === 'equipos' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <SortableHeader label="Descripción" sortKey="Descripción del Bien" currentKey={eqSortKey} currentDir={eqSortDir} onSort={handleEqSort} className="px-6 py-4" />
                  <SortableHeader label="Marca" sortKey="Marca" currentKey={eqSortKey} currentDir={eqSortDir} onSort={handleEqSort} className="px-6 py-4" />
                  <SortableHeader label="Modelo" sortKey="Modelo" currentKey={eqSortKey} currentDir={eqSortDir} onSort={handleEqSort} className="px-6 py-4" />
                  <SortableHeader label="Nº Serie" sortKey="Nº de serie" currentKey={eqSortKey} currentDir={eqSortDir} onSort={handleEqSort} className="px-6 py-4" />
                  <SortableHeader label="Motivo de Baja" sortKey="motivo_baja" currentKey={eqSortKey} currentDir={eqSortDir} onSort={handleEqSort} className="px-6 py-4 text-red-700" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedEquipos.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-10 text-gray-500">No hay equipos registrados como baja.</td></tr>
                ) : (
                  sortedEquipos.map(eq => (
                    <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-800">{eq['Descripción del Bien'] || '—'}</td>
                      <td className="px-6 py-3 text-slate-600">{eq['Marca'] || '—'}</td>
                      <td className="px-6 py-3 text-slate-600">{eq['Modelo'] || '—'}</td>
                      <td className="px-6 py-3 font-mono text-xs text-slate-500">{eq['Nº de serie'] || '—'}</td>
                      <td className="px-6 py-3 text-red-600 font-medium whitespace-normal min-w-[250px]">{eq.motivo_baja || <span className="text-gray-400 italic">No especificado</span>}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <SortableHeader label="Fecha" sortKey="created_at" currentKey={insSortKey} currentDir={insSortDir} onSort={handleInsSort} className="px-6 py-4" />
                  <SortableHeader label="Insumo" sortKey="insumo" currentKey={insSortKey} currentDir={insSortDir} onSort={handleInsSort} className="px-6 py-4" />
                  <SortableHeader label="Cant." sortKey="cantidad" currentKey={insSortKey} currentDir={insSortDir} onSort={handleInsSort} className="px-6 py-4 text-center" />
                  <SortableHeader label="Último Asignado" sortKey="usuario_nombre" currentKey={insSortKey} currentDir={insSortDir} onSort={handleInsSort} className="px-6 py-4" />
                  <SortableHeader label="Motivo de Baja" sortKey="motivo_baja" currentKey={insSortKey} currentDir={insSortDir} onSort={handleInsSort} className="px-6 py-4 text-red-700" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedInsumos.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-10 text-gray-500">No hay insumos registrados como baja.</td></tr>
                ) : (
                  sortedInsumos.map(sol => (
                    <tr key={sol.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-slate-500 text-xs">
                        {new Date(sol.created_at).toLocaleDateString()} {new Date(sol.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-6 py-3 font-medium text-slate-800">{sol.insumo?.nombre || '—'}</td>
                      <td className="px-6 py-3 text-center font-bold text-[#006BB9] bg-blue-50/50">{sol.cantidad}</td>
                      <td className="px-6 py-3 text-slate-600">{sol.usuario_nombre || sol.perfil?.nombre || '—'}</td>
                      <td className="px-6 py-3 text-red-600 font-medium whitespace-normal min-w-[250px]">{sol.motivo_baja || <span className="text-gray-400 italic">No especificado</span>}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
