import React, { useState, useMemo } from 'react';
import { Copy, Check, CheckCircle, Layout, AlertCircle, Laptop, Package, Key, FileText, Users, ShieldAlert, X, Clock, AlertTriangle, Info } from 'lucide-react';
import { TAILWIND_COLORS_DICTIONARY } from '../pages/EstadoBadgeShowcasePage';

const LUCIDE_ICONS = {
  Check: Check,
  CheckCircle: CheckCircle,
  Package: Package,
  AlertCircle: AlertCircle,
  Laptop: Laptop,
  X: X,
  Key: Key,
  Users: Users,
  ShieldAlert: ShieldAlert,
  FileText: FileText,
  Clock: Clock,
  AlertTriangle: AlertTriangle,
  Info: Info,
  None: null
};

// Estilos iniciales extraídos de toda la aplicación
const INITIAL_BADGES = {
  equipos: [
    { id: 'eq_disp', label: 'DISPONIBLE', bg: 'bg-green-200', text: 'text-green-800', border: 'border-green-600', uppercase: true, iconName: 'Check' },
    { id: 'eq_para', label: 'PARA PRESTAMO', bg: 'bg-indigo-200', text: 'text-indigo-800', border: 'border-indigo-600', uppercase: true, iconName: 'Package' },
    { id: 'eq_en', label: 'EN PRESTAMO', bg: 'bg-amber-200', text: 'text-amber-800', border: 'border-amber-600', uppercase: true, iconName: 'AlertCircle' },
    { id: 'eq_asig', label: 'ASIGNADO', bg: 'bg-lime-200', text: 'text-lime-800', border: 'border-lime-600', uppercase: true, iconName: 'Laptop' },
    { id: 'eq_baja', label: 'DE BAJA', bg: 'bg-rose-200', text: 'text-red-800', border: 'border-red-600', uppercase: true, iconName: 'X' }
  ],
  insumos: [
    { id: 'ins_alto', label: 'Stock > 5', bg: 'bg-green-200', text: 'text-green-800', border: 'border-green-600', uppercase: true, iconName: 'None' },
    { id: 'ins_bajo', label: 'Stock > 0', bg: 'bg-amber-200', text: 'text-amber-800', border: 'border-amber-600', uppercase: true, iconName: 'None' },
    { id: 'ins_agot', label: 'Agotado (0)', bg: 'bg-red-200', text: 'text-red-800', border: 'border-red-600', uppercase: true, iconName: 'None' }
  ],
  licencias: [
    { id: 'lic_act', label: 'ACTIVA', bg: 'bg-green-200', text: 'text-green-800', border: 'border-green-600', uppercase: true, iconName: 'Check' },
    { id: 'lic_susp', label: 'SUSPENDIDA', bg: 'bg-rose-200', text: 'text-rose-800', border: 'border-rose-600', uppercase: true, iconName: 'AlertCircle' },
    { id: 'lic_pct_alto', label: '% Restante > 40%', bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-800', uppercase: true, font: 'font-sans', weight: 'font-medium', iconName: 'None' },
    { id: 'lic_pct_med', label: '% Restante 20-40%', bg: 'bg-amber-600', text: 'text-white', border: 'border-amber-800', uppercase: true, font: 'font-sans', weight: 'font-medium', iconName: 'None' },
    { id: 'lic_pct_bajo', label: '% Restante < 20%', bg: 'bg-red-600', text: 'text-white', border: 'border-red-800', uppercase: true, font: 'font-sans', weight: 'font-medium', iconName: 'None' },
    { id: 'lic_s_alto', label: 'Disp > 5', bg: 'bg-green-200', text: 'text-green-800', border: 'border-green-600', uppercase: true, iconName: 'None' },
    { id: 'lic_s_bajo', label: 'Disp < 5', bg: 'bg-amber-200', text: 'text-amber-800', border: 'border-amber-600', uppercase: true, iconName: 'None' },
    { id: 'lic_s_cero', label: 'Sin Stock', bg: 'bg-red-200', text: 'text-red-800', border: 'border-red-600', uppercase: true, iconName: 'X' }
  ],
  solicitudes: [
    { id: 'sol_pend', label: 'Pendiente', bg: 'bg-amber-200', text: 'text-amber-800', border: 'border-amber-600', uppercase: true, iconName: 'Clock' },
    { id: 'sol_apr', label: 'Aprobado', bg: 'bg-green-200', text: 'text-green-800', border: 'border-green-600', uppercase: true, iconName: 'Check' },
    { id: 'sol_rech', label: 'Rechazado', bg: 'bg-rose-200', text: 'text-red-600', border: 'border-red-600', uppercase: true, iconName: 'X' },
    { id: 'sol_dev', label: 'Devuelto', bg: 'bg-blue-200', text: 'text-blue-600', border: 'border-blue-600', uppercase: true, iconName: 'Check' },
    { id: 'sol_dev_a', label: 'Dev. Atraso', bg: 'bg-orange-200', text: 'text-orange-800', border: 'border-orange-600', uppercase: true, iconName: 'AlertTriangle' },
    { id: 'sol_baja', label: 'Baja', bg: 'bg-pink-200', text: 'text-pink-800', border: 'border-pink-600', uppercase: true, iconName: 'AlertCircle' }
  ],
  usuarios: [
    { id: 'usr_adm', label: 'Admin TI', bg: 'bg-purple-200', text: 'text-purple-800', border: 'border-purple-600', uppercase: true, iconName: 'Key' },
    { id: 'usr_std', label: 'Usuario', bg: 'bg-blue-200', text: 'text-blue-800', border: 'border-blue-600', uppercase: true, iconName: 'Users' }
  ],
  auditoria: [
    { id: 'aud_cre', label: 'CREATE', bg: 'bg-green-200', text: 'text-green-800', border: 'border-green-600', uppercase: true, iconName: 'None' },
    { id: 'aud_upd', label: 'UPDATE', bg: 'bg-blue-200', text: 'text-blue-800', border: 'border-blue-600', uppercase: true, iconName: 'None' },
    { id: 'aud_del', label: 'DELETE', bg: 'bg-rose-200', text: 'text-rose-800', border: 'border-rose-600', uppercase: true, iconName: 'None' }
  ],
  inicio: [
    { id: 'ini_ok', label: 'OK (Status)', bg: 'bg-emerald-200', text: 'text-emerald-800', border: 'border-emerald-600', uppercase: true, iconName: 'Check' },
    { id: 'ini_warn', label: 'Warning', bg: 'bg-amber-200', text: 'text-amber-800', border: 'border-amber-600', uppercase: true, iconName: 'AlertTriangle' },
    { id: 'ini_err', label: 'Error', bg: 'bg-rose-200', text: 'text-rose-800', border: 'border-rose-600', uppercase: true, iconName: 'AlertCircle' }
  ],
  nombres: [
    { id: 'nom_default', label: 'Funcionario', bg: 'bg-blue-200', text: 'text-blue-800', border: 'border-blue-600', uppercase: false, iconName: 'Users' }
  ],
  cumplimiento: [
    { id: 'cump_opt', label: 'Óptimo', bg: 'bg-emerald-200', text: 'text-emerald-800', border: 'border-emerald-600', uppercase: true, iconName: 'CheckCircle' },
    { id: 'cump_atr', label: 'Atrasos', bg: 'bg-red-200', text: 'text-red-800', border: 'border-red-600', uppercase: true, iconName: 'AlertTriangle' }
  ]
};

const CATEGORIES = [
  { id: 'equipos', label: 'Equipos', icon: Laptop },
  { id: 'insumos', label: 'Insumos', icon: Package },
  { id: 'licencias', label: 'Licencias', icon: Key },
  { id: 'solicitudes', label: 'Solicitudes', icon: FileText },
  { id: 'usuarios', label: 'Usuarios (Rol)', icon: Users },
  { id: 'nombres', label: 'Nombres', icon: Users },
  { id: 'cumplimiento', label: 'Cumplimiento', icon: CheckCircle },
  { id: 'auditoria', label: 'Auditoría', icon: ShieldAlert },
  { id: 'inicio', label: 'Inicio', icon: Layout },
];

const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
// Add transparent/white/black for completeness
const COLORS = [{ name: 'White', key: 'white' }, { name: 'Black', key: 'black' }, ...TAILWIND_COLORS_DICTIONARY];

export default function GlobalBadgeCustomizerPage() {
  const [activeCategory, setActiveCategory] = useState('equipos');
  const [badges, setBadges] = useState(INITIAL_BADGES);
  const [copied, setCopied] = useState(false);

  const handleUpdateClass = (badgeId, type, colorKey, shade) => {
    setBadges(prev => {
      const newBadges = { ...prev };
      const category = newBadges[activeCategory];
      const badgeIndex = category.findIndex(b => b.id === badgeId);
      if (badgeIndex === -1) return prev;

      let newClass = '';
      if (colorKey === 'white' || colorKey === 'black') {
         newClass = type === 'bg' ? `bg-${colorKey}` : type === 'text' ? `text-${colorKey}` : `border-${colorKey}`;
      } else {
         newClass = type === 'bg' ? `bg-${colorKey}-${shade}` : type === 'text' ? `text-${colorKey}-${shade}` : `border-${colorKey}-${shade}`;
      }

      category[badgeIndex] = { ...category[badgeIndex], [type]: newClass };
      return newBadges;
    });
  };

  const handleUpdateIcon = (badgeId, iconName) => {
    setBadges(prev => {
      const newBadges = { ...prev };
      const category = newBadges[activeCategory];
      const badgeIndex = category.findIndex(b => b.id === badgeId);
      if (badgeIndex === -1) return prev;
      category[badgeIndex] = { ...category[badgeIndex], iconName: iconName };
      return newBadges;
    });
  };

  const handleUpdateProperty = (badgeId, property, value) => {
    setBadges(prev => {
      const newBadges = { ...prev };
      const category = newBadges[activeCategory];
      const badgeIndex = category.findIndex(b => b.id === badgeId);
      if (badgeIndex === -1) return prev;
      category[badgeIndex] = { ...category[badgeIndex], [property]: value };
      return newBadges;
    });
  };

  const handleCopyConfig = () => {
    const configString = JSON.stringify(badges, null, 2);
    navigator.clipboard.writeText(configString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderColorPicker = (badgeId, type, currentClass) => {
    // Parse current class (e.g. bg-green-300 -> type=bg, color=green, shade=300)
    const parts = currentClass.split('-');
    let currentColor = parts[1] || 'gray';
    let currentShade = parts[2] || '500';
    if (currentClass.includes('white') || currentClass.includes('black')) {
       currentColor = currentClass.replace(type + '-', '');
       currentShade = '';
    }

    return (
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs font-bold text-gray-500 w-16 uppercase">{type}:</span>
        <select 
          className="text-xs p-1 border rounded bg-white"
          value={currentColor}
          onChange={(e) => handleUpdateClass(badgeId, type, e.target.value, currentShade)}
        >
          {COLORS.map(c => <option key={c.key} value={c.key}>{c.name}</option>)}
        </select>
        {currentColor !== 'white' && currentColor !== 'black' && (
          <select 
            className="text-xs p-1 border rounded bg-white"
            value={currentShade}
            onChange={(e) => handleUpdateClass(badgeId, type, currentColor, e.target.value)}
          >
            {SHADES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>
    );
  };

  const renderIconPicker = (badgeId, currentIcon) => {
    return (
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs font-bold text-gray-500 w-16 uppercase">Icon:</span>
        <select
          className="text-xs p-1 border rounded bg-white flex-1"
          value={currentIcon || 'None'}
          onChange={(e) => handleUpdateIcon(badgeId, e.target.value)}
        >
          {Object.keys(LUCIDE_ICONS).map(iconName => (
            <option key={iconName} value={iconName}>{iconName}</option>
          ))}
        </select>
      </div>
    );
  };

  const renderFontControls = (badge) => {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
        <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Tipografía:</span>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 w-16">Fuente:</span>
          <select
            className="text-xs p-1 border rounded bg-white flex-1"
            value={badge.font || 'font-sans'}
            onChange={(e) => handleUpdateProperty(badge.id, 'font', e.target.value)}
          >
            <option value="font-sans">Sans (Inter)</option>
            <option value="font-serif">Serif (Merriweather)</option>
            <option value="font-mono">Mono (Fira Code)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 w-16">Grosor:</span>
          <select
            className="text-xs p-1 border rounded bg-white flex-1"
            value={badge.weight || 'font-bold'}
            onChange={(e) => handleUpdateProperty(badge.id, 'weight', e.target.value)}
          >
            <option value="font-normal">Normal</option>
            <option value="font-medium">Medium</option>
            <option value="font-semibold">SemiBold</option>
            <option value="font-bold">Bold</option>
            <option value="font-extrabold">ExtraBold</option>
            <option value="font-black">Black</option>
          </select>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input 
              type="checkbox" 
              checked={badge.italic || false}
              onChange={(e) => handleUpdateProperty(badge.id, 'italic', e.target.checked)}
              className="rounded text-blue-600 w-3 h-3"
            />
            <span className="text-xs font-medium text-gray-600">Cursiva</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input 
              type="checkbox" 
              checked={badge.uppercase !== false}
              onChange={(e) => handleUpdateProperty(badge.id, 'uppercase', e.target.checked)}
              className="rounded text-blue-600 w-3 h-3"
            />
            <span className="text-xs font-medium text-gray-600">Mayúsculas</span>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#112A46]">Showroom de Badges (Customizer)</h1>
          <p className="text-sm text-gray-500 mt-1">Personaliza el diseño de los badges en cada sección del sistema.</p>
        </div>
        <button
          onClick={handleCopyConfig}
          className="flex items-center gap-2 bg-[#006BB9] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#1A3A5F] transition-colors shadow"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? '¡Copiado!' : 'Copiar Configuración'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar Categorías */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-gray-200 p-4 space-y-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                  isActive 
                    ? 'bg-[#006BB9] text-white shadow-md' 
                    : 'text-gray-600 hover:bg-slate-200'
                }`}
              >
                <Icon size={18} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 p-8 bg-white">
          <div className="mb-6 border-b pb-4">
             <h2 className="text-xl font-bold text-gray-800">
               Categoría: {CATEGORIES.find(c => c.id === activeCategory)?.label}
             </h2>
             <p className="text-sm text-gray-500 mt-1">Modifica los colores de cada estado. Los cambios se verán en tiempo real en la previsualización.</p>
          </div>

          <div className="space-y-6">
            {badges[activeCategory].map(badge => {
              const IconComponent = LUCIDE_ICONS[badge.iconName || 'None'];
              
              return (
              <div key={badge.id} className="flex flex-col lg:flex-row gap-6 p-5 border border-gray-100 rounded-xl bg-slate-50 hover:border-blue-200 transition-colors shadow-sm">
                
                {/* Visual Preview */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[120px] bg-white rounded-lg border border-gray-200 p-4 shadow-inner">
                  <span className="text-[10px] text-gray-400 font-bold uppercase mb-3">Previsualización</span>
                  
                  <span className={`px-2.5 py-1 rounded text-[11px] tracking-wide border whitespace-nowrap inline-flex items-center justify-center gap-1.5 ${
                    badge.uppercase !== false ? 'uppercase' : ''
                  } ${badge.font || 'font-sans'} ${badge.weight || 'font-bold'} ${badge.italic ? 'italic' : ''} ${badge.bg} ${badge.text} ${badge.border}`}>
                    {IconComponent && <IconComponent size={14} strokeWidth={2.5} />}
                    {badge.uppercase !== false ? badge.label.toUpperCase() : badge.label}
                  </span>
                  
                  <div className="mt-4 text-[10px] font-mono text-gray-400 text-center max-w-[250px] break-all">
                    {badge.bg} {badge.text} {badge.border}
                  </div>
                </div>

                {/* Edit Controls */}
                <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                     <span className="font-bold text-sm text-gray-700">Controles de Diseño</span>
                     <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">{badge.label}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {renderColorPicker(badge.id, 'bg', badge.bg)}
                    {renderColorPicker(badge.id, 'text', badge.text)}
                    {renderColorPicker(badge.id, 'border', badge.border)}
                    {renderIconPicker(badge.id, badge.iconName)}
                  </div>
                  {renderFontControls(badge)}
                </div>

              </div>
            )})}
          </div>
        </div>
      </div>
    </div>
  );
}
