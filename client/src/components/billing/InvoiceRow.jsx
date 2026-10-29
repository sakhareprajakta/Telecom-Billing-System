import React from 'react';
import Button from '../common/Button';
import { Eye, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeColor } from '../../utils/formatters';

const InvoiceRow = ({ invoice, onSelectDetail, onPayNow, userName }) => {
  return (
    <tr className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 text-xs">
      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
        {invoice.invoiceNumber}
      </td>
      <td className="py-3.5 px-4">
        <span className="font-semibold text-slate-800 block">
          {invoice.customerId?.customerCode || 'CUST'}
        </span>
        <span className="text-[11px] text-slate-400">
          {invoice.customerId?.userId?.name || userName}
        </span>
      </td>
      <td className="py-3.5 px-4 font-mono text-slate-600">
        {invoice.billingPeriod}
      </td>
      <td className="py-3.5 px-4 text-slate-700">
        {formatCurrency(invoice.baseAmount)}
      </td>
      <td className="py-3.5 px-4">
        <span className={invoice.usageAmount > 0 ? 'text-amber-700 font-semibold' : 'text-slate-400'}>
          {formatCurrency(invoice.usageAmount)}
        </span>
      </td>
      <td className="py-3.5 px-4 text-slate-600">
        {formatCurrency(invoice.tax)}
      </td>
      <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
        {formatCurrency(invoice.totalAmount)}
      </td>
      <td className="py-3.5 px-4 text-slate-600">
        {formatDate(invoice.dueDate)}
      </td>
      <td className="py-3.5 px-4">
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeColor(
            invoice.status
          )}`}
        >
          {invoice.status}
        </span>
      </td>
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => onSelectDetail(invoice)}
          >
            Details
          </Button>
          {invoice.status === 'PENDING' && (
            <Button
              variant="primary"
              size="sm"
              icon={CreditCard}
              onClick={() => onPayNow(invoice)}
            >
              Pay
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default InvoiceRow;
