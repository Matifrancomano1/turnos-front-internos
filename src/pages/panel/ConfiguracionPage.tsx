// src/pages/panel/ConfiguracionPage.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { X, Edit2, Lock, Save } from 'lucide-react'

import { empresaApi, servicioApi } from '@/api/client'
import { useAuthStore } from '@/store/auth'
import { useEmpresa, useUpdateConfigEmpresa, useUpdateEmpresa } from '@/hooks/useEmpresa'
import { empresaConfigSchema, type EmpresaConfigFormData, empresaDataSchema, type EmpresaDataFormData } from '@/schemas/empresa.schema'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { PageLoader, EmptyState, Spinner } from '@/components/ui'
import { fmt$ } from '@/lib/utils'
import type { Servicio, Empresa } from '@/types'
import { Trash2 } from 'lucide-react'

// ──────────────────────────────────────────────────────────────────────────────
// Tipos locales
// ──────────────────────────────────────────────────────────────────────────────
type Tab = 'empresa' | 'servicios'

interface ServicioFormData {
  nombre: string
  descripcion?: string
  precioBase: number
  duracionEstimadaMinutos: number
}

// ──────────────────────────────────────────────────────────────────────────────
// Página raíz
// ──────────────────────────────────────────────────────────────────────────────
export default function ConfiguracionPage() {
  const [tab, setTab] = useState<Tab>('empresa')
  const { empresaId } = useAuthStore()

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Configuración</h2>
        <p style={{ color: 'var(--text-m)', fontSize: 13, marginTop: 2 }}>
          Ajustes de empresa y catálogo de servicios
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex', gap: 4, background: 'var(--gray-l)',
          padding: 4, borderRadius: 10, width: 'fit-content', marginBottom: 20,
        }}
      >
        {(['empresa', 'servicios'] as Tab[]).map((t) => (
          <button
            key={t}
            id={`tab-${t}`}
            onClick={() => setTab(t)}
            style={{
              padding: '7px 20px', borderRadius: 8, border: 'none',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? 'var(--text)' : 'var(--text-m)',
              boxShadow: tab === t ? 'var(--shadow)' : 'none',
            }}
          >
            {t === 'empresa' ? '🏢 Empresa' : '🔧 Servicios'}
          </button>
        ))}
      </div>

      {tab === 'empresa'   && <EmpresaTab   empresaId={empresaId!} />}
      {tab === 'servicios' && <ServiciosTab empresaId={empresaId!} />}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Tab: Empresa
