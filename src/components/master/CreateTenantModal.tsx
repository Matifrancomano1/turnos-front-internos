// src/components/master/CreateTenantModal.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X, Building2, User, Globe, Mail, Phone, MapPin, Lock, Loader2 } from 'lucide-react'
import { superAdminApi } from '@/api/superAdminClient'
import type { CreateTenantAdminRequest } from '@/types'

// ── Schema de validación ────────────────────────────────────────────────────
const schema = z.object({
  nombre:        z.string().min(3, 'Mínimo 3 caracteres'),
  slug:          z.string().min(3, 'Mínimo 3 caracteres').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  emailContacto: z.string().email('Email inválido'),
  direccion:     z.string().min(3, 'Requerido'),
  telefono:      z.string().min(6, 'Teléfono inválido'),
  adminNombre:   z.string().min(2, 'Mínimo 2 caracteres'),
  adminEmail:    z.string().email('Email inválido'),
  adminPassword: z.string().min(6, 'Mínimo 6 caracteres'),
  adminTelefono: z.string().min(6, 'Teléfono inválido'),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

// ── Helper: autogenerar slug a partir del nombre ────────────────────────────
const toSlug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// ── Campo de formulario reutilizable ────────────────────────────────────────
function Field({
  label, icon: Icon, error, children,
}: { label: string; icon: React.ElementType; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-m)', display: 'flex', alignItems: 'center', gap: 5 }}>
        <Icon size={12} /> {label}
      </label>
      {children}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

export default function CreateTenantModal({ open, onClose, onSuccess }: Props) {
  const {
    register, handleSubmit, watch, setValue, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  // Auto-generar slug al escribir el nombre
  const nombreWatch = watch('nombre')
  useEffect(() => {
    if (nombreWatch) setValue('slug', toSlug(nombreWatch), { shouldValidate: false })
  }, [nombreWatch, setValue])

  const onSubmit = async (data: FormData) => {
    try {
      await superAdminApi.crearEmpresa(data as CreateTenantAdminRequest)
      toast.success('¡Empresa creada exitosamente!', { description: `${data.nombre} ya está disponible en la plataforma.` })
      reset()
      onSuccess()
      onClose()
    } catch (e: any) {
      toast.error('Error al crear empresa', { description: e?.message ?? 'Revisá los datos e intentá de nuevo.' })
    }
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div
        className="modal animate-scale-in"
        style={{ maxWidth: 680, width: '100%', maxHeight: '92vh', overflowY: 'auto', position: 'relative' }}
      >
        {/* Header del modal */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: '1px solid var(--gray-m)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1,
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={20} color="var(--blue)" />
              Registrar Nueva Empresa
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-l)', marginTop: 2 }}>
              Se creará la empresa y su primer usuario administrador en una sola operación.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            style={{ padding: 6 }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px 28px' }}>
          {/* ── Sección 1: Datos de la Empresa ─────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 11, fontWeight: 700, color: 'var(--blue)',
              textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16,
            }}>
              <Building2 size={13} />
              Datos de la Empresa
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Nombre de la Empresa" icon={Building2} error={errors.nombre?.message}>
                <input
                  {...register('nombre')}
                  className={`form-input ${errors.nombre ? 'error' : ''}`}
                  placeholder="Mi Negocio S.A."
                />
              </Field>

              <Field label="Slug (URL pública)" icon={Globe} error={errors.slug?.message}>
                <input
                  {...register('slug')}
                  className={`form-input ${errors.slug ? 'error' : ''}`}
                  placeholder="mi-negocio"
                />
                <p className="form-hint" style={{ fontSize: 11 }}>flowtech.com/solicitar/<strong>{watch('slug') || '...'}</strong></p>
              </Field>

              <Field label="Email de Contacto" icon={Mail} error={errors.emailContacto?.message}>
                <input
                  {...register('emailContacto')}
                  type="email"
                  className={`form-input ${errors.emailContacto ? 'error' : ''}`}
                  placeholder="contacto@empresa.com"
                />
              </Field>

              <Field label="Teléfono" icon={Phone} error={errors.telefono?.message}>
                <input
                  {...register('telefono')}
                  className={`form-input ${errors.telefono ? 'error' : ''}`}
                  placeholder="+54 11 1234-5678"
                />
              </Field>

              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Dirección" icon={MapPin} error={errors.direccion?.message}>
                  <input
                    {...register('direccion')}
                    className={`form-input ${errors.direccion ? 'error' : ''}`}
                    placeholder="Av. Corrientes 1234, CABA"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* ── Sección 2: Datos del Admin ──────────────────────────────── */}
          <div style={{ padding: '20px 0 0', borderTop: '1px solid var(--gray-m)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 11, fontWeight: 700, color: 'var(--purple, #a78bfa)',
              textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16,
            }}>
              <User size={13} />
              Primer Usuario Administrador
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Nombre Completo" icon={User} error={errors.adminNombre?.message}>
                <input
                  {...register('adminNombre')}
                  className={`form-input ${errors.adminNombre ? 'error' : ''}`}
                  placeholder="Juan Pérez"
                />
              </Field>

              <Field label="Teléfono" icon={Phone} error={errors.adminTelefono?.message}>
                <input
                  {...register('adminTelefono')}
                  className={`form-input ${errors.adminTelefono ? 'error' : ''}`}
                  placeholder="+54 11 9876-5432"
                />
              </Field>

              <Field label="Email de Admin" icon={Mail} error={errors.adminEmail?.message}>
                <input
                  {...register('adminEmail')}
                  type="email"
                  className={`form-input ${errors.adminEmail ? 'error' : ''}`}
                  placeholder="admin@empresa.com"
                />
              </Field>

              <Field label="Contraseña" icon={Lock} error={errors.adminPassword?.message}>
                <input
                  {...register('adminPassword')}
                  type="password"
                  className={`form-input ${errors.adminPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                />
              </Field>
            </div>
          </div>

          {/* ── Acciones ──────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 12, marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--gray-m)' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, justifyContent: 'center' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Creando...</>
              ) : (
                <><Building2 size={16} /> Crear Empresa</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
