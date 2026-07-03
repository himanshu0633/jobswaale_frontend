import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CalendarCheck,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Eye,
  FileText,
  Inbox,
  Loader,
  MailCheck,
  MapPin,
  Search,
  UserCheck,
  UserX,
  X
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const initialFilters = { search: '', jobTitle: '', status: '', experience: '', appliedAfter: '' };

const statCards = [
  { key: 'total', title: 'Total', icon: FileText, tone: 'bg-violet-50 text-[#6658dd]' },
  { key: 'new', title: 'New', icon: Inbox, tone: 'bg-emerald-50 text-emerald-500' },
  { key: 'shortlisted', title: 'Shortlisted', icon: UserCheck, tone: 'bg-amber-50 text-amber-500' },
  { key: 'interviews', title: 'Interviews', icon: CalendarCheck, tone: 'bg-sky-50 text-sky-500' },
  { key: 'rejected', title: 'Rejected', icon: UserX, tone: 'bg-rose-50 text-rose-500' }
];

const pipelineConfig = [
  { key: 'applied', title: 'Applied', icon: FileText, tone: 'bg-[#18b99b] text-white' },
  { key: 'reviewed', title: 'Reviewed', icon: Eye, tone: 'bg-sky-500 text-white' },
  { key: 'shortlisted', title: 'Shortlisted', icon: UserCheck, tone: 'bg-amber-400 text-white' },
  { key: 'interview', title: 'Interview', icon: Calendar, tone: 'bg-[#6658dd] text-white' },
  { key: 'offered', title: 'Offered', icon: MailCheck, tone: 'bg-blue-500 text-white' },
  { key: 'rejected', title: 'Rejected', icon: X, tone: 'bg-rose-500 text-white' }
];

const statusTone = {
  Applied: 'bg-emerald-50 text-emerald-500',
  Reviewed: 'bg-sky-50 text-sky-500',
  Shortlisted: 'bg-amber-50 text-amber-500',
  Interview: 'bg-violet-50 text-[#6658dd]',
  Offered: 'bg-blue-50 text-blue-500',
  Rejected: 'bg-rose-50 text-rose-500'
};

const scoreTone = (score) => {
  if (score >= 90) return 'bg-emerald-50 text-emerald-500';
  if (score >= 80) return 'bg-violet-50 text-[#6658dd]';
  if (score >= 70) return 'bg-sky-50 text-sky-500';
  return 'bg-rose-50 text-rose-500';
};

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const SelectField = ({ label, value, onChange, children }) => (
  <div>
    <label className="mb-2 block text-xs font-extrabold text-slate-500">{label}</label>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100">
      {children}
    </select>
  </div>
);