// ──────────────────────────────────────────────────────────────────────────────
function EmpresaTab({ empresaId }: { empresaId: string }) {
  const { data, isLoading } = useEmpresa(empresaId)
  const updateConfig = useUpdateConfigEmpresa(empresaId)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmpresaConfigFormData>({
    resolver: zodResolver(empresaConfigSchema),
    values: data?.config
      ? {
          horaApertura:         data.config.horaApertura,
          horaCierre:           data.config.horaCierre,
          duracionSlotMinutos:  data.config.duracionSlotMinutos,
          sabadoHabilitado:     data.config.sabadoHabilitado,
          domingoHabilitado:    data.config.domingoHabilitado,
        }
      : undefined,
  })

  if (isLoading) return <PageLoader />

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

      {/* ── Panel: Datos de empresa (editable solo para ADMIN) ─────────────────────────── */}
      <div
        style={{
          background: '#fff', borderRadius: 'var(--radius-l)',
          border: '1px solid var(--gray-m)',
        }}
      >
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--gray-m)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Datos de la empresa</h3>
          <RoleGuard roles={['OPERADOR']}>
            <span
              title="Solo lectura para tu rol"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11, color: 'var(--text-l)', background: 'var(--gray-l)',
                padding: '2px 8px', borderRadius: 20,
              }}
            >
              <Lock size={10} /> Solo lectura
            </span>
          </RoleGuard>
        </div>
        
        <RoleGuard
          roles={['ADMIN']}
          fallback={<EmpresaDataReadonly data={data} />}
        >
          {data && <EmpresaDataForm data={data} />}
        </RoleGuard>
      </div>

      {/* ── Panel: Horarios (editable solo para ADMIN) ─────────────────────── */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-l)', border: '1px solid var(--gray-m)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--gray-m)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>⏰ Horarios y disponibilidad</h3>
          <RoleGuard roles={['OPERADOR']}>
            <span
              title="Solo lectura para tu rol"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11, color: 'var(--text-l)', background: 'var(--gray-l)',
                padding: '2px 8px', borderRadius: 20,
              }}
            >
              <Lock size={10} /> Solo lectura
            </span>
          </RoleGuard>
        </div>

        {/* Formulario: visible para ADMIN / solo lectura para OPERADOR */}
        <RoleGuard
          roles={['ADMIN']}
          fallback={<HorariosReadonly config={data?.config} />}
        >
          <form
            id="form-config-empresa"
            onSubmit={handleSubmit((d) => updateConfig.mutate(d))}
            style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            {/* Horas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Apertura</label>
                <input
                  id="input-hora-apertura"
                  {...register('horaApertura')}
                  type="time"
                  className="form-input"
                />
                {errors.horaApertura && (
                  <p className="form-error">{errors.horaApertura.message}</p>
                )}
              </div>
              <div>
                <label className="form-label">Cierre</label>
                <input
                  id="input-hora-cierre"
                  {...register('horaCierre')}
                  type="time"
                  className="form-input"
                />
                {errors.horaCierre && (
                  <p className="form-error">{errors.horaCierre.message}</p>
                )}
              </div>
            </div>

            {/* Duración slot */}
            <div>
              <label className="form-label">Duración de slot (minutos)</label>
              <select
                id="select-duracion-slot"
                {...register('duracionSlotMinutos', { valueAsNumber: true })}
                className="form-input"
              >
                {[15, 30, 45, 60].map((m) => (
                  <option key={m} value={m}>{m} min</option>
                ))}
              </select>
              {errors.duracionSlotMinutos && (
                <p className="form-error">{errors.duracionSlotMinutos.message}</p>
              )}
            </div>

            {/* Días */}
            {(
              [
                { name: 'sabadoHabilitado',  label: 'Sábado',  desc: 'Habilitar turnos los sábados'  },
                { name: 'domingoHabilitado', label: 'Domingo', desc: 'Habilitar turnos los domingos' },
              ] as { name: keyof EmpresaConfigFormData; label: string; desc: string }[]
            ).map(({ name, label, desc }) => (
              <div
                key={name}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid var(--gray-m)',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-m)' }}>{desc}</div>
                </div>
                <label
                  style={{
                    position: 'relative', display: 'inline-block',
                    width: 38, height: 20, cursor: 'pointer',
                  }}
                >
                  <input
                    id={`toggle-${name}`}
                    {...register(name)}
                    type="checkbox"
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'var(--gray-m)', borderRadius: 10, transition: '.2s',
                    }}
                  />
                </label>
              </div>
            ))}

            {/* Botón submit */}
            <button
              id="btn-guardar-config"
              type="submit"
              disabled={updateConfig.isPending}
              className="btn btn-primary"
              style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {updateConfig.isPending ? (
                <>
                  <Spinner className="w-4 h-4" /> Guardando…
                </>
              ) : (
                <>
                  <Save size={14} /> Guardar configuración
                </>
              )}
            </button>
          </form>
        </RoleGuard>
      </div>
    </div>
  )
}

