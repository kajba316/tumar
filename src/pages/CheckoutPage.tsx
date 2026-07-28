import { useState, useEffect } from 'react';
import type { CartItem, Branch } from '@/types';
import { formatPrice } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/i18n/AuthContext';
import { getProductName, getBranchName, getBranchAddress } from '@/i18n/localized';
import { Check, ChevronLeft, CreditCard } from 'lucide-react';

type CheckoutPageProps = {
  items: CartItem[];
  totalPrice: number;
  onNavigate: (path: string) => void;
  onClearCart: () => void;
};

export default function CheckoutPage({ items, totalPrice, onNavigate, onClearCart }: CheckoutPageProps) {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [branchId, setBranchId] = useState<string>('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('branches').select('*').eq('is_active', true).order('display_order').then(({ data }) => {
      setBranches(data || []);
    });
    if (user?.login) setEmail(user.login);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: name,
          customer_phone: phone,
          customer_email: email || null,
          customer_address: address || null,
          branch_id: branchId || null,
          total: totalPrice,
          status: 'new',
          notes: notes || null,
          site_user_id: user?.id || null,
          payment_status: 'unpaid',
          card_last4: cardNumber.replace(/\s/g, '').slice(-4) || null,
          card_expiry: cardExpiry || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setSuccess(true);
      onClearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error placing order');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <Check className="w-10 h-10" style={{ color: '#16a34a' }} />
        </div>
        <h1 className="text-2xl font-serif font-bold mb-3 text-primary">{t('checkout.success')}</h1>
        <p className="mb-8 text-muted">{t('checkout.successDesc')}</p>
        <button
          onClick={() => onNavigate('/')}
          className="px-8 py-3.5 font-semibold rounded-xl transition-all hover:shadow-lg"
          style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}
        >
          {t('checkout.back')}
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-xl font-serif mb-4 text-secondary">{t('checkout.empty')}</p>
        <button onClick={() => onNavigate('/catalog')} className="font-medium hover:underline text-gold">
          {t('nav.catalog')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => onNavigate('/catalog')}
        className="flex items-center gap-1 transition-colors mb-6 text-sm text-muted hover:text-gold"
      >
        <ChevronLeft className="w-4 h-4" />
        {t('nav.catalog')}
      </button>

      <h1 className="text-3xl font-serif font-bold mb-2 text-primary">{t('checkout.title')}</h1>
      <div className="ornament-divider !justify-start !my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">{t('checkout.name')} *</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">{t('checkout.phone')} *</label>
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+996 555 123 456" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">{t('checkout.email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="example@mail.com" />
          </div>

          <div className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: 'var(--bg-sunken)', borderColor: 'var(--border-default)' }}>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <label className="text-sm font-semibold text-secondary">{t('checkout.cardInfo')}</label>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('checkout.cardNote')}</p>
            <div>
              <input type="text" value={cardNumber} onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
                setCardNumber(formatted);
              }} className="input-field" placeholder="0000 0000 0000 0000" maxLength={19} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={cardExpiry} onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                const formatted = digits.length >= 3 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
                setCardExpiry(formatted);
              }} className="input-field" placeholder="ММ/ГГ" maxLength={5} />
              <input type="text" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} className="input-field" placeholder="CVV" maxLength={3} />
            </div>
            <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} className="input-field" placeholder={t('checkout.cardName')} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">{t('checkout.branch')}</label>
            <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="input-field">
              <option value="">{t('checkout.noBranch')}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {getBranchName(b, lang)} — {getBranchAddress(b, lang)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">{t('checkout.address')}</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">{t('checkout.notes')}</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input-field resize-none" />
          </div>

          {error && (
            <div className="p-3 text-sm rounded-lg border" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>{error}</div>
          )}

          <button
            type="submit" disabled={submitting}
            className="w-full py-3.5 font-semibold rounded-xl transition-all hover:shadow-lg disabled:opacity-50"
            style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}
          >
            {submitting ? t('checkout.submitting') : t('checkout.submit')}
          </button>
        </form>

        <div className="rounded-2xl p-6 border h-fit shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <h2 className="font-serif font-semibold mb-4 text-primary">{t('checkout.orderSummary')}</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3">
                <img
                  src={item.product.image_url || ''} alt={item.product.name}
                  className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border"
                  style={{ borderColor: 'var(--border-default)' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-primary">{getProductName(item.product, lang)}</p>
                  <p className="text-xs text-muted">{item.quantity} × {formatPrice(item.product.price)}</p>
                </div>
                <span className="text-sm font-semibold text-primary">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
            <span className="font-serif font-semibold text-primary">{t('checkout.total')}</span>
            <span className="text-xl font-bold font-serif text-primary">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
