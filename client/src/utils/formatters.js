// Currency, date, and status formatter utilities

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusBadgeColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'PAID':
    case 'ACTIVE':
    case 'SUCCESS':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
    case 'OVERDUE':
    case 'FAILED':
    case 'SUSPENDED':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';
    case 'CANCELLED':
    case 'ARCHIVED':
    case 'INACTIVE':
      return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20';
  }
};