// ── Componente interno: Formulario de Datos Base ──────────────────────────────
function EmpresaDataForm({ data }: { data: Empresa }) {
  const updateEmpresa = useUpdateEmpresa(data.id)
  
  const { register, handleSubmit, formState: { errors } } = useForm<EmpresaDataFormData>({
    resolver: zodResolver(empresaDataSchema),
    values: {
      nombre: data.nombre,
      emailContacto: data.emailContacto,
      direccion: data.direccion,
      telefono: data.telefono,
      slug: data.slug,
      activa: data.activa,
    }
  })

  return (
    <form
      id="form-data-empresa"
      onSubmit={handleSubmit((d) => updateEmpresa.mutate(d))}
      style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <div>
        <label className="form-label">Nombre *</label>
        <input {...register('nombre')} className="form-input" />
        {errors.nombre && <p className="form-error">{errors.nombre.message}</p>}
      </div>

      <div>
        <label className="form-label">Email de contacto *</label>
        <input {...register('emailContacto')} type="email" className="form-input" />
        {errors.emailContacto && <p className="form-error">{errors.emailContacto.message}</p>}
      </div>

      <div>
        <label className="form-label">Dirección *</label>
        <input {...register('direccion')} className="form-input" />
        {errors.direccion && <p className="form-error">{errors.direccion.message}</p>}
      </div>

      <div>
        <label className="form-label">Teléfono *</label>
        <input {...register('telefono')} className="form-input" />
        {errors.telefono && <p className="form-error">{errors.telefono.message}</p>}
      </div>

      <div>
        <label className="form-label">URL Pública (Slug) *</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ padding: '8px 12px', background: 'var(--gray-l)', border: '1px solid var(--gray-m)', borderRight: 'none', borderRadius: 'var(--radius) 0 0 var(--radius)', fontSize: 13, color: 'var(--text-m)' }}>
            /solicitar/
          </span>
          <input {...register('slug')} className="form-input" style={{ borderRadius: '0 var(--radius) var(--radius) 0' }} placeholder="mi-negocio-123" />
        </div>
        {errors.slug && <p className="form-error">{errors.slug.message}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-m)', marginTop: 4 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Estado de la cuenta</div>
          <div style={{ fontSize: 11, color: 'var(--text-m)' }}>Permitir operaciones en la empresa</div>
        </div>
        <label style={{ position: 'relative', display: 'inline-block', width: 38, height: 20, cursor: 'pointer' }}>
          <input {...register('activa')} type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
          <span style={{ position: 'absolute', inset: 0, background: 'var(--gray-m)', borderRadius: 10, transition: '.2s' }} />
        </label>
      </div>

      <button
        type="submit"
        disabled={updateEmpresa.isPending}
        className="btn btn-primary"
        style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        {updateEmpresa.isPending ? <><Spinner className="w-4 h-4" /> Guardando…</> : <><Save size={14} /> Guardar datos</>}
      </button>
    </form>
  )
}

// ── Componente interno: Datos Base Solo Lectura ───────────────────────────────
function EmpresaDataReadonly({ data }: { data?: Empresa }) {
  if (!data) return null
  return (
    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {(
        [
          ['Nombre',            data.nombre],
          ['Email de contacto', data.emailContacto],
          ['Dirección',         data.direccion],
          ['Teléfono',          data.telefono],
          ['Slug / URL',        data.slug],
        ] as [string, string | undefined][]
      ).map(([label, value]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--gray-m)', fontSize: 13 }}>
          <span style={{ color: 'var(--text-m)', fontWeight: 500 }}>{label}</span>
          <span style={{ fontWeight: 600 }}>{value ?? '—'}</span>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: data.activa ? 'var(--green)' : 'var(--red)', display: 'inline-block' }} />
        <span style={{ fontSize: 12, color: 'var(--text-m)' }}>{data.activa ? 'Empresa activa' : 'Empresa inactiva'}</span>
      </div>
    </div>
  )
}

