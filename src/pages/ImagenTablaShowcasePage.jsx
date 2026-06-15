import React, { useState } from 'react';

export default function ImagenTablaShowcasePage() {
  const [imageSize, setImageSize] = useState(40);
  const [borderRadius, setBorderRadius] = useState(8);
  const [objectFit, setObjectFit] = useState('cover');

  const mockEquipos = [
    { id: 1, desc: 'Notebook HP ProBook 440 G8', marca: 'HP', modelo: 'ProBook 440', serie: '5CD1234567', estado: 'DISPONIBLE', img: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=300&h=300&fit=crop' },
    { id: 2, desc: 'Monitor Dell UltraSharp 27', marca: 'Dell', modelo: 'U2722D', serie: 'CN-0ABCDE-123', estado: 'ASIGNADO', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=300&fit=crop' },
    { id: 3, desc: 'Impresora LaserJet Pro', marca: 'HP', modelo: 'M404dw', serie: 'VNB321987', estado: 'DISPONIBLE', img: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=300&h=300&fit=crop' },
    { id: 4, desc: 'Teclado Inalámbrico Logitech', marca: 'Logitech', modelo: 'MX Keys', serie: 'LZ123456', estado: 'PARA PRESTAMO', img: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=300&h=300&fit=crop' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-black text-gray-800 mb-6">Showcase: Tamaño de Imagen en Tablas</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-wrap gap-8 items-center">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Tamaño de Imagen (Ancho y Alto): <span className="text-blue-600">{imageSize}px</span>
          </label>
          <input 
            type="range" 
            min="20" 
            max="120" 
            value={imageSize} 
            onChange={(e) => setImageSize(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Bordes redondeados (Radius): <span className="text-blue-600">{borderRadius}px</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max={imageSize / 2} 
            value={borderRadius} 
            onChange={(e) => setBorderRadius(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Ajuste (Object Fit): <span className="text-blue-600">{objectFit}</span>
          </label>
          <select 
            value={objectFit}
            onChange={(e) => setObjectFit(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm border p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="cover">Cover (Recortar y llenar)</option>
            <option value="contain">Contain (Mostrar completa)</option>
            <option value="fill">Fill (Estirar)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-700">Previsualización de Tabla</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Imagen</th>
                <th className="px-6 py-4 font-semibold">Descripción del Bien</th>
                <th className="px-6 py-4 font-semibold">Marca</th>
                <th className="px-6 py-4 font-semibold">Modelo</th>
                <th className="px-6 py-4 font-semibold">Nº Serie</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {mockEquipos.map(eq => (
                <tr key={eq.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3">
                    <img 
                      src={eq.img} 
                      alt={eq.desc}
                      style={{
                        width: `${imageSize}px`,
                        height: `${imageSize}px`,
                        borderRadius: `${borderRadius}px`,
                        objectFit: objectFit,
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb'
                      }}
                    />
                  </td>
                  <td className="px-6 py-3 font-medium">{eq.desc}</td>
                  <td className="px-6 py-3">{eq.marca}</td>
                  <td className="px-6 py-3">{eq.modelo}</td>
                  <td className="px-6 py-3 font-mono text-[11px] text-gray-500">{eq.serie}</td>
                  <td className="px-6 py-3">
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase">
                      {eq.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-800 text-sm leading-relaxed">
        <h3 className="font-bold text-blue-900 mb-2">Recomendaciones:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Para mantener una tabla limpia y compacta, se recomienda un tamaño de <strong>36px a 44px</strong>.</li>
          <li>Un "Border Radius" de <strong>6px a 8px</strong> le da un aspecto moderno y suave (redondeado), mientras que <strong>50% (mitad del tamaño)</strong> lo hace circular (tipo avatar).</li>
          <li>El "Object Fit" ideal suele ser <strong>Cover</strong> para que la imagen ocupe todo el cuadrado sin distorsionarse, aunque <strong>Contain</strong> es útil si no quieres perder ninguna parte de la imagen.</li>
        </ul>
      </div>
    </div>
  );
}
