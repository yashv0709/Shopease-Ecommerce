import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw, Sparkles, ShoppingBag } from 'lucide-react';
import AIAssistantModal from '../components/AIAssistantModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductList = ({ setPage, setSelectedProductId }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All', 'Sports', 'Casual', 'Electronics', 'Accessories', 'Footwear']);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  
  // Filtering & Sorting State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  
  // Pagination State
  const [page, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [loading, setLoading] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Load products when filters change
  useEffect(() => {
    fetchProducts();
  }, [category, sort, page]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/products/categories/all`);
      if (res.data.success) {
        const dbCats = res.data.categories || [];
        const uniqueCats = ['All', ...dbCats.filter(c => c !== 'All')];
        setCategories(uniqueCats);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        sort,
        limit: 8,
      };

      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await axios.get(`${API_URL}/products`, { params });
      if (res.data.success) {
        setProducts(res.data.products);
        setTotalPages(res.data.pages);
        setTotalProducts(res.data.totalProducts);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageNum(1);
    fetchProducts();
  };

  const handlePriceFilterSubmit = (e) => {
    e.preventDefault();
    setPageNum(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPageNum(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      
      {/* Search & Filter Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Explore Products</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Discover premium gear and accessories customized to your life.</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex w-full max-w-md items-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-2.5 pl-10 pr-24 text-sm text-zinc-900 dark:text-zinc-100 shadow-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-all duration-200"
          />
          <button type="submit" className="absolute right-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            Search
          </button>
        </form>
      </div>

      {/* Horizontal Toolbar containing Categories, Price, and Sort By in the same row */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
        
        {/* Left Side: Categories & Price Range side-by-side */}
        <div className="flex flex-wrap items-center gap-y-4 gap-x-6">
          {/* Categories */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Categories:</span>
            <div className="flex flex-wrap items-center gap-2">
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setPageNum(1);
                  }}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 shadow-sm cursor-pointer border ${
                    category === cat
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  {cat}
                </button>
              ))}

              {/* Flipkart-Style "More" Dropdown Popover */}
              {categories.length > 5 && (
                <div className="relative inline-block">
                  <button
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 shadow-sm cursor-pointer border flex items-center gap-1.5 ${
                      categories.slice(5).includes(category)
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                  >
                    <span>{categories.slice(5).includes(category) ? category : 'More'}</span>
                    <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {isMoreOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsMoreOpen(false)} />
                      <div className="absolute left-0 mt-2 w-48 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-lg z-20 animate-scale-up">
                        {categories.slice(5).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setCategory(cat);
                              setPageNum(1);
                              setIsMoreOpen(false);
                            }}
                            className={`w-full text-left rounded-xl px-3 py-2 text-sm font-medium transition-all cursor-pointer block ${
                              category === cat
                                ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block h-6 w-px bg-zinc-200 dark:bg-zinc-800"></div>

          {/* Price Range Form */}
          <form onSubmit={handlePriceFilterSubmit} className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Price:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-20 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all duration-200"
              />
              <span className="text-zinc-400 dark:text-zinc-500 text-sm">—</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-20 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Apply
            </button>
          </form>
        </div>

        {/* Right Side: Sort By & Reset */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Sort:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPageNum(1);
              }}
              className="w-full md:w-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none cursor-pointer transition-all duration-200"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(category !== 'All' || minPrice || maxPrice || search) && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 transition-all cursor-pointer shadow-sm"
              title="Reset all filters"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

      </div>

      {/* Main Catalog View */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm h-[320px]">
                <div className="skeleton h-48 w-full rounded-xl mb-4"></div>
                <div className="skeleton h-4 w-3/4 rounded mb-2"></div>
                <div className="skeleton h-4 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="animate-fade-in">
            {/* Full-width Product Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <div key={product._id} className="hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 rounded-2xl">
                  <ProductCard
                    product={product}
                    setPage={setPage}
                    setSelectedProductId={setSelectedProductId}
                  />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPageNum((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageIndex = i + 1;
                  return (
                    <button
                      key={pageIndex}
                      onClick={() => setPageNum(pageIndex)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                        page === pageIndex
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm'
                      }`}
                    >
                      {pageIndex}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPageNum((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/50 shadow-sm transition-colors duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
              <ShoppingBag className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No products found</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">We couldn't find anything matching your filters. Try adjusting them or clear all to see more products.</p>
            <button
              onClick={clearFilters}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Floating Sparkle Action button for AI assistant */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 px-5 hover:scale-105 active:scale-95 shadow-lg transition-all duration-200 cursor-pointer"
      >
        <Sparkles className="h-5 w-5 text-indigo-400 dark:text-indigo-600 animate-pulse" />
        <span className="text-sm font-medium">Ask Assistant</span>
      </button>

      {/* Interactive Chat drawer */}
      <AIAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        setPage={setPage}
        setSelectedProductId={setSelectedProductId}
      />
    </div>
  );
};

export default ProductList;
