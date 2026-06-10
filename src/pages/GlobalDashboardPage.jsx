import React from 'react';
import { 
  LayoutDashboard, 
  Monitor, 
  Database, 
  Key, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users,
  Package,
  ShieldCheck
} from 'lucide-react';
import { useInventario } from '../context/InventarioContext';
import { useSolicitudes } from '../context/SolicitudesContext';
import { useLicencias } from '../context/LicenciasContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const norm = (s) => (s == null ? '' : String(s)).trim().toLowerCase().replace(/\s+/g, ' ');
const isAvailable = (usuario) => {
  const v = norm(usuario);
  return v === '' || v === 'disponible';
};

export default function GlobalDashboardPage() {
  const { equipos, loading: loadingEquipos } = useInventario();
  const { insumos, solicitudes, loading: loadingSolicitudes } = useSolicitudes();
  const { licencias, asignaciones, loading: loadingLicencias } = useLicencias();
  const { perfil, session } = useAuth();

  const loading = loadingEquipos || loadingSolicitudes || loadingLicencias;

  // Equipos KPI
  const totalEquipos = equipos.length;
  const equiposDisponibles = equipos.filter(e => isAvailable(e['Usuario'])).length;
  const equiposAsignados = totalEquipos - equiposDisponibles;

  // Insumos KPI
  const totalInsumosTipos = insumos.length;
  const totalInsumosStock = insumos.reduce((sum, item) => sum + (item.cantidad_disponible || 0), 0);

  // Solicitudes KPI
  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
  const solicitudesAprobadas = solicitudes.filter(s => s.estado === 'aprobado').length;
  const solicitudesRechazadas = solicitudes.filter(s => s.estado === 'rechazado').length;

  // Licencias KPI
  const totalLicencias = licencias.reduce((sum, lic) => sum + (lic.cantidad_total || 0), 0);
  const licenciasAsignadas = asignaciones.length;
  const licenciasDisponibles = Math.max(0, totalLicencias - licenciasAsignadas);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const formatEmailName = (email) => {
    if (!email) return '';
    return email.split('@')[0]
      .split(/[\.\-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const displayName = perfil?.nombre || formatEmailName(session?.user?.email || perfil?.email);
  const firstName = displayName.trim().split(' ')[0] || 'Administrador';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006BB9]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Profile Section */}
      <div className="bg-gradient-to-r from-[#112A46] to-[#006BB9] rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <ShieldCheck size={300} strokeWidth={1} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {firstName}</h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Bienvenido al panel de control central. Aquí tienes un resumen del estado de los recursos tecnológicos y solicitudes del SLEP.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Equipos Card */}
        <Link to="/equipos" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 p-3 rounded-xl text-[#006BB9] group-hover:scale-110 transition-transform">
                <Monitor size={24} />
              </div>
              <span className="text-3xl font-black text-gray-800">{totalEquipos}</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Equipos Informáticos</h2>
            <p className="text-sm text-gray-500 mb-4">Total en inventario</p>
          </div>
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Disponibles</span>
              <span className="font-semibold text-emerald-600">{equiposDisponibles}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Asignados/Uso</span>
              <span className="font-semibold text-blue-600">{equiposAsignados}</span>
            </div>
          </div>
        </Link>

        {/* Licencias Card */}
        <Link to="/licencias" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                <Key size={24} />
              </div>
              <span className="text-3xl font-black text-gray-800">{totalLicencias}</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Licencias de Software</h2>
            <p className="text-sm text-gray-500 mb-4">Cupos totales administrados</p>
          </div>
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Disponibles</span>
              <span className="font-semibold text-emerald-600">{licenciasDisponibles}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Asignadas</span>
              <span className="font-semibold text-blue-600">{licenciasAsignadas}</span>
            </div>
          </div>
        </Link>

        {/* Insumos Card */}
        <Link to="/insumos" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-50 p-3 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
                <Database size={24} />
              </div>
              <span className="text-3xl font-black text-gray-800">{totalInsumosTipos}</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Stock de Insumos</h2>
            <p className="text-sm text-gray-500 mb-4">Tipos de insumos registrados</p>
          </div>
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Unidades Totales</span>
              <span className="font-semibold text-amber-600">{totalInsumosStock}</span>
            </div>
            <div className="flex justify-between items-center text-sm opacity-0">
              <span>Spacer</span>
              <span>-</span>
            </div>
          </div>
        </Link>

        {/* Solicitudes Card */}
        <Link to="/solicitudes" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group flex flex-col justify-between relative overflow-hidden">
          {solicitudesPendientes > 0 && (
            <div className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
              {solicitudesPendientes} Nuevas
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-rose-50 p-3 rounded-xl text-rose-600 group-hover:scale-110 transition-transform">
                <AlertCircle size={24} />
              </div>
              <span className="text-3xl font-black text-gray-800">{solicitudes.length}</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Solicitudes</h2>
            <p className="text-sm text-gray-500 mb-4">Préstamos e Insumos</p>
          </div>
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 flex items-center gap-1.5"><Clock size={14} /> Pendientes</span>
              <span className="font-semibold text-rose-600">{solicitudesPendientes}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 flex items-center gap-1.5"><CheckCircle size={14} /> Aprobadas</span>
              <span className="font-semibold text-emerald-600">{solicitudesAprobadas}</span>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
