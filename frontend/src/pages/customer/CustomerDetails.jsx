import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import FollowUpHistory from '../../components/customers/FollowUpHistory';
import FollowUpForm from '../../components/customers/FollowUpForm';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followupLoading, setFollowupLoading] = useState(false);
  const [error, setError] = useState('');
  const [followupError, setFollowupError] = useState('');

  useEffect(() => {
    const loadCustomer = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/customers/${id}`);
        setCustomer(response.data.data);
        setFollowups(response.data.data.followups || []);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Unable to load customer details.');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id]);

  const handleFollowUpSubmit = async (payload, setFormError) => {
    setFollowupLoading(true);
    setFollowupError('');
    setFormError('');

    try {
      await api.post(`/customers/${id}/followups`, payload);
      const response = await api.get(`/customers/${id}`);
      setCustomer(response.data.data);
      setFollowups(response.data.data.followups || []);
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Unable to add follow-up. Please try again.';
      setFormError(message);
      setFollowupError(message);
    } finally {
      setFollowupLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading customer details..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!customer) {
    return <EmptyState message="Customer record not available." />;
  }

  const canFollowUp = ['Admin', 'Sales', 'Accounts'].includes(user?.role);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Customer details</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">{customer.name}</h1>
            <p className="mt-2 text-sm text-slate-600">Business profile and follow-up history.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-900">Status:</span> {customer.status}</p>
            <p className="mt-2"><span className="font-semibold text-slate-900">Type:</span> {customer.customer_type}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Contact information</h2>
          <div className="mt-5 space-y-4 text-sm text-slate-700">
            <div>
              <p className="text-slate-500">Business Name</p>
              <p>{customer.business_name || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">Mobile</p>
              <p>{customer.mobile}</p>
            </div>
            <div>
              <p className="text-slate-500">Email</p>
              <p>{customer.email || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">GST Number</p>
              <p>{customer.gst_number || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">Address</p>
              <p>{customer.address || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">Follow-up Date</p>
              <p>{customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString() : '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">Notes</p>
              <p className="whitespace-pre-line">{customer.notes || '-'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Follow-up history</p>
              <p className="mt-1 text-sm text-slate-600">Recent notes and actions for this customer.</p>
            </div>
          </div>
          <FollowUpHistory followups={followups} loading={false} error={followupError} />
        </div>
      </div>

      {canFollowUp && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Add follow-up</h2>
          <p className="mt-2 text-sm text-slate-600">Record a new follow-up note for this customer.</p>
          <div className="mt-6">
            <FollowUpForm onSubmit={handleFollowUpSubmit} loading={followupLoading} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
