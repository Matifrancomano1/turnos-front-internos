import { useState } from 'react'
import { Building2, Plus, Loader2 } from 'lucide-react'
import { useEmpresas } from '@/hooks/useSuperAdmin'
import { EmpresaRow } from './components/EmpresaRow'
import { NuevaEmpresaModal } from './components/NuevaEmpresaModal'

export default function EmpresasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: response, isLoading, isError } = useEmpresas()

  const empresas = response || []

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Gestión de Empresas</h1>
          <p style={{ color: 'var(--text-m)', fontSize: 14, marginTop: 2 }}>
            {empresas.length} organizaciones registradas en la plataforma.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
          style={{ padding: '10px 18px' }}
        >
          <Plus size={16} />
          Nueva Empresa
        </button>
      </div>

      {/* Table Container */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Contacto</th>
              <th>Estado</th>
              <th>Registro</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-m)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Loader2 size={24} className="animate-spin text-blue-500" />
                    <span style={{ fontSize: 13 }}>Cargando empresas...</span>
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--red)' }}>
                  Ocurrió un error al cargar las empresas.
                </td>
              </tr>
            ) : empresas.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-m)' }}>
                  No hay empresas registradas aún.
                </td>
              </tr>
            ) : (
              empresas.map((emp: any) => (
                <EmpresaRow key={emp.id} empresa={emp} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <NuevaEmpresaModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}
