import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, User, Crown, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/editorStore';
import { supabase } from '../../lib/supabase';
import Logo from '../Common/Logo';
import toast from 'react-hot-toast';

export default function Header() {
  const { toggleTheme, isDark } = useTheme();
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast.success('Até logo!');
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b
      bg-white dark:bg-gray-900
      border-gray-200 dark:border-gray-800
      shadow-sm z-50">

      {/* Logo */}
      <Link to="/" className="flex items-center">
        <Logo size="sm" />
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium
        text-gray-600 dark:text-gray-400">
        <Link to="/"        className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Início</Link>
        <Link to="/pricing" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Preços</Link>
        {user && (
          <Link to="/dashboard" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1">
            <LayoutDashboard size={14} /> Painel
          </Link>
        )}
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-lg
            hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
            text-gray-600 dark:text-gray-400"
          title={isDark ? 'Modo claro' : 'Modo escuro'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            {/* Plan badge */}
            {profile?.plan === 'pro' ? (
              <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <Crown size={11} /> Pro
              </span>
            ) : (
              <Link to="/pricing"
                className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                  bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400
                  hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950 dark:hover:text-brand-400
                  transition-colors">
                <Crown size={11} /> Upgrade
              </Link>
            )}

            {/* User avatar */}
            <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold select-none">
              {user.email?.[0]?.toUpperCase() || <User size={14} />}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                text-gray-500 dark:text-gray-400"
              title="Sair"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login"
              className="text-sm font-medium text-gray-700 dark:text-gray-300
                hover:text-brand-600 dark:hover:text-brand-400 transition-colors px-2 py-1">
              Entrar
            </Link>
            <Link to="/register"
              className="text-sm font-semibold px-3 py-1.5 rounded-lg
                bg-brand-600 hover:bg-brand-700 text-white transition-colors">
              Começar grátis
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
