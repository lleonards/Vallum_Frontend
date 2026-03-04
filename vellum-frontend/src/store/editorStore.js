import { create } from 'zustand';

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  profile: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setProfile: (profile) => set({ profile }),
}));

// ─── Editor Store ─────────────────────────────────────────────────────────────
export const useEditorStore = create((set, get) => ({
  // Document
  documentId: null,
  documentTitle: 'Documento sem título',
  isSaving: false,
  lastSaved: null,

  // Pages
  pages: [{ id: 'page-1', fabricJSON: null }],
  currentPageIndex: 0,

  // Tools
  activeTool: 'select',    // select | text | image | rect | circle | line | pan
  activeTextFormat: {
    fontFamily: 'Arial',
    fontSize: 16,
    bold: false,
    italic: false,
    underline: false,
    color: '#111111',
    align: 'left',
  },

  // Fabric canvas instances (map: pageId → canvas)
  canvasMap: {},

  // History (per page)
  historyMap: {},
  historyIndexMap: {},

  // ── Setters ────────────────────────────────────────────────────────────────
  setDocumentId: (id) => set({ documentId: id }),
  setDocumentTitle: (title) => set({ documentTitle: title }),
  setIsSaving: (v) => set({ isSaving: v }),
  setLastSaved: (d) => set({ lastSaved: d }),
  setActiveTool: (tool) => set({ activeTool: tool }),

  setTextFormat: (key, value) => set((s) => ({
    activeTextFormat: { ...s.activeTextFormat, [key]: value },
  })),

  setCurrentPage: (idx) => set({ currentPageIndex: idx }),

  // ── Canvas Registration ────────────────────────────────────────────────────
  registerCanvas: (pageId, canvas) => set((s) => ({
    canvasMap: { ...s.canvasMap, [pageId]: canvas },
    historyMap: { ...s.historyMap, [pageId]: [] },
    historyIndexMap: { ...s.historyIndexMap, [pageId]: -1 },
  })),

  unregisterCanvas: (pageId) => set((s) => {
    const { [pageId]: _, ...canvasMap } = s.canvasMap;
    return { canvasMap };
  }),

  getActiveCanvas: () => {
    const { pages, currentPageIndex, canvasMap } = get();
    const pageId = pages[currentPageIndex]?.id;
    return canvasMap[pageId] || null;
  },

  // ── History ────────────────────────────────────────────────────────────────
  pushHistory: (pageId, json) => set((s) => {
    const history = [...(s.historyMap[pageId] || [])];
    const idx = s.historyIndexMap[pageId] ?? -1;
    const newHistory = history.slice(0, idx + 1);
    newHistory.push(json);
    if (newHistory.length > 50) newHistory.shift();
    return {
      historyMap: { ...s.historyMap, [pageId]: newHistory },
      historyIndexMap: { ...s.historyIndexMap, [pageId]: newHistory.length - 1 },
    };
  }),

  undo: () => {
    const { pages, currentPageIndex, canvasMap, historyMap, historyIndexMap } = get();
    const pageId = pages[currentPageIndex]?.id;
    const canvas = canvasMap[pageId];
    const history = historyMap[pageId] || [];
    const idx = historyIndexMap[pageId] ?? -1;
    if (!canvas || idx <= 0) return;
    const newIdx = idx - 1;
    canvas.loadFromJSON(history[newIdx], () => canvas.renderAll());
    set((s) => ({ historyIndexMap: { ...s.historyIndexMap, [pageId]: newIdx } }));
  },

  redo: () => {
    const { pages, currentPageIndex, canvasMap, historyMap, historyIndexMap } = get();
    const pageId = pages[currentPageIndex]?.id;
    const canvas = canvasMap[pageId];
    const history = historyMap[pageId] || [];
    const idx = historyIndexMap[pageId] ?? -1;
    if (!canvas || idx >= history.length - 1) return;
    const newIdx = idx + 1;
    canvas.loadFromJSON(history[newIdx], () => canvas.renderAll());
    set((s) => ({ historyIndexMap: { ...s.historyIndexMap, [pageId]: newIdx } }));
  },

  // ── Pages ──────────────────────────────────────────────────────────────────
  addPage: () => set((s) => {
    const newId = `page-${Date.now()}`;
    return {
      pages: [...s.pages, { id: newId, fabricJSON: null }],
      currentPageIndex: s.pages.length,
    };
  }),

  deletePage: (idx) => set((s) => {
    if (s.pages.length <= 1) return s;
    const pages = s.pages.filter((_, i) => i !== idx);
    const currentPageIndex = Math.min(s.currentPageIndex, pages.length - 1);
    return { pages, currentPageIndex };
  }),

  // ── Get all pages JSON ─────────────────────────────────────────────────────
  getPagesJSON: () => {
    const { pages, canvasMap } = get();
    return pages.map((page) => {
      const canvas = canvasMap[page.id];
      return {
        id: page.id,
        fabricJSON: canvas ? canvas.toJSON() : page.fabricJSON,
      };
    });
  },

  // ── Load document ──────────────────────────────────────────────────────────
  loadDocument: (doc) => {
    const pages = doc.content?.pages || [{ id: 'page-1', fabricJSON: null }];
    set({
      documentId: doc.id,
      documentTitle: doc.title,
      pages,
      currentPageIndex: 0,
      canvasMap: {},
      historyMap: {},
      historyIndexMap: {},
    });
  },

  // Reset
  resetEditor: () => set({
    documentId: null,
    documentTitle: 'Documento sem título',
    pages: [{ id: 'page-1', fabricJSON: null }],
    currentPageIndex: 0,
    canvasMap: {},
    historyMap: {},
    historyIndexMap: {},
    activeTool: 'select',
  }),
}));
