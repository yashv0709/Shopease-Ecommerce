import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldOff } from 'lucide-react';

const ProtectedRoute = ({ children, adminOnly = false, setPage }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    setTimeout(() => setPage('login'), 0);
    return null;
  }

  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400">
          <ShieldOff className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">Access Denied</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
          You don't have permission to access this page. Admin privileges are required.
        </p>
        <button
          onClick={() => setPage('products')}
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
