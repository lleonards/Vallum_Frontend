import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, FileText, Trash2, Clock, Crown, Loader2, Upload,
  LayoutGrid, List, Search, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Layout/Header';
import { documentsApi, paymentsApi } from '../lib/api';
import { useAuthStore } from '../store/editorStore';

export default function DashboardPage() {
  const navigate   = useNavigate();
  const { user }   = useAuthStore();
  const [documents, setDocuments]   = useState([]);
  const [profile,   setProfile]     = useState(null);
  const [loading,   setLoading]     = useState(true);
  const [deleting,  setDeleting]    = useState(null);
  const [query,     setQuery]       = useState('');
  const [view,      setView]        = useState('grid');
  const pdfInputRef = React.useRef(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [docsRes, profileRes] = await Promise.all([
          documentsApi.list(),
          paymentsApi.getStatus(),
        ]);
        setDocuments(docsRes.data.documents || []);
        setProfile(profileRes.data.profile);
      } catch (err) {
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleNewDocument = async () => {
    try {
      const { data } = await documentsApi.create({ title: 'Documento sem título' });
      navigate(`/editor/${data.document.id}`);
    } catch (err) {
      if (err.response?.data?.upgrade) {
        toast.error('Limite atingido! Faça upgrade para criar mais documentos.', { duration: 5000 });
        navigate('/pricing');
      } else {
        toast.error(err.response?.data?.error || 'Erro ao criar documento');
      }
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Remover este documento?')) return;
    setDeleting(id);
    try {
      await documentsApi.delete(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Documento removido');
    } catch {
      toast.error('Erro ao remover');
    } finally {
      setDeleting(null);
    }
  };

  const handleUpgrade = async () => {
    try {
      const { data } = await paymentsApi.createCheckout();
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao iniciar checkout');
    }
  };

  const filtered = documents.filter(d =>
    d.title.toLowerCase().includes(query.toLowerCase())
  );

  const isFree = profile?.plan === 'free';
  const docsUsed = profile?.documents_created_this_month || 0;

  const fmt = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">

        {/* ── Top section ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Meus Documentos
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {user?.email}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewDocument}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-sm"
            >
              <Plus size={16} /> Novo Documento
            </button>
          </div>
        </div>

        {/* ── Plan card ────────────────────────────────────────────────────── */}
        <div className={`rounded-2xl p-4 mb-6 flex items-center justify-between gap-4
          ${isFree
            ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
            : 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 border border-amber-200 dark:border-amber-800'
          }`}>

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center
              ${isFree ? 'bg-gray-100 dark:bg-gray-800' : 'bg-amber-100 dark:bg-amber-900/40'}`}>
              <Crown size={18} className={isFree ? 'text-gray-500' : 'text-amber-500'} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                Plano {isFree ? 'Gratuito' : 'Pro ✨'}
              </p>
              {isFree ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {docsUsed}/5 documentos este mês
                </p>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Documentos ilimitados 🎉
                </p>
              )}
            </div>
          </div>

          {isFree && (
            <div className="flex items-center gap-3">
              {/* Progress bar */}
              <div className="hidden sm:block">
                <div className="w-28 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{ width: `${Math.min((docsUsed / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <button
                onClick={handleUpgrade}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                  bg-brand-600 hover:bg-brand-700 text-white transition-colors"
              >
                <Crown size={12} /> Upgrade Pro
              </button>
            </div>
          )}
          {!isFree && (
            <button
              onClick={async () => {
                try {
                  const { data } = await paymentsApi.createPortal();
                  window.location.href = data.url;
                } catch { toast.error('Erro ao abrir portal'); }
              }}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              Gerenciar assinatura <ChevronRight size={12} />
            </button>
          )}
        </div>

        {/* ── Search & view toggle ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar documentos…"
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border
                bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800
                text-gray-800 dark:text-gray-200 outline-none
                focus:border-brand-400 dark:focus:border-brand-600 transition-colors"
            />
          </div>
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
            <button onClick={() => setView('grid')}
              className={`px-2 py-2 transition-colors ${view === 'grid'
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setView('list')}
              className={`px-2 py-2 transition-colors ${view === 'list'
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <List size={15} />
            </button>
          </div>
        </div>

        {/* ── Document list ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-brand-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FileText size={52} className="text-gray-200 dark:text-gray-700 mb-4" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {query ? 'Nenhum resultado' : 'Sem documentos ainda'}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {query ? 'Tente outra busca' : 'Clique em "Novo Documento" para começar'}
            </p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* New document card */}
            <button
              onClick={handleNewDocument}
              className="aspect-[3/4] rounded-xl border-2 border-dashed
                border-gray-300 dark:border-gray-700
                hover:border-brand-400 dark:hover:border-brand-600
                flex flex-col items-center justify-center gap-2
                text-gray-400 dark:text-gray-600 hover:text-brand-500 dark:hover:text-brand-400
                transition-all group bg-white dark:bg-gray-900"
            >
              <Plus size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Novo</span>
            </button>

            {filtered.map((doc) => (
              <div key={doc.id}
                onClick={() => navigate(`/editor/${doc.id}`)}
                className="aspect-[3/4] rounded-xl overflow-hidden border
                  border-gray-200 dark:border-gray-800
                  hover:border-brand-300 dark:hover:border-brand-700
                  cursor-pointer transition-all hover:shadow-lg group
                  bg-white dark:bg-gray-900 relative flex flex-col"
              >
                {/* Thumbnail */}
                <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                  {doc.thumbnail_url ? (
                    <img src={doc.thumbnail_url} alt={doc.title} className="w-full h-full object-cover" />
                  ) : (
                    <FileText size={32} className="text-gray-200 dark:text-gray-700" />
                  )}
                </div>

                {/* Info */}
                <div className="px-2.5 py-2 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {doc.title}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5 flex items-center gap-1">
                    <Clock size={9} /> {fmt(doc.updated_at)}
                  </p>
                </div>

                {/* Delete hover */}
                <button
                  onClick={(e) => handleDelete(doc.id, e)}
                  disabled={deleting === doc.id}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full
                    bg-red-500 text-white flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {deleting === doc.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="bg-white dark:bg-gray-900 rounded-xl border
            border-gray-200 dark:border-gray-800 overflow-hidden divide-y
            divide-gray-100 dark:divide-gray-800">
            {filtered.map((doc) => (
              <div key={doc.id}
                onClick={() => navigate(`/editor/${doc.id}`)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50
                  dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
              >
                <FileText size={18} className="text-brand-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{doc.title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 flex items-center gap-1">
                    <Clock size={10} /> {fmt(doc.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(doc.id, e)}
                  disabled={deleting === doc.id}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center
                    justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/20
                    text-red-500 transition-all"
                >
                  {deleting === doc.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
