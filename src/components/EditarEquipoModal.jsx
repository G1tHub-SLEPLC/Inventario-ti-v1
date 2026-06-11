import { useState, useEffect, useMemo } from 'react';
import { useInventario } from '../context/InventarioContext';
import { Save, AlertCircle, Eye, Clock, UserCheck, X } from 'lucide-react';
import { saveDocument, getDocument } from '../utils/db';
import { supabase } from '../lib/supabaseClient';
import AutocompleteInput from './AutocompleteInput';
import { isSameUser } from '../utils/userUtils';

export default function EditarEquipoModal({ equipo, onClose }) {
  const { equipos, updateEquipo, updateEquiposMasivo, showToast } = useInventario();
  const originalEquipo = equipo;
  const equipIndex = equipos.findIndex(eq => eq.id === originalEquipo?.id);

  const [formData, setFormData] = useState({});
  const [facturaFile, setFacturaFile] = useState(null);
  const [ocFile, setOcFile] = useState(null);
  const [fileTooltip, setFileTooltip] = useState({ visible: false, x: 0, y: 0, type: '' });
  const [usuarios, setUsuarios] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [subdireccionSearchTerm, setSubdireccionSearchTerm] = useState('');

  useEffect(() => {
    async function loadUsers() {
      const { data, error } = await supabase.from('perfiles').select('id, nombre, email');
      if (!error && data) setUsuarios(data);
    }
    loadUsers();
  }, []);

  const subdireccionesOptions = useMemo(() => {
    const subs = new Set(equipos.map(eq => eq['SubDirección'] ? String(eq['SubDirección']).trim() : '').filter(s => s !== '' && s !== '—'));
    return Array.from(subs).sort();
  }, [equipos]);

  const ocHasFileGlobal = useMemo(() => {
    const oc = formData['Orden de Compra'] ? String(formData['Orden de Compra']).trim().toLowerCase() : '';
    if (!oc || oc === '—') return false;
    return equipos.some(eq => eq.id !== originalEquipo?.id && eq.hasOcFile && eq['Orden de Compra'] && String(eq['Orden de Compra']).trim().toLowerCase() === oc);
  }, [formData['Orden de Compra'], equipos, originalEquipo]);

  const facturaHasFileGlobal = useMemo(() => {
    const fac = formData['Factura'] ? String(formData['Factura']).trim().toLowerCase() : '';
    if (!fac || fac === '—') return false;
    return equipos.some(eq => eq.id !== originalEquipo?.id && eq.hasFacturaFile && eq['Factura'] && String(eq['Factura']).trim().toLowerCase() === fac);
  }, [formData['Factura'], equipos, originalEquipo]);

  const filteredAvailableUsuarios = useMemo(() => {
    const q = userSearchTerm.toLowerCase().trim();
    if (!q) return usuarios;
    return usuarios.filter(u => 
      (u.nombre || '').toLowerCase().includes(q) || 
      (u.email || '').toLowerCase().includes(q)
    );
  }, [usuarios, userSearchTerm]);

  useEffect(() => {
    if (originalEquipo) {
      const isAssigned = originalEquipo.usuario_asignado_id || 
        (originalEquipo['Usuario'] && 
         originalEquipo['Usuario'].trim().toLowerCase() !== 'disponible' && 
         originalEquipo['Usuario'].trim() !== '');
      const initialEstado = originalEquipo.estado || (isAssigned ? 'ASIGNADO' : 'DISPONIBLE');
      setFormData({ 
        ...originalEquipo,
        estado: initialEstado
      });
    }
  }, [originalEquipo]);

  const showEnPrestamoWarning = useMemo(() => {
    if (formData.estado !== 'EN PRESTAMO') return false;
    const hasUser = formData.usuario_asignado_id || (formData['Usuario'] && !['disponible', 'bodega', '—', '-', 'sin asignar'].includes(formData['Usuario'].toLowerCase().trim()));
    return !hasUser;
  }, [formData.estado, formData.usuario_asignado_id, formData['Usuario']]);

  if (!originalEquipo || Object.keys(formData).length === 0) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
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
    }
  };

  const handleMouseMoveTooltip = (e, type) => {
    const tooltipWidth = 260;
    const tooltipHeight = 70;
    
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

  const handlePreview = async (type) => {
    try {
      const code = type === 'factura' ? formData['Factura'] : formData['Orden de Compra'];
      const storageKey = (code && code.trim() !== '—' && code.trim() !== '') 
        ? `${type}_${code.trim().toLowerCase()}` 
        : originalEquipo.id;

      const doc = await getDocument(storageKey, type);
      if (!doc) {
        alert('No se encontró el archivo del documento.');
        return;
      }
      const fileURL = URL.createObjectURL(doc.blob);
      window.open(fileURL, '_blank');
    } catch (err) {
      console.error('Error al previsualizar:', err);
      alert('Error al abrir el documento.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedEquipo = { ...formData };

    // VALIDACIÓN: Si el estado es "EN PRESTAMO", verificar si hay usuario asignado
    if (updatedEquipo.estado === 'EN PRESTAMO') {
      const hasUser = updatedEquipo.usuario_asignado_id || (updatedEquipo['Usuario'] && !['disponible', 'bodega', '—', '-', 'sin asignar'].includes(updatedEquipo['Usuario'].toLowerCase().trim()));
      if (!hasUser) {
        showToast(
          'Usuario Requerido', 
          'Debe asignar un usuario al equipo para poder guardarlo en estado EN PRÉSTAMO.', 
          'error'
        );
        return;
      }
    }

    const currentSerial = updatedEquipo['Nº de serie']?.trim() || '';

    // Check if user is assigning a serial number that already exists on ANOTHER equipment
    if (currentSerial && currentSerial.toLowerCase() !== originalEquipo['Nº de serie']?.trim().toLowerCase()) {
      const isDuplicate = equipos.some(
        (eq) => eq.id !== originalEquipo.id && eq['Nº de serie'] && String(eq['Nº de serie']).trim().toLowerCase() === currentSerial.toLowerCase()
      );
      if (isDuplicate) {
        showToast(
          'Equipo Duplicado', 
          `El número de serie "${currentSerial}" ya está registrado en otro equipo del sistema.`, 
          'error'
        );
        return;
      }
    }

    // Detect user change
    const oldUser = (originalEquipo['Usuario'] || '').trim().toLowerCase();
    const newUser = (formData['Usuario'] || '').trim().toLowerCase();

    // Check if user changed (ignoring case & whitespace)
    if (oldUser !== newUser) {
      const displayOldUser = originalEquipo['Usuario']?.trim() || 'Disponible (Bodega)';
      const displayOldSub = originalEquipo['SubDirección']?.trim() || '—';
      
      const newHistoryEntry = {
        usuario: displayOldUser,
        subdireccion: displayOldSub,
        fechaCambio: new Date().toISOString()
      };

      updatedEquipo.historialUsuarios = [
        ...(originalEquipo.historialUsuarios || []),
        newHistoryEntry
      ];
    }

    // Save newly selected files to IndexedDB
    const itemId = originalEquipo.id;
    if (facturaFile) {
      try {
        const code = formData['Factura'];
        const storageKey = (code && code.trim() !== '—' && code.trim() !== '') 
          ? `factura_${code.trim().toLowerCase()}` 
          : itemId;
        await saveDocument(storageKey, 'factura', facturaFile);
        updatedEquipo.hasFacturaFile = true;
      } catch (err) {
        console.error('Error al guardar factura:', err);
      }
    }
    if (ocFile) {
      try {
        const code = formData['Orden de Compra'];
        const storageKey = (code && code.trim() !== '—' && code.trim() !== '') 
          ? `oc_${code.trim().toLowerCase()}` 
          : itemId;
        await saveDocument(storageKey, 'oc', ocFile);
        updatedEquipo.hasOcFile = true;
      } catch (err) {
        console.error('Error al guardar OC:', err);
      }
    }

    // Cascade ID Publicacion if changed
    const idPubChanged = (originalEquipo['ID Publicación'] || '') !== (updatedEquipo['ID Publicación'] || '') ||
                         (originalEquipo['Tipo Publicación'] || '') !== (updatedEquipo['Tipo Publicación'] || '');

    let cascadeUpdates = [];
    if (idPubChanged) {
       const norm = (s) => (s == null || String(s).trim() === '' || String(s).trim() === '—') ? '' : String(s).trim().toLowerCase();
       
       const upOC = norm(updatedEquipo['Orden de Compra']);
       const upFac = norm(updatedEquipo['Factura']);
       const upMarca = norm(updatedEquipo['Marca']);
       const upMod = norm(updatedEquipo['Modelo']);
       const upProv = norm(updatedEquipo['Proveedor']);

       cascadeUpdates = equipos.filter(eq => {
          if (eq.id === originalEquipo.id) return false;
          
          if (norm(eq['Orden de Compra']) !== upOC) return false;
          if (norm(eq['Factura']) !== upFac) return false;
          if (norm(eq['Marca']) !== upMarca) return false;
          if (norm(eq['Modelo']) !== upMod) return false;
          if (norm(eq['Proveedor']) !== upProv) return false;

          if ((eq['ID Publicación'] || '') === (updatedEquipo['ID Publicación'] || '') &&
              (eq['Tipo Publicación'] || '') === (updatedEquipo['Tipo Publicación'] || '')) {
             return false;
          }

          return true;
       }).map(eq => ({
          ...eq,
          'ID Publicación': updatedEquipo['ID Publicación'],
          'Tipo Publicación': updatedEquipo['Tipo Publicación']
       }));
    }

    if (cascadeUpdates.length > 0) {
       await updateEquiposMasivo([updatedEquipo, ...cascadeUpdates]);
       showToast(
         'Edición Múltiple Exitosa', 
         `El equipo y otros ${cascadeUpdates.length} equipos vinculados fueron actualizados con el nuevo ID de Publicación.`, 
         'success'
       );
    } else {
       updateEquipo(equipIndex, updatedEquipo);
       showToast(
         'Edición Exitosa', 
         `El equipo "${updatedEquipo['Descripción del Bien'] || 'Equipo'}" ha sido actualizado correctamente.`, 
         'success'
       );
    }

    onClose();
  };

  const formatFecha = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  const history = originalEquipo.historialUsuarios || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-slate-50 p-5 rounded-xl shadow-2xl w-full max-w-5xl animate-fade-in relative max-h-[95vh] flex flex-col overflow-hidden">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors cursor-pointer z-10"
          title="Cerrar ventana"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-3">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">Editar Equipo</h1>
          <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Modifique los atributos del equipo o gestione sus documentos cargados.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-y-auto pr-1 flex-1 custom-scrollbar overflow-x-hidden p-0.5">
          {/* Columna 1: Identificación */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-[11.5px] font-extrabold text-[#25306B] border-b border-gray-150 pb-1 uppercase tracking-wider">
                Datos de Identificación
              </h2>
              
              {/* Descripción del Bien */}
              <div className="space-y-0.5">
                <label className="block text-[10px] font-bold text-[#25306B] uppercase tracking-wide">
                  Descripción del Bien <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="Descripción del Bien"
                  value={formData['Descripción del Bien'] || ''}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-1.5 focus:ring-[#006BB9] focus:outline-none shadow-xs bg-white font-medium"
                  placeholder="Descripción"
                  required
                />
              </div>

              {/* Marca & Modelo */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-bold text-[#25306B] uppercase tracking-wide">
                    Marca
                  </label>
                  <input
                    type="text"
                    name="Marca"
                    value={formData['Marca'] || ''}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-1.5 focus:ring-[#006BB9] focus:outline-none shadow-xs bg-white font-medium"
                    placeholder="Marca"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-bold text-[#25306B] uppercase tracking-wide">
                    Modelo
                  </label>
                  <input
                    type="text"
                    name="Modelo"
                    value={formData['Modelo'] || ''}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-1.5 focus:ring-[#006BB9] focus:outline-none shadow-xs bg-white font-medium"
                    placeholder="Modelo"
                  />
                </div>
              </div>

              {/* Nº de serie */}
              <div className="space-y-0.5">
                <label className="block text-[10px] font-bold text-[#25306B] uppercase tracking-wide">
                  Nº de serie <span className="text-gray-400 font-normal text-[9px]">(Fijo)</span>
                </label>
                <input
                  type="text"
                  name="Nº de serie"
                  value={formData['Nº de serie'] || ''}
                  onChange={handleChange}
                  disabled
                  className="w-full px-2 py-1 border border-gray-200 rounded-lg text-xs bg-gray-100 text-gray-500 cursor-not-allowed font-medium border-gray-200"
                />
              </div>

              {/* ID Publicación */}
              <div className="space-y-0.5">
                <label className="block text-[10px] font-bold text-[#25306B] uppercase tracking-wide">
                  ID Publicación
                </label>
                <div className="flex gap-1.5">
                  <select
                    name="Tipo Publicación"
                    value={formData['Tipo Publicación'] || ''}
                    onChange={handleChange}
                    className="w-[42%] px-1 py-1 border border-gray-300 rounded-lg text-[11px] focus:ring-1.5 focus:ring-[#006BB9] focus:outline-none shadow-xs bg-white font-medium"
                  >
                    <option value="">— Tipo —</option>
                    <option value="Convenio Marco">Conv. Marco</option>
                    <option value="Compra Ágil">Compra Ágil</option>
                    <option value="Licitación">Licitación</option>
                  </select>
                  <input
                    type="text"
                    name="ID Publicación"
                    value={formData['ID Publicación'] || ''}
                    onChange={handleChange}
                    className="w-[58%] px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-1.5 focus:ring-[#006BB9] focus:outline-none shadow-xs bg-white font-medium"
                    placeholder="ID Compra"
                  />
                </div>
              </div>

              {/* Proveedor */}
              <div className="space-y-0.5">
                <label className="block text-[10px] font-bold text-[#25306B] uppercase tracking-wide">
                  Proveedor
                </label>
                <input
                  type="text"
                  name="Proveedor"
                  value={formData['Proveedor'] || ''}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-1.5 focus:ring-[#006BB9] focus:outline-none shadow-xs bg-white font-medium"
                  placeholder="Proveedor"
                />
              </div>
            </div>
          </div>

          {/* Columna 2: Documentación y Asignación */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-xs flex flex-col justify-between relative">
            <div className="space-y-3">
              <h2 className="text-[11.5px] font-extrabold text-[#25306B] border-b border-gray-150 pb-1 uppercase tracking-wider">
                Documentación y Asignación
              </h2>

              {/* Factura */}
              <div className="space-y-0.5">
                <div className="flex gap-2 items-center">
                  <div className="flex-1 space-y-0.5">
                    <label className="block text-[10px] font-bold text-[#25306B] uppercase tracking-wide">
                      Factura
                    </label>
                    <input
                      type="text"
                      name="Factura"
                      value={formData['Factura'] || ''}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-1.5 focus:ring-[#006BB9] focus:outline-none shadow-xs bg-white font-medium"
                      placeholder="N° Factura"
                    />
                  </div>
                  <div className="w-[125px] shrink-0 self-end">
                    <div className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-[9px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-500">Doc. Factura:</span>
                        {originalEquipo.hasFacturaFile || facturaHasFileGlobal ? (
                          <button
                            type="button"
                            onClick={() => handlePreview('factura')}
                            className="text-[#006BB9] hover:underline flex items-center gap-0.5 font-bold"
                          >
                            <Eye size={10} /> Ver
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">No</span>
                        )}
                      </div>
                      {facturaHasFileGlobal && !originalEquipo.hasFacturaFile ? (
                         <div className="text-[7.5px] text-emerald-700 leading-tight font-bold">
                           Enlazado auto.
                         </div>
                      ) : facturaFile ? (
                        <div className="flex items-center justify-between p-0.5 bg-blue-50 border border-blue-200 rounded text-[8px] text-blue-800">
                          <span className="truncate max-w-[75px]" title={facturaFile.name}>{facturaFile.name}</span>
                          <button 
                            type="button" 
                            onClick={() => setFacturaFile(null)}
                            className="text-red-500 hover:text-red-700 font-bold px-0.5"
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
                            className="w-full text-[8.5px] text-slate-500 file:mr-1 file:py-0.5 file:px-1 file:rounded file:border-0 file:text-[8px] file:font-semibold file:bg-blue-50 file:text-[#006BB9] hover:file:bg-blue-100"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Orden de Compra */}
              <div className="space-y-0.5">
                <div className="flex gap-2 items-center">
                  <div className="flex-1 space-y-0.5">
                    <label className="block text-[10px] font-bold text-[#25306B] uppercase tracking-wide">
                      Orden de Compra
                    </label>
                    <input
                      type="text"
                      name="Orden de Compra"
                      value={formData['Orden de Compra'] || ''}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-1.5 focus:ring-[#006BB9] focus:outline-none shadow-xs bg-white font-medium"
                      placeholder="Código OC"
                    />
                  </div>
                  <div className="w-[125px] shrink-0 self-end">
                    <div className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-[9px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-500">Doc. OC:</span>
                        {originalEquipo.hasOcFile || ocHasFileGlobal ? (
                          <button
                            type="button"
                            onClick={() => handlePreview('oc')}
                            className="text-[#006BB9] hover:underline flex items-center gap-0.5 font-bold"
                          >
                            <Eye size={10} /> Ver
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">No</span>
                        )}
                      </div>
                      {ocHasFileGlobal && !originalEquipo.hasOcFile ? (
                         <div className="text-[7.5px] text-emerald-700 leading-tight font-bold">
                           Enlazado auto.
                         </div>
                      ) : ocFile ? (
                        <div className="flex items-center justify-between p-0.5 bg-blue-50 border border-blue-200 rounded text-[8px] text-blue-800">
                          <span className="truncate max-w-[75px]" title={ocFile.name}>{ocFile.name}</span>
                          <button 
                            type="button" 
                            onClick={() => setOcFile(null)}
                            className="text-red-500 hover:text-red-700 font-bold px-0.5"
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
                            className="w-full text-[8.5px] text-slate-500 file:mr-1 file:py-0.5 file:px-1 file:rounded file:border-0 file:text-[8px] file:font-semibold file:bg-blue-50 file:text-[#006BB9] hover:file:bg-blue-100"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Usuario Asignado */}
              <div className="space-y-0.5">
                <label className="block text-[10px] font-bold text-[#25306B] uppercase tracking-wide">
                  Usuario Asignado (SLEP)
                </label>
                {(() => {
                  const isLegacy = formData['Usuario'] && !['disponible', 'bodega', '—', '-', 'sin asignar'].includes(formData['Usuario'].toLowerCase().trim());
                  if (isLegacy || formData.usuario_asignado_id) {
                    return (
                      <div className="flex items-center justify-between p-1 bg-blue-50 border border-blue-200 rounded-lg shadow-xs w-full">
                        <div className="flex items-center gap-1.5 overflow-hidden flex-1 min-w-0 pr-1.5">
                          <div className="w-5 h-5 shrink-0 rounded-full bg-[#006BB9] text-white flex items-center justify-center text-[8.5px] font-bold">
                            {formData.usuario_asignado_id && usuarios.length > 0
                              ? (usuarios.find(u => u.id === formData.usuario_asignado_id)?.nombre || usuarios.find(u => u.id === formData.usuario_asignado_id)?.email || '?').charAt(0).toUpperCase()
                              : formData['Usuario'] ? formData['Usuario'].charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className="text-[10px] leading-tight font-bold text-[#25306B] truncate flex-1 min-w-0">
                            {formData.usuario_asignado_id && usuarios.length > 0
                              ? (usuarios.find(u => u.id === formData.usuario_asignado_id)?.nombre || usuarios.find(u => u.id === formData.usuario_asignado_id)?.email || 'Usuario SLEP')
                              : formData['Usuario']}
                          </span>
                          {!formData.usuario_asignado_id && (
                            <span className="text-[7.5px] shrink-0 bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold border border-amber-250">
                              Antiguo
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('¿Está seguro que desea eliminar este usuario del equipo?')) {
                              setFormData({ ...formData, 'Usuario': '', 'SubDirección': '', usuario_asignado_id: '', estado: 'DISPONIBLE' });
                            }
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-1 rounded font-bold text-xs"
                          title="Eliminar usuario"
                        >
                          &times;
                        </button>
                      </div>
                    );
                  }
                  
                  return (
                    <AutocompleteInput
                      name="usuario_asignado_id"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      options={filteredAvailableUsuarios.map(u => ({ label: u.nombre || 'Sin nombre', value: u.id, sublabel: u.email }))}
                      onSelectOption={(opt) => {
                        const currentDesc = formData['Descripción del Bien'];
                        if (currentDesc) {
                            const hasSameType = equipos.some(eq => 
                              eq.id !== originalEquipo.id &&
                              eq['Descripción del Bien'] === currentDesc &&
                              (eq.usuario_asignado_id === opt.value || (eq['Usuario'] && isSameUser(eq['Usuario'], opt.label)))
                            );

                          if (hasSameType) {
                            if (!window.confirm(`El usuario ya tiene asignado un equipo del tipo "${currentDesc}". ¿Desea asignarlo de igual manera?`)) {
                              return; 
                            }
                          }
                        }

                        setFormData({
                          ...formData,
                          usuario_asignado_id: opt.value,
                          'Usuario': opt.label,
                          estado: 'ASIGNADO'
                        });
                        setUserSearchTerm('');
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-1.5 focus:ring-[#006BB9] focus:outline-none shadow-xs"
                      placeholder="Buscar usuario..."
                    />
                  );
                })()}
              </div>

              {/* Subdirección & Estado */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-bold text-[#25306B] uppercase tracking-wide">
                    Subdirección
                  </label>
                  {formData['SubDirección'] ? (
                    <div className="flex items-center justify-between p-1 bg-blue-50 border border-blue-200 rounded-lg shadow-xs w-full">
                      <span className="text-[10px] leading-tight font-bold text-[#25306B] truncate flex-1 min-w-0 pr-1">
                        {formData['SubDirección']}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, 'SubDirección': '' });
                          setSubdireccionSearchTerm('');
                        }}
                        className="text-red-500 hover:text-red-705 hover:bg-red-55 px-1 rounded font-bold text-xs"
                        title="Eliminar Subdirección"
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <AutocompleteInput
                      name="SubDirección"
                      value={subdireccionSearchTerm}
                      onChange={(e) => setSubdireccionSearchTerm(e.target.value)}
                      options={subdireccionesOptions}
                      onSelectOption={(opt) => {
                        setFormData({ ...formData, 'SubDirección': opt.value });
                        setSubdireccionSearchTerm('');
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-1.5 focus:ring-[#006BB9] focus:outline-none shadow-xs bg-white font-medium"
                      placeholder="Subdirección..."
                    />
                  )}
                </div>

                <div className="space-y-0.5 relative">
                  <label className="block text-[10px] font-bold text-[#25306B] uppercase tracking-wide">
                    Estado
                  </label>
                  <div className="flex items-center gap-1 relative">
                    <select
                      name="estado"
                      value={formData.estado || 'DISPONIBLE'}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-1.5 focus:ring-[#006BB9] focus:outline-none shadow-xs bg-white font-medium"
                    >
                      <option value="DISPONIBLE">DISPONIBLE</option>
                      <option value="PARA PRESTAMO">PARA PRÉSTAMO</option>
                      <option value="EN PRESTAMO">EN PRÉSTAMO</option>
                      <option value="ASIGNADO">ASIGNADO</option>
                      <option value="BAJA">DE BAJA</option>
                    </select>

                    {/* Warning toast flotante al lado derecho del selector de estado */}
                    {showEnPrestamoWarning && (
                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-red-50 border border-red-200 text-red-800 text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg z-50 flex items-center gap-1.5 whitespace-nowrap animate-fade-in font-bold">
                        <AlertCircle size={12} className="text-red-600 shrink-0" />
                        <span>Asigne usuario antes de guardar</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna 3: Historial */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-[11.5px] font-extrabold text-[#25306B] border-b border-gray-150 pb-1 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#25306B]" /> Historial de Asignaciones
              </h2>

              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-3 text-center text-gray-400 space-y-1 border border-dashed border-gray-200 rounded-xl min-h-[160px]">
                  <UserCheck className="w-6 h-6 text-gray-300" />
                  <p className="text-[10.5px] font-bold text-gray-500">Asignación Original</p>
                  <p className="text-[9.5px] text-gray-400">Este equipo no registra cambios de usuario históricos.</p>
                </div>
              ) : (
                <div className="relative pl-4 border-l border-gray-200 space-y-3.5 py-1 max-h-[180px] overflow-y-auto custom-scrollbar">
                  {history.map((entry, index) => (
                    <div key={index} className="relative">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[22px] top-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-blue-50 border border-[#006BB9]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#006BB9]" />
                      </span>
                      {/* Timeline Content */}
                      <div className="space-y-0.5 leading-tight">
                        <div className="text-[10px] font-bold text-gray-700">
                          {entry.usuario}
                        </div>
                        {entry.subdireccion && entry.subdireccion !== '—' && (
                          <div className="text-[9px] text-gray-400 font-medium">
                            {entry.subdireccion}
                          </div>
                        )}
                        <div className="text-[8px] text-gray-400">
                          Entregado: {formatFecha(entry.fechaCambio)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Current assignment representation */}
                  <div className="relative pt-1">
                    <span className="absolute -left-[24px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#90d039]">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    <div className="space-y-0.5 bg-green-50/50 p-1.5 rounded border border-green-100 leading-tight">
                      <div className="text-[10px] font-bold text-[#25306B] flex items-center gap-1">
                        <span className="truncate max-w-[140px]">{
                          originalEquipo.usuario_asignado_id && usuarios.length > 0
                            ? (usuarios.find(u => u.id === originalEquipo.usuario_asignado_id)?.nombre || usuarios.find(u => u.id === originalEquipo.usuario_asignado_id)?.email || 'Usuario SLEP')
                            : 'Disponible (Bodega)'
                        }</span>
                        <span className="text-[7.5px] bg-[#90d039] text-white px-1.5 py-0.2 rounded font-bold uppercase shrink-0">Actual</span>
                      </div>
                      <div className="text-[9px] text-gray-500 font-medium">
                        {originalEquipo['SubDirección'] || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Footer Spanning 3 Columns */}
          <div className="lg:col-span-3 pt-3 border-t border-gray-200 flex justify-between items-center text-xs">
            <div className="bg-blue-50 text-[#25306B] text-[9.5px] p-2 rounded-lg flex items-center gap-1.5 border border-blue-100 max-w-[65%] shrink-0">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#006BB9]" />
              <p className="leading-snug">
                Si reasigna el equipo a un nuevo **Usuario**, el anterior quedará registrado en el historial histórico de asignaciones con la fecha de la edición.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-gray-650 bg-gray-150 hover:bg-gray-205 font-bold rounded-lg text-xs transition-colors border border-gray-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#006BB9] hover:bg-[#25306B] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Save size={12} /> Guardar Cambios
              </button>
            </div>
          </div>
        </form>
      </div>

      {fileTooltip.visible && (
        <div 
          className="fixed z-50 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] rounded-lg shadow-xl pointer-events-none w-64 leading-tight"
          style={{ top: fileTooltip.y, left: fileTooltip.x }}
        >
          <strong className="block mb-0.5 font-bold text-amber-900">Sugerencia de Archivo</strong>
          Asegúrate de que el nombre del archivo contenga la numeración de la <span className="font-semibold uppercase">{fileTooltip.type}</span>.
        </div>
      )}
    </div>
  );
}
