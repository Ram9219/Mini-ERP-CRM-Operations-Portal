import { useMemo, useState } from 'react';
import ChallanItemRow from './ChallanItemRow';

const ChallanForm = ({
  customers,
  products,
  values,
  onValuesChange,
  onSubmit,
  onCancel,
  loading,
  error,
}) => {
  const [itemErrors, setItemErrors] = useState([]);

  const productMap = useMemo(
    () => products.reduce((map, product) => ({ ...map, [product.id]: product }), {}),
    [products]
  );

  const productIds = values.items.map((item) => item.productId);

  const validateItemSelection = (index, productId) => {
    if (!productId) return null;
    const duplicateIndex = values.items.findIndex(
      (item, itemIndex) => item.productId === productId && itemIndex !== index
    );
    if (duplicateIndex !== -1) {
      return 'This product is already added.';
    }
    return null;
  };

  const handleProductChange = (index, productId) => {
    const newItems = [...values.items];
    const errorMessage = validateItemSelection(index, productId);
    const product = productMap[productId];

    newItems[index] = {
      ...newItems[index],
      productId,
      productName: product?.name || '',
      sku: product?.sku || '',
      currentStock: product?.current_stock ?? null,
      unitPrice: product?.unit_price ?? null,
      quantity: newItems[index].quantity || '',
    };

    const newErrors = [...itemErrors];
    newErrors[index] = errorMessage;
    setItemErrors(newErrors);
    onValuesChange({ ...values, items: newItems });
  };

  const handleQuantityChange = (index, quantity) => {
    const newItems = [...values.items];
    newItems[index] = {
      ...newItems[index],
      quantity: quantity === '' ? '' : Number(quantity),
    };
    onValuesChange({ ...values, items: newItems });
  };

  const handleRemove = (index) => {
    const items = values.items.filter((_, itemIndex) => itemIndex !== index);
    setItemErrors((current) => current.filter((_, itemIndex) => itemIndex !== index));
    onValuesChange({ ...values, items });
  };

  const handleAddProduct = () => {
    onValuesChange({
      ...values,
      items: [...values.items, { productId: '', productName: '', sku: '', currentStock: null, unitPrice: null, quantity: '' }],
    });
    setItemErrors((current) => [...current, null]);
  };

  const totalQuantity = values.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const formErrors = useMemo(() => {
    const errors = [];
    if (!values.customerId) {
      errors.push('Customer selection is required.');
    }
    if (values.items.length === 0) {
      errors.push('At least one product item is required.');
    }
    values.items.forEach((item, index) => {
      if (!item.productId) {
        errors.push(`Item ${index + 1}: product selection is required.`);
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        errors.push(`Item ${index + 1}: quantity must be a positive integer.`);
      }
    });
    return errors;
  }, [values]);

  return (
    <div className="space-y-6">
      {error && <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">{error}</div>}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Customer *</label>
            <select
              value={values.customerId}
              onChange={(event) => onValuesChange({ ...values, customerId: event.target.value })}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Total Quantity</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{totalQuantity}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {values.items.map((item, index) => (
          <ChallanItemRow
            key={index}
            index={index}
            item={item}
            products={products}
            onProductChange={handleProductChange}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
            error={itemErrors[index]}
          />
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={handleAddProduct}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          + Add Product
        </button>
      </div>

      {formErrors.length > 0 && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
          <ul className="list-disc list-inside space-y-2">
            {formErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || formErrors.length > 0}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? 'Saving...' : 'Save Draft'}
        </button>
      </div>
    </div>
  );
};

export default ChallanForm;
