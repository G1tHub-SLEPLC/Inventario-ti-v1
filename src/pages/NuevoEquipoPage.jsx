import { useState, useMemo, useEffect } from 'react';
import { useInventario } from '../context/InventarioContext';
import { Save, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saveDocument } from '../utils/db';
import { supabase } from '../lib/supabaseClient';
import AutocompleteInput from '../components/AutocompleteInput';
import { isSameUser } from '../utils/userUtils';

const COLUMNS = [
  'Descripción del Bien', 'Marca', 'Modelo', 'Nº de serie',
  'ID Publicación',
  'Orden de Compra', 'Factura', 'Proveedor'
];

export default function NuevoEquipoPage() {
  const { equipos, addEquipo, addMasivo, showToast } = useInventario();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ estado: 'DISPONIBLE', usuario_asignado_id: '' });
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [facturaFile, setFacturaFile] = useState(null);
  const [ocFile, setOcFile] = useState(null);
  const [fileTooltip, setFileTooltip] = useState({ visible: false, x: 0, y: 0, type: '' });
  const [usuarios, setUsuarios] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [subdireccionSearchTerm, setSubdireccionSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

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
          hasOcFile: ocSaved || ocHasFile
       }));

       await addMasivo(nuevosEquipos);
       showToast('Registro Múltiple Exitoso', `Se guardaron correctamente ${uniqueSerials.length} equipos nuevos en bloque.`, 'success');
       navigate('/');
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

    addEquipo(newEquipo);
    showToast(
      'Registro Exitoso', 
      `El equipo "${newEquipo['Descripción del Bien'] || 'Nuevo equipo'}" se ha guardado correctamente.`, 
      'success'
    );
    navigate('/');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nuevo Equipo</h1>
        <p className="text-sm text-gray-500 mt-1">Registra un nuevo activo en el inventario manualmente.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
           <h2 className="text-sm font-bold text-gray-800">Detalle del Equipo</h2>
           <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
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
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {COLUMNS.map((col, idx) => (
              <div key={idx} className={`space-y-1 ${col === 'SubDirección' ? 'md:col-span-2' : ''}`}>
                <label className="block text-xs font-semibold text-[#25306B] mb-1 uppercase tracking-wide">
                  {col}
                </label>
                {col === 'Nº de serie' ? (
                  isMultiMode ? (
                    <div className="space-y-2">
                       <textarea
                         name={col}
                         value={formData[col] || ''}
                         onChange={handleChange}
                         rows={4}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm transition-shadow font-mono"
                         placeholder="Pegue aquí los números de serie (uno por línea o separados por coma)"
                         required
                       />
                       <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold px-1">
                          <span>Modo Lote Activado</span>
                          <span className="text-[#006BB9] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            Equipos a crear: {formData[col] ? [...new Set(formData[col].split(/[\n,]/).map(s => s.trim()).filter(s => s !== ''))].length : 0}
                          </span>
                       </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      name={col}
                      value={formData[col] || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm transition-shadow"
                      placeholder={`Ingrese ${col.toLowerCase()}`}
                      required
                    />
                  )
                ) : col === 'ID Publicación' ? (
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
                      className="w-2/3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm transition-shadow"
                      placeholder={`Ingrese ${col.toLowerCase()}`}
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    name={col}
                    value={formData[col] || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm transition-shadow"
                    placeholder={`Ingrese ${col.toLowerCase()}`}
                    required={col === 'Descripción del Bien' || col === 'Nº de serie'}
                  />
                )}
                {col === 'Factura' && (
                  <div className="mt-1">
                    <label className="block text-[11px] text-gray-500 font-medium">Adjuntar archivo de Factura (PDF/Imagen)</label>
                    {facturaHasFile ? (
                      <div className="mt-1 p-2 bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-200 rounded flex items-start gap-1.5 leading-tight font-medium">
                        <span className="shrink-0">✓</span> El archivo para esta Factura ya está subido en el sistema. Se enlazará automáticamente.
                      </div>
                    ) : facturaFile ? (
                      <div className="mt-1 flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 shadow-sm">
                        <span className="truncate max-w-[200px] font-medium" title={facturaFile.name}>{facturaFile.name}</span>
                        <button 
                          type="button" 
                          onClick={() => setFacturaFile(null)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2 shrink-0 font-bold px-2 py-0.5 rounded transition-colors"
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
                          className="mt-1 block w-full text-xs text-slate-500 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#006BB9] hover:file:bg-blue-100"
                        />
                      </div>
                    )}
                  </div>
                )}
                {col === 'Orden de Compra' && (
                  <div className="mt-1">
                    <label className="block text-[11px] text-gray-500 font-medium">Adjuntar archivo de OC (PDF/Imagen)</label>
                    {ocHasFile ? (
                      <div className="mt-1 p-2 bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-200 rounded flex items-start gap-1.5 leading-tight font-medium">
                        <span className="shrink-0">✓</span> El archivo para esta OC ya está subido en el sistema. Se enlazará automáticamente.
                      </div>
                    ) : ocFile ? (
                      <div className="mt-1 flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 shadow-sm">
                        <span className="truncate max-w-[200px] font-medium" title={ocFile.name}>{ocFile.name}</span>
                        <button 
                          type="button" 
                          onClick={() => setOcFile(null)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2 shrink-0 font-bold px-2 py-0.5 rounded transition-colors"
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
                          className="mt-1 block w-full text-xs text-slate-500 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#006BB9] hover:file:bg-blue-100"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8 relative">
            <h2 className="text-xl font-bold mb-6 text-[#25306B] border-b pb-2 flex items-center gap-2">
              <UserCheck className="text-[#006BB9]" /> Asignación y Estado
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="space-y-1 relative">
                <label className="block text-xs font-semibold text-[#25306B] uppercase tracking-wide mb-1">
                  Usuario Asignado (SLEP)
                </label>

              {(() => {
                const isLegacy = formData['Usuario'] && !['disponible', 'bodega', '—', '-', 'sin asignar'].includes(formData['Usuario'].toLowerCase().trim());
                if (isLegacy || formData.usuario_asignado_id) {
                  return (
                    <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-lg shadow-sm w-full">
                      <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0 pr-2">
                        <div className="w-6 h-6 shrink-0 rounded-full bg-[#006BB9] text-white flex items-center justify-center text-[10px] font-bold">
                          {formData.usuario_asignado_id && usuarios.length > 0
                            ? (usuarios.find(u => u.id === formData.usuario_asignado_id)?.nombre || usuarios.find(u => u.id === formData.usuario_asignado_id)?.email || '?').charAt(0).toUpperCase()
                            : formData['Usuario'] ? formData['Usuario'].charAt(0).toUpperCase() : '?'}
                        </div>
                        <span className="text-[11px] leading-tight font-bold text-[#25306B] truncate flex-1 min-w-0">
                          {formData.usuario_asignado_id && usuarios.length > 0
                            ? (usuarios.find(u => u.id === formData.usuario_asignado_id)?.nombre || usuarios.find(u => u.id === formData.usuario_asignado_id)?.email || 'Usuario SLEP')
                            : formData['Usuario']}
                        </span>
                        {!formData.usuario_asignado_id && (
                          <span className="text-[10px] shrink-0 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                            Registro Antiguo
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('¿Está seguro que desea eliminar este usuario del equipo?')) {
                            setFormData({ ...formData, usuario_asignado_id: '', 'Usuario': '' });
                          }
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors font-bold flex items-center justify-center shrink-0"
                        title="Eliminar usuario"
                      >
                        &times;
                      </button>
                    </div>
                  );
                }
                
                return (
                  <div className="relative w-full">
                    <AutocompleteInput
                      name="usuario_asignado_id"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      options={filteredAvailableUsuarios.map(u => ({ label: u.nombre || 'Sin nombre', value: u.id, sublabel: u.email }))}
                      onSelectOption={(opt) => {
                        const currentDesc = formData['Descripción del Bien'];
                        if (currentDesc) {
                          const hasSameType = equipos.some(eq => 
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm transition-shadow"
                      placeholder="Buscar por nombre o correo..."
                    />
                  </div>
                );
              })()}
            </div>


          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
          </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#006BB9] hover:bg-[#25306B] text-white font-medium rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <Save size={16} /> Guardar Equipo
            </button>
          </div>
        </form>
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
