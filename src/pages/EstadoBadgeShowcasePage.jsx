import React, { useState } from 'react';

const COLORS = [
  { name: 'Blue', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Amber', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  { name: 'Rose', classes: 'bg-rose-50 text-rose-700 border-rose-200' },
  { name: 'Red', classes: 'bg-red-100 text-red-800 border-red-300' },
  { name: 'Emerald', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'Purple', classes: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Indigo', classes: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { name: 'Cyan', classes: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { name: 'Slate', classes: 'bg-slate-50 text-slate-700 border-slate-200' },
  { name: 'Orange', classes: 'bg-orange-50 text-orange-700 border-orange-200' }
];

const FONTS = [
  { name: '1. Actual (9px Bold Uppercase)', classes: 'text-[9px] uppercase font-bold' },
  { name: '2. Extra Bold Espaciado', classes: 'text-[10px] font-black tracking-widest uppercase' },
  { name: '3. Normal Capitalize', classes: 'text-xs font-semibold capitalize' },
  { name: '4. Monoespaciado', classes: 'text-[11px] font-medium font-mono uppercase tracking-wider' },
  { name: '5. Itálica Dinámica', classes: 'text-[11px] font-black italic uppercase' }
];

export default function EstadoBadgeShowcasePage() {
  const baseClasses = "px-2 py-0.5 rounded border inline-block text-center";

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Showcase del Badge de "Estado / Días"</h1>
        <p className="text-gray-500">
          Este es el modelo de badge específico que se agregó a la columna Estado (Ej: "Quedan 30 días").<br />
          Aquí tienes 10 colores combinados con 5 tipografías distintas para que escojas tu favorito.
        </p>
      </div>

      <div className="space-y-10">
        {FONTS.map((font, fontIdx) => (
          <section key={fontIdx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-6">
              Tipografía {font.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {COLORS.map((color, colorIdx) => (
                <div key={colorIdx} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{color.name}</span>
                  <span className={`${baseClasses} w-full ${color.classes} ${font.classes}`}>
                    {font.name.includes('Capitalize') ? 'Quedan 15 días' : 'QUEDAN 15 DÍAS'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      
      <div className="bg-[#006BB9] text-white p-6 rounded-xl shadow-sm mt-8">
        <h3 className="text-xl font-bold mb-2">¿Cómo elegir?</h3>
        <p>Indícame por ejemplo: <em>"Quiero la Tipografía 2 con los colores Emerald, Amber y Rose"</em> y lo aplicaré en la tabla de licencias.</p>
      </div>
    </div>
  );
}
