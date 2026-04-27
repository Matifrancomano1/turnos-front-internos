// src/pages/panel/TurnosPage.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { turnoApi } from '@/api/client'
import { useAuthStore } from '@/store/auth'
import { EstadoBadge, PageLoader, EmptyState } from '@/components/ui'
import { fmtDate, fmt$, NEXT_STATES, ESTADO_LABEL } from '@/lib/utils'
import type { TurnoEstado, Turno } from '@/types'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { X, Search, ChevronDown, ArrowRight, CheckCircle } from 'lucide-react'

export default function TurnosPage() {
  const { empresaId } = useAuthStore()
  const qc = useQueryClient()
  const [estado, setEstado] = useState<TurnoEstado | ''>('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Turno | null>(null)
  const [showCotModal, setShowCotModal] = useState(false)
  const [showSeniaModal, setShowSeniaModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['turnos', empresaId, estado],
    queryFn: () => turnoApi.listar(empresaId!, { estado: estado || undefined, size: 100 }),
    enabled: !!empresaId,
  })

  const { data: detalle, isLoading: loadingDetalle } = useQuery({
    queryKey: ['turno-detalle', empresaId, selected?.id],
    queryFn: () => turnoApi.obtener(empresaId!, selected!.id),
    enabled: !!selected?.id,
  })

  const cambiarEstado = useMutation({
    mutationFn: (nuevoEstado: TurnoEstado) =>
      turnoApi.cambiarEstado(empresaId!, selected!.id, { nuevoEstado }),
    onSuccess: (t) => {
      toast.success(`Estado: ${ESTADO_LABEL[t.estado]}`)
      qc.invalidateQueries({ queryKey: ['turnos', empresaId] })
      qc.invalidateQueries({ queryKey: ['turno-detalle'] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Error'),
  })

  const finalizar = useMutation({
    mutationFn: () => turnoApi.finalizar(empresaId!, selected!.id),
    onSuccess: () => {
      toast.success('Turno finalizado ✓')
      qc.invalidateQueries({ queryKey: ['turnos', empresaId] })
      qc.invalidateQueries({ queryKey: ['turno-detalle'] })
    },
  })

  const { register: regCot, handleSubmit: subCot, reset: resetCot, formState: { errors: errCot, isSubmitting: subCotting } } = useForm<any>()
  const { register: regSenia, handleSubmit: subSenia, reset: resetSenia, formState: { isSubmitting: subSeniaing } } = useForm<any>()

  const crearCotizacion = async (d: any) => {
    try {
      await turnoApi.crearCotizacion(empresaId!, selected!.id, d)
      toast.success('Cotización enviada al cliente')
      qc.invalidateQueries({ queryKey: ['turnos', empresaId] })
      qc.invalidateQueries({ queryKey: ['turno-detalle'] })
      setShowCotModal(false); resetCot()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Error') }
  }

  const regSeniaFn = async (d: any) => {
    try {
      await turnoApi.registrarSenia(empresaId!, selected!.id, d)
      toast.success('Seña registrada ✓')
      qc.invalidateQueries({ queryKey: ['turnos', empresaId] })
      qc.invalidateQueries({ queryKey: ['turno-detalle'] })
      setShowSeniaModal(false); resetSenia()
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Error') }
  }

  const filtered = (data?.content ?? []).filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return t.nombreCliente.toLowerCase().includes(q) || t.nombreServicio.toLowerCase().includes(q)
  })

  const current = detalle ?? selected

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - var(--header-h) - 40px)' }}>
      {/* Left */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Gestión de Turnos</h2>
            <p style={{ color: 'var(--text-m)', fontSize: 13, marginTop: 2 }}>{data?.totalElements ?? 0} turnos en total</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--gray-l)', border: '1px solid var(--gray-m)', borderRadius: 'var(--radius)', padding: '6px 12px', flex: 1, maxWidth: 280 }}>
            <Search size={13} color="var(--text-l)" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente, servicio..."
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text)', width: '100%', fontFamily: 'inherit' }} />
          </div>
          <select value={estado} onChange={e => setEstado(e.target.value as any)} className="form-input" style={{ maxWidth: 180 }}>
            <option value="">Todos los estados</option>
            {(['SOLICITADO','EN_COTIZACION','COTIZADO','CONFIRMADO','PROGRAMADO','FINALIZADO','CANCELADO'] as TurnoEstado[]).map(e => (
              <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="table-wrap" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {isLoading ? <PageLoader /> : filtered.length === 0 ? (
              <EmptyState title="Sin turnos" desc="Probá cambiando los filtros" icon="📋" />
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>#</th><th>Cliente</th><th>Servicio</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => (
                    <tr key={t.id} onClick={() => setSelected(t as any)}
                      style={{ cursor: 'pointer', background: selected?.id === t.id ? '#EFF6FF' : undefined }}>
                      <td><span className="tag">T-{String(i + 1).padStart(3, '0')}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.nombreCliente}</div>
                        {t.email && <div style={{ fontSize: 11, color: 'var(--text-l)' }}>{t.email}</div>}
                      </td>
                      <td style={{ color: 'var(--text-m)' }}>{t.nombreServicio}</td>
                      <td>{t.fecha ? fmtDate(t.fecha) : '—'}{t.hora ? ` · ${t.hora.slice(0, 5)}` : ''}</td>
                      <td><EstadoBadge estado={t.estado} /></td>
                      <td>
                        {t.estado === 'SOLICITADO' || t.estado === 'EN_COTIZACION' ? (
                          <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); setSelected(t as any); setShowCotModal(true) }}>Cotizar</button>
                        ) : t.estado === 'CONFIRMADO' ? (
                          <button className="btn btn-success btn-sm" onClick={e => { e.stopPropagation(); setSelected(t as any); setShowSeniaModal(true) }}>Seña</button>
                        ) : (
                          <button className="btn btn-secondary btn-sm">Ver</button>
                        )}
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
      {selected && (
        <div style={{ width: 340, flexShrink: 0, background: '#fff', borderRadius: 'var(--radius-l)', border: '1px solid var(--gray-m)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          className="animate-slide-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--gray-m)', background: 'var(--gray-l)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Detalle del turno</span>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-m)' }}><X size={16} /></button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingDetalle ? <PageLoader /> : current ? (
              <>
                {/* Estado */}
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--gray-m)' }}>
                  <EstadoBadge estado={current.estado ?? selected.estado} />
                  <p style={{ fontSize: 11, color: 'var(--text-l)', marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>{selected.id.slice(0, 8)}…</p>
                </div>

                {/* Cliente */}
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--gray-m)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>Cliente</div>
                  <div style={{ fontWeight: 600 }}>{(current as any).cliente?.nombre ?? selected.nombreCliente}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-m)', marginTop: 2 }}>{(current as any).cliente?.email ?? selected.email}</div>
                  {(current as any).cliente?.whatsapp && <div style={{ fontSize: 12, color: 'var(--text-m)' }}>📱 {(current as any).cliente.whatsapp}</div>}
                </div>

                {/* Servicio + fecha */}
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--gray-m)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>Servicio</div>
                  <div style={{ fontWeight: 600 }}>{(current as any).servicio?.nombre ?? selected.nombreServicio}</div>
                  {(current as any).fechaSolicitada && (
                    <div style={{ fontSize: 12, color: 'var(--text-m)', marginTop: 4 }}>
                      Preferida: {fmtDate((current as any).fechaSolicitada)} · {(current as any).horaSolicitada?.slice(0, 5)}
                    </div>
                  )}
                  {(current as any).fechaConfirmada && (
                    <div style={{ fontSize: 12, color: 'var(--text-m)', marginTop: 2 }}>
                      ✅ Confirmada: {fmtDate((current as any).fechaConfirmada)} · {(current as any).horaConfirmada?.slice(0, 5)}
                    </div>
                  )}
                  {(current as any).descripcion && (
                    <div style={{ fontSize: 12, color: 'var(--text-m)', marginTop: 6, background: 'var(--gray-l)', padding: '6px 9px', borderRadius: 6 }}>
                      {(current as any).descripcion}
                    </div>
                  )}
                </div>

                {/* Cotización */}
                {(current as any).cotizacion && (
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--gray-m)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>Cotización</div>
                    <div style={{ background: 'var(--navy)', borderRadius: 10, padding: 14, color: '#fff', textAlign: 'center', marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: '#93C5FD', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Precio acordado</div>
                      <div style={{ fontSize: 28, fontWeight: 700, margin: '4px 0' }}>{fmt$((current as any).cotizacion.precio)}</div>
                      <div style={{ fontSize: 12, color: '#93C5FD' }}>{(current as any).cotizacion.duracionMinutos} min · Estado: {(current as any).cotizacion.estado}</div>
                    </div>
                  </div>
                )}

                {/* Seña */}
                {(current as any).senia && (
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--gray-m)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--green-l)', padding: '8px 12px', borderRadius: 8 }}>
                      <CheckCircle size={14} color="var(--green)" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#065F46' }}>Seña: {fmt$((current as any).senia.monto)}</span>
                    </div>
                  </div>
                )}

                {/* Historial */}
                {(current as any).historial?.length > 0 && (
                  <div style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 }}>Historial</div>
                    <div className="timeline">
                      {(current as any).historial.map((h: any, i: number) => (
                        <div key={i} className={`timeline-item ${i === 0 ? 'active' : 'done'}`}>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>
                            {h.estadoAnterior ? `${ESTADO_LABEL[h.estadoAnterior as TurnoEstado]} → ` : ''}
                            {ESTADO_LABEL[h.estadoNuevo as TurnoEstado]}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-l)', marginTop: 1 }}>
                            {h.cambiadoPor} · {new Date(h.timestamp).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {h.motivo && <div style={{ fontSize: 12, color: 'var(--text-m)', marginTop: 4, background: 'var(--gray-l)', padding: '5px 8px', borderRadius: 6 }}>{h.motivo}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Acciones */}
          {selected && NEXT_STATES[selected.estado] && (
            <div style={{ padding: '14px 18px', borderTop: '1px solid var(--gray-m)', background: 'var(--gray-l)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>Avanzar estado</div>
              {selected.estado === 'SOLICITADO' || selected.estado === 'EN_COTIZACION' ? (
                <button className="btn btn-primary btn-sm" style={{ justifyContent: 'space-between' }} onClick={() => setShowCotModal(true)}>
                  <span>💰 Crear cotización</span><ArrowRight size={13} />
                </button>
              ) : null}
              {selected.estado === 'CONFIRMADO' ? (
                <button className="btn btn-success btn-sm" style={{ justifyContent: 'space-between' }} onClick={() => setShowSeniaModal(true)}>
                  <span>💵 Registrar seña</span><ArrowRight size={13} />
                </button>
              ) : null}
              {selected.estado === 'PROGRAMADO' ? (
                <button className="btn btn-success btn-sm" style={{ justifyContent: 'space-between' }}
                  onClick={() => finalizar.mutate()} disabled={finalizar.isPending}>
                  <span>✅ Finalizar turno</span><ArrowRight size={13} />
                </button>
              ) : null}
              {NEXT_STATES[selected.estado]?.includes('CANCELADO') && selected.estado !== 'PROGRAMADO' && (
                <button className="btn btn-danger btn-sm" style={{ justifyContent: 'space-between' }}
                  onClick={() => cambiarEstado.mutate('CANCELADO')} disabled={cambiarEstado.isPending}>
                  <span>✕ Cancelar</span><ArrowRight size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Modal Cotización ── */}
      {showCotModal && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal animate-scale-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--gray-m)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>💰 Crear Cotización</h3>
              <button onClick={() => { setShowCotModal(false); resetCot() }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-m)' }}>✕</button>
            </div>
            <form onSubmit={subCot(crearCotizacion)} style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label className="form-label">Precio (ARS) *</label>
                  <input {...regCot('precio', { required: true, valueAsNumber: true })} type="number" min={0} className="form-input" placeholder="5000" />
                  {errCot.precio && <p className="form-error">Requerido</p>}
                </div>
                <div>
                  <label className="form-label">Duración (minutos) *</label>
                  <input {...regCot('duracionMinutos', { required: true, valueAsNumber: true })} type="number" min={5} className="form-input" placeholder="60" />
                  {errCot.duracionMinutos && <p className="form-error">Requerido</p>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label className="form-label">Fecha propuesta *</label>
                  <input {...regCot('fechaPropuesta', { required: true })} type="date" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Hora propuesta *</label>
                  <input {...regCot('horaPropuesta', { required: true })} type="time" className="form-input" />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Descripción</label>
                <textarea {...regCot('descripcion')} className="form-input" placeholder="Detallá el trabajo a realizar, materiales incluidos, etc." />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowCotModal(false); resetCot() }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={subCotting}>
                  {subCotting ? 'Enviando…' : '📤 Enviar cotización al cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Seña ── */}
      {showSeniaModal && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal animate-scale-in" style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--gray-m)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>💵 Registrar Seña</h3>
              <button onClick={() => { setShowSeniaModal(false); resetSenia() }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-m)' }}>✕</button>
            </div>
            <form onSubmit={subSenia(regSeniaFn)} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">Monto recibido (ARS) *</label>
                <input {...regSenia('monto', { required: true, valueAsNumber: true })} type="number" min={0} className="form-input" placeholder="1500" />
              </div>
              <div>
                <label className="form-label">Método de pago *</label>
                <select {...regSenia('metodoPago', { required: true })} className="form-input">
                  <option value="">Seleccioná...</option>
                  <option>Transferencia</option>
                  <option>Efectivo</option>
                  <option>Mercado Pago</option>
                  <option>Otro</option>
                </select>
              </div>
              <div>
                <label className="form-label">Referencia / Comprobante</label>
                <input {...regSenia('referencia')} className="form-input" placeholder="Nº comprobante o CVU" />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowSeniaModal(false); resetSenia() }}>Cancelar</button>
                <button type="submit" className="btn btn-success" disabled={subSeniaing}>
                  {subSeniaing ? 'Guardando…' : '✓ Confirmar seña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
