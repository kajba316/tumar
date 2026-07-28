import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Send, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/lib/supabase';
import { getSiteAddress } from '@/i18n/localized';
import type { SiteSettings } from '@/types';

export default function ContactsPage() {
  const { t, lang } = useLanguage();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
      setSettings(data);
    })();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setName('');
    setMessage('');
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div>
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-sunken))' }}>
        <div className="kyrgyz-pattern-rich absolute inset-0" />
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: 'linear-gradient(to right, var(--accent-dark), var(--gold), var(--accent-dark))' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-primary">{t('contacts.title')}</h1>
          <p className="mt-2 text-secondary">{t('contacts.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-xl font-serif font-bold mb-6 text-primary">{t('contacts.info')}</h2>
            <div className="space-y-5">
              {[
                { icon: MapPin, title: t('contacts.address'), value: settings ? getSiteAddress(settings, lang) : 'г. Бишкек, ул. Исанова 42' },
                { icon: Phone, title: t('contacts.phone'), value: settings?.contact_phone || '+996 555 123 456' },
                { icon: Mail, title: t('contacts.email'), value: settings?.contact_email || 'info@kyrgyzsouvenirs.kg' },
                { icon: Clock, title: t('contacts.hours'), value: 'Пн–Сб: 9:00–19:00, Вс: 10:00–16:00' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
                    <item.icon className="w-6 h-6" style={{ color: '#fff' }} />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold mb-1 text-primary">{item.title}</h3>
                    <p className="text-sm text-muted">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://t.me/TUMAR_KG_BOT"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-lg"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #229ED9, #1b8cc4)' }}>
                <Send className="w-6 h-6" style={{ color: '#fff' }} />
              </div>
              <div>
                <h3 className="font-serif font-semibold mb-1 text-primary">Telegram-бот Tumar</h3>
                <p className="text-sm text-muted">Каталог, заказы и доставка — прямо в Telegram</p>
              </div>
            </a>
          </div>

          <div className="rounded-2xl p-6 lg:p-8 border shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <h2 className="text-xl font-serif font-bold mb-5 text-primary">{t('contacts.formTitle')}</h2>
            {sent && (
              <div className="mb-4 p-3 rounded-lg text-sm border flex items-center gap-2" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: '#dcfce7' }}>✓</span>
                {t('contacts.sent')}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-secondary">{t('contacts.name')}</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-secondary">{t('contacts.message')}</label>
                <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="input-field resize-none" />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 font-semibold rounded-xl transition-all hover:shadow-lg"
                style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}
              >
                {t('contacts.send')}
              </button>
            </form>
          </div>

          {(settings?.instagram_url || settings?.facebook_url || settings?.telegram_url || settings?.whatsapp_url) && (
            <div className="mt-6">
              <h3 className="font-serif font-semibold mb-3 text-primary">{t('contacts.social') || 'Мы в соцсетях'}</h3>
              <div className="flex items-center gap-3">
                {settings?.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold transition-colors"><Instagram className="w-6 h-6" /></a>}
                {settings?.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold transition-colors"><Facebook className="w-6 h-6" /></a>}
                {settings?.telegram_url && <a href={settings.telegram_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold transition-colors"><Send className="w-6 h-6" /></a>}
                {settings?.whatsapp_url && <a href={settings.whatsapp_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-gold transition-colors"><MessageCircle className="w-6 h-6" /></a>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
