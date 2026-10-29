import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Search,
  Code2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Button from '../components/common/Button';

const qaList = [
  {
    category: 'Architecture',
    q: 'Can you describe the overall end-to-end architecture of your Telecom Billing System?',
    a: 'NexusTel is built as a three-tier MERN stack application. The frontend uses React 18 with Vite, Tailwind CSS, and Lucide icons. The backend is an Express.js/Node.js REST API with JWT authentication and strict RBAC. Data persistence uses MongoDB with Mongoose ODM. Critical business logic, including tariff rating, excess data calculation, discounts, and GST, runs strictly in the backend service layer (billing.service.js) to guarantee mathematical integrity.',
  },
  {
    category: 'Architecture',
    q: 'Why should billing calculations never be computed on the client side (browser)?',
    a: 'Client-side code can be inspected, manipulated, or bypassed via browser developer tools or HTTP proxies. If billing amounts were computed on the frontend, malicious users could alter final payables to ₹0. By executing rating logic exclusively on the backend, the system validates authoritative database tariffs, applies exact quotas, and ensures financial compliance.',
  },
  {
    category: 'Database',
    q: 'How does the system handle high-volume Call Detail Records (CDRs) without hitting MongoDB limits?',
    a: 'Instead of embedding millions of usage logs inside a single customer document (which would quickly breach MongoDB’s 16MB per-document limit), CDR records are stored in a dedicated Usage collection referencing customerId. We apply a compound index on { customerId: 1, usageDate: -1 }, enabling sub-millisecond retrieval for any billing cycle.',
  },
  {
    category: 'Billing Engine',
    q: 'What is the authoritative rating formula implemented in the billing engine?',
    a: 'The authoritative formula is: Final Total = Base Plan Rental (₹499) + Extra Data Charge (₹100 for 2GB overage @ ₹50/GB) + Extra SMS Charge (₹20 for 20 excess SMS @ ₹1/SMS) - Promotional Discount (₹50) + GST Tax 18% (₹102) = ₹671. This is verified by automated regression tests in billingEngine.test.js.',
  },
  {
    category: 'Payments',
    q: 'How does the payment gateway prevent duplicate payments on network retries (Idempotency)?',
    a: 'Each checkout transaction includes a client-generated Idempotency-Key. The backend verifies whether a transaction with this key already exists and whether the invoice is in PENDING status. If a duplicate request is received, the server returns the cached result without charging the customer again.',
  },
  {
    category: 'Security & RBAC',
    q: 'How is Role-Based Access Control (RBAC) enforced across the system?',
    a: 'We use role.middleware.js with authorize(...roles). Authenticated JWT payloads contain the user ID and role (ADMIN, SUPPORT, CUSTOMER). CUSTOMER users are restricted strictly to their own profile, data usage, invoices, and payments. SUPPORT specialists can manage customer accounts and inspect CDRs but cannot view corporate revenue or execute billing cycles. ADMIN users have full operational control.',
  },
  {
    category: 'State Management',
    q: 'How is state managed across the frontend application?',
    a: 'We use a dual approach: React Context (AuthContext) and Redux Toolkit manage global authentication session and user roles, while component-level state and API service modules handle data fetching, pagination, and modal dialogs.',
  },
];

const InterviewGuide = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedIndex, setExpandedIndex] = useState(0);

  const categories = ['ALL', 'Architecture', 'Billing Engine', 'Database', 'Payments', 'Security & RBAC'];

  const filteredQA = qaList.filter((item) => {
    const matchesSearch =
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Technical Architecture & Interview Guide
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              System Design & Engineering Principles
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Comprehensive interview preparation, architectural explanations, database partitioning strategies, and authoritative billing formulas.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[140px]">
            <span className="text-2xl font-black text-amber-400">₹671</span>
            <span className="text-[11px] block text-slate-300 font-medium">Standard Rating Formula</span>
          </div>
        </div>
      </div>

      {/* 45-Second Pitch Card */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
          <Zap className="w-4 h-4 text-blue-600" />
          <span>The 45-Second Project Pitch (Executive Summary)</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-200">
          "I developed NexusTel, an enterprise Telecom Billing and Customer Management System using the MERN stack. The platform handles subscriber lifecycles, 5G tariff plans, real-time CDR usage tracking, itemized tax invoices, and idempotent payments. The backend runs on Node.js and Express with JWT authentication and RBAC. To efficiently process high-volume telecom traffic without exceeding MongoDB limits, we partition CDR logs into a dedicated collection with compound indexes. A key achievement is our backend rating engine that computes data overage, discounts, and 18% GST with zero client-side tampering, paired with idempotent payment processing to prevent duplicate billing."
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Accordion Questions */}
      <div className="space-y-3">
        {filteredQA.map((item, index) => {
          const isOpen = expandedIndex === index;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => setExpandedIndex(isOpen ? null : index)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    Q{index + 1}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 mt-0.5">{item.q}</h3>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 text-xs text-slate-600 leading-relaxed bg-slate-50/50">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InterviewGuide;
