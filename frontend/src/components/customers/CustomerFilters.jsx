const CUSTOMER_STATUSES = ['All', 'Lead', 'Active', 'Inactive'];
const CUSTOMER_TYPES = ['All', 'Retail', 'Wholesale', 'Distributor'];

const CustomerFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  customerType,
  onCustomerTypeChange,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Search</label>
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search customers..."
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
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
          <label className="mb-2 block text-sm font-medium text-slate-700">Customer Type</label>
          <select
            value={customerType}
            onChange={(event) => onCustomerTypeChange(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          >
            {CUSTOMER_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CustomerFilters;
