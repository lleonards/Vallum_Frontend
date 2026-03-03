import { create } from 'zustand'

export type ToolType =
  | 'select'
  | 'text'
  | 'image'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'pen'
  | 'eraser'
  | 'pan'
  | 'zoom'

export interface PageState {
  index: number
  width: number
  height: number
  rotation: number
  fabricJson?: string
}

export interface EditorState {
  // Document
  pdfFile: File | null
  pdfBytes: ArrayBuffer | null
  pdfName: string
  pages: PageState[]
  currentPage: number
  totalPages: number

  // Editor tool
  activeTool: ToolType
  zoom: number
  isLoading: boolean
  isSaving: boolean
  hasChanges: boolean

  // Selection
  selectedObjectIds: string[]

  // Text properties
  fontFamily: string
  fontSize: number
  fontColor: string
  fontBold: boolean
  fontItalic: boolean
  fontUnderline: boolean
  textAlign: 'left' | 'center' | 'right'

  // Shape properties
  fillColor: string
  strokeColor: string
  strokeWidth: number
  opacity: number

  // Sidebar
  sidebarTab: 'pages' | 'layers' | 'elements'
  showSidebar: boolean
  showProperties: boolean

  // Actions
  setPdfFile: (file: File | null) => void
  setPdfBytes: (bytes: ArrayBuffer | null) => void
  setPdfName: (name: string) => void
  setPages: (pages: PageState[]) => void
  setCurrentPage: (page: number) => void
  setTotalPages: (total: number) => void
  setActiveTool: (tool: ToolType) => void
  setZoom: (zoom: number) => void
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setHasChanges: (hasChanges: boolean) => void
  setSelectedObjectIds: (ids: string[]) => void
  setFontFamily: (family: string) => void
  setFontSize: (size: number) => void
  setFontColor: (color: string) => void
  setFontBold: (bold: boolean) => void
  setFontItalic: (italic: boolean) => void
  setFontUnderline: (underline: boolean) => void
  setTextAlign: (align: 'left' | 'center' | 'right') => void
  setFillColor: (color: string) => void
  setStrokeColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  setOpacity: (opacity: number) => void
  setSidebarTab: (tab: 'pages' | 'layers' | 'elements') => void
  setShowSidebar: (show: boolean) => void
  setShowProperties: (show: boolean) => void
  updatePage: (index: number, data: Partial<PageState>) => void
  reset: () => void
}

const defaultState = {
  pdfFile: null,
  pdfBytes: null,
  pdfName: 'Documento',
  pages: [],
  currentPage: 0,
  totalPages: 0,
  activeTool: 'select' as ToolType,
  zoom: 1,
  isLoading: false,
  isSaving: false,
  hasChanges: false,
  selectedObjectIds: [],
  fontFamily: 'Arial',
  fontSize: 14,
  fontColor: '#000000',
  fontBold: false,
  fontItalic: false,
  fontUnderline: false,
  textAlign: 'left' as const,
  fillColor: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 1,
  opacity: 1,
  sidebarTab: 'pages' as const,
  showSidebar: true,
  showProperties: true,
}

export const useEditorStore = create<EditorState>((set) => ({
  ...defaultState,
  setPdfFile: (pdfFile) => set({ pdfFile }),
  setPdfBytes: (pdfBytes) => set({ pdfBytes }),
  setPdfName: (pdfName) => set({ pdfName }),
  setPages: (pages) => set({ pages }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.25), 4) }),
  setLoading: (isLoading) => set({ isLoading }),
  setSaving: (isSaving) => set({ isSaving }),
  setHasChanges: (hasChanges) => set({ hasChanges }),
  setSelectedObjectIds: (selectedObjectIds) => set({ selectedObjectIds }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setFontSize: (fontSize) => set({ fontSize }),
  setFontColor: (fontColor) => set({ fontColor }),
  setFontBold: (fontBold) => set({ fontBold }),
  setFontItalic: (fontItalic) => set({ fontItalic }),
  setFontUnderline: (fontUnderline) => set({ fontUnderline }),
  setTextAlign: (textAlign) => set({ textAlign }),
  setFillColor: (fillColor) => set({ fillColor }),
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setOpacity: (opacity) => set({ opacity }),
  setSidebarTab: (sidebarTab) => set({ sidebarTab }),
  setShowSidebar: (showSidebar) => set({ showSidebar }),
  setShowProperties: (showProperties) => set({ showProperties }),
  updatePage: (index, data) => set((state) => ({
    pages: state.pages.map((p, i) => i === index ? { ...p, ...data } : p),
  })),
  reset: () => set(defaultState),
}))
