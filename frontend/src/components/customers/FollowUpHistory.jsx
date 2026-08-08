const FollowUpHistory = ({ followups, loading, error }) => {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading follow-up history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
        {error}
      </div>
    );
  }

  if (followups.length === 0) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">No follow-up history available.</div>;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-4 font-medium">Date</th>
            <th className="px-4 py-4 font-medium">Note</th>
            <th className="px-4 py-4 font-medium">Created By</th>
            <th className="px-4 py-4 font-medium">Created At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {followups.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="px-4 py-4 text-slate-700">{item.follow_up_date ? new Date(item.follow_up_date).toLocaleDateString() : '-'}</td>
              <td className="px-4 py-4 text-slate-700 whitespace-pre-line">{item.note}</td>
              <td className="px-4 py-4 text-slate-700">{item.created_by || 'Unknown'}</td>
              <td className="px-4 py-4 text-slate-700">{new Date(item.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FollowUpHistory;
