// src/pages/panel/ConfiguracionPage.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { empresaApi, servicioApi } from '@/api/client'
import { useAuthStore } from '@/store/auth'
import { PageLoader, EmptyState } from '@/components/ui'
import { fmt$ } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { X, Edit2 } from 'lucide-react'

type Tab = 'empresa' | 'servicios'

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<Tab>('empresa')
  const { empresaId } = useAuthStore()

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Configuración</h2>
        <p style={{ color: 'var(--text-m)', fontSize: 13, marginTop: 2 }}>Ajustes de empresa y catálogo de servicios</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--gray-l)', padding: 4, borderRadius: 10, width: 'fit-content', marginBottom: 20 }}>
        {(['empresa', 'servicios'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '7px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? 'var(--text)' : 'var(--text-m)',
              boxShadow: tab === t ? 'var(--shadow)' : 'none',
            }}>
            {t === 'empresa' ? '🏢 Empresa' : '🔧 Servicios'}
          </button>
        ))}
      </div>

      {tab === 'empresa' && <EmpresaTab empresaId={empresaId!} />}
      {tab === 'servicios' && <ServiciosTab empresaId={empresaId!} />}
    </div>
  )
}

// ── Empresa tab ───────────────────────────────────────────────────────────────
function EmpresaTab({ empresaId }: { empresaId: string }) {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['empresa', empresaId],
    queryFn: () => empresaApi.obtener(empresaId),
    enabled: !!empresaId,
  })

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<any>({
    values: data?.config ? {
      horaApertura: data.config.horaApertura,
      horaCierre: data.config.horaCierre,
      duracionSlotMinutos: data.config.duracionSlotMinutos,
      sabadoHabilitado: data.config.sabadoHabilitado,
      domingoHabilitado: data.config.domingoHabilitado,
    } : undefined,
  })

  const guardar = async (d: any) => {
    try {
      await empresaApi.actualizarConfig(empresaId, d)
      toast.success('Configuración guardada')
      qc.invalidateQueries({ queryKey: ['empresa', empresaId] })
    } catch { toast.error('Error al guardar') }
  }

  if (isLoading) return <PageLoader />

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {/* Info */}
      <div className="config-section" style={{ background: '#fff', borderRadius: 'var(--radius-l)', border: '1px solid var(--gray-m)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--gray-m)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Datos de la empresa</h3>
        </div>
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['Nombre', data?.nombre],
            ['Email de contacto', data?.emailContacto],
            ['Dirección', data?.direccion],
            ['Teléfono', data?.telefono],
            ['Slug / URL', data?.slug],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--gray-m)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-m)', fontWeight: 500 }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{value ?? '—'}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: data?.activa ? 'var(--green)' : 'var(--red)', display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: 'var(--text-m)' }}>{data?.activa ? 'Empresa activa' : 'Empresa inactiva'}</span>
          </div>
          {data?.slug && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--ice)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-l)', marginBottom: 2 }}>Link de solicitud pública</div>
              <code style={{ fontSize: 12, color: 'var(--blue)', fontFamily: 'JetBrains Mono, monospace' }}>
                /solicitar/{data.slug}
              </code>
            </div>
          )}
        </div>
      </div>

      {/* Config */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-l)', border: '1px solid var(--gray-m)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--gray-m)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>⏰ Horarios y disponibilidad</h3>
        </div>
        <form onSubmit={handleSubmit(guardar)} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Apertura</label>
              <input {...register('horaApertura')} type="time" className="form-input" />
            </div>
            <div>
              <label className="form-label">Cierre</label>
              <input {...register('horaCierre')} type="time" className="form-input" />
            </div>
          </div>
          <div>
            <label className="form-label">Duración de slot (minutos)</label>
            <select {...register('duracionSlotMinutos', { valueAsNumber: true })} className="form-input">
              {[15,20,30,45,60,90,120].map(m => <option key={m} value={m}>{m} min</option>)}
            </select>
          </div>

          {/* Days toggle */}
          {[
            { name: 'sabadoHabilitado', label: 'Sábado', desc: 'Habilitar turnos los sábados' },
            { name: 'domingoHabilitado', label: 'Domingo', desc: 'Habilitar turnos los domingos' },
          ].map(({ name, label, desc }) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-m)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-m)' }}>{desc}</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: 38, height: 20, cursor: 'pointer' }}>
                <input {...register(name)} type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', inset: 0, background: 'var(--gray-m)', borderRadius: 10, transition: '.2s' }} />
              </label>
            </div>
          ))}

          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ marginTop: 4 }}>
            {isSubmitting ? 'Guardando…' : 'Guardar configuración'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Servicios tab ─────────────────────────────────────────────────────────────
function ServiciosTab({ empresaId }: { empresaId: string }) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['servicios-config', empresaId],
    queryFn: () => servicioApi.listar(empresaId),
    enabled: !!empresaId,
  })

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<any>()

  const guardarMut = useMutation({
    mutationFn: (d: any) => editId
      ? servicioApi.actualizar(empresaId, editId, d)
      : servicioApi.crear(empresaId, d),
    onSuccess: () => {
      toast.success(editId ? 'Servicio actualizado' : 'Servicio creado')
      qc.invalidateQueries({ queryKey: ['servicios-config', empresaId] })
      setShowForm(false); setEditId(null); reset()
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Error'),
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      servicioApi.alternarEstado(empresaId, id, activo),
    onSuccess: () => {
      toast.success('Estado actualizado')
      qc.invalidateQueries({ queryKey: ['servicios-config', empresaId] })
    },
  })

  const startEdit = (s: any) => {
    setEditId(s.id)
    setValue('nombre', s.nombre)
    setValue('descripcion', s.descripcion ?? '')
    setValue('precioBase', s.precioBase)
    setValue('duracionEstimadaMinutos', s.duracionEstimadaMinutos)
    setShowForm(true)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); reset() }}>+ Nuevo servicio</button>
      </div>

      {showForm && (
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-l)', padding: 20, marginBottom: 14 }}
          className="animate-fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>{editId ? 'Editar servicio' : 'Nuevo servicio'}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); reset() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-m)' }}><X size={16} /></button>
          </div>
          <form onSubmit={handleSubmit(d => guardarMut.mutate(d))} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Nombre *</label>
              <input {...register('nombre', { required: true })} className="form-input" placeholder="Reparación de PC" />
              {errors.nombre && <p className="form-error">Requerido</p>}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Descripción</label>
              <input {...register('descripcion')} className="form-input" placeholder="Descripción visible para el cliente" />
            </div>
            <div>
              <label className="form-label">Precio base (ARS) *</label>
              <input {...register('precioBase', { required: true, valueAsNumber: true })} type="number" min={0} className="form-input" />
              {errors.precioBase && <p className="form-error">Requerido</p>}
            </div>
            <div>
              <label className="form-label">Duración estimada (min) *</label>
              <input {...register('duracionEstimadaMinutos', { required: true, valueAsNumber: true })} type="number" min={5} className="form-input" />
              {errors.duracionEstimadaMinutos && <p className="form-error">Requerido</p>}
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditId(null); reset() }}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || guardarMut.isPending}>
                {isSubmitting || guardarMut.isPending ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrap">
        {isLoading ? <PageLoader /> : (data?.content ?? []).length === 0 ? (
          <EmptyState title="Sin servicios" desc="Creá el primer servicio de tu empresa" icon="🔧" />
        ) : (
          <table className="data-table">
            <thead><tr><th>Servicio</th><th>Precio base</th><th>Duración</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {(data?.content ?? []).map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.nombre}</div>
                    {s.descripcion && <div style={{ fontSize: 11, color: 'var(--text-l)' }}>{s.descripcion}</div>}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--blue)' }}>{fmt$(s.precioBase)}</td>
                  <td style={{ color: 'var(--text-m)' }}>{s.duracionEstimadaMinutos} min</td>
                  <td>
                    <button onClick={() => toggleMut.mutate({ id: s.id, activo: !s.activo })}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                        background: s.activo ? 'var(--green-l)' : 'var(--gray-l)',
                        color: s.activo ? '#065F46' : 'var(--text-m)',
                      }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.activo ? 'var(--green)' : 'var(--text-l)', display: 'inline-block' }} />
                      {s.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(s)}><Edit2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
