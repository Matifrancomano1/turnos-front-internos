// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { TurnoEstado } from '@/types'

export const cn = (...i: ClassValue[]) => twMerge(clsx(i))

export const fmt$ = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export const fmtDate = (s: string) => {
  const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`
}

export const fmtDateTime = (s: string) =>
  new Date(s).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export const ESTADO_LABEL: Record<TurnoEstado, string> = {
  SOLICITADO: 'Solicitado', EN_COTIZACION: 'En cotización', COTIZADO: 'Cotizado',
  CONFIRMADO: 'Confirmado', PROGRAMADO: 'Programado', FINALIZADO: 'Finalizado', CANCELADO: 'Cancelado',
}

export const ESTADO_CLASS: Record<TurnoEstado, string> = {
  SOLICITADO: 'badge-solicitado', EN_COTIZACION: 'badge-cotizacion', COTIZADO: 'badge-cotizado',
  CONFIRMADO: 'badge-confirmado', PROGRAMADO: 'badge-programado', FINALIZADO: 'badge-finalizado', CANCELADO: 'badge-cancelado',
}

export const ESTADO_FC_COLOR: Record<TurnoEstado, string> = {
  SOLICITADO: '#94A3B8', EN_COTIZACION: '#D97706', COTIZADO: '#7C3AED',
  CONFIRMADO: '#2563EB', PROGRAMADO: '#059669', FINALIZADO: '#64748B', CANCELADO: '#DC2626',
}

export const NEXT_STATES: Partial<Record<TurnoEstado, TurnoEstado[]>> = {
  SOLICITADO:    ['EN_COTIZACION', 'CANCELADO'],
  EN_COTIZACION: ['COTIZADO', 'CANCELADO'],
  COTIZADO:      ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO:    ['PROGRAMADO', 'CANCELADO'],
  PROGRAMADO:    ['FINALIZADO', 'CANCELADO'],
}
