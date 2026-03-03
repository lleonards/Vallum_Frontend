import Navbar from '@/components/layout/Navbar'
import { Link } from 'react-router-dom'
import { Check, Zap, Shield, Building2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

const plans = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 'R$0',
    period: '/mês',
    description: 'Para uso pessoal ocasional',
    features: [
      '5 documentos por mês',
      'Edição básica de texto',
      'Adicionar imagens',
      'Export PDF',
      '100MB de armazenamento',
    ],
    cta: 'Começar Grátis',
    highlighted: false,
    icon: Shield,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$29',
    period: '/mês',
    description: 'Para profissionais e freelancers',
    features: [
      'Documentos ilimitados',
      'Todas as ferramentas de edição',
      'Conversão de arquivos',
      'Rotação e orientação de páginas',
      'Assinatura digital',
      '10GB de armazenamento',
      'Suporte por chat',
    ],
    cta: 'Assinar Pro',
    highlighted: true,
    icon: Zap,
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: 'R$99',
    period: '/mês',
    description: 'Para empresas e equipes',
    features: [
      'Tudo do plano Pro',
      'Até 20 usuários',
      'API de integração',
      'Relatórios de uso',
      '100GB de armazenamento',
      'SLA garantido 99.9%',
      'Suporte dedicado',
    ],
    cta: 'Falar com Vendas',
    highlighted: false,
    icon: Building2,
  },
]

export default function PricingPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Planos simples e transparentes
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-xl mx-auto">
            Comece grátis, faça upgrade quando precisar. Sem surpresas na fatura.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`card p-8 flex flex-col ${
                plan.highlighted
                  ? 'border-primary-500 ring-2 ring-primary-500 dark:ring-primary-400 shadow-xl relative'
                  : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                    ⭐ Mais Popular
                  </span>
                </div>
              )}

              <div className={`w-10 h-10 rounded-xl bg-gray-100 dark:bg-dark-700 flex items-center justify-center mb-5
                ${plan.highlighted ? 'bg-primary-100 dark:bg-primary-900/30' : ''}`}>
                <plan.icon size={20} className={plan.highlighted ? 'text-primary-600' : 'text-gray-500'} />
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate(user ? '/settings' : '/register')}
                className={plan.highlighted ? 'btn-primary justify-center py-3' : 'btn-secondary justify-center py-3'}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Todos os planos incluem SSL, backups automáticos e conformidade com a LGPD.
            <br />
            Dúvidas? <a href="mailto:suporte@vellum.app" className="text-primary-600 hover:underline">Entre em contato</a>
          </p>
        </div>
      </div>
    </div>
  )
}
