import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Layers,
  Activity,
  Calculator,
  FileText,
  CreditCard,
  BookOpen,
  X,
  ShieldCheck,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const { role } = useAuth();
  const isAdminOrSupport = role === 'ADMIN' || role === 'SUPPORT';

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'SUPPORT', 'CUSTOMER'],
    },
    {
      to: '/customers',
      label: 'Customers',
      icon: Users,
      roles: ['ADMIN', 'SUPPORT'],
    },
    {
      to: '/subscriptions',
      label: 'Plans & Plans Catalog',
      icon: Layers,
      roles: ['ADMIN', 'SUPPORT', 'CUSTOMER'],
    },
    {
      to: '/usage',
      label: 'Usage & CDR Tracking',
      icon: Activity,
      roles: ['ADMIN', 'SUPPORT', 'CUSTOMER'],
    },
    {
      to: '/billing',
      label: 'Billing Engine',
      icon: Calculator,
      roles: ['ADMIN', 'SUPPORT', 'CUSTOMER'],
    },
    {
      to: '/invoices',
      label: 'Invoices',
      icon: FileText,
      roles: ['ADMIN', 'SUPPORT', 'CUSTOMER'],
    },
    {
      to: '/payments',
      label: 'Payment Gateway',
      icon: CreditCard,
      roles: ['ADMIN', 'SUPPORT', 'CUSTOMER'],
    },
    {
      to: '/interview-guide',
      label: 'Architecture & Q/A Guide',
      icon: BookOpen,
      roles: ['ADMIN', 'SUPPORT', 'CUSTOMER'],
      highlight: true,
    },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 z-50 lg:z-30 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200/80 p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Mobile close button */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 lg:hidden">
            <span className="font-bold text-sm text-slate-800">Navigation Menu</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose && onClose()}
                  className={linkClass}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.highlight && (
                    <span className="ml-auto text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                      PDF
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Info */}
        <div className="pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>RBAC Mode: {role}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              MERN Stack Architecture with authoritative backend billing calculation.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
