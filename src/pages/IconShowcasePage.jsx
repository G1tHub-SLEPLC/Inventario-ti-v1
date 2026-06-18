import React, { useState } from 'react';
import { 
  Edit2, Trash2, CheckCircle, Check, X, XCircle, PlusCircle, Plus, 
  Download, Upload, UploadCloud, Printer, Eye, Clock, AlertTriangle, 
  Play, Save, FileText, Settings, UserPlus, Users, Monitor, Database,
  Key, ShieldCheck, LayoutDashboard, Package, LogOut, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Search, Box, RefreshCw
} from 'lucide-react';

const icons = [
  { name: 'Edit2', icon: Edit2, description: 'Editar elemento o cambiar fecha', category: 'Acciones Principales', color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: 'Trash2', icon: Trash2, description: 'Eliminar, revocar o borrar registro', category: 'Acciones Principales', color: 'text-red-500', bg: 'bg-red-50' },
  { name: 'Check', icon: Check, description: 'Aprobar solicitud o confirmar', category: 'Estados y Confirmaciones', color: 'text-green-600', bg: 'bg-green-50' },
  { name: 'CheckCircle', icon: CheckCircle, description: 'Marcar disponible o estado exitoso', category: 'Estados y Confirmaciones', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'X', icon: X, description: 'Cerrar modal o rechazar solicitud', category: 'Estados y Confirmaciones', color: 'text-rose-600', bg: 'bg-rose-50' },
  { name: 'XCircle', icon: XCircle, description: 'Estado fallido o cancelar', category: 'Estados y Confirmaciones', color: 'text-red-600', bg: 'bg-red-50' },
  { name: 'PlusCircle', icon: PlusCircle, description: 'Añadir nuevo registro principal', category: 'Acciones Principales', color: 'text-[#006BB9]', bg: 'bg-blue-50' },
  { name: 'Download', icon: Download, description: 'Descargar Acta o exportar a Excel', category: 'Exportación y Archivos', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { name: 'UploadCloud', icon: UploadCloud, description: 'Carga masiva de Excel o subir archivo', category: 'Exportación y Archivos', color: 'text-[#006BB9]', bg: 'bg-blue-50' },
  { name: 'Printer', icon: Printer, description: 'Exportar a PDF o imprimir', category: 'Exportación y Archivos', color: 'text-rose-700', bg: 'bg-rose-50' },
  { name: 'Eye', icon: Eye, description: 'Ver detalles de un elemento', category: 'Navegación e Interfaz', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { name: 'Clock', icon: Clock, description: 'Registrar devolución o historial', category: 'Acciones Principales', color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'AlertTriangle', icon: AlertTriangle, description: 'Dar de baja, atraso o advertencia', category: 'Estados y Confirmaciones', color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'Play', icon: Play, description: 'Probar sonido o iniciar acción', category: 'Navegación e Interfaz', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { name: 'FileText', icon: FileText, description: 'Ver acta firmada o documento', category: 'Exportación y Archivos', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'LayoutDashboard', icon: LayoutDashboard, description: 'Dashboard o Inicio', category: 'Módulos', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { name: 'Monitor', icon: Monitor, description: 'Equipos tecnológicos', category: 'Módulos', color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Database', icon: Database, description: 'Insumos y consumibles', category: 'Módulos', color: 'text-teal-600', bg: 'bg-teal-50' },
  { name: 'Package', icon: Package, description: 'Inventario o paquetes', category: 'Módulos', color: 'text-sky-600', bg: 'bg-sky-50' },
  { name: 'Key', icon: Key, description: 'Licencias de software', category: 'Módulos', color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'Users', icon: Users, description: 'Gestión de usuarios', category: 'Módulos', color: 'text-purple-600', bg: 'bg-purple-50' },
  { name: 'ShieldCheck', icon: ShieldCheck, description: 'Auditoría y seguridad', category: 'Módulos', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'Search', icon: Search, description: 'Buscar o filtrar listados', category: 'Navegación e Interfaz', color: 'text-gray-500', bg: 'bg-gray-100' },
  { name: 'RefreshCw', icon: RefreshCw, description: 'Actualizar o sincronizar datos', category: 'Acciones Principales', color: 'text-blue-500', bg: 'bg-blue-50' },
];

export default function IconShowcasePage() {
  const [copiedIcon, setCopiedIcon] = useState(null);

  const handleCopy = (iconName) => {
    navigator.clipboard.writeText(`<${iconName} size={16} />`);
    setCopiedIcon(iconName);
    setTimeout(() => setCopiedIcon(null), 2000);
  };

  const categories = [...new Set(icons.map(i => i.category))];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-[#112A46] tracking-tight">Iconos del Sistema</h1>
        <p className="text-lg text-gray-500">Galería de iconos de la librería <span className="font-semibold text-rose-500">lucide-react</span> utilizados en la plataforma.</p>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {icons.filter(i => i.category === category).map((item) => (
              <div 
                key={item.name} 
                onClick={() => handleCopy(item.name)}
                className="group relative bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
              >
                <div className={`p-4 rounded-xl ${item.bg} group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-8 h-8 ${item.color} stroke-[2px]`} />
                </div>
                <div className="text-center w-full">
                  <p className="font-bold text-gray-800 font-mono text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-tight">{item.description}</p>
                </div>

                {/* Tooltip de copiado */}
                {copiedIcon === item.name && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg whitespace-nowrap animate-slide-in pointer-events-none">
                    ¡Código copiado!
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
