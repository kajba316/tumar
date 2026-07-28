import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/i18n/LanguageContext';
import { getPageTitle, getPageContent } from '@/i18n/localized';
import type { SitePage } from '@/types';

type CmsPageProps = {
  slug: string;
  onNavigate: (path: string) => void;
};

export default function CmsPage({ slug }: CmsPageProps) {
  const { lang } = useLanguage();
  const [page, setPage] = useState<SitePage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('site_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      setPage(data);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center text-muted">...</div>;
  if (!page) return <div className="min-h-[50vh] flex items-center justify-center text-muted">404</div>;

  const title = getPageTitle(page, lang);
  const content = getPageContent(page, lang);

  return (
    <div className="min-h-[50vh]">
      {page.banner_url && (
        <div className="w-full h-64 overflow-hidden">
          <img src={page.banner_url} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-serif font-bold mb-6 text-primary">{title}</h1>
        {page.meta_description && lang === 'ru' && (
          <p className="text-muted mb-6">{page.meta_description}</p>
        )}
        <div className="prose prose-lg max-w-none text-secondary whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}
