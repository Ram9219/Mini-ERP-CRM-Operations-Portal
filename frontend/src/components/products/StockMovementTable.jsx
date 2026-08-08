const StockMovementTable = ({ movements }) => {
  if (movements.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        No stock movement history available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-4 font-medium">Date</th>
            <th className="px-4 py-4 font-medium">Movement</th>
            <th className="px-4 py-4 font-medium">Quantity</th>
            <th className="px-4 py-4 font-medium">Reason</th>
            <th className="px-4 py-4 font-medium">Created By</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {movements.map((movement) => (
            <tr key={movement.id} className="hover:bg-slate-50">
              <td className="px-4 py-4 text-slate-700">{new Date(movement.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-4 text-slate-700">{movement.movement_type}</td>
              <td className="px-4 py-4 text-slate-700">{movement.quantity}</td>
              <td className="px-4 py-4 text-slate-700">{movement.reason}</td>
              <td className="px-4 py-4 text-slate-700">{movement.created_by || 'Unknown'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockMovementTable;
