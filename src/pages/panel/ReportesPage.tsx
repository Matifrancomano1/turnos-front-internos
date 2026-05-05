// src/pages/panel/ReportesPage.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reporteApi } from '@/api/client'
import { useAuthStore } from '@/store/auth'
import { PageLoader } from '@/components/ui'
import { fmt$, fmtDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { toast } from 'sonner'
import { format, subMonths } from 'date-fns'
import { Download, CalendarDays, CheckCircle2, XCircle, DollarSign, BarChart3, TrendingUp, Trophy, Award, type LucideIcon } from 'lucide-react'

export default function ReportesPage() {
  const { empresaId } = useAuthStore()
  const [desde, setDesde] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'))
  const [hasta, setHasta] = useState(format(new Date(), 'yyyy-MM-dd'))

  const { data: dash, isLoading } = useQuery({
    queryKey: ['dash-reportes', empresaId, desde, hasta],
    queryFn: () => reporteApi.dashboard(empresaId!, { desde, hasta }),
    enabled: !!empresaId,
  })

  const { data: serviciosStat } = useQuery({
    queryKey: ['servicios-stat', empresaId, desde, hasta],
    queryFn: () => reporteApi.servicios(empresaId!, { desde, hasta }),
    enabled: !!empresaId,
  })

  const handleExport = async () => {
    try {
      const res = await reporteApi.exportar(empresaId!, { desde, hasta })
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a'); a.href = url
      a.download = `reporte-${desde}-${hasta}.xlsx`; a.click()
      URL.revokeObjectURL(url)
      toast.success('Excel descargado')
    } catch { toast.error('Error al exportar') }
  }

  const barData = (serviciosStat ?? []).map(s => ({
    name: s.nombre.length > 14 ? s.nombre.slice(0, 14) + '…' : s.nombre,
    turnos: s.cantidad,
    ingresos: s.ingresoTotal,
  }))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Reportes</h2>
          <p style={{ color: 'var(--text-m)', fontSize: 13, marginTop: 2 }}>Análisis de rendimiento del negocio</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input value={desde} onChange={e => setDesde(e.target.value)} type="date" className="form-input" style={{ maxWidth: 150, fontSize: 12 }} />
          <span style={{ color: 'var(--text-l)', fontSize: 13 }}>a</span>
          <input value={hasta} onChange={e => setHasta(e.target.value)} type="date" className="form-input" style={{ maxWidth: 150, fontSize: 12 }} />
          <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={13} strokeWidth={1.75} /> Excel</button>
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          {/* KPIs */}
          {(() => {
            const kpis: { label: string; value: string | number; Icon: LucideIcon; color: string; sub?: string }[] = [
              { label: 'Turnos del período', value: dash?.turnosMes ?? 0, Icon: CalendarDays, color: 'var(--blue)' },
              { label: 'Finalizados', value: Math.max(0, (dash?.turnosMes ?? 0) - (dash?.turnosCancelados ?? 0)), Icon: CheckCircle2, color: 'var(--green)' },
              { label: 'Cancelados', value: dash?.turnosCancelados ?? 0, Icon: XCircle, color: 'var(--red)', sub: `${dash?.tasaCancelacion?.toFixed(1) ?? 0}% tasa` },
              { label: 'Ingresos estimados', value: fmt$(dash?.ingresosEstimados ?? 0), Icon: DollarSign, color: 'var(--amber)' },
            ]
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                {kpis.map(({ label, value, Icon, color, sub }) => (
                  <div key={label} style={{ background: '#fff', borderRadius: 'var(--radius-l)', padding: '16px 18px', border: '1px solid var(--gray-m)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: 14, top: 14, color, opacity: .2 }}><Icon size={20} strokeWidth={1.75} /></div>
                    <div style={{ fontSize: 11, color: 'var(--text-m)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>{value}</div>
                    {sub && <div style={{ fontSize: 11, color: 'var(--text-m)', marginTop: 2 }}>{sub}</div>}
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="card">
              <div className="card-title"><BarChart3 size={15} strokeWidth={1.75} style={{ color: 'var(--blue)' }} />Turnos por servicio</div>
              {barData.length === 0 ? (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-l)' }}>Sin datos</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-m)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-m)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-m)' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-m)', fontSize: 12 }} />
                    <Bar dataKey="turnos" fill="var(--blue)" radius={[4,4,0,0]} name="Turnos" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card">
              <div className="card-title"><TrendingUp size={15} strokeWidth={1.75} style={{ color: 'var(--green)' }} />Ingresos por servicio</div>
              {barData.length === 0 ? (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-l)' }}>Sin datos</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-m)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-m)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-m)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-m)', fontSize: 12 }} formatter={(v: number) => fmt$(v)} />
                    <Bar dataKey="ingresos" fill="var(--green)" radius={[4,4,0,0]} name="Ingresos" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top servicios tabla */}
          <div className="table-wrap">
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-m)' }} className="card-title"><Trophy size={15} strokeWidth={1.75} style={{ color: 'var(--amber)' }} />Ranking de servicios</div>
            <table className="data-table">
              <thead><tr><th>Posición</th><th>Servicio</th><th>Cantidad</th><th>Ingresos estimados</th><th>Participación</th></tr></thead>
              <tbody>
                {(serviciosStat ?? []).map((s, i) => {
                  const max = serviciosStat?.[0]?.cantidad ?? 1
                  return (
                    <tr key={i}>
                      <td>
                        <span style={{ fontWeight: 700, color: i < 3 ? 'var(--amber)' : 'var(--text-m)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {i < 3 ? <Award size={16} /> : null}
                          #{i + 1}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{s.nombre}</td>
                      <td>{s.cantidad}</td>
                      <td style={{ fontWeight: 700, color: 'var(--blue)' }}>{fmt$(s.ingresoTotal)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--gray-m)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${(s.cantidad/max)*100}%`, height: '100%', background: 'var(--blue)', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-m)', minWidth: 36, textAlign: 'right' }}>{Math.round((s.cantidad/max)*100)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {(serviciosStat ?? []).length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-l)', padding: 24 }}>Sin datos para el período seleccionado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
