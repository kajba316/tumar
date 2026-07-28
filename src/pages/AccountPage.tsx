import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/i18n/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatPrice } from '@/lib/format';
import { Package, LogOut, ChevronDown, ChevronUp, Send, Link2, Check } from 'lucide-react';

type AccountPageProps = {
  onNavigate: (path: string) => void;
};

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
};

export default function AccountPage({ onNavigate }: AccountPageProps) {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, OrderItem[]>>({});
  const [tgLinked, setTgLinked] = useState(false);
  const [tgLoading, setTgLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('site_user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">{t('auth.welcome')}</h1>
          <p className="mt-1 text-muted">{user?.login}</p>
        </div>
        <button
          onClick={() => { signOut(); onNavigate('/'); }}
          className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl border transition-colors"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }}
        >
          <LogOut className="w-4 h-4" />
          {t('auth.logout')}
        </button>
      </div>

      <div className="ornament-divider !justify-start !my-6" />

      <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-primary">
        <Package className="w-5 h-5 text-gold" />
        {t('auth.myOrders')}
      </h2>

      {loading ? (
        <div className="p-8 text-center text-muted">...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl p-12 text-center border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <Package className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-faint)' }} />
          <p className="text-muted">{t('auth.emptyOrders')}</p>
          <button onClick={() => onNavigate('/catalog')} className="mt-4 font-medium transition-colors text-gold hover:opacity-80">
            {t('nav.catalog')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const sc = statusColors[order.status] || statusColors.new;
            return (
              <div key={order.id} className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <div
                  className="px-5 py-4 flex items-center justify-between cursor-pointer transition-colors"
                  onClick={() => toggleExpand(order.id)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-primary">{t('auth.orderNumber')} #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-primary">{formatPrice(order.total)}</span>
                    {expanded === order.id ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
                  </div>
                </div>

                {expanded === order.id && (
                  <div className="border-t px-5 py-4" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-sunken)' }}>
                    <div className="space-y-2">
                      {(items[order.id] || []).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-secondary">{item.product_name}</span>
                          <span className="text-muted">{item.quantity} × {formatPrice(item.product_price)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
                      <span className="font-serif font-semibold text-primary">{t('auth.orderTotal')}</span>
                      <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="ornament-divider !justify-start !my-6" />

      <div
        className="rounded-2xl border p-6 flex items-center gap-4"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #229ED9, #1b8cc4)' }}
        >
          <Send className="w-6 h-6" style={{ color: '#fff' }} />
        </div>
        <div className="flex-1">
          <h3 className="font-serif font-semibold text-primary mb-1">Telegram-бот Tumar</h3>
          <p className="text-sm text-muted">
            {tgLinked ? 'Ваш Telegram-аккаунт привязан.' : 'Привяжите Telegram, чтобы заказывать через бота.'}
          </p>
        </div>
        {tgLinked ? (
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <Check className="w-5 h-5" />
          </div>
        ) : (
          <a
            href="https://t.me/tumar_shop_bot?start=link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setTgLoading(true)}
            className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl text-white transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #229ED9, #1b8cc4)' }}
          >
            <Link2 className="w-4 h-4" />
            Привязать
          </a>
        )}
      </div>
    </div>
  );
}
