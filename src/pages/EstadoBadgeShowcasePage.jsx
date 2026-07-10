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
export const TAILWIND_COLORS_DICTIONARY = [
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

// Sub-componente interactivo para cada color de la referencia
function ColorSwatchCard({ colorRef, badgeText, showIcons, copiedIndex, handleCopy, onAddToPalette }) {
  const key = colorRef.key;
  const [activeTab, setActiveTab] = useState('shades'); // 'shades' | 'neon'
  const [selectedShade, setSelectedShade] = useState('50'); // Default shade
  const [selectedOpacity, setSelectedOpacity] = useState('10'); // Default opacity

  // Calcular las clases para los tonos sólido/pastel
  const shadeClasses = useMemo(() => {
    const s = parseInt(selectedShade);
    let bg = `bg-${key}-${selectedShade}`;
    let text = s >= 500 ? 'text-white' : `text-${key}-800`;
    if (s === 400) text = `text-${key}-900`;
    let border = '';
    if (s <= 100) border = `border-${key}-200`;
    else if (s === 200) border = `border-${key}-300`;
    else if (s <= 400) border = `border-${key}-400`;
    else border = `border-${key}-700`;

    return `${bg} ${text} ${border}`;
  }, [key, selectedShade]);

  // Calcular las clases para la opacidad Neón
  const neonClasses = useMemo(() => {
    return `bg-${key}-500/${selectedOpacity} text-${key}-600 border-${key}-500/30`;
  }, [key, selectedOpacity]);

  const activeClasses = activeTab === 'shades' ? shadeClasses : neonClasses;
  const activeLabel = activeTab === 'shades' ? `${key}-${selectedShade}` : `${key}-neon-${selectedOpacity}%`;

  const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
  const opacities = ['10', '20', '30', '40', '50'];

  return (
    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Cabecera del color */}
        <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
          <span className="font-extrabold text-xs text-slate-700">{colorRef.name}</span>
          <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-200/60 px-1.5 py-0.5 rounded">
            {key}
          </span>
        </div>

        {/* Pestañas de Estilo */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
          <button
            onClick={() => setActiveTab('shades')}
            className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
              activeTab === 'shades' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sólido / Pastel
          </button>
          <button
            onClick={() => setActiveTab('neon')}
            className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
              activeTab === 'neon' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Neón / Opacidad
          </button>
        </div>

        {/* selectores interactivos */}
        {activeTab === 'shades' ? (
          <div className="space-y-1.5">
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Seleccionar Tono:</span>
            <div className="flex flex-wrap gap-1">
              {shades.map((s) => {
                const swatchBg = `bg-${key}-${s}`;
                const isSelected = selectedShade === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedShade(s)}
                    className={`w-5.5 h-5.5 rounded-md ${swatchBg} border ${
                      isSelected ? 'ring-2 ring-blue-500 ring-offset-1 scale-110 z-10' : 'border-slate-200/50 hover:scale-105'
                    } transition-all cursor-pointer relative group`}
                    title={`${key}-${s}`}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-[7px] font-extrabold text-white opacity-0 group-hover:opacity-100 bg-black/40 rounded-md">
                      {s}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Seleccionar Opacidad:</span>
            <div className="flex flex-wrap gap-1">
              {opacities.map((op) => {
                const swatchBg = `bg-${key}-500/${op}`;
                const isSelected = selectedOpacity === op;
                return (
                  <button
                    key={op}
                    onClick={() => setSelectedOpacity(op)}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-black border ${swatchBg} text-${key}-800 border-${key}-500/20 ${
                      isSelected ? 'ring-2 ring-blue-500 ring-offset-1 scale-105 border-blue-500' : 'border-slate-200 hover:scale-105'
                    } transition-all cursor-pointer`}
                    title={`${key}-500/${op}`}
                  >
                    {op}%
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Visualización y Copia */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col gap-2.5 mt-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-slate-400 font-bold uppercase">Vista previa:</span>
          <span className="text-[9px] text-slate-400 font-mono font-bold">{activeLabel}</span>
        </div>
        
        <div className="flex justify-center py-2 bg-slate-50 rounded-lg border border-slate-100 min-h-[42px] items-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs transition-all ${activeClasses}`}>
            {showIcons && <Info size={12} className="stroke-[2.5]" />}
            <span>{badgeText || 'Texto'}</span>
          </span>
        </div>

        {/* Botones de acción */}
        <div className="space-y-1.5">
          <button
            onClick={() => handleCopy(activeClasses, `dict-${key}-${activeLabel}`)}
            className="w-full py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            {copiedIndex === `dict-${key}-${activeLabel}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            {copiedIndex === `dict-${key}-${activeLabel}` ? '¡Copiado!' : 'Copiar Clases CSS'}
          </button>
          
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => onAddToPalette('crm', activeClasses, `${colorRef.name} (${activeTab === 'shades' ? selectedShade : selectedOpacity + '%'})`)}
              className="py-1 px-0.5 bg-blue-50 hover:bg-blue-150 text-blue-700 rounded-md text-[8px] font-black border border-blue-200 transition-all flex items-center justify-center gap-0.5 cursor-pointer"
              title="Añadir a la Tabla 1 (CRM Soft)"
            >
              + CRM
            </button>
            <button
              onClick={() => onAddToPalette('neon', activeClasses, `${colorRef.name} (${activeTab === 'shades' ? selectedShade : selectedOpacity + '%'})`)}
              className="py-1 px-0.5 bg-emerald-50 hover:bg-emerald-150 text-emerald-700 rounded-md text-[8px] font-black border border-emerald-250 transition-all flex items-center justify-center gap-0.5 cursor-pointer"
              title="Añadir a la Tabla 2 (Neón)"
            >
              + Neón
            </button>
            <button
              onClick={() => onAddToPalette('solid', activeClasses, `${colorRef.name} (${activeTab === 'shades' ? selectedShade : selectedOpacity + '%'})`)}
              className="py-1 px-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-[8px] font-black border border-slate-300 transition-all flex items-center justify-center gap-0.5 cursor-pointer"
              title="Añadir a la Tabla 3 (Sólida)"
            >
              + Sólido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EstadoBadgeShowcasePage() {
  const [badgeText, setBadgeText] = useState('5 de 10 disp.');
  const [showIcons, setShowIcons] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // Search query state for the color dictionary
  const [searchQuery, setSearchQuery] = useState('');

  // Palettes State
  const [palettes, setPalettes] = useState(INITIAL_PALETTES);
  const [eqClasses, setEqClasses] = useState({
    DISPONIBLE: 'bg-green-300 text-green-800 border-green-600',
    PARA_PRESTAMO: 'bg-indigo-200 text-indigo-600 border-indigo-600',
    EN_PRESTAMO: 'bg-amber-100 text-amber-600 border-amber-600',
    DE_BAJA: 'bg-rose-200 text-red-600 border-red-600',
    ASIGNADO: 'bg-lime-300 text-lime-800 border-lime-600'
  });
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAddCustomColor = (paletteKey, classes, name) => {
    setPalettes(prev => {
      const updatedList = [...prev[paletteKey]];
      updatedList.push({
        name: name || 'Color Personalizado',
        classes: classes,
        iconKey: 'Info',
        isCustom: true
      });
      return { ...prev, [paletteKey]: updatedList };
    });

    // Smooth scroll to the corresponding section
    const element = document.getElementById(`palette-section-${paletteKey}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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

      {/* Dynamic Equipment Badge Sandbox */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-sm font-black text-gray-850 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="text-[#006BB9]" size={18} />
            🎛️ Generador y Editor Dinámico de Código para Badges de Equipos
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Modifica las clases de Tailwind de cada estado a continuación. El código JavaScript generado se actualizará automáticamente a la derecha y los badges de la tabla de simulación reflejarán tus cambios en vivo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Inputs & Previews */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Clases de Estado Personalizables</h3>
            
            {Object.keys(eqClasses).map((stateKey) => {
              const displayLabel = stateKey.replace('_', ' ');
              return (
                <div key={stateKey} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition-colors">
                  <div className="w-full sm:w-32 shrink-0">
                    <span className="text-xs font-bold text-slate-700 block">{displayLabel}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <input 
                      type="text" 
                      value={eqClasses[stateKey]} 
                      onChange={(e) => setEqClasses({ ...eqClasses, [stateKey]: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none transition-shadow"
                      placeholder="Clases de Tailwind CSS..."
                    />
                  </div>
                  
                  <div className="w-32 shrink-0 flex justify-end">
                    <span className={`font-sans px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase border whitespace-nowrap ${eqClasses[stateKey]}`}>
                      {displayLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Generated Code Block */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Code size={14} className="text-blue-600" />
                  Código JavaScript Generado (getBadgeClass)
                </h3>
                
                <button
                  onClick={() => {
                    const code = `function getBadgeClass(estado, isUserBadge = false) {
  const base = "font-sans px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase whitespace-nowrap border";
  if (isUserBadge) return \`\${base} bg-blue-50 text-blue-700 border-blue-200\`;
  
  if (estado === 'DISPONIBLE') return \`\${base} ${eqClasses.DISPONIBLE}\`;
  if (estado === 'PARA PRESTAMO' || estado === 'PARA PRÉSTAMO') return \`\${base} ${eqClasses.PARA_PRESTAMO}\`;
  if (estado === 'EN PRESTAMO' || estado === 'EN PRÉSTAMO') return \`\${base} ${eqClasses.EN_PRESTAMO}\`;
  if (estado === 'BAJA' || estado === 'DE BAJA') return \`\${base} ${eqClasses.DE_BAJA}\`;
  return \`\${base} ${eqClasses.ASIGNADO}\`; // ASIGNADO
}`;
                    navigator.clipboard.writeText(code);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-200"
                >
                  {copiedCode ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  {copiedCode ? '¡Copiado!' : 'Copiar Código'}
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 shadow-inner max-h-[220px]">
{`function getBadgeClass(estado, isUserBadge = false) {
  const base = "font-sans px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase whitespace-nowrap border";
  if (isUserBadge) return \`\${base} bg-blue-50 text-blue-700 border-blue-200\`;

  if (estado === 'DISPONIBLE') return \`\${base} ${eqClasses.DISPONIBLE}\`;
  if (estado === 'PARA PRESTAMO' || estado === 'PARA PRÉSTAMO') return \`\${base} ${eqClasses.PARA_PRESTAMO}\`;
  if (estado === 'EN PRESTAMO' || estado === 'EN PRÉSTAMO') return \`\${base} ${eqClasses.EN_PRESTAMO}\`;
  if (estado === 'BAJA' || estado === 'DE BAJA') return \`\${base} ${eqClasses.DE_BAJA}\`;
  return \`\${base} ${eqClasses.ASIGNADO}\`; // ASIGNADO
}`}
                </pre>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded-xl text-[11px] space-y-1">
              <span className="font-bold flex items-center gap-1">ℹ️ Nota de Integración:</span>
              <p className="text-blue-700 leading-tight">
                Puedes copiar este fragmento de código e instalarlo en la función <code className="font-mono bg-blue-100/50 px-1 rounded text-[#006BB9] font-bold">getBadgeClass</code> del archivo <code className="font-mono bg-blue-100/50 px-1 rounded text-[#006BB9] font-bold">src/pages/DashboardPage.jsx</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Live Table Simulation */}
        <div className="border-t border-gray-150 pt-5 space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Package size={14} className="text-slate-500" />
            Simulación de Tabla en Vivo (Equipos Informáticos)
          </h3>
          
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs text-gray-600 whitespace-nowrap">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Marca</th>
                  <th className="px-4 py-3">Modelo</th>
                  <th className="px-4 py-3">Nº Serie</th>
                  <th className="px-4 py-3 text-center w-32">Estado Simulado</th>
                  <th className="px-4 py-3">Usuario Asignado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 bg-white">
                {[
                  { desc: 'Notebook HP ProBook 445 G8', marca: 'HP', modelo: '445 G8', serial: '5CG2190FF5', estado: 'DISPONIBLE', user: '—' },
                  { desc: 'Notebook Lenovo ThinkPad L14', marca: 'Lenovo', modelo: 'L14', serial: 'PF3A9BZ2', estado: 'ASIGNADO', user: 'Cristian Gutiérrez' },
                  { desc: 'Tablet Samsung Galaxy Active 3', marca: 'Samsung', modelo: 'Tab Active 3', serial: 'R52N20F8A5', estado: 'PARA_PRESTAMO', user: '—', label: 'PARA PRESTAMO' },
                  { desc: 'Proyector Epson Powerlite X41', marca: 'Epson', modelo: 'X41', serial: 'V11H843021', estado: 'EN_PRESTAMO', user: 'María González', label: 'EN PRESTAMO' },
                  { desc: 'PC Dell Optiplex 3080 Desktop', marca: 'Dell', modelo: 'Optiplex 3080', serial: '4F89G12', estado: 'DE_BAJA', user: '—', label: 'DE BAJA' }
                ].map((row, idx) => {
                  const stateClass = eqClasses[row.estado];
                  const displayLabel = row.label || row.estado;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{row.desc}</td>
                      <td className="px-4 py-3">{row.marca}</td>
                      <td className="px-4 py-3">{row.modelo}</td>
                      <td className="px-4 py-3 font-mono">{row.serial}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-sans px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase border whitespace-nowrap ${stateClass}`}>
                          {displayLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">{row.user}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
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
            <div key={paletteKey} id={`palette-section-${paletteKey}`} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
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
          {filteredDictionary.map((colorRef) => (
            <ColorSwatchCard
              key={colorRef.key}
              colorRef={colorRef}
              badgeText={badgeText}
              showIcons={showIcons}
              copiedIndex={copiedIndex}
              handleCopy={handleCopy}
              onAddToPalette={handleAddCustomColor}
            />
          ))}
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
