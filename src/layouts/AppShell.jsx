import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, PlusCircle, Monitor, CheckCircle, AlertCircle, AlertTriangle, LogOut, Users, User, ShieldCheck, Key, ChevronDown, Info, Trash2 } from 'lucide-react';
import { useInventario } from '../context/InventarioContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { stopNotificationSound } from '../utils/audioUtils';

const ADMIN_NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio', desc: 'Resumen global del sistema' },
  { to: '/equipos', icon: Monitor, label: 'Equipos', desc: 'Gestión y métricas de equipos informáticos' },
  { to: '/insumos', icon: Database, label: 'Insumos', desc: 'Gestión y asignación de insumos' },
  { to: '/licencias', icon: Key, label: 'Licencias', desc: 'Gestión y asignación de licencias de software' },
  { to: '/solicitudes', icon: AlertCircle, label: 'Solicitudes', desc: 'Aprobar o rechazar solicitudes de usuarios' },
  { to: '/usuarios', icon: Users, label: 'Usuarios', desc: 'Administrar perfiles y accesos al sistema' },
  { to: '/auditoria', icon: ShieldCheck, label: 'Auditoría', desc: 'Registro de todos los movimientos del sistema' },
  { to: '/bajas', icon: Trash2, label: 'De Baja', desc: 'Registro de activos dados de baja' },
];

const SLEP_NAV_ITEMS = [
  { to: '/slep/dashboard', icon: Monitor, label: 'Inicio', desc: 'Revisar tus equipos asignados y solicitar insumos' },
  { to: '/slep/solicitudes', icon: AlertCircle, label: 'Mis Solicitudes', desc: 'Estado de tus solicitudes de insumos o préstamos' },
];

