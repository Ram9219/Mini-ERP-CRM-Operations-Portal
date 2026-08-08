import { useAuth } from '../../context/AuthContext';

const Header = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-100/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-slate-400 lg:hidden"
            aria-label="Open sidebar"
          >
            ☰
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Welcome back</p>
            <h1 className="text-xl font-semibold text-slate-950">Business Overview</h1>
          </div>
        </div>

        <div className="hidden items-center gap-4 rounded-2xl bg-white px-4 py-3 shadow-sm sm:flex">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{user?.name || 'Guest'}</p>
            <p className="text-xs text-slate-500">{user?.role || 'No role'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
