
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <div className="min-w-0 lg:ml-[280px]">
        <Header
          onToggleSidebar={() =>
            setSidebarOpen((value) => !value)
          }
        />

        <main className="min-h-[calc(100vh-96px)] min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;