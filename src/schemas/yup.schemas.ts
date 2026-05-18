// src/schemas/yup.schemas.ts
import * as yup from 'yup'

const HH_MM_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
const PHONE_REGEX = /^\+?[0-9]{1,30}$/
const SLUG_REGEX = /^[a-z0-9\-]+$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/

// ── 1. GESTIÓN DE EMPRESAS ──────────────────────────────────────────────
export const empresaYupSchema = yup.object().shape({
  nombre: yup
    .string()
    .required('El nombre de la empresa es requerido')
    .max(150, 'El nombre no puede superar los 150 caracteres'),
  slug: yup
    .string()
    .required('La URL pública (slug) es requerida')
    .max(100, 'El slug no puede superar los 100 caracteres')
    .matches(SLUG_REGEX, 'Formato inválido: solo letras minúsculas, números y guiones medios (sin puntos, espacios ni mayúsculas)'),
  emailContacto: yup
    .string()
    .required('El email de contacto es requerido')
    .email('Debe ingresar un formato de correo electrónico válido'),
  duracionSlot: yup
    .number()
    .typeError('La duración debe ser un número')
    .integer('La duración debe ser un número entero')
    .positive('La duración del slot debe ser mayor a 0 minutos')
    .required('La duración del slot es requerida')
    .test(
      'is-multiple-of-15',
      'La duración del slot debe ser obligatoriamente un múltiplo de 15 (ej: 15, 30, 45, 60)',
      (val?: number) => val !== undefined && val % 15 === 0
    ),
  horaApertura: yup
    .string()
    .required('La hora de apertura es requerida')
    .matches(HH_MM_REGEX, 'Formato de hora inválido. Usa HH:mm (ej: 09:00)'),
  horaCierre: yup
    .string()
    .required('La hora de cierre es requerida')
    .matches(HH_MM_REGEX, 'Formato de hora inválido. Usa HH:mm (ej: 18:00)')
    .test(
      'cierre-posterior',
      'El horario de cierre debe ser estrictamente posterior al de apertura',
      function (this: any, horaCierre?: string) {
        const { horaApertura } = this.parent
        if (!horaApertura || !horaCierre) return true
        const [ah, am] = horaApertura.split(':').map(Number)
        const [ch, cm] = horaCierre.split(':').map(Number)
        return ch * 60 + cm > ah * 60 + am
      }
    ),
})

// ── 2. GESTIÓN DE USUARIOS ──────────────────────────────────────────────
export const usuarioYupSchema = yup.object().shape({
  nombreCompleto: yup
    .string()
    .required('El nombre completo es requerido')
    .max(100, 'El nombre completo no puede superar los 100 caracteres'),
  emailAcceso: yup
    .string()
    .required('El email de acceso es requerido')
    .email('Debe ingresar un formato de correo electrónico válido'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      PASSWORD_REGEX,
      'Debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)'
    ),
  telefono: yup
    .string()
    .max(30, 'El teléfono no puede superar los 30 caracteres')
    .matches(PHONE_REGEX, {
      message: 'Solo números y opcionalmente prefijo "+"',
      excludeEmptyString: true,
    })
    .nullable(),
})

// ── 3. SERVICIOS Y TURNOS ─────────────────────────────────────────────
export const servicioYupSchema = yup.object().shape({
  nombreServicio: yup
    .string()
    .required('El nombre del servicio es requerido')
    .max(150, 'El nombre no puede superar los 150 caracteres'),
  precioBase: yup
    .number()
    .typeError('El precio debe ser un valor numérico')
    .min(0, 'El precio base no puede ser negativo')
    .required('El precio base es requerido'),
  duracionEstimada: yup
    .number()
    .typeError('La duración debe ser un número')
    .integer('La duración debe ser un número entero')
    .positive('La duración debe ser mayor a 0')
    .required('La duración es requerida'),
})

export const bloqueoAgendaYupSchema = yup.object().shape({
  horaInicio: yup
    .string()
    .required('La hora de inicio es requerida')
    .matches(HH_MM_REGEX, 'Formato inválido. Usa HH:mm'),
  horaFin: yup
    .string()
    .required('La hora de fin es requerida')
    .matches(HH_MM_REGEX, 'Formato inválido. Usa HH:mm')
    .test(
      'fin-posterior',
      'La hora de fin debe ser estrictamente posterior a la de inicio',
      function (this: any, horaFin?: string) {
        const { horaInicio } = this.parent
        if (!horaInicio || !horaFin) return true
        const [sh, sm] = horaInicio.split(':').map(Number)
        const [eh, em] = horaFin.split(':').map(Number)
        return eh * 60 + em > sh * 60 + sm
      }
    ),
})
