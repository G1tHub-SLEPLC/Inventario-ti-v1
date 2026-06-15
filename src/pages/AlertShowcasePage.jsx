import { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, MessageSquare, Check, X, ShieldAlert, Cpu, Terminal, Sparkles, Building, Briefcase } from 'lucide-react';

// Wrapper para todos los modales para permitir redimensionado y cierre
function ModalWrapper({ children, onClose, modalWidth, setModalWidth }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 flex-col">
      {/* Controles superiores para redimensionar */}
      <div className="bg-white/90 backdrop-blur rounded-full px-6 py-3 mb-6 shadow-xl flex items-center gap-4 animate-fade-in border border-white/50">
        <span className="text-sm font-bold text-gray-700">Ancho de Ventana:</span>
        <input 
          type="range" 
          min="300" max="1000" 
          value={modalWidth} 
          onChange={(e) => setModalWidth(e.target.value)}
          className="w-48 accent-[#006BB9]"
        />
        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{modalWidth}px</span>
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        <button onClick={onClose} className="bg-rose-100 hover:bg-rose-200 text-rose-600 px-4 py-1.5 rounded-full text-sm font-bold transition">Cerrar</button>
      </div>

      <div 
        style={{ width: `${modalWidth}px`, transition: 'width 0.2s ease-out' }}
        className="max-w-full overflow-y-auto max-h-[80vh] custom-scrollbar"
      >
        {children}
      </div>
    </div>
  );
}

