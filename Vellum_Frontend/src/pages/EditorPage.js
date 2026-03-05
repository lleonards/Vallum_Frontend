import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fabric } from 'fabric';
import api from '../services/api';
import toast from 'react-hot-toast';
import EditorToolbar from '../components/Editor/Toolbar';
import EditorSidebar from '../components/Editor/Sidebar';
import ZoomControls from '../components/Editor/ZoomControls';
import DownloadModal from '../components/Editor/DownloadModal';
import VellumLogo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const CANVAS_WIDTH = 794;  // A4 width in px at 96dpi
const CANVAS_HEIGHT = 1123; // A4 height
const AUTOSAVE_INTERVAL = 30000; // 30s

const EditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();

  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const containerRef = useRef(null);
  const autosaveTimer = useRef(null);
  const isPanning = useRef(false);
  const lastPanPoint = useRef(null);

  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('Documento sem título');
  const [editingTitle, setEditingTitle] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedObject, setSelectedObject] = useState(null);
  const [showDownload, setShowDownload] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('insert'); // insert | style | pages
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ─── Init Fabric Canvas ───────────────────────────────────────────────────
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
      stopContextMenu: true,
      fireRightClick: true,
    });

    fabricRef.current = canvas;

    // Selection events
    canvas.on('selection:created', (e) => setSelectedObject(e.selected?.[0] || null));
    canvas.on('selection:updated', (e) => setSelectedObject(e.selected?.[0] || null));
    canvas.on('selection:cleared', () => setSelectedObject(null));
    canvas.on('object:modified', () => scheduleAutosave());
    canvas.on('object:added', () => scheduleAutosave());
    canvas.on('object:removed', () => scheduleAutosave());

    // Mouse wheel zoom
    canvas.on('mouse:wheel', (opt) => {
      opt.e.preventDefault();
      opt.e.stopPropagation();
      const delta = opt.e.deltaY;
      let z = canvas.getZoom();
      z *= 0.999 ** delta;
      z = Math.min(Math.max(z, 0.05), 15); // 5% to 1500%
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, z);
      setZoom(z);
    });

    // Alt + drag to pan
    canvas.on('mouse:down', (opt) => {
      if (opt.e.altKey) {
        isPanning.current = true;
        lastPanPoint.current = { x: opt.e.clientX, y: opt.e.clientY };
        canvas.selection = false;
        canvas.setCursor('grabbing');
      }
    });

    canvas.on('mouse:move', (opt) => {
      if (isPanning.current && lastPanPoint.current) {
        const delta = new fabric.Point(
          opt.e.clientX - lastPanPoint.current.x,
          opt.e.clientY - lastPanPoint.current.y
        );
        canvas.relativePan(delta);
        lastPanPoint.current = { x: opt.e.clientX, y: opt.e.clientY };
      }
    });

    canvas.on('mouse:up', () => {
      isPanning.current = false;
      lastPanPoint.current = null;
      canvas.selection = true;
      canvas.setCursor('default');
    });

    // Touch zoom for mobile
    let touchStartDist = null;
    canvas.upperCanvasEl.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    canvas.upperCanvasEl.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && touchStartDist) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scale = dist / touchStartDist;
        const z = Math.min(Math.max(canvas.getZoom() * scale, 0.05), 15);
        canvas.setZoom(z);
        setZoom(z);
        touchStartDist = dist;
      }
    }, { passive: true });

    // Keyboard shortcuts
    const handleKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDocument();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        // Undo - Fabric doesn't have built-in undo, but we handle via history
        e.preventDefault();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (canvas.getActiveObject() && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          const obj = canvas.getActiveObject();
          if (obj && !obj.isEditing) {
            canvas.remove(obj);
            canvas.requestRenderAll();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeydown);

    // Resize handler
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []); // eslint-disable-line

  // ─── Load Document ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const loadDoc = async () => {
      try {
        const res = await api.get(`/documents/${id}`);
        const doc = res.data;
        setDocument(doc);
        setTitle(doc.title);

        if (fabricRef.current && doc.canvas_data) {
          fabricRef.current.loadFromJSON(doc.canvas_data, () => {
            fabricRef.current.requestRenderAll();
          });
        } else if (fabricRef.current && doc.content) {
          // Load text content into canvas
          loadTextContent(doc.content);
        }
      } catch {
        toast.error('Erro ao carregar documento');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDoc();
  }, [id]); // eslint-disable-line

  const loadTextContent = (text) => {
    if (!fabricRef.current || !text) return;
    const lines = text.split('\n').filter(l => l.trim());
    let y = 40;
    lines.forEach((line, i) => {
      const isTitle = i === 0 && lines.length > 1;
      const textObj = new fabric.Textbox(line, {
        left: 40,
        top: y,
        width: CANVAS_WIDTH - 80,
        fontSize: isTitle ? 22 : 14,
        fontWeight: isTitle ? 'bold' : 'normal',
        fontFamily: 'Arial',
        fill: '#1a1a1a',
        lineHeight: 1.5,
        padding: 2,
      });
      fabricRef.current.add(textObj);
      y += textObj.getScaledHeight() + 8;
    });
    fabricRef.current.requestRenderAll();
  };

  // ─── Autosave ──────────────────────────────────────────────────────────────
  const scheduleAutosave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(saveDocument, AUTOSAVE_INTERVAL);
  }, []); // eslint-disable-line

  const saveDocument = useCallback(async () => {
    if (!id || !fabricRef.current) return;
    setSaving(true);
    try {
      const canvasData = fabricRef.current.toJSON(['id', 'name', 'selectable']);
      await api.put(`/documents/${id}`, {
        title,
        canvasData,
        content: extractTextFromCanvas()
      });
    } catch {
      // Silent fail for autosave
    } finally {
      setSaving(false);
    }
  }, [id, title]); // eslint-disable-line

  const extractTextFromCanvas = () => {
    if (!fabricRef.current) return '';
    const objects = fabricRef.current.getObjects();
    return objects
      .filter(o => o.type === 'textbox' || o.type === 'text' || o.type === 'i-text')
      .map(o => o.text || '')
      .join('\n');
  };

  // ─── Zoom Controls ─────────────────────────────────────────────────────────
  const setZoomLevel = (value) => {
    if (!fabricRef.current) return;
    const z = Math.min(Math.max(value, 0.05), 15);
    const center = fabricRef.current.getCenter();
    fabricRef.current.zoomToPoint({ x: center.left, y: center.top }, z);
    setZoom(z);
  };

  const fitToScreen = () => {
    if (!fabricRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const padding = 80;
    const scaleX = (container.clientWidth - padding) / CANVAS_WIDTH;
    const scaleY = (container.clientHeight - padding) / CANVAS_HEIGHT;
    const z = Math.min(scaleX, scaleY, 1);
    fabricRef.current.setZoom(z);
    fabricRef.current.setViewportTransform([z, 0, 0, z, (container.clientWidth - CANVAS_WIDTH * z) / 2, 20]);
    setZoom(z);
  };

  // Auto fit on load
  useEffect(() => {
    if (!loading) {
      setTimeout(fitToScreen, 100);
    }
  }, [loading]); // eslint-disable-line

  // ─── Toolbar actions ───────────────────────────────────────────────────────
  const addText = (type = 'body') => {
    if (!fabricRef.current) return;
    const styles = {
      heading: { text: 'Título', fontSize: 32, fontWeight: 'bold', top: 60 },
      subheading: { text: 'Subtítulo', fontSize: 22, fontWeight: '600', top: 100 },
      body: { text: 'Clique para editar este texto', fontSize: 16, fontWeight: 'normal', top: 140 },
      caption: { text: 'Legenda ou nota de rodapé', fontSize: 12, fontWeight: 'normal', top: 160 }
    };
    const style = styles[type] || styles.body;
    const textObj = new fabric.Textbox(style.text, {
      left: 100,
      top: style.top,
      width: CANVAS_WIDTH - 200,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontFamily: 'Arial',
      fill: isDark ? '#ffffff' : '#1a1a1a',
      lineHeight: 1.5,
      padding: 4,
      editable: true
    });
    fabricRef.current.add(textObj);
    fabricRef.current.setActiveObject(textObj);
    fabricRef.current.requestRenderAll();
    textObj.enterEditing();
  };

  const addImage = (url) => {
    if (!fabricRef.current || !url) return;
    fabric.Image.fromURL(url, (img) => {
      const maxW = CANVAS_WIDTH - 80;
      if (img.width > maxW) {
        img.scale(maxW / img.width);
      }
      img.set({ left: 40, top: 100, cornerSize: 8 });
      fabricRef.current.add(img);
      fabricRef.current.setActiveObject(img);
      fabricRef.current.requestRenderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const addImageFromUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => addImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const addShape = (shape) => {
    if (!fabricRef.current) return;
    let obj;
    const props = {
      left: CANVAS_WIDTH / 2 - 60,
      top: CANVAS_HEIGHT / 2 - 60,
      fill: 'rgba(61,61,61,0.15)',
      stroke: '#3d3d3d',
      strokeWidth: 2,
    };
    if (shape === 'rect') {
      obj = new fabric.Rect({ ...props, width: 120, height: 80, rx: 4, ry: 4 });
    } else if (shape === 'circle') {
      obj = new fabric.Circle({ ...props, radius: 50 });
    } else if (shape === 'triangle') {
      obj = new fabric.Triangle({ ...props, width: 100, height: 100 });
    } else if (shape === 'line') {
      obj = new fabric.Line([100, 300, 400, 300], {
        stroke: '#3d3d3d', strokeWidth: 2, selectable: true
      });
    }
    if (obj) {
      fabricRef.current.add(obj);
      fabricRef.current.setActiveObject(obj);
      fabricRef.current.requestRenderAll();
    }
  };

  const addBackground = (color) => {
    if (!fabricRef.current) return;
    fabricRef.current.setBackgroundColor(color, () => {
      fabricRef.current.requestRenderAll();
      scheduleAutosave();
    });
  };

  // Style updates for selected object
  const updateStyle = (props) => {
    const obj = fabricRef.current?.getActiveObject();
    if (!obj) return;
    obj.set(props);
    fabricRef.current.requestRenderAll();
    scheduleAutosave();
  };

  const handleTitleSave = async () => {
    setEditingTitle(false);
    if (id) {
      try {
        await api.patch(`/documents/${id}/rename`, { title });
        toast.success('Título salvo');
      } catch {
        toast.error('Erro ao salvar título');
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg-secondary)', flexDirection: 'column', gap: 16
      }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Carregando documento...</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden',
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)'
    }}>
      {/* ─── Editor Header ─── */}
      <div style={{
        height: 'var(--header-height)',
        background: 'var(--header-bg)',
        borderBottom: '1.5px solid var(--border-color)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 12,
        flexShrink: 0, zIndex: 50
      }}>
        {/* Back & Logo */}
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate('/dashboard')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div style={{ color: 'var(--text-primary)', flexShrink: 0 }}>
          <VellumLogo size={22} showText={!isMobile} />
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border-color)', margin: '0 4px' }} />

        {/* Document Title */}
        {editingTitle ? (
          <input
            className="input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') { setTitle(document?.title || 'Documento sem título'); setEditingTitle(false); } }}
            autoFocus
            style={{ maxWidth: 260, height: 32, fontSize: 14, padding: '0 10px' }}
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="btn btn-ghost btn-sm"
            style={{ fontWeight: 500, fontSize: 14, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {title}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5, flexShrink: 0 }}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}

        {/* Saving indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12, flexShrink: 0 }}>
          {saving ? (
            <><div className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} /> Salvando...</>
          ) : id ? (
            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Salvo</>
          ) : null}
        </div>

        <div style={{ flex: 1 }} />

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <ThemeToggle size="sm" />

          <button
            className="btn btn-ghost btn-sm"
            onClick={saveDocument}
            disabled={saving}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            {!isMobile && 'Salvar'}
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowDownload(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {!isMobile && 'Download'}
          </button>

          {!isMobile && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setSidebarOpen(p => !p)}
              data-tooltip="Alternar painel"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ─── Toolbar ─── */}
      <EditorToolbar
        canvas={fabricRef.current}
        selectedObject={selectedObject}
        onAddText={addText}
        onAddImageUpload={addImageFromUpload}
        onAddShape={addShape}
        onUpdateStyle={updateStyle}
        onUndo={() => {}}
        onRedo={() => {}}
        isMobile={isMobile}
      />

      {/* ─── Main Body ─── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        {!isMobile && sidebarOpen && (
          <EditorSidebar
            canvas={fabricRef.current}
            selectedObject={selectedObject}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onAddText={addText}
            onAddImageUpload={addImageFromUpload}
            onAddShape={addShape}
            onAddBackground={addBackground}
            onUpdateStyle={updateStyle}
          />
        )}

        {/* Canvas Area */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            overflow: 'auto',
            background: 'var(--canvas-bg)',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: 40
          }}
        >
          <div style={{
            boxShadow: '0 4px 32px rgba(0,0,0,0.2)',
            borderRadius: 2,
            display: 'inline-block',
            lineHeight: 0
          }}>
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Properties Panel (mobile bottom sheet or right panel) */}
        {isMobile && selectedObject && (
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--card-bg)',
            borderTop: '1.5px solid var(--border-color)',
            borderRadius: '16px 16px 0 0',
            padding: '16px',
            zIndex: 80,
            maxHeight: '40vh',
            overflowY: 'auto'
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Propriedades</h4>
            <MobileStylePanel selectedObject={selectedObject} onUpdateStyle={updateStyle} />
          </div>
        )}
      </div>

      {/* ─── Zoom Controls ─── */}
      <ZoomControls
        zoom={zoom}
        onZoomIn={() => setZoomLevel(zoom * 1.2)}
        onZoomOut={() => setZoomLevel(zoom / 1.2)}
        onFitScreen={fitToScreen}
        onResetZoom={() => setZoomLevel(1)}
        onSetZoom={setZoomLevel}
      />

      {/* Download Modal */}
      {showDownload && (
        <DownloadModal
          onClose={() => setShowDownload(false)}
          canvas={fabricRef.current}
          title={title}
          content={extractTextFromCanvas()}
        />
      )}
    </div>
  );
};

// Compact mobile style panel
const MobileStylePanel = ({ selectedObject, onUpdateStyle }) => {
  if (!selectedObject) return null;
  const isText = ['textbox', 'text', 'i-text'].includes(selectedObject.type);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {isText && (
        <>
          <div>
            <label className="label">Tamanho</label>
            <input type="number" className="input" style={{ width: 80 }}
              value={selectedObject.fontSize || 16}
              onChange={e => onUpdateStyle({ fontSize: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">Cor do Texto</label>
            <input type="color" style={{ width: 40, height: 36, borderRadius: 6, border: 'none', cursor: 'pointer' }}
              value={selectedObject.fill || '#000000'}
              onChange={e => onUpdateStyle({ fill: e.target.value })}
            />
          </div>
        </>
      )}
      <div>
        <label className="label">Opacidade</label>
        <input type="range" min="0" max="1" step="0.05"
          value={selectedObject.opacity || 1}
          onChange={e => onUpdateStyle({ opacity: parseFloat(e.target.value) })}
          style={{ width: 120 }}
        />
      </div>
    </div>
  );
};

export default EditorPage;
