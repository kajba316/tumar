import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { getProductName, getProductDesc, getProductMaterial, getCategoryName } from '@/i18n/localized';
import { formatPrice } from '@/lib/format';
import { ChevronLeft, ShoppingBag, Check, Truck, Shield } from 'lucide-react';

type ProductPageProps = {
  slug: string;
  onNavigate: (path: string) => void;
  onAddToCart: (product: Product, qty: number) => void;
};

export default function ProductPage({ slug, onNavigate, onAddToCart }: ProductPageProps) {
  const { lang, t } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const maxQty = product?.stock_quantity || 0;
  const outOfStock = !product?.in_stock || maxQty <= 0;

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (error) console.error('Product page error:', error);
      setProduct(data);
      setActiveImg(0);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="animate-pulse">
          <div className="h-6 w-32 rounded mb-6" style={{ backgroundColor: 'var(--bg-sunken)' }} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square rounded-2xl" style={{ backgroundColor: 'var(--bg-sunken)' }} />
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded" style={{ backgroundColor: 'var(--bg-sunken)' }} />
              <div className="h-6 w-1/4 rounded" style={{ backgroundColor: 'var(--bg-sunken)' }} />
              <div className="h-32 rounded" style={{ backgroundColor: 'var(--bg-sunken)' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-xl font-serif text-secondary">{t('product.notFound')}</p>
        <button onClick={() => onNavigate('/catalog')} className="mt-4 font-medium hover:underline text-gold">
          {t('product.backToCatalog')}
        </button>
      </div>
    );
  }

  const name = getProductName(product, lang);
  const description = getProductDesc(product, lang);
  const material = getProductMaterial(product, lang);

  const handleAddToCart = () => {
    onAddToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => onNavigate('/catalog')}
        className="flex items-center gap-1 transition-colors mb-6 text-sm text-muted hover:text-gold"
      >
        <ChevronLeft className="w-4 h-4" />
        {t('product.backToCatalog')}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative">
          {(() => {
            const allImages = [product.image_url, ...(product.images || [])].filter(Boolean) as string[];
            const gallery = allImages.length > 0 ? allImages : [''];
            const currentImg = gallery[activeImg];
            return (
              <>
                <div className="aspect-square rounded-2xl overflow-hidden border shadow-md" style={{ backgroundColor: 'var(--bg-sunken)', borderColor: 'var(--border-default)' }}>
                  <img src={currentImg} alt={name} className="w-full h-full object-cover transition-opacity duration-300" />
                </div>
                {gallery.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {gallery.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImg(idx)}
                        className="w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all"
                        style={activeImg === idx
                          ? { borderColor: 'var(--gold)' }
                          : { borderColor: 'var(--border-default)', opacity: 0.6 }
                        }
                      >
                        <img src={img} alt={`${name} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
          <div className="absolute -inset-2 rounded-3xl -z-10" style={{ border: '2px solid color-mix(in srgb, var(--gold) 20%, transparent)' }} />
          {product.old_price && (
            <span className="absolute top-4 left-4 text-sm font-bold px-3 py-1.5 rounded-full shadow-md" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
              -{Math.round((1 - product.price / product.old_price) * 100)}%
            </span>
          )}
        </div>

        <div className="flex flex-col">
          {product.category && (
            <button
              onClick={() => onNavigate(`/catalog?category=${product.category!.slug}`)}
              className="text-sm font-medium hover:underline mb-2 inline-flex items-center gap-1 text-gold"
            >
              {getCategoryName(product.category, lang)}
            </button>
          )}
          <h1 className="text-2xl lg:text-3xl font-serif font-bold mb-4 text-primary">{name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold font-serif text-primary">{formatPrice(product.price)}</span>
            {product.old_price && (
              <span className="text-xl line-through text-faint">{formatPrice(product.old_price)}</span>
            )}
          </div>

          <div className="ornament-divider !my-4" />

          {material && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-muted">{t('product.material')}</span>
              <span className="text-sm font-medium px-3 py-1 rounded-full border" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}>
                {material}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 mb-6">
            {outOfStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border" style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-light)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
                {t('product.outOfStock')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border" style={{ color: '#16a34a', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <Check className="w-4 h-4" />
                {t('product.inStock')} ({maxQty} {lang === 'en' ? 'pcs' : lang === 'kg' ? 'дана' : 'шт'})
              </span>
            )}
          </div>

          <p className="leading-relaxed mb-8 text-secondary">{description}</p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center rounded-xl overflow-hidden border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-default)' }}>
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-4 py-3 text-lg transition-colors text-secondary"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >−</button>
              <span className="px-6 py-3 font-medium text-primary">{qty}</span>
              <button
                onClick={() => setQty(Math.min(maxQty, qty + 1))}
                className="px-4 py-3 text-lg transition-colors text-secondary"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}
            >
              {added ? (
                <><Check className="w-5 h-5" /> {t('product.added')}</>
              ) : (
                <><ShoppingBag className="w-5 h-5" /> {t('product.addToCart')}</>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 mt-auto border-t" style={{ borderColor: 'var(--border-default)' }}>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Truck className="w-5 h-5 text-gold" />
              {t('product.delivery')}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Shield className="w-5 h-5 text-gold" />
              {t('product.guarantee')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
