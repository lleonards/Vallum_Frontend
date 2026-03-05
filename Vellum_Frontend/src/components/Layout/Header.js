import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import VellumLogo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';
import toast from 'react-hot-toast';

const Header = ({ minimal = false }) => {
  const { user, isAuthenticated, logout, isPro } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Até logo! 👋');
    setMenuOpen(false);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: 'var(--header-height)',
      background: 'var(--header-bg)',
      borderBottom: '1.5px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 16,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      {/* Logo */}
      <Link to={isAuthenticated ? '/dashboard' : '/'} style={{ color: 'var(--text-primary)', flexShrink: 0 }}>
        <VellumLogo size={28} showText={true} />
      </Link>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {!minimal && (
        <>
          {/* Nav Links (desktop) */}
          <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }}
            className="desktop-nav">
            {!isAuthenticated && (
              <>
                <Link to="/pricing" className="btn btn-ghost btn-sm">
                  Preços
                </Link>
              </>
            )}
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="btn btn-ghost btn-sm"
                  style={{ color: location.pathname === '/dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  Dashboard
                </Link>
                <Link
                  to="/editor"
                  className="btn btn-primary btn-sm"
                  style={{ gap: 6 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Novo Documento
                </Link>
              </>
            )}
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />

            {isAuthenticated ? (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(prev => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 10px',
                    background: menuOpen ? 'var(--bg-hover)' : 'transparent',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 28, height: 28,
                    background: 'var(--brand-dark)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0
                  }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name?.split(' ')[0] || 'Usuário'}
                  </span>
                  {isPro && (
                    <span className="badge badge-pro" style={{ fontSize: 9, padding: '2px 6px' }}>PRO</span>
                  )}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'var(--modal-bg)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    minWidth: 200,
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 200,
                    overflow: 'hidden',
                    animation: 'slideUp 0.15s ease'
                  }}>
                    {/* User info */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{user?.email}</div>
                      <div style={{ marginTop: 8 }}>
                        <span className={`badge badge-${isPro ? 'pro' : 'free'}`}>
                          {isPro ? '⭐ Pro' : 'Gratuito'}
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: 8 }}>
                      <Link to="/profile" onClick={() => setMenuOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)', fontSize: 14, fontWeight: 500,
                        transition: 'var(--transition)'
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        Meu Perfil
                      </Link>

                      {!isPro && (
                        <Link to="/pricing" onClick={() => setMenuOpen(false)} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 12px', borderRadius: 'var(--radius-md)',
                          color: 'var(--text-primary)', fontSize: 14, fontWeight: 500,
                          transition: 'var(--transition)'
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                          Upgrade para Pro
                        </Link>
                      )}

                      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '6px 0' }} />

                      <button onClick={handleLogout} style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '8px 12px', borderRadius: 'var(--radius-md)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#e53e3e', fontSize: 14, fontWeight: 500,
                        transition: 'var(--transition)'
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" className="btn btn-ghost btn-sm">Entrar</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Criar Conta</Link>
              </div>
            )}
          </div>
        </>
      )}

      {minimal && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <ThemeToggle />
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav a:not(.btn-primary) { display: none; }
        }
      `}</style>
    </header>
  );
};

export default Header;
