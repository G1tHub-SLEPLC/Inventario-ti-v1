import { useState, useMemo, useEffect, useRef } from 'react';
import { useInventario } from '../context/InventarioContext';
import { useAlert } from '../context/AlertContext';
import { Save, AlertCircle, UserCheck, Laptop, Trash2, Search, X } from 'lucide-react';
import { saveDocument } from '../utils/db';
import { supabase } from '../lib/supabaseClient';
import { uploadEquipoImage } from '../utils/storageUtils';
import AutocompleteInput from '../components/AutocompleteInput';
import { isSameUser } from '../utils/userUtils';

const COLUMNS = [
  'Descripción del Bien', 'Marca', 'Modelo', 'Nº de serie',
  'ID Publicación',
  'Orden de Compra', 'Factura', 'Proveedor'
];

export default function NuevoEquipoModal({ isOpen, onClose }) {
  const { equipos, addEquipo, addMasivo, showToast, updateEquiposMasivo } = useInventario();
  const { showAlertConfirm } = useAlert();
  const [formData, setFormData] = useState({ estado: 'DISPONIBLE', usuario_asignado_id: '' });
  const [selectDescVal, setSelectDescVal] = useState('');
  const [selectMarcaVal, setSelectMarcaVal] = useState('');

  const uniqueDescripciones = useMemo(() => {
    const list = equipos.map(eq => eq['Descripción del Bien']).filter(v => v && v.trim() !== '');
    return [...new Set(list)].sort((a, b) => String(a).localeCompare(String(b)));
  }, [equipos]);

  const uniqueMarcas = useMemo(() => {
    const list = equipos.map(eq => eq['Marca']).filter(v => v && v.trim() !== '');
    return [...new Set(list)].sort((a, b) => String(a).localeCompare(String(b)));
  }, [equipos]);
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [facturaFile, setFacturaFile] = useState(null);
  const [ocFile, setOcFile] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const [fileTooltip, setFileTooltip] = useState({ visible: false, x: 0, y: 0, type: '' });
  const [usuarios, setUsuarios] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [subdireccionSearchTerm, setSubdireccionSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const [imagenUrlManual, setImagenUrlManual] = useState('');

  const handleSearchImage = () => {
    const marca = formData['Marca'] || '';
    const modelo = formData['Modelo'] || '';
    if (!marca && !modelo) {
      alert("Por favor ingresa la Marca y el Modelo primero para buscar la imagen.");
      return;
    }
    const query = encodeURIComponent(`${marca} ${modelo} png transparent`).replace(/%20/g, '+');
    window.open(`https://www.google.com/search?q=${query}&tbm=isch`, '_blank');
  };

  useEffect(() => {
    async function loadUsers() {
      const { data, error } = await supabase.from('perfiles').select('id, nombre, email').order('nombre', { ascending: true });
      if (!error && data) setUsuarios(data);
    }
    loadUsers();
  }, []);

  const subdireccionesOptions = useMemo(() => {
    const subs = new Set(equipos.map(eq => eq['SubDirección'] ? String(eq['SubDirección']).trim() : '').filter(s => s !== '' && s !== '—'));
    return Array.from(subs).sort((a, b) => String(a).localeCompare(String(b)));
  }, [equipos]);

  const ocHasFile = useMemo(() => {
    const oc = formData['Orden de Compra'] ? String(formData['Orden de Compra']).trim().toLowerCase() : '';
    if (!oc || oc === '—') return false;
    return equipos.some(eq => eq.hasOcFile && eq['Orden de Compra'] && String(eq['Orden de Compra']).trim().toLowerCase() === oc);
  }, [formData['Orden de Compra'], equipos]);

  const facturaHasFile = useMemo(() => {
    const fac = formData['Factura'] ? String(formData['Factura']).trim().toLowerCase() : '';
    if (!fac || fac === '—') return false;
    return equipos.some(eq => eq.hasFacturaFile && eq['Factura'] && String(eq['Factura']).trim().toLowerCase() === fac);
  }, [formData['Factura'], equipos]);

  const autoImagenUrl = useMemo(() => {
    const desc = formData['Descripción del Bien']?.trim()?.toLowerCase();
    const marca = formData['Marca']?.trim()?.toLowerCase();
    const modelo = formData['Modelo']?.trim()?.toLowerCase();
    
    if (!desc || !marca || !modelo) return null;
    
    const existingEq = equipos.find(eq => 
      eq['Descripción del Bien']?.trim()?.toLowerCase() === desc &&
      eq['Marca']?.trim()?.toLowerCase() === marca &&
      eq['Modelo']?.trim()?.toLowerCase() === modelo &&
      eq.imagen_url
    );
    
    return existingEq ? existingEq.imagen_url : null;
  }, [formData['Descripción del Bien'], formData['Marca'], formData['Modelo'], equipos]);

  const filteredAvailableUsuarios = useMemo(() => {
    const q = userSearchTerm.toLowerCase().trim();
    if (!q) return usuarios;
    return usuarios.filter(u => 
      (u.nombre || '').toLowerCase().includes(q) || 
      (u.email || '').toLowerCase().includes(q)
    );
  }, [usuarios, userSearchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'estado' && value === 'EN PRESTAMO') {
      const hasUser = formData.usuario_asignado_id || (formData['Usuario'] && !['disponible', 'bodega', '—', '-', 'sin asignar'].includes(formData['Usuario'].toLowerCase().trim()));
      if (!hasUser) {
        showToast(
          'Usuario Requerido', 
          'Debe asignar un usuario al equipo para poder registrarlo en estado EN PRÉSTAMO.', 
          'error'
        );
      }
    }

    if (name === 'estado' && (value === 'DISPONIBLE' || value === 'BAJA')) {
      setFormData({
        ...formData,
        [name]: value,
        'Usuario': '',
        'SubDirección': '',
        usuario_asignado_id: ''
      });
      setUserSearchTerm('');
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (type, file) => {
    if (!file) {
      if (type === 'factura') setFacturaFile(null);
      else setOcFile(null);
      return;
    }

    const fieldName = type === 'factura' ? 'Factura' : 'Orden de Compra';
    const existingCodes = equipos
      .map(e => e[fieldName] ? String(e[fieldName]).trim() : '')
      .filter(code => code !== '' && code !== '—');

    const fileNameLower = file.name.toLowerCase();
    const matchedCode = existingCodes.find(code => fileNameLower.includes(code.toLowerCase()));

    if (matchedCode && (!formData[fieldName] || formData[fieldName].trim() === '')) {
      setFormData(prev => ({ ...prev, [fieldName]: matchedCode }));
      
      if (type === 'factura') setFacturaFile(null);
      else setOcFile(null);
      
      showToast(
        'Archivo Enlazado', 
        `Se detectó el número "${matchedCode}" en el nombre del archivo. Como ya está en el sistema, se ha enlazado automáticamente sin necesidad de resubirlo.`, 
        'success'
      );
    } else {
      if (type === 'factura') setFacturaFile(file);
      else setOcFile(file);

      // Extracción automática del nombre del archivo si el campo está vacío
      if (!formData[fieldName] || formData[fieldName].trim() === '' || formData[fieldName].trim() === '—') {
        const cleanName = fileNameLower.replace(/\.[^/.]+$/, "");
        const prefix = type === 'factura' ? /(?:factura|fact|f)[\s_.-]*([a-z0-9-]+)/i : /(?:oc|orden|compra)[\s_.-]*([a-z0-9-]+)/i;
        const match = cleanName.match(prefix);
        
        let extractedCode = null;
        if (match && match[1]) {
           extractedCode = match[1].toUpperCase();
        } else {
           const numMatch = cleanName.match(/\d{4,}/);
           if (numMatch) extractedCode = numMatch[0];
        }
        
        if (extractedCode && !['PDF', 'JPG', 'PNG', 'DOC', 'DOCK'].includes(extractedCode)) {
           setFormData(prev => ({ ...prev, [fieldName]: extractedCode }));
        }
      }
    }
  };

  const handleMouseMoveTooltip = (e, type) => {
    const tooltipWidth = 288;
    const tooltipHeight = 110;
    
    let x = e.clientX + 15;
    let y = e.clientY + 15;

    if (x + tooltipWidth > window.innerWidth) {
      x = e.clientX - tooltipWidth - 15;
      if (x < 10) x = 10;
    }
    
    if (y + tooltipHeight > window.innerHeight) {
      y = e.clientY - tooltipHeight - 15;
      if (y < 10) y = 10;
    }

    setFileTooltip({ visible: true, x, y, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDACIÓN: Imagen Referencial
    if (!imagenFile && !autoImagenUrl && !imagenUrlManual) {
      showToast(
        'Imagen Requerida', 
        'Como este es un modelo de equipo nuevo, debe adjuntar una imagen referencial (PNG/JPG) o proporcionar una URL.', 
        'error'
      );
      return;
    }

    // VALIDACIÓN: Si el estado es "EN PRESTAMO", verificar si hay usuario asignado
    if (formData.estado === 'EN PRESTAMO') {
      const hasUser = formData.usuario_asignado_id || (formData['Usuario'] && !['disponible', 'bodega', '—', '-', 'sin asignar'].includes(formData['Usuario'].toLowerCase().trim()));
      if (!hasUser) {
        showToast(
          'Usuario Requerido', 
          'Debe asignar un usuario al equipo para poder registrarlo en estado EN PRÉSTAMO.', 
          'error'
        );
        return;
      }
    }

    // VALIDACIÓN: Si el estado es "BAJA", verificar que exista un motivo
    if (formData.estado === 'BAJA') {
      if (!formData.motivo_baja || formData.motivo_baja.trim() === '') {
        showToast(
          'Motivo Requerido', 
          'Debe ingresar un motivo para dar de baja el equipo (ej. pérdida, daño).', 
          'error'
        );
        return;
      }
    }

    // Determinar imagen final
    let finalImgUrl = null;
    if (imagenUrlManual) {
      finalImgUrl = imagenUrlManual;
    } else if (imagenFile) {
      const uploadRes = await uploadEquipoImage(imagenFile);
      if (uploadRes) {
        finalImgUrl = uploadRes;
      } else {
        showToast('Advertencia', 'No se pudo subir la imagen del equipo. Revise si el bucket existe en Supabase.', 'warning');
      }
    } else {
      finalImgUrl = autoImagenUrl;
    }

    if (isMultiMode) {
       const rawSerials = formData['Nº de serie'] || '';
       const parsedSerials = rawSerials.split(/[\n,]/).map(s => s.trim()).filter(s => s !== '');
       const uniqueSerials = [...new Set(parsedSerials)];

       if (uniqueSerials.length === 0) {
          showToast('Campo Obligatorio', 'Debes ingresar al menos un número de serie válido.', 'error');
          return;
       }

       const existingSerials = new Set(equipos.map(eq => eq['Nº de serie'] ? String(eq['Nº de serie']).trim().toLowerCase() : ''));
       const colliding = uniqueSerials.filter(s => existingSerials.has(s.toLowerCase()));

       if (colliding.length > 0) {
          showToast('Equipos Duplicados', `Los siguientes números de serie ya existen en el sistema: ${colliding.join(', ')}`, 'error');
          return;
       }

       let factSaved = false;
       let ocSaved = false;
       const firstId = uniqueSerials[0];
       
       if (facturaFile && !facturaHasFile) {
         try {
           const code = formData['Factura'];
           const storageKey = (code && code.trim() !== '—' && code.trim() !== '') ? `factura_${code.trim().toLowerCase()}` : firstId;
           await saveDocument(storageKey, 'factura', facturaFile);
           factSaved = true;
         } catch (err) {}
       }

       if (ocFile && !ocHasFile) {
         try {
           const code = formData['Orden de Compra'];
           const storageKey = (code && code.trim() !== '—' && code.trim() !== '') ? `oc_${code.trim().toLowerCase()}` : firstId;
           await saveDocument(storageKey, 'oc', ocFile);
           ocSaved = true;
         } catch (err) {}
       }

       const nuevosEquipos = uniqueSerials.map(serial => ({
          ...formData,
          'Nº de serie': serial,
          id: serial,
          hasFacturaFile: factSaved || facturaHasFile,
          hasOcFile: ocSaved || ocHasFile,
          ...(finalImgUrl ? { imagen_url: finalImgUrl } : {})
       }));

       const cascadeEquipos = [];
       if (finalImgUrl) {
         const marca = formData['Marca']?.trim()?.toLowerCase();
         const modelo = formData['Modelo']?.trim()?.toLowerCase();
         if (marca && modelo) {
           const identicalEquipos = equipos.filter(e => 
             e['Marca']?.trim()?.toLowerCase() === marca &&
             e['Modelo']?.trim()?.toLowerCase() === modelo
           );
           identicalEquipos.forEach(e => {
             cascadeEquipos.push({ ...e, imagen_url: finalImgUrl });
           });
         }
       }

       let success = false;
       let errorMessage = '';

       if (cascadeEquipos.length > 0) {
         const res = await updateEquiposMasivo([...nuevosEquipos, ...cascadeEquipos]);
         if (res && res.success === false) {
           success = false;
           errorMessage = res.error;
         } else {
           success = true;
         }
       } else {
         const res = await addMasivo(nuevosEquipos);
         if (res && res.success === false) {
           success = false;
           errorMessage = res.error;
         } else {
           success = true;
         }
       }
       
       if (success) {
         showToast('Registro Múltiple Exitoso', `Se guardaron correctamente ${uniqueSerials.length} equipos nuevos en bloque.`, 'success');
         onClose();
       } else {
         showToast('Error al guardar', `Hubo un error al registrar los equipos en bloque. Detalle: ${errorMessage}`, 'error');
       }
       return;
    }

    const serial = formData['Nº de serie'] ? String(formData['Nº de serie']).trim() : '';

    if (!serial) {
      showToast(
        'Campo Obligatorio', 
        'El Número de serie es obligatorio para registrar un nuevo equipo.', 
        'error'
      );
      return;
    }

    const isDuplicate = equipos.some(
      (eq) => eq['Nº de serie'] && String(eq['Nº de serie']).trim().toLowerCase() === serial.toLowerCase()
    );
    if (isDuplicate) {
      showToast(
        'Equipo Duplicado', 
        `El número de serie "${serial}" ya se encuentra registrado en el sistema.`, 
        'error'
      );
      return;
    }

    const itemId = serial || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEquipo = { ...formData, id: itemId };

    if (facturaFile && !facturaHasFile) {
      try {
        const code = formData['Factura'];
        const storageKey = (code && code.trim() !== '—' && code.trim() !== '') 
          ? `factura_${code.trim().toLowerCase()}` 
          : itemId;
        await saveDocument(storageKey, 'factura', facturaFile);
        newEquipo.hasFacturaFile = true;
      } catch (err) {
        console.error('Error saving invoice:', err);
      }
    }
    if (ocFile && !ocHasFile) {
      try {
        const code = formData['Orden de Compra'];
        const storageKey = (code && code.trim() !== '—' && code.trim() !== '') 
          ? `oc_${code.trim().toLowerCase()}` 
          : itemId;
        await saveDocument(storageKey, 'oc', ocFile);
        newEquipo.hasOcFile = true;
      } catch (err) {
        console.error('Error saving PO:', err);
      }
    }

    if (finalImgUrl) {
      newEquipo.imagen_url = finalImgUrl;
    }

    const cascadeEquipos = [];
    if (finalImgUrl) {
      const marca = newEquipo['Marca']?.trim()?.toLowerCase();
      const modelo = newEquipo['Modelo']?.trim()?.toLowerCase();
      if (marca && modelo) {
        const identicalEquipos = equipos.filter(e => 
          e.id !== newEquipo.id &&
          e['Marca']?.trim()?.toLowerCase() === marca &&
          e['Modelo']?.trim()?.toLowerCase() === modelo
        );
        identicalEquipos.forEach(e => {
          cascadeEquipos.push({ ...e, imagen_url: finalImgUrl });
        });
      }
    }

    let success = false;
    let errorMessage = '';

    if (cascadeEquipos.length > 0) {
      const res = await updateEquiposMasivo([newEquipo, ...cascadeEquipos]);
      // Assuming updateEquiposMasivo (addMasivo) returns { success, error }
      if (res && res.success === false) {
        success = false;
        errorMessage = res.error;
      } else {
        success = true;
      }
    } else {
      const res = await addEquipo(newEquipo);
      if (res && res.success === false) {
        success = false;
        errorMessage = res.error;
      } else {
        success = true;
      }
    }

    if (success) {
      showToast(
        'Registro Exitoso', 
        `El equipo "${newEquipo['Descripción del Bien'] || 'Nuevo equipo'}" se ha guardado correctamente.`, 
        'success'
      );
      onClose();
    } else {
      showToast(
        'Error al guardar',
        `No se pudo registrar el equipo. Detalle: ${errorMessage || 'Error desconocido'}`,
        'error'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-slate-50 p-5 rounded-xl shadow-2xl w-full max-w-4xl animate-fade-in relative max-h-[95vh] flex flex-col overflow-hidden">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors cursor-pointer z-10"
          title="Cerrar ventana"
        >
          <X size={18} />
        </button>
        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nuevo Equipo</h1>
          <p className="text-sm text-gray-500 mt-1">Registra un nuevo activo en el inventario manualmente.</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors shadow-sm">
          <input 
            type="checkbox" 
            checked={isMultiMode}
            onChange={(e) => {
               setIsMultiMode(e.target.checked);
               setFormData(prev => ({ ...prev, 'Nº de serie': '' }));
            }}
            className="rounded border-gray-300 text-[#006BB9] focus:ring-[#006BB9]"
          />
          <span className="text-xs font-bold text-[#006BB9]">Ingreso Múltiple (Lote)</span>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Columna 1: Identificación */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-xs font-extrabold text-[#25306B] border-b border-gray-150 pb-2 uppercase tracking-wider">
              Datos de Identificación
            </h2>
            
            {/* Descripción del Bien */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#25306B] uppercase tracking-wide">
                Descripción del Bien <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                value={selectDescVal}
                onChange={e => {
                  setSelectDescVal(e.target.value);
                  if (e.target.value !== 'Otro') {
                    setFormData({ ...formData, 'Descripción del Bien': e.target.value });
                  } else {
                    setFormData({ ...formData, 'Descripción del Bien': '' });
                  }
                }}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white font-medium"
              >
                <option value="">-- Seleccionar --</option>
                {uniqueDescripciones.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="Otro">Otro...</option>
              </select>
              {selectDescVal === 'Otro' && (
                <input
                  type="text"
                  name="Descripción del Bien"
                  value={formData['Descripción del Bien'] || ''}
                  onChange={handleChange}
                  className="w-full mt-2 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white font-medium animate-fade-in"
                  placeholder="Descripción"
                  required
                />
              )}
            </div>

            {/* Marca & Modelo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#25306B] uppercase tracking-wide">
                  Marca
                </label>
                <select
                  value={selectMarcaVal}
                  onChange={e => {
                    setSelectMarcaVal(e.target.value);
                    if (e.target.value !== 'Otro') {
                      setFormData({ ...formData, 'Marca': e.target.value });
                    } else {
                      setFormData({ ...formData, 'Marca': '' });
                    }
                  }}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white font-medium"
                >
                  <option value="">-- Seleccionar --</option>
                  {uniqueMarcas.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value="Otro">Otro...</option>
                </select>
                {selectMarcaVal === 'Otro' && (
                  <input
                    type="text"
                    name="Marca"
                    value={formData['Marca'] || ''}
                    onChange={handleChange}
                    className="w-full mt-2 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white font-medium animate-fade-in"
                    placeholder="Marca"
                  />
                )}
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#25306B] uppercase tracking-wide">
                  Modelo
                </label>
                <input
                  type="text"
                  name="Modelo"
                  value={formData['Modelo'] || ''}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white font-medium"
                  placeholder="Modelo"
                />
              </div>
            </div>

            {/* Nº de serie */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#25306B] uppercase tracking-wide">
                Nº de serie <span className="text-red-500 font-bold">*</span>
              </label>
              {isMultiMode ? (
                <div className="space-y-2">
                   <textarea
                     name="Nº de serie"
                     value={formData['Nº de serie'] || ''}
                     onChange={handleChange}
                     rows={3}
                     className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white font-mono"
                     placeholder="Pegue aquí los números de serie (uno por línea o separados por coma)"
                     required
                   />
                   <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold px-1">
                      <span>Modo Lote Activado</span>
                      <span className="text-[#006BB9] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        Equipos a crear: {formData['Nº de serie'] ? [...new Set(formData['Nº de serie'].split(/[\n,]/).map(s => s.trim()).filter(s => s !== ''))].length : 0}
                      </span>
                   </div>
                </div>
              ) : (
                <input
                  type="text"
                  name="Nº de serie"
                  value={formData['Nº de serie'] || ''}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white font-medium"
                  placeholder="S/N"
                  required
                />
              )}
            </div>

            {/* ID Publicación */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#25306B] uppercase tracking-wide">
                ID Publicación
              </label>
              <div className="flex gap-2">
                <select
                  name="Tipo Publicación"
                  value={formData['Tipo Publicación'] || ''}
                  onChange={handleChange}
                  className="w-[42%] px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white font-medium"
                >
                  <option value="">— Tipo —</option>
                  <option value="Compra Ágil">Compra Ágil</option>
                  <option value="Convenio Marco">Conv. Marco</option>
                  <option value="Licitación">Licitación</option>
                </select>
                <input
                  type="text"
                  name="ID Publicación"
                  value={formData['ID Publicación'] || ''}
                  onChange={handleChange}
                  className="w-[58%] px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white font-medium"
                  placeholder="ID Compra"
                />
              </div>
            </div>

            {/* Proveedor */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#25306B] uppercase tracking-wide">
                Proveedor
              </label>
              <input
                type="text"
                name="Proveedor"
                value={formData['Proveedor'] || ''}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white font-medium"
                placeholder="Proveedor"
              />
            </div>

            {/* Imagen del Equipo */}
            <div className="mt-4 pt-4 border-t border-gray-150">
              <label className="block text-[11px] font-bold text-[#25306B] uppercase tracking-wide mb-2">
                Imagen del Equipo
              </label>
              <div className="flex items-start gap-3 mt-1">
                <div className="w-14 h-14 rounded-md bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center shadow-sm relative">
                  {imagenFile ? (
                    <img src={URL.createObjectURL(imagenFile)} alt="Preview" className="w-full h-full object-contain p-1" />
                  ) : imagenUrlManual ? (
                    <img src={imagenUrlManual} alt="Preview" className="w-full h-full object-contain p-1" />
                  ) : autoImagenUrl ? (
                    <>
                      <img src={autoImagenUrl} alt="Auto" className="w-full h-full object-contain opacity-80 p-1" />
                      <div className="absolute bottom-0 w-full bg-emerald-500/90 text-white text-[7.5px] text-center font-bold uppercase py-0.5">Auto</div>
                    </>
                  ) : (
                    <span className="text-[9px] text-gray-400 font-bold uppercase text-center leading-tight">Sin<br/>Img</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={handleSearchImage}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1 bg-[#25306B] hover:bg-[#112A46] text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm"
                      title="Buscar imagen transparente en Google"
                    >
                      <Search size={12} /> Buscar
                    </button>
                    <div className="flex-1 relative overflow-hidden">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => {
                          setImagenFile(e.target.files[0] || null);
                          if(e.target.files[0]) setImagenUrlManual('');
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Subir archivo"
                      />
                      <div className="w-full flex items-center justify-center gap-1.5 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm pointer-events-none">
                         Subir Archivo
                      </div>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={imagenUrlManual}
                    onChange={(e) => {
                      setImagenUrlManual(e.target.value);
                      setImagenFile(null);
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-[10px] focus:ring-1.5 focus:ring-blue-500 focus:outline-none shadow-xs bg-gray-50 placeholder-gray-400"
                    placeholder="O pega la URL de la imagen aquí..."
                  />
                  
                  {autoImagenUrl && !imagenFile && !imagenUrlManual ? (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1.5 leading-tight flex items-center gap-1">
                      <span className="shrink-0">✓</span> Imagen vinculada automáticamente.
                    </p>
                  ) : (
                    <p className="text-[10px] text-red-500 font-bold mt-1.5 leading-tight">
                      * Obligatorio adjuntar imagen referencial.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna 2: Documentación y Asignación */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-sm flex flex-col justify-between relative">
          <div className="space-y-4">
            <h2 className="text-xs font-extrabold text-[#25306B] border-b border-gray-150 pb-2 uppercase tracking-wider">
              Documentación y Asignación
            </h2>

            {/* Factura */}
            <div className="space-y-1">
              <div className="flex gap-3 items-center">
                <div className="flex-1 space-y-1">
                  <label className="block text-[11px] font-bold text-[#25306B] uppercase tracking-wide">
                    Factura
                  </label>
                  <input
                    type="text"
                    name="Factura"
                    value={formData['Factura'] || ''}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white font-medium"
                    placeholder="N° Factura"
                  />
                </div>
                <div className="w-[145px] shrink-0 self-end">
                  <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-500">Doc. Factura:</span>
                    </div>
                    {facturaHasFile ? (
                       <div className="text-[9px] text-emerald-700 leading-tight font-bold flex items-center gap-1 bg-emerald-50 p-1 rounded">
                         ✓ Enlazado auto.
                       </div>
                    ) : facturaFile ? (
                      <div className="flex items-center justify-between p-1 bg-blue-50 border border-blue-200 rounded text-[9px] text-blue-800">
                        <span className="truncate max-w-[90px]" title={facturaFile.name}>{facturaFile.name}</span>
                        <button 
                          type="button" 
                          onClick={() => setFacturaFile(null)}
                          className="text-red-500 hover:text-red-700 font-bold px-1 text-xs"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <div 
                        onMouseMove={(e) => handleMouseMoveTooltip(e, 'factura')}
                        onMouseLeave={() => setFileTooltip({ visible: false, x: 0, y: 0, type: '' })}
                      >
                        <input
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={e => handleFileChange('factura', e.target.files[0] || null)}
                          className="w-full text-[9px] text-slate-500 file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-blue-50 file:text-[#006BB9] hover:file:bg-blue-100"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Orden de Compra */}
            <div className="space-y-1">
              <div className="flex gap-3 items-center">
                <div className="flex-1 space-y-1">
                  <label className="block text-[11px] font-bold text-[#25306B] uppercase tracking-wide">
                    Orden de Compra
                  </label>
                  <input
                    type="text"
                    name="Orden de Compra"
                    value={formData['Orden de Compra'] || ''}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white font-medium"
                    placeholder="Código OC"
                  />
                </div>
                <div className="w-[145px] shrink-0 self-end">
                  <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-500">Doc. OC:</span>
                    </div>
                    {ocHasFile ? (
                       <div className="text-[9px] text-emerald-700 leading-tight font-bold flex items-center gap-1 bg-emerald-50 p-1 rounded">
                         ✓ Enlazado auto.
                       </div>
                    ) : ocFile ? (
                      <div className="flex items-center justify-between p-1 bg-blue-50 border border-blue-200 rounded text-[9px] text-blue-800">
                        <span className="truncate max-w-[90px]" title={ocFile.name}>{ocFile.name}</span>
                        <button 
                          type="button" 
                          onClick={() => setOcFile(null)}
                          className="text-red-500 hover:text-red-700 font-bold px-1 text-xs"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <div 
                        onMouseMove={(e) => handleMouseMoveTooltip(e, 'orden de compra')}
                        onMouseLeave={() => setFileTooltip({ visible: false, x: 0, y: 0, type: '' })}
                      >
                        <input
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={e => handleFileChange('oc', e.target.files[0] || null)}
                          className="w-full text-[9px] text-slate-500 file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-blue-50 file:text-[#006BB9] hover:file:bg-blue-100"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Usuario Asignado */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#25306B] uppercase tracking-wide">
                Usuario Asignado (SLEP)
              </label>
              {formData.usuario_asignado_id ? (
                <div className="flex items-center justify-between p-1.5 bg-blue-50 border border-blue-200 rounded-lg shadow-sm w-full">
                  <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0 pr-2">
                    <div className="w-6 h-6 shrink-0 rounded-full bg-[#006BB9] text-white flex items-center justify-center text-[10px] font-bold">
                      {usuarios.length > 0
                        ? (usuarios.find(u => u.id === formData.usuario_asignado_id)?.nombre || usuarios.find(u => u.id === formData.usuario_asignado_id)?.email || '?').charAt(0).toUpperCase()
                        : '?'}
                    </div>
                    <span className="text-xs font-bold text-[#25306B] truncate flex-1 min-w-0">
                      {usuarios.length > 0
                        ? (usuarios.find(u => u.id === formData.usuario_asignado_id)?.nombre || usuarios.find(u => u.id === formData.usuario_asignado_id)?.email || 'Usuario SLEP')
                        : formData['Usuario']}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, 'Usuario': '', 'SubDirección': '', usuario_asignado_id: '', estado: 'DISPONIBLE' });
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-1.5 py-0.5 rounded font-bold text-sm transition-colors"
                    title="Eliminar usuario"
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <AutocompleteInput
                  name="usuario_asignado_id"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  options={filteredAvailableUsuarios.map(u => ({ label: u.nombre || 'Sin nombre', value: u.id, sublabel: u.email }))}
                  onSelectOption={(opt) => {
                    let selectedUser = usuarios.find(u => u.id === opt.value);
                    if (!selectedUser) {
                      selectedUser = usuarios.find(u => u.nombre?.toLowerCase() === opt.label?.toLowerCase() || u.email?.toLowerCase() === opt.label?.toLowerCase());
                    }
                    if (selectedUser) {
                      setFormData({
                        ...formData,
                        usuario_asignado_id: selectedUser.id,
                        'Usuario': selectedUser.nombre || selectedUser.email || opt.label,
                        'SubDirección': selectedUser?.subdireccion || '',
                        estado: 'ASIGNADO'
                      });
                      setUserSearchTerm('');
                    }
                  }}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm"
                  placeholder="Buscar usuario..."
                />
              )}
            </div>

            {/* Fecha de Asignación */}
            {(formData.estado === 'ASIGNADO' || formData.estado === 'EN PRESTAMO' || formData.usuario_asignado_id) && (
              <div className="space-y-1 animate-fade-in">
                <label className="block text-[11px] font-bold text-[#25306B] uppercase tracking-wide">
                  Fecha de Asignación
                </label>
                <input
                  type="date"
                  name="fecha_asignacion"
                  value={formData.fecha_asignacion || ''}
                  onChange={handleChange}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white font-medium cursor-pointer"
                />
              </div>
            )}

            {/* Observación de Asignación */}
            {(formData.estado === 'ASIGNADO' || formData.estado === 'EN PRESTAMO' || formData.usuario_asignado_id) && (
              <div className="space-y-1 animate-fade-in mt-3">
                <label className="block text-[11px] font-bold text-[#25306B] uppercase tracking-wide">
                  Observación Asignación
                </label>
                <textarea
                  name="observacion_asignacion"
                  value={formData.observacion_asignacion || ''}
                  onChange={handleChange}
                  placeholder="Ej: Entrega sin cargador, pantalla con rayón, etc."
                  className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white font-medium min-h-[60px] resize-y"
                />
              </div>
            )}

            {/* Estado */}
            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-1 relative">
                <label className="block text-[11px] font-bold text-[#25306B] uppercase tracking-wide">
                  Estado
                </label>
                <div className="flex items-center gap-1 relative">
                  <select
                    name="estado"
                    value={formData.estado || 'DISPONIBLE'}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white font-medium"
                  >
                    <option value="ASIGNADO">ASIGNADO</option>
                    <option value="BAJA">DE BAJA</option>
                    <option value="DISPONIBLE">DISPONIBLE</option>
                    <option value="EN PRESTAMO">EN PRÉSTAMO</option>
                    <option value="PARA PRESTAMO">PARA PRÉSTAMO</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Motivo de Baja Condicional */}
            {formData.estado === 'BAJA' && (
              <div className="grid grid-cols-1 gap-2 mt-3 bg-red-50 p-3 rounded-xl border border-red-200 animate-fade-in">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-red-800 uppercase tracking-wide">
                    Motivo de Baja <span className="text-red-500 font-bold">*</span>
                  </label>
                  <textarea
                    name="motivo_baja"
                    required
                    value={formData.motivo_baja || ''}
                    onChange={handleChange}
                    placeholder="Describa por qué se da de baja este equipo (ej: Robo con constancia, Pantalla rota, Obsoleto...)"
                    rows="3"
                    className="w-full px-2.5 py-2 border border-red-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:outline-none shadow-sm bg-white text-gray-800 placeholder:text-red-300"
                  ></textarea>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="lg:col-span-2 pt-5 border-t border-gray-200 flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-bold rounded-lg text-sm transition-colors cursor-pointer border border-gray-200 shadow-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-[#006BB9] hover:bg-[#25306B] text-white font-bold rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            Guardar Equipo
          </button>
        </div>
      </form>

      {fileTooltip.visible && (
        <div 
          className="fixed z-50 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg shadow-xl pointer-events-none w-72 leading-tight"
          style={{ top: fileTooltip.y, left: fileTooltip.x }}
        >
          <strong className="block mb-1 font-bold text-amber-900">Sugerencia de Archivo</strong>
          Asegúrate de que el nombre del archivo contenga la numeración de la <span className="font-bold uppercase">{fileTooltip.type}</span>.
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
