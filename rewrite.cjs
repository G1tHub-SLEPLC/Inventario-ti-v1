const fs = require('fs');
const file = 'src/pages/NuevoEquipoPage.jsx';
let content = fs.readFileSync(file, 'utf8');

const returnStart = content.indexOf('  return (');
if (returnStart === -1) {
  console.log('Return statement not found');
  process.exit(1);
}

const newReturn = `  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
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
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-md bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                  {imagenFile ? (
                    <img src={URL.createObjectURL(imagenFile)} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[9px] text-gray-400 font-bold uppercase text-center leading-tight">No Img</span>
                  )}
                </div>
                <div className="flex-1">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setImagenFile(e.target.files[0] || null)}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:font-semibold file:bg-blue-50 file:text-[#006BB9] hover:file:bg-blue-100"
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5 leading-tight">Tamaño recomendado: 48x48px (PNG/JPG).</p>
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
            onClick={() => navigate('/')}
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
  );
`;

content = content.slice(0, returnStart) + newReturn + '\n}\n';
fs.writeFileSync(file, content, 'utf8');
console.log('Replaced successfully');
