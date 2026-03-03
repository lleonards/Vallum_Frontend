import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/utils/supabase'
import { useThemeStore } from '@/store/themeStore'
import { FileText, Mail, Lock, Eye, EyeOff, Sun, Moon, User, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      toast.error('Preencha todos os campos')
      return
    }
    if (password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      })
      if (error) throw error
      toast.success('Conta criada! Verifique seu e-mail.')
      navigate('/login')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <button onClick={toggleTheme} className="toolbar-btn">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 group">
            <ArrowLeft size={16} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
            <span className="text-sm text-gray-500 group-hover:text-primary-600 transition-colors">Voltar ao início</span>
          </Link>

          <div className="card p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white text-xl">Vellum</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Editor de PDF</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Criar conta grátis</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
              Já tem uma conta? <Link to="/login" className="text-primary-600 hover:underline font-medium">Entre aqui</Link>
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Nome completo</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="input-field pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="input-field pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 caracteres"
                    className="input-field pl-9 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ao criar uma conta, você concorda com nossos{' '}
                <a href="#" className="text-primary-600 hover:underline">Termos de Uso</a>{' '}
                e{' '}
                <a href="#" className="text-primary-600 hover:underline">Política de Privacidade</a>.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="loader w-4 h-4" /> Criando conta...
                  </span>
                ) : 'Criar conta grátis'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
