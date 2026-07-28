import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Check, AlertCircle } from 'lucide-react';
import ImagePicker from '@/components/ImagePicker';
import type { SiteSettings } from '@/types';

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
      setSettings(data);
      setLoading(false);
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError('');
    setSuccess(false);

    const { error: updateError } = await supabase
      .from('site_settings')
      .update({
        site_name: settings.site_name,
        site_name_en: settings.site_name_en,
        site_name_kg: settings.site_name_kg,
        logo_url: settings.logo_url,
        contact_phone: settings.contact_phone,
        contact_email: settings.contact_email,
        contact_address: settings.contact_address,
        contact_address_en: settings.contact_address_en,
        contact_address_kg: settings.contact_address_kg,
        instagram_url: settings.instagram_url,
        facebook_url: settings.facebook_url,
        telegram_url: settings.telegram_url,
        whatsapp_url: settings.whatsapp_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    if (updateError) {
      setError('Ошибка сохранения');
    } else {
      setSuccess(true);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-muted">...</div>;
  if (!settings) return <div className="p-8 text-center text-muted">Настройки не найдены</div>;

  const inputStyle = {
    borderColor: 'var(--border-strong)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
  };

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold mb-6 text-primary">Настройки сайта</h1>

      {success && (
        <div className="flex items-center gap-2 p-3 text-sm rounded-lg border mb-4" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
          <Check className="w-4 h-4" /> Настройки сохранены
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm rounded-lg border mb-4" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {/* Site Name */}
        <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <h2 className="font-serif font-semibold mb-4 text-primary">Название сайта</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">Русский</label>
              <input value={settings.site_name || ''} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">English</label>
              <input value={settings.site_name_en || ''} onChange={(e) => setSettings({ ...settings, site_name_en: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">Кыргызча</label>
              <input value={settings.site_name_kg || ''} onChange={(e) => setSettings({ ...settings, site_name_kg: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <h2 className="font-serif font-semibold mb-4 text-primary">Логотип</h2>
          <ImagePicker value={settings.logo_url || ''} onChange={(url) => setSettings({ ...settings, logo_url: url })} category="logo" />
        </div>

        {/* Contacts */}
        <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <h2 className="font-serif font-semibold mb-4 text-primary">Контактная информация</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-secondary">Телефон</label>
                <input value={settings.contact_phone || ''} onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-secondary">E-mail</label>
                <input value={settings.contact_email || ''} onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">Адрес (RU)</label>
              <input value={settings.contact_address || ''} onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">Адрес (EN)</label>
              <input value={settings.contact_address_en || ''} onChange={(e) => setSettings({ ...settings, contact_address_en: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">Адрес (KG)</label>
              <input value={settings.contact_address_kg || ''} onChange={(e) => setSettings({ ...settings, contact_address_kg: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <h2 className="font-serif font-semibold mb-4 text-primary">Социальные сети</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">Instagram</label>
              <input value={settings.instagram_url || ''} onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">Facebook</label>
              <input value={settings.facebook_url || ''} onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">Telegram</label>
              <input value={settings.telegram_url || ''} onChange={(e) => setSettings({ ...settings, telegram_url: e.target.value })}
                placeholder="https://t.me/..."
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-secondary">WhatsApp</label>
              <input value={settings.whatsapp_url || ''} onChange={(e) => setSettings({ ...settings, whatsapp_url: e.target.value })}
                placeholder="https://wa.me/..."
                className="w-full px-4 py-2.5 rounded-xl border" style={inputStyle} />
            </div>
          </div>
        </div>

        <button
          type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-3.5 font-semibold rounded-xl transition-all hover:shadow-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}
        >
          <Save className="w-5 h-5" />
          {saving ? '...' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
}
