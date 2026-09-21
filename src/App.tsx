import React, { useState, useEffect, useCallback } from 'react';
import { Category, Product, SiteSettings, Order, CartItem, ProductVariant } from './types';
import { Store } from './lib/store';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { SearchModal } from './components/common/SearchModal';
import { GoogleAuthModal } from './components/auth/GoogleAuthModal';
import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { InfoPage } from './pages/InfoPages';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLoginPage } from './pages/AdminLoginPage';

export default function App() {
  // Global Data State
  const [products, setProducts] = useState<Product[]>(() => Store.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => Store.getCategories());
  const [settings, setSettings] = useState<SiteSettings>(() => Store.getSettings());

  // Navigation / Routing State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Active Selected Product & Order Success states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [directBuyItem, setDirectBuyItem] = useState<CartItem | null>(null);

  // Search Modal & Admin auth states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('velora_admin_session') === 'authenticated';
  });

  // Reload data from Store helper
  const reloadData = useCallback(() => {
    setProducts(Store.getProducts());
    setCategories(Store.getCategories());
    setSettings(Store.getSettings());
  }, []);

  // Sync with browser history & URL
  const navigate = useCallback((path: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (path !== window.location.pathname) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle direct URLs (e.g. /product/:slug, /category/:slug)
  useEffect(() => {
    if (currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '');
      const found = products.find((p) => p.slug === slug || p.item_code.toLowerCase() === slug.toLowerCase());
      if (found) {
        setSelectedProduct(found);
      }
    }
  }, [currentPath, products]);

  // Open a product detail view
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    navigate(`/product/${product.slug}`);
  };

  // Instant Buy / WhatsApp express checkout
  const handleInstantBuy = (
    product: Product,
    selectedOptions: Record<string, string>,
    variant: ProductVariant | null,
    qty: number
  ) => {
    const unitPrice =
      variant?.price_override_lkr !== null && variant?.price_override_lkr !== undefined
        ? variant.price_override_lkr
        : (product.offer_price_lkr ?? product.normal_price_lkr);

    const directItem: CartItem = {
      cart_item_id: `direct-${product.id}-${Date.now()}`,
      product_id: product.id,
      product,
      variant_id: variant?.id || null,
      variant,
      selected_options: selectedOptions,
      qty,
      unit_price_lkr: unitPrice,
      line_total_lkr: Math.round(unitPrice * qty),
    };

    setDirectBuyItem(directItem);
    navigate('/checkout');
  };

  // Search submission
  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    navigate('/search');
  };

  // Admin Logout
  const handleAdminLogout = () => {
    sessionStorage.removeItem('velora_admin_session');
    setIsAdminAuthenticated(false);
    navigate('/');
  };

  // Render Admin View if path is /admin
  if (currentPath === '/admin') {
    return (
      <ToastProvider>
        <AuthProvider>
          {isAdminAuthenticated ? (
            <AdminDashboard
              products={products}
              categories={categories}
              settings={settings}
              onRefreshData={reloadData}
              onLogout={handleAdminLogout}
              onNavigateHome={() => navigate('/')}
            />
          ) : (
            <AdminLoginPage
              onLoginSuccess={() => {
                setIsAdminAuthenticated(true);
                reloadData();
              }}
              onNavigateHome={() => navigate('/')}
            />
          )}
        </AuthProvider>
      </ToastProvider>
    );
  }

  // Determine which storefront view to render
  const renderStorefrontContent = () => {
    // 1. Order Success Page
    if (currentPath === '/order-success' && lastPlacedOrder) {
      return (
        <OrderSuccessPage
          order={lastPlacedOrder}
          settings={settings}
          onNavigateHome={() => navigate('/')}
        />
      );
    }

    // 2. Checkout Page
    if (currentPath === '/checkout') {
      return (
        <CheckoutPage
          settings={settings}
          onBack={() => {
            setDirectBuyItem(null);
            navigate('/');
          }}
          onOrderSuccess={(order) => {
            setLastPlacedOrder(order);
            setDirectBuyItem(null);
            navigate('/order-success');
          }}
          directBuyItem={directBuyItem}
        />
      );
    }

    // 3. Product Detail Page
    if (currentPath.startsWith('/product/') && selectedProduct) {
      return (
        <ProductDetailPage
          product={selectedProduct}
          allProducts={products}
          settings={settings}
          onNavigate={navigate}
          onSelectProduct={handleSelectProduct}
          onInstantBuy={handleInstantBuy}
        />
      );
    }

    // 4. Category / Collection Page
    if (currentPath.startsWith('/category/')) {
      const categorySlug = currentPath.replace('/category/', '');
      return (
        <CollectionPage
          categorySlug={categorySlug}
          products={products}
          categories={categories}
          onNavigate={navigate}
          onSelectProduct={handleSelectProduct}
        />
      );
    }

    // 5. Search Results Page
    if (currentPath === '/search') {
      return (
        <CollectionPage
          searchQuery={searchQuery}
          products={products}
          categories={categories}
          onNavigate={navigate}
          onSelectProduct={handleSelectProduct}
        />
      );
    }

    // 6. Informational Pages
    if (currentPath === '/delivery-info') {
      return <InfoPage type="delivery" settings={settings} onBack={() => navigate('/')} />;
    }
    if (currentPath === '/returns-info') {
      return <InfoPage type="returns" settings={settings} onBack={() => navigate('/')} />;
    }
    if (currentPath === '/privacy') {
      return <InfoPage type="privacy" settings={settings} onBack={() => navigate('/')} />;
    }
    if (currentPath === '/terms') {
      return <InfoPage type="terms" settings={settings} onBack={() => navigate('/')} />;
    }

    // 7. Default Homepage
    return (
      <HomePage
        products={products}
        categories={categories}
        settings={settings}
        onNavigate={navigate}
        onSelectProduct={handleSelectProduct}
      />
    );
  };

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
            {/* Public Header with Mega Menu, Search & Cart triggers */}
            <Header
              categories={categories}
              settings={settings}
              onNavigate={navigate}
              currentPath={currentPath}
              onOpenSearch={() => setIsSearchOpen(true)}
            />

            {/* Main Content Area */}
            <main className="flex-1">{renderStorefrontContent()}</main>

            {/* Public Footer with Google Sign-In at the bottom */}
            <Footer settings={settings} onNavigate={navigate} />

            {/* Slide-over Cart Drawer */}
            <CartDrawer
              onCheckout={() => navigate('/checkout')}
              onContinueShopping={() => navigate('/')}
            />

            {/* Live Search Modal */}
            <SearchModal
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              products={products}
              onSelectProduct={handleSelectProduct}
              onSearchSubmit={handleSearchSubmit}
            />

            {/* Google Account Selector & Sign-in Modal */}
            <GoogleAuthModal />
          </div>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
