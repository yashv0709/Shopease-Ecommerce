import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Global Toast Notification State
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success', productId: '', quantity: 1 });

  const showToast = (message, type = 'success', productId = '', quantity = 1) => {
    setToast({ visible: true, message, type, productId, quantity });
    // Reset toast after 3 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4500); // 4.5s allows user enough time to click Undo if they want
  };

  // Auto load cart when user logs in, or clear when logged out
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({ items: [], totalPrice: 0 });
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/cart`);
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      setError(null);
      setLoading(true);
      const res = await axios.post(`${API_URL}/cart`, { productId, quantity });
      if (res.data.success) {
        setCart(res.data.cart);
        // Find matching item in updated cart to get the name
        const matchedItem = res.data.cart.items.find(
          (item) => (item.product?._id || item.product) === productId
        );
        const itemName = matchedItem?.product?.name || 'Item';
        showToast(`${itemName} added to cart!`, 'success', productId, quantity);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error adding product to cart';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const undoAddToCart = async (productId, quantity = 1) => {
    try {
      setError(null);
      setLoading(true);
      // Find matching item in current cart to see its current quantity
      const currentItem = cart.items.find(
        (item) => (item.product?._id || item.product) === productId
      );
      if (!currentItem) return { success: false };

      const newQty = currentItem.quantity - quantity;
      let res;
      if (newQty <= 0) {
        res = await axios.delete(`${API_URL}/cart/${productId}`);
      } else {
        res = await axios.put(`${API_URL}/cart/${productId}`, { quantity: newQty });
      }

      if (res.data.success) {
        setCart(res.data.cart);
        setToast({ visible: false, message: '', type: 'success', productId: '', quantity: 1 });
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error reverting cart change';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      setError(null);
      setLoading(true);
      const res = await axios.put(`${API_URL}/cart/${productId}`, { quantity });
      if (res.data.success) {
        setCart(res.data.cart);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error updating quantity';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setError(null);
      setLoading(true);
      const res = await axios.delete(`${API_URL}/cart/${productId}`);
      if (res.data.success) {
        setCart(res.data.cart);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error removing item';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const clearCartLocal = async () => {
    try {
      setLoading(true);
      const res = await axios.delete(`${API_URL}/cart`);
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkout = async (shippingAddress) => {
    try {
      setError(null);
      setLoading(true);
      const res = await axios.post(`${API_URL}/orders`, { shippingAddress });
      if (res.data.success) {
        // Clear local cart state on successful order creation (backend cleared it in DB already)
        setCart({ items: [], totalPrice: 0 });
        return { success: true, order: res.data.order };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Checkout failed. Please try again.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        toast,
        showToast,
        fetchCart,
        addToCart,
        undoAddToCart,
        updateCartItem,
        removeFromCart,
        clearCart: clearCartLocal,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
