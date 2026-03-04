import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

export default function RightPanel() {
  const {
    pages, currentPageIndex, setCurrentPage, addPage, deletePage, canvasMap,
  } = useEditorStore();

  return (
    <aside className="w-[130px] flex flex-col border-l
      bg-gray-50 dark:bg-gray-900/80 border-gray-200 dark:border-gray-800 select-none">

      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 border-b
        border-gray-200 dark:border-gray-800">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          Páginas
        </span>
        <button onClick={addPage}
          className="w-6 h-6 flex items-center justify-center rounded
            hover:bg-brand-100 dark:hover:bg-brand-900 text-brand-600 dark:text-brand-400
            transition-colors"
          title="Adicionar página">
          <Plus size={14} />
        </button>
      </div>

      {/* Page thumbnails */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {pages.map((page, idx) => {
          const isActive = idx === currentPageIndex;
          const canvas = canvasMap[page.id];
          const thumbUrl = canvas
            ? canvas.toDataURL({ format: 'png', quality: 0.3, multiplier: 0.18 })
            : null;

          return (
            <div
              key={page.id}
              onClick={() => setCurrentPage(idx)}
              className={`relative rounded-lg overflow-hidden cursor-pointer
                transition-all group
                ${isActive
                  ? 'ring-2 ring-brand-500 shadow-md'
                  : 'ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-brand-300 dark:hover:ring-brand-700'
                }`}
              title={`Página ${idx + 1}`}
            >
              {/* Thumbnail or placeholder */}
              <div
                className="bg-white w-full"
                style={{ aspectRatio: '794/1123', overflow: 'hidden' }}
              >
                {thumbUrl ? (
                  <img src={thumbUrl} alt={`Página ${idx + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white dark:bg-gray-100 flex items-center justify-center">
                    <span className="text-[10px] text-gray-300">Vazio</span>
                  </div>
                )}
              </div>

              {/* Page number */}
              <div className={`text-[10px] py-0.5 text-center font-medium
                ${isActive
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                {idx + 1}
              </div>

              {/* Delete button (hover) */}
              {pages.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); deletePage(idx); }}
                  className="absolute top-1 right-1 w-5 h-5 rounded
                    bg-red-500 text-white flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remover página"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-2 py-2 border-t border-gray-200 dark:border-gray-800 text-center">
        <span className="text-[10px] text-gray-400 dark:text-gray-600">
          {pages.length} {pages.length === 1 ? 'página' : 'páginas'}
        </span>
      </div>
    </aside>
  );
}
