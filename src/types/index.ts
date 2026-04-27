// src/types/index.ts
export type Rol = 'CLIENTE' | 'OPERADOR' | 'ADMIN'

export type TurnoEstado =
  | 'SOLICITADO' | 'EN_COTIZACION' | 'COTIZADO'
  | 'CONFIRMADO' | 'PROGRAMADO' | 'FINALIZADO' | 'CANCELADO'

export type CotizacionEstado = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA'

// ── Auth ─────────────────────────────────────────────────────────────────────
export interface Usuario { id: string; nombre: string; email: string; telefono?: string; rol: Rol; empresaId?: string; activo: boolean; creadoEn: string }
export interface AuthResponse { accessToken: string; refreshToken: string; expiresIn: number; usuario: Usuario }
export interface LoginRequest { email: string; password: string }

// ── Empresa ───────────────────────────────────────────────────────────────────
export interface EmpresaConfig { horaApertura: string; horaCierre: string; duracionSlotMinutos: number; sabadoHabilitado: boolean; domingoHabilitado: boolean }
export interface Empresa { id: string; nombre: string; slug: string; emailContacto: string; direccion: string; telefono: string; config: EmpresaConfig; activa: boolean; creadoEn: string }

// ── Servicio ──────────────────────────────────────────────────────────────────
export interface Servicio { id: string; nombre: string; descripcion?: string; precioBase: number; duracionEstimadaMinutos: number; activo: boolean }

// ── Solicitud pública (sin auth) ──────────────────────────────────────────────
export interface SolicitudPublicaRequest {
  nombreCliente: string
  email: string
  whatsapp: string
  servicioId: string
  fechaPreferida: string
  horaPreferida: string
  descripcion?: string
}

export interface SolicitudPublicaResponse {
  turnoId: string
  tokenAcceso: string   // token único para /turno/:token
  estado: TurnoEstado
  nombreCliente: string
  servicio: string
  mensaje: string
}

// ── Turno ─────────────────────────────────────────────────────────────────────
export interface TurnoHistorialItem { estadoAnterior: TurnoEstado | null; estadoNuevo: TurnoEstado; motivo?: string; cambiadoPor: string; timestamp: string }
export interface Cotizacion { id: string; precio: number; duracionMinutos: number; descripcion?: string; estado: CotizacionEstado; fechaPropuesta?: string; horaPropuesta?: string; creadoEn: string }
export interface Senia { id: string; monto: number; metodoPago: string; referencia?: string; registradoEn: string }

export interface Turno {
  id: string; empresaId: string
  cliente: { id?: string; nombre: string; email: string; whatsapp?: string }
  servicio: Servicio
  fechaSolicitada: string; horaSolicitada: string
  fechaConfirmada?: string; horaConfirmada?: string
  estado: TurnoEstado; descripcion?: string
  cotizacion?: Cotizacion; senia?: Senia
  historial: TurnoHistorialItem[]
  tokenAcceso?: string
  creadoEn: string; actualizadoEn: string
}

export interface TurnoSummary { id: string; fecha?: string; hora?: string; estado: TurnoEstado; nombreCliente: string; nombreServicio: string; email?: string; whatsapp?: string }

// ── Agenda ────────────────────────────────────────────────────────────────────
export interface SlotDisponible { fecha: string; hora: string; disponible: boolean }
export interface Bloqueo { id: string; fecha: string; horaInicio: string; horaFin: string; motivo: string; creadoPor: string; creadoEn: string }

// ── Reportes ──────────────────────────────────────────────────────────────────
export interface ServicioStat { nombre: string; cantidad: number; ingresoTotal: number }
export interface Dashboard { turnosHoy: number; turnosMes: number; turnosCancelados: number; tasaCancelacion: number; ingresosEstimados: number; topServicios: ServicioStat[] }

// ── API ───────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> { status: string; message?: string; data: T; timestamp: string }
export interface PageResponse<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; last: boolean }
