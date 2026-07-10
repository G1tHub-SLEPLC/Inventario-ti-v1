import { useState } from 'react';
import { MonitorSmartphone, LayoutList, ChevronDown, ChevronRight, User, Package, Settings, Cpu, HardDrive, Wifi, PlusCircle } from 'lucide-react';
import Badge from '../components/Badge';

const COLUMNS = ['Tipo', 'Marca', 'Modelo', 'Nº de serie', 'ID Publicación', 'RAM', 'Disco Duro', 'Mac', 'Procesador', 'Sistema Operativo', 'Estado', 'Usuario'];

const MOCK_DATA = [
  { id: 1, Tipo: 'NOTEBOOK', Marca: 'HP', Modelo: 'ProBook 440 G8', 'Nº de serie': '5CD1234567', 'ID Publicación': 'PUB-001', RAM: '8GB', 'Disco Duro': '256GB SSD', Mac: '00:1A:2B:3C:4D:5E', Procesador: 'Intel Core i5', 'Sistema Operativo': 'Windows 11', Estado: 'DISPONIBLE', Usuario: '' },
  { id: 2, Tipo: 'NOTEBOOK', Marca: 'Lenovo', Modelo: 'ThinkPad T14', 'Nº de serie': 'PF123456', 'ID Publicación': 'PUB-002', RAM: '16GB', 'Disco Duro': '512GB SSD', Mac: '00:1A:2B:3C:4D:5F', Procesador: 'Intel Core i7', 'Sistema Operativo': 'Windows 10 Pro', Estado: 'ASIGNADO', Usuario: 'Juan Pérez' },
  { id: 3, Tipo: 'NOTEBOOK', Marca: 'Dell', Modelo: 'Latitude 3420', 'Nº de serie': 'FGH123J', 'ID Publicación': 'PUB-003', RAM: '8GB', 'Disco Duro': '512GB SSD', Mac: '00:1A:2B:3C:4D:6A', Procesador: 'Intel Core i5', 'Sistema Operativo': 'Windows 10', Estado: 'EN PRESTAMO', Usuario: 'María Silva' },
];

