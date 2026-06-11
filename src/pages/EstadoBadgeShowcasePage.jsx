import React, { useState } from 'react';
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
  Package
} from 'lucide-react';

const PALETTES = {
  crm: {
    title: '1. Paleta CRM (Fondo Suave + Borde Fino)',
    desc: 'El diseño actual del sistema. Colores pastel semitransparentes con bordes definidos que evitan la saturación visual.',
    colors: [
      { name: 'Emerald (Verde)', classes: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle },
      { name: 'Amber (Amarillo)', classes: 'bg-amber-50 text-amber-800 border-amber-200', icon: Clock },
      { name: 'Rose (Rojo/Coral)', classes: 'bg-rose-50 text-rose-800 border-rose-200', icon: AlertTriangle },
      { name: 'Blue (Azul)', classes: 'bg-blue-50 text-blue-800 border-blue-200', icon: Info },
      { name: 'Orange (Naranja)', classes: 'bg-orange-50 text-orange-800 border-orange-200', icon: Clock },
      { name: 'Purple (Púrpura)', classes: 'bg-purple-50 text-purple-800 border-purple-200', icon: Info },
      { name: 'Indigo (Índigo)', classes: 'bg-indigo-50 text-indigo-800 border-indigo-200', icon: Info },
      { name: 'Cyan (Cian)', classes: 'bg-cyan-50 text-cyan-800 border-cyan-200', icon: Info },
      { name: 'Slate (Gris)', classes: 'bg-slate-50 text-slate-800 border-slate-200', icon: Info }
    ]
  },
  neon: {
    title: '2. Paleta Neón / Dark Accent (10% Opacidad)',
    desc: 'Un aspecto más tecnológico y brillante. Utiliza colores de marca puros con baja opacidad de fondo.',
    colors: [
      { name: 'Emerald (Verde)', classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400', icon: CheckCircle },
      { name: 'Amber (Amarillo)', classes: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400', icon: Clock },
      { name: 'Rose (Rojo/Coral)', classes: 'bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400', icon: AlertTriangle },
      { name: 'Blue (Azul)', classes: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400', icon: Info },
      { name: 'Orange (Naranja)', classes: 'bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400', icon: Clock },
      { name: 'Purple (Púrpura)', classes: 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400', icon: Info },
      { name: 'Indigo (Índigo)', classes: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30 dark:text-indigo-400', icon: Info },
      { name: 'Cyan (Cian)', classes: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30 dark:text-cyan-400', icon: Info },
      { name: 'Slate (Gris)', classes: 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:text-slate-400', icon: Info }
    ]
  },
  solid: {
    title: '3. Paleta Sólida / Fuerte (Color Completo)',
    desc: 'Colores enteros de alta densidad para alertar de forma contundente en dashboards de supervisión.',
    colors: [
      { name: 'Emerald (Verde)', classes: 'bg-emerald-600 text-white border-emerald-700 shadow-sm', icon: CheckCircle },
      { name: 'Amber (Amarillo)', classes: 'bg-amber-500 text-white border-amber-600 shadow-sm', icon: Clock },
      { name: 'Rose (Rojo/Coral)', classes: 'bg-rose-600 text-white border-rose-700 shadow-sm', icon: AlertTriangle },
      { name: 'Blue (Azul)', classes: 'bg-blue-600 text-white border-blue-700 shadow-sm', icon: Info },
      { name: 'Orange (Naranja)', classes: 'bg-orange-500 text-white border-orange-600 shadow-sm', icon: Clock },
      { name: 'Purple (Púrpura)', classes: 'bg-purple-600 text-white border-purple-700 shadow-sm', icon: Info },
      { name: 'Indigo (Índigo)', classes: 'bg-indigo-600 text-white border-indigo-700 shadow-sm', icon: Info },
      { name: 'Cyan (Cian)', classes: 'bg-cyan-600 text-white border-cyan-700 shadow-sm', icon: Info },
      { name: 'Slate (Gris)', classes: 'bg-slate-600 text-white border-slate-700 shadow-sm', icon: Info }
    ]
  }
};

export default function EstadoBadgeShowcasePage() {
  const [badgeText, setBadgeText] = useState('5 de 10 disp.');
  const [showIcons, setShowIcons] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

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
            Prueba cómo se ven los textos de estado con diferentes combinaciones de colores (CRM Soft, Neón Translúcido y Sólido).
          </p>
        </div>
        
        <span className="text-xs px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-100 flex items-center gap-1.5 self-start md:self-auto shadow-sm font-mono">
          Visualizador de Badges
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
        {Object.entries(PALETTES).map(([key, palette]) => (
          <div key={key} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-black text-gray-800 text-md uppercase tracking-wider">
                {palette.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{palette.desc}</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs text-gray-600">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-3">Color</th>
                    <th className="px-4 py-3 text-center w-52">Visualización</th>
                    <th className="px-4 py-3">Clases CSS de Tailwind</th>
                    <th className="px-4 py-3 text-center">Copiar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 bg-white">
                  {palette.colors.map((color, idx) => {
                    const uniqueId = `${key}-${idx}`;
                    const IconComponent = color.icon;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-gray-700">{color.name}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${color.classes}`}>
                            {showIcons && <IconComponent size={12} className="stroke-[2.5]" />}
                            <span>{badgeText || 'Texto vacío'}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500 select-all">
                          {color.classes}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => handleCopy(color.classes, uniqueId)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              copiedIndex === uniqueId 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                                : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300'
                            }`}
                            title="Copiar Clases"
                          >
                            {copiedIndex === uniqueId ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="bg-[#006BB9] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-black uppercase tracking-wider mb-1">¿Cómo aplicar un color nuevo?</h4>
          <p className="text-xs text-blue-100">
            Haz clic en el botón de copiar a la derecha de cualquier fila, pégalo en las clases del badge dentro de tu componente, e intégralo al sistema.
          </p>
        </div>
        <div className="text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 font-bold self-start md:self-auto">
          Portal de Inventario TI Copihues
        </div>
      </div>

    </div>
  );
}
