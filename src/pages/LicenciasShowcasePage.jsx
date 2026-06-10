import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Check, 
  X, 
  Plus, 
  UserPlus, 
  Info, 
  CheckSquare, 
  Square,
  ShieldAlert,
  ArrowRight,
  Filter,
  Layers,
  Settings
} from 'lucide-react';

const DUMMY_USERS = [
  { id: '1', nombre: 'Cristian Gutiérrez', email: 'cristian.gutierrez@slep.cl', subdireccion: 'Planificación', rol: 'Funcionario' },
  { id: '2', nombre: 'Ana Silva', email: 'ana.silva@slep.cl', subdireccion: 'Administración', rol: 'Funcionario' },
  { id: '3', nombre: 'Roberto Díaz', email: 'roberto.diaz@slep.cl', subdireccion: 'Planificación', rol: 'Funcionario' },
  { id: '4', nombre: 'María González', email: 'maria.gonzalez@slep.cl', subdireccion: 'Finanzas', rol: 'Funcionario' },
  { id: '5', nombre: 'Carlos Soto', email: 'carlos.soto@slep.cl', subdireccion: 'Informática', rol: 'Administrador' },
  { id: '6', nombre: 'Lucía Pérez', email: 'lucia.perez@slep.cl', subdireccion: 'Finanzas', rol: 'Funcionario' },
  { id: '7', nombre: 'Andrés Gómez', email: 'andres.gomez@slep.cl', subdireccion: 'Administración', rol: 'Funcionario' },
  { id: '8', nombre: 'Patricia Vera', email: 'patricia.vera@slep.cl', subdireccion: 'Informática', rol: 'Administrador' }
];

