import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';

const DOWNLOAD_FORMATS = [
  { ext: 'pdf', label: 'PDF', icon: '📄', desc: 'Melhor para compartilhar e imprimir' },
  { ext: 'docx', label: 'Word (.docx)', icon: '📝', desc: 'Compatível com Microsoft Word' },
  { ext: 'txt', label: 'Texto (.txt)', icon: '📃', desc: 'Texto simples sem formatação' },
  { ext: 'html', label: 'HTML', icon: '🌐', desc: 'Para uso em páginas web' },
  { ext: 'md', label: 'Markdown (.md)', icon: '✍️', desc: 'Formato leve com marcações' },
  { ext: 'rtf', label: 'Rich Text (.rtf)', icon: '📋', desc: 'Compatível com múltiplos editores' },
  { ext: 'json', label: 'JSON (Backup)', icon: '💾', desc: 'Backup completo do documento' },
  { ext: 'csv', label: 'CSV', icon: '📊', desc: 'Para dados em tabela' }
];

const DownloadModal = ({ onClose, canvas, title, content }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      if (selectedFormat === 'pdf') {
        // Use canvas to generate PDF
        if (canvas) {
          const { jsPDF } = await import('jspdf');
          const dataURL = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
          });
          pdf.addImage(dataURL, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save(`${title || 'documento'}.pdf`);
          toast.success('PDF baixado com sucesso! ✅');
        }
      } else {
        // Backend conversion
        const canvasData = canvas ? canvas.toJSON() : null;
        const response = await api.post('/conversion/download', {
          content: content || '',
          format: selectedFormat,
          title: title || 'documento',
          canvasData
        }, { responseType: 'blob' });

        const blob = new Blob([response.data]);
        saveAs(blob, `${title || 'documento'}.${selectedFormat}`);
        toast.success(`${selectedFormat.toUpperCase()} baixado! ✅`);
      }
      onClose();
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Erro ao baixar arquivo');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportImage = async (format) => {
    if (!canvas) return;
    try {
      const dataURL = canvas.toDataURL({
        format: format,
        quality: 1,
        multiplier: 2
      });
      const link = document.createElement('a');
      link.download = `${title || 'documento'}.${format}`;
      link.href = dataURL;
      link.click();
      toast.success(`Imagem exportada! ✅`);
    } catch {
      toast.error('Erro ao exportar imagem');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 8 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Baixar Documento
          </h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Document formats */}
        <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Formatos de Documento
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {DOWNLOAD_FORMATS.map(fmt => (
            <button
              key={fmt.ext}
              onClick={() => setSelectedFormat(fmt.ext)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                background: selectedFormat === fmt.ext ? 'var(--brand-dark)' : 'var(--bg-tertiary)',
                color: selectedFormat === fmt.ext ? 'white' : 'var(--text-primary)',
                border: `1.5px solid ${selectedFormat === fmt.ext ? 'var(--brand-dark)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer', textAlign: 'left',
                transition: 'var(--transition)'
              }}
              onMouseEnter={e => { if (selectedFormat !== fmt.ext) e.currentTarget.style.borderColor = 'var(--brand-dark)'; }}
              onMouseLeave={e => { if (selectedFormat !== fmt.ext) e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{fmt.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{fmt.label}</div>
                <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.3 }}>{fmt.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Image export */}
        <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Exportar como Imagem
        </h4>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['png', 'jpeg', 'webp'].map(fmt => (
            <button key={fmt} className="btn btn-secondary btn-sm"
              onClick={() => handleExportImage(fmt)}
              style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {fmt}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 2 }}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <><div className="spinner" />&nbsp;Baixando...</>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Baixar como {selectedFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
