// src/pages/public/TurnoTokenPage.tsx
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { publicApi } from '@/api/client'
import { PageLoader } from '@/components/ui'
import { fmt$, fmtDate, fmtDateTime, ESTADO_LABEL } from '@/lib/utils'
import type { TurnoEstado } from '@/types'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { differenceInHours, parseISO } from 'date-fns'

const ESTADO_INFO: Record<TurnoEstado, { label: string; color: string; bg: string; icon: string; desc: string }> = {
  SOLICITADO:    { label: 'Solicitud recibida', color: '#92400E', bg: '#FEF3C7', icon: '⏳', desc: 'Estamos revisando tu solicitud. El operador te contactará pronto con una cotización.' },
  EN_COTIZACION: { label: 'Preparando cotización', color: '#1E40AF', bg: '#DBEAFE', icon: '📝', desc: 'El operador está preparando tu cotización. Te notificaremos cuando esté lista.' },
  COTIZADO:      { label: '¡Cotización lista!', color: '#5B21B6', bg: '#EDE9FE', icon: '💰', desc: 'Revisá la cotización y confirmá si querés continuar con el turno.' },
  CONFIRMADO:    { label: 'Turno confirmado', color: '#065F46', bg: '#D1FAE5', icon: '✅', desc: 'Tu turno está confirmado. Te enviaremos recordatorios antes de la fecha.' },
  PROGRAMADO:    { label: 'Turno programado', color: '#065F46', bg: '#D1FAE5', icon: '📅', desc: 'Tu turno está en la agenda. ¡Nos vemos el día indicado!' },
  FINALIZADO:    { label: 'Servicio finalizado', color: '#374151', bg: '#F3F4F6', icon: '🎉', desc: '¡Gracias por confiar en nosotros! Esperamos que todo haya salido perfecto.' },
  CANCELADO:     { label: 'Turno cancelado', color: '#991B1B', bg: '#FEE2E2', icon: '❌', desc: 'Este turno fue cancelado. Si necesitás podés solicitar uno nuevo.' },
}

