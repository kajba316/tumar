import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { getCategoryName } from '@/i18n/localized';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, Truck, Shield, Heart } from 'lucide-react';
import { TundukMotif, ArkharMuyuz, HornMotif } from '@/components/Ornaments';

type HomePageProps = {
  onNavigate: (path: string) => void;
  onAddToCart: (product: Product) => void;
};

export default function HomePage({ onNavigate, onAddToCart }: HomePageProps) {
  const { lang, t } = useLanguage();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: allData, error: allErr }, { data: popData, error: popErr }, { data: catData, error: catErr }] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_published', true)
          .order('display_order')
          .limit(24),
        supabase
          .from('popular_products')
          .select('*')
          .order('order_count', { ascending: false })
          .limit(8),
        supabase.from('categories').select('*').order('display_order'),
      ]);
      if (allErr) console.error('Home products error:', allErr);
      if (popErr) console.error('Popular products error:', popErr);
      if (catErr) console.error('Categories error:', catErr);
      setAllProducts(allData || []);
      const pop = (popData || []) as Product[];
      const cats = catData || [];
      const popWithCats = pop.map((p) => ({
        ...p,
        category: cats.find((c) => c.id === p.category_id),
      }));
      setPopularProducts(popWithCats.filter((p) => p.order_count && p.order_count > 0));
      setCategories(cats);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-sunken))' }}>
        <div className="kyrgyz-pattern-rich absolute inset-0" />
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: 'linear-gradient(to right, var(--accent-dark), var(--gold), var(--accent-dark))' }} />

        {/* Tunduk ornament */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-20 hidden md:block" style={{ color: 'var(--ornament-color)' }}>
          <TundukMotif className="w-28 h-28" />
        </div>

        {/* Corner ornaments */}
        <div className="absolute top-12 left-8 opacity-15 hidden lg:block" style={{ color: 'var(--ornament-color)' }}>
          <ArkharMuyuz className="w-28 h-20" />
        </div>
        <div className="absolute bottom-12 right-8 opacity-15 hidden lg:block" style={{ color: 'var(--ornament-color)' }}>
          <ArkharMuyuz className="w-28 h-20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border"
              style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}
            >
              <Heart className="w-4 h-4" />
              {t('hero.badge')}
            </div>
            <h1 className="text-4xl lg:text-6xl font-serif font-bold leading-tight text-primary">
              {t('hero.title').split(' ').slice(0, -2).join(' ')}{' '}
              <span style={{ background: 'linear-gradient(to right, var(--gold), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {t('hero.title').split(' ').slice(-2).join(' ')}
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed max-w-xl text-secondary">
              {t('hero.subtitle')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('/catalog')}
                className="px-8 py-3.5 font-semibold rounded-xl transition-all flex items-center gap-2 hover:shadow-xl hover:scale-105"
                style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}
              >
                {t('hero.cta')}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('/about')}
                className="px-8 py-3.5 font-semibold rounded-xl border transition-all hover:shadow-lg"
                style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', borderColor: 'color-mix(in srgb, var(--gold) 40%, transparent)' }}
              >
                {t('hero.about')}
              </button>
            </div>
          </div>
        </div>

        {/* Horn ornament at bottom of hero */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-30" style={{ color: 'var(--ornament-color)' }}>
          <HornMotif className="w-48 h-12" />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Heart, title: t('features.handmade'), desc: t('features.handmadeDesc') },
            { icon: Truck, title: t('features.delivery'), desc: t('features.deliveryDesc') },
            { icon: Shield, title: t('features.quality'), desc: t('features.qualityDesc') },
          ].map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-6 rounded-2xl border transition-all hover:shadow-lg"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--accent-light)' }}
              >
                <f.icon className="w-6 h-6" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-primary">{f.title}</h3>
                <p className="text-sm mt-1 text-muted">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories — image cards with hover overlay */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-serif font-bold text-primary">{t('home.categories')}</h2>
          <div className="ornament-divider" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const catName = getCategoryName(cat, lang);
            const catDesc = cat.description_en && lang === 'en' ? cat.description_en
              : cat.description_kg && lang === 'kg' ? cat.description_kg
              : cat.description;
            return (
              <div
                key={cat.id}
                className="category-card group cursor-pointer relative aspect-[3/4] rounded-2xl overflow-hidden border"
                onClick={() => onNavigate(`/catalog?category=${cat.slug}`)}
                style={{ borderColor: 'var(--border-default)' }}
              >
                {/* Background image */}
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={catName}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{ background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-sunken))' }}
                  >
                    <div className="kyrgyz-pattern-rich absolute inset-0" />
                  </div>
                )}

                {/* Dark gradient for readability */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,25,23,0.85) 0%, rgba(28,25,23,0.2) 50%, transparent 100%)' }} />

                {/* Category name — always visible at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <h3 className="font-serif font-semibold text-lg leading-tight" style={{ color: '#fff' }}>
                    {catName}
                  </h3>
                </div>

                {/* Hover overlay — icon, description, button */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundColor: 'rgba(28,25,23,0.75)', backdropFilter: 'blur(2px)' }}
                >
                  {/* Icon — no forced circle, preserve original shape */}
                  {cat.icon_url && (
                    <div className="w-16 h-16 flex items-center justify-center mb-3">
                      <img src={cat.icon_url} alt={catName} className="max-w-full max-h-full object-contain" />
                    </div>
                  )}

                  <h3 className="font-serif font-semibold text-base mb-2" style={{ color: '#fff' }}>
                    {catName}
                  </h3>

                  {catDesc && (
                    <p className="text-xs leading-relaxed mb-3 line-clamp-3" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {catDesc}
                    </p>
                  )}

                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full transition-all group-hover:scale-105"
                    style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}
                  >
                    {t('home.viewAll')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Products — auto-calculated from order stats */}
      {!loading && popularProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-primary">{t('home.popular')}</h2>
              <p className="mt-1 text-muted">{t('home.popularSubtitle')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {popularProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                lang={lang}
                onNavigate={onNavigate}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Products */}
      {!loading && allProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-primary">{t('home.allProducts') || t('nav.catalog')}</h2>
              <p className="mt-1 text-muted">{t('home.allProductsSubtitle') || t('catalog.subtitle')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(showAll ? allProducts.slice(0, 24) : allProducts.slice(0, 8)).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                lang={lang}
                onNavigate={onNavigate}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            {!showAll && allProducts.length > 8 ? (
              <button
                onClick={() => setShowAll(true)}
                className="px-8 py-3.5 font-semibold rounded-xl transition-all hover:shadow-lg border"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
              >
                {t('home.viewAll') || t('catalog.allItems')}
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/catalog')}
                className="px-8 py-3.5 font-semibold rounded-xl transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}
              >
                {t('hero.cta') || t('nav.catalog')} →
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
