// src/pages/panel/CotizacionesPage.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { turnoApi } from '@/api/client'
import { useAuthStore } from '@/store/auth'
import { EstadoBadge, PageLoader, EmptyState } from '@/components/ui'
import { fmtDate, fmt$, ESTADO_LABEL } from '@/lib/utils'
import type { Turno, TurnoEstado } from '@/types'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { X, ArrowRight } from 'lucide-react'

export default function CotizacionesPage() {
  const { empresaId } = useAuthStore()
  const qc = useQueryClient()
  const [selected, setSelected] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'crear' | 'editar'>('crear')

  // Fetch turnos que requieren cotización o ya están cotizados
  const { data: solicitados, isLoading: l1 } = useQuery({
    queryKey: ['cot-solicitados', empresaId],
    queryFn: () => turnoApi.listar(empresaId!, { estado: 'SOLICITADO', size: 50 }),
    enabled: !!empresaId,
  })
  const { data: enCot, isLoading: l2 } = useQuery({
    queryKey: ['cot-en-cotizacion', empresaId],
    queryFn: () => turnoApi.listar(empresaId!, { estado: 'EN_COTIZACION', size: 50 }),
    enabled: !!empresaId,
  })
  const { data: cotizados, isLoading: l3 } = useQuery({
    queryKey: ['cot-cotizados', empresaId],
    queryFn: () => turnoApi.listar(empresaId!, { estado: 'COTIZADO', size: 50 }),
    enabled: !!empresaId,
  })

  const { data: detalle } = useQuery({
    queryKey: ['turno-cot-detalle', empresaId, selected?.id],
    queryFn: () => turnoApi.obtener(empresaId!, selected!.id),
    enabled: !!selected?.id,
  })

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<any>()

  const crearCotMut = useMutation({
    mutationFn: (body: any) => modalMode === 'crear'
      ? turnoApi.crearCotizacion(empresaId!, selected!.id, body)
      : turnoApi.actualizarCotizacion(empresaId!, selected!.id, body),
    onSuccess: () => {
      toast.success(modalMode === 'crear' ? 'Cotización enviada al cliente' : 'Cotización actualizada')
      qc.invalidateQueries({ queryKey: ['cot-solicitados', empresaId] })
      qc.invalidateQueries({ queryKey: ['cot-en-cotizacion', empresaId] })
      qc.invalidateQueries({ queryKey: ['cot-cotizados', empresaId] })
      qc.invalidateQueries({ queryKey: ['turno-cot-detalle'] })
      setShowModal(false); reset()
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Error al guardar'),
  })

  const openCrear = (turno: any) => {
    setSelected(turno)
    setModalMode('crear')
    reset()
    setShowModal(true)
  }

  const openEditar = (turno: any) => {
    setSelected(turno)
    setModalMode('editar')
    if (detalle?.cotizacion) {
      setValue('precio', detalle.cotizacion.precio)
      setValue('duracionMinutos', detalle.cotizacion.duracionMinutos)
      setValue('descripcion', detalle.cotizacion.descripcion ?? '')
    }
    setShowModal(true)
  }

  const allTurnos = [
    ...(solicitados?.content ?? []),
    ...(enCot?.content ?? []),
  ]
  const isLoading = l1 || l2 || l3

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Cotizaciones</h2>
        <p style={{ color: 'var(--text-m)', fontSize: 13, marginTop: 2 }}>Turnos pendientes de cotizar y seguimiento</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Pendientes de cotizar', count: (solicitados?.totalElements ?? 0) + (enCot?.totalElements ?? 0), color: 'var(--amber)', icon: '⏳' },
          { label: 'Esperando respuesta', count: cotizados?.totalElements ?? 0, color: 'var(--purple)', icon: '📤' },
          { label: 'Total activas', count: (solicitados?.totalElements ?? 0) + (enCot?.totalElements ?? 0) + (cotizados?.totalElements ?? 0), color: 'var(--blue)', icon: '💰' },
        ].map(({ label, count, color, icon }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{count}</div>
              <div style={{ fontSize: 12, color: 'var(--text-m)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Pendientes de cotizar */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block' }} />
            Pendientes de cotizar ({allTurnos.length})
          </h3>
          <div className="table-wrap">
            {isLoading ? <PageLoader /> : allTurnos.length === 0 ? (
              <EmptyState title="No hay pendientes" desc="Todos los turnos están cotizados" icon="✅" />
            ) : (
              <table className="data-table">
                <thead><tr><th>Cliente</th><th>Servicio</th><th>Solicitud</th><th></th></tr></thead>
                <tbody>
                  {allTurnos.map(t => (
                    <tr key={t.id} onClick={() => setSelected(t)} style={{ cursor: 'pointer', background: selected?.id === t.id ? '#EFF6FF' : undefined }}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.nombreCliente}</div>
                        {t.email && <div style={{ fontSize: 11, color: 'var(--text-l)' }}>{t.email}</div>}
                      </td>
                      <td style={{ color: 'var(--text-m)', fontSize: 12 }}>{t.nombreServicio}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-l)' }}>{t.fecha ? fmtDate(t.fecha) : '—'}</td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); openCrear(t) }}>
                          Cotizar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Esperando respuesta */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', display: 'inline-block' }} />
            Esperando respuesta del cliente ({cotizados?.totalElements ?? 0})
          </h3>
          <div className="table-wrap">
            {l3 ? <PageLoader /> : (cotizados?.content ?? []).length === 0 ? (
              <EmptyState title="Sin cotizaciones enviadas" desc="Las cotizaciones enviadas aparecen aquí" icon="📤" />
            ) : (
              <table className="data-table">
                <thead><tr><th>Cliente</th><th>Precio</th><th>Enviada</th><th></th></tr></thead>
                <tbody>
                  {(cotizados?.content ?? []).map(t => (
                    <tr key={t.id} onClick={() => setSelected(t)} style={{ cursor: 'pointer', background: selected?.id === t.id ? '#EFF6FF' : undefined }}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.nombreCliente}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-l)' }}>{t.nombreServicio}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--blue)' }}>
                        {detalle?.cotizacion && selected?.id === t.id ? fmt$(detalle.cotizacion.precio) : '—'}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-l)' }}>{t.fecha ? fmtDate(t.fecha) : '—'}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); openEditar(t) }}>
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selected && detalle && (
        <div style={{ marginTop: 16, background: '#fff', borderRadius: 'var(--radius-l)', border: '1px solid var(--gray-m)', padding: 20 }}
          className="animate-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <EstadoBadge estado={detalle.estado} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>{detalle.cliente.nombre}</span>
              <span style={{ fontSize: 12, color: 'var(--text-m)' }}>— {detalle.servicio.nombre}</span>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-m)' }}><X size={16} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-l)', marginBottom: 4 }}>Contacto</div>
              <div style={{ fontSize: 13 }}>{detalle.cliente.email}</div>
              {detalle.cliente.whatsapp && <div style={{ fontSize: 13 }}>📱 {detalle.cliente.whatsapp}</div>}
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-l)', marginBottom: 4 }}>Fecha solicitada</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtDate(detalle.fechaSolicitada)} · {detalle.horaSolicitada?.slice(0, 5)}</div>
            </div>
            {detalle.descripcion && (
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-l)', marginBottom: 4 }}>Descripción del problema</div>
                <div style={{ fontSize: 13, color: 'var(--text-m)' }}>{detalle.descripcion}</div>
              </div>
            )}
          </div>

          {detalle.cotizacion && (
            <div style={{ marginTop: 14, background: 'var(--ice)', borderRadius: 8, padding: 14, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-l)' }}>Precio cotizado</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)' }}>{fmt$(detalle.cotizacion.precio)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-l)' }}>Duración</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{detalle.cotizacion.duracionMinutos} min</div>
              </div>
              {detalle.cotizacion.fechaPropuesta && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-l)' }}>Fecha propuesta</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{fmtDate(detalle.cotizacion.fechaPropuesta)} · {detalle.cotizacion.horaPropuesta?.slice(0,5)}</div>
                </div>
              )}
              <div style={{ marginLeft: 'auto' }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                  background: detalle.cotizacion.estado === 'ACEPTADA' ? 'var(--green-l)' : detalle.cotizacion.estado === 'RECHAZADA' ? 'var(--red-l)' : 'var(--amber-l)',
                  color: detalle.cotizacion.estado === 'ACEPTADA' ? '#065F46' : detalle.cotizacion.estado === 'RECHAZADA' ? '#991B1B' : '#92400E',
                }}>
                  {detalle.cotizacion.estado}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal cotización */}
      {showModal && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal animate-scale-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--gray-m)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>💰 {modalMode === 'crear' ? 'Crear' : 'Editar'} Cotización</h3>
              <button onClick={() => { setShowModal(false); reset() }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-m)' }}>✕</button>
            </div>

            {selected && (
              <div style={{ padding: '12px 20px', background: 'var(--ice)', borderBottom: '1px solid var(--gray-m)' }}>
                <div style={{ fontSize: 13 }}><strong>{selected.nombreCliente}</strong> — {selected.nombreServicio}</div>
              </div>
            )}

            <form onSubmit={handleSubmit(d => crearCotMut.mutate(d))} style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label className="form-label">Precio (ARS) *</label>
                  <input {...register('precio', { required: true, valueAsNumber: true })} type="number" min={0} className="form-input" placeholder="5000" />
                  {errors.precio && <p className="form-error">Requerido</p>}
                </div>
                <div>
                  <label className="form-label">Duración (min) *</label>
                  <input {...register('duracionMinutos', { required: true, valueAsNumber: true })} type="number" min={5} className="form-input" placeholder="60" />
                  {errors.duracionMinutos && <p className="form-error">Requerido</p>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label className="form-label">Fecha propuesta *</label>
                  <input {...register('fechaPropuesta', { required: true })} type="date" className="form-input" />
                  {errors.fechaPropuesta && <p className="form-error">Requerido</p>}
                </div>
                <div>
                  <label className="form-label">Hora propuesta *</label>
                  <input {...register('horaPropuesta', { required: true })} type="time" className="form-input" />
                  {errors.horaPropuesta && <p className="form-error">Requerido</p>}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Descripción del trabajo</label>
                <textarea {...register('descripcion')} className="form-input" rows={3}
                  placeholder="Detallá el trabajo, repuestos incluidos, garantía, etc." />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); reset() }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || crearCotMut.isPending}>
                  {isSubmitting || crearCotMut.isPending ? 'Enviando…' : '📤 Enviar al cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
