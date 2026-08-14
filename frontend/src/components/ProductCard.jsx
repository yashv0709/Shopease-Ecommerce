import React from 'react';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductCard = ({ product, setPage, setSelectedProductId, onWishlistUpdate }) => {
  const { user, setWishlistState } = useAuth();
  const { cart, addToCart, updateCartItem, removeFromCart } = useCart();

  const cartItem = cart?.items?.find(
    (item) => (item.product?._id || item.product) === product._id
  );
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const isWishlisted = user?.wishlist?.some(
    (id) => id === product._id || id._id === product._id
  );

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) {
      setPage('login');
      return;
    }

    try {
      if (isWishlisted) {
        const res = await axios.delete(`${API_URL}/wishlist/${product._id}`);
        if (res.data.success) {
          setWishlistState(res.data.wishlist.map((w) => w._id || w));
          if (onWishlistUpdate) onWishlistUpdate();
        }
      } else {
        const res = await axios.post(`${API_URL}/wishlist/${product._id}`);
        if (res.data.success) {
          setWishlistState(res.data.wishlist.map((w) => w._id || w));
          if (onWishlistUpdate) onWishlistUpdate();
        }
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      setPage('login');
      return;
    }
    await addToCart(product._id, 1);
  };

  const navigateToDetails = () => {
    setSelectedProductId(product._id);
    setPage('product-details');
  };

  return (
    <div
      onClick={navigateToDetails}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-zinc-100 dark:bg-zinc-800">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-sm transition-all hover:scale-110 active:scale-95 cursor-pointer ${
            isWishlisted ? 'text-red-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <Heart className="h-5 w-5" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Category Badge */}
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-zinc-900 dark:text-zinc-100">
          {product.category}
        </span>
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4 space-y-2">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {product.name}
        </h3>
        
        {/* Ratings */}
        <div className="flex items-center gap-1">
          <div className="flex text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-3.5 w-3.5"
                fill={i < Math.round(product.ratings) ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {product.ratings} ({product.numOfReviews})
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-lg font-bold text-zinc-900 dark:text-white">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Add to Cart Action */}
          {product.stock > 0 ? (
            cartQuantity > 0 ? (
              <div className="flex items-center gap-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 p-1 border border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (cartQuantity === 1) {
                      await removeFromCart(product._id);
                    } else {
                      await updateCartItem(product._id, cartQuantity - 1);
                    }
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 font-bold cursor-pointer transition-colors"
                >
                  -
                </button>
                <span className="text-sm font-bold text-zinc-900 dark:text-white min-w-[1.5rem] text-center">
                  {cartQuantity}
                </span>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (cartQuantity >= product.stock) {
                      alert('Cannot add more, stock limit reached!');
                      return;
                    }
                    await addToCart(product._id, 1);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 font-bold cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl bg-indigo-600 text-white font-medium text-sm transition-all hover:bg-indigo-700 shadow-sm cursor-pointer"
                title="Add to Cart"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
            )
          ) : (
            <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-full">
              Out of stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
