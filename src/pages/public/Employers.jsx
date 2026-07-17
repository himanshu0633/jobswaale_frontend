import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bookmark } from 'lucide-react';
import { BASE_API_URL } from '../../context/AuthContext';

/* ─────────────────────────────────────────────────────────────
   STAR RATING  — matches .rate.small from the CSS
   (5 gold stars, grey empties, tiny scale)
───────────────────────────────────────────────────────────── */
const StarRating = ({ rating }) => {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="13" height="13" viewBox="0 0 20 20"
          style={{ fill: s <= rounded ? '#f5a623' : '#ccc' }}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
};

/* SVG icons */
const IcoMarker = () => (
  <svg width="16" height="16" fill="none" stroke="#88929b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="mr-1 flex-shrink-0">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
  </svg>
);
const IcoBriefcase = () => (
  <svg width="16" height="16" fill="none" stroke="#88929b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="mr-1 flex-shrink-0">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
  </svg>
);
const IcoMail = () => (
  <svg width="16" height="16" fill="none" stroke="#88929b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IcoShield = () => (
  <svg width="18" height="18" fill="none" stroke="#88929b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IcoBookmark = () => (
  <svg width="18" height="18" fill="none" stroke="#88929b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
  </svg>
);
const IcoSearch = () => (
  <svg width="18" height="18" fill="none" stroke="#88929b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IcoChevronDown = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="inline ml-1">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IcoEnvelope = () => (
  <svg width="16" height="16" fill="none" stroke="#88929b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IcoChevronRight = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="inline ml-1.5">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   EMPLOYER CARD  — mirrors .card-grid-2.card-employers exactly
───────────────────────────────────────────────────────────── */
const EmployerCard = ({ company }) => {
  const [hovered, setHovered] = useState(false);
  const [saved, setSaved] = useState(Boolean(company.hasSaved));
  const [toggling, setToggling] = useState(false);
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=e8eaf6&color=3949ab&size=110&bold=true`;

  const handleToggleSave = async (e) => {
    e.preventDefault();
    if (toggling) return;
    setToggling(true);
    try {
      const token = localStorage.getItem('publicToken');
      if (!token) {
        alert('Please log in to save employers.');
        setToggling(false);
        return;
      }
      const res = await axios.post(
        `${BASE_API_URL}/jobseeker/saved-employers/${company.id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSaved(Boolean(res.data?.saved));
    } catch (err) {
      console.error('Toggle save employer error:', err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="col-lg-6 col-md-6 mb-0">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 10,
          border: `0.88px solid ${hovered ? '#0047C7' : 'rgba(6,18,36,0.1)'}`,
          overflow: 'hidden',
          marginBottom: 30,
          position: 'relative',
          background: '#fff',
          boxShadow: hovered ? '0px 9px 26px 0px rgba(31,31,51,0.06)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        {/* top-right icon links */}
        <div className="absolute top-4 right-4 flex gap-2.5 z-10">
          <a href="#" className="text-[#88929b]"><IcoShield /></a>
          <button
            type="button"
            onClick={handleToggleSave}
            disabled={toggling}
            title={saved ? "Saved" : "Save Employer"}
            className="border-0 bg-transparent p-0 cursor-pointer transition hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: toggling ? '#ccc' : (saved ? '#ffb020' : '#88929b') }}
          >
            <Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* circular logo  — matches .card-grid-2-image-rd + .online */}
        <div className="text-center pt-7 pb-0 inline-block w-full">
          <div className="relative inline-block">
            <a href={`/employer-detail?id=${encodeURIComponent(company.id)}`}>
              <figure className="relative inline-block m-0">
                <img
                  alt={company.name}
                  src={company.logoImg || fallbackAvatar}
                  className="rounded-full h-[110px] w-[110px] object-cover"
                />
              </figure>
            </a>
            {/* online green dot */}
            {company.online && (
              <span className="h-[18px] w-[18px] rounded-full bg-[#00c070] border-2 border-white absolute bottom-2.5 right-1.5 block" />
            )}
          </div>
        </div>

        {/* card-block-info */}
        <div className="inline-block w-full px-7 pt-5 pb-6">
          {/* card-profile */}
          <div className="text-center">
            <h5 className="m-0 mb-1.5">
              <a
                href={`/employer-detail?id=${encodeURIComponent(company.id)}`}
                style={{
                  fontWeight: 'bold',
                  fontSize: 18,
                  color: hovered ? '#0047C7' : '#1f2938',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
              >
                {company.name}
              </a>
            </h5>
            {/* stars + count */}
            <div className="flex justify-center items-center gap-1.5 mt-1.5">
              <StarRating rating={company.rating} />
              <span className="text-[#88929b] text-xs">
                {company.ratesCount} rates ({company.rating.toFixed(1)})
              </span>
            </div>
          </div>

          {/* location + industry row */}
          <div className="mt-4 grid grid-cols-2 gap-1">
            <div className="flex items-center justify-center text-sm text-[#475569]">
              <IcoMarker />
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">{company.location}</span>
            </div>
            <div className="flex items-center justify-center text-sm text-[#475569]">
              <IcoBriefcase />
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">{company.industry}</span>
            </div>
          </div>

          {/* open jobs button — .btn-border.btn-brand-hover */}
          <div className="text-center mt-6">
            <a
              href={`/jobs?company=${encodeURIComponent(company.name)}`}
              style={{
                display: 'inline-block',
                padding: '13px 28px',
                border: '1px solid rgba(6,18,36,0.1)',
                borderRadius: 10,
                background: '#fff',
                color: '#111112',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='#0047C7'; e.currentTarget.style.color='#fff'; e.currentTarget.style.transform='translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.color='#111112'; e.currentTarget.style.transform='translateY(0)'; }}
            >
              {company.openJobs} Open Jobs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   CHECKBOX ROW  — matches .cb-container + .number-item
───────────────────────────────────────────────────────────── */
const CheckRow = ({ label, count, checked, onChange }) => (
  <li className="relative pr-[30px] pb-1 inline-block w-full">
    <label className="block relative pl-[35px] mb-2.5 cursor-pointer leading-[21px] select-none text-sm text-[#475569]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="absolute opacity-0 cursor-pointer h-0 w-0"
      />
      {/* custom checkmark box */}
      <span className={`absolute top-0 left-0 h-[22px] w-[22px] bg-white border-2 ${checked ? 'border-[#0047C7]' : 'border-[#d1d1d1]'} rounded flex items-center justify-center transition-colors duration-150`}>
        {checked && (
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 7l3.5 3.5L11 3" stroke="#0047C7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <span className="text-sm">{label}</span>
    </label>
    <span className="absolute top-[30%] right-0 -translate-y-1/2 px-2 py-0.5 text-xs leading-4 rounded bg-[rgba(156,156,163,0.18)] text-[#9c9ca3]">
      {count}
    </span>
  </li>
);

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────────────────────────────── */
export const Employers = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInd, setSearchInd]         = useState('');
  const [searchLoc, setSearchLoc]         = useState('');
  const [sidebarLoc, setSidebarLoc]       = useState('');
  const [sidebarInd, setSidebarInd]       = useState('');
  const [sidebarTypes, setSidebarTypes]   = useState([]);
  const [sidebarExps, setSidebarExps]     = useState([]);
  const [sortBy, setSortBy]               = useState('newest');
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [companyError, setCompanyError] = useState('');
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderDone, setReminderDone]   = useState(false);

  const industries = [...new Set(companies.map(company => company.industry).filter(Boolean))];
  const locations = [...new Set(companies.map(company => company.location).filter(Boolean))];

  /* filter logic */
  const runFilter = (overrides = {}) => {
    const kw   = (overrides.searchKeyword ?? searchKeyword).toLowerCase();
    const ind  = overrides.searchInd  ?? searchInd;
    const loc  = overrides.searchLoc  ?? searchLoc;
    const sLoc = overrides.sidebarLoc ?? sidebarLoc;
    const sInd = overrides.sidebarInd ?? sidebarInd;
    const sort = overrides.sortBy     ?? sortBy;

    let res = [...companies];
    if (kw)   res = res.filter(c => c.name.toLowerCase().includes(kw) || c.industry.toLowerCase().includes(kw));
    if (ind)  res = res.filter(c => c.industry.toLowerCase().includes(ind.toLowerCase()));
    if (loc)  res = res.filter(c => c.location.toLowerCase().includes(loc.toLowerCase()));
    if (sLoc) res = res.filter(c => c.location.toLowerCase().includes(sLoc.toLowerCase()));
    if (sInd) res = res.filter(c => c.industry === sInd);
    res.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      if (dateA.getTime() !== dateB.getTime()) {
        return sort === 'newest' ? dateB - dateA : dateA - dateB;
      }
      return sort === 'newest'
        ? String(b.id).localeCompare(String(a.id))
        : String(a.id).localeCompare(String(b.id));
    });
    setFilteredCompanies(res);
  };

  useEffect(() => {
    const fetchEmployers = async () => {
      setLoadingCompanies(true);
      setCompanyError('');
      try {
        const token = localStorage.getItem('publicToken');
        const res = await axios.get(`${BASE_API_URL}/employers/public`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const mapped = (res.data || []).map((item) => ({
          id: item.id || item._id,
          name: item.name || 'Employer',
          location: item.location || 'Location not specified',
          industry: item.industry || 'General',
          openJobs: Number(item.openJobs || 0),
          rating: Number(item.rating || 4.2),
          ratesCount: Number(item.ratesCount || 0),
          logoImg: item.logoImg || null,
          online: Boolean(item.online),
          createdAt: item.createdAt || '',
          hasSaved: Boolean(item.hasSaved)
        }));
        setCompanies(mapped);
        setFilteredCompanies(mapped);
      } catch (err) {
        console.error('Error fetching public employers:', err);
        setCompanyError('Failed to load employers from database.');
        setCompanies([]);
        setFilteredCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchEmployers();
  }, []);

  useEffect(() => { runFilter({ sortBy }); }, [sortBy, companies]);

  const handleFind = e => { e.preventDefault(); runFilter(); };
  const resetFilters = () => {
    setSearchKeyword(''); setSearchInd(''); setSearchLoc('');
    setSidebarLoc(''); setSidebarInd(''); setSidebarTypes([]); setSidebarExps([]);
    setFilteredCompanies(companies);
  };
  const toggleType = t => setSidebarTypes(p => p.includes(t) ? p.filter(x=>x!==t) : [...p,t]);
  const toggleExp  = e => setSidebarExps (p => p.includes(e) ? p.filter(x=>x!==e) : [...p,e]);
  const handleReminder = e => {
    e.preventDefault();
    setReminderDone(true); setReminderEmail('');
    setTimeout(() => setReminderDone(false), 3000);
  };

  /* shared input style */
  const inputStyle = {
    border:'1px solid rgba(6,18,36,0.1)',
    borderRadius:10,
    height:50,
    boxShadow:'none',
    paddingLeft:42,
    fontSize:14,
    width:'100%',
    color:'#37404e',
    outline:'none',
    background:'#fff',
  };

  return (
    <div className="w-full bg-white font-sans">

      {/* Local styles for the two independently-scrollable panes.
          Each pane only scrolls while the pointer is hovering over
          it (native overflow-y:auto behavior), with a subtle
          scrollbar that only shows itself on hover. */}
      <style>{`
        .scroll-pane {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .scroll-pane:hover {
          scrollbar-color: rgba(6,18,36,0.25) transparent;
        }
        .scroll-pane::-webkit-scrollbar {
          width: 6px;
        }
        .scroll-pane::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 10px;
        }
        .scroll-pane:hover::-webkit-scrollbar-thumb {
          background-color: rgba(6,18,36,0.25);
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════
          BANNER / BREADCRUMB  — .section-box-2 > .box-head-single.none-bg
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#FFF9F3] inline-block w-full py-[55px] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h4 className="text-[28px] leading-[34px] font-bold text-[#1f2938] mb-0">
            There are <strong className="text-[#ff5e14]">500+</strong> companies<br />here for you!
          </h4>

          <div className="flex flex-wrap mt-[15px] mb-10 items-center justify-between">
            <div>
              <span className="text-[#88929b] text-sm">Discover your next career move, freelance gig, or internship</span>
            </div>
            <ul className="list-none m-0 p-0 flex gap-0">
              <li className="text-[#88929b] text-base pl-0 relative">
                <a href="/" className="text-base text-[#1f2938] no-underline">Home</a>
              </li>
              <li className="text-[#88929b] text-base pl-[13px] relative">
                <span className="absolute top-1 left-1 text-[#1f2938]">/</span>
                Companies listing
              </li>
            </ul>
          </div>

          {/* ── FILTER BAR — .box-shadow-bdrd-15.box-filters ── */}
          <div className="rounded-[15px] shadow-[0px_20px_60px_-6px_rgba(0,0,0,0.04)] bg-white p-[15px] border border-[#ececec]">
            <form onSubmit={handleFind}>
              <div className="flex flex-wrap gap-3 items-center">
                {/* keyword search */}
                <div className="flex-1 min-w-[220px] relative">
                  <IcoSearch />
                  <input
                    type="text"
                    placeholder="e.g microsoft"
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    style={{ ...inputStyle, paddingLeft:42 }}
                  />
                </div>

                {/* industry dropdown */}
                <div className="flex-0 min-w-[160px] relative">
                  <svg width="18" height="18" fill="none" stroke="#88929b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                  </svg>
                  <select
                    value={searchInd}
                    onChange={e => setSearchInd(e.target.value)}
                    style={{ ...inputStyle, paddingLeft:42, paddingRight:28, appearance:'none', cursor:'pointer', height:50 }}
                  >
                    <option value="">Industry</option>
                    {industries.map(i=>(
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <svg width="12" height="12" fill="none" stroke="#88929b" strokeWidth="2" viewBox="0 0 24 24"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>

                {/* location dropdown */}
                <div className="flex-0 min-w-[160px] relative">
                  <svg width="18" height="18" fill="none" stroke="#88929b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                  </svg>
                  <select
                    value={searchLoc}
                    onChange={e => setSearchLoc(e.target.value)}
                    style={{ ...inputStyle, paddingLeft:42, paddingRight:28, appearance:'none', cursor:'pointer', height:50 }}
                  >
                    <option value="">Location</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                  <svg width="12" height="12" fill="none" stroke="#88929b" strokeWidth="2" viewBox="0 0 24 24"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>

                {/* Find Now button — .btn.btn-default */}
                <button
                  type="submit"
                  style={{
                    flex:'0 0 auto',
                    background:'#0047C7',
                    color:'#fff',
                    border:'none',
                    borderRadius:10,
                    padding:'14px 25px',
                    fontSize:14,
                    fontWeight:600,
                    cursor:'pointer',
                    transition:'background 0.2s',
                    whiteSpace:'nowrap',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background='#0052cc'}
                  onMouseLeave={e=>e.currentTarget.style.background='#0047C7'}
                >
                  Find Now
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          MAIN SECTION  — .section-box.mt-80.mb-80
      ══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto my-20 px-4 sm:px-6">
        <div className="flex flex-wrap gap-12 items-start">

          {/* ────────────────────────────────────────────────────
              SIDEBAR  (col-lg-4) — rendered first in DOM but
              visually on the left via order / flex layout.
              Independently scrollable pane: scrolls only while
              the pointer is hovering over this column.
          ──────────────────────────────────────────────────── */}
          <div
            className="flex-0 min-w-[340px] flex flex-col gap-[30px] scroll-pane"
            style={{
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              position: 'sticky',
              top: 20,
              paddingRight: 8,
            }}
          >

            {/* Email reminder — .sidebar-with-bg */}
            <div className="bg-[rgba(81,146,255,0.12)] rounded-[10px] p-[30px]">
              <h5 className="text-[22px] leading-[28px] font-medium text-[#1f2938] mb-2.5">Set job reminder</h5>
              <p className="text-base leading-[22px] text-[#999] mb-0">
                Enter your email address and get job notification.
              </p>
              <form onSubmit={handleReminder}>
                <div className="relative mt-[15px]">
                  <IcoEnvelope />
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={reminderEmail}
                    onChange={e => setReminderEmail(e.target.value)}
                    style={{ ...inputStyle, paddingLeft:42 }}
                  />
                </div>
                <div className="mt-[25px] mb-[5px]">
                  <button
                    type="submit"
                    style={{
                      background:'#0047C7', color:'#fff', border:'none',
                      borderRadius:10, padding:'14px 25px', fontSize:14,
                      fontWeight:600, cursor:'pointer', width:'100%',
                      transition:'background 0.2s',
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background='#0052cc'}
                    onMouseLeave={e=>e.currentTarget.style.background='#0047C7'}
                  >
                    {reminderDone ? '✓ Submitted!' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>

            {/* Filters panel — .sidebar-shadow.none-shadow */}
            <div className="border border-[rgba(6,18,36,0.1)] p-[29px_33px] rounded-[10px] bg-white">

              {/* Location */}
              <div className="mb-[30px]">
                <h5 className="text-lg text-[#1f2938] font-semibold mb-[15px]">Location</h5>
                <div className="relative">
                  <svg width="18" height="18" fill="none" stroke="#88929b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                    className="absolute left-3 top-1/2 -translate-y-1/2">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Location"
                    value={sidebarLoc}
                    onChange={e => setSidebarLoc(e.target.value)}
                    style={{ ...inputStyle }}
                  />
                </div>
              </div>

              {/* Industry Type */}
              <div className="mb-[30px]">
                <h5 className="text-lg text-[#1f2938] font-semibold mb-[15px]">Industry Type</h5>
                <div className="relative">
                  <svg width="18" height="18" fill="none" stroke="#88929b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                  </svg>
                  <select
                    value={sidebarInd}
                    onChange={e => setSidebarInd(e.target.value)}
                    style={{ ...inputStyle, paddingLeft:42, paddingRight:28, appearance:'none', cursor:'pointer', height:50 }}
                  >
                    <option value="">IT &amp; Consulting</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                  <svg width="12" height="12" fill="none" stroke="#88929b" strokeWidth="2" viewBox="0 0 24 24"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>

              {/* Job Type */}
              <div className="mb-[30px]">
                <h5 className="text-lg text-[#1f2938] font-semibold mb-[15px]">Job type</h5>
                <ul className="list-none m-0 pt-[15px] pb-[5px]">
                  {[
                    {label:'Full Time Jobs',count:235},
                    {label:'Part Time Jobs',count:28},
                    {label:'Remote Jobs',count:67},
                    {label:'Freelance',count:92},
                    {label:'Temporary',count:14},
                  ].map(({label,count}) => (
                    <CheckRow key={label} label={label} count={count}
                      checked={sidebarTypes.includes(label)}
                      onChange={() => toggleType(label)} />
                  ))}
                </ul>
              </div>

              {/* Experience Level */}
              <div className="mb-[30px]">
                <h5 className="text-lg text-[#1f2938] font-semibold mb-[15px]">Experience Level</h5>
                <ul className="list-none m-0 pt-[15px] pb-[5px]">
                  {[
                    {label:'Expert',count:76},{label:'Senior',count:89},
                    {label:'Junior',count:54},{label:'Regular',count:23},
                    {label:'Internship',count:22},{label:'Associate',count:14},
                  ].map(({label,count}) => (
                    <CheckRow key={label} label={label} count={count}
                      checked={sidebarExps.includes(label)}
                      onChange={() => toggleExp(label)} />
                  ))}
                </ul>
              </div>

              {/* buttons-filter */}
              <div className="flex gap-3">
                <button
                  onClick={() => runFilter()}
                  style={{
                    flex:1, background:'#0047C7', color:'#fff', border:'none',
                    borderRadius:10, padding:'12px 15px', fontSize:14, fontWeight:500, cursor:'pointer',
                    transition:'background 0.2s',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background='#0052cc'}
                  onMouseLeave={e=>e.currentTarget.style.background='#0047C7'}
                >
                  Apply filter
                </button>
                <button
                  onClick={resetFilters}
                  style={{
                    flex:1, background:'transparent', color:'#1f2938', border:'none',
                    borderRadius:10, padding:'12px 15px', fontSize:14, fontWeight:500, cursor:'pointer',
                    textDecoration:'none',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.color='#0047C7'}
                  onMouseLeave={e=>e.currentTarget.style.color='#1f2938'}
                >
                  Reset filter
                </button>
              </div>
            </div>

            {/* Recruiting banner — .sidebar-with-bg.background-primary.bg-sidebar */}
            <div style={{
              background:'rgb(81,146,255)',
              borderRadius:10,
              padding:'30px 30px 80px',
              backgroundImage:'url(assets/imgs/theme/bg-sidebar.svg)',
              backgroundPosition:'bottom right',
              backgroundRepeat:'no-repeat',
            }}>
              <h5 className="text-lg text-white font-semibold mb-5 mt-5">Recruiting?</h5>
              <p className="text-base leading-[22px] text-white mb-[30px] opacity-85">
                Advertise your jobs to millions of monthly users and search 16.8 million CVs in our database.
              </p>
              <a
                href="#"
                style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  background:'#fff', color:'#0047C7', border:'1px solid #fff',
                  borderRadius:10, padding:'8px 37px 9px 17px', fontSize:12,
                  fontWeight:600, textDecoration:'none',
                  backgroundImage:'url(assets/imgs/theme/icons/chevron-right.svg)',
                  backgroundRepeat:'no-repeat',
                  backgroundPosition:'right 13px center',
                  transition:'all 0.2s',
                }}
                onMouseEnter={e=>{ e.currentTarget.style.background='#0047C7'; e.currentTarget.style.color='#fff'; }}
                onMouseLeave={e=>{ e.currentTarget.style.background='#fff'; e.currentTarget.style.color='#0047C7'; }}
              >
                Post a Job
              </a>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────
              CONTENT — col-lg-8  (company cards)
              Independently scrollable pane: scrolls only while
              the pointer is hovering over this column.
          ──────────────────────────────────────────────────── */}
          <div
            className="flex-1 min-w-0 scroll-pane"
            style={{
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingRight: 8,
            }}
          >

            {/* box-filters-job: count + sort */}
            <div className="flex justify-between items-center mt-[15px] mb-[30px]">
              <span className="text-sm text-[#37404e]">
                Showing <strong>{filteredCompanies.length}</strong> companies
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[#9c9ca3] font-semibold text-sm">Sort by:</span>
                <div className="relative inline-block">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    style={{
                      border:'none', background:'transparent', fontSize:14, fontWeight:600,
                      color:'#37404e', cursor:'pointer', outline:'none', paddingRight:20, appearance:'none',
                    }}
                  >
                    <option value="newest">Newest Post</option>
                    <option value="oldest">Oldest Post</option>
                  </select>
                  <svg width="12" height="12" fill="none" stroke="#88929b" strokeWidth="2" viewBox="0 0 24 24"
                    className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* company card grid — row.g-4 */}
            {loadingCompanies ? (
              <div className="grid grid-cols-2 gap-6 animate-pulse w-full">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border border-[rgba(6,18,36,0.1)] rounded-[10px] bg-white p-7 flex flex-col min-h-[320px] items-center text-center relative">
                    {/* Top right icon placeholders */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <div className="h-5 w-5 rounded bg-slate-200" />
                      <div className="h-5 w-5 rounded bg-slate-200" />
                    </div>
                    {/* Circular Logo */}
                    <div className="h-[110px] w-[110px] rounded-full bg-slate-200 mb-5" />
                    {/* Name */}
                    <div className="h-5 w-40 bg-slate-200 rounded mb-3" />
                    {/* Stars */}
                    <div className="h-4 w-28 bg-slate-200 rounded mb-4" />
                    {/* Location + Industry row */}
                    <div className="grid grid-cols-2 gap-4 w-full mt-2">
                      <div className="h-4 bg-slate-200 rounded w-full" />
                      <div className="h-4 bg-slate-200 rounded w-full" />
                    </div>
                    {/* Open jobs button */}
                    <div className="h-11 w-32 bg-slate-200 rounded-lg mt-6" />
                  </div>
                ))}
              </div>
            ) : companyError ? (
              <div className="text-center py-[60px] px-5 border border-[#ececec] rounded-[10px]">
                <p className="text-rose-600 font-semibold text-sm">{companyError}</p>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-[60px] px-5 border border-[#ececec] rounded-[10px]">
                <p className="text-[#88929b] font-semibold text-sm">No companies found matching your filters.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 bg-none border-none text-[#0047C7] text-sm cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {filteredCompanies.map(company => (
                  <EmployerCard key={company.id} company={company} />
                ))}
              </div>
            )}

            {/* Pagination — .paginations */}
{filteredCompanies.length > 0 && (
  <div className="my-[50px] flex justify-center mr-100">
    <nav className="flex">
      {['Previous','1','Next'].map((p) => {
        const isActive = p === '1';
        const isNum = !isNaN(Number(p));

        return (
          <a
            key={p}
            href="#"
            onClick={e => e.preventDefault()}
            style={{
              minWidth: isNum ? 45 : 90,
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 12px',
              border: '1px solid #D9DDE5',
              marginLeft: -1, // connects borders
              fontWeight: 600,
              fontSize: 16,
              color: isActive ? '#0047C7' : '#37404e',
              background: isActive ? '#E6EEFF' : '#fff',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {p}
          </a>
        );
      })}
    </nav>
  </div>
)}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Employers;