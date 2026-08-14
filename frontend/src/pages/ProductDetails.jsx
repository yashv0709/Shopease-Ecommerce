import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Star, Heart, ArrowLeft, ShoppingCart, MessageSquare, ShieldCheck, Minus, Plus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductDetails = ({ productId, setPage, setSelectedProductId }) => {
  const { user, setWishlistState } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Purchase quantity state
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const isWishlisted = user?.wishlist?.some(
    (id) => id === productId || id._id === productId
  );

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
      fetchReviews();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/products/${productId}`);
      if (res.data.success) {
        setProduct(res.data.product);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/reviews/${productId}`);
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      setPage('login');
      return;
    }

    try {
      if (isWishlisted) {
        const res = await axios.delete(`${API_URL}/wishlist/${productId}`);
        if (res.data.success) {
          setWishlistState(res.data.wishlist.map((w) => w._id || w));
        }
      } else {
        const res = await axios.post(`${API_URL}/wishlist/${productId}`);
        if (res.data.success) {
          setWishlistState(res.data.wishlist.map((w) => w._id || w));
        }
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      setPage('login');
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(productId, quantity);
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setPage('login');
      return;
    }
    
    setFormError(null);
    setFormSuccess(null);
    setReviewLoading(true);

    try {
      const res = await axios.post(`${API_URL}/reviews`, {
        productId,
        rating,
        comment,
      });

      if (res.data.success) {
        setFormSuccess('Thank you! Your review has been added.');
        setComment('');
        setRating(5);
        fetchReviews();
        fetchProductDetails();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review. Try again.';
      setFormError(msg);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Skeleton for Image Frame */}
          <div className="skeleton aspect-square rounded-2xl w-full"></div>
          
          {/* Skeleton for Details Panel */}
          <div className="flex flex-col gap-4">
            <div className="skeleton h-6 w-24 rounded-full"></div>
            <div className="skeleton h-10 w-3/4 rounded-lg"></div>
            <div className="skeleton h-6 w-48 rounded-lg mt-2"></div>
            <div className="skeleton h-32 w-full rounded-xl mt-6"></div>
            <div className="skeleton h-24 w-full rounded-xl mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Product Not Found</h2>
        <button
          onClick={() => setPage('products')}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Back navigation */}
      <button
        onClick={() => setPage('products')}
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Store
      </button>

      {/* Main product showcase */}
      <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Product Image Frame */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm flex items-center justify-center aspect-square transition-colors duration-200">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-h-full max-w-full rounded-xl object-contain hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Product Details Panel */}
        <div className="flex flex-col">
          <span className="inline-flex w-fit rounded-full bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition-colors">
            {product.category}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{product.name}</h1>
          
          {/* Average Rating summary */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5"
                  fill={i < Math.round(product.ratings) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{product.ratings} out of 5</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{product.numOfReviews} reviews</span>
          </div>

          <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <h2 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Description</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{product.description}</p>
          </div>

          {/* Pricing & Stock section */}
          <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Total Price</span>
                <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white block">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Stock check messages */}
              <div>
                {product.stock === 0 ? (
                  <span className="inline-flex rounded-full bg-red-50 dark:bg-red-900/20 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                    Out of Stock
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="inline-flex rounded-full bg-amber-50 dark:bg-amber-900/20 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                    Only {product.stock} Left!
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {product.stock > 0 && (
              <div className="flex flex-wrap items-center gap-4">
                {/* Quantity adjustments */}
                <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-sm transition-colors duration-200">
                  <button
                    onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium text-zinc-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(q + 1, product.stock))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all duration-200 disabled:opacity-75 cursor-pointer"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </button>

                {/* Wishlist button */}
                <button
                  onClick={toggleWishlist}
                  className={`flex h-[52px] w-[52px] items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer shadow-sm ${
                    isWishlisted
                      ? 'border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 text-red-500'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 dark:hover:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className="h-6 w-6" fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-16 border-t border-zinc-200 dark:border-zinc-800 pt-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          
          {/* Left Side: Submit Review Form */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-colors duration-200">
              <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Write a Review
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Reviews are open to all registered users. Completed purchases will be marked with a Verified Purchase badge.</p>

              <form onSubmit={handleReviewSubmit} className="mt-6 space-y-5">
                {formError && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 text-sm text-red-600 dark:text-red-400">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 p-4 text-sm text-emerald-700 dark:text-emerald-400">
                    {formSuccess}
                  </div>
                )}

                {/* Rating selection */}
                <div>
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">Rating</label>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starsVal = i + 1;
                      return (
                        <button
                          key={starsVal}
                          type="button"
                          onClick={() => setRating(starsVal)}
                          className={`transition-all cursor-pointer hover:scale-110 ${
                            rating >= starsVal ? 'text-amber-400' : 'text-zinc-200 dark:text-zinc-700'
                          }`}
                        >
                          <Star className="h-8 w-8" fill={rating >= starsVal ? 'currentColor' : 'none'} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label htmlFor="comment" className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">Comment</label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="4"
                    placeholder="Share your experience with this product..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all duration-200 shadow-sm"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-center text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-75 cursor-pointer"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Side: Product Reviews List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Customer Reviews ({reviews.length})</h2>
            
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">{rev.user.name}</span>
                        
                        {/* Rating stars */}
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4"
                                fill={i < rev.rating ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Verified purchase badge */}
                      {rev.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{rev.comment}</p>
                    
                    <span className="mt-4 text-xs text-zinc-400 dark:text-zinc-500 block">
                      Reviewed on {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center bg-zinc-50/50 dark:bg-zinc-900/50 shadow-sm transition-colors duration-200">
                <MessageSquare className="h-8 w-8 text-zinc-400 mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No reviews yet</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Be the first to share your thoughts on this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
