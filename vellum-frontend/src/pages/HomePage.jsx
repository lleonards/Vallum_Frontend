import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Image as ImageIcon, ZoomIn, Moon, Sun,
  FileUp, Download, Crown, Check, ArrowRight,
  Type, Move, Layers, Palette,
} from 'lucide-react';
import Header from '../components/Layout/Header';
import Logo from '../components/Common/Logo';

const FEATURES = [
  {
    icon: <Type size={22} className="text-brand-500" />,
    title: 'Texto Livre',
    desc: 'Adicione e posicione textos em qualquer lugar da página com total liberdade.',
  },
  {
    icon: <ImageIcon size={22} className="text-purple-500" />,
    title: 'Imagens Flexíveis',
    desc: 'Insira imagens em qualquer posição, redimensione e gire como quiser.',
  },
  {
    icon: <Move size={22} className="text-green-500" />,
    title: 'Arraste e Solte',
    desc: 'Mova qualquer elemento livremente pelo canvas, igual ao Canva.',
  },
  {
    icon: <ZoomIn size={22} className="text-amber-500" />,
    title: 'Zoom Avançado',
    desc: 'Zoom com scroll do mouse, até 600%, com pan por Alt+Arrasto.',
  },
  {
    icon: <FileUp size={22} className="text-red-500" />,
    title: 'Editor de PDF',
    desc: 'Importe um PDF, edite visualmente no canvas e exporte de volta como PDF.',
  },
  {
    icon: <Palette size={22} className="text-pink-500" />,
    title: 'Tema Claro/Escuro',
    desc: 'Interface moderna com modo claro e escuro para trabalhar confortavelmente.',
  },
  {
    icon: <Layers size={22} className="text-cyan-500" />,
    title: 'Múltiplas Páginas',
    desc: 'Crie documentos com quantas páginas quiser, gerencie pelo painel lateral.',
  },
  {
    icon: <Download size={22} className="text-indigo-500" />,
    title: 'Export PDF',
    desc: 'Exporte seus documentos como PDF com um clique, em alta qualidade.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center
        text-center px-4 py-20 relative overflow-hidden">

        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full
            bg-brand-100 dark:bg-brand-950/30 blur-3xl opacity-60" />
          <div className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full
            bg-purple-100 dark:bg-purple-950/30 blur-3xl opacity-60" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white mb-5 leading-tight">
            O editor de documentos{' '}
            <span className="gradient-text">visual e intuitivo</span>
          </h1>

          <p className="text-xl text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            Crie, edite e exporte documentos com liberdade total.
            Importe PDFs, adicione imagens, mova textos — tudo no browser.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base
                bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-lg
                shadow-brand-500/25 hover:shadow-brand-500/40">
              Começar grátis <ArrowRight size={17} />
            </Link>
            <Link to="/pricing"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base
                bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800
                text-gray-800 dark:text-gray-200 hover:border-brand-300 dark:hover:border-brand-700
                transition-colors">
              <Crown size={16} className="text-amber-500" /> Ver planos
            </Link>
          </div>

          <p className="text-sm text-gray-400 dark:text-gray-600 mt-4">
            Grátis para começar · Sem cartão de crédito
          </p>
        </div>
      </section>

      {/* ── Features grid ─────────────────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
              Tudo que você precisa
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Funcionalidades profissionais com a simplicidade do Canva
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="bg-white dark:bg-gray-900 rounded-2xl p-5
                  border border-gray-100 dark:border-gray-800
                  hover:border-brand-200 dark:hover:border-brand-800
                  hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800
                  flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1.5">
                  {f.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing teaser ────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            Preço justo para todo mundo
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Comece de graça. Faça upgrade quando precisar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
            {/* Free */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800
              bg-white dark:bg-gray-900 p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Grátis</p>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">R$0</p>
              {['5 documentos/mês', 'Editor completo', 'Export PDF'].map(f => (
                <p key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <Check size={14} className="text-green-500" /> {f}
                </p>
              ))}
            </div>

            {/* Pro */}
            <div className="rounded-2xl bg-gradient-to-b from-brand-600 to-brand-700 p-6 text-white">
              <p className="text-xs font-semibold text-brand-200 uppercase tracking-wide mb-2">Pro</p>
              <p className="text-3xl font-extrabold mb-4">R$29,90<span className="text-brand-200 text-base font-normal">/mês</span></p>
              {['Documentos ilimitados', 'Suporte prioritário', 'Todos os recursos'].map(f => (
                <p key={f} className="flex items-center gap-2 text-sm mb-2">
                  <Check size={14} className="text-white/80" /> {f}
                </p>
              ))}
            </div>
          </div>

          <Link to="/pricing"
            className="inline-flex items-center gap-2 mt-8 text-brand-600 dark:text-brand-400
              font-semibold hover:underline">
            Ver todos os planos <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-brand-600 py-16 px-4 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">
          Pronto para começar?
        </h2>
        <p className="text-brand-200 mb-8 text-lg">
          Crie seu primeiro documento em segundos. Grátis, sem cadastro de cartão.
        </p>
        <Link to="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-lg
            bg-white text-brand-700 hover:bg-brand-50 transition-colors shadow-xl">
          Começar agora — grátis <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-xs text-gray-400 dark:text-gray-600
        border-t border-gray-100 dark:border-gray-900">
        <Logo size="sm" />
        <p className="mt-2">© {new Date().getFullYear()} Vellum Editor. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
