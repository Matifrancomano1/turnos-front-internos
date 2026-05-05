// src/components/layout/PanelLayout.tsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/api/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CalendarDays,
  CalendarClock,
  FileText,
  BarChart2,
  Users,
  Settings,
  LogOut,
  Link2,
  Bell,
  type LucideIcon,
} from 'lucide-react'

type NavItem = {
  to: string
  icon: LucideIcon
  label: string
  badge?: boolean
  roles: string[]
}

const navItems: NavItem[] = [
  { to: '/panel/dashboard',     icon: LayoutDashboard, label: 'Dashboard',     roles: ['ADMIN', 'OPERADOR'] },
  { to: '/panel/turnos',        icon: CalendarDays,    label: 'Turnos',        badge: false, roles: ['ADMIN', 'OPERADOR'] },
  { to: '/panel/agenda',        icon: CalendarClock,   label: 'Agenda',        roles: ['ADMIN', 'OPERADOR'] },
  { to: '/panel/cotizaciones',  icon: FileText,        label: 'Cotizaciones',  badge: false, roles: ['ADMIN', 'OPERADOR'] },
  { to: '/panel/reportes',      icon: BarChart2,       label: 'Reportes',      roles: ['ADMIN'] },
  { to: '/panel/usuarios',      icon: Users,           label: 'Usuarios',      roles: ['ADMIN'] },
  { to: '/panel/configuracion', icon: Settings,        label: 'Configuración', roles: ['ADMIN'] },
]

export default function PanelLayout() {
  const { usuario, logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (refreshToken) try { await authApi.logout(refreshToken) } catch { /* ignore */ }
    logout()
    navigate('/panel/login')
  }

  const initials = usuario?.nombre?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? 'OP'

  const mainItems = navItems.slice(0, 4).filter(i => !i.roles || i.roles.includes(usuario?.rol as string))
  const adminItems = navItems.slice(4).filter(i => !i.roles || i.roles.includes(usuario?.rol as string))

  return (
    <div className="panel-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">T</div>
          <div>
            <h1 className="sidebar-brand">TurnoApp</h1>
            <p className="sidebar-tagline">Gestión de Servicios</p>
          </div>
        </div>

        {/* User */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-username">{usuario?.nombre ?? 'Usuario'}</div>
            <div className="sidebar-role">{usuario?.rol}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-label">Principal</div>
            {mainItems.map(({ to, icon: Icon, label, badge }) => (
              <NavLink key={to} to={to} className={({ isActive }) => cn('nav-item', isActive && 'active')}>
                <Icon size={16} strokeWidth={1.75} />
                <span>{label}</span>
                {badge && <span className="nav-badge" />}
              </NavLink>
            ))}
          </div>

          {usuario?.rol === 'ADMIN' && adminItems.length > 0 && (
            <div className="nav-section">
              <div className="nav-section-label">Gestión</div>
              {adminItems.map(({ to, icon: Icon, label, badge }) => (
                <NavLink key={to} to={to} className={({ isActive }) => cn('nav-item', isActive && 'active')}>
                  <Icon size={16} strokeWidth={1.75} />
                  <span>{label}</span>
                  {badge && <span className="nav-badge" />}
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <span className="sidebar-version">v2.0.0</span>
          <button onClick={handleLogout} className="sidebar-logout">
            <LogOut size={13} strokeWidth={1.75} />
            Salir
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header className="panel-header">
          <div style={{ flex: 1 }} />
          <a
            href={`/solicitar/${usuario?.empresaId ?? 'demo'}`}
            target="_blank"
            rel="noreferrer"
            className="header-link-btn"
          >
            <Link2 size={13} strokeWidth={1.75} />
            Link de solicitud
          </a>
          <button className="header-notif-btn">
            <Bell size={16} strokeWidth={1.75} />
            <span className="notif-dot" />
          </button>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
