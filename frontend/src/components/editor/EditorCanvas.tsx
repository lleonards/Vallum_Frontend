import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'
import * as fabricLib from 'fabric'
import * as pdfjsLib from 'pdfjs-dist'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

// Acesso seguro para evitar erros de tipos/versão
const fabric = (fabricLib as any).fabric || fabricLib;

// CORREÇÃO DO 404
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

  // 1. CARREGAR PDF
  useEffect(() => {
    if (!pdfBytes) return
    setLoading(true)
    
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

  // 2. RENDERIZAR PÁGINA (CORREÇÃO DA DISTORÇÃO "ESTICADA")
  useEffect(() => {
    if (!pdfDoc || !pdfCanvasRef.current) return
    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage + 1)
        
        // Mantemos a proporção exata ditada pelo PDFjs usando o zoom atual
        const viewport = page.getViewport({ scale: zoom })
        
        const canvas = pdfCanvasRef.current!
        const ctx = canvas.getContext('2d', { alpha: false })!
        
        // Define o tamanho real do canvas (Físico e CSS) para evitar distorção
        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`
        
        setCanvasSize({ width: viewport.width, height: viewport.height })
        
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

  // 5. INICIALIZAR FABRIC
  useEffect(() => {
    if (!canvasRef.current || !pdfBytes) return
    
    const canvas = new fabric.Canvas(canvasRef.current, {
      selection: true,
      preserveObjectStacking: true,
    })
    fabricRef.current = canvas

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

    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose()
        fabricRef.current = null
      }
    }
  }, [currentPage, !!pdfBytes])

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

  // 7. ATALHOS (COPY, PASTE, DELETE)
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
    // Fundo escuro estilo CutePDF (#2b2b2b) e overflow-auto para a "rodagem" funcionar
    <div 
      className="editor-canvas-wrapper flex justify-center items-start min-h-screen bg-[#2b2b2b] overflow-auto" 
      ref={containerRef}
      style={{ padding: '40px' }} // Padding garante que tenha espaço ao rodar pra cima/baixo
    >
      
      {isLoading ? (
        <div className="flex flex-col items-center gap-3 mt-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
          <p className="text-sm text-gray-300">Preparando editor...</p>
        </div>
      ) : !pdfBytes ? (
        <div className="mt-20 text-center p-20 border-2 border-dashed border-gray-600 rounded-lg max-w-md bg-[#333]">
           <p className="text-gray-400 font-medium">Nenhum PDF carregado</p>
        </div>
      ) : (
        /* A FOLHA: Fundo branco, pontas quadradas, sombra escura igual ao CutePDF */
        <div 
          key={`canvas-wrapper-${currentPage}`}
          id="canvas-container"
          className="relative bg-white shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex-shrink-0"
          style={{ width: canvasSize.width, height: canvasSize.height }}
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          
          {/* O segredo pra não esticar: o width e height vem direto do JS em px */}
          <canvas 
            ref={pdfCanvasRef} 
            className="absolute top-0 left-0 pointer-events-none" 
            style={{ zIndex: 1, width: canvasSize.width, height: canvasSize.height }} 
          />
          
          <div className="absolute top-0 left-0" style={{ zIndex: 2, width: canvasSize.width, height: canvasSize.height }}>
            <canvas ref={canvasRef} />
          </div>
          
          {isDragActive && (
            <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center border-4 border-white border-dashed m-2">
               <p className="bg-white px-6 py-3 shadow-xl font-bold text-black">Solte para inserir imagem</p>
            </div>
          )}
        </div>
      )}

      {/* Navegação de página flutuante na parte inferior */}
      {pdfDoc && pdfDoc.numPages > 1 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-[#1e1e1e] shadow-[0_5px_15px_rgba(0,0,0,0.8)] border border-gray-700 rounded px-6 py-3 z-50 text-white">
          <button 
            className="p-1 px-3 hover:bg-gray-700 disabled:opacity-30 transition-all font-bold" 
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} 
            disabled={currentPage === 0}
          >
            ← Anterior
          </button>
          
          <div className="flex flex-col items-center min-w-[100px]">
             <span className="text-sm font-medium">
               {currentPage + 1} / {pdfDoc.numPages}
             </span>
          </div>

          <button 
            className="p-1 px-3 hover:bg-gray-700 disabled:opacity-30 transition-all font-bold" 
            onClick={() => setCurrentPage(Math.min(pdfDoc.numPages - 1, currentPage + 1))} 
            disabled={currentPage >= pdfDoc.numPages - 1}
          >
            Próximo →
          </button>
        </div>
      )}
    </div>
  )
}
