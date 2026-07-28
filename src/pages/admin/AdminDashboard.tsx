import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import { useLanguage } from '@/i18n/LanguageContext';
import { Package, ShoppingCart, TrendingUp, Clock } from 'lucide-react';

type AdminDashboardProps = {
  onNavigate: (path: string) => void;
};

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredOrder, setHoveredOrder] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, ordersRes, pendingRes, revenueRes] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id, total, status, customer_name, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'new'),
          supabase.from('orders').select('total'),
        ]);

        setStats({
          products: productsRes.count || 0,
          orders: ordersRes.count || 0,
          revenue: (revenueRes.data || []).reduce((sum, o) => sum + Number(o.total), 0),
          pendingOrders: pendingRes.count || 0,
        });
        setRecentOrders(ordersRes.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    { label: t('admin.statProducts'), value: stats.products, icon: Package, color: 'bg-blue-50 text-blue-600', path: '/admin/products' },
    { label: t('admin.statOrders'), value: stats.orders, icon: ShoppingCart, color: 'bg-green-50 text-green-600', path: '/admin/orders' },
    { label: t('admin.statRevenue'), value: formatPrice(stats.revenue), icon: TrendingUp, color: 'bg-amber-50 text-amber-600', path: '/admin/orders' },
    { label: t('admin.statPending'), value: stats.pendingOrders, icon: Clock, color: 'bg-red-50 text-red-600', path: '/admin/orders' },
  ];

  const statusLabels: Record<string, string> = {
    new: t('admin.statusNew'),
    processing: t('admin.statusProcessing'),
    shipped: t('admin.statusShipped'),
    delivered: t('admin.statusDelivered'),
    cancelled: t('admin.statusCancelled'),
  };

  const statusStyles: Record<string, { backgroundColor: string; color: string }> = {
    new: { backgroundColor: 'var(--accent-light)', color: 'var(--accent)' },
    processing: { backgroundColor: 'var(--bg-sunken)', color: 'var(--gold-dark)' },
    shipped: { backgroundColor: 'var(--bg-sunken)', color: 'var(--text-secondary)' },
    delivered: { backgroundColor: 'var(--bg-sunken)', color: 'var(--text-secondary)' },
    cancelled: { backgroundColor: 'var(--bg-sunken)', color: 'var(--text-muted)' },
  };

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold mb-6" style={{ color: 'var(--text-primary)' }}>{t('admin.dashboard')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={() => onNavigate(card.path)}
            className="rounded-2xl p-5 border text-left hover:shadow-md transition-all"
            style={{
              backgroundColor: hoveredCard === i ? 'var(--bg-sunken)' : 'var(--bg-card)',
              borderColor: hoveredCard === i ? 'var(--border-strong)' : 'var(--border-default)',
            }}
            onMouseEnter={() => setHoveredCard(i)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold font-serif" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <h2 className="font-serif font-semibold" style={{ color: 'var(--text-primary)' }}>{t('admin.recentOrders')}</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>...</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>{t('admin.noOrdersYet')}</div>
        ) : (
          <div className="divide-y divide-sand-100">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="px-6 py-4 flex items-center justify-between transition-colors"
                style={{ backgroundColor: hoveredOrder === order.id ? 'var(--bg-sunken)' : 'transparent' }}
                onMouseEnter={() => setHoveredOrder(order.id)}
                onMouseLeave={() => setHoveredOrder(null)}
              >
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{order.customer_name}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleDateString('ru-RU')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={statusStyles[order.status] || { backgroundColor: 'var(--bg-sunken)', color: 'var(--text-muted)' }}
                  >
                    {statusLabels[order.status] || order.status}
                  </span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
