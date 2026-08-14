import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configure axios defaults for sending cookies with cross-origin requests
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth profile on mount
  useEffect(() => {
    checkAuthProfile();
  }, []);

  const checkAuthProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/auth/profile`);
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      // User is not authenticated; keep state as null
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'customer') => {
    try {
      setError(null);
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password, role });
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Registration failed.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/logout`);
      setUser(null);
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setLoading(false);
    }
  };

  // Utility to update user wishlist state on frontend without full profile reload
  const setWishlistState = (newWishlist) => {
    setUser((prev) => (prev ? { ...prev, wishlist: newWishlist } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        checkAuthProfile,
        setWishlistState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
