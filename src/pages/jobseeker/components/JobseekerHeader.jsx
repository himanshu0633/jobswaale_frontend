import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';
import { ChevronDown, LogOut, Menu, Moon, Search, Settings, Star, Sun, User } from 'lucide-react';
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

  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [allJobs, setAllJobs] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchJobs = async () => {
      if (allJobs.length > 0) return;
      try {
        const token = localStorage.getItem('publicToken');
        const response = await axios.get(`${BASE_API_URL}/jobs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const mapped = (response.data || []).map((job) => ({
          id: job.slug || job._id,
          title: job.jobTitle,
          company: job.companyName,
          category: job.jobCategory?.categoryName || ''
        }));
        setAllJobs(mapped);
      } catch {
        setAllJobs([]);
      }
    };
    fetchJobs();
  }, [allJobs]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredJobs = useMemo(() => {
    if (!searchValue.trim()) return [];
    const kw = searchValue.toLowerCase();
    return allJobs
      .filter(
        (job) =>
          String(job.title || '').toLowerCase().includes(kw) ||
          String(job.company || '').toLowerCase().includes(kw) ||
          String(job.category || '').toLowerCase().includes(kw)
      )
      .slice(0, 6);
  }, [searchValue, allJobs]);

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

      <div className="relative hidden xl:block xl:w-[270px]" ref={searchRef}>
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Quick Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          className={`h-9 w-full rounded-full border py-2 pr-4 pl-[42px] text-[13px] font-semibold outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 ${
            theme === 'dark'
              ? 'border-slate-600/30 bg-slate-800 text-slate-100'
              : 'border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a]'
          }`}
        />

        {searchFocused && searchValue.trim() && (
          <ul
            className={`absolute top-full mt-2 w-full max-h-80 overflow-y-auto rounded-[10px] border py-1 shadow-lg ${
              theme === 'dark'
                ? 'border-slate-700 bg-slate-800 text-slate-100'
                : 'border-[#e2e8f0] bg-white text-[#0f172a]'
            }`}
          >
            {filteredJobs.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400">No matching jobs found</li>
            ) : (
              filteredJobs.map((job) => (
                <li key={job.id} className="border-b border-transparent last:border-0">
                  <Link
                    to={`/jobs/${job.id}`}
                    onClick={() => {
                      setSearchValue('');
                      setSearchFocused(false);
                    }}
                    className={`block px-4 py-2 text-[13px] font-medium hover:bg-indigo-50 ${
                      theme === 'dark' ? 'hover:bg-slate-700' : ''
                    } text-[#0047C7] hover:text-[#0052cc]`}
                  >
                    <div>{job.title}</div>
                    <div className="text-xs text-slate-400">{job.company}</div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        )}
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
