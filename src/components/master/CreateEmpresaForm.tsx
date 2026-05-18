// src/components/master/CreateEmpresaForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { masterApi } from '@/api/client'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui'

const schema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  slug:   z.string().min(3, 'Mínimo 3 caracteres').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  emailAdmin: z.string().email('Email inválido'),
  passwordAdmin: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSuccess: () => void
  onCancel: () => void
}

export default function CreateEmpresaForm({ onSuccess, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await masterApi.crearEmpresa(data)
      toast.success('Empresa creada correctamente')
      onSuccess()
    } catch (e: any) {
      toast.error(e?.message ?? 'Error al crear la empresa')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Nueva Empresa</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="form-label">Nombre de la Empresa</label>
          <input {...register('nombre')} className={`form-input ${errors.nombre ? 'error' : ''}`} placeholder="Mi Negocio S.A." />
          {errors.nombre && <p className="form-error">{errors.nombre.message}</p>}
        </div>

        <div>
          <label className="form-label">Slug (URL)</label>
          <input {...register('slug')} className={`form-input ${errors.slug ? 'error' : ''}`} placeholder="mi-negocio" />
          <p className="form-hint">Se usará como: flowtech.com/solicitar/mi-negocio</p>
          {errors.slug && <p className="form-error">{errors.slug.message}</p>}
        </div>

        <div style={{ padding: '16px 0', borderTop: '1px solid var(--gray-m)', marginTop: 8 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', marginBottom: 12 }}>Cuenta Administrador</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="form-label">Email Admin</label>
              <input {...register('emailAdmin')} className={`form-input ${errors.emailAdmin ? 'error' : ''}`} placeholder="admin@empresa.com" />
              {errors.emailAdmin && <p className="form-error">{errors.emailAdmin.message}</p>}
            </div>
            <div>
              <label className="form-label">Password Admin</label>
              <input {...register('passwordAdmin')} type="password" className={`form-input ${errors.passwordAdmin ? 'error' : ''}`} placeholder="••••••••" />
              {errors.passwordAdmin && <p className="form-error">{errors.passwordAdmin.message}</p>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="w-4 h-4 text-white" /> : 'Crear Empresa'}
          </button>
        </div>
      </div>
    </form>
  )
}
