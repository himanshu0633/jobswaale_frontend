import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Moon, Settings, Star, Sun, User } from 'lucide-react';
import { NotificationDropdown } from '../../../components/NotificationDropdown';

const getJobseekerUser = () => {
  try {
    return JSON.parse(localStorage.getItem('publicUser') || 'null');
  } catch {
    return null;
  }
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const JobseekerHeader = ({ toggleSidebar, title, isCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('jobseekerTheme') || 'light');
  const user = getJobseekerUser();
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Rahul Kumar';
  const plan = user?.planName || 'Free Plan';
  const initials = getInitials(displayName) || 'RK';

  const pageTitle = title || useMemo(() => {
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
  }, [location.pathname, title]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('publicUser');
      localStorage.removeItem('publicToken');
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    document.documentElement.dataset.jobseekerTheme = theme;
    localStorage.setItem('jobseekerTheme', theme);
    return () => {
      delete document.documentElement.dataset.jobseekerTheme;
    };
  }, [theme]);

  return (
    <header
      className={`portal-header sticky top-0 z-[1030] flex h-16 items-center justify-between border-b px-4 sm:px-6 transition-all duration-300 ${
        theme === 'dark'
          ? 'border-slate-800 bg-slate-900 text-slate-100'
          : 'border-[#e2e8f0] bg-white text-[#0f172a]'
      } ${
        isCollapsed
          ? 'lg:ml-16 lg:w-[calc(100%-4rem)]'
          : 'lg:ml-64 lg:w-[calc(100%-16rem)]'
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          className={`block xl:hidden ${theme === 'dark' ? 'text-slate-300' : 'text-[#475569]'}`}
        >
          <Menu className="h-6 w-6" />
        </button>
        <h5 className={`text-[1.1rem] font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-[#0f172a]'}`}>{pageTitle}</h5>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
            theme === 'dark'
              ? 'border-slate-700 bg-slate-800 text-slate-300 hover:border-blue-500 hover:text-white'
              : 'border-[#e2e8f0] bg-white text-[#475569] hover:border-[#0047C7] hover:bg-[#f8fafc] hover:text-[#0047C7]'
          }`}
        >
          {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>
        <NotificationDropdown theme={theme} />

        <div className="relative">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setDropdownOpen((current) => !current)}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-1.5 transition-colors ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-[#f8fafc]'}`}
          >
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#0047C7] text-[0.85rem] font-semibold text-white">
              {initials}
            </div>
            <div className="hidden sm:block">
              <div className={`text-[0.85rem] font-semibold leading-tight ${theme === 'dark' ? 'text-slate-100' : 'text-[#0f172a]'}`}>{displayName}</div>
              <div className="text-[0.7rem] text-[#94a3b8]">{plan}</div>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-[#94a3b8] sm:block" />
          </div>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <ul className="absolute right-0 z-20 mt-2 min-w-[200px] rounded-[10px] border border-[#e2e8f0] bg-white py-1.5 shadow-md">
                <li>
                  <Link
                    to="/jobseeker/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#475569] hover:bg-[#f8fafc]"
                  >
                    <User className="h-4 w-4" /> My Account
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jobseeker/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#475569] hover:bg-[#f8fafc]"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jobseeker/subscription"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#475569] hover:bg-[#f8fafc]"
                  >
                    <Star className="h-4 w-4" /> Upgrade Plan
                  </Link>
                </li>
                <li className="my-1 border-t border-[#e2e8f0]" />
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-[#f8fafc]"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </li>
              </ul>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default JobseekerHeader;
