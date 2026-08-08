import { useState } from 'react';

const AddStockForm = ({ onSubmit, loading }) => {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!quantity || Number(quantity) <= 0) {
      setError('Quantity must be a positive number.');
      return;
    }

    if (!reason.trim()) {
      setError('Reason is required.');
      return;
    }

    await onSubmit({ quantity: Number(quantity), reason: reason.trim() }, setError);
    if (!error) {
      setQuantity('');
      setReason('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Quantity *</label>
          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Reason *</label>
          <input
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
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
          {loading ? 'Saving...' : 'Add Stock'}
        </button>
      </div>
    </form>
  );
};

export default AddStockForm;
