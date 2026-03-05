import React, { useRef, useState } from 'react';

const TabBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    flex: 1, padding: '8px 4px', border: 'none', background: 'none',
    cursor: 'pointer', fontSize: 12, fontWeight: active ? 600 : 400,
    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
    borderBottom: `2px solid ${active ? 'var(--brand-dark)' : 'transparent'}`,
    transition: 'var(--transition)'
  }}>{label}</button>
);

const SectionTitle = ({ children }) => (
  <h4 style={{
    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    marginBottom: 10, marginTop: 16, paddingTop: 12,
    borderTop: '1px solid var(--border-color)'
  }}>{children}</h4>
);

const ColorSwatch = ({ color, onClick, active }) => (
  <button onClick={() => onClick(color)} style={{
    width: 28, height: 28, borderRadius: 6, background: color,
    border: active ? '2px solid var(--brand-dark)' : '1.5px solid rgba(0,0,0,0.1)',
    cursor: 'pointer', flexShrink: 0, transition: 'transform 0.1s',
    transform: active ? 'scale(1.15)' : 'scale(1)'
  }} />
);

const SWATCHES = [
  '#1a1a1a','#3d3d3d','#6b6b6b','#9e9e9e','#c8c8c8','#f5f5f5','#ffffff',
  '#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899',
];

const BG_COLORS = [
  '#ffffff','#f8f8f8','#f0f0f0','#1a1a1a','#252525','#3d3d3d',
  '#fef9ef','#eff6ff','#f0fff4','#fdf4ff','#fff7f0','#f0f9ff'
];

const TEMPLATES = [
  { label: 'Branco', bg: '#ffffff' }, { label: 'Escuro', bg: '#1a1a1a' },
  { label: 'Quente', bg: '#fef9ef' }, { label: 'Frio', bg: '#eff6ff' }
];

