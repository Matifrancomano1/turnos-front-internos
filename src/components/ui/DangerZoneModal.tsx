// src/components/ui/DangerZoneModal.tsx
import React, { useState } from 'react'
import { ShieldAlert, Trash2, X } from 'lucide-react'
import { Spinner } from '@/components/ui'

interface DangerZoneModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  entityName: string
  entityType: 'Empresa' | 'Servicio' | 'Usuario' | 'Turno'
  isCritical?: boolean // true para borrar una Empresa
  isPending?: boolean
}

export const DangerZoneModal: React.FC<DangerZoneModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  entityType,
  isCritical = false,
  isPending = false,
}) => {
  const [step, setStep] = useState<1 | 2>(1)
  const [confirmInput, setConfirmInput] = useState('')

  if (!isOpen) return null

  const handleClose = () => {
    setStep(1)
    setConfirmInput('')
    onClose()
  }

  const isConfirmed = isCritical 
    ? confirmInput.trim() === entityName.trim()
    : true

  return (
    <div className="modal-overlay" style={{ zIndex: 999 }} onClick={handleClose}>
      <div 
        className="modal animate-fade-in" 
        style={{ maxWidth: 440, padding: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)' }}>
            <ShieldAlert size={20} strokeWidth={2} />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Zona de Peligro</h3>
          </div>
          <button 
            onClick={handleClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-l)', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {step === 1 ? (
          <div>
            <p style={{ fontSize: 13.5, color: 'var(--text-m)', marginBottom: 20, lineHeight: '1.6' }}>
              ¿Estás seguro de que deseas eliminar este/a <strong>{entityType.toLowerCase()}</strong> (<em>{entityName}</em>)? 
              Esta acción es irreversible y podría causar la pérdida permanente de datos asociados en cascada en Supabase y Spring Boot.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancelar
              </button>
              <button 
                type="button"
                className="btn btn-danger" 
                onClick={() => {
                  if (isCritical) {
                    setStep(2)
                  } else {
                    onConfirm()
                  }
                }}
              >
                Sí, continuar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 13.5, color: 'var(--text-m)', marginBottom: 16, lineHeight: '1.6' }}>
              Esta es una acción de **alta criticidad**. Para confirmar la eliminación completa de la empresa <strong>{entityName}</strong>, por favor escribe su nombre exacto a continuación:
            </p>
            
            <div style={{ marginBottom: 20 }}>
              <input
                type="text"
                className="form-input error"
                placeholder={entityName}
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                style={{ fontFamily: 'inherit', fontWeight: 600 }}
              />
              <span className="form-error" style={{ display: 'block', marginTop: 6, fontWeight: 500 }}>
                Escribe exactamente: <strong style={{ textDecoration: 'underline' }}>{entityName}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Abortar
              </button>
              <button 
                type="button"
                className="btn btn-danger" 
                disabled={!isConfirmed || isPending}
                onClick={onConfirm}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {isPending ? <Spinner className="w-4 h-4" /> : <Trash2 size={14} />}
                Confirmar eliminación definitiva
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
