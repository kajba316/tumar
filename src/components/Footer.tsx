import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Instagram, Facebook, Send, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { HornMotif } from '@/components/Ornaments';
import { supabase } from '@/lib/supabase';
import { getSiteName, getSiteAddress } from '@/i18n/localized';
import type { SiteSettings, SitePage } from '@/types';

type FooterProps = {
  onNavigate: (path: string) => void;
};

export default function Footer({ onNavigate }: FooterProps) {
  const { t, lang } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [pages, setPages] = useState<SitePage[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: settingsData }, { data: pagesData }] = await Promise.all([
        supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('site_pages').select('*').eq('is_published', true).order('display_order'),
      ]);
      setSettings(settingsData);
      setPages(pagesData || []);
    })();
  }, []);

  const siteName = settings ? getSiteName(settings, lang) : 'Tumar';
  const address = settings ? getSiteAddress(settings, lang) : 'г. Бишкек';
  const phone = settings?.contact_phone || '+996 509 340 665';
  const email = settings?.contact_email || 'info@kyrgyzsouvenirs.kg';

  const getPageTitle = (page: SitePage) => {
    if (lang === 'en' && page.title_en) return page.title_en;
    if (lang === 'kg' && page.title_kg) return page.title_kg;
    return page.title;
  };

  return (
    <footer className="mt-20 relative border-t" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
      <div className="h-1.5" style={{ background: 'linear-gradient(to right, var(--accent-dark), var(--gold), var(--accent-dark))' }} />
      <div className="kyrgyz-pattern-rich absolute inset-0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt={siteName} className="w-12 h-12 object-contain" style={{ background: 'transparent' }} />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', boxShadow: '0 0 0 2px color-mix(in srgb, var(--gold) 30%, transparent)' }}
                >
                  <span className="font-serif font-bold text-lg" style={{ color: '#fff' }}>{siteName.charAt(0)}</span>
                </div>
              )}
              <div>
                <div className="font-serif font-bold text-lg text-primary">{siteName}</div>
                <div className="text-xs text-gold tracking-wide">Handmade in Kyrgyzstan</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted">{t('footer.tagline')}</p>
          </div>

          <div>
            <h3 className="font-serif font-semibold mb-4 text-base text-primary">{t('footer.nav')}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => onNavigate('/')} className="text-muted hover:text-gold transition-colors">{t('nav.home')}</button></li>
              <li><button onClick={() => onNavigate('/catalog')} className="text-muted hover:text-gold transition-colors">{t('nav.catalog')}</button></li>
              <li><button onClick={() => onNavigate('/about')} className="text-muted hover:text-gold transition-colors">{t('nav.about')}</button></li>
              <li><button onClick={() => onNavigate('/contacts')} className="text-muted hover:text-gold transition-colors">{t('nav.contacts')}</button></li>
              {pages.map((page) => (
                <li key={page.id}>
                  <button onClick={() => onNavigate(`/page/${page.slug}`)} className="text-muted hover:text-gold transition-colors">
                    {getPageTitle(page)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-semibold mb-4 text-base text-primary">{t('footer.contact')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-gold flex-shrink-0" /><span className="text-muted">{phone}</span></li>
              <li className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-gold flex-shrink-0" /><span className="text-muted">{email}</span></li>
              <li className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-gold flex-shrink-0" /><span className="text-muted">{address}</span></li>
            </ul>
            {(settings?.instagram_url || settings?.facebook_url || settings?.telegram_url || settings?.whatsapp_url) && (
              <div className="flex items-center gap-3 mt-4">
                {settings?.instagram_url && (
                  <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {settings?.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {settings?.telegram_url && (
                  <a href={settings.telegram_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold transition-colors">
                    <Send className="w-5 h-5" />
                  </a>
                )}
                {settings?.whatsapp_url && (
                  <a href={settings.whatsapp_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-serif font-semibold mb-4 text-base text-primary">{t('footer.about')}</h3>
            <p className="text-sm leading-relaxed text-muted">{t('footer.tagline')}</p>
          </div>
        </div>

        <div className="ornament-divider mt-12" />
        <div className="text-center text-sm text-muted">{t('footer.rights')}</div>
      </div>
    </footer>
  );
}
