import React, { useState, useRef } from 'react';
import { fabric } from 'fabric';

const Separator = () => (
  <div style={{ width: 1, height: 24, background: 'var(--border-color)', margin: '0 4px', flexShrink: 0 }} />
);

const ToolBtn = ({ onClick, active, title, children, disabled }) => (
  <button
    className={`btn btn-icon btn-sm ${active ? 'btn-primary' : 'btn-ghost'}`}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{ flexShrink: 0 }}
  >
    {children}
  </button>
);

const EditorToolbar = ({
  canvas,
  selectedObject,
  onAddText,
  onAddImageUpload,
  onAddShape,
  onUpdateStyle,
  onUndo,
  onRedo,
  isMobile
}) => {
  const fileInputRef = useRef(null);
  const [showTextMenu, setShowTextMenu] = useState(false);
  const [showShapeMenu, setShowShapeMenu] = useState(false);

  const isText = selectedObject && ['textbox', 'text', 'i-text'].includes(selectedObject.type);
  const isObject = !!selectedObject;

  const toggleBold = () => {
    if (!isText) return;
    const current = selectedObject.fontWeight;
    onUpdateStyle({ fontWeight: current === 'bold' ? 'normal' : 'bold' });
  };

  const toggleItalic = () => {
    if (!isText) return;
    onUpdateStyle({ fontStyle: selectedObject.fontStyle === 'italic' ? 'normal' : 'italic' });
  };

  const toggleUnderline = () => {
    if (!isText) return;
    onUpdateStyle({ underline: !selectedObject.underline });
  };

  const setAlign = (align) => {
    if (!isText) return;
    onUpdateStyle({ textAlign: align });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) onAddImageUpload(file);
    e.target.value = '';
  };

  const deleteSelected = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) { canvas.remove(obj); canvas.requestRenderAll(); }
  };

  const duplicateSelected = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;
    obj.clone((clone) => {
      clone.set({ left: obj.left + 20, top: obj.top + 20 });
      canvas.add(clone);
      canvas.setActiveObject(clone);
      canvas.requestRenderAll();
    });
  };

  const bringForward = () => {
    if (!canvas || !selectedObject) return;
    canvas.bringForward(selectedObject);
    canvas.requestRenderAll();
  };

  const sendBackward = () => {
    if (!canvas || !selectedObject) return;
    canvas.sendBackwards(selectedObject);
    canvas.requestRenderAll();
  };

  const fonts = ['Arial', 'Georgia', 'Times New Roman', 'Helvetica', 'Courier New', 'Verdana', 'Trebuchet MS', 'Impact', 'Comic Sans MS'];

  return (
    <div style={{
      height: 'var(--toolbar-height)',
      background: 'var(--toolbar-bg)',
      borderBottom: '1.5px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      gap: 4,
      overflow: 'hidden',
      flexShrink: 0
    }}>
      {/* Undo/Redo */}
      {!isMobile && (
        <>
          <ToolBtn onClick={onUndo} title="Desfazer (Ctrl+Z)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
            </svg>
          </ToolBtn>
          <ToolBtn onClick={onRedo} title="Refazer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
            </svg>
          </ToolBtn>
          <Separator />
        </>
      )}

      {/* Add Text (with dropdown) */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { setShowTextMenu(p => !p); setShowShapeMenu(false); }}
          title="Adicionar texto"
          style={{ gap: 4, fontSize: 13, padding: '5px 10px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/>
            <line x1="12" y1="4" x2="12" y2="20"/>
          </svg>
          Texto
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {showTextMenu && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0,
            background: 'var(--modal-bg)', border: '1.5px solid var(--border-color)',
            borderRadius: 'var(--radius-md)', minWidth: 170,
            boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden'
          }}>
            {[
              { type: 'heading', label: 'Título', fontSize: '22px' },
              { type: 'subheading', label: 'Subtítulo', fontSize: '16px' },
              { type: 'body', label: 'Texto Normal', fontSize: '14px' },
              { type: 'caption', label: 'Legenda', fontSize: '11px' }
            ].map(t => (
              <button key={t.type} onClick={() => { onAddText(t.type); setShowTextMenu(false); }} style={{
                display: 'block', width: '100%', padding: '8px 14px',
                background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontSize: t.fontSize, color: 'var(--text-primary)',
                fontWeight: t.type === 'heading' ? '700' : t.type === 'subheading' ? '600' : '400',
                transition: 'var(--transition)'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Image */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
      <ToolBtn onClick={() => fileInputRef.current?.click()} title="Adicionar imagem">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </ToolBtn>

      {/* Add Shape */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { setShowShapeMenu(p => !p); setShowTextMenu(false); }}
          title="Formas"
          style={{ gap: 4, fontSize: 13, padding: '5px 10px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="8" height="8" rx="1"/><circle cx="17" cy="7" r="4"/>
            <polygon points="3 22 11 22 7 15"/>
          </svg>
          {!isMobile && 'Forma'}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {showShapeMenu && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0,
            background: 'var(--modal-bg)', border: '1.5px solid var(--border-color)',
            borderRadius: 'var(--radius-md)', minWidth: 140,
            boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden'
          }}>
            {[
              { shape: 'rect', label: '⬛ Retângulo' },
              { shape: 'circle', label: '⚪ Círculo' },
              { shape: 'triangle', label: '△ Triângulo' },
              { shape: 'line', label: '— Linha' }
            ].map(s => (
              <button key={s.shape} onClick={() => { onAddShape(s.shape); setShowShapeMenu(false); }} style={{
                display: 'block', width: '100%', padding: '8px 14px',
                background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontSize: 14, color: 'var(--text-primary)',
                transition: 'var(--transition)'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Text formatting (shown when text selected) */}
      {isText && (
        <>
          {/* Font family */}
          {!isMobile && (
            <select
              value={selectedObject.fontFamily || 'Arial'}
              onChange={e => onUpdateStyle({ fontFamily: e.target.value })}
              className="input"
              style={{ width: 130, height: 30, padding: '0 8px', fontSize: 13 }}
            >
              {fonts.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          )}

          {/* Font size */}
          <input
            type="number"
            className="input"
            value={selectedObject.fontSize || 16}
            onChange={e => onUpdateStyle({ fontSize: parseInt(e.target.value) || 16 })}
            min={6} max={200}
            style={{ width: 60, height: 30, padding: '0 8px', fontSize: 13 }}
          />

          <Separator />

          {/* Bold / Italic / Underline */}
          <ToolBtn
            onClick={toggleBold}
            active={selectedObject.fontWeight === 'bold'}
            title="Negrito (Ctrl+B)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
            </svg>
          </ToolBtn>
          <ToolBtn
            onClick={toggleItalic}
            active={selectedObject.fontStyle === 'italic'}
            title="Itálico"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/>
              <line x1="15" y1="4" x2="9" y2="20"/>
            </svg>
          </ToolBtn>
          <ToolBtn
            onClick={toggleUnderline}
            active={selectedObject.underline}
            title="Sublinhado"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>
            </svg>
          </ToolBtn>

          <Separator />

          {/* Alignment */}
          {!isMobile && (
            <>
              {['left', 'center', 'right'].map(align => (
                <ToolBtn key={align} onClick={() => setAlign(align)} active={selectedObject.textAlign === align} title={`Alinhar ${align}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    {align === 'left' && <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
                    {align === 'center' && <><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
                    {align === 'right' && <><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
                  </svg>
                </ToolBtn>
              ))}
              <Separator />
            </>
          )}

          {/* Text color */}
          <div style={{ position: 'relative' }} title="Cor do texto">
            <input
              type="color"
              value={selectedObject.fill || '#000000'}
              onChange={e => onUpdateStyle({ fill: e.target.value })}
              style={{ width: 30, height: 30, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 4, overflow: 'hidden' }}
            />
          </div>

          <Separator />
        </>
      )}

      {/* Object controls (shown when any object selected) */}
      {isObject && (
        <>
          {/* Opacity */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Opac.</span>
              <input
                type="range" min="0" max="1" step="0.05"
                value={selectedObject.opacity || 1}
                onChange={e => onUpdateStyle({ opacity: parseFloat(e.target.value) })}
                style={{ width: 70 }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 30 }}>
                {Math.round((selectedObject.opacity || 1) * 100)}%
              </span>
            </div>
          )}

          <ToolBtn onClick={duplicateSelected} title="Duplicar (Ctrl+D)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </ToolBtn>

          {!isMobile && (
            <>
              <ToolBtn onClick={bringForward} title="Trazer para frente">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/>
                </svg>
              </ToolBtn>
              <ToolBtn onClick={sendBackward} title="Enviar para trás">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="17 6 12 11 7 6"/><polyline points="17 13 12 18 7 13"/>
                </svg>
              </ToolBtn>
            </>
          )}

          <ToolBtn onClick={deleteSelected} title="Excluir (Delete)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </ToolBtn>
        </>
      )}
    </div>
  );
};

export default EditorToolbar;
