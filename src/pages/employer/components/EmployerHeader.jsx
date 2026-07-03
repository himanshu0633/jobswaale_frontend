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
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-slate-600 text-slate-100 shadow-sm"
      style={{ height: 66, backgroundColor: '#303a44', paddingLeft: 40, paddingRight: 40 }}
    >
      <div className="flex h-full min-w-0 items-center" style={{ gap: 30 }}>
        <div className="flex h-full shrink-0 items-center" style={{ width: 220 }}>
          <Link to="/employer" className="flex items-center">
            <img src={logo} alt="JobsWaale" className="h-auto w-auto shrink-0" style={{ maxHeight: 42 }} />
          </Link>
        </div>

        <button
          type="button"
          onClick={toggleSidebar}
          className="flex shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-500/70 bg-slate-700/20 text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
          style={{ width: 38, height: 38 }}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          to="/employer/jobs/create"
          className="hidden shrink-0 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-4 text-[13px] font-extrabold text-white shadow-md shadow-indigo-950/10 transition hover:bg-[#5848d8] sm:inline-flex"
          style={{ height: 36 }}
        >
          <Plus className="h-4 w-4" />
          Post a Job
        </Link>
      </div>

      <div className="flex h-full min-w-0 items-center" style={{ gap: 18 }}>
        <div className="relative hidden lg:block" style={{ width: 270 }}>
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Quick Search..."
            className="h-9 w-full rounded-full border border-slate-600/30 bg-slate-600/30 py-2 pr-4 text-[13px] font-semibold text-slate-100 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            style={{ paddingLeft: 42 }}
          />
        </div>

        <div className="hidden items-center gap-3 md:flex">
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
          <button type="button" onClick={toggleFullscreen} className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white" aria-label="Fullscreen">
            <Maximize className="h-4.5 w-4.5" />
          </button>
          <button type="button" className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white" aria-label="Theme settings">
            <Palette className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((current) => !current)}
            className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-slate-700/70"
          >
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
              alt="profile"
              className="h-8 w-8 rounded-full border-2 border-emerald-400 object-cover"
            />
            <span className="hidden items-center gap-1 text-sm font-extrabold text-slate-300 md:flex">
              <span className="max-w-32 truncate">{displayName}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </span>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 py-1.5 shadow-xl shadow-slate-950/50">
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
