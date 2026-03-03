import { useNavigate } from 'react-router-dom'
import { useEditorStore } from '@/store/editorStore'
import { useThemeStore } from '@/store/themeStore'
import { 
  FileText, Save, Download, Sun, Moon, ChevronLeft,
  RefreshCw, FileOutput, RotateCcw, RotateCw, Upload,
  ChevronDown, PanelLeft, PanelRight
} from 'lucide-react'
import { useState } from 'react'
import { downloadFile } from '@/utils/pdfUtils'
import toast from 'react-hot-toast'

interface Props {
  onConvert: () => void
  onOrient: () => void
  onUpload: () => void
}

export default function EditorTopBar({ onConvert, onOrient, onUpload }: Props) {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useThemeStore()
  const { 
    pdfName, setPdfName, pdfBytes, hasChanges, isSaving,
    showSidebar, setShowSidebar, showProperties, setShowProperties,
    zoom, setZoom, currentPage, totalPages
  } = useEditorStore()
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState(pdfName)
  const [showFileMenu, setShowFileMenu] = useState(false)

  const handleSaveName = () => {
    if (tempName.trim()) setPdfName(tempName.trim())
    setEditingName(false)
  }

  const handleDownload = () => {
    if (!pdfBytes) {
      toast.error('Nenhum documento aberto')
      return
    }
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    downloadFile(blob, `${pdfName}.pdf`)
    toast.success('PDF baixado!')
  }

  return (
    <div className="h-14 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700 flex items-center px-3 gap-2 z-20 shadow-toolbar">
      {/* Back + Logo */}
      <button
        onClick={() => navigate('/dashboard')}
        className="toolbar-btn mr-1"
        title="Voltar ao Dashboard"
      >
        <ChevronLeft size={18} />
      </button>
      
      <div className="flex items-center gap-2 mr-3">
        <div className="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center">
          <FileText size={14} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-base hidden sm:block">Vellum</span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 dark:bg-dark-600 mx-1" />

      {/* File name */}
      <div className="flex-1 min-w-0 max-w-xs">
        {editingName ? (
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveName()
              if (e.key === 'Escape') setEditingName(false)
            }}
            className="input-field py-1 text-sm font-medium w-full"
            autoFocus
          />
        ) : (
          <button
            onClick={() => { setTempName(pdfName); setEditingName(true) }}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors max-w-full"
            title="Renomear documento"
          >
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{pdfName}</span>
            {hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" title="Alterações não salvas" />}
          </button>
        )}
      </div>

      {/* Page info */}
      {totalPages > 0 && (
        <span className="text-xs text-gray-400 dark:text-gray-500 hidden md:block flex-shrink-0">
          Pág. {currentPage + 1} / {totalPages}
        </span>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Panel toggles */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className={`toolbar-btn ${showSidebar ? 'active' : ''}`}
          title="Painel de páginas"
        >
          <PanelLeft size={16} />
        </button>
        <button
          onClick={() => setShowProperties(!showProperties)}
          className={`toolbar-btn ${showProperties ? 'active' : ''}`}
          title="Painel de propriedades"
        >
          <PanelRight size={16} />
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-dark-600 mx-1" />

        {/* File actions */}
        <button onClick={onUpload} className="toolbar-btn" title="Abrir PDF">
          <Upload size={16} />
        </button>
        <button onClick={onOrient} className="toolbar-btn" title="Orientação de página">
          <RotateCw size={16} />
        </button>
        <button onClick={onConvert} className="toolbar-btn" title="Converter arquivo">
          <FileOutput size={16} />
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-dark-600 mx-1" />

        <button onClick={handleDownload} className="btn-secondary py-1.5 text-xs hidden sm:flex">
          <Download size={14} /> Baixar PDF
        </button>

        <button onClick={toggleTheme} className="toolbar-btn" title="Alternar tema">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  )
}
