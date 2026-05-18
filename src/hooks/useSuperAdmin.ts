import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { superAdminApi } from '@/api/superAdminClient'
import { toast } from 'sonner'
import type { CreateTenantAdminRequest } from '@/types'

// ── Obtener Listado de Empresas ────────────────────────────────────────────────────────────
export function useEmpresas() {
  return useQuery({
    queryKey: ['superadmin-empresas'],
    queryFn: () => superAdminApi.listarEmpresas(),
  })
}

// ── Crear Nueva Empresa y Admin ────────────────────────────────────────────────────────────
export function useCrearEmpresa() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTenantAdminRequest) => superAdminApi.crearEmpresa(data),
    onSuccess: () => {
      toast.success('Empresa y Administrador creados correctamente')
      qc.invalidateQueries({ queryKey: ['superadmin-empresas'] })
      qc.invalidateQueries({ queryKey: ['super-stats'] })
    },
    onError: (err: any) => {
      const msg = err?.message ?? 'Error al crear la empresa.'
      toast.error(msg)
    },
  })
}

// ── Cambiar Estado (Activa/Suspendida) ───────────────────────────────────────────────────
export function useToggleStatus() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (empresaId: string) => superAdminApi.toggleStatus(empresaId),
    onSuccess: () => {
      toast.success('Estado actualizado correctamente')
      qc.invalidateQueries({ queryKey: ['superadmin-empresas'] })
      qc.invalidateQueries({ queryKey: ['super-stats'] })
    },
    onError: (err: any) => {
      const msg = err?.message ?? 'Error al cambiar el estado de la empresa.'
      toast.error(msg)
    },
  })
}
