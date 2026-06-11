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
  BookOpen,
  FileText,
  UserPlus,
  Users,
  Eye
} from 'lucide-react';

const ICONS_MAP = {
  CheckCircle,
  Clock,
  AlertTriangle,
  Info
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

const BADGE_KEYS = [
  { key: 'stockHigh', label: 'Stock Alto (>= 40%)', category: 'Stock Disponible' },
  { key: 'stockMedium', label: 'Stock Medio (>= 20% y < 40%)', category: 'Stock Disponible' },
  { key: 'stockLow', label: 'Stock Bajo (< 20%)', category: 'Stock Disponible' },
  { key: 'asignadas', label: 'Número de Asignadas', category: 'Stock Disponible' },
  { key: 'statusDisponible', label: 'Estado DISPONIBLE', category: 'Estados y Alertas' },
  { key: 'statusAgotado', label: 'Estado AGOTADO', category: 'Estados y Alertas' },
  { key: 'venceLejos', label: 'Vence en > 30 días', category: 'Alertas Vencimiento' },
  { key: 'vencePronto', label: 'Vence en <= 30 días', category: 'Alertas Vencimiento' },
  { key: 'venceHoy', label: 'Vence Hoy (Crítico)', category: 'Alertas Vencimiento' },
  { key: 'venceVencida', label: 'Licencia Vencida', category: 'Alertas Vencimiento' },
  { key: 'respFacturaConFile', label: 'Factura (Con archivo)', category: 'Documentos de Respaldo' },
  { key: 'respFacturaSinFile', label: 'Factura (Sin archivo)', category: 'Documentos de Respaldo' },
  { key: 'respFacturaFaltante', label: 'Sin Factura (Falta)', category: 'Documentos de Respaldo' },
  { key: 'respOcConFile', label: 'OC (Con archivo)', category: 'Documentos de Respaldo' },
  { key: 'respOcSinFile', label: 'OC (Sin archivo)', category: 'Documentos de Respaldo' },
  { key: 'respOcFaltante', label: 'Sin OC (Falta)', category: 'Documentos de Respaldo' }
];

// Swatch card that lets users apply selected color to any of the 10 badges
function ColorSwatchCard({ colorRef, copiedIndex, handleCopy, onApplyToBadge }) {
  const key = colorRef.key;
  const [activeTab, setActiveTab] = useState('shades');
  const [selectedShade, setSelectedShade] = useState('50');
  const [selectedOpacity, setSelectedOpacity] = useState('10');

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

    return `${bg} ${text} ${border} border`;
  }, [key, selectedShade]);

  const neonClasses = useMemo(() => {
    return `bg-${key}-500/${selectedOpacity} text-${key}-600 border-${key}-500/30 border`;
  }, [key, selectedOpacity]);

  const activeClasses = activeTab === 'shades' ? shadeClasses : neonClasses;
  const activeLabel = activeTab === 'shades' ? `${key}-${selectedShade}` : `${key}-neon-${selectedOpacity}%`;

  const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
  const opacities = ['10', '20', '30', '40', '50'];

  return (
    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
          <span className="font-extrabold text-xs text-slate-700">{colorRef.name}</span>
          <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-200/60 px-1.5 py-0.5 rounded">
            {key}
          </span>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('shades')}
            className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
              activeTab === 'shades' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sólido / Pastel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('neon')}
            className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
              activeTab === 'neon' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Neón / Opacidad
          </button>
        </div>

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
                    type="button"
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
                    type="button"
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

      <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2 mt-2 shadow-xs">
        <div className="flex justify-center py-1.5 bg-slate-50 rounded-lg border border-slate-100 min-h-[36px] items-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold shadow-xs transition-all ${activeClasses}`}>
            <span>Vista Previa</span>
          </span>
        </div>

        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => handleCopy(activeClasses, `dict-${key}-${activeLabel}`)}
            className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800 rounded-lg text-[9.5px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
          >
            {copiedIndex === `dict-${key}-${activeLabel}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            {copiedIndex === `dict-${key}-${activeLabel}` ? '¡Copiado!' : 'Copiar Clases CSS'}
          </button>
          
          <div className="space-y-1">
            <label className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wide">Aplicar directamente a:</label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onApplyToBadge(e.target.value, activeClasses);
                  e.target.value = ''; // Reset selection dropdown
                }
              }}
              className="w-full px-2 py-0.5 border border-slate-200 rounded-md text-[9px] bg-slate-50 focus:bg-white outline-none cursor-pointer"
            >
              <option value="">— Seleccionar Badge —</option>
              {BADGE_KEYS.map(b => (
                <option key={b.key} value={b.key}>{b.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

const updateClassString = (currentClasses, type, newValue) => {
  let parts = currentClasses.split(/\s+/).filter(Boolean);
  
  const valuesToRepl = {
    family: ['font-sans', 'font-serif', 'font-mono'],
    size: ['text-[9px]', 'text-[10px]', 'text-[11px]', 'text-xs', 'text-sm', 'text-base'],
    weight: ['font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black'],
    case: ['uppercase', 'lowercase', 'capitalize'],
    rounded: ['rounded-none', 'rounded-xs', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full']
  };
  
  parts = parts.filter(p => !valuesToRepl[type].includes(p));
  
  if (newValue) {
    parts.push(newValue);
  }
  
  return parts.join(' ');
};

const getClassType = (currentClasses, type) => {
  const parts = currentClasses.split(/\s+/);
  const valuesToRepl = {
    family: ['font-sans', 'font-serif', 'font-mono'],
    size: ['text-[9px]', 'text-[10px]', 'text-[11px]', 'text-xs', 'text-sm', 'text-base'],
    weight: ['font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black'],
    case: ['uppercase', 'lowercase', 'capitalize'],
    rounded: ['rounded-none', 'rounded-xs', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full']
  };
  
  const found = parts.find(p => valuesToRepl[type].includes(p));
  return found || '';
};

export default function LicenciasBadgeShowcasePage() {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('disp'); // 'disp', 'func', 'lic'

  // Licenses Badge Custom Classes state
  const [licClasses, setLicClasses] = useState({
    stockHigh: 'bg-green-100 text-green-600 border-green-500 border',
    stockMedium: 'bg-amber-100 text-amber-600 border-amber-600 border',
    stockLow: 'bg-rose-200 text-red-600 border-red-600 border',
    asignadas: 'bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full font-bold text-xs shadow-xs',
    statusDisponible: 'bg-green-300 text-green-800 border border-green-400 px-2 py-0.5 rounded text-[9px] font-semibold uppercase w-full block text-center',
    statusAgotado: 'bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[9px] font-semibold uppercase w-full block text-center',
    venceLejos: 'bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[9px] font-semibold uppercase w-full block text-center',
    vencePronto: 'bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[9px] font-semibold uppercase w-full block text-center',
    venceHoy: 'bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[9px] font-semibold uppercase w-full block text-center',
    venceVencida: 'bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded text-[9px] font-semibold uppercase w-full block text-center',
    respFacturaConFile: 'bg-blue-50 text-[#006BB9] border border-blue-200 px-2 py-0.5 rounded text-[11px] font-bold',
    respFacturaSinFile: 'bg-gray-50 text-gray-500 border border-gray-200 px-2 py-0.5 rounded text-[11px] font-bold',
    respFacturaFaltante: 'bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase',
    respOcConFile: 'bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold',
    respOcSinFile: 'bg-gray-50 text-gray-500 border border-gray-200 px-2 py-0.5 rounded text-[11px] font-bold',
    respOcFaltante: 'bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase'
  });

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApplyToBadge = (badgeKey, classes) => {
    setLicClasses(prev => ({
      ...prev,
      [badgeKey]: classes
    }));
    showToastAlert('Clases Aplicadas', `Se aplicó el diseño al badge "${BADGE_KEYS.find(b => b.key === badgeKey)?.label}".`, 'success');
  };

  const [toastAlert, setToastAlert] = useState(null);
  const showToastAlert = (title, message, type) => {
    setToastAlert({ title, message, type });
    setTimeout(() => setToastAlert(null), 3500);
  };

  const filteredDictionary = useMemo(() => {
    if (!searchQuery) return TAILWIND_COLORS_DICTIONARY;
    const q = searchQuery.toLowerCase();
    return TAILWIND_COLORS_DICTIONARY.filter(
      color => color.name.toLowerCase().includes(q) || color.key.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const groupBadges = useMemo(() => {
    const categories = {};
    BADGE_KEYS.forEach(b => {
      if (!categories[b.category]) categories[b.category] = [];
      categories[b.category].push(b);
    });
    return categories;
  }, []);

  return (
    <div className="p-6 max-w-[1280px] mx-auto space-y-8 pb-20 bg-slate-50 min-h-screen relative">
      
      {/* Toast Alert Flotante */}
      {toastAlert && (
        <div className="fixed bottom-5 right-5 z-55 flex items-start gap-3 bg-slate-900 border border-slate-750 text-white px-4 py-3 rounded-xl shadow-2xl animate-fade-in w-80 text-xs">
          <div className="flex-1">
            <p className="font-extrabold text-[10px] uppercase tracking-wider text-blue-400">{toastAlert.title}</p>
            <p className="mt-1 text-slate-300 font-medium leading-relaxed">{toastAlert.message}</p>
          </div>
          <button onClick={() => setToastAlert(null)} className="text-gray-400 hover:text-white font-bold ml-1 text-base leading-none focus:outline-none">
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2.5">
            <Layers className="text-[#006BB9]" size={28} />
            Showcase de Badges y Colores de Licencias
          </h1>
          <p className="text-sm text-gray-500 max-w-3xl">
            Edita interactivamente los estilos CSS de Tailwind para los 10 badges del panel de Software. Observa los cambios reflejados en vivo en las tres tablas simuladas del módulo.
          </p>
        </div>
        
        <span className="text-xs px-3 py-1.5 rounded-xl bg-[#006BB9] text-white font-bold border border-blue-600 flex items-center gap-1.5 self-start md:self-auto shadow-sm font-mono uppercase tracking-wide">
          Playground Licencias
        </span>
      </div>

      {/* Configuration Panels & Generated Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Inputs (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-6">
          <h2 className="text-xs font-black text-gray-855 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
            <Sliders className="text-[#006BB9]" size={18} />
            Configurador de Estilos de Badges (Tailwind CSS)
          </h2>

          {Object.keys(groupBadges).map((categoryName) => (
            <div key={categoryName} className="space-y-3">
              <h3 className="text-[10px] font-extrabold text-[#25306B] uppercase tracking-wider bg-slate-50 p-2 rounded border border-slate-100">{categoryName}</h3>
              <div className="space-y-3">
                {groupBadges[categoryName].map((b) => (
                  <div key={b.key} className="flex flex-col gap-2.5 p-3.5 bg-slate-50/50 rounded-xl border border-slate-200/60 hover:bg-white hover:shadow-xs transition-all">
                    {/* Fila Superior: Etiqueta y Visualización en vivo */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-extrabold text-slate-800">{b.label}</span>
                      
                      <div className="shrink-0">
                        <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 text-[10.5px] font-bold border transition-all ${licClasses[b.key]}`}>
                          {b.key === 'stockHigh' || b.key === 'stockMedium' || b.key === 'stockLow' ? (
                            <>
                              <CheckCircle size={10} className="stroke-[2.5]" />
                              <span>5 de 10 disp.</span>
                            </>
                          ) : b.key === 'asignadas' ? (
                            <span>14</span>
                          ) : b.key === 'statusDisponible' ? (
                            <span>DISPONIBLE</span>
                          ) : b.key === 'statusAgotado' ? (
                            <span>AGOTADO</span>
                          ) : b.key === 'venceLejos' || b.key === 'vencePronto' ? (
                            <span>Quedan 18 días</span>
                          ) : b.key === 'venceHoy' ? (
                            <span>Vence Hoy</span>
                          ) : b.key === 'venceVencida' ? (
                            <span>Vencida hace 5 días</span>
                          ) : b.key === 'respFacturaConFile' || b.key === 'respFacturaSinFile' ? (
                            <>
                              <FileText size={10} />
                              <span>FACTURA N° 99203</span>
                            </>
                          ) : b.key === 'respFacturaFaltante' ? (
                            <>
                              <AlertTriangle size={10} />
                              <span>Sin Factura</span>
                            </>
                          ) : b.key === 'respOcConFile' || b.key === 'respOcSinFile' ? (
                            <>
                              <FileText size={10} />
                              <span>OC N° CM-102</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={10} />
                              <span>Sin OC</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    {/* Fila Intermedia: Campo de Texto para Clases */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clases de Tailwind CSS</label>
                      <input 
                        type="text" 
                        value={licClasses[b.key]} 
                        onChange={(e) => setLicClasses({ ...licClasses, [b.key]: e.target.value })}
                        className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:ring-1.5 focus:ring-blue-500 focus:outline-none transition-shadow"
                        placeholder="Clases CSS..."
                      />
                    </div>
                    
                    {/* Fila Inferior: Selectores de Fuentes y Bordes */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1.5 border-t border-slate-100">
                      {/* Family */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Fuente</span>
                        <select
                          value={getClassType(licClasses[b.key], 'family')}
                          onChange={(e) => setLicClasses({
                            ...licClasses,
                            [b.key]: updateClassString(licClasses[b.key], 'family', e.target.value)
                          })}
                          className="px-2 py-0.5 border border-slate-200 rounded text-[10px] bg-white text-slate-700 font-bold outline-none cursor-pointer hover:border-slate-350"
                        >
                          <option value="">Defecto</option>
                          <option value="font-sans">Sans</option>
                          <option value="font-serif">Serif</option>
                          <option value="font-mono">Mono</option>
                        </select>
                      </div>

                      {/* Size */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Tamaño</span>
                        <select
                          value={getClassType(licClasses[b.key], 'size')}
                          onChange={(e) => setLicClasses({
                            ...licClasses,
                            [b.key]: updateClassString(licClasses[b.key], 'size', e.target.value)
                          })}
                          className="px-2 py-0.5 border border-slate-200 rounded text-[10px] bg-white text-slate-700 font-bold outline-none cursor-pointer hover:border-slate-350"
                        >
                          <option value="">Defecto</option>
                          <option value="text-[9px]">9px</option>
                          <option value="text-[10px]">10px</option>
                          <option value="text-[11px]">11px</option>
                          <option value="text-xs">12px (xs)</option>
                          <option value="text-sm">14px (sm)</option>
                          <option value="text-base">16px (base)</option>
                        </select>
                      </div>

                      {/* Weight */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Grosor</span>
                        <select
                          value={getClassType(licClasses[b.key], 'weight')}
                          onChange={(e) => setLicClasses({
                            ...licClasses,
                            [b.key]: updateClassString(licClasses[b.key], 'weight', e.target.value)
                          })}
                          className="px-2 py-0.5 border border-slate-200 rounded text-[10px] bg-white text-slate-700 font-bold outline-none cursor-pointer hover:border-slate-350"
                        >
                          <option value="">Defecto</option>
                          <option value="font-normal">Normal</option>
                          <option value="font-medium">Medium</option>
                          <option value="font-semibold">Semibold</option>
                          <option value="font-bold">Bold</option>
                          <option value="font-extrabold">Extrabold</option>
                          <option value="font-black">Black</option>
                        </select>
                      </div>

                      {/* Case */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Caja</span>
                        <select
                          value={getClassType(licClasses[b.key], 'case')}
                          onChange={(e) => setLicClasses({
                            ...licClasses,
                            [b.key]: updateClassString(licClasses[b.key], 'case', e.target.value)
                          })}
                          className="px-2 py-0.5 border border-slate-200 rounded text-[10px] bg-white text-slate-700 font-bold outline-none cursor-pointer hover:border-slate-350"
                        >
                          <option value="">Defecto</option>
                          <option value="uppercase">MAYÚS</option>
                          <option value="lowercase">minús</option>
                          <option value="capitalize">Capital</option>
                        </select>
                      </div>

                      {/* Rounded */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Esquinas</span>
                        <select
                          value={getClassType(licClasses[b.key], 'rounded')}
                          onChange={(e) => setLicClasses({
                            ...licClasses,
                            [b.key]: updateClassString(licClasses[b.key], 'rounded', e.target.value)
                          })}
                          className="px-2 py-0.5 border border-slate-200 rounded text-[10px] bg-white text-slate-700 font-bold outline-none cursor-pointer hover:border-slate-350"
                        >
                          <option value="">Defecto</option>
                          <option value="rounded-none">Recto</option>
                          <option value="rounded-xs">Esquina XS</option>
                          <option value="rounded-sm">Esquina SM</option>
                          <option value="rounded">Esquina MD</option>
                          <option value="rounded-md">Redondo MD</option>
                          <option value="rounded-lg">Redondo LG</option>
                          <option value="rounded-xl">Redondo XL</option>
                          <option value="rounded-full">Píldora</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Code Block (Col 5) */}
        <div className="lg:col-span-5 bg-slate-950 text-slate-200 rounded-2xl shadow-xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Code size={14} className="text-blue-500" />
                Código de Integración
              </h2>
              
              <button
                type="button"
                onClick={() => {
                  const code = `// REEMPLAZAR EN src/pages/LicenciasAdminPage.jsx:

// 1. En la columna "Disponibles" (aprox. línea 878):
if (ratio >= 0.4) {
  badgeColorClass = '${licClasses.stockHigh}';
  IconComponent = CheckCircle;
} else if (ratio >= 0.2) {
  badgeColorClass = '${licClasses.stockMedium}';
  IconComponent = Clock;
} else {
  badgeColorClass = '${licClasses.stockLow}';
  IconComponent = AlertTriangle;
}

// 2. En el badge de cantidad Asignadas (aprox. línea 899):
<span className="${licClasses.asignadas}">{asignadas}</span>

// 3. En el badge de Estado de Stock (aprox. línea 903):
<span className={\`${licClasses.statusDisponible ? licClasses.statusDisponible : ''} \${hasStock ? '${licClasses.statusDisponible}' : '${licClasses.statusAgotado}'}\`}>
  {hasStock ? 'DISPONIBLE' : 'AGOTADO'}
</span>

// 4. En el condicional de Alertas de Vencimiento (aprox. línea 915):
if (diffDays > 0) {
  return <span className={\`border w-full \${diffDays <= 30 ? '${licClasses.vencePronto}' : '${licClasses.venceLejos}'}\`}>Quedan \${diffDays} días</span>;
} else if (diffDays === 0) {
  return <span className="${licClasses.venceHoy}">Vence Hoy</span>;
} else {
  return <span className="${licClasses.venceVencida}">Vencida hace \${Math.abs(diffDays)} días</span>;
}

// 5. En el badge de Facturas (aprox. líneas 842, 848):
// Con archivo / Sin archivo:
className={\`...\${lic.has_factura_file ? '${licClasses.respFacturaConFile}' : '${licClasses.respFacturaSinFile}'}\`}
// Sin Factura:
className={\`...\${'${licClasses.respFacturaFaltante}'}\`}

// 6. En el badge de Orden de Compra (aprox. líneas 857, 863):
// Con archivo / Sin archivo:
className={\`...\${lic.has_oc_file ? '${licClasses.respOcConFile}' : '${licClasses.respOcSinFile}'}\`}
// Sin OC:
className={\`...\${'${licClasses.respOcFaltante}'}\`}`;
                  navigator.clipboard.writeText(code);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                  showToastAlert('Código Copiado', 'El código de reemplazo fue guardado en el portapapeles.', 'success');
                }}
                className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all border border-slate-800 cursor-pointer shadow-sm"
              >
                {copiedCode ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                {copiedCode ? '¡Copiado!' : 'Copiar Código'}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Copia este fragmento y úsalo para reemplazar los estilos CSS correspondientes de las licencias en el código de <code className="font-mono bg-slate-900 px-1 text-blue-400 rounded">src/pages/LicenciasAdminPage.jsx</code>.
            </p>

            <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[9.5px] overflow-x-auto leading-relaxed border border-slate-900 shadow-inner max-h-[360px] custom-scrollbar">
{`// 1. Badge de Stock Disponible (Línea 878)
if (ratio >= 0.4) {
  badgeColorClass = '${licClasses.stockHigh}';
} else if (ratio >= 0.2) {
  badgeColorClass = '${licClasses.stockMedium}';
} else {
  badgeColorClass = '${licClasses.stockLow}';
}

// 2. Badge de Asignadas (Línea 899)
<span className="${licClasses.asignadas}">
  {asignadas}
</span>

// 3. Badge Estado Disponible/Agotado (Línea 903)
<span className={\`\${hasStock ? '${licClasses.statusDisponible}' : '${licClasses.statusAgotado}'}\`}>
  {hasStock ? 'DISPONIBLE' : 'AGOTADO'}
</span>

// 4. Badges de Alertas Vencimiento (Líneas 915-921)
if (diffDays > 0) {
  return <span className={\`\${diffDays <= 30 ? '${licClasses.vencePronto}' : '${licClasses.venceLejos}'}\`}>Quedan {diffDays} días</span>;
} else if (diffDays === 0) {
  return <span className="${licClasses.venceHoy}">Vence Hoy</span>;
} else {
  return <span className="${licClasses.venceVencida}">Vencida hace {Math.abs(diffDays)} días</span>;
}

// 5. Badges de Facturas (Líneas 842, 848)
// Con archivo / Sin archivo:
className={\`... \${lic.has_factura_file ? '${licClasses.respFacturaConFile}' : '${licClasses.respFacturaSinFile}'}\`}
// Faltante:
className={\`... ${licClasses.respFacturaFaltante}\`}

// 6. Badges de Orden de Compra (Líneas 857, 863)
// Con archivo / Sin archivo:
className={\`... \${lic.has_oc_file ? '${licClasses.respOcConFile}' : '${licClasses.respOcSinFile}'}\`}
// Faltante:
className={\`... ${licClasses.respOcFaltante}\`}`}
            </pre>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-[10px] space-y-1 mt-4">
            <span className="font-bold flex items-center gap-1 text-white">⚠️ Atención:</span>
            <p className="text-slate-400 leading-tight">
              Asegúrese de guardar y construir el proyecto tras aplicar las clases en <code className="font-mono bg-slate-950 px-1 text-slate-300 rounded">LicenciasAdminPage.jsx</code> para que los cambios se validen.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Tabs Simulation */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
          <Sparkles size={18} className="text-amber-500" />
          Simulador del Módulo de Licencias en Vivo
        </h3>

        {/* Tab Selection */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl max-w-md no-print-interactive">
          <button 
            type="button"
            onClick={() => setActiveTab('disp')} 
            className={`flex-1 py-2 text-[10.5px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeTab === 'disp' ? 'bg-[#006BB9] text-white shadow-md' : 'text-gray-500 hover:text-gray-850'}`}
          >
            Disponibles
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('func')} 
            className={`flex-1 py-2 text-[10.5px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeTab === 'func' ? 'bg-[#006BB9] text-white shadow-md' : 'text-gray-500 hover:text-gray-850'}`}
          >
            Por funcionario
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('lic')} 
            className={`flex-1 py-2 text-[10.5px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeTab === 'lic' ? 'bg-[#006BB9] text-white shadow-md' : 'text-gray-500 hover:text-gray-850'}`}
          >
            Por licencia
          </button>
        </div>

        {/* TAB 1: DISPONIBLES */}
        {activeTab === 'disp' && (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs text-gray-600 whitespace-nowrap">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3">Software</th>
                  <th className="px-4 py-3 w-48 text-center">Respaldo (Factura, OC)</th>
                  <th className="px-4 py-3 text-center w-24">Total</th>
                  <th className="px-4 py-3 text-center w-36">Disponibles (Stock)</th>
                  <th className="px-4 py-3 text-center w-28">Asignadas</th>
                  <th className="px-4 py-3 text-center w-40">Estado / Vencimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 bg-white">
                {[
                  { name: 'Microsoft 365 Business Premium', total: 100, disp: 45, asig: 55, hasStock: true, days: 120, label: 'stockHigh', fac: '99203', facFile: true, oc: 'CM-102', ocFile: true },
                  { name: 'Adobe Creative Cloud Suite Pro', total: 10, disp: 3, asig: 7, hasStock: true, days: 14, label: 'stockMedium', fac: '99304', facFile: true, oc: 'CM-103', ocFile: false },
                  { name: 'Zoom Professional Account', total: 50, disp: 2, asig: 48, hasStock: true, days: 0, label: 'stockLow', fac: '99405', facFile: false, oc: 'CM-104', ocFile: true },
                  { name: 'Autodesk AutoCAD 2026', total: 5, disp: 0, asig: 5, hasStock: false, days: -10, label: 'stockLow', fac: '', facFile: false, oc: '', ocFile: false }
                ].map((row, idx) => {
                  let stockClass = '';
                  let StockIcon = Clock;
                  if (row.label === 'stockHigh') {
                    stockClass = licClasses.stockHigh;
                    StockIcon = CheckCircle;
                  } else if (row.label === 'stockMedium') {
                    stockClass = licClasses.stockMedium;
                    StockIcon = Clock;
                  } else {
                    stockClass = licClasses.stockLow;
                    StockIcon = AlertTriangle;
                  }

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800 text-sm">{row.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">Versión 2026 • SAAS</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col gap-1.5 items-center justify-center max-w-[170px] mx-auto">
                          <div>
                            {row.fac ? (
                              <span className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border transition-all ${row.facFile ? licClasses.respFacturaConFile : licClasses.respFacturaSinFile}`}>
                                <FileText size={10} /> FACTURA N° {row.fac}
                              </span>
                            ) : (
                              <span className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border transition-all ${licClasses.respFacturaFaltante}`}>
                                <AlertTriangle size={10} /> Sin Factura
                              </span>
                            )}
                          </div>
                          <div>
                            {row.oc ? (
                              <span className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border transition-all ${row.ocFile ? licClasses.respOcConFile : licClasses.respOcSinFile}`}>
                                <FileText size={10} /> OC N° {row.oc}
                              </span>
                            ) : (
                              <span className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border transition-all ${licClasses.respOcFaltante}`}>
                                <AlertTriangle size={10} /> Sin OC
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">{row.total}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border shadow-xs ${stockClass}`}>
                          <StockIcon size={10} className="stroke-[2.5]" />
                          {row.disp} de {row.total} disp.
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={licClasses.asignadas}>{row.asig}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1 max-w-[150px] mx-auto">
                          <span className={row.hasStock ? licClasses.statusDisponible : licClasses.statusAgotado}>
                            {row.hasStock ? 'DISPONIBLE' : 'AGOTADO'}
                          </span>
                          {row.days > 30 && (
                            <span className={licClasses.venceLejos}>Quedan {row.days} días</span>
                          )}
                          {row.days > 0 && row.days <= 30 && (
                            <span className={licClasses.vencePronto}>Quedan {row.days} días</span>
                          )}
                          {row.days === 0 && (
                            <span className={licClasses.venceHoy}>Vence Hoy</span>
                          )}
                          {row.days < 0 && (
                            <span className={licClasses.venceVencida}>Vencida hace {Math.abs(row.days)} días</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: POR FUNCIONARIO */}
        {activeTab === 'func' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 max-w-sm">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black uppercase shadow-xs">
                CG
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-800">Cristian Fernando Gutiérrez</span>
                <span className="text-[10px] text-gray-500">cristian.gutierrez@slep.cl</span>
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs text-gray-600 whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-3">Software</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Fecha Asignación</th>
                    <th className="px-4 py-3">Respaldo (OC / Factura)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 bg-white">
                  {[
                    { sw: 'Microsoft 365 Business Premium', tipo: 'SAAS', date: '2026-05-10', oc: 'CM-101-3829', ocFile: true, fac: '99203', facFile: true },
                    { sw: 'Adobe Creative Cloud Suite Pro', tipo: 'SAAS', date: '2026-06-02', oc: 'CM-908-1120', ocFile: true, fac: '', facFile: false }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{row.sw}</td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-gray-600 font-bold text-[10px] border border-slate-200">
                          {row.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{row.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 items-center">
                          {row.fac ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold border transition-all ${row.facFile ? licClasses.respFacturaConFile : licClasses.respFacturaSinFile}`}>
                              <FileText size={10} /> Factura N° {row.fac}
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border transition-all ${licClasses.respFacturaFaltante}`}>Sin Factura</span>
                          )}
                          
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold border transition-all ${row.ocFile ? licClasses.respOcConFile : licClasses.respOcSinFile}`}>
                            <FileText size={10} /> OC N° {row.oc}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: POR LICENCIA */}
        {activeTab === 'lic' && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-sm flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase">Adobe Creative Cloud Suite Pro</h4>
                <span className="text-[10px] text-gray-500 block mt-0.5">Asignaciones vigentes</span>
              </div>
              <span className={licClasses.asignadas}>7 Asignadas</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs text-gray-600 whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-3">Funcionario</th>
                    <th className="px-4 py-3">Correo Electrónico</th>
                    <th className="px-4 py-3">Fecha Asignación</th>
                    <th className="px-4 py-3 text-center w-24">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 bg-white">
                  {[
                    { name: 'Ana María Silva', email: 'ana.silva@slep.cl', date: '2026-05-15' },
                    { name: 'Roberto Díaz Muñoz', email: 'roberto.diaz@slep.cl', date: '2026-06-01' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                          {row.name.substring(0, 2).toUpperCase()}
                        </span>
                        <span className="font-semibold text-slate-800">{row.name}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{row.email}</td>
                      <td className="px-4 py-3 text-slate-500">{row.date}</td>
                      <td className="px-4 py-3 text-center">
                        <button className="px-2 py-0.5 border border-red-200 hover:border-red-300 text-red-600 bg-white hover:bg-red-50 rounded text-[10px] font-bold">
                          Revocar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Swatches catalog finder */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 gap-4">
          <div className="space-y-1">
            <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" />
              📚 Buscador y Selector de Colores Tailwind
            </h3>
            <p className="text-xs text-gray-400">
              Usa el catálogo interactivo para seleccionar cualquier color, experimentar sus tonos u opacidades, y aplicarlo directamente a cualquiera de las 10 variables de badges de licencias.
            </p>
          </div>

          <div className="relative flex items-center w-full md:w-80 shrink-0">
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filtrar por nombre (ej: emerald, cyan, sky)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDictionary.map((colorRef) => (
            <ColorSwatchCard
              key={colorRef.key}
              colorRef={colorRef}
              copiedIndex={copiedIndex}
              handleCopy={handleCopy}
              onApplyToBadge={handleApplyToBadge}
            />
          ))}
          {filteredDictionary.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-gray-500 font-medium bg-slate-100/50 rounded-xl border border-dashed border-gray-200">
              No se encontraron colores que coincidan con "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Footer bar */}
      <div className="bg-[#006BB9] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={20} className="text-amber-300" />
            Playground y Copiado para Licencias
          </h4>
          <p className="text-xs text-blue-100 max-w-2xl">
            Ajusta los valores interactivos superiores, previsualiza y copia el fragmento final de código para instalarlo directamente.
          </p>
        </div>
        <div className="text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 font-bold self-start md:self-auto font-mono">
          Inventario TI Los Copihues
        </div>
      </div>

    </div>
  );
}
