const ProductFilters = ({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  lowStockOnly,
  onLowStockChange,
  categories,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr_0.9fr]">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search products..."
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Low Stock</label>
          <select
            value={lowStockOnly ? 'Low Stock Only' : 'All Products'}
            onChange={(event) => onLowStockChange(event.target.value === 'Low Stock Only')}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          >
            <option>All Products</option>
            <option>Low Stock Only</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
