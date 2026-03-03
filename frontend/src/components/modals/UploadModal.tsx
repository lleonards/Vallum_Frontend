import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useEditorStore } from '@/store/editorStore'
import { useNavigate } from 'react-router-dom'
import { Upload, X, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  onClose: () => void
}

export default function UploadModal({ onClose }: Props) {
  const { setPdfFile, setPdfBytes, setPdfName } = useEditorStore()
  const navigate = useNavigate()
  const [isDragging, setIsDragging] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são suportados')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const bytes = e.target?.result as ArrayBuffer
      setPdfFile(file)
      setPdfBytes(bytes)
      setPdfName(file.name.replace('.pdf', ''))
      toast.success(`${file.name} carregado com sucesso!`)
      onClose()
    }
    reader.readAsArrayBuffer(file)
  }, [setPdfFile, setPdfBytes, setPdfName, onClose])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  })

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="card w-full max-w-lg p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Abrir PDF</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Faça upload de um arquivo PDF para começar a editar
            </p>
          </div>
          <button onClick={onClose} className="toolbar-btn">
            <X size={18} />
          </button>
        </div>

        <div
          {...getRootProps()}
          className={`p-12 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center
            ${isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-dark-600 hover:border-primary-400 hover:bg-primary-50/40 dark:hover:bg-primary-900/10'
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors
              ${isDragging ? 'bg-primary-100 dark:bg-primary-900/40' : 'bg-gray-100 dark:bg-dark-700'}`}>
              {isDragging
                ? <FileText size={26} className="text-primary-600" />
                : <Upload size={26} className="text-gray-400" />
              }
            </div>
            <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
              {isDragging ? 'Solte o arquivo aqui!' : 'Arraste um PDF aqui'}
            </p>
            <p className="text-sm text-gray-400 mb-4">ou</p>
            <span className="btn-primary text-sm">
              Escolher arquivo
            </span>
            <p className="text-xs text-gray-400 mt-3">PDF até 50MB</p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  )
}
