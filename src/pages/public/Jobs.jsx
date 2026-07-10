import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, MapPin, ChevronDown, Mail, ArrowRight, Search, X } from 'lucide-react';
import TrustedCompanies from './TrustedCompanies';
import axios from 'axios';
import { BASE_API_URL } from '../../context/AuthContext';

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
    logoBg: 'bg-rose-500'
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
    logoBg: 'bg-[#0047C7]'
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
    logoBg: 'bg-emerald-500'
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
    logoBg: 'bg-amber-500'
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
    logoBg: 'bg-rose-500'
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
    logoBg: 'bg-[#0047C7]'
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
    logoBg: 'bg-purple-500'
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
    logoBg: 'bg-indigo-500'
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
    logoBg: 'bg-red-500'
  }
];

export const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCategory = searchParams.get('category') || '';
  const queryCompany = searchParams.get('company') || '';

  // Search state (top bar)
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchLoc, setSearchLoc] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [locDropdownOpen, setLocDropdownOpen] = useState(false);
  const filterBarRef = useRef(null);

  // Sidebar filter states
  const [sidebarLoc, setSidebarLoc] = useState('');
  const [sidebarCat, setSidebarCat] = useState('');
  const [sidebarTypes, setSidebarTypes] = useState([]);
  const [sidebarExps, setSidebarExps] = useState([]);

  // Active filter state
  const [dbJobs, setDbJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [reminderEmail, setReminderEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch jobs from database on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${BASE_API_URL}/jobs`);
        const mappedJobs = (res.data || []).map(j => ({
          id: j.slug || j._id,
          title: j.jobTitle,
          company: j.companyName,
          location: `${j.city}, ${j.state}`,
          salary: j.salary || (j.minSalary && j.maxSalary ? `₹${j.minSalary} - ${j.maxSalary}` : 'Not Specified'),
          type: j.jobType?.jobType || j.workMode || 'Full Time',
          category: j.jobCategory?.categoryName || 'IT & Software',
          experience: j.experience,
          logoLetter: j.companyName ? j.companyName.charAt(0).toUpperCase() : 'J',
          logoBg: ['bg-red-500', 'bg-blue-600', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500'][Math.floor(Math.random() * 5)]
        }));
        setDbJobs(mappedJobs);
        setFilteredJobs(mappedJobs);
      } catch (err) {
        console.error('Fetch jobs error:', err);
        setError('Failed to fetch jobs from database.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_API_URL}/masters/job-categories`);
        const activeCategories = (res.data || [])
          .filter((category) => (category.status || 'active') === 'active')
          .sort((a, b) => {
            const sortA = Number.isFinite(Number(a.sortingNo)) ? Number(a.sortingNo) : Number.MAX_SAFE_INTEGER;
            const sortB = Number.isFinite(Number(b.sortingNo)) ? Number(b.sortingNo) : Number.MAX_SAFE_INTEGER;
            if (sortA !== sortB) return sortA - sortB;
            return (a.categoryName || '').localeCompare(b.categoryName || '');
          });
        setCategories(activeCategories);
      } catch (err) {
        console.error('Fetch categories error:', err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    setSidebarCat(queryCategory);
  }, [queryCategory]);

  const filterJobs = () => {
    let result = [...dbJobs];

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
    if (tagFilter.trim() !== '') {
      const tag = tagFilter.toLowerCase();
      result = result.filter((j) => j.category.toLowerCase().includes(tag.split('/')[0]) || j.title.toLowerCase().includes(tag));
    }
    if (searchType) {
      const typeMap = {
        'Full time': 'Full Time',
        'Part time': 'Part Time',
        Freelancer: 'Freelance',
        'Online work': 'Remote'
      };
      const mapped = (typeMap[searchType] || searchType).toLowerCase();
      result = result.filter((j) => j.type.toLowerCase() === mapped);
    }
    if (searchLoc) {
      result = result.filter((j) => j.location.toLowerCase().includes(searchLoc.toLowerCase()));
    }

    // Sidebar filters
    if (sidebarLoc.trim() !== '') {
      result = result.filter((j) => j.location.toLowerCase().includes(sidebarLoc.toLowerCase()));
    }
    const selectedCategory = sidebarCat || queryCategory;
    if (selectedCategory) {
      result = result.filter((j) => j.category === selectedCategory);
    }
    if (queryCompany) {
      const company = queryCompany.trim().toLowerCase();
      result = result.filter((j) => String(j.company || '').trim().toLowerCase() === company);
    }
    if (sidebarTypes.length > 0) {
      result = result.filter((j) => sidebarTypes.includes(j.type));
    }
    if (sidebarExps.length > 0) {
      result = result.filter((j) => sidebarExps.includes(j.experience));
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    } else {
      result.sort((a, b) => String(a.id).localeCompare(String(b.id)));
    }

    setFilteredJobs(result);
  };

  useEffect(() => {
    filterJobs();
  }, [dbJobs, sortBy, queryCategory, queryCompany]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setTypeDropdownOpen(false);
        setLocDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFindNow = () => {
    filterJobs();
  };

  const applySidebarFilters = () => {
    filterJobs();
  };

  const handleSidebarCategoryChange = (value) => {
    setSidebarCat(value);
    if (queryCategory) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('category');
      setSearchParams(nextParams);
    }
  };

  const resetSidebarFilters = () => {
    setSearchParams({});
    setSidebarLoc('');
    setSidebarCat('');
    setSidebarTypes([]);
    setSidebarExps([]);
    setSearchKeyword('');
    setSearchType('');
    setSearchLoc('');
    setTagFilter('');
    setFilteredJobs(dbJobs);
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
    <div className="w-full bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Banner Section — heading, breadcrumb, and filter card all live inside the cream banner */}
      <section className="bg-[#FFF9F3] py-[55px] relative overflow-hidden">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 relative z-10">

          {/* Heading row */}
          <h1 className="text-[28px] leading-[34px] sm:text-4xl sm:leading-tight font-bold text-[#1f2938]">
            Your next opportunity starts here <br />
            with <strong className="text-[#FF6B00]">2000+</strong> Jobs
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mt-4 mb-10">
            <span className="text-[#475569] text-sm">
              Discover your next career move, freelance gig, or internship
            </span>
            <ul className="flex items-center gap-2 text-sm text-[#88929b]">
              <li><Link to="/" className="text-[#1f2938] hover:text-[#0047C7] font-normal">Home</Link></li>
              <li className="relative pl-3 before:content-['/'] before:absolute before:left-0 before:text-[#1f2938]">Jobs listing</li>
            </ul>
          </div>

          {/* Filter card — matches box-shadow-bdrd-15.box-filters: two columns,
              left = keyword search + removable tag pill, right = dropdowns + Find Now button */}
          <div
            ref={filterBarRef}
            className="bg-white rounded-[15px] p-[15px]"
            style={{ boxShadow: '0px 20px 60px -6px rgba(0,0,0,0.04)', border: 'thin solid #ececec' }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">

              {/* Left column: keyword search (its own form) + removable tag pill below */}
              <div className="flex flex-wrap items-center gap-4">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex-1 min-w-[200px]"
                >
                  <div className="relative">
                    <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#88929b] pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g UI Designer"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="w-full border-0 pl-9 pr-2 py-3 text-[#37404e] placeholder-[#88929b] text-sm focus:outline-none bg-transparent"
                    />
                  </div>
                </form>

                {tagFilter && (
                  <span className="inline-flex items-center gap-2 text-sm text-[#37404e] bg-[#f1f7ff] rounded-[10px] pl-[22px] pr-[14px] py-3">
                    {tagFilter}
                    <button
                      type="button"
                      onClick={() => setTagFilter('')}
                      aria-label="Remove filter"
                      className="h-[15px] w-[15px] flex items-center justify-center text-[#88929b] hover:text-[#37404e] transition"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}
              </div>

              {/* Right column: job-type dropdown, location dropdown, Find Now button (floated right) */}
              <div className="flex items-center flex-wrap gap-3 lg:justify-between">
                <div className="flex items-center flex-wrap gap-3">

                  {/* Job type custom dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => { setTypeDropdownOpen((o) => !o); setLocDropdownOpen(false); }}
                      className="flex items-center gap-2 text-sm text-[#37404e] px-1 py-2 cursor-pointer focus:outline-none"
                    >
                      <Briefcase className="h-4 w-4 text-[#88929b]" />
                      <span>{searchType || 'Full time'}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-[#88929b]" />
                    </button>
                    {typeDropdownOpen && (
                      <ul
                        className="absolute left-0 top-full mt-3 min-w-[160px] bg-white rounded-[10px] py-2 z-30"
                        style={{ border: 'thin solid #ececec', boxShadow: '0px 9px 26px 0px rgba(31,31,51,0.06)' }}
                      >
                        {['Full time', 'Part time', 'Freelancer', 'Online work'].map((opt) => (
                          <li key={opt}>
                            <button
                              type="button"
                              onClick={() => { setSearchType(opt); setTypeDropdownOpen(false); }}
                              className={`block w-full text-left px-5 py-2.5 text-sm transition ${
                                searchType === opt ? 'bg-[#0047C7] text-white' : 'text-[#636477] hover:bg-[#f1f7ff]'
                              }`}
                            >
                              {opt}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Location custom dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => { setLocDropdownOpen((o) => !o); setTypeDropdownOpen(false); }}
                      className="flex items-center gap-2 text-sm text-[#37404e] px-1 py-2 cursor-pointer focus:outline-none"
                    >
                      <MapPin className="h-4 w-4 text-[#88929b]" />
                      <span>{searchLoc || 'Hamirpur, HP'}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-[#88929b]" />
                    </button>
                    {locDropdownOpen && (
                      <ul
                        className="absolute left-0 top-full mt-3 min-w-[180px] bg-white rounded-[10px] py-2 z-30"
                        style={{ border: 'thin solid #ececec', boxShadow: '0px 9px 26px 0px rgba(31,31,51,0.06)' }}
                      >
                        {['Mohali, PB', 'Chandigarh, PB', 'Ambala, HR'].map((opt) => (
                          <li key={opt}>
                            <button
                              type="button"
                              onClick={() => { setSearchLoc(opt); setLocDropdownOpen(false); }}
                              className={`block w-full text-left px-5 py-2.5 text-sm transition ${
                                searchLoc === opt ? 'bg-[#0047C7] text-white' : 'text-[#636477] hover:bg-[#f1f7ff]'
                              }`}
                            >
                              {opt}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Find Now button — floats to the right of the row */}
                <button
                  type="button"
                  onClick={handleFindNow}
                  className="bg-[#0047C7] hover:bg-[#0052cc] text-white font-medium text-sm px-7 py-3 rounded-[10px] transition duration-150 cursor-pointer whitespace-nowrap"
                >
                  Find Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Content — HTML uses row.flex-row-reverse with listings as col-lg-8 first in source
          (so it renders on the right) and sidebar as col-lg-4 second (renders on the left) */}
      <section className="max-w-[1350px] mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="grid gap-8 lg:grid-cols-12">

          {/* Job listings column — renders on the RIGHT to match the HTML's flex-row-reverse layout */}
          <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">

            {/* Header / Info bar */}
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm text-[#37404e]">
                Showing <strong className="text-[#37404e]">{filteredJobs.length}</strong> jobs
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#9c9ca3]">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm font-semibold text-[#37404e] bg-transparent border-0 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest Post</option>
                  <option value="oldest">Oldest Post</option>
                </select>
              </div>
            </div>

            {/* Grid of Job Cards */}
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center py-16 w-full col-span-2">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0047C7] border-t-transparent"/>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16 rounded-[12px] bg-[#f4f6fa] w-full col-span-2" style={{ border: '0.88px solid rgba(6,18,36,0.1)' }}>
                <p className="text-[#88929b] font-medium text-sm">No jobs found matching your filters.</p>
                <button
                  onClick={resetSidebarFilters}
                  className="mt-4 text-sm font-bold text-[#0047C7] hover:text-[#0052cc]"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white ${job.logoBg}`}>
                          {job.logoLetter}
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-4 min-w-0">
                        <h3 className="job-title font-bold text-[#1f2938] text-base leading-snug truncate">
                          <Link to={`/jobs/${job.id}`} className="text-dark hover:text-[#0047C7]">
                            {job.title}
                          </Link>
                        </h3>
                        <p className="company-name text-xs font-bold text-[black] truncate mb-2 mt-2">
                          {job.company}
                        </p>
                        <div className="job-meta-list flex items-center gap-1 text-xs text-[#88929b]">
                          <MapPin className="h-3.5 w-3.5 text-[#88929b] shrink-0" />
                          <span>{job.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="job-footer mt-auto pt-4 flex items-center justify-between" style={{ borderTop: '1px solid #d8d2d2', marginTop:'7%' }}>
                      <span className="job-salary text-sm font-bold text-[black]">{job.salary}</span>
                      <span className="job-badge px-3 py-1 rounded-[6px] bg-[rgba(0,71,199,0.12)] text-blue-500 text-xs font-medium">
                        {job.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {filteredJobs.length > 0 && (
              <div className="flex items-center pt-10">
                <nav className="flex items-center gap-1">
                  <button className="px-3 py-2 text-sm font-semibold text-[#37404e] hover:font-bold transition cursor-pointer">Previous</button>
                  <button className="px-3.5 py-2 rounded-[8px] text-sm font-bold text-[#37404e]" style={{ backgroundColor: 'rgba(0,71,199,0.3)' }}>1</button>
                  <button className="px-3.5 py-2 rounded-[8px] text-sm font-semibold text-[#37404e] hover:bg-[rgba(0,71,199,0.3)] transition cursor-pointer">2</button>
                  <button className="px-3.5 py-2 rounded-[8px] text-sm font-semibold text-[#37404e] hover:bg-[rgba(0,71,199,0.3)] transition cursor-pointer">3</button>
                  <button className="px-3 py-2 text-sm font-semibold text-[#37404e] hover:font-bold transition cursor-pointer">Next</button>
                </nav>
              </div>
            )}

          </div>

          {/* Sidebar column — renders on the LEFT to match the HTML's flex-row-reverse layout */}
          <div className="lg:col-span-4 space-y-[30px] order-2 lg:order-1">

            {/* Email reminder block */}
            <div className="rounded-[10px] p-[30px] space-y-3" style={{ backgroundColor: 'rgba(81,146,255,0.12)' }}>
              <h3 className="font-semibold text-[#1f2938] text-[18px]">Set job reminder</h3>
              <p className="text-sm text-[#999] leading-snug">Enter you email address and get job notification.</p>
              <form onSubmit={handleReminderSubmit} className="space-y-3 pt-1">
                <div className="relative flex items-center">
                  <Mail className="absolute left-[15px] h-[18px] w-[18px] text-[#88929b]" />
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={reminderEmail}
                    onChange={(e) => setReminderEmail(e.target.value)}
                    className="w-full bg-white border border-[rgba(6,18,36,0.1)] rounded-[10px] pl-11 pr-4 py-3 text-sm text-[#37404e] placeholder-[#88929b] focus:outline-none focus:border-[#0047C7] transition"
                  />
                </div>
                <button type="submit" className="bg-[#0047C7] hover:bg-[#0052cc] text-white font-bold text-sm px-6 py-3 rounded-[10px] transition cursor-pointer hover:-translate-y-0.5">
                  Submit
                </button>
              </form>
            </div>

            {/* Sidebar filters list */}
            <div className="rounded-[10px] bg-white p-[29px_33px] space-y-[30px]" style={{ border: '1px solid rgba(6,18,36,0.1)', boxShadow: '0px 9px 26px 0px rgba(31,31,51,0.06)' }}>

              {/* Location Input */}
              <div className="space-y-3">
                <h4 className="text-[18px] font-semibold text-[#1f2938]">Location</h4>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-[15px] h-[18px] w-[18px] text-[#88929b]" />
                  <input
                    type="text"
                    placeholder="Location"
                    value={sidebarLoc}
                    onChange={(e) => setSidebarLoc(e.target.value)}
                    className="w-full border border-[rgba(6,18,36,0.1)] rounded-[10px] pl-11 pr-4 py-3 text-sm text-[#37404e] placeholder-[#88929b] focus:outline-none focus:border-[#0047C7] transition"
                  />
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-3">
                <h4 className="text-[18px] font-semibold text-[#1f2938]">Category</h4>
                <div className="relative flex items-center">
                  <Briefcase className="absolute left-[15px] h-[18px] w-[18px] text-[#88929b] pointer-events-none" />
                  <select
                    value={sidebarCat}
                    onChange={(e) => handleSidebarCategoryChange(e.target.value)}
                    className="w-full border border-[rgba(6,18,36,0.1)] rounded-[10px] pl-11 pr-10 py-3 text-sm text-[#88929b] focus:outline-none focus:border-[#0047C7] transition appearance-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id || category.id || category.categoryName} value={category.categoryName}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-[15px] h-4 w-4 text-[#88929b] pointer-events-none" />
                </div>
              </div>

              {/* Job type checklist */}
              <div className="space-y-3">
                <h4 className="text-[18px] font-semibold text-[#1f2938]">Job type</h4>
                <div className="space-y-3 pt-1">
                  {[
                    ['Full Time', 235],
                    ['Part Time', 28],
                    ['Remote', 67],
                    ['Freelance', 92]
                  ].map(([t, count]) => (
                    <label key={t} className="flex items-center justify-between gap-2.5 text-sm text-[#37404e] cursor-pointer select-none">
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={sidebarTypes.includes(t)}
                          onChange={() => handleSidebarTypeToggle(t)}
                          className="h-[18px] w-[18px] rounded-[4px] border-2 border-[#d1d1d1] text-[#0047C7] focus:ring-[#0047C7] cursor-pointer"
                        />
                        {t}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-[5px] text-[#9c9ca3]" style={{ backgroundColor: 'rgba(156,156,163,0.18)' }}>
                        {count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience level checklist */}
              <div className="space-y-3">
                <h4 className="text-[18px] font-semibold text-[#1f2938]">Experience Level</h4>
                <div className="space-y-3 pt-1">
                  {[
                    ['Junior', 54],
                    ['Regular', 23],
                    ['Senior', 89],
                    ['Expert', 76]
                  ].map(([exp, count]) => (
                    <label key={exp} className="flex items-center justify-between gap-2.5 text-sm text-[#37404e] cursor-pointer select-none">
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={sidebarExps.includes(exp)}
                          onChange={() => handleSidebarExpToggle(exp)}
                          className="h-[18px] w-[18px] rounded-[4px] border-2 border-[#d1d1d1] text-[#0047C7] focus:ring-[#0047C7] cursor-pointer"
                        />
                        {exp}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-[5px] text-[#9c9ca3]" style={{ backgroundColor: 'rgba(156,156,163,0.18)' }}>
                        {count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sidebar filter actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={applySidebarFilters}
                  className="flex-1 bg-[#0047C7] hover:bg-[#0052cc] text-white font-bold text-sm py-3 rounded-[10px] transition cursor-pointer hover:-translate-y-0.5"
                >
                  Apply filter
                </button>
                <button
                  onClick={resetSidebarFilters}
                  className="text-[#1f2938] hover:text-[#0047C7] font-normal text-sm py-3 transition cursor-pointer"
                >
                  Reset filter
                </button>
              </div>

            </div>

            {/* Recruiting banner */}
            <div
              className="rounded-[10px] p-[30px] pb-[60px] space-y-4 relative overflow-hidden"
              style={{ backgroundColor: 'rgb(81,146,255)' }}
            >
              <h4 className="font-semibold text-white text-[22px] relative z-10">Recruiting?</h4>
              <p className="text-sm text-white/90 leading-relaxed relative z-10">
                Advertise your jobs to millions of monthly users and search 16.8 million CVs in our database.
              </p>
              <Link
                to="/contact"
                className="relative z-10 inline-flex items-center gap-2 bg-white hover:bg-[#f1f7ff] text-[#111112] font-medium text-sm px-6 py-3 rounded-[10px] transition"
              >
                Post a Job <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* Trusted companies component */}
      <TrustedCompanies />

      <style dangerouslySetInnerHTML={{__html: `
        .job-card {
          background-color: #ffffff;
          border-radius: 12px;
          border: 1px solid rgba(6, 18, 36, 0.1);
          padding: 1.8rem;
          transition: all 0.3s ease-in-out;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .job-card:hover {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
          transform: translateY(-4px);
          border-color: rgba(0, 102, 255, 0.2);
        }
      `}} />
    </div>
  );
};

export default Jobs;
