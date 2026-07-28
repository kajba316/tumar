import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import type { CartItem } from '@/types';
import { formatPrice } from '@/lib/format';
import { useLanguage } from '@/i18n/LanguageContext';
import { getProductName } from '@/i18n/localized';

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
  totalPrice: number;
  onCheckout: () => void;
};

export default function CartDrawer({ isOpen, onClose, items, onRemove, onUpdateQty, totalPrice, onCheckout }: CartDrawerProps) {
  const { lang, t } = useLanguage();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 transition-opacity backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-sunken) 70%, transparent)' }} onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 shadow-2xl transition-transform duration-300 flex flex-col border-l ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
      >
        <div className="h-1.5 flex-shrink-0" style={{ background: 'linear-gradient(to right, var(--accent-dark), var(--gold), var(--accent-dark))' }} />

        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card)' }}>
          <h2 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold" />
            {t('cart.title')} ({items.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors text-muted"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--bg-sunken)' }}>
                <ShoppingBag className="w-10 h-10" style={{ color: 'var(--text-faint)' }} />
              </div>
              <p className="text-lg font-serif font-medium text-secondary">{t('cart.empty')}</p>
              <p className="text-sm mt-1 text-muted">{t('cart.emptyDesc')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 rounded-xl p-3 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                  <img
                    src={item.product.image_url || ''}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border"
                    style={{ borderColor: 'var(--border-default)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate text-primary">{getProductName(item.product, lang)}</h3>
                    <p className="font-semibold text-sm mt-1 text-gold">{formatPrice(item.product.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onUpdateQty(item.product.id, item.quantity - 1)}
                        className="p-1 rounded-md transition-colors"
                        style={{ backgroundColor: 'var(--bg-sunken)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-default)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
                      >
                        <Minus className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                      </button>
                      <span className="text-sm font-medium w-8 text-center text-primary">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQty(item.product.id, item.quantity + 1)}
                        className="p-1 rounded-md transition-colors"
                        style={{ backgroundColor: 'var(--bg-sunken)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-default)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
                      >
                        <Plus className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                      </button>
                      <button
                        onClick={() => onRemove(item.product.id)}
                        className="ml-auto p-1 rounded-md transition-colors text-muted hover:text-accent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-5 space-y-3" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center justify-between">
              <span className="font-medium text-secondary">{t('cart.total')}</span>
              <span className="text-xl font-bold font-serif text-primary">{formatPrice(totalPrice)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3.5 font-semibold rounded-xl transition-all"
              style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}
            >
              {t('cart.checkout')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
