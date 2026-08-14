import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingCart, Heart, LogOut, User as UserIcon, 
  LayoutDashboard, Store, Sun, Moon, Menu, X
} from 'lucide-react';

const Navbar = ({ page, setPage, darkMode, toggleDarkMode }) => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    setPage('login');
  };

  const handleNavClick = (pageName) => {
    setPage(pageName);
    setIsMobileMenuOpen(false);
  };

  const NavItem = ({ pageName, icon: Icon, label, badge, badgeColor }) => {
    const isActive = page === pageName;
    return (
      <button
        onClick={() => handleNavClick(pageName)}
        className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 w-full md:w-auto relative ${
          isActive 
            ? 'bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-semibold' 
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white font-medium'
        }`}
      >
        <div className="relative flex items-center">
          <Icon className="h-5 w-5" />
          {badge > 0 && (
            <span className={`absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <span className="md:hidden lg:inline ml-2">{label}</span>
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div onClick={() => handleNavClick('landing')} className="flex items-center gap-2 cursor-pointer z-50">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xl shadow-sm">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Shop<span className="text-indigo-600 dark:text-indigo-400">Ease</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {user && (
            <>
              <NavItem pageName="products" icon={Store} label="Store" />
              <NavItem pageName="wishlist" icon={Heart} label="Wishlist" badge={user.wishlist?.length} badgeColor="bg-red-500" />
              <NavItem pageName="cart" icon={ShoppingCart} label="Cart" badge={cartItemCount} badgeColor="bg-indigo-600" />
              <NavItem pageName="orders" icon={UserIcon} label="My Orders" />
              {user.role === 'admin' && (
                <NavItem pageName="admin-dashboard" icon={LayoutDashboard} label="Admin" />
              )}
            </>
          )}

          {/* Theme Toggler Button */}
          <button
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white ml-2"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Auth Section */}
          {user ? (
            <div className="flex items-center gap-3 border-l border-zinc-200 dark:border-zinc-800 pl-4 ml-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-none">{user.name}</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 capitalize mt-1">{user.role}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-4 ml-2">
              <button
                onClick={() => handleNavClick('login')}
                className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNavClick('register')}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 z-50"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 animate-slide-up shadow-lg rounded-b-2xl">
          <div className="px-4 py-4 space-y-1">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{user.role}</span>
                  </div>
                </div>
                
                <NavItem pageName="products" icon={Store} label="Store" />
                <NavItem pageName="wishlist" icon={Heart} label="Wishlist" badge={user.wishlist?.length} badgeColor="bg-red-500" />
                <NavItem pageName="cart" icon={ShoppingCart} label="Cart" badge={cartItemCount} badgeColor="bg-indigo-600" />
                <NavItem pageName="orders" icon={UserIcon} label="My Orders" />
                {user.role === 'admin' && (
                  <NavItem pageName="admin-dashboard" icon={LayoutDashboard} label="Admin" />
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 mt-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-2">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full rounded-xl px-4 py-2 text-sm font-medium text-center text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-center text-white shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
