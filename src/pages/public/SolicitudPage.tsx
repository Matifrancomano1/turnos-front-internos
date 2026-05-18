// src/pages/public/SolicitudPage.tsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '@/api/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import type { Servicio, SlotDisponible } from '@/types'
import { Spinner } from '@/components/ui'
import {
  CheckCircle, ChevronRight, ChevronLeft, Calendar, Clock, User,
  MessageSquare, Wrench, Search, CalendarDays, Upload, Smartphone,
  HelpCircle, CheckCircle2, Check
} from 'lucide-react'

const schema = z.object({
  nombreCliente: z.string().min(2, 'Mínimo 2 caracteres'),
  email:         z.string().email('Email inválido'),
  whatsapp:      z.string().min(7, 'Teléfono inválido'),
  servicioId:    z.string().min(1, 'Seleccioná un servicio'),
  fechaPreferida: z.string().min(1, 'Seleccioná una fecha'),
  horaPreferida:  z.string().min(1, 'Seleccioná un horario'),
  descripcion:   z.string().optional(),
})
type FormData = z.infer<typeof schema>

const STEPS = [
  { num: 1, label: 'Servicio', Icon: Wrench },
  { num: 2, label: 'Fecha y hora', Icon: CalendarDays },
  { num: 3, label: 'Tus datos', Icon: User },
  { num: 4, label: 'Confirmación', Icon: CheckCircle2 },
]

