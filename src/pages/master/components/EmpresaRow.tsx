import { Building2, Calendar, Globe, Power, PowerOff, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useToggleStatus } from '@/hooks/useSuperAdmin'

import type { SuperAdminEmpresaResponse } from '@/types'

interface Props {
  empresa: SuperAdminEmpresaResponse
}

export function EmpresaRow({ empresa }: Props) {
  const toggleMutation = useToggleStatus()
  const { startImpersonation } = useAuthStore()

  const handleToggle = () => {
    toggleMutation.mutate(empresa.id)
  }

  const handleImpersonate = () => {
    alert('Funcionalidad de impersonar a implementar con el token temporal.')
  }

  const date = new Date(empresa.createdAt).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'var(--gray-l)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Building2 size={16} color="var(--blue)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{empresa.nombre}</div>
            <div style={{ fontSize: 11, color: 'var(--text-l)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Globe size={10} /> flowtech.com/{empresa.slug}
            </div>
          </div>
        </div>
      </td>
      
      <td>
        <div style={{ fontSize: 13, color: 'var(--text-m)' }}>
          {empresa.emailContacto}
        </div>
      </td>

      <td>
        <span className={`badge ${empresa.activa ? 'badge-programado' : 'badge-cancelado'}`}>
          {empresa.activa ? 'Activa' : 'Suspendida'}
        </span>
      </td>

      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-l)' }}>
          <Calendar size={12} />
          {date}
        </div>
      </td>

      <td style={{ textAlign: 'right' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <button
            onClick={handleToggle}
            disabled={toggleMutation.isPending}
            className="btn btn-ghost btn-sm"
            style={{ color: empresa.activa ? 'var(--red)' : 'var(--green)' }}
            title={empresa.activa ? 'Suspender Empresa' : 'Activar Empresa'}
          >
            {empresa.activa ? <PowerOff size={15} /> : <Power size={15} />}
          </button>
          
          <button
            onClick={handleImpersonate}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            title="Impersonar (Ingresar como Admin)"
          >
            <ShieldAlert size={14} /> Entrar
          </button>
        </div>
      </td>
    </tr>
  )
}
