// src/pages/panel/LoginPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/api/client'
import { useAuthStore } from '@/store/auth'
import { Spinner } from '@/components/ui'
import { toast } from 'sonner'
import { Eye, EyeOff, CalendarCheck } from 'lucide-react'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })
type F = z.infer<typeof schema>

export default function LoginPage() {
  const nav = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)
  const [show, setShow] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) })

  const onSubmit = async (d: F) => {
    try {
      const res = await authApi.login(d)
      setAuth(res.usuario, res.accessToken, res.refreshToken)
      nav('/panel/dashboard')
    } catch (e: any) {
      toast.error(e?.message ?? 'Credenciales incorrectas')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      className="animate-fade-in">
      {/* Subtle dot grid */}
      <div style={{ position: 'fixed', inset: 0, opacity: .04, backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 380, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, background: 'var(--blue)', borderRadius: 14, marginBottom: 16 }}>
            <CalendarCheck size={26} strokeWidth={1.75} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>TurnoApp</h1>
          <p style={{ color: '#93C5FD', fontSize: 13, marginTop: 4 }}>Panel de gestión</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 'var(--radius-l)', padding: 24 }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Email</label>
              <input {...register('email')} type="email" placeholder="operador@empresa.com"
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 'var(--radius)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
              {errors.email && <p style={{ fontSize: 11, color: '#F87171', marginTop: 3 }}>Email inválido</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input {...register('password')} type={show ? 'text' : 'password'} placeholder="••••••••"
                  style={{ width: '100%', padding: '10px 38px 10px 12px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 'var(--radius)', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                <button type="button" onClick={() => setShow(!show)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 11, color: '#F87171', marginTop: 3 }}>Requerido</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px 0', marginTop: 4 }}>
              {isSubmitting ? <Spinner className="w-4 h-4 text-white" /> : 'Ingresar al panel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
