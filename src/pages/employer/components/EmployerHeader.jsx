import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Grid2X2,
  LogOut,
  Maximize,
  Menu,
  Moon,
  Palette,
  Plus,
  Search,
  Sun
} from 'lucide-react';
import logo from '../../../assets/logo.png';

const getEmployerUser = () => {
  try {
    return JSON.parse(localStorage.getItem('publicUser') || 'null');
  } catch {
    return null;
  }
};

export const EmployerHeader = ({ toggleSidebar, isCollapsed }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('employerTheme') || 'light');
  const user = getEmployerUser();
  const displayName = user?.firstName || user?.companyName || 'Nitika';

  useEffect(() => {
    document.documentElement.dataset.employerTheme = theme;
    localStorage.setItem('employerTheme', theme);
  }, [theme]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('publicUser');
    localStorage.removeItem('publicToken');
    navigate('/login?role=employer', { replace: true });
  };

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between gap-2 border-b border-slate-600 px-3 text-slate-100 shadow-sm sm:h-[66px] sm:gap-4 sm:px-6 lg:px-10"
      style={{ backgroundColor: '#303a44' }}
    >
      <div className="flex h-full min-w-0 items-center gap-2 sm:gap-4 lg:gap-[30px]">
        <div className="flex h-full shrink-0 items-center lg:w-[220px]">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="JobsWaale" className="h-auto w-auto max-h-8 shrink-0 sm:max-h-[42px]" />
          </Link>
        </div>

        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-500/70 bg-slate-700/20 text-slate-200 transition-colors hover:bg-slate-700 hover:text-white sm:h-[38px] sm:w-[38px]"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </button>

        <Link
          to="/employer/jobs/create"
          className="hidden h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-4 text-[13px] font-extrabold text-white shadow-md shadow-indigo-950/10 transition hover:bg-[#5848d8] sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden lg:inline">Post a Job</span>
          <span className="lg:hidden">Post</span>
        </Link>
      </div>

      <div className="flex h-full min-w-0 items-center gap-1.5 sm:gap-3 lg:gap-[18px]">
        <div className="relative hidden xl:block xl:w-[270px]">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Quick Search..."
            className="h-9 w-full rounded-full border border-slate-600/30 bg-slate-600/30 py-2 pr-4 pl-[42px] text-[13px] font-semibold text-slate-100 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />
        </div>

        <div className="hidden items-center gap-1 md:flex lg:gap-3">
          <button type="button" className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white" aria-label="Apps">
            <Grid2X2 className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
            className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
          <button type="button" onClick={toggleFullscreen} className="hidden rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white lg:block" aria-label="Fullscreen">
            <Maximize className="h-4.5 w-4.5" />
          </button>
          <button type="button" className="hidden rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white lg:block" aria-label="Theme settings">
            <Palette className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setDropdownOpen((current) => !current)}
            className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-slate-700/70 sm:gap-3"
          >
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
              alt="profile"
              className="h-7 w-7 shrink-0 rounded-full border-2 border-emerald-400 object-cover sm:h-8 sm:w-8"
            />
            <span className="hidden items-center gap-1 text-sm font-extrabold text-slate-300 md:flex">
              <span className="max-w-24 truncate lg:max-w-32">{displayName}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </span>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-slate-800 bg-slate-900 py-1.5 shadow-xl shadow-slate-950/50 sm:w-56">
                <div className="border-b border-slate-800 px-4 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Signed in as</p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-slate-300">{user?.email || 'employer@jobswaale.com'}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-950/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default EmployerHeader;
