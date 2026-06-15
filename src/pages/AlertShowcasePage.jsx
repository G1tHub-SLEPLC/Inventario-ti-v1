import { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, MessageSquare, Check, X, ShieldAlert } from 'lucide-react';

export default function AlertShowcasePage() {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-[#25306B] mb-8">Showcase: Modales de Advertencia y Observación</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* Estilo 1: Minimalista y Centrado (Estilo iOS / Clean) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Estilo 1: Minimalista y Centrado</h2>
          <p className="text-sm text-gray-500 mb-6">Un diseño limpio, bordes muy redondeados, centrado, ideal para llamar la atención sin ser agresivo.</p>
          <div className="flex gap-3 w-full mt-auto">
            <button onClick={() => setActiveModal('style1-confirm')} className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition">Ver Confirmación</button>
            <button onClick={() => setActiveModal('style1-prompt')} className="flex-1 py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition">Ver Observación</button>
          </div>
        </div>

        {/* Estilo 2: Moderno SaaS (Lateral con Icono) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Estilo 2: Moderno SaaS</h2>
          <p className="text-sm text-gray-500 mb-6">Alineación a la izquierda, íconos vibrantes con fondos de color, campos de texto con iconos integrados. Muy profesional.</p>
          <div className="flex gap-3 w-full mt-auto">
            <button onClick={() => setActiveModal('style2-confirm')} className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition">Ver Confirmación</button>
            <button onClick={() => setActiveModal('style2-prompt')} className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">Ver Observación</button>
          </div>
        </div>

        {/* Estilo 3: Glassmorphism y Neumorfismo (Atrevido) */}
        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-700 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-blue-500 rounded-full blur-[50px] opacity-20"></div>
          <div className="w-16 h-16 bg-slate-800/80 backdrop-blur-md border border-slate-700 text-blue-400 rounded-full flex items-center justify-center mb-4 z-10">
            <Info size={32} />
          </div>
          <h2 className="text-lg font-bold text-white mb-2 z-10">Estilo 3: Glassmorphism</h2>
          <p className="text-sm text-slate-400 mb-6 z-10">Un diseño oscuro, translúcido, con desenfoques de fondo y botones llamativos con gradientes.</p>
          <div className="flex gap-3 w-full mt-auto z-10">
            <button onClick={() => setActiveModal('style3-confirm')} className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-full text-sm font-semibold transition">Ver Confirmación</button>
            <button onClick={() => setActiveModal('style3-prompt')} className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full text-sm font-semibold transition shadow-lg shadow-blue-500/30">Ver Observación</button>
          </div>
        </div>

      </div>

      {/* --- MODALES RENDERIZADOS CONDICIONALMENTE --- */}

      {/* ESTILO 1 */}
      {activeModal === 'style1-confirm' && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[32px] shadow-2xl w-full max-w-sm transform transition-all animate-fade-in text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="text-amber-500 w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Equipo Duplicado</h3>
            <p className="text-sm text-gray-500 mb-8 px-2">
              El usuario ya tiene asignado un equipo principal (<strong>Notebook HP EliteBook</strong>). ¿Desea asignarle un segundo equipo de todas formas?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition">Cancelar</button>
              <button onClick={() => setActiveModal('style1-prompt')} className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold transition shadow-lg shadow-amber-500/30">Continuar</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'style1-prompt' && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[32px] shadow-2xl w-full max-w-md transform transition-all animate-fade-in text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="text-blue-500 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Observación Requerida</h3>
            <p className="text-sm text-gray-500 mb-6">
              Por favor, ingrese el motivo por el cual se está asignando un equipo adicional a este usuario.
            </p>
            <textarea 
              autoFocus
              placeholder="Ej: Equipo de reemplazo temporal..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none h-24 mb-6"
            ></textarea>
            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition">Cancelar</button>
              <button onClick={() => setActiveModal(null)} className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition shadow-lg shadow-blue-600/30">Guardar Asignación</button>
            </div>
          </div>
        </div>
      )}

      {/* ESTILO 2 */}
      {activeModal === 'style2-confirm' && (
        <div className="fixed inset-0 bg-slate-800/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="flex items-start p-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Advertencia de Duplicidad</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  El usuario seleccionado ya cuenta con un <strong>Notebook HP EliteBook</strong> asignado.
                  <br/><br/>
                  La asignación de múltiples equipos del mismo tipo requiere justificación. ¿Está seguro de que desea continuar?
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
              <button onClick={() => setActiveModal('style2-prompt')} className="px-5 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition shadow-sm flex items-center gap-2">
                <Check size={16} /> Continuar Asignación
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'style2-prompt' && (
        <div className="fixed inset-0 bg-slate-800/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-[#006BB9]/10 flex items-center justify-center text-[#006BB9]">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-lg font-bold text-[#25306B]">Justificación de Asignación</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Especifique el motivo de esta asignación adicional. Este campo es <strong>obligatorio</strong> y quedará registrado en el historial.
              </p>
              <div className="relative">
                <textarea 
                  autoFocus
                  placeholder="Ingrese la observación aquí..."
                  className="w-full pl-3 pr-3 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:border-[#006BB9] outline-none transition-all resize-none h-28"
                ></textarea>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 text-sm font-medium text-white bg-[#006BB9] hover:bg-[#25306B] rounded-lg transition shadow-sm">Confirmar y Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* ESTILO 3 */}
      {activeModal === 'style3-confirm' && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 border border-slate-700 p-8 rounded-3xl shadow-2xl shadow-blue-900/20 w-full max-w-md transform transition-all animate-fade-in relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500 rounded-full blur-[80px] opacity-20"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Conflicto de Equipos</h3>
                  <p className="text-amber-400/80 text-xs uppercase tracking-wider font-semibold mt-1">Acción requerida</p>
                </div>
              </div>
              
              <p className="text-sm text-slate-300 mb-8 leading-relaxed">
                El usuario ya posee un <strong>Notebook HP EliteBook</strong>. Si procedes con esta asignación, requerirás proporcionar una justificación auditable.
              </p>
              
              <div className="flex gap-4">
                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600 hover:border-slate-500 rounded-xl text-sm font-medium transition">Cancelar</button>
                <button onClick={() => setActiveModal('style3-prompt')} className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-amber-500/25">Proceder</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'style3-prompt' && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 border border-slate-700 p-8 rounded-3xl shadow-2xl shadow-blue-900/20 w-full max-w-md transform transition-all animate-fade-in relative overflow-hidden">
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2">Ingresar Observación</h3>
              <p className="text-sm text-slate-400 mb-6">
                Detalla por qué este usuario necesita un equipo secundario.
              </p>
              
              <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <textarea 
                  autoFocus
                  placeholder="Razón de la asignación..."
                  className="relative w-full bg-slate-900/80 border border-slate-600 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all resize-none h-32"
                ></textarea>
              </div>
              
              <div className="flex gap-4">
                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-xl text-sm font-medium transition">Cancelar</button>
                <button onClick={() => setActiveModal(null)} className="flex-[2] py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                  <Check size={18} /> Confirmar Asignación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
