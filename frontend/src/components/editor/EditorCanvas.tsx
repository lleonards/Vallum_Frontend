import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'
import * as fabric from 'fabric'
import * as pdfjsLib from 'pdfjs-dist'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

// Configuração crítica para produção
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export default function EditorCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<any>(null) // 'any' evita quebras por versão de tipos no build
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

  // 1. Carregar PDF
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

  // 2. Renderizar Página
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

  // 3. Salvar Estado (Memoizado)
  const saveCanvasState = useCallback(() => {
    if (!fabricRef.current) return
    const json = JSON.stringify(fabricRef.current.toJSON())
    updatePage(currentPage, { fabricJson: json })
  }, [currentPage, updatePage])

  // 4. Lógica de Clique e Ferramentas
  const handleCanvasClick = useCallback((pointer: { x: number; y: number }, opt: any) => {
    const canvas = fabricRef.current
    if (!canvas) return

    if (activeTool === 'text') {
      const target = canvas.findTarget(opt.e)
      if (target && target.type === 'textbox') return

      const text = new (fabric as any).Textbox('Digite aqui...', {
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
        splitByGrapheme: false,
      })

      canvas.add(text)
      canvas.setActiveObject(text)
      text.enterEditing()
      canvas.renderAll()
      return
    }

    if (activeTool === 'rectangle') {
      const rect = new (fabric as any).Rect({
        left: pointer.x,
        top: pointer.y,
        width: 100,
        height: 80,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth,
        rx: 4,
        ry: 4,
      })
      canvas.add(rect)
      canvas.setActiveObject(rect)
      canvas.renderAll()
      return
    }

    if (activeTool === 'circle') {
      const circle = new (fabric as any).Ellipse({
        left: pointer.x,
        top: pointer.y,
        rx: 50,
        ry: 40,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth,
      })
      canvas.add(circle)
      canvas.setActiveObject(circle)
      canvas.renderAll()
      return
    }

    if (activeTool === 'line') {
      const line = new (fabric as any).Line([pointer.x, pointer.y, pointer.x + 100, pointer.y], {
        stroke: strokeColor,
        strokeWidth,
      })
      canvas.add(line)
      canvas.setActiveObject(line)
      canvas.renderAll()
      return
    }

    if (activeTool === 'pan') {
      isDragging.current = true
      const e = opt.e as MouseEvent
      lastPos.current = { x: e.clientX, y: e.clientY }
      return
    }
  }, [activeTool, fontFamily, fontSize, fontColor, fontBold, fontItalic, fontUnderline, textAlign, fillColor, strokeColor, strokeWidth])

  // 5. Inicializar Fabric
  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = new (fabric as any).Canvas(canvasRef.current, {
      selection: true,
      preserveObjectStacking: true,
    })
    
    fabricRef.current = canvas

    canvas.on('selection:created', () => setHasChanges(true))
    canvas.on('object:added', () => setHasChanges(true))
    canvas.on('object:modified', () => {
      setHasChanges(true)
      saveCanvasState()
    })

    canvas.on('mouse:down', (opt: any) => {
      const pointer = canvas.getPointer(opt.e)
      handleCanvasClick(pointer, opt)
    })

    canvas.on('mouse:move', (opt: any) => {
      if (activeTool === 'pan' && isDragging.current) {
        const e = opt.e as MouseEvent
        const dx = e.clientX - lastPos.current.x
        const dy = e.clientY - lastPos.current.y
        canvas.relativePan(new (fabric as any).Point(dx, dy))
        lastPos.current = { x: e.clientX, y: e.clientY }
      }
    })

    canvas.on('mouse:up', () => { isDragging.current = false })

    return () => {
      canvas.dispose()
      fabricRef.current = null
    }
  }, [handleCanvasClick, activeTool, setHasChanges, saveCanvasState])

  // 6. Sincronizar Tamanho
  useEffect(() => {
    if (!fabricRef.current) return
    fabricRef.current.setWidth(canvasSize.width)
    fabricRef.current.setHeight(canvasSize.height)
    fabricRef.current.renderAll()
  }, [canvasSize])

  // 7. Atalhos de Teclado (Copy, Paste, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fabricRef.current) return
      const canvas = fabricRef.current

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          const activeObjs = canvas.getActiveObjects()
          activeObjs.forEach((obj: any) => canvas.remove(obj))
          canvas.discardActiveObject()
          canvas.renderAll()
          setHasChanges(true)
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        canvas.getActiveObject()?.clone((cloned: any) => {
          canvas.clipboard = cloned
        })
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (canvas.clipboard) {
          canvas.clipboard.clone((clonedObj: any) => {
            clonedObj.set({ left: clonedObj.left + 20, top: clonedObj.top + 20 })
            canvas.add(clonedObj)
            canvas.setActiveObject(clonedObj)
            canvas.renderAll()
          })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setHasChanges])

  // 8. Ferramentas (Pen mode, etc)
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    if (activeTool === 'pen') {
      canvas.isDrawingMode = true
      canvas.freeDrawingBrush.color = strokeColor
      canvas.freeDrawingBrush.width = strokeWidth
    } else {
      canvas.isDrawingMode = false
    }

    if (activeTool === 'pan' || activeTool === 'zoom') {
      canvas.selection = false
      canvas.defaultCursor = activeTool === 'pan' ? 'grab' : 'zoom-in'
    } else {
      canvas.selection = true
      canvas.defaultCursor = activeTool === 'text' ? 'text' : 'crosshair'
    }
  }, [activeTool, strokeColor, strokeWidth])

  // 9. Drop de Imagem
  const onDropImage = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file || !fabricRef.current) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      (fabric as any).Image.fromURL(dataUrl, (img: any) => {
        const canvas = fabricRef.current
        const maxW = canvas.getWidth() * 0.5
        const scale = maxW / img.width
        img.set({
          left: (canvas.getWidth() - (img.width * scale)) / 2,
          top: (canvas.getHeight() - (img.height * scale)) / 2,
          scaleX: scale,
          scaleY: scale
        })
        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
        setHasChanges(true)
        toast.success('Imagem adicionada!')
      })
    }
    reader.readAsDataURL(file)
  }, [setHasChanges])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropImage,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'] },
    noClick: activeTool !== 'image',
    noDrag: activeTool !== 'image' && activeTool !== 'select',
  })

  return (
    <div className="editor-canvas-wrapper flex items-center justify-center p-8 min-h-screen bg-gray-50 dark:bg-dark-900" ref={containerRef}>
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
        <div
          className="relative bg-white shadow-2xl transition-all duration-300"
          style={{ width: canvasSize.width, height: canvasSize.height }}
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <canvas ref={pdfCanvasRef} className="absolute inset-0 pointer-events-none" />
          <canvas ref={canvasRef} className="absolute inset-0" />
          
          {isDragActive && (
            <div className="absolute inset-0 bg-primary-500/10 z-50 flex items-center justify-center border-4 border-primary-500 border-dashed">
               <p className="bg-white px-6 py-3 rounded-xl shadow-xl font-bold text-primary-600">Solte para inserir</p>
            </div>
          )}
        </div>
      )}

      {pdfDoc && pdfDoc.numPages > 1 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 dark:bg-dark-800/90 backdrop-blur shadow-2xl border border-gray-200 dark:border-dark-700 rounded-full px-6 py-3 z-50">
          <button 
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-20 transition-colors"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            ←
          </button>
          <span className="text-sm font-bold min-w-[100px] text-center">
            PÁGINA {currentPage + 1} DE {pdfDoc.numPages}
          </span>
          <button 
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-20 transition-colors"
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
