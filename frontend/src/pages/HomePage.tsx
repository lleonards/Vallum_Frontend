import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import Navbar from '@/components/layout/Navbar'
import { 
  FileText, Zap, Shield, ChevronRight, 
  Star, ArrowRight, Check, Image as ImageIcon,
  Type, RotateCw, Download, Layers
} from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  { icon: FileText, title: 'Edição Visual', desc: 'Arraste e solte elementos como texto, imagens e formas diretamente no PDF.' },
  { icon: Type, title: 'Editor de Texto', desc: 'Edite, mova e formate textos com fontes, cores e estilos personalizados.' },
  { icon: ImageIcon, title: 'Upload de Imagens', desc: 'Adicione imagens em qualquer posição e tamanho no documento.' },
  { icon: RotateCw, title: 'Orientação de Página', desc: 'Rotacione páginas de vertical para horizontal e vice-versa facilmente.' },
  { icon: Layers, title: 'Formas Geométricas', desc: 'Insira retângulos, círculos, linhas e desenhos à mão livre.' },
  { icon: Download, title: 'Conversão de Arquivos', desc: 'Converta entre PDF, Word, PNG, JPG e outros formatos populares.' },
]

const plans = [
  {
    name: 'Gratuito',
    price: 'R$0',
    period: '/mês',
    features: ['5 documentos por mês', 'Edição básica', 'Export PDF', '100MB de armazenamento'],
    cta: 'Começar Grátis',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'R$29',
    period: '/mês',
    features: ['Documentos ilimitados', 'Todas as ferramentas', 'Conversão de arquivos', '10GB de armazenamento', 'Suporte prioritário'],
    cta: 'Assinar Pro',
    highlighted: true,
  },
  {
    name: 'Empresarial',
    price: 'R$99',
    period: '/mês',
    features: ['Tudo do Pro', 'Colaboração em equipe', 'API de acesso', '100GB de armazenamento', 'SLA garantido'],
    cta: 'Falar com Vendas',
    highlighted: false,
  },
]

export default function HomePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-dark-900 dark:to-dark-800 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-primary-400/20 to-purple-400/20 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 mb-6">
              <Zap size={12} /> O editor de PDF mais intuitivo do Brasil
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Edite PDFs como se fosse{' '}
              <span className="text-gradient">design no Canva</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
              Arraste, solte, edite textos, adicione imagens e converta documentos — 
              tudo com uma interface tão simples quanto o Word, tão poderosa quanto o Canva.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(user ? '/dashboard' : '/register')}
                className="btn-primary text-base px-8 py-3"
              >
                Começar Grátis <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate(user ? '/editor' : '/login')}
                className="btn-secondary text-base px-8 py-3"
              >
                Ver Demonstração
              </button>
            </div>
          </motion.div>

          {/* Editor Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-700 overflow-hidden bg-white dark:bg-dark-900 max-w-4xl mx-auto">
              <div className="bg-gray-100 dark:bg-dark-800 px-4 py-3 flex items-center gap-2 border-b border-gray-200 dark:border-dark-700">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-gray-400 font-mono">vellum.app/editor</span>
              </div>
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-800 dark:to-dark-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-primary-600" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Interface do Editor Vellum</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white dark:bg-dark-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Ferramentas profissionais com interface simples e intuitiva
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-gray-50 dark:bg-dark-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Planos e Preços</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Escolha o plano ideal para você</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`card p-8 flex flex-col ${plan.highlighted ? 'border-primary-500 shadow-lg ring-2 ring-primary-500 dark:ring-primary-400' : ''}`}
              >
                {plan.highlighted && (
                  <span className="self-start px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full mb-4">
                    Mais Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <div className="mt-2 mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Check size={16} className="text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={user ? '/settings' : '/register'}
                  className={plan.highlighted ? 'btn-primary justify-center' : 'btn-secondary justify-center'}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-950 border-t border-gray-200 dark:border-dark-800 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-lg">Vellum</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © 2024 Vellum. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-primary-600 transition-colors">Privacidade</a>
              <a href="#" className="hover:text-primary-600 transition-colors">Termos</a>
              <a href="#" className="hover:text-primary-600 transition-colors">Suporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
