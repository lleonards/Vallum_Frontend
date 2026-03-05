import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, refreshUser, isPro, logout } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '' });
  const [passForm, setPassForm] = useState({ newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Nome é obrigatório'); return; }
    setSaving(true);
    try {
      await api.put('/user/profile', { name: form.name });
      await refreshUser();
      toast.success('Perfil atualizado! ✅');
    } catch { toast.error('Erro ao salvar perfil'); }
    finally { setSaving(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword.length < 6) { toast.error('Senha deve ter pelo menos 6 caracteres'); return; }
    if (passForm.newPassword !== passForm.confirm) { toast.error('Senhas não coincidem'); return; }
    setSaving(true);
    try {
      await api.put('/user/password', { newPassword: passForm.newPassword });
      setPassForm({ newPassword: '', confirm: '' });
      toast.success('Senha alterada! ✅');
    } catch { toast.error('Erro ao alterar senha'); }
    finally { setSaving(false); }
  };

  const handleManageSubscription = async () => {
    setManagingSubscription(true);
    try {
      const res = await api.post('/payments/create-portal');
      window.location.href = res.data.url;
    } catch { toast.error('Erro ao abrir portal'); setManagingSubscription(false); }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Tem CERTEZA que deseja excluir sua conta? Esta ação é irreversível!')) return;
    if (!window.confirm('CONFIRMAÇÃO FINAL: Todos os seus documentos serão excluídos permanentemente.')) return;
    try {
      await api.delete('/user/account');
      logout();
      toast.success('Conta excluída');
    } catch { toast.error('Erro ao excluir conta'); }
  };

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
      fontSize: 14, fontWeight: tab === id ? 600 : 400,
      color: tab === id ? 'var(--text-primary)' : 'var(--text-secondary)',
      borderBottom: `2px solid ${tab === id ? 'var(--brand-dark)' : 'transparent'}`,
      transition: 'var(--transition)'
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <Header />

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
        {/* Avatar + name header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--brand-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, color: 'white', flexShrink: 0
          }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>{user?.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user?.email}</p>
            <div style={{ marginTop: 6 }}>
              <span className={`badge badge-${isPro ? 'pro' : 'free'}`}>
                {isPro ? '⭐ Plano Pro' : 'Plano Gratuito'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1.5px solid var(--border-color)', marginBottom: 32, display: 'flex' }}>
          <TabBtn id="profile" label="Perfil" />
          <TabBtn id="security" label="Segurança" />
          <TabBtn id="subscription" label="Assinatura" />
          <TabBtn id="danger" label="Conta" />
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <form onSubmit={saveProfile}>
            <div className="card">
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Informações do Perfil</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label className="label">Nome completo</label>
                  <input className="input" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Seu nome" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" value={user?.email || ''} disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    O email não pode ser alterado aqui.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" />&nbsp;Salvando...</> : 'Salvar Alterações'}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="card" style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Estatísticas</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Total de Docs', value: user?.totalDocs || 0 },
                  { label: 'Docs este mês', value: user?.monthlyDocs || 0 },
                  { label: 'Limite mensal', value: isPro ? '∞' : '5' }
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', padding: '16px 8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* Security Tab */}
        {tab === 'security' && (
          <form onSubmit={savePassword}>
            <div className="card">
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Alterar Senha</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="label">Nova Senha</label>
                  <input className="input" type="password" placeholder="Mínimo 6 caracteres"
                    value={passForm.newPassword}
                    onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Confirmar Nova Senha</label>
                  <input className="input" type="password" placeholder="Repita a nova senha"
                    value={passForm.confirm}
                    onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))}
                    style={{ borderColor: passForm.confirm && passForm.confirm !== passForm.newPassword ? '#ef4444' : undefined }} />
                </div>
              </div>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" />&nbsp;Salvando...</> : 'Alterar Senha'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Subscription Tab */}
        {tab === 'subscription' && (
          <div>
            <div className="card">
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Seu Plano</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                {isPro ? 'Você tem acesso ilimitado ao Vellum Pro' : 'Você está no plano gratuito'}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
                <div>
                  <span className={`badge badge-${isPro ? 'pro' : 'free'}`} style={{ marginBottom: 6 }}>
                    {isPro ? '⭐ Pro' : 'Gratuito'}
                  </span>
                  <p style={{ fontSize: 14, fontWeight: 500, marginTop: 6 }}>
                    {isPro ? 'R$ 4,90/mês · Documentos ilimitados' : 'R$ 0/mês · 5 documentos/mês'}
                  </p>
                </div>
                {isPro ? (
                  <button className="btn btn-secondary btn-sm" onClick={handleManageSubscription} disabled={managingSubscription}>
                    {managingSubscription ? '...' : 'Gerenciar'}
                  </button>
                ) : (
                  <Link to="/pricing" className="btn btn-primary btn-sm">Upgrade</Link>
                )}
              </div>

              {!isPro && (
                <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    🚀 Upgrade para Pro por apenas <strong>R$ 4,90/mês</strong> e tenha documentos ilimitados.
                  </p>
                  <Link to="/pricing" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Ver Plano Pro
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        {tab === 'danger' && (
          <div className="card" style={{ border: '1.5px solid #ef4444' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>Zona de Perigo</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
              Ao excluir sua conta, todos os seus documentos e dados serão permanentemente removidos.
            </p>
            <button className="btn btn-danger" onClick={deleteAccount}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Excluir Minha Conta
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
