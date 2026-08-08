const STATUS_CLASSES = {
  Draft: 'bg-amber-100 text-amber-800',
  Confirmed: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-rose-100 text-rose-800',
};

const ChallanStatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[status] || 'bg-slate-100 text-slate-700'}`}>
    {status}
  </span>
);

export default ChallanStatusBadge;
