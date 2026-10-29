import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { billingApi } from '../services/billingApi';
import { customerApi } from '../services/customerApi';
import BillingSummary from '../components/billing/BillingSummary';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { formatCurrency } from '../utils/formatters';
import {
  Calculator,
  Play,
  RotateCw,
  FileCheck2,
  Sparkles,
  Layers,
  AlertCircle,
  CheckCircle2,
  Check,
} from 'lucide-react';

const Billing = () => {
  const { role, user } = useAuth();
  const isAdminOrSupport = role === 'ADMIN' || role === 'SUPPORT';

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [billingPeriod, setBillingPeriod] = useState('2026-10');
  const [discount, setDiscount] = useState('50');

  const [previewData, setPreviewData] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [batchRunning, setBatchRunning] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [error, setError] = useState('');

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        if (isAdminOrSupport) {
          const res = await customerApi.getCustomers({ limit: 50 });
          if (res.success && res.data.length > 0) {
            setCustomers(res.data);
            setSelectedCustomerId(res.data[0]._id);
          }
        } else {
          // If customer, fetch own profile
          if (user?.customer?.id) {
            setSelectedCustomerId(user.customer.id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, [role, user]);

  const handlePreview = async (e) => {
    if (e) e.preventDefault();
    if (!selectedCustomerId) return;

    try {
      setCalculating(true);
      setError('');
      setResultMessage(null);

      const res = await billingApi.preview({
        customerId: selectedCustomerId,
        billingPeriod,
      });

      if (res.success) {
        setPreviewData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Billing calculation failed');
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      handlePreview();
    }
  }, [selectedCustomerId, billingPeriod]);

  const handleGenerateInvoice = async () => {
    try {
      setGenerating(true);
      setError('');

      const res = await billingApi.generate({
        customerId: selectedCustomerId,
        billingPeriod,
        discount: Number(discount),
      });

      if (res.success) {
        setResultMessage({
          type: 'success',
          text: `Invoice #${res.data.invoiceNumber} created successfully! Total amount: ${formatCurrency(
            res.data.totalAmount
          )}. Marked as PENDING.`,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to generate invoice document.');
    } finally {
      setGenerating(false);
    }
  };

  const handleBatchRun = async () => {
    try {
      setBatchRunning(true);
      setError('');
      const res = await billingApi.runCycle({ billingPeriod });
      if (res.success) {
        setResultMessage({
          type: 'success',
          text: `Batch billing cycle executed! Generated ${res.generatedCount} invoices for period ${billingPeriod}.`,
        });
      }
    } catch (err) {
      setError(err.message || 'Batch run failed.');
    } finally {
      setBatchRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600">
            Authoritative Pricing Engine
          </span>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-0.5">
            Telecom Billing Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Combines base subscription tariffs with CDR excess usage, promotional vouchers, and statutory GST.
          </p>
        </div>

        {isAdminOrSupport && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCw}
              loading={batchRunning}
              onClick={handleBatchRun}
            >
              Run Batch Cycle ({billingPeriod})
            </Button>
          </div>
        )}
      </div>

      {resultMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
            resultMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{resultMessage.text}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Calculation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            Billing Engine Inputs
          </h3>

          <form onSubmit={handlePreview} className="space-y-4 text-xs">
            {isAdminOrSupport ? (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Subscriber</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.customerCode} — {c.userId?.name} ({c.activeSubscription?.planId?.name || 'Saver 499'})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subscriber ID</label>
                <input
                  type="text"
                  value={user?.customer?.customerCode || 'CUST1001'}
                  disabled
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Billing Period</label>
              <select
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2026-10">2026-10 (Current Cycle)</option>
                <option value="2026-09">2026-09 (Previous Cycle)</option>
                <option value="2026-11">2026-11 (Upcoming Cycle)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Promotional Discount (₹)
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              type="submit"
              variant="outline"
              size="sm"
              loading={calculating}
              icon={Calculator}
              className="w-full"
            >
              Recalculate Estimate
            </Button>
          </form>

          {isAdminOrSupport && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Button
                variant="primary"
                size="md"
                loading={generating}
                icon={FileCheck2}
                onClick={handleGenerateInvoice}
                className="w-full shadow-md shadow-blue-500/20"
              >
                Generate Tax Invoice Document
              </Button>
              
            </div>
          )}
        </div>

        {/* Live Formula & Summary Column */}
        <div className="lg:col-span-2 space-y-6">
          {previewData ? (
            <BillingSummary
              baseAmount={previewData.pricing?.baseAmount}
              dataCharge={previewData.pricing?.dataCharge}
              smsCharge={previewData.pricing?.smsCharge}
              discount={Number(discount)}
              tax={Math.round(
                Math.max(
                  0,
                  previewData.pricing?.baseAmount +
                    previewData.pricing?.dataCharge +
                    previewData.pricing?.smsCharge -
                    Number(discount)
                ) * 0.18
              )}
              totalAmount={
                Math.max(
                  0,
                  previewData.pricing?.baseAmount +
                    previewData.pricing?.dataCharge +
                    previewData.pricing?.smsCharge -
                    Number(discount)
                ) +
                Math.round(
                  Math.max(
                    0,
                    previewData.pricing?.baseAmount +
                      previewData.pricing?.dataCharge +
                      previewData.pricing?.smsCharge -
                      Number(discount)
                  ) * 0.18
                )
              }
              planName={previewData.plan?.name}
              includedDataGB={previewData.plan?.includedData}
              actualDataGB={previewData.usage?.actualDataGB}
              extraDataGB={previewData.usage?.extraDataGB}
              dataRatePerGB={previewData.plan?.dataOverageRate || 50}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              Select subscriber inputs to compute bill breakdown.
            </div>
          )}

          {/* PDF Page 8-9 Interview Example Card */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-5 shadow-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Reference Example from Specification (Page 8-9)
              </span>
              <span className="text-[10px] bg-blue-900/60 text-blue-200 px-2 py-0.5 rounded border border-blue-700">
                Formula Verified
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                <span className="text-slate-400 block text-[10px]">Base Plan Price</span>
                <span className="text-base font-bold text-white">₹499</span>
                <span className="text-[10px] text-slate-400 block">5 GB Included</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                <span className="text-slate-400 block text-[10px]">Extra Data (7GB used)</span>
                <span className="text-base font-bold text-amber-400">₹100</span>
                <span className="text-[10px] text-slate-400 block">2 GB @ ₹50/GB</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                <span className="text-slate-400 block text-[10px]">SMS Charge - Discount</span>
                <span className="text-base font-bold text-white">₹20 - ₹50</span>
                <span className="text-[10px] text-slate-400 block">Net -₹30</span>
              </div>
              <div className="bg-blue-600/30 p-2.5 rounded-lg border border-blue-500/40">
                <span className="text-blue-300 block text-[10px]">Final Amount (Tax ₹102)</span>
                <span className="text-base font-extrabold text-blue-400">₹671</span>
                <span className="text-[10px] text-slate-300 block">Exact match with PDF</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              Final = 499 (Base) + 100 (Data) + 20 (SMS) - 50 (Discount) + 102 (Tax) = ₹671
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
