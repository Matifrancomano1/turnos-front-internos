// src/api/client.ts
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

export const client = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } })

client.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('accessToken')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

client.interceptors.response.use(
  (r) => r,
  async (err) => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      const rt = localStorage.getItem('refreshToken')
      if (rt) {
        try {
          const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken: rt })
          const tok = data.data.accessToken
          localStorage.setItem('accessToken', tok)
          orig.headers.Authorization = `Bearer ${tok}`
          return client(orig)
        } catch { localStorage.clear(); window.location.href = '/panel/login' }
      } else { localStorage.clear(); window.location.href = '/panel/login' }
    }
    return Promise.reject(err)
  }
)

// ── src/api/services.ts ───────────────────────────────────────────────────────
import type {
  ApiResponse, PageResponse,
  AuthResponse, LoginRequest,
  Empresa, EmpresaConfig, Servicio,
  Turno, TurnoSummary, TurnoEstado,
  Bloqueo, SlotDisponible,
  Dashboard, ServicioStat,
  SolicitudPublicaRequest, SolicitudPublicaResponse,
} from '@/types'

const u = <T>(r: { data: ApiResponse<T> }) => r.data.data

// Auth
export const authApi = {
  login:   (b: LoginRequest) => client.post<ApiResponse<AuthResponse>>('/auth/login', b).then(u),
  logout:  (rt: string) => client.post('/auth/logout', { refreshToken: rt }),
  refresh: (rt: string) => client.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken: rt }).then(u),
  me:      () => client.get<ApiResponse<any>>('/usuarios/me').then(u),
}

// Público — sin auth
export const publicApi = {
  getEmpresa: (slug: string) =>
    client.get<ApiResponse<Empresa>>(`/public/empresas/${slug}`).then(u),
  getServicios: (slug: string) =>
    client.get<ApiResponse<Servicio[]>>(`/public/empresas/${slug}/servicios`).then(u),
  getDisponibilidad: (slug: string, fecha: string, servicioId?: string) =>
    client.get<ApiResponse<{ fecha: string; slots: SlotDisponible[] }>>(`/public/empresas/${slug}/disponibilidad`, { params: { fecha, servicioId } }).then(u),
  solicitarTurno: (slug: string, body: SolicitudPublicaRequest) =>
    client.post<ApiResponse<SolicitudPublicaResponse>>(`/public/empresas/${slug}/turnos`, body).then(u),
  // Link único por turno
  getTurnoPorToken: (token: string) =>
    client.get<ApiResponse<Turno>>(`/public/turnos/${token}`).then(u),
  aceptarCotizacion: (token: string) =>
    client.post<ApiResponse<Turno>>(`/public/turnos/${token}/cotizacion/aceptar`).then(u),
  rechazarCotizacion: (token: string) =>
    client.post<ApiResponse<Turno>>(`/public/turnos/${token}/cotizacion/rechazar`).then(u),
  cancelarTurno: (token: string, motivo?: string) =>
    client.delete(`/public/turnos/${token}`, { params: { motivo } }),
}

// Panel interno
export const empresaApi = {
  listar:          () => client.get<ApiResponse<PageResponse<Empresa>>>('/empresas').then(u),
  obtener:         (id: string) => client.get<ApiResponse<Empresa>>(`/empresas/${id}`).then(u),
  crear:           (b: Partial<Empresa>) => client.post<ApiResponse<Empresa>>('/empresas', b).then(u),
  actualizar:      (id: string, b: Partial<Empresa>) => client.put<ApiResponse<Empresa>>(`/empresas/${id}`, b).then(u),
  actualizarConfig:(id: string, c: Partial<EmpresaConfig>) => client.put<ApiResponse<Empresa>>(`/empresas/${id}/config`, c).then(u),
}

