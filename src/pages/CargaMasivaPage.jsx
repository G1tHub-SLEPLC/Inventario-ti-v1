import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useInventario } from '../context/InventarioContext';
import { UploadCloud, CheckCircle, AlertCircle, FileWarning, AlertTriangle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const COLUMNS = [
  'Descripción del Bien', 'Marca', 'Modelo', 'Nº de serie',
  'ID Publicación',
  'Orden de Compra', 'Factura', 'Proveedor', 'SubDirección', 'Usuario'
];

const HEADER_ALIASES = {
  'Descripción del Bien': ['descripción del bien','descripcion del bien','descripcion bien','descripción bien'],
  'Marca': ['marca'],
  'Modelo': ['modelo'],
  'Nº de serie': ['nº de serie','n° de serie','no de serie','numero de serie','número de serie','serie'],
  'ID Publicación': ['id publicación','id publicacion','codigo compra agil / licitación / codigo convenio marco','codigo compra agil / licitacion / codigo convenio marco','código compra ágil','codigo compra','licitacion','licitación','convenio marco','codigo'],
  'Orden de Compra': ['orden de compra','oc','orden compra'],
  'Factura': ['factura','n° factura','nº factura'],
  'Proveedor': ['proveedor','empresa','vendedor','distribuidor'],
  'SubDirección': ['subcdirección','subcdireccion','subdirección','subdireccion','area','área'],
  'Usuario': ['usuario','funcionario','asignado a']
};

function norm(s) {
  return (s == null ? '' : String(s)).trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeRow(rawRow) {
  const out = {};
  const lowerMap = {};
  Object.keys(rawRow).forEach(k => lowerMap[norm(k)] = rawRow[k]);
  COLUMNS.forEach(canonical => {
    const aliases = HEADER_ALIASES[canonical] || [norm(canonical)];
    let found = '';
    for(const a of aliases){
      if(lowerMap[a] !== undefined && lowerMap[a] !== null && String(lowerMap[a]).trim() !== ''){
        found = lowerMap[a]; break;
      }
    }
    if(found === '' && lowerMap[norm(canonical)] !== undefined) found = lowerMap[norm(canonical)];
    out[canonical] = found == null ? '' : String(found).trim();
  });
  return out;
}

export default function CargaMasivaPage() {
  const { session } = useAuth();
  const { equipos, addMasivo, clearInventario } = useInventario();
  const [status, setStatus] = useState({ type: 'idle', message: '' }); // idle, processing, success, error
  
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

  const [localToast, setLocalToast] = useState(null);
  const fileInputRef = useRef(null);
  const toastTimerRef = useRef(null);

  // Drag states
  const [toastPos, setToastPos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isDragging.current) return;
      setToastPos({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    };

    const handleGlobalMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.userSelect = '';
      }
    };

    if (localToast) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [localToast]);

  const startToastTimer = (title, duration) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setLocalToast(prev => (prev && prev.title === title ? null : prev));
    }, duration);
  };

  const showLocalToast = (title, message, type = 'success', details = null) => {
    const duration = type === 'warning' ? 15000 : 8000;
    setLocalToast({ title, message, type, ...details });
    setToastPos({ x: 0, y: 0 });
    startToastTimer(title, duration);
  };

  const handleToastMouseEnter = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };

  const handleToastMouseLeave = () => {
    if (localToast) {
      startToastTimer(localToast.title, 4000); // 4 segundos extra al quitar el mouse
    }
  };

  const handleDragStart = (e) => {
    // Evitar arrastrar si el click fue en el botón de cerrar
    if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('button')) return;
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - toastPos.x,
      y: e.clientY - toastPos.y
    };
    document.body.style.userSelect = 'none';
  };

  const processData = (rows) => {
    if(!rows || rows.length === 0){
      setStatus({ type: 'error', message: 'El archivo está vacío' });
      showLocalToast('Error', 'El archivo cargado está vacío.', 'error');
      return;
    }
    
    const normalized = rows.map(r => normalizeRow(r)).filter(r => {
        return COLUMNS.some(col => r[col] && r[col].toString().trim() !== '');
    });
    
    if(normalized.length === 0){
      setStatus({ type: 'error', message: 'No se encontraron filas válidas.' });
      showLocalToast('Error', 'No se encontraron filas válidas en el archivo.', 'error');
      return;
    }

    const isFirstUpload = equipos.length === 0;

    // Verify and classify rows
    const noSerial = [];
    const validWithSerial = [];
    const importableItems = [];
    
    normalized.forEach((row, index) => {
      const serial = row['Nº de serie'] ? String(row['Nº de serie']).trim() : '';
      if (!serial) {
        noSerial.push({ rowNumber: index + 2, desc: row['Descripción del Bien'] || 'Sin descripción' });
        if (isFirstUpload) {
          importableItems.push(row);
        }
      } else {
        validWithSerial.push(row);
      }
    });
    
    // Check for duplicates both against the DB and within this Excel sheet itself
    const duplicates = [];
    const newItems = [];
    const seenSerials = new Set(
      equipos
        .map(e => e['Nº de serie'] ? String(e['Nº de serie']).trim().toLowerCase() : '')
        .filter(s => s !== '')
    );
    
    validWithSerial.forEach(row => {
      const serial = String(row['Nº de serie']).trim().toLowerCase();
      
      if (seenSerials.has(serial)) {
        duplicates.push(row);
      } else {
        seenSerials.add(serial);
        newItems.push(row);
        importableItems.push(row);
      }
    });

    if (importableItems.length > 0) {
      addMasivo(importableItems);
    }
    
    if (isFirstUpload) {
      if (duplicates.length > 0 || noSerial.length > 0) {
        setStatus({ 
          type: 'success', 
          message: `Cargados: ${importableItems.length}. Omitidos: ${duplicates.length} duplicados. ¡Atención! ${noSerial.length} sin serie.` 
        });
        showLocalToast(
          'Carga Inicial con Advertencia', 
          '', 
          'warning',
          {
            duplicateSerials: duplicates.map(d => String(d['Nº de serie'] || '—').trim()),
            addedCount: importableItems.length,
            noSerialCount: noSerial.length,
            isFirstUpload: true
          }
        );
      } else {
        setStatus({ 
          type: 'success', 
          message: `✓ ${importableItems.length} registros cargados exitosamente.` 
        });
        showLocalToast(
          'Carga Exitosa', 
          `Se han cargado correctamente los ${importableItems.length} equipos en el sistema.`, 
          'success'
        );
      }
    } else {
      if (newItems.length > 0) {
        if (noSerial.length > 0 || duplicates.length > 0) {
          setStatus({ 
            type: 'success', 
            message: `Cargados: ${newItems.length} nuevos. Omitidos: ${noSerial.length} sin serie, ${duplicates.length} duplicados.` 
          });
          showLocalToast(
            'Carga Parcial Completada', 
            noSerial.length > 0 
              ? 'ATENCIÓN: Solo se permite subir equipos con N° de serie. Los equipos sin serie fueron omitidos.'
              : '', 
            'warning',
            {
              duplicateSerials: duplicates.map(d => String(d['Nº de serie'] || '—').trim()),
              addedCount: newItems.length,
              noSerialCount: noSerial.length,
              isFirstUpload: false
            }
          );
        } else {
          setStatus({ 
            type: 'success', 
            message: `✓ ${newItems.length} registros cargados exitosamente.` 
          });
          showLocalToast(
            'Carga Exitosa', 
            `Se han cargado correctamente los ${newItems.length} equipos en el sistema.`, 
            'success'
          );
        }
      } else {
        // No new items added
        if (noSerial.length > 0 || duplicates.length > 0) {
          setStatus({ 
            type: 'error', 
            message: `No se agregaron registros. Omitidos: ${noSerial.length} sin serie, ${duplicates.length} duplicados.` 
          });
          showLocalToast(
            'Carga Omitida', 
            noSerial.length > 0 
              ? 'ATENCIÓN: Solo se permite subir equipos con N° de serie. Todos los registros fueron omitidos por duplicidad o falta de serie.'
              : 'Todos los equipos del archivo ya estaban registrados (duplicados).', 
            'error',
            {
              duplicateSerials: duplicates.map(d => String(d['Nº de serie'] || '—').trim()),
              addedCount: 0,
              noSerialCount: noSerial.length,
              isFirstUpload: false
            }
          );
        } else {
          setStatus({ 
            type: 'error', 
            message: 'No se encontraron equipos para agregar.' 
          });
          showLocalToast(
            'Carga Omitida', 
            'El archivo no contenía equipos válidos.', 
            'error'
          );
        }
      }
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    
    setStatus({ type: 'processing', message: 'Procesando archivo...' });
    setLocalToast(null);

    const ext = file.name.split('.').pop().toLowerCase();
    
    if(ext === 'csv') {
      Papa.parse(file, {
        header: true, skipEmptyLines: true, dynamicTyping: false,
        complete: res => { setTimeout(() => processData(res.data), 50); },
        error: err => setStatus({ type: 'error', message: err.message })
      });
    } else if(ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = ev => {
        setTimeout(() => {
          try {
            const wb = XLSX.read(ev.target.result, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
            processData(json);
          } catch(err) {
            setStatus({ type: 'error', message: 'Error al leer el archivo Excel' });
          }
        }, 50);
      };
      reader.onerror = () => setStatus({ type: 'error', message: 'Error de lectura de archivo' });
      reader.readAsArrayBuffer(file);
    } else {
      setStatus({ type: 'error', message: 'Formato no soportado. Use .csv, .xls o .xlsx' });
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
        showLocalToast('Acceso Denegado', `No se pudo verificar tu identidad: ${authError.message}. Verifica que estés ingresando la contraseña correcta de tu cuenta.`, 'error');
        setIsClearing(false);
        return;
      }
      
      // Correct password, proceed to clear
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
      
      const successMsg = `Se eliminó correctamente: ${deletedItems.join(', ')}.`;
      setStatus({ type: 'success', message: successMsg });
      showLocalToast('Borrado Exitoso', successMsg, 'success');
    } catch (err) {
      console.error('Error al borrar:', err);
      setClearError(err.message || 'Ocurrió un error al intentar borrar los datos (verifica permisos o conexión).');
      showLocalToast('Error', err.message, 'error');
    }
    setIsClearing(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Carga Masiva de Equipos</h1>
        <p className="text-sm text-gray-500 mt-1">Sube un archivo Excel o CSV para importar o actualizar equipos de forma masiva.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <UploadCloud className="w-8 h-8 text-[#006BB9]" />
        </div>
        
        <div className="relative inline-block w-full">
          {/* TOAST FLOTANTE SOBRE "SELECCIONE O ARRASTRE" */}
          {localToast && (
            <div 
              onMouseDown={handleDragStart}
              style={{ 
                position: 'absolute',
                left: '50%',
                bottom: `calc(100% + 12px - ${toastPos.y}px)`,
                transform: `translateX(calc(-50% + ${toastPos.x}px))`,
                cursor: isDragging.current ? 'grabbing' : 'grab',
                zIndex: 9999
              }}
            >
              <div 
                onMouseEnter={handleToastMouseEnter}
                onMouseLeave={handleToastMouseLeave}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl border w-[340px] text-sm text-left animate-slide-in ${
                localToast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                localToast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                'bg-red-50 border-red-200 text-red-800'
              }`}>
                {localToast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                {localToast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                {localToast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                
                <div className="flex-1">
                  <p className="font-bold text-[11px] uppercase tracking-wider">{localToast.title}</p>
                  
                  {localToast.addedCount !== undefined || (localToast.duplicateSerials && localToast.duplicateSerials.length > 0) ? (
                    <div className="text-[11px] opacity-90 mt-1.5 space-y-1.5">
                      {localToast.addedCount !== undefined && (
                        <p>
                          {localToast.addedCount > 0 
                            ? `Se agregaron ${localToast.addedCount} equipos en total.` 
                            : 'No se agregaron nuevos equipos.'}
                        </p>
                      )}
                      {localToast.noSerialCount > 0 && (
                        <div>
                          <p className={localToast.isFirstUpload ? "text-amber-900 font-bold" : ""}>
                            • {localToast.noSerialCount} equipos {localToast.isFirstUpload ? "ingresados SIN N° de Serie." : "omitidos por falta de N° de Serie."}
                          </p>
                          {localToast.isFirstUpload && (
                            <p className="mt-1 text-[9px] leading-tight text-amber-800 bg-amber-100 p-1.5 rounded border border-amber-200">
                              ⚠️ <strong>¡CRUCIAL!</strong> Es necesario que edites estos equipos a la brevedad y les asignes un número de serie o identificador único por seguridad.
                            </p>
                          )}
                        </div>
                      )}
                      {localToast.duplicateSerials && localToast.duplicateSerials.length > 0 && (
                        <div className="group relative cursor-help inline-block mt-1">
                          <span className="border-b border-dashed border-amber-500 font-semibold text-amber-900">
                            • {localToast.duplicateSerials.length} equipos omitidos por duplicidad (Ver detalle)
                          </span>
                          
                          <div className="invisible group-hover:visible absolute bottom-full left-0 pb-2 z-50">
                            <div className="bg-slate-800 text-white p-2.5 rounded-lg shadow-xl w-60 max-h-48 overflow-y-auto leading-relaxed font-mono whitespace-normal normal-case border border-slate-700">
                              <strong className="text-slate-300 block border-b border-slate-700 pb-1 mb-1">Series duplicadas omitidas:</strong>
                              <div className="flex flex-wrap gap-1">
                                {localToast.duplicateSerials.map((s, idx) => (
                                  <span key={idx} className="bg-slate-700 px-1 py-0.5 rounded text-[9px]">{s}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] opacity-90 mt-1 whitespace-pre-line">{localToast.message}</p>
                  )}
                </div>
                
                <button onClick={() => setLocalToast(null)} className="text-gray-400 hover:text-gray-600 font-bold ml-1 shrink-0 text-lg leading-none focus:outline-none">
                  &times;
                </button>
              </div>
            </div>
          )}

          <h2 className="text-lg font-semibold text-gray-800 mb-2">Seleccione o arrastre un archivo</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">Soportamos archivos .xlsx, .xls and .csv</p>
        
        <div className="relative inline-flex flex-col items-center">
          <label className="cursor-pointer bg-[#006BB9] hover:bg-[#25306B] text-white font-medium py-2.5 px-5 rounded-lg shadow transition-colors inline-block z-10 relative">
            Examinar archivo...
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} ref={fileInputRef} />
          </label>

          {/* MENSAJE DE ESTADO FLOTANTE DEBAJO DEL BOTON */}
          {status.type !== 'idle' && (
            <div className={`absolute top-[100%] mt-2 rounded py-1 px-2.5 flex items-center justify-center gap-1.5 border text-[10px] min-w-[200px] w-max max-w-xs text-center shadow-sm z-10 ${
              status.type === 'processing' ? 'bg-blue-50 border-blue-200 text-blue-700' :
              status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
              'bg-red-50 border-red-200 text-red-700'
            }`}>
              {status.type === 'processing' && <AlertCircle className="w-3 h-3 animate-pulse shrink-0" />}
              {status.type === 'success' && <CheckCircle className="w-3 h-3 shrink-0" />}
              {status.type === 'error' && <FileWarning className="w-3 h-3 shrink-0" />}
              <span className="font-semibold leading-tight">{status.message}</span>
            </div>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-3">Si tienes registros duplicados o deseas empezar de cero, puedes borrar la base de datos local:</p>
          <button 
            onClick={() => setIsClearModalOpen(true)}
            className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 font-medium py-1.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
          >
            <Trash2 className="w-4 h-4" /> Limpiar Base de Datos
          </button>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-5 border border-blue-100 text-sm text-blue-800 space-y-2">
        <h3 className="font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Instrucciones para la carga
        </h3>
        <p>El archivo debe contener las siguientes columnas (el sistema intentará detectarlas aunque varíen ligeramente):</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-blue-700">
          {COLUMNS.map(c => <li key={c}>{c}</li>)}
        </ul>
        <p className="mt-3 text-xs opacity-80">
          * Todos los equipos deben tener obligatoriamente un <strong>Nº de serie</strong> o identificador único registrado en el Excel. Si se detecta un equipo con un número de serie que ya existe en el sistema, se considerará duplicado y se omitirá su carga para evitar alterar los datos existentes.
        </p>
      </div>

      {isClearModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
            <div className="bg-red-600 p-6 flex flex-col items-center justify-center text-white">
              <AlertTriangle className="w-12 h-12 mb-2" strokeWidth={1.5} />
              <h2 className="text-xl font-bold text-center">¡Peligro! Borrado Permanente</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 text-center mb-4">
                Estás a punto de eliminar información de forma irreversible. Esta acción no se puede deshacer.
              </p>

              <div className="bg-red-50 p-4 rounded-lg mb-4 text-left border border-red-100">
                <p className="text-sm font-semibold text-red-800 mb-2">Selecciona qué información borrar:</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={deleteOptions.equipos} onChange={(e) => setDeleteOptions({...deleteOptions, equipos: e.target.checked})} className="rounded text-red-600 focus:ring-red-500 w-4 h-4" />
                    <span className="text-sm text-red-900">Equipos ({equipos.length} registros)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={deleteOptions.insumos} onChange={(e) => setDeleteOptions({...deleteOptions, insumos: e.target.checked})} className="rounded text-red-600 focus:ring-red-500 w-4 h-4" />
                    <span className="text-sm text-red-900">Insumos y Stock</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={deleteOptions.solicitudes} onChange={(e) => setDeleteOptions({...deleteOptions, solicitudes: e.target.checked})} className="rounded text-red-600 focus:ring-red-500 w-4 h-4" />
                    <span className="text-sm text-red-900">Solicitudes y Préstamos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={deleteOptions.entregas} onChange={(e) => setDeleteOptions({...deleteOptions, entregas: e.target.checked})} className="rounded text-red-600 focus:ring-red-500 w-4 h-4" />
                    <span className="text-sm text-red-900">Historial de Entregas (Insumos)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={deleteOptions.auditoria} onChange={(e) => setDeleteOptions({...deleteOptions, auditoria: e.target.checked})} className="rounded text-red-600 focus:ring-red-500 w-4 h-4" />
                    <span className="text-sm text-red-900">Historial de Auditoría</span>
                  </label>
                </div>
              </div>

              <form onSubmit={handleClearDatabase} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Para confirmar, ingresa tu contraseña de administrador:
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
                    placeholder="Contraseña"
                    required
                  />
                  {clearError && <p className="text-red-600 text-xs mt-1 font-medium">{clearError}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsClearModalOpen(false);
                      setAdminPassword('');
                      setClearError('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isClearing || !adminPassword || !isAnyOptionSelected}
                    className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
