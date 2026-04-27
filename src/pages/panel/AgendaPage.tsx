// src/pages/panel/AgendaPage.tsx
import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { agendaApi } from '@/api/client'
import { useAuthStore } from '@/store/auth'
import { EstadoBadge, PageLoader } from '@/components/ui'
import { ESTADO_FC_COLOR } from '@/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import type { TurnoSummary, Bloqueo } from '@/types'

export default function AgendaPage() {
  const { empresaId } = useAuthStore()
  const qc = useQueryClient()
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['calendario', empresaId, currentDate],
    queryFn: () => agendaApi.calendario(empresaId!, currentDate, 'SEMANA'),
    enabled: !!empresaId,
  })

  const crear = useMutation({
    mutationFn: (b: any) => agendaApi.crearBloqueo(empresaId!, b),
    onSuccess: () => {
      toast.success('Bloqueo creado')
      qc.invalidateQueries({ queryKey: ['calendario', empresaId] })
      setShowModal(false); reset()
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Error'),
  })

  const eliminar = useMutation({
    mutationFn: (id: string) => agendaApi.eliminarBloqueo(empresaId!, id),
    onSuccess: () => {
      toast.success('Bloqueo eliminado')
      qc.invalidateQueries({ queryKey: ['calendario', empresaId] })
      setSelectedEvent(null)
    },
  })

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<any>({
    defaultValues: { fechaDesde: currentDate, fechaHasta: currentDate, horaDesde: '13:00', horaHasta: '15:00' },
  })

  const fcEvents = [
    ...(data?.turnos ?? []).map(t => ({
      id: `t-${t.id}`, title: `${t.hora?.slice(0,5)} · ${t.nombreCliente}`,
      start: `${t.fecha}T${t.hora}`, backgroundColor: ESTADO_FC_COLOR[t.estado],
      borderColor: ESTADO_FC_COLOR[t.estado], extendedProps: { ...t, type: 'turno' },
    })),
    ...(data?.bloqueos ?? []).map(b => ({
      id: `b-${b.id}`, title: `🔒 ${b.motivo}`,
      start: `${b.fecha}T${b.horaInicio}`, end: `${b.fecha}T${b.horaFin}`,
      backgroundColor: '#E2E8F0', borderColor: '#C8CEDF', textColor: '#64748B',
      extendedProps: { ...b, type: 'bloqueo' },
    })),
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Agenda</h2>
          <p style={{ color: 'var(--text-m)', fontSize: 13, marginTop: 2 }}>Calendario de turnos y bloqueos</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowModal(true)}>🔒 Nuevo bloqueo</button>
      </div>

      <div style={{ display: 'flex', gap: 14 }}>
        {/* Calendar */}
        <div className="card" style={{ flex: 1, padding: 14 }}>
          {isLoading ? <PageLoader /> : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView="timeGridWeek"
              locale="es"
              headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }}
              events={fcEvents}
              eventClick={info => setSelectedEvent(info.event.extendedProps)}
              datesSet={info => setCurrentDate(format(info.start, 'yyyy-MM-dd'))}
              slotMinTime="07:00:00" slotMaxTime="21:00:00"
              allDaySlot={false} nowIndicator
              height="calc(100vh - 200px)"
            />
          )}
        </div>

        {/* Event detail */}
        {selectedEvent && (
          <div style={{ width: 280, flexShrink: 0, background: '#fff', borderRadius: 'var(--radius-l)', border: '1px solid var(--gray-m)', overflow: 'hidden' }}
            className="animate-slide-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--gray-m)', background: 'var(--gray-l)' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-m)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                {selectedEvent.type === 'turno' ? 'Turno' : 'Bloqueo'}
              </span>
              <button onClick={() => setSelectedEvent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={15} /></button>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selectedEvent.type === 'turno' ? (
                <>
                  <div><p style={{ fontSize: 11, color: 'var(--text-l)' }}>Cliente</p><p style={{ fontWeight: 600, fontSize: 13 }}>{selectedEvent.nombreCliente}</p></div>
                  <div><p style={{ fontSize: 11, color: 'var(--text-l)' }}>Servicio</p><p style={{ fontSize: 13 }}>{selectedEvent.nombreServicio}</p></div>
                  <div><p style={{ fontSize: 11, color: 'var(--text-l)' }}>Hora</p><p style={{ fontSize: 13 }}>{selectedEvent.hora?.slice(0, 5)}</p></div>
                  <EstadoBadge estado={selectedEvent.estado} />
                </>
              ) : (
                <>
                  <div><p style={{ fontSize: 11, color: 'var(--text-l)' }}>Motivo</p><p style={{ fontWeight: 600, fontSize: 13 }}>{selectedEvent.motivo}</p></div>
                  <div><p style={{ fontSize: 11, color: 'var(--text-l)' }}>Horario</p><p style={{ fontSize: 13 }}>{selectedEvent.horaInicio?.slice(0, 5)} – {selectedEvent.horaFin?.slice(0, 5)}</p></div>
                  <div><p style={{ fontSize: 11, color: 'var(--text-l)' }}>Creado por</p><p style={{ fontSize: 13 }}>{selectedEvent.creadoPor}</p></div>
                  <button className="btn btn-danger btn-sm" onClick={() => eliminar.mutate(selectedEvent.id)} disabled={eliminar.isPending}>
                    {eliminar.isPending ? 'Eliminando…' : '🗑 Eliminar bloqueo'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal bloqueo */}
      {showModal && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal animate-scale-in" style={{ maxWidth: 440 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--gray-m)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>🔒 Nuevo bloqueo de horario</h3>
              <button onClick={() => { setShowModal(false); reset() }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-m)' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit(d => crear.mutate(d))} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label className="form-label">Fecha desde</label><input {...register('fechaDesde', { required: true })} type="date" className="form-input" /></div>
                <div><label className="form-label">Fecha hasta</label><input {...register('fechaHasta', { required: true })} type="date" className="form-input" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label className="form-label">Hora inicio</label><input {...register('horaDesde', { required: true })} type="time" className="form-input" /></div>
                <div><label className="form-label">Hora fin</label><input {...register('horaHasta', { required: true })} type="time" className="form-input" /></div>
              </div>
              <div>
                <label className="form-label">Motivo *</label>
                <input {...register('motivo', { required: true })} className="form-input" placeholder="Ej: Reunión, feriado, mantenimiento…" />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); reset() }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Creando…' : 'Crear bloqueo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
