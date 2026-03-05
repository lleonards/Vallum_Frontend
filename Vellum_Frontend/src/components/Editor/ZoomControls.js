import React, { useState } from 'react';

const ZoomControls = ({ zoom, onZoomIn, onZoomOut, onFitScreen, onResetZoom, onSetZoom }) => {
  const [showInput, setShowInput] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const pct = Math.round(zoom * 100);

  const handleInputSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(inputVal);
    if (!isNaN(val) && val > 0) {
      onSetZoom(Math.min(Math.max(val / 100, 0.05), 15));
    }
    setShowInput(false);
    setInputVal('');
  };

  const presets = [25, 50, 75, 100, 150, 200, 400, 1000, 1500];

  return (
    <div style={{
      position: 'fixed',
      bottom: 20, right: 20,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: 'var(--card-bg)',
      border: '1.5px solid var(--border-color)',
      borderRadius: 'var(--radius-full)',
      padding: '6px 10px',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 90,
      backdropFilter: 'blur(8px)'
    }}>
      {/* Zoom out */}
      <button
        className="btn btn-ghost btn-icon btn-sm"
        onClick={onZoomOut}
        title="Diminuir zoom"
        style={{ width: 28, height: 28, borderRadius: '50%' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {/* Zoom percentage */}
      {showInput ? (
        <form onSubmit={handleInputSubmit}>
          <input
            type="number"
            className="input"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onBlur={() => { setShowInput(false); setInputVal(''); }}
            autoFocus
            style={{ width: 64, height: 28, padding: '0 6px', fontSize: 12, textAlign: 'center' }}
            min={5} max={1500}
            placeholder={pct}
          />
        </form>
      ) : (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowInput(true); setInputVal(String(pct)); }}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 6,
              padding: '3px 10px',
              fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--text-primary)',
              minWidth: 56, textAlign: 'center'
            }}
            title="Clique para definir zoom exato"
          >
            {pct}%
          </button>
        </div>
      )}

      {/* Zoom in */}
      <button
        className="btn btn-ghost btn-icon btn-sm"
        onClick={onZoomIn}
        title="Aumentar zoom"
        style={{ width: 28, height: 28, borderRadius: '50%' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {/* Separator */}
      <div style={{ width: 1, height: 18, background: 'var(--border-color)' }} />

      {/* Fit to screen */}
      <button
        className="btn btn-ghost btn-icon btn-sm"
        onClick={onFitScreen}
        title="Ajustar à tela"
        style={{ width: 28, height: 28, borderRadius: '50%' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
        </svg>
      </button>

      {/* Reset to 100% */}
      <button
        className="btn btn-ghost btn-icon btn-sm"
        onClick={onResetZoom}
        title="Zoom 100%"
        style={{ width: 28, height: 28, borderRadius: '50%', fontSize: 10, fontWeight: 700 }}
      >
        1:1
      </button>

      <style>{`
        /* Zoom presets dropdown hint */
        .zoom-preset {
          padding: 4px 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13px;
          color: var(--text-primary);
          width: 100%;
          text-align: left;
          transition: var(--transition);
        }
        .zoom-preset:hover { background: var(--bg-hover); }
      `}</style>
    </div>
  );
};

export default ZoomControls;
