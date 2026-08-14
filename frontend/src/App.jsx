import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';

const AppContent = () => {
  const [page, setPage] = useState('landing');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const { toast, undoAddToCart } = useCart();

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const nextVal = !prev;
      localStorage.setItem('theme', nextVal ? 'dark' : 'light');
      return nextVal;
    });
  };

  const renderPage = () => {
    switch (page) {
      case 'landing':
        return <Landing setPage={setPage} />;
      case 'products':
        return (
          <ProtectedRoute setPage={setPage}>
            <ProductList
              setPage={setPage}
              setSelectedProductId={setSelectedProductId}
            />
          </ProtectedRoute>
        );
      case 'product-details':
        return (
          <ProtectedRoute setPage={setPage}>
            <ProductDetails
              productId={selectedProductId}
              setPage={setPage}
              setSelectedProductId={setSelectedProductId}
            />
          </ProtectedRoute>
        );
      case 'cart':
        return (
          <ProtectedRoute setPage={setPage}>
            <Cart setPage={setPage} />
          </ProtectedRoute>
        );
      case 'wishlist':
        return (
          <ProtectedRoute setPage={setPage}>
            <Wishlist setPage={setPage} setSelectedProductId={setSelectedProductId} />
          </ProtectedRoute>
        );
      case 'orders':
        return (
          <ProtectedRoute setPage={setPage}>
            <Orders setPage={setPage} />
          </ProtectedRoute>
        );
      case 'admin-dashboard':
        return (
          <ProtectedRoute adminOnly={true} setPage={setPage}>
            <AdminDashboard />
          </ProtectedRoute>
        );
      case 'login':
        return <Login setPage={setPage} />;
      case 'register':
        return <Register setPage={setPage} />;
      default:
        return (
          <ProtectedRoute setPage={setPage}>
            <ProductList
              setPage={setPage}
              setSelectedProductId={setSelectedProductId}
            />
          </ProtectedRoute>
        );
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
        <Navbar page={page} setPage={setPage} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        
        <main className="flex-1">
          {renderPage()}
        </main>

        {/* Global Toast Notification */}
        {toast?.visible && (
          <div className="fixed bottom-5 right-5 z-[100] max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-lg animate-slide-in flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">Added to Cart</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 leading-normal truncate">{toast.message}</p>
            </div>
            {toast.productId && (
              <button
                onClick={() => undoAddToCart(toast.productId, toast.quantity)}
                className="flex-shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
              >
                Undo
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-8 mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              © {new Date().getFullYear()} ShopEase. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
