import React, { useState } from 'react';
import { Calendar, Clock, CalendarDays, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function DateTimeShowcasePage() {
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  
  return (
    <div className="p-8 max-w-[1200px] mx-auto min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <CalendarDays className="text-[#006BB9]" size={32} />
          Showcase de Selección de Fecha y Hora
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          10 ejemplos de distintos modelos para seleccionar fechas y horas, desde nativos hasta UI premium.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* 1. Nativo Estándar (Modificado para abrir on click) */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-sm">1</span> 
            Nativo Básico Mejorado (Clickable)
          </h2>
          <p className="text-sm text-gray-500 mb-4">El input HTML5 por defecto, pero configurado para abrirse al hacer clic en cualquier parte del cajón.</p>
          <div className="flex flex-col gap-4">
            <input 
              type="date" 
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="w-full rounded-lg border-gray-300 shadow-sm border p-3 text-sm focus:border-[#006BB9] focus:ring-[#006BB9] cursor-pointer"
            />
            <input 
              type="time" 
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="w-full rounded-lg border-gray-300 shadow-sm border p-3 text-sm focus:border-[#006BB9] focus:ring-[#006BB9] cursor-pointer"
            />
          </div>
        </section>

        {/* 2. Nativo Estilo Material (Floating Label) */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-sm">2</span> 
            Material Design (Floating Label)
          </h2>
          <div className="flex flex-col gap-6 mt-2">
            <div className="relative">
              <input 
                type="date" 
                id="floating_date"
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#006BB9] peer cursor-pointer" 
                placeholder=" " 
              />
              <label htmlFor="floating_date" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[#006BB9] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
                Fecha de Nacimiento
              </label>
            </div>
          </div>
        </section>

        {/* 3. Estilo SaaS Moderno (Icono Integrado) */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-sm">3</span> 
            SaaS Moderno (Con Icono)
          </h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-blue-500">
              <Calendar size={18} />
            </div>
            <input 
              type="date" 
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="bg-blue-50/50 border border-blue-200 text-blue-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 cursor-pointer transition-colors hover:bg-blue-50"
            />
          </div>
        </section>

        {/* 4. Selector DateTime Local */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-sm">4</span> 
            Selector Unificado (DateTime Local)
          </h2>
          <p className="text-sm text-gray-500 mb-4">Permite elegir fecha y hora en el mismo componente nativo.</p>
          <input 
            type="datetime-local" 
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            className="w-full bg-slate-50 rounded-lg border-slate-200 shadow-inner border p-3 text-sm focus:border-slate-500 focus:ring-slate-500 cursor-pointer font-medium text-slate-700"
          />
        </section>

        {/* 5. Selector Dark Mode Premium */}
        <section className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-sm">5</span> 
            Dark Mode Premium UI
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1 block">Pick a date</label>
              <input 
                type="date" 
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full bg-slate-800 rounded-lg border-slate-600 shadow-sm border p-3 text-sm text-white focus:border-blue-400 focus:ring-blue-400 cursor-pointer [color-scheme:dark]"
              />
            </div>
          </div>
        </section>

        {/* 6. Doble Selector Rango Compacto */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-sm">6</span> 
            Selector de Rango Compacto
          </h2>
          <div className="flex items-center">
            <div className="relative w-full">
              <input type="date" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-pointer" onClick={(e) => e.target.showPicker && e.target.showPicker()}/>
            </div>
            <span className="px-4 text-gray-500 bg-gray-50 border-y border-gray-300">a</span>
            <div className="relative w-full">
              <input type="date" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-r-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-pointer" onClick={(e) => e.target.showPicker && e.target.showPicker()}/>
            </div>
          </div>
        </section>

        {/* 7. Mockup Custom Calendar UI (Solo Diseño) */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 row-span-2">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-sm">7</span> 
            Mockup Custom Calendar Widget
          </h2>
          <p className="text-sm text-gray-500 mb-4">Ejemplo visual de un calendario construido a medida en vez de usar el nativo del navegador.</p>
          
          <div className="border border-gray-200 rounded-xl p-4 shadow-sm w-full max-w-sm mx-auto bg-white">
            <div className="flex items-center justify-between mb-4">
              <button className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} className="text-gray-600"/></button>
              <h3 className="font-bold text-gray-800">Junio 2026</h3>
              <button className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight size={20} className="text-gray-600"/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-2">
              <div>LU</div><div>MA</div><div>MI</div><div>JU</div><div>VI</div><div>SA</div><div>DO</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              <div className="p-2 text-gray-300">1</div>
              <div className="p-2 text-gray-300">2</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-full">3</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-full">4</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-full">5</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-full">6</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-full">7</div>
              {/* Semana 2 */}
              <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-full">8</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-full">9</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-full">10</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-full">11</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-full">12</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-full">13</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-full">14</div>
              {/* Semana 3 */}
              <div className="p-2 bg-[#006BB9] text-white font-bold cursor-pointer rounded-full shadow-md">15</div>
              <div className="p-2 bg-blue-50 text-blue-800 font-bold cursor-pointer rounded-full">16</div>
              <div className="p-2 bg-blue-50 text-blue-800 font-bold cursor-pointer rounded-full">17</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-full">18</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-full">19</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-full">20</div>
              <div className="p-2 hover:bg-gray-100 cursor-pointer rounded-full">21</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600 flex items-center gap-1"><Clock size={14}/> 10:00 AM</span>
              <button className="text-sm text-[#006BB9] font-bold">Aplicar</button>
            </div>
          </div>
        </section>

        {/* 8. Glassmorphism UI */}
        <section className="bg-gradient-to-r from-cyan-500 to-blue-500 p-6 rounded-2xl shadow-lg border border-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-md"></div>
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="bg-white/20 text-white px-2 py-0.5 rounded text-sm backdrop-blur-sm">8</span> 
              Glassmorphism Style
            </h2>
            <input 
              type="date" 
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="w-full bg-white/20 border border-white/30 text-white placeholder-white/70 shadow-lg p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer backdrop-blur-lg [color-scheme:dark]"
            />
          </div>
        </section>

        {/* 9. Minimalist Underline */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-sm">9</span> 
            Minimalist Underline
          </h2>
          <div className="pt-2">
            <input 
              type="time" 
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="w-full bg-transparent border-0 border-b-2 border-gray-200 p-2 text-xl font-light text-gray-800 focus:ring-0 focus:border-black cursor-pointer px-0"
            />
          </div>
        </section>

        {/* 10. Botones de Presets Rápidos */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-sm">10</span> 
            Presets de Selección Rápida
          </h2>
          <p className="text-sm text-gray-500 mb-4">Combina botones predefinidos con un selector de fecha oculto/nativo.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <button className="px-3 py-1.5 rounded-full text-xs font-bold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition">Hoy</button>
            <button className="px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-100 transition">Mañana</button>
            <button className="px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-100 transition">Próxima Semana</button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <CalendarDays size={16} />
            </div>
            <input 
              type="date" 
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-pointer font-medium"
            />
          </div>
        </section>

      </div>
    </div>
  );
}
