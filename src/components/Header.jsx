import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  LayoutGrid, 
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
  CheckCircle2
} from 'lucide-react';
import { useAuth, BASE_API_URL } from '../context/AuthContext';
import logo from '../assets/logo.png';
import logoSm from '../assets/logo-sm.png';

export const Header = ({ toggleSidebar, isCollapsed, title = '' }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 lg:h-18 bg-slate-900 text-slate-100 shadow-sm border-b border-slate-800 pr-6 ">
        
        {/* Left: Brand Logo & Toggle Menu & Search */}
        <div className="flex items-center gap-4 flex-1 h-full">
          {/* Logo container aligning with sidebar below it */}
          <div className={`flex items-center h-full border-r border-slate-800 transition-all duration-300 shrink-0 ${isCollapsed ? 'w-16 justify-center' : 'w-28 lg:w-64 px-3 lg:px-6'}`}>
            <Link to="/" className="flex items-center">
              {isCollapsed ? (
                <img src={logoSm} alt="JobsWaale" className="w-10 h-auto shrink-0 animate-in fade-in duration-200" />
              ) : (
                <img src={logo} alt="JobsWaale" className="h-10 w-auto shrink-0 animate-in fade-in duration-200" />
              )}
            </Link>
          </div>

          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 bg-slate-800/20 transition-colors"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
          
          {/* Quick Search */}
          <div className="relative hidden md:block w-64">
            <input
              type="text"
              placeholder="Quick Search..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* Right: Quick Tools & Profile Dropdown */}
        <div className="flex items-center gap-4 h-[100%] ">
          
          {/* Quick Tools */}
          <div className="hidden sm:flex items-center gap-2  ]">
            <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ">
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Sun className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Palette className="w-5 h-5" />
            </button>
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-6 bg-slate-800 hidden sm:block" />

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
                alt="profile"
                className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover"
              />
              <span className="hidden text-sm font-semibold text-slate-200 md:flex items-center gap-1">
                <span>Admin</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
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
                <div className="absolute right-0 z-20 w-52 py-1.5 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl shadow-slate-950/50 ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Signed in as</p>
                    <p className="text-xs font-semibold text-slate-300 truncate mt-0.5">{user?.email || 'admin@jobswaale.com'}</p>
                  </div>
                  
                  {/* Create Admin Trigger */}
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center w-full gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-indigo-400" />
                    <span>Create New Admin</span>
                  </button>

                  <button
                    onClick={logout}
                    className="flex items-center w-full gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/20 transition-colors border-t border-slate-800/60"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Create Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>Create New Admin</span>
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setAdminSuccess('');
                  setAdminError('');
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAdmin} className="p-5 space-y-4">
              {adminSuccess && (
                <div className="p-3.5 text-xs font-semibold rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{adminSuccess}</span>
                </div>
              )}
              {adminError && (
                <div className="p-3.5 text-xs font-semibold rounded-xl bg-rose-50 border border-rose-100 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Admin Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@jobswaale.com"
                    className="w-full pl-9.5 pr-4 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Temporary Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9.5 pr-4 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminLoading}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/10 transition-colors disabled:bg-indigo-400"
                >
                  {adminLoading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
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
