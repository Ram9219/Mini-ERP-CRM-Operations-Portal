import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import ChallanStatusBadge from '../../components/challans/ChallanStatusBadge';
import { useAuth } from '../../context/AuthContext';

const ChallanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  const canManageDraft = ['Admin', 'Sales'].includes(user?.role);

  useEffect(() => {
    const loadChallan = async () => {
      setLoading(true);
      setError('');
      setSuccessMessage(location.state?.message || '');
      try {
        const response = await api.get(`/challans/${id}`);
        setChallan(response.data.data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Unable to load challan details.');
      } finally {
        setLoading(false);
      }
    };

    loadChallan();
  }, [id, location.state]);

  const refreshChallan = async () => {
    try {
      const response = await api.get(`/challans/${id}`);
      setChallan(response.data.data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to refresh challan details.');
    }
  };

  const handleConfirm = async () => {
    const confirmed = window.confirm('Confirm this challan? This will submit it for stock validation and completion.');
    if (!confirmed) return;
    setActionLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await api.post(`/challans/${id}/confirm`);
      await refreshChallan();
      setSuccessMessage('Challan confirmed successfully.');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to confirm challan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const confirmed = window.confirm('Cancel this draft challan? This action cannot be undone.');
    if (!confirmed) return;
    setActionLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await api.post(`/challans/${id}/cancel`);
      await refreshChallan();
      setSuccessMessage('Challan cancelled successfully.');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to cancel challan.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading challan details..." />;
  }

  if (error && !challan) {
    return <ErrorMessage message={error} />;
  }

  if (!challan) {
    return <EmptyState message="Challan details are unavailable." />;
  }

  const isDraft = challan.status === 'Draft';
  const isConfirmed = challan.status === 'Confirmed';
  const isCancelled = challan.status === 'Cancelled';

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Sales Challan</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">{challan.challan_number}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <ChallanStatusBadge status={challan.status} />
              <span className="text-slate-600">Created by {challan.created_by || 'Unknown'}</span>
              <span className="text-slate-600">{new Date(challan.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {isDraft && canManageDraft && (
              <>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  Confirm Challan
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center rounded-2xl border border-rose-300 bg-white px-5 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-400 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel Challan
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-700 shadow-sm">
          {successMessage}
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Customer Details</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DetailItem label="Name" value={challan.customer?.name} />
            <DetailItem label="Business" value={challan.customer?.business_name} />
            <DetailItem label="Mobile" value={challan.customer?.mobile} />
            <DetailItem label="Email" value={challan.customer?.email} />
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Challan Summary</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DetailItem label="Total Quantity" value={challan.total_quantity} />
            <DetailItem label="Status" value={<ChallanStatusBadge status={challan.status} />} />
            <DetailItem label="Created By" value={challan.created_by} />
            <DetailItem label="Created Date" value={new Date(challan.created_at).toLocaleDateString()} />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Challan Items</p>
            <p className="mt-1 text-sm text-slate-600">Product snapshot values are preserved for this challan.</p>
          </div>
        </div>
        {challan.items?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-4 font-medium">Product</th>
                  <th className="px-4 py-4 font-medium">SKU</th>
                  <th className="px-4 py-4 font-medium">Unit Price</th>
                  <th className="px-4 py-4 font-medium">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {challan.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-900">{item.product_name || item.product?.name}</td>
                    <td className="px-4 py-4 text-slate-700">{item.product_sku || item.product?.sku}</td>
                    <td className="px-4 py-4 text-slate-700">{item.unit_price}</td>
                    <td className="px-4 py-4 text-slate-700">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="No items found for this challan." />
        )}
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
    <p className="mt-2 text-sm font-semibold text-slate-900">{value ?? '-'}</p>
  </div>
);

export default ChallanDetails;
