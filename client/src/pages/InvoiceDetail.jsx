import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { invoiceApi } from '../services/invoiceApi';
import InvoiceDetails from '../components/billing/InvoiceDetails';
import PaymentModal from '../components/payment/PaymentModal';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const InvoiceDetail = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await invoiceApi.getInvoiceById(id);
      if (res.success) {
        // If an array was returned (e.g. GET /api/invoices/CUST1001)
        if (Array.isArray(res.data)) {
          setInvoice(res.data[0] || null);
        } else {
          setInvoice(res.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Invoice not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  if (loading) {
    return <Loader message="Retrieving invoice document..." />;
  }

  if (error || !invoice) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Invoice Document Not Found</h3>
        <p className="text-xs text-slate-500">{error || `No invoice record matches identifier '${id}'.`}</p>
        <Link to="/invoices">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back to Invoices
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link to="/invoices" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices List
        </Link>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
        <InvoiceDetails
          invoice={invoice}
          onPayNow={() => setShowPaymentModal(true)}
        />
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoice={invoice}
        onPaymentSuccess={() => {
          setShowPaymentModal(false);
          fetchInvoice();
        }}
      />
    </div>
  );
};

export default InvoiceDetail;
