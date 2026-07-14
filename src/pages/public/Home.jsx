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
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 items-center">

            {/* Left Block: Search & Text */}
            <div className="lg:col-span-7 lg:pr-4 space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-[#0047C7]/[0.08] text-[#0047C7]">
                <CheckCircle2 className="h-4 w-4 text-[#0047C7]" /> Smart Hiring. Better Recruitment.
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.2] text-slate-900">
                Find Your{' '}
                <span className="bg-gradient-to-r from-[#f3761e] to-[#c40c0c] bg-clip-text text-transparent">
                  Dream Job
                </span>
                <br />
                <strong>Build Your Future</strong>
              </h1>

              <p className="text-base sm:text-[1.05rem] text-slate-500 leading-relaxed max-w-xl">
                <strong className="text-slate-700">You can find your dream jobs faster and easier.</strong> We are providing fast hiring for employers and local jobs near you for job seekers.
              </p>

              {/* Search Form */}
              <form
                onSubmit={handleSearchSubmit}
                className="p-2 rounded-xl bg-white border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex flex-col md:flex-row gap-2 max-w-2xl"
              >
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    placeholder="Job title"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    className="w-full bg-transparent border-0 px-4 py-3 text-slate-800 placeholder-slate-400 text-[0.95rem] focus:outline-none focus:ring-0"
                  />
                </div>
                <div className="hidden md:block w-px bg-slate-200 my-2" />
                <div className="flex-1 relative flex items-center">
                  <select
                    value={searchLoc}
                    onChange={(e) => setSearchLoc(e.target.value)}
                    className="w-full bg-transparent border-0 px-4 py-3 text-slate-800 text-[0.95rem] focus:outline-none focus:ring-0 appearance-none cursor-pointer"
                  >
                    <option value="">Location</option>
                    <option value="Hamirpur">Hamirpur</option>
                    <option value="Chandigarh">Chandigarh</option>
                  </select>
                  <ChevronDown className="absolute right-4 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-br from-[#FF6B00] to-[#ff7043] text-white font-semibold text-sm px-7 py-3 rounded-lg transition duration-150 hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  Search Jobs
                </button>
              </form>

              {/* Trending Searches */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 text-sm text-slate-500">
                <span className="mr-1">Trending Searches:</span>
                <Link to="/login?q=sales" className="px-3 py-1.5 rounded-md bg-[#F2F6FF] text-[#0047C7] hover:bg-[#0047C7] hover:text-white transition">#Sales</Link>
                <Link to="/login?q=marketing" className="px-3 py-1.5 rounded-md bg-[#F2F6FF] text-[#0047C7] hover:bg-[#0047C7] hover:text-white transition">#Marketing</Link>
                <Link to="/login?q=it" className="px-3 py-1.5 rounded-md bg-[#F2F6FF] text-[#0047C7] hover:bg-[#0047C7] hover:text-white transition">#IT</Link>
                <Link to="/login?q=accounts" className="px-3 py-1.5 rounded-md bg-[#F2F6FF] text-[#0047C7] hover:bg-[#0047C7] hover:text-white transition">#Accounts</Link>
                <Link to="/login?q=engineering" className="px-3 py-1.5 rounded-md bg-[#F2F6FF] text-[#0047C7] hover:bg-[#0047C7] hover:text-white transition">#Engineering</Link>
              </div>
            </div>

            {/* Right Block: Choice Cards */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-black/[0.03] space-y-5 w-full">
                <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">Choose Your Account Type</h3>

                {/* Job Seeker Choice */}
                <Link
                  to="/jobs"
                  className="group flex items-center justify-between p-6 rounded-xl bg-[#F2F6FF] border border-transparent hover:border-[#0047C7] transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_1px_rgba(0,0,0,0.26)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-[60px] h-[60px] rounded-full bg-[#D9DFFA] flex items-center justify-center shrink-0">
                      <User className="h-6 w-6 text-[#0047C7]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0047C7] text-[21px]">Job Seeker</h4>
                      <p className="text-sm text-slate-700 mt-1">Find jobs, build profile and get hired.</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-[0_0_1px_rgba(0,0,0,0.2)] group-hover:translate-x-1 transition-transform shrink-0">
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </div>
                </Link>

                {/* Employer Choice */}
                <Link
                  to="/contact"
                  className="group flex items-center justify-between p-6 rounded-xl bg-[#FFF4EB] border border-transparent hover:border-[#FF6B00] transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_1px_rgba(0,0,0,0.26)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-[60px] h-[60px] rounded-full bg-[#FDE8D4] flex items-center justify-center shrink-0">
                      <Briefcase className="h-6 w-6 text-[#FF6B00]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#FF6B00] text-[21px]">Employer</h4>
                      <p className="text-sm text-slate-700 mt-1">Post jobs, find talent and grow your team.</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-[0_0_1px_rgba(0,0,0,0.2)] group-hover:translate-x-1 transition-transform shrink-0">
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Floating Stats Bar */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-[0_10px_35px_rgba(0,0,0,0.05)]">
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">

              <div className="flex items-center gap-4">
                <div className="w-[54px] h-[54px] rounded-full bg-[#F2F6FF] text-[#0047C7] flex items-center justify-center shrink-0">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xl font-bold text-[#0047C7]">2,000+</div>
                  <div className="text-sm text-slate-500">Open Jobs</div>
                </div>
              </div>

              <div className="flex items-center gap-4 md:border-l md:border-slate-100 md:pl-6">
                <div className="w-[54px] h-[54px] rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xl font-bold text-[#0047C7]">500+</div>
                  <div className="text-sm text-slate-500">Top Companies</div>
                </div>
              </div>

              <div className="flex items-center gap-4 md:border-l md:border-slate-100 md:pl-6">
                <div className="w-[54px] h-[54px] rounded-full bg-[#f3e5f5] text-[#7b1fa2] flex items-center justify-center shrink-0">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xl font-bold text-[#0047C7]">15,000+</div>
                  <div className="text-sm text-slate-500">Job Seekers</div>
                </div>
              </div>

              <div className="flex items-center gap-4 md:border-l md:border-slate-100 md:pl-6">
                <div className="w-[54px] h-[54px] rounded-full bg-[#FFF4EB] text-[#FF6B00] flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xl font-bold text-[#0047C7]">50+</div>
                  <div className="text-sm text-slate-500">Cities Covered</div>
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