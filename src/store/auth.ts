// src/store/auth.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '@/types'

interface AuthState {
  usuario: Usuario | null
  accessToken: string | null
  refreshToken: string | null
  empresaId: string | null
  // Impersonación: datos originales del SuperAdmin antes de impersonar
  originalToken: string | null
  isImpersonating: boolean
  setAuth: (u: Usuario, at: string, rt: string) => void
  updateUsuario: (u: Usuario) => void
  logout: () => void
  isAuth: () => boolean
  impersonate: (eid: string | null) => void
  /** Inicia impersonación: guarda el token original y activa el token temporal */
  startImpersonation: (tempToken: string, empresaId: string) => void
  /** Vuelve a la sesión original del SuperAdmin */
  stopImpersonation: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      accessToken: null,
      refreshToken: null,
      empresaId: null,
      originalToken: null,
      isImpersonating: false,

      setAuth: (usuario, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        set({ usuario, accessToken, refreshToken, empresaId: usuario.empresaId ?? null })
      },

      updateUsuario: (usuario) => set({ usuario, empresaId: usuario.empresaId ?? null }),

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({
          usuario: null, accessToken: null, refreshToken: null,
          empresaId: null, originalToken: null, isImpersonating: false,
        })
      },

      isAuth: () => !!get().accessToken,

      impersonate: (empresaId) => set({ empresaId }),

      startImpersonation: (tempToken, empresaId) => {
        const prev = get().accessToken
        localStorage.setItem('accessToken', tempToken)
        set({ originalToken: prev, accessToken: tempToken, empresaId, isImpersonating: true })
      },

      stopImpersonation: () => {
        const original = get().originalToken
        if (original) {
          localStorage.setItem('accessToken', original)
          set({ accessToken: original, originalToken: null, empresaId: null, isImpersonating: false })
        }
      },
    }),
    {
      name: 'auth',
      partialize: (s) => ({
        usuario: s.usuario,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        empresaId: s.empresaId,
        originalToken: s.originalToken,
        isImpersonating: s.isImpersonating,
      }),
    }
  )
)
