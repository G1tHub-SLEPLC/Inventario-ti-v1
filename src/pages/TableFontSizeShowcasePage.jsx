import { useState, useEffect } from 'react';
import { Type, Settings2, Palette, Image as ImageIcon, CheckCircle, Smartphone, Database, Key, Download, Edit2, Undo2, Trash2 } from 'lucide-react';
import Badge from '../components/Badge';

const FONTS = [
  { name: 'Global (Heredada)', value: 'inherit', isGoogle: false },
  { name: 'Inter', value: '"Inter", sans-serif', isGoogle: true },
  { name: 'Roboto', value: '"Roboto", sans-serif', isGoogle: true },
  { name: 'Open Sans', value: '"Open Sans", sans-serif', isGoogle: true },
  { name: 'Lato', value: '"Lato", sans-serif', isGoogle: true },
  { name: 'Montserrat', value: '"Montserrat", sans-serif', isGoogle: true },
  { name: 'Poppins', value: '"Poppins", sans-serif', isGoogle: true },
  { name: 'Nunito', value: '"Nunito", sans-serif', isGoogle: true },
  { name: 'Oswald', value: '"Oswald", sans-serif', isGoogle: true },
  { name: 'Source Sans 3', value: '"Source Sans 3", sans-serif', isGoogle: true },
  { name: 'Playfair Display', value: '"Playfair Display", serif', isGoogle: true },
  { name: 'Fira Code', value: '"Fira Code", monospace', isGoogle: true },
];

const COLORS = [
  '#ffffff', '#000000', '#111827', '#374151', '#4b5563', '#6b7280', '#9ca3af',
  '#006BB9', '#25306B', '#112A46', '#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6',
  '#047857', '#059669', '#10b981', '#dc2626', '#ef4444', '#b91c1c'
];

const INIT_STYLE = { fontFamily: 'inherit', fontSize: 14, fontWeight: '500', color: '#334155', italic: false };
const INIT_HEADER = { fontFamily: 'inherit', fontSize: 12, fontWeight: '700', color: '#ffffff', italic: false };

const INIT_CONFIG = {
  global: { fontFamily: 'inherit', rowPadding: 10, headerBg: '#112A46' },
  images: { equipos: 52, insumos: 52, licencias: 52 },
  equipos: {
    headers: {
      Logo: { ...INIT_HEADER }, Desc: { ...INIT_HEADER }, Marca: { ...INIT_HEADER }, Modelo: { ...INIT_HEADER }, Serie: { ...INIT_HEADER }, 
      IDPub: { ...INIT_HEADER }, Respaldo: { ...INIT_HEADER }, Proveedor: { ...INIT_HEADER }, 
      SubDir: { ...INIT_HEADER }, Estado: { ...INIT_HEADER }, Usuario: { ...INIT_HEADER }
    },
    data: {
      Desc: { ...INIT_STYLE, fontWeight: '800', fontSize: 14, color: '#111827' }, 
      Marca: { ...INIT_STYLE }, 
      Modelo: { ...INIT_STYLE }, 
      Serie: { ...INIT_STYLE }, 
      IDPub: { ...INIT_STYLE },
      Respaldo: { ...INIT_STYLE, fontSize: 11, fontWeight: '700', color: '#059669' },
      Proveedor: { ...INIT_STYLE }, 
      SubDir: { ...INIT_STYLE }, 
      Usuario: { ...INIT_STYLE, fontWeight: '800', color: '#111827' }
    }
  },
  insumos: {
    headers: { 
      Logo: { ...INIT_HEADER }, Desc: { ...INIT_HEADER }, Cat: { ...INIT_HEADER }, 
      Marca: { ...INIT_HEADER }, Modelo: { ...INIT_HEADER }, Stock: { ...INIT_HEADER }, 
      Umbral: { ...INIT_HEADER }, SubDir: { ...INIT_HEADER }, Encargado: { ...INIT_HEADER } 
    },
    data: { 
      Desc: { ...INIT_STYLE, fontWeight: '800', color: '#334155' }, 
      Cat: { ...INIT_STYLE }, 
      Marca: { ...INIT_STYLE }, 
      Modelo: { ...INIT_STYLE }, 
      Stock: { ...INIT_STYLE, fontWeight: '700', fontSize: 18, color: '#1f2937' }, 
      Umbral: { ...INIT_STYLE }, 
      SubDir: { ...INIT_STYLE }, 
      Encargado: { ...INIT_STYLE } 
    }
  },
  licencias: {
    headers: { 
      Funcionario: { ...INIT_HEADER }, Logo: { ...INIT_HEADER }, Software: { ...INIT_HEADER }, 
      EquipoAsociado: { ...INIT_HEADER }, FechaAsig: { ...INIT_HEADER }, 
      FechaVenc: { ...INIT_HEADER }, Respaldo: { ...INIT_HEADER }, Obs: { ...INIT_HEADER } 
    },
    data: {
      Funcionario: { ...INIT_STYLE, fontWeight: '600', color: '#111827' },
      SoftwareTitle: { ...INIT_STYLE, fontWeight: '800', fontSize: 14, color: '#111827' },
      SoftwareSub: { ...INIT_STYLE, fontSize: 12, color: '#6b7280' },
      SoftwareTipo: { ...INIT_STYLE, fontSize: 14, color: '#334155' },
      EquipoAsociado: { ...INIT_STYLE, fontWeight: '800', color: '#111827' },
      EquipoSerie: { ...INIT_STYLE, fontSize: 12, color: '#6b7280' },
      Fechas: { ...INIT_STYLE },
      Respaldo: { ...INIT_STYLE, fontSize: 11, fontWeight: '700', color: '#2563eb' },
      Obs: { ...INIT_STYLE, color: '#6b7280' }
    }
  }
};

