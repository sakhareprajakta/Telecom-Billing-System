import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import Button from '../common/Button';
import { Check, Zap, Wifi, MessageSquare, PhoneCall } from 'lucide-react';

const PlanCard = ({ plan, isCurrent = false, onSubscribe, loading = false }) => {
  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden p-6 ${
        isCurrent
          ? 'border-blue-500 bg-blue-50/20 shadow-md ring-2 ring-blue-500/20'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {isCurrent && (
        <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider shadow-xs">
          Active Plan
        </div>
      )}

      <div>
        <div className="mb-4">
          <span className="text-xs uppercase font-bold tracking-wider text-blue-600">
            {plan.planCode}
          </span>
          <h3 className="text-xl font-bold text-slate-800 mt-1">{plan.name}</h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{plan.description}</p>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-1 my-5 pb-5 border-b border-slate-100">
          <span className="text-3xl font-extrabold text-slate-900">
            {formatCurrency(plan.monthlyPrice)}
          </span>
          <span className="text-xs text-slate-500 font-medium">/ billing cycle</span>
        </div>

        {/* Core Quotas */}
        <ul className="space-y-3 text-xs text-slate-600 mb-6">
          <li className="flex items-center gap-2.5">
            <div className="p-1 rounded bg-blue-50 text-blue-600">
              <Wifi className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong className="text-slate-800 font-semibold">{plan.includedData} GB</strong> High-Speed Data
              <span className="text-[11px] text-slate-400 block">
                Overage @ {formatCurrency(plan.dataOverageRate)}/GB
              </span>
            </span>
          </li>

          <li className="flex items-center gap-2.5">
            <div className="p-1 rounded bg-indigo-50 text-indigo-600">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium text-slate-800">{plan.callPolicy}</span>
          </li>

          <li className="flex items-center gap-2.5">
            <div className="p-1 rounded bg-emerald-50 text-emerald-600">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong className="text-slate-800 font-semibold">{plan.includedSms}</strong> SMS included
            </span>
          </li>

          <li className="flex items-center gap-2.5">
            <div className="p-1 rounded bg-amber-50 text-amber-600">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="text-slate-700">{plan.speed}</span>
          </li>
        </ul>
      </div>

      <div>
        {isCurrent ? (
          <Button variant="secondary" disabled className="w-full">
            Currently Subscribed
          </Button>
        ) : onSubscribe ? (
          <Button
            variant="primary"
            loading={loading}
            onClick={() => onSubscribe(plan)}
            className="w-full"
          >
            Select Plan
          </Button>
        ) : (
          <div className="w-full py-2 px-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold text-center border border-slate-200">
            Available 5G Offering
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanCard;
