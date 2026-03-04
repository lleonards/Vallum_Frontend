import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Download, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import { fabric } from 'fabric';

import { useEditorStore, useAuthStore } from '../store/editorStore';
import { documentsApi, convertApi } from '../lib/api';
import CanvasEditor from '../components/Editor/CanvasEditor';
import Toolbar      from '../components/Editor/Toolbar';
import LeftPanel    from '../components/Editor/LeftPanel';
import RightPanel   from '../components/Editor/RightPanel';
import Logo         from '../components/Common/Logo';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const { user } = useAuthStore();

  const {
    pages,
    currentPageIndex,
    setCurrentPage,
    documentTitle,
    setDocumentTitle,
    documentId,
    loadDocument,
    resetEditor,
    isSaving,
    setIsSaving,
    setLastSaved,
    lastSaved,
    getPagesJSON,
    getActiveCanvas,
    canvasMap,
    addPage,
  } = useEditorStore();

  const [loading, setLoading] = useState(true);
  const titleInputRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  // ── Load document on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      resetEditor();
      if (id && id !== 'new') {
        try {
          const { data } = await documentsApi.get(id);
          loadDocument(data.document);
        } catch (err) {
          toast.error('Erro ao carregar documento');
          navigate('/dashboard');
        }
      }
      setLoading(false);
    };
    init();
    return () => { if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current); };
  }, [id]);

  // ── Auto-save every 30s ────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    autoSaveTimerRef.current = setInterval(() => {
      handleSave(true);
    }, 30000);
    return () => clearInterval(autoSaveTimerRef.current);
  }, [loading, documentTitle, pages]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async (silent = false) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const pagesJSON = getPagesJSON();
      const content = { pages: pagesJSON };

      if (documentId) {
        await documentsApi.update(documentId, { title: documentTitle, content });
      } else {
        const { data } = await documentsApi.create({ title: documentTitle, content });
        useEditorStore.getState().setDocumentId(data.document.id);
        navigate(`/editor/${data.document.id}`, { replace: true });
      }

      setLastSaved(new Date());
      if (!silent) toast.success('Documento salvo!');
    } catch (err) {
      if (err.response?.data?.upgrade) {
        toast.error('Limite de documentos gratuitos atingido! Faça upgrade para Pro.', { duration: 6000 });
        navigate('/pricing');
      } else {
        toast.error('Erro ao salvar: ' + (err.response?.data?.error || err.message));
      }
    } finally {
      setIsSaving(false);
    }
  }, [documentId, documentTitle, isSaving]);

  // ── Export to PDF ──────────────────────────────────────────────────────────
  const handleExportPDF = useCallback(async () => {
    const toastId = toast.loading('Gerando PDF…');
    try {
      const pdf = new jsPDF({ unit: 'px', format: [794, 1123], compress: true });

      for (let i = 0; i < pages.length; i++) {
        const canvas = canvasMap[pages[i].id];
        if (!canvas) continue;

        if (i > 0) pdf.addPage([794, 1123], 'p');

        const dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.9, multiplier: 1 });
        pdf.addImage(dataUrl, 'JPEG', 0, 0, 794, 1123);
      }

      pdf.save(`${documentTitle || 'documento'}.pdf`);
      toast.success('PDF exportado!', { id: toastId });
    } catch (err) {
      toast.error('Erro ao exportar PDF', { id: toastId });
    }
  }, [pages, canvasMap, documentTitle]);

  // ── Import PDF ─────────────────────────────────────────────────────────────
  const handleUploadPDF = useCallback(async (file) => {
    const toastId = toast.loading('Importando PDF…');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdfDoc.numPages;

      // Reset pages
      useEditorStore.setState({
        pages: Array.from({ length: numPages }, (_, i) => ({ id: `page-${Date.now()}-${i}`, fabricJSON: null })),
        currentPageIndex: 0,
        canvasMap: {},
      });

      // Wait for canvases to mount, then load each page
      setTimeout(async () => {
        const { pages: newPages, canvasMap: newCanvasMap } = useEditorStore.getState();

        for (let i = 0; i < numPages; i++) {
          const pdfPage = await pdfDoc.getPage(i + 1);
          const viewport = pdfPage.getViewport({ scale: 1.0 });

          // Render PDF page to canvas
          const offCanvas = document.createElement('canvas');
          const scale = 794 / viewport.width;
          const scaledVp = pdfPage.getViewport({ scale });
          offCanvas.width  = scaledVp.width;
          offCanvas.height = scaledVp.height;

          await pdfPage.render({
            canvasContext: offCanvas.getContext('2d'),
            viewport: scaledVp,
          }).promise;

          const dataUrl = offCanvas.toDataURL('image/jpeg', 0.9);
          const pageId  = newPages[i]?.id;
          const fabricCanvas = newCanvasMap[pageId];

          if (fabricCanvas) {
            fabric.Image.fromURL(dataUrl, (img) => {
              img.set({
                left: 0, top: 0,
                selectable: false,
                evented: false,
                lockMovementX: true, lockMovementY: true,
                lockScalingX: true, lockScalingY: true,
                lockRotation: true,
              });
              img.scaleToWidth(794);
              fabricCanvas.insertAt(img, 0);
              fabricCanvas.renderAll();
            });
          }
        }

        toast.success(`PDF importado! ${numPages} página(s)`, { id: toastId });
      }, 800);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao importar PDF: ' + err.message, { id: toastId });
    }
  }, []);

  // ── Keyboard shortcut Ctrl+S ───────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950 overflow-hidden">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="h-12 flex items-center gap-3 px-3 border-b
        bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shrink-0 z-40">

        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center w-7 h-7 rounded
            hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          title="Voltar ao painel"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Logo */}
        <Logo size="sm" />

        {/* Title */}
        <input
          ref={titleInputRef}
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
          className="text-sm font-medium text-gray-800 dark:text-gray-200
            bg-transparent border-none outline-none
            hover:bg-gray-50 dark:hover:bg-gray-800
            focus:bg-gray-50 dark:focus:bg-gray-800
            rounded px-2 py-1 min-w-[180px] max-w-[320px]
            transition-colors"
          placeholder="Documento sem título"
          onBlur={() => handleSave(true)}
        />

        {/* Auto-save status */}
        <span className="text-xs text-gray-400 dark:text-gray-600 hidden sm:block">
          {isSaving ? (
            <span className="flex items-center gap-1"><Loader2 size={11} className="animate-spin" /> Salvando…</span>
          ) : lastSaved ? (
            `Salvo às ${lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
          ) : ''}
        </span>

        <div className="flex-1" />

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className="w-7 h-7 flex items-center justify-center rounded
            hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          title="Alternar tema">
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Save */}
        <button
          onClick={() => handleSave()}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
            bg-brand-600 hover:bg-brand-700 disabled:opacity-60
            text-white transition-colors"
          title="Salvar (Ctrl+S)"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span className="hidden sm:inline">Salvar</span>
        </button>

        {/* Export PDF */}
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
            bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600
            text-white transition-colors"
          title="Exportar como PDF"
        >
          <Download size={14} />
          <span className="hidden sm:inline">PDF</span>
        </button>
      </header>

      {/* ── Formatting toolbar ────────────────────────────────────────────── */}
      <Toolbar />

      {/* ── Main editor area ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left tools panel */}
        <LeftPanel onUploadPDF={handleUploadPDF} />

        {/* Canvas area */}
        <main className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-800 p-8 flex flex-col items-center gap-8">
          {pages.map((page, idx) => (
            <div key={page.id} onClick={() => setCurrentPage(idx)}>
              <CanvasEditor page={page} pageIndex={idx} />
              <div className="text-center mt-2 text-xs text-gray-400 dark:text-gray-600 select-none">
                Página {idx + 1}
              </div>
            </div>
          ))}
        </main>

        {/* Right pages panel */}
        <RightPanel />
      </div>

      {/* ── Status bar ────────────────────────────────────────────────────── */}
      <footer className="h-6 flex items-center justify-between px-3 text-[11px]
        bg-brand-600 text-white/80 shrink-0 select-none">
        <span>
          Página {currentPageIndex + 1} / {pages.length}
        </span>
        <span>Vellum Editor — A4 (794 × 1123 px)</span>
        <span className="hidden sm:block">
          Alt+Arrasto = Mover • Scroll = Zoom • Ctrl+Z = Desfazer
        </span>
      </footer>
    </div>
  );
}
