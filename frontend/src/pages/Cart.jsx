import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, Truck, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';

const Cart = ({ setPage }) => {
  const { cart, updateCartItem, removeFromCart, checkout } = useCart();
  // Detailed shipping states
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateState, setStateState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [phone, setPhone] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Simulated Coupon system
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError(null);
    const code = coupon.trim().toUpperCase();
    if (!code) return;

    if (code === 'WELCOME10' || code === 'SAVEMORE') {
      setAppliedCoupon({
        code,
        discountVal: Math.round(cart.totalPrice * 0.1),
      });
      setCoupon('');
    } else {
      setCouponError('Invalid code. Try WELCOME10!');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const handleQtyChange = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    await updateCartItem(productId, newQty);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!streetAddress.trim() || !city.trim() || !stateState.trim() || !pinCode.trim() || !phone.trim()) {
      setCheckoutError('Please fill in all shipping details.');
      return;
    }

    setCheckoutError(null);
    setCheckoutLoading(true);

    try {
      const fullAddress = `${streetAddress.trim()}, ${city.trim()}, ${stateState.trim()} - ${pinCode.trim()} (Phone: ${phone.trim()})`;
      const res = await checkout(fullAddress);
      if (res && res.success) {
        setCheckoutSuccess(true);
        setTimeout(() => {
          setPage('orders');
        }, 2500);
      } else {
        setCheckoutError(res?.message || 'Checkout failed.');
      }
    } catch (err) {
      setCheckoutError('Checkout failed due to server error.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-emerald-500 animate-pulse" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Order Confirmed!</h1>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Your payment was successful and your order has been placed.</p>
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Redirecting to orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Your Shopping Cart</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Review your items and complete checkout.</p>

      {cart?.items?.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          
          {/* Left Panel: Cart Line Items */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {cart.items.map((item) => {
              if (!item.product) return null;
              return (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 shadow-sm transition-all duration-200"
                >
                  {/* Image */}
                  <div className="h-24 w-24 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 p-2 flex items-center justify-center">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col">
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                      {item.product.category}
                    </span>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                      {item.product.name}
                    </h3>
                    <span className="mt-2 text-sm font-bold text-zinc-900 dark:text-white">
                      ₹{item.product.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Quantity Actions & Delete */}
                  <div className="flex items-center gap-4 mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1">
                      <button
                        onClick={() => handleQtyChange(item.product._id, item.quantity, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-300 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-sm font-medium text-zinc-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQtyChange(item.product._id, item.quantity, 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-300 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Panel: Checkout Summary */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">
                Order Summary
              </h2>

              {/* Pricing Math */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-medium">₹{cart.totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                  <span>Estimated GST (18%)</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-medium">₹{Math.round(cart.totalPrice * 0.18).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                  <span>Shipping Cost</span>
                  <div className="flex items-center gap-2">
                    <span className="line-through text-xs">₹99</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">FREE</span>
                  </div>
                </div>
                
                {/* Applied Coupon Badge */}
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                    <div className="flex items-center gap-2">
                      <span className="uppercase tracking-wide">Code: {appliedCoupon.code}</span>
                      <button type="button" onClick={handleRemoveCoupon} className="text-xs underline hover:text-indigo-800 dark:hover:text-indigo-200">Remove</button>
                    </div>
                    <span>-₹{appliedCoupon.discountVal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex justify-between items-end mt-4">
                  <span className="text-base font-bold text-zinc-900 dark:text-white">Total Price</span>
                  <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                    ₹{(cart.totalPrice - (appliedCoupon ? appliedCoupon.discountVal : 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Promo Code Input Block */}
              {!appliedCoupon && (
                <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (WELCOME10)"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none placeholder:text-zinc-400 transition-all"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium px-5 hover:bg-zinc-800 dark:hover:bg-white transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                  {couponError && (
                    <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{couponError}</p>
                  )}
                </div>
              )}

              {/* Checkout Form */}
              <form onSubmit={handleCheckoutSubmit} className="mt-8 space-y-5">
                {checkoutError && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 text-sm font-medium text-red-700 dark:text-red-400">
                    {checkoutError}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-4">
                    <Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Shipping Details</h3>
                  </div>
                  
                  <div>
                    <label className="sr-only">Street Address</label>
                    <input
                      type="text"
                      placeholder="Street Address, Apartment, Suite"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none placeholder:text-zinc-400 transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="sr-only">City</label>
                      <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none placeholder:text-zinc-400 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="sr-only">State</label>
                      <input
                        type="text"
                        placeholder="State"
                        value={stateState}
                        onChange={(e) => setStateState(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none placeholder:text-zinc-400 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="sr-only">PIN Code</label>
                      <input
                        type="text"
                        placeholder="PIN / Postal Code"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none placeholder:text-zinc-400 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="sr-only">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none placeholder:text-zinc-400 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={checkoutLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        Complete Checkout
                      </>
                    )}
                  </button>

                  <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure encrypted transaction
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-20 px-4 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 mb-6">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Your Cart is Empty</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">Looks like you haven't added anything to your cart yet. Browse our products and discover great deals.</p>
          <button
            onClick={() => setPage('products')}
            className="mt-8 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
