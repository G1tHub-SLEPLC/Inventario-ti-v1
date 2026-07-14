import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search } from 'lucide-react';

export default function AllIconsShowcasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedIcon, setCopiedIcon] = useState(null);

  // Filtrar componentes que no son iconos (como funciones de utilidad o contextos)
  const allIconNames = useMemo(() => {
    return Object.keys(LucideIcons).filter(key => {
      const component = LucideIcons[key];
      // Solo nos interesan los componentes válidos que empiezan con mayúscula
      return typeof component === 'object' || typeof component === 'function';
    }).filter(key => {
      // Excluir utilidades y funciones que no son íconos renderizables
      return (
        key !== 'createLucideIcon' && 
        key !== 'default' && 
        key !== 'Icon' && 
        key !== 'LucideIcon' && 
        key !== 'icons' && 
        !key.endsWith('Context') &&
        /^[A-Z]/.test(key) // Todos los íconos de Lucide empiezan con mayúscula
      );
    });
  }, []);

  const filteredIcons = useMemo(() => {
    if (!searchTerm.trim()) return allIconNames;
    return allIconNames.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, allIconNames]);

  const handleCopy = (iconName) => {
    navigator.clipboard.writeText(`<${iconName} />`);
    setCopiedIcon(iconName);
    setTimeout(() => setCopiedIcon(null), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-[#112A46] tracking-tight">Galería Completa Lucide React</h1>
        <p className="text-lg text-gray-500">
          Mostrando {filteredIcons.length} de {allIconNames.length} iconos disponibles. 
          Haz clic en cualquier icono para copiar su código.
        </p>
      </div>

      <div className="relative max-w-md mx-auto sticky top-6 z-20">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar iconos (ej: user, trash, edit)..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006BB9] focus:border-[#006BB9] outline-none shadow-lg transition-all"
        />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {filteredIcons.map((iconName) => {
          const IconComponent = LucideIcons[iconName];
          if (!IconComponent) return null;
          
          return (
            <div 
              key={iconName}
              onClick={() => handleCopy(iconName)}
              className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-[#006BB9] hover:shadow-md transition-all cursor-pointer group relative h-24"
              title={iconName}
            >
              <IconComponent className="w-8 h-8 text-gray-600 group-hover:text-[#006BB9] group-hover:scale-110 transition-all mb-2" strokeWidth={1.5} />
              <span className="text-[10px] text-gray-500 font-mono truncate w-full text-center group-hover:text-[#006BB9] transition-colors">{iconName}</span>
              
              {copiedIcon === iconName && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none z-10">
                  ¡Copiado!
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {filteredIcons.length === 0 && (
        <div className="text-center py-20 text-gray-500 text-lg">
          No se encontraron iconos que coincidan con "<span className="font-bold">{searchTerm}</span>".
        </div>
      )}
    </div>
  );
}
