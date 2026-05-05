// src/api/client.ts
import axios from 'axios'
import type { ErrorResponse } from '@/types'

const BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

export const client = axios.create({ 
  baseURL: BASE, 
  headers: { 'Content-Type': 'application/json' } 
})

// ── 1. Interceptor de Petición (Inyección de Token y TenantGuard) ─────────────
client.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`
  }
  return cfg
})

// ── 2. Interceptor de Respuesta (Desempaquetado y Errores) ────────────────────
client.interceptors.response.use(
  (response) => {
    // REGLA 1: Desempaquetado automático de ApiResponse
    if (response.data && response.data.data !== undefined) {
      return response.data.data
    }
    return response.data
  },
  async (error) => {
    const orig = error.config

    if (!error.response) {
      return Promise.reject({ message: 'Error de conexión con el servidor.' } as ErrorResponse)
    }

    const status = error.response.status
    const errorData = error.response.data as ErrorResponse

    // REGLA 3: Refresh Token Automático
    if (status === 401 && !orig._retry && orig.url !== '/auth/login' && orig.url !== '/auth/refresh') {
      orig._retry = true
      const rt = localStorage.getItem('refreshToken')
      
      if (rt) {
        try {
          const res = await axios.post(`${BASE}/auth/refresh`, { refreshToken: rt })
          const newToken = res.data.data.accessToken
          
          localStorage.setItem('accessToken', newToken)
          orig.headers.Authorization = `Bearer ${newToken}`
          
          return client(orig)
        } catch (refreshErr) {
          localStorage.clear()
          window.location.href = '/panel/login'
          return Promise.reject(errorData)
        }
      } else {
        localStorage.clear()
        window.location.href = '/panel/login'
      }
    }

    // REGLA 2: Manejo Centralizado de Errores
    return Promise.reject(errorData)
  }
)

// ── src/api/services.ts ───────────────────────────────────────────────────────
import type {
  PageResponse,
  AuthResponse, LoginRequest,
  Empresa, EmpresaConfig, Servicio,
  Turno, TurnoSummary, TurnoEstado,
  Bloqueo, SlotDisponible,
  Dashboard, ServicioStat,
  SolicitudPublicaRequest, SolicitudPublicaResponse,
} from '@/types'

// Auth
export const authApi = {
  login:   (b: LoginRequest) => client.post<any, AuthResponse>('/auth/login', b),
  logout:  (rt: string) => client.post('/auth/logout', { refreshToken: rt }),
  refresh: (rt: string) => client.post<any, AuthResponse>('/auth/refresh', { refreshToken: rt }),
  me:      () => client.get<any, any>('/usuarios/me'),
}

// Público — sin auth
export const publicApi = {
  getEmpresa: (slug: string) =>
    client.get<any, Empresa>(`/empresas/slug/${slug}`),
  getServicios: (slug: string) =>
    client.get<any, Servicio[]>(`/public/empresas/${slug}/servicios`),
  getDisponibilidad: (slug: string, fecha: string, servicioId?: string) =>
    client.get<any, { fecha: string; slots: SlotDisponible[] }>(`/public/empresas/${slug}/disponibilidad`, { params: { fecha, servicioId } }),
  solicitarTurno: (slug: string, body: SolicitudPublicaRequest) =>
    client.post<any, SolicitudPublicaResponse>(`/public/empresas/${slug}/turnos`, body),
  // Link único por turno
  getTurnoPorToken: (token: string) =>
    client.get<any, Turno>(`/public/turnos/${token}`),
  aceptarCotizacion: (token: string) =>
    client.post<any, Turno>(`/public/turnos/${token}/cotizacion/aceptar`),
  rechazarCotizacion: (token: string) =>
    client.post<any, Turno>(`/public/turnos/${token}/cotizacion/rechazar`),
  cancelarTurno: (token: string, motivo?: string) =>
    client.delete(`/public/turnos/${token}`, { params: { motivo } }),
}

// Panel interno
export const empresaApi = {
  listar:          () => client.get<any, PageResponse<Empresa>>('/empresas'),
  obtener:         (id: string) => client.get<any, Empresa>(`/empresas/${id}`),
  crear:           (b: Partial<Empresa>) => client.post<any, Empresa>('/empresas', b),
  actualizar:      (id: string, b: Partial<Empresa>) => client.put<any, Empresa>(`/empresas/${id}`, b),
  actualizarConfig:(id: string, c: Partial<EmpresaConfig>) => client.put<any, Empresa>(`/empresas/${id}/config`, c),
}

export const servicioApi = {
  listar:        (eid: string) => client.get<any, PageResponse<Servicio>>(`/empresas/${eid}/servicios`, { params: { size: 100 } }),
  crear:         (eid: string, b: Partial<Servicio>) => client.post<any, Servicio>(`/empresas/${eid}/servicios`, b),
  actualizar:    (eid: string, sid: string, b: Partial<Servicio>) => client.put<any, Servicio>(`/empresas/${eid}/servicios/${sid}`, b),
  alternarEstado:(eid: string, sid: string, activo: boolean) => client.patch(`/empresas/${eid}/servicios/${sid}/estado`, null, { params: { activo } }),
  eliminar:      (eid: string, sid: string) => client.delete(`/empresas/${eid}/servicios/${sid}`), // Nueva regla de Soft Delete
}

export const turnoApi = {
  listar:        (eid: string, p?: { estado?: TurnoEstado; fecha?: string; page?: number; size?: number }) =>
                   client.get<any, PageResponse<TurnoSummary>>(`/empresas/${eid}/turnos`, { params: p }),
  obtener:       (eid: string, tid: string) => client.get<any, Turno>(`/empresas/${eid}/turnos/${tid}`),
  cambiarEstado: (eid: string, tid: string, b: { nuevoEstado: TurnoEstado; observaciones?: string }) =>
                   client.patch<any, Turno>(`/empresas/${eid}/turnos/${tid}/estado`, b),
  crearCotizacion:(eid: string, tid: string, b: object) =>
                   client.post<any, Turno>(`/empresas/${eid}/turnos/${tid}/cotizacion`, b),
  actualizarCotizacion:(eid: string, tid: string, b: object) =>
                   client.put<any, Turno>(`/empresas/${eid}/turnos/${tid}/cotizacion`, b),
  registrarSenia:(eid: string, tid: string, b: object) =>
                   client.post<any, Turno>(`/empresas/${eid}/turnos/${tid}/senia`, b),
  finalizar:     (eid: string, tid: string) =>
                   client.post<any, Turno>(`/empresas/${eid}/turnos/${tid}/finalizar`),
  reprogramar:   (eid: string, tid: string, b: object) =>
                   client.put<any, Turno>(`/empresas/${eid}/turnos/${tid}/reprogramar`, b),
  cancelar:      (eid: string, tid: string, motivo?: string) =>
                   client.delete(`/empresas/${eid}/turnos/${tid}`, { params: { motivo } }),
}

export const agendaApi = {
  calendario:    (eid: string, fecha: string, vista = 'SEMANA') =>
                   client.get<any, { fecha: string; turnos: TurnoSummary[]; bloqueos: Bloqueo[] }>(`/empresas/${eid}/agenda/calendario`, { params: { fecha, vista } }),
  crearBloqueo:  (eid: string, b: object) => client.post<any, Bloqueo>(`/empresas/${eid}/agenda/bloqueos`, b),
  eliminarBloqueo:(eid: string, bid: string) => client.delete(`/empresas/${eid}/agenda/bloqueos/${bid}`),
  disponibilidad:(eid: string, fecha: string, servicioId?: string) =>
                   client.get<any, { fecha: string; slots: SlotDisponible[] }>(`/empresas/${eid}/agenda/disponibilidad`, { params: { fecha, servicioId } }),
}

export const reporteApi = {
  dashboard: (eid: string, p?: object) => client.get<any, Dashboard>(`/empresas/${eid}/reportes/dashboard`, { params: p }),
  servicios:  (eid: string, p: object) => client.get<any, ServicioStat[]>(`/empresas/${eid}/reportes/servicios`, { params: p }),
  exportar:   (eid: string, p: object) => client.get(`/empresas/${eid}/reportes/export`, { params: p, responseType: 'blob' }),
}

export const usuarioApi = {
  listar: (eid: string) => client.get<any, PageResponse<any>>(`/empresas/${eid}/usuarios`),
  crear: (eid: string, data: any) => client.post<any, any>(`/empresas/${eid}/usuarios`, data),
}