const EditorSidebar = ({ canvas, selectedObject, activeTab, setActiveTab, onAddText, onAddImageUpload, onAddShape, onAddBackground, onUpdateStyle }) => {
  const imgInputRef = useRef(null);
  const [bgColor, setBgColor] = useState('#ffffff');

  const isText = selectedObject && ['textbox', 'text', 'i-text'].includes(selectedObject.type);
  const isShape = selectedObject && ['rect', 'circle', 'triangle'].includes(selectedObject.type);

  const handleBgColor = (color) => { setBgColor(color); onAddBackground(color); };

  return (
    <div style={{
      width: 'var(--sidebar-width)', background: 'var(--sidebar-bg)',
      borderRight: '1.5px solid var(--border-color)',
      display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden'
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--toolbar-bg)' }}>
        <TabBtn label="Inserir" active={activeTab === 'insert'} onClick={() => setActiveTab('insert')} />
        <TabBtn label="Estilo" active={activeTab === 'style'} onClick={() => setActiveTab('style')} />
        <TabBtn label="Página" active={activeTab === 'page'} onClick={() => setActiveTab('page')} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>

        {/* INSERT TAB */}
        {activeTab === 'insert' && (
          <>
            <SectionTitle>Texto</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { type: 'heading', label: 'Adicionar Título', fw: 700, fs: 16 },
                { type: 'subheading', label: 'Adicionar Subtítulo', fw: 600, fs: 14 },
                { type: 'body', label: 'Adicionar Texto', fw: 400, fs: 13 },
                { type: 'caption', label: 'Adicionar Legenda', fw: 400, fs: 11 }
              ].map(t => (
                <button key={t.type} onClick={() => onAddText(t.type)} className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', fontWeight: t.fw, fontSize: t.fs }}>
                  + {t.label}
                </button>
              ))}
            </div>

            <SectionTitle>Imagem</SectionTitle>
            <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { if (e.target.files[0]) onAddImageUpload(e.target.files[0]); e.target.value = ''; }} />
            <button onClick={() => imgInputRef.current?.click()} className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Carregar Imagem
            </button>

            <SectionTitle>Formas</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { shape: 'rect', label: 'Retângulo', icon: '⬜' },
                { shape: 'circle', label: 'Círculo', icon: '⬤' },
                { shape: 'triangle', label: 'Triângulo', icon: '△' },
                { shape: 'line', label: 'Linha', icon: '—' }
              ].map(s => (
                <button key={s.shape} onClick={() => onAddShape(s.shape)} className="btn btn-secondary btn-sm"
                  style={{ flexDirection: 'column', height: 54, fontSize: 12, gap: 4 }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>{s.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* STYLE TAB */}
        {activeTab === 'style' && (
          <>
            {!selectedObject ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', fontSize: 13 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👆</div>
                Selecione um elemento para editar seu estilo
              </div>
            ) : (
              <>
                <SectionTitle>Posição</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'X', prop: 'left', val: Math.round(selectedObject.left || 0) },
                    { label: 'Y', prop: 'top', val: Math.round(selectedObject.top || 0) }
                  ].map(f => (
                    <div key={f.label}>
                      <label className="label">{f.label}</label>
                      <input className="input" type="number" style={{ padding: '5px 8px', fontSize: 13 }}
                        value={f.val} onChange={e => onUpdateStyle({ [f.prop]: parseInt(e.target.value) || 0 })} />
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 12 }}>
                  <label className="label">Rotação ({Math.round(selectedObject.angle || 0)}°)</label>
                  <input type="range" min="-180" max="180" step="1" style={{ width: '100%' }}
                    value={selectedObject.angle || 0}
                    onChange={e => onUpdateStyle({ angle: parseInt(e.target.value) })} />
                </div>

                <div style={{ marginTop: 12 }}>
                  <label className="label">Opacidade ({Math.round((selectedObject.opacity || 1) * 100)}%)</label>
                  <input type="range" min="0" max="1" step="0.05" style={{ width: '100%' }}
                    value={selectedObject.opacity || 1}
                    onChange={e => onUpdateStyle({ opacity: parseFloat(e.target.value) })} />
                </div>

                {isText && (
                  <>
                    <SectionTitle>Cor do Texto</SectionTitle>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                      {SWATCHES.map(c => (
                        <ColorSwatch key={c} color={c} onClick={color => onUpdateStyle({ fill: color })}
                          active={selectedObject.fill === c} />
                      ))}
                      <input type="color" value={selectedObject.fill || '#000000'}
                        onChange={e => onUpdateStyle({ fill: e.target.value })}
                        style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer' }} />
                    </div>
                    <div>
                      <label className="label">Espaç. linhas ({(selectedObject.lineHeight || 1.5).toFixed(1)}x)</label>
                      <input type="range" min="0.8" max="3" step="0.1" style={{ width: '100%' }}
                        value={selectedObject.lineHeight || 1.5}
                        onChange={e => onUpdateStyle({ lineHeight: parseFloat(e.target.value) })} />
                    </div>
                  </>
                )}

                {isShape && (
                  <>
                    <SectionTitle>Preenchimento</SectionTitle>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                      {SWATCHES.map(c => (
                        <ColorSwatch key={c} color={c} onClick={color => onUpdateStyle({ fill: color })}
                          active={selectedObject.fill === c} />
                      ))}
                      <input type="color" value={typeof selectedObject.fill === 'string' ? selectedObject.fill : '#3d3d3d'}
                        onChange={e => onUpdateStyle({ fill: e.target.value })}
                        style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="color" value={selectedObject.stroke || '#000000'}
                        onChange={e => onUpdateStyle({ stroke: e.target.value })}
                        style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer' }} />
                      <input className="input" type="number" style={{ flex: 1, padding: '5px 8px', fontSize: 13 }}
                        value={selectedObject.strokeWidth || 0} min={0} max={20}
                        onChange={e => onUpdateStyle({ strokeWidth: parseInt(e.target.value) || 0 })}
                        placeholder="Espessura borda" />
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* PAGE TAB */}
        {activeTab === 'page' && (
          <>
            <SectionTitle>Cor de Fundo</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
              {BG_COLORS.map(c => (
                <ColorSwatch key={c} color={c} onClick={handleBgColor} active={bgColor === c} />
              ))}
              <input type="color" value={bgColor} onChange={e => handleBgColor(e.target.value)}
                style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer' }} />
            </div>
            <SectionTitle>Templates</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TEMPLATES.map(t => (
                <button key={t.label} onClick={() => handleBgColor(t.bg)} style={{
                  height: 60, borderRadius: 8, background: t.bg,
                  border: '1.5px solid var(--border-color)', cursor: 'pointer', fontSize: 12,
                  color: t.bg === '#1a1a1a' ? 'white' : '#1a1a1a', fontWeight: 500, transition: 'var(--transition)'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditorSidebar;
