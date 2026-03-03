import { useState } from 'react'
import { X, FileOutput, Download, ChevronRight, Loader2 } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import api from '@/utils/api'
import { downloadFile } from '@/utils/pdfUtils'
import toast from 'react-hot-toast'

interface Props {
  onClose: () => void
}

const CONVERSIONS = [
  { from: 'PDF', to: 'Word', icon: '📝', ext: 'docx', description: 'Converte PDF para Word editável' },
  { from: 'PDF', to: 'PNG', icon: '🖼️', ext: 'png', description: 'Exporta páginas como imagens PNG' },
  { from: 'PDF', to: 'JPG', icon: '📷', ext: 'jpg', description: 'Exporta páginas como imagens JPEG' },
  { from: 'PDF', to: 'Excel', icon: '📊', ext: 'xlsx', description: 'Extrai tabelas para Excel' },
  { from: 'PDF', to: 'PowerPoint', icon: '📑', ext: 'pptx', description: 'Converte slides para PowerPoint' },
  { from: 'PDF', to: 'Texto', icon: '📄', ext: 'txt', description: 'Extrai todo o texto do PDF' },
  { from: 'Word', to: 'PDF', icon: '📄', ext: 'pdf', description: 'Converte documentos Word para PDF' },
  { from: 'Imagem', to: 'PDF', icon: '🗂️', ext: 'pdf', description: 'Converte imagens para PDF' },
]

export default function ConversionModal({ onClose }: Props) {
  const { pdfFile, pdfBytes } = useEditorStore()
  const [selected, setSelected] = useState<typeof CONVERSIONS[0] | null>(null)
  const [converting, setConverting] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  const handleConvert = async () => {
    if (!selected) return

    // For text extraction (client-side)
    if (selected.to === 'Texto' && pdfBytes) {
      try {
        const { getDocument } = await import('pdfjs-dist')
        const doc = await getDocument({ data: pdfBytes }).promise
        let text = ''
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i)
          const content = await page.getTextContent()
          const pageText = content.items
            .filter((item: any) => 'str' in item)
            .map((item: any) => item.str)
            .join(' ')
          text += `--- Página ${i} ---\n${pageText}\n\n`
        }
        const blob = new Blob([text], { type: 'text/plain' })
        downloadFile(blob, `${pdfFile?.name?.replace('.pdf', '') || 'documento'}.txt`)
        toast.success('Texto extraído com sucesso!')
        onClose()
        return
      } catch {
        toast.error('Erro ao extrair texto')
        return
      }
    }

    // Server-side conversion
    setConverting(true)
    try {
      const formData = new FormData()

      if (pdfFile && (selected.from === 'PDF')) {
        formData.append('file', pdfFile)
      } else if (uploadFile) {
        formData.append('file', uploadFile)
      } else {
        toast.error('Selecione um arquivo')
        return
      }

      formData.append('to', selected.ext)

      const response = await api.post('/api/convert', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      })

      const blob = new Blob([response.data])
      const filename = `${pdfFile?.name?.replace('.pdf', '') || 'documento'}.${selected.ext}`
      downloadFile(blob, filename)
      toast.success(`Arquivo convertido para ${selected.to}!`)
      onClose()
    } catch (err) {
      toast.error('Erro ao converter arquivo. Verifique a conexão com o servidor.')
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="card w-full max-w-2xl p-6 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Converter Arquivo</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Converta entre diferentes formatos de arquivo
            </p>
          </div>
          <button onClick={onClose} className="toolbar-btn"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {CONVERSIONS.map((conv) => (
            <button
              key={`${conv.from}-${conv.to}`}
              onClick={() => setSelected(conv)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
                ${selected === conv
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-dark-600 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                }`}
            >
              <span className="text-2xl">{conv.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{conv.from}</span>
                  <ChevronRight size={12} className="text-gray-400" />
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">{conv.to}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{conv.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Upload for non-PDF input */}
        {selected && selected.from !== 'PDF' && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
              Arquivo de entrada ({selected.from})
            </label>
            <input
              type="file"
              accept={selected.from === 'Word' ? '.doc,.docx' : 'image/*'}
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="input-field text-sm"
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button
            onClick={handleConvert}
            disabled={!selected || converting}
            className="btn-primary"
          >
            {converting ? (
              <><div className="loader w-4 h-4" /> Convertendo...</>
            ) : (
              <><Download size={16} /> Converter e Baixar</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
