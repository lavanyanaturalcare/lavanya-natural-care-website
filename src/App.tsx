import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { AIAssistantWidget } from './components/AIAssistantWidget';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { AIConsultant } from './pages/AIConsultant';
import { Ingredients } from './pages/Ingredients';
import { Process } from './pages/Process';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { ShippingDelivery } from './pages/ShippingDelivery';
import { RefundPolicy } from './pages/RefundPolicy';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Terms } from './pages/Terms';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { AdminDashboard } from './pages/AdminDashboard';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { ForgotPassword } from './pages/ForgotPassword';
import { Account } from './pages/Account';
import { Wishlist } from './pages/Wishlist';
import { NotFound } from './pages/NotFound';
import { ProductProvider } from './context/ProductContext';

// Scroll to top automatically on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Global floating action controls
const FloatingActions = () => {
  const { pathname } = useLocation();
  const isProductDetailPage = (pathname.startsWith('/products/') && pathname !== '/products') || (pathname.startsWith('/product/') && pathname !== '/product');
  const isAdmin = pathname.startsWith('/admin');
  const isAuthPage = ['/signin', '/signup', '/register', '/login', '/forgot-password'].includes(pathname);
  const isContactPage = pathname === '/contact';

  // Do not show floating overlays on admin or focused auth forms
  if (isAdmin || isAuthPage) return null;

  return (
    <>
      {!isProductDetailPage && <AIAssistantWidget />}
      {!isProductDetailPage && !isContactPage && <WhatsAppButton variant="floating" />}
    </>
  );
};

const AppContent: React.FC = () => {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-sand-50 text-primary-950 font-sans selection:bg-primary-900 selection:text-sand-50 w-full max-w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-grow w-full max-w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/ai-consultant" element={<AIConsultant />} />
          <Route path="/ingredients" element={<Ingredients />} />
          <Route path="/process" element={<Process />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shipping-delivery" element={<ShippingDelivery />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          
          {/* Customer Auth & Account Routes */}
          <Route path="/login" element={<SignIn />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/account" element={<Account />} />
          <Route path="/wishlist" element={<Wishlist />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ProductProvider>
        <ScrollToTop />
        <AppContent />
      </ProductProvider>
    </BrowserRouter>
  );
};

export default App;
