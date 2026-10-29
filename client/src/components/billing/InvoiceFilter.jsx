import React from 'react';
import { Filter } from 'lucide-react';

const InvoiceFilter = ({ status, setStatus, billingPeriod, setBillingPeriod }) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <Filter className="w-4 h-4 text-slate-400" /> Filter:
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses (PENDING, PAID, OVERDUE)</option>
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="OVERDUE">OVERDUE</option>
        </select>

        <select
          value={billingPeriod}
          onChange={(e) => setBillingPeriod(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Billing Periods</option>
          <option value="2026-10">2026-10 (Current)</option>
          <option value="2026-09">2026-09 (Prior)</option>
        </select>
      </div>

      <span className="text-slate-400 text-xs">
        Showing invoices filtered by status and billing period.
      </span>
    </div>
  );
};

export default InvoiceFilter;
