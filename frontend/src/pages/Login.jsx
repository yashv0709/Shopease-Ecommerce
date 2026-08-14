import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldAlert, Eye, EyeOff } from 'lucide-react';

const Login = ({ setPage }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all credentials.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setPage('products');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm transition-colors duration-200">
        
        {/* Title */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm mb-4">
            <span className="text-2xl font-bold">S</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to access your account
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-3.5 text-xs font-semibold text-red-650 dark:text-red-400 animate-shake">
              <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-zinc-400 dark:text-zinc-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-zinc-400 dark:text-zinc-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-2.5 pl-10 pr-10 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-75 cursor-pointer"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Seed Info Box */}
        <div className="mt-6 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3">Test Credentials</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Admin Account</span>
              <code className="text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">admin@shopease.com</code>
              <code className="text-xs font-mono text-zinc-500 dark:text-zinc-500 px-2">password123</code>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Customer Account</span>
              <code className="text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">john@gmail.com</code>
              <code className="text-xs font-mono text-zinc-500 dark:text-zinc-500 px-2">password123</code>
            </div>
          </div>
        </div>

        {/* Link to Register */}
        <div className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-6">
          Don't have an account?{' '}
          <button
            onClick={() => setPage('register')}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 cursor-pointer"
          >
            Create Account
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
