import React from 'react';
import InvoiceRow from './InvoiceRow';
import { ChevronLeft, ChevronRight, Inbox, Loader2 } from 'lucide-react';

const InvoiceTable = ({
  invoices = [],
  loading = false,
  pagination = null,
  onPageChange = () => {},
  onSelectDetail,
  onPayNow,
  userName = '',
}) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto min-h-[220px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-20">
            <div className="flex items-center gap-2 text-blue-600 bg-white px-4 py-2.5 rounded-full shadow-md border border-slate-100 text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading invoices...
            </div>
          </div>
        )}

        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200/70 bg-slate-50/75 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <th className="py-3.5 px-4">Invoice #</th>
              <th className="py-3.5 px-4">Subscriber</th>
              <th className="py-3.5 px-4">Cycle</th>
              <th className="py-3.5 px-4">Base Rate</th>
              <th className="py-3.5 px-4">Overage</th>
              <th className="py-3.5 px-4">Taxes (18%)</th>
              <th className="py-3.5 px-4">Total Payable</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.length === 0 && !loading ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-8 h-8 stroke-1 text-slate-300" />
                    <p className="text-sm font-normal text-slate-500">No invoices found for selected criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <InvoiceRow
                  key={inv._id}
                  invoice={inv}
                  onSelectDetail={onSelectDetail}
                  onPayNow={onPayNow}
                  userName={userName}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-semibold text-slate-700">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
            <span className="font-semibold text-slate-700">{pagination.total}</span> entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;
