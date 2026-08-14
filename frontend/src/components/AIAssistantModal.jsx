import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Send, X, ArrowRight, Star, MessageSquare } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AIAssistantModal = ({ isOpen, onClose, setPage, setSelectedProductId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Hi! I am the ShopEase Support Assistant. I can help you search products, track orders, explain return/refund policies, or cancel active orders. Select a topic below or ask me any question!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [assistantMode, setAssistantMode] = useState('smart-search'); // 'ai' | 'smart-search'

  // User Tickets states
  const [activeSupportTab, setActiveSupportTab] = useState('chat'); // 'chat' | 'tickets'
  const [userTickets, setUserTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const supportChips = [
    { text: '📦 Track my orders' },
    { text: '🔄 Return & Refund policy' },
    { text: '❌ Cancel my order' },
    { text: '📞 Contact Support' },
    { text: '🛍️ Show products under ₹3000' },
  ];

  const scrollRef = useRef(null);

  const fetchUserTickets = async () => {
    if (!user) return;
    try {
      setTicketsLoading(true);
      const res = await axios.get(`${API_URL}/ai/my-support-requests`);
      if (res.data.success) {
        setUserTickets(res.data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching user tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSupportTab === 'tickets') {
      fetchUserTickets();
    }
  }, [activeSupportTab]);

  useEffect(() => {
    if (isOpen) {
      checkAssistantStatus();
      if (activeSupportTab === 'tickets') {
        fetchUserTickets();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const checkAssistantStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/ai/status`);
      if (res.data.success && res.data.mode === 'ai') {
        setAssistantMode('ai');
      } else {
        setAssistantMode('smart-search');
      }
    } catch (err) {
      setAssistantMode('smart-search');
    }
  };

  const handleChipClick = async (chipText) => {
    if (loading) return;
    setMessages((prev) => [...prev, { sender: 'user', text: chipText }]);
    setLoading(true);

    const lastAssistantMsg = [...messages].reverse().find(m => m.sender === 'assistant' && msgProductsExist(m));
    const previousProducts = lastAssistantMsg ? lastAssistantMsg.products : [];

    try {
      const res = await axios.post(`${API_URL}/ai/assistant`, {
        message: chipText,
        previousProducts,
      });

      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: res.data.response || res.data.message,
            products: res.data.products || [],
          },
        ]);
      }
    } catch (err) {
      console.error('AI assistant error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: err.response?.data?.message || 'Sorry, I encountered an issue processing that query. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);

    // Extract previously displayed products from history to support context comparisons
    const lastAssistantMsg = [...messages].reverse().find(m => m.sender === 'assistant' && msgProductsExist(m));
    const previousProducts = lastAssistantMsg ? lastAssistantMsg.products : [];

    try {
      const res = await axios.post(`${API_URL}/ai/assistant`, {
        message: userMessage,
        previousProducts,
      });

      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: res.data.response || res.data.message,
            products: res.data.products || [],
          },
        ]);
      }
    } catch (err) {
      console.error('AI assistant error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: err.response?.data?.message || 'Sorry, I encountered an issue processing that query. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely check if message products exist
  const msgProductsExist = (m) => {
    return m && Array.isArray(m.products) && m.products.length > 0;
  };

  const handleProductView = (prodId) => {
    setSelectedProductId(prodId);
    setPage('product-details');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col sm:flex-row items-end sm:items-end justify-center sm:justify-end sm:p-6 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-[1px] transition-opacity">
      
      <div className="flex h-[85vh] sm:h-[600px] w-full sm:w-[400px] flex-col rounded-t-2xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl animate-slide-up overflow-hidden transition-colors duration-200">
        
        {/* Dynamic Theme Header */}
        <div className="bg-zinc-50 dark:bg-zinc-900 px-5 py-4 text-zinc-900 dark:text-white flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                {assistantMode === 'ai' ? 'ShopEase AI' : 'Smart Search'}
              </h2>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium block mt-0.5">
                {assistantMode === 'ai' ? 'Generative Intelligence' : 'Validated Search'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Controls for Chat vs Tickets */}
        {user && (
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shrink-0 gap-1">
            <button
              onClick={() => setActiveSupportTab('chat')}
              className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all cursor-pointer ${
                activeSupportTab === 'chat'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Support Chat
            </button>
            <button
              onClick={() => setActiveSupportTab('tickets')}
              className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all cursor-pointer ${
                activeSupportTab === 'tickets'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              My Tickets
            </button>
          </div>
        )}

        {/* Content Pane */}
        {activeSupportTab === 'chat' ? (
          <>
            {/* Message Logs Pane */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5 custom-scrollbar bg-white dark:bg-zinc-950">
              {messages.map((msg, index) => (
                <React.Fragment key={index}>
                  <div
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Chat Bubble styling */}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Product catalog matches (Carousels/Previews) */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-3 w-full flex overflow-x-auto gap-3 pb-2 snap-x custom-scrollbar">
                        {msg.products.map((prod) => (
                          <div
                            key={prod._id}
                            onClick={() => handleProductView(prod._id)}
                            className="min-w-[160px] max-w-[160px] snap-start shrink-0 flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all duration-300 cursor-pointer group"
                          >
                            <div className="aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative">
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div className="p-3 flex-1 flex flex-col justify-between">
                              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {prod.name}
                              </span>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">₹{prod.price.toLocaleString('en-IN')}</span>
                                <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                                  <Star className="h-3 w-3" fill="currentColor" />
                                  {prod.ratings || prod.rating || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Suggestions chips right under first message */}
                  {index === 0 && messages.length === 1 && !loading && (
                    <div className="flex flex-wrap gap-2 pt-2 animate-fade-in">
                      {supportChips.map((chip, i) => (
                         <button
                         key={i}
                         type="button"
                         onClick={() => handleChipClick(chip.text)}
                         className="rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 dark:hover:border-indigo-500/30 dark:hover:text-indigo-400 hover:text-indigo-700 transition-all cursor-pointer shadow-sm"
                       >
                         {chip.text}
                       </button>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              ))}

              {/* Typing Loading placeholder */}
              {loading && (
                <div className="flex items-start gap-2">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3.5 w-fit">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500 [animation-delay:0.2s]"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500 [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              
              <div ref={scrollRef}></div>
            </div>

            {/* Input Form area */}
            <form onSubmit={handleSend} className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={500}
                  placeholder={
                    loading
                      ? "Thinking..."
                      : "Ask about products, orders..."
                  }
                  disabled={loading}
                  className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pl-4 pr-12 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:opacity-50 transition-all shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Tickets Log Pane */
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-zinc-50 dark:bg-zinc-950">
            {ticketsLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="skeleton h-8 w-8 rounded-full"></div>
              </div>
            ) : userTickets.length > 0 ? (
              userTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm space-y-4 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {new Date(ticket.createdAt).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      ticket.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Request</span>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{ticket.message}</p>
                  </div>

                  {ticket.status === 'Resolved' && (
                    <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3.5 border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Resolution</span>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{ticket.resolution || 'Your query has been successfully resolved.'}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 mb-4">
                  <MessageSquare className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No Tickets Registered</h3>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 max-w-[200px] leading-relaxed">Your support requests for tracking, returns, or cancellations will appear here.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AIAssistantModal;
