import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ChallanFilters from '../components/challans/ChallanFilters';
import ChallanTable from '../components/challans/ChallanTable';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import { useAuth } from '../context/AuthContext';

const Challans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challans, setChallans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('All');
  const [customerId, setCustomerId] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const queryParams = useMemo(() => {
    const params = { page, limit };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (status !== 'All') params.status = status;
    if (customerId) params.customerId = customerId;
    return params;
  }, [searchTerm, status, customerId, page, limit]);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customersResponse = await api.get('/customers');
        setCustomers(customersResponse.data.data || []);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Unable to load customers.');
      }
    };
    loadCustomers();
  }, []);

  useEffect(() => {
    const loadChallans = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/challans', { params: queryParams });
        setChallans(response.data.data || []);
        setPagination(response.data.pagination || { page: 1, limit, total: 0, totalPages: 0 });
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Unable to load challans.');
      } finally {
        setLoading(false);
      }
    };
    loadChallans();
  }, [queryParams, limit]);

  const handleView = (id) => navigate(`/challans/${id}`);

  const refreshChallans = async () => {
    try {
      const response = await api.get('/challans', { params: queryParams });
      setChallans(response.data.data || []);
      setPagination(response.data.pagination || pagination);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to refresh challans.');
    }
  };

  const handleConfirm = async (id) => {
    setActionLoading(true);
    setActionError('');
    try {
      await api.post(`/challans/${id}/confirm`);
      await refreshChallans();
    } catch (apiError) {
      setActionError(apiError.response?.data?.message || 'Unable to confirm challan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id) => {
    setActionLoading(true);
    setActionError('');
    try {
      await api.post(`/challans/${id}/cancel`);
      await refreshChallans();
    } catch (apiError) {
      setActionError(apiError.response?.data?.message || 'Unable to cancel challan.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Sales Challans</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">Challan Management</h1>
            <p className="mt-2 text-sm text-slate-600">Search, filter, and manage sales challans.</p>
          </div>
          {['Admin', 'Sales'].includes(user?.role) && (
            <button
              type="button"
              onClick={() => navigate('/challans/new')}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create Challan
            </button>
          )}
        </div>
      </div>

      <ChallanFilters
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setPage(1);
        }}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        customerId={customerId}
        onCustomerChange={(value) => {
          setCustomerId(value);
          setPage(1);
        }}
        customers={customers}
      />

      {actionError && <ErrorMessage message={actionError} />}
      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading message="Loading challans..." />
      ) : challans.length === 0 ? (
        <EmptyState message="No challans match the current criteria." />
      ) : (
        <ChallanTable
          challans={challans}
          onView={handleView}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          userRole={user?.role}
        />
      )}

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} challans)
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={pagination.page <= 1 || loading || actionLoading}
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-200"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
            disabled={pagination.page >= pagination.totalPages || loading || actionLoading}
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Challans;
