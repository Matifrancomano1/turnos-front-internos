import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { 
  Building2, BarChart3, Settings, LogOut, 
  Bell, ShieldCheck
} from 'lucide-react'
import { queryClient } from '@/lib/queryClient'

const navItems = [
  { label: 'Empresas', path: '/master/empresas', icon: Building2 },
  { label: 'Métricas Globales', path: '/master/dashboard', icon: BarChart3 },
  { label: 'Configuración SaaS', path: '/master/configuracion', icon: Settings },
]

export default function MasterLayout() {
  const { usuario, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    queryClient.clear()
    navigate('/panel/login')
  }

  const initials = usuario?.nombre?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? 'SA'

  return (
    <div className="master-theme">
      <div className="panel-layout" style={{ background: 'var(--bg-panel)', color: 'var(--text)' }}>
        
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          {/* Logo */}
          <div className="sidebar-logo" style={{ padding: '18px 20px', borderBottom: '1px solid var(--gray-m)' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, background: 'var(--blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', flexShrink: 0
            }}>
              <ShieldCheck size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.2 }}>FLOWMASTER</h1>
              <p style={{ color: 'var(--blue)', fontSize: 10.5, fontWeight: 600, marginTop: 1, letterSpacing: '0.05em' }}>SUPER ADMIN</p>
            </div>
          </div>

          {/* User */}
          <div className="sidebar-user" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="sidebar-avatar" style={{ background: 'var(--blue)' }}>{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-username">{usuario?.nombre ?? 'Super Admin'}</div>
              <div className="sidebar-role" style={{ color: 'var(--blue)' }}>Master</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="sidebar-nav">
            <div className="nav-section">
              <div className="nav-section-label">Gestión Global</div>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={16} strokeWidth={1.75} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="sidebar-footer" style={{ borderTop: '1px solid var(--gray-m)' }}>
            <span className="sidebar-version">Master v1.0</span>
            <button onClick={handleLogout} className="sidebar-logout">
              <LogOut size={13} strokeWidth={1.75} />
              Salir
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Header */}
          <header className="panel-header" style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--gray-m)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={20} color="var(--blue)" />
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text)' }}>Panel Maestro</h2>
            </div>
            
            <div style={{ flex: 1 }} />
            
            <button className="header-notif-btn" style={{ background: 'transparent', borderColor: 'var(--gray-m)' }}>
              <Bell size={16} strokeWidth={1.75} color="var(--text-m)" />
              <span className="notif-dot" />
            </button>
          </header>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--bg-panel)' }}>
            <Outlet />
          </div>
          
        </div>
      </div>
    </div>
  )
}
