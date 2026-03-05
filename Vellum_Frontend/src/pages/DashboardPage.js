import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DocTypeIcon = ({ type }) => {
  const icons = {
    document: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    pdf: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    )
  };
  return icons[type] || icons.document;
};

const DocumentCard = ({ doc, onDelete, onRename, onOpen }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(doc.title);

  const timeAgo = formatDistanceToNow(new Date(doc.updated_at || doc.created_at), {
    addSuffix: true, locale: ptBR
  });

  const handleRename = async () => {
    if (!newTitle.trim() || newTitle === doc.title) {
      setRenaming(false);
      return;
    }
    await onRename(doc.id, newTitle);
    setRenaming(false);
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>

      {/* Thumbnail / Preview */}
      <div
        onClick={() => onOpen(doc.id)}
        style={{
          height: 140,
          background: 'var(--canvas-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderBottom: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}>
        {doc.thumbnail ? (
          <img src={doc.thumbnail} alt={doc.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '65%', height: '80%',
            background: 'var(--bg-primary)',
            borderRadius: 6,
            boxShadow: 'var(--shadow-sm)',
            display: 'flex', flexDirection: 'column',
            padding: 12, gap: 6
          }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                height: i === 0 ? 10 : 7,
                width: i === 0 ? '60%' : `${45 + i * 10}%`,
                background: 'var(--bg-tertiary)',
                borderRadius: 2
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {renaming ? (
            <input
              className="input"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false); }}
              autoFocus
              style={{ padding: '4px 8px', fontSize: 13, height: 28 }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <div className="truncate" style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}
              onClick={() => onOpen(doc.id)}>
              {doc.title}
            </div>
          )}
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo}</div>
        </div>

        {/* Context menu */}
        <div style={{ position: 'relative', marginLeft: 8 }}>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={e => { e.stopPropagation(); setMenuOpen(p => !p); }}
            style={{ opacity: menuOpen ? 1 : 0.6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, bottom: 'calc(100% + 4px)',
              background: 'var(--modal-bg)',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              minWidth: 160,
              boxShadow: 'var(--shadow-lg)',
              zIndex: 50,
              overflow: 'hidden',
              animation: 'slideUp 0.1s ease'
            }} onClick={e => e.stopPropagation()}>
              {[
                { icon: '✏️', label: 'Abrir', action: () => { onOpen(doc.id); setMenuOpen(false); } },
                { icon: '✍️', label: 'Renomear', action: () => { setRenaming(true); setMenuOpen(false); } },
                { icon: '🗑️', label: 'Excluir', action: () => { onDelete(doc.id); setMenuOpen(false); }, danger: true }
              ].map(item => (
                <button key={item.label} onClick={item.action} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '8px 12px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500,
                  color: item.danger ? '#ef4444' : 'var(--text-primary)',
                  textAlign: 'left', transition: 'var(--transition)'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user, isPro, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [monthlyCount, setMonthlyCount] = useState(0);

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      toast.success('🎉 Upgrade para Pro realizado com sucesso!');
      refreshUser();
    }
  }, [searchParams, refreshUser]);

  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents', { params: { search: search || undefined } });
      setDocs(res.data.documents || []);
      setMonthlyCount(res.data.monthlyCount || 0);
    } catch {
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchDocs, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchDocs]);

  const createNew = async () => {
    setCreating(true);
    try {
      const res = await api.post('/documents', { title: 'Documento sem título', type: 'document' });
      navigate(`/editor/${res.data.id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Erro ao criar documento';
      if (err.response?.status === 403) {
        toast.error('Limite mensal atingido. Faça upgrade para Pro!', { duration: 5000 });
        navigate('/pricing');
      } else {
        toast.error(msg);
      }
    } finally {
      setCreating(false);
    }
  };

  const deleteDoc = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este documento?')) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocs(prev => prev.filter(d => d.id !== id));
      toast.success('Documento excluído');
    } catch {
      toast.error('Erro ao excluir documento');
    }
  };

  const renameDoc = async (id, title) => {
    try {
      const res = await api.patch(`/documents/${id}/rename`, { title });
      setDocs(prev => prev.map(d => d.id === id ? { ...d, title: res.data.title } : d));
      toast.success('Documento renomeado');
    } catch {
      toast.error('Erro ao renomear');
    }
  };

  const canCreate = isPro || monthlyCount < 5;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <Header />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Welcome header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
              Olá, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              {isPro ? (
                <span>Plano <strong>Pro</strong> — documentos ilimitados ✨</span>
              ) : (
                <span>
                  Plano Gratuito — <strong>{monthlyCount}/5</strong> documentos este mês.{' '}
                  <Link to="/pricing" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Upgrade para Pro</Link>
                </span>
              )}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Upload PDF button */}
            <button
              className="btn btn-secondary"
              onClick={() => canCreate ? setShowUploadModal(true) : (toast.error('Limite atingido!'), navigate('/pricing'))}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload PDF
            </button>

            <button
              className="btn btn-primary"
              onClick={createNew}
              disabled={creating || !canCreate}
            >
              {creating ? <div className="spinner" /> : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              )}
              Novo Documento
            </button>
          </div>
        </div>

        {/* Free plan progress */}
        {!isPro && (
          <div className="card" style={{
            padding: '16px 20px',
            marginBottom: 28,
            display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Documentos este mês</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{monthlyCount}/5</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3 }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  background: monthlyCount >= 5 ? '#ef4444' : monthlyCount >= 4 ? '#f97316' : 'var(--brand-dark)',
                  width: `${(monthlyCount / 5) * 100}%`,
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
            <Link to="/pricing" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
              ⭐ Upgrade R$ 4,90/mês
            </Link>
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24, maxWidth: 440 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="input"
            placeholder="Buscar documentos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>

        {/* Documents grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📄</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
              {search ? 'Nenhum resultado' : 'Nenhum documento ainda'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              {search ? 'Tente outros termos de busca' : 'Crie seu primeiro documento ou faça upload de um PDF'}
            </p>
            {!search && canCreate && (
              <button className="btn btn-primary btn-lg" onClick={createNew}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Criar Documento
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {docs.map(doc => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onDelete={deleteDoc}
                onRename={renameDoc}
                onOpen={(id) => navigate(`/editor/${id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Upload PDF Modal */}
      {showUploadModal && (
        <UploadPDFModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={(docId) => {
            setShowUploadModal(false);
            navigate(`/editor/${docId}`);
          }}
        />
      )}
    </div>
  );
};

// Upload PDF Modal
const UploadPDFModal = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword', 'text/plain', 'text/html', 'text/csv', 'application/rtf', 'text/markdown'];
    if (!allowed.some(m => f.type === m || f.name.match(/\.(pdf|docx|doc|txt|html|csv|rtf|md)$/i))) {
      toast.error('Formato não suportado para edição');
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/conversion/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Create a new document with extracted content
      const content = res.data.text || res.data.html || '';
      const docRes = await api.post('/documents', {
        title: file.name.replace(/\.[^.]+$/, ''),
        type: file.type === 'application/pdf' ? 'pdf' : 'document',
        content
      });

      toast.success('Arquivo carregado e convertido! ✅');
      onSuccess(docRes.data.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao processar arquivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20 }}>Importar Arquivo</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div
          className={`dropzone ${dragging ? 'active' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('file-upload-modal').click()}
        >
          <input
            id="file-upload-modal"
            type="file"
            accept=".pdf,.docx,.doc,.txt,.html,.csv,.rtf,.md"
            style={{ display: 'none' }}
            onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
          />
          {file ? (
            <div>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              <p style={{ fontWeight: 600, fontSize: 15 }}>{file.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
              <p style={{ fontWeight: 600, fontSize: 15 }}>Arraste um arquivo ou clique para selecionar</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
                PDF, DOCX, DOC, TXT, HTML, CSV, RTF, MD — até 50MB
              </p>
            </div>
          )}
        </div>

        {file && (
          <div style={{
            padding: '12px 14px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            marginTop: 16,
            fontSize: 13,
            color: 'var(--text-secondary)'
          }}>
            💡 O arquivo será convertido para o editor. PDFs e DOCX serão transformados em texto editável.
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button
            className="btn btn-primary"
            style={{ flex: 2 }}
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? <><div className="spinner" />&nbsp;Processando...</> : 'Importar e Editar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
