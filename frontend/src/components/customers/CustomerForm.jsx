import { useEffect, useState } from 'react';

const CUSTOMER_TYPES = ['Retail', 'Wholesale', 'Distributor'];
const CUSTOMER_STATUSES = ['Lead', 'Active', 'Inactive'];

const getDefaultValues = (values) => ({
  name: values?.name || '',
  mobile: values?.mobile || '',
  email: values?.email || '',
  business_name: values?.business_name || '',
  gst_number: values?.gst_number || '',
  customer_type: values?.customer_type || 'Retail',
  address: values?.address || '',
  status: values?.status || 'Lead',
  follow_up_date: values?.follow_up_date ? values.follow_up_date.slice(0, 10) : '',
  notes: values?.notes || '',
});

const CustomerForm = ({ initialValues, onSubmit, loading, submitLabel }) => {
  const [values, setValues] = useState(getDefaultValues(initialValues));
  const [error, setError] = useState('');

  useEffect(() => {
    setValues(getDefaultValues(initialValues));
  }, [initialValues]);

  const handleChange = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const validate = () => {
    if (!values.name.trim()) {
      return 'Name is required.';
    }
    if (!values.mobile.trim()) {
      return 'Mobile is required.';
    }
    if (!values.customer_type) {
      return 'Customer type is required.';
    }
    if (!values.status) {
      return 'Status is required.';
    }
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      return 'Email must be valid.';
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
          <label className="mb-2 block text-sm font-medium text-slate-700">Name *</label>
          <input
            type="text"
            value={values.name}
            onChange={handleChange('name')}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Mobile *</label>
          <input
            type="text"
            value={values.mobile}
            onChange={handleChange('mobile')}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={values.email}
            onChange={handleChange('email')}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Business Name</label>
          <input
            type="text"
            value={values.business_name}
            onChange={handleChange('business_name')}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">GST Number</label>
          <input
            type="text"
            value={values.gst_number}
            onChange={handleChange('gst_number')}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Customer Type *</label>
          <select
            value={values.customer_type}
            onChange={handleChange('customer_type')}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          >
            {CUSTOMER_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
          <input
            type="text"
            value={values.address}
            onChange={handleChange('address')}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Status *</label>
          <select
            value={values.status}
            onChange={handleChange('status')}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          >
            {CUSTOMER_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Follow-up Date</label>
          <input
            type="date"
            value={values.follow_up_date}
            onChange={handleChange('follow_up_date')}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
        <textarea
          value={values.notes}
          onChange={handleChange('notes')}
          rows={4}
          className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
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

export default CustomerForm;
