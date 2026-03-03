import { Link, useNavigate } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/utils/supabase'
import { Sun, Moon, FileText, Menu, X, LogOut, Settings, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { isDark, toggleTheme } = useThemeStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Desconectado com sucesso')
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-dark-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-dark-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 no-select">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
              <FileText size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Vellum</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/pricing" className="btn-ghost text-sm">Preços</Link>
            {user && (
              <Link to="/dashboard" className="btn-ghost text-sm">Meus Arquivos</Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="toolbar-btn w-9 h-9 rounded-lg"
              title="Alternar tema"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                >
                  <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
                    {user.email}
                  </span>
                </button>
                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-52 card shadow-lg py-1 z-50 animate-scale-in">
                    <Link
                      to="/dashboard"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700"
                    >
                      <LayoutDashboard size={15} /> Meus Arquivos
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700"
                    >
                      <Settings size={15} /> Configurações
                    </Link>
                    <hr className="border-gray-200 dark:border-dark-600 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut size={15} /> Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Entrar</Link>
                <Link to="/register" className="btn-primary text-sm">Começar Grátis</Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden toolbar-btn"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1 animate-fade-in">
            <Link to="/pricing" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg">
              Preços
            </Link>
            {!user ? (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg">
                  Entrar
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary w-full justify-center mt-2">
                  Começar Grátis
                </Link>
              </>
            ) : (
              <button onClick={handleLogout} className="btn-ghost w-full justify-start text-red-600">
                <LogOut size={15} /> Sair
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
