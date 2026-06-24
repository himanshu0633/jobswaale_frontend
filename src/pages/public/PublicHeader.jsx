import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Menu, X, ChevronDown, User, Briefcase, LogIn, UserPlus, UploadCloud, Building2 } from 'lucide-react';
import { BASE_API_URL } from '../../context/AuthContext';
import logoAsset from '../../assets/logo-black.png';

export const PublicHeader = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pricingMobileOpen, setPricingMobileOpen] = useState(false);
  const [jobseekersMobileOpen, setJobseekersMobileOpen] = useState(false);
  const [employersMobileOpen, setEmployersMobileOpen] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
    setPricingMobileOpen(false);
    setJobseekersMobileOpen(false);
    setEmployersMobileOpen(false);
  }, [location.pathname]);

  // Load public settings to check if registration is enabled
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${BASE_API_URL}/settings/public`);
        setRegistrationEnabled(response.data?.userRegistration !== false);
      } catch {
        setRegistrationEnabled(true);
      }
    };
    fetchSettings();
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/70 border-b border-slate-200/50 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logoAsset} alt="JobsWaale" className="h-9 sm:h-13 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={`text-sm font-medium transition duration-150 ${isActive('/') ? 'text-indigo-600' : 'text-slate-655 hover:text-indigo-600'}`}>
            Home
          </Link>
          <Link to="/jobs" className={`text-sm font-medium transition duration-150 ${isActive('/jobs') ? 'text-indigo-600' : 'text-slate-655 hover:text-indigo-600'}`}>
            Jobs
          </Link>
          <Link to="/employer" className={`text-sm font-medium transition duration-150 ${isActive('/employer') ? 'text-indigo-600' : 'text-slate-655 hover:text-indigo-600'}`}>
            Employers
          </Link>
          
          {/* Pricing Dropdown */}
          <div className="relative group py-2">
            <button className="flex items-center gap-1 text-sm font-medium text-slate-655 hover:text-indigo-600 focus:outline-none cursor-pointer">
              Pricing <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-white border border-slate-200 rounded-lg shadow-lg py-2 w-48 z-50">
              <Link to="/jobseeker-plan" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
                Jobseeker Plan
              </Link>
              <Link to="/employer-plan" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
                Employer Plan
              </Link>
            </div>
          </div>

          <Link to="/about" className={`text-sm font-medium transition duration-150 ${isActive('/about') ? 'text-indigo-600' : 'text-slate-655 hover:text-indigo-600'}`}>
            About Us
          </Link>
        </nav>

        {/* Desktop CTA Action Buttons */}
        <div className="hidden md:flex items-center gap-1">
          {/* For Jobseekers Dropdown */}
          <div className="relative group py-2">
            <button className="inline-flex items-center gap-2 bg-[rgb(13,110,253)] hover:bg-[rgb(11,94,215)] text-white font-medium text-base py-1.75 px-5 min-w-[170px] rounded-lg transition duration-150 cursor-pointer shadow-md shadow-blue-600/10">
              <User className="h-3.5 w-3.5" /> For Jobseekers <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="absolute top-full right-0 mt-1.5 hidden group-hover:block bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-52 z-50">
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
          </div>

          {/* For Employers Dropdown */}
          <div className="relative group py-2">
            <button className="inline-flex items-center gap-2 bg-[rgb(253,126,20)] hover:bg-[rgb(221,107,17)] text-white font-medium  text-base py-1.75 px-5 min-w-[170px] rounded-lg transition duration-150 cursor-pointer shadow-md shadow-orange-600/10">
              <Briefcase className="h-3.5 w-3.5" /> For Employers <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="absolute top-full right-0 mt-1.5 hidden group-hover:block bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-52 z-50">
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
          </div>
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
            <Link to="/" className={`text-sm font-bold py-1 ${isActive('/') ? 'text-indigo-600' : 'text-slate-655'}`}>
              Home
            </Link>
            <Link to="/jobs" className={`text-sm font-bold py-1 ${isActive('/jobs') ? 'text-indigo-600' : 'text-slate-655'}`}>
              Jobs
            </Link>
            <Link to="/employer" className={`text-sm font-bold py-1 ${isActive('/employer') ? 'text-indigo-600' : 'text-slate-655'}`}>
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

            <Link to="/about" className={`text-sm font-bold py-1 ${isActive('/about') ? 'text-indigo-600' : 'text-slate-655'}`}>
              About Us
            </Link>
            <Link to="/contact" className={`text-sm font-bold py-1 ${isActive('/contact') ? 'text-indigo-600' : 'text-slate-655'}`}>
              Contact Us
            </Link>
            <Link to="/blogs" className={`text-sm font-bold py-1 ${isActive('/blogs') ? 'text-indigo-600' : 'text-slate-655'}`}>
              Blogs
            </Link>

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
          </nav>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
