import React from 'react';
import { Phone, Mail, MapPin, Layers } from 'lucide-react';
import { getStatusBadgeColor } from '../../utils/formatters';

const CustomerCard = ({ customer, onSelect }) => {
  if (!customer) return null;

  return (
    <div
      onClick={() => onSelect && onSelect(customer)}
      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600 font-mono">
            {customer.customerCode}
          </span>
          <h4 className="text-base font-bold text-slate-800">{customer.userId?.name || 'Subscriber'}</h4>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeColor(
            customer.accountStatus
          )}`}
        >
          {customer.accountStatus}
        </span>
      </div>

      <div className="text-xs text-slate-600 space-y-1 pt-1">
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">{customer.userId?.email}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono">{customer.phone}</span>
        </div>
        {customer.address?.city && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{customer.address.city}, {customer.address.state}</span>
          </div>
        )}
      </div>

      {customer.activeSubscription?.planId && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Plan:</span>
          <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
            {customer.activeSubscription.planId.name}
          </span>
        </div>
      )}
    </div>
  );
};

export default CustomerCard;
