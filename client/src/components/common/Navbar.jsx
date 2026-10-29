import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Radio,
  Bell,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  CheckCircle2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { reportApi } from '../../services/reportApi';
import { formatDateTime } from '../../utils/formatters';

const Navbar = ({ onToggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const res = await reportApi.getNotifications();
          if (res.success && res.data) {
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n) => !n.read).length);
          }
        } catch (err) {
          // ignore background notification fetch failure
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await reportApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickSwitch = async (newRole) => {
    try {
      setSwitching(true);
      await quickSwitch(newRole);
      setSwitching(false);
      navigate('/dashboard');
    } catch (err) {
      setSwitching(false);
      console.error(err);
    }
  };

  const getRoleBadgeStyle = (r) => {
    switch (r) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'SUPPORT':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                  Nexus<span className="text-blue-600">Tel</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-semibold text-slate-500 tracking-wider ml-2 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                  Billing & CRM
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Authoritative Active Role Badge */}
          <div className="hidden md:flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-xs ${getRoleBadgeStyle(role)}`}>
              <Shield className="w-3.5 h-3.5" />
              <span>
                {role === 'ADMIN' && 'Telecom Administrator Console'}
                {role === 'SUPPORT' && 'Customer Support & Helpdesk'}
                {role === 'CUSTOMER' && 'Customer Self-Care Portal'}
              </span>
            </div>
            {role === 'CUSTOMER' && user?.customer?.customerCode && (
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                {user.customer.customerCode}
              </span>
            )}
          </div>

          {/* Right User Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popup Dropdown */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-2">
                    <span className="font-semibold text-sm text-slate-800">
                      Notifications & Reminders
                    </span>
                    <span className="text-xs text-slate-500">{unreadCount} unread</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">
                        No notifications received yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-2.5 rounded-xl text-xs border transition-colors ${
                            n.read
                              ? 'bg-slate-50/50 border-slate-100 text-slate-600'
                              : 'bg-blue-50/60 border-blue-100 text-slate-800 font-medium'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-900">{n.title}</span>
                            {!n.read && (
                              <button
                                onClick={() => handleMarkRead(n._id)}
                                className="text-[10px] text-blue-600 hover:underline flex-shrink-0"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                          <p className="text-slate-600 mt-1">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {formatDateTime(n.createdAt)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Pill */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[120px]">
                    {user.name}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border mt-1 ${getRoleBadgeStyle(
                      role
                    )}`}
                  >
                    {role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