export const servicioApi = {
  listar:        (eid: string) => client.get<ApiResponse<PageResponse<Servicio>>>(`/empresas/${eid}/servicios`, { params: { size: 100 } }).then(u),
  crear:         (eid: string, b: Partial<Servicio>) => client.post<ApiResponse<Servicio>>(`/empresas/${eid}/servicios`, b).then(u),
  actualizar:    (eid: string, sid: string, b: Partial<Servicio>) => client.put<ApiResponse<Servicio>>(`/empresas/${eid}/servicios/${sid}`, b).then(u),
  alternarEstado:(eid: string, sid: string, activo: boolean) => client.patch(`/empresas/${eid}/servicios/${sid}/estado`, null, { params: { activo } }),
}

export const turnoApi = {
  listar:        (eid: string, p?: { estado?: TurnoEstado; fecha?: string; page?: number; size?: number }) =>
                   client.get<ApiResponse<PageResponse<TurnoSummary>>>(`/empresas/${eid}/turnos`, { params: p }).then(u),
  obtener:       (eid: string, tid: string) => client.get<ApiResponse<Turno>>(`/empresas/${eid}/turnos/${tid}`).then(u),
  cambiarEstado: (eid: string, tid: string, b: { nuevoEstado: TurnoEstado; observaciones?: string }) =>
                   client.patch<ApiResponse<Turno>>(`/empresas/${eid}/turnos/${tid}/estado`, b).then(u),
  crearCotizacion:(eid: string, tid: string, b: object) =>
                   client.post<ApiResponse<Turno>>(`/empresas/${eid}/turnos/${tid}/cotizacion`, b).then(u),
  actualizarCotizacion:(eid: string, tid: string, b: object) =>
                   client.put<ApiResponse<Turno>>(`/empresas/${eid}/turnos/${tid}/cotizacion`, b).then(u),
  registrarSenia:(eid: string, tid: string, b: object) =>
                   client.post<ApiResponse<Turno>>(`/empresas/${eid}/turnos/${tid}/senia`, b).then(u),
  finalizar:     (eid: string, tid: string) =>
                   client.post<ApiResponse<Turno>>(`/empresas/${eid}/turnos/${tid}/finalizar`).then(u),
  reprogramar:   (eid: string, tid: string, b: object) =>
                   client.put<ApiResponse<Turno>>(`/empresas/${eid}/turnos/${tid}/reprogramar`, b).then(u),
  cancelar:      (eid: string, tid: string, motivo?: string) =>
                   client.delete(`/empresas/${eid}/turnos/${tid}`, { params: { motivo } }),
}

export const agendaApi = {
  calendario:    (eid: string, fecha: string, vista = 'SEMANA') =>
                   client.get<ApiResponse<{ fecha: string; turnos: TurnoSummary[]; bloqueos: Bloqueo[] }>>(`/empresas/${eid}/agenda/calendario`, { params: { fecha, vista } }).then(u),
  crearBloqueo:  (eid: string, b: object) => client.post<ApiResponse<Bloqueo>>(`/empresas/${eid}/agenda/bloqueos`, b).then(u),
  eliminarBloqueo:(eid: string, bid: string) => client.delete(`/empresas/${eid}/agenda/bloqueos/${bid}`),
  disponibilidad:(eid: string, fecha: string, servicioId?: string) =>
                   client.get<ApiResponse<{ fecha: string; slots: SlotDisponible[] }>>(`/empresas/${eid}/agenda/disponibilidad`, { params: { fecha, servicioId } }).then(u),
}

export const reporteApi = {
  dashboard: (eid: string, p?: object) => client.get<ApiResponse<Dashboard>>(`/empresas/${eid}/reportes/dashboard`, { params: p }).then(u),
  servicios:  (eid: string, p: object) => client.get<ApiResponse<ServicioStat[]>>(`/empresas/${eid}/reportes/servicios`, { params: p }).then(u),
  exportar:   (eid: string, p: object) => client.get(`/empresas/${eid}/reportes/export`, { params: p, responseType: 'blob' }),
}
