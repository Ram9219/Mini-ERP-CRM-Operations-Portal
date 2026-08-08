import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import ProductFilters from '../../components/products/ProductFilters';
import ProductTable from '../../components/products/ProductTable';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';

const ProductList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const queryParams = useMemo(() => {
    const params = { page, limit };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (category !== 'All') params.category = category;
    if (lowStockOnly) params.lowStock = true;
    return params;
  }, [searchTerm, category, lowStockOnly, page, limit]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/products', { params: queryParams });
        setProducts(response.data.data || []);
        setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
        setCategories((prevCategories) => {
          const fetchedCategories = response.data.data?.map((item) => item.category).filter(Boolean) || [];
          return Array.from(new Set([...prevCategories, ...fetchedCategories]));
        });
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Unable to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [queryParams]);

  useEffect(() => {
    if (location.state?.message) {
      const timer = window.setTimeout(() => {
        window.history.replaceState({}, document.title);
      }, 3000);
      return () => window.clearTimeout(timer);
    }
  }, [location.state]);

  const handleView = (id) => navigate(`/products/${id}`);
  const handleEdit = (id) => navigate(`/products/${id}/edit`);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    setLoading(true);
    setError('');
    try {
      await api.delete(`/products/${id}`);
      const response = await api.get('/products', { params: queryParams });
      setProducts(response.data.data || []);
      setPagination(response.data.pagination || pagination);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to delete product.');
    } finally {
      setLoading(false);
    }
  };

  const hasAddPermission = ['Admin', 'Warehouse'].includes(user?.role);
  const canEdit = ['Admin', 'Warehouse'].includes(user?.role);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Product Management</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">Products</h1>
            <p className="mt-2 text-sm text-slate-600">Manage products, inventory, and stock status.</p>
          </div>
          {hasAddPermission && (
            <button
              type="button"
              onClick={() => navigate('/products/new')}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add Product
            </button>
          )}
        </div>
      </div>

      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setPage(1);
        }}
        category={category}
        onCategoryChange={(value) => {
          setCategory(value);
          setPage(1);
        }}
        lowStockOnly={lowStockOnly}
        onLowStockChange={(value) => {
          setLowStockOnly(value);
          setPage(1);
        }}
        categories={categories}
      />

      {location.state?.message && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-700 shadow-sm">
          {location.state.message}
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <Loading message="Loading products..." />
      ) : products.length === 0 ? (
        <EmptyState message="No products match the current criteria." />
      ) : (
        <ProductTable
          products={products}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          userRole={user?.role}
        />
      )}

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} products)
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

export default ProductList;