export default function TurnoTokenPage() {
  const { token } = useParams<{ token: string }>()
  const qc = useQueryClient()
  const [showHistory, setShowHistory] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const { data: turno, isLoading, isError } = useQuery({
    queryKey: ['turno-token', token],
    queryFn: () => publicApi.getTurnoPorToken(token!),
    enabled: !!token,
    retry: false,
  })

  const aceptarMut = useMutation({
    mutationFn: () => publicApi.aceptarCotizacion(token!),
    onSuccess: () => {
      toast.success('¡Cotización aceptada! El equipo registrará tu seña para confirmar.')
      qc.invalidateQueries({ queryKey: ['turno-token', token] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Error al aceptar'),
  })

  const rechazarMut = useMutation({
    mutationFn: () => publicApi.rechazarCotizacion(token!),
    onSuccess: () => {
      toast.success('Cotización rechazada. El turno fue cancelado.')
      qc.invalidateQueries({ queryKey: ['turno-token', token] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Error al rechazar'),
  })

  const cancelarMut = useMutation({
    mutationFn: () => publicApi.cancelarTurno(token!, 'Cancelado por el cliente'),
    onSuccess: () => {
      toast.success('Turno cancelado')
      qc.invalidateQueries({ queryKey: ['turno-token', token] })
      setShowCancelConfirm(false)
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Error al cancelar'),
  })

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PageLoader />
    </div>
  )

  if (isError || !turno) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 48 }}>🔍</div>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>Turno no encontrado</h2>
      <p style={{ color: 'var(--text-m)', fontSize: 14 }}>El link puede ser inválido o haber expirado</p>
    </div>
  )

  const estadoInfo = ESTADO_INFO[turno.estado]
  const canCancel = turno.estado !== 'CANCELADO' && turno.estado !== 'FINALIZADO'
  const horasRestantes = turno.fechaConfirmada && turno.horaConfirmada
    ? differenceInHours(parseISO(`${turno.fechaConfirmada}T${turno.horaConfirmada}`), new Date())
    : null
  const cancelAllowed = canCancel && (horasRestantes === null || horasRestantes >= 48)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-l)' }}>
      {/* Header */}
      <div style={{ background: 'var(--navy)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📅</div>
          <div>
            <h1 style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>Mi Turno</h1>
            <p style={{ color: '#93C5FD', fontSize: 11 }}>Seguimiento de tu solicitud</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Estado card */}
        <div style={{ background: estadoInfo.bg, borderRadius: 'var(--radius-l)', padding: 20, border: `1px solid ${estadoInfo.color}30` }}
          className="animate-fade-up">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ fontSize: 36, flexShrink: 0 }}>{estadoInfo.icon}</div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: estadoInfo.color }}>{estadoInfo.label}</h2>
              <p style={{ fontSize: 13, color: estadoInfo.color, opacity: .85, marginTop: 4 }}>{estadoInfo.desc}</p>
            </div>
          </div>
        </div>

        {/* Cotización — acción clave */}
        {turno.estado === 'COTIZADO' && turno.cotizacion && (
          <div style={{ background: '#fff', borderRadius: 'var(--radius-l)', border: '2px solid var(--blue)', padding: 20 }}
            className="animate-scale-in">
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 14 }}>💰 Tu cotización</div>

            <div style={{ background: 'var(--navy)', borderRadius: 10, padding: 16, color: '#fff', textAlign: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: '#93C5FD', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Precio del servicio</div>
              <div style={{ fontSize: 32, fontWeight: 700, margin: '4px 0' }}>{fmt$(turno.cotizacion.precio)}</div>
              <div style={{ fontSize: 12, color: '#93C5FD' }}>Duración estimada: {turno.cotizacion.duracionMinutos} min</div>
            </div>

            {turno.cotizacion.fechaPropuesta && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-m)', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: 'var(--text-m)' }}>📅 Fecha propuesta</span>
                <span style={{ fontWeight: 600 }}>{fmtDate(turno.cotizacion.fechaPropuesta)} · {turno.cotizacion.horaPropuesta?.slice(0,5)}</span>
              </div>
            )}

            {turno.cotizacion.descripcion && (
              <div style={{ background: 'var(--gray-l)', padding: '10px 12px', borderRadius: 8, fontSize: 13, color: 'var(--text-m)', marginBottom: 14 }}>
                {turno.cotizacion.descripcion}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => rechazarMut.mutate()} disabled={rechazarMut.isPending}>
                {rechazarMut.isPending ? 'Procesando…' : '✕ Rechazar'}
              </button>
              <button className="btn btn-success" style={{ flex: 2, justifyContent: 'center' }}
                onClick={() => aceptarMut.mutate()} disabled={aceptarMut.isPending}>
                {aceptarMut.isPending ? 'Procesando…' : '✓ Aceptar cotización'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-l)', textAlign: 'center', marginTop: 8 }}>
              Al aceptar, te indicaremos cómo realizar el pago de la seña para confirmar tu turno
            </p>
          </div>
        )}

        {/* Seña pendiente */}
        {turno.estado === 'CONFIRMADO' && !turno.senia && (
          <div style={{ background: '#fff', borderRadius: 'var(--radius-l)', border: '1px solid var(--amber)', padding: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertTriangle size={18} color="var(--amber)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)' }}>Pendiente: Pago de seña</div>
                <div style={{ fontSize: 12, color: 'var(--text-m)', marginTop: 4 }}>
                  Para confirmar tu turno definitivamente, contactate con el local para coordinar el pago de la seña.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seña registrada */}
        {turno.senia && (
          <div style={{ background: '#fff', borderRadius: 'var(--radius-l)', border: '1px solid var(--gray-m)', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <CheckCircle size={16} color="var(--green)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>Seña registrada</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-m)' }}>Monto</span>
              <span style={{ fontWeight: 700 }}>{fmt$(turno.senia.monto)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
              <span style={{ color: 'var(--text-m)' }}>Método</span>
              <span style={{ fontWeight: 600 }}>{turno.senia.metodoPago}</span>
            </div>
          </div>
        )}

        {/* Datos del turno */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-l)', border: '1px solid var(--gray-m)', overflow: 'hidden' }}
          className="animate-fade-up" style={{ animationDelay: '.1s' } as any}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-m)', background: 'var(--gray-l)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Detalle del turno</span>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['👤 Cliente', turno.cliente.nombre],
              ['📧 Email', turno.cliente.email],
              turno.cliente.whatsapp ? ['📱 WhatsApp', turno.cliente.whatsapp] : null,
              ['🔧 Servicio', turno.servicio.nombre],
              ['📅 Fecha solicitada', `${fmtDate(turno.fechaSolicitada)} · ${turno.horaSolicitada?.slice(0,5)}`],
              turno.fechaConfirmada ? ['✅ Fecha confirmada', `${fmtDate(turno.fechaConfirmada)} · ${turno.horaConfirmada?.slice(0,5)}`] : null,
              turno.descripcion ? ['📝 Descripción', turno.descripcion] : null,
            ].filter(Boolean).map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid var(--gray-m)' }}>
                <span style={{ color: 'var(--text-m)' }}>{(row as string[])[0]}</span>
                <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{(row as string[])[1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Historial */}
        {turno.historial.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 'var(--radius-l)', border: '1px solid var(--gray-m)', overflow: 'hidden' }}>
            <button onClick={() => setShowHistory(!showHistory)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--gray-l)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Historial de estados ({turno.historial.length})
              </span>
              {showHistory ? <ChevronUp size={16} color="var(--text-m)" /> : <ChevronDown size={16} color="var(--text-m)" />}
            </button>
            {showHistory && (
              <div style={{ padding: 16 }}>
                <div className="timeline">
                  {turno.historial.map((h, i) => (
                    <div key={i} className={`timeline-item ${i === 0 ? 'active' : 'done'}`}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>
                        {h.estadoAnterior ? `${ESTADO_LABEL[h.estadoAnterior as TurnoEstado]} → ` : ''}
                        {ESTADO_LABEL[h.estadoNuevo as TurnoEstado]}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-l)' }}>{fmtDateTime(h.timestamp)}</div>
                      {h.motivo && <div style={{ fontSize: 12, color: 'var(--text-m)', marginTop: 4, background: 'var(--gray-l)', padding: '5px 8px', borderRadius: 6 }}>{h.motivo}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cancelar */}
        {canCancel && (
          <div>
            {!cancelAllowed && horasRestantes !== null && (
              <div style={{ background: 'var(--red-l)', borderRadius: 'var(--radius-l)', padding: 12, marginBottom: 10, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <XCircle size={16} color="var(--red)" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: '#991B1B' }}>
                  No podés cancelar con menos de 48 horas de anticipación ({horasRestantes}h restantes).
                </p>
              </div>
            )}

            {!showCancelConfirm ? (
              <button onClick={() => cancelAllowed && setShowCancelConfirm(true)}
                style={{ width: '100%', padding: '10px 0', borderRadius: 'var(--radius)', border: '1px solid var(--gray-m)', background: '#fff', color: cancelAllowed ? 'var(--red)' : 'var(--text-l)', fontSize: 13, fontWeight: 500, cursor: cancelAllowed ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                {cancelAllowed ? 'Cancelar mi turno' : 'No se puede cancelar (menos de 48hs)'}
              </button>
            ) : (
              <div style={{ background: 'var(--red-l)', borderRadius: 'var(--radius-l)', padding: 16, border: '1px solid #FCA5A5' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#991B1B', marginBottom: 12 }}>¿Estás seguro de que querés cancelar?</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowCancelConfirm(false)}>No, volver</button>
                  <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => cancelarMut.mutate()} disabled={cancelarMut.isPending}>
                    {cancelarMut.isPending ? 'Cancelando…' : 'Sí, cancelar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-l)' }}>
          ¿Problemas? Contactate directamente con el local · ID: <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>{turno.id.slice(0,8)}</code>
        </p>
      </div>
    </div>
  )
}
