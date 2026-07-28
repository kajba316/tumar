import { ShoppingBag, Menu, X, User, LogOut, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/i18n/AuthContext';
import { useTheme } from '@/i18n/ThemeContext';
import { supabase } from '@/lib/supabase';
import { getSiteName } from '@/i18n/localized';
import type { SiteSettings } from '@/types';

type HeaderProps = {
  totalItems: number;
  onCartClick: () => void;
  onNavigate: (path: string) => void;
  currentPath: string;
};

export default function Header({ totalItems, onCartClick, onNavigate, currentPath }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const { t, lang } = useLanguage();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
      setSiteSettings(data);
    })();
  }, []);

  const siteName = siteSettings ? getSiteName(siteSettings, lang) : 'Кыргыз Сувенир';

  const navItems = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.catalog'), path: '/catalog' },
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.contacts'), path: '/contacts' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b shadow-lg"
      style={{ backgroundColor: 'color-mix(in srgb, var(--bg-elevated) 92%, transparent)', borderColor: 'var(--border-default)' }}
    >
      <div className="h-1.5" style={{ background: 'linear-gradient(to right, var(--accent-dark), var(--gold), var(--accent-dark))' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button onClick={() => onNavigate('/')} className="flex items-center gap-3 group">
            {siteSettings?.logo_url ? (
              <img
                src={siteSettings.logo_url}
                alt={siteName}
                className="w-11 h-11 object-contain group-hover:scale-105 transition-transform"
                style={{ background: 'transparent' }}
              />
            ) : (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', boxShadow: '0 0 0 2px color-mix(in srgb, var(--gold) 30%, transparent)' }}
              >
                <span className="font-serif font-bold text-lg" style={{ color: '#fff' }}>{siteName.charAt(0)}</span>
              </div>
            )}
            <div className="text-left">
              <div className="font-serif font-bold text-lg leading-none text-primary">{siteName}</div>
              <div className="text-xs hidden sm:block tracking-wide text-gold">Handmade in Kyrgyzstan</div>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  isActive(item.path) ? 'text-gold' : 'text-secondary hover:text-gold'
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full" style={{ background: 'linear-gradient(to right, var(--accent), var(--gold))' }} />
                )}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full transition-colors text-secondary hover:text-gold"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <LanguageSwitcher />

            <button
              onClick={onCartClick}
              className="relative p-2.5 rounded-full transition-colors text-secondary hover:text-gold"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth buttons — to the right of cart */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => onNavigate('/account')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors text-sm font-medium text-secondary"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <User className="w-4 h-4 text-gold" />
                  <span className="max-w-[100px] truncate">{user.login}</span>
                </button>
                {user.is_admin && (
                  <button
                    onClick={() => onNavigate('/admin/dashboard')}
                    className="px-3 py-2 rounded-full text-sm font-medium transition-colors text-gold"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {t('admin.login')}
                  </button>
                )}
                <button
                  onClick={() => { signOut(); onNavigate('/'); }}
                  className="p-2 rounded-full transition-colors text-muted hover:text-accent"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => onNavigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-secondary hover:text-gold transition-colors"
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => onNavigate('/register')}
                  className="px-4 py-2 text-sm font-medium rounded-lg hover:shadow-lg transition-all"
                  style={{ background: 'linear-gradient(to right, var(--gold-light), var(--gold))', color: 'var(--bg-sunken)' }}
                >
                  {t('nav.register')}
                </button>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-full transition-colors text-secondary"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { onNavigate(item.path); setMobileOpen(false); }}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path) ? 'text-gold' : 'text-secondary'
                }`}
                style={isActive(item.path) ? { backgroundColor: 'var(--bg-sunken)' } : undefined}
                onMouseEnter={(e) => { if (!isActive(item.path)) e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'; }}
                onMouseLeave={(e) => { if (!isActive(item.path)) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {item.label}
              </button>
            ))}
            {user ? (
              <>
                <button
                  onClick={() => { onNavigate('/account'); setMobileOpen(false); }}
                  className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-secondary transition-colors flex items-center gap-2"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <User className="w-4 h-4 text-gold" />
                  {t('nav.account')}
                </button>
                {user.is_admin && (
                  <button
                    onClick={() => { onNavigate('/admin/dashboard'); setMobileOpen(false); }}
                    className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gold transition-colors flex items-center gap-2"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {t('admin.login')}
                  </button>
                )}
                <button
                  onClick={() => { signOut(); onNavigate('/'); setMobileOpen(false); }}
                  className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-secondary transition-colors flex items-center gap-2"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-4 pt-2">
                <button
                  onClick={() => { onNavigate('/login'); setMobileOpen(false); }}
                  className="flex-1 py-2.5 text-sm font-medium text-secondary rounded-lg border"
                  style={{ borderColor: 'var(--border-default)' }}
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => { onNavigate('/register'); setMobileOpen(false); }}
                  className="flex-1 py-2.5 text-sm font-medium rounded-lg"
                  style={{ background: 'linear-gradient(to right, var(--gold-light), var(--gold))', color: 'var(--bg-sunken)' }}
                >
                  {t('nav.register')}
                </button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
