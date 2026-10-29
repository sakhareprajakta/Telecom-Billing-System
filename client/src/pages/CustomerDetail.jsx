import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerApi } from '../services/customerApi';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { formatCurrency, formatDate, getStatusBadgeColor } from '../utils/formatters';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Layers,
  FileText,
  Activity,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

const CustomerDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await customerApi.getCustomerById(id);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Customer profile not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  if (loading) {
    return <Loader message="Loading customer 360° profile..." />;
  }

  if (error || !data) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Customer Not Found</h3>
        <p className="text-xs text-slate-500">{error || `No subscriber with ID/Code '${id}' exists.`}</p>
        <Link to="/customers">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back to Customers Directory
          </Button>
        </Link>
      </div>
    );
  }

  const { customer, subscription, invoices, recentUsage } = data;

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link to="/customers" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Customers Directory
        </Link>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadgeColor(
            customer.accountStatus
          )}`}
        >
          {customer.accountStatus}
        </span>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {customer.userId?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600 font-mono">
              {customer.customerCode}
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {customer.userId?.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Telecom Subscriber Since {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/70">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>{customer.userId?.email}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/70">
            <Phone className="w-4 h-4 text-slate-400" />
            <span className="font-mono">{customer.phone}</span>
          </div>
        </div>
      </div>

      {/* Address & Subscription Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Address Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Registered Service Address
          </h3>
          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">{customer.address?.street || '42 MG Road'}</p>
            <p>{customer.address?.city}, {customer.address?.state}</p>
            <p>Postal Code: <span className="font-mono">{customer.address?.pincode}</span></p>
          </div>
        </div>

        {/* Active Plan Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Active Tariff Subscription
          </h3>
          {subscription?.planId ? (
            <div className="text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-sm">{subscription.planId.name}</span>
                <span className="font-black text-blue-600 text-base">{formatCurrency(subscription.planId.monthlyPrice)}/mo</span>
              </div>
              <p>Data Allowance: <strong className="text-slate-800">{subscription.planId.includedData} GB</strong></p>
              <p>Call Policy: {subscription.planId.callPolicy}</p>
              <p>Excess Data Rate: {formatCurrency(subscription.planId.dataOverageRate)}/GB</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No active plan assigned to this subscriber.</p>
          )}
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          Subscriber Billing History
        </h3>

        {invoices?.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No invoices generated for this customer.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Base</th>
                  <th className="py-2.5 px-3">Overage</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{inv.invoiceNumber}</td>
                    <td className="py-2.5 px-3">{inv.billingPeriod}</td>
                    <td className="py-2.5 px-3">{formatCurrency(inv.baseAmount)}</td>
                    <td className="py-2.5 px-3">{formatCurrency(inv.usageAmount)}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                    <td className="py-2.5 px-3 text-slate-500">{formatDate(inv.dueDate)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusBadgeColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link to={`/invoices/${inv._id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
