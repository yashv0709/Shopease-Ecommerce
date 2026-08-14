import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, Package, Users, DollarSign, AlertTriangle, 
  Trash2, Edit, Plus, X, BarChart3, Settings, ShieldCheck, Sparkles 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'products' | 'support'
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [orderStatusDistribution, setOrderStatusDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chatbot Support Ticket states
  const [supportRequests, setSupportRequests] = useState([]);
  const [supportLoading, setSupportLoading] = useState(false);

  // Product Manager states
  const [productsList, setProductsList] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [editingProductId, setEditingProductId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Product Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Sports');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState(null);
  const [descGenLoading, setDescGenLoading] = useState(false);

  // Dynamic Categories state
  const [dbCategories, setDbCategories] = useState(['Sports', 'Casual', 'Electronics', 'Accessories', 'Footwear']);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoveredStatusIndex, setHoveredStatusIndex] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
    fetchDbCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'support') {
      fetchSupportRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProductsList();
    }
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/dashboard/stats`);
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentOrders(res.data.recentOrders || []);
        setLowStockProducts(res.data.lowStockProducts || []);
        setBestSellers(res.data.bestSellers || []);
        setCategorySales(res.data.categorySales || []);
        setOrderStatusDistribution(res.data.orderStatusDistribution || []);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsList = async () => {
    try {
      setProductsLoading(true);
      const res = await axios.get(`${API_URL}/products?limit=100`);
      if (res.data.success) {
        setProductsList(res.data.products);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchDbCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/products/categories/all`);
      if (res.data.success && res.data.categories?.length > 0) {
        setDbCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchSupportRequests = async () => {
    try {
      setSupportLoading(true);
      const res = await axios.get(`${API_URL}/dashboard/support-requests`);
      if (res.data.success) {
        setSupportRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching support requests:', err);
    } finally {
      setSupportLoading(false);
    }
  };

  const handleResolveRequest = async (requestId) => {
    const resolution = window.prompt(
      'Enter resolution note for user (e.g. Order cancelled, refund initiated):',
      'Your request has been resolved by our support team.'
    );
    if (resolution === null) return; // Cancel prompt
    try {
      const res = await axios.put(`${API_URL}/dashboard/support-requests/${requestId}/resolve`, {
        resolution,
      });
      if (res.data.success) {
        fetchSupportRequests();
      }
    } catch (err) {
      console.error('Error resolving support request:', err);
      alert('Failed to resolve support request');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axios.put(`${API_URL}/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (res.data.success) {
        fetchDashboardStats();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleDeleteProduct = (prodId) => {
    setDeleteConfirmId(prodId);
  };

  const executeDeleteProduct = async (prodId) => {
    try {
      const res = await axios.delete(`${API_URL}/products/${prodId}`);
      if (res.data.success) {
        fetchProductsList();
        fetchDashboardStats();
        fetchDbCategories();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const openAddForm = () => {
    setFormMode('add');
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Sports');
    setStock('');
    setImageUrl('');
    setFormError(null);
    setIsCustomCategory(false);
    setCustomCategory('');
    setProductFormOpen(true);
  };

  const openEditForm = (prod) => {
    setFormMode('edit');
    setEditingProductId(prod._id);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price);
    setCategory(prod.category);
    setStock(prod.stock);
    setImageUrl(prod.imageUrl);
    setFormError(null);
    setIsCustomCategory(false);
    setCustomCategory('');
    setProductFormOpen(true);
  };

  const handleGenerateDescription = async () => {
    if (!name.trim()) {
      setFormError('Please enter a product name first.');
      return;
    }
    const inputFeatures = window.prompt(
      'Enter product features separated by commas (e.g. lightweight, mesh upper, rubber sole):'
    );
    if (inputFeatures === null) return;
    if (!inputFeatures.trim()) {
      setFormError('Product features are required to generate description.');
      return;
    }

    try {
      setDescGenLoading(true);
      setFormError(null);
      const res = await axios.post(`${API_URL}/ai/describe`, {
        name,
        features: inputFeatures.split(',').map((f) => f.trim()),
      });
      if (res.data.success) {
        setDescription(res.data.description);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to generate description.');
    } finally {
      setDescGenLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const productPayload = {
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      imageUrl,
    };

    try {
      let res;
      if (formMode === 'add') {
        res = await axios.post(`${API_URL}/products`, productPayload);
      } else {
        res = await axios.put(`${API_URL}/products/${editingProductId}`, productPayload);
      }

      if (res.data.success) {
        setProductFormOpen(false);
        fetchProductsList();
        fetchDashboardStats();
        fetchDbCategories();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit form.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const categorySalesTotal = categorySales.reduce((sum, c) => sum + c.revenue, 0) || 1;
  const pieColors = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];
  const categoryGradients = [
    { from: '#818cf8', to: '#4f46e5' }, // Indigo
    { from: '#c084fc', to: '#9333ea' }, // Purple
    { from: '#22d3ee', to: '#0891b2' }, // Cyan
    { from: '#34d399', to: '#059669' }, // Emerald
    { from: '#fbbf24', to: '#d97706' }, // Amber
    { from: '#f87171', to: '#dc2626' }, // Red
    { from: '#f472b6', to: '#db2777' }, // Pink
    { from: '#60a5fa', to: '#2563eb' }, // Blue
  ];
  let accumulatedPercent = 0;
  const pieSegments = categorySales.map((c, i) => {
    const percent = c.revenue / categorySalesTotal;
    const dashLength = percent * 314.159;
    const dashOffset = -accumulatedPercent * 314.159;
    const color = pieColors[i % pieColors.length];
    const grad = categoryGradients[i % categoryGradients.length];
    accumulatedPercent += percent;
    return {
      ...c,
      percent,
      dashLength,
      dashOffset,
      color,
      grad,
    };
  });
  const activePieSlice = hoveredIndex !== null ? pieSegments[hoveredIndex] : null;

  // Order Status Distribution Chart
  const orderStatusTotal = orderStatusDistribution.reduce((sum, d) => sum + d.count, 0) || 1;
  const statusOrder = ['Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
  const statusGradients = {
    Placed: { from: '#60a5fa', to: '#2563eb', color: '#3b82f6' },     // Blue
    Confirmed: { from: '#c084fc', to: '#9333ea', color: '#a855f7' },  // Purple
    Shipped: { from: '#fbbf24', to: '#d97706', color: '#f59e0b' },    // Amber
    Delivered: { from: '#34d399', to: '#059669', color: '#10b981' },  // Emerald
    Cancelled: { from: '#f87171', to: '#dc2626', color: '#ef4444' },  // Red
  };
  let statusAccumulatedPercent = 0;
  const statusSegments = statusOrder.map((status) => {
    const match = orderStatusDistribution.find(d => d._id === status);
    const count = match ? match.count : 0;
    const percent = count / orderStatusTotal;
    const dashLength = percent * 314.159;
    const dashOffset = -statusAccumulatedPercent * 314.159;
    const grad = statusGradients[status] || { from: '#94a3b8', to: '#475569', color: '#64748b' };
    statusAccumulatedPercent += percent;
    return {
      _id: status,
      count,
      percent,
      dashLength,
      dashOffset,
      grad,
    };
  });
  const activeStatusSlice = hoveredStatusIndex !== null ? statusSegments[hoveredStatusIndex] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Dashboard Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Admin Console
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure Root
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-medium">Control inventory levels, view stats, and manage customer orders.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-1.5 shadow-sm transition-colors duration-200">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
            }`}
          >
            <Settings className="h-4 w-4" />
            Products Manager
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'support'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
            }`}
          >
            <Users className="h-4 w-4" />
            Support Tickets
          </button>
        </div>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && stats && (
        <div className="mt-8 space-y-8 animate-fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Products Card */}
            <div className="animate-fade-in-up stagger-1 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Total Products</span>
                <span className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white block">{stats.totalProducts}</span>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Package className="h-6 w-6" />
              </div>
            </div>

            {/* Orders Card */}
            <div className="animate-fade-in-up stagger-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Total Orders</span>
                <span className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white block">{stats.totalOrders}</span>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>

            {/* Users Card */}
            <div className="animate-fade-in-up stagger-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Total Users</span>
                <span className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white block">{stats.totalUsers}</span>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
                <Users className="h-6 w-6" />
              </div>
            </div>

            {/* Revenue Card */}
            <div className="animate-fade-in-up stagger-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Total Revenue</span>
                <span className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white block">
                  ₹{stats.totalRevenue.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </div>          {/* Live Analysis Graphs */}
          <div className="flex flex-col gap-6 w-full">
            
            {/* Sales Breakdown by Category */}
            <div className="animate-fade-in-up rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <BarChart3 className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400" />
                  Sales Breakdown by Category
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Interactive revenue distribution across product categories with real-time indicators.</p>
              </div>
              
              {categorySales.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 min-h-[220px]">
                  {/* SVG Pie/Donut Chart */}
                  <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      <defs>
                        {pieSegments.map((seg, idx) => (
                          <linearGradient key={`cgrad-${idx}`} id={`category-grad-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={seg.grad.from} />
                            <stop offset="100%" stopColor={seg.grad.to} />
                          </linearGradient>
                        ))}
                      </defs>
                      {/* Background track circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        className="stroke-zinc-100 dark:stroke-zinc-800"
                        strokeWidth="10"
                        fill="none"
                      />
                      {/* Segments */}
                      {pieSegments.map((seg, idx) => {
                        const isHovered = hoveredIndex === idx;
                        const isAnyHovered = hoveredIndex !== null;
                        return (
                          <circle
                            key={seg._id}
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke={`url(#category-grad-${idx})`}
                            strokeWidth={isHovered ? '14' : '10'}
                            strokeDasharray={`${seg.dashLength} 314.159`}
                            strokeDashoffset={seg.dashOffset}
                            strokeLinecap="round"
                            pointerEvents="stroke"
                            className="transition-all duration-300 cursor-pointer"
                            style={{
                              opacity: isAnyHovered ? (isHovered ? 1 : 0.45) : 1,
                            }}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        );
                      })}
                    </svg>

                    {/* Center Label Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest truncate max-w-[88px]">
                        {activePieSlice ? activePieSlice._id : 'Total Sales'}
                      </span>
                      <span className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                        ₹{activePieSlice ? activePieSlice.revenue.toLocaleString('en-IN') : categorySalesTotal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/50">
                        {activePieSlice ? `${Math.round(activePieSlice.percent * 100)}%` : `${categorySales.length} categories`}
                      </span>
                    </div>
                  </div>

                  {/* Chart Legend grid list */}
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1.5 scrollbar-thin">
                    {pieSegments.map((seg, idx) => (
                      <div
                        key={seg._id}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={`flex items-center justify-between rounded-xl p-3.5 transition-all duration-200 border cursor-pointer ${
                          hoveredIndex === idx
                            ? 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 scale-[1.02] shadow-sm'
                            : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: `linear-gradient(135deg, ${seg.grad.from}, ${seg.grad.to})` }} />
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{seg._id}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                            ₹{seg.revenue.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 block">
                            {Math.round(seg.percent * 100)}% ({seg.unitsSold} sold)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs font-bold text-zinc-400 dark:text-zinc-500">
                  No sales logged yet to show chart.
                </div>
              )}
            </div>

            {/* Order Status Distribution */}
            <div className="animate-fade-in-up rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-purple-500 dark:text-purple-400" />
                  Order Status Distribution
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Interactive order lifecycle status tracker with matching visual indicators.</p>
              </div>

              {stats.totalOrders > 0 ? (
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 min-h-[220px]">
                  {/* SVG Pie/Donut Chart */}
                  <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      <defs>
                        {statusSegments.map((seg, idx) => (
                          <linearGradient key={`sgrad-${idx}`} id={`status-grad-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={seg.grad.from} />
                            <stop offset="100%" stopColor={seg.grad.to} />
                          </linearGradient>
                        ))}
                      </defs>
                      {/* Background track circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        className="stroke-zinc-100 dark:stroke-zinc-800"
                        strokeWidth="10"
                        fill="none"
                      />
                      {/* Segments */}
                      {statusSegments.map((seg, idx) => {
                        const isHovered = hoveredStatusIndex === idx;
                        const isAnyHovered = hoveredStatusIndex !== null;
                        if (seg.count === 0) return null; // Skip empty segments to avoid interception
                        return (
                          <circle
                            key={seg._id}
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke={`url(#status-grad-${idx})`}
                            strokeWidth={isHovered ? '14' : '10'}
                            strokeDasharray={`${seg.dashLength} 314.159`}
                            strokeDashoffset={seg.dashOffset}
                            strokeLinecap="round"
                            pointerEvents="stroke"
                            className="transition-all duration-300 cursor-pointer"
                            style={{
                              opacity: isAnyHovered ? (isHovered ? 1 : 0.45) : 1,
                            }}
                            onMouseEnter={() => setHoveredStatusIndex(idx)}
                            onMouseLeave={() => setHoveredStatusIndex(null)}
                          />
                        );
                      })}
                    </svg>

                    {/* Center Label Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest truncate max-w-[88px]">
                        {activeStatusSlice ? activeStatusSlice._id : 'Total Orders'}
                      </span>
                      <span className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                        {activeStatusSlice ? `${activeStatusSlice.count} Orders` : `${stats.totalOrders} Orders`}
                      </span>
                      <span className="text-[8px] font-bold text-purple-600 dark:text-purple-400 mt-0.5 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded-full border border-purple-100 dark:border-purple-900/50">
                        {activeStatusSlice ? `${Math.round(activeStatusSlice.percent * 100)}%` : '5 milestones'}
                      </span>
                    </div>
                  </div>

                  {/* Chart Legend list */}
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1.5 scrollbar-thin">
                    {statusSegments.map((seg, idx) => {
                      const getStatusColorTagClass = (st) => {
                        switch (st) {
                          case 'Placed': return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40';
                          case 'Confirmed': return 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/40';
                          case 'Shipped': return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40';
                          case 'Delivered': return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40';
                          case 'Cancelled': return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/40';
                          default: return 'text-zinc-700 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/30 border-zinc-100';
                        }
                      };

                      return (
                        <div
                          key={seg._id}
                          onMouseEnter={() => setHoveredStatusIndex(idx)}
                          onMouseLeave={() => setHoveredStatusIndex(null)}
                          className={`flex items-center justify-between rounded-xl p-3.5 transition-all duration-200 border cursor-pointer ${
                            hoveredStatusIndex === idx
                              ? 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 scale-[1.02] shadow-sm'
                              : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: `linear-gradient(135deg, ${seg.grad.from}, ${seg.grad.to})` }} />
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusColorTagClass(seg._id)}`}>
                              {seg._id}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                              {seg.count} {seg.count === 1 ? 'order' : 'orders'}
                            </span>
                            <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 block">
                              {Math.round(seg.percent * 100)}% share
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs font-bold text-zinc-400 dark:text-zinc-500">
                  No orders logged yet to show chart.
                </div>
              )}
            </div>

          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Low Stock Alerts & Best Sellers */}
            <div className="lg:col-span-1 space-y-6">
              {/* Low Stock Warnings */}
              <div className="animate-fade-in-up rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
                <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                  Low Stock Warnings
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map((p) => (
                      <div key={p._id} className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate flex-1">{p.name}</span>
                        <span className="rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 px-2 py-0.5 font-bold text-red-600 dark:text-red-400">
                          {p.stock} left
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400 font-medium italic">All product inventory is fully stocked.</p>
                  )}
                </div>
              </div>

              {/* Best Sellers */}
              <div className="animate-fade-in-up rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
                <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
                  Top Best Sellers
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  {bestSellers.length > 0 ? (
                    bestSellers.map((b) => (
                      <div key={b._id} className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate flex-1">{b.name}</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {b.totalSold} sold
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400 font-medium italic">No sales registered yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <div className="animate-fade-in-up rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 overflow-x-auto">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">Recent Orders</h2>
                {recentOrders.length > 0 ? (
                  <table className="min-w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        <th className="py-2.5">ID</th>
                        <th className="py-2.5">User</th>
                        <th className="py-2.5">Total</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5 text-right">Update</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/40 text-xs">
                      {recentOrders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                          <td className="py-3 font-bold text-zinc-900 dark:text-zinc-100">#{ord._id.slice(-6).toUpperCase()}</td>
                          <td className="py-3 font-semibold text-zinc-700 dark:text-zinc-300">{ord.user?.name || 'Guest'}</td>
                          <td className="py-3 font-bold text-zinc-900 dark:text-white">₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                          <td className="py-3">
                            <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <select
                              value={ord.status}
                              onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                              className="rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-2 py-1 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                            >
                              <option value="Placed">Placed</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-xs text-zinc-400 font-medium italic">No orders found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Manager Tab */}
      {activeTab === 'products' && (
        <div className="mt-8 space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Product Catalog ({productsList.length})</h2>
            <button
              onClick={openAddForm}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              Add New Product
            </button>
          </div>

          {productsLoading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm overflow-x-auto transition-colors duration-200">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    <th className="py-2.5">Image</th>
                    <th className="py-2.5">Name</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5">Price</th>
                    <th className="py-2.5">Stock</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/40 text-xs">
                  {productsList.map((prod) => (
                    <tr key={prod._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3">
                        <img src={prod.imageUrl} alt={prod.name} className="h-8 w-8 rounded bg-zinc-50 dark:bg-zinc-950 object-contain p-0.5 border dark:border-zinc-800" />
                      </td>
                      <td className="py-3 font-bold text-zinc-900 dark:text-zinc-100 max-w-[200px] truncate">{prod.name}</td>
                      <td className="py-3 font-semibold text-zinc-500 dark:text-zinc-400">{prod.category}</td>
                      <td className="py-3 font-bold text-zinc-900 dark:text-white">₹{prod.price.toLocaleString('en-IN')}</td>
                      <td className="py-3 font-semibold">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          prod.stock <= 5 
                            ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400' 
                            : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          {prod.stock} items
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => openEditForm(prod)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/25 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Support Tab */}
      {activeTab === 'support' && (
        <div className="mt-8 space-y-6 animate-fade-in">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden transition-colors duration-200">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/20">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Chatbot Support Queries</h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">View choices and queries picked by users in the support bot</p>
              </div>
              <span className="rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                {supportRequests.length} Total
              </span>
            </div>

            {supportLoading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              </div>
            ) : supportRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase bg-zinc-50/30 dark:bg-zinc-950/40">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Option/Message Picked</th>
                      <th className="px-6 py-4">Bot Response Sent</th>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {supportRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/10">
                        <td className="px-6 py-4">
                          <div className="font-bold text-zinc-900 dark:text-white">{req.userName}</div>
                          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold block mt-0.5">{req.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400 max-w-[200px] truncate" title={req.message}>
                          {req.message}
                        </td>
                        <td className="px-6 py-4 max-w-[320px] leading-relaxed truncate" title={req.response}>
                          {req.response}
                        </td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-bold">
                          {new Date(req.createdAt).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                            req.status === 'Resolved'
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
                              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {req.status === 'Pending' && (
                            <button
                              onClick={() => handleResolveRequest(req._id)}
                              className="rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 text-xs font-medium transition-all cursor-pointer"
                            >
                              Mark Resolved
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <Users className="h-10 w-10 text-zinc-400 dark:text-zinc-600" />
                <h3 className="mt-4 text-sm font-bold text-zinc-900 dark:text-white">No Tickets Registered</h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">Chatbot support requests will appear here when customers request tracking, returns, or contact info.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal Dialog Overlay */}
      {productFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 dark:bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl animate-scale-up transition-colors duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setProductFormOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
              {formMode === 'add' ? 'Add New Product' : 'Edit Product'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 text-sm text-red-600 dark:text-red-400">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Description</label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={descGenLoading || !name.trim()}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    {descGenLoading ? 'Generating...' : '✨ Generate Description'}
                  </button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                    required
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">Category</label>
                  {isCustomCategory ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => {
                          setCustomCategory(e.target.value);
                          setCategory(e.target.value);
                        }}
                        placeholder="Enter new category name..."
                        className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(false);
                          setCategory(dbCategories[0] || 'Sports');
                        }}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                      >
                        Choose Existing
                      </button>
                    </div>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === 'new') {
                          setIsCustomCategory(true);
                          setCategory('');
                          setCustomCategory('');
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none cursor-pointer transition-all duration-200"
                    >
                      {dbCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="new">+ Add Custom Category</option>
                    </select>
                  )}
                </div>

                {/* Image URL */}
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block mb-1.5">Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-5">
                <button
                  type="button"
                  onClick={() => setProductFormOpen(false)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  {formMode === 'add' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 dark:bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl animate-scale-up text-center transition-colors duration-200">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Delete Product</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Are you sure you want to delete this product? This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                No, Cancel
              </button>
              <button
                onClick={() => executeDeleteProduct(deleteConfirmId)}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
export { AdminDashboard };