export default function SolicitudPage() {
  const { slug } = useParams<{ slug: string }>()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState<any>(null)
  const [selectedFecha, setSelectedFecha] = useState('')
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null)

  const { data: empresa, isLoading: loadingEmpresa, isError } = useQuery({
    queryKey: ['empresa-pub', slug],
    queryFn: () => publicApi.getEmpresa(slug!),
    enabled: !!slug,
    retry: false,
  })

  const { data: servicios, isLoading: loadingServicios } = useQuery({
    queryKey: ['servicios-pub', slug],
    queryFn: () => publicApi.getServicios(slug!),
    enabled: !!slug,
  })

  const { data: disponibilidad, isLoading: loadingSlots } = useQuery({
    queryKey: ['slots-pub', slug, selectedFecha, selectedServicio?.id],
    queryFn: () => publicApi.getDisponibilidad(slug!, selectedFecha, selectedServicio?.id),
    enabled: !!slug && !!selectedFecha,
  })

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const watchServicioId = watch('servicioId')
  const watchFecha = watch('fechaPreferida')
  const watchHora = watch('horaPreferida')

  useEffect(() => {
    if (watchServicioId) {
      const s = servicios?.find(s => s.id === watchServicioId) ?? null
      setSelectedServicio(s)
    }
  }, [watchServicioId, servicios])

  useEffect(() => {
    if (watchFecha) setSelectedFecha(watchFecha)
  }, [watchFecha])

  const onSubmit = async (data: FormData) => {
    try {
      const res = await publicApi.solicitarTurno(slug!, data)
      setSubmitted(res)
      setStep(4)
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Error al solicitar el turno')
    }
  }

  // Generate next 14 days excluding disabled days
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i + 1)
    const dow = d.getDay()
    if (dow === 0 && !empresa?.config.domingoHabilitado) return null
    if (dow === 6 && !empresa?.config.sabadoHabilitado) return null
    return d
  }).filter(Boolean) as Date[]

  const slots = disponibilidad?.slots ?? []
  const availableSlots = slots.filter(s => s.disponible)

  if (loadingEmpresa) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner className="w-8 h-8 text-blue-600" />
      </div>
    )
  }

  if (isError || !empresa) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div><Search size={48} strokeWidth={1.5} color="var(--text-l)" /></div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Empresa no encontrada</h2>
        <p style={{ color: 'var(--text-m)', fontSize: 14 }}>Verificá que el link sea correcto</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-l)' }}>
      {/* Header */}
      <div style={{ background: 'var(--navy)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarDays size={18} strokeWidth={1.75} color="#fff" />
          </div>
          <div>
            <h1 style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{empresa.nombre}</h1>
            <p style={{ color: '#93C5FD', fontSize: 12 }}>Solicitá tu turno online</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px' }}>
        {/* Stepper */}
        {step < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
            {STEPS.slice(0, 3).map((s, i) => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div className={`step-circle ${step > s.num ? 'done' : step === s.num ? 'active' : ''} ${step > s.num ? 'animate-step-done' : ''}`}>
                    {step > s.num ? <Check size={16} strokeWidth={2.5} /> : s.num}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: step === s.num ? 'var(--blue)' : step > s.num ? 'var(--green)' : 'var(--text-l)', textTransform: 'uppercase', letterSpacing: '.04em', whiteSpace: 'nowrap' }}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 2, background: step > s.num ? 'var(--green)' : 'var(--gray-m)', margin: '0 8px', marginBottom: 18, transition: '.3s' }} />}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Servicio */}
          {step === 1 && (
            <div className="animate-fade-up">
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>¿Qué servicio necesitás?</h2>
                <p style={{ color: 'var(--text-m)', fontSize: 13, marginTop: 4 }}>Seleccioná el servicio y contanos el problema</p>
              </div>

              {loadingServicios ? <div style={{ textAlign: 'center', padding: 40 }}><Spinner /></div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {(servicios ?? []).filter(s => s.activo).map(s => (
                    <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: '#fff', borderRadius: 'var(--radius-l)', border: `2px solid ${watchServicioId === s.id ? 'var(--blue)' : 'var(--gray-m)'}`, cursor: 'pointer', transition: '.15s' }}>
                      <input {...register('servicioId')} type="radio" value={s.id} style={{ display: 'none' }} />
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: watchServicioId === s.id ? 'var(--blue)' : 'var(--gray-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: '.15s' }}>
                        <Wrench size={20} strokeWidth={1.5} color={watchServicioId === s.id ? '#fff' : 'var(--text-l)'} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{s.nombre}</div>
                        {s.descripcion && <div style={{ fontSize: 12, color: 'var(--text-m)', marginTop: 2 }}>{s.descripcion}</div>}
                        <div style={{ fontSize: 12, color: 'var(--text-l)', marginTop: 2 }}>⏱ {s.duracionEstimadaMinutos} min estimados</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>Desde</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--blue)' }}>${s.precioBase.toLocaleString('es-AR')}</div>
                      </div>
                    </label>
                  ))}
                  {(servicios ?? []).filter(s => s.activo).length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-l)' }}>No hay servicios disponibles</div>
                  )}
                </div>
              )}
              {errors.servicioId && <p className="form-error" style={{ marginBottom: 10 }}>{errors.servicioId.message}</p>}

              <div style={{ marginBottom: 24 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={13} /> Describí el problema (opcional)
                </label>
                <textarea {...register('descripcion')} className="form-input" rows={3}
                  placeholder="Contanos qué está pasando con tu equipo, cuándo empezó el problema, etc." />
                <p className="form-hint">Cuanto más detallado, mejor podremos ayudarte</p>
              </div>

              <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }}
                onClick={() => { if (!watchServicioId) { toast.error('Seleccioná un servicio'); return }; setStep(2) }}>
                Elegir fecha y horario <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Fecha y hora */}
          {step === 2 && (
            <div className="animate-fade-up">
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>¿Cuándo te viene mejor?</h2>
                <p style={{ color: 'var(--text-m)', fontSize: 13, marginTop: 4 }}>Elegí una fecha y el horario que preferís</p>
              </div>

              {/* Dates */}
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Calendar size={13} /> Fecha preferida
                </label>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {availableDates.map(d => {
                    const val = format(d, 'yyyy-MM-dd')
                    const isSelected = watchFecha === val
                    return (
                      <button key={val} type="button"
                        onClick={() => { setValue('fechaPreferida', val); setValue('horaPreferida', '') }}
                        style={{ flexShrink: 0, padding: '10px 14px', borderRadius: 'var(--radius-l)', border: `2px solid ${isSelected ? 'var(--blue)' : 'var(--gray-m)'}`, background: isSelected ? 'var(--blue)' : '#fff', cursor: 'pointer', textAlign: 'center', minWidth: 68, transition: '.15s' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: isSelected ? 'rgba(255,255,255,.7)' : 'var(--text-l)', letterSpacing: '.04em' }}>
                          {format(d, 'EEE', { locale: es })}
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: isSelected ? '#fff' : 'var(--text)', margin: '2px 0' }}>
                          {format(d, 'd')}
                        </div>
                        <div style={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,.7)' : 'var(--text-l)' }}>
                          {format(d, 'MMM', { locale: es })}
                        </div>
                      </button>
                    )
                  })}
                </div>
                {errors.fechaPreferida && <p className="form-error" style={{ marginTop: 6 }}>{errors.fechaPreferida.message}</p>}
              </div>

              {/* Slots */}
              {watchFecha && (
                <div style={{ marginBottom: 24 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <Clock size={13} /> Horario preferido
                  </label>
                  {loadingSlots ? (
                    <div style={{ textAlign: 'center', padding: 20 }}><Spinner /></div>
                  ) : availableSlots.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', background: '#fff', borderRadius: 'var(--radius-l)', border: '1px solid var(--gray-m)', color: 'var(--text-m)', fontSize: 13 }}>
                      No hay horarios disponibles para esta fecha. Probá con otro día.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                      {availableSlots.map(slot => {
                        const isSelected = watchHora === slot.hora
                        return (
                          <button key={slot.hora} type="button"
                            onClick={() => setValue('horaPreferida', slot.hora)}
                            style={{ padding: '10px 8px', borderRadius: 'var(--radius)', border: `2px solid ${isSelected ? 'var(--blue)' : 'var(--gray-m)'}`, background: isSelected ? 'var(--blue)' : '#fff', color: isSelected ? '#fff' : 'var(--text)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: '.15s', fontFamily: 'inherit' }}>
                            {slot.hora.slice(0, 5)}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {errors.horaPreferida && <p className="form-error" style={{ marginTop: 6 }}>{errors.horaPreferida.message}</p>}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>
                  <ChevronLeft size={16} /> Atrás
                </button>
                <button type="button" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '12px 0' }}
                  onClick={() => { if (!watchFecha || !watchHora) { toast.error('Seleccioná fecha y horario'); return }; setStep(3) }}>
                  Completar mis datos <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Datos del cliente */}
          {step === 3 && (
            <div className="animate-fade-up">
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Tus datos de contacto</h2>
                <p style={{ color: 'var(--text-m)', fontSize: 13, marginTop: 4 }}>Te contactaremos para confirmar tu turno</p>
              </div>

              <div style={{ background: '#fff', borderRadius: 'var(--radius-l)', border: '1px solid var(--gray-m)', padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={12} /> Nombre y apellido *
                  </label>
                  <input {...register('nombreCliente')} className={`form-input ${errors.nombreCliente ? 'error' : ''}`} placeholder="María García" />
                  {errors.nombreCliente && <p className="form-error">{errors.nombreCliente.message}</p>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">Email *</label>
                    <input {...register('email')} type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="maria@email.com" />
                    {errors.email && <p className="form-error">{errors.email.message}</p>}
                    <p className="form-hint">Para envío de confirmación</p>
                  </div>
                  <div>
                    <label className="form-label">WhatsApp *</label>
                    <input {...register('whatsapp')} className={`form-input ${errors.whatsapp ? 'error' : ''}`} placeholder="+54 11 1234-5678" />
                    {errors.whatsapp && <p className="form-error">{errors.whatsapp.message}</p>}
                    <p className="form-hint">Para recordatorios y novedades</p>
                  </div>
                </div>
              </div>

              {/* Resumen */}
              <div style={{ background: 'var(--ice)', borderRadius: 'var(--radius-l)', border: '1px solid #BFDBFE', padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 }}>Resumen de tu solicitud</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-m)', display: 'flex', alignItems: 'center', gap: 6 }}><Wrench size={13} /> Servicio</span>
                    <span style={{ fontWeight: 600 }}>{selectedServicio?.nombre}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-m)', display: 'flex', alignItems: 'center', gap: 6 }}><CalendarDays size={13} /> Fecha preferida</span>
                    <span style={{ fontWeight: 600 }}>{watchFecha ? format(new Date(watchFecha + 'T00:00:00'), "d 'de' MMMM", { locale: es }) : '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-m)', display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={13} /> Horario preferido</span>
                    <span style={{ fontWeight: 600 }}>{watchHora?.slice(0, 5)}</span>
                  </div>
                </div>
                <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(37,99,235,.06)', borderRadius: 6, fontSize: 12, color: '#1E40AF', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <HelpCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  El operador confirmará la fecha y hora final luego de revisar tu solicitud.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(2)}>
                  <ChevronLeft size={16} /> Atrás
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '12px 0', gap: 8 }} disabled={isSubmitting}>
                  {isSubmitting ? <><Spinner className="w-4 h-4 text-white" /> Enviando…</> : <><Upload size={16} /> Solicitar turno</>}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && submitted && (
            <div className="animate-scale-in" style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle2 size={36} color="var(--green)" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>¡Solicitud enviada!</h2>
              <p style={{ fontSize: 14, color: 'var(--text-m)', marginBottom: 24, maxWidth: 420, margin: '0 auto 24px' }}>
                Tu solicitud fue recibida. El equipo de <strong>{empresa.nombre}</strong> va a revisar tu pedido y te enviarán una cotización pronto.
              </p>

              <div style={{ background: '#fff', borderRadius: 'var(--radius-l)', border: '1px solid var(--gray-m)', padding: 20, marginBottom: 20, textAlign: 'left', maxWidth: 420, margin: '0 auto 20px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 12 }}>Datos de tu turno</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-m)' }}>Nº de solicitud</span>
                    <code style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--blue)' }}>{submitted.turnoId?.slice(0,8)}</code>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-m)' }}>Estado</span>
                    <span style={{ fontWeight: 600, color: 'var(--amber)' }}>Solicitado — Pendiente de cotización</span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--amber-l)', borderRadius: 'var(--radius-l)', padding: 16, marginBottom: 24, maxWidth: 420, margin: '0 auto 24px', textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Smartphone size={14} /> Guardá este link
                </div>
                <div style={{ fontSize: 12, color: '#92400E' }}>
                  Te enviamos un link único por WhatsApp y email para que puedas ver el estado de tu turno, la cotización y cancelar si necesitás.
                </div>
              </div>

              <a href={`/turno/${submitted.tokenAcceso}`} target="_blank" rel="noreferrer"
                className="btn btn-primary" style={{ display: 'inline-flex', justifyContent: 'center', padding: '11px 28px', textDecoration: 'none' }}>
                Ver mi turno →
              </a>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
