// src/pages/panel/DashboardPage.tsx
import { useQuery } from '@tanstack/react-query'
import { reporteApi, turnoApi } from '@/api/client'
import { useAuthStore } from '@/store/auth'
import { StatCard, PageLoader, EstadoBadge } from '@/components/ui'
import { fmt$, fmtDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { empresaId } = useAuthStore()
  const nav = useNavigate()

  const { data: dash, isLoading } = useQuery({
    queryKey: ['dashboard', empresaId],
    queryFn: () => reporteApi.dashboard(empresaId!),
    enabled: !!empresaId, staleTime: 60_000,
  })

  const { data: turnosData } = useQuery({
    queryKey: ['turnos-recientes', empresaId],
    queryFn: () => turnoApi.listar(empresaId!, { size: 5 }),
    enabled: !!empresaId,
  })

  if (isLoading) return <PageLoader />

  const barData = (dash?.topServicios ?? []).map(s => ({
    name: s.nombre.length > 16 ? s.nombre.slice(0, 16) + '…' : s.nombre,
    turnos: s.cantidad,
  }))

  return (
    <div className="animate-fade-up">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Dashboard</h2>
          <p style={{ color: 'var(--text-m)', fontSize: 13, marginTop: 2 }}>Resumen operativo — mes en curso</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => reporteApi.exportar(empresaId!, {})}>⬇ Exportar</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Turnos del Mes"     value={dash?.turnosMes ?? 0}       icon="📋" color="blue"  sub={`${dash?.turnosHoy ?? 0} hoy`} />
        <StatCard label="Finalizados"        value={`${Math.round((1 - (dash?.tasaCancelacion ?? 0) / 100) * (dash?.turnosMes ?? 0))}`} icon="✅" color="green" sub="tasa de cierre" />
        <StatCard label="Pendientes cotiz."  value={dash?.turnosCancelados ?? 0} icon="⏳" color="amber" sub="requieren acción" />
        <StatCard label="Cancelaciones"      value={dash?.turnosCancelados ?? 0} icon="❌" color="red"   sub={`${dash?.tasaCancelacion?.toFixed(1) ?? 0}% tasa`} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        {/* Bar chart */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📊 Turnos por Servicio</div>
          {barData.length === 0 ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-l)', fontSize: 13 }}>Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-m)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-m)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-m)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-m)', fontSize: 12 }} />
                <Bar dataKey="turnos" fill="var(--blue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top servicios */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🏆 Top Servicios</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(dash?.topServicios ?? []).slice(0, 4).map((s, i) => {
              const max = dash?.topServicios[0]?.cantidad ?? 1
              const colors = ['var(--blue)', 'var(--teal)', 'var(--purple)', 'var(--amber)']
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>{s.nombre}</span><span style={{ fontWeight: 700 }}>{s.cantidad}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--gray-m)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(s.cantidad / max) * 100}%`, background: colors[i], borderRadius: 4, transition: '.5s' }} />
                  </div>
                </div>
              )
            })}
            {(!dash?.topServicios || dash.topServicios.length === 0) && (
              <div style={{ color: 'var(--text-l)', fontSize: 13, textAlign: 'center', paddingTop: 20 }}>Sin datos aún</div>
            )}
          </div>
        </div>
      </div>

      {/* Últimos turnos */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>📋 Últimos Turnos</span>
          <button className="btn btn-ghost btn-sm" onClick={() => nav('/panel/turnos')}>Ver todos →</button>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Cliente</th><th>Servicio</th><th>Fecha</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {(turnosData?.content ?? []).map((t, i) => (
              <tr key={t.id}>
                <td><span className="tag">T-{String(i + 1).padStart(3, '0')}</span></td>
                <td style={{ fontWeight: 600 }}>{t.nombreCliente}</td>
                <td style={{ color: 'var(--text-m)' }}>{t.nombreServicio}</td>
                <td>{t.fecha ? fmtDate(t.fecha) : '—'} {t.hora ? `· ${t.hora.slice(0, 5)}` : ''}</td>
                <td><EstadoBadge estado={t.estado} /></td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => nav(`/panel/turnos`)}>Ver</button>
                </td>
              </tr>
            ))}
            {(turnosData?.content ?? []).length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-l)', padding: 24 }}>No hay turnos recientes</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
