import React, { useCallback } from 'react';
import {
  Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Trash2, Copy, BringToFront, SendToBack,
  ZoomIn, ZoomOut, RotateCcw, RotateCw,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

const FONTS = ['Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Helvetica', 'Courier New', 'Trebuchet MS'];
const SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96];

export default function Toolbar() {
  const {
    activeTextFormat,
    setTextFormat,
    getActiveCanvas,
    undo, redo,
  } = useEditorStore();

  const getActive = () => getActiveCanvas()?.getActiveObject();

  // ── Text formatting ────────────────────────────────────────────────────────
  const toggleFormat = useCallback((key) => {
    const newVal = !activeTextFormat[key];
    setTextFormat(key, newVal);
    const obj = getActive();
    if (obj?.type?.includes('text')) {
      if (key === 'bold')      obj.set({ fontWeight: newVal ? 'bold' : 'normal' });
      if (key === 'italic')    obj.set({ fontStyle: newVal ? 'italic' : 'normal' });
      if (key === 'underline') obj.set({ underline: newVal });
      getActiveCanvas()?.renderAll();
    }
  }, [activeTextFormat]);

  const setAlign = useCallback((align) => {
    setTextFormat('align', align);
    const obj = getActive();
    if (obj?.type?.includes('text')) {
      obj.set({ textAlign: align });
      getActiveCanvas()?.renderAll();
    }
  }, []);

  const setFont = useCallback((family) => {
    setTextFormat('fontFamily', family);
    const obj = getActive();
    if (obj?.type?.includes('text')) {
      obj.set({ fontFamily: family });
      getActiveCanvas()?.renderAll();
    }
  }, []);

  const setSize = useCallback((size) => {
    const s = Number(size);
    setTextFormat('fontSize', s);
    const obj = getActive();
    if (obj?.type?.includes('text')) {
      obj.set({ fontSize: s });
      getActiveCanvas()?.renderAll();
    }
  }, []);

  const setColor = useCallback((color) => {
    setTextFormat('color', color);
    const obj = getActive();
    if (obj?.type?.includes('text')) {
      obj.set({ fill: color });
      getActiveCanvas()?.renderAll();
    }
  }, []);

  // ── Object operations ──────────────────────────────────────────────────────
  const deleteSelected = () => {
    const canvas = getActiveCanvas();
    const obj = canvas?.getActiveObject();
    if (obj) { canvas.remove(obj); canvas.renderAll(); }
  };

  const duplicateSelected = () => {
    const canvas = getActiveCanvas();
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    obj.clone((cloned) => {
      cloned.set({ left: obj.left + 20, top: obj.top + 20 });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  };

  const bringForward = () => {
    const canvas = getActiveCanvas();
    const obj = canvas?.getActiveObject();
    if (obj) { canvas.bringForward(obj); canvas.renderAll(); }
  };

  const sendBackward = () => {
    const canvas = getActiveCanvas();
    const obj = canvas?.getActiveObject();
    if (obj) { canvas.sendBackwards(obj); canvas.renderAll(); }
  };

  const zoomIn = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const z = Math.min(canvas.getZoom() * 1.2, 6);
    const center = canvas.getCenter();
    canvas.zoomToPoint({ x: center.left, y: center.top }, z);
  };

  const zoomOut = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const z = Math.max(canvas.getZoom() / 1.2, 0.1);
    const center = canvas.getCenter();
    canvas.zoomToPoint({ x: center.left, y: center.top }, z);
  };

  const resetZoom = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.renderAll();
  };

  const sep = <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />;

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b
      bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800
      overflow-x-auto select-none">

      {/* Font family */}
      <select
        value={activeTextFormat.fontFamily}
        onChange={(e) => setFont(e.target.value)}
        className="text-xs rounded border border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
          px-1.5 py-1 mr-1 cursor-pointer outline-none
          focus:border-brand-400 hover:border-brand-300 transition-colors"
        style={{ minWidth: 130 }}
        title="Fonte"
      >
        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
      </select>

      {/* Font size */}
      <select
        value={activeTextFormat.fontSize}
        onChange={(e) => setSize(e.target.value)}
        className="text-xs rounded border border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
          px-1 py-1 w-14 cursor-pointer outline-none
          focus:border-brand-400 transition-colors"
        title="Tamanho"
      >
        {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      {sep}

      {/* Bold */}
      <button onClick={() => toggleFormat('bold')}
        className={`toolbar-btn ${activeTextFormat.bold ? 'active' : ''}`}
        title="Negrito (Ctrl+B)">
        <Bold size={14} />
      </button>

      {/* Italic */}
      <button onClick={() => toggleFormat('italic')}
        className={`toolbar-btn ${activeTextFormat.italic ? 'active' : ''}`}
        title="Itálico (Ctrl+I)">
        <Italic size={14} />
      </button>

      {/* Underline */}
      <button onClick={() => toggleFormat('underline')}
        className={`toolbar-btn ${activeTextFormat.underline ? 'active' : ''}`}
        title="Sublinhado (Ctrl+U)">
        <Underline size={14} />
      </button>

      {sep}

      {/* Text color */}
      <div className="relative flex items-center" title="Cor do texto">
        <label className="toolbar-btn cursor-pointer" title="Cor do texto">
          <span className="text-xs font-bold" style={{ color: activeTextFormat.color }}>A</span>
          <span
            className="absolute bottom-0.5 left-1 right-1 h-0.5 rounded"
            style={{ background: activeTextFormat.color }}
          />
          <input
            type="color"
            value={activeTextFormat.color}
            onChange={(e) => setColor(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </label>
      </div>

      {sep}

      {/* Align */}
      {[
        { icon: <AlignLeft size={14} />, val: 'left',    title: 'Esquerda' },
        { icon: <AlignCenter size={14}/>, val: 'center', title: 'Centro' },
        { icon: <AlignRight size={14}/>,  val: 'right',  title: 'Direita' },
        { icon: <AlignJustify size={14}/>,val: 'justify',title: 'Justificado' },
      ].map(({ icon, val, title }) => (
        <button key={val}
          onClick={() => setAlign(val)}
          className={`toolbar-btn ${activeTextFormat.align === val ? 'active' : ''}`}
          title={title}>
          {icon}
        </button>
      ))}

      {sep}

      {/* Object ops */}
      <button onClick={duplicateSelected} className="toolbar-btn" title="Duplicar (Ctrl+D)">
        <Copy size={14} />
      </button>
      <button onClick={bringForward} className="toolbar-btn" title="Trazer à frente">
        <BringToFront size={14} />
      </button>
      <button onClick={sendBackward} className="toolbar-btn" title="Enviar para trás">
        <SendToBack size={14} />
      </button>
      <button onClick={deleteSelected}
        className="toolbar-btn hover:!bg-red-50 hover:!text-red-500 dark:hover:!bg-red-900/20 dark:hover:!text-red-400"
        title="Excluir (Delete)">
        <Trash2 size={14} />
      </button>

      {sep}

      {/* Undo/Redo */}
      <button onClick={undo} className="toolbar-btn" title="Desfazer (Ctrl+Z)">
        <RotateCcw size={14} />
      </button>
      <button onClick={redo} className="toolbar-btn" title="Refazer (Ctrl+Y)">
        <RotateCw size={14} />
      </button>

      {sep}

      {/* Zoom */}
      <button onClick={zoomOut} className="toolbar-btn" title="Reduzir zoom">
        <ZoomOut size={14} />
      </button>
      <button onClick={resetZoom}
        className="text-xs text-gray-600 dark:text-gray-400 px-1.5 py-1 rounded
          hover:bg-gray-100 dark:hover:bg-gray-700 font-mono cursor-pointer min-w-[46px] text-center"
        title="Resetar zoom">
        100%
      </button>
      <button onClick={zoomIn} className="toolbar-btn" title="Aumentar zoom">
        <ZoomIn size={14} />
      </button>
    </div>
  );
}