export const EmployerApplications = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [tableSearch, setTableSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({ stats: {}, pipeline: {}, filters: {}, applications: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
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
    if (filters.jobTitle) params.set('jobTitle', filters.jobTitle);
    if (filters.status) params.set('status', filters.status);
    if (filters.experience) params.set('experience', filters.experience);
    if (filters.appliedAfter) params.set('appliedAfter', filters.appliedAfter);
    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));
    return params.toString();
  }, [filters, tableSearch, currentPage, pageSize]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    axios.get(`${BASE_API_URL}/employer/applications?${queryParams}`, { headers: getTokenHeaders() })
      .then((response) => {
        if (alive) setData({ stats: {}, pipeline: {}, filters: {}, applications: [], pagination: { page: 1, limit: pageSize, total: 0, totalPages: 1 }, ...response.data });
      })
      .catch((err) => {
        if (alive) setError(err.response?.data?.message || 'Applications could not be loaded.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [queryParams, pageSize]);

  const pagination = data.pagination || { page: currentPage, limit: pageSize, total: 0, totalPages: 1 };
  const startIndex = pagination.total ? (pagination.page - 1) * pagination.limit : 0;
  const optionFilters = data.filters || {};
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(page, 1), pagination.totalPages || 1));

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <h1 className="text-xl font-extrabold text-[#3f4254]">Applications</h1>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400"><span className="text-[#3f4254]">JobsWaale</span><ChevronRight className="h-4 w-4" /><span>Applications</span></div>
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
        <div className="border-b border-dashed border-slate-200 px-5 py-4"><h2 className="text-lg font-extrabold text-[#3f4254]">Hiring Pipeline</h2></div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {pipelineConfig.map((item) => (
            <div key={item.key} className="flex items-center gap-3">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${item.tone}`}><item.icon className="h-4 w-4" /></span>
              <div><p className="text-base font-black text-[#3f4254]">{Number(data.pipeline?.[item.key] || 0).toLocaleString('en-IN')}</p><p className="text-xs font-semibold text-slate-400">{item.title}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-dashed border-slate-200 px-5 py-4 lg:flex-row lg:items-center">
          <div><h2 className="text-lg font-extrabold text-[#3f4254]">Application Queue</h2><p className="mt-1 text-sm font-semibold text-slate-400">Review candidates, update stages, and move strong profiles forward.</p></div>
          <div className="flex flex-wrap gap-2"><Link to="/employer/candidates" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-100 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200"><Search className="h-4 w-4" />Find Candidates</Link><Link to="/employer/interviews" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white transition hover:bg-[#5848d8]"><CalendarPlus className="h-4 w-4" />Schedule Interview</Link></div>
        </div>

        <div className="p-5">
          <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-500">Search Candidate / Job</label>
              <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="h-10 w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} placeholder="Name, email, job, location" /></div>
            </div>
            <SelectField label="Job Title" value={filters.jobTitle} onChange={(value) => setFilter('jobTitle', value)}><option value="">All Jobs</option>{(optionFilters.jobTitles || []).map((item) => <option key={item}>{item}</option>)}</SelectField>
            <SelectField label="Status" value={filters.status} onChange={(value) => setFilter('status', value)}><option value="">All Status</option>{['Applied', 'Reviewed', 'Shortlisted', 'Interview', 'Offered', 'Rejected'].map((item) => <option key={item}>{item}</option>)}</SelectField>
            <SelectField label="Experience" value={filters.experience} onChange={(value) => setFilter('experience', value)}><option value="">All Experience</option>{(optionFilters.experiences || ['Fresher', '1 - 2 Years', '2 - 5 Years', '5+ Years']).map((item) => <option key={item}>{item}</option>)}</SelectField>
            <div><label className="mb-2 block text-xs font-extrabold text-slate-500">Applied After</label><input type="date" value={filters.appliedAfter} onChange={(event) => setFilter('appliedAfter', event.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100" /></div>
            <div className="flex items-end"><button type="button" onClick={resetFilters} className="h-10 w-full rounded-md bg-[#18b99b] px-4 text-sm font-extrabold text-white transition hover:bg-[#13a98d] xl:w-auto">Reset</button></div>
          </div>

          <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select>entries per page</div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">Search:<input value={tableSearch} onChange={(event) => { setTableSearch(event.target.value); setCurrentPage(1); }} className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100 sm:w-48" /></label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left">
              <thead className="bg-[#dbe6f6] text-[11px] uppercase text-slate-600"><tr><th className="px-5 py-3">Candidate</th><th className="px-5 py-3">Job Applied</th><th className="px-5 py-3">Experience</th><th className="px-5 py-3"><span className="inline-flex items-center gap-1">Applied Date <ChevronUp className="h-3 w-3 text-slate-400" /></span></th><th className="px-5 py-3">Match Score</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-center">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan="7" className="px-5 py-12 text-center"><Loader className="mx-auto h-7 w-7 animate-spin text-[#6658dd]" /></td></tr> : data.applications.length ? data.applications.map((application) => (
                  <tr key={application.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${application.avatarTone} text-xs font-black text-slate-700 ring-2 ring-white`}>{application.initials}</span><div><Link to="/employer/applications" className="text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd]">{application.name}</Link><p className="mt-0.5 text-xs font-semibold text-slate-400">{application.email || application.phone}</p><p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-400"><MapPin className="h-3 w-3" />{application.location}</p></div></div></td>
                    <td className="px-5 py-4"><p className="text-sm font-extrabold text-[#3f4254]">{application.jobTitle}</p><p className="mt-0.5 text-xs font-semibold text-slate-400">{application.jobType}</p></td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">{application.experience}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">{application.displayDate}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded px-2.5 py-1 text-xs font-black ${scoreTone(application.matchScore)}`}>{application.matchScore}%</span></td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded px-2.5 py-1 text-xs font-black ${statusTone[application.status] || statusTone.Applied}`}>{application.status}</span></td>
                    <td className="px-5 py-4 text-center"><Link to="/employer/applications" className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#6658dd] px-3 text-xs font-extrabold text-[#6658dd] transition hover:bg-violet-50"><Eye className="h-4 w-4" />View</Link></td>
                  </tr>
                )) : <tr><td colSpan="7" className="px-5 py-12 text-center text-sm font-bold text-slate-400">No applications found.</td></tr>}
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

export default EmployerApplications;
