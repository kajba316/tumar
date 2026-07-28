import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import { useLanguage } from '@/i18n/LanguageContext';
import { ChevronDown, ChevronUp, Eye, CreditCard, CheckCircle2 } from 'lucide-react';

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  total: number;
  status: string;
  payment_status: string;
  card_last4: string | null;
  card_expiry: string | null;
  notes: string | null;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
};

export default function AdminOrders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, OrderItem[]>>({});
  const [filter, setFilter] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const toggleExpand = async (orderId: string) => {
    if (expanded === orderId) { setExpanded(null); return; }
    setExpanded(orderId);
    if (!items[orderId]) {
      const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId);
      setItems((prev) => ({ ...prev, [orderId]: data || [] }));
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    load();
  };

  const markPaid = async (orderId: string) => {
    await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', orderId);
    load();
  };

  const statusLabels: Record<string, string> = {
    new: t('admin.statusNew'),
    processing: t('admin.statusProcessing'),
    shipped: t('admin.statusShipped'),
    delivered: t('admin.statusDelivered'),
    cancelled: t('admin.statusCancelled'),
  };

  const statusStyles: Record<string, { backgroundColor: string; color: string }> = {
    new: { backgroundColor: 'var(--accent-light)', color: 'var(--accent)' },
    processing: { backgroundColor: 'var(--bg-sunken)', color: 'var(--text-secondary)' },
    shipped: { backgroundColor: 'var(--bg-sunken)', color: 'var(--text-secondary)' },
    delivered: { backgroundColor: 'var(--accent-light)', color: 'var(--accent)' },
    cancelled: { backgroundColor: 'var(--bg-sunken)', color: 'var(--text-muted)' },
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold mb-6" style={{ color: 'var(--text-primary)' }}>{t('admin.ordersTitle')}</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['all', 'new', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => {
          const active = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border"
              style={
                active
                  ? { backgroundColor: 'var(--text-primary)', color: 'var(--bg-card)', borderColor: 'var(--text-primary)' }
                  : {
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-strong)',
                      color: 'var(--text-secondary)',
                    }
              }
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-sunken)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-card)';
              }}
            >
              {s === 'all' ? t('admin.allOrders') : statusLabels[s]}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>{t('admin.noOrders')}</div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border overflow-hidden shadow-sm"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div
                className="px-5 py-4 flex items-center justify-between cursor-pointer transition-colors"
                style={{ backgroundColor: 'var(--bg-card)' }}
                onClick={() => toggleExpand(order.id)}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card)'; }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{order.customer_name}</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{order.customer_phone}</p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={statusStyles[order.status]}
                  >
                    {statusLabels[order.status]}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={order.payment_status === 'paid'
                      ? { backgroundColor: 'rgba(34,197,94,0.15)', color: '#16a34a' }
                      : { backgroundColor: 'var(--bg-sunken)', color: 'var(--text-muted)' }}
                  >
                    {order.payment_status === 'paid' ? t('admin.paymentPaid') : t('admin.paymentUnpaid')}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatPrice(order.total)}</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleDateString('ru-RU')}</p>
                  </div>
                  {expanded === order.id ? (
                    <ChevronUp className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t px-5 py-4" style={{ backgroundColor: 'var(--bg-sunken)', borderColor: 'var(--bg-sunken)' }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('contacts.email')}</p>
                      <p style={{ color: 'var(--text-primary)' }}>{order.customer_email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('checkout.address')}</p>
                      <p style={{ color: 'var(--text-primary)' }}>{order.customer_address || '—'}</p>
                    </div>
                    {order.notes && (
                      <div className="md:col-span-2">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('checkout.notes')}</p>
                        <p style={{ color: 'var(--text-primary)' }}>{order.notes}</p>
                      </div>
                    )}
                  </div>

                  <div
                    className="rounded-xl border overflow-hidden mb-4"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                  >
                    <div
                      className="px-4 py-2.5 border-b flex items-center gap-2"
                      style={{ backgroundColor: 'var(--bg-sunken)', borderColor: 'var(--border-default)' }}
                    >
                      <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('admin.orderItems')}</span>
                    </div>
                    {(items[order.id] || []).map((item) => (
                      <div
                        key={item.id}
                        className="px-4 py-3 flex items-center justify-between border-b last:border-0"
                        style={{ borderColor: 'var(--bg-sunken)' }}
                      >
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.product_name}</p>
                          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.quantity} × {formatPrice(item.product_price)}</p>
                        </div>
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{formatPrice(item.product_price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="rounded-xl border overflow-hidden mb-4"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                  >
                    <div
                      className="px-4 py-2.5 border-b flex items-center gap-2"
                      style={{ backgroundColor: 'var(--bg-sunken)', borderColor: 'var(--border-default)' }}
                    >
                      <CreditCard className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('admin.payment')}</span>
                      <span className="ml-auto text-sm" style={{ color: order.payment_status === 'paid' ? '#16a34a' : 'var(--text-muted)' }}>
                        {order.payment_status === 'paid' ? t('admin.paymentPaid') : t('admin.paymentUnpaid')}
                      </span>
                    </div>
                    {order.card_last4 && (
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>•••• {order.card_last4}</p>
                          {order.card_expiry && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.card_expiry}</p>}
                        </div>
                        {order.payment_status !== 'paid' && (
                          <button
                            onClick={() => markPaid(order.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                            style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#16a34a' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.25)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.15)'; }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {t('admin.markPaid')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{t('admin.changeStatus')}</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(statusLabels).map(([value, label]) => {
                        const active = order.status === value;
                        return (
                          <button
                            key={value}
                            onClick={() => updateStatus(order.id, value)}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border"
                            style={
                              active
                                ? { ...statusStyles[value], borderColor: 'transparent' }
                                : {
                                    backgroundColor: 'var(--bg-card)',
                                    borderColor: 'var(--border-strong)',
                                    color: 'var(--text-secondary)',
                                  }
                            }
                            onMouseEnter={(e) => {
                              if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-sunken)';
                            }}
                            onMouseLeave={(e) => {
                              if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
