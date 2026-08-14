import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Wishlist = ({ setPage, setSelectedProductId }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/wishlist`);
      if (res.data.success) {
        setWishlist(res.data.wishlist);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="skeleton h-10 w-64 mb-2 rounded-xl"></div>
        <div className="skeleton h-5 w-96 mb-8 rounded-lg"></div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 animate-fade-in">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-4">
              <div className="skeleton h-48 w-full rounded-xl"></div>
              <div className="skeleton h-4 w-1/3 rounded"></div>
              <div className="skeleton h-6 w-3/4 rounded"></div>
              <div className="skeleton h-5 w-1/4 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Your Saved Items</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Keep track of products you love and want to purchase later.</p>

      {wishlist.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {wishlist.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              setPage={setPage}
              setSelectedProductId={setSelectedProductId}
              onWishlistUpdate={fetchWishlist}
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-16 px-4 text-center shadow-sm transition-all duration-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 mb-4">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Your Wishlist is Empty</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">Tap the heart on any product card in the store to save it here.</p>
          <button
            onClick={() => setPage('products')}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Explore Store
          </button>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
