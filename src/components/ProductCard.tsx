import type { Product } from '@/types';
import type { Language } from '@/types';
import { formatPrice } from '@/lib/format';
import { getProductName, getProductMaterial } from '@/i18n/localized';
import { ShoppingBag, Package } from 'lucide-react';

type ProductCardProps = {
  product: Product;
  lang: Language;
  onNavigate: (path: string) => void;
  onAddToCart: (product: Product) => void;
};

export default function ProductCard({ product, lang, onNavigate, onAddToCart }: ProductCardProps) {
  const name = getProductName(product, lang);
  const material = getProductMaterial(product, lang);
  const outOfStock = !product.in_stock || product.stock_quantity <= 0;
  const stockLabel = outOfStock
    ? (lang === 'en' ? 'Out of stock' : lang === 'kg' ? 'Жок' : 'Нет в наличии')
    : (lang === 'en' ? `In stock: ${product.stock_quantity}` : lang === 'kg' ? `Бар: ${product.stock_quantity}` : `В наличии: ${product.stock_quantity}`);

  return (
    <div className="product-card group flex flex-col relative">
      <button
        onClick={() => onNavigate(`/product/${product.slug}`)}
        className="block w-full aspect-[4/5] overflow-hidden relative"
        style={{ backgroundColor: 'var(--bg-sunken)' }}
      >
        <img
          src={product.image_url || ''}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.old_price && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full shadow-md" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
              -{Math.round((1 - product.price / product.old_price) * 100)}%
            </span>
          )}
        </div>
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(28, 25, 23, 0.5)' }}>
            <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent)' }}>
              {lang === 'en' ? 'Out of stock' : lang === 'kg' ? 'Жок' : 'Нет в наличии'}
            </span>
          </div>
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to top, var(--bg-sunken), transparent 50%)', opacity: 0 }} />
      </button>

      <div className="p-4 flex flex-col flex-1">
        <button
          onClick={() => onNavigate(`/product/${product.slug}`)}
          className="block text-left"
        >
          <h3 className="font-serif font-medium text-sm leading-snug line-clamp-2 transition-colors text-primary group-hover:text-gold">
            {name}
          </h3>
        </button>
        {material && (
          <p className="text-xs mt-1.5 truncate text-muted">{material}</p>
        )}
        <div className="flex items-center gap-2 mt-2.5">
          <span className="font-bold font-serif text-base text-primary">
            {formatPrice(product.price)}
          </span>
          {product.old_price && (
            <span className="text-xs line-through text-faint">
              {formatPrice(product.old_price)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: outOfStock ? 'var(--accent)' : '#16a34a' }}>
          <Package className="w-3.5 h-3.5" />
          {stockLabel}
        </div>
        <button
          onClick={() => onAddToCart(product)}
          disabled={outOfStock}
          className="w-full mt-3 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--bg-sunken)', color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => { if (!outOfStock) { e.currentTarget.style.backgroundColor = 'var(--accent)'; e.currentTarget.style.color = '#fff'; } }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <ShoppingBag className="w-4 h-4" />
          {lang === 'en' ? 'Add to Cart' : lang === 'kg' ? 'Себетке' : 'В корзину'}
        </button>
      </div>
    </div>
  );
}
