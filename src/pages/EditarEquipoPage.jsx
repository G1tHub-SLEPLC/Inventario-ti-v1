import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useInventario } from '../context/InventarioContext';
import { Save, ArrowLeft, AlertCircle, Eye, Clock, UserCheck } from 'lucide-react';
import { saveDocument, getDocument } from '../utils/db';
import { supabase } from '../lib/supabaseClient';

const COLUMNS = [
  'Descripción del Bien', 'Marca', 'Modelo', 'Nº de serie',
  'ID Publicación',
  'Orden de Compra', 'Factura', 'Proveedor', 'SubDirección'
];

export default function EditarEquipoPage() {
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  const equipIndex = idParam !== null ? parseInt(idParam, 10) : -1;
  const navigate = useNavigate();
  const { equipos, loading, updateEquipo, updateEquiposMasivo, showToast } = useInventario();

  const [formData, setFormData] = useState({});
  const [facturaFile, setFacturaFile] = useState(null);
  const [ocFile, setOcFile] = useState(null);
  const [fileTooltip, setFileTooltip] = useState({ visible: false, x: 0, y: 0, type: '' });
  const [usuarios, setUsuarios] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      const { data, error } = await supabase.from('perfiles').select('id, nombre, correo').eq('rol', 'slep');
      if (!error && data) setUsuarios(data);
    }
    loadUsers();
  }, []);

  const originalEquipo = equipIndex >= 0 && equipIndex < equipos.length ? equipos[equipIndex] : null;

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
      (u.correo || '').toLowerCase().includes(q)
    );
  }, [usuarios, userSearchTerm]);

  useEffect(() => {
    if (originalEquipo) {
      setFormData({ ...originalEquipo });
    }
  }, [originalEquipo]);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Cargando datos...</div>;
  }

  if (!originalEquipo) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center space-y-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
          <p className="font-bold">Equipo no encontrado en el inventario.</p>
          <div className="mt-4 p-3 bg-white text-left text-xs font-mono rounded border border-red-100 text-slate-700 space-y-1">
            <p><strong>Buscando Índice:</strong> {equipIndex}</p>
            <p><strong>Cargando BD:</strong> {loading ? 'Sí' : 'No'}</p>
            <p><strong>Total Equipos en BD:</strong> {equipos.length}</p>
            <p><strong>Series Disponibles (primeras 10):</strong> {equipos.map(e => e['Nº de serie']).slice(0, 10).join(', ')}{equipos.length > 10 ? '...' : ''}</p>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium">
          Volver al Dashboard
        </button>
      </div>
    );
  }

  if (Object.keys(formData).length === 0) {
    return <div className="p-6 text-center text-gray-500">Cargando datos...</div>;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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

    navigate(-1);
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Editar Equipo</h1>
          <p className="text-sm text-gray-500 mt-0.5">Modifique los atributos del equipo o gestione sus documentos cargados.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COLUMNS.map((col) => {
                const isSerial = col === 'Nº de serie';
                const hasExistingSerial = !!originalEquipo['Nº de serie'];
                const disableSerial = isSerial && hasExistingSerial;
                return (
                  <div key={col} className="space-y-1">
                    <label className="block text-xs font-semibold text-[#25306B] mb-1 uppercase tracking-wide">
                      {col} {disableSerial && <span className="text-gray-400 font-normal text-[10px]">(Fijo)</span>}
                    </label>
                    {col === 'ID Publicación' ? (
                      <div className="flex gap-2">
                        <select
                          name="Tipo Publicación"
                          value={formData['Tipo Publicación'] || ''}
                          onChange={handleChange}
                          className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm transition-shadow bg-white"
                        >
                          <option value="">— Tipo —</option>
                          <option value="Convenio Marco">Convenio Marco</option>
                          <option value="Compra Ágil">Compra Ágil</option>
                          <option value="Licitación">Licitación</option>
                        </select>
                        <input
                          type="text"
                          name={col}
                          value={formData[col] || ''}
                          onChange={handleChange}
                          disabled={disableSerial}
                          className={`w-2/3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm transition-all ${disableSerial ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white'}`}
                          placeholder={`Ingrese ${col.toLowerCase()}`}
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        name={col}
                        value={formData[col] || ''}
                        onChange={handleChange}
                        disabled={disableSerial}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm transition-all ${disableSerial ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white'}`}
                        placeholder={`Ingrese ${col.toLowerCase()}`}
                        required={col === 'Descripción del Bien'}
                      />
                    )}
                    
                    {col === 'Factura' && (
                      <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-600">Documento de Factura:</span>
                          {originalEquipo.hasFacturaFile || facturaHasFileGlobal ? (
                            <button
                              type="button"
                              onClick={() => handlePreview('factura')}
                              className="text-[#006BB9] hover:underline flex items-center gap-1 font-medium"
                            >
                              <Eye size={12} /> Ver Cargado
                            </button>
                          ) : (
                            <span className="text-gray-400 italic">No cargado</span>
                          )}
                        </div>
                        {facturaHasFileGlobal && !originalEquipo.hasFacturaFile ? (
                           <div className="p-1.5 bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-200 rounded flex items-start gap-1.5 leading-tight font-medium">
                             <span className="shrink-0">✓</span> El archivo para esta Factura ya está subido en otro equipo. Se enlazará automáticamente.
                           </div>
                        ) : facturaFile ? (
                          <div className="mt-1 flex items-center justify-between p-1.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-800 shadow-sm">
                            <span className="truncate max-w-[180px] font-medium" title={facturaFile.name}>{facturaFile.name}</span>
                            <button 
                              type="button" 
                              onClick={() => setFacturaFile(null)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-1 shrink-0 font-bold px-1.5 py-0.5 rounded transition-colors"
                              title="Eliminar archivo"
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
                              className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-[#006BB9] hover:file:bg-blue-100"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {col === 'Orden de Compra' && (
                      <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-600">Documento de OC:</span>
                          {originalEquipo.hasOcFile || ocHasFileGlobal ? (
                            <button
                              type="button"
                              onClick={() => handlePreview('oc')}
                              className="text-[#006BB9] hover:underline flex items-center gap-1 font-medium"
                            >
                              <Eye size={12} /> Ver Cargado
                            </button>
                          ) : (
                            <span className="text-gray-400 italic">No cargado</span>
                          )}
                        </div>
                        {ocHasFileGlobal && !originalEquipo.hasOcFile ? (
                           <div className="p-1.5 bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-200 rounded flex items-start gap-1.5 leading-tight font-medium">
                             <span className="shrink-0">✓</span> El archivo para esta OC ya está subido en otro equipo. Se enlazará automáticamente.
                           </div>
                        ) : ocFile ? (
                          <div className="mt-1 flex items-center justify-between p-1.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-800 shadow-sm">
                            <span className="truncate max-w-[180px] font-medium" title={ocFile.name}>{ocFile.name}</span>
                            <button 
                              type="button" 
                              onClick={() => setOcFile(null)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-1 shrink-0 font-bold px-1.5 py-0.5 rounded transition-colors"
                              title="Eliminar archivo"
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
                              className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-[#006BB9] hover:file:bg-blue-100"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#25306B] mb-1 uppercase tracking-wide">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado || 'DISPONIBLE'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm transition-shadow"
                >
                  <option value="DISPONIBLE">DISPONIBLE</option>
                  <option value="PARA PRESTAMO">PARA PRÉSTAMO</option>
                  <option value="EN PRESTAMO">EN PRÉSTAMO</option>
                  <option value="ASIGNADO">ASIGNADO</option>
                  <option value="BAJA">DE BAJA</option>
                </select>
              </div>

              <div className="space-y-1 relative">
                <label className="block text-xs font-semibold text-[#25306B] uppercase tracking-wide mb-1">
                  Usuario Asignado (SLEP)
                </label>

                {(formData['Usuario'] || formData.usuario_asignado_id) ? (
                  <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#006BB9] text-white flex items-center justify-center text-[10px] font-bold">
                        {formData.usuario_asignado_id && usuarios.length > 0
                          ? (usuarios.find(u => u.id === formData.usuario_asignado_id)?.nombre || usuarios.find(u => u.id === formData.usuario_asignado_id)?.correo || '?').charAt(0).toUpperCase()
                          : formData['Usuario'] ? formData['Usuario'].charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="text-sm font-semibold text-[#25306B]">
                        {formData.usuario_asignado_id && usuarios.length > 0
                          ? (usuarios.find(u => u.id === formData.usuario_asignado_id)?.nombre || usuarios.find(u => u.id === formData.usuario_asignado_id)?.correo || 'Usuario SLEP')
                          : formData['Usuario']}
                      </span>
                      {!formData.usuario_asignado_id && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                          Registro Antiguo
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('¿Está seguro que desea eliminar este usuario del equipo?')) {
                          setFormData({ ...formData, 'Usuario': '', 'SubDirección': '', usuario_asignado_id: '' });
                        }
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors font-bold flex items-center justify-center"
                      title="Eliminar usuario"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => {
                        setUserSearchTerm(e.target.value);
                        setIsUserDropdownOpen(true);
                      }}
                      onFocus={() => setIsUserDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsUserDropdownOpen(false), 200)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm transition-shadow"
                      placeholder="Buscar por nombre o correo..."
                    />
                    {isUserDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredAvailableUsuarios.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500">No se encontraron usuarios</div>
                        ) : (
                          filteredAvailableUsuarios.map(u => (
                            <div
                              key={u.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                
                                const currentDesc = formData['Descripción del Bien'];
                                if (currentDesc) {
                                  const hasSameType = equipos.some(eq => 
                                    eq.id !== originalEquipo.id &&
                                    eq['Descripción del Bien'] === currentDesc &&
                                    (eq.usuario_asignado_id === u.id || (eq['Usuario'] && eq['Usuario'].trim().toLowerCase() === (u.nombre || u.correo).trim().toLowerCase()))
                                  );

                                  if (hasSameType) {
                                    if (!window.confirm(`El usuario ya tiene asignado un equipo del tipo "${currentDesc}". ¿Desea asignarlo de igual manera?`)) {
                                      setIsUserDropdownOpen(false);
                                      return; 
                                    }
                                  }
                                }

                                setFormData({
                                  ...formData,
                                  usuario_asignado_id: u.id,
                                  'Usuario': u.nombre || u.correo
                                });
                                setUserSearchTerm('');
                                setIsUserDropdownOpen(false);
                              }}
                              className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer text-gray-700 flex flex-col"
                            >
                              <span className="font-semibold">{u.nombre || 'Sin nombre'}</span>
                              <span className="text-xs text-gray-400">{u.correo}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 text-[#25306B] text-[11px] p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#006BB9]" />
              <p>
                Si reasigna el equipo a un nuevo **Usuario**, el anterior quedará registrado en el historial de asignaciones histórico con la fecha y hora de la edición actual.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#006BB9] hover:bg-[#25306B] text-white font-medium rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm"
              >
                <Save size={16} /> Guardar Cambios
              </button>
            </div>
          </form>
        </div>

        {/* History / Assignment Timeline Column */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#25306B]" /> Historial de Asignaciones
            </h2>
            <p className="text-xs text-gray-400 mt-1">Registro cronológico de ex-usuarios y bodegajes del activo.</p>
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-2">
              <UserCheck className="w-8 h-8 text-gray-300" />
              <p className="text-xs font-semibold text-gray-500">Asignación Original</p>
              <p className="text-[11px] text-gray-400">Este equipo no registra cambios de usuario históricos.</p>
            </div>
          ) : (
            <div className="relative pl-6 border-l border-gray-200 space-y-6">
              {history.map((entry, index) => (
                <div key={index} className="relative">
                  {/* Timeline Dot */}
                  <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-50 border border-[#006BB9]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#006BB9]" />
                  </span>
                  {/* Timeline Content */}
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-gray-800">
                      {entry.usuario}
                    </div>
                    {entry.subdireccion && entry.subdireccion !== '—' && (
                      <div className="text-[11px] text-gray-500 font-medium">
                        {entry.subdireccion}
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400">
                      Entregado: {formatFecha(entry.fechaCambio)}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Current assignment representation */}
              <div className="relative pt-2">
                <span className="absolute -left-[33px] top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#90d039]">
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                </span>
                <div className="space-y-1 bg-green-50/50 p-2.5 rounded-lg border border-green-100">
                  <div className="text-xs font-bold text-[#25306B] flex items-center gap-1">
                    <span>{
                      originalEquipo.usuario_asignado_id && usuarios.length > 0
                        ? (usuarios.find(u => u.id === originalEquipo.usuario_asignado_id)?.nombre || usuarios.find(u => u.id === originalEquipo.usuario_asignado_id)?.correo || 'Usuario SLEP')
                        : 'Disponible (Bodega)'
                    }</span>
                    <span className="text-[9px] bg-[#90d039] text-white px-1.5 py-0.5 rounded font-semibold uppercase">Actual</span>
                  </div>
                  <div className="text-[11px] text-gray-600 font-medium">
                    {originalEquipo['SubDirección'] || '—'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {fileTooltip.visible && (
        <div 
          className="fixed z-50 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] rounded-lg shadow-xl pointer-events-none w-72 leading-tight"
          style={{ top: fileTooltip.y, left: fileTooltip.x }}
        >
          <strong className="block mb-1 font-bold text-amber-900">Sugerencia de Archivo</strong>
          Asegúrate de que el nombre del archivo contenga la numeración de la <span className="font-semibold uppercase">{fileTooltip.type}</span>. Así el sistema validará si ya fue ingresada y evitará duplicar el archivo.
          <div className="mt-2 text-[10px] font-medium text-amber-700 bg-amber-100/50 p-1.5 rounded border border-amber-200/50">
            <strong>Ejemplo de nombre:</strong><br/>
            <span className="font-mono text-amber-900">{fileTooltip.type === 'factura' ? 'Factura N° 10136.pdf' : '1456839-1-CM26.pdf'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
