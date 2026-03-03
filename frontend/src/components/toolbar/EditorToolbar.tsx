import { useEditorStore, type ToolType } from '@/store/editorStore'
import {
  MousePointer2, Type, Image, Square, Circle, Minus,
  Pen, Eraser, ZoomIn, ZoomOut, Move, Undo2, Redo2,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Trash2, Copy, Layers, ChevronDown
} from 'lucide-react'
import { useState } from 'react'

const FONT_FAMILIES = ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Helvetica', 'Trebuchet MS', 'Impact']
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72]

const tools: { id: ToolType; icon: any; label: string; shortcut?: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Selecionar (V)', shortcut: 'V' },
  { id: 'pan', icon: Move, label: 'Mover canvas (H)', shortcut: 'H' },
  { id: 'text', icon: Type, label: 'Texto (T)', shortcut: 'T' },
  { id: 'image', icon: Image, label: 'Imagem (I)', shortcut: 'I' },
  { id: 'rectangle', icon: Square, label: 'Retângulo (R)', shortcut: 'R' },
  { id: 'circle', icon: Circle, label: 'Elipse (E)', shortcut: 'E' },
  { id: 'line', icon: Minus, label: 'Linha (L)', shortcut: 'L' },
  { id: 'pen', icon: Pen, label: 'Caneta (P)', shortcut: 'P' },
  { id: 'eraser', icon: Eraser, label: 'Borracha (X)', shortcut: 'X' },
]

export default function EditorToolbar() {
  const {
    activeTool, setActiveTool,
    zoom, setZoom,
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    fontColor, setFontColor,
    fontBold, setFontBold,
    fontItalic, setFontItalic,
    fontUnderline, setFontUnderline,
    textAlign, setTextAlign,
    strokeColor, setStrokeColor,
    strokeWidth, setStrokeWidth,
    fillColor, setFillColor,
  } = useEditorStore()

  const [showFontMenu, setShowFontMenu] = useState(false)

  const isTextTool = activeTool === 'text'
  const isShapeTool = ['rectangle', 'circle', 'line'].includes(activeTool)
  const isPenTool = activeTool === 'pen'

  return (
    <div className="h-10 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700 flex items-center px-2 gap-0.5 overflow-x-auto no-select shadow-sm z-10">
      
      {/* Tool buttons */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 dark:border-dark-600 flex-shrink-0">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`toolbar-btn ${activeTool === tool.id ? 'active' : ''}`}
            title={tool.label}
          >
            <tool.icon size={15} />
          </button>
        ))}
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-0.5 px-2 border-r border-gray-200 dark:border-dark-600 flex-shrink-0">
        <button onClick={() => setZoom(zoom - 0.1)} className="toolbar-btn" title="Diminuir zoom">
          <ZoomOut size={15} />
        </button>
        <span className="zoom-badge">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(zoom + 0.1)} className="toolbar-btn" title="Aumentar zoom">
          <ZoomIn size={15} />
        </button>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5 px-2 border-r border-gray-200 dark:border-dark-600 flex-shrink-0">
        <button className="toolbar-btn" title="Desfazer (Ctrl+Z)">
          <Undo2 size={15} />
        </button>
        <button className="toolbar-btn" title="Refazer (Ctrl+Y)">
          <Redo2 size={15} />
        </button>
      </div>

      {/* Text formatting (visible when text tool active or element selected) */}
      {(isTextTool) && (
        <div className="flex items-center gap-0.5 px-2 border-r border-gray-200 dark:border-dark-600 flex-shrink-0">
          {/* Font family */}
          <div className="relative">
            <button
              onClick={() => setShowFontMenu(!showFontMenu)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 
                         bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 
                         rounded hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors min-w-[100px]"
            >
              <span className="truncate" style={{ fontFamily }}>{fontFamily}</span>
              <ChevronDown size={12} />
            </button>
            {showFontMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 card shadow-lg py-1 z-50 max-h-48 overflow-y-auto">
                {FONT_FAMILIES.map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFontFamily(f); setShowFontMenu(false) }}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors ${fontFamily === f ? 'text-primary-600 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
                    style={{ fontFamily: f }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font size */}
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="px-1 py-1 text-xs bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded text-gray-700 dark:text-gray-200 w-14"
          >
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Bold, Italic, Underline */}
          <button onClick={() => setFontBold(!fontBold)} className={`toolbar-btn ${fontBold ? 'active' : ''}`} title="Negrito (Ctrl+B)">
            <Bold size={14} />
          </button>
          <button onClick={() => setFontItalic(!fontItalic)} className={`toolbar-btn ${fontItalic ? 'active' : ''}`} title="Itálico (Ctrl+I)">
            <Italic size={14} />
          </button>
          <button onClick={() => setFontUnderline(!fontUnderline)} className={`toolbar-btn ${fontUnderline ? 'active' : ''}`} title="Sublinhado (Ctrl+U)">
            <Underline size={14} />
          </button>

          {/* Alignment */}
          <button onClick={() => setTextAlign('left')} className={`toolbar-btn ${textAlign === 'left' ? 'active' : ''}`} title="Alinhar à esquerda">
            <AlignLeft size={14} />
          </button>
          <button onClick={() => setTextAlign('center')} className={`toolbar-btn ${textAlign === 'center' ? 'active' : ''}`} title="Centralizar">
            <AlignCenter size={14} />
          </button>
          <button onClick={() => setTextAlign('right')} className={`toolbar-btn ${textAlign === 'right' ? 'active' : ''}`} title="Alinhar à direita">
            <AlignRight size={14} />
          </button>

          {/* Font color */}
          <label className="relative cursor-pointer" title="Cor do texto">
            <div className="w-7 h-7 rounded-md border border-gray-200 dark:border-dark-600 flex items-center justify-center overflow-hidden">
              <Type size={12} className="text-gray-500" />
              <div className="absolute bottom-0.5 left-0.5 right-0.5 h-1.5 rounded-sm" style={{ backgroundColor: fontColor }} />
            </div>
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>
      )}

      {/* Shape / Pen colors */}
      {(isShapeTool || isPenTool) && (
        <div className="flex items-center gap-1.5 px-2 border-r border-gray-200 dark:border-dark-600 flex-shrink-0">
          <label className="relative cursor-pointer" title="Cor de preenchimento">
            <div className="w-7 h-7 rounded-md border border-gray-200 dark:border-dark-600 p-0.5 overflow-hidden">
              <div className="w-full h-full rounded" style={{ backgroundColor: fillColor }} />
            </div>
            <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
          </label>
          <label className="relative cursor-pointer" title="Cor da borda">
            <div className="w-7 h-7 rounded-md border-2 p-0.5 overflow-hidden" style={{ borderColor: strokeColor }}>
              <div className="w-full h-full rounded" style={{ backgroundColor: 'transparent' }} />
            </div>
            <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-20 accent-primary-500"
            title={`Espessura: ${strokeWidth}px`}
          />
          <span className="text-xs text-gray-400 w-6">{strokeWidth}</span>
        </div>
      )}

      {/* Delete / Copy */}
      <div className="flex items-center gap-0.5 px-2 flex-shrink-0 ml-auto">
        <button className="toolbar-btn" title="Copiar (Ctrl+C)">
          <Copy size={15} />
        </button>
        <button className="toolbar-btn hover:text-red-500" title="Excluir (Delete)">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
