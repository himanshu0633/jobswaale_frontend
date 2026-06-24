import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, ChevronDown, Mail, ArrowRight } from 'lucide-react';
import TrustedCompanies from './TrustedCompanies';

const MOCK_JOBS = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'Microsoft',
    location: 'Noida, UP',
    salary: '₹4 - 6 LPA',
    type: 'Full Time',
    category: 'IT & Software',
    experience: 'Junior',
    logoLetter: 'M',
    logoBg: 'bg-rose-100 text-rose-700'
  },
  {
    id: 2,
    title: 'UI/UX Designer',
    company: 'TCS',
    location: 'Bangalore, KA',
    salary: '₹3 - 5 LPA',
    type: 'Part Time',
    category: 'Designing',
    experience: 'Junior',
    logoLetter: 'T',
    logoBg: 'bg-blue-100 text-blue-700'
  },
  {
    id: 3,
    title: 'System Analyst',
    company: 'Infosys',
    location: 'Pune, MH',
    salary: '₹5 - 8 LPA',
    type: 'Full Time',
    category: 'IT & Software',
    experience: 'Regular',
    logoLetter: 'I',
    logoBg: 'bg-emerald-100 text-emerald-700'
  },
  {
    id: 4,
    title: 'HR Executive',
    company: 'Wipro',
    location: 'Hyderabad, TS',
    salary: '₹2.5 - 3.5 LPA',
    type: 'Full Time',
    category: 'HR & Admin',
    experience: 'Regular',
    logoLetter: 'W',
    logoBg: 'bg-amber-100 text-amber-700'
  },
  {
    id: 5,
    title: 'Senior Frontend Developer',
    company: 'Microsoft',
    location: 'Noida, UP',
    salary: '₹8 - 12 LPA',
    type: 'Full Time',
    category: 'IT & Software',
    experience: 'Senior',
    logoLetter: 'M',
    logoBg: 'bg-rose-100 text-rose-700'
  },
  {
    id: 6,
    title: 'Product Designer',
    company: 'TCS',
    location: 'Bangalore, KA',
    salary: '₹6 - 9 LPA',
    type: 'Full Time',
    category: 'Designing',
    experience: 'Senior',
    logoLetter: 'T',
    logoBg: 'bg-blue-100 text-blue-700'
  },
  {
    id: 7,
    title: 'Support Engineer',
    company: 'Tech Mahindra',
    location: 'Mohali, PB',
    salary: '₹3 - 4.5 LPA',
    type: 'Remote',
    category: 'Customer Support',
    experience: 'Regular',
    logoLetter: 'M',
    logoBg: 'bg-purple-100 text-purple-700'
  },
  {
    id: 8,
    title: 'Accounts Manager',
    company: 'HDFC Bank',
    location: 'Chandigarh, PB',
    salary: '₹6 - 8 LPA',
    type: 'Full Time',
    category: 'Accounts & Finance',
    experience: 'Expert',
    logoLetter: 'H',
    logoBg: 'bg-indigo-100 text-indigo-700'
  },
  {
    id: 9,
    title: 'Marketing Executive',
    company: 'Zomato',
    location: 'Ambala, HR',
    salary: '₹4 - 5 LPA',
    type: 'Freelance',
    category: 'Sales & Marketing',
    experience: 'Junior',
    logoLetter: 'Z',
    logoBg: 'bg-red-100 text-red-700'
  }
];

