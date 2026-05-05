// src/schemas/empresa.schema.ts
import { z } from 'zod'

const HH_MM_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

export const empresaConfigSchema = z
  .object({
    horaApertura: z
      .string()
      .regex(HH_MM_REGEX, 'Formato inválido. Usa HH:mm (ej: 09:00)'),
    horaCierre: z
      .string()
      .regex(HH_MM_REGEX, 'Formato inválido. Usa HH:mm (ej: 18:00)'),
    duracionSlotMinutos: z.coerce
      .number()
      .refine((v) => [15, 30, 45, 60].includes(v), {
        message: 'El slot debe ser 15, 30, 45 o 60 minutos',
      }),
    sabadoHabilitado: z.boolean(),
    domingoHabilitado: z.boolean(),
  })
  .refine(
    (d) => {
      // horaCierre debe ser posterior a horaApertura
      const [ah, am] = d.horaApertura.split(':').map(Number)
      const [ch, cm] = d.horaCierre.split(':').map(Number)
      return ch * 60 + cm > ah * 60 + am
    },
    {
      message: 'El horario de cierre debe ser posterior al de apertura',
      path: ['horaCierre'],
    }
  )

export type EmpresaConfigFormData = z.infer<typeof empresaConfigSchema>

// ── Datos Base de Empresa ─────────────────────────────────────────────────────
export const empresaDataSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  emailContacto: z.string().email('Email inválido'),
  direccion: z.string().min(3, 'La dirección es requerida'),
  telefono: z.string().min(6, 'El teléfono es requerido'),
  slug: z.string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  activa: z.boolean(),
})

export type EmpresaDataFormData = z.infer<typeof empresaDataSchema>

