import { useMemo, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import JobseekerFooter from './components/JobseekerFooter';
import JobseekerHeader from './components/JobseekerHeader';
import JobseekerSidebar from './components/JobseekerSidebar';

const getPublicUser = () => {
  try {
    return JSON.parse(localStorage.getItem('publicUser') || 'null');
  } catch {
    return null;
  }
};

export const isJobseekerUser = (user) => {
  const accountType = String(user?.accountType || '').trim().toLowerCase();
  const role = String(user?.role || '').trim().toLowerCase();
  if (accountType) return accountType === 'jobseeker';
  return role === 'jobseeker';
};

export const JobseekerProtectedRoute = () => {
  const user = getPublicUser();
  const token = localStorage.getItem('publicToken');

  if (!user || !token || !isJobseekerUser(user)) {
    if (user || token) {
      localStorage.removeItem('publicUser');
      localStorage.removeItem('publicToken');
    }
    return <Navigate to="/login?role=jobseeker" replace />;
  }

  return <Outlet />;
};

export const JobseekerLayout = () => {
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const location = useLocation();

  const pageTitle = useMemo(() => {
    const path = location.pathname.replace(/^\/jobseeker\/?/, '').replace(/\/$/, '');
    if (!path || path === 'dashboard') return 'Dashboard';
    if (path === 'profile') return 'My Profile';
    if (path === 'subscription') return 'My Plan';
    if (path === 'jobs-applied') return 'Jobs Applied';
    if (path === 'saved-jobs') return 'Saved Jobs';
    if (path === 'saved-employers') return 'Saved Employers';
    if (path === 'messages') return 'Messages';
    if (path === 'applications') return 'Applications';
    if (path === 'interviews') return 'Interviews';
    if (path === 'selected') return 'Selected';
    if (path === 'reports') return 'Reports';
    return 'Jobseeker';
  }, [location.pathname]);

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed((current) => !current);
    } else {
      setSidebarOpenMobile((current) => !current);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <JobseekerHeader
        toggleSidebar={handleToggleSidebar}
        title={pageTitle}
        isCollapsed={sidebarCollapsed}
      />

      <div className="relative flex min-w-0 flex-1 ">
        <JobseekerSidebar
          isOpen={sidebarOpenMobile}
          isCollapsed={sidebarCollapsed}
          toggleSidebar={() => setSidebarOpenMobile(false)}
        />

        <div
          className={`flex min-w-0 flex-grow flex-col bg-[#f5f6f8] transition-all duration-300 ${
            sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
          }`}
        >
          <main className="min-w-0 flex-grow overflow-x-hidden p-4 md:p-5 lg:p-6">
            <Outlet />
          </main>

          <JobseekerFooter />
        </div>
      </div>
    </div>
  );
};

export default JobseekerLayout;
