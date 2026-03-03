import { useEditorStore } from '@/store/editorStore'
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Palette } from 'lucide-react'

export default function PropertiesPanel() {
  const {
    activeTool,
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    fontColor, setFontColor,
    fontBold, setFontBold,
    fontItalic, setFontItalic,
    fontUnderline, setFontUnderline,
    textAlign, setTextAlign,
    fillColor, setFillColor,
    strokeColor, setStrokeColor,
    strokeWidth, setStrokeWidth,
    opacity, setOpacity,
  } = useEditorStore()

  return (
    <div className="w-56 bg-white dark:bg-dark-900 border-l border-gray-200 dark:border-dark-700 overflow-y-auto flex-shrink-0">
      <div className="p-3 border-b border-gray-200 dark:border-dark-700">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Propriedades
        </h3>
      </div>

      <div className="p-3 space-y-4">
        {/* Text Properties */}
        {(activeTool === 'text' || activeTool === 'select') && (
          <section>
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <span className="w-1 h-3 bg-primary-500 rounded-full" />
              Texto
            </h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Fonte</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="input-field py-1 text-xs"
                >
                  {['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Helvetica'].map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Tamanho</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="8"
                    max="96"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1 accent-primary-500"
                  />
                  <span className="text-xs font-mono text-gray-600 dark:text-gray-300 w-8 text-right">{fontSize}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Cor</label>
                <div className="flex items-center gap-2">
                  <label className="relative cursor-pointer">
                    <div
                      className="w-8 h-8 rounded-md border border-gray-200 dark:border-dark-600 cursor-pointer"
                      style={{ backgroundColor: fontColor }}
                    />
                    <input
                      type="color"
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{fontColor}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Estilo</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setFontBold(!fontBold)}
                    className={`toolbar-btn flex-1 ${fontBold ? 'active' : ''}`}
                  >
                    <Bold size={13} />
                  </button>
                  <button
                    onClick={() => setFontItalic(!fontItalic)}
                    className={`toolbar-btn flex-1 ${fontItalic ? 'active' : ''}`}
                  >
                    <Italic size={13} />
                  </button>
                  <button
                    onClick={() => setFontUnderline(!fontUnderline)}
                    className={`toolbar-btn flex-1 ${fontUnderline ? 'active' : ''}`}
                  >
                    <Underline size={13} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Alinhamento</label>
                <div className="flex gap-1">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => setTextAlign(align)}
                      className={`toolbar-btn flex-1 ${textAlign === align ? 'active' : ''}`}
                    >
                      {align === 'left' && <AlignLeft size={13} />}
                      {align === 'center' && <AlignCenter size={13} />}
                      {align === 'right' && <AlignRight size={13} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Shape Properties */}
        {(['rectangle', 'circle', 'line', 'pen', 'select'].includes(activeTool)) && (
          <section>
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <span className="w-1 h-3 bg-purple-500 rounded-full" />
              Forma
            </h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Preenchimento</label>
                <div className="flex items-center gap-2">
                  <label className="relative cursor-pointer">
                    <div className="w-8 h-8 rounded-md border border-gray-200 dark:border-dark-600" style={{ backgroundColor: fillColor }} />
                    <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </label>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{fillColor}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Borda</label>
                <div className="flex items-center gap-2">
                  <label className="relative cursor-pointer">
                    <div className="w-8 h-8 rounded-md border-2" style={{ borderColor: strokeColor, backgroundColor: 'transparent' }} />
                    <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </label>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{strokeColor}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Espessura da borda</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="flex-1 accent-primary-500"
                  />
                  <span className="text-xs font-mono text-gray-600 dark:text-gray-300 w-5 text-right">{strokeWidth}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Opacity */}
        <section>
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <span className="w-1 h-3 bg-green-500 rounded-full" />
            Opacidade
          </h4>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="flex-1 accent-primary-500"
            />
            <span className="text-xs font-mono text-gray-600 dark:text-gray-300 w-10 text-right">
              {Math.round(opacity * 100)}%
            </span>
          </div>
        </section>

        {/* Position hint */}
        <div className="mt-4 p-2 bg-gray-50 dark:bg-dark-800 rounded-lg">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Selecione um elemento para ver suas propriedades detalhadas
          </p>
        </div>
      </div>
    </div>
  )
}
