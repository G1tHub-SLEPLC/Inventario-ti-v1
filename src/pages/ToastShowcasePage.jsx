import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastShowcasePage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 pb-20">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Toast Showcase</h1>
        <p className="text-slate-600">
          Esta página muestra todas las variaciones de notificaciones emergentes (Toasts) implementadas y alternativas.
          Puedes probar cómo se ven los distintos colores, bordes, iconos y tipografías.
        </p>
      </div>

      {/* 1. Estilo SOFT (Implementado Actualmente) */}
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Estilo 1: Diseño "Soft" (Implementado actualmente en AppShell)</h2>
        <p className="text-sm text-gray-500 mb-6">Usa fondos apastelados completos (bg-50) y texto de color oscuro (text-800) con bordes del mismo tono y rounded-xl.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Soft Success */}
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl shadow-lg px-4 py-3 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-xs uppercase tracking-wider">Operación Exitosa (Success)</p>
              <p className="text-xs opacity-90 mt-0.5 whitespace-pre-line">El equipo fue asignado correctamente al funcionario.</p>
            </div>
            <button className="text-emerald-400 hover:text-emerald-600 font-bold ml-2 shrink-0 text-lg leading-none">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Soft Error */}
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl shadow-lg px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-xs uppercase tracking-wider">Error en el servidor (Error)</p>
              <p className="text-xs opacity-90 mt-0.5 whitespace-pre-line">No se pudo subir la imagen del equipo.</p>
            </div>
            <button className="text-red-400 hover:text-red-600 font-bold ml-2 shrink-0 text-lg leading-none">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Soft Warning */}
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl shadow-lg px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-xs uppercase tracking-wider">Atención (Warning)</p>
              <p className="text-xs opacity-90 mt-0.5 whitespace-pre-line">Este usuario ya tiene esta licencia asignada.</p>
            </div>
            <button className="text-amber-400 hover:text-amber-600 font-bold ml-2 shrink-0 text-lg leading-none">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Soft Info (Propuesta) */}
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl shadow-lg px-4 py-3 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-xs uppercase tracking-wider">Información (Info)</p>
              <p className="text-xs opacity-90 mt-0.5 whitespace-pre-line">Sincronizando datos con el servidor principal.</p>
            </div>
            <button className="text-blue-400 hover:text-blue-600 font-bold ml-2 shrink-0 text-lg leading-none">
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 2. Estilo ALTERNATIVO (Barra Lateral) */}
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Estilo 2: Diseño "Alternativo" (Fondo blanco y barra lateral)</h2>
        <p className="text-sm text-gray-500 mb-6">Usa fondo blanco puro, sombra, bordes menos redondeados (rounded-r-lg o rounded-lg) y una franja de color intensa a la izquierda (border-l-4).</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Alternate Success */}
          <div className="bg-white border-l-4 border-emerald-500 rounded-r-lg shadow-md px-4 py-3 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-800">Operación Exitosa (Success)</p>
              <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-line">El equipo fue asignado correctamente al funcionario.</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 font-bold ml-2 shrink-0 text-lg leading-none">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Alternate Error */}
          <div className="bg-white border-l-4 border-red-500 rounded-r-lg shadow-md px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-800">Error en el servidor (Error)</p>
              <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-line">No se pudo subir la imagen del equipo.</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 font-bold ml-2 shrink-0 text-lg leading-none">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Alternate Warning */}
          <div className="bg-white border-l-4 border-amber-500 rounded-r-lg shadow-md px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-800">Atención (Warning)</p>
              <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-line">Este usuario ya tiene esta licencia asignada.</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 font-bold ml-2 shrink-0 text-lg leading-none">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Alternate Info */}
          <div className="bg-white border-l-4 border-blue-500 rounded-r-lg shadow-md px-4 py-3 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-800">Información (Info)</p>
              <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-line">Sincronizando datos con el servidor principal.</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 font-bold ml-2 shrink-0 text-lg leading-none">
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 3. Estilo EXPERIMENTAL (Oscuro) */}
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Estilo 3: Diseño "Dark" (Experimental)</h2>
        <p className="text-sm text-gray-500 mb-6">Fondos oscuros tipo consola o Mac OS, destacan muy bien sobre interfaces claras.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100 p-6 rounded-xl border border-dashed border-slate-300">
          
          <div className="bg-slate-800 border border-slate-700 text-slate-100 rounded-xl shadow-xl px-4 py-3 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-xs uppercase tracking-wider text-emerald-400">Operación Exitosa</p>
              <p className="text-xs text-slate-300 mt-0.5 whitespace-pre-line">El equipo fue asignado correctamente.</p>
            </div>
            <button className="text-slate-400 hover:text-white font-bold ml-2 shrink-0 text-lg leading-none">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-800 border border-slate-700 text-slate-100 rounded-xl shadow-xl px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-xs uppercase tracking-wider text-red-400">Error</p>
              <p className="text-xs text-slate-300 mt-0.5 whitespace-pre-line">No se pudo guardar la información.</p>
            </div>
            <button className="text-slate-400 hover:text-white font-bold ml-2 shrink-0 text-lg leading-none">
              <X className="w-4 h-4" />
            </button>
          </div>
          
        </div>
      </section>

    </div>
  );
}
