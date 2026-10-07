import React, { useState, useEffect } from 'react';
import { customerApi } from '../services/customerApi';
import DataTable from '../components/common/DataTable';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { formatCurrency, formatDate, getStatusBadgeColor } from '../utils/formatters';
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Layers,
} from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);

  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await customerApi.getCustomers({
        search,
        status: status || undefined,
        page,
        limit: 10,
      });
      if (res.success) {
        setCustomers(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1);
  }, [status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers(1);
  };

  const handleViewCustomer = async (cust) => {
    setSelectedCustomer(cust);
    try {
      setDetailLoading(true);
      const res = await customerApi.getCustomerById(cust._id);
      if (res.success) {
        setCustomerDetails(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleStatus = async (cust) => {
    const newStatus = cust.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await customerApi.updateCustomer(cust._id, { accountStatus: newStatus });
      fetchCustomers(pagination.page);
      if (selectedCustomer && selectedCustomer._id === cust._id) {
        setSelectedCustomer((prev) => ({ ...prev, accountStatus: newStatus }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    {
      header: 'Code',
      accessor: 'customerCode',
      className: 'font-mono font-bold text-blue-600',
    },
    {
      header: 'Customer Name & Email',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 block">{row.userId?.name || 'Customer'}</span>
          <span className="text-xs text-slate-400">{row.userId?.email}</span>
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: 'phone',
      className: 'text-slate-600 font-mono text-xs',
    },
    {
      header: 'Active Plan',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
          <Layers className="w-3 h-3" />
          {row.activeSubscription?.planId?.name || 'No Active Plan'}
        </span>
      ),
    },
    {
      header: 'Account Status',
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeColor(
            row.accountStatus
          )}`}
        >
          {row.accountStatus}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={(e) => {
              e.stopPropagation();
              handleViewCustomer(row);
            }}
          >
            Details
          </Button>
          <Button
            variant={row.accountStatus === 'ACTIVE' ? 'ghost' : 'outline'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(row);
            }}
            className={row.accountStatus === 'ACTIVE' ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600'}
          >
            {row.accountStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600">
            Customer Directory
          </span>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-0.5">
            Subscriber Account Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and manage telecom customer profiles, account statuses, and CDR records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => fetchCustomers(1)}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code, name, phone, or email..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button type="submit" variant="primary" size="sm">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Account Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>
      </div>

      {/* Customers DataTable */}
      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchCustomers(p)}
        onRowClick={(row) => handleViewCustomer(row)}
        emptyMessage="No subscriber records match your filter criteria."
      />

      {/* Customer Details Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => {
          setSelectedCustomer(null);
          setCustomerDetails(null);
        }}
        title={`Customer Profile: ${selectedCustomer?.customerCode}`}
        subtitle="Telecom Account 360° Overview"
        maxWidth="max-w-2xl"
      >
        {detailLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading details...</div>
        ) : (
          <div className="space-y-5 text-xs">
            {/* Identity Banner */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {selectedCustomer?.userId?.name}
                </h4>
                <div className="flex items-center gap-3 text-slate-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {selectedCustomer?.userId?.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedCustomer?.phone}
                  </span>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getStatusBadgeColor(
                  selectedCustomer?.accountStatus
                )}`}
              >
                {selectedCustomer?.accountStatus}
              </span>
            </div>

            {/* Address & Subscription Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Service Address
                </span>
                <p className="text-slate-600">
                  {selectedCustomer?.address?.street || '42 MG Road'}
                </p>
                <p className="text-slate-600">
                  {selectedCustomer?.address?.city}, {selectedCustomer?.address?.state} -{' '}
                  {selectedCustomer?.address?.pincode}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" /> Active Tariff Plan
                </span>
                <p className="font-semibold text-slate-900">
                  {customerDetails?.subscription?.planId?.name || 'Standard Saver 499'}
                </p>
                <p className="text-slate-600">
                  Data: {customerDetails?.subscription?.planId?.includedData || 5} GB • Rental:{' '}
                  {formatCurrency(customerDetails?.subscription?.planId?.monthlyPrice || 499)}
                </p>
              </div>
            </div>

            {/* Recent Invoices for this customer */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-800">Recent Customer Invoices</h5>
              {customerDetails?.invoices?.length === 0 ? (
                <p className="text-slate-400">No invoices generated yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {customerDetails?.invoices?.map((inv) => (
                    <div
                      key={inv._id}
                      className="p-3 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-blue-600">{inv.invoiceNumber}</span>
                        <span className="text-slate-500 ml-2">Period: {inv.billingPeriod}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {formatCurrency(inv.totalAmount)}
                        </span>
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
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Customers;