const MOCKS = {
  equipos: [
    { id: 1, logo: 'https://logo.clearbit.com/hp.com', desc: 'Notebook', marca: 'HP', modelo: 'EliteBook 6', serie: '5CD123', idpub: '—', resFac: 'FACTURA Nº 10136', resOc: 'OC Nº 1456839-1-CM26', prov: 'Kropsys', sub: 'Administración', estado: 'ASIGNADO', usuario: 'Ninoska Massiel Ocares' },
  ],
  insumos: [
    { id: 1, logo: 'https://logo.clearbit.com/logitech.com', desc: 'Teclado Inalámbrico', cat: 'Periféricos', marca: 'Logitech', modelo: 'MX Keys', stock: 15, umbral: 5, sub: 'TI', encargado: 'Juan Perez' },
  ],
  licencias: [
    { id: 1, logo: 'https://logo.clearbit.com/microsoft.com', func: 'Ninoska Massiel Ocares', software: 'Microsoft Office 365', version: 'Suscripción Anual', tipo: 'SAAS', equipoMarca: 'HP EliteBook 6', equipoSerie: 'S/N: 5CD123', fAsig: '10/06/2026', fVenc: '07/04/2027', resFac: 'FACTURA N° 23112', resOc: 'OC N° 1456-27-A', obs: '—' },
  ]
};

