// src/components/auth/RoleGuard.tsx
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/auth'
import type { Rol } from '@/types'

interface RoleGuardProps {
  /** Roles que tienen permiso para ver el contenido */
  roles: Rol[]
  /** Contenido protegido */
  children: ReactNode
  /** Qué mostrar si el usuario NO tiene permiso. Por defecto: null */
  fallback?: ReactNode
}

/**
 * RoleGuard envuelve cualquier elemento de la UI y solo lo renderiza
 * si el usuario autenticado posee uno de los roles especificados.
 *
 * Uso:
 *   <RoleGuard roles={['ADMIN']}>
 *     <button>Solo visible para ADMIN</button>
 *   </RoleGuard>
 *
 *   <RoleGuard roles={['ADMIN', 'OPERADOR']} fallback={<p>Sin acceso</p>}>
 *     ...
 *   </RoleGuard>
 */
export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const rol = useAuthStore((s) => s.usuario?.rol)

  if (!rol || !roles.includes(rol)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
