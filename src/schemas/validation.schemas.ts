// src/schemas/validation.schemas.ts
import { z } from 'zod'

const HH_MM_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
const PHONE_REGEX = /^\+?[0-9]{1,30}$/
const SLUG_REGEX = /^[a-z0-9\-]+$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/

// ── 1. GESTIÓN DE EMPRESAS ──────────────────────────────────────────────
export const empresaSchema = z
  .object({
    nombre: z
      .string({ required_error: 'El nombre de la empresa es requerido' })
      .min(1, 'El nombre de la empresa es requerido')
      .max(150, 'El nombre no puede superar los 150 caracteres'),
    slug: z
      .string({ required_error: 'La URL pública (slug) es requerida' })
      .min(1, 'La URL pública (slug) es requerida')
      .max(100, 'El slug no puede superar los 100 caracteres')
      .regex(SLUG_REGEX, 'Formato inválido: solo letras minúsculas, números y guiones medios (sin puntos, espacios ni mayúsculas)'),
    emailContacto: z
      .string({ required_error: 'El email de contacto es requerido' })
      .min(1, 'El email de contacto es requerido')
      .email('Debe ingresar un formato de correo electrónico válido'),
    duracionSlot: z.coerce
      .number({ invalid_type_error: 'La duración debe ser un número entero' })
      .int('La duración debe ser un número entero')
      .positive('La duración del slot debe ser mayor a 0 minutos')
      .refine((val) => val % 15 === 0, {
        message: 'La duración del slot debe ser obligatoriamente un múltiplo de 15 (ej: 15, 30, 45, 60)',
      }),
    horaApertura: z
      .string({ required_error: 'La hora de apertura es requerida' })
      .regex(HH_MM_REGEX, 'Formato de hora inválido. Usa HH:mm (ej: 09:00)'),
    horaCierre: z
      .string({ required_error: 'La hora de cierre es requerida' })
      .regex(HH_MM_REGEX, 'Formato de hora inválido. Usa HH:mm (ej: 18:00)'),
  })
  .refine(
    (data) => {
      const [ah, am] = data.horaApertura.split(':').map(Number)
      const [ch, cm] = data.horaCierre.split(':').map(Number)
      return ch * 60 + cm > ah * 60 + am
    },
    {
      message: 'El horario de cierre debe ser estrictamente posterior al de apertura',
      path: ['horaCierre'],
    }
  )

export type EmpresaFormData = z.infer<typeof empresaSchema>

// ── 2. GESTIÓN DE USUARIOS ──────────────────────────────────────────────
export const usuarioSchema = z.object({
  nombreCompleto: z
    .string({ required_error: 'El nombre completo es requerido' })
    .min(1, 'El nombre completo es requerido')
    .max(100, 'El nombre completo no puede superar los 100 caracteres'),
  emailAcceso: z
    .string({ required_error: 'El email de acceso es requerido' })
    .min(1, 'El email de acceso es requerido')
    .email('Debe ingresar un formato de correo electrónico válido'),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener un mínimo de 8 caracteres')
    .regex(
      PASSWORD_REGEX,
      'Debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)'
    ),
  telefono: z
    .string()
    .max(30, 'El teléfono no puede superar los 30 caracteres')
    .regex(PHONE_REGEX, 'El teléfono solo permite números y opcionalmente el prefijo "+"')
    .optional()
    .or(z.literal('')),
})

export type UsuarioFormData = z.infer<typeof usuarioSchema>

// ── 3. SERVICIOS Y TURNOS ─────────────────────────────────────────────
export const servicioSchema = z.object({
  nombreServicio: z
    .string({ required_error: 'El nombre del servicio es requerido' })
    .min(1, 'El nombre del servicio es requerido')
    .max(150, 'El nombre no puede superar los 150 caracteres'),
  precioBase: z.coerce
    .number({ invalid_type_error: 'El precio debe ser un valor numérico' })
    .min(0, 'El precio base no puede ser negativo'),
  duracionEstimada: z.coerce
    .number({ invalid_type_error: 'La duración debe ser un número entero' })
    .int('La duración debe ser un número entero')
    .positive('La duración debe ser mayor a 0 minutos'),
})

export type ServicioFormData = z.infer<typeof servicioSchema>

export const bloqueoAgendaSchema = z
  .object({
    horaInicio: z
      .string({ required_error: 'La hora de inicio es requerida' })
      .regex(HH_MM_REGEX, 'Formato inválido. Usa HH:mm'),
    horaFin: z
      .string({ required_error: 'La hora de fin es requerida' })
      .regex(HH_MM_REGEX, 'Formato inválido. Usa HH:mm'),
  })
  .refine(
    (data) => {
      const [sh, sm] = data.horaInicio.split(':').map(Number)
      const [eh, em] = data.horaFin.split(':').map(Number)
      return eh * 60 + em > sh * 60 + sm
    },
    {
      message: 'La hora de fin debe ser estrictamente posterior a la de inicio',
      path: ['horaFin'],
    }
  )

export type BloqueoAgendaFormData = z.infer<typeof bloqueoAgendaSchema>
