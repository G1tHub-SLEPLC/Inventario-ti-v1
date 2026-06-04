import { useState, useMemo, useRef } from 'react';
import { useInventario } from '../context/InventarioContext';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Download, Search, Package, UserCircle, MonitorSmartphone, Printer, Eye, Upload, Pencil, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { saveDocument, getDocument } from '../utils/db';

const COLUMNS = [
  'Descripción del Bien', 'Marca', 'Modelo', 'Nº de serie',
  'ID Publicación',
  'Orden de Compra', 'Factura', 'Proveedor', 'SubDirección', 'Usuario'
];

function norm(s) {
  return (s == null ? '' : String(s)).trim().toLowerCase().replace(/\s+/g, ' ');
}

function isAvailable(usuario) {
  const v = norm(usuario);
  return v === '' || v === 'disponible';
}

function safe(v) {
  return (v == null || String(v).trim() === '') ? '—' : String(v).trim();
}

function getBadgeClass(estado, isUserBadge = false) {
  const base = "font-sans px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase whitespace-nowrap border";
  if (isUserBadge) return `${base} bg-blue-50 text-blue-700 border-blue-200`;
  
  if (estado === 'DISPONIBLE') return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`;
  if (estado === 'PARA PRESTAMO' || estado === 'PARA PRÉSTAMO') return `${base} bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200`;
  if (estado === 'EN PRESTAMO' || estado === 'EN PRÉSTAMO') return `${base} bg-amber-50 text-amber-700 border-amber-200`;
  if (estado === 'BAJA' || estado === 'DE BAJA') return `${base} bg-rose-50 text-rose-700 border-rose-200`;
  return `${base} bg-blue-50 text-blue-700 border-blue-200`; // ASIGNADO
}

function getInitials(name) {
  if (!name || name === '—') return '??';
  const words = String(name).trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function DashboardPage() {
  const { equipos, loading, setFileStatus } = useInventario();
  const [activeTab, setActiveTab] = useState('disp'); // disp, func, equip
  const [globalSearch, setGlobalSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ col: null, dir: 1 });
  
  // Tab: func state
  const [selectedFunc, setSelectedFunc] = useState('');
  const [funcSearch, setFuncSearch] = useState('');
  const [showFuncSug, setShowFuncSug] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  // Tab: equip state
  const [selectedDesc, setSelectedDesc] = useState('');
  const [selectedMod, setSelectedMod] = useState('');

  const [uploadTarget, setUploadTarget] = useState(null);
  const fileInputRef = useRef(null);

  const handlePreview = async (id, type) => {
    try {
      const eq = equipos.find(e => e.id === id);
      const code = eq ? (type === 'factura' ? eq['Factura'] : eq['Orden de Compra']) : '';
      const storageKey = (code && code.trim() !== '—' && code.trim() !== '') 
        ? `${type}_${code.trim().toLowerCase()}` 
        : id;

      const doc = await getDocument(storageKey, type);
      if (!doc) {
        alert('No se encontró el documento asociado.');
        return;
      }
      const fileURL = URL.createObjectURL(doc.blob);
      window.open(fileURL, '_blank');
    } catch (err) {
      console.error('Error al abrir el documento:', err);
      alert('Error al abrir el documento.');
    }
  };

  const triggerUpload = (id, type) => {
    setUploadTarget({ id, type });
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDirectUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadTarget) return;

    try {
      const eq = equipos.find(item => item.id === uploadTarget.id);
      const code = eq ? (uploadTarget.type === 'factura' ? eq['Factura'] : eq['Orden de Compra']) : '';
      const storageKey = (code && code.trim() !== '—' && code.trim() !== '') 
        ? `${uploadTarget.type}_${code.trim().toLowerCase()}` 
        : uploadTarget.id;

      await saveDocument(storageKey, uploadTarget.type, file);
      setFileStatus(uploadTarget.id, uploadTarget.type, true);
    } catch (err) {
      console.error('Error uploading file directly:', err);
      alert('Error al guardar el archivo.');
    } finally {
      setUploadTarget(null);
      e.target.value = '';
    }
  };

  const uniqueUsers = useMemo(() => {
    const set = new Set();
    equipos.forEach(r => {
      if (!isAvailable(r['Usuario'])) set.add(r['Usuario'].trim());
    });
    return [...set].sort((a,b) => a.localeCompare(b,'es'));
  }, [equipos]);

  const funcSuggestions = useMemo(() => {
    if(!funcSearch) return uniqueUsers;
    const v = norm(funcSearch);
    return uniqueUsers.filter(u => norm(u).includes(v));
  }, [uniqueUsers, funcSearch]);

  const { descList, modList } = useMemo(() => {
    const dSet = new Set();
    const mSet = new Set();
    equipos.forEach(r => {
      if (r['Descripción del Bien']) dSet.add(r['Descripción del Bien'].trim());
      if (r['Modelo']) mSet.add(r['Modelo'].trim());
    });
    return {
      descList: [...dSet].sort((a,b)=>a.localeCompare(b,'es')),
      modList: [...mSet].sort((a,b)=>a.localeCompare(b,'es'))
    };
  }, [equipos]);

  // Derived visible data based on active tab
  let baseData = [];
  let kpisEquip = null;

  if (activeTab === 'disp') {
    baseData = equipos.filter(r => isAvailable(r['Usuario']));
  } else if (activeTab === 'func') {
    if (selectedFunc) {
      baseData = equipos.filter(r => norm(r['Usuario']) === norm(selectedFunc));
    }
  } else if (activeTab === 'equip') {
    let pool = equipos;
    if (selectedDesc && selectedDesc !== 'ALL' && selectedDesc !== '') {
      pool = pool.filter(r => (r['Descripción del Bien'] || '').trim() === selectedDesc.trim());
    }
    if (selectedMod && selectedMod !== 'ALL' && selectedMod !== '') {
      pool = pool.filter(r => (r['Modelo'] || '').trim() === selectedMod.trim());
    }
    
    if (selectedDesc !== '' || selectedMod !== '') {
      const dispCount = pool.filter(r => isAvailable(r['Usuario'])).length;
      kpisEquip = { total: pool.length, disp: dispCount, asig: pool.length - dispCount };
      baseData = pool;
    }
  }

  // Apply Global Search
  if (globalSearch) {
    const q = norm(globalSearch);
    baseData = baseData.filter(r => {
      const matchCols = COLUMNS.some(c => norm(r[c]).includes(q));
      const estadoFinal = r.estado || (isAvailable(r['Usuario']) ? 'DISPONIBLE' : 'ASIGNADO');
      const matchEstado = norm(estadoFinal).includes(q);
      return matchCols || matchEstado;
    });
  }

  // Apply Sort
  if (sortConfig.col) {
    baseData.sort((a, b) => {
      const va = norm(a[sortConfig.col]), vb = norm(b[sortConfig.col]);
      if(va < vb) return -1 * sortConfig.dir;
      if(va > vb) return 1 * sortConfig.dir;
      return 0;
    });
  }

  const handleSort = (col) => {
    if (sortConfig.col === col) {
      setSortConfig({ col, dir: sortConfig.dir * -1 });
    } else {
      setSortConfig({ col, dir: 1 });
    }
  };

  const exportData = async (format) => {
    if(baseData.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const activeCols = COLUMNS.filter(c => activeTab === 'disp' ? (c !== 'Usuario' && c !== 'SubDirección') : true);
    activeCols.push('Estado');

    const stamp = new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
    const baseName = `inventario_${activeTab}_${stamp}`;

    if (format === 'xlsx') {
      const { Workbook } = await import('exceljs');
      const { saveAs } = await import('file-saver');
      const wb = new Workbook();
      const ws = wb.addWorksheet('Inventario');
      
      ws.columns = activeCols.map(c => ({
        header: c.toUpperCase(),
        key: c,
        width: Math.max(c.length + 5, 20)
      }));

      const headerRow = ws.getRow(1);
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006BB9' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
      headerRow.height = 25;

      baseData.forEach((r, i) => {
        const rowData = {};
        activeCols.forEach(c => {
          const estadoFinal = r.estado || (isAvailable(r['Usuario']) ? 'DISPONIBLE' : 'ASIGNADO');
          rowData[c] = c === 'Estado' ? estadoFinal : safe(r[c]);
        });
        const row = ws.addRow(rowData);
        
        if (i % 2 !== 0) {
           row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }; });
        }

        row.eachCell((cell, colNumber) => {
          cell.font = { size: 11, color: { argb: 'FF374151' } };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          const colName = activeCols[colNumber - 1];
          if (colName === 'Estado') {
            const val = cell.value;
            let color = 'FF19214D'; // ASIGNADO
            if (val === 'DISPONIBLE') color = 'FF4A7A1B';
            else if (val === 'PARA PRESTAMO') color = 'FF6B21A8';
            else if (val === 'EN PRESTAMO') color = 'FFC2410C';
            else if (val === 'DE BAJA') color = 'FF991B1B';
            
            cell.font = { bold: true, size: 10, color: { argb: color } };
          }
          if (colName === 'Nº de serie') {
             cell.font = { ...cell.font, name: 'Courier New' };
          }
        });
        row.height = 20;
      });

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), baseName + '.xlsx');

    } else if (format === 'pdf') {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF('landscape', 'pt', 'a4');
      const tableRows = baseData.map(r => activeCols.map(c => {
         const estadoFinal = r.estado || (isAvailable(r['Usuario']) ? 'DISPONIBLE' : 'ASIGNADO');
         return c === 'Estado' ? estadoFinal : safe(r[c]);
      }));

      doc.setFontSize(16);
      doc.setTextColor(37, 48, 107);
      doc.text(`Reporte de Inventario - ${activeTab === 'disp' ? 'Equipos Disponibles' : activeTab === 'func' ? 'Por Funcionario' : 'Por Equipamiento'}`, 40, 40);

      autoTable(doc, {
        head: [activeCols.map(c => c.toUpperCase())],
        body: tableRows,
        startY: 60,
        styles: { fontSize: 8, font: 'helvetica', cellPadding: 6, textColor: [55, 65, 81] },
        headStyles: { fillColor: [0, 107, 185], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          [activeCols.indexOf('Estado')]: { fontStyle: 'bold' },
          [activeCols.indexOf('Nº de serie')]: { font: 'courier' }
        },
        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index === activeCols.indexOf('Estado')) {
             const val = data.cell.raw;
             if (val === 'DISPONIBLE') data.cell.styles.textColor = [100, 160, 40];
             else if (val === 'PARA PRESTAMO') data.cell.styles.textColor = [107, 33, 168];
             else if (val === 'EN PRESTAMO') data.cell.styles.textColor = [194, 65, 12];
             else if (val === 'DE BAJA') data.cell.styles.textColor = [153, 27, 27];
             else data.cell.styles.textColor = [37, 48, 107];
          }
        }
      });
      doc.save(baseName + '.pdf');

    } else {
      const exportRows = baseData.map(r => {
        const o = {};
        activeCols.forEach(c => {
          const estadoFinal = r.estado || (isAvailable(r['Usuario']) ? 'DISPONIBLE' : 'ASIGNADO');
          o[c] = c === 'Estado' ? estadoFinal : safe(r[c]);
        });
        return o;
      });
      const csv = Papa.unparse(exportRows);
      const blob = new Blob(['\ufeff' + csv], {type: 'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = baseName + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const total = equipos.length;
  const totalDisp = equipos.filter(r => isAvailable(r['Usuario'])).length;
  const totalAsig = total - totalDisp;

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="p-6 w-full max-w-[1920px] mx-auto space-y-6">
      
      {/* Global KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print-interactive">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4" style={{borderColor: 'var(--slep-primary)'}}>
          <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Total de Equipos</div>
          <div className="text-4xl font-bold mt-2 text-[#25306B]">{total}</div>
          <div className="text-xs text-gray-500 mt-1">Registros en el inventario</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4" style={{borderColor: 'var(--slep-secondary)'}}>
          <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Equipos Asignados</div>
          <div className="text-4xl font-bold mt-2 text-[#006BB9]">{totalAsig}</div>
          <div className="text-xs text-gray-500 mt-1">{total ? ((totalAsig/total)*100).toFixed(1) : 0}% del total</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4" style={{borderColor: 'var(--slep-green)'}}>
          <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Equipos Disponibles</div>
          <div className="text-4xl font-bold mt-2 text-[#90d039]">{totalDisp}</div>
          <div className="text-xs text-gray-500 mt-1">{total ? ((totalDisp/total)*100).toFixed(1) : 0}% del total</div>
        </div>
      </section>

      {/* Tabs & Controls */}
      <section className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center border-b border-gray-200">
          <nav className="flex flex-wrap w-full xl:w-auto">
            <button onClick={() => setActiveTab('disp')} className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'disp' ? 'border-[#25306B] bg-[#25306B] text-white' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>
              <Package size={16}/> Disponibles
            </button>
            <button onClick={() => setActiveTab('func')} className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'func' ? 'border-[#25306B] bg-[#25306B] text-white' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>
              <UserCircle size={16}/> Por Funcionario
            </button>
            <button onClick={() => setActiveTab('equip')} className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'equip' ? 'border-[#25306B] bg-[#25306B] text-white' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>
              <MonitorSmartphone size={16}/> Por Equipamiento
            </button>
          </nav>
          <div className="flex flex-wrap gap-2 p-3 xl:p-0 xl:pr-4 bg-gray-50 xl:bg-transparent no-print-interactive">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} placeholder="Filtrar en tabla activa..." className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none min-w-[200px]" />
            </div>
            <button onClick={() => exportData('xlsx')} className="px-3 py-1.5 text-green-800 rounded-lg text-sm font-medium shadow-sm transition-colors bg-green-200 hover:bg-green-300 flex items-center gap-2">
              <Download size={14} /> Excel
            </button>
            <button onClick={() => exportData('csv')} className="px-3 py-1.5 text-sky-800 rounded-lg text-sm font-medium shadow-sm transition-colors bg-sky-200 hover:bg-sky-300 flex items-center gap-2">
              <Download size={14} /> CSV
            </button>
            <button onClick={() => exportData('pdf')} className="px-3 py-1.5 text-rose-800 rounded-lg text-sm font-medium shadow-sm transition-colors bg-rose-200 hover:bg-rose-300 flex items-center gap-2">
              <Printer size={14} /> PDF
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Funcionario Tab Controls */}
          {activeTab === 'func' && (
            <div className="flex flex-col sm:flex-row gap-4 mb-4 items-stretch sm:items-center justify-between no-print-interactive">
              <div className="relative flex-1 sm:max-w-md">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={funcSearch}
                    onChange={e => {
                      setFuncSearch(e.target.value);
                      setShowFuncSug(true);
                      setFocusedIndex(-1);
                      if(!e.target.value) setSelectedFunc('');
                    }}
                    onKeyDown={e => {
                      if (!showFuncSug) return;
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setFocusedIndex(prev => (prev < funcSuggestions.length - 1 ? prev + 1 : prev));
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        if (focusedIndex >= 0 && focusedIndex < funcSuggestions.length) {
                          const u = funcSuggestions[focusedIndex];
                          setSelectedFunc(u);
                          setFuncSearch(u);
                          setShowFuncSug(false);
                          setFocusedIndex(-1);
                        }
                      } else if (e.key === 'Escape') {
                        setShowFuncSug(false);
                        setFocusedIndex(-1);
                      }
                    }}
                    onFocus={() => setShowFuncSug(true)}
                    onBlur={() => setTimeout(() => { setShowFuncSug(false); setFocusedIndex(-1); }, 200)}
                    placeholder="Buscar funcionario..." 
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm transition-all"
                  />
                </div>
                {showFuncSug && (
                  <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
                    <div className="py-1">
                      {funcSuggestions.length > 0 ? funcSuggestions.map((u, idx) => (
                        <div 
                          key={u} 
                          onMouseDown={() => { setSelectedFunc(u); setFuncSearch(u); setShowFuncSug(false); setFocusedIndex(-1); }} 
                          className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${focusedIndex === idx ? 'bg-blue-100' : 'hover:bg-slate-50'}`}
                        >
                          <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black uppercase shrink-0 shadow-sm">
                            {getInitials(u)}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">{u}</span>
                          </div>
                        </div>
                      )) : <div className="px-4 py-3 text-slate-500 italic text-center text-sm">Sin coincidencias...</div>}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-sm font-medium text-[#25306B] flex items-center gap-2">
                {selectedFunc ? <><CheckCircle size={16} className="text-green-600" /> Mostrando activos de {selectedFunc}</> : 'Seleccione un funcionario'}
              </div>
            </div>
          )}

          {/* Equipamiento Tab Controls */}
          {activeTab === 'equip' && (
            <div className="mb-4 no-print-interactive">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#EDF0F5] p-4 rounded-lg border border-gray-200 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-[#25306B] mb-1 uppercase tracking-wide">Por Descripción del Bien</label>
                  <select value={selectedDesc} onChange={e => setSelectedDesc(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white">
                    <option value="">— Seleccionar opción —</option>
                    <option value="ALL">— Mostrar Todo —</option>
                    {descList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#25306B] mb-1 uppercase tracking-wide">Por Modelo</label>
                  <select value={selectedMod} onChange={e => setSelectedMod(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white">
                    <option value="">— Seleccionar opción —</option>
                    <option value="ALL">— Mostrar Todos los Modelos —</option>
                    {modList.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              
              {kpisEquip && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-white rounded-lg p-3 border-l-4 shadow-sm" style={{borderColor:'var(--slep-primary)'}}>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Total del tipo</div>
                    <div className="text-2xl font-bold text-[#25306B]">{kpisEquip.total}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border-l-4 shadow-sm" style={{borderColor:'var(--slep-green)'}}>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Disponibles en bodega</div>
                    <div className="text-2xl font-bold text-[#90d039]">{kpisEquip.disp}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border-l-4 shadow-sm" style={{borderColor:'var(--slep-secondary)'}}>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Asignados</div>
                    <div className="text-2xl font-bold text-[#006BB9]">{kpisEquip.asig}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Table */}
          <div className="table-scroll rounded-lg border border-gray-200">
            {baseData.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                {activeTab === 'func' && !selectedFunc ? 'Seleccione un funcionario para ver sus equipos asignados.' : 
                 activeTab === 'equip' && (selectedDesc === '' && selectedMod === '') ? 'Seleccione una descripción o modelo para comenzar el análisis.' :
                 'No hay registros que mostrar.'}
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    {COLUMNS.filter(c => activeTab === 'disp' ? (c !== 'Usuario' && c !== 'SubDirección') : true).map(c => {
                      let headerClass = "sortable text-left align-top";
                      if (c === 'ID Publicación') headerClass += " max-w-[150px]";
                      if (c === 'Orden de Compra') headerClass += " max-w-[80px]";
                      
                      return (
                        <th key={c} onClick={() => handleSort(c)} className={headerClass}>
                          <div className="flex items-start gap-1 justify-between">
                            <span className="whitespace-normal leading-snug">{c}</span>
                            {sortConfig.col === c ? <span className="text-[11px] mt-0.5 shrink-0">{sortConfig.dir === 1 ? '▲' : '▼'}</span> : null}
                          </div>
                        </th>
                      );
                    })}
                    {activeTab === 'disp' && (
                      <th className="text-left w-24 align-top">
                        <div className="flex items-start gap-1">Estado</div>
                      </th>
                    )}
                    <th className="text-center w-24 no-print-interactive align-top">
                      <div className="flex justify-center items-start gap-1">Acciones</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {baseData.map((row, i) => {
                    const disp = isAvailable(row['Usuario']);
                    return (
                      <tr key={i} className="hover:bg-blue-50 even:bg-slate-50 transition-colors">
                        {COLUMNS.filter(c => activeTab === 'disp' ? (c !== 'Usuario' && c !== 'SubDirección') : true).map(c => {
                          const value = safe(row[c]);
                          const itemId = row.id || row['Nº de serie'] || `temp_${i}`;
                          
                          if (c === 'Factura') {
                            const hasFile = row.hasFacturaFile;
                            return (
                              <td key={c} className="px-3 py-2 text-[12px] text-gray-700 min-w-[100px]">
                                <div className="flex items-center gap-3 justify-between">
                                  {hasFile ? (
                                    <button 
                                      onClick={() => handlePreview(itemId, 'factura')}
                                      className="text-[#006BB9] hover:text-[#25306B] hover:underline text-left transition-colors"
                                      title="Abrir/Descargar Factura"
                                    >
                                      {value}
                                    </button>
                                  ) : (
                                    <span>{value}</span>
                                  )}
                                </div>
                              </td>
                            );
                          }
                          
                          if (c === 'Orden de Compra') {
                            const hasFile = row.hasOcFile;
                            return (
                              <td key={c} className="px-3 py-2 text-[12px] text-gray-700 min-w-[100px]">
                                <div className="flex items-center gap-3 justify-between">
                                  {hasFile ? (
                                    <button 
                                      onClick={() => handlePreview(itemId, 'oc')}
                                      className="text-[#006BB9] hover:text-[#25306B] hover:underline text-left transition-colors"
                                      title="Abrir/Descargar Orden de Compra"
                                    >
                                      {value}
                                    </button>
                                  ) : (
                                    <span>{value}</span>
                                  )}
                                </div>
                              </td>
                            );
                          }

                          if (c === 'ID Publicación') {
                            const tipo = row['Tipo Publicación'];
                            let badgeText = '';
                            if (tipo === 'Convenio Marco') badgeText = 'CM';
                            else if (tipo === 'Compra Ágil') badgeText = 'CA';
                            else if (tipo === 'Licitación') badgeText = 'LI';
                            else badgeText = tipo;

                            return (
                              <td key={c} className="px-3 py-2 text-[12px] text-gray-700 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span>{value}</span>
                                  {tipo && (
                                    <span 
                                      title={tipo}
                                      className="inline-flex items-center justify-center px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-[#006BB9] rounded text-[9px] uppercase font-bold cursor-help"
                                    >
                                      {badgeText}
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          }
                          
                          if (c === 'Usuario') {
                            const isDisp = isAvailable(value);
                            const estadoFinal = row.estado || (isDisp ? 'DISPONIBLE' : 'ASIGNADO');
                            
                            if (!isDisp) {
                               return (
                                 <td key={c} className="px-3 py-2 text-[12px] whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 p-0.5 pr-2.5 rounded-full text-[12px] font-bold border border-blue-200 shadow-sm">
                                       <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black uppercase shrink-0">
                                          {getInitials(value)}
                                       </span>
                                       <span title={value}>{value}</span>
                                    </span>
                                 </td>
                               );
                            } else {
                               return (
                                 <td key={c} className="px-3 py-2 text-[12px] whitespace-nowrap">
                                    <span className={getBadgeClass(estadoFinal)}>
                                       {estadoFinal}
                                    </span>
                                 </td>
                               );
                            }
                          }

                          return <td key={c} className="px-3 py-2 text-[12px] text-gray-700 max-w-[200px] break-words">{value}</td>;
                        })}
                        {activeTab === 'disp' && (
                          <td>
                            {(() => {
                              const disp = isAvailable(row['Usuario']);
                              let estadoFinal = row.estado || (disp ? 'DISPONIBLE' : 'ASIGNADO');
                              return <span className={getBadgeClass(estadoFinal)}>{estadoFinal}</span>;
                            })()}
                          </td>
                        )}
                        <td className="text-center no-print-interactive">
                          <Link 
                            to={`/editar-equipo?id=${equipos.indexOf(row)}`}
                            className="p-1 px-2 text-[#006BB9] hover:text-[#25306B] hover:bg-blue-50 rounded-lg inline-flex items-center gap-1 transition-colors text-xs font-semibold"
                            title="Editar Equipo"
                          >
                            <Pencil size={13} /> Editar
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleDirectUpload} 
        accept="application/pdf,image/*" 
        className="hidden" 
      />
    </div>
  );
}
