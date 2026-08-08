const ChallanItemRow = ({
  index,
  item,
  products,
  onProductChange,
  onQuantityChange,
  onRemove,
  error,
}) => (
  <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[2fr_1fr_1fr_0.6fr_0.4fr]">
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Product</label>
      <select
        value={item.productId}
        onChange={(event) => onProductChange(index, event.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
      >
        <option value="">Select product</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} — {product.sku}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-xs text-rose-700">{error}</p>}
    </div>
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Current Stock</label>
      <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-700">
        {item.currentStock ?? '-'}
      </div>
    </div>
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Unit Price</label>
      <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-700">
        {item.unitPrice != null ? item.unitPrice : '-'}
      </div>
    </div>
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quantity</label>
      <input
        type="number"
        min="1"
        step="1"
        value={item.quantity}
        onChange={(event) => onQuantityChange(index, event.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
      />
    </div>
    <div className="flex items-end justify-end">
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-rose-700 transition hover:border-rose-400 hover:bg-rose-50"
      >
        Remove
      </button>
    </div>
  </div>
);

export default ChallanItemRow;
