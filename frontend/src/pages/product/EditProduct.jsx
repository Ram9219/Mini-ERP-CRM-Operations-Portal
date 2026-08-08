import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import ProductForm from '../../components/products/ProductForm';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Unable to load product.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleSubmit = async (values, setFormError) => {
    setSaving(true);
    setError('');
    setFormError('');

    try {
      const response = await api.put(`/products/${id}`, values);
      if (response?.data?.success) {
        navigate('/products', { state: { message: 'Product updated successfully.' } });
      }
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Unable to update product. Please try again.';
      setFormError(message);
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading product information..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Product Management</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Edit Product</h1>
          <p className="mt-2 text-sm text-slate-600">Update product details without changing current stock.</p>
        </div>
      </div>

      <ProductForm
        initialValues={product}
        loading={saving}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
};

export default EditProduct;