// ── Solo lectura (fallback para OPERADOR) ─────────────────────────────────────
function HorariosReadonly({ config }: { config?: { horaApertura: string; horaCierre: string; duracionSlotMinutos: number; sabadoHabilitado: boolean; domingoHabilitado: boolean } }) {
  if (!config) return null
  return (
    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[
        ['Apertura',           config.horaApertura],
        ['Cierre',             config.horaCierre],
        ['Duración slot',      `${config.duracionSlotMinutos} min`],
        ['Sábado habilitado',  config.sabadoHabilitado  ? '✅ Sí' : '❌ No'],
        ['Domingo habilitado', config.domingoHabilitado ? '✅ Sí' : '❌ No'],
      ].map(([label, value]) => (
        <div
          key={label}
          style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '6px 0', borderBottom: '1px solid var(--gray-m)', fontSize: 13,
          }}
        >
          <span style={{ color: 'var(--text-m)', fontWeight: 500 }}>{label}</span>
          <span style={{ fontWeight: 600 }}>{value}</span>
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Tab: Servicios
// ──────────────────────────────────────────────────────────────────────────────
function ServiciosTab({ empresaId }: { empresaId: string }) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['servicios-config', empresaId],
    queryFn: () => servicioApi.listar(empresaId),
    enabled: !!empresaId,
  })

  const {
    register, handleSubmit, reset, setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServicioFormData>()

  const guardarMut = useMutation({
    mutationFn: (d: ServicioFormData) =>
      editId
        ? servicioApi.actualizar(empresaId, editId, d)
        : servicioApi.crear(empresaId, d),
    onSuccess: () => {
      toast.success(editId ? 'Servicio actualizado' : 'Servicio creado')
      qc.invalidateQueries({ queryKey: ['servicios-config', empresaId] })
      closeForm()
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? 'Error al guardar el servicio'),
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      servicioApi.alternarEstado(empresaId, id, activo),
    onSuccess: () => {
      toast.success('Estado actualizado')
      qc.invalidateQueries({ queryKey: ['servicios-config', empresaId] })
    },
    onError: () => toast.error('Error al cambiar el estado'),
  })

  const eliminarMut = useMutation({
    mutationFn: (id: string) => servicioApi.eliminar(empresaId, id),
    onSuccess: () => {
      toast.success('Servicio eliminado')
      qc.invalidateQueries({ queryKey: ['servicios-config', empresaId] })
    },
    onError: (e: any) => toast.error(e?.message ?? 'Error al eliminar el servicio'),
  })

  const closeForm = () => { setShowForm(false); setEditId(null); reset() }

  const startEdit = (s: Servicio) => {
    setEditId(s.id)
    setValue('nombre',                  s.nombre)
    setValue('descripcion',             s.descripcion ?? '')
    setValue('precioBase',              s.precioBase)
    setValue('duracionEstimadaMinutos', s.duracionEstimadaMinutos)
    setShowForm(true)
  }

  return (
    <div>
      {/* Botón "Nuevo servicio" — solo ADMIN */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <RoleGuard roles={['ADMIN']}>
          <button
            id="btn-nuevo-servicio"
            className="btn btn-primary"
            onClick={() => { reset(); setEditId(null); setShowForm(true) }}
          >
            + Nuevo servicio
          </button>
        </RoleGuard>
      </div>

      {/* Formulario inline (solo ADMIN) */}
      <RoleGuard roles={['ADMIN']}>
        {showForm && (
          <div
            style={{
              background: '#EFF6FF', border: '1px solid #BFDBFE',
              borderRadius: 'var(--radius-l)', padding: 20, marginBottom: 14,
            }}
            className="animate-fade-up"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>
                {editId ? 'Editar servicio' : 'Nuevo servicio'}
              </h3>
              <button
                onClick={closeForm}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-m)' }}
              >
                <X size={16} />
              </button>
            </div>

            <form
              id="form-servicio"
              onSubmit={handleSubmit((d) => guardarMut.mutate(d))}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
            >
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Nombre *</label>
                <input
                  id="input-servicio-nombre"
                  {...register('nombre', { required: 'El nombre es requerido' })}
                  className="form-input"
                  placeholder="Reparación de PC"
                />
                {errors.nombre && <p className="form-error">{errors.nombre.message}</p>}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Descripción</label>
                <input
                  id="input-servicio-descripcion"
                  {...register('descripcion')}
                  className="form-input"
                  placeholder="Descripción visible para el cliente"
                />
              </div>

              <div>
                <label className="form-label">Precio base (ARS) *</label>
                <input
                  id="input-servicio-precio"
                  {...register('precioBase', {
                    required: 'El precio es requerido',
                    valueAsNumber: true,
                    min: { value: 0, message: 'El precio no puede ser negativo' },
                  })}
                  type="number" min={0}
                  className="form-input"
                />
                {errors.precioBase && <p className="form-error">{errors.precioBase.message}</p>}
              </div>

              <div>
                <label className="form-label">Duración estimada (min) *</label>
                <input
                  id="input-servicio-duracion"
                  {...register('duracionEstimadaMinutos', {
                    required: 'La duración es requerida',
                    valueAsNumber: true,
                    min: { value: 5, message: 'Mínimo 5 minutos' },
                  })}
                  type="number" min={5}
                  className="form-input"
                />
                {errors.duracionEstimadaMinutos && (
                  <p className="form-error">{errors.duracionEstimadaMinutos.message}</p>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeForm}>
                  Cancelar
                </button>
                <button
                  id="btn-guardar-servicio"
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || guardarMut.isPending}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  {guardarMut.isPending ? (
                    <><Spinner className="w-4 h-4" /> Guardando…</>
                  ) : (
                    'Guardar'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </RoleGuard>

      {/* Tabla */}
      <div className="table-wrap">
        {isLoading ? (
          <PageLoader />
        ) : (data?.content ?? []).length === 0 ? (
          <EmptyState
            title="Sin servicios"
            desc="Creá el primer servicio de tu empresa"
            icon="🔧"
          />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Precio base</th>
                <th>Duración</th>
                <th>Estado</th>
                {/* Columna de acciones solo para ADMIN */}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(data?.content ?? []).map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.nombre}</div>
                    {s.descripcion && (
                      <div style={{ fontSize: 11, color: 'var(--text-l)' }}>{s.descripcion}</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--blue)' }}>{fmt$(s.precioBase)}</td>
                  <td style={{ color: 'var(--text-m)' }}>{s.duracionEstimadaMinutos} min</td>
                  <td>
                    {/* Toggle de estado — solo ADMIN */}
                    <RoleGuard
                      roles={['ADMIN']}
                      fallback={
                        <span
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            background: s.activo ? 'var(--green-l)' : 'var(--gray-l)',
                            color: s.activo ? '#065F46' : 'var(--text-m)',
                          }}
                        >
                          <span
                            style={{
                              width: 6, height: 6, borderRadius: '50%',
                              background: s.activo ? 'var(--green)' : 'var(--text-l)',
                              display: 'inline-block',
                            }}
                          />
                          {s.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      }
                    >
                      <button
                        id={`btn-toggle-servicio-${s.id}`}
                        onClick={() => toggleMut.mutate({ id: s.id, activo: !s.activo })}
                        disabled={toggleMut.isPending}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '3px 10px', borderRadius: 20, border: 'none',
                          cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                          background: s.activo ? 'var(--green-l)' : 'var(--gray-l)',
                          color: s.activo ? '#065F46' : 'var(--text-m)',
                          opacity: toggleMut.isPending ? 0.6 : 1,
                        }}
                      >
                        <span
                          style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: s.activo ? 'var(--green)' : 'var(--text-l)',
                            display: 'inline-block',
                          }}
                        />
                        {s.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </RoleGuard>
                  </td>
                  <td>
                    {/* Botón editar — solo ADMIN */}
                    <RoleGuard roles={['ADMIN']}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          id={`btn-editar-servicio-${s.id}`}
                          className="btn btn-ghost btn-sm"
                          title="Editar"
                          onClick={() => startEdit(s)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          id={`btn-eliminar-servicio-${s.id}`}
                          className="btn btn-ghost btn-sm"
                          title="Eliminar"
                          style={{ color: 'var(--red)' }}
                          onClick={() => {
                            if (window.confirm('¿Seguro que deseás eliminar este servicio?')) {
                              eliminarMut.mutate(s.id)
                            }
                          }}
                          disabled={eliminarMut.isPending}
                        >
                          {eliminarMut.isPending ? <Spinner className="w-3 h-3 text-red-500" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </RoleGuard>
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
