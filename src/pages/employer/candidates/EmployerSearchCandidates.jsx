import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Activity,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Download,
  Loader,
  MapPin,
  MoreVertical,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const initialFilters = {
  search: '',
  role: '',
  location: '',
  experience: '',
  qualification: '',
  skill: '',
  minSalary: '',
  maxSalary: '',
  notice: '',
  employmentTypes: [],
  industry: '',
  gender: '',
  language: '',
  company: '',
  sortBy: '',
  ageMin: '',
  ageMax: ''
};

const statCards = [
  { key: 'total', title: 'Total in Database', icon: Users, tone: 'bg-violet-50 text-[#6658dd]' },
  { key: 'availableNow', title: 'Available Now', icon: UserCheck, tone: 'bg-emerald-50 text-emerald-500' },
  { key: 'newThisWeek', title: 'New This Week', icon: UserPlus, tone: 'bg-sky-50 text-sky-500' },
  { key: 'premiumProfiles', title: 'Premium Profiles', icon: Star, tone: 'bg-amber-50 text-amber-500' },
  { key: 'activeToday', title: 'Active Today', icon: Activity, tone: 'bg-blue-50 text-blue-500' }
];

const availabilityTone = {
  Immediate: 'bg-emerald-50 text-emerald-500',
  '15 Days': 'bg-sky-50 text-sky-500',
  '30 Days': 'bg-amber-50 text-amber-500',
  '60 Days': 'bg-slate-100 text-slate-500',
  '90 Days': 'bg-slate-100 text-slate-500'
};

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const SelectField = ({ label, value, onChange, children, uppercase = false }) => (
  <div>
    <label className={`mb-2 block text-xs font-extrabold ${uppercase ? 'uppercase' : ''} text-slate-400`}>{label}</label>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100">
      {children}
    </select>
  </div>
);

