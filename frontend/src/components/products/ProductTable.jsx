const STATUS_STYLES = {
  'Low Stock': 'bg-amber-100 text-amber-700',
  'In Stock': 'bg-emerald-100 text-emerald-700',
};

const ProductTable = ({ products, onView, onEdit, onDelete, userRole }) => {
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-4 font-medium">Product Name</th>
            <th className="px-4 py-4 font-medium">SKU</th>
            <th className="px-4 py-4 font-medium">Category</th>
            <th className="px-4 py-4 font-medium">Unit Price</th>
            <th className="px-4 py-4 font-medium">Current Stock</th>
            <th className="px-4 py-4 font-medium">Minimum Stock</th>
            <th className="px-4 py-4 font-medium">Warehouse</th>
            <th className="px-4 py-4 font-medium">Stock Status</th>
            <th className="px-4 py-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {products.map((product) => {
            const status = product.current_stock <= product.minimum_stock ? 'Low Stock' : 'In Stock';
            return (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-4 py-4 text-slate-900">{product.name}</td>
                <td className="px-4 py-4 text-slate-700">{product.sku}</td>
                <td className="px-4 py-4 text-slate-700">{product.category}</td>
                <td className="px-4 py-4 text-slate-700">{product.unit_price}</td>
                <td className="px-4 py-4 text-slate-700">{product.current_stock}</td>
                <td className="px-4 py-4 text-slate-700">{product.minimum_stock}</td>
                <td className="px-4 py-4 text-slate-700">{product.warehouse_location}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
                    {status}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-700">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onView(product.id)}
                      className="rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                    >
                      View
                    </button>
                    {['Admin', 'Warehouse'].includes(userRole) && (
                      <button
                        type="button"
                        onClick={() => onEdit(product.id)}
                        className="rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                    )}
                    {userRole === 'Admin' && (
                      <button
                        type="button"
                        onClick={() => onDelete(product.id)}
                        className="rounded-2xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:border-rose-400 hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
