import { useState } from 'react'
import { Settings, Save, Globe, Shield, Mail, Server, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ConfiguracionSaaSPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'limits' | 'smtp'>('general')
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    platformName: 'FlowMaster SaaS',
    baseDomain: 'flowtech.com',
    supportEmail: 'soporte@flowtech.com',
    
    defaultMaxUsers: '5',
    defaultMaxTurnosMensuales: '500',
    allowTrial: true,
    trialDays: '14',

    smtpHost: 'smtp.sendgrid.net',
    smtpPort: '587',
    smtpUser: 'apikey',
    smtpPass: '••••••••••••••••',
    smtpFrom: 'no-reply@flowtech.com'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData(prev => ({ ...prev, [e.target.name]: value }))
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Configuraciones guardadas correctamente', {
        description: 'Los cambios aplicarán para todos los inquilinos.'
      })
    }, 1000)
  }

  const tabs = [
    { id: 'general', label: 'Ajustes Generales', icon: Globe },
    { id: 'limits', label: 'Límites del Sistema', icon: Shield },
    { id: 'smtp', label: 'Servidor de Correo', icon: Mail },
  ] as const

  return (
    <div className="animate-fade-up">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Configuración SaaS</h1>
          <p style={{ color: 'var(--text-m)', fontSize: 14, marginTop: 2 }}>
            Parámetros globales de la plataforma que afectan a todos los tenants.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px' }}
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Guardar Cambios
        </button>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        
        {/* ── Tabs Sidebar ─────────────────────────────────────────────────── */}
        <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                  borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 600,
                  background: isActive ? 'var(--blue)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-m)',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.2s, color 0.2s',
                  fontFamily: 'inherit'
                }}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div className="card" style={{ flex: 1 }}>
          
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="animate-fade-in">
              <div className="card-title" style={{ borderBottom: '1px solid var(--gray-m)', paddingBottom: 16, marginBottom: 20 }}>
                <Globe size={18} color="var(--blue)" />
                Ajustes Generales
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label className="form-label">Nombre de la Plataforma</label>
                  <input name="platformName" value={formData.platformName} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Dominio Base</label>
                  <input name="baseDomain" value={formData.baseDomain} onChange={handleChange} className="form-input" />
                  <div className="form-hint">Usado para generar URLs (ej: tenant.flowtech.com)</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Email de Soporte</label>
                  <input type="email" name="supportEmail" value={formData.supportEmail} onChange={handleChange} className="form-input" />
                </div>
              </div>
            </div>
          )}

          {/* Limits Settings */}
          {activeTab === 'limits' && (
            <div className="animate-fade-in">
              <div className="card-title" style={{ borderBottom: '1px solid var(--gray-m)', paddingBottom: 16, marginBottom: 20 }}>
                <Shield size={18} color="var(--green)" />
                Límites del Sistema
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label className="form-label">Máximo de Usuarios (por Tenant)</label>
                  <input type="number" name="defaultMaxUsers" value={formData.defaultMaxUsers} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Máximo Turnos (por mes)</label>
                  <input type="number" name="defaultMaxTurnosMensuales" value={formData.defaultMaxTurnosMensuales} onChange={handleChange} className="form-input" />
                </div>
                
                <div style={{ gridColumn: '1 / -1', paddingTop: 16, borderTop: '1px solid var(--gray-m)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" name="allowTrial" checked={formData.allowTrial} onChange={handleChange} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Habilitar Período de Prueba (Trial)</span>
                </div>

                {formData.allowTrial && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Días de Prueba Gratuitos</label>
                    <input type="number" name="trialDays" value={formData.trialDays} onChange={handleChange} className="form-input" style={{ width: '50%' }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SMTP Settings */}
          {activeTab === 'smtp' && (
            <div className="animate-fade-in">
              <div className="card-title" style={{ borderBottom: '1px solid var(--gray-m)', paddingBottom: 16, marginBottom: 20 }}>
                <Server size={18} color="var(--purple)" />
                Servidor de Correo Global
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Email Remitente (From)</label>
                  <input name="smtpFrom" value={formData.smtpFrom} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Servidor SMTP</label>
                  <input name="smtpHost" value={formData.smtpHost} onChange={handleChange} className="form-input" placeholder="smtp.sendgrid.net" />
                </div>
                <div>
                  <label className="form-label">Puerto</label>
                  <input name="smtpPort" value={formData.smtpPort} onChange={handleChange} className="form-input" placeholder="587" />
                </div>
                <div>
                  <label className="form-label">Usuario SMTP</label>
                  <input name="smtpUser" value={formData.smtpUser} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Contraseña SMTP</label>
                  <input type="password" name="smtpPass" value={formData.smtpPass} onChange={handleChange} className="form-input" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
