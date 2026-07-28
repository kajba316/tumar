import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/i18n/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatPrice } from '@/lib/format';
import {
  User, LogOut, ChevronDown, ChevronUp, Send, Link2, Check, Shield, History,
  Wallet, Bell, FileText, Lock, Mail, AlertCircle, Smartphone, Clock,
  Package, ShoppingCart, TrendingUp, LogIn, Settings, ChevronRight,
} from 'lucide-react';

type AccountPageProps = {
  onNavigate: (path: string) => void;
};

type Order = {
  id: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
};

type LoginRecord = {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

type BalanceTxn = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
};

type Tab = 'profile' | 'account' | 'history' | 'security' | 'extra';

export default function AccountPage({ onNavigate }: AccountPageProps) {
  const { t } = useLanguage();
  const { user, signOut, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, OrderItem[]>>({});
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);
  const [balanceTxns, setBalanceTxns] = useState<BalanceTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [tgLinked, setTgLinked] = useState(false);

  // Profile edit state
  const [editEmail, setEditEmail] = useState('');
  const [editLogin, setEditLogin] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEditEmail(user.email || '');
    setEditLogin(user.login);
    setTgLinked(!!(user as Record<string, unknown>).telegram_id);
    (async () => {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('site_user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(orderData || []);

      const { data: logins } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setLoginHistory(logins || []);

      const { data: txns } = await supabase
        .from('balance_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setBalanceTxns(txns || []);

      setLoading(false);
    })();
  }, [user]);

  const toggleExpand = async (orderId: string) => {
    if (expanded === orderId) { setExpanded(null); return; }
    setExpanded(orderId);
    if (!items[orderId]) {
      const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId);
      setItems((prev) => ({ ...prev, [orderId]: data || [] }));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileMsg('');
    setProfileError('');

    const params: Record<string, string> = { userId: user.id, currentPassword };
    let hasChanges = false;

    if (editEmail !== (user.email || '')) {
      params.newEmail = editEmail;
      hasChanges = true;
    }
    if (editLogin !== user.login) {
      params.newLogin = editLogin;
      hasChanges = true;
    }
    if (newPassword) {
      if (newPassword !== confirmNewPassword) {
        setProfileError(t('auth.passwordMismatch'));
        setSavingProfile(false);
        return;
      }
      params.newPassword = newPassword;
      hasChanges = true;
    }

    if (!hasChanges) {
      setProfileError(t('auth.noChanges'));
      setSavingProfile(false);
      return;
    }

    const { error: updateError } = await updateProfile(params as Parameters<typeof updateProfile>[0]);
    if (updateError) {
      setProfileError(updateError);
    } else {
      setProfileMsg(t('auth.profileUpdated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
    setSavingProfile(false);
  };

  const handleReconnectTelegram = () => {
    window.open('https://t.me/TUMAR_KG_BOT?start=link', '_blank');
  };

  const handleLogout = () => {
    signOut();
    onNavigate('/');
  };

  const statusLabels: Record<string, string> = {
    new: t('admin.statusNew'),
    processing: t('admin.statusProcessing'),
    shipped: t('admin.statusShipped'),
    delivered: t('admin.statusDelivered'),
    cancelled: t('admin.statusCancelled'),
  };

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    new: { bg: 'var(--accent-light)', text: 'var(--accent)', border: 'color-mix(in srgb, var(--accent) 30%, transparent)' },
    processing: { bg: 'color-mix(in srgb, var(--gold) 15%, transparent)', text: 'var(--gold-dark)', border: 'color-mix(in srgb, var(--gold) 30%, transparent)' },
    shipped: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    delivered: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
    cancelled: { bg: 'var(--bg-sunken)', text: 'var(--text-muted)', border: 'var(--border-default)' },
  };

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: t('account.profile'), icon: User },
    { id: 'account', label: t('account.account'), icon: Settings },
    { id: 'history', label: t('account.history'), icon: History },
    { id: 'security', label: t('account.security'), icon: Shield },
    { id: 'extra', label: t('account.extra'), icon: Wallet },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div className="border-b sticky top-0 z-10 backdrop-blur-md" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 95%, transparent)', borderColor: 'var(--border-default)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
              <User className="w-5 h-5" style={{ color: '#fff' }} />
            </div>
            <div>
              <h1 className="font-serif font-bold text-primary text-lg">{t('account.title')}</h1>
              <p className="text-xs text-muted">{user.name || user.login}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('/')} className="px-3 py-2 text-sm rounded-lg border transition-colors hover:bg-sunken" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }}>
              {t('account.toStore')}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors" style={{ color: 'var(--accent)' }}>
              <LogOut className="w-4 h-4" />
              {t('auth.logout')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${isActive ? 'shadow-sm' : ''}`}
                  style={{
                    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <h2 className="text-lg font-serif font-bold mb-4 flex items-center gap-2 text-primary">
                  <User className="w-5 h-5 text-gold" />
                  {t('account.profileInfo')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow label={t('auth.name')} value={user.name || '-'} />
                  <InfoRow label={t('auth.login')} value={user.login} />
                  <InfoRow label={t('auth.email')} value={user.email || '-'} />
                  <InfoRow
                    label="Telegram"
                    value={tgLinked ? t('account.linked') : t('account.notLinked')}
                    badge={tgLinked}
                  />
                  <InfoRow label={t('account.registered')} value={user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'} />
                  <InfoRow label={t('account.userId')} value={user.id.slice(0, 8)} mono />
                </div>
              </div>

              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <h3 className="font-serif font-semibold mb-3 flex items-center gap-2 text-primary">
                  <Send className="w-4 h-4" style={{ color: '#229ED9' }} />
                  {t('account.telegramStatus')}
                </h3>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted">{tgLinked ? t('account.telegramLinked') : t('account.telegramDesc')}</p>
                  {tgLinked ? (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                      <Check className="w-4 h-4" />
                      {t('account.linked')}
                    </span>
                  ) : (
                    <a
                      href="https://t.me/TUMAR_KG_BOT?start=link"
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl text-white transition-all hover:shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #229ED9, #1b8cc4)' }}
                    >
                      <Link2 className="w-4 h-4" />
                      {t('account.linkTelegram')}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <h2 className="text-lg font-serif font-bold mb-4 flex items-center gap-2 text-primary">
                  <Settings className="w-5 h-5 text-gold" />
                  {t('account.editAccount')}
                </h2>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-secondary">{t('auth.email')}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                      <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="input-field pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-secondary">{t('auth.login')}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                      <input type="text" value={editLogin} onChange={(e) => setEditLogin(e.target.value)} className="input-field pl-10" />
                    </div>
                  </div>
                  <div className="ornament-divider !my-4" />
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-secondary">{t('account.currentPassword')} <span className="text-error">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                      <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field pl-10" placeholder="••••••••" />
                    </div>
                    <p className="mt-1 text-xs text-muted">{t('account.currentPasswordHint')}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-secondary">{t('account.newPassword')}</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field pl-10" placeholder="••••••••" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-secondary">{t('auth.confirmPassword')}</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                        <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="input-field pl-10" placeholder="••••••••" />
                      </div>
                    </div>
                  </div>

                  {profileError && (
                    <div className="flex items-center gap-2 p-3 text-sm rounded-lg border" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {profileError}
                    </div>
                  )}
                  {profileMsg && (
                    <div className="flex items-center gap-2 p-3 text-sm rounded-lg border" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
                      <Check className="w-4 h-4 flex-shrink-0" />
                      {profileMsg}
                    </div>
                  )}

                  <button type="submit" disabled={savingProfile} className="px-6 py-3 font-semibold rounded-xl transition-all hover:shadow-lg disabled:opacity-50" style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}>
                    {savingProfile ? '...' : t('admin.save')}
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <h3 className="font-serif font-semibold mb-3 flex items-center gap-2 text-primary">
                  <Send className="w-4 h-4" style={{ color: '#229ED9' }} />
                  {t('account.reconnectTelegram')}
                </h3>
                <button onClick={handleReconnectTelegram} className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl text-white transition-all hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #229ED9, #1b8cc4)' }}>
                  <Link2 className="w-4 h-4" />
                  {t('account.relinkTelegram')}
                </button>
              </div>

              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 font-medium rounded-xl border transition-colors hover:bg-sunken" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
                <LogOut className="w-4 h-4" />
                {t('auth.logout')}
              </button>
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <h2 className="text-lg font-serif font-bold mb-4 flex items-center gap-2 text-primary">
                  <Package className="w-5 h-5 text-gold" />
                  {t('account.orderHistory')}
                </h2>
                {loading ? (
                  <div className="p-8 text-center text-muted">...</div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center">
                    <Package className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-faint)' }} />
                    <p className="text-muted">{t('auth.emptyOrders')}</p>
                    <button onClick={() => onNavigate('/catalog')} className="mt-3 text-sm font-medium text-gold hover:opacity-80">{t('nav.catalog')}</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.map((order) => {
                      const sc = statusColors[order.status] || statusColors.new;
                      return (
                        <div key={order.id} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-default)' }}>
                          <div className="px-4 py-3 flex items-center justify-between cursor-pointer transition-colors" onClick={() => toggleExpand(order.id)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium text-primary text-sm">#{order.id.slice(0, 8)}</p>
                                <p className="text-xs text-muted">{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border" style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>{statusLabels[order.status] || order.status}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-primary text-sm">{formatPrice(order.total)}</span>
                              {expanded === order.id ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                            </div>
                          </div>
                          {expanded === order.id && (
                            <div className="border-t px-4 py-3" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-sunken)' }}>
                              <div className="space-y-1.5">
                                {(items[order.id] || []).map((item) => (
                                  <div key={item.id} className="flex items-center justify-between text-sm">
                                    <span className="text-secondary">{item.product_name}</span>
                                    <span className="text-muted">{item.quantity} × {formatPrice(item.product_price)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 pt-2 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
                                <span className="font-serif font-semibold text-primary text-sm">{t('auth.orderTotal')}</span>
                                <span className="font-bold text-primary text-sm">{formatPrice(order.total)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <h3 className="font-serif font-semibold mb-4 flex items-center gap-2 text-primary">
                  <ShoppingCart className="w-5 h-5 text-gold" />
                  {t('account.purchaseHistory')}
                </h3>
                {orders.length === 0 ? (
                  <p className="text-sm text-muted">{t('account.noPurchases')}</p>
                ) : (
                  <div className="space-y-1.5">
                    {orders.flatMap((o) => (items[o.id] || []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0" style={{ borderColor: 'var(--border-default)' }}>
                        <span className="text-secondary">{item.product_name}</span>
                        <span className="text-muted">{item.quantity} шт.</span>
                      </div>
                    )))}
                    {orders.every((o) => !items[o.id] || items[o.id].length === 0) && (
                      <p className="text-sm text-muted">{t('account.noPurchases')}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <h3 className="font-serif font-semibold mb-4 flex items-center gap-2 text-primary">
                  <Wallet className="w-5 h-5 text-gold" />
                  {t('account.balanceHistory')}
                </h3>
                {balanceTxns.length === 0 ? (
                  <p className="text-sm text-muted">{t('account.noBalanceHistory')}</p>
                ) : (
                  <div className="space-y-1.5">
                    {balanceTxns.map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0" style={{ borderColor: 'var(--border-default)' }}>
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`w-4 h-4 ${txn.amount > 0 ? 'text-green-600' : 'text-error'}`} />
                          <span className="text-secondary">{txn.description || (txn.type === 'topup' ? t('account.topup') : t('account.purchase'))}</span>
                        </div>
                        <span className={txn.amount > 0 ? 'text-green-600 font-medium' : 'text-error font-medium'}>
                          {txn.amount > 0 ? '+' : ''}{formatPrice(txn.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <h3 className="font-serif font-semibold mb-4 flex items-center gap-2 text-primary">
                  <LogIn className="w-5 h-5 text-gold" />
                  {t('account.loginHistory')}
                </h3>
                {loginHistory.length === 0 ? (
                  <p className="text-sm text-muted">{t('account.noLoginHistory')}</p>
                ) : (
                  <div className="space-y-1.5">
                    {loginHistory.map((rec) => (
                      <div key={rec.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0" style={{ borderColor: 'var(--border-default)' }}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-faint" />
                          <span className="text-secondary">{new Date(rec.created_at).toLocaleString()}</span>
                        </div>
                        <span className="text-muted text-xs">{rec.ip_address || '—'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <h2 className="text-lg font-serif font-bold mb-4 flex items-center gap-2 text-primary">
                  <Shield className="w-5 h-5 text-gold" />
                  {t('account.securityInfo')}
                </h2>
                <div className="space-y-3">
                  <InfoRow label={t('account.lastLogin')} value={loginHistory[0] ? new Date(loginHistory[0].created_at).toLocaleString() : '-'} icon={Clock} />
                  <InfoRow label={t('account.lastLoginIp')} value={loginHistory[0]?.ip_address || '—'} icon={Smartphone} />
                  <InfoRow label={t('account.totalLogins')} value={String(loginHistory.length)} icon={LogIn} />
                </div>
              </div>

              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <h3 className="font-serif font-semibold mb-3 flex items-center gap-2 text-primary">
                  <Smartphone className="w-5 h-5 text-gold" />
                  {t('account.activeDevices')}
                </h3>
                <p className="text-sm text-muted mb-3">{t('account.activeDevicesDesc')}</p>
                <div className="space-y-2">
                  {loginHistory.slice(0, 5).map((rec) => (
                    <div key={rec.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-sunken)' }}>
                      <Smartphone className="w-4 h-4 text-muted flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-secondary truncate">{rec.user_agent || t('account.unknownDevice')}</p>
                        <p className="text-xs text-muted">{new Date(rec.created_at).toLocaleString()} · {rec.ip_address || '—'}</p>
                      </div>
                    </div>
                  ))}
                  {loginHistory.length === 0 && <p className="text-sm text-muted">{t('account.noLoginHistory')}</p>}
                </div>
              </div>

              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <h3 className="font-serif font-semibold mb-3 text-primary">{t('account.endAllSessions')}</h3>
                <p className="text-sm text-muted mb-3">{t('account.endAllSessionsDesc')}</p>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl border transition-colors" style={{ color: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
                  <LogOut className="w-4 h-4" />
                  {t('account.endAllSessions')}
                </button>
              </div>
            </div>
          )}

          {/* EXTRA TAB */}
          {activeTab === 'extra' && (
            <div className="space-y-4">
              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <h2 className="text-lg font-serif font-bold mb-4 flex items-center gap-2 text-primary">
                  <Wallet className="w-5 h-5 text-gold" />
                  {t('account.balance')}
                </h2>
                <div className="text-center py-4">
                  <p className="text-3xl font-serif font-bold text-primary">{formatPrice(user.balance || 0)}</p>
                  <p className="text-sm text-muted mt-1">{t('account.currentBalance')}</p>
                </div>
              </div>

              {[
                { icon: Bell, label: t('account.notifications'), desc: t('account.notificationsDesc') },
                { icon: Settings, label: t('account.profileSettings'), desc: t('account.profileSettingsDesc') },
                { icon: FileText, label: t('account.support'), desc: t('account.supportDesc') },
                { icon: FileText, label: t('account.terms'), desc: t('account.termsDesc') },
                { icon: FileText, label: t('account.privacy'), desc: t('account.privacyDesc') },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.label} className="w-full flex items-center gap-3 p-4 rounded-2xl border transition-colors text-left" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-sunken)' }}>
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-primary text-sm">{item.label}</p>
                      <p className="text-xs text-muted">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-faint flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function InfoRow({ label, value, badge, mono, icon: Icon }: { label: string; value: string; badge?: boolean; mono?: boolean; icon?: typeof User }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--border-default)' }}>
      <span className="text-sm text-muted flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </span>
      {badge ? (
        <span className="flex items-center gap-1 text-sm font-medium text-green-600">
          <Check className="w-3.5 h-3.5" />
          {value}
        </span>
      ) : (
        <span className={`text-sm font-medium text-primary ${mono ? 'font-mono' : ''}`}>{value}</span>
      )}
    </div>
  );
}
