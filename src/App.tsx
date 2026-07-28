import { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/hooks/useCart';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { AuthProvider, useAuth } from '@/i18n/AuthContext';
import { ThemeProvider } from '@/i18n/ThemeContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AdminLayout from '@/components/AdminLayout';
import HomePage from '@/pages/HomePage';
import CatalogPage from '@/pages/CatalogPage';
import ProductPage from '@/pages/ProductPage';
import AboutPage from '@/pages/AboutPage';
import ContactsPage from '@/pages/ContactsPage';
import CheckoutPage from '@/pages/CheckoutPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AccountPage from '@/pages/AccountPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminBranches from '@/pages/admin/AdminBranches';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminSiteSettings from '@/pages/admin/AdminSiteSettings';
import AdminPages from '@/pages/admin/AdminPages';
import CmsPage from '@/pages/CmsPage';

function getHashPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/';
}

function AppInner() {
  const [path, setPath] = useState(getHashPath());
  const cart = useCart();
  const { lang } = useLanguage();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const onHashChange = () => setPath(getHashPath());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
    setPath(to);
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  const [basePath, queryString] = path.split('?');
  const params = new URLSearchParams(queryString || '');
  const categorySlug = params.get('category') || undefined;

  // Admin routes — access controlled by unified auth (is_admin flag)
  if (basePath.startsWith('/admin')) {
    if (!user) {
      return <LoginPage onNavigate={navigate} />;
    }
    if (!user.is_admin) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-xl font-serif text-primary mb-4">Access denied</p>
            <button onClick={() => navigate('/')} className="text-gold hover:underline">
              {lang === 'ru' ? 'На главную' : lang === 'kg' ? 'Башкы бетке' : 'Back to store'}
            </button>
          </div>
        </div>
      );
    }

    let adminPage: React.ReactNode;
    switch (basePath) {
      case '/admin/dashboard':
        adminPage = <AdminDashboard onNavigate={navigate} />;
        break;
      case '/admin/products':
        adminPage = <AdminProducts />;
        break;
      case '/admin/orders':
        adminPage = <AdminOrders />;
        break;
      case '/admin/categories':
        adminPage = <AdminCategories />;
        break;
      case '/admin/branches':
        adminPage = <AdminBranches />;
        break;
      case '/admin/settings':
        adminPage = <AdminSettings adminLogin={user.login} onLogout={handleLogout} />;
        break;
      case '/admin/site-settings':
        adminPage = <AdminSiteSettings />;
        break;
      case '/admin/pages':
        adminPage = <AdminPages />;
        break;
      default:
        adminPage = <AdminDashboard onNavigate={navigate} />;
    }

    return (
      <AdminLayout current={basePath} onNavigate={navigate} onLogout={handleLogout}>
        {adminPage}
      </AdminLayout>
    );
  }

  // Storefront routes
  let page: React.ReactNode;
  switch (basePath) {
    case '/':
      page = <HomePage onNavigate={navigate} onAddToCart={cart.addToCart} />;
      break;
    case '/catalog':
      page = <CatalogPage onNavigate={navigate} onAddToCart={cart.addToCart} initialCategory={categorySlug} />;
      break;
    case '/about':
      page = <AboutPage onNavigate={navigate} />;
      break;
    case '/contacts':
      page = <ContactsPage />;
      break;
    case '/checkout':
      page = (
        <CheckoutPage
          items={cart.items}
          totalPrice={cart.totalPrice}
          onNavigate={navigate}
          onClearCart={cart.clearCart}
        />
      );
      break;
    case '/login':
      page = user
        ? (user.is_admin ? <AccountPage onNavigate={navigate} /> : <AccountPage onNavigate={navigate} />)
        : <LoginPage onNavigate={navigate} />;
      break;
    case '/register':
      page = user ? <AccountPage onNavigate={navigate} /> : <RegisterPage onNavigate={navigate} />;
      break;
    case '/account':
      if (user) return <AccountPage onNavigate={navigate} />;
      page = <LoginPage onNavigate={navigate} />;
      break;
    default:
      if (basePath.startsWith('/product/')) {
        const slug = basePath.replace('/product/', '');
        page = <ProductPage slug={slug} onNavigate={navigate} onAddToCart={cart.addToCart} />;
      } else if (basePath.startsWith('/page/')) {
        const slug = basePath.replace('/page/', '');
        page = <CmsPage slug={slug} onNavigate={navigate} />;
      } else {
        page = <HomePage onNavigate={navigate} onAddToCart={cart.addToCart} />;
      }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
      <Header
        totalItems={cart.totalItems}
        onCartClick={() => cart.setIsOpen(true)}
        onNavigate={navigate}
        currentPath={basePath}
      />
      <div className="flex-1">{page}</div>
      <Footer onNavigate={navigate} />
      <CartDrawer
        isOpen={cart.isOpen}
        onClose={() => cart.setIsOpen(false)}
        items={cart.items}
        onRemove={cart.removeFromCart}
        onUpdateQty={cart.updateQuantity}
        totalPrice={cart.totalPrice}
        onCheckout={() => { cart.setIsOpen(false); navigate('/checkout'); }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
