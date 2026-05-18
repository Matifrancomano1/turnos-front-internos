// src/schemas/ts-validators.ts

export interface ValidationResult {
  isValid: boolean
  message?: string
}

/**
 * Valida el nombre de la empresa.
 */
export function validarNombreEmpresa(nombre: string): ValidationResult {
  if (!nombre || nombre.trim() === '') {
    return { isValid: false, message: 'El nombre de la empresa es requerido' }
  }
  if (nombre.length > 150) {
    return { isValid: false, message: 'El nombre no puede superar los 150 caracteres' }
  }
  return { isValid: true }
}

/**
 * Valida la URL pública (slug) de una empresa.
 * Formato estricto: Solo letras minúsculas, números y guiones medios.
 * Sin puntos, espacios ni mayúsculas.
 */
export function validarSlugEmpresa(slug: string): ValidationResult {
  if (!slug || slug.trim() === '') {
    return { isValid: false, message: 'La URL pública (slug) es requerida' }
  }
  if (slug.length > 100) {
    return { isValid: false, message: 'El slug no puede superar los 100 caracteres' }
  }
  const regex = /^[a-z0-9\-]+$/
  if (!regex.test(slug)) {
    return {
      isValid: false,
      message: 'Solo se permiten letras minúsculas, números y guiones medios (sin puntos, espacios ni mayúsculas)',
    }
  }
  return { isValid: true }
}

/**
 * Valida el correo electrónico de contacto o acceso.
 */
export function validarEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, message: 'El correo electrónico es requerido' }
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Debe ingresar un formato de correo electrónico válido' }
  }
  return { isValid: true }
}

/**
 * Valida que la duración de slot sea válida y múltiplo de 15.
 */
export function validarDuracionSlot(minutos: number): ValidationResult {
  if (isNaN(minutos) || minutos <= 0) {
    return { isValid: false, message: 'La duración debe ser un número entero positivo' }
  }
  if (!Number.isInteger(minutos)) {
    return { isValid: false, message: 'La duración debe ser un número entero' }
  }
  if (minutos % 15 !== 0) {
    return { isValid: false, message: 'La duración del slot debe ser obligatoriamente un múltiplo de 15 (ej: 15, 30, 45, 60)' }
  }
  return { isValid: true }
}

/**
 * Valida que una hora de cierre sea estrictamente posterior a la de apertura.
 * Horas en formato HH:mm.
 */
export function validarRangoHorario(apertura: string, cierre: string): ValidationResult {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(apertura)) {
    return { isValid: false, message: 'Formato de hora de apertura inválido. Usa HH:mm' }
  }
  if (!timeRegex.test(cierre)) {
    return { isValid: false, message: 'Formato de hora de cierre inválido. Usa HH:mm' }
  }
  const [ah, am] = apertura.split(':').map(Number)
  const [ch, cm] = cierre.split(':').map(Number)
  
  if (ch * 60 + cm <= ah * 60 + am) {
    return { isValid: false, message: 'El horario de cierre debe ser estrictamente posterior al de apertura' }
  }
  return { isValid: true }
}

/**
 * Valida el nombre completo de un usuario.
 */
export function validarNombreUsuario(nombre: string): ValidationResult {
  if (!nombre || nombre.trim() === '') {
    return { isValid: false, message: 'El nombre completo es requerido' }
  }
  if (nombre.length > 100) {
    return { isValid: false, message: 'El nombre completo no puede superar los 100 caracteres' }
  }
  return { isValid: true }
}

/**
 * Valida la robustez de la contraseña del usuario.
 */
export function validarPassword(password: string): ValidationResult {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'La contraseña debe tener al menos 8 caracteres' }
  }
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasDigit = /[0-9]/.test(password)
  const hasSpecial = /[@$!%*?&]/.test(password)

  if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
    return {
      isValid: false,
      message: 'Debe incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial (@$!%*?&)',
    }
  }
  return { isValid: true }
}

/**
 * Valida el formato y longitud del teléfono.
 * Solo números y prefijo '+' al inicio. Máximo 30 caracteres.
 */
export function validarTelefono(telefono?: string): ValidationResult {
  if (!telefono || telefono.trim() === '') {
    return { isValid: true } // Opcional
  }
  if (telefono.length > 30) {
    return { isValid: false, message: 'El teléfono no puede superar los 30 caracteres' }
  }
  const regex = /^\+?[0-9]+$/
  if (!regex.test(telefono)) {
    return { isValid: false, message: 'El teléfono solo permite números y opcionalmente el prefijo "+"' }
  }
  return { isValid: true }
}

/**
 * Valida el nombre de un servicio.
 */
export function validarNombreServicio(nombre: string): ValidationResult {
  if (!nombre || nombre.trim() === '') {
    return { isValid: false, message: 'El nombre del servicio es requerido' }
  }
  if (nombre.length > 150) {
    return { isValid: false, message: 'El nombre del servicio no puede superar los 150 caracteres' }
  }
  return { isValid: true }
}

/**
 * Valida el precio base de un servicio.
 */
export function validarPrecioBase(precio: number): ValidationResult {
  if (isNaN(precio)) {
    return { isValid: false, message: 'El precio debe ser un valor numérico' }
  }
  if (precio < 0) {
    return { isValid: false, message: 'El precio base no puede ser negativo' }
  }
  return { isValid: true }
}

/**
 * Valida la duración estimada de un servicio.
 */
export function validarDuracionEstimada(minutos: number): ValidationResult {
  if (isNaN(minutos) || minutos <= 0) {
    return { isValid: false, message: 'La duración debe ser un número entero mayor a 0' }
  }
  if (!Number.isInteger(minutos)) {
    return { isValid: false, message: 'La duración debe ser un número entero' }
  }
  return { isValid: true }
}
