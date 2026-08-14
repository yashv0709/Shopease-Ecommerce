import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, Calendar, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Orders = ({ setPage }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);
  const { showToast } = useCart();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/orders/my-orders`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = (orderId) => {
    setCancelConfirmId(orderId);
  };

  const executeCancelOrder = async (orderId) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/orders/${orderId}/cancel`);
      if (res.data.success) {
        showToast('Order cancelled successfully!');
        fetchOrders();
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setLoading(false);
      setCancelConfirmId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Placed':
        return 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/50';
      case 'Confirmed':
        return 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-900/50';
      case 'Shipped':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50';
      case 'Delivered':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50';
      case 'Cancelled':
        return 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/50';
      default:
        return 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-100 dark:border-zinc-700';
    }
  };

  const getStatusStepIndex = (status) => {
    const steps = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];
    return steps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="skeleton h-10 w-64 mb-2 rounded-xl"></div>
        <div className="skeleton h-5 w-96 mb-8 rounded-lg"></div>
        <div className="space-y-8 animate-fade-in">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-64 w-full rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Your Orders</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Track current status and review previous purchases.</p>

      {orders.length > 0 ? (
        <div className="mt-8 space-y-8">
          {orders.map((order) => {
            const currentStepIndex = getStatusStepIndex(order.status);
            const shortId = order._id.slice(-6).toUpperCase();

            return (
              <div
                key={order._id}
                className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors duration-200"
              >
                {/* Header panel */}
                <div className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">
                        Order ID
                      </span>
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        #{shortId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">
                        Date Placed
                      </span>
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">
                        Total Price
                      </span>
                      <span className="text-sm font-bold text-zinc-900 dark:text-white block mt-0.5">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {['Placed', 'Confirmed'].includes(order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 hover:border-red-200 dark:hover:border-red-900/50 px-4 py-2 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Progress bar or Cancelled Banner */}
                {order.status === 'Cancelled' ? (
                  <div className="px-6 py-4 bg-red-50/50 dark:bg-red-950/10 border-b border-zinc-100 dark:border-zinc-800 text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-500"></span>
                    This order has been cancelled. Product stocks have been returned to store inventory.
                  </div>
                ) : (
                  <div className="px-6 py-8 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="relative flex items-center justify-between">
                      {/* Connecting line background */}
                      <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-zinc-100 dark:bg-zinc-800 z-0"></div>
                      {/* Active line progress */}
                      <div
                        className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-indigo-600 dark:bg-indigo-500 transition-all duration-500 z-0"
                        style={{
                          width: `${(currentStepIndex / 3) * 100}%`,
                        }}
                      ></div>

                      {/* Step milestones */}
                      {['Placed', 'Confirmed', 'Shipped', 'Delivered'].map((step, idx) => {
                        const isCompleted = idx <= currentStepIndex;
                        const isActive = idx === currentStepIndex;
                        return (
                          <div key={step} className="relative z-10 flex flex-col items-center">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                                isCompleted
                                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-500 text-white'
                                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                              } ${isActive ? 'ring-4 ring-indigo-100 dark:ring-indigo-900/30' : ''}`}
                            >
                              {idx + 1}
                            </div>
                            <span
                              className={`mt-3 text-xs font-medium uppercase tracking-wider ${
                                isCompleted ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Purchased product listings */}
                <div className="p-4 sm:p-6 space-y-4">
                  {order.items.map((item) => {
                    const productObj = item.product || {};
                    return (
                      <div
                        key={item._id}
                        className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 p-1.5 flex items-center justify-center">
                          <img
                            src={productObj.imageUrl || 'https://via.placeholder.com/150'}
                            alt={productObj.name || 'Product'}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                            {productObj.name || 'Deleted Product'}
                          </h4>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium block mt-1">
                            Qty: {item.quantity}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium mt-0.5">
                            (₹{item.price.toLocaleString('en-IN')} each)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer / Address details */}
                <div className="bg-zinc-50/50 dark:bg-zinc-800/30 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  <Truck className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  <span>
                    Delivering to: <strong className="text-zinc-900 dark:text-zinc-200 font-semibold">{order.shippingAddress}</strong>
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-16 px-4 text-center shadow-sm transition-colors duration-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 mb-4">
            <Package className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No Orders Yet</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">You haven't placed any orders yet. Add items to your cart and checkout.</p>
          {setPage && (
            <button
              onClick={() => setPage('products')}
              className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Start Shopping
            </button>
          )}
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {cancelConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 dark:bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl animate-scale-up text-center transition-colors duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Cancel Order</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Are you sure you want to cancel this order? This action will restore product stocks.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
              <button
                onClick={() => setCancelConfirmId(null)}
                className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                No, Keep It
              </button>
              <button
                onClick={() => executeCancelOrder(cancelConfirmId)}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
