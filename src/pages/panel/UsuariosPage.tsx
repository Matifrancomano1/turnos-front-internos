// src/pages/panel/UsuariosPage.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, User, Mail, Phone, Shield, Trash2, Edit2, Users } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { usuarioApi } from '@/api/client'
import { Spinner, EmptyState } from '@/components/ui'
import { RoleGuard } from '@/components/auth/RoleGuard'

const userSchema = z.object({
  nombre: z.string().min(2, 'Min. 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Min. 6 caracteres'),
  telefono: z.string().optional(),
  rol: z.enum(['ADMIN', 'OPERADOR']),
})

type UserFormData = z.infer<typeof userSchema>

export default function UsuariosPage() {
  const { empresaId } = useAuthStore()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data: resp, isLoading } = useQuery({
    queryKey: ['usuarios', empresaId],
    queryFn: () => usuarioApi.listar(empresaId!),
    enabled: !!empresaId,
  })

  const crearMut = useMutation({
    mutationFn: (data: UserFormData) => usuarioApi.crear(empresaId!, data),
    onSuccess: () => {
      toast.success('Usuario creado con éxito')
      qc.invalidateQueries({ queryKey: ['usuarios', empresaId] })
      setShowForm(false)
      reset()
    },
    onError: (e: any) => {
      toast.error(e?.message ?? 'Error al crear el usuario')
    }
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { rol: 'OPERADOR' }
  })

  const usuarios = resp?.content ?? []

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Gestión de Usuarios</h2>
          <p style={{ color: 'var(--text-m)', fontSize: 13, marginTop: 2 }}>
            Administrá el acceso del personal de tu empresa.
          </p>
        </div>
        <RoleGuard roles={['ADMIN']}>
          <button
            onClick={() => { setShowForm(!showForm); reset() }}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            {showForm ? 'Volver a la lista' : <><Plus size={16} /> Nuevo usuario</>}
          </button>
        </RoleGuard>
      </div>

      {showForm ? (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-l)', border: '1px solid var(--gray-m)', padding: 24, maxWidth: 600 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Crear Nuevo Usuario</h3>
          <form onSubmit={handleSubmit((d) => crearMut.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label">Nombre completo *</label>
              <input {...register('nombre')} className="form-input" placeholder="Ej: Juan Pérez" />
              {errors.nombre && <p className="form-error">{errors.nombre.message}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">Email (Acceso) *</label>
                <input {...register('email')} type="email" className="form-input" placeholder="usuario@gmail.com" />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>
              <div>
                <label className="form-label">Contraseña *</label>
                <input {...register('password')} type="password" className="form-input" placeholder="••••••••" />
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">Teléfono</label>
                <input {...register('telefono')} className="form-input" placeholder="+54 11 1234 5678" />
                {errors.telefono && <p className="form-error">{errors.telefono.message}</p>}
              </div>
              <div>
                <label className="form-label">Rol de sistema *</label>
                <select {...register('rol')} className="form-input">
                  <option value="OPERADOR">OPERADOR (Gestión de turnos)</option>
                  <option value="ADMIN">ADMIN (Acceso total)</option>
                </select>
                {errors.rol && <p className="form-error">{errors.rol.message}</p>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={crearMut.isPending}>
                {crearMut.isPending ? <Spinner className="w-4 h-4" /> : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-l)', border: '1px solid var(--gray-m)', overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div>
          ) : usuarios.length === 0 ? (
            <EmptyState icon={Users} title="No hay usuarios" desc="Agregá personal para que puedan gestionar la agenda." />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Contacto</th>
                  <th>Rol</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u: any) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gray-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-m)' }}>
                          <User size={16} />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{u.nombre}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, color: 'var(--text-m)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={12} /> {u.email}</span>
                        {u.telefono && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={12} /> {u.telefono}</span>}
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: u.rol === 'ADMIN' ? 'var(--blue-l)' : 'var(--gray-l)', color: u.rol === 'ADMIN' ? 'var(--blue)' : 'var(--text-m)', padding: '4px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '.05em' }}>
                        <Shield size={10} /> {u.rol}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-m)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.activo ? 'var(--green)' : 'var(--red)' }} />
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
