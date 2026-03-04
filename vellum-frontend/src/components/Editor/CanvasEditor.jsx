import React, { useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { useEditorStore } from '../../store/editorStore';

const PAGE_W = 794;  // A4 @ 96dpi
const PAGE_H = 1123;

export default function CanvasEditor({ page, pageIndex }) {
  const canvasElRef  = useRef(null);
  const fabricRef    = useRef(null);
  const isPanning    = useRef(false);
  const lastPt       = useRef({ x: 0, y: 0 });
  const isDrawingText = useRef(false);

  const {
    activeTool,
    registerCanvas,
    unregisterCanvas,
    pushHistory,
    activeTextFormat,
    setActiveTool,
  } = useEditorStore();

  // ── Init canvas ───────────────────────────────────────────────────────────
  useEffect(() => {
    const el = canvasElRef.current;
    if (!el) return;

    const canvas = new fabric.Canvas(el, {
      width: PAGE_W,
      height: PAGE_H,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
      stopContextMenu: true,
      fireRightClick: true,
    });

    fabricRef.current = canvas;
    registerCanvas(page.id, canvas);

    // ── Load existing JSON ─────────────────────────────────────────────────
    if (page.fabricJSON) {
      canvas.loadFromJSON(page.fabricJSON, () => canvas.renderAll());
    }

    // ── Zoom via mouse wheel ───────────────────────────────────────────────
    canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let z = canvas.getZoom();
      z *= 0.999 ** delta;
      z = Math.min(Math.max(z, 0.1), 6);
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, z);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // ── Pan with Alt+Drag ──────────────────────────────────────────────────
    canvas.on('mouse:down', (opt) => {
      if (opt.e.altKey || useEditorStore.getState().activeTool === 'pan') {
        isPanning.current = true;
        canvas.selection = false;
        lastPt.current = { x: opt.e.clientX, y: opt.e.clientY };
        canvas.setCursor('grabbing');
        canvas.renderAll();
      }
    });

    canvas.on('mouse:move', (opt) => {
      if (isPanning.current) {
        const dx = opt.e.clientX - lastPt.current.x;
        const dy = opt.e.clientY - lastPt.current.y;
        const vpt = canvas.viewportTransform;
        vpt[4] += dx;
        vpt[5] += dy;
        canvas.requestRenderAll();
        lastPt.current = { x: opt.e.clientX, y: opt.e.clientY };
      }
    });

    canvas.on('mouse:up', () => {
      if (isPanning.current) {
        isPanning.current = false;
        canvas.selection = useEditorStore.getState().activeTool !== 'pan';
      }
    });

    // ── Click to add elements ──────────────────────────────────────────────
    canvas.on('mouse:down', (opt) => {
      const tool = useEditorStore.getState().activeTool;

      if (opt.e.altKey || tool === 'pan' || tool === 'select') return;

      const pointer = canvas.getPointer(opt.e);

      if (tool === 'text') {
        if (isDrawingText.current) return;
        isDrawingText.current = true;
        const fmt = useEditorStore.getState().activeTextFormat;
        const text = new fabric.IText('Clique para editar', {
          left: pointer.x,
          top: pointer.y,
          fontSize: fmt.fontSize || 16,
          fontFamily: fmt.fontFamily || 'Arial',
          fill: fmt.color || '#111111',
          fontWeight: fmt.bold ? 'bold' : 'normal',
          fontStyle: fmt.italic ? 'italic' : 'normal',
          underline: fmt.underline || false,
          textAlign: fmt.align || 'left',
          width: 300,
          editable: true,
          selectable: true,
          hasControls: true,
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        text.selectAll();
        canvas.renderAll();

        setTimeout(() => {
          isDrawingText.current = false;
          useEditorStore.getState().setActiveTool('select');
        }, 200);
      }

      else if (tool === 'rect') {
        const rect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 160,
          height: 100,
          fill: 'rgba(99,114,243,0.15)',
          stroke: '#6172f3',
          strokeWidth: 1.5,
          rx: 4,
          ry: 4,
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
        useEditorStore.getState().setActiveTool('select');
      }

      else if (tool === 'circle') {
        const circle = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 60,
          fill: 'rgba(168,85,247,0.15)',
          stroke: '#a855f7',
          strokeWidth: 1.5,
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
        canvas.renderAll();
        useEditorStore.getState().setActiveTool('select');
      }

      else if (tool === 'line') {
        const line = new fabric.Line(
          [pointer.x, pointer.y, pointer.x + 150, pointer.y],
          { stroke: '#374151', strokeWidth: 2, selectable: true }
        );
        canvas.add(line);
        canvas.setActiveObject(line);
        canvas.renderAll();
        useEditorStore.getState().setActiveTool('select');
      }
    });

    // ── History tracking ───────────────────────────────────────────────────
    const saveHistory = () => pushHistory(page.id, canvas.toJSON(['selectable','editable']));
    canvas.on('object:added',    saveHistory);
    canvas.on('object:modified', saveHistory);
    canvas.on('object:removed',  saveHistory);

    // ── Keyboard shortcuts ─────────────────────────────────────────────────
    const handleKeyDown = (e) => {
      if (!canvas) return;
      const active = canvas.getActiveObject();

      // Delete / Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && active) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        if (active.isEditing) return;
        canvas.remove(active);
        canvas.renderAll();
      }

      // Ctrl+Z / Ctrl+Shift+Z
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          useEditorStore.getState().undo();
        }
        if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          useEditorStore.getState().redo();
        }
        // Duplicate: Ctrl+D
        if (e.key === 'd' && active) {
          e.preventDefault();
          active.clone((cloned) => {
            cloned.set({ left: active.left + 20, top: active.top + 20 });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unregisterCanvas(page.id);
      canvas.dispose();
    };
  }, [page.id]);

  // ── Apply text formatting to selected object ───────────────────────────────
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj || !obj.type?.includes('text')) return;

    obj.set({
      fontFamily: activeTextFormat.fontFamily,
      fontSize:   activeTextFormat.fontSize,
      fontWeight: activeTextFormat.bold    ? 'bold'   : 'normal',
      fontStyle:  activeTextFormat.italic  ? 'italic' : 'normal',
      underline:  activeTextFormat.underline,
      fill:       activeTextFormat.color,
      textAlign:  activeTextFormat.align,
    });
    canvas.renderAll();
  }, [activeTextFormat]);

  // ── Update cursor by tool ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const cursors = {
      select: 'default',
      text:   'text',
      rect:   'crosshair',
      circle: 'crosshair',
      line:   'crosshair',
      pan:    'grab',
      image:  'copy',
    };

    canvas.defaultCursor = cursors[activeTool] || 'default';
    canvas.selection = activeTool === 'select';
    canvas.renderAll();
  }, [activeTool]);

  return (
    <div
      className="page-shadow"
      style={{
        width: PAGE_W,
        height: PAGE_H,
        flexShrink: 0,
        background: '#fff',
        position: 'relative',
      }}
    >
      <canvas ref={canvasElRef} />
    </div>
  );
}
