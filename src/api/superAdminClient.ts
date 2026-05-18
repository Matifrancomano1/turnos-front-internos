// src/api/superAdminClient.ts
import { client } from '@/api/client'
import type {
  SuperAdminEmpresaResponse,
  SuperAdminStatsResponse,
  CreateTenantAdminRequest,
  ImpersonationResponse,
} from '@/types'

const BASE = '/superadmin'

export const superAdminApi = {
  /**
   * GET /api/v1/superadmin/empresas
   * Lista todas las empresas/tenants del sistema.
   */
  listarEmpresas: () =>
    client.get<any, SuperAdminEmpresaResponse[]>(`${BASE}/empresas`),

  /**
   * POST /api/v1/superadmin/empresas
   * Crea una empresa y su primer usuario administrador en una transacción.
   */
  crearEmpresa: (data: CreateTenantAdminRequest) =>
    client.post<any, SuperAdminEmpresaResponse>(`${BASE}/empresas`, data),

  /**
   * GET /api/v1/superadmin/stats
   * Retorna estadísticas globales del SaaS.
   */
  getStats: () =>
    client.get<any, SuperAdminStatsResponse>(`${BASE}/stats`),

  /**
   * POST /api/v1/superadmin/impersonate/{empresaId}
   * Retorna un token temporal con rol ADMIN para acceder como admin del tenant.
   */
  impersonate: (empresaId: string) =>
    client.post<any, ImpersonationResponse>(`${BASE}/impersonate/${empresaId}`),

  /**
   * PATCH /api/v1/empresas/{id}/status
   * Activa o suspende una empresa. Asumimos base en /empresas en vez de /superadmin.
   */
  toggleStatus: (empresaId: string) =>
    client.patch<any, any>(`/empresas/${empresaId}/status`),
}
