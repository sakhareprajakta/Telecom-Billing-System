import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { usageApi } from '../services/usageApi';
import DataTable from '../components/common/DataTable';
import Button from '../components/common/Button';
import UsageRecordForm from '../components/usage/UsageRecordForm';
import { formatDateTime, formatDate } from '../utils/formatters';
import {
  Activity,
  Plus,
  Wifi,
  PhoneCall,
  MessageSquare,
  Filter,
  RefreshCw,
  Database,
} from 'lucide-react';

const Usage = () => {
  const { role, user } = useAuth();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [billingPeriod, setBillingPeriod] = useState('2026-10');
  const [summary, setSummary] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);

  const fetchUsageData = async (page = 1) => {
    try {
      setLoading(true);
      const res = await usageApi.getUsage({
        type: type || undefined,
        billingPeriod: billingPeriod || undefined,
        page,
        limit: 10,
      });

      if (res.success) {
        setRecords(res.data);
        setPagination(res.pagination);
        setSummary(res.summary || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData(1);
  }, [type, billingPeriod, role]);

  const columns = [
    {
      header: 'Timestamp',
      render: (row) => (
        <span className="text-slate-600 font-mono text-xs">
          {formatDateTime(row.usageDate)}
        </span>
      ),
    },
    {
      header: 'Subscriber',
      render: (row) => (
        <div>
          <span className="font-semibold text-blue-600 block">
            {row.customerId?.customerCode || 'CUST1001'}
          </span>
          <span className="text-[11px] text-slate-400">{row.customerId?.userId?.name || user?.name}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      render: (row) => {
        let icon = <Wifi className="w-3.5 h-3.5 text-blue-600" />;
        let bg = 'bg-blue-50 text-blue-700 border-blue-200';
        if (row.type === 'VOICE') {
          icon = <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />;
          bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        } else if (row.type === 'SMS') {
          icon = <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
          bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        }

        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg}`}>
            {icon}
            {row.type}
          </span>
        );
      },
    },
    {
      header: 'Quantity',
      render: (row) => (
        <span className="font-bold text-slate-800">
          {row.quantity} <span className="text-xs font-normal text-slate-500">{row.unit}</span>
        </span>
      ),
    },
    {
      header: 'Billing Cycle',
      accessor: 'billingPeriod',
      className: 'font-mono text-xs text-slate-600',
    },
    {
      header: 'Billing Status',
      render: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
            row.isBilled
              ? 'bg-slate-100 text-slate-600 border-slate-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {row.isBilled ? 'Billed' : 'Unbilled CDR'}
        </span>
      ),
    },
  ];

  const totalData = summary.find((s) => s._id === 'DATA')?.totalQuantity || 0;
  const totalVoice = summary.find((s) => s._id === 'VOICE')?.totalQuantity || 0;
  const totalSms = summary.find((s) => s._id === 'SMS')?.totalQuantity || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600">
            CDR Telemetry & Ingestion
          </span>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-0.5">
            Telecom Usage Records
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time Call Detail Records (CDR) indexed by <code className="font-mono text-blue-600">&#123; customerId: 1, usageDate: -1 &#125;</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchUsageData(1)}>
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowLogModal(true)}
          >
            Simulate CDR Event
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Data Logged</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {Number(totalData).toFixed(1)} <span className="text-xs font-normal text-slate-500">GB</span>
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Wifi className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">Voice Minutes Consumed</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {totalVoice} <span className="text-xs font-normal text-slate-500">Mins</span>
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <PhoneCall className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase">SMS Traffic Recorded</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {totalSms} <span className="text-xs font-normal text-slate-500">SMS</span>
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Filter className="w-4 h-4 text-slate-400" /> Filters:
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types (DATA, VOICE, SMS)</option>
            <option value="DATA">DATA only</option>
            <option value="VOICE">VOICE only</option>
            <option value="SMS">SMS only</option>
          </select>

          <select
            value={billingPeriod}
            onChange={(e) => setBillingPeriod(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Periods</option>
            <option value="2026-10">2026-10 (Current Cycle)</option>
            <option value="2026-09">2026-09 (Prior Cycle)</option>
          </select>
        </div>

        <span className="text-slate-400">
          Paginated server query via <code className="text-blue-600 font-mono">Usage.find().skip().limit()</code>
        </span>
      </div>

      {/* Records Table */}
      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchUsageData(p)}
        emptyMessage="No CDR records found for selected filters."
      />

      {/* CDR Ingestion Modal */}
      <UsageRecordForm
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        customerCode={user?.customer?.customerCode || 'CUST1001'}
        onSuccess={() => fetchUsageData(1)}
      />
    </div>
  );
};

export default Usage;
