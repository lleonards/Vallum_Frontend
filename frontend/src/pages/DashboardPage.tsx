import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useEditorStore } from '@/store/editorStore'
import Navbar from '@/components/layout/Navbar'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  FileText, Upload, Plus, Clock, Trash2, 
  FolderOpen, Search, Grid, List, MoreVertical 
} from 'lucide-react'
import toast from 'react-hot-toast'

const mockFiles = [
  { id: '1', name: 'Contrato_2024.pdf', pages: 12, size: '2.4 MB', updated: '2 horas atrás' },
  { id: '2', name: 'Relatorio_Anual.pdf', pages: 45, size: '8.1 MB', updated: 'ontem' },
  { id: '3', name: 'Proposta_Comercial.pdf', pages: 8, size: '1.2 MB', updated: '3 dias atrás' },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { setPdfFile, setPdfBytes, setPdfName } = useEditorStore()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')

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
      navigate('/editor')
    }
    reader.readAsArrayBuffer(file)
  }, [setPdfFile, setPdfBytes, setPdfName, navigate])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  })

  const openFile = (file: typeof mockFiles[0]) => {
    toast.success(`Abrindo ${file.name}`)
    setPdfName(file.name.replace('.pdf', ''))
    navigate('/editor')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Meus Arquivos
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Olá, {user?.user_metadata?.full_name || user?.email}! 👋
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/editor')} className="btn-primary">
              <Plus size={16} /> Novo Documento
            </button>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`mb-8 p-8 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
            ${isDragActive 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors
              ${isDragActive ? 'bg-primary-100' : 'bg-gray-100 dark:bg-dark-700'}`}>
              <Upload size={22} className={isDragActive ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'} />
            </div>
            <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">
              {isDragActive ? 'Solte o arquivo aqui!' : 'Arraste um PDF ou clique para upload'}
            </p>
            <p className="text-xs text-gray-400">PDF até 50MB</p>
          </div>
        </div>

        {/* Search + View Toggle */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar arquivos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700'}`}
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700'}`}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Recent files */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              Recentes
            </h2>
          </div>
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockFiles
                .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
                .map(file => (
                <div
                  key={file.id}
                  className="card p-4 cursor-pointer hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all group"
                  onClick={() => openFile(file)}
                >
                  <div className="aspect-[3/4] bg-gray-50 dark:bg-dark-700 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                    <FileText size={32} className="text-gray-300 dark:text-dark-500 group-hover:text-primary-400 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{file.pages} pgs · {file.size}</p>
                  <p className="text-xs text-gray-400">{file.updated}</p>
                </div>
              ))}
              
              {/* New document card */}
              <button
                onClick={() => navigate('/editor')}
                className="card p-4 border-dashed hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all flex flex-col items-center justify-center aspect-auto min-h-[180px] gap-2"
              >
                <div className="w-10 h-10 bg-gray-100 dark:bg-dark-700 rounded-xl flex items-center justify-center">
                  <Plus size={20} className="text-gray-400" />
                </div>
                <span className="text-sm text-gray-400">Novo documento</span>
              </button>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-700">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nome</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Páginas</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Tamanho</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Modificado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {mockFiles
                    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
                    .map(file => (
                    <tr
                      key={file.id}
                      className="border-b border-gray-50 dark:border-dark-700 last:border-0 hover:bg-gray-50 dark:hover:bg-dark-700 cursor-pointer transition-colors"
                      onClick={() => openFile(file)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText size={14} className="text-red-500" />
                          </div>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">{file.pages}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{file.size}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{file.updated}</td>
                      <td className="px-4 py-3">
                        <button
                          className="toolbar-btn"
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          <MoreVertical size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