export const Jobs = () => {
  // Search state (top bar)
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchLoc, setSearchLoc] = useState('');

  // Sidebar filter states
  const [sidebarLoc, setSidebarLoc] = useState('');
  const [sidebarCat, setSidebarCat] = useState('');
  const [sidebarTypes, setSidebarTypes] = useState([]);
  const [sidebarExps, setSidebarExps] = useState([]);

  // Active filter state
  const [filteredJobs, setFilteredJobs] = useState(MOCK_JOBS);
  const [sortBy, setSortBy] = useState('newest');
  const [reminderEmail, setReminderEmail] = useState('');

  const filterJobs = () => {
    let result = [...MOCK_JOBS];

    // Top search bar filters
    if (searchKeyword.trim() !== '') {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(kw) ||
          j.company.toLowerCase().includes(kw) ||
          j.category.toLowerCase().includes(kw)
      );
    }
    if (searchType) {
      result = result.filter((j) => j.type.toLowerCase() === searchType.toLowerCase());
    }
    if (searchLoc) {
      result = result.filter((j) => j.location.toLowerCase().includes(searchLoc.toLowerCase()));
    }

    // Sidebar filters
    if (sidebarLoc.trim() !== '') {
      result = result.filter((j) => j.location.toLowerCase().includes(sidebarLoc.toLowerCase()));
    }
    if (sidebarCat) {
      result = result.filter((j) => j.category === sidebarCat);
    }
    if (sidebarTypes.length > 0) {
      result = result.filter((j) => sidebarTypes.includes(j.type));
    }
    if (sidebarExps.length > 0) {
      result = result.filter((j) => sidebarExps.includes(j.experience));
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id);
    } else {
      result.sort((a, b) => a.id - b.id);
    }

    setFilteredJobs(result);
  };

  useEffect(() => {
    filterJobs();
  }, [sortBy]);

  const handleFindNow = (e) => {
    e.preventDefault();
    filterJobs();
  };

  const applySidebarFilters = () => {
    filterJobs();
  };

  const resetSidebarFilters = () => {
    setSidebarLoc('');
    setSidebarCat('');
    setSidebarTypes([]);
    setSidebarExps([]);
    setSearchKeyword('');
    setSearchType('');
    setSearchLoc('');
    setFilteredJobs(MOCK_JOBS);
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
                Your next opportunity starts here <br />
                with <span className="text-blue-600">2000+</span> Jobs
              </h1>
              <p className="text-slate-500 text-sm mt-2 font-medium">
                Discover your next career move, freelance gig, or internship
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Link to="/" className="hover:text-indigo-650 transition">Home</Link>
              <span>/</span>
              <span className="text-slate-600">Jobs listing</span>
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
              placeholder="e.g UI Designer"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl pl-12 pr-4 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-300 focus:bg-white transition"
            />
          </div>

          {/* Job Type Dropdown */}
          <div className="w-full md:w-48 relative flex items-center">
            <Briefcase className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none" />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl pl-12 pr-10 py-3 text-slate-700 text-sm focus:outline-none focus:border-indigo-300 focus:bg-white transition appearance-none cursor-pointer"
            >
              <option value="">Job Type</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Freelance">Freelance</option>
              <option value="Remote">Remote</option>
            </select>
            <ChevronDown className="absolute right-4 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Location Dropdown */}
          <div className="w-full md:w-48 relative flex items-center">
            <MapPin className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none" />
            <select
              value={searchLoc}
              onChange={(e) => setSearchLoc(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl pl-12 pr-10 py-3 text-slate-700 text-sm focus:outline-none focus:border-indigo-300 focus:bg-white transition appearance-none cursor-pointer"
            >
              <option value="">Location</option>
              <option value="Hamirpur">Hamirpur, HP</option>
              <option value="Mohali">Mohali, PB</option>
              <option value="Chandigarh">Chandigarh, PB</option>
              <option value="Ambala">Ambala, HR</option>
              <option value="Noida">Noida, UP</option>
              <option value="Bangalore">Bangalore, KA</option>
              <option value="Pune">Pune, MH</option>
              <option value="Hyderabad">Hyderabad, TS</option>
            </select>
            <ChevronDown className="absolute right-4 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="bg-[#ff5e14] hover:bg-[#e05300] text-white font-bold text-sm px-6 py-3 rounded-xl transition duration-150 shadow-md shadow-orange-600/10 cursor-pointer whitespace-nowrap"
          >
            Find Now
          </button>
        </form>
      </div>

      {/* Main Grid Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Left Column: Job Cards */}
          <div className="lg:col-span-8 space-y-6 order-1 lg:order-1">
            
            {/* Header / Info bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-2">
              <span className="text-xs font-bold text-slate-500">
                Showing <strong className="text-slate-800">{filteredJobs.length}</strong> jobs
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

            {/* Grid of Job Cards */}
            {filteredJobs.length === 0 ? (
              <div className="text-center py-16 border border-slate-100 rounded-2xl bg-slate-50">
                <p className="text-slate-500 font-semibold text-sm">No jobs found matching your filters.</p>
                <button
                  onClick={resetSidebarFilters}
                  className="mt-4 text-xs font-bold text-indigo-650 hover:text-indigo-500"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="border border-slate-250 rounded-2xl p-6 bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[210px]">
                    <div className="flex gap-4 items-start">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0 ${job.logoBg}`}>
                        {job.logoLetter}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h3 className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-base truncate">
                          <Link to="/login">{job.title}</Link>
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 truncate">{job.company}</p>
                        <div className="flex items-center gap-1 mt-3 text-xs font-bold text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {job.location}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                      <span className="text-sm font-extrabold text-indigo-600">{job.salary}</span>
                      <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                        {job.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {filteredJobs.length > 0 && (
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

              {/* Category selector */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Category</h4>
                <div className="relative flex items-center">
                  <Briefcase className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <select
                    value={sidebarCat}
                    onChange={(e) => setSidebarCat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-10 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-300 focus:bg-white transition appearance-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    <option value="IT & Software">IT & Software</option>
                    <option value="Designing">Designing</option>
                    <option value="Accounts & Finance">Accounts & Finance</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="HR & Admin">HR & Admin</option>
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

      {/* Trusted companies component */}
      <TrustedCompanies />
    </div>
  );
};

export default Jobs;
