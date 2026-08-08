const ChallanFilters = ({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
  customerId,
  onCustomerChange,
  customers,
}) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr_0.9fr] lg:grid-cols-[1.8fr_0.8fr_0.8fr]">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Search Challan</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by challan number..."
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
          <option value="All">All</option>
          <option value="Draft">Draft</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Customer</label>
        <select
          value={customerId}
          onChange={(event) => onCustomerChange(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
        >
          <option value="">All Customers</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

export default ChallanFilters;
