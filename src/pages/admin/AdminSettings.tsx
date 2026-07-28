import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Lock, AlertCircle, Check, User } from 'lucide-react';

type AdminSettingsProps = {
  adminLogin: string;
  onLogout: () => void;
};

export default function AdminSettings({ adminLogin: currentLogin, onLogout }: AdminSettingsProps) {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newLogin, setNewLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setError(t('admin.passwordChangeError'));
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/admin-change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          current_login: currentLogin,
          current_password: currentPassword,
          new_login: newLogin || undefined,
          new_password: newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('admin.passwordChangeError'));
        setLoading(false);
        return;
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewLogin('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onLogout();
      }, 2000);
    } catch {
      setError(t('admin.passwordChangeError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold mb-6 text-primary">{t('admin.settingsTitle')}</h1>

      <div className="rounded-2xl border p-6 max-w-lg shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
        <h2 className="font-serif font-semibold mb-2 text-primary">{t('admin.changeLogin')}</h2>
        <p className="text-sm mb-6 text-muted">{t('admin.defaultCredentials')}</p>

        {success && (
          <div className="flex items-center gap-2 p-3 text-sm rounded-lg border mb-4" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
            <Check className="w-4 h-4 flex-shrink-0" />
            {t('admin.loginChanged')}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm rounded-lg border mb-4" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">{t('admin.currentPassword')} *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-faint" />
              <input
                type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field pl-11"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">{t('admin.newLogin')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-faint" />
              <input
                type="text" value={newLogin} onChange={(e) => setNewLogin(e.target.value)}
                className="input-field pl-11"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">{t('admin.newPassword')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-faint" />
              <input
                type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="input-field pl-11"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">{t('admin.confirmNewPassword')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-faint" />
              <input
                type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pl-11"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 font-semibold rounded-xl transition-all hover:shadow-lg disabled:opacity-50"
            style={{ background: 'linear-gradient(to right, var(--accent), var(--accent-dark))', color: '#fff' }}
          >
            {loading ? '...' : t('admin.save')}
          </button>
        </form>
      </div>
    </div>
  );
}