export default function TableFontSizeShowcasePage() {
  const [config, setConfig] = useState(INIT_CONFIG);
  const [activeTab, setActiveTab] = useState('equipos');
  const [activeElement, setActiveElement] = useState(null);

  useEffect(() => {
    FONTS.filter(f => f.isGoogle).forEach(font => {
      const fontName = font.name.split(' ')[0].replace(/ /g, '+');
      const linkId = `google-font-${fontName}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,700&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, []);

  const handleStyleChange = (key, value) => {
    if (!activeElement) return;
    setConfig(prev => ({
      ...prev,
      [activeElement.table]: {
        ...prev[activeElement.table],
        [activeElement.section]: {
          ...prev[activeElement.table][activeElement.section],
          [activeElement.key]: {
            ...prev[activeElement.table][activeElement.section][activeElement.key],
            [key]: value
          }
        }
      }
    }));
  };

  const getStyle = (table, section, key) => {
    const s = config[table]?.[section]?.[key];
    if (!s) return {};
    return {
      fontFamily: s.fontFamily === 'inherit' ? config.global.fontFamily : s.fontFamily,
      fontSize: `${s.fontSize}px`,
      fontWeight: s.fontWeight,
      color: s.color,
      fontStyle: s.italic ? 'italic' : 'normal',
      paddingTop: `${section === 'headers' ? config.global.rowPadding + 2 : config.global.rowPadding}px`,
      paddingBottom: `${section === 'headers' ? config.global.rowPadding + 2 : config.global.rowPadding}px`,
      paddingLeft: '12px', paddingRight: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: activeElement?.table === table && activeElement?.section === section && activeElement?.key === key ? '2px dashed #006BB9' : '2px dashed transparent'
    };
  };

  return (
    <div className="p-6 max-w-[1920px] mx-auto space-y-6 pb-24 font-sans">
      <div>
        <h1 className="text-2xl font-black text-[#25306B] flex items-center gap-2 mb-2">
          <Palette size={28} className="text-[#006BB9]" />
          Constructor de Temas de Tablas (WYSIWYG)
        </h1>
        <p className="text-gray-600 text-sm">Precargado con los valores actuales de producción.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* PANEL IZQUIERDO */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-6 self-start sticky top-6">
          <h2 className="font-bold text-[#112A46] border-b border-gray-100 pb-3 flex items-center gap-2">
            <Settings2 size={18} className="text-blue-600" /> Controles
          </h2>

          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
               <h3 className="text-xs font-bold text-slate-800 uppercase">Globales</h3>
               <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Fuente Base de Tablas</label>
                  <select 
                    className="w-full text-xs border-gray-300 rounded shadow-sm bg-white p-1 mt-1 border"
                    value={config.global.fontFamily} onChange={(e) => setConfig({...config, global: {...config.global, fontFamily: e.target.value}})}
                  >
                    {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase flex justify-between">Espaciado (Padding Y) <span>{config.global.rowPadding}px</span></label>
                  <input type="range" min="0" max="24" value={config.global.rowPadding} onChange={(e) => setConfig({...config, global: {...config.global, rowPadding: parseInt(e.target.value)}})} className="w-full h-1 mt-1" />
               </div>
            </div>

            {activeElement ? (() => {
              if (activeElement.type === 'image') {
                return (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2 border-b border-blue-200 pb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                      <h3 className="text-sm font-bold text-blue-900">Editando Imagen: {activeTab.toUpperCase()}</h3>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 flex justify-between">Tamaño (Ancho y Alto) <span>{config.images[activeTab]}px</span></label>
                      <input 
                        type="range" min="20" max="100" 
                        value={config.images[activeTab]} 
                        onChange={(e) => setConfig({...config, images: {...config.images, [activeTab]: parseInt(e.target.value)}})} 
                        className="w-full h-1 mt-1" 
                      />
                    </div>
                  </div>
                );
              }

              const el = config[activeElement.table][activeElement.section][activeElement.key];
              if (!el) return null;
              
              return (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2 border-b border-blue-200 pb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                    <h3 className="text-sm font-bold text-blue-900">Editando: {activeElement.key}</h3>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700">Fuente Específica</label>
                    <select value={el.fontFamily} onChange={(e) => handleStyleChange('fontFamily', e.target.value)} className="w-full text-xs border border-gray-300 rounded mt-1 p-1">
                      {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 flex justify-between">Tamaño <span>{el.fontSize}px</span></label>
                    <input type="range" min="8" max="24" value={el.fontSize} onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))} className="w-full h-1 mt-1" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700">Grosor (Weight)</label>
                    <select value={el.fontWeight} onChange={(e) => handleStyleChange('fontWeight', e.target.value)} className="w-full text-xs border border-gray-300 rounded mt-1 p-1">
                      <option value="300">Light (300)</option><option value="400">Normal (400)</option><option value="500">Medium (500)</option><option value="600">Semibold (600)</option><option value="700">Bold (700)</option><option value="800">Extra Bold (800)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Color de Texto</label>
                    <div className="flex flex-wrap gap-1">
                      {COLORS.map(c => (
                        <div key={c} onClick={() => handleStyleChange('color', c)} className="w-5 h-5 rounded-full cursor-pointer border shadow-xs" style={{ backgroundColor: c, borderColor: el.color === c ? '#000' : 'transparent', outline: el.color === c ? '2px solid #006BB9' : 'none' }} />
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer pt-2">
                    <input type="checkbox" checked={el.italic} onChange={(e) => handleStyleChange('italic', e.target.checked)} className="rounded text-blue-600" />
                    Cursiva (Itálica)
                  </label>
                </div>
              );
            })() : (
              <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center bg-gray-50 flex flex-col items-center justify-center">
                <Type className="text-gray-400 mb-2" size={24} />
                <p className="text-xs text-gray-500">Haz clic en cualquier texto de las tablas a la derecha para editarlo.</p>
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button onClick={() => { setActiveTab('equipos'); setActiveElement(null); }} className={`px-4 py-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'equipos' ? 'border-[#006BB9] text-[#006BB9]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Smartphone size={16}/> Equipos</button>
            <button onClick={() => { setActiveTab('insumos'); setActiveElement(null); }} className={`px-4 py-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'insumos' ? 'border-[#006BB9] text-[#006BB9]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Database size={16}/> Insumos</button>
            <button onClick={() => { setActiveTab('licencias'); setActiveElement(null); }} className={`px-4 py-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'licencias' ? 'border-[#006BB9] text-[#006BB9]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Key size={16}/> Licencias (Por Funcionario)</button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden" style={{ fontFamily: config.global.fontFamily }}>
            <div className="w-full overflow-x-auto p-4 bg-gray-100">
              <table className="min-w-max text-left bg-white border border-gray-200 shadow-sm" style={{ borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: config.global.headerBg }}>
                  {activeTab === 'equipos' && <tr>
                    <th onClick={() => setActiveElement({table: 'equipos', section: 'headers', key: 'Logo'})} style={getStyle('equipos', 'headers', 'Logo')}>Descripción del Bien</th>
                    <th onClick={() => setActiveElement({table: 'equipos', section: 'headers', key: 'Marca'})} style={getStyle('equipos', 'headers', 'Marca')}>Marca</th>
                    <th onClick={() => setActiveElement({table: 'equipos', section: 'headers', key: 'Modelo'})} style={getStyle('equipos', 'headers', 'Modelo')}>Modelo</th>
                    <th onClick={() => setActiveElement({table: 'equipos', section: 'headers', key: 'Serie'})} style={getStyle('equipos', 'headers', 'Serie')}>Nº de serie</th>
                    <th onClick={() => setActiveElement({table: 'equipos', section: 'headers', key: 'IDPub'})} style={getStyle('equipos', 'headers', 'IDPub')}>ID Publicación</th>
                    <th onClick={() => setActiveElement({table: 'equipos', section: 'headers', key: 'Respaldo'})} style={getStyle('equipos', 'headers', 'Respaldo')}>Respaldo</th>
                    <th onClick={() => setActiveElement({table: 'equipos', section: 'headers', key: 'Proveedor'})} style={getStyle('equipos', 'headers', 'Proveedor')}>Proveedor</th>
                    <th onClick={() => setActiveElement({table: 'equipos', section: 'headers', key: 'SubDir'})} style={getStyle('equipos', 'headers', 'SubDir')}>SubDirección</th>
                    <th onClick={() => setActiveElement({table: 'equipos', section: 'headers', key: 'Estado'})} style={getStyle('equipos', 'headers', 'Estado')}>Estado</th>
                    <th onClick={() => setActiveElement({table: 'equipos', section: 'headers', key: 'Usuario'})} style={getStyle('equipos', 'headers', 'Usuario')}>Usuario</th>
                    <th className="px-3 py-2 font-bold text-white text-xs uppercase">Acciones</th>
                  </tr>}
                  
                  {activeTab === 'insumos' && <tr>
                    <th onClick={() => setActiveElement({table: 'insumos', section: 'headers', key: 'Logo'})} style={getStyle('insumos', 'headers', 'Logo')}>Descripción</th>
                    <th onClick={() => setActiveElement({table: 'insumos', section: 'headers', key: 'Cat'})} style={getStyle('insumos', 'headers', 'Cat')}>Categoría</th>
                    <th onClick={() => setActiveElement({table: 'insumos', section: 'headers', key: 'Marca'})} style={getStyle('insumos', 'headers', 'Marca')}>Marca</th>
                    <th onClick={() => setActiveElement({table: 'insumos', section: 'headers', key: 'Modelo'})} style={getStyle('insumos', 'headers', 'Modelo')}>Modelo</th>
                    <th onClick={() => setActiveElement({table: 'insumos', section: 'headers', key: 'Stock'})} style={getStyle('insumos', 'headers', 'Stock')}>Stock</th>
                    <th onClick={() => setActiveElement({table: 'insumos', section: 'headers', key: 'Umbral'})} style={getStyle('insumos', 'headers', 'Umbral')}>Umbral</th>
                    <th onClick={() => setActiveElement({table: 'insumos', section: 'headers', key: 'SubDir'})} style={getStyle('insumos', 'headers', 'SubDir')}>SubDirección</th>
                    <th onClick={() => setActiveElement({table: 'insumos', section: 'headers', key: 'Encargado'})} style={getStyle('insumos', 'headers', 'Encargado')}>Encargado</th>
                    <th className="px-3 py-2 font-bold text-white text-xs uppercase">Acciones</th>
                  </tr>}

                  {activeTab === 'licencias' && <tr>
                    <th onClick={() => setActiveElement({table: 'licencias', section: 'headers', key: 'Funcionario'})} style={getStyle('licencias', 'headers', 'Funcionario')}>Funcionario</th>
                    <th onClick={() => setActiveElement({table: 'licencias', section: 'headers', key: 'Software'})} style={getStyle('licencias', 'headers', 'Software')}>Software</th>
                    <th onClick={() => setActiveElement({table: 'licencias', section: 'headers', key: 'EquipoAsociado'})} style={getStyle('licencias', 'headers', 'EquipoAsociado')}>Equipo Asociado</th>
                    <th onClick={() => setActiveElement({table: 'licencias', section: 'headers', key: 'FechaAsig'})} style={getStyle('licencias', 'headers', 'FechaAsig')}>Fecha Asignación</th>
                    <th onClick={() => setActiveElement({table: 'licencias', section: 'headers', key: 'FechaVenc'})} style={getStyle('licencias', 'headers', 'FechaVenc')}>Fecha Vencimiento</th>
                    <th onClick={() => setActiveElement({table: 'licencias', section: 'headers', key: 'Respaldo'})} style={getStyle('licencias', 'headers', 'Respaldo')}>Respaldo</th>
                    <th onClick={() => setActiveElement({table: 'licencias', section: 'headers', key: 'Obs'})} style={getStyle('licencias', 'headers', 'Obs')}>Observaciones</th>
                    <th className="px-3 py-2 font-bold text-white text-xs uppercase">Acciones</th>
                  </tr>}
                </thead>
                <tbody>
                  {activeTab === 'equipos' && MOCKS.equipos.map((row, idx) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td className="flex items-center gap-3" style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: `${config.global.rowPadding}px`, paddingBottom: `${config.global.rowPadding}px` }}>
                        <div onClick={() => setActiveElement({table: 'equipos', section: 'data', key: 'Logo', type: 'image'})} style={{ width: `${config.images.equipos}px`, height: `${config.images.equipos}px`, cursor: 'pointer', border: activeElement?.key === 'Logo' && activeElement?.type === 'image' ? '2px dashed #006BB9' : '2px dashed transparent' }} className="bg-white rounded border overflow-hidden p-1 flex-shrink-0">
                           <img src={row.logo} className="w-full h-full object-contain" />
                        </div>
                        <span onClick={() => setActiveElement({table: 'equipos', section: 'data', key: 'Desc'})} style={getStyle('equipos', 'data', 'Desc')}>{row.desc}</span>
                      </td>
                      <td onClick={() => setActiveElement({table: 'equipos', section: 'data', key: 'Marca'})} style={getStyle('equipos', 'data', 'Marca')}>{row.marca}</td>
                      <td onClick={() => setActiveElement({table: 'equipos', section: 'data', key: 'Modelo'})} style={getStyle('equipos', 'data', 'Modelo')}>{row.modelo}</td>
                      <td onClick={() => setActiveElement({table: 'equipos', section: 'data', key: 'Serie'})} style={getStyle('equipos', 'data', 'Serie')}>{row.serie}</td>
                      <td onClick={() => setActiveElement({table: 'equipos', section: 'data', key: 'IDPub'})} style={getStyle('equipos', 'data', 'IDPub')}>{row.idpub}</td>
                      <td style={{ paddingLeft: '12px', paddingRight: '12px' }}>
                        <div onClick={() => setActiveElement({table: 'equipos', section: 'data', key: 'Respaldo'})} style={getStyle('equipos', 'data', 'Respaldo')}>{row.resFac}</div>
                        <div onClick={() => setActiveElement({table: 'equipos', section: 'data', key: 'Respaldo'})} style={getStyle('equipos', 'data', 'Respaldo')}>{row.resOc}</div>
                      </td>
                      <td onClick={() => setActiveElement({table: 'equipos', section: 'data', key: 'Proveedor'})} style={getStyle('equipos', 'data', 'Proveedor')}>{row.prov}</td>
                      <td onClick={() => setActiveElement({table: 'equipos', section: 'data', key: 'SubDir'})} style={getStyle('equipos', 'data', 'SubDir')}>{row.sub}</td>
                      <td style={{ paddingLeft: '12px', paddingRight: '12px' }}><Badge variant="estado" categoria="equipos" estado={row.estado} /></td>
                      <td onClick={() => setActiveElement({table: 'equipos', section: 'data', key: 'Usuario'})} style={getStyle('equipos', 'data', 'Usuario')}>{row.usuario}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                           <button className="p-1 text-blue-600 bg-blue-50 rounded"><Download size={14}/></button>
                           <button className="p-1 text-blue-600 bg-blue-50 rounded"><Edit2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {activeTab === 'insumos' && MOCKS.insumos.map((row, idx) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td className="flex items-center gap-3" style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: `${config.global.rowPadding}px`, paddingBottom: `${config.global.rowPadding}px` }}>
                        <div onClick={() => setActiveElement({table: 'insumos', section: 'data', key: 'Logo', type: 'image'})} style={{ width: `${config.images.insumos}px`, height: `${config.images.insumos}px`, cursor: 'pointer', border: activeElement?.key === 'Logo' && activeElement?.type === 'image' ? '2px dashed #006BB9' : '2px dashed transparent' }} className="bg-white rounded border overflow-hidden p-1 flex-shrink-0">
                           <img src={row.logo} className="w-full h-full object-contain" />
                        </div>
                        <span onClick={() => setActiveElement({table: 'insumos', section: 'data', key: 'Desc'})} style={getStyle('insumos', 'data', 'Desc')}>{row.desc}</span>
                      </td>
                      <td onClick={() => setActiveElement({table: 'insumos', section: 'data', key: 'Cat'})} style={getStyle('insumos', 'data', 'Cat')}>{row.cat}</td>
                      <td onClick={() => setActiveElement({table: 'insumos', section: 'data', key: 'Marca'})} style={getStyle('insumos', 'data', 'Marca')}>{row.marca}</td>
                      <td onClick={() => setActiveElement({table: 'insumos', section: 'data', key: 'Modelo'})} style={getStyle('insumos', 'data', 'Modelo')}>{row.modelo}</td>
                      <td onClick={() => setActiveElement({table: 'insumos', section: 'data', key: 'Stock'})} style={getStyle('insumos', 'data', 'Stock')}>{row.stock}</td>
                      <td onClick={() => setActiveElement({table: 'insumos', section: 'data', key: 'Umbral'})} style={getStyle('insumos', 'data', 'Umbral')}>{row.umbral}</td>
                      <td onClick={() => setActiveElement({table: 'insumos', section: 'data', key: 'SubDir'})} style={getStyle('insumos', 'data', 'SubDir')}>{row.sub}</td>
                      <td onClick={() => setActiveElement({table: 'insumos', section: 'data', key: 'Encargado'})} style={getStyle('insumos', 'data', 'Encargado')}>{row.encargado}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                           <button className="p-1 text-blue-600 bg-blue-50 rounded"><Edit2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {activeTab === 'licencias' && MOCKS.licencias.map((row, idx) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td onClick={() => setActiveElement({table: 'licencias', section: 'data', key: 'Funcionario'})} style={getStyle('licencias', 'data', 'Funcionario')}>{row.func}</td>
                      <td className="flex items-center gap-3" style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: `${config.global.rowPadding}px`, paddingBottom: `${config.global.rowPadding}px` }}>
                        <div onClick={() => setActiveElement({table: 'licencias', section: 'data', key: 'Logo', type: 'image'})} style={{ width: `${config.images.licencias}px`, height: `${config.images.licencias}px`, cursor: 'pointer', border: activeElement?.key === 'Logo' && activeElement?.type === 'image' ? '2px dashed #006BB9' : '2px dashed transparent' }} className="bg-white rounded border overflow-hidden p-1 flex-shrink-0">
                           <img src={row.logo} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div onClick={() => setActiveElement({table: 'licencias', section: 'data', key: 'SoftwareTitle'})} style={getStyle('licencias', 'data', 'SoftwareTitle')}>{row.software} <span style={getStyle('licencias', 'data', 'SoftwareSub')} onClick={(e) => { e.stopPropagation(); setActiveElement({table: 'licencias', section: 'data', key: 'SoftwareSub'}); }}>{row.version}</span></div>
                          <div onClick={() => setActiveElement({table: 'licencias', section: 'data', key: 'SoftwareTipo'})} style={getStyle('licencias', 'data', 'SoftwareTipo')}>{row.tipo}</div>
                        </div>
                      </td>
                      <td style={{ paddingLeft: '12px', paddingRight: '12px' }}>
                        <div onClick={() => setActiveElement({table: 'licencias', section: 'data', key: 'EquipoAsociado'})} style={getStyle('licencias', 'data', 'EquipoAsociado')}>{row.equipoMarca}</div>
                        <div onClick={() => setActiveElement({table: 'licencias', section: 'data', key: 'EquipoSerie'})} style={getStyle('licencias', 'data', 'EquipoSerie')}>{row.equipoSerie}</div>
                      </td>
                      <td onClick={() => setActiveElement({table: 'licencias', section: 'data', key: 'Fechas'})} style={getStyle('licencias', 'data', 'Fechas')}>{row.fAsig}</td>
                      <td onClick={() => setActiveElement({table: 'licencias', section: 'data', key: 'Fechas'})} style={getStyle('licencias', 'data', 'Fechas')}>{row.fVenc}</td>
                      <td style={{ paddingLeft: '12px', paddingRight: '12px' }}>
                        <div onClick={() => setActiveElement({table: 'licencias', section: 'data', key: 'Respaldo'})} style={getStyle('licencias', 'data', 'Respaldo')}>{row.resFac}</div>
                        <div onClick={() => setActiveElement({table: 'licencias', section: 'data', key: 'Respaldo'})} style={getStyle('licencias', 'data', 'Respaldo')}>{row.resOc}</div>
                      </td>
                      <td onClick={() => setActiveElement({table: 'licencias', section: 'data', key: 'Obs'})} style={getStyle('licencias', 'data', 'Obs')}>{row.obs}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                           <button className="p-1 text-amber-600 bg-amber-50 rounded border border-amber-200"><Edit2 size={14}/></button>
                           <button className="p-1 text-red-600 bg-red-50 rounded border border-red-200"><Undo2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-5 shadow-inner">
             <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Settings2 size={16}/> Resumen de Configuración CSS</h4>
             <p className="text-xs text-slate-300 mb-3">Este es el JSON estructurado del tema. Cuando estés satisfecho con el diseño, avísame para traducir esto a CSS real y aplicarlo en tus tablas.</p>
             <pre className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-[10px] overflow-x-auto max-h-64 overflow-y-auto">
{JSON.stringify(config, null, 2)}
             </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
