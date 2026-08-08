import ChallanStatusBadge from './ChallanStatusBadge';

const ChallanTable = ({ challans, onView, onConfirm, onCancel, userRole }) => (
  <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
    <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <th className="px-4 py-4 font-medium">Challan Number</th>
          <th className="px-4 py-4 font-medium">Customer</th>
          <th className="px-4 py-4 font-medium">Total Quantity</th>
          <th className="px-4 py-4 font-medium">Status</th>
          <th className="px-4 py-4 font-medium">Created By</th>
          <th className="px-4 py-4 font-medium">Created Date</th>
          <th className="px-4 py-4 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 bg-white">
        {challans.map((challan) => (
          <tr key={challan.id} className="hover:bg-slate-50">
            <td className="px-4 py-4 text-slate-900">{challan.challan_number}</td>
            <td className="px-4 py-4 text-slate-700">{challan.customer?.name || 'Unknown'}</td>
            <td className="px-4 py-4 text-slate-700">{challan.total_quantity ?? 0}</td>
            <td className="px-4 py-4">
              <ChallanStatusBadge status={challan.status} />
            </td>
            <td className="px-4 py-4 text-slate-700">{challan.created_by || 'Unknown'}</td>
            <td className="px-4 py-4 text-slate-700">{new Date(challan.created_at).toLocaleDateString()}</td>
            <td className="px-4 py-4 text-slate-700">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onView(challan.id)}
                  className="rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                >
                  View
                </button>
                {challan.status === 'Draft' && ['Admin', 'Sales'].includes(userRole) && (
                  <>
                    <button
                      type="button"
                      onClick={() => onConfirm(challan.id)}
                      className="rounded-2xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => onCancel(challan.id)}
                      className="rounded-2xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:border-rose-400 hover:bg-rose-100"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ChallanTable;
