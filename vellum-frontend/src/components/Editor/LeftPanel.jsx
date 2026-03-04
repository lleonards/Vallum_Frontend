import React, { useRef } from 'react';
import {
  MousePointer2, Type, Image as ImageIcon,
  Square, Circle, Minus, Hand, Upload, FilePlus,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';

const tools = [
  { id: 'select', icon: <MousePointer2 size={18} />, label: 'Selecionar', shortcut: 'V' },
  { id: 'text',   icon: <Type size={18} />,           label: 'Texto',      shortcut: 'T' },
  { id: 'image',  icon: <ImageIcon size={18} />,      label: 'Imagem',     shortcut: 'I' },
  { id: 'rect',   icon: <Square size={18} />,         label: 'Retângulo',  shortcut: 'R' },
  { id: 'circle', icon: <Circle size={18} />,         label: 'Círculo',    shortcut: 'C' },
  { id: 'line',   icon: <Minus size={18} />,          label: 'Linha',      shortcut: 'L' },
  { id: 'pan',    icon: <Hand size={18} />,           label: 'Mover tela', shortcut: 'H' },
];

export default function LeftPanel({ onUploadPDF }) {
  const { activeTool, setActiveTool, getActiveCanvas, addPage } = useEditorStore();
  const imageInputRef = useRef(null);
  const pdfInputRef   = useRef(null);

  // ── Add image to canvas ────────────────────────────────────────────────────
  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target.result;
      fabric.Image.fromURL(url, (img) => {
        const canvas = getActiveCanvas();
        if (!canvas) return;

        // Scale down if too large
        const maxW = 400;
        if (img.width > maxW) {
          img.scaleToWidth(maxW);
        }

        img.set({
          left: (794 - img.getScaledWidth()) / 2,
          top:  (1123 - img.getScaledHeight()) / 2,
          selectable: true,
          hasControls: true,
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        setActiveTool('select');
        toast.success('Imagem adicionada!');
      }, { crossOrigin: 'anonymous' });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleToolClick = (id) => {
    if (id === 'image') {
      imageInputRef.current?.click();
      return;
    }
    setActiveTool(id);
  };

  const handlePDFFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUploadPDF?.(file);
    e.target.value = '';
  };

  return (
    <aside className="w-16 flex flex-col items-center gap-1 py-3 px-1 border-r
      bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-y-auto
      select-none">

      {/* Tool buttons */}
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={() => handleToolClick(tool.id)}
          className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
          title={`${tool.label} (${tool.shortcut})`}
        >
          {tool.icon}
          <span className="text-[9px] leading-none">{tool.label.split(' ')[0]}</span>
        </button>
      ))}

      {/* Divider */}
      <div className="w-8 h-px bg-gray-200 dark:bg-gray-700 my-1" />

      {/* Add new page */}
      <button
        onClick={addPage}
        className="tool-btn"
        title="Nova página"
      >
        <FilePlus size={18} />
        <span className="text-[9px] leading-none">Página</span>
      </button>

      {/* Upload PDF */}
      <button
        onClick={() => pdfInputRef.current?.click()}
        className="tool-btn"
        title="Importar PDF"
      >
        <Upload size={18} />
        <span className="text-[9px] leading-none">PDF</span>
      </button>

      {/* Hidden inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFile}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handlePDFFile}
      />
    </aside>
  );
}
