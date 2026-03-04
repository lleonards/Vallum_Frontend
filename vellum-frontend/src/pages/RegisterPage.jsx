import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Logo from '../components/Common/Logo';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirm) return toast.error('Preencha todos os campos');
    if (password.length < 6) return toast.error('Senha deve ter pelo menos 6 caracteres');
    if (password !== confirm) return toast.error('As senhas não coincidem');

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;
      toast.success('Conta criada! Bem-vindo ao Vellum 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm
    bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700
    text-gray-900 dark:text-white outline-none
    focus:border-brand-500 dark:focus:border-brand-500
    placeholder-gray-400 transition-colors`;

  return (
    <div className="min-h-screen flex items-center justify-center
      bg-gradient-to-br from-gray-50 to-brand-50 dark:from-gray-950 dark:to-gray-900 p-4">

      <button onClick={toggleTheme}
        className="fixed top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full
          bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700
          text-gray-600 dark:text-gray-400 hover:scale-105 transition-all">
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl
          border border-gray-200 dark:border-gray-800 p-8">

          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          <h1 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-1">
            Criar conta gratuita
          </h1>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
            5 documentos/mês grátis, sem cartão de crédito
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nome (opcional)
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome" className={inputClass} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                E-mail *
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" className={inputClass} required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Senha *
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPwd ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres" className={`${inputClass} pr-9`} required />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirmar senha *
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPwd ? 'text' : 'password'} value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repita a senha" className={inputClass} required />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white
                bg-brand-600 hover:bg-brand-700 disabled:opacity-60
                transition-colors flex items-center justify-center gap-2">
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Criando conta…</>
                : 'Criar conta grátis'}
            </button>
          </form>

          <p className="text-xs text-center text-gray-400 dark:text-gray-600 mt-4">
            Ao criar conta você concorda com nossos termos de uso.
          </p>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
            Já tem conta?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
