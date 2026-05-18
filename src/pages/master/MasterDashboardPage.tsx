import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Building2, Users, CalendarCheck, RefreshCw, Loader2,
  TrendingUp, CreditCard, ShieldCheck
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { superAdminApi } from '@/api/superAdminClient'
import { StatCard } from '@/components/ui'

const growthData = [
  { mes: 'Ene', tenants: 2 },
  { mes: 'Feb', tenants: 5 },
  { mes: 'Mar', tenants: 12 },
  { mes: 'Abr', tenants: 18 },
  { mes: 'May', tenants: 24 },
  { mes: 'Jun', tenants: 35 },
]

const activityData = [
  { dia: 'Lun', turnos: 120 },
  { dia: 'Mar', turnos: 150 },
  { dia: 'Mie', turnos: 180 },
  { dia: 'Jue', turnos: 140 },
  { dia: 'Vie', turnos: 200 },
  { dia: 'Sab', turnos: 250 },
  { dia: 'Dom', turnos: 90 },
]

export default function MasterDashboardPage() {
  const qc = useQueryClient()

  const { data: stats, isLoading, isRefetching } = useQuery({
    queryKey: ['super-stats'],
    queryFn: () => superAdminApi.getStats(),
    staleTime: 60_000,
  })

  const total = stats?.totalEmpresas || 0
  const tenantStatusData = [
    { name: 'Activos', value: Math.max(1, Math.floor(total * 0.8)) },
    { name: 'Suspendidos', value: Math.floor(total * 0.2) },
  ]

  return (
    <div className="animate-fade-up">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Métricas Globales</h1>
          <p style={{ color: 'var(--text-m)', fontSize: 14, marginTop: 2 }}>
            Visión general del ecosistema y rendimiento de la plataforma.
          </p>
        </div>
        
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['super-stats'] })}
          disabled={isRefetching}
          className="btn btn-secondary"
        >
          <RefreshCw size={14} className={isRefetching ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: 'var(--text-m)' }}>
          <Loader2 size={32} className="animate-spin text-blue-500" style={{ marginBottom: 16 }} />
          <p>Cargando métricas...</p>
        </div>
      ) : (
        <>
          {/* ── Stat Cards ─────────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard label="Empresas Totales" value={stats?.totalEmpresas ?? 0} icon={Building2} color="blue" sub="+12% este mes" />
            <StatCard label="Usuarios Registrados" value={stats?.totalUsuarios ?? 0} icon={Users} color="green" sub="+5% este mes" />
            <StatCard label="Turnos Procesados" value={stats?.totalTurnos ?? 0} icon={CalendarCheck} color="amber" sub="+18% este mes" />
            <StatCard label="Ingresos Estimados" value="$12,450" icon={CreditCard} color="red" sub="+8% este mes" />
          </div>

          {/* ── Charts ─────────────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            
            {/* Gráfico de Crecimiento */}
            <div className="card">
              <div className="card-title">
                <TrendingUp size={18} color="var(--blue)" />
                Crecimiento de Tenants
              </div>
              <div style={{ height: 300, width: '100%', marginTop: 20 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-m)" vertical={false} />
                    <XAxis dataKey="mes" stroke="var(--text-m)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-m)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: 'var(--gray-m)', borderRadius: 8, color: 'var(--text)', fontSize: 13 }} cursor={{ fill: 'var(--gray-l)', opacity: 0.5 }} />
                    <Bar dataKey="tenants" fill="var(--blue)" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Estado */}
            <div className="card">
              <div className="card-title">
                <ShieldCheck size={18} color="var(--green)" />
                Estado Operativo
              </div>
              <div style={{ height: 200, width: '100%', marginTop: 20 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={tenantStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      <Cell fill="var(--green)" />
                      <Cell fill="var(--red)" />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: 'var(--gray-m)', borderRadius: 8, color: 'var(--text)', fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-m)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)' }}></span> Activos
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-m)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--red)' }}></span> Suspendidos
                </div>
              </div>
            </div>

            {/* Gráfico de Actividad de Turnos */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-title">
                <CalendarCheck size={18} color="var(--amber)" />
                Volumen de Turnos (Últimos 7 días)
              </div>
              <div style={{ height: 250, width: '100%', marginTop: 20 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-m)" vertical={false} />
                    <XAxis dataKey="dia" stroke="var(--text-m)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-m)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: 'var(--gray-m)', borderRadius: 8, color: 'var(--text)', fontSize: 13 }} />
                    <Line type="monotone" dataKey="turnos" stroke="var(--amber)" strokeWidth={3} dot={{ r: 4, fill: 'var(--amber)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: 'var(--amber)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  )
}
