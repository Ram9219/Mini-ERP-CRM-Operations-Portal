import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Customers', to: '/customers' },
  { label: 'Products', to: '/products' },
  { label: 'Challans', to: '/challans' },
];

const Sidebar = ({ open, setOpen }) => {
  const { user, logout } = useAuth();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-[280px] transform bg-slate-950 text-slate-100 shadow-xl transition-transform duration-300 lg:translate-x-0 lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-full flex-col px-6 py-6">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-xl font-bold tracking-tight">ERP / CRM</p>
            <p className="text-sm text-slate-400">Admin dashboard</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center rounded-lg bg-slate-800 p-2 text-slate-200 hover:bg-slate-700 lg:hidden"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="mb-4 text-sm text-slate-400">Signed in as</div>
          <div className="rounded-2xl bg-slate-900 p-4 text-sm">
            <div className="font-medium text-white">{user?.name || 'Unknown User'}</div>
            <div className="text-slate-400">{user?.role || 'Role unavailable'}</div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-6 w-full rounded-2xl bg-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-600"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
