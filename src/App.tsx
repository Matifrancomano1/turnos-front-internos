// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/store/auth'

// Layout
import PanelLayout from '@/components/layout/PanelLayout'

// Panel (protected)
import LoginPage        from '@/pages/panel/LoginPage'
import DashboardPage    from '@/pages/panel/DashboardPage'
import TurnosPage       from '@/pages/panel/TurnosPage'
import AgendaPage       from '@/pages/panel/AgendaPage'
import CotizacionesPage from '@/pages/panel/CotizacionesPage'
import ReportesPage     from '@/pages/panel/ReportesPage'
import ConfiguracionPage from '@/pages/panel/ConfiguracionPage'
import UsuariosPage      from '@/pages/panel/UsuariosPage'

// Public (no auth)
import SolicitudPage    from '@/pages/public/SolicitudPage'
import TurnoTokenPage   from '@/pages/public/TurnoTokenPage'

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 } },
})

function Protected({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore(s => s.isAuth())
  return isAuth ? <>{children}</> : <Navigate to="/panel/login" replace />
}

function Public({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore(s => s.isAuth())
  return isAuth ? <Navigate to="/panel/dashboard" replace /> : <>{children}</>
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const rol = useAuthStore(s => s.usuario?.rol)
  return rol === 'ADMIN' ? <>{children}</> : <Navigate to="/panel/dashboard" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          {/* ── Rutas públicas (sin auth) ─────────────────────────────── */}
          <Route path="/solicitar/:slug"  element={<SolicitudPage />} />
          <Route path="/turno/:token"     element={<TurnoTokenPage />} />

          {/* ── Panel de login ────────────────────────────────────────── */}
          <Route path="/panel/login" element={<Public><LoginPage /></Public>} />

          {/* ── Panel protegido ───────────────────────────────────────── */}
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
