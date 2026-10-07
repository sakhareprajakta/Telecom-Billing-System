import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { planApi } from '../services/planApi';
import { reportApi } from '../services/reportApi';
import PlanCard from '../components/subscription/PlanCard';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { Layers, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

const Subscriptions = () => {
  const { role, user } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Create Plan Form state (for Admin)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    planCode: '',
    monthlyPrice: '',
    includedData: '',
    includedSms: '100',
    callPolicy: 'Unlimited Local + STD Calls',
    dataOverageRate: '50',
    speed: '5G High Speed',
    description: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, dashRes] = await Promise.all([
        planApi.getPlans(),
        reportApi.getDashboardStats(),
      ]);

      if (plansRes.success) setPlans(plansRes.data);
      if (dashRes.success && dashRes.data?.activeSubscription) {
        setCurrentPlanId(dashRes.data.activeSubscription.planId?._id);
        setCustomerId(dashRes.data.customer?._id);
      } else if (dashRes.data?.customer) {
        setCustomerId(dashRes.data.customer._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const handleSubscribe = async (plan) => {
    try {
      setActionLoading(true);
      setFeedback({ type: '', message: '' });

      // If no customer record found, use default demo customer ID
      let targetCustId = customerId;
      if (!targetCustId) {
        // Fallback for admin or support preview
        const dashRes = await reportApi.getDashboardStats();
        targetCustId = dashRes.data?.customer?._id || dashRes.data?.recentInvoices?.[0]?.customerId?._id;
      }

      const res = await planApi.subscribe({
        customerId: targetCustId,
        planId: plan._id,
      });

      if (res.success) {
        setCurrentPlanId(plan._id);
        setFeedback({
          type: 'success',
          message: `Successfully switched subscription to ${plan.name}!`,
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update plan subscription.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await planApi.createPlan({
        ...newPlan,
        monthlyPrice: Number(newPlan.monthlyPrice),
        includedData: Number(newPlan.includedData),
        includedSms: Number(newPlan.includedSms),
        dataOverageRate: Number(newPlan.dataOverageRate),
      });

      if (res.success) {
        setShowCreateModal(false);
        fetchData();
        setFeedback({ type: 'success', message: 'New tariff plan added to catalog!' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create plan.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading plans catalog..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600">
            Tariff & Packages
          </span>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-0.5">
            Telecom Plans & Subscriptions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse high-speed 5G plans, customize overage tariffs, and activate immediate upgrades.
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            Create New Tariff Plan
          </Button>
        )}
      </div>

      {feedback.message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan._id}
            plan={plan}
            isCurrent={currentPlanId === plan._id}
            onSubscribe={handleSubscribe}
            loading={actionLoading}
          />
        ))}
      </div>

      {/* Create Plan Modal (Admin) */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Tariff Plan"
        subtitle="Define base rental, allowances, and overage billing parameters"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Plan Name</label>
            <input
              type="text"
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              placeholder="e.g. Gamer 5G Turbo 999"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Plan Code</label>
              <input
                type="text"
                value={newPlan.planCode}
                onChange={(e) => setNewPlan({ ...newPlan, planCode: e.target.value })}
                placeholder="PLAN_GAMER_999"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Price (₹)</label>
              <input
                type="number"
                value={newPlan.monthlyPrice}
                onChange={(e) => setNewPlan({ ...newPlan, monthlyPrice: e.target.value })}
                placeholder="999"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Included Data (GB)</label>
              <input
                type="number"
                value={newPlan.includedData}
                onChange={(e) => setNewPlan({ ...newPlan, includedData: e.target.value })}
                placeholder="50"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Data Overage Rate (₹/GB)</label>
              <input
                type="number"
                value={newPlan.dataOverageRate}
                onChange={(e) => setNewPlan({ ...newPlan, dataOverageRate: e.target.value })}
                placeholder="50"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows="2"
              value={newPlan.description}
              onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
              placeholder="High speed low-latency connectivity with unlimited local calls."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading}>
              Save Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Subscriptions;
