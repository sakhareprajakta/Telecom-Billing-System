import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { reportApi } from '../services/reportApi';
import { invoiceApi } from '../services/invoiceApi';
import StatCard from '../components/common/StatCard';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import UsageSummary from '../components/usage/UsageSummary';
import PaymentModal from '../components/payment/PaymentModal';
import InvoiceDetails from '../components/billing/InvoiceDetails';
import Modal from '../components/common/Modal';
import { formatCurrency, formatDate, getStatusBadgeColor } from '../utils/formatters';
import {
  Users,
  CreditCard,
  FileText,
  Activity,
  Layers,
  ArrowUpRight,
  Calculator,
  AlertCircle,
  CheckCircle,
  Wifi,
  Sparkles,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

const Dashboard = () => {
  const { user, role } = useAuth();
  const isCustomer = role === 'CUSTOMER';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Modals
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState(null);
  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await reportApi.getDashboardStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  const handlePaymentSuccess = () => {
    fetchDashboardData();
  };

  if (loading) {
    return <Loader message="Loading telecom system dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className={`text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md border ${
            role === 'ADMIN'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : role === 'SUPPORT'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {role === 'ADMIN' && 'Telecom Operator Executive Console'}
            {role === 'SUPPORT' && 'Customer Support & Helpdesk'}
            {role === 'CUSTOMER' && 'Customer Self-Care Portal'}
          </span>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isCustomer
              ? `Account Code: ${data?.customer?.customerCode || 'CUST1001'} • 5G Network Active`
              : role === 'SUPPORT'
              ? 'Customer Service Queue, SIM Account Status & Subscriber Resolution'
              : 'Enterprise Telecom Billing Engine, Telemetry & Revenue Operations'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchDashboardData}>
            Refresh
          </Button>
          {role === 'ADMIN' && (
            <Link to="/billing">
              <Button variant="primary" size="sm" icon={Calculator}>
                Run Billing Engine
              </Button>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CUSTOMER PORTAL VIEW */}
      {isCustomer ? (
        <div className="space-y-6">
          {/* Outstanding Bill Alert if pending */}
          {data?.outstandingAmount > 0 && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
                  Action Required
                </span>
                <h3 className="text-xl font-black">
                  Outstanding Bill: {formatCurrency(data.outstandingAmount)}
                </h3>
                <p className="text-xs text-amber-100">
                  You have {data.pendingInvoicesCount} pending invoice(s). Settle now to maintain uninterrupted high-speed service.
                </p>
              </div>

              {data.recentInvoices?.[0]?.status === 'PENDING' && (
                <Button
                  variant="secondary"
                  className="bg-white text-slate-900 hover:bg-amber-50 shadow-sm"
                  icon={CreditCard}
                  onClick={() => setSelectedInvoiceForPay(data.recentInvoices[0])}
                >
                  Pay Bill Now ({formatCurrency(data.recentInvoices[0].totalAmount)})
                </Button>
              )}
            </div>
          )}

          {/* Active Subscription & Plan Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Current Plan</h3>
                    <p className="text-xs text-slate-500">
                      {data?.activeSubscription?.planId?.name || 'Standard Saver 499'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {data?.activeSubscription?.status || 'ACTIVE'}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Monthly Plan Rental:</span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(data?.activeSubscription?.planId?.monthlyPrice || 499)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bundled High-Speed Data:</span>
                  <span className="font-bold text-slate-800">
                    {data?.activeSubscription?.planId?.includedData || 5} GB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Excess Data Rate:</span>
                  <span className="font-semibold text-slate-700">
                    {formatCurrency(data?.activeSubscription?.planId?.dataOverageRate || 50)}/GB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Speed Tier:</span>
                  <span className="font-semibold text-slate-700">
                    {data?.activeSubscription?.planId?.speed || '5G Ultra Speed'}
                  </span>
                </div>
              </div>

              <Link to="/subscriptions" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  Upgrade / Change Plan
                </Button>
              </Link>
            </div>

            {/* Usage Summary */}
            <div className="lg:col-span-2">
              <UsageSummary
                dataUsed={data?.usageStats?.data || 7.0}
                dataLimit={data?.activeSubscription?.planId?.includedData || 5}
                voiceUsed={data?.usageStats?.voice || 420}
                smsUsed={data?.usageStats?.sms || 120}
                smsLimit={data?.activeSubscription?.planId?.includedSms || 100}
                overageRate={data?.activeSubscription?.planId?.dataOverageRate || 50}
              />
            </div>
          </div>

          {/* Recent Invoices List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Recent Invoices</h3>
              <Link to="/invoices" className="text-xs text-blue-600 font-semibold hover:underline">
                View All Invoices →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Invoice Number</th>
                    <th className="py-2.5 px-3">Billing Cycle</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.recentInvoices?.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-semibold text-blue-600">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{inv.billingPeriod}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{formatDate(inv.dueDate)}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusBadgeColor(
                            inv.status
                          )}`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInvoiceDetail(inv)}
                        >
                          Details
                        </Button>
                        {inv.status === 'PENDING' && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={CreditCard}
                            onClick={() => setSelectedInvoiceForPay(inv)}
                          >
                            Pay
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : role === 'SUPPORT' ? (
        /* CUSTOMER SUPPORT DESK DASHBOARD */
        <div className="space-y-6">
          {/* Support Desk Metrics - NO Company Total Revenue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Managed Subscribers"
              value={data?.totalCustomers || 0}
              subtext="Registered customer accounts"
              icon={Users}
              color="indigo"
            />
            <StatCard
              title="Active Lines / SIMs"
              value={data?.activeSubscriptionsCount || 0}
              subtext="Operational 5G subscriptions"
              icon={Activity}
              color="emerald"
            />
            <StatCard
              title="Suspended Accounts"
              value={data?.suspendedCustomersCount || 0}
              subtext="Flagged / pending verification"
              icon={AlertCircle}
              color="rose"
            />
            <StatCard
              title="Unpaid Customer Invoices"
              value={data?.pendingInvoicesCount || 0}
              subtext="Invoices pending payment"
              icon={FileText}
              color="amber"
            />
          </div>

          {/* Support Middle Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">
                  Network Usage Telemetry (For Customer Inquiries)
                </h3>
                <Link to="/usage" className="text-xs text-blue-600 font-semibold hover:underline">
                  View CDR Feed →
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl text-center">
                  <span className="text-xs text-blue-600 font-semibold uppercase">5G / 4G Data</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {data?.usageBreakdown?.find((u) => u._id === 'DATA')?.totalQuantity?.toFixed(1) || '32.5'}{' '}
                    <span className="text-xs font-normal text-slate-500">GB</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Active data traffic</p>
                </div>

                <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl text-center">
                  <span className="text-xs text-indigo-600 font-semibold uppercase">Voice Calls</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {data?.usageBreakdown?.find((u) => u._id === 'VOICE')?.totalQuantity || '635'}{' '}
                    <span className="text-xs font-normal text-slate-500">Mins</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">VoLTE minutes</p>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl text-center">
                  <span className="text-xs text-emerald-600 font-semibold uppercase">SMS Traffic</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {data?.usageBreakdown?.find((u) => u._id === 'SMS')?.totalQuantity || '120'}{' '}
                    <span className="text-xs font-normal text-slate-500">SMS</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">SMS count</p>
                </div>
              </div>
            </div>

            {/* Support Quick Actions Panel - NO Billing Engine */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
                Support Quick Actions
              </h3>

              <div className="space-y-2">
                <Link to="/customers" className="block">
                  <div className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Customer Directory & Lookup
                      </span>
                      <span className="text-[11px] text-slate-500">
                        View 360° profile, change account status
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>

                <Link to="/usage" className="block">
                  <div className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Subscriber CDR Usage Lookup
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Investigate data and voice event logs
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>

                <Link to="/invoices" className="block">
                  <div className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Verify Customer Invoices
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Check payment status & breakdown
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>

                <Link to="/subscriptions" className="block">
                  <div className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        5G Tariff Catalog Reference
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Browse active plans to advise customers
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Recent Invoices & Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Customer Invoices</h3>
                <Link to="/invoices" className="text-xs text-blue-600 font-semibold hover:underline">
                  All Invoices →
                </Link>
              </div>
              <div className="space-y-2">
                {data?.recentInvoices?.map((inv) => (
                  <div
                    key={inv._id}
                    onClick={() => setSelectedInvoiceDetail(inv)}
                    className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-blue-600">{inv.invoiceNumber}</span>
                      <span className="text-slate-500 ml-2">
                        {inv.customerId?.customerCode || 'CUST'} ({inv.billingPeriod})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{formatCurrency(inv.totalAmount)}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusBadgeColor(
                          inv.status
                        )}`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Recent Customer Payments</h3>
                <Link to="/payments" className="text-xs text-blue-600 font-semibold hover:underline">
                  All Payments →
                </Link>
              </div>
              <div className="space-y-2">
                {data?.recentPayments?.map((p) => (
                  <div
                    key={p._id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 font-mono">{p.transactionId}</span>
                      <p className="text-[11px] text-slate-500">
                        {p.customerId?.customerCode} • {p.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600">{formatCurrency(p.amount)}</span>
                      <span className="text-[10px] text-slate-400 block">{formatDate(p.paidAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ADMIN EXECUTIVE DASHBOARD */
        <div className="space-y-6">
          {/* Key Metric Stat Cards - Includes Total Revenue & Receivables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Billed Revenue"
              value={formatCurrency(data?.totalRevenue || 0)}
              subtext="Settled through payment gateway"
              icon={CreditCard}
              color="emerald"
            />
            <StatCard
              title="Outstanding Receivables"
              value={formatCurrency(data?.outstandingAmount || 0)}
              subtext={`${data?.pendingInvoicesCount || 0} unpaid invoices`}
              icon={FileText}
              color="amber"
            />
            <StatCard
              title="Active Subscribers"
              value={data?.activeSubscriptionsCount || 0}
              subtext="Active customer SIM subscriptions"
              icon={Activity}
              color="blue"
            />
            <StatCard
              title="Total Customer Accounts"
              value={data?.totalCustomers || 0}
              subtext="Registered customer profiles"
              icon={Users}
              color="indigo"
            />
          </div>

          {/* Mid Section: Telemetry Breakdown & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Telecom Usage Traffic */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">
                  Network Usage Breakdown (CDR Aggregation)
                </h3>
                <Link to="/usage" className="text-xs text-blue-600 font-semibold hover:underline">
                  View CDR Feed →
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl text-center">
                  <span className="text-xs text-blue-600 font-semibold uppercase">5G / 4G Data</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {data?.usageBreakdown?.find((u) => u._id === 'DATA')?.totalQuantity?.toFixed(1) || '32.5'}{' '}
                    <span className="text-xs font-normal text-slate-500">GB</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Active data sessions</p>
                </div>

                <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl text-center">
                  <span className="text-xs text-indigo-600 font-semibold uppercase">Voice Calls</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {data?.usageBreakdown?.find((u) => u._id === 'VOICE')?.totalQuantity || '635'}{' '}
                    <span className="text-xs font-normal text-slate-500">Mins</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">VoLTE network minutes</p>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl text-center">
                  <span className="text-xs text-emerald-600 font-semibold uppercase">SMS Traffic</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {data?.usageBreakdown?.find((u) => u._id === 'SMS')?.totalQuantity || '120'}{' '}
                    <span className="text-xs font-normal text-slate-500">SMS</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Total messages sent</p>
                </div>
              </div>
            </div>

            {/* Admin Quick Actions Panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
                Operator Executive Actions
              </h3>

              <div className="space-y-2">
                <Link to="/billing" className="block">
                  <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/30 hover:border-purple-400 hover:bg-purple-50/60 transition-all flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-purple-950 block">
                        Billing Engine Calculator
                      </span>
                      <span className="text-[11px] text-purple-700">
                        Batch cycles & invoice generation
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-purple-600" />
                  </div>
                </Link>

                <Link to="/usage" className="block">
                  <div className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Ingest Telecom CDR
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Simulate CDR call/data record
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>

                <Link to="/subscriptions" className="block">
                  <div className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Plans & Tariff Catalog
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Configure data quotas & rates
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>

                <Link to="/customers" className="block">
                  <div className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Customer Accounts Directory
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Manage all subscribers & account states
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Recent Invoices & Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Invoices */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Generated Invoices</h3>
                <Link to="/invoices" className="text-xs text-blue-600 font-semibold hover:underline">
                  All Invoices →
                </Link>
              </div>
              <div className="space-y-2">
                {data?.recentInvoices?.map((inv) => (
                  <div
                    key={inv._id}
                    onClick={() => setSelectedInvoiceDetail(inv)}
                    className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-blue-600">{inv.invoiceNumber}</span>
                      <span className="text-slate-500 ml-2">
                        {inv.customerId?.customerCode || 'CUST'} ({inv.billingPeriod})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{formatCurrency(inv.totalAmount)}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusBadgeColor(
                          inv.status
                        )}`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Recent Gateway Settlements</h3>
                <Link to="/payments" className="text-xs text-blue-600 font-semibold hover:underline">
                  All Payments →
                </Link>
              </div>
              <div className="space-y-2">
                {data?.recentPayments?.map((p) => (
                  <div
                    key={p._id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 font-mono">{p.transactionId}</span>
                      <p className="text-[11px] text-slate-500">
                        {p.customerId?.customerCode} • {p.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600">{formatCurrency(p.amount)}</span>
                      <span className="text-[10px] text-slate-400 block">{formatDate(p.paidAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={!!selectedInvoiceForPay}
        onClose={() => setSelectedInvoiceForPay(null)}
        invoice={selectedInvoiceForPay}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Invoice Details Modal */}
      <Modal
        isOpen={!!selectedInvoiceDetail}
        onClose={() => setSelectedInvoiceDetail(null)}
        title="Invoice Details"
        subtitle="Telecom Operator Billing Statement"
      >
        <InvoiceDetails
          invoice={selectedInvoiceDetail}
          onPayNow={(inv) => {
            setSelectedInvoiceDetail(null);
            setSelectedInvoiceForPay(inv);
          }}
          onClose={() => setSelectedInvoiceDetail(null)}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
