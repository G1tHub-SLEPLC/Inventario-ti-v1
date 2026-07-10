import { Type, CheckCircle } from 'lucide-react';
import Badge from '../components/Badge';

const COLUMNS = ['Tipo', 'Marca', 'Modelo', 'Nº de serie', 'Procesador', 'RAM', 'Disco Duro', 'Estado'];

const MOCK_DATA = [
  { id: 1, Tipo: 'NOTEBOOK', Marca: 'HP', Modelo: 'ProBook 440 G8', 'Nº de serie': '5CD1234567', Procesador: 'Intel Core i5', RAM: '8GB', 'Disco Duro': '256GB SSD', Estado: 'DISPONIBLE' },
  { id: 2, Tipo: 'NOTEBOOK', Marca: 'Lenovo', Modelo: 'ThinkPad T14', 'Nº de serie': 'PF123456', Procesador: 'Intel Core i7', RAM: '16GB', 'Disco Duro': '512GB SSD', Estado: 'ASIGNADO' },
];

export default function TableFontSizeShowcasePage() {
  const tableOptions = [
    {
      id: 1,
      title: 'Opción 1: Actual (Muy pequeña)',
      desc: 'Cabeceras: 11px | Celdas: 11.5px. Es la que se está usando actualmente.',
      headerClass: 'text-[11px]',
      cellClass: 'text-[11.5px]',
      rowHeight: 'py-1.5'
    },
    {
      id: 2,
      title: 'Opción 2: Mediana',
      desc: 'Cabeceras: 12px | Celdas: 13px. Un poco más grande pero sigue compacta.',
      headerClass: 'text-[12px]',
      cellClass: 'text-[13px]',
      rowHeight: 'py-2'
    },
    {
      id: 3,
      title: 'Opción 3: Estándar (Recomendada)',
      desc: 'Cabeceras: 13px | Celdas: 14px. Balance ideal entre legibilidad y cantidad de información en pantalla.',
      headerClass: 'text-[13px]',
      cellClass: 'text-sm', // 14px
      rowHeight: 'py-2.5'
    },
    {
      id: 4,
      title: 'Opción 4: Grande',
      desc: 'Cabeceras: 14px | Celdas: 15px. Excelente legibilidad, pero las tablas ocuparán más ancho y alto.',
      headerClass: 'text-sm', // 14px
      cellClass: 'text-[15px]',
      rowHeight: 'py-3'
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12 pb-24">
      <div>
        <h1 className="text-2xl font-black text-[#25306B] flex items-center gap-2 mb-2">
          <Type size={28} className="text-[#006BB9]" />
          Showroom: Tamaños de Fuente en Tablas
        </h1>
        <p className="text-gray-600 text-sm">Compara las diferentes opciones de tamaño de texto para decidir cuál aplicamos a todas las tablas del sistema.</p>
      </div>

      <div className="space-y-10">
        {tableOptions.map(opt => (
          <section key={opt.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="mb-4 border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-[#25306B] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">{opt.id}</span>
                {opt.title}
                {opt.id === 3 && <span className="ml-2 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider"><CheckCircle size={10}/> Recomendada</span>}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg overflow-x-auto w-full">
              <table className="min-w-full text-left whitespace-nowrap">
                <thead className="bg-[#25306B] text-white">
                  <tr>
                    {COLUMNS.map(c => (
                      <th key={c} className={`px-4 py-2 font-bold ${opt.headerClass} tracking-wide border-b border-gray-200`}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {MOCK_DATA.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      {COLUMNS.map(c => (
                        <td key={c} className={`px-4 ${opt.rowHeight} ${opt.cellClass} text-gray-700`}>
                          {c === 'Estado' ? <Badge variant="estado" categoria="equipos" estado={row[c]} /> : row[c]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
