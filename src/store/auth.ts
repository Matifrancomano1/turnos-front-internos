// src/store/auth.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '@/types'

interface AuthState {
  usuario: Usuario | null
  accessToken: string | null
  refreshToken: string | null
  empresaId: string | null
  setAuth: (u: Usuario, at: string, rt: string) => void
  logout: () => void
  isAuth: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null, accessToken: null, refreshToken: null, empresaId: null,
      setAuth: (usuario, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        set({ usuario, accessToken, refreshToken, empresaId: usuario.empresaId ?? null })
      },
      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ usuario: null, accessToken: null, refreshToken: null, empresaId: null })
      },
      isAuth: () => !!get().accessToken,
    }),
    { name: 'auth', partialize: (s) => ({ usuario: s.usuario, accessToken: s.accessToken, refreshToken: s.refreshToken, empresaId: s.empresaId }) }
  )
)
