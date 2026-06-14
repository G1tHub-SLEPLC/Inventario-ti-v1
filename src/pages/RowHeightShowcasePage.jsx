import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  Table, 
  Code, 
  Copy, 
  Check, 
  Sparkles, 
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info
} from 'lucide-react';

const PRESETS = [
  { name: 'Ultra Compacto', pad: 4, font: 11, desc: 'Optimizado para ver listas muy extensas sin hacer scroll' },
  { name: 'Compacto (Equipos)', pad: 8, font: 12, desc: 'El tamaño de visualización actual de la tabla de Equipos' },
  { name: 'Estándar (Insumos)', pad: 12, font: 14, desc: 'Diseño equilibrado y moderno para insumos' },
  { name: 'Espacioso (Solicitudes/Usuarios)', pad: 16, font: 14, desc: 'Diseño amplio y con aire para mayor legibilidad' },
  { name: 'Extra Espacioso', pad: 20, font: 15, desc: 'Visualización grande y destacada' }
];

export default function RowHeightShowcasePage() {
  const [padValue, setPadValue] = useState(12);
  const [fontSize, setFontSize] = useState(14);
  const [copiedGlobal, setCopiedGlobal] = useState(false);
  const [copiedSpecific, setCopiedSpecific] = useState(false);
  const [activeTableTab, setActiveTableTab] = useState('equipos');

  // Datos ficticios pero realistas para la previsualización
  const sampleEquipos = [
    { desc: 'Notebook HP ProBook 440 G8', marca: 'HP', modelo: 'ProBook 440 G8', serie: '5CD1234XYZ', estado: 'DISPONIBLE', usuario: '—' },
    { desc: 'Proyector Epson PowerLite E20', marca: 'Epson', modelo: 'PowerLite E20', serie: 'X6FG987654', estado: 'EN PRESTAMO', usuario: 'Claudio Muñoz' },
    { desc: 'Monitor LG UltraGear 24\"', marca: 'LG', modelo: '24GQ50F-B', serie: '304KPMN123', estado: 'ASIGNADO', usuario: 'Carolina Valenzuela' }
  ];

  const sampleInsumos = [
    { nombre: 'Tóner Negro HP 83A', tipo: 'Tóner', marca: 'HP', modelo: 'CF283A', stock: 15 },
    { nombre: 'Mouse Óptico USB Negro', tipo: 'Mouse', marca: 'Genius', modelo: 'DX-110', stock: 42 },
    { nombre: 'Teclado Español USB', tipo: 'Teclado', marca: 'Logitech', modelo: 'K120', stock: 28 }
  ];

  const sampleSolicitudes = [
    { fecha: '14/06/2026', usuario: 'Eduardo Ríos', tipo: 'INSUMO', detalle: '2x Pilas Alcalinas AA', estado: 'aprobado' },
    { fecha: '13/06/2026', usuario: 'María José Salas', tipo: 'PRESTAMO', detalle: 'Notebook HP ProBook 440 G8', estado: 'pendiente' },
    { fecha: '11/06/2026', usuario: 'Raúl Soto', tipo: 'INSUMO', detalle: '1x Mouse Óptico USB', estado: 'rechazado' }
  ];

  const sampleUsuarios = [
    { nombre: 'Andrés Carrasco Jara', email: 'andres.carrasco@slep.cl', sub: 'Subdirección de Gestión de Personas', rol: 'Funcionario (SLEP)' },
    { nombre: 'Camila Pizarro Troncoso', email: 'camila.pizarro@slep.cl', sub: 'Subdirección de Administración y Finanzas', rol: 'Administrador (TI)' },
    { nombre: 'Roberto González Vera', email: 'roberto.gonzalez@slep.cl', sub: 'Subdirección de Planificación y Control', rol: 'Funcionario (SLEP)' }
  ];

  const selectPreset = (preset) => {
    setPadValue(preset.pad);
    setFontSize(preset.font);
  };

  const getStatusBadge = (estado) => {
    const base = "px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase whitespace-nowrap border";
    if (estado === 'DISPONIBLE' || estado === 'aprobado') return `${base} bg-green-50 text-green-700 border-green-200`;
    if (estado === 'EN PRESTAMO' || estado === 'pendiente') return `${base} bg-amber-50 text-amber-700 border-amber-200`;
    if (estado === 'ASIGNADO') return `${base} bg-blue-50 text-blue-700 border-blue-200`;
    return `${base} bg-rose-50 text-red-700 border-red-200`; // RECHAZADO
  };

  const currentTailwindClass = useMemo(() => {
    // Aproximar al valor Tailwind equivalente para la demostración de código
    if (padValue <= 4) return { tw: 'py-1', css: '4px' };
    if (padValue <= 8) return { tw: 'py-2', css: '8px' };
    if (padValue <= 12) return { tw: 'py-3', css: '12px' };
    if (padValue <= 16) return { tw: 'py-4', css: '16px' };
    return { tw: 'py-5', css: `${padValue}px` };
  }, [padValue]);

  const globalCssCode = `/* Copiar en src/index.css para cambiar la altura en todo el sitio */
table tbody tr td {
  padding-top: ${padValue}px !important;
  padding-bottom: ${padValue}px !important;
  font-size: ${fontSize}px !important;
}`;

  const specificCssCode = `/* Cambios individuales recomendados por sección */
/* Equipos (DashboardPage.jsx) */
.equipos-td {
  padding: ${padValue}px 12px;
  font-size: ${fontSize}px;
}

/* Insumos (InsumosPage.jsx) */
.insumos-td {
  padding: ${padValue}px 24px;
  font-size: ${fontSize}px;
}`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'global') {
      setCopiedGlobal(true);
      setTimeout(() => setCopiedGlobal(false), 2000);
    } else {
      setCopiedSpecific(true);
      setTimeout(() => setCopiedSpecific(false), 2000);
    }
  };

  const cellStyle = {
    paddingTop: `${padValue}px`,
    paddingBottom: `${padValue}px`,
    fontSize: `${fontSize}px`,
    lineHeight: '1.25rem'
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sliders className="text-[#006BB9]" /> Ajuste Visual de Tablas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Simulador interactivo para definir la altura de las filas y tamaño de texto de los listados.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 text-[#006BB9] px-3.5 py-1.5 rounded-lg border border-blue-100 text-xs font-bold shadow-xs">
          <Sparkles size={14} className="animate-pulse" /> Modo Showcase
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controles deslizantes */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-5 md:col-span-1">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b pb-2 mb-1">
            <Sliders size={16} className="text-gray-500" /> Controles de Tamaño
          </h2>

          {/* Selector de Presets */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Presets de Altura</label>
            <div className="flex flex-col gap-1.5">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => selectPreset(p)}
                  className={`text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col gap-0.5 ${
                    padValue === p.pad && fontSize === p.font
                      ? 'bg-blue-50 border-blue-300 text-[#006BB9] font-bold shadow-xs'
                      : 'bg-slate-50 border-gray-200 hover:bg-white text-gray-700 hover:shadow-xs'
                  }`}
                >
                  <span className="font-semibold">{p.name} ({p.pad}px / {p.font}px)</span>
                  <span className="text-[10px] text-gray-400 font-medium">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Deslizador de Padding */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-600 uppercase tracking-wider text-[11px]">Padding Vertical (Alto)</span>
              <span className="text-[#006BB9] font-mono">{padValue}px / {currentTailwindClass.tw}</span>
            </div>
            <input 
              type="range" 
              min="2" 
              max="24" 
              value={padValue} 
              onChange={e => setPadValue(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006BB9]" 
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-semibold font-mono">
              <span>Compacto (2px)</span>
              <span>Espacioso (24px)</span>
            </div>
          </div>

          {/* Deslizador de Fuente */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-600 uppercase tracking-wider text-[11px]">Tamaño de Texto</span>
              <span className="text-[#006BB9] font-mono">{fontSize}px</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="16" 
              value={fontSize} 
              onChange={e => setFontSize(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006BB9]" 
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-semibold font-mono">
              <span>Pequeño (10px)</span>
              <span>Grande (16px)</span>
            </div>
          </div>
        </div>

        {/* Tablas de Previsualización */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 md:col-span-2 flex flex-col min-h-[420px]">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Table size={16} className="text-gray-500" /> Vista Previa
            </h2>
            {/* Tabs de Tablas */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button 
                onClick={() => setActiveTableTab('equipos')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all ${
                  activeTableTab === 'equipos' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Equipos
              </button>
              <button 
                onClick={() => setActiveTableTab('insumos')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all ${
                  activeTableTab === 'insumos' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Insumos
              </button>
              <button 
                onClick={() => setActiveTableTab('solicitudes')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all ${
                  activeTableTab === 'solicitudes' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Sols
              </button>
              <button 
                onClick={() => setActiveTableTab('usuarios')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide transition-all ${
                  activeTableTab === 'usuarios' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Users
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto border border-gray-100 rounded-lg shadow-inner bg-slate-50 p-2 flex flex-col justify-center">
            {/* Tabla de Equipos */}
            {activeTableTab === 'equipos' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full text-left whitespace-nowrap">
                  <thead className="bg-[#25306B] text-white text-[11px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2">Detalle</th>
                      <th className="px-3 py-2">Marca</th>
                      <th className="px-3 py-2">Modelo</th>
                      <th className="px-3 py-2">Serie</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2">Asignado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {sampleEquipos.map((eq, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 text-gray-900" style={cellStyle}>{eq.desc}</td>
                        <td className="px-3 text-gray-600" style={cellStyle}>{eq.marca}</td>
                        <td className="px-3 text-gray-600" style={cellStyle}>{eq.modelo}</td>
                        <td className="px-3 text-gray-600 font-mono" style={cellStyle}>{eq.serie}</td>
                        <td className="px-3" style={cellStyle}>{getStatusBadge(eq.estado)}</td>
                        <td className="px-3 text-gray-700" style={cellStyle}>{eq.usuario}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tabla de Insumos */}
            {activeTableTab === 'insumos' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full text-left whitespace-nowrap">
                  <thead className="bg-[#25306B] text-white text-[11px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-2.5">Nombre</th>
                      <th className="px-6 py-2.5">Tipo</th>
                      <th className="px-6 py-2.5">Marca</th>
                      <th className="px-6 py-2.5">Modelo</th>
                      <th className="px-6 py-2.5 text-center">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {sampleInsumos.map((ins, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-6 text-gray-900" style={cellStyle}>{ins.nombre}</td>
                        <td className="px-6 text-gray-600" style={cellStyle}>{ins.tipo}</td>
                        <td className="px-6 text-gray-600" style={cellStyle}>{ins.marca}</td>
                        <td className="px-6 text-gray-600" style={cellStyle}>{ins.modelo}</td>
                        <td className="px-6 text-center text-[#25306B] font-bold" style={cellStyle}>{ins.stock} u.</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tabla de Solicitudes */}
            {activeTableTab === 'solicitudes' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full text-left whitespace-nowrap">
                  <thead className="bg-[#25306B] text-white text-[11px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Fecha</th>
                      <th className="px-6 py-3">Usuario</th>
                      <th className="px-6 py-3">Tipo</th>
                      <th className="px-6 py-3">Detalle</th>
                      <th className="px-6 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {sampleSolicitudes.map((sol, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-6 text-gray-500" style={cellStyle}>{sol.fecha}</td>
                        <td className="px-6 text-gray-900" style={cellStyle}>{sol.usuario}</td>
                        <td className="px-6 text-gray-600 text-xs font-bold" style={cellStyle}>{sol.tipo}</td>
                        <td className="px-6 text-gray-600" style={cellStyle}>{sol.detalle}</td>
                        <td className="px-6" style={cellStyle}>{getStatusBadge(sol.estado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tabla de Usuarios */}
            {activeTableTab === 'usuarios' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full text-left whitespace-nowrap">
                  <thead className="bg-[#25306B] text-white text-[11px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Nombre</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Subdirección</th>
                      <th className="px-6 py-3">Rol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {sampleUsuarios.map((usr, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-6 text-gray-900 font-semibold" style={cellStyle}>{usr.nombre}</td>
                        <td className="px-6 text-gray-600" style={cellStyle}>{usr.email}</td>
                        <td className="px-6 text-gray-500 max-w-xs truncate" style={cellStyle} title={usr.sub}>{usr.sub}</td>
                        <td className="px-6 text-gray-600 text-xs font-bold" style={cellStyle}>{usr.rol}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Generation Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Generador Global CSS */}
        <div className="bg-slate-900 text-slate-200 p-5 rounded-xl border border-slate-800 shadow-lg relative flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Code size={14} /> Aplicar en index.css (Global)
              </h3>
              <button 
                onClick={() => copyToClipboard(globalCssCode, 'global')}
                className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-1.5 rounded border border-slate-700 flex items-center gap-1 text-[10px] font-bold"
              >
                {copiedGlobal ? <Check size={12} className="text-green-400" /> : <Code size={12} />}
                {copiedGlobal ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <pre className="font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto bg-slate-950/50 p-3 rounded-lg border border-slate-900">
              <code>{globalCssCode}</code>
            </pre>
          </div>
          <div className="mt-4 p-3 bg-blue-955/30 text-blue-300 text-[10px] rounded border border-blue-900/50 flex items-start gap-1.5 font-medium leading-relaxed">
            <span>ℹ</span>
            <span>Esta regla anulará los paddings y tamaños de letra actuales de todas las tablas del portal al mismo tiempo.</span>
          </div>
        </div>

        {/* Generador Específico / JSX Class Guide */}
        <div className="bg-slate-900 text-slate-200 p-5 rounded-xl border border-slate-800 shadow-lg relative flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Sliders size={14} /> Modificación Individual
              </h3>
              <button 
                onClick={() => copyToClipboard(specificCssCode, 'specific')}
                className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-1.5 rounded border border-slate-700 flex items-center gap-1 text-[10px] font-bold"
              >
                {copiedSpecific ? <Check size={12} className="text-green-400" /> : <Code size={12} />}
                {copiedSpecific ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <pre className="font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto bg-slate-950/50 p-3 rounded-lg border border-slate-900">
              <code>{specificCssCode}</code>
            </pre>
          </div>
          <div className="mt-4 p-3 bg-amber-955/30 text-amber-300 text-[10px] rounded border border-amber-950/50 flex items-start gap-1.5 font-medium leading-relaxed">
            <span>ℹ</span>
            <span>Si buscas clases específicas en cada página JSX, busca la clase `py-` (como `py-2`, `py-3` o `py-4`) en las etiquetas `&lt;td&gt;` y cámbialas por la equivalente.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
