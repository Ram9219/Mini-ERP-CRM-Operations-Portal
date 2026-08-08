import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import ChallanForm from '../../components/challans/ChallanForm';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';

const CreateChallan = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [values, setValues] = useState({ customerId: '', items: [{ productId: '', productName: '', sku: '', currentStock: null, unitPrice: null, quantity: '' }] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [customersResponse, productsResponse] = await Promise.all([
          api.get('/customers'),
          api.get('/products', { params: { page: 1, limit: 100 } }),
        ]);
        setCustomers(customersResponse.data.data || []);
        setProducts(productsResponse.data.data || []);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Unable to load customers or products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        customerId: Number(values.customerId),
        items: values.items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
        })),
      };
      const response = await api.post('/challans', payload);
      if (response?.data?.data?.id) {
        navigate(`/challans/${response.data.data.id}`, { state: { message: 'Draft challan created successfully.' } });
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to create challan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading challan creation data..." />;
  }

  if (error && customers.length === 0 && products.length === 0) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Sales Challans</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Create Challan Draft</h1>
          <p className="mt-2 text-sm text-slate-600">Create a sales challan draft without modifying stock.</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <ChallanForm
        customers={customers}
        products={products}
        values={values}
        onValuesChange={setValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/challans')}
        loading={saving}
        error={error}
      />
    </div>
  );
};

export default CreateChallan;
