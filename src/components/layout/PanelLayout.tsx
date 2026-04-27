// src/components/layout/PanelLayout.tsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/api/client'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/panel/dashboard',      icon: '📊', label: 'Dashboard' },
  { to: '/panel/turnos',         icon: '📋', label: 'Turnos',        badge: '' },
  { to: '/panel/agenda',         icon: '📅', label: 'Agenda' },
  { to: '/panel/cotizaciones',   icon: '💰', label: 'Cotizaciones',  badge: '' },
  { to: '/panel/reportes',       icon: '📈', label: 'Reportes' },
  { to: '/panel/configuracion',  icon: '⚙️', label: 'Configuración' },
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

  return (
    <div className="panel-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
          <span style={{ background: 'var(--blue)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '.05em' }}>SaaS</span>
          <h1 style={{ color: '#fff', fontSize: 17, fontWeight: 700, marginTop: 8, lineHeight: 1.2 }}>TurnoApp</h1>
          <p style={{ color: '#93C5FD', fontSize: 11, marginTop: 2 }}>Gestión de Servicios Técnicos</p>
        </div>

        {/* User */}
        <div style={{ margin: '12px 14px', background: 'rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{usuario?.nombre ?? 'Usuario'}</div>
            <div style={{ color: '#93C5FD', fontSize: 10 }}>{usuario?.rol}</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 10px' }}>
          <div style={{ marginBottom: 4 }}>
            <div style={{ color: '#64748B', fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 4 }}>Principal</div>
            {navItems.slice(0, 3).map(({ to, icon, label, badge }) => (
              <NavLink key={to} to={to} className={({ isActive }) => cn('nav-item', isActive && 'active')}>
                <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{icon}</span>
                {label}
                {badge !== undefined && <span style={{ marginLeft: 'auto', background: 'var(--red)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>●</span>}
              </NavLink>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ color: '#64748B', fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 4 }}>Gestión</div>
            {navItems.slice(3).map(({ to, icon, label, badge }) => (
              <NavLink key={to} to={to} className={({ isActive }) => cn('nav-item', isActive && 'active')}>
                <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{icon}</span>
                {label}
                {badge !== undefined && <span style={{ marginLeft: 'auto', background: 'var(--amber)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>●</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748B', fontSize: 11 }}>v2.0.0</span>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
            Salir →
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ height: 'var(--header-h)', background: '#fff', borderBottom: '1px solid var(--gray-m)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0 }}>
          <div style={{ flex: 1 }} />
          <a href={`/solicitar/${usuario?.empresaId ?? 'demo'}`} target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-m)', fontSize: 12, color: 'var(--text-m)', textDecoration: 'none', fontWeight: 500 }}>
            🔗 Link de solicitud
          </a>
          <button style={{ position: 'relative', width: 34, height: 34, borderRadius: '50%', background: 'var(--gray-l)', border: 'none', cursor: 'pointer', fontSize: 16 }}>
            🔔
            <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, background: 'var(--red)', borderRadius: '50%', border: '2px solid #fff' }} />
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
