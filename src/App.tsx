// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/api/client'
import { useEffect } from 'react'
import { queryClient } from '@/lib/queryClient'

// Layout
import PanelLayout from '@/components/layout/PanelLayout'
import MasterLayout from '@/components/layout/MasterLayout'

// Panel (protected)
import LoginPage        from '@/pages/panel/LoginPage'
import DashboardPage    from '@/pages/panel/DashboardPage'
import TurnosPage       from '@/pages/panel/TurnosPage'
import AgendaPage       from '@/pages/panel/AgendaPage'
import CotizacionesPage from '@/pages/panel/CotizacionesPage'
import ReportesPage     from '@/pages/panel/ReportesPage'
import ConfiguracionPage from '@/pages/panel/ConfiguracionPage'
import UsuariosPage      from '@/pages/panel/UsuariosPage'

// Master (SuperAdmin)
import EmpresasPage        from '@/pages/master/EmpresasPage'
import MasterDashboardPage from '@/pages/master/MasterDashboardPage'
import ConfiguracionSaaSPage from '@/pages/master/ConfiguracionSaaSPage'

// Public (no auth)
import SolicitudPage    from '@/pages/public/SolicitudPage'
import TurnoTokenPage   from '@/pages/public/TurnoTokenPage'



function AuthSync() {
  const isAuth = useAuthStore(s => s.isAuth())
  const updateUsuario = useAuthStore(s => s.updateUsuario)

  useEffect(() => {
    if (isAuth) {
      authApi.me().then((res) => {
        if (res) updateUsuario(res)
      }).catch(() => {
        // Interceptor will handle 401
      })
    }
  }, [isAuth, updateUsuario])

  return null
}

function Protected({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore(s => s.isAuth())
  return isAuth ? <>{children}</> : <Navigate to="/panel/login" replace />
}

function Public({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore(s => s.isAuth())
  return isAuth ? (
    useAuthStore.getState().usuario?.rol === 'SUPER_ADMIN' 
      ? <Navigate to="/master/dashboard" replace /> 
      : <Navigate to="/panel/dashboard" replace />
  ) : <>{children}</>
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const rol = useAuthStore(s => s.usuario?.rol)
  return (rol === 'ADMIN' || rol === 'SUPER_ADMIN') ? <>{children}</> : <Navigate to="/panel/dashboard" replace />
}

function MasterOnly({ children }: { children: React.ReactNode }) {
  const rol = useAuthStore(s => s.usuario?.rol)
  return rol === 'SUPER_ADMIN' ? <>{children}</> : <Navigate to="/panel/dashboard" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      <BrowserRouter>
        <Routes>
          {/* ── Rutas públicas (sin auth) ─────────────────────────────── */}
          <Route path="/solicitar/:slug"  element={<SolicitudPage />} />
          <Route path="/turno/:token"     element={<TurnoTokenPage />} />

          {/* ── Panel de login ────────────────────────────────────────── */}
          <Route path="/panel/login" element={<Public><LoginPage /></Public>} />

          {/* ── Panel Maestro (SuperAdmin) ────────────────────────────── */}
          <Route path="/master" element={<Protected><MasterOnly><MasterLayout /></MasterOnly></Protected>}>
            <Route index element={<Navigate to="/master/dashboard" replace />} />
            <Route path="dashboard" element={<MasterDashboardPage />} />
            <Route path="empresas" element={<EmpresasPage />} />
            <Route path="configuracion" element={<ConfiguracionSaaSPage />} />
          </Route>

          {/* ── Panel protegido (Tenant) ───────────────────────────────── */}
          <Route path="/panel" element={<Protected><PanelLayout /></Protected>}>
            <Route index element={<Navigate to="/panel/dashboard" replace />} />
            <Route path="dashboard"    element={<DashboardPage />} />
            <Route path="turnos"       element={<TurnosPage />} />
            <Route path="agenda"       element={<AgendaPage />} />
            <Route path="cotizaciones" element={<CotizacionesPage />} />
            <Route path="reportes"     element={<AdminOnly><ReportesPage /></AdminOnly>} />
            <Route path="usuarios"     element={<AdminOnly><UsuariosPage /></AdminOnly>} />
            <Route path="configuracion" element={<AdminOnly><ConfiguracionPage /></AdminOnly>} />
          </Route>

          {/* ── Fallbacks ─────────────────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/panel/login" replace />} />
          <Route path="*" element={<Navigate to="/panel/login" replace />} />
        </Routes>
      </BrowserRouter>


      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'Outfit, sans-serif', fontSize: '13px', borderRadius: '10px' },
        }}
      />
    </QueryClientProvider>
  )
}