export default function AppShell() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { pathname } = useLocation();
  const { toast, setToast } = useInventario();
  const { isAdmin, isSlep, perfil, session } = useAuth();

  const [visibleToast, setVisibleToast] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  
  const toastTimeoutRef = useRef(null);
  const exitTimeoutRef = useRef(null);

  const handleCloseToast = useCallback(() => {
    setIsExiting(true);
    stopNotificationSound(); // Stop the looping sound
    if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    exitTimeoutRef.current = setTimeout(() => {
      setVisibleToast(null);
      setToast(null);
      setIsExiting(false);
    }, 250);
  }, [setToast]);

  const startToastTimer = useCallback((currentToast) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    const toastToCheck = currentToast || visibleToast;
    if (toastToCheck?.requireClose) return; // Do not start timer if manual close is required
    toastTimeoutRef.current = setTimeout(() => {
      handleCloseToast();
    }, 15000);
  }, [handleCloseToast, visibleToast]);

  const stopToastTimer = useCallback(() => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (toast && toast.id !== visibleToast?.id) {
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
      setVisibleToast(toast);
      setIsExiting(false);
      startToastTimer(toast); // Pass the new toast directly
    }
  }, [toast, startToastTimer, visibleToast]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, []);

  const formatEmailName = (email) => {
    if (!email) return '';
    return email.split('@')[0]
      .split(/[\.\-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const displayName = perfil?.nombre || formatEmailName(session?.user?.email || perfil?.email);

  const getShortName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 4) {
      return `${parts[0]} ${parts[2]}`;
    }
    if (parts.length === 3) {
      return `${parts[0]} ${parts[1]}`;
    }
    return fullName;
  };
  const shortName = getShortName(displayName);

  const NAV_ITEMS = isAdmin ? ADMIN_NAV_ITEMS : (isSlep ? SLEP_NAV_ITEMS : []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0 z-20 shadow-sm flex items-center justify-between px-3 md:px-6 py-2">
        <div className="flex items-center justify-start">
          <img
            src="/logo.png"
            alt="Logo SLEP Los Copihues"
            style={{
              maxWidth: '140px',
              height: 'auto',
              objectFit: 'contain',
              position: 'relative',
              top: '0px',
              left: '-10px'
            }}
          />
        </div>
        <nav className="flex items-center gap-2 flex-1 justify-end min-w-0 overflow-hidden">
          <div className="flex items-center gap-1 xl:gap-1.5 overflow-x-auto hide-scrollbar py-1 px-1">
            {NAV_ITEMS.map(({ to, icon: Icon, label, desc }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} title={desc}
                  className={`flex items-center gap-1 xl:gap-1.5 px-2 xl:px-3 py-1.5 rounded-lg text-[10px] xl:text-[11px] uppercase tracking-wide font-bold transition-colors
                  ${active ? 'bg-blue-50 text-[#006BB9]' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                  <Icon size={14} strokeWidth={2.5} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="w-px h-6 bg-gray-300 mx-1 flex-shrink-0"></div>
        <div className="relative ml-1 sm:ml-2 flex-shrink-0">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1 pr-3 rounded-full bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100/70 transition-all focus:outline-none shadow-sm"
          >
            <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center overflow-hidden relative border border-sky-300 flex-shrink-0">
              <User className="w-[15px] h-[15px] text-blue-700 fill-blue-700" />
            </div>
            <span className="text-[10px] xl:text-[11px] font-semibold tracking-wide text-blue-700 hidden sm:block max-w-[140px] truncate" title={displayName}>
              {shortName}
            </span>
            <ChevronDown size={16} className="text-sky-600 flex-shrink-0" />
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-auto whitespace-nowrap min-w-[130px] bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-fade-in">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-[10px] xl:text-[11px] font-semibold tracking-wide text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={12} /> Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto bg-[var(--slep-bg)] w-full">
        <Outlet />
      </main>

      {/* Floating Toast Notification */}
      {visibleToast && (
        <div 
          onMouseEnter={() => stopToastTimer()}
          onMouseLeave={() => startToastTimer(visibleToast)}
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border w-[90%] max-w-md text-sm transition-all duration-300 ${isExiting ? 'animate-slide-out' : 'animate-slide-in'} ${visibleToast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          visibleToast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
          visibleToast.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
            'bg-red-50 border-red-200 text-red-800'
          }`}>
          {visibleToast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
          {visibleToast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
          {visibleToast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
          {visibleToast.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}

          <div className="flex-1">
            <p className="font-bold text-xs uppercase tracking-wider">{visibleToast.title}</p>

            {visibleToast.addedCount !== undefined || (visibleToast.duplicateSerials && visibleToast.duplicateSerials.length > 0) ? (
              <div className="text-xs opacity-90 mt-1.5 space-y-1.5">
                {visibleToast.addedCount !== undefined && (
                  <p>
                    {visibleToast.addedCount > 0
                      ? `Se agregaron ${visibleToast.addedCount} equipos en total.`
                      : 'No se agregaron nuevos equipos.'}
                  </p>
                )}
                {visibleToast.noSerialCount > 0 && (
                  <div>
                    <p className={visibleToast.isFirstUpload ? "text-amber-900 font-bold" : ""}>
                      • {visibleToast.noSerialCount} equipos {visibleToast.isFirstUpload ? "ingresados SIN N° de Serie." : "omitidos por falta de N° de Serie."}
                    </p>
                    {visibleToast.isFirstUpload && (
                      <p className="mt-1 text-[10px] leading-tight text-amber-800 bg-amber-100 p-1.5 rounded border border-amber-200">
                        ⚠️ <strong>¡CRUCIAL!</strong> Es necesario que edites estos equipos a la brevedad y les asignes un número de serie o identificador único por seguridad.
                      </p>
                    )}
                  </div>
                )}
                {visibleToast.duplicateSerials && visibleToast.duplicateSerials.length > 0 && (
                  <div className="group relative cursor-help inline-block mt-1">
                    <span className="border-b border-dashed border-amber-500 font-medium text-amber-900">
                      • {visibleToast.duplicateSerials.length} equipos omitidos por duplicidad (Ver detalle)
                    </span>

                    {/* Tooltip Wrapper (bridges gap to prevent hover loss) */}
                    <div className="invisible group-hover:visible absolute bottom-full left-0 pb-2 z-50">
                      {/* Tooltip Styled Box */}
                      <div className="bg-slate-800 text-white p-2.5 rounded-lg shadow-xl w-64 max-h-48 overflow-y-auto leading-relaxed font-mono whitespace-normal normal-case border border-slate-700">
                        <strong className="text-slate-300 block border-b border-slate-700 pb-1 mb-1">Series duplicadas omitidas:</strong>
                        <div className="flex flex-wrap gap-1">
                          {visibleToast.duplicateSerials.map((s, idx) => (
                            <span key={idx} className="bg-slate-700 px-1 py-0.5 rounded text-[9px]">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs opacity-90 mt-0.5 whitespace-pre-line">{visibleToast.message}</p>
            )}
          </div>

          <button onClick={handleCloseToast} className="text-gray-400 hover:text-gray-600 font-bold ml-2 shrink-0 text-lg leading-none focus:outline-none">
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
