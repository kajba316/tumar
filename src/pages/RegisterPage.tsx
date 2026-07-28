import { useState } from 'react';
import { useAuth } from '@/i18n/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Lock, AlertCircle, User } from 'lucide-react';

type RegisterPageProps = {
  onNavigate: (path: string) => void;
};

export default function RegisterPage({ onNavigate }: RegisterPageProps) {
  const { t } = useLanguage();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('auth.loginError'));
      return;
    }
    setLoading(true);
    setError('');
    const { error: signUpError } = await signUp(login, password, name);
    if (signUpError) {
      setError(t('auth.registerError'));
      setLoading(false);
    } else {
      onNavigate('/account');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-sunken))' }}>
      <div className="kyrgyz-pattern-rich absolute inset-0" />
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: 'linear-gradient(to right, var(--accent-dark), var(--gold), var(--accent-dark))' }} />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, var(--gold-light), var(--gold))', boxShadow: '0 0 0 2px color-mix(in srgb, var(--gold) 30%, transparent)' }}>
            <User className="w-8 h-8" style={{ color: 'var(--bg-sunken)' }} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-primary">{t('auth.registerTitle')}</h1>
          <p className="mt-2 text-muted">{t('auth.registerSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-5 border shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">{t('auth.name')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-faint" />
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-11" placeholder="Aibek" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">{t('auth.login')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-faint" />
              <input
                type="text" required value={login} onChange={(e) => setLogin(e.target.value)}
                className="input-field pl-11" placeholder="login"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-faint" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-11" placeholder="••••••••" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">{t('auth.confirmPassword')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-faint" />
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field pl-11" placeholder="••••••••" />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm rounded-lg border" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 font-semibold rounded-xl transition-all hover:shadow-lg disabled:opacity-50"
            style={{ background: 'linear-gradient(to right, var(--gold-light), var(--gold))', color: 'var(--bg-sunken)' }}
          >
            {loading ? '...' : t('auth.registerBtn')}
          </button>

          <button type="button" onClick={() => onNavigate('/login')} className="w-full text-sm transition-colors text-gold hover:opacity-80">
            {t('auth.haveAccount')}
          </button>
        </form>
      </div>
    </div>
  );
}
