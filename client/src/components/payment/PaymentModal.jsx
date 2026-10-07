import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { paymentApi } from '../../services/paymentApi';
import { formatCurrency } from '../../utils/formatters';
import {
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock,
  ArrowRight,
} from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, invoice, onPaymentSuccess }) => {
  const [method, setMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  // Form states
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('742');

  if (!invoice) return null;

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Idempotency key generated per payment attempt
      const idempotencyKey = `PAY-${invoice._id}-${Date.now()}`;

      const res = await paymentApi.makePayment(
        {
          invoiceId: invoice._id,
          amount: invoice.totalAmount,
          paymentMethod: method === 'UPI' ? 'UPI' : method === 'CARD' ? 'CREDIT_CARD' : 'NET_BANKING',
          idempotencyKey,
        },
        idempotencyKey
      );

      if (res.success) {
        setSuccessResult(res);
        if (onPaymentSuccess) {
          onPaymentSuccess(res);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setError('');
    setSuccessResult(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={successResult ? 'Payment Confirmed' : 'Checkout & Payment Gateway'}
      subtitle={
        successResult
          ? 'Transaction recorded with authoritative backend verification'
          : `Settling Invoice #${invoice.invoiceNumber}`
      }
    >
      {successResult ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h4 className="text-xl font-bold text-slate-900">
              {formatCurrency(invoice.totalAmount)} Paid Successfully
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Your telecom invoice has been cleared. Invoice status updated to PAID.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction ID:</span>
              <span className="font-mono font-semibold text-slate-800">
                {successResult.payment?.transactionId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice:</span>
              <span className="font-semibold text-slate-800">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Channel:</span>
              <span className="font-semibold text-slate-800">{method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Idempotency Status:</span>
              <span className="text-emerald-700 font-medium">Verified & Sealed</span>
            </div>
          </div>

          <Button variant="primary" className="w-full mt-4" onClick={handleModalClose}>
            Done & Return
          </Button>
        </div>
      ) : (
        <form onSubmit={handlePay} className="space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Summary */}
          <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Payable Balance</span>
              <p className="text-xs font-semibold text-slate-800">{invoice.invoiceNumber} ({invoice.billingPeriod})</p>
            </div>
            <span className="text-2xl font-black text-blue-600">
              {formatCurrency(invoice.totalAmount)}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('UPI')}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  method === 'UPI'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-600/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-5 h-5 text-blue-600" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('CARD')}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  method === 'CARD'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-600/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span>Debit / Card</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('NETBANKING')}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  method === 'NETBANKING'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-600/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building className="w-5 h-5 text-amber-600" />
                <span>Net Banking</span>
              </button>
            </div>
          </div>

          {/* Method Fields */}
          {method === 'UPI' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700">Virtual Payment Address (VPA)</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@okhdfcbank"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, or BHIM UPI ID supported.</p>
            </div>
          )}

          {method === 'CARD' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Expiry</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">CVV</label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'NETBANKING' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Select Bank</label>
              <select className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>State Bank of India (SBI)</option>
                <option>Axis Bank</option>
              </select>
            </div>
          )}

          {/* Security Note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
            <Lock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>256-bit encrypted SSL sandbox with Idempotent transaction verification.</span>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="secondary" onClick={handleModalClose} className="w-1/3">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={ArrowRight}
              className="w-2/3"
            >
              Pay {formatCurrency(invoice.totalAmount)}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default PaymentModal;
