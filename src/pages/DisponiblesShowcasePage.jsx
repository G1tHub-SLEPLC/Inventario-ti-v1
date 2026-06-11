import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  HelpCircle, 
  Check, 
  AlertTriangle, 
  Info,
  Package, 
  Eye, 
  Plus, 
  Minus,
  Table,
  ArrowRight,
  Code
} from 'lucide-react';

const SAMPLE_SOFTWARES = [
  { id: 's1', name: 'Microsoft 365 Business Premium', total: 60, initialAvailable: 52 },
  { id: 's2', name: 'Adobe Creative Cloud All Apps', total: 20, initialAvailable: 11 },
  { id: 's3', name: 'Zoom Professional Account', total: 40, initialAvailable: 15 },
  { id: 's4', name: 'JetBrains All Products Pack', total: 12, initialAvailable: 2 },
  { id: 's5', name: 'Windows 11 Pro Retail License', total: 100, initialAvailable: 0 }
];

export default function DisponiblesShowcasePage() {
  // Simulator State
  const [totalSim, setTotalSim] = useState(40);
  const [availableSim, setAvailableSim] = useState(15);
  
  // Table View Style State ('idea1', 'idea2', 'idea3', 'idea4')
  const [activeStyle, setActiveStyle] = useState('idea1');
  
  // Selection feedback state
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Helper limits
  const incrementAvailable = () => {
    if (availableSim < totalSim) setAvailableSim(availableSim + 1);
  };
  
  const decrementAvailable = () => {
    if (availableSim > 0) setAvailableSim(availableSim - 1);
  };
  
  const incrementTotal = () => {
    setTotalSim(totalSim + 5);
  };
  
  const decrementTotal = () => {
    if (totalSim > 5) {
      const newTotal = totalSim - 5;
      setTotalSim(newTotal);
      if (availableSim > newTotal) {
        setAvailableSim(newTotal);
      }
    }
  };

  const ratio = totalSim > 0 ? (availableSim / totalSim) : 0;
  
  // Render functions for Main Ideas
  const renderProgressBar = (available, total) => {
    const r = total > 0 ? available / total : 0;
    let color = 'bg-emerald-500';
    let text = 'text-emerald-600 dark:text-emerald-400';
    
    if (r < 0.25) {
      color = 'bg-red-500';
      text = 'text-red-600 dark:text-red-400';
    } else if (r < 0.5) {
      color = 'bg-amber-500';
      text = 'text-amber-600 dark:text-amber-400';
    }

    return (
      <div className="flex flex-col gap-1.5 w-full max-w-[120px] mx-auto">
        <div className="flex justify-between items-center text-xs font-mono font-bold px-0.5">
          <span className={text}>{available}</span>
          <span className="text-gray-400 text-[10px]">/</span>
          <span className="text-gray-600 dark:text-gray-300">{total}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          <div 
            className={`h-full rounded-full transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] ${color}`} 
            style={{ width: `${Math.min(100, r * 100)}%` }}
          />
        </div>
      </div>
    );
  };

  const renderStatusDot = (available, total) => {
    const r = total > 0 ? available / total : 0;
    let dotColor = 'bg-emerald-500';
    let pulseColor = 'bg-emerald-400';
    let textColor = 'text-emerald-700 bg-emerald-50/50 border-emerald-100';
    
    if (r < 0.25) {
      dotColor = 'bg-red-500';
      pulseColor = 'bg-red-400';
      textColor = 'text-red-700 bg-red-50/50 border-red-100';
    } else if (r < 0.5) {
      dotColor = 'bg-amber-500';
      pulseColor = 'bg-amber-400';
      textColor = 'text-amber-700 bg-amber-50/50 border-amber-100';
    }

    return (
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border font-mono text-xs font-bold ${textColor}`}>
        <span className="relative flex h-2 w-2">
          {r < 0.25 && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseColor}`}></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`}></span>
        </span>
        <span>{available} / {total}</span>
      </div>
    );
  };

  const renderSelectiveAlerting = (available, total) => {
    const r = total > 0 ? available / total : 0;
    
    if (r >= 0.5) {
      return (
        <span className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-mono font-bold tracking-tight">
          {available} / {total}
        </span>
      );
    } else if (r >= 0.25) {
      return (
        <span className="px-2.5 py-1 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-black tracking-tight">
          ⚠️ {available} / {total}
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-1 rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-mono font-black tracking-tight animate-pulse">
          🚨 {available} / {total}
        </span>
      );
    }
  };

  const renderNeonOutline = (available, total) => {
    const r = total > 0 ? available / total : 0;
    let color = 'border-emerald-500/40 text-emerald-500 bg-emerald-500/5';
    
    if (r < 0.25) {
      color = 'border-red-500/40 text-red-500 bg-red-500/5';
    } else if (r < 0.5) {
      color = 'border-amber-500/40 text-amber-500 bg-amber-500/5';
    }

    return (
      <span className={`px-3 py-1 rounded-lg border-2 ${color} text-xs font-mono font-black tracking-widest uppercase`}>
        {available} / {total}
      </span>
    );
  };

  // Render functions for Linear Progress Bar SPECIFIC VARIANTS
  const renderProgressBarClassic = (available, total) => {
    return renderProgressBar(available, total); // Reuses the main implementation
  };

  const renderProgressBarSegmented = (available, total) => {
    const r = total > 0 ? available / total : 0;
    const activeSegments = Math.round(r * 5);
    let color = 'bg-emerald-500 border-emerald-500/40';
    let text = 'text-emerald-600 dark:text-emerald-400';
    
    if (r < 0.25) {
      color = 'bg-red-500 border-red-500/40';
      text = 'text-red-600 dark:text-red-400';
    } else if (r < 0.5) {
      color = 'bg-amber-500 border-amber-500/40';
      text = 'text-amber-600 dark:text-amber-400';
    }
    
    return (
      <div className="flex flex-col gap-1.5 w-full max-w-[120px] mx-auto">
        <div className="flex justify-between items-center text-xs font-mono font-bold px-0.5">
          <span className={text}>{available}</span>
          <span className="text-gray-400 text-[10px]">/</span>
          <span className="text-gray-600 dark:text-gray-300">{total}</span>
        </div>
        <div className="flex gap-1 h-2 w-full">
          {[0, 1, 2, 3, 4].map((i) => {
            const isActive = i < activeSegments;
            return (
              <div 
                key={i} 
                className={`flex-1 h-full rounded-xs transition-all duration-300 border ${
                  isActive 
                    ? `${color}` 
                    : 'bg-gray-100 border-gray-200 dark:bg-slate-800 dark:border-slate-700/60'
                }`} 
              />
            );
          })}
        </div>
      </div>
    );
  };

  const renderProgressBarEmbedded = (available, total) => {
    const r = total > 0 ? available / total : 0;
    let color = 'bg-emerald-500';
    let border = 'border-emerald-500/20';
    
    if (r < 0.25) {
      color = 'bg-red-500';
      border = 'border-red-500/20';
    } else if (r < 0.5) {
      color = 'bg-amber-500';
      border = 'border-amber-500/20';
    }

    return (
      <div className={`w-full max-w-[130px] h-6 bg-slate-100 dark:bg-slate-800 border ${border} rounded-lg overflow-hidden relative flex items-center justify-center font-mono text-[10px] font-black shadow-inner mx-auto`}>
        {/* Background Fill */}
        <div 
          className={`absolute left-0 top-0 h-full transition-all duration-300 ${color}`}
          style={{ width: `${r * 100}%` }}
        />
        {/* Text overlay */}
        <span className="z-10 text-slate-800 dark:text-white mix-blend-difference uppercase tracking-wider font-extrabold">
          {available} / {total} ({(r * 100).toFixed(0)}%)
        </span>
      </div>
    );
  };

  const renderProgressBarMinimal = (available, total) => {
    const r = total > 0 ? available / total : 0;
    let color = 'bg-emerald-500';
    let text = 'text-gray-800 dark:text-white font-extrabold';
    let badgeColor = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/40';
    
    if (r < 0.25) {
      color = 'bg-red-500';
      badgeColor = 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-800/40';
    } else if (r < 0.5) {
      color = 'bg-amber-500';
      badgeColor = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/40';
    }

    return (
      <div className="flex flex-col gap-1 w-full max-w-[125px] items-center mx-auto">
        <div className="flex items-center gap-1.5 justify-between w-full px-0.5">
          <span className={`font-mono text-xs ${text}`}>{available} / {total}</span>
          <span className={`text-[9px] px-1 py-0.2 rounded border font-mono font-bold ${badgeColor}`}>
            {(r * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden border border-gray-200/20">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${color}`} 
            style={{ width: `${r * 100}%` }}
          />
        </div>
      </div>
    );
  };

  const renderCellByStyle = (styleName, available, total) => {
    switch(styleName) {
      case 'idea1': return renderProgressBar(available, total);
      case 'idea2': return renderStatusDot(available, total);
      case 'idea3': return renderSelectiveAlerting(available, total);
      case 'idea4': return renderNeonOutline(available, total);
      default: return `${available} / ${total}`;
    }
  };

  const handleSelectOption = (optionNum, title) => {
    setSelectedFeedback(`¡Excelente elección! Has seleccionado: "Opción ${optionNum} - ${title}". Indícame esto en el chat y actualizaré inmediatamente la tabla principal.`);
    // Auto-scroll to feedback message
    setTimeout(() => {
      document.getElementById('feedback-box')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="p-6 max-w-[1280px] mx-auto space-y-8 pb-20 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2.5">
            <Package className="text-[#006BB9]" size={28} />
            Showcase: Representación de Licencias Disponibles
          </h1>
          <p className="text-sm text-gray-500 max-w-3xl">
            Prototipos visuales interactivos para decidir cómo mostrar la relación de stock <span className="font-semibold text-gray-700">Disponibles / Total</span> y configurar alertas visuales cuando queden pocas unidades.
          </p>
        </div>
        
        <span className="text-xs px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-100 flex items-center gap-1.5 self-start md:self-auto shadow-sm font-mono">
          <Sparkles size={14} className="animate-spin text-blue-500" style={{ animationDuration: '4s' }} />
          Interactivo v1.1
        </span>
      </div>

      {/* Grid: Live Sandbox and Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sandbox Panel (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: The Interactive Simulator */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Sliders size={18} className="text-gray-500" />
                1. Simulador Dinámico de Stock
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase font-mono">Simulación en vivo</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Controls */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Parámetros de la Licencia</h4>
                  <p className="text-xs text-slate-500 mb-4">Modifica los valores a continuación para observar el cambio de color (verde, naranja y rojo) según la proporción de stock.</p>
                </div>
                
                {/* Available input */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 font-medium">LICENCIAS DISPONIBLES</span>
                    <span className="text-[#006BB9] font-mono font-black">{availableSim} unid.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={decrementAvailable}
                      disabled={availableSim <= 0}
                      className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      <Minus size={16} />
                    </button>
                    <input 
                      type="range" 
                      min="0" 
                      max={totalSim} 
                      value={availableSim} 
                      onChange={(e) => setAvailableSim(Number(e.target.value))}
                      className="flex-1 accent-[#006BB9] cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
                    />
                    <button 
                      onClick={incrementAvailable}
                      disabled={availableSim >= totalSim}
                      className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Total Input */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 font-medium">CANTIDAD TOTAL ADQUIRIDA</span>
                    <span className="text-gray-600 font-mono font-black">{totalSim} unid.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={decrementTotal}
                      disabled={totalSim <= 5}
                      className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      <Minus size={16} />
                    </button>
                    <input 
                      type="range" 
                      min="5" 
                      max="100" 
                      step="5"
                      value={totalSim} 
                      onChange={(e) => {
                        const newTotal = Number(e.target.value);
                        setTotalSim(newTotal);
                        if (availableSim > newTotal) setAvailableSim(newTotal);
                      }}
                      className="flex-1 accent-slate-700 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
                    />
                    <button 
                      onClick={incrementTotal}
                      disabled={totalSim >= 100}
                      className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-200/60 pt-4 flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Proporción de Stock:</span>
                  <span className="font-mono bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-black text-sm">
                    {(ratio * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Previews */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Vista en Tiempo Real</h4>
                  
                  <div className="space-y-3">
                    {/* Option 1 */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-xs">
                      <span className="text-xs font-bold text-gray-500 uppercase">Idea 1: Barra Lineal</span>
                      <div className="w-36 flex justify-end">
                        {renderProgressBar(availableSim, totalSim)}
                      </div>
                    </div>

                    {/* Option 2 */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-xs">
                      <span className="text-xs font-bold text-gray-500 uppercase">Idea 2: Punto Estado</span>
                      <div className="w-36 flex justify-end">
                        {renderStatusDot(availableSim, totalSim)}
                      </div>
                    </div>

                    {/* Option 3 */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-xs">
                      <span className="text-xs font-bold text-gray-500 uppercase">Idea 3: Alerta Selectiva</span>
                      <div className="w-36 flex justify-end">
                        {renderSelectiveAlerting(availableSim, totalSim)}
                      </div>
                    </div>

                    {/* Option 4 */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-xs">
                      <span className="text-xs font-bold text-gray-500 uppercase">Idea 4: Borde Neón</span>
                      <div className="w-36 flex justify-end">
                        {renderNeonOutline(availableSim, totalSim)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60 text-[11px] text-blue-700 leading-relaxed flex gap-2">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <p>
                    <strong>Criterio de alertas:</strong> Verde intenso si queda el <strong>50% o más</strong>. Naranjo si queda entre el <strong>25% y 49%</strong>. Rojo intenso y parpadeo de alerta si queda <strong>menos del 25%</strong>.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Card 2: Interactive Table Grid Comparison */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 gap-4">
              <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Table size={18} className="text-gray-500" />
                2. Simulación en Tabla de Licencias
              </h3>
              
              {/* Mode Toggles */}
              <div className="flex bg-gray-100 p-1 rounded-xl self-start md:self-auto">
                <button 
                  onClick={() => setActiveStyle('idea1')} 
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${activeStyle === 'idea1' ? 'bg-[#006BB9] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Barra Lineal
                </button>
                <button 
                  onClick={() => setActiveStyle('idea2')} 
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${activeStyle === 'idea2' ? 'bg-[#006BB9] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Punto Estado
                </button>
                <button 
                  onClick={() => setActiveStyle('idea3')} 
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${activeStyle === 'idea3' ? 'bg-[#006BB9] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Alerta Selectiva
                </button>
                <button 
                  onClick={() => setActiveStyle('idea4')} 
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${activeStyle === 'idea4' ? 'bg-[#006BB9] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Borde Neón
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs text-gray-600">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-3">Software / Aplicativo</th>
                    <th className="px-4 py-3 text-center">Total</th>
                    <th className="px-4 py-3 text-center">Asignadas</th>
                    <th className="px-4 py-3 text-center w-44">Disponibles</th>
                    <th className="px-4 py-3 text-center">Estado Visual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 bg-white">
                  {SAMPLE_SOFTWARES.map((soft) => {
                    const available = soft.initialAvailable;
                    const asignadas = soft.total - available;
                    const pct = soft.total > 0 ? (available / soft.total) : 0;
                    
                    return (
                      <tr key={soft.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-gray-800">{soft.name}</td>
                        <td className="px-4 py-3.5 text-center font-mono font-medium">{soft.total}</td>
                        <td className="px-4 py-3.5 text-center font-mono font-medium text-gray-500">{asignadas}</td>
                        <td className="px-4 py-3.5 text-center align-middle">
                          <div className="flex justify-center items-center">
                            {renderCellByStyle(activeStyle, available, soft.total)}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {pct >= 0.5 ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 text-[10px] uppercase">
                              Stock Alto
                            </span>
                          ) : pct > 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-100 text-[10px] uppercase">
                              Stock Medio
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-100 text-[10px] uppercase animate-pulse">
                              Agotado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="text-[11px] text-gray-400 italic text-right">
              * Haz clic en los botones de la barra de pestañas de arriba para cambiar el estilo de la columna "Disponibles".
            </div>
          </div>

          {/* Card 3: Specific Variations of the Progress Bar */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={18} className="text-[#006BB9]" />
                3. Variantes Específicas del Estilo Barra Lineal
              </h3>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold uppercase font-mono">Variantes de barra</span>
            </div>

            <p className="text-xs text-gray-500">
              Dado que te interesa el formato de <strong>barra lineal</strong>, hemos preparado cuatro variantes distintas para el indicador. Modifica los controles del simulador (Bloque 1) y observa cómo cambian todas estas barras simultáneamente.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Variant A: Classic Thin Pill */}
              <div className="border border-gray-200 rounded-2xl p-5 bg-white flex flex-col justify-between h-40 hover:border-blue-400 hover:shadow-xs transition-all duration-300">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">Variante A</span>
                    <span className="text-[10px] text-slate-400 font-bold">Clásica</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 pt-1">Barra Píldora delgada</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">Números bold a la izquierda/derecha y una barra delgada de 8px por debajo con bordes redondeados.</p>
                </div>
                <div className="pt-2 flex justify-start">
                  {renderProgressBarClassic(availableSim, totalSim)}
                </div>
              </div>

              {/* Variant B: Segmented Blocks */}
              <div className="border border-gray-200 rounded-2xl p-5 bg-white flex flex-col justify-between h-40 hover:border-blue-400 hover:shadow-xs transition-all duration-300">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">Variante B</span>
                    <span className="text-[10px] text-slate-400 font-bold">Segmentada</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 pt-1">Bloques Tipo Celdas</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">Divide el progreso en 5 celdas separadas (cada una representa 20%). Aporta un toque industrial/técnico.</p>
                </div>
                <div className="pt-2 flex justify-start">
                  {renderProgressBarSegmented(availableSim, totalSim)}
                </div>
              </div>

              {/* Variant C: Embedded Text Thick Pill */}
              <div className="border border-gray-200 rounded-2xl p-5 bg-white flex flex-col justify-between h-40 hover:border-blue-400 hover:shadow-xs transition-all duration-300">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">Variante C</span>
                    <span className="text-[10px] text-slate-400 font-bold">Integrada</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 pt-1">Barra Ancha con Texto</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">Una píldora gruesa de 24px con el porcentaje y stock superpuesto en el centro, usando efecto de color invertido.</p>
                </div>
                <div className="pt-2 flex justify-start">
                  {renderProgressBarEmbedded(availableSim, totalSim)}
                </div>
              </div>

              {/* Variant D: Minimal Line with Percentage */}
              <div className="border border-gray-200 rounded-2xl p-5 bg-white flex flex-col justify-between h-40 hover:border-blue-400 hover:shadow-xs transition-all duration-300">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">Variante D</span>
                    <span className="text-[10px] text-slate-400 font-bold">Compacta</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 pt-1">Línea Fina y Porcentaje</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">Muestra el stock y el porcentaje de stock en un badge lateral, sobre una línea de progreso ultrafina de 4px.</p>
                </div>
                <div className="pt-2 flex justify-start">
                  {renderProgressBarMinimal(availableSim, totalSim)}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Info & Action Selection Panel (Right 1 col) */}
        <div className="space-y-6">
          
          {/* Card 3: Conceptual Details */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-lg border border-slate-800 p-6 space-y-6">
            <h3 className="text-white font-black text-sm uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <Info size={16} className="text-[#006BB9]" />
              Detalles de los Diseños
            </h3>

            {/* Carousel-like listing */}
            <div className="space-y-4 text-xs">
              
              <div className="border-l-2 border-emerald-500 pl-3 py-1 space-y-1">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Opción 1: Barra de Progreso Lineal</h4>
                <p className="text-slate-400 leading-relaxed">
                  Agrega una pequeña barra horizontal coloreada debajo del número de stock. Ofrece una lectura visual inmediata de la proporción disponible.
                </p>
                <div className="text-[10px] bg-slate-950 px-2 py-1 rounded font-mono text-[#90d039] flex items-center gap-1.5 mt-2">
                  <Code size={10} /> CSS: bg-gray-100 + w-[%]-fill
                </div>
              </div>

              <div className="border-l-2 border-blue-500 pl-3 py-1 space-y-1">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Opción 2: Punto de Estado (Status Dot)</h4>
                <p className="text-slate-400 leading-relaxed">
                  Coloca un círculo brillante (que parpadea cuando el stock es menor al 25%) junto a los números de stock. Es el diseño corporativo más limpio y elegante.
                </p>
                <div className="text-[10px] bg-slate-950 px-2 py-1 rounded font-mono text-[#90d039] flex items-center gap-1.5 mt-2">
                  <Code size={10} /> CSS: animate-ping + rounded-full
                </div>
              </div>

              <div className="border-l-2 border-amber-500 pl-3 py-1 space-y-1">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Opción 3: Alerta Selectiva (Selective)</h4>
                <p className="text-slate-400 leading-relaxed">
                  Usa un diseño neutro gris cuando el stock es saludable. Solo se ilumina con colores intensos cuando entra en Warning (naranja) o Critical (rojo), evitando saturación visual.
                </p>
                <div className="text-[10px] bg-slate-950 px-2 py-1 rounded font-mono text-[#90d039] flex items-center gap-1.5 mt-2">
                  <Code size={10} /> CSS: bg-slate-50/50 vs bg-red-500/10
                </div>
              </div>

              <div className="border-l-2 border-purple-500 pl-3 py-1 space-y-1">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Opción 4: Borde Neón (Transparent Vibrant)</h4>
                <p className="text-slate-400 leading-relaxed">
                  Bordes de 2px con colores muy vivos y transparentes. Aporta un aspecto tecnológico futurista, muy nítido y legible en pantallas LCD de baja resolución.
                </p>
                <div className="text-[10px] bg-slate-950 px-2 py-1 rounded font-mono text-[#90d039] flex items-center gap-1.5 mt-2">
                  <Code size={10} /> CSS: border-2 bg-[color]/5 font-black
                </div>
              </div>

            </div>
          </div>

          {/* Card 4: Voter/Selection Box */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              ¿Cuál prefieres aplicar?
            </h3>
            
            <p className="text-xs text-gray-500 leading-relaxed">
              Haz clic en cualquiera de las opciones a continuación para simular la confirmación del diseño.
            </p>

            <div className="space-y-2 pt-2">
              <button 
                onClick={() => handleSelectOption("1A", "Barra Lineal: Píldora Clásica")}
                className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-[#006BB9] hover:bg-blue-50/30 text-xs font-bold text-gray-700 flex justify-between items-center transition-all group"
              >
                <span>Opción 1A: Barra Píldora Clásica</span>
                <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => handleSelectOption("1B", "Barra Lineal: Segmentada en Bloques")}
                className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-[#006BB9] hover:bg-blue-50/30 text-xs font-bold text-gray-700 flex justify-between items-center transition-all group"
              >
                <span>Opción 1B: Barra Segmentada</span>
                <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => handleSelectOption("1C", "Barra Lineal: Barra Ancha Integrada")}
                className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-[#006BB9] hover:bg-blue-50/30 text-xs font-bold text-gray-700 flex justify-between items-center transition-all group"
              >
                <span>Opción 1C: Barra Ancha con Texto</span>
                <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => handleSelectOption("1D", "Barra Lineal: Línea Ultrafina con Porcentaje")}
                className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-[#006BB9] hover:bg-blue-50/30 text-xs font-bold text-gray-700 flex justify-between items-center transition-all group"
              >
                <span>Opción 1D: Barra Fina con Porcentaje</span>
                <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="h-px bg-gray-200 my-2"></div>

              <button 
                onClick={() => handleSelectOption(2, 'Punto de Estado Minimalista')}
                className="w-full text-left px-4 py-3.5 rounded-xl border border-gray-100 hover:border-[#006BB9] hover:bg-blue-50/20 text-xs font-medium text-gray-600 flex justify-between items-center transition-all group"
              >
                <span>Opción 2: Punto de Estado (Dot)</span>
                <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => handleSelectOption(3, 'Alerta Selectiva (Sin Ruido)')}
                className="w-full text-left px-4 py-3.5 rounded-xl border border-gray-100 hover:border-[#006BB9] hover:bg-blue-50/20 text-xs font-medium text-gray-600 flex justify-between items-center transition-all group"
              >
                <span>Opción 3: Alerta Selectiva</span>
                <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => handleSelectOption(4, 'Borde Neón de Alto Contraste')}
                className="w-full text-left px-4 py-3.5 rounded-xl border border-gray-100 hover:border-[#006BB9] hover:bg-blue-50/20 text-xs font-medium text-gray-600 flex justify-between items-center transition-all group"
              >
                <span>Opción 4: Borde Neón (Outline)</span>
                <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {selectedFeedback && (
              <div id="feedback-box" className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl space-y-1.5 animate-fade-in mt-4">
                <div className="flex items-center gap-1.5 font-bold">
                  <Check size={14} className="text-emerald-600" />
                  <span>Selección Simulada</span>
                </div>
                <p className="leading-relaxed font-medium">{selectedFeedback}</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
