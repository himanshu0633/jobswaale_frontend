import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Bookmark,
  Building,
  Building2,
  CalendarCheck,
  ChevronDown,
  CreditCard,
  Database,
  FileText,
  Grid2X2,
  LogIn,
  LogOut,
  MailCheck,
  Menu,
  MessageCircle,
  MessageSquare,
  Search,
  Settings,
  Star,
  UploadCloud,
  User,
  UserCheck,
  UserPlus,
  UserRoundCheck,
  X,
  Briefcase,
  LayoutDashboard
} from 'lucide-react';
import { BASE_API_URL } from '../../context/AuthContext';
import logoAsset from '../../assets/logo-black.png';
import { getPublicSettings } from '../../utils/publicSettings';
import { NotificationDropdown } from '../../components/NotificationDropdown';

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
  const [dashboardDesktopOpen, setDashboardDesktopOpen] = useState(false);
  const [dashboardMobileOpen, setDashboardMobileOpen] = useState(false);
  const [jobseekerProfile, setJobseekerProfile] = useState({
    name: '',
    role: 'Job Seeker',
    jobSearchStatus: 'looking',
    profileCompletionScore: 0
  });
  const [savingJobStatus, setSavingJobStatus] = useState(false);
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
  const dashboardRef = useRef(null);

  const isLoggedIn = Boolean(authUser);
  const accountType = String(authUser?.accountType || authUser?.role || authUser?.roleName || '').trim().toLowerCase();
  const isEmployerUser = accountType === 'employer';
  const isJobseekerUser = accountType === 'jobseeker';
  const pricingPath = (() => {
    if (!isLoggedIn) return null;
    if (isEmployerUser) return '/employer-plan';
    if (isJobseekerUser) return '/jobseeker-plan';
    return null;
  })();
  const employerDashboardLinks = [
    { to: '/employer', icon: Grid2X2, label: 'Dashboard' },
    { to: '/employer/jobs/create', icon: Briefcase, label: 'Post a Job' },
    { to: '/employer/jobs', icon: Briefcase, label: 'Manage Jobs' },
    { to: '/employer/applications', icon: FileText, label: 'Applications' },
    { to: '/employer/applicant-history', icon: UserRoundCheck, label: 'Applicants History' },
    { to: '/employer/shortlisted', icon: UserCheck, label: 'Shortlisted' },
    { to: '/employer/interviews', icon: CalendarCheck, label: 'Interviews' },
    { to: '/employer/selected', icon: UserPlus, label: 'Selected' },
    { to: '/employer/candidates', icon: Search, label: 'Search Candidates' },
    { to: '/employer/auto-mail', icon: MailCheck, label: 'Auto Mail' },
    { to: '/employer/reports', icon: Grid2X2, label: 'Reports' },
    { to: '/employer/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/employer/company', icon: Building2, label: 'Company Profile' },
    { to: '/employer/subscription', icon: CreditCard, label: 'Subscription' },
    { to: '/employer/talent-pool', icon: Database, label: 'Talent Pool' },
    { to: '/employer/settings', icon: Settings, label: 'Settings' }
  ];
  const jobseekerDashboardLinks = [
    { to: '/jobseeker/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/jobseeker/jobs-applied', icon: Briefcase, label: 'Jobs Applied' },
    { to: '/jobseeker/saved-jobs', icon: Bookmark, label: 'Saved Jobs' },
    { to: '/jobseeker/saved-employers', icon: Building, label: 'Saved Employers' },
    { to: '/jobseeker/messages', icon: MessageSquare, label: 'Messages' }
  ];
  const dashboardMenuLinks = isEmployerUser ? employerDashboardLinks : isJobseekerUser ? jobseekerDashboardLinks : [];
  const jobseekerName = jobseekerProfile.name || [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ').trim();
  const profileName = isJobseekerUser
    ? jobseekerName || authUser?.name || authUser?.email || 'Job Seeker'
    : authUser?.companyName || authUser?.firstName || authUser?.name || authUser?.email || 'User';
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

  const profileScore = Math.min(Math.max(Number(jobseekerProfile.profileCompletionScore || 0), 0), 100);
  const isLookingForJob = jobseekerProfile.jobSearchStatus !== 'not-looking';

  const handleJobSearchStatusToggle = async () => {
    if (!isJobseekerUser || savingJobStatus) return;
    const nextStatus = isLookingForJob ? 'not-looking' : 'looking';
    const previousStatus = jobseekerProfile.jobSearchStatus || 'looking';
    const token = localStorage.getItem('publicToken');

    setSavingJobStatus(true);
    setJobseekerProfile((current) => ({ ...current, jobSearchStatus: nextStatus }));

    try {
      await axios.put(
        `${BASE_API_URL}/jobseeker/profile`,
        { jobSearchStatus: nextStatus },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
    } catch {
      setJobseekerProfile((current) => ({ ...current, jobSearchStatus: previousStatus }));
      window.alert('Failed to update job search status. Please try again.');
    } finally {
      setSavingJobStatus(false);
    }
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
    setDashboardDesktopOpen(false);
    setDashboardMobileOpen(false);
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
      if (dashboardRef.current && !dashboardRef.current.contains(event.target)) {
        setDashboardDesktopOpen(false);
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

  useEffect(() => {
    if (!isJobseekerUser) return;
    let isMounted = true;
    const token = localStorage.getItem('publicToken');

    axios
      .get(`${BASE_API_URL}/jobseeker/profile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      .then((response) => {
        if (isMounted) {
          setJobseekerProfile((current) => ({ ...current, ...response.data }));
        }
      })
      .catch(() => {
        if (isMounted) {
          setJobseekerProfile((current) => ({
            ...current,
            name: jobseekerName || current.name || 'Job Seeker'
          }));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isJobseekerUser, authUser?.firstName, authUser?.lastName]);

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
  const isPricingActive = isActive('/jobseeker-plan') || isActive('/employer-plan');
  const isDashboardActive = isEmployerUser ? isActive('/employer') : isJobseekerUser ? isActive('/jobseeker') : false;

  return (
    <header className="fixed inset-x-0 top-0 z-[60] w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-2.5 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logoAsset} alt="JobsWaale" className="h-9 sm:h-10 md:h-11 lg:h-12 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-8 ml-4 xl:ml-8">
          <Link to="/" className={`text-[0.9375rem] font-medium transition duration-150 whitespace-nowrap ${isActive('/') ? 'text-blue-600' : 'text-slate-655 hover:text-blue-600'}`}>
            Home
          </Link>
          <Link to="/jobs" className={`text-[0.9375rem] font-medium transition duration-150 whitespace-nowrap ${isActive('/jobs') ? 'text-blue-600' : 'text-slate-655 hover:text-blue-600'}`}>
            Jobs
          </Link>
          <Link to="/employers" className={`text-[0.9375rem] font-medium transition duration-150 whitespace-nowrap ${isActive('/employers') ? 'text-blue-600' : 'text-slate-655 hover:text-blue-600'}`}>
            Employers
          </Link>

          {isLoggedIn && dashboardMenuLinks.length > 0 && (
            <div
              className="relative py-2"
              ref={dashboardRef}
              onMouseEnter={() => setDashboardDesktopOpen(true)}
              onMouseLeave={() => setDashboardDesktopOpen(false)}
            >
              <button
                type="button"
                onClick={() => {
                  setDashboardDesktopOpen((prev) => !prev);
                  setPricingDesktopOpen(false);
                }}
                className={`flex items-center gap-1 text-[0.9375rem] font-medium hover:text-blue-600 focus:outline-none cursor-pointer whitespace-nowrap ${isDashboardActive ? 'text-blue-600' : 'text-slate-655'}`}
              >
                Dashboard <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dashboardDesktopOpen ? 'rotate-180' : ''}`} />
              </button>
              {dashboardDesktopOpen && (
                <div className="absolute top-full left-0 mt-1 block w-72 rounded-lg border border-slate-200 bg-white py-2 shadow-lg z-50">
                  <div className="max-h-[430px] overflow-y-auto">
                    {dashboardMenuLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={`${item.to}-${item.label}`}
                          to={item.to}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
                        >
                          <Icon className="h-4 w-4 text-slate-400" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {pricingPath ? (
            <Link to={pricingPath} className={`flex items-center gap-1 text-[0.9375rem] font-medium hover:text-blue-600 focus:outline-none cursor-pointer whitespace-nowrap ${isPricingActive ? 'text-blue-600' : 'text-slate-655'}`}>
              Pricing
            </Link>
          ) : (
            <div className="relative py-2" ref={pricingRef}>
              <button
                onClick={() => setPricingDesktopOpen(!pricingDesktopOpen)}
                className={`flex items-center gap-1 text-[0.9375rem] font-medium hover:text-blue-600 focus:outline-none cursor-pointer whitespace-nowrap ${isPricingActive ? 'text-blue-600' : 'text-slate-655'}`}
              >
                Pricing <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${pricingDesktopOpen ? 'rotate-180' : ''}`} />
              </button>
              {pricingDesktopOpen && (
                <div className="absolute top-full left-0 mt-1 block bg-white border border-slate-200 rounded-lg shadow-lg py-2 w-48 z-50">
                  <Link to="/jobseeker-plan" className={`block px-4 py-2 text-xs font-bold hover:bg-slate-50 transition ${isActive('/jobseeker-plan') ? 'text-blue-600' : 'text-slate-700'}`}>
                    Jobseeker Plan
                  </Link>
                  <Link to="/employer-plan" className={`block px-4 py-2 text-xs font-bold hover:bg-slate-50 transition ${isActive('/employer-plan') ? 'text-blue-600' : 'text-slate-700'}`}>
                    Employer Plan
                  </Link>
                </div>
              )}
            </div>
          )}

          <Link to="/about" className={`text-[0.9375rem] font-medium transition duration-150 whitespace-nowrap ${isActive('/about') ? 'text-blue-600' : 'text-slate-655 hover:text-blue-600'}`}>
            About Us
          </Link>
        </nav>

        {/* Desktop CTA Action Buttons */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          {isLoggedIn ? (
            <>
              <NotificationDropdown />
              <div className="relative py-2" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    {profileInitials}
                  </div>
                  <span className="hidden items-center gap-1 text-sm font-extrabold sm:flex">
                    <span className="max-w-24 truncate lg:max-w-32">{profileName}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                {profileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1.5 block w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl z-50">
                    {isJobseekerUser && (
                      <div className="mx-2 mb-2 rounded-lg bg-[#002856] p-3 text-white">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FF6B00] text-sm font-black text-white">
                            {profileInitials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-extrabold leading-tight">{profileName}</p>
                            <p className="mt-0.5 text-xs font-semibold text-white/55">Job Seeker</p>
                            <div className="mt-2">
                              <div className="mb-1 flex items-center justify-between text-[11px] font-black text-white/55">
                                <span>Profile score</span>
                                <span>{profileScore}%</span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                                <div className="h-full rounded-full bg-[#FF6B00]" style={{ width: `${profileScore}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleJobSearchStatusToggle}
                          disabled={savingJobStatus}
                          className="mt-3 flex w-full items-center justify-between gap-3 rounded-lg bg-white/[0.07] px-3 py-2.5 text-left transition hover:bg-white/[0.12] disabled:opacity-70"
                        >
                          <span>
                            <span className="block text-xs font-extrabold text-white">Job Search Status</span>
                            <span className={`mt-0.5 block text-xs font-bold ${isLookingForJob ? 'text-emerald-300' : 'text-white/50'}`}>
                              {isLookingForJob ? 'Looking for job' : 'Not looking'}
                            </span>
                          </span>
                          <span className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${isLookingForJob ? 'bg-emerald-500' : 'bg-white/20'}`}>
                            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${isLookingForJob ? 'translate-x-5' : 'translate-x-0.5'}`} />
                          </span>
                        </button>
                      </div>
                    )}
                    <div className="border-b border-slate-200 px-4 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Signed in as</p>
                      <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">{authUser?.email || 'user@jobswaale.com'}</p>
                    </div>
                    <Link to={isJobseekerUser ? '/jobseeker/profile' : '/employer/company'} onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                      <User className="h-4 w-4 text-slate-400" /> My Profile
                    </Link>
                    <Link to={isJobseekerUser ? '/jobseeker/subscription' : '/employer/subscription'} onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                      <Star className="h-4 w-4 text-slate-400" /> My Plan
                    </Link>
                    <div onClick={handleLogout} className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-xs font-semibold text-rose-500 transition hover:bg-slate-50">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </div>
                    </div>
                )}
              </div>
            </>
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
                  className="inline-flex items-center gap-2 bg-[rgb(13,110,253)] hover:bg-[rgb(11,94,215)] text-white font-medium text-sm xl:text-base py-2 px-4 xl:px-5 min-w-[150px] xl:min-w-[170px] rounded-lg transition duration-150 cursor-pointer shadow-md shadow-blue-600/10 whitespace-nowrap"
                >
                  <User className="h-3.5 w-3.5 shrink-0" /> For Jobseekers <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${jobseekersDesktopOpen ? 'rotate-180' : ''}`} />
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
                  className="inline-flex items-center gap-2 bg-[rgb(253,126,20)] hover:bg-[rgb(221,107,17)] text-white font-medium text-sm xl:text-base py-2 px-4 xl:px-5 min-w-[150px] xl:min-w-[170px] rounded-lg transition duration-150 cursor-pointer shadow-md shadow-orange-600/10 whitespace-nowrap"
                >
                  <Briefcase className="h-3.5 w-3.5 shrink-0" /> For Employers <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${employersDesktopOpen ? 'rotate-180' : ''}`} />
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

        {/* Mobile Header Actions */}
        <div className="flex items-center gap-2 lg:hidden">
          {isLoggedIn && <NotificationDropdown />}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none cursor-pointer shrink-0"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white py-4 px-4 shadow-inner max-h-[80vh] overflow-y-auto">
          <nav className="flex flex-col gap-3.5">
            {isLoggedIn ? (
              <div className="mb-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                {isJobseekerUser ? (
                  <div className="rounded-xl bg-[#002856] p-3 text-white">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FF6B00] text-base font-black text-white">
                        {profileInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-extrabold leading-tight">{profileName}</p>
                        <p className="mt-0.5 text-xs font-semibold text-white/55">Job Seeker</p>
                        <div className="mt-2">
                          <div className="mb-1 flex items-center justify-between text-[11px] font-black text-white/55">
                            <span>Profile score</span>
                            <span>{profileScore}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                            <div className="h-full rounded-full bg-[#FF6B00]" style={{ width: `${profileScore}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleJobSearchStatusToggle}
                      disabled={savingJobStatus}
                      className="mt-3 flex w-full items-center justify-between gap-3 rounded-lg bg-white/[0.07] px-3 py-2.5 text-left transition hover:bg-white/[0.12] disabled:opacity-70"
                    >
                      <span>
                        <span className="block text-xs font-extrabold text-white">Job Search Status</span>
                        <span className={`mt-0.5 block text-xs font-bold ${isLookingForJob ? 'text-emerald-300' : 'text-white/50'}`}>
                          {isLookingForJob ? 'Looking for job' : 'Not looking'}
                        </span>
                      </span>
                      <span className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${isLookingForJob ? 'bg-emerald-500' : 'bg-white/20'}`}>
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${isLookingForJob ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      {profileInitials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{profileName}</p>
                      <p className="text-xs text-slate-500">Signed in</p>
                    </div>
                  </div>
                )}
                <div className="mt-3 grid grid-cols-1 gap-1 border-t border-slate-200 pt-3">
                  <Link to={isJobseekerUser ? '/jobseeker/profile' : '/employer/company'} className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
                    <User className="h-4 w-4 text-slate-400" /> My Profile
                  </Link>
                  <Link to={isJobseekerUser ? '/jobseeker/subscription' : '/employer/subscription'} className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
                    <Star className="h-4 w-4 text-slate-400" /> My Plan
                  </Link>
                  <div onClick={handleLogout} className="flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-semibold text-rose-500 hover:bg-white">
                    <LogOut className="h-4 w-4" /> Log out
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

            {isLoggedIn && dashboardMenuLinks.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setDashboardMobileOpen(!dashboardMobileOpen)}
                  className={`flex items-center justify-between w-full text-sm font-bold py-1 focus:outline-none cursor-pointer ${isDashboardActive ? 'text-blue-600' : 'text-slate-655'}`}
                >
                  <span>Dashboard</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dashboardMobileOpen ? 'rotate-180' : ''}`} />
                </button>
                {dashboardMobileOpen && (
                  <div className="pl-4 mt-2 flex max-h-72 flex-col gap-1 overflow-y-auto border-l border-slate-100">
                    {dashboardMenuLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={`${item.to}-${item.label}`} to={item.to} className="flex items-center gap-2 py-2 text-xs font-bold text-slate-700">
                          <Icon className="h-4 w-4 text-slate-400" /> {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {pricingPath ? (
              <Link to={pricingPath} className={`block text-sm font-bold py-1 ${isPricingActive ? 'text-blue-600' : 'text-slate-655'}`}>
                Pricing
              </Link>
            ) : (
              <div>
                <button 
                  onClick={() => setPricingMobileOpen(!pricingMobileOpen)}
                  className={`flex items-center justify-between w-full text-sm font-bold py-1 focus:outline-none cursor-pointer ${isPricingActive ? 'text-blue-600' : 'text-slate-655'}`}
                >
                  <span>Pricing</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${pricingMobileOpen ? 'rotate-180' : ''}`} />
                </button>
                {pricingMobileOpen && (
                  <div className="pl-4 mt-2 flex flex-col gap-2.5 border-l border-slate-100">
                    <Link to="/jobseeker-plan" className={`text-xs font-bold py-1 ${isActive('/jobseeker-plan') ? 'text-blue-600' : 'text-slate-550'}`}>Jobseeker Plan</Link>
                    <Link to="/employer-plan" className={`text-xs font-bold py-1 ${isActive('/employer-plan') ? 'text-blue-600' : 'text-slate-550'}`}>Employer Plan</Link>
                  </div>
                )}
              </div>
            )}

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
