import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  LayoutGrid, 
  Moon,
  Sun, 
  Maximize, 
  Palette, 
  ChevronDown, 
  LogOut, 
  UserPlus, 
  X, 
  Mail, 
  Key, 
  Loader,
  AlertCircle,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { useAuth, BASE_API_URL } from '../context/AuthContext';
import logo from '../assets/logo.png';
import logoSm from '../assets/logo-sm.png';

export const Header = ({ toggleSidebar, isCollapsed, title = '' }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || 'light');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Admin creation states
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState('');
  const [adminError, setAdminError] = useState('');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    document.documentElement.dataset.adminTheme = theme;
    localStorage.setItem('adminTheme', theme);
    return () => {
      delete document.documentElement.dataset.adminTheme;
    };
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminSuccess('');
    setAdminError('');
    setAdminLoading(true);

    try {
      const response = await axios.post(`${BASE_API_URL}/auth/create-admin`, {
        email: newAdminEmail,
        password: newAdminPassword
      });
      setAdminSuccess(`Admin account ${response.data.email} created successfully!`);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setTimeout(() => {
        setIsModalOpen(false);
        setAdminSuccess('');
      }, 2000);
    } catch (err) {
      setAdminError(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setAdminLoading(false);
    }
  };

  // Close mobile search on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileSearchOpen) {
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileSearchOpen]);

  return (
    <>
      <header className={`fixed left-0 right-0 top-0 z-[60] flex h-14 sm:h-16 items-center justify-between pr-3 sm:pr-6 shadow-sm border-b transition-colors ${
        theme === 'dark'
          ? 'bg-slate-900 text-slate-100 border-slate-800'
          : 'bg-white text-slate-700 border-slate-200'
      }`}>
        
        {/* Left: Brand Logo & Toggle Menu */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 h-full min-w-0">
          {/* Logo container */}
          <div className={`flex items-center h-full border-r transition-all duration-300 shrink-0 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} ${isCollapsed ? 'w-14 sm:w-16 justify-center' : 'w-24 sm:w-28 lg:w-64 px-2 sm:px-3 lg:px-6'}`}>
            <Link to="/admin" className="flex items-center">
              {isCollapsed ? (
                <img src={logoSm} alt="JobsWaale" className="w-8 sm:w-10 h-auto shrink-0 animate-in fade-in duration-200" />
              ) : (
                <img src={logo} alt="JobsWaale" className="h-8 sm:h-10 w-auto shrink-0 animate-in fade-in duration-200" />
              )}
            </Link>
          </div>

          <button
            onClick={toggleSidebar}
            className={`p-1.5 sm:p-2 rounded-lg border transition-colors shrink-0 ${
              theme === 'dark'
                ? 'text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800 bg-slate-800/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-slate-200 bg-slate-50'
            }`}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
          
          {/* Quick Search - Desktop */}
          <div className="relative hidden md:block flex-1 max-w-xs lg:max-w-sm">
            <input
              type="text"
              placeholder="Quick Search..."
              className={`w-full rounded-lg border pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all ${
                theme === 'dark'
                  ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          </div>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className={`md:hidden p-1.5 sm:p-2 rounded-lg transition-colors shrink-0 ${theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
            aria-label="Open search"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Right: Quick Tools & Profile Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-3 h-full">
          
          {/* Quick Tools */}
          <div className="hidden sm:flex items-center gap-1 lg:gap-2">
            <button 
              className={`p-1.5 lg:p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              aria-label="Dashboard grid"
            >
              <LayoutGrid className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className={`p-1.5 lg:p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 lg:w-5 lg:h-5" /> : <Moon className="w-4 h-4 lg:w-5 lg:h-5" />}
            </button>
            <button 
              onClick={toggleFullscreen}
              className={`hidden lg:flex p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              aria-label="Toggle fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </button>
            <button 
              className={`hidden xl:flex p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              aria-label="Theme palette"
            >
              <Palette className="w-5 h-5" />
            </button>
          </div>

          {/* Vertical Divider */}
          <div className={`w-px h-5 sm:h-6 hidden sm:block ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-1.5 sm:gap-2.5 p-1 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              aria-label="User menu"
            >
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
                alt="profile"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-indigo-500/30 object-cover"
              />
              <span className={`hidden md:flex text-xs sm:text-sm font-semibold items-center gap-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                <span className="max-w-[80px] lg:max-w-none truncate">Admin</span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
              </span>
            </button>

            {dropdownOpen && (
              <>
                {/* Backdrop to close dropdown */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 z-20 w-48 sm:w-52 py-1.5 mt-1.5 sm:mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl shadow-slate-950/50 ring-1 ring-black ring-opacity-5">
                  <div className="px-3 sm:px-4 py-2 border-b border-slate-800">
                    <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-wider">Signed in as</p>
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-300 truncate mt-0.5 max-w-[140px] sm:max-w-none">
                      {user?.email || 'admin@jobswaale.com'}
                    </p>
                  </div>
                  
                  {/* Create Admin Trigger */}
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center w-full gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                    <span>Create New Admin</span>
                  </button>

                  <button
                    onClick={logout}
                    className="flex items-center w-full gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-rose-400 hover:bg-rose-950/20 transition-colors border-t border-slate-800/60"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Modal */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[70] md:hidden bg-slate-900/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3 p-3 sm:p-4 border-b border-slate-800">
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close search"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                autoFocus
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-500 text-center">Type to search...</p>
          </div>
        </div>
      )}

      {/* Create Admin Modal - Fully Responsive */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[95%] sm:max-w-md mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50 z-10">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                <span>Create New Admin</span>
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setAdminSuccess('');
                  setAdminError('');
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAdmin} className="p-4 sm:p-5 space-y-4">
              {adminSuccess && (
                <div className="p-3 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="break-words">{adminSuccess}</span>
                </div>
              )}
              {adminError && (
                <div className="p-3 text-xs sm:text-sm font-semibold rounded-xl bg-rose-50 border border-rose-100 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                  <span className="break-words">{adminError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 sm:mb-2">
                  Admin Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@jobswaale.com"
                    className="w-full pl-8 sm:pl-9.5 pr-3 sm:pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 sm:mb-2">
                  Temporary Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-8 sm:pl-9.5 pr-3 sm:pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 sm:pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/10 transition-colors disabled:bg-indigo-400"
                >
                  {adminLoading ? <Loader className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  <span>{adminLoading ? 'Creating...' : 'Create Admin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
