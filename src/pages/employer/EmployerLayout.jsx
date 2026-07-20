/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import EmployerFooter from './components/EmployerFooter';
import EmployerHeader from './components/EmployerHeader';
import EmployerSidebar from './components/EmployerSidebar';
import { MessageSocketProvider } from '../../context/MessageSocketContext';
import ProfileCompletionPopup from '../../components/ProfileCompletionPopup';

const getPublicUser = () => {
  try {
    return JSON.parse(localStorage.getItem('publicUser') || 'null');
  } catch {
    return null;
  }
};

export const isEmployerUser = (user) => {
  const accountType = String(user?.accountType || '').trim().toLowerCase();
  const role = String(user?.role || '').trim().toLowerCase();
  if (accountType) return accountType === 'employer';
  return role === 'employer';
};

export const EmployerProtectedRoute = () => {
  const user = getPublicUser();
  const token = localStorage.getItem('publicToken');

  if (!user || !token || !isEmployerUser(user)) {
    if (user || token) {
      localStorage.removeItem('publicUser');
      localStorage.removeItem('publicToken');
    }
    return <Navigate to="/login?role=employer" replace />;
  }

  return <Outlet />;
};

export const EmployerLayout = () => {
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed((current) => !current);
    } else {
      setSidebarOpenMobile((current) => !current);
    }
  };

  return (
    <MessageSocketProvider role="employer">
      <div className="portal-shell flex min-h-screen flex-col bg-slate-50">
        <EmployerHeader toggleSidebar={handleToggleSidebar} isCollapsed={sidebarCollapsed} />
        <div className="relative flex min-w-0 flex-1 pt-[66px]">
          <ProfileCompletionPopup portal="employer" />
          <EmployerSidebar
            isOpen={sidebarOpenMobile}
            isCollapsed={sidebarCollapsed}
            toggleSidebar={() => setSidebarOpenMobile(false)}
          />
          <div className={`portal-content flex min-w-0 flex-grow flex-col bg-[#f5f6f8] transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
            <main className="min-w-0 flex-grow overflow-x-hidden p-4 md:p-5 lg:p-6">
              <Outlet />
            </main>
            <EmployerFooter />
          </div>
        </div>
      </div>
    </MessageSocketProvider>
  );
};

export default EmployerLayout;
