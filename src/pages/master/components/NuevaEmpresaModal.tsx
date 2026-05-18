import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useCrearEmpresa } from '@/hooks/useSuperAdmin'

interface Props {
  onClose: () => void
}

export function NuevaEmpresaModal({ onClose }: Props) {
  const [formData, setFormData] = useState({
    nombre: '',
    emailContacto: '',
    direccion: '',
    telefono: '',
    slug: '',
    adminNombre: '',
    adminEmail: '',
    adminPassword: '',
    adminTelefono: '',
  })

  const { mutate: crearEmpresa, isPending } = useCrearEmpresa()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    crearEmpresa(formData, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal animate-scale-in" style={{ position: 'relative', maxWidth: 700 }}>
        
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-m)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Nueva Empresa</h2>
            <p style={{ fontSize: 13, color: 'var(--text-m)', margin: 0, marginTop: 4 }}>Registra un nuevo inquilino y su administrador inicial.</p>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: 6 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            {/* Columna Izquierda: Empresa */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--blue)', marginBottom: 4 }}>Datos de la Empresa</h3>
              
              <div>
                <label className="form-label">Nombre</label>
                <input required name="nombre" value={formData.nombre} onChange={handleChange} className="form-input" placeholder="Ej. Taller Los Amigos" />
              </div>

              <div>
                <label className="form-label">URL Pública (Slug)</label>
                <input required name="slug" value={formData.slug} onChange={handleChange} className="form-input" pattern="^[a-z0-9-]+$" placeholder="ej-taller" />
                <div className="form-hint">Letras minúsculas y guiones.</div>
              </div>

              <div>
                <label className="form-label">Email de Contacto</label>
                <input required type="email" name="emailContacto" value={formData.emailContacto} onChange={handleChange} className="form-input" placeholder="contacto@empresa.com" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Teléfono</label>
                  <input name="telefono" value={formData.telefono} onChange={handleChange} className="form-input" placeholder="12345678" />
                </div>
                <div>
                  <label className="form-label">Dirección</label>
                  <input name="direccion" value={formData.direccion} onChange={handleChange} className="form-input" placeholder="Calle 123" />
                </div>
              </div>
            </div>

            {/* Columna Derecha: Administrador */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--green)', marginBottom: 4 }}>Usuario Administrador</h3>
              
              <div>
                <label className="form-label">Nombre Completo</label>
                <input required name="adminNombre" value={formData.adminNombre} onChange={handleChange} className="form-input" placeholder="Juan Pérez" />
              </div>

              <div>
                <label className="form-label">Email de Acceso</label>
                <input required type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} className="form-input" placeholder="juan@empresa.com" />
              </div>

              <div>
                <label className="form-label">Contraseña Temporal</label>
                <input required type="password" name="adminPassword" value={formData.adminPassword} onChange={handleChange} className="form-input" placeholder="••••••••" />
              </div>

              <div>
                <label className="form-label">Teléfono Personal</label>
                <input name="adminTelefono" value={formData.adminTelefono} onChange={handleChange} className="form-input" placeholder="12345678" />
              </div>
            </div>

          </div>

          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--gray-m)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending && <Loader2 size={16} className="animate-spin" />}
              Crear Empresa
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