export default function AlertShowcasePage() {
  const [activeModal, setActiveModal] = useState(null);
  const [modalWidth, setModalWidth] = useState(450); // ancho inicial
  
  const styles = [
    {
      id: 1, name: "Minimalista iOS",
      desc: "Limpio, centrado, bordes redondeados.",
      icon: <AlertTriangle />
    },
    {
      id: 2, name: "Moderno SaaS",
      desc: "Lateral con icono, profesional.",
      icon: <ShieldAlert />
    },
    {
      id: 3, name: "Glassmorphism",
      desc: "Oscuro translúcido con desenfoques.",
      icon: <Sparkles />
    },
    {
      id: 4, name: "Corporativo Estricto",
      desc: "Líneas rectas, bordes cuadrados.",
      icon: <Building />
    },
    {
      id: 5, name: "Material Design",
      desc: "Elevación y sombras marcadas.",
      icon: <Briefcase />
    },
    {
      id: 6, name: "Cyberpunk",
      desc: "Bordes neón, fondo oscuro.",
      icon: <Cpu />
    },
    {
      id: 7, name: "Neumorfismo (Soft UI)",
      desc: "Sombras que simulan relieve 3D.",
      icon: <Info />
    },
    {
      id: 8, name: "Minimal Extremo",
      desc: "Sin bordes, mucha sombra.",
      icon: <MessageSquare />
    },
    {
      id: 9, name: "Retro UI",
      desc: "Bordes gruesos negros, estilo 90s.",
      icon: <Terminal />
    },
    {
      id: 10, name: "Consola Hacker",
      desc: "Texto verde, fondo negro.",
      icon: <Terminal />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 pb-32">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-[#25306B] mb-2 tracking-tight">Showcase: Diseños de Alerta</h1>
        <p className="text-gray-600 mb-10 text-lg">Haz clic en los botones para ver los 10 estilos diferentes. Una vez abierto, podrás modificar el tamaño de la ventana con un deslizador en la parte superior.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {styles.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Estilo {s.id}</h2>
              <h3 className="text-sm font-semibold text-[#006BB9] mb-2">{s.name}</h3>
              <p className="text-sm text-gray-500 mb-6 flex-1">{s.desc}</p>
              
              <div className="flex flex-col gap-2">
                <button onClick={() => { setActiveModal(`s${s.id}-confirm`); setModalWidth(450); }} className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm font-bold transition">Confirmación</button>
                <button onClick={() => { setActiveModal(`s${s.id}-prompt`); setModalWidth(450); }} className="w-full py-2 bg-[#006BB9] hover:bg-[#25306B] text-white rounded-lg text-sm font-bold transition">Observación</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeModal && (
        <ModalWrapper onClose={() => setActiveModal(null)} modalWidth={modalWidth} setModalWidth={setModalWidth}>
          {/* ESTILO 1: Minimalista iOS */}
          {activeModal === 's1-confirm' && (
            <div className="bg-white p-8 rounded-[32px] shadow-2xl text-center w-full">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="text-amber-500 w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Equipo Duplicado</h3>
              <p className="text-sm text-gray-500 mb-8 px-2">El usuario ya tiene asignado un <strong>Notebook HP</strong>. ¿Desea asignarle un segundo equipo?</p>
              <div className="flex gap-3">
                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold">Cancelar</button>
                <button onClick={() => setActiveModal('s1-prompt')} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/30">Continuar</button>
              </div>
            </div>
          )}
          {activeModal === 's1-prompt' && (
            <div className="bg-white p-8 rounded-[32px] shadow-2xl text-center w-full">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-blue-500 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Observación Requerida</h3>
              <p className="text-sm text-gray-500 mb-6">Por favor, ingrese el motivo de esta asignación adicional.</p>
              <textarea placeholder="Ej: Equipo de reemplazo..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 mb-6"></textarea>
              <div className="flex gap-3">
                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold">Cancelar</button>
                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold">Guardar</button>
              </div>
            </div>
          )}

          {/* ESTILO 2: Moderno SaaS */}
          {activeModal === 's2-confirm' && (
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full">
              <div className="flex p-6">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4 shrink-0"><AlertCircle className="text-orange-600" /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Advertencia de Duplicidad</h3>
                  <p className="text-sm text-slate-500">El usuario seleccionado ya cuenta con un <strong>Notebook</strong>. La asignación múltiple requiere justificación.</p>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
                <button onClick={() => setActiveModal(null)} className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button onClick={() => setActiveModal('s2-prompt')} className="px-5 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg">Continuar</button>
              </div>
            </div>
          )}
          {activeModal === 's2-prompt' && (
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><MessageSquare size={20} /></div>
                  <h3 className="text-lg font-bold text-slate-800">Justificación</h3>
                </div>
                <textarea placeholder="Motivo obligatorio..." className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none resize-none h-28"></textarea>
              </div>
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
                <button onClick={() => setActiveModal(null)} className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button onClick={() => setActiveModal(null)} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Confirmar</button>
              </div>
            </div>
          )}

          {/* ESTILO 3: Glassmorphism */}
          {activeModal === 's3-confirm' && (
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-8 rounded-3xl shadow-2xl w-full relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500 rounded-full blur-[60px] opacity-20"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/50 rounded-2xl flex items-center justify-center text-amber-400"><ShieldAlert /></div>
                  <div><h3 className="text-xl font-bold text-white">Conflicto de Equipos</h3><p className="text-amber-400 text-xs uppercase font-bold tracking-wider">Acción requerida</p></div>
                </div>
                <p className="text-sm text-slate-300 mb-8">El usuario ya posee un <strong>Notebook HP</strong>. Requiere justificación.</p>
                <div className="flex gap-4">
                  <button onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold border border-slate-600">Cancelar</button>
                  <button onClick={() => setActiveModal('s3-prompt')} className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20">Proceder</button>
                </div>
              </div>
            </div>
          )}
          {activeModal === 's3-prompt' && (
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-8 rounded-3xl shadow-2xl w-full relative overflow-hidden">
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500 rounded-full blur-[60px] opacity-20"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Ingresar Observación</h3>
                <p className="text-sm text-slate-400 mb-6">Detalla por qué este usuario necesita un equipo secundario.</p>
                <textarea autoFocus placeholder="Razón de la asignación..." className="w-full bg-slate-800/80 border border-slate-600 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:border-blue-400 outline-none resize-none h-32 mb-6"></textarea>
                <div className="flex gap-4">
                  <button onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-xl text-sm font-bold">Cancelar</button>
                  <button onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30">Confirmar</button>
                </div>
              </div>
            </div>
          )}

          {/* ESTILO 4: Corporativo Estricto */}
          {activeModal === 's4-confirm' && (
            <div className="bg-white border-t-4 border-[#25306B] rounded-none shadow-2xl w-full">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#25306B] mb-4 uppercase tracking-tight">ALERTA: EQUIPO ASIGNADO PREVIAMENTE</h3>
                <div className="w-full h-px bg-gray-200 mb-4"></div>
                <p className="text-gray-700 font-medium mb-8">El sistema detecta que el usuario seleccionado ya dispone de un equipo clasificado como computador principal. Debe confirmar para anular esta restricción.</p>
                <div className="flex justify-end gap-0">
                  <button onClick={() => setActiveModal(null)} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold uppercase text-xs tracking-wider">CANCELAR</button>
                  <button onClick={() => setActiveModal('s4-prompt')} className="px-6 py-2 bg-[#25306B] hover:bg-[#1a2250] text-white font-bold uppercase text-xs tracking-wider">CONFIRMAR EXCEPCIÓN</button>
                </div>
              </div>
            </div>
          )}
          {activeModal === 's4-prompt' && (
            <div className="bg-white border-t-4 border-[#25306B] rounded-none shadow-2xl w-full">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#25306B] mb-4 uppercase tracking-tight">REGISTRO DE OBSERVACIÓN OBLIGATORIA</h3>
                <div className="w-full h-px bg-gray-200 mb-4"></div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Motivo de asignación (Requerido)</label>
                <textarea className="w-full bg-white border border-gray-300 rounded-none p-3 text-sm focus:border-[#25306B] outline-none h-28 mb-6"></textarea>
                <div className="flex justify-end gap-0">
                  <button onClick={() => setActiveModal(null)} className="px-6 py-2 bg-gray-200 text-gray-800 font-bold uppercase text-xs tracking-wider">CANCELAR</button>
                  <button onClick={() => setActiveModal(null)} className="px-6 py-2 bg-[#006BB9] text-white font-bold uppercase text-xs tracking-wider">GUARDAR REGISTRO</button>
                </div>
              </div>
            </div>
          )}

          {/* ESTILO 5: Material Design */}
          {activeModal === 's5-confirm' && (
            <div className="bg-white rounded p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full">
              <h3 className="text-[20px] font-medium text-gray-900 mb-4">¿Asignar segundo equipo?</h3>
              <p className="text-[15px] text-gray-600 mb-8 leading-relaxed">El usuario ya posee un computador. Al continuar, se te pedirá una observación obligatoria para los registros.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-[#006BB9] font-medium uppercase text-sm hover:bg-[#006BB9]/10 rounded transition-colors">Cancelar</button>
                <button onClick={() => setActiveModal('s5-prompt')} className="px-4 py-2 bg-[#006BB9] text-white font-medium uppercase text-sm shadow-md hover:shadow-lg rounded transition-shadow">Aceptar</button>
              </div>
            </div>
          )}
          {activeModal === 's5-prompt' && (
            <div className="bg-white rounded p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full">
              <h3 className="text-[20px] font-medium text-gray-900 mb-4">Añadir observación</h3>
              <div className="relative mb-6 mt-4">
                <textarea className="peer w-full border-b-2 border-gray-300 bg-transparent py-2 text-sm focus:border-[#006BB9] focus:outline-none h-16 resize-none" placeholder=" "></textarea>
                <label className="absolute left-0 top-2 text-sm text-gray-500 transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#006BB9] peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">Motivo de asignación *</label>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-[#006BB9] font-medium uppercase text-sm hover:bg-[#006BB9]/10 rounded transition-colors">Cancelar</button>
                <button onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#006BB9] text-white font-medium uppercase text-sm shadow-md hover:shadow-lg rounded transition-shadow">Guardar</button>
              </div>
            </div>
          )}

          {/* ESTILO 6: Cyberpunk */}
          {activeModal === 's6-confirm' && (
            <div className="bg-black border-2 border-yellow-400 p-8 w-full relative group">
              <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-2 py-1 uppercase">Warning_01</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4 uppercase tracking-widest">[ DUPLICATE_HARDWARE_DETECTED ]</h3>
              <p className="text-yellow-400/80 font-mono mb-8">&gt; USER ALREADY HAS A NOTEBOOK ASSIGNED.<br/>&gt; PROCEED TO OVERRIDE?</p>
              <div className="flex gap-4 font-mono">
                <button onClick={() => setActiveModal(null)} className="border border-yellow-400 text-yellow-400 px-6 py-2 uppercase hover:bg-yellow-400 hover:text-black transition-colors">ABORT</button>
                <button onClick={() => setActiveModal('s6-prompt')} className="bg-yellow-400 text-black px-6 py-2 font-bold uppercase hover:bg-white hover:text-black transition-colors">OVERRIDE</button>
              </div>
            </div>
          )}
          {activeModal === 's6-prompt' && (
            <div className="bg-black border-2 border-cyan-400 p-8 w-full relative">
              <div className="absolute top-0 left-0 bg-cyan-400 text-black text-xs font-bold px-2 py-1 uppercase">Input_Required</div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-4 uppercase tracking-widest mt-4">_JUSTIFICATION LOG</h3>
              <textarea className="w-full bg-gray-900 border border-cyan-400/50 text-cyan-400 font-mono p-4 outline-none focus:border-cyan-400 h-32 mb-6" placeholder="> Enter reason here..."></textarea>
              <div className="flex justify-end gap-4 font-mono">
                <button onClick={() => setActiveModal(null)} className="text-cyan-400 px-6 py-2 hover:underline">CANCEL</button>
                <button onClick={() => setActiveModal(null)} className="bg-cyan-400 text-black px-6 py-2 font-bold uppercase hover:bg-cyan-300">SUBMIT_LOG</button>
              </div>
            </div>
          )}

          {/* ESTILO 7: Neumorfismo */}
          {activeModal === 's7-confirm' && (
            <div className="bg-[#e0e5ec] p-8 rounded-3xl w-full shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)]">
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-orange-500 shadow-[inset_6px_6px_10px_0_rgba(0,0,0,0.1),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)]"><AlertTriangle /></div>
              <h3 className="text-xl font-bold text-gray-700 mb-2 text-center">Equipo Duplicado</h3>
              <p className="text-gray-500 text-center mb-8">El usuario seleccionado ya cuenta con un Notebook. ¿Deseas asignarlo igual?</p>
              <div className="flex gap-4">
                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 rounded-2xl text-gray-600 font-bold shadow-[6px_6px_10px_0_rgba(0,0,0,0.1),-6px_-6px_10px_0_rgba(255,255,255,0.8)] active:shadow-[inset_4px_4px_6px_0_rgba(0,0,0,0.1),inset_-4px_-4px_6px_0_rgba(255,255,255,0.8)] transition-all">Cancelar</button>
                <button onClick={() => setActiveModal('s7-prompt')} className="flex-1 py-3 rounded-2xl text-orange-600 font-bold shadow-[6px_6px_10px_0_rgba(0,0,0,0.1),-6px_-6px_10px_0_rgba(255,255,255,0.8)] active:shadow-[inset_4px_4px_6px_0_rgba(0,0,0,0.1),inset_-4px_-4px_6px_0_rgba(255,255,255,0.8)] transition-all">Continuar</button>
              </div>
            </div>
          )}
          {activeModal === 's7-prompt' && (
            <div className="bg-[#e0e5ec] p-8 rounded-3xl w-full shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)]">
              <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">Observación Requerida</h3>
              <textarea placeholder="Motivo de asignación..." className="w-full bg-[#e0e5ec] p-4 rounded-2xl outline-none text-gray-700 mb-8 shadow-[inset_6px_6px_10px_0_rgba(0,0,0,0.1),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)] h-28 resize-none"></textarea>
              <div className="flex gap-4">
                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 rounded-2xl text-gray-600 font-bold shadow-[6px_6px_10px_0_rgba(0,0,0,0.1),-6px_-6px_10px_0_rgba(255,255,255,0.8)] active:shadow-[inset_4px_4px_6px_0_rgba(0,0,0,0.1)]">Cancelar</button>
                <button onClick={() => setActiveModal(null)} className="flex-1 py-3 rounded-2xl text-blue-600 font-bold shadow-[6px_6px_10px_0_rgba(0,0,0,0.1),-6px_-6px_10px_0_rgba(255,255,255,0.8)] active:shadow-[inset_4px_4px_6px_0_rgba(0,0,0,0.1)]">Guardar</button>
              </div>
            </div>
          )}

          {/* ESTILO 8: Minimal Extremo */}
          {activeModal === 's8-confirm' && (
            <div className="bg-white p-12 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] rounded-[40px] w-full text-center">
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">¿Seguro?</h3>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed font-medium">El usuario ya tiene un equipo asignado. Esto requiere una observación manual.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => setActiveModal('s8-prompt')} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-colors">Sí, continuar</button>
                <button onClick={() => setActiveModal(null)} className="w-full py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors">Cancelar</button>
              </div>
            </div>
          )}
          {activeModal === 's8-prompt' && (
            <div className="bg-white p-12 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] rounded-[40px] w-full text-center">
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-6">El motivo.</h3>
              <textarea autoFocus placeholder="Escribe aquí por qué se asigna..." className="w-full border-b-2 border-gray-200 text-center text-xl font-medium focus:border-gray-900 outline-none pb-4 mb-10 h-16 resize-none"></textarea>
              <div className="flex gap-4">
                <button onClick={() => setActiveModal(null)} className="flex-1 py-4 text-gray-500 font-bold hover:text-gray-900 bg-gray-100 rounded-2xl transition-colors">Cancelar</button>
                <button onClick={() => setActiveModal(null)} className="flex-1 py-4 bg-[#006BB9] text-white rounded-2xl font-bold text-lg hover:bg-[#005a9c] transition-colors">Guardar</button>
              </div>
            </div>
          )}

          {/* ESTILO 9: Retro UI */}
          {activeModal === 's9-confirm' && (
            <div className="bg-[#c0c0c0] border-[3px] border-white border-b-gray-800 border-r-gray-800 p-1 w-full font-mono text-sm">
              <div className="bg-blue-800 text-white font-bold px-2 py-1 flex justify-between">
                <span>Atencion.exe</span>
                <button onClick={() => setActiveModal(null)} className="bg-[#c0c0c0] border-2 border-white border-b-gray-800 border-r-gray-800 text-black px-1 leading-none">X</button>
              </div>
              <div className="p-6 flex gap-4">
                <div className="text-4xl">⚠️</div>
                <div>
                  <p className="mb-6 mt-2">El usuario ya posee equipo asignado. ¿Desea sobrescribir la norma?</p>
                  <div className="flex gap-4 justify-end">
                    <button onClick={() => setActiveModal('s9-prompt')} className="px-6 py-1 bg-[#c0c0c0] border-2 border-white border-b-gray-800 border-r-gray-800 active:border-gray-800 active:border-b-white active:border-r-white">OK</button>
                    <button onClick={() => setActiveModal(null)} className="px-6 py-1 bg-[#c0c0c0] border-2 border-white border-b-gray-800 border-r-gray-800 active:border-gray-800 active:border-b-white active:border-r-white">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeModal === 's9-prompt' && (
            <div className="bg-[#c0c0c0] border-[3px] border-white border-b-gray-800 border-r-gray-800 p-1 w-full font-mono text-sm">
              <div className="bg-blue-800 text-white font-bold px-2 py-1 flex justify-between">
                <span>Input_Observacion.exe</span>
                <button onClick={() => setActiveModal(null)} className="bg-[#c0c0c0] border-2 border-white border-b-gray-800 border-r-gray-800 text-black px-1 leading-none">X</button>
              </div>
              <div className="p-4">
                <p className="mb-2">Por favor ingrese justificacion:</p>
                <textarea className="w-full bg-white border-2 border-gray-800 border-b-white border-r-white p-2 h-20 mb-4 outline-none resize-none"></textarea>
                <div className="flex gap-4 justify-end">
                  <button onClick={() => setActiveModal(null)} className="px-6 py-1 bg-[#c0c0c0] border-2 border-white border-b-gray-800 border-r-gray-800 active:border-gray-800 active:border-b-white active:border-r-white">Guardar</button>
                </div>
              </div>
            </div>
          )}

          {/* ESTILO 10: Terminal / Consola Hacker */}
          {activeModal === 's10-confirm' && (
            <div className="bg-black border border-green-500/30 p-6 w-full font-mono text-green-500 shadow-[0_0_20px_rgba(0,255,0,0.1)]">
              <div className="flex justify-between items-center mb-4 border-b border-green-500/30 pb-2">
                <span>root@inventario:~# ./check_duplicate.sh</span>
                <span className="animate-pulse">_</span>
              </div>
              <p className="mb-2">&gt;&gt;&gt; WARNING: USER_HAS_EQUIPMENT=TRUE</p>
              <p className="mb-6">&gt;&gt;&gt; RULE OVERRIDE REQUIRES LOG ENTRY. PROCEED? (y/n)</p>
              <div className="flex gap-6">
                <button onClick={() => setActiveModal('s10-prompt')} className="hover:bg-green-500 hover:text-black px-2 py-1 transition-colors">[Y] YES_PROCEED</button>
                <button onClick={() => setActiveModal(null)} className="hover:bg-green-500 hover:text-black px-2 py-1 transition-colors">[N] NO_ABORT</button>
              </div>
            </div>
          )}
          {activeModal === 's10-prompt' && (
            <div className="bg-black border border-green-500/30 p-6 w-full font-mono text-green-500 shadow-[0_0_20px_rgba(0,255,0,0.1)]">
              <div className="flex justify-between items-center mb-4 border-b border-green-500/30 pb-2">
                <span>root@inventario:~# ./save_log.sh</span>
                <span className="animate-pulse">_</span>
              </div>
              <p className="mb-2">Enter reason for override:</p>
              <textarea className="w-full bg-black text-green-500 border-none outline-none resize-none h-24 mb-4 focus:ring-1 focus:ring-green-500 p-2" autoFocus></textarea>
              <div className="flex gap-6">
                <button onClick={() => setActiveModal(null)} className="bg-green-500 text-black px-4 py-1 hover:bg-green-400 font-bold">SUBMIT_LOG</button>
                <button onClick={() => setActiveModal(null)} className="hover:bg-green-500 hover:text-black px-4 py-1 border border-green-500 transition-colors">CANCEL</button>
              </div>
            </div>
          )}
        </ModalWrapper>
      )}
    </div>
  );
}
