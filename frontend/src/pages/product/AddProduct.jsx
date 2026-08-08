import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import ProductForm from '../../components/products/ProductForm';
import ErrorMessage from '../../components/common/ErrorMessage';

const AddProduct = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values, setFormError) => {
    setLoading(true);
    setError('');
    setFormError('');

    try {
      const response = await api.post('/products', values);
      if (response?.data?.success) {
        navigate('/products', { state: { message: 'Product created successfully.' } });
      }
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Unable to create product. Please try again.';
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
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Product Management</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Add New Product</h1>
          <p className="mt-2 text-sm text-slate-600">Create a new product and initialize inventory stock.</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      <ProductForm loading={loading} onSubmit={handleSubmit} submitLabel="Create Product" />
    </div>
  );
};

export default AddProduct;
