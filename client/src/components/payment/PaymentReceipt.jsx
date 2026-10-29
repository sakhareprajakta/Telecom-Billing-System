import React from 'react';
import Button from '../common/Button';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { CheckCircle2, Printer } from 'lucide-react';

const PaymentReceipt = ({ payment, onClose }) => {
  if (!payment) return null;

  return (
    <div className="space-y-4 text-xs">
      <div className="text-center py-3 bg-emerald-50 rounded-xl border border-emerald-200">
        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
        <h4 className="font-extrabold text-base text-emerald-900">Payment Confirmed</h4>
        <p className="text-emerald-700 text-[11px]">
          Paid {formatCurrency(payment.amount)} via {payment.paymentMethod}
        </p>
      </div>

      <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
        <div className="flex justify-between">
          <span className="text-slate-500">Transaction ID:</span>
          <span className="font-mono font-bold text-slate-800">{payment.transactionId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Invoice Ref:</span>
          <span className="font-mono font-semibold text-blue-600">
            {payment.invoiceId?.invoiceNumber || '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Subscriber Code:</span>
          <span className="font-semibold text-slate-800">
            {payment.customerId?.customerCode || '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Date & Timestamp:</span>
          <span className="text-slate-700">{formatDateTime(payment.paidAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Idempotency Key:</span>
          <span className="font-mono text-[10px] text-slate-600">
            {payment.idempotencyKey || 'IDEMP-VERIFIED'}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
          Print Receipt
        </Button>
        <Button variant="primary" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default PaymentReceipt;
