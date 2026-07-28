import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { getCategoryName } from '@/i18n/localized';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal, ShoppingBag } from 'lucide-react';

type CatalogPageProps = {
  onNavigate: (path: string) => void;
  onAddToCart: (product: Product) => void;
  initialCategory?: string;
};

export default function CatalogPage({ onNavigate, onAddToCart, initialCategory }: CatalogPageProps) {
  const { lang, t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string>(initialCategory || 'all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      const [{ data: catData, error: catError }, { data: prodData, error: prodError }] = await Promise.all([
        supabase.from('categories').select('*').order('display_order'),
        supabase.from('products').select('*, category:categories(*)').eq('is_published', true).order('display_order'),
      ]);
      if (catError) console.error('Catalog categories error:', catError);
      if (prodError) {
        console.error('Catalog products error:', prodError);
        setError(prodError.message);
      }
      setCategories(catData || []);
      setProducts(prodData || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (initialCategory) setSelectedCat(initialCategory);
  }, [initialCategory]);

  const ALL_SLUG = 'category-mrymvcnj';
  let filtered = products;
  if (selectedCat !== 'all' && selectedCat !== ALL_SLUG) {
    filtered = products.filter((p) => p.category?.slug === selectedCat);
  }
  if (sortBy === 'price-asc') {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div>
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-sunken))' }}>
        <div className="kyrgyz-pattern-rich absolute inset-0" />
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: 'linear-gradient(to right, var(--accent-dark), var(--gold), var(--accent-dark))' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-primary">{t('catalog.title')}</h1>
          <p className="mt-2 text-secondary">{t('catalog.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="rounded-2xl p-5 border sticky top-24" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow)' }}>
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-4 h-4 text-gold" />
                <h2 className="font-serif font-semibold text-primary">{t('home.categories')}</h2>
              </div>
              <div className="space-y-1">
                {categories.map((cat) => {
                  const count = cat.slug === ALL_SLUG
                    ? products.length
                    : products.filter((p) => p.category?.slug === cat.slug).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCat(cat.slug)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors"
                      style={selectedCat === cat.slug
                        ? { backgroundColor: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 500, border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }
                        : { color: 'var(--text-secondary)' }
                      }
                      onMouseEnter={(e) => { if (selectedCat !== cat.slug) e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'; }}
                      onMouseLeave={(e) => { if (selectedCat !== cat.slug) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      {getCategoryName(cat, lang)} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted">
                {t('catalog.found')} <span className="font-medium text-primary">{filtered.length}</span> {t('catalog.items')}
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
              >
                <option value="default">{t('catalog.sortDefault')}</option>
                <option value="price-asc">{t('catalog.sortPriceAsc')}</option>
                <option value="price-desc">{t('catalog.sortPriceDesc')}</option>
                <option value="name">{t('catalog.sortName')}</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--bg-sunken)' }} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-lg font-serif mb-2" style={{ color: 'var(--accent)' }}>{error}</p>
                <button onClick={() => window.location.reload()} className="font-medium hover:underline text-gold">
                  {lang === 'ru' ? 'Обновить' : lang === 'kg' ? 'Жаңылоо' : 'Reload'}
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: 'var(--bg-sunken)' }}>
                  <ShoppingBag className="w-10 h-10" style={{ color: 'var(--text-faint)' }} />
                </div>
                <p className="text-lg font-serif text-secondary">{t('catalog.empty')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    lang={lang}
                    onNavigate={onNavigate}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
