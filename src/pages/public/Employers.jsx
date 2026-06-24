import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, ChevronDown, Mail, Check } from 'lucide-react';

const MOCK_EMPLOYERS = [
  {
    id: 1,
    name: 'Invision',
    location: 'Chicago, US',
    industry: 'Software',
    openJobs: 12,
    rating: 5.0,
    ratesCount: 360,
    logoLetter: 'I',
    logoBg: 'bg-rose-100 text-rose-700'
  },
  {
    id: 2,
    name: 'Bing Search',
    location: 'New York, US',
    industry: 'Software',
    openJobs: 10,
    rating: 4.8,
    ratesCount: 280,
    logoLetter: 'B',
    logoBg: 'bg-blue-100 text-blue-700'
  },
  {
    id: 3,
    name: 'Dailymotion',
    location: 'Iowa, US',
    industry: 'Designing',
    openJobs: 16,
    rating: 4.5,
    ratesCount: 195,
    logoLetter: 'D',
    logoBg: 'bg-emerald-100 text-emerald-700'
  },
  {
    id: 4,
    name: 'LinkedIn',
    location: 'Chicago, US',
    industry: 'Software',
    openJobs: 122,
    rating: 4.9,
    ratesCount: 540,
    logoLetter: 'L',
    logoBg: 'bg-sky-100 text-sky-700'
  },
  {
    id: 5,
    name: 'Adobe Illustrator',
    location: 'San Jose, US',
    industry: 'Designing',
    openJobs: 23,
    rating: 4.7,
    ratesCount: 310,
    logoLetter: 'A',
    logoBg: 'bg-red-100 text-red-700'
  },
  {
    id: 6,
    name: 'StumbleUpon',
    location: 'San Francisco, US',
    industry: 'Software',
    openJobs: 24,
    rating: 4.2,
    ratesCount: 120,
    logoLetter: 'S',
    logoBg: 'bg-amber-100 text-amber-700'
  },
  {
    id: 7,
    name: 'Amass Education',
    location: 'Hamirpur, HP',
    industry: 'Education',
    openJobs: 5,
    rating: 4.6,
    ratesCount: 85,
    logoLetter: 'E',
    logoBg: 'bg-purple-100 text-purple-700'
  },
  {
    id: 8,
    name: 'Tata Consultancy Services',
    location: 'Chandigarh, PB',
    industry: 'IT & Consulting',
    openJobs: 45,
    rating: 4.4,
    ratesCount: 420,
    logoLetter: 'T',
    logoBg: 'bg-indigo-100 text-indigo-700'
  }
];

