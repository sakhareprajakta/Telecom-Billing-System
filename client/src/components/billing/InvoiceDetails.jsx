import React from 'react';
import { formatCurrency, formatDate, getStatusBadgeColor } from '../../utils/formatters';
import Button from '../common/Button';
import { CreditCard, Printer, CheckCircle, Clock, FileText } from 'lucide-react';

const InvoiceDetails = ({ invoice, onPayNow, onClose }) => {
  if (!invoice) return null;

  const isPending = invoice.status === 'PENDING';
  const customer = invoice.customerId || {};
  const user = customer.userId || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Invoice Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-blue-600">
            Telecom Tax Invoice
          </span>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {invoice.invoiceNumber}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Billing Period: <span className="font-semibold text-slate-700">{invoice.billingPeriod}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadgeColor(
              invoice.status
            )}`}
          >
            {invoice.status}
          </span>
          <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint}>
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Customer & Telecom Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs text-slate-600 border border-slate-200/60">
        <div>
          <p className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
            Billed To
          </p>
          <p className="font-medium text-slate-800">{user.name || 'Customer'}</p>
          <p>Account Code: {customer.customerCode || '—'}</p>
          <p>Phone: {customer.phone || '—'}</p>
          {customer.address && (
            <p className="text-slate-500 mt-1">
              {customer.address.street}, {customer.address.city}, {customer.address.state} - {customer.address.pincode}
            </p>
          )}
        </div>

        <div className="sm:text-right">
          <p className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
            Operator Info
          </p>
          <p className="font-medium text-slate-800">NexusTel Telecom Corp Ltd.</p>
          <p>GSTIN: 29AABCN8890C1Z4</p>
          <p>Due Date: <span className="font-bold text-slate-900">{formatDate(invoice.dueDate)}</span></p>
          <p>Generated: {formatDate(invoice.generatedDate)}</p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3 text-right">Quota / Usage</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-3 px-3">
                <span className="font-medium text-slate-900">
                  Base Subscription ({invoice.details?.planName || 'Active Plan'})
                </span>
                <p className="text-[11px] text-slate-500">Monthly recurrent voice & data rental</p>
              </td>
              <td className="py-3 px-3 text-right text-slate-600">
                {invoice.details?.includedDataGB || 0} GB Incl.
              </td>
              <td className="py-3 px-3 text-right font-medium text-slate-800">
                {formatCurrency(invoice.baseAmount)}
              </td>
            </tr>

            {invoice.dataCharge > 0 && (
              <tr>
                <td className="py-3 px-3">
                  <span className="font-medium text-slate-900">Excess 5G Data Overage</span>
                  <p className="text-[11px] text-slate-500">
                    {invoice.details?.extraDataGB} GB excess @ {formatCurrency(invoice.details?.dataRatePerGB)}/GB
                  </p>
                </td>
                <td className="py-3 px-3 text-right text-slate-600">
                  {invoice.details?.actualDataGB} GB total
                </td>
                <td className="py-3 px-3 text-right font-medium text-slate-800">
                  {formatCurrency(invoice.dataCharge)}
                </td>
              </tr>
            )}

            {invoice.smsCharge > 0 && (
              <tr>
                <td className="py-3 px-3">
                  <span className="font-medium text-slate-900">SMS Out-of-Bundle Overage</span>
                  <p className="text-[11px] text-slate-500">{invoice.details?.extraSms} excess messages</p>
                </td>
                <td className="py-3 px-3 text-right text-slate-600">
                  {invoice.details?.actualSms} SMS
                </td>
                <td className="py-3 px-3 text-right font-medium text-slate-800">
                  {formatCurrency(invoice.smsCharge)}
                </td>
              </tr>
            )}

            {invoice.discount > 0 && (
              <tr className="bg-emerald-50/40 text-emerald-700">
                <td className="py-2.5 px-3 font-medium">Promotional Discount Applied</td>
                <td className="py-2.5 px-3 text-right">—</td>
                <td className="py-2.5 px-3 text-right font-semibold">- {formatCurrency(invoice.discount)}</td>
              </tr>
            )}

            <tr>
              <td className="py-2.5 px-3 text-slate-600">Taxes (CGST 9% + SGST 9%)</td>
              <td className="py-2.5 px-3 text-right text-slate-500">18%</td>
              <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                {formatCurrency(invoice.tax)}
              </td>
            </tr>
          </tbody>
          <tfoot className="bg-slate-50 border-t border-slate-200">
            <tr>
              <td colSpan={2} className="py-3 px-3 font-bold text-slate-800 text-sm">
                Total Payable Amount
              </td>
              <td className="py-3 px-3 text-right font-black text-blue-600 text-base">
                {formatCurrency(invoice.totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pay Now Call-to-action */}
      {isPending && onPayNow && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-blue-900 text-sm">Invoice is Pending Payment</h4>
            <p className="text-xs text-blue-700">
              Clear this bill now to prevent telecom line throttling or late fees.
            </p>
          </div>
          <Button
            variant="primary"
            icon={CreditCard}
            onClick={() => onPayNow(invoice)}
          >
            Pay Now ({formatCurrency(invoice.totalAmount)})
          </Button>
        </div>
      )}

      {/* Existing payment records if paid */}
      {invoice.payments && invoice.payments.length > 0 && (
        <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900">
          <div className="flex items-center gap-2 font-bold mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Paid in Full</span>
          </div>
          <p>Transaction ID: <span className="font-mono">{invoice.payments[0]?.transactionId}</span></p>
          <p>Method: {invoice.payments[0]?.paymentMethod} • Date: {formatDate(invoice.payments[0]?.paidAt)}</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetails;
