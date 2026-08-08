const ProductForm = ({ initialValues, onSubmit, loading, submitLabel }) => {
  const [values, setValues] = useState({
    name: initialValues?.name || '',
    sku: initialValues?.sku || '',
    category: initialValues?.category || '',
    unit_price: initialValues?.unit_price ?? '',
    current_stock: initialValues?.current_stock ?? '',
    minimum_stock: initialValues?.minimum_stock ?? '',
    warehouse_location: initialValues?.warehouse_location || '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    setValues({
      name: initialValues?.name || '',
      sku: initialValues?.sku || '',
      category: initialValues?.category || '',
      unit_price: initialValues?.unit_price ?? '',
      current_stock: initialValues?.current_stock ?? '',
      minimum_stock: initialValues?.minimum_stock ?? '',
      warehouse_location: initialValues?.warehouse_location || '',
    });
  }, [initialValues]);

  const handleChange = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const validate = () => {
    if (!values.name.trim()) {
      return 'Product name is required.';
    }
    if (!values.sku.trim()) {
      return 'SKU is required.';
    }
    if (!values.category.trim()) {
      return 'Category is required.';
    }
    if (values.unit_price === '' || Number(values.unit_price) < 0) {
      return 'Unit price must be zero or greater.';
    }
    if (values.minimum_stock === '' || Number(values.minimum_stock) < 0) {
      return 'Minimum stock must be zero or greater.';
    }
    if (!values.warehouse_location.trim()) {
      return 'Warehouse location is required.';
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    await onSubmit(values, setError);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Product Name *</label>
          <input
            type="text"
            value={values.name}
            onChange={handleChange('name')}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">SKU *</label>
          <input
            type="text"
            value={values.sku}
            onChange={handleChange('sku')}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Category *</label>
          <input
            type="text"
            value={values.category}
            onChange={handleChange('category')}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Unit Price *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.unit_price}
            onChange={handleChange('unit_price')}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>
        {initialValues ? null : (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Current Stock *</label>
            <input
              type="number"
              min="0"
              step="1"
              value={values.current_stock}
              onChange={handleChange('current_stock')}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
            />
          </div>
        )}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Minimum Stock *</label>
          <input
            type="number"
            min="0"
            step="1"
            value={values.minimum_stock}
            onChange={handleChange('minimum_stock')}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Warehouse Location *</label>
          <input
            type="text"
            value={values.warehouse_location}
            onChange={handleChange('warehouse_location')}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
