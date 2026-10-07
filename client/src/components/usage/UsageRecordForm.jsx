import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { usageApi } from '../../services/usageApi';
import { Activity, Plus, CheckCircle, AlertCircle } from 'lucide-react';

const UsageRecordForm = ({ isOpen, onClose, customerCode = 'CUST1001', onSuccess }) => {
  const [formData, setFormData] = useState({
    customerCode: customerCode,
    type: 'DATA',
    quantity: '1.5',
    unit: 'GB',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'type') {
      let defaultUnit = 'GB';
      let defaultQty = '1.5';
      if (value === 'VOICE') {
        defaultUnit = 'MINS';
        defaultQty = '25';
      } else if (value === 'SMS') {
        defaultUnit = 'SMS';
        defaultQty = '10';
      }
      setFormData((prev) => ({
        ...prev,
        type: value,
        unit: defaultUnit,
        quantity: defaultQty,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await usageApi.logUsage({
        customerCode: formData.customerCode,
        type: formData.type,
        quantity: Number(formData.quantity),
        unit: formData.unit,
      });

      if (res.success) {
        setSuccess(`Logged ${formData.quantity} ${formData.unit} for ${formData.customerCode} successfully.`);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to ingest CDR usage record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulate / Ingest CDR Usage Record"
      subtitle="Telecom Network Event Ingestion (POST /api/usage)"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Customer Code / ID
          </label>
          <input
            type="text"
            name="customerCode"
            value={formData.customerCode}
            onChange={handleChange}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            placeholder="e.g. CUST1001"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Usage Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="DATA">DATA (Internet)</option>
              <option value="VOICE">VOICE (Calling)</option>
              <option value="SMS">SMS (Messaging)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unit
            </label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-600 font-mono"
              readOnly
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Quantity Consumed
          </label>
          <input
            type="number"
            step="0.1"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0.1"
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-[11px] text-slate-400 mt-1">
            CDR records will be stored in MongoDB and calculated in the next billing run.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} icon={Plus}>
            Log CDR Event
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UsageRecordForm;
