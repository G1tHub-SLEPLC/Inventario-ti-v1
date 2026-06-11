import React, { useState, useMemo } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Info, 
  Layers, 
  Sliders, 
  Code,
  Copy,
  Check,
  Package,
  Plus,
  Trash2,
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react';

const ICONS_MAP = {
  CheckCircle: CheckCircle,
  Clock: Clock,
  AlertTriangle: AlertTriangle,
  Info: Info,
  Package: Package
};

const INITIAL_PALETTES = {
  crm: [
    { name: 'Emerald (Verde)', classes: 'bg-emerald-50 text-emerald-800 border-emerald-200', iconKey: 'CheckCircle' },
    { name: 'Amber (Amarillo)', classes: 'bg-amber-50 text-amber-800 border-amber-200', iconKey: 'Clock' },
    { name: 'Rose (Rojo/Coral)', classes: 'bg-rose-50 text-rose-800 border-rose-200', iconKey: 'AlertTriangle' },
    { name: 'Blue (Azul)', classes: 'bg-blue-50 text-blue-800 border-blue-200', iconKey: 'Info' },
    { name: 'Orange (Naranja)', classes: 'bg-orange-50 text-orange-800 border-orange-200', iconKey: 'Clock' },
    { name: 'Purple (Púrpura)', classes: 'bg-purple-50 text-purple-800 border-purple-200', iconKey: 'Info' },
    { name: 'Indigo (Índigo)', classes: 'bg-indigo-50 text-indigo-800 border-indigo-200', iconKey: 'Info' },
    { name: 'Cyan (Cian)', classes: 'bg-cyan-50 text-cyan-800 border-cyan-200', iconKey: 'Info' },
    { name: 'Slate (Gris)', classes: 'bg-slate-50 text-slate-800 border-slate-200', iconKey: 'Info' }
  ],
  neon: [
    { name: 'Emerald (Verde)', classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30', iconKey: 'CheckCircle' },
    { name: 'Amber (Amarillo)', classes: 'bg-amber-500/10 text-amber-600 border-amber-500/30', iconKey: 'Clock' },
    { name: 'Rose (Rojo/Coral)', classes: 'bg-red-500/10 text-red-600 border-red-500/30', iconKey: 'AlertTriangle' },
    { name: 'Blue (Azul)', classes: 'bg-blue-500/10 text-blue-600 border-blue-500/30', iconKey: 'Info' },
    { name: 'Orange (Naranja)', classes: 'bg-orange-500/10 text-orange-600 border-orange-500/30', iconKey: 'Clock' },
    { name: 'Purple (Púrpura)', classes: 'bg-purple-500/10 text-purple-600 border-purple-500/30', iconKey: 'Info' },
    { name: 'Indigo (Índigo)', classes: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30', iconKey: 'Info' },
    { name: 'Cyan (Cian)', classes: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30', iconKey: 'Info' },
    { name: 'Slate (Gris)', classes: 'bg-slate-500/10 text-slate-500 border-slate-500/30', iconKey: 'Info' }
  ],
  solid: [
    { name: 'Emerald (Verde)', classes: 'bg-emerald-600 text-white border-emerald-700 shadow-xs', iconKey: 'CheckCircle' },
    { name: 'Amber (Amarillo)', classes: 'bg-amber-500 text-white border-amber-600 shadow-xs', iconKey: 'Clock' },
    { name: 'Rose (Rojo/Coral)', classes: 'bg-rose-600 text-white border-rose-700 shadow-xs', iconKey: 'AlertTriangle' },
    { name: 'Blue (Azul)', classes: 'bg-blue-600 text-white border-blue-700 shadow-xs', iconKey: 'Info' },
    { name: 'Orange (Naranja)', classes: 'bg-orange-500 text-white border-orange-600 shadow-xs', iconKey: 'Clock' },
    { name: 'Purple (Púrpura)', classes: 'bg-purple-600 text-white border-purple-700 shadow-xs', iconKey: 'Info' },
    { name: 'Indigo (Índigo)', classes: 'bg-indigo-600 text-white border-indigo-700 shadow-xs', iconKey: 'Info' },
    { name: 'Cyan (Cian)', classes: 'bg-cyan-600 text-white border-cyan-700 shadow-xs', iconKey: 'Info' },
    { name: 'Slate (Gris)', classes: 'bg-slate-600 text-white border-slate-700 shadow-xs', iconKey: 'Info' }
  ]
};

const PALETTE_DESCS = {
  crm: {
    title: '1. Paleta CRM (Fondo Suave + Borde Fino)',
    desc: 'El diseño actual del sistema. Colores pastel semitransparentes con bordes definidos que evitan la saturación visual.'
  },
  neon: {
    title: '2. Paleta Neón / Dark Accent (10% Opacidad)',
    desc: 'Un aspecto más tecnológico y brillante. Utiliza colores de marca puros con baja opacidad de fondo.'
  },
  solid: {
    title: '3. Paleta Sólida / Fuerte (Color Completo)',
    desc: 'Colores enteros de alta densidad para alertar de forma contundente en dashboards de supervisión.'
  }
};

// Complete Tailwind Color Reference Dictionary
const TAILWIND_COLORS_DICTIONARY = [
  { name: 'Red (Rojo)', key: 'red' },
  { name: 'Orange (Naranja)', key: 'orange' },
  { name: 'Amber (Ámbar)', key: 'amber' },
  { name: 'Yellow (Amarillo)', key: 'yellow' },
  { name: 'Lime (Lima)', key: 'lime' },
  { name: 'Green (Verde)', key: 'green' },
  { name: 'Emerald (Esmeralda)', key: 'emerald' },
  { name: 'Teal (Teal / Cerceta)', key: 'teal' },
  { name: 'Cyan (Cian)', key: 'cyan' },
  { name: 'Sky (Sky / Cielo)', key: 'sky' },
  { name: 'Blue (Azul)', key: 'blue' },
  { name: 'Indigo (Índigo)', key: 'indigo' },
  { name: 'Violet (Violeta)', key: 'violet' },
  { name: 'Purple (Púrpura)', key: 'purple' },
  { name: 'Fuchsia (Fucsia)', key: 'fuchsia' },
  { name: 'Pink (Rosa)', key: 'pink' },
  { name: 'Rose (Rosa Coral)', key: 'rose' },
  { name: 'Slate (Pizarra)', key: 'slate' },
  { name: 'Gray (Gris)', key: 'gray' },
  { name: 'Zinc (Zinc)', key: 'zinc' },
  { name: 'Neutral (Neutral)', key: 'neutral' },
  { name: 'Stone (Piedra)', key: 'stone' }
];

export default function EstadoBadgeShowcasePage() {
  const [badgeText, setBadgeText] = useState('5 de 10 disp.');
  const [showIcons, setShowIcons] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // Search query state for the color dictionary
  const [searchQuery, setSearchQuery] = useState('');

  // Palettes State
  const [palettes, setPalettes] = useState(INITIAL_PALETTES);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClassChange = (paletteKey, index, newClasses) => {
    setPalettes(prev => {
      const updatedList = [...prev[paletteKey]];
      updatedList[index] = { ...updatedList[index], classes: newClasses };
      return { ...prev, [paletteKey]: updatedList };
    });
  };

  const handleNameChange = (paletteKey, index, newName) => {
    setPalettes(prev => {
      const updatedList = [...prev[paletteKey]];
      updatedList[index] = { ...updatedList[index], name: newName };
      return { ...prev, [paletteKey]: updatedList };
    });
  };

  const handleIconChange = (paletteKey, index, newIconKey) => {
    setPalettes(prev => {
      const updatedList = [...prev[paletteKey]];
      updatedList[index] = { ...updatedList[index], iconKey: newIconKey };
      return { ...prev, [paletteKey]: updatedList };
    });
  };

  const handleAddColor = (paletteKey) => {
    setPalettes(prev => {
      const updatedList = [...prev[paletteKey]];
      updatedList.push({
        name: 'Personalizado',
        classes: 'bg-blue-50 text-blue-700 border-blue-200',
        iconKey: 'Info',
        isCustom: true
      });
      return { ...prev, [paletteKey]: updatedList };
    });
  };

  const handleRemoveColor = (paletteKey, index) => {
    setPalettes(prev => {
      const updatedList = prev[paletteKey].filter((_, i) => i !== index);
      return { ...prev, [paletteKey]: updatedList };
    });
  };

  // Filter dictionary based on search query
  const filteredDictionary = useMemo(() => {
    if (!searchQuery) return TAILWIND_COLORS_DICTIONARY;
    const q = searchQuery.toLowerCase();
    return TAILWIND_COLORS_DICTIONARY.filter(
      color => color.name.toLowerCase().includes(q) || color.key.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="p-6 max-w-[1280px] mx-auto space-y-8 pb-20 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2.5">
            <Layers className="text-[#006BB9]" size={28} />
            Showcase de Paletas y Estilos de Badges
          </h1>
          <p className="text-sm text-gray-500 max-w-3xl">
            Prueba y modifica cómo se ven los textos de estado editando las clases de Tailwind CSS en cada fila de forma directa, o agrega tus propios colores de prueba.
          </p>
        </div>
        
        <span className="text-xs px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-100 flex items-center gap-1.5 self-start md:self-auto shadow-sm font-mono">
          Visualizador Dinámico
        </span>
      </div>

      {/* Control panel */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
          <Sliders size={18} className="text-gray-500" />
          Panel de Configuración de Muestra
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Texto del Badge</label>
            <input 
              type="text" 
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="Escribe un texto (ej: 5 de 10 disp., Quedan 15 días)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm font-medium"
            />
          </div>

          <div className="flex items-center h-11">
            <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold text-gray-600 uppercase tracking-wider">
              <input 
                type="checkbox"
                checked={showIcons}
                onChange={() => setShowIcons(!showIcons)}
                className="w-4.5 h-4.5 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              Mostrar Íconos Ilustrativos
            </label>
          </div>
        </div>
      </div>

      {/* Showcase Grid */}
      <div className="space-y-8">
        {Object.keys(palettes).map((paletteKey) => {
          const paletteInfo = PALETTE_DESCS[paletteKey];
          const colorsList = palettes[paletteKey];

          return (
            <div key={paletteKey} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 gap-4">
                <div>
                  <h3 className="font-black text-gray-800 text-md uppercase tracking-wider">
                    {paletteInfo.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{paletteInfo.desc}</p>
                </div>
                
                <button
                  onClick={() => handleAddColor(paletteKey)}
                  className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-[#006BB9] border border-blue-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
                >
                  <Plus size={14} /> Agregar Color
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-4 py-3 w-48">Etiqueta / Color</th>
                      <th className="px-4 py-3 text-center w-52">Visualización en vivo</th>
                      <th className="px-4 py-3">Clases CSS de Tailwind (Editable)</th>
                      <th className="px-4 py-3 text-center w-32">Ícono</th>
                      <th className="px-4 py-3 text-center w-24">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 bg-white">
                    {colorsList.map((color, idx) => {
                      const uniqueId = `${paletteKey}-${idx}`;
                      const IconComponent = ICONS_MAP[color.iconKey] || Info;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          
                          {/* 1. Name edit input */}
                          <td className="px-4 py-3.5">
                            <input 
                              type="text" 
                              value={color.name}
                              onChange={(e) => handleNameChange(paletteKey, idx, e.target.value)}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:bg-white focus:outline-none"
                            />
                          </td>

                          {/* 2. live preview */}
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${color.classes}`}>
                              {showIcons && <IconComponent size={12} className="stroke-[2.5]" />}
                              <span>{badgeText || 'Texto vacío'}</span>
                            </span>
                          </td>

                          {/* 3. editable classes input */}
                          <td className="px-4 py-3.5">
                            <input 
                              type="text" 
                              value={color.classes}
                              onChange={(e) => handleClassChange(paletteKey, idx, e.target.value)}
                              placeholder="Ej: bg-blue-50 text-blue-800 border-blue-200"
                              className="w-full px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                            />
                          </td>

                          {/* 4. Icon picker */}
                          <td className="px-4 py-3.5 text-center">
                            <select
                              value={color.iconKey}
                              onChange={(e) => handleIconChange(paletteKey, idx, e.target.value)}
                              className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-slate-50 outline-none focus:bg-white"
                            >
                              <option value="CheckCircle">✓ Éxito</option>
                              <option value="Clock">⏰ Tiempo</option>
                              <option value="AlertTriangle">⚠ Alerta</option>
                              <option value="Info">ℹ Info</option>
                              <option value="Package">📦 Caja</option>
                            </select>
                          </td>

                          {/* 5. actions */}
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleCopy(color.classes, uniqueId)}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  copiedIndex === uniqueId 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                                    : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300'
                                }`}
                                title="Copiar Clases"
                              >
                                {copiedIndex === uniqueId ? <Check size={13} /> : <Copy size={13} />}
                              </button>

                              <button
                                onClick={() => handleRemoveColor(paletteKey, idx)}
                                className="p-1.5 rounded-lg border bg-white border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 transition-all"
                                title="Eliminar Fila"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW: Dictionary & Search Engine for Tailwind Colors */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 gap-4">
          <div className="space-y-1">
            <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" />
              📚 Buscador y Referencia de Colores Tailwind
            </h3>
            <p className="text-xs text-gray-400">
              Encuentra los nombres exactos y combinaciones para probar nuevos colores. Haz clic en las etiquetas para copiar sus clases.
            </p>
          </div>

          {/* Search box */}
          <div className="relative flex items-center w-full md:w-80 shrink-0">
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar color (ej: lime, blue, rose)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm font-medium"
            />
          </div>
        </div>

        {/* Dictionary Swatches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDictionary.map((colorRef) => {
            const key = colorRef.key;
            // Class string presets
            const softClasses = `bg-${key}-50 text-${key}-800 border-${key}-200`;
            const neonClasses = `bg-${key}-500/10 text-${key}-600 border-${key}-500/30`;
            const solidClasses = `bg-${key}-600 text-white border-${key}-700 shadow-sm`;

            return (
              <div key={key} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                  <span className="font-extrabold text-xs text-slate-700">{colorRef.name}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-200/60 px-1.5 py-0.5 rounded">
                    {key}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Soft Presets */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">CRM Soft</span>
                    <button 
                      onClick={() => handleCopy(softClasses, `dict-${key}-soft`)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${softClasses} hover:scale-105 active:scale-95`}
                      title="Haz clic para copiar clases"
                    >
                      {copiedIndex === `dict-${key}-soft` ? <Check size={9} /> : <Copy size={9} />}
                      {key}-soft
                    </button>
                  </div>

                  {/* Neon Presets */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Neón Accent</span>
                    <button 
                      onClick={() => handleCopy(neonClasses, `dict-${key}-neon`)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${neonClasses} hover:scale-105 active:scale-95`}
                      title="Haz clic para copiar clases"
                    >
                      {copiedIndex === `dict-${key}-neon` ? <Check size={9} /> : <Copy size={9} />}
                      {key}-neon
                    </button>
                  </div>

                  {/* Solid Presets */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Sólida</span>
                    <button 
                      onClick={() => handleCopy(solidClasses, `dict-${key}-solid`)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${solidClasses} hover:scale-105 active:scale-95`}
                      title="Haz clic para copiar clases"
                    >
                      {copiedIndex === `dict-${key}-solid` ? <Check size={9} /> : <Copy size={9} />}
                      {key}-solid
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredDictionary.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-gray-500 font-medium bg-slate-100/50 rounded-xl border border-dashed border-gray-200">
              No se encontraron colores que coincidan con "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-[#006BB9] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={20} className="text-amber-300" />
            Zona de Pruebas de Desarrollo Abierta
          </h4>
          <p className="text-xs text-blue-100 max-w-2xl">
            Modifica cualquier fila y copia instantáneamente las clases de Tailwind configuradas. Las combinaciones personalizadas se mantendrán vigentes mientras no recargues la página.
          </p>
        </div>
        <div className="text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 font-bold self-start md:self-auto font-mono">
          Inventario TI Los Copihues
        </div>
      </div>

    </div>
  );
}