export default function LicenciasShowcasePage() {
  const [activeTab, setActiveTab] = useState('idea1'); // 'idea1', 'idea2', 'idea3'
  
  // Idea 1 States
  const [search1, setSearch1] = useState('');
  const [selected1, setSelected1] = useState([]);
  const [isDropdownOpen1, setIsDropdownOpen1] = useState(false);
  const totalLicencias1 = 5;

  // Idea 2 States
  const [search2, setSearch2] = useState('');
  const [selected2, setSelected2] = useState([]);
  const totalLicencias2 = 5;

  // Idea 3 States
  const [filterSub, setFilterSub] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [selected3, setSelected3] = useState([]);
  const totalLicencias3 = 10;

  // Helper filters
  const filteredUsers1 = useMemo(() => {
    return DUMMY_USERS.filter(u => 
      u.nombre.toLowerCase().includes(search1.toLowerCase()) || 
      u.email.toLowerCase().includes(search1.toLowerCase())
    );
  }, [search1]);

  const filteredUsers2 = useMemo(() => {
    return DUMMY_USERS.filter(u => 
      !selected2.some(s => s.id === u.id) &&
      (u.nombre.toLowerCase().includes(search2.toLowerCase()) || 
       u.email.toLowerCase().includes(search2.toLowerCase()))
    );
  }, [search2, selected2]);

  const filteredUsers3 = useMemo(() => {
    if (!filterSub && !filterRol) return [];
    return DUMMY_USERS.filter(u => {
      const matchSub = filterSub ? u.subdireccion === filterSub : true;
      const matchRol = filterRol ? u.rol === filterRol : true;
      return matchSub && matchRol;
    });
  }, [filterSub, filterRol]);

  // Actions Idea 1
  const toggleSelect1 = (user) => {
    const isSelected = selected1.some(s => s.id === user.id);
    if (isSelected) {
      setSelected1(selected1.filter(s => s.id !== user.id));
    } else {
      if (selected1.length >= totalLicencias1) {
        alert('Límite de licencias alcanzado para este showcase (5 licencias)');
        return;
      }
      setSelected1([...selected1, user]);
    }
  };

  // Actions Idea 2
  const handleAdd2 = (user) => {
    if (selected2.length >= totalLicencias2) {
      alert('Límite de licencias alcanzado para este showcase (5 licencias)');
      return;
    }
    setSelected2([...selected2, user]);
  };

  const handleRemove2 = (user) => {
    setSelected2(selected2.filter(s => s.id !== user.id));
  };

  // Actions Idea 3
  const handleSelectAll3 = () => {
    const allMatching = filteredUsers3;
    const allSelected = allMatching.every(u => selected3.some(s => s.id === u.id));
    
    if (allSelected) {
      // Unselect all matching
      setSelected3(selected3.filter(s => !allMatching.some(m => m.id === s.id)));
    } else {
      // Select all matching up to stock
      const newToSelect = allMatching.filter(u => !selected3.some(s => s.id === u.id));
      const spaceLeft = totalLicencias3 - selected3.length;
      const toAdd = newToSelect.slice(0, spaceLeft);
      if (toAdd.length < newToSelect.length) {
        alert(`Stock insuficiente. Solo se agregaron ${toAdd.length} funcionarios.`);
      }
      setSelected3([...selected3, ...toAdd]);
    }
  };

  const toggleSelect3 = (user) => {
    const isSelected = selected3.some(s => s.id === user.id);
    if (isSelected) {
      setSelected3(selected3.filter(s => s.id !== user.id));
    } else {
      if (selected3.length >= totalLicencias3) {
        alert(`Límite alcanzado (${totalLicencias3} licencias)`);
        return;
      }
      setSelected3([...selected3, user]);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="border-b pb-5">
        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
          <Users size={32} className="text-[#006BB9]" /> Showcase: Asignación Múltiple de Licencias
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Interactúa con los prototipos a continuación para experimentar cómo funcionaría cada propuesta antes de que sea integrada al sistema real.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1.5 rounded-xl max-w-2xl">
        <button 
          onClick={() => setActiveTab('idea1')} 
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'idea1' ? 'bg-[#006BB9] text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Idea 1: Multi-select
        </button>
        <button 
          onClick={() => setActiveTab('idea2')} 
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'idea2' ? 'bg-[#006BB9] text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Idea 2: Doble Columna
        </button>
        <button 
          onClick={() => setActiveTab('idea3')} 
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'idea3' ? 'bg-[#006BB9] text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Idea 3: Filtro de Grupos
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Prototipo Interactivo */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="font-bold text-gray-800 text-lg uppercase tracking-wide">Prototipo Interactivo</h3>
            <span className="text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Modo Simulado
            </span>
          </div>

          {/* IDEA 1 */}
          {activeTab === 'idea1' && (
            <div className="space-y-6">
              {/* Licencia info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Microsoft 365 Business Premium</h4>
                  <p className="text-xs text-slate-500">Asignando licencias de productividad</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 block uppercase">Disponibles</span>
                  <span className="text-lg font-black text-emerald-600">{totalLicencias1 - selected1.length} / {totalLicencias1}</span>
                </div>
              </div>

              {/* Selector */}
              <div className="relative space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Buscar y Seleccionar Funcionarios</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                  <input 
                    type="text" 
                    placeholder="Escribe para buscar (Ej: Cristian, Ana...)" 
                    value={search1}
                    onChange={(e) => {
                      setSearch1(e.target.value);
                      setIsDropdownOpen1(true);
                    }}
                    onFocus={() => setIsDropdownOpen1(true)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none transition-all"
                  />
                </div>

                {/* Dropdown */}
                {isDropdownOpen1 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-100">
                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 flex justify-between">
                      <span>Resultados</span>
                      <button onClick={() => setIsDropdownOpen1(false)} className="text-blue-600 hover:underline">Cerrar</button>
                    </div>
                    {filteredUsers1.map(u => {
                      const isSelected = selected1.some(s => s.id === u.id);
                      return (
                        <div 
                          key={u.id}
                          onClick={() => toggleSelect1(u)}
                          className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-gray-800 text-sm">{u.nombre}</div>
                            <div className="text-xs text-gray-500">{u.email} • <span className="font-semibold text-gray-400">{u.subdireccion}</span></div>
                          </div>
                          <div>
                            {isSelected ? (
                              <div className="bg-blue-100 text-blue-800 p-1 rounded-md">
                                <CheckSquare size={18} />
                              </div>
                            ) : (
                              <div className="text-gray-300 p-1 hover:text-gray-400">
                                <Square size={18} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {filteredUsers1.length === 0 && (
                      <div className="p-4 text-center text-sm text-gray-400">No se encontraron funcionarios.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Chips */}
              <div className="space-y-2">
                <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Funcionarios Seleccionados ({selected1.length})</span>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200/60 min-h-[50px]">
                  {selected1.map(u => (
                    <span 
                      key={u.id} 
                      className="inline-flex items-center gap-1.5 bg-white text-blue-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-blue-100"
                    >
                      {u.nombre}
                      <button 
                        onClick={() => toggleSelect1(u)}
                        className="text-gray-400 hover:text-red-500 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  {selected1.length === 0 && (
                    <span className="text-xs text-gray-400 italic self-center">Ninguno seleccionado. Haz clic en el buscador superior para agregar.</span>
                  )}
                </div>
              </div>

              {/* Simulated Submit */}
              <div className="flex justify-end pt-4 border-t">
                <button 
                  onClick={() => {
                    if (selected1.length === 0) {
                      alert('Selecciona al menos un funcionario primero.');
                      return;
                    }
                    alert(`ÉXITO SIMULADO: Se han asignado 365 Premium a ${selected1.length} funcionarios de forma simultánea:\n${selected1.map(s => `• ${s.nombre}`).join('\n')}`);
                    setSelected1([]);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm flex items-center gap-2 shadow transition-colors"
                >
                  <UserPlus size={16} /> Asignar Licencias
                </button>
              </div>
            </div>
          )}

          {/* IDEA 2 */}
          {activeTab === 'idea2' && (
            <div className="space-y-6">
              {/* Licencia info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Adobe Creative Cloud Suite</h4>
                  <p className="text-xs text-slate-500">Diseño y desarrollo de contenido</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 block uppercase">Disponibles</span>
                  <span className="text-lg font-black text-emerald-600">{totalLicencias2 - selected2.length} / {totalLicencias2}</span>
                </div>
              </div>

              {/* Two Column Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
                
                {/* Left: Search & Available */}
                <div className="border border-gray-200 rounded-xl flex flex-col overflow-hidden bg-gray-50/50">
                  <div className="p-3 border-b bg-white relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Filtrar disponibles..." 
                      value={search2}
                      onChange={(e) => setSearch2(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-[#006BB9] focus:outline-none"
                    />
                  </div>
                  <div className="overflow-y-auto flex-1 divide-y divide-gray-100 bg-white">
                    {filteredUsers2.map(u => (
                      <div key={u.id} className="p-2.5 hover:bg-slate-50 flex items-center justify-between group">
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-semibold text-gray-800 text-xs truncate">{u.nombre}</div>
                          <div className="text-[10px] text-gray-500 truncate">{u.subdireccion}</div>
                        </div>
                        <button 
                          onClick={() => handleAdd2(u)}
                          className="bg-blue-50 text-blue-600 hover:bg-[#006BB9] hover:text-white p-1 rounded-lg transition-colors border border-blue-100 group-hover:scale-105"
                          title="Añadir a la lista"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ))}
                    {filteredUsers2.length === 0 && (
                      <div className="p-8 text-center text-xs text-gray-400 italic">No hay más funcionarios.</div>
                    )}
                  </div>
                </div>

                {/* Right: Selected List */}
                <div className="border border-gray-200 rounded-xl flex flex-col overflow-hidden bg-gray-50/50">
                  <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Lista por Asignar ({selected2.length})</span>
                    {selected2.length > 0 && (
                      <button onClick={() => setSelected2([])} className="text-[10px] text-red-500 hover:underline">Limpiar</button>
                    )}
                  </div>
                  <div className="overflow-y-auto flex-1 divide-y divide-gray-100 bg-white">
                    {selected2.map(u => (
                      <div key={u.id} className="p-2.5 flex items-center justify-between bg-blue-50/30">
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-semibold text-blue-900 text-xs truncate">{u.nombre}</div>
                          <div className="text-[10px] text-blue-700 truncate">{u.email}</div>
                        </div>
                        <button 
                          onClick={() => handleRemove2(u)}
                          className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"
                          title="Quitar"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {selected2.length === 0 && (
                      <div className="p-8 text-center text-xs text-gray-400 italic flex items-center justify-center h-full">
                        Haz clic en el botón (+) de la izquierda para reclutar funcionarios.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Submit */}
              <div className="flex justify-end pt-4 border-t">
                <button 
                  onClick={() => {
                    if (selected2.length === 0) {
                      alert('Selecciona al menos un funcionario primero.');
                      return;
                    }
                    alert(`ÉXITO SIMULADO: Asignadas licencias de Adobe Creative Suite a ${selected2.length} funcionarios.`);
                    setSelected2([]);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm flex items-center gap-2 shadow transition-colors"
                >
                  <UserPlus size={16} /> Confirmar Asignación Directa
                </button>
              </div>
            </div>
          )}

          {/* IDEA 3 */}
          {activeTab === 'idea3' && (
            <div className="space-y-6">
              {/* Licencia info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Zoom Pro Meetings Account</h4>
                  <p className="text-xs text-slate-500">Video y audioconferencia ilimitada</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 block uppercase">Disponibles</span>
                  <span className="text-lg font-black text-emerald-600">{totalLicencias3 - selected3.length} / {totalLicencias3}</span>
                </div>
              </div>

              {/* Bulk Filters */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider">Por SubDirección</label>
                  <select 
                    value={filterSub} 
                    onChange={e => { setFilterSub(e.target.value); setSelected3([]); }}
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2 text-xs bg-white"
                  >
                    <option value="">-- Todas las Áreas --</option>
                    <option value="Planificación">Planificación (2 funcionarios)</option>
                    <option value="Administración">Administración (2 funcionarios)</option>
                    <option value="Finanzas">Finanzas (2 funcionarios)</option>
                    <option value="Informática">Informática (2 funcionarios)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider">Por Rol en App</label>
                  <select 
                    value={filterRol} 
                    onChange={e => { setFilterRol(e.target.value); setSelected3([]); }}
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2 text-xs bg-white"
                  >
                    <option value="">-- Todos los Roles --</option>
                    <option value="Funcionario">Funcionario</option>
                    <option value="Administrador">Administrador TI</option>
                  </select>
                </div>
              </div>

              {/* List matching and action */}
              { (filterSub || filterRol) ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-xs font-bold text-slate-800">
                      Coinciden {filteredUsers3.length} funcionario(s)
                    </span>
                    <button 
                      onClick={handleSelectAll3} 
                      className="text-xs bg-[#006BB9] text-white font-semibold px-3 py-1 rounded hover:bg-[#1a3a5f] transition-all"
                    >
                      {filteredUsers3.every(u => selected3.some(s => s.id === u.id)) ? 'Desmarcar Todos' : 'Marcar Todos'}
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-48 overflow-y-auto bg-white">
                    {filteredUsers3.map(u => {
                      const isSelected = selected3.some(s => s.id === u.id);
                      return (
                        <div 
                          key={u.id}
                          onClick={() => toggleSelect3(u)}
                          className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-gray-800 text-xs">{u.nombre}</div>
                            <div className="text-[10px] text-gray-500">{u.email} • {u.subdireccion}</div>
                          </div>
                          <div>
                            {isSelected ? (
                              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-200">
                                <Check size={12} /> Incluido
                              </span>
                            ) : (
                              <span className="text-xs font-semibold bg-gray-50 text-gray-400 px-2 py-0.5 rounded border border-gray-200">
                                Excluido
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center text-xs text-gray-400 italic border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                  Selecciona una SubDirección o Rol en los filtros superiores para cargar y previsualizar los grupos.
                </div>
              )}

              {/* Submit */}
              <div className="flex justify-end pt-4 border-t">
                <button 
                  onClick={() => {
                    if (selected3.length === 0) {
                      alert('Selecciona al menos un funcionario del grupo primero.');
                      return;
                    }
                    alert(`ÉXITO SIMULADO: Se crearon asignaciones masivas para ${selected3.length} cuentas de Zoom Pro.`);
                    setSelected3([]);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm flex items-center gap-2 shadow transition-colors"
                >
                  <UserPlus size={16} /> Confirmar Asignación Grupal ({selected3.length})
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Explicación y Rationale */}
        <div className="bg-slate-950 text-slate-200 rounded-2xl shadow-xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3">
            <Settings size={260} strokeWidth={1} />
          </div>

          <div className="relative z-10 space-y-6">
            <h3 className="text-white font-bold text-lg uppercase tracking-wider border-b border-slate-800 pb-3">Detalle y Concepto</h3>

            {/* TAB-specific info */}
            {activeTab === 'idea1' && (
              <div className="space-y-4">
                <div className="bg-blue-900/40 p-4 rounded-xl border border-blue-800/40 text-blue-200 text-xs leading-relaxed">
                  <strong className="block text-white mb-1">Idea 1: Buscador Multi-select</strong>
                  Permite buscar individualmente a varias personas y marcarlas sin cerrar la lista de resultados, ideal cuando quieres asignar a 3-5 personas que no necesariamente son del mismo departamento.
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Ventajas</h4>
                  <ul className="text-xs space-y-2 text-slate-300 pl-4 list-disc">
                    <li>Fácil de entender e integrar.</li>
                    <li>Ocupa muy poco espacio en pantalla (cabe perfectamente dentro del modal actual sin rediseñarlo).</li>
                    <li>Las etiquetas o chips son muy claras y fáciles de borrar.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'idea2' && (
              <div className="space-y-4">
                <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-900/40 text-emerald-200 text-xs leading-relaxed">
                  <strong className="block text-white mb-1">Idea 2: Lista Cruzada (Doble Columna)</strong>
                  Un panel interactivo que separa el catálogo de funcionarios disponibles de la lista de personas agregadas temporalmente para recibir la licencia.
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Ventajas</h4>
                  <ul className="text-xs space-y-2 text-slate-300 pl-4 list-disc">
                    <li>Muy visual y cómodo cuando vas a armar listas de 5 a 10 personas.</li>
                    <li>Es imposible cometer errores ya que la columna derecha muestra claramente la cola de destinatarios final.</li>
                    <li>Excelente para flujos de trabajo repetitivos.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'idea3' && (
              <div className="space-y-4">
                <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-900/40 text-amber-200 text-xs leading-relaxed">
                  <strong className="block text-white mb-1">Idea 3: Filtro por Grupos (Áreas/Roles)</strong>
                  En lugar de buscar nombre por nombre, esta propuesta permite preseleccionar departamentos enteros (ej: "toda la SubDirección de Planificación").
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Ventajas</h4>
                  <ul className="text-xs space-y-2 text-slate-300 pl-4 list-disc">
                    <li>El método más rápido y eficiente para cargas masivas grupales (ej: 20 licencias de Zoom para Informática).</li>
                    <li>Evita tener que buscar uno a uno en equipos de trabajo grandes.</li>
                    <li>Permite desmarcar excepciones de forma individual dentro de la lista resultante.</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h5 className="font-bold text-xs uppercase tracking-wider text-white mb-1 flex items-center gap-1.5"><Info size={14} className="text-[#006BB9]" /> Comentarios de Base de Datos</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Supabase procesará estas peticiones masivas mediante una transacción única en Postgres, garantizando que el stock de licencias se descuente correctamente y evitando inconsistencias (ej: si se cae la conexión a la mitad, no quedarán asignaciones incompletas).
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 mt-6 flex justify-between items-center text-xs text-slate-400">
            <span>¿Cuál prefieres aplicar?</span>
            <span className="text-[#006BB9] font-bold">SLEP TI v1</span>
          </div>
        </div>

      </div>

    </div>
  );
}
