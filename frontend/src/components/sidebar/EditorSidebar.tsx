import { useEditorStore } from '@/store/editorStore'
import { FileText, Plus, RotateCw, Trash2, Copy, MoveUp, MoveDown, Layers, BookOpen } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function EditorSidebar() {
  const {
    pages, currentPage, setCurrentPage, sidebarTab, setSidebarTab,
    pdfBytes, totalPages
  } = useEditorStore()

  return (
    <div className="sidebar-panel">
      {/* Tab header */}
      <div className="flex border-b border-gray-200 dark:border-dark-700 flex-shrink-0">
        <button
          onClick={() => setSidebarTab('pages')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors
            ${sidebarTab === 'pages'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
        >
          <BookOpen size={13} /> Páginas
        </button>
        <button
          onClick={() => setSidebarTab('layers')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors
            ${sidebarTab === 'layers'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
        >
          <Layers size={13} /> Camadas
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {sidebarTab === 'pages' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {totalPages} {totalPages === 1 ? 'página' : 'páginas'}
              </span>
              <button className="toolbar-btn w-6 h-6" title="Adicionar página">
                <Plus size={12} />
              </button>
            </div>

            {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => (
              <div
                key={i}
                className={`group relative rounded-lg border-2 transition-all cursor-pointer overflow-hidden
                  ${currentPage === i
                    ? 'border-primary-500 shadow-md'
                    : 'border-gray-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                onClick={() => setCurrentPage(i)}
              >
                {/* Page thumbnail */}
                <div className="aspect-[210/297] bg-white dark:bg-dark-700 flex items-center justify-center">
                  {pdfBytes ? (
                    <div className="w-full h-full bg-white flex items-center justify-center">
                      <FileText size={24} className="text-gray-300 dark:text-dark-500" />
                    </div>
                  ) : (
                    <div className="text-center">
                      <FileText size={20} className="text-gray-300 mx-auto mb-1" />
                    </div>
                  )}
                </div>

                {/* Page number badge */}
                <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 dark:bg-dark-800 border-t border-gray-100 dark:border-dark-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Pág. {i + 1}
                  </span>
                  <div className="hidden group-hover:flex items-center gap-0.5">
                    <button
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-400"
                      title="Rotacionar"
                      onClick={(e) => { e.stopPropagation(); toast.success(`Página ${i + 1} rotacionada`) }}
                    >
                      <RotateCw size={10} />
                    </button>
                    <button
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-400"
                      title="Duplicar"
                      onClick={(e) => { e.stopPropagation() }}
                    >
                      <Copy size={10} />
                    </button>
                    <button
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500"
                      title="Excluir"
                      onClick={(e) => { e.stopPropagation() }}
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>

                {/* Active indicator */}
                {currentPage === i && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <LayersPanel />
        )}
      </div>
    </div>
  )
}

function LayersPanel() {
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
        Selecione elementos no canvas para ver as camadas
      </p>
    </div>
  )
}
