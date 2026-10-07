import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Calculator, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

const BillingSummary = ({
  baseAmount = 0,
  dataCharge = 0,
  smsCharge = 0,
  discount = 0,
  tax = 0,
  totalAmount = 0,
  planName = 'Standard Plan',
  includedDataGB = 0,
  actualDataGB = 0,
  extraDataGB = 0,
  dataRatePerGB = 50,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">Billing Calculation Engine</h4>
            <p className="text-xs text-slate-500">Plan: {planName}</p>
          </div>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
          Authoritative Backend Rate
        </span>
      </div>

      {/* Breakdown List */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-slate-600">
          <span>Base Plan Charge</span>
          <span className="font-semibold text-slate-800">{formatCurrency(baseAmount)}</span>
        </div>

        {extraDataGB > 0 ? (
          <div className="flex items-center justify-between text-slate-600 bg-amber-50/60 p-2 rounded-lg border border-amber-100">
            <div>
              <span className="font-medium text-amber-900">Extra Data Charge</span>
              <p className="text-[10px] text-amber-700">
                {extraDataGB} GB excess @ {formatCurrency(dataRatePerGB)}/GB (Used {actualDataGB} GB of {includedDataGB} GB)
              </p>
            </div>
            <span className="font-bold text-amber-900">{formatCurrency(dataCharge)}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-slate-500">
            <span>Extra Data Charge ({actualDataGB} GB used of {includedDataGB} GB)</span>
            <span>{formatCurrency(0)}</span>
          </div>
        )}

        {smsCharge > 0 && (
          <div className="flex items-center justify-between text-slate-600">
            <span>Extra SMS Charges</span>
            <span className="font-semibold text-slate-800">{formatCurrency(smsCharge)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex items-center justify-between text-emerald-600 font-medium">
            <span>Promotional Discount / Voucher</span>
            <span>- {formatCurrency(discount)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-600">
          <span>Taxes & Regulatory Surcharge (GST 18%)</span>
          <span className="font-semibold text-slate-800">{formatCurrency(tax)}</span>
        </div>
      </div>

      {/* Final Total Box (PDF Page 8-9) */}
      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between bg-slate-50 p-3 rounded-xl">
        <div>
          <span className="text-xs font-semibold uppercase text-slate-500">Total Payable Amount</span>
          <p className="text-[10px] text-slate-400">Formula: Base + Data + SMS - Discount + Tax</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-extrabold text-blue-600">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};

export default BillingSummary;
