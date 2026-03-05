import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import api from '../services/api';
import toast from 'react-hot-toast';

const CheckItem = ({ text }) => (
  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 15, color: 'var(--text-secondary)', marginBottom: 10 }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    {text}
  </li>
);

const PricingPage = () => {
  const { user, isAuthenticated, isPro, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    if (isPro) {
      toast('Você já tem o plano Pro! 🎉');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/payments/create-checkout');
      window.location.href = res.data.url;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao iniciar pagamento');
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const res = await api.post('/payments/create-portal');
      window.location.href = res.data.url;
    } catch {
      toast.error('Erro ao abrir portal de assinatura');
      setLoading(false);
    }
  };

  const freeFeatures = [
    '5 documentos por mês',
    'Editor visual estilo Canva',
    'Mover e redimensionar elementos',
    'Adicionar imagens e textos',
    'Super zoom até 1500%',
    'Editor de PDF (upload e edição)',
    'Conversão de arquivos',
    'Tema claro e escuro',
    'Download em múltiplos formatos',
    'Acesso em qualquer dispositivo'
  ];

  const proFeatures = [
    'Documentos ILIMITADOS por mês',
    'Tudo do plano gratuito incluído',
    'Suporte prioritário'
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
      <Header />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="badge" style={{
            background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)', marginBottom: 20
          }}>
            💰 Preços Simples e Transparentes
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, marginBottom: 16, marginTop: 12 }}>
            Acessível para todos
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
            Comece gratuitamente. Faça upgrade apenas quando precisar de mais.
          </p>
        </div>

        {/* Plans grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
          alignItems: 'start'
        }}>
          {/* Free Plan */}
          <div className="card" style={{ padding: '36px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="badge badge-free">Gratuito</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>R$ 0</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
              Para sempre · 5 documentos/mês
            </p>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32 }}>
              {freeFeatures.map(f => <CheckItem key={f} text={f} />)}
            </ul>

            {!isAuthenticated ? (
              <Link to="/register" className="btn btn-secondary btn-lg" style={{ width: '100%' }}>
                Criar Conta Grátis
              </Link>
            ) : !isPro ? (
              <Link to="/dashboard" className="btn btn-secondary btn-lg" style={{ width: '100%' }}>
                ✅ Plano Atual
              </Link>
            ) : (
              <button className="btn btn-secondary btn-lg" style={{ width: '100%' }} disabled>
                Disponível no seu plano
              </button>
            )}
          </div>

          {/* Pro Plan */}
          <div className="card" style={{
            padding: '36px 32px',
            border: '2px solid var(--brand-dark)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Popular badge */}
            <div style={{
              position: 'absolute',
              top: 20, right: -32,
              background: 'var(--brand-dark)',
              color: 'white',
              fontSize: 11,
              fontWeight: 700,
              padding: '5px 40px',
              transform: 'rotate(45deg)',
              letterSpacing: '0.08em'
            }}>
              POPULAR
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="badge badge-pro">⭐ Pro</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 2 }}>
              R$ 4,90
              <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-secondary)' }}>/mês</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
              Cancele quando quiser
            </p>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32 }}>
              {proFeatures.map(f => <CheckItem key={f} text={f} />)}
              <li style={{ padding: '10px 0', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 13 }}>
                Inclui todos os recursos do plano gratuito
              </li>
            </ul>

            {isPro ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="btn btn-secondary btn-lg" style={{ width: '100%', justifyContent: 'center', cursor: 'default' }}>
                  ✅ Plano Atual
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', color: 'var(--text-secondary)' }}
                  onClick={handleManageSubscription}
                  disabled={loading}
                >
                  Gerenciar assinatura
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={handleUpgrade}
                disabled={loading}
              >
                {loading ? (
                  <><div className="spinner" />&nbsp;Aguarde...</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    {isAuthenticated ? 'Fazer Upgrade Agora' : 'Começar com Pro'}
                  </>
                )}
              </button>
            )}

            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
              🔒 Pagamento seguro via Stripe
            </p>
          </div>
        </div>

        {/* Comparison note */}
        <div style={{
          textAlign: 'center',
          marginTop: 48,
          padding: '24px',
          background: 'var(--card-bg)',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border-color)'
        }}>
          <h3 style={{ fontSize: 18, marginBottom: 12 }}>A única diferença</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>
            O plano <strong>Pro</strong> oferece exatamente os mesmos recursos do plano gratuito —
            a diferença é que você terá <strong>documentos ilimitados</strong> por mês, em vez de 5.
            Queremos que o Vellum seja acessível para todos! 💙
          </p>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 28, textAlign: 'center', marginBottom: 32 }}>Perguntas Frequentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { q: 'Posso cancelar a qualquer momento?', a: 'Sim! Não há fidelidade. Cancele quando quiser pelo portal de assinatura.' },
              { q: 'O plano gratuito é realmente grátis?', a: 'Sim, para sempre. Você tem 5 documentos por mês sem pagar nada e sem precisar de cartão.' },
              { q: 'O que acontece se eu atingir o limite de 5 documentos?', a: 'Você não conseguirá criar novos documentos até o próximo mês, a menos que faça upgrade para Pro.' },
              { q: 'Quais formatos posso exportar?', a: 'PDF, DOCX, TXT, HTML, Markdown, RTF, JSON e CSV. Suportamos os principais formatos do mercado.' },
              { q: 'O pagamento é seguro?', a: 'Sim, usamos o Stripe — o processador de pagamentos mais confiável do mundo, com criptografia PCI DSS.' }
            ].map(item => (
              <div key={item.q} className="card" style={{ padding: '20px 24px' }}>
                <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{item.q}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer style={{
        padding: '32px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 13,
        borderTop: '1px solid var(--border-color)',
        marginTop: 48
      }}>
        <p>© {new Date().getFullYear()} Vellum. Feito com ❤️ para criadores de conteúdo.</p>
      </footer>
    </div>
  );
};

export default PricingPage;
