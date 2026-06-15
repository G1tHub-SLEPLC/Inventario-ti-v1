import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { InventarioProvider } from './context/InventarioContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SolicitudesProvider } from './context/SolicitudesContext';
import { LicenciasProvider } from './context/LicenciasContext';

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
const LicenciasShowcasePage = lazy(() => import('./pages/LicenciasShowcasePage'));
const DisponiblesShowcasePage = lazy(() => import('./pages/DisponiblesShowcasePage'));
const LicenciasBadgeShowcasePage = lazy(() => import('./pages/LicenciasBadgeShowcasePage'));
const QRInfoPage = lazy(() => import('./pages/QRInfoPage'));
const RowHeightShowcasePage = lazy(() => import('./pages/RowHeightShowcasePage'));
const ImagenTablaShowcasePage = lazy(() => import('./pages/ImagenTablaShowcasePage'));

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
      <InventarioProvider>
        <SolicitudesProvider>
          <LicenciasProvider>
            <BrowserRouter>
            <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-400">Cargando…</div>}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/qr-info" element={<QRInfoPage />} />
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

                  {/* SLEP Routes */}
                  <Route path="slep/dashboard" element={<SlepRoute><SlepDashboardPage /></SlepRoute>} />
                  <Route path="slep/solicitudes" element={<SlepRoute><MisSolicitudesPage /></SlepRoute>} />
                  
                  {/* Unauthorized */}
                  <Route path="unauthorized" element={<UnauthorizedPage />} />
                  
                  {/* Hidden Showcase */}
                  <Route path="showcase" element={<BadgeShowcasePage />} />
                  <Route path="badge" element={<EstadoBadgeShowcasePage />} />
                  <Route path="licencias-showcase" element={<LicenciasShowcasePage />} />
                  <Route path="disponibles-showcase" element={<DisponiblesShowcasePage />} />
                  <Route path="licencias-badge" element={<LicenciasBadgeShowcasePage />} />
                  <Route path="row-height-showcase" element={<RowHeightShowcasePage />} />
                  <Route path="imagen-tabla-showcase" element={<ImagenTablaShowcasePage />} />
                  
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            </BrowserRouter>
          </LicenciasProvider>
        </SolicitudesProvider>
      </InventarioProvider>
    </AuthProvider>
  );
}
