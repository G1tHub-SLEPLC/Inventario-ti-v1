import { useState } from 'react';
import { CheckCircle, AlertCircle, Info, Clock, User, UserCircle, X, Check, Search } from 'lucide-react';



export default function BadgeShowcasePage() {
  const [testName, setTestName] = useState('Cristian Fernando Gutiérrez');

  const [search1, setSearch1] = useState('');
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [selected1, setSelected1] = useState('');

  const [search2, setSearch2] = useState('');
  const [showDropdown2, setShowDropdown2] = useState(false);
  const [selected2, setSelected2] = useState('');

  const [search3, setSearch3] = useState('');
  const [showDropdown3, setShowDropdown3] = useState(false);
  const [selected3, setSelected3] = useState('');

  const [search4, setSearch4] = useState('');
  const [showDropdown4, setShowDropdown4] = useState(false);
  const [selected4, setSelected4] = useState('');

  const [search5, setSearch5] = useState('');
  const [showDropdown5, setShowDropdown5] = useState(false);
  const [selected5, setSelected5] = useState('');

  const [search6, setSearch6] = useState('');
  const [showDropdown6, setShowDropdown6] = useState(false);
  const [selected6, setSelected6] = useState('');

  const mockUsers = [
    { nombre: 'Cristian Fernando Gutiérrez', equipos: 3 },
    { nombre: 'Ana María Silva', equipos: 1 },
    { nombre: 'Roberto Muñoz', equipos: 0 },
    { nombre: 'Alicia Méndez', equipos: 5 },
    { nombre: 'Fernando Solís', equipos: 2 },
    { nombre: 'Pedro Pascal', equipos: 4 },
  ];

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Galería de Badges (Tailwind)</h1>
        <p className="text-gray-500">
          Aquí tienes 20 estilos diferentes de badges. Revísalos y dime cuál te gusta más para implementarlo en tus tablas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* 1. SOFT / PASTEL */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">1. Soft / Pastel (Actual)</h2>
          <div className="flex flex-wrap gap-3">
            <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase">Asignado</span>
            <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase">Disponible</span>
            <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase">Préstamo</span>
          </div>
        </section>

        {/* 2. SOFT CON BORDE */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">2. Soft + Borde Fino</h2>
          <div className="flex flex-wrap gap-3">
            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase">Asignado</span>
            <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase">Disponible</span>
            <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase">Préstamo</span>
          </div>
        </section>

        {/* 3. SÓLIDO (SOLID) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">3. Sólido / Fuerte</h2>
          <div className="flex flex-wrap gap-3">
            <span className="bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase shadow-sm">Asignado</span>
            <span className="bg-[#90d039] text-white px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase shadow-sm">Disponible</span>
            <span className="bg-purple-600 text-white px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase shadow-sm">Préstamo</span>
          </div>
        </section>

        {/* 4. CONTORNO (OUTLINE) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">4. Contorno (Outline)</h2>
          <div className="flex flex-wrap gap-3">
            <span className="border-2 border-blue-500 text-blue-600 px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase bg-transparent">Asignado</span>
            <span className="border-2 border-green-500 text-green-600 px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase bg-transparent">Disponible</span>
            <span className="border-2 border-purple-500 text-purple-600 px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase bg-transparent">Préstamo</span>
          </div>
        </section>

        {/* 5. DOT (PUNTO MINIMALISTA) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">5. Minimalista con Punto</h2>
          <div className="flex flex-col gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Asignado
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Disponible
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> Préstamo
            </span>
          </div>
        </section>

        {/* 6. DOT CON FONDO (MODERNO) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">6. Punto + Fondo Suave</h2>
          <div className="flex flex-col items-start gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Asignado
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-800 bg-green-50 border border-green-100 px-2.5 py-1 rounded uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Disponible
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Préstamo
            </span>
          </div>
        </section>

        {/* 7. PILL (REDONDEADOS) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">7. Pill (Cápsula)</h2>
          <div className="flex flex-wrap gap-3">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-blue-200">Asignado</span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-green-200">Disponible</span>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-purple-200">Préstamo</span>
          </div>
        </section>

        {/* 8. DARK MODE (CONTRASTE ALTO) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">8. Oscuros / Dark Mode (Fondo Negro de Ejemplo)</h2>
          <div className="flex flex-wrap gap-3 p-4 bg-slate-900 rounded-lg">
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded text-xs font-bold uppercase">Asignado</span>
            <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-2.5 py-1 rounded text-xs font-bold uppercase">Disponible</span>
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded text-xs font-bold uppercase">Préstamo</span>
          </div>
        </section>

        {/* 8.1 DARK MODE EN FONDO BLANCO */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-[#006BB9] uppercase tracking-wider mb-4">8.1 Opción 8 sobre Fondo Blanco</h2>
          <div className="flex flex-wrap gap-3 p-4 bg-white rounded-lg border border-dashed border-gray-300">
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded text-xs font-bold uppercase">Asignado</span>
            <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-2.5 py-1 rounded text-xs font-bold uppercase">Disponible</span>
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded text-xs font-bold uppercase">Préstamo</span>
          </div>
        </section>

        {/* 9. DEGRADADO (GRADIENT) PREMIUM */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">9. Degradado Premium</h2>
          <div className="flex flex-wrap gap-3">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase shadow-md border border-indigo-700">Asignado</span>
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase shadow-md border border-teal-600">Disponible</span>
            <span className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase shadow-md border border-fuchsia-600">Préstamo</span>
          </div>
        </section>

        {/* 10. CON ICONOS */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">10. Con Ícono Lucide</h2>
          <div className="flex flex-col items-start gap-3">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase border border-blue-200">
              <Info size={12} /> Asignado
            </span>
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase border border-green-200">
              <CheckCircle size={12} /> Disponible
            </span>
            <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase border border-purple-200">
              <Clock size={12} /> Préstamo
            </span>
          </div>
        </section>

        {/* 11. NEUMORPHISM (SOMBRAS) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">11. Elevado (Sombra suave)</h2>
          <div className="flex flex-wrap gap-3">
            <span className="bg-white text-blue-600 px-3 py-1 rounded text-[10px] font-bold tracking-wide uppercase shadow-[0_2px_8px_rgba(37,99,235,0.15)] border border-blue-100">Asignado</span>
            <span className="bg-white text-green-600 px-3 py-1 rounded text-[10px] font-bold tracking-wide uppercase shadow-[0_2px_8px_rgba(22,163,74,0.15)] border border-green-100">Disponible</span>
            <span className="bg-white text-purple-600 px-3 py-1 rounded text-[10px] font-bold tracking-wide uppercase shadow-[0_2px_8px_rgba(147,51,234,0.15)] border border-purple-100">Préstamo</span>
          </div>
        </section>

        {/* 12. TEXTO SUBRAYADO (GHOST) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">12. Texto Minimalista (Ghost)</h2>
          <div className="flex flex-wrap gap-4">
            <span className="text-blue-600 text-xs font-bold tracking-wide uppercase border-b-2 border-blue-500 pb-0.5">Asignado</span>
            <span className="text-green-600 text-xs font-bold tracking-wide uppercase border-b-2 border-green-500 pb-0.5">Disponible</span>
            <span className="text-purple-600 text-xs font-bold tracking-wide uppercase border-b-2 border-purple-500 pb-0.5">Préstamo</span>
          </div>
        </section>

        {/* 13. ALTA VISIBILIDAD (POLICÍA / INDUSTRIAL) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">13. Industrial (Tag)</h2>
          <div className="flex flex-wrap gap-3">
            <span className="bg-gray-800 text-blue-400 px-2 py-0.5 rounded-sm text-[10px] font-black tracking-widest uppercase border-l-4 border-blue-500">Asignado</span>
            <span className="bg-gray-800 text-green-400 px-2 py-0.5 rounded-sm text-[10px] font-black tracking-widest uppercase border-l-4 border-green-500">Disponible</span>
            <span className="bg-gray-800 text-purple-400 px-2 py-0.5 rounded-sm text-[10px] font-black tracking-widest uppercase border-l-4 border-purple-500">Préstamo</span>
          </div>
        </section>

        {/* 14. ETIQUETA LATERAL CORTADA */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">14. Tag Lateral</h2>
          <div className="flex flex-col gap-2 -ml-6">
            <span className="bg-blue-100 text-blue-800 pl-8 pr-3 py-1 rounded-r-full text-xs font-bold tracking-wide uppercase w-max border border-l-0 border-blue-200">Asignado</span>
            <span className="bg-green-100 text-green-800 pl-8 pr-3 py-1 rounded-r-full text-xs font-bold tracking-wide uppercase w-max border border-l-0 border-green-200">Disponible</span>
            <span className="bg-purple-100 text-purple-800 pl-8 pr-3 py-1 rounded-r-full text-xs font-bold tracking-wide uppercase w-max border border-l-0 border-purple-200">Préstamo</span>
          </div>
        </section>

        {/* 15. ALERTA STATUS (COMBINADO) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">15. Tarjeta de Estado</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-2 rounded-lg border border-blue-100 bg-blue-50/50">
              <span className="text-xs font-semibold text-gray-600">ID-1002</span>
              <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[10px] font-bold">ASIGNADO</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg border border-green-100 bg-green-50/50">
              <span className="text-xs font-semibold text-gray-600">ID-1003</span>
              <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded text-[10px] font-bold">DISPONIBLE</span>
            </div>
          </div>
        </section>

      </div>

      {/* SECCIÓN DE AVATARES */}
      <div className="border-t border-gray-200 pt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Variantes de Badges con Avatar (Funcionarios)</h2>
        <p className="text-gray-500 mb-6">
          A continuación tienes ejemplos de cómo podemos mostrar el nombre del funcionario asignado usando iniciales, fotos o iconos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 16. AVATAR INICIALES SUAVE */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">16. Iniciales (Tono Suave / Soft Blue)</h2>
            <div className="flex flex-col gap-3 items-start">
              <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 pl-1 pr-3 py-1 rounded-full text-xs font-semibold border border-blue-200 shadow-sm">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black uppercase">
                  CG
                </span>
                Cristian Gutiérrez
              </span>
              <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 pl-1 pr-3 py-1 rounded-full text-xs font-semibold border border-indigo-200 shadow-sm">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black uppercase">
                  AM
                </span>
                Ana María Silva
              </span>
            </div>
          </section>

          {/* 17. AVATAR INICIALES DEGRADADO */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">17. Iniciales (Degradado Premium)</h2>
            <div className="flex flex-col gap-3 items-start">
              <span className="inline-flex items-center gap-2 bg-slate-50 text-slate-800 pl-1 pr-3 py-1 rounded-full text-xs font-semibold border border-slate-200 shadow-sm">
                <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[9px] font-bold uppercase shadow-sm">
                  CF
                </span>
                Cristian Fernando
              </span>
              <span className="inline-flex items-center gap-2 bg-slate-50 text-slate-800 pl-1 pr-3 py-1 rounded-full text-xs font-semibold border border-slate-200 shadow-sm">
                <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center text-[9px] font-bold uppercase shadow-sm">
                  JP
                </span>
                Juan Pérez
              </span>
            </div>
          </section>

          {/* 18. AVATAR CON SILUETA (ICONO) */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">18. Con Silueta (Icono Lucide)</h2>
            <div className="flex flex-col gap-3 items-start">
              <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 pl-1 pr-3 py-1 rounded-full text-xs font-semibold border border-indigo-200 shadow-sm">
                <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center">
                  <User size={11} className="stroke-[2.5]" />
                </span>
                Carlos Soto
              </span>
              <span className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 pl-1 pr-3 py-1 rounded-full text-xs font-semibold border border-sky-200 shadow-sm">
                <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-700 flex items-center justify-center">
                  <UserCircle size={13} className="stroke-[2.5]" />
                </span>
                Roberto Muñoz
              </span>
            </div>
          </section>

          {/* 19. AVATAR CON FOTO */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">19. Con Foto / Imagen Real</h2>
            <div className="flex flex-col gap-3 items-start">
              <span className="inline-flex items-center gap-2 bg-white text-gray-800 pl-1 pr-3 py-1 rounded-full text-xs font-semibold border border-gray-200 shadow-sm">
                <img 
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-gray-200" 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" 
                  alt="Ana María" 
                />
                Ana María Silva
              </span>
              <span className="inline-flex items-center gap-2 bg-white text-gray-800 pl-1 pr-3 py-1 rounded-full text-xs font-semibold border border-gray-200 shadow-sm">
                <img 
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-gray-200" 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" 
                  alt="Cristian Gutiérrez" 
                />
                Cristian Gutiérrez
              </span>
            </div>
          </section>

          {/* 20. AVATAR PILL COMPACTO */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">20. Cápsula Compacta (Pill)</h2>
            <div className="flex flex-col gap-3 items-start">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 p-0.5 pr-2.5 rounded-full text-xs font-bold border border-emerald-200">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black">
                  AM
                </span>
                Alicia Méndez
              </span>
              <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 p-0.5 pr-2.5 rounded-full text-xs font-bold border border-rose-200">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-black">
                  FS
                </span>
                Fernando Solís
              </span>
            </div>
          </section>

          {/* 21. AVATAR DARK MODE / NEON */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">21. Contraste Alto (Fondo Oscuro)</h2>
            <div className="flex flex-col gap-3 items-start p-4 bg-slate-900 rounded-xl">
              <span className="inline-flex items-center gap-2 bg-slate-800 text-slate-100 pl-1 pr-3 py-1 rounded-full text-xs font-semibold border border-slate-700 shadow-sm">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black uppercase">
                  CG
                </span>
                Cristian Gutiérrez
              </span>
              <span className="inline-flex items-center gap-2 bg-slate-800 text-slate-100 pl-1 pr-3 py-1 rounded-full text-xs font-semibold border border-slate-700 shadow-sm">
                <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[9px] font-black uppercase">
                  JP
                </span>
                Juan Pérez
              </span>
            </div>
          </section>
        </div>

        {/* 22. SIMULADOR INTERACTIVO */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2">22. Simulador Interactivo de Badge de Funcionario</h2>
          <p className="text-sm text-gray-500 mb-6">
            Escribe un nombre a continuación para ver cómo se extraen las iniciales y se aplican los diferentes estilos de badges de forma automática:
          </p>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nombre del Funcionario</label>
              <input 
                type="text" 
                value={testName} 
                onChange={(e) => setTestName(e.target.value)} 
                placeholder="Escribe un nombre aquí..." 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
              />
            </div>
            
            <div className="w-full md:w-2/3 border-l border-gray-200 md:pl-8 space-y-6">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">Estilos Resultantes</span>
                <div className="flex flex-wrap gap-4 items-center">
                  
                  {/* Soft Blue Initial */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400">Tono Suave</span>
                    <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 pl-1 pr-3 py-1 rounded-full text-xs font-semibold border border-blue-200 shadow-sm">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black uppercase">
                        {getInitials(testName)}
                      </span>
                      {testName || 'Sin Nombre'}
                    </span>
                  </div>

                  {/* Gradient Initial */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400">Premium Gradient</span>
                    <span className="inline-flex items-center gap-2 bg-slate-50 text-slate-800 pl-1 pr-3 py-1 rounded-full text-xs font-semibold border border-slate-200 shadow-sm">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[9px] font-bold uppercase shadow-sm">
                        {getInitials(testName)}
                      </span>
                      {testName || 'Sin Nombre'}
                    </span>
                  </div>

                  {/* Compact Pill */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400">Pill Compacta</span>
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 p-0.5 pr-2.5 rounded-full text-xs font-bold border border-emerald-200">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black uppercase">
                        {getInitials(testName)}
                      </span>
                      {testName || 'Sin Nombre'}
                    </span>
                  </div>

                  {/* Dark Accent */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400">Alto Contraste</span>
                    <span className="inline-flex items-center gap-2 bg-slate-900 text-slate-100 pl-1 pr-3 py-1 rounded-full text-xs font-semibold border border-slate-800 shadow-sm">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black uppercase">
                        {getInitials(testName)}
                      </span>
                      {testName || 'Sin Nombre'}
                    </span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SECCIÓN DE CHIPS */}
      <div className="border-t border-gray-200 pt-10 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Galería de Chips</h2>
        <p className="text-gray-500 mb-6">
          Los chips son elementos interactivos compactos (generalmente redondeados). Se utilizan para filtros, acciones, ingresos múltiples (tags) o contactos.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* 1. INPUT CHIPS (TAGS) */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Input Chips (Tags removibles)</h2>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 pl-3 pr-1 py-1 rounded-full text-xs font-medium border border-gray-200 hover:bg-gray-200 transition-colors cursor-default">
                Tecnología
                <button className="p-0.5 rounded-full hover:bg-gray-300 transition-colors text-gray-500 hover:text-gray-700 focus:outline-none" title="Remover">
                  <X size={14} />
                </button>
              </span>
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 pl-3 pr-1 py-1 rounded-full text-xs font-medium border border-gray-200 hover:bg-gray-200 transition-colors cursor-default">
                Soporte
                <button className="p-0.5 rounded-full hover:bg-gray-300 transition-colors text-gray-500 hover:text-gray-700 focus:outline-none" title="Remover">
                  <X size={14} />
                </button>
              </span>
            </div>
          </section>
          
          {/* 2. FILTER CHIPS (SELECCIÓN) */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Filter Chips (Seleccionables)</h2>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-200 hover:bg-blue-100 transition-colors">
                <Check size={14} className="stroke-[3]" /> Activos
              </button>
              <button className="inline-flex items-center gap-1.5 bg-white text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-300 hover:bg-gray-50 transition-colors">
                Inactivos
              </button>
              <button className="inline-flex items-center gap-1.5 bg-white text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-300 hover:bg-gray-50 transition-colors">
                Pendientes
              </button>
            </div>
          </section>

          {/* 3. ACTION CHIPS (BOTONES COMPACTOS) */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Action Chips (Acciones)</h2>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-1.5 bg-white text-gray-700 px-3 py-1 rounded-full text-xs font-semibold border border-gray-300 hover:border-blue-500 hover:text-blue-600 shadow-sm transition-all">
                <Info size={14} /> Detalles
              </button>
              <button className="inline-flex items-center gap-1.5 bg-white text-gray-700 px-3 py-1 rounded-full text-xs font-semibold border border-gray-300 hover:border-green-500 hover:text-green-600 shadow-sm transition-all">
                <CheckCircle size={14} /> Aprobar
              </button>
            </div>
          </section>

          {/* 4. CONTACT CHIPS */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Contact Chips (Con Avatar)</h2>
            <div className="flex flex-col gap-2 items-start">
              <span className="inline-flex items-center gap-2 bg-white text-gray-700 p-1 pr-2 rounded-full text-xs font-medium border border-gray-200 shadow-sm">
                <img className="w-6 h-6 rounded-full object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
                Ana Silva
                <button className="p-0.5 ml-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </span>
              <span className="inline-flex items-center gap-2 bg-white text-gray-700 p-1 pr-2 rounded-full text-xs font-medium border border-gray-200 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">CG</span>
                Cristian G.
                <button className="p-0.5 ml-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </span>
            </div>
          </section>

          {/* 5. OUTLINED CHIPS (MINIMALISTAS) */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Outlined Chips (Solo Borde)</h2>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 bg-transparent text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold border-2 border-emerald-500">
                Aprobado
              </span>
              <span className="inline-flex items-center gap-1.5 bg-transparent text-amber-600 px-3 py-1 rounded-full text-xs font-semibold border-2 border-amber-500">
                En Revisión
              </span>
              <span className="inline-flex items-center gap-1.5 bg-transparent text-rose-600 px-3 py-1 rounded-full text-xs font-semibold border-2 border-rose-500">
                Rechazado
              </span>
            </div>
          </section>
          
          {/* 6. NEON / DARK ACCENT CHIPS */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Dark / Contrast Chips</h2>
            <div className="flex flex-wrap gap-2 p-4 bg-slate-900 rounded-lg">
              <span className="inline-flex items-center gap-1.5 bg-slate-800 text-cyan-400 px-3 py-1 rounded-full text-xs font-semibold border border-cyan-400/30 hover:bg-cyan-400/10 transition-colors cursor-pointer">
                #Redes
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-800 text-fuchsia-400 px-3 py-1 rounded-full text-xs font-semibold border border-fuchsia-400/30 hover:bg-fuchsia-400/10 transition-colors cursor-pointer">
                #Hardware
              </span>
            </div>
          </section>

        </div>
      </div>

      {/* SECCIÓN DE BÚSQUEDA MODERNAS */}
      <div className="mt-16">
        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-6">Exploración: Selectores de Funcionario Modernos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Option 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[450px]">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">1. Spotlight (Combobox)</h3>
            <p className="text-xs text-gray-500 mb-6">El input normal se abre mostrando avatares. Muy limpio y clásico moderno.</p>
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar funcionario..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all shadow-sm"
                  value={search1}
                  onChange={e => { setSearch1(e.target.value); setShowDropdown1(true); }}
                  onFocus={() => setShowDropdown1(true)}
                  onBlur={() => setTimeout(() => setShowDropdown1(false), 200)}
                />
              </div>
              {showDropdown1 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                  <div className="max-h-60 overflow-y-auto py-1">
                    {mockUsers.filter(u => u.nombre.toLowerCase().includes(search1.toLowerCase())).map(u => (
                      <div key={u.nombre} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer" onClick={() => { setSelected1(u.nombre); setSearch1(u.nombre); }}>
                        <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black uppercase shrink-0 shadow-sm">
                          {getInitials(u.nombre)}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-800">{u.nombre}</span>
                          <span className="text-[10px] text-gray-400 font-medium uppercase">Funcionario</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {selected1 && <div className="mt-4 text-sm text-green-600 font-medium flex items-center gap-2"><Check size={14}/> Seleccionado: {selected1}</div>}
          </div>

          {/* Option 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[450px]">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">2. Chip Integrado</h3>
            <p className="text-xs text-gray-500 mb-6">Al seleccionar, el input se convierte en un Pill claro que se puede remover fácilmente.</p>
            <div className="relative">
              <div className="flex items-center min-h-[42px] bg-white border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 px-1.5 shadow-sm transition-all">
                {selected2 ? (
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 p-0.5 pr-1.5 m-1 rounded-full text-xs font-bold border border-blue-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black uppercase shrink-0">
                      {getInitials(selected2)}
                    </span>
                    {selected2}
                    <button onClick={() => { setSelected2(''); setSearch2(''); }} className="ml-1 text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-full p-0.5 transition-colors">
                      <X size={12} strokeWidth={3} />
                    </button>
                  </span>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-gray-400 ml-2 mr-1" />
                    <input 
                      type="text" 
                      placeholder="Seleccionar..." 
                      className="flex-1 py-1.5 px-1 text-sm bg-transparent outline-none"
                      value={search2}
                      onChange={e => { setSearch2(e.target.value); setShowDropdown2(true); }}
                      onFocus={() => setShowDropdown2(true)}
                      onBlur={() => setTimeout(() => setShowDropdown2(false), 200)}
                    />
                  </>
                )}
              </div>
              {!selected2 && showDropdown2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                  <div className="max-h-60 overflow-y-auto py-1">
                    {mockUsers.filter(u => u.nombre.toLowerCase().includes(search2.toLowerCase())).map(u => (
                      <div key={u.nombre} className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700" onClick={() => { setSelected2(u.nombre); setShowDropdown2(false); }}>
                        {u.nombre}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Option 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[450px]">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">3. Directorio Data-Rich</h3>
            <p className="text-xs text-gray-500 mb-6">Muestra de inmediato cuántos equipos tiene el funcionario en el desplegable para contexto útil.</p>
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar funcionario..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-all"
                  value={search3}
                  onChange={e => { setSearch3(e.target.value); setShowDropdown3(true); }}
                  onFocus={() => setShowDropdown3(true)}
                  onBlur={() => setTimeout(() => setShowDropdown3(false), 200)}
                />
              </div>
              {showDropdown3 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="bg-slate-50 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-gray-100 flex justify-between">
                    <span>Sugerencias</span>
                    <span>120 Usuarios</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {mockUsers.filter(u => u.nombre.toLowerCase().includes(search3.toLowerCase())).map(u => (
                      <div key={u.nombre} className="flex items-center justify-between px-4 py-2.5 hover:bg-blue-50/50 cursor-pointer border-b border-gray-50 last:border-0" onClick={() => { setSelected3(u.nombre); setSearch3(u.nombre); }}>
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center text-[10px] font-black uppercase shrink-0">
                            {getInitials(u.nombre)}
                          </span>
                          <span className="text-sm font-semibold text-gray-800">{u.nombre}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                          {u.equipos} eq.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {selected3 && <div className="mt-4 text-sm text-green-600 font-medium flex items-center gap-2"><Check size={14}/> Seleccionado: {selected3}</div>}
          </div>

        </div>

        {/* ROW 2: Opciones 4, 5, 6 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-6">
          
          {/* Option 4 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[450px]">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">4. Minimalist / Ghost</h3>
            <p className="text-xs text-gray-500 mb-6">Un input sin bordes que fluye con el fondo. Elegante y poco intrusivo.</p>
            <div className="relative">
              <div className="relative flex items-center border-b-2 border-gray-200 focus-within:border-blue-500 transition-colors">
                <Search className="absolute left-1 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Escribe un nombre..." 
                  className="w-full pl-8 pr-4 py-3 bg-transparent text-gray-700 text-sm focus:outline-none transition-all placeholder:text-gray-400 font-medium"
                  value={search4}
                  onChange={e => { setSearch4(e.target.value); setShowDropdown4(true); }}
                  onFocus={() => setShowDropdown4(true)}
                  onBlur={() => setTimeout(() => setShowDropdown4(false), 200)}
                />
              </div>
              {showDropdown4 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50">
                  <div className="max-h-60 overflow-y-auto py-2">
                    {mockUsers.filter(u => u.nombre.toLowerCase().includes(search4.toLowerCase())).map(u => (
                      <div key={u.nombre} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => { setSelected4(u.nombre); setSearch4(u.nombre); }}>
                        <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-black uppercase shrink-0">
                          {getInitials(u.nombre)}
                        </span>
                        <span className="text-sm font-medium text-gray-700">{u.nombre}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {selected4 && <div className="mt-4 text-sm text-green-600 font-medium flex items-center gap-2"><Check size={14}/> Listo: {selected4}</div>}
          </div>

          {/* Option 5 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[450px]">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">5. Secciones Categorizadas</h3>
            <p className="text-xs text-gray-500 mb-6">Agrupa los resultados para dar más estructura visual, útil en listas largas.</p>
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Encontrar funcionario..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-all"
                  value={search5}
                  onChange={e => { setSearch5(e.target.value); setShowDropdown5(true); }}
                  onFocus={() => setShowDropdown5(true)}
                  onBlur={() => setTimeout(() => setShowDropdown5(false), 200)}
                />
              </div>
              {showDropdown5 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                  <div className="max-h-60 overflow-y-auto py-2">
                    <div className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Sugeridos</div>
                    {mockUsers.filter(u => u.nombre.toLowerCase().includes(search5.toLowerCase())).slice(0, 2).map(u => (
                      <div key={u.nombre} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer" onClick={() => { setSelected5(u.nombre); setSearch5(u.nombre); }}>
                        <UserCircle className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium text-gray-800">{u.nombre}</span>
                      </div>
                    ))}
                    <div className="px-3 py-1 mt-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-t border-gray-100 pt-2">Todos</div>
                    {mockUsers.filter(u => u.nombre.toLowerCase().includes(search5.toLowerCase())).slice(2).map(u => (
                      <div key={u.nombre} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer" onClick={() => { setSelected5(u.nombre); setSearch5(u.nombre); }}>
                        <UserCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">{u.nombre}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {selected5 && <div className="mt-4 text-sm text-green-600 font-medium flex items-center gap-2"><Check size={14}/> Listo: {selected5}</div>}
          </div>

          {/* Option 6 */}
          <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-800 h-[450px]">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-2">6. Dark Command</h3>
            <p className="text-xs text-slate-400 mb-6">Un buscador oscuro de alto contraste que resalta sobre el resto de la interfaz (Estilo CMD+K).</p>
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-cyan-500" />
                <input 
                  type="text" 
                  placeholder="Buscar usuario..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all shadow-inner"
                  value={search6}
                  onChange={e => { setSearch6(e.target.value); setShowDropdown6(true); }}
                  onFocus={() => setShowDropdown6(true)}
                  onBlur={() => setTimeout(() => setShowDropdown6(false), 200)}
                />
              </div>
              {showDropdown6 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-50">
                  <div className="max-h-60 overflow-y-auto py-2">
                    {mockUsers.filter(u => u.nombre.toLowerCase().includes(search6.toLowerCase())).map(u => (
                      <div key={u.nombre} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0" onClick={() => { setSelected6(u.nombre); setSearch6(u.nombre); }}>
                        <span className="w-6 h-6 rounded bg-cyan-950 text-cyan-400 flex items-center justify-center text-[9px] font-black uppercase shrink-0 border border-cyan-800/50">
                          {getInitials(u.nombre)}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-200">{u.nombre}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {selected6 && <div className="mt-4 text-sm text-cyan-400 font-medium flex items-center gap-2"><Check size={14}/> {selected6}</div>}
          </div>

        </div>
      </div>

    </div>
  );
}
