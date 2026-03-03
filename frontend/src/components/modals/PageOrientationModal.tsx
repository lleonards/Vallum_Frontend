import { useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { X, RotateCw, Smartphone, Monitor, Layers } from 'lucide-react'
import { flipPageOrientation, rotatePDFPage } from '@/utils/pdfUtils'
import toast from 'react-hot-toast'

interface Props {
  onClose: () => void
}

export default function PageOrientationModal({ onClose }: Props) {
  const { pdfBytes, setPdfBytes, currentPage, totalPages } = useEditorStore()
  const [applyTo, setApplyTo] = useState<'current' | 'all'>('current')
  const [loading, setLoading] = useState(false)

  const handleFlip = async () => {
    if (!pdfBytes) {
      toast.error('Nenhum PDF aberto')
      return
    }
    setLoading(true)
    try {
      let result: Uint8Array
      if (applyTo === 'current') {
        result = await flipPageOrientation(pdfBytes, currentPage)
      } else {
        let bytes = pdfBytes
        for (let i = 0; i < totalPages; i++) {
          bytes = await flipPageOrientation(bytes, 0)
        }
        result = bytes
      }
      setPdfBytes(result.buffer)
      toast.success('Orientação alterada com sucesso!')
      onClose()
    } catch (err) {
      toast.error('Erro ao alterar orientação')
    } finally {
      setLoading(false)
    }
  }

  const handleRotate = async (angle: number) => {
    if (!pdfBytes) {
      toast.error('Nenhum PDF aberto')
      return
    }
    setLoading(true)
    try {
      const result = await rotatePDFPage(pdfBytes, currentPage, angle)
      setPdfBytes(result.buffer)
      toast.success(`Página rotacionada ${angle}°!`)
      onClose()
    } catch (err) {
      toast.error('Erro ao rotacionar página')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="card w-full max-w-md p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Orientação de Página</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Altere a orientação ou rotação das páginas
            </p>
          </div>
          <button onClick={onClose} className="toolbar-btn"><X size={18} /></button>
        </div>

        {/* Apply to */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
            Aplicar em
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setApplyTo('current')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all
                ${applyTo === 'current'
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                }`}
            >
              Página atual ({currentPage + 1})
            </button>
            <button
              onClick={() => setApplyTo('all')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all
                ${applyTo === 'all'
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                }`}
            >
              Todas as páginas
            </button>
          </div>
        </div>

        {/* Orientation options */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-3">
            Orientação
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleFlip}
              disabled={loading}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-dark-600 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group disabled:opacity-50"
            >
              <div className="w-12 h-16 bg-gray-100 dark:bg-dark-700 rounded-md border-2 border-gray-300 dark:border-dark-500 group-hover:border-primary-400 transition-colors flex items-center justify-center">
                <Smartphone size={20} className="text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Vertical</span>
            </button>
            <button
              onClick={handleFlip}
              disabled={loading}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-dark-600 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group disabled:opacity-50"
            >
              <div className="w-16 h-12 bg-gray-100 dark:bg-dark-700 rounded-md border-2 border-gray-300 dark:border-dark-500 group-hover:border-primary-400 transition-colors flex items-center justify-center">
                <Monitor size={20} className="text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Horizontal</span>
            </button>
          </div>
        </div>

        {/* Rotation options */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-3">
            Rotação
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[90, 180, 270, -90].map((angle) => (
              <button
                key={angle}
                onClick={() => handleRotate(angle)}
                disabled={loading}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-200 dark:border-dark-600 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all disabled:opacity-50"
              >
                <RotateCw
                  size={18}
                  className="text-gray-500 dark:text-gray-400"
                  style={{ transform: angle < 0 ? 'scaleX(-1)' : undefined }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">{angle > 0 ? '+' : ''}{angle}°</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="loader w-4 h-4" /> Processando...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
