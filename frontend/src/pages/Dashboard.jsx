import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import StatCard from '../components/common/StatCard';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [challans, setChallans] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [totals, setTotals] = useState({ customers: 0, products: 0, challans: 0 });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({ customers: null, products: null, challans: null, lowStock: null });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setErrors({ customers: null, products: null, challans: null, lowStock: null });

      const customerRequest = api.get('/customers', { params: { page: 1, limit: 5 } });
      const productRequest = api.get('/products', { params: { page: 1, limit: 5 } });
      const challanRequest = api.get('/challans', { params: { page: 1, limit: 5 } });
      const lowStockRequest = api.get('/products', { params: { lowStock: true, page: 1, limit: 10 } });

      const results = await Promise.allSettled([customerRequest, productRequest, challanRequest, lowStockRequest]);
      const [customerResult, productResult, challanResult, lowStockResult] = results;

      if (customerResult.status === 'fulfilled') {
        setCustomers(customerResult.value.data.data || []);
        setTotals((current) => ({ ...current, customers: Number(customerResult.value.data.pagination?.total || 0) }));
      } else {
        setErrors((current) => ({ ...current, customers: 'Unable to load customers. Please try again.' }));
      }

      if (productResult.status === 'fulfilled') {
        setProducts(productResult.value.data.data || []);
        setTotals((current) => ({ ...current, products: Number(productResult.value.data.pagination?.total || 0) }));
      } else {
        setErrors((current) => ({ ...current, products: 'Unable to load products. Please try again.' }));
      }

      if (challanResult.status === 'fulfilled') {
        setChallans(challanResult.value.data.data || []);
        setTotals((current) => ({ ...current, challans: Number(challanResult.value.data.pagination?.total || 0) }));
      } else {
        setErrors((current) => ({ ...current, challans: 'Unable to load challans. Please try again.' }));
      }

      if (lowStockResult.status === 'fulfilled') {
        setLowStockProducts(lowStockResult.value.data.data || []);
      } else {
        setErrors((current) => ({ ...current, lowStock: 'Unable to load low stock products. Please try again.' }));
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const totalCustomers = totals.customers;
  const totalProducts = totals.products;
  const totalChallans = totals.challans;
  const totalLowStock = lowStockProducts.length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Dashboard</p>
            <h2 className="text-2xl font-semibold text-slate-950">Company performance summary</h2>
          </div>
          <p className="max-w-2xl text-sm text-slate-600">
            Quick overview of customers, inventory levels, and recent challan activity.
          </p>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-4 lg:grid-cols-2">
        <StatCard
          title="Total Customers"
          value={totalCustomers}
          description="Customers retrieved from the latest query"
          loading={loading}
        />
        <StatCard
          title="Total Products"
          value={totalProducts}
          description="Products inventory loaded for dashboard"
          loading={loading}
        />
        <StatCard
          title="Low Stock Products"
          value={totalLowStock}
          description="Products at or below minimum stock"
          loading={loading}
        />
        <StatCard
          title="Total Challans"
          value={totalChallans}
          description="Recent challans loaded from the system"
          loading={loading}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Recent Challans</p>
              <p className="mt-1 text-sm text-slate-600">Latest transactions and approvals.</p>
            </div>
          </div>

          {errors.challans && <ErrorMessage message={errors.challans} />}
          {loading ? (
            <Loading message="Loading recent challans..." />
          ) : challans.length === 0 ? (
            <EmptyState message="No challans found." />
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-slate-200">
              <table className="min-w-[700px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium min-w-[180px] whitespace-nowrap">Challan Number</th>
                    <th className="px-4 py-3 font-medium min-w-[180px] whitespace-nowrap">Customer</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Total Qty</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {challans.map((challan) => (
                    <tr key={challan.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 text-slate-900 whitespace-nowrap">{challan.challan_number}</td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">
                        {challan.customer?.name || challan.customer?.business_name || 'Unknown Customer'}
                      </td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{challan.total_quantity ?? 0}</td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{challan.status}</td>
                      <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{new Date(challan.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Low Stock Products</p>
            <p className="mt-1 text-sm text-slate-600">Products that need stock attention.</p>
          </div>

          {errors.products && <ErrorMessage message={errors.products} />}
          {loading ? (
            <Loading message="Loading product inventory..." />
          ) : lowStockProducts.length === 0 ? (
            <EmptyState message="No low stock products at the moment." />
          ) : (
            <div className="space-y-4">
              {lowStockProducts.slice(0, 10).map((product) => (
                <div
                  key={product.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{product.name}</p>
                      <p className="text-sm text-slate-500">SKU: {product.sku}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                      {product.warehouse_location || 'Unknown location'}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white p-3 text-sm text-slate-700 shadow-sm">
                      <p className="text-slate-500">Current stock</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{product.current_stock}</p>
                    </div>
                    <div className="rounded-3xl bg-white p-3 text-sm text-slate-700 shadow-sm">
                      <p className="text-slate-500">Minimum stock</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{product.minimum_stock}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
