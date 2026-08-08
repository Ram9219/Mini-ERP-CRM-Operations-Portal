const STATUS_STYLES = {
  Lead: 'bg-amber-100 text-amber-700',
  Active: 'bg-emerald-100 text-emerald-700',
  Inactive: 'bg-slate-100 text-slate-600',
};

const CustomerTable = ({ customers, onView, onEdit, onDelete, userRole }) => {
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-4 font-medium">Name</th>
            <th className="px-4 py-4 font-medium">Business Name</th>
            <th className="px-4 py-4 font-medium">Mobile</th>
            <th className="px-4 py-4 font-medium">Customer Type</th>
            <th className="px-4 py-4 font-medium">Status</th>
            <th className="px-4 py-4 font-medium">Follow-up Date</th>
            <th className="px-4 py-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-slate-50">
              <td className="px-4 py-4 text-slate-900">{customer.name}</td>
              <td className="px-4 py-4 text-slate-700">{customer.business_name || '-'}</td>
              <td className="px-4 py-4 text-slate-700">{customer.mobile}</td>
              <td className="px-4 py-4 text-slate-700">{customer.customer_type}</td>
              <td className="px-4 py-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[customer.status] || 'bg-slate-100 text-slate-600'}`}>
                  {customer.status}
                </span>
              </td>
              <td className="px-4 py-4 text-slate-700">
                {customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString() : '-'}
              </td>
              <td className="px-4 py-4 text-slate-700">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onView(customer.id)}
                    className="rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                  >
                    View
                  </button>
                  {(userRole === 'Admin' || userRole === 'Sales') && (
                    <button
                      type="button"
                      onClick={() => onEdit(customer.id)}
                      className="rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                    >
                      Edit
                    </button>
                  )}
                  {userRole === 'Admin' && (
                    <button
                      type="button"
                      onClick={() => onDelete(customer.id)}
                      className="rounded-2xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:border-rose-400 hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;
