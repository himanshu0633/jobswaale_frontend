import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Menu, X, ChevronDown, User, Briefcase, LogIn, UserPlus, UploadCloud, Building2, LayoutDashboard, LogOut } from 'lucide-react';
import { BASE_API_URL } from '../../context/AuthContext';
import logoAsset from '../../assets/logo-black.png';
import { getPublicSettings } from '../../utils/publicSettings';

export const PublicHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pricingMobileOpen, setPricingMobileOpen] = useState(false);
  const [jobseekersMobileOpen, setJobseekersMobileOpen] = useState(false);
  const [employersMobileOpen, setEmployersMobileOpen] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [jobseekersDesktopOpen, setJobseekersDesktopOpen] = useState(false);
  const [employersDesktopOpen, setEmployersDesktopOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [pricingDesktopOpen, setPricingDesktopOpen] = useState(false); // Added state for pricing dropdown
  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('publicUser') || 'null');
    } catch {
      return null;
    }
  });
  const jobseekersDesktopRef = useRef(null);
  const employersDesktopRef = useRef(null);
  const profileMenuRef = useRef(null);
  const pricingRef = useRef(null); // Added ref for pricing dropdown

  const isLoggedIn = Boolean(authUser);
  const dashboardPath = authUser?.accountType === 'employer' || authUser?.role === 'Employer' || authUser?.role === 'employer'
    ? '/employer'
    : authUser?.accountType === 'jobseeker' || authUser?.role === 'Jobseeker' || authUser?.role === 'jobseeker'
      ? '/jobseeker'
      : '/';
  const profileName = authUser?.firstName || authUser?.name || authUser?.companyName || authUser?.email || 'User';
  const profileInitials = String(profileName)
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const handleLogout = () => {
    localStorage.removeItem('publicUser');
    localStorage.removeItem('publicToken');
    setAuthUser(null);
    setProfileDropdownOpen(false);
    navigate('/', { replace: true });
  };

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
    setPricingMobileOpen(false);
    setJobseekersMobileOpen(false);
    setEmployersMobileOpen(false);
    setJobseekersDesktopOpen(false);
    setEmployersDesktopOpen(false);
    setProfileDropdownOpen(false);
    setPricingDesktopOpen(false); // Close pricing dropdown on route change
  }, [location.pathname]);

  // Close desktop CTA dropdowns when clicking outside of them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (jobseekersDesktopRef.current && !jobseekersDesktopRef.current.contains(event.target)) {
        setJobseekersDesktopOpen(false);
      }
      if (employersDesktopRef.current && !employersDesktopRef.current.contains(event.target)) {
        setEmployersDesktopOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (pricingRef.current && !pricingRef.current.contains(event.target)) {
        setPricingDesktopOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const syncAuthUser = () => {
      try {
        setAuthUser(JSON.parse(localStorage.getItem('publicUser') || 'null'));
      } catch {
        setAuthUser(null);
      }
    };

    syncAuthUser();
    window.addEventListener('storage', syncAuthUser);
    window.addEventListener('focus', syncAuthUser);
    return () => {
      window.removeEventListener('storage', syncAuthUser);
      window.removeEventListener('focus', syncAuthUser);
    };
  }, []);

  // Load public settings to check if registration is enabled
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getPublicSettings();
        setRegistrationEnabled(data?.userRegistration !== false);
      } catch {
        setRegistrationEnabled(true);
      }
    };
    fetchSettings();
  }, []);

  // FIXED: Updated isActive function to prevent /jobseeker-plan from matching /jobs
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[60] w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-2.5 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logoAsset} alt="JobsWaale" className="h-9 sm:h-13 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 ml-8">
          <Link to="/" className={`text-[0.9375rem] font-medium transition duration-150 ${isActive('/') ? 'text-blue-600' : 'text-slate-655 hover:text-blue-600'}`}>
            Home
          </Link>
          <Link to="/jobs" className={`text-[0.9375rem] font-medium transition duration-150 ${isActive('/jobs') ? 'text-blue-600' : 'text-slate-655 hover:text-blue-600'}`}>
            Jobs
          </Link>
          <Link to="/employers" className={`text-[0.9375rem] font-medium transition duration-150 ${isActive('/employers') ? 'text-blue-600' : 'text-slate-655 hover:text-blue-600'}`}>
            Employers
          </Link>
          
          {/* Pricing Dropdown - CHANGED: Now click-based instead of hover */}
          <div className="relative py-2" ref={pricingRef}>
            <button
              onClick={() => setPricingDesktopOpen(!pricingDesktopOpen)}
              className="flex items-center gap-1 text-[0.9375rem] font-medium text-slate-655 hover:text-blue-600 focus:outline-none cursor-pointer"
            >
              Pricing <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${pricingDesktopOpen ? 'rotate-180' : ''}`} />
            </button>
            {pricingDesktopOpen && (
              <div className="absolute top-full left-0 mt-1 block bg-white border border-slate-200 rounded-lg shadow-lg py-2 w-48 z-50">
                <Link to="/jobseeker-plan" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
                  Jobseeker Plan
                </Link>
                <Link to="/employer-plan" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
                  Employer Plan
                </Link>
              </div>
            )}
          </div>

          <Link to="/about" className={`text-[0.9375rem] font-medium transition duration-150 ${isActive('/about') ? 'text-blue-600' : 'text-slate-655 hover:text-blue-600'}`}>
            About Us
          </Link>
        </nav>

        {/* Desktop CTA Action Buttons */}
        <div className="hidden md:flex items-center gap-1">
          {isLoggedIn ? (
            <div className="relative py-2" ref={profileMenuRef}>
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {profileInitials}
                </div>
                
                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {profileDropdownOpen && (
                <div className="absolute top-full right-0 mt-1.5 block w-52 rounded-xl border border-slate-200 bg-white py-2 shadow-xl z-50">
                  <Link to={dashboardPath} onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    <LayoutDashboard className="h-4 w-4 text-slate-400" /> Go to Dashboard
                  </Link>
                  <div onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    <LogOut className="h-4 w-4 text-slate-400" /> Log out
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* For Jobseekers Dropdown */}
              <div className="relative py-2" ref={jobseekersDesktopRef}>
                <button
                  onClick={() => {
                    setJobseekersDesktopOpen((prev) => !prev);
                    setEmployersDesktopOpen(false);
                    setPricingDesktopOpen(false); // Close pricing dropdown when opening this
                  }}
                  className="inline-flex items-center gap-2 bg-[rgb(13,110,253)] hover:bg-[rgb(11,94,215)] text-white font-medium text-base py-1.75 px-5 min-w-[170px] rounded-lg transition duration-150 cursor-pointer shadow-md shadow-blue-600/10"
                >
                  <User className="h-3.5 w-3.5" /> For Jobseekers <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${jobseekersDesktopOpen ? 'rotate-180' : ''}`} />
                </button>
                {jobseekersDesktopOpen && (
                  <div className="absolute top-full right-0 mt-1.5 block bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-52 z-50">
                    <Link to="/login" className="flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition">
                      <LogIn className="h-4 w-4 text-slate-400" /> Login
                    </Link>
                    {registrationEnabled && (
                      <Link to="/jobseeker-register" className="flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition">
                        <UserPlus className="h-4 w-4 text-slate-400" /> Register Free
                      </Link>
                    )}
                    <Link to="/login" className="flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition">
                      <UploadCloud className="h-4 w-4 text-slate-400" /> Upload Resume
                    </Link>
                  </div>
                )}
              </div>

              {/* For Employers Dropdown */}
              <div className="relative py-2" ref={employersDesktopRef}>
                <button
                  onClick={() => {
                    setEmployersDesktopOpen((prev) => !prev);
                    setJobseekersDesktopOpen(false);
                    setPricingDesktopOpen(false); // Close pricing dropdown when opening this
                  }}
                  className="inline-flex items-center gap-2 bg-[rgb(253,126,20)] hover:bg-[rgb(221,107,17)] text-white font-medium  text-base py-1.75 px-5 min-w-[170px] rounded-lg transition duration-150 cursor-pointer shadow-md shadow-orange-600/10"
                >
                  <Briefcase className="h-3.5 w-3.5" /> For Employers <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${employersDesktopOpen ? 'rotate-180' : ''}`} />
                </button>
                {employersDesktopOpen && (
                  <div className="absolute top-full right-0 mt-1.5 block bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-52 z-50">
                    <Link to="/login?role=employer" className="flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition">
                      <LogIn className="h-4 w-4 text-slate-400" /> Employer Login
                    </Link>
                    {registrationEnabled && (
                      <Link to="/employer-register" className="flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition">
                        <Building2 className="h-4 w-4 text-slate-400" /> Register Company
                      </Link>
                    )}
                    <Link to="/login?role=employer" className="flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition">
                      <Briefcase className="h-4 w-4 text-slate-400" /> Post a Job
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Hamburger Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white py-4 px-4 shadow-inner max-h-[80vh] overflow-y-auto">
          <nav className="flex flex-col gap-3.5">
            {isLoggedIn ? (
              <div className="mb-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    {profileInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{profileName}</p>
                    <p className="text-xs text-slate-500">Signed in</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <Link to={dashboardPath} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <LayoutDashboard className="h-4 w-4 text-slate-400" /> Go to Dashboard
                  </Link>
                  <div onClick={handleLogout} className="flex items-center gap-2 text-left text-sm font-semibold text-slate-700">
                    <LogOut className="h-4 w-4 text-slate-400" /> Log out
                  </div>
                </div>
              </div>
            ) : null}
            <Link to="/" className={`text-sm font-bold py-1 ${isActive('/') ? 'text-blue-600' : 'text-slate-655'}`}>
              Home
            </Link>
            <Link to="/jobs" className={`text-sm font-bold py-1 ${isActive('/jobs') ? 'text-blue-600' : 'text-slate-655'}`}>
              Jobs
            </Link>
            <Link to="/employer" className={`text-sm font-bold py-1 ${isActive('/employer') ? 'text-blue-600' : 'text-slate-655'}`}>
              Employers
            </Link>

            {/* Pricing Accordion */}
            <div>
              <button 
                onClick={() => setPricingMobileOpen(!pricingMobileOpen)}
                className="flex items-center justify-between w-full text-sm font-bold py-1 text-slate-655 focus:outline-none cursor-pointer"
              >
                <span>Pricing</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${pricingMobileOpen ? 'rotate-180' : ''}`} />
              </button>
              {pricingMobileOpen && (
                <div className="pl-4 mt-2 flex flex-col gap-2.5 border-l border-slate-100">
                  <Link to="/jobseeker-plan" className="text-xs font-bold text-slate-550 py-1">Jobseeker Plan</Link>
                  <Link to="/employer-plan" className="text-xs font-bold text-slate-550 py-1">Employer Plan</Link>
                </div>
              )}
            </div>

            <Link to="/about" className={`text-sm font-bold py-1 ${isActive('/about') ? 'text-blue-600' : 'text-slate-655'}`}>
              About Us
            </Link>
            <Link to="/contact" className={`text-sm font-bold py-1 ${isActive('/contact') ? 'text-blue-600' : 'text-slate-655'}`}>
              Contact Us
            </Link>
            <Link to="/blogs" className={`text-sm font-bold py-1 ${isActive('/blogs') ? 'text-blue-600' : 'text-slate-655'}`}>
              Blogs
            </Link>

            {!isLoggedIn && (
              <>
                {/* For Jobseekers Accordion */}
                <div className="border-t border-slate-100 pt-3 mt-1">
                  <button 
                    onClick={() => setJobseekersMobileOpen(!jobseekersMobileOpen)}
                    className="flex items-center justify-between w-full text-sm font-bold py-2 text-blue-600 focus:outline-none cursor-pointer"
                  >
                    <span className="flex items-center gap-2"><User className="h-4 w-4" /> For Jobseekers</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${jobseekersMobileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {jobseekersMobileOpen && (
                    <div className="pl-4 mt-1 flex flex-col gap-2 border-l border-blue-100">
                      <Link to="/login" className="flex items-center gap-2 py-2 text-xs font-bold text-slate-700">
                        <LogIn className="h-4 w-4 text-slate-400" /> Login
                      </Link>
                      {registrationEnabled && (
                        <Link to="/jobseeker-register" className="flex items-center gap-2 py-2 text-xs font-bold text-slate-700">
                          <UserPlus className="h-4 w-4 text-slate-400" /> Register Free
                        </Link>
                      )}
                      <Link to="/login" className="flex items-center gap-2 py-2 text-xs font-bold text-slate-700">
                        <UploadCloud className="h-4 w-4 text-slate-400" /> Upload Resume
                      </Link>
                    </div>
                  )}
                </div>

                {/* For Employers Accordion */}
                <div className="border-t border-slate-100 pt-3">
                  <button 
                    onClick={() => setEmployersMobileOpen(!employersMobileOpen)}
                    className="flex items-center justify-between w-full text-sm font-bold py-2 text-orange-600 focus:outline-none cursor-pointer"
                  >
                    <span className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> For Employers</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${employersMobileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {employersMobileOpen && (
                    <div className="pl-4 mt-1 flex flex-col gap-2 border-l border-orange-100">
                      <Link to="/login?role=employer" className="flex items-center gap-2 py-2 text-xs font-bold text-slate-700">
                        <LogIn className="h-4 w-4 text-slate-400" /> Employer Login
                      </Link>
                      {registrationEnabled && (
                        <Link to="/employer-register" className="flex items-center gap-2 py-2 text-xs font-bold text-slate-700">
                          <Building2 className="h-4 w-4 text-slate-400" /> Register Company
                        </Link>
                      )}
                      <Link to="/login?role=employer" className="flex items-center gap-2 py-2 text-xs font-bold text-slate-700">
                        <Briefcase className="h-4 w-4 text-slate-400" /> Post a Job
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;