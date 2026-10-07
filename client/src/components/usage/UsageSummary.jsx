import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Wifi, PhoneCall, MessageSquare, AlertTriangle } from 'lucide-react';

const UsageSummary = ({
  dataUsed = 0,
  dataLimit = 5,
  voiceUsed = 0,
  smsUsed = 0,
  smsLimit = 100,
  overageRate = 50,
}) => {
  const dataPercentage = Math.min(100, Math.round((dataUsed / (dataLimit || 1)) * 100));
  const isOverData = dataUsed > dataLimit;
  const extraData = Math.max(0, dataUsed - dataLimit);
  const extraDataCost = extraData * overageRate;

  const smsPercentage = Math.min(100, Math.round((smsUsed / (smsLimit || 1)) * 100));
  const isOverSms = smsUsed > smsLimit;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 5G Data Usage Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Data Consumption</h4>
              <p className="text-[11px] text-slate-500">4G/5G Network</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700">{dataPercentage}%</span>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-1.5 text-xs">
            <span className="font-extrabold text-slate-900 text-lg">
              {dataUsed} <span className="text-xs font-normal text-slate-500">GB</span>
            </span>
            <span className="text-slate-500 font-medium">Limit: {dataLimit} GB</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverData ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, dataPercentage)}%` }}
            />
          </div>
        </div>

        {isOverData && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              Exceeded by {extraData.toFixed(1)} GB (+{formatCurrency(extraDataCost)})
            </span>
          </div>
        )}
      </div>

      {/* Voice Minutes Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Voice Calling</h4>
              <p className="text-[11px] text-slate-500">Local & National VoLTE</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Unlimited
          </span>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-1.5 text-xs">
            <span className="font-extrabold text-slate-900 text-lg">
              {voiceUsed} <span className="text-xs font-normal text-slate-500">Mins</span>
            </span>
            <span className="text-slate-500 font-medium">Fair Usage Cap: ∞</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '45%' }} />
          </div>
        </div>

        <p className="text-[11px] text-slate-500">HD voice over LTE enabled at no extra charge.</p>
      </div>

      {/* SMS Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">SMS Outgoing</h4>
              <p className="text-[11px] text-slate-500">National & Banking OTPs</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700">{smsPercentage}%</span>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-1.5 text-xs">
            <span className="font-extrabold text-slate-900 text-lg">
              {smsUsed} <span className="text-xs font-normal text-slate-500">SMS</span>
            </span>
            <span className="text-slate-500 font-medium">Limit: {smsLimit}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverSms ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, smsPercentage)}%` }}
            />
          </div>
        </div>

        {isOverSms ? (
          <p className="text-[11px] text-amber-700 font-medium">
            Over bundle limit: {smsUsed - smsLimit} extra SMS
          </p>
        ) : (
          <p className="text-[11px] text-slate-500">
            {Math.max(0, smsLimit - smsUsed)} SMS remaining in monthly cycle.
          </p>
        )}
      </div>
    </div>
  );
};

export default UsageSummary;
