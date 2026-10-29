import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import {
  Radio,
  Shield,
  User,
  Headphones,
  LogIn,
  UserPlus,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('CUSTOMER'); // 'CUSTOMER' | 'SUPPORT' | 'ADMIN'
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: 'prajakta2@gmail.com',
    password: 'Password@123',
    phone: '+91 98765 43210',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleRoleTabChange = (role) => {
    setSelectedRole(role);
    setError('');
    setIsRegister(false);

    // Set sample registered email for the chosen role
    if (role === 'CUSTOMER') {
      setFormData((prev) => ({
        ...prev,
        email: 'prajakta2@gmail.com',
        password: 'Password@123',
      }));
    } else if (role === 'SUPPORT') {
      setFormData((prev) => ({
        ...prev,
        email: 'support@telecom.com',
        password: 'Password@123',
      }));
    } else if (role === 'ADMIN') {
      setFormData((prev) => ({
        ...prev,
        email: 'admin@telecom.com',
        password: 'Password@123',
      }));
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        await register({
          ...formData,
          role: 'CUSTOMER',
        });
      } else {
        // Enforce requiredRole matching during login
        await login(formData.email, formData.password, selectedRole);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const roleMeta = {
    CUSTOMER: {
      title: 'Customer Self-Care Portal',
      desc: 'Access your 5G plan, view data consumption, and settle telecom bills.',
      color: 'blue',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      activeTabClass: 'bg-blue-600 text-white shadow-md shadow-blue-500/25',
      icon: User,
    },
    SUPPORT: {
      title: 'Customer Support Helpdesk',
      desc: 'Investigate subscriber accounts, inspect CDR records, and verify invoices.',
      color: 'amber',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      activeTabClass: 'bg-amber-600 text-white shadow-md shadow-amber-500/25',
      icon: Headphones,
    },
    ADMIN: {
      title: 'Telecom Administrator Console',
      desc: 'Executive access for authoritative billing engine and 5G tariff plans.',
      color: 'purple',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      activeTabClass: 'bg-purple-600 text-white shadow-md shadow-purple-500/25',
      icon: Shield,
    },
  };

  const currentMeta = roleMeta[selectedRole];
  const CurrentIcon = currentMeta.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg">
        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 mb-3 ring-4 ring-blue-500/20">
            <Radio className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Nexus<span className="text-blue-400">Tel</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Telecom Billing & Customer Management System
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 backdrop-blur-xl">
          {/* THREE ROLE TABS */}
          <div className="mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2 text-center">
              Select Portal Access Role:
            </span>
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleRoleTabChange('CUSTOMER')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedRole === 'CUSTOMER'
                    ? roleMeta.CUSTOMER.activeTabClass
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('SUPPORT')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedRole === 'SUPPORT'
                    ? roleMeta.SUPPORT.activeTabClass
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>Support</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('ADMIN')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedRole === 'ADMIN'
                    ? roleMeta.ADMIN.activeTabClass
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Active Portal Header */}
          <div className="mb-5 p-3.5 rounded-2xl border bg-slate-50/70 border-slate-200 flex items-start gap-3">
            <div className={`p-2 rounded-xl flex-shrink-0 ${currentMeta.badgeClass}`}>
              <CurrentIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">{currentMeta.title}</h3>
                <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${currentMeta.badgeClass}`}>
                  {selectedRole}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {currentMeta.desc}
              </p>
            </div>
          </div>

          {/* Customer Registration Toggle (Only on Customer Tab) */}
          {selectedRole === 'CUSTOMER' && (
            <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  !isRegister ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isRegister ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Register Customer
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && selectedRole === 'CUSTOMER' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Prajakta Sakhare"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registered Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@telecom.com"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={isRegister ? UserPlus : LogIn}
              className={`w-full py-2.5 text-sm mt-2 ${
                selectedRole === 'ADMIN'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : selectedRole === 'SUPPORT'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isRegister
                ? 'Register & Access Customer Portal'
                : `Log In as ${selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()}`}
            </Button>
          </form>

          {/* Quick Pre-fill / Testing Note */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Role verification enabled</span>
            <button
              type="button"
              onClick={() => handleRoleTabChange(selectedRole)}
              className="text-blue-600 hover:underline font-semibold"
            >
              Reset {selectedRole} Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
