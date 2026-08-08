import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import CustomerForm from '../../components/customers/CustomerForm';
import ErrorMessage from '../../components/common/ErrorMessage';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values, setFormError) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/customers', values);
      if (response?.data?.success) {
        navigate('/customers', { state: { message: 'Customer created successfully.' } });
      }
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Unable to create customer. Please try again.';
      setFormError(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Customer Management</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Add New Customer</h1>
          <p className="mt-2 text-sm text-slate-600">Add a new customer record to the CRM.</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      <CustomerForm loading={loading} onSubmit={handleSubmit} submitLabel="Create Customer" />
    </div>
  );
};

export default AddCustomer;
