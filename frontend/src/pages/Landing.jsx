import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ShoppingCart, ShieldCheck, ArrowRight, Star } from 'lucide-react';

const Landing = ({ setPage }) => {
  const { user } = useAuth();

  const handleStartShopping = () => {
    if (user) {
      setPage('products');
    } else {
      setPage('login');
    }
  };

  return (
    <div className="animate-fade-in transition-colors duration-200">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">

          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl max-w-4xl mx-auto">
            Shop Smarter with <span className="text-indigo-600 dark:text-indigo-400">AI-Powered Search</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-500 dark:text-zinc-400">
            Find exactly what you need in seconds. ShopEase combines high-quality athletic gear, electronics, and daily essentials with generative intelligence.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={handleStartShopping}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Explore Store
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
            
            {!user && (
              <button
                onClick={() => setPage('register')}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer"
              >
                Create Free Account
              </button>
            )}
          </div>
        </div>
      </section>



      {/* Features Showcase */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Features You'll Love</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">Everything you expect from a premium shopping experience.</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Feature 1: AI Chat */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-zinc-800">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-bold text-zinc-900 dark:text-white">Smart Search Assistant</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Converse with our intelligent AI drawer. Tell it things like "shoes under 2000" or "compare smartwatches" and watch it query the database dynamically.
                </p>
              </div>
            </div>

            {/* Feature 2: Verified Purchase */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-zinc-800">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-bold text-zinc-900 dark:text-white">Dynamic Review System</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Read ratings and comments left by registered customers. Purchases are verified against order logs to generate authentic verification badges.
                </p>
              </div>
            </div>

            {/* Feature 3: Modern Layout */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-zinc-900 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-zinc-800">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-bold text-zinc-900 dark:text-white">Fluid Single-Row Filters</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  A gorgeous unified top horizontal filter bar allows you to select categories, price thresholds, and sort parameters seamlessly, keeping the product grid spacious.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Preview Grid */}
      <section className="py-20 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Premium Catalog Preview</h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Sneak peek at some of our best-selling gear.</p>
            </div>
            
            <button
              onClick={handleStartShopping}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 cursor-pointer"
            >
              Sign in to browse all items
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Item 1 */}
            <div 
              onClick={handleStartShopping}
              className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="aspect-square bg-zinc-50 dark:bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center p-4">
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" alt="Nike Shoe" className="max-h-full object-contain group-hover:scale-105 transition-transform duration-200" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-1">Nike Air Max Running Shoes</h4>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-zinc-900 dark:text-white">₹3,000</span>
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1 text-xs"><Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> 4.5</span>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div 
              onClick={handleStartShopping}
              className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="aspect-square bg-zinc-50 dark:bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center p-4">
                <img src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400" alt="Watch" className="max-h-full object-contain group-hover:scale-105 transition-transform duration-200" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-1">Smart Workout Watch</h4>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-zinc-900 dark:text-white">₹4,999</span>
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1 text-xs"><Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> 4.2</span>
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div 
              onClick={handleStartShopping}
              className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="aspect-square bg-zinc-50 dark:bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center p-4">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" alt="Headphones" className="max-h-full object-contain group-hover:scale-105 transition-transform duration-200" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-1">Wireless Noise-Canceling Headphones</h4>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-zinc-900 dark:text-white">₹5,999</span>
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1 text-xs"><Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> 4.8</span>
                </div>
              </div>
            </div>

            {/* Item 4 */}
            <div 
              onClick={handleStartShopping}
              className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="aspect-square bg-zinc-50 dark:bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center p-4">
                <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400" alt="White Sneaker" className="max-h-full object-contain group-hover:scale-105 transition-transform duration-200" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-1">Casual White Sneaker</h4>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-zinc-900 dark:text-white">₹1,500</span>
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1 text-xs"><Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> 4.0</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
export { Landing };