export default function ResponsiveTableShowcasePage() {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRows(newSet);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
        
        <div>
          <h1 className="text-2xl font-black text-[#25306B] flex items-center gap-2 mb-2">
            <MonitorSmartphone size={28} className="text-[#006BB9]" />
            Showroom: Opciones Responsivas
          </h1>
          <p className="text-gray-600 text-sm">Visualización comparativa de las alternativas para tablas en dispositivos pequeños (&#60; 1024px). Ajusta el tamaño de la ventana de tu navegador para simular resoluciones móviles o tablets y ver cómo reacciona cada opción.</p>
        </div>

        {/* OPCIÓN 1: Scroll Horizontal (Actual) */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-4 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-[#25306B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">1</span>
              Mantener Scroll Horizontal (Comportamiento Actual)
            </h2>
            <p className="text-sm text-gray-500 mt-1">La tabla no pierde su formato original. Se habilita el deslizamiento lateral (`overflow-x-auto`) cuando el contenido excede la pantalla.</p>
          </div>
          
          <div className="table-scroll border border-gray-200 rounded-lg overflow-x-auto w-full">
            <table className="min-w-full text-sm text-left whitespace-nowrap">
              <thead>
                <tr>
                  {COLUMNS.map(c => <th key={c} className="px-3 py-2 bg-slate-50 border-b">{c}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {MOCK_DATA.map(row => (
                  <tr key={row.id}>
                    {COLUMNS.map(c => (
                      <td key={c} className="px-3 py-2">
                        {c === 'Estado' ? <Badge variant="estado" categoria="equipos" estado={row[c]} /> : 
                         c === 'Usuario' ? <Badge variant="user" categoria="nombres" estado="Funcionario" text={row[c] || '—'} /> : 
                         row[c]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* OPCIÓN 2: Vista de Tarjetas (Cards) */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-4 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-[#25306B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm">2</span>
              Opción Móvil: Vista de Tarjetas Apiladas
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Las filas de la tabla se transforman en bloques verticales estilizados. Recomendado exclusivamente para resoluciones pequeñas. Para ver el efecto, <strong className="text-indigo-600">disminuye el ancho de la ventana</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
            {MOCK_DATA.map(row => (
              <div key={row.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-black text-[#25306B] text-lg">{row.Marca} {row.Modelo}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">S/N: {row['Nº de serie']} | {row['ID Publicación']}</p>
                  </div>
                  <Badge variant="estado" categoria="equipos" estado={row.Estado} />
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[13px] mb-4">
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Procesador</span>
                    <span className="font-medium text-gray-800">{row.Procesador}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">RAM & Disco</span>
                    <span className="font-medium text-gray-800">{row.RAM} / {row['Disco Duro']}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Sistema</span>
                    <span className="font-medium text-gray-800">{row['Sistema Operativo']}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Mac Address</span>
                    <span className="font-medium text-gray-800 font-mono text-[11px] mt-0.5">{row.Mac}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Usuario Asignado</span>
                  <Badge variant="user" categoria="nombres" estado="Funcionario" text={row.Usuario || '—'} />
                </div>
              </div>
            ))}
          </div>
          
          <div className="hidden lg:flex items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400 text-sm">
            En resoluciones de escritorio (&#62; 1024px) aquí se mostraría la tabla normal estándar. ¡Achica la ventana para ver el diseño de tarjetas!
          </div>
        </section>

        {/* OPCIÓN 3: Tabla Acordeón */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-4 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-[#25306B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">3</span>
              Opción Móvil: Tabla Expandible (Acordeón)
            </h2>
            <p className="text-sm text-gray-500 mt-1">Muestra solo columnas críticas (Equipo, Estado, Usuario). El resto se visualiza al expandir con el botón `+`. Funciona muy bien tanto en móvil como desktop.</p>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="hidden md:grid grid-cols-[40px_minmax(150px,2fr)_100px_minmax(120px,1.5fr)] gap-4 px-4 py-3 bg-slate-50 border-b border-gray-200 font-bold text-xs text-gray-600">
              <div></div>
              <div>Equipo (Marca / Modelo)</div>
              <div>Estado</div>
              <div>Usuario Asignado</div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {MOCK_DATA.map(row => {
                const isExpanded = expandedRows.has(row.id);
                return (
                  <div key={row.id} className="flex flex-col transition-colors hover:bg-slate-50/50">
                    <div 
                      onClick={() => toggleRow(row.id)}
                      className="grid grid-cols-[40px_1fr] md:grid-cols-[40px_minmax(150px,2fr)_100px_minmax(120px,1.5fr)] gap-2 md:gap-4 px-2 md:px-4 py-3 items-center cursor-pointer"
                    >
                      <button className="w-8 h-8 rounded-full hover:bg-blue-50 text-blue-600 flex items-center justify-center transition-colors">
                        <PlusCircle size={20} className={`transform transition-transform ${isExpanded ? 'rotate-45 text-red-500' : ''}`} />
                      </button>
                      
                      <div className="flex flex-col md:block">
                        <span className="font-bold text-[#25306B] text-sm">{row.Marca} {row.Modelo}</span>
                        <span className="text-xs text-gray-500 md:hidden ml-2">{row['Nº de serie']}</span>
                      </div>
                      
                      <div className="hidden md:block">
                        <Badge variant="estado" categoria="equipos" estado={row.Estado} />
                      </div>
                      
                      <div className="hidden md:block">
                        <Badge variant="user" categoria="nombres" estado="Funcionario" text={row.Usuario || '—'} />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="bg-slate-50/80 px-4 md:px-14 py-4 border-t border-gray-100 text-sm">
                        <div className="grid grid-cols-1 md:hidden gap-3 mb-4">
                           <div className="flex items-center justify-between">
                             <span className="text-gray-500 font-semibold text-xs">Estado:</span>
                             <Badge variant="estado" categoria="equipos" estado={row.Estado} />
                           </div>
                           <div className="flex items-center justify-between">
                             <span className="text-gray-500 font-semibold text-xs">Usuario:</span>
                             <Badge variant="user" categoria="nombres" estado="Funcionario" text={row.Usuario || '—'} />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">S/N</span>
                            <span className="font-medium text-gray-800">{row['Nº de serie']}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">ID Pub</span>
                            <span className="font-medium text-gray-800">{row['ID Publicación']}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Procesador</span>
                            <span className="font-medium text-gray-800">{row.Procesador}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">RAM</span>
                            <span className="font-medium text-gray-800">{row.RAM}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Disco</span>
                            <span className="font-medium text-gray-800">{row['Disco Duro']}</span>
                          </div>
                          <div>
                            <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Sistema OS</span>
                            <span className="font-medium text-gray-800">{row['Sistema Operativo']}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Mac Address</span>
                            <span className="font-medium text-gray-800 font-mono">{row.Mac}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </div>
  );
}
