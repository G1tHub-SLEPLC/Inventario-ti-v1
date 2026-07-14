import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { InventarioProvider } from './context/InventarioContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SolicitudesProvider } from './context/SolicitudesContext';
import { LicenciasProvider } from './context/LicenciasContext';
import { AlertProvider } from './context/AlertContext';

// Lazy imports
const AppShell        = lazy(() => import('./layouts/AppShell'));
const DashboardPage   = lazy(() => import('./pages/DashboardPage'));
const NuevoEquipoPage = lazy(() => import('./pages/NuevoEquipoPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const InsumosPage = lazy(() => import('./pages/InsumosPage'));
const SolicitudesAdminPage = lazy(() => import('./pages/SolicitudesAdminPage'));
const UsuariosAdminPage = lazy(() => import('./pages/UsuariosAdminPage'));
const SlepDashboardPage = lazy(() => import('./pages/SlepDashboardPage'));
const MisSolicitudesPage = lazy(() => import('./pages/MisSolicitudesPage'));
const AuditoriaPage = lazy(() => import('./pages/AuditoriaPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));
const BadgeShowcasePage = lazy(() => import('./pages/BadgeShowcasePage'));
const LicenciasAdminPage = lazy(() => import('./pages/LicenciasAdminPage'));
const GlobalDashboardPage = lazy(() => import('./pages/GlobalDashboardPage'));
const EstadoBadgeShowcasePage = lazy(() => import('./pages/EstadoBadgeShowcasePage'));
const GlobalBadgeCustomizerPage = lazy(() => import('./pages/GlobalBadgeCustomizerPage'));
const LicenciasShowcasePage = lazy(() => import('./pages/LicenciasShowcasePage'));
const DisponiblesShowcasePage = lazy(() => import('./pages/DisponiblesShowcasePage'));
const LicenciasBadgeShowcasePage = lazy(() => import('./pages/LicenciasBadgeShowcasePage'));
const QRInfoPage = lazy(() => import('./pages/QRInfoPage'));
const RowHeightShowcasePage = lazy(() => import('./pages/RowHeightShowcasePage'));
const ImagenTablaShowcasePage = lazy(() => import('./pages/ImagenTablaShowcasePage'));
const AlertShowcasePage = lazy(() => import('./pages/AlertShowcasePage'));
const DateTimeShowcasePage = lazy(() => import('./pages/DateTimeShowcasePage'));
const ToastShowcasePage = lazy(() => import('./pages/ToastShowcasePage'));
const SoundShowcasePage = lazy(() => import('./pages/SoundShowcasePage'));
const IconShowcasePage = lazy(() => import('./pages/IconShowcasePage'));
const BajasPage = lazy(() => import('./pages/BajasPage'));
const ResponsiveTableShowcasePage = lazy(() => import('./pages/ResponsiveTableShowcasePage'));
const TableFontSizeShowcasePage = lazy(() => import('./pages/TableFontSizeShowcasePage'));
const AllIconsShowcasePage = lazy(() => import('./pages/AllIconsShowcasePage'));

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  
  if (loading && !session) {
    return <div className="flex items-center justify-center h-screen bg-slate-900 text-blue-200">Verificando sesión...</div>;
  }
  
  if (!session && !loading) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  return children;
}

function AdminRoute({ children }) {
  const { isAdmin, isSlep, perfil, loading } = useAuth();
  if (loading && !perfil) return null;
  if (!isAdmin && !isSlep) return <Navigate to="/unauthorized" replace />;
  if (!isAdmin) return <Navigate to="/slep/dashboard" replace />;
  return children;
}

function SlepRoute({ children }) {
  const { isSlep, isAdmin, perfil, loading } = useAuth();
  if (loading && !perfil) return null;
  if (!isSlep && !isAdmin) return <Navigate to="/unauthorized" replace />;
  return children;
}

function HomeRoute() {
  const { isAdmin, isSlep, perfil, loading } = useAuth();
  if (loading && !perfil) return null;
  if (isAdmin) return <Navigate to="/dashboard" replace />;
  if (isSlep) return <Navigate to="/slep/dashboard" replace />;
  return <Navigate to="/unauthorized" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <InventarioProvider>
          <SolicitudesProvider>
            <LicenciasProvider>
            <BrowserRouter>
            <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-400">Cargando…</div>}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/qr-info" element={<QRInfoPage />} />
                <Route path="/icons" element={<IconShowcasePage />} />
                <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
                  
                  {/* Common Route */}
                  <Route index element={<HomeRoute />} />
                  
                  {/* Admin Routes */}
                  <Route path="equipos" element={<AdminRoute><DashboardPage /></AdminRoute>} />
                  <Route path="dashboard" element={<AdminRoute><GlobalDashboardPage /></AdminRoute>} />
                  <Route path="nuevo-equipo" element={<AdminRoute><NuevoEquipoPage /></AdminRoute>} />
                  <Route path="editar-equipo" element={<Navigate to="/equipos" replace />} />
                  <Route path="insumos" element={<AdminRoute><InsumosPage /></AdminRoute>} />
                  <Route path="solicitudes" element={<AdminRoute><SolicitudesAdminPage /></AdminRoute>} />
                  <Route path="usuarios" element={<AdminRoute><UsuariosAdminPage /></AdminRoute>} />
                  <Route path="licencias" element={<AdminRoute><LicenciasAdminPage /></AdminRoute>} />
                  <Route path="auditoria" element={<AdminRoute><AuditoriaPage /></AdminRoute>} />
                  <Route path="bajas" element={<AdminRoute><BajasPage /></AdminRoute>} />

                  {/* SLEP Routes */}
                  <Route path="slep/dashboard" element={<SlepRoute><SlepDashboardPage /></SlepRoute>} />
                  <Route path="slep/solicitudes" element={<SlepRoute><MisSolicitudesPage /></SlepRoute>} />
                  
                  {/* Unauthorized */}
                  <Route path="unauthorized" element={<UnauthorizedPage />} />
                  
                  {/* Hidden Showcase */}
                  <Route path="badge-customizer" element={<GlobalBadgeCustomizerPage />} />
                  <Route path="showcase" element={<BadgeShowcasePage />} />
                  <Route path="badge" element={<EstadoBadgeShowcasePage />} />
                  <Route path="licencias-showcase" element={<LicenciasShowcasePage />} />
                  <Route path="disponibles-showcase" element={<DisponiblesShowcasePage />} />
                  <Route path="licencias-badge" element={<LicenciasBadgeShowcasePage />} />
                  <Route path="row-height-showcase" element={<RowHeightShowcasePage />} />
                  <Route path="imagen-tabla-showcase" element={<ImagenTablaShowcasePage />} />
                  <Route path="alert-showcase" element={<AlertShowcasePage />} />
                  <Route path="datetime-showcase" element={<DateTimeShowcasePage />} />
                  <Route path="toast-showcase" element={<ToastShowcasePage />} />
                  <Route path="sound-showcase" element={<SoundShowcasePage />} />
                  <Route path="icon-showcase" element={<IconShowcasePage />} />
                  <Route path="responsive-table-showcase" element={<ResponsiveTableShowcasePage />} />
                  <Route path="table-font-size-showcase" element={<TableFontSizeShowcasePage />} />
                  <Route path="all-icons" element={<AllIconsShowcasePage />} />
                  
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            </BrowserRouter>
            </LicenciasProvider>
          </SolicitudesProvider>
        </InventarioProvider>
      </AlertProvider>
    </AuthProvider>
  );
}