const StarRating = ({ rating }) => {
  const stars = [];
  const roundedRating = Math.round(rating);
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg
        key={i}
        className={`h-3.5 w-3.5 ${
          i <= roundedRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
        }`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

export const Employers = () => {
  // Search state (top bar)
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInd, setSearchInd] = useState('');
  const [searchLoc, setSearchLoc] = useState('');

  // Sidebar filter states
  const [sidebarLoc, setSidebarLoc] = useState('');
  const [sidebarInd, setSidebarInd] = useState('');
  const [sidebarTypes, setSidebarTypes] = useState([]);
  const [sidebarExps, setSidebarExps] = useState([]);

  // Active filter state
  const [filteredCompanies, setFilteredCompanies] = useState(MOCK_EMPLOYERS);
  const [sortBy, setSortBy] = useState('newest');
  const [reminderEmail, setReminderEmail] = useState('');

  const filterCompanies = () => {
    let result = [...MOCK_EMPLOYERS];

    // Top search bar filters
    if (searchKeyword.trim() !== '') {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(kw) ||
          c.industry.toLowerCase().includes(kw)
      );
    }
    if (searchInd) {
      result = result.filter((c) => c.industry.toLowerCase().includes(searchInd.toLowerCase()));
    }
    if (searchLoc) {
      result = result.filter((c) => c.location.toLowerCase().includes(searchLoc.toLowerCase()));
    }

    // Sidebar filters
    if (sidebarLoc.trim() !== '') {
      result = result.filter((c) => c.location.toLowerCase().includes(sidebarLoc.toLowerCase()));
    }
    if (sidebarInd) {
      result = result.filter((c) => c.industry === sidebarInd);
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id);
    } else {
      result.sort((a, b) => a.id - b.id);
    }

    setFilteredCompanies(result);
  };

  useEffect(() => {
    filterCompanies();
  }, [sortBy]);

  const handleFindNow = (e) => {
    e.preventDefault();
    filterCompanies();
  };

  const applySidebarFilters = () => {
    filterCompanies();
  };

  const resetSidebarFilters = () => {
    setSidebarLoc('');
    setSidebarInd('');
    setSidebarTypes([]);
    setSidebarExps([]);
    setSearchKeyword('');
    setSearchInd('');
    setSearchLoc('');
    setFilteredCompanies(MOCK_EMPLOYERS);
  };

  const handleSidebarTypeToggle = (type) => {
    setSidebarTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSidebarExpToggle = (exp) => {
    setSidebarExps((prev) =>
      prev.includes(exp) ? prev.filter((e) => e !== exp) : [...prev, exp]
    );
  };

  const handleReminderSubmit = (e) => {
    e.preventDefault();
    alert(`Reminder successfully set for: ${reminderEmail}`);
    setReminderEmail('');
  };

  return (
    <div className="w-full bg-white">
      {/* Top Banner / Breadcrumb Section */}
      <section className="bg-slate-50 py-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                There are <span className="text-[#ff5e14]">500+</span> companies <br />
                here for you!
              </h1>
              <p className="text-slate-500 text-sm mt-2 font-medium">
                Discover your next career move, freelance gig, or internship
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Link to="/" className="hover:text-indigo-650 transition">Home</Link>
              <span>/</span>
              <span className="text-slate-600">Companies listing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-7 relative z-20">
        <form onSubmit={handleFindNow} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-3">
          {/* Keyword Search */}
          <div className="flex-1 relative flex items-center">
            <Briefcase className="absolute left-4 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="e.g microsoft"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl pl-12 pr-4 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-300 focus:bg-white transition"
            />
          </div>

          {/* Industry Dropdown */}
          <div className="w-full md:w-48 relative flex items-center">
            <Briefcase className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none" />
            <select
              value={searchInd}
              onChange={(e) => setSearchInd(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl pl-12 pr-10 py-3 text-slate-700 text-sm focus:outline-none focus:border-indigo-300 focus:bg-white transition appearance-none cursor-pointer"
            >
              <option value="">Industry</option>
              <option value="Software">Software</option>
              <option value="Designing">Designing</option>
              <option value="Education">Education</option>
              <option value="IT & Consulting">IT & Consulting</option>
            </select>
            <ChevronDown className="absolute right-4 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Location Dropdown */}
          <div className="w-full md:w-48 relative flex items-center">
            <MapPin className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none" />
            <select
              value={searchLoc}
              onChange={(e) => setSearchLoc(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl pl-12 pr-10 py-3 text-slate-705 text-sm focus:outline-none focus:border-indigo-300 focus:bg-white transition appearance-none cursor-pointer"
            >
              <option value="">Location</option>
              <option value="Hamirpur">Hamirpur, HP</option>
              <option value="Mohali">Mohali, PB</option>
              <option value="Chandigarh">Chandigarh, PB</option>
              <option value="Ambala">Ambala, HR</option>
              <option value="Chicago">Chicago, US</option>
              <option value="New York">New York, US</option>
              <option value="Iowa">Iowa, US</option>
            </select>
            <ChevronDown className="absolute right-4 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="bg-[#ff5e14] hover:bg-[#e05300] text-white font-bold text-sm px-6 py-3 rounded-xl transition duration-150 shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            Find Now
          </button>
        </form>
      </div>

      {/* Main Grid Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Left Column: Employer Cards */}
          <div className="lg:col-span-8 space-y-6 order-1 lg:order-1">
            
            {/* Header / Info bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-2">
              <span className="text-xs font-bold text-slate-500">
                Showing <strong className="text-slate-800">{filteredCompanies.length}</strong> companies
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest Post</option>
                  <option value="oldest">Oldest Post</option>
                </select>
              </div>
            </div>

            {/* Grid of Company Cards */}
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-16 border border-slate-100 rounded-2xl bg-slate-50">
                <p className="text-slate-500 font-semibold text-sm">No companies found matching your filters.</p>
                <button
                  onClick={resetSidebarFilters}
                  className="mt-4 text-xs font-bold text-indigo-655 hover:text-indigo-500"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {filteredCompanies.map((company) => (
                  <div key={company.id} className="group border border-slate-200 rounded-2xl p-6 bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[280px]">
                    <div className="relative">
                      {/* Shield verified icon at the top right */}
                      <div className="absolute top-0 right-0 w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                        <Check className="h-4.5 w-4.5 stroke-[3]" />
                      </div>
                      
                      {/* Logo and company details */}
                      <div className="flex flex-col items-center text-center mt-3">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-xl shrink-0 shadow-sm mb-3 ${company.logoBg}`}>
                          {company.logoLetter}
                        </div>
                        <h3 className="font-extrabold text-slate-900 hover:text-indigo-600 transition-colors text-base truncate max-w-[200px]">
                          <Link to="/login">{company.name}</Link>
                        </h3>
                        <div className="flex items-center gap-1.5 justify-center mt-1.5">
                          <StarRating rating={company.rating} />
                          <span className="text-[11px] font-semibold text-slate-400">({company.rating.toFixed(1)})</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata indicators */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-1.5 justify-center">
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="truncate">{company.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center">
                        <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="truncate">{company.industry}</span>
                      </div>
                    </div>

                    {/* Footer redirect to jobs */}
                    <div className="mt-4 pt-2 flex items-center justify-center">
                      <Link
                        to="/jobs"
                        className="inline-flex items-center justify-center px-6 py-2.5 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-extrabold text-indigo-600 hover:bg-indigo-50/50 transition w-full text-center"
                      >
                        {company.openJobs} Open Jobs
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {filteredCompanies.length > 0 && (
              <div className="flex items-center justify-center pt-10">
                <nav className="flex items-center gap-1.5">
                  <button className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition cursor-pointer">Previous</button>
                  <button className="px-3.5 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white transition">1</button>
                  <button className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition cursor-pointer">2</button>
                  <button className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition cursor-pointer">3</button>
                  <button className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition cursor-pointer">Next</button>
                </nav>
              </div>
            )}

          </div>

          {/* Right Column: Sidebar filters */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-2">
            
            {/* Email reminder block */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base">Set job reminder</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Enter your email address and get job notifications.</p>
              <form onSubmit={handleReminderSubmit} className="space-y-3">
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={reminderEmail}
                    onChange={(e) => setReminderEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-300 transition"
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-sm">
                  Submit
                </button>
              </form>
            </div>

            {/* Sidebar filters list */}
            <div className="border border-slate-200 rounded-2xl p-6 space-y-6">
              
              {/* Location Input */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Location</h4>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Location"
                    value={sidebarLoc}
                    onChange={(e) => setSidebarLoc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-850 placeholder-slate-400 focus:outline-none focus:border-indigo-300 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Industry selector */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Industry Type</h4>
                <div className="relative flex items-center">
                  <Briefcase className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    value={sidebarInd}
                    onChange={(e) => setSidebarInd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-10 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-300 focus:bg-white transition appearance-none cursor-pointer"
                  >
                    <option value="">All Industries</option>
                    <option value="Software">Software</option>
                    <option value="Designing">Designing</option>
                    <option value="Education">Education</option>
                    <option value="IT & Consulting">IT & Consulting</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Job type checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Job Type</h4>
                <div className="space-y-2.5">
                  {['Full Time', 'Part Time', 'Remote', 'Freelance'].map((t) => (
                    <label key={t} className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sidebarTypes.includes(t)}
                        onChange={() => handleSidebarTypeToggle(t)}
                        className="h-4 w-4 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience level checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Experience Level</h4>
                <div className="space-y-2.5">
                  {['Junior', 'Regular', 'Senior', 'Expert'].map((exp) => (
                    <label key={exp} className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sidebarExps.includes(exp)}
                        onChange={() => handleSidebarExpToggle(exp)}
                        className="h-4 w-4 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>{exp}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sidebar filter actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={applySidebarFilters}
                  className="flex-1 bg-[#ff5e14] hover:bg-[#e05300] text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer shadow-sm"
                >
                  Apply filter
                </button>
                <button
                  onClick={resetSidebarFilters}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  Reset filter
                </button>
              </div>

            </div>

            {/* Recruiting banner */}
            <div className="bg-[#eef2ff] border border-blue-100 rounded-2xl p-6 space-y-4">
              <h4 className="font-extrabold text-[#083ca6] text-base">Recruiting?</h4>
              <p className="text-xs text-blue-900/70 leading-relaxed font-medium">
                Advertise your jobs to millions of monthly users and search 16.8 million CVs in our database.
              </p>
              <Link to="/contact" className="inline-flex items-center justify-center w-full bg-white hover:bg-blue-50 border border-blue-200 text-blue-600 font-bold text-xs py-2.5 rounded-xl transition shadow-sm">
                Post a Job
              </Link>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
};

export default Employers;
