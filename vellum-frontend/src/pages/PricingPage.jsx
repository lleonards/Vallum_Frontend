import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Zap, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Layout/Header';
import { paymentsApi } from '../lib/api';
import { useAuthStore } from '../store/editorStore';

const FREE_FEATURES = [
  'Até 5 documentos por mês',
  'Editor canvas estilo Canva',
  'Importar e editar PDF',
  'Exportar para PDF',
  'Adicionar imagens e texto',
  'Temas claro e escuro',
];

const PRO_FEATURES = [
  'Documentos ilimitados',
  'Tudo do plano gratuito',
  'Suporte prioritário',
  'Histórico ilimitado de versões',
  'Acesso a novos recursos primeiro',
  'Sem marca d\'água no export',
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) { navigate('/register'); return; }
    setLoading(true);
    try {
      const { data } = await paymentsApi.createCheckout();
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao iniciar checkout');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Heading */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
            bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 mb-4">
            <Zap size={12} /> Planos simples e transparentes
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            Escolha seu plano
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg">
            Comece gratuitamente. Faça upgrade quando precisar de mais.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">

          {/* Free */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border
            border-gray-200 dark:border-gray-800 p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Gratuito
              </p>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">R$0</span>
                <span className="text-gray-400 dark:text-gray-600 mb-1">/mês</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Para começar e explorar</p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              className="w-full py-2.5 rounded-xl font-semibold text-sm
                bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                text-gray-800 dark:text-gray-200 transition-colors"
            >
              {user ? 'Ir para painel' : 'Começar grátis'}
            </button>
          </div>

          {/* Pro */}
          <div className="bg-gradient-to-b from-brand-600 to-brand-700 rounded-2xl p-8 flex flex-col
            shadow-xl shadow-brand-500/20 relative overflow-hidden">

            {/* Popular badge */}
            <div className="absolute top-4 right-4">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
                bg-white/20 text-white backdrop-blur-sm">
                <Crown size={11} /> Mais popular
              </span>
            </div>

            {/* Glow effect */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full
              bg-white/10 blur-3xl" />

            <div className="mb-6 relative">
              <p className="text-sm font-medium text-brand-200 uppercase tracking-wide mb-2">Pro</p>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="text-4xl font-extrabold text-white">R$29,90</span>
                <span className="text-brand-200 mb-1">/mês</span>
              </div>
              <p className="text-sm text-brand-200">Para uso profissional ilimitado</p>
            </div>

            <ul className="space-y-3 flex-1 mb-8 relative">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white">
                  <Check size={16} className="text-white/80 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="relative w-full py-2.5 rounded-xl font-bold text-sm
                bg-white text-brand-700 hover:bg-brand-50 disabled:opacity-70
                transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Processando…</>
                : <><Crown size={15} /> Assinar Pro agora</>}
            </button>
          </div>
        </div>

        {/* FAQ / Guarantee */}
        <div className="mt-12 text-center max-w-lg">
          <p className="text-sm text-gray-400 dark:text-gray-600">
            🔒 Pagamento seguro via Stripe. Cancele a qualquer momento, sem multa.
            Dúvidas? Fale conosco.
          </p>
        </div>
      </main>
    </div>
  );
}
