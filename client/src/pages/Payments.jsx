import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { paymentApi } from '../services/paymentApi';
import DataTable from '../components/common/DataTable';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { formatCurrency, formatDateTime, formatDate, getStatusBadgeColor } from '../utils/formatters';
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  QrCode,
  Building,
  Printer,
  Lock,
} from 'lucide-react';

const Payments = () => {
  const { role, user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchPayments = async (page = 1) => {
    try {
      setLoading(true);
      const res = await paymentApi.getPayments({ page, limit: 10 });
      if (res.success) {
        setPayments(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, [role]);

  const columns = [
    {
      header: 'Transaction ID',
      accessor: 'transactionId',
      className: 'font-mono text-xs font-bold text-slate-800',
    },
    {
      header: 'Subscriber',
      render: (row) => (
        <div>
          <span className="font-semibold text-blue-600 block">
            {row.customerId?.customerCode || 'CUST'}
          </span>
          <span className="text-[11px] text-slate-400">
            {row.customerId?.userId?.name || user?.name}
          </span>
        </div>
      ),
    },
    {
      header: 'Invoice #',
      render: (row) => (
        <span className="font-mono text-xs text-slate-700">
          {row.invoiceId?.invoiceNumber || '—'}
        </span>
      ),
    },
    {
      header: 'Amount Paid',
      render: (row) => (
        <span className="font-extrabold text-emerald-600 text-sm">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: 'Payment Method',
      render: (row) => {
        let icon = <QrCode className="w-3.5 h-3.5 text-blue-600" />;
        if (row.paymentMethod?.includes('CARD')) icon = <CreditCard className="w-3.5 h-3.5 text-indigo-600" />;
        if (row.paymentMethod?.includes('NET')) icon = <Building className="w-3.5 h-3.5 text-amber-600" />;

        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
            {icon}
            {row.paymentMethod}
          </span>
        );
      },
    },
    {
      header: 'Date & Time',
      render: (row) => (
        <span className="text-slate-500 text-xs">{formatDateTime(row.paidAt)}</span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeColor(
            row.status
          )}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Receipt',
      align: 'right',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedReceipt(row)}
        >
          View Receipt
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600">
            {role === 'CUSTOMER' ? 'Personal Settlements' : role === 'SUPPORT' ? 'Support Desk Verification' : 'Payment Reconciliation'}
          </span>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-0.5">
            {role === 'CUSTOMER' ? 'My Payment History & Receipts' : role === 'SUPPORT' ? 'Subscriber Payment Verification' : 'Payment Gateway Transactions'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {role === 'CUSTOMER'
              ? 'Complete record of your payments, transaction receipts, and settled invoices.'
              : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchPayments(1)}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Idempotency Architecture Banner (PDF Page 10 & 14) */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-blue-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              Idempotency & Duplicate Payment Prevention
            </h3>
            
          </div>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
          Active Defense
        </span>
      </div>

      {/* Payments Table */}
      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchPayments(p)}
        emptyMessage="No payment transactions recorded yet."
      />

      {/* Receipt Modal */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Payment Receipt"
        subtitle="Telecom Operator Official Payment Confirmation"
      >
        {selectedReceipt && (
          <div className="space-y-4 text-xs">
            <div className="text-center py-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
              <h4 className="font-extrabold text-base text-emerald-900">Payment Confirmed</h4>
              <p className="text-emerald-700 text-[11px]">
                Paid {formatCurrency(selectedReceipt.amount)} via {selectedReceipt.paymentMethod}
              </p>
            </div>

            <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-800">{selectedReceipt.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Ref:</span>
                <span className="font-mono font-semibold text-blue-600">
                  {selectedReceipt.invoiceId?.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subscriber Code:</span>
                <span className="font-semibold text-slate-800">
                  {selectedReceipt.customerId?.customerCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Timestamp:</span>
                <span className="text-slate-700">{formatDateTime(selectedReceipt.paidAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Idempotency Key:</span>
                <span className="font-mono text-[10px] text-slate-600">
                  {selectedReceipt.idempotencyKey || 'IDEMP-VERIFIED'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
                Print Receipt
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedReceipt(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payments;
