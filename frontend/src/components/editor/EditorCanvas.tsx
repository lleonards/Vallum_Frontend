import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'
import * as fabricLib from 'fabric'
import * as pdfjsLib from 'pdfjs-dist'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

// Acessando a classe Canvas de forma segura para evitar erros de compilação em produção
const fabric = (fabricLib as any).fabric || fabricLib;

// Configuração do Worker do PDF.js via CDN (mais estável para deploy)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export default function EditorCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<any>(null)
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null)
  
  const {
    pdfBytes, zoom, activeTool, currentPage, setTotalPages,
    setPages, setCurrentPage, setLoading, setHasChanges,
    fontFamily, fontSize, fontColor, fontBold, fontItalic, fontUnderline, textAlign,
    fillColor, strokeColor, strokeWidth, updatePage, isLoading
  } = useEditorStore()

  const [canvasSize, setCanvasSize] = useState({ width: 794, height: 1122 })
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  // 1. Carregar o documento PDF
  useEffect(() => {
    if (!pdfBytes) return
    setLoading(true)
    pdfjsLib.getDocument({ data: pdfBytes }).promise.then((doc) => {
      setPdfDoc(doc)
      setTotalPages(doc.numPages)
      const pagesArr = Array.from({ length: doc.numPages }, (_, i) => ({
        index: i,
        width: 794,
        height: 1122,
        rotation: 0,
      }))
      setPages(pagesArr)
      setLoading(false)
    }).catch((err) => {
      console.error(err)
      toast.error('Erro ao carregar PDF')
      setLoading(false)
    })
  }, [pdfBytes, setTotalPages, setPages, setLoading])

  // 2. Renderizar a página do PDF no canvas de fundo
  useEffect(() => {
    if (!pdfDoc || !pdfCanvasRef.current) return
    
    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage + 1)
        const viewport = page.getViewport({ scale: zoom * 1.5 })
        
        const canvas = pdfCanvasRef.current!
        const ctx = canvas.getContext('2d')!
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        setCanvasSize({ width: viewport.width, height: viewport.height })
        
        await page.render({ canvasContext: ctx, viewport }).promise
      } catch (err) {
        console.error('Erro ao renderizar página:', err)
      }
    }

    renderPage()
  }, [pdfDoc, currentPage, zoom])

  // 3. Salvar o que foi desenhado
  const saveCanvasState = useCallback(() => {
    if (!fabricRef.current) return
    const json = JSON.stringify(fabricRef.current.toJSON())
    updatePage(currentPage, { fabricJson: json })
  }, [currentPage, updatePage])

  // 4. Lógica de Clique (Inserir Texto, Formas, etc)
  const handleCanvasClick = useCallback((pointer: { x: number; y: number }, opt: any) => {
    const canvas = fabricRef.current
    if (!canvas || activeTool === 'select' || activeTool === 'pan') return

    if (activeTool === 'text') {
      const text = new fabric.Textbox('Digite aqui...', {
        left: pointer.x,
        top: pointer.y,
        width: 200,
        fontSize,
        fontFamily,
        fill: fontColor,
        fontWeight: fontBold ? 'bold' : 'normal',
        fontStyle: fontItalic ? 'italic' : 'normal',
        underline: fontUnderline,
        textAlign,
        editable: true,
      })
      canvas.add(text)
      canvas.setActiveObject(text)
      text.enterEditing()
      canvas.renderAll()
    }

    if (activeTool === 'rectangle') {
      const rect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 100,
        height: 80,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth,
        rx: 4, ry: 4,
      })
      canvas.add(rect)
      canvas.renderAll()
    }
  }, [activeTool, fontFamily, fontSize, fontColor, fontBold, fontItalic, fontUnderline, textAlign, fillColor, strokeColor, strokeWidth])

  // 5. Inicialização e Limpeza do Fabric (CORREÇÃO DO ERRO DE REMOVECHILD)
  useEffect(() => {
    if (!canvasRef.current) return
    
    // Criar o canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      selection: true,
      preserveObjectStacking: true,
    })
    
    fabricRef.current = canvas

    canvas.on('object:modified', () => {
      setHasChanges(true)
      saveCanvasState()
    })

    canvas.on('mouse:down', (opt: any) => {
      const pointer = canvas.getPointer(opt.e)
      handleCanvasClick(pointer, opt)
    })

    // Função de limpeza robusta
    return () => {
      if (fabricRef.current) {
        try {
          fabricRef.current.dispose()
        } catch (e) {
          console.warn("Aviso: Falha ao descartar canvas com segurança.")
        }
        fabricRef.current = null
      }
    }
  }, [currentPage]) // Reinicia ao trocar de página para evitar acúmulo de memória

  // 6. Sincronizar Tamanho do Canvas
  useEffect(() => {
    if (!fabricRef.current) return
    fabricRef.current.setWidth(canvasSize.width)
    fabricRef.current.setHeight(canvasSize.height)
    fabricRef.current.renderAll()
  }, [canvasSize])

  // 7. Atalhos de Teclado (Deletar objetos)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fabricRef.current) return
      const canvas = fabricRef.current
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
        const activeObjs = canvas.getActiveObjects()
        activeObjs.forEach((obj: any) => canvas.remove(obj))
        canvas.discardActiveObject().renderAll()
        setHasChanges(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setHasChanges])

  // 8. Upload de Imagem via Drag and Drop
  const onDropImage = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file || !fabricRef.current) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      fabric.Image.fromURL(dataUrl, (img: any) => {
        const canvas = fabricRef.current
        img.set({ left: 50, top: 50, scaleX: 0.3, scaleY: 0.3 })
        canvas.add(img).setActiveObject(img).renderAll()
        setHasChanges(true)
      })
    }
    reader.readAsDataURL(file)
  }, [setHasChanges])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropImage,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    noClick: activeTool !== 'image',
  })

  return (
    <div key="main-editor-container" className="editor-canvas-wrapper flex items-center justify-center p-8 min-h-screen bg-gray-50 dark:bg-dark-900" ref={containerRef}>
      {isLoading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          <p className="text-sm text-gray-500">Preparando editor...</p>
        </div>
      ) : !pdfBytes ? (
        <div className="text-center p-20 border-2 border-dashed border-gray-300 rounded-3xl max-w-md">
           <p className="text-gray-500 font-medium">Nenhum PDF carregado</p>
           <p className="text-xs text-gray-400 mt-2">Faça o upload de um arquivo para começar</p>
        </div>
      ) : (
        /* O segredo da proteção: envolver tudo em uma div com ID único */
        <div id="canvas-interaction-layer" className="relative transition-all duration-300">
            <div
              className="relative bg-white shadow-2xl"
              style={{ width: canvasSize.width, height: canvasSize.height }}
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              {/* Canvas do PDF (Abaixo) */}
              <canvas ref={pdfCanvasRef} className="absolute inset-0 pointer-events-none" />
              {/* Canvas de Edição (Acima) */}
              <canvas ref={canvasRef} className="absolute inset-0" />
              
              {isDragActive && (
                <div className="absolute inset-0 bg-primary-500/10 z-50 flex items-center justify-center border-4 border-primary-500 border-dashed">
                   <p className="bg-white px-6 py-3 rounded-xl shadow-xl font-bold text-primary-600">Solte para inserir a imagem</p>
                </div>
              )}
            </div>
        </div>
      )}

      {/* Navegação de Páginas */}
      {pdfDoc && pdfDoc.numPages > 1 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 dark:bg-dark-800/90 backdrop-blur shadow-2xl border border-gray-200 dark:border-dark-700 rounded-full px-6 py-3 z-50">
          <button 
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-30" 
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} 
            disabled={currentPage === 0}
          >
            ←
          </button>
          <span className="text-sm font-bold min-w-[120px] text-center">
            PÁGINA {currentPage + 1} DE {pdfDoc.numPages}
          </span>
          <button 
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-30" 
            onClick={() => setCurrentPage(Math.min(pdfDoc.numPages - 1, currentPage + 1))} 
            disabled={currentPage >= pdfDoc.numPages - 1}
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}
