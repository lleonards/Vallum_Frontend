import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'
import * as fabricLib from 'fabric'
import * as pdfjsLib from 'pdfjs-dist'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

// Acesso seguro para evitar erros de tipos/versão
const fabric = (fabricLib as any).fabric || fabricLib;

// CORREÇÃO DO 404: Adicionado 'https:' explicitly para evitar falha no carregamento do worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

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

  // 1. CARREGAR PDF (Com supressão de erros para o Warning TT)
  useEffect(() => {
    if (!pdfBytes) return
    setLoading(true)
    
    // stopAtErrors: false ajuda a carregar PDFs mesmo com problemas menores de fontes (Warning TT)
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes, stopAtErrors: false })
    
    loadingTask.promise.then((doc) => {
      setPdfDoc(doc)
      setTotalPages(doc.numPages)
      setPages(Array.from({ length: doc.numPages }, (_, i) => ({
        index: i, width: 794, height: 1122, rotation: 0,
      })))
      setLoading(false)
    }).catch((err) => {
      console.error(err)
      toast.error('Erro ao carregar PDF')
      setLoading(false)
    })
  }, [pdfBytes, setTotalPages, setPages, setLoading])

  // 2. RENDERIZAR PÁGINA (BACKGROUND)
  useEffect(() => {
    if (!pdfDoc || !pdfCanvasRef.current) return
    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage + 1)
        const viewport = page.getViewport({ scale: zoom * 1.5 })
        
        const canvas = pdfCanvasRef.current!
        const ctx = canvas.getContext('2d', { alpha: false })!
        
        canvas.width = viewport.width
        canvas.height = viewport.height
        setCanvasSize({ width: viewport.width, height: viewport.height })
        
        // intent: 'print' melhora a qualidade da renderização no canvas
        await page.render({ canvasContext: ctx, viewport, intent: 'print' }).promise
      } catch (err) {
        console.error('Erro ao renderizar página:', err)
      }
    }
    renderPage()
  }, [pdfDoc, currentPage, zoom])

  // 3. SALVAR ESTADO
  const saveCanvasState = useCallback(() => {
    if (!fabricRef.current) return
    const json = JSON.stringify(fabricRef.current.toJSON())
    updatePage(currentPage, { fabricJson: json })
  }, [currentPage, updatePage])

  // 4. LÓGICA DE CLIQUE E FERRAMENTAS
  const handleCanvasClick = useCallback((pointer: { x: number; y: number }, opt: any) => {
    const canvas = fabricRef.current
    if (!canvas || activeTool === 'select' || activeTool === 'pan' || activeTool === 'pen') return

    const commonProps = {
      left: pointer.x,
      top: pointer.y,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
    }

    if (activeTool === 'text') {
      const target = canvas.findTarget(opt.e)
      if (target && target.type === 'textbox') return
      const text = new fabric.Textbox('Digite aqui...', {
        ...commonProps,
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
      canvas.add(text).setActiveObject(text)
      text.enterEditing()
    } else if (activeTool === 'rectangle') {
      canvas.add(new fabric.Rect({ ...commonProps, width: 100, height: 80, rx: 4, ry: 4 }))
    } else if (activeTool === 'circle') {
      canvas.add(new fabric.Ellipse({ ...commonProps, rx: 50, ry: 40 }))
    } else if (activeTool === 'line') {
      canvas.add(new fabric.Line([pointer.x, pointer.y, pointer.x + 100, pointer.y], { stroke: strokeColor, strokeWidth }))
    }
    canvas.renderAll()
  }, [activeTool, fontFamily, fontSize, fontColor, fontBold, fontItalic, fontUnderline, textAlign, fillColor, strokeColor, strokeWidth])

  // 5. INICIALIZAR FABRIC (COM BLINDAGEM ANTI-ERRO REMOVECHILD)
  useEffect(() => {
    if (!canvasRef.current || !pdfBytes) return
    
    // Criar instância
    const canvas = new fabric.Canvas(canvasRef.current, {
      selection: true,
      preserveObjectStacking: true,
    })
    fabricRef.current = canvas

    // Eventos
    canvas.on('object:modified', () => { setHasChanges(true); saveCanvasState(); })
    canvas.on('object:added', () => setHasChanges(true))
    canvas.on('mouse:down', (opt: any) => {
      const pointer = canvas.getPointer(opt.e)
      handleCanvasClick(pointer, opt)
      if (activeTool === 'pan') {
        isDragging.current = true
        lastPos.current = { x: (opt.e as MouseEvent).clientX, y: (opt.e as MouseEvent).clientY }
      }
    })
    canvas.on('mouse:move', (opt: any) => {
      if (activeTool === 'pan' && isDragging.current) {
        const e = opt.e as MouseEvent
        canvas.relativePan(new fabric.Point(e.clientX - lastPos.current.x, e.clientY - lastPos.current.y))
        lastPos.current = { x: e.clientX, y: e.clientY }
      }
    })
    canvas.on('mouse:up', () => { isDragging.current = false })

    // LIMPEZA CRÍTICA: Desmonta o Fabric antes do React tentar mexer no DOM
    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose()
        fabricRef.current = null
      }
    }
  }, [currentPage, !!pdfBytes]) // Recria apenas se necessário

  // 6. SINCRONIZAR FERRAMENTAS E TAMANHO
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.setWidth(canvasSize.width)
    canvas.setHeight(canvasSize.height)
    
    canvas.isDrawingMode = activeTool === 'pen'
    if (canvas.isDrawingMode) {
      canvas.freeDrawingBrush.color = strokeColor
      canvas.freeDrawingBrush.width = strokeWidth
    }
    
    canvas.selection = !(activeTool === 'pan' || activeTool === 'zoom')
    canvas.defaultCursor = activeTool === 'pan' ? 'grab' : (activeTool === 'text' ? 'text' : 'crosshair')
    canvas.renderAll()
  }, [canvasSize, activeTool, strokeColor, strokeWidth])

  // 7. ATALHOS (COPY, PASTE, DELETE) - Totalmente preservados
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const canvas = fabricRef.current
      if (!canvas || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        canvas.getActiveObjects().forEach((obj: any) => canvas.remove(obj))
        canvas.discardActiveObject().renderAll()
        setHasChanges(true)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        canvas.getActiveObject()?.clone((cloned: any) => { canvas.clipboard = cloned })
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (canvas.clipboard) {
          canvas.clipboard.clone((cloned: any) => {
            cloned.set({ left: cloned.left + 20, top: cloned.top + 20 })
            canvas.add(cloned).setActiveObject(cloned).renderAll()
          })
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setHasChanges])

  // 8. DROP DE IMAGEM
  const onDropImage = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file || !fabricRef.current) return
    const reader = new FileReader()
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target?.result as string, (img: any) => {
        const canvas = fabricRef.current
        const scale = (canvas.getWidth() * 0.5) / img.width
        img.set({ left: 50, top: 50, scaleX: scale, scaleY: scale })
        canvas.add(img).setActiveObject(img).renderAll()
        setHasChanges(true)
        toast.success('Imagem adicionada!')
      })
    }
    reader.readAsDataURL(file)
  }, [setHasChanges])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropImage,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg'] },
    noClick: activeTool !== 'image',
  })

  return (
    // Fundo cinza estilo "estúdio" para destacar a folha
    <div className="editor-canvas-wrapper flex flex-col items-center py-12 min-h-screen bg-[#F3F4F6] dark:bg-dark-950 overflow-auto" ref={containerRef}>
      
      {isLoading ? (
        <div className="flex flex-col items-center gap-3 mt-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          <p className="text-sm text-gray-500">Preparando editor...</p>
        </div>
      ) : !pdfBytes ? (
        <div className="mt-20 text-center p-20 border-2 border-dashed border-gray-300 rounded-3xl max-w-md bg-white">
           <p className="text-gray-500 font-medium">Nenhum PDF carregado</p>
        </div>
      ) : (
        /* A FOLHA: Agora com bordas, sombra longa e div protetora para o Fabric */
        <div 
          key={`canvas-wrapper-${currentPage}`}
          id="canvas-container"
          className="relative bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-300 mb-24"
          style={{ width: canvasSize.width, height: canvasSize.height }}
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <canvas ref={pdfCanvasRef} className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 1 }} />
          
          {/* Div que isola o Fabric do monitoramento do React */}
          <div className="absolute inset-0" style={{ zIndex: 2 }}>
            <canvas ref={canvasRef} />
          </div>
          
          {isDragActive && (
            <div className="absolute inset-0 bg-primary-500/10 z-50 flex items-center justify-center border-4 border-primary-500 border-dashed m-2 rounded-lg">
               <p className="bg-white px-6 py-3 rounded-xl shadow-xl font-bold text-primary-600">Solte para inserir imagem</p>
            </div>
          )}
        </div>
      )}

      {/* Navegação Flutuante Atualizada e mais bonita */}
      {pdfDoc && pdfDoc.numPages > 1 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-200 rounded-full px-8 py-4 z-50">
          <button 
            className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-20 transition-all font-bold text-xl" 
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} 
            disabled={currentPage === 0}
          >
            ←
          </button>
          
          <div className="flex flex-col items-center min-w-[120px]">
             <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Página</span>
             <span className="text-sm font-black">
               {currentPage + 1} / {pdfDoc.numPages}
             </span>
          </div>

          <button 
            className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-20 transition-all font-bold text-xl" 
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
