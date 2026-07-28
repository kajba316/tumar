import { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Tags, MapPin, Settings, LogOut, Store, Menu, X, FileText, Globe } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import image from './image/tumar.png';

type AdminLayoutProps = {
  current: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
};

export default function AdminLayout({ current, onNavigate, onLogout, children }: AdminLayoutProps) {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/admin/dashboard', label: t('admin.dashboard'), icon: LayoutDashboard },
    { path: '/admin/products', label: t('admin.products'), icon: Package },
    { path: '/admin/orders', label: t('admin.orders'), icon: ShoppingCart },
    { path: '/admin/categories', label: t('admin.categories'), icon: Tags },
    { path: '/admin/branches', label: t('admin.branches'), icon: MapPin },
    { path: '/admin/pages', label: 'Страницы', icon: FileText },
    { path: '/admin/site-settings', label: 'Настройки сайта', icon: Globe },
    { path: '/admin/settings', label: t('admin.settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-base)' }}>
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 flex flex-col z-40 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
      >
        <div className="h-1.5" style={{ background: 'linear-gradient(to right, var(--accent-dark), var(--gold), var(--accent-dark))' }} />
        <div className="kyrgyz-pattern-rich absolute inset-0 opacity-20 pointer-events-none" />

        <div className="relative p-6 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <div className="flex items-center gap-3">
       <div className="w-10 h-10">
  <img 
    src={image} 
    alt="" 
    className="w-10 h-10 object-cover"
  />
</div>
            <div>
              <h1 className="text-base font-serif font-bold text-primary">Tumar</h1>
              <p className="text-xs text-gold">{t('admin.login')}</p>
            </div>
          </div>
        </div>

        <nav className="relative flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => { onNavigate(item.path); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              style={current === item.path
                ? { backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }
                : { color: 'var(--text-muted)' }
              }
              onMouseEnter={(e) => { if (current !== item.path) e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'; }}
              onMouseLeave={(e) => { if (current !== item.path) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="relative p-4 border-t space-y-1" style={{ borderColor: 'var(--border-default)' }}>
          <button
            onClick={() => onNavigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-muted"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Store className="w-5 h-5" />
            {t('admin.toStore')}
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{ color: 'var(--accent)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-sunken)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut className="w-5 h-5" />
            {t('admin.logout')}
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-sunken) 60%, transparent)' }} onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 border-b px-4 py-3 flex items-center justify-between z-20" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-serif font-semibold text-primary">{t('admin.login')}</span>
          <div className="w-9" />
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
