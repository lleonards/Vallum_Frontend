import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { supabase } from '@/utils/supabase'
import api from '@/utils/api'
import { 
  User, CreditCard, Bell, Shield, Sun, Moon, 
  Check, Crown, Zap, Building2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { loadStripe } from '@stripe/stripe-js'
import { config } from '@/utils/config'

const stripePromise = loadStripe(config.stripePublicKey)

const PLANS = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 'R$0',
    period: '/mês',
    features: ['5 documentos/mês', 'Edição básica', 'Export PDF', '100MB'],
    priceId: null,
    icon: Shield,
    color: 'text-gray-500',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$29',
    period: '/mês',
    features: ['Ilimitado', 'Todas ferramentas', 'Conversão', '10GB'],
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    icon: Zap,
    color: 'text-primary-500',
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: 'R$99',
    period: '/mês',
    features: ['Tudo do Pro', 'Equipe', 'API', '100GB'],
    priceId: import.meta.env.VITE_STRIPE_ENT_PRICE_ID,
    icon: Building2,
    color: 'text-purple-500',
  },
]

type Tab = 'profile' | 'billing' | 'notifications' | 'security'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [currentPlan] = useState('free')

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName }
      })
      if (error) throw error
      toast.success('Perfil atualizado!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSubscribe = async (priceId: string) => {
    try {
      const { data } = await api.post('/api/stripe/create-checkout', { priceId })
      const stripe = await stripePromise
      if (stripe && data.sessionId) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      }
    } catch (err) {
      toast.error('Erro ao processar pagamento')
    }
  }

  const handleManageBilling = async () => {
    try {
      const { data } = await api.post('/api/stripe/portal')
      if (data.url) window.location.href = data.url
    } catch {
      toast.error('Erro ao abrir portal de pagamento')
    }
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'billing', label: 'Plano & Pagamento', icon: CreditCard },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Configurações</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar tabs */}
          <div className="w-full md:w-52 flex-shrink-0">
            <div className="card p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${activeTab === tab.id
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                    }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="card p-6 space-y-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Informações do Perfil</h2>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
                    <p className="text-sm text-gray-500">Conta criada</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Nome</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">E-mail</label>
                  <input type="email" value={user?.email || ''} disabled className="input-field opacity-60" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-800 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Tema</p>
                    <p className="text-xs text-gray-500">{isDark ? 'Modo Escuro' : 'Modo Claro'}</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? 'bg-primary-600' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isDark ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
                  {saving ? <><div className="loader w-4 h-4" /> Salvando...</> : 'Salvar alterações'}
                </button>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-4">
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Plano Atual</h2>
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-full uppercase">
                      {currentPlan}
                    </span>
                  </div>
                  <button onClick={handleManageBilling} className="btn-secondary text-sm">
                    <CreditCard size={15} /> Gerenciar cobrança
                  </button>
                </div>

                <div className="grid gap-4">
                  {PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      className={`card p-5 flex items-center gap-4 ${currentPlan === plan.id ? 'border-primary-500 ring-1 ring-primary-500' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gray-100 dark:bg-dark-700 flex items-center justify-center ${plan.color}`}>
                        <plan.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                          {currentPlan === plan.id && (
                            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-medium rounded-full">
                              Atual
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{plan.price}</span>
                          <span className="text-sm text-gray-500">{plan.period}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {plan.features.map((f) => (
                            <span key={f} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                              <Check size={11} className="text-green-500" /> {f}
                            </span>
                          ))}
                        </div>
                      </div>
                      {currentPlan !== plan.id && plan.priceId && (
                        <button
                          onClick={() => handleSubscribe(plan.priceId!)}
                          className="btn-primary text-xs py-1.5 flex-shrink-0"
                        >
                          Assinar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="card p-6 space-y-4">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Notificações</h2>
                {[
                  { label: 'Novidades e atualizações', desc: 'Receba emails sobre novos recursos' },
                  { label: 'Alertas de conta', desc: 'Notificações sobre sua conta e segurança' },
                  { label: 'Dicas de uso', desc: 'Tutoriais e dicas para usar o Vellum' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    <button className="relative w-10 h-5 bg-primary-500 rounded-full flex-shrink-0">
                      <span className="absolute top-0.5 left-5 w-4 h-4 bg-white rounded-full shadow transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="card p-6 space-y-4">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Segurança</h2>
                <div className="space-y-3">
                  <button className="btn-secondary w-full justify-start">
                    <Shield size={16} /> Alterar senha
                  </button>
                  <button className="btn-secondary w-full justify-start">
                    <Shield size={16} /> Autenticação em dois fatores
                  </button>
                  <button className="btn-danger w-full justify-start mt-6" onClick={() => {
                    if (confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')) {
                      toast.error('Para excluir sua conta, entre em contato com o suporte.')
                    }
                  }}>
                    Excluir conta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
