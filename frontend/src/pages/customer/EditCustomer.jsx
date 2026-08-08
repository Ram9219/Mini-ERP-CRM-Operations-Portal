import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import CustomerForm from '../../components/customers/CustomerForm';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCustomer = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/customers/${id}`);
        setCustomer(response.data.data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Unable to load customer.');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id]);

  const handleSubmit = async (values, setFormError) => {
    setSaving(true);
    setFormError('');
    setError('');

    try {
      const response = await api.put(`/customers/${id}`, values);
      if (response?.data?.success) {
        navigate('/customers', { state: { message: 'Customer updated successfully.' } });
      }
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Unable to update customer. Please try again.';
      setFormError(message);
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading customer information..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Customer Management</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Edit Customer</h1>
          <p className="mt-2 text-sm text-slate-600">Update the customer’s contact and follow-up details.</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      <CustomerForm
        initialValues={customer}
        loading={saving}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
};

export default EditCustomer;
