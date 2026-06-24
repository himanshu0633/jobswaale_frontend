import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Building2, 
  Users, 
  User,
  ArrowRight, 
  Sparkles,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';

// Import modular homepage sections
import DoubleCTA from './DoubleCTA';
import PopularCategories from './PopularCategories';
import FeaturedJobs from './FeaturedJobs';
import TrustedCompanies from './TrustedCompanies';

export const Home = () => {
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLoc, setSearchLoc] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/login?search=${encodeURIComponent(searchTitle)}&location=${encodeURIComponent(searchLoc)}`);
  };

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 py-16 lg:py-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            
            {/* Left Block: Search & Text */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 fill-blue-100" /> Smart Hiring. Better Recruitment.
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-slate-900">
                Find Your <span className="text-[#ff5e14]">Dream Job</span><br />
                <span className="text-slate-800">Build Your Future</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-655 leading-relaxed max-w-xl">
                <strong>You can find your dream jobs faster and easier.</strong> We are providing fast hiring for employers and local jobs near you for job seekers.
              </p>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="p-2 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xl flex flex-col md:flex-row gap-2 max-w-2xl">
                <div className="flex-1 relative flex items-center">
                  <Briefcase className="absolute left-4 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Job title"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    className="w-full bg-transparent border-0 pl-12 pr-4 py-3.5 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-0"
                  />
                </div>
                <div className="hidden md:block w-px bg-slate-200 my-2" />
                <div className="flex-1 relative flex items-center">
                  <MapPin className="absolute left-4 h-5 w-5 text-slate-400" />
                  <select 
                    value={searchLoc} 
                    onChange={(e) => setSearchLoc(e.target.value)}
                    className="w-full bg-transparent border-0 pl-12 pr-4 py-3.5 text-slate-705 text-sm focus:outline-none focus:ring-0 appearance-none cursor-pointer"
                  >
                    <option value="">Location</option>
                    <option value="Hamirpur">Hamirpur</option>
                    <option value="Chandigarh">Chandigarh</option>
                  </select>
                  <ChevronDown className="absolute right-4 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  className="bg-[#ff5e14] hover:bg-[#e05300] text-white font-semibold text-sm px-6 py-3.5 rounded-lg sm:rounded-xl transition duration-150 shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Search Jobs
                </button>
              </form>

              {/* Trending Searches */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-semibold text-slate-400">
                <span>Trending Searches:</span>
                <Link to="/login?q=sales" className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition border border-blue-100">#Sales</Link>
                <Link to="/login?q=marketing" className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition border border-blue-100">#Marketing</Link>
                <Link to="/login?q=it" className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition border border-blue-100">#IT</Link>
                <Link to="/login?q=accounts" className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition border border-blue-100">#Accounts</Link>
                <Link to="/login?q=engineering" className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition border border-blue-100">#Engineering</Link>
              </div>
            </div>

            {/* Right Block: Choice Cards */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-100 space-y-5">
                <h3 className="text-lg font-bold text-slate-900 text-center mb-6">Choose Your Account Type</h3>
                
                {/* Job Seeker Choice */}
                <Link 
                  to="/login?role=jobseeker" 
                  className="group flex items-center justify-between p-5 rounded-2xl bg-blue-50/40 hover:bg-blue-50/65 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl shrink-0 shadow-sm">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-blue-800 text-base">Job Seeker</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Find jobs, build profile and get hired.</p>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>

                {/* Employer Choice */}
                <Link 
                  to="/contact" 
                  className="group flex items-center justify-between p-5 rounded-2xl bg-orange-50/40 hover:bg-orange-50/65 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl shrink-0 shadow-sm">
                      <Briefcase className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-orange-600 text-base">Employer</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Post jobs, find talent and grow your team.</p>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-orange-500 border border-orange-100 shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-all shrink-0">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Floating Stats Bar */}
      <section className="relative z-25 -mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xl shadow-slate-200/50">
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
              
              <div className="flex items-center gap-4 justify-start md:justify-center">
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-950">2,000+</div>
                  <div className="text-xs font-semibold text-slate-400">Open Jobs</div>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-start md:justify-center border-l border-slate-100 pl-2 lg:pl-0">
                <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-950">500+</div>
                  <div className="text-xs font-semibold text-slate-400">Top Companies</div>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-start md:justify-center border-l border-slate-100 pl-2 lg:pl-0">
                <div className="w-11 h-11 rounded-full bg-[#7c3aed] text-white flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-950">15,000+</div>
                  <div className="text-xs font-semibold text-slate-400">Job Seekers</div>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-start md:justify-center border-l border-slate-100 pl-2 lg:pl-0">
                <div className="w-11 h-11 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-950">50+</div>
                  <div className="text-xs font-semibold text-slate-400">Cities Covered</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <DoubleCTA />
      <PopularCategories />
      <FeaturedJobs />
      <TrustedCompanies />
    </div>
  );
};

export default Home;