export const EmployerSearchCandidates = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSearch, setTableSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [data, setData] = useState({ stats: {}, filters: {}, candidates: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setCurrentPage(1);
  };

  const toggleEmploymentType = (type) => {
    setFilters((current) => {
      const exists = current.employmentTypes.includes(type);
      return { ...current, employmentTypes: exists ? current.employmentTypes.filter((item) => item !== type) : [...current.employmentTypes, type] };
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setTableSearch('');
    setCurrentPage(1);
  };

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    const search = [filters.search, tableSearch].filter(Boolean).join(' ').trim();
    if (search) params.set('search', search);
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'search' || key === 'employmentTypes') return;
      if (value) params.set(key, value);
    });
    if (filters.employmentTypes.length) params.set('employmentTypes', filters.employmentTypes.join(','));
    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));
    return params.toString();
  }, [filters, tableSearch, currentPage, pageSize]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    axios.get(`${BASE_API_URL}/employer/candidates?${queryParams}`, { headers: getTokenHeaders() })
      .then((response) => {
        if (alive) setData({ stats: {}, filters: {}, candidates: [], pagination: { page: 1, limit: pageSize, total: 0, totalPages: 1 }, ...response.data });
      })
      .catch((err) => {
        if (alive) setError(err.response?.data?.message || 'Candidates could not be loaded.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [queryParams, pageSize]);

  const pagination = data.pagination || { page: currentPage, limit: pageSize, total: 0, totalPages: 1 };
  const startIndex = pagination.total ? (pagination.page - 1) * pagination.limit : 0;
  const optionFilters = data.filters || {};
  const employmentOptions = optionFilters.employmentTypes?.length ? optionFilters.employmentTypes : ['Full Time', 'Part Time', 'Contract', 'Internship'];
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(page, 1), pagination.totalPages || 1));

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <h1 className="text-xl font-extrabold text-[#3f4254]">Search Candidates</h1>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400"><span className="text-[#3f4254]">JobsWaale</span><ChevronRight className="h-4 w-4" /><span>Search Candidates</span></div>
      </div>

      {error && <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <section key={card.key} className="rounded-md border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${card.tone}`}><card.icon className="h-5 w-5" /></span>
              <div><p className="text-sm font-semibold text-slate-400">{card.title}</p><p className="mt-1 text-xl font-black text-[#3f4254]">{Number(data.stats?.[card.key] || 0).toLocaleString('en-IN')}</p></div>
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-md border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-dashed border-slate-200 px-5 py-4 lg:flex-row lg:items-center">
          <div><h2 className="text-lg font-extrabold text-[#3f4254]">Candidate Database</h2><p className="mt-1 text-sm font-semibold text-slate-400">Search, filter, and discover candidates from the talent pool. Save profiles for later review.</p></div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setAdvancedOpen((current) => !current)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white transition hover:bg-[#5848d8]"><SlidersHorizontal className="h-4 w-4" />{advancedOpen ? 'Hide Advanced Filters' : 'Advanced Filters'}</button>
            <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-100 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200"><Bookmark className="h-4 w-4" />Save Search</button>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.45fr_1fr_1fr_1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-500">Keywords</label>
              <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="h-10 w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} placeholder="Skills, title, name, company" /></div>
            </div>
            <SelectField label="Job Role" value={filters.role} onChange={(value) => setFilter('role', value)}><option value="">All Roles</option>{(optionFilters.roles || []).map((item) => <option key={item}>{item}</option>)}</SelectField>
            <div><label className="mb-2 block text-xs font-extrabold text-slate-500">Location</label><input className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100" value={filters.location} onChange={(event) => setFilter('location', event.target.value)} placeholder="City, State" /></div>
            <SelectField label="Experience" value={filters.experience} onChange={(value) => setFilter('experience', value)}><option value="">All Experience</option>{(optionFilters.experiences || ['Fresher', '1 - 2 Years', '2 - 5 Years', '5+ Years']).map((item) => <option key={item}>{item}</option>)}</SelectField>
            <SelectField label="Qualification" value={filters.qualification} onChange={(value) => setFilter('qualification', value)}><option value="">All Qualifications</option>{(optionFilters.qualifications || []).map((item) => <option key={item}>{item}</option>)}</SelectField>
            <div className="flex items-end"><button type="button" onClick={resetFilters} className="h-10 w-full rounded-md bg-[#18b99b] px-4 text-sm font-extrabold text-white transition hover:bg-[#13a98d] xl:w-auto">Reset</button></div>
          </div>

          {advancedOpen && (
            <div className="mb-5 rounded-md bg-slate-100/80 p-5">
              <div className="mb-5 flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-sm font-extrabold text-[#3f4254]"><SlidersHorizontal className="h-4 w-4" />Advanced Filters</h3><button type="button" onClick={resetFilters} className="inline-flex h-9 items-center gap-2 rounded-md border border-rose-300 bg-white px-3 text-xs font-extrabold text-rose-500 transition hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" />Clear All Filters</button></div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SelectField uppercase label="Skills" value={filters.skill} onChange={(value) => setFilter('skill', value)}><option value="">All Skills</option></SelectField>
                <SelectField uppercase label="Min Salary (LPA)" value={filters.minSalary} onChange={(value) => setFilter('minSalary', value)}><option value="">No Min</option>{[3, 5, 10, 15, 20, 25, 30, 50].map((value) => <option key={value}>{value}</option>)}</SelectField>
                <SelectField uppercase label="Max Salary (LPA)" value={filters.maxSalary} onChange={(value) => setFilter('maxSalary', value)}><option value="">No Max</option>{[5, 10, 15, 20, 25, 30, 50, 100].map((value) => <option key={value}>{value}</option>)}</SelectField>
                <SelectField uppercase label="Notice Period" value={filters.notice} onChange={(value) => setFilter('notice', value)}><option value="">Any</option>{['Immediate', '15 Days', '30 Days', '60 Days', '90 Days'].map((item) => <option key={item}>{item}</option>)}</SelectField>
                <div><label className="mb-3 block text-xs font-extrabold uppercase text-slate-400">Employment Type</label><div className="grid grid-cols-2 gap-3 text-sm font-semibold text-slate-600">{employmentOptions.map((type) => <label key={type} className="flex items-center gap-2"><input type="checkbox" checked={filters.employmentTypes.includes(type)} onChange={() => toggleEmploymentType(type)} className="h-4 w-4 rounded border-slate-200 text-[#6658dd] focus:ring-[#6658dd]" />{type}</label>)}</div></div>
                <SelectField uppercase label="Industry" value={filters.industry} onChange={(value) => setFilter('industry', value)}><option value="">All Industries</option>{(optionFilters.industries || []).map((item) => <option key={item}>{item}</option>)}</SelectField>
                <SelectField uppercase label="Gender" value={filters.gender} onChange={(value) => setFilter('gender', value)}><option value="">Any</option>{['Male', 'Female', 'Other'].map((item) => <option key={item}>{item}</option>)}</SelectField>
                <SelectField uppercase label="Languages" value={filters.language} onChange={(value) => setFilter('language', value)}><option value="">All Languages</option></SelectField>
                <div><label className="mb-2 block text-xs font-extrabold uppercase text-slate-400">Current Company</label><input className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100" value={filters.company} onChange={(event) => setFilter('company', event.target.value)} placeholder="Company name" /></div>
                <SelectField uppercase label="Sort By" value={filters.sortBy} onChange={(value) => setFilter('sortBy', value)}><option value="">Relevance</option><option>Experience (High to Low)</option><option>Experience (Low to High)</option><option>Salary (High to Low)</option><option>Salary (Low to High)</option><option>Newest First</option></SelectField>
              </div>
            </div>
          )}

          <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select>entries per page</div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">Search:<input value={tableSearch} onChange={(event) => { setTableSearch(event.target.value); setCurrentPage(1); }} className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100 sm:w-48" /></label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-[#dbe6f6] text-[11px] uppercase text-slate-600"><tr><th className="px-5 py-3">Candidate</th><th className="px-5 py-3">Experience</th><th className="px-5 py-3"><span className="inline-flex items-center gap-1">Qualification <ChevronUp className="h-3 w-3 text-slate-400" /></span></th><th className="px-5 py-3">Expected Salary</th><th className="px-5 py-3">Availability</th><th className="px-5 py-3 text-center">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan="6" className="px-5 py-12 text-center"><Loader className="mx-auto h-7 w-7 animate-spin text-[#6658dd]" /></td></tr> : data.candidates.length ? data.candidates.map((candidate) => (
                  <tr key={candidate.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${candidate.avatarTone} text-xs font-black text-slate-700 ring-2 ring-white`}>{candidate.initials}</span><div><Link to="/employer/candidates" className="text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd]">{candidate.name}</Link><p className="mt-0.5 text-xs font-semibold text-slate-400">{candidate.email || candidate.phone}</p><p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-400"><MapPin className="h-3 w-3" />{candidate.location}</p></div></div></td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">{candidate.experience}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">{candidate.qualification || '-'}</td>
                    <td className="px-5 py-4 text-sm font-extrabold text-slate-700">{candidate.expectedSalary || 'Not specified'}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded px-2.5 py-1 text-xs font-black ${availabilityTone[candidate.availability] || availabilityTone.Immediate}`}>{candidate.availability}</span></td>
                    <td className="relative px-5 py-4 text-center"><button type="button" onClick={() => setOpenMenuId(openMenuId === candidate.id ? null : candidate.id)} className="rounded p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#6658dd]" aria-label={`Actions for ${candidate.name}`}><MoreVertical className="h-4 w-4" /></button>{openMenuId === candidate.id && <><button type="button" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpenMenuId(null)} aria-label="Close menu" /><div className="absolute right-6 top-12 z-20 w-44 rounded-md border border-slate-100 bg-white py-1.5 text-left shadow-lg"><Link to="/employer/candidates" className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"><User className="h-4 w-4" /> View Profile</Link>{candidate.resume ? <a href={candidate.resume} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"><Download className="h-4 w-4" /> Download Resume</a> : <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-slate-400"><Download className="h-4 w-4" /> No Resume</button>}</div></>}</td>
                  </tr>
                )) : <tr><td colSpan="6" className="px-5 py-12 text-center text-sm font-bold text-slate-400">No candidates found.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-3 text-sm font-semibold text-slate-600 sm:flex-row sm:items-center">
            <span>Showing {pagination.total ? startIndex + 1 : 0} to {Math.min(startIndex + pagination.limit, pagination.total)} of {pagination.total} entries</span>
            <div className="flex items-center gap-2"><button type="button" onClick={() => goToPage(1)} disabled={pagination.page === 1} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronsLeft className="h-4 w-4" /></button><button type="button" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button><button type="button" className="flex h-9 min-w-9 items-center justify-center rounded-md bg-[#6658dd] px-3 text-sm font-black text-white">{pagination.page}</button><button type="button" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button><button type="button" onClick={() => goToPage(pagination.totalPages)} disabled={pagination.page === pagination.totalPages} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronsRight className="h-4 w-4" /></button></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmployerSearchCandidates;
