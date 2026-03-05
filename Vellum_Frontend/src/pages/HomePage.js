import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header';
import VellumLogo from '../components/common/Logo';
import { useTheme } from '../contexts/ThemeContext';

const FeatureCard = ({ icon, title, desc }) => (
  <div className="card" style={{ textAlign: 'center', padding: '28px 20px', transition: 'var(--transition)', cursor: 'default' }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
    <div style={{
      width: 52, height: 52,
      background: 'var(--bg-tertiary)',
      borderRadius: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 14px',
      fontSize: 24
    }}>{icon}</div>
    <h3 style={{ fontSize: 16, marginBottom: 8, fontWeight: 600 }}>{title}</h3>
    <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
  </div>
);

const HomePage = () => {
  const { isDark } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
      <Header />

      {/* Hero Section */}
      <section style={{
        minHeight: 'calc(100vh - var(--header-height))',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 24px',
        background: isDark
          ? 'radial-gradient(ellipse at 50% 0%, rgba(61,61,61,0.3) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at 50% 0%, rgba(61,61,61,0.06) 0%, transparent 70%)'
      }}>
        {/* Logo hero */}
        <div style={{ marginBottom: 32, color: 'var(--text-primary)' }}>
          <VellumLogo size={60} showText={false} />
        </div>

        <span className="badge" style={{
          background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
          border: '1px solid var(--border-color)', marginBottom: 24, fontSize: 12
        }}>
          ✨ Editor Profissional de Documentos
        </span>

        <h1 style={{
          fontSize: 'clamp(36px, 7vw, 72px)',
          fontWeight: 800,
          lineHeight: 1.05,
          marginBottom: 20,
          maxWidth: 800,
          letterSpacing: '-0.02em'
        }}>
          Crie documentos<br />
          <span style={{
            background: isDark
              ? 'linear-gradient(135deg, #ffffff 0%, #aaaaaa 100%)'
              : 'linear-gradient(135deg, #3d3d3d 0%, #888888 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            incríveis com Vellum
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          color: 'var(--text-secondary)',
          maxWidth: 560,
          lineHeight: 1.7,
          marginBottom: 40
        }}>
          Editor visual estilo Canva, conversão de arquivos, edição de PDF e muito mais.
          Crie, edite e baixe em dezenas de formatos.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary btn-xl" style={{ minWidth: 180 }}>
            Começar Grátis
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
          <Link to="/pricing" className="btn btn-secondary btn-xl">
            Ver Planos
          </Link>
        </div>

        <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Grátis para sempre • 5 documentos/mês • Sem cartão de crédito
        </p>

        {/* App preview mockup */}
        <div style={{
          marginTop: 64,
          width: '100%', maxWidth: 900,
          background: 'var(--card-bg)',
          border: '2px solid var(--border-color)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: isDark ? '0 40px 80px rgba(0,0,0,0.6)' : '0 40px 80px rgba(0,0,0,0.12)',
        }}>
          {/* Mock toolbar */}
          <div style={{
            height: 52,
            background: 'var(--toolbar-bg)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#ff5f57','#febc2e','#28c840'].map((c,i) => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <div style={{ flex: 1, height: 24, background: 'var(--bg-hover)', borderRadius: 6, maxWidth: 400 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              {[...Array(5)].map((_,i) => (
                <div key={i} style={{ width: 28, height: 24, background: 'var(--bg-hover)', borderRadius: 4 }} />
              ))}
            </div>
          </div>
          {/* Mock canvas area */}
          <div style={{ height: 320, background: 'var(--canvas-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '60%', height: '80%',
              background: 'var(--bg-primary)',
              borderRadius: 8,
              boxShadow: 'var(--shadow-md)',
              display: 'flex', flexDirection: 'column',
              padding: 20, gap: 10
            }}>
              {['80%','60%','70%','50%','65%'].map((w,i) => (
                <div key={i} style={{
                  height: i === 0 ? 20 : 12,
                  width: w,
                  background: 'var(--bg-tertiary)',
                  borderRadius: 4
                }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, marginBottom: 12 }}>Tudo que você precisa</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 48, fontSize: 16 }}>
          Uma plataforma completa para criar e gerenciar seus documentos
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          <FeatureCard icon="🎨" title="Editor Visual" desc="Arraste e solte textos, imagens e elementos livremente. Controle total do layout." />
          <FeatureCard icon="📄" title="Editor de PDF" desc="Faça upload de PDFs, edite o conteúdo e baixe no formato que preferir." />
          <FeatureCard icon="🔄" title="Conversão de Arquivos" desc="Converta entre PDF, DOCX, TXT, HTML, Markdown, RTF e muito mais." />
          <FeatureCard icon="🔍" title="Super Zoom" desc="Zoom de até 1500% para edição precisa de cada detalhe do documento." />
          <FeatureCard icon="📱" title="Responsivo" desc="Use em qualquer dispositivo. Interface adaptada para celular, tablet e desktop." />
          <FeatureCard icon="🌙" title="Tema Claro/Escuro" desc="Escolha o tema que preferir. Seus olhos agradecem no trabalho noturno." />
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
        background: isDark ? 'rgba(61,61,61,0.2)' : 'rgba(61,61,61,0.04)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <VellumLogo size={40} showText={true} style={{ justifyContent: 'center', marginBottom: 24, color: 'var(--text-primary)' }} />
        <h2 style={{ fontSize: 32, marginBottom: 16, marginTop: 24 }}>Comece a usar agora</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16 }}>
          Plano gratuito com 5 documentos por mês. Upgrade por R$ 4,90/mês para ilimitado.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg">Criar Conta Grátis</Link>
          <Link to="/pricing" className="btn btn-secondary btn-lg">Ver Preços</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 13,
        borderTop: '1px solid var(--border-color)'
      }}>
        <p>© {new Date().getFullYear()} Vellum. Feito com ❤️ para criadores de conteúdo.</p>
      </footer>
    </div>
  );
};

export default HomePage;
