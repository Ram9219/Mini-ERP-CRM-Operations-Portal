const Loading = ({ message = 'Loading...' }) => (
  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500 shadow-sm">
    <p className="text-sm font-medium">{message}</p>
  </div>
);

export default Loading;
