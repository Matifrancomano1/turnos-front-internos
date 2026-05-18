// src/components/ui/index.tsx
import { ESTADO_CLASS, ESTADO_LABEL, cn } from '@/lib/utils'
import type { TurnoEstado } from '@/types'
import { Loader2, type LucideIcon } from 'lucide-react'

export const EstadoBadge = ({ estado }: { estado: TurnoEstado }) => (
  <span className={`badge ${ESTADO_CLASS[estado]}`}>{ESTADO_LABEL[estado]}</span>
)

export const Spinner = ({ className }: { className?: string }) => (
  <Loader2 className={cn('animate-spin', className ?? 'w-5 h-5 text-blue-600')} />
)

export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner className="w-8 h-8 text-blue-600" />
  </div>
)

export const EmptyState = ({
  title,
  desc,
  icon: Icon,
}: {
  title: string
  desc?: string
  icon?: LucideIcon
}) => (
  <div className="empty-state">
    {Icon && (
      <div className="es-icon-wrap">
        <Icon size={22} strokeWidth={1.5} />
      </div>
    )}
    <h3>{title}</h3>
    {desc && <p>{desc}</p>}
  </div>
)

export const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  color = 'blue',
}: {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  color?: 'blue' | 'green' | 'amber' | 'red'
}) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-card-icon">
      <Icon size={18} strokeWidth={1.75} />
    </div>
    <div style={{ fontSize: 11, color: 'var(--text-m)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, margin: '4px 0', color: 'var(--text)' }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--text-m)' }}>{sub}</div>}
  </div>
)

export { DangerZoneModal } from './DangerZoneModal'
