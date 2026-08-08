import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import StockMovementTable from '../../components/products/StockMovementTable';
import AddStockForm from '../../components/products/AddStockForm';
import { useAuth } from '../../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);
  const [error, setError] = useState('');
  const [stockError, setStockError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const canAddStock = ['Admin', 'Warehouse'].includes(user?.role);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const [productResponse, movementsResponse] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/stock-movements`, { params: { page: 1, limit: 10 } }),
        ]);
        setProduct(productResponse.data.data);
        setMovements(movementsResponse.data.data || []);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Unable to load product details.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddStock = async (payload, setFormError) => {
    setStockLoading(true);
    setStockError('');
    setSuccessMessage('');
    setFormError('');

    try {
      await api.post(`/products/${id}/stock`, payload);
      const [productResponse, movementsResponse] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/products/${id}/stock-movements`, { params: { page: 1, limit: 10 } }),
      ]);
      setProduct(productResponse.data.data);
      setMovements(movementsResponse.data.data || []);
      setSuccessMessage('Stock added successfully.');
    } catch (apiError) {
      const message = apiError.response?.data?.message || 'Unable to add stock. Please try again.';
      setFormError(message);
      setStockError(message);
    } finally {
      setStockLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading product details..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!product) {
    return <EmptyState message="Product details are unavailable." />;
  }

  const stockStatus = product.current_stock <= product.minimum_stock ? 'Low Stock' : 'In Stock';

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Product details</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">{product.name}</h1>
            <p className="mt-2 text-sm text-slate-600">Inventory and movement history for this product.</p>
          </div>
          {canAddStock && (
            <button
              type="button"
              onClick={() => navigate(`/products/${id}/edit`)}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Edit Product
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailRow label="SKU" value={product.sku} />
            <DetailRow label="Category" value={product.category} />
            <DetailRow label="Unit Price" value={product.unit_price} />
            <DetailRow label="Current Stock" value={product.current_stock} />
            <DetailRow label="Minimum Stock" value={product.minimum_stock} />
            <DetailRow label="Warehouse" value={product.warehouse_location} />
            <DetailRow label="Stock Status" value={stockStatus} badge />
          </div>
        </div>

        <div className="space-y-4">
          {successMessage && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-700 shadow-sm">
              {successMessage}
            </div>
          )}
          {canAddStock && (
            <AddStockForm onSubmit={handleAddStock} loading={stockLoading} />
          )}
          {stockError && <ErrorMessage message={stockError} />}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Stock movements</p>
            <p className="mt-1 text-sm text-slate-600">Latest inventory transactions for this product.</p>
          </div>
        </div>
        <StockMovementTable movements={movements} />
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, badge }) => (
  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
    <p className={`mt-2 text-sm font-semibold ${badge ? 'text-slate-950' : 'text-slate-700'}`}>{value || '-'}</p>
  </div>
);

export default ProductDetails;
