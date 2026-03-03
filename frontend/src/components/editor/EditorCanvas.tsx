import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditorStore } from '@/store/editorStore'
import * as fabric from 'fabric'
import * as pdfjsLib from 'pdfjs-dist'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

export default function EditorCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null)
  
  const {
    pdfBytes, zoom, activeTool, currentPage, setTotalPages,
    setPages, setCurrentPage, pages, setLoading, setHasChanges,
    fontFamily, fontSize, fontColor, fontBold, fontItalic, fontUnderline, textAlign,
    fillColor, strokeColor, strokeWidth, updatePage
  } = useEditorStore()

  const [canvasSize, setCanvasSize] = useState({ width: 794, height: 1122 }) // A4 default
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const isDrawing = useRef(false)
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  // Load PDF
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
    }).catch(() => {
      toast.error('Erro ao carregar PDF')
      setLoading(false)
    })
  }, [pdfBytes, setTotalPages, setPages, setLoading])

  // Render current page
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

  // Initialize Fabric.js
  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = new fabric.Canvas(canvasRef.current, {
      selection: true,
      preserveObjectStacking: true,
    })
    
    fabricRef.current = canvas

    // Object selection handler
    canvas.on('selection:created', (e) => {
      setHasChanges(true)
    })

    canvas.on('object:modified', () => {
      setHasChanges(true)
      saveCanvasState()
    })

    canvas.on('object:added', () => {
      setHasChanges(true)
    })

    // Canvas click for text/shape tools
    canvas.on('mouse:down', (opt) => {
      const pointer = canvas.getPointer(opt.e)
      handleCanvasClick(pointer, opt)
    })

    canvas.on('mouse:move', (opt) => {
      if (activeTool === 'pan' && isDragging.current) {
        const e = opt.e as MouseEvent
        const dx = e.clientX - lastPos.current.x
        const dy = e.clientY - lastPos.current.y
        canvas.relativePan(new fabric.Point(dx, dy))
        lastPos.current = { x: e.clientX, y: e.clientY }
      }
    })

    canvas.on('mouse:up', () => {
      isDragging.current = false
    })

    return () => {
      canvas.dispose()
      fabricRef.current = null
    }
  }, [])

  // Update canvas size when page renders
  useEffect(() => {
    if (!fabricRef.current) return
    fabricRef.current.setWidth(canvasSize.width)
    fabricRef.current.setHeight(canvasSize.height)
    fabricRef.current.renderAll()
  }, [canvasSize])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fabricRef.current) return
      const canvas = fabricRef.current

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          const activeObjs = canvas.getActiveObjects()
          activeObjs.forEach((obj) => canvas.remove(obj))
          canvas.discardActiveObject()
          canvas.renderAll()
          setHasChanges(true)
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        // TODO: Implement undo with history
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

      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        canvas.getObjects().forEach((obj) => canvas.setActiveObject(obj))
        canvas.renderAll()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setHasChanges])

  const saveCanvasState = useCallback(() => {
    if (!fabricRef.current) return
    const json = JSON.stringify(fabricRef.current.toJSON())
    updatePage(currentPage, { fabricJson: json })
  }, [currentPage, updatePage])

  const handleCanvasClick = useCallback((pointer: { x: number; y: number }, opt: any) => {
    const canvas = fabricRef.current
    if (!canvas) return

    if (activeTool === 'text') {
      // Check if clicking on existing object
      const target = canvas.findTarget(opt.e)
      if (target && target.type === 'textbox') return // Let fabric handle it

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
        splitByGrapheme: false,
      })

      canvas.add(text)
      canvas.setActiveObject(text)
      text.enterEditing()
      canvas.renderAll()
      return
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
        rx: 4,
        ry: 4,
      })
      canvas.add(rect)
      canvas.setActiveObject(rect)
      canvas.renderAll()
      return
    }

    if (activeTool === 'circle') {
      const circle = new fabric.Ellipse({
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
      const line = new fabric.Line([pointer.x, pointer.y, pointer.x + 100, pointer.y], {
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

  // Update tool mode on fabric canvas
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
    } else if (activeTool === 'text') {
      canvas.selection = true
      canvas.defaultCursor = 'text'
    } else if (activeTool === 'select') {
      canvas.selection = true
      canvas.defaultCursor = 'default'
    } else {
      canvas.selection = false
      canvas.defaultCursor = 'crosshair'
    }
  }, [activeTool, strokeColor, strokeWidth])

  // Drop image onto canvas
  const onDropImage = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file || !fabricRef.current) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      fabric.Image.fromURL(dataUrl, (img) => {
        if (!fabricRef.current) return
        const canvas = fabricRef.current

        // Scale image to fit within canvas if too large
        const maxW = canvas.getWidth() * 0.5
        const maxH = canvas.getHeight() * 0.5
        if (img.width! > maxW || img.height! > maxH) {
          const scale = Math.min(maxW / img.width!, maxH / img.height!)
          img.scale(scale)
        }

        img.set({
          left: (canvas.getWidth() - img.getScaledWidth()) / 2,
          top: (canvas.getHeight() - img.getScaledHeight()) / 2,
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

  // Image tool click - open file picker
  const handleImageToolClick = useCallback(() => {
    if (activeTool !== 'image') return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) onDropImage([file])
    }
    input.click()
  }, [activeTool, onDropImage])

  const { isLoading } = useEditorStore()

  return (
    <div className="editor-canvas-wrapper flex items-center justify-center p-8" ref={containerRef}>
      {isLoading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="loader w-10 h-10" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Carregando documento...</p>
        </div>
      ) : !pdfBytes ? (
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 dark:bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">Nenhum documento aberto</p>
          <p className="text-gray-400 text-sm">Faça upload de um PDF para começar a editar</p>
        </div>
      ) : (
        <div
          className="relative page-shadow"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
          }}
          {...getRootProps()}
          onClick={activeTool === 'image' ? handleImageToolClick : undefined}
        >
          <input {...getInputProps()} />
          
          {/* PDF render canvas (background) */}
          <canvas
            ref={pdfCanvasRef}
            className="pdf-page-canvas"
            style={{ width: canvasSize.width, height: canvasSize.height }}
          />

          {/* Fabric.js interactive canvas (overlay) */}
          <canvas
            ref={canvasRef}
            className="fabric-canvas-container"
            style={{ width: canvasSize.width, height: canvasSize.height }}
          />

          {/* Drag overlay */}
          {isDragActive && (
            <div className="absolute inset-0 z-20 drag-overlay rounded-none">
              <p className="text-primary-600 font-medium">Solte a imagem aqui</p>
            </div>
          )}
        </div>
      )}

      {/* Page navigation */}
      {pdfDoc && pdfDoc.numPages > 1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 
                        bg-white dark:bg-dark-800 shadow-lg border border-gray-200 dark:border-dark-600 
                        rounded-full px-4 py-2 z-30">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="toolbar-btn rounded-full disabled:opacity-40"
          >
            ‹
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[80px] text-center font-medium">
            {currentPage + 1} / {pdfDoc.numPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(pdfDoc.numPages - 1, currentPage + 1))}
            disabled={currentPage >= pdfDoc.numPages - 1}
            className="toolbar-btn rounded-full disabled:opacity-40"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
