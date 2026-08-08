import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import CustomerFilters from '../../components/customers/CustomerFilters';
import CustomerTable from '../../components/customers/CustomerTable';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';

const CustomerList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [customerType, setCustomerType] = useState('All');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const queryParams = useMemo(() => {
    const params = { page, limit };
    if (search.trim()) {
      params.search = search.trim();
    }
    if (status !== 'All') {
      params.status = status;
    }
    if (customerType !== 'All') {
      params.customer_type = customerType;
    }
    return params;
  }, [search, status, customerType, page, limit]);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/customers', { params: queryParams });
        setCustomers(response.data.data || []);
        setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Unable to load customers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [queryParams]);

  useEffect(() => {
    if (location.state?.message) {
      const timer = window.setTimeout(() => {
        window.history.replaceState({}, document.title);
      }, 3000);
      return () => window.clearTimeout(timer);
    }
  }, [location.state]);

  const handleView = (id) => {
    navigate(`/customers/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/customers/${id}/edit`);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this customer?');
    if (!confirmed) {
      return;
    }

    setError('');
    setLoading(true);
    try {
      await api.delete(`/customers/${id}`);
      const response = await api.get('/customers', { params: queryParams });
      setCustomers(response.data.data || []);
      setPagination(response.data.pagination || pagination);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to delete customer.');
    } finally {
      setLoading(false);
    }
  };

  const hasAddPermission = ['Admin', 'Sales'].includes(user?.role);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Customer CRM</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">Customers</h1>
            <p className="mt-2 text-sm text-slate-600">Manage customer profiles, status, and follow-up records.</p>
          </div>
          {hasAddPermission && (
            <button
              type="button"
              onClick={() => navigate('/customers/new')}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add Customer
            </button>
          )}
        </div>
      </div>

      <CustomerFilters
        search={search}
        status={status}
        customerType={customerType}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onCustomerTypeChange={(value) => {
          setCustomerType(value);
          setPage(1);
        }}
      />

      {location.state?.message && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-700 shadow-sm">
          {location.state.message}
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading message="Loading customers..." />
      ) : customers.length === 0 ? (
        <EmptyState message="No customers match the current criteria." />
      ) : (
        <CustomerTable
          customers={customers}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          userRole={user?.role}
        />
      )}

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} customers)
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={pagination.page <= 1 || loading}
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-200"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
            disabled={pagination.page >= pagination.totalPages || loading}
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
