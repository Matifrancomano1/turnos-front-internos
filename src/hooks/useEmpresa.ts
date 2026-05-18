// src/hooks/useEmpresa.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { empresaApi } from '@/api/client'
import type { EmpresaConfigFormData } from '@/schemas/empresa.schema'
import { toast } from 'sonner'

// ── Obtener empresa ────────────────────────────────────────────────────────────
export function useEmpresa(empresaId: string) {
  return useQuery({
    queryKey: ['empresa', empresaId],
    queryFn: () => empresaApi.obtener(empresaId),
    enabled: !!empresaId,
  })
}

// ── Actualizar configuración ───────────────────────────────────────────────────
export function useUpdateConfigEmpresa(empresaId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: EmpresaConfigFormData) =>
      empresaApi.actualizarConfig(empresaId, data),
    onSuccess: () => {
      toast.success('Configuración guardada correctamente')
      qc.invalidateQueries({ queryKey: ['empresa', empresaId] })
      qc.invalidateQueries({ queryKey: ['empresas'] })
      qc.invalidateQueries({ queryKey: ['superadmin-empresas'] })
    },
    onError: (err: any) => {
      const msg =
        err?.message ??
        'Error al guardar la configuración. Intentá nuevamente.'
      toast.error(msg)
    },
  })
}

// ── Actualizar datos base (incluye slug) ──────────────────────────────────────
export function useUpdateEmpresa(empresaId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => empresaApi.actualizar(empresaId, data),
    onSuccess: () => {
      toast.success('Datos guardados correctamente')
      qc.invalidateQueries({ queryKey: ['empresa', empresaId] })
      qc.invalidateQueries({ queryKey: ['empresas'] })
      qc.invalidateQueries({ queryKey: ['superadmin-empresas'] })
    },
    onError: (err: any) => {
      // Regla 2: Manejo de 409 Conflict para el campo Slug
      if (err?.error === 'CONFLICT') {
        toast.error('Esta URL pública (slug) ya está en uso. Por favor elegí otro.')
      } else {
        const msg = err?.message ?? 'Error al guardar los datos de la empresa.'
        toast.error(msg)
      }
    },
  })
}
