import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VellumLogo from '../components/common/Logo';
import ThemeToggle from '../components/common/ThemeToggle';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (form.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      // Auto-login após registro
      await login(form.email, form.password);
      toast.success('Conta criada com sucesso! 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        'Erro ao criar conta. Verifique os dados ou tente novamente.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthColors = ['#e0e0e0', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
  const strengthLabels = ['', 'Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Excelente'];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ position: 'fixed', top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: 440 }}>
        <Link
          to="/"
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 40, color: 'var(--text-primary)' }}
        >
          <VellumLogo size={36} showText={true} />
        </Link>

        <div className="card" style={{ padding: '36px 32px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
            Criar conta grátis
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', marginBottom: 28 }}>
            5 documentos/mês sem precisar de cartão
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Nome */}
            <div>
              <label className="label">Nome completo</label>
              <input
                className="input"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Seu nome"
                value={form.name}
                onChange={handleChange('name')}
                autoFocus
              />
            </div>

            {/* Email */}
            <div>
              <label className="label">E-mail</label>
              <input
                className="input"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange('email')}
              />
            </div>

            {/* Senha */}
            <div>
              <label className="label">Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={handleChange('password')}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4, display: 'flex'
                  }}
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPass ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>

              {/* Barra de força da senha */}
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: i <= strength ? strengthColors[strength] : 'var(--border-color)',
                        transition: 'background 0.3s'
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="label">Confirmar senha</label>
              <input
                className="input"
                type={showPass ? 'text' : 'password'}
                name="confirm-password"
                autoComplete="new-password"
                placeholder="Repita a senha"
                value={form.confirm}
                onChange={handleChange('confirm')}
                style={{
                  borderColor: form.confirm && form.confirm !== form.password ? '#ef4444' : undefined
                }}
              />
              {form.confirm && form.confirm !== form.password && (
                <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                  As senhas não coincidem
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 8 }}
              disabled={loading}
            >
              {loading
                ? <><div className="spinner" />&nbsp;Criando conta...</>
                : 'Criar Conta Grátis'}
            </button>
          </form>

          <div style={{
            marginTop: 20,
            padding: '12px 16px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            fontSize: 13,
            color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span>✅</span>
            <span>Plano Gratuito: 5 documentos/mês, editor completo, conversão de arquivos</span>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
            Já tem conta?{' '}
            <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
