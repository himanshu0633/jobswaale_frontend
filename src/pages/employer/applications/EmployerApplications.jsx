import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  MessageCircle,
  Search,
  UserCheck,
  UserX,
  X
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import ClearFilterButton from '../../../components/ClearFilterButton';

const initialFilters = { search: '', jobTitle: '', status: '', experience: '', appliedAfter: '' };

const statCards = [
  { key: 'total', title: 'Total', status: '', icon: FileText, tone: 'bg-violet-50 text-[#6658dd]' },
  { key: 'new', title: 'New', status: 'Applied', icon: Inbox, tone: 'bg-emerald-50 text-emerald-500' },
  { key: 'shortlisted', title: 'Shortlisted', status: 'Shortlisted', icon: UserCheck, tone: 'bg-amber-50 text-amber-500' },
  { key: 'interviews', title: 'Interviews', status: 'Interview', icon: CalendarCheck, tone: 'bg-sky-50 text-sky-500' },
  { key: 'rejected', title: 'Rejected', status: 'Rejected', icon: UserX, tone: 'bg-rose-50 text-rose-500' }
];

const pipelineConfig = [
  { key: 'applied', title: 'Applied', status: 'Applied', icon: FileText, tone: 'bg-[#18b99b] text-white' },
  { key: 'reviewed', title: 'Reviewed', status: 'Reviewed', icon: Eye, tone: 'bg-sky-500 text-white' },
  { key: 'shortlisted', title: 'Shortlisted', status: 'Shortlisted', icon: UserCheck, tone: 'bg-amber-400 text-white' },
  { key: 'interview', title: 'Interview', status: 'Interview', icon: Calendar, tone: 'bg-[#6658dd] text-white' },
  { key: 'offered', title: 'Offered', status: 'Offered', icon: MailCheck, tone: 'bg-blue-500 text-white' },
  { key: 'rejected', title: 'Rejected', status: 'Rejected', icon: X, tone: 'bg-rose-500 text-white' }
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchParamString = searchParams.toString();
  const getUrlFilters = () => ({
    search: searchParams.get('search') || '',
    jobTitle: searchParams.get('jobTitle') || '',
    status: searchParams.get('status') || '',
    experience: searchParams.get('experience') || '',
    appliedAfter: searchParams.get('appliedAfter') || ''
  });
  const [filters, setFilters] = useState(getUrlFilters);
  const [tableSearch, setTableSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({ stats: {}, pipeline: {}, filters: {}, applications: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleStatCardClick = (card) => {
    if (card.key === 'shortlisted') {
      navigate('/employer/shortlisted');
    } else if (card.key === 'interviews') {
      navigate('/employer/interviews');
    } else if (card.key === 'rejected') {
      navigate('/employer/applicant-history?status=Rejected');
    } else {
      setFilter('status', card.status);
    }
  };

  const handlePipelineClick = (item) => {
    if (item.status === 'Shortlisted') {
      navigate('/employer/shortlisted');
    } else if (item.status === 'Interview') {
      navigate('/employer/interviews');
    } else if (item.status === 'Offered') {
      navigate('/employer/selected');
    } else if (item.status === 'Rejected') {
      navigate('/employer/applicant-history?status=Rejected');
    } else {
      setFilter('status', item.status);
    }
  };

  useEffect(() => {
    setFilters(getUrlFilters());
    setTableSearch('');
    setCurrentPage(1);
  }, [searchParamString]);

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
    if (filters.status) {
      params.set('status', filters.status);
    } else {
      params.set('statusGroup', 'queue');
    }
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
        if (alive) {
          const applications = response.data?.applications || [];
          setData({
            stats: {},
            pipeline: {},
            filters: {},
            ...response.data,
            applications,
            pagination: response.data?.pagination || { page: 1, limit: pageSize, total: applications.length, totalPages: 1 }
          });
        }
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
  const hasActiveFilters = Object.values(filters).some(Boolean) || Boolean(tableSearch);

  const handleStatusUpdate = async (appId, nextStatus) => {
    try {
      await axios.patch(
        `${BASE_API_URL}/employer/applications/${appId}/status`,
        { status: nextStatus },
        { headers: getTokenHeaders() }
      );
      // Refresh the application list
      const response = await axios.get(`${BASE_API_URL}/employer/applications?${queryParams}`, { headers: getTokenHeaders() });
      const applications = response.data?.applications || [];
      setData(prev => ({
        ...prev,
        ...response.data,
        applications,
        pagination: response.data?.pagination || prev.pagination || { page: 1, limit: pageSize, total: applications.length, totalPages: 1 }
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application status.');
    }
  };

  return (
    <div className="space-y-4 px-3 sm:space-y-5 sm:px-0">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center md:gap-3">
        <h1 className="text-lg font-extrabold text-[#3f4254] sm:text-xl">Applications</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 sm:text-sm"><span className="text-[#3f4254]">JobsWaale</span><ChevronRight className="h-4 w-4" /><span>Applications</span></div>
      </div>

      {error && <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        {statCards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => handleStatCardClick(card)}
            className={`rounded-md border bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${filters.status === card.status ? 'border-[#6658dd] ring-2 ring-indigo-100' : 'border-slate-100'}`}
          >
            <div className="flex items-center gap-2 sm:gap-4">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${card.tone}`}><card.icon className="h-4 w-4 sm:h-5 sm:w-5" /></span>
              <div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-400 sm:text-sm">{card.title}</p><p className="mt-1 text-base font-black text-[#3f4254] sm:text-xl">{Number(data.stats?.[card.key] || 0).toLocaleString('en-IN')}</p></div>
            </div>
          </button>
        ))}
      </div>

      <section className="rounded-md border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-dashed border-slate-200 px-4 py-4 sm:px-5"><h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Hiring Pipeline</h2></div>
        <div className="grid grid-cols-2 gap-4 p-4 sm:p-5 md:grid-cols-3 xl:grid-cols-6">
          {pipelineConfig.map((item) => (
            <button key={item.key} type="button" onClick={() => handlePipelineClick(item)} className={`flex min-w-0 items-center gap-3 rounded-md p-1 text-left transition hover:bg-slate-50 ${filters.status === item.status ? 'ring-2 ring-indigo-100' : ''}`}>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${item.tone}`}><item.icon className="h-4 w-4" /></span>
              <div className="min-w-0"><p className="text-sm font-black text-[#3f4254] sm:text-base">{Number(data.pipeline?.[item.key] || 0).toLocaleString('en-IN')}</p><p className="truncate text-xs font-semibold text-slate-400">{item.title}</p></div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-dashed border-slate-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center">
          <div><h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Application Queue</h2><p className="mt-1 text-xs font-semibold text-slate-400 sm:text-sm">Review candidates, update stages, and move strong profiles forward.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"><Link to="/employer/candidates" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-100 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200"><Search className="h-4 w-4" />Find Candidates</Link><Link to="/employer/interviews" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white transition hover:bg-[#5848d8]"><CalendarPlus className="h-4 w-4" />Schedule Interview</Link></div>
        </div>

        <div className="p-4 sm:p-5">
          {/* Quick Status Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-dashed border-slate-100 pb-4 mb-5">
              {[
              { key: '', label: 'All Queue' },
              { key: 'Applied', label: 'Waiting for Review' },
              { key: 'Reviewed', label: 'Reviewed' }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter('status', tab.key)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition border ${
                  filters.status === tab.key
                    ? 'bg-[#6658dd] text-white border-[#6658dd] shadow-sm'
                    : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mb-5 flex flex-wrap gap-1.5 border-b border-dashed border-slate-100 pb-4">
            {[
              { key: '', label: 'All Jobs' },
              ...(optionFilters.jobTitles || []).map((title) => ({ key: title, label: title }))
            ].map((job) => (
              <button
                key={job.key || 'all-jobs'}
                type="button"
                onClick={() => setFilter('jobTitle', job.key)}
                className={`max-w-full rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                  filters.jobTitle === job.key
                    ? 'border-[#6658dd] bg-[#6658dd] text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
                title={job.label}
              >
                <span className="block max-w-56 truncate">{job.label}</span>
              </button>
            ))}
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-500">Search Candidate / Job</label>
              <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="h-10 w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} placeholder="Name, email, job, location" /></div>
            </div>
            <SelectField label="Experience" value={filters.experience} onChange={(value) => setFilter('experience', value)}><option value="">All Experience</option>{(optionFilters.experiences || ['Fresher', '1 - 2 Years', '2 - 5 Years', '5+ Years']).map((item) => <option key={item}>{item}</option>)}</SelectField>
            <div><label className="mb-2 block text-xs font-extrabold text-slate-500">Applied After</label><input type="date" value={filters.appliedAfter} onChange={(event) => setFilter('appliedAfter', event.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100" /></div>
            <div className="flex items-end"><ClearFilterButton active={hasActiveFilters} onClick={resetFilters} /></div>
          </div>

          <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select>entries per page</div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">Search:<input value={tableSearch} onChange={(event) => { setTableSearch(event.target.value); setCurrentPage(1); }} className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100 sm:w-48" /></label>
          </div>

          {/* Card list — mobile only */}
          <div className="divide-y divide-slate-100 rounded-md border border-slate-100 sm:hidden">
            {loading ? (
              <div className="py-12 text-center"><Loader className="mx-auto h-7 w-7 animate-spin text-[#6658dd]" /></div>
            ) : data.applications.length ? data.applications.map((application) => (
              <div key={application.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${application.avatarTone} text-xs font-black text-slate-700 ring-2 ring-white`}>{application.initials}</span>
                  <div className="min-w-0 flex-1">
                    <Link to={`/employer/applications/${application.id}`} className="truncate text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd]">{application.name}</Link>
                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">{application.email || application.phone}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-400"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{application.location}</span></p>
                  </div>
                  <span className={`shrink-0 rounded px-2 py-1 text-[11px] font-black ${statusTone[application.status] || statusTone.Applied}`}>{application.status}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500">
                  <p className="truncate"><span className="text-slate-400">Job:</span> {application.jobTitle}</p>
                  <p className="truncate"><span className="text-slate-400">Type:</span> {application.jobType}</p>
                  <p><span className="text-slate-400">Experience:</span> {application.experience}</p>
                  <p><span className="text-slate-400">Applied:</span> {application.displayDate}</p>
                  {application.status === 'Rejected' && (
                    <p className="col-span-2"><span className="text-slate-400">Rejected after:</span> {application.rejectedFromStatus || 'Not available'}</p>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 gap-2">
                  <span className={`inline-flex rounded px-2.5 py-1 text-xs font-black ${scoreTone(application.matchScore)}`}>{application.matchScore}% match</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link to={`/employer/applications/${application.id}`} className="inline-flex h-8 items-center justify-center gap-1 rounded border border-[#6658dd] px-2 text-[10px] font-extrabold text-[#6658dd] transition hover:bg-violet-50">View</Link>
                    <Link to={`/employer/messages?application=${application.id}`} className="inline-flex h-8 items-center justify-center gap-1 rounded border border-sky-200 px-2 text-[10px] font-extrabold text-sky-600 transition hover:bg-sky-50">Message</Link>
                  </div>
                </div>
              </div>
            )) : (
              <p className="px-4 py-12 text-center text-sm font-bold text-slate-400">No applications found.</p>
            )}
          </div>

          {/* Table — sm and up */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[1080px] text-left">
              <thead className="bg-[#dbe6f6] text-[11px] uppercase text-slate-600"><tr><th className="px-5 py-3">Candidate</th><th className="px-5 py-3">Job Applied</th><th className="px-5 py-3">Experience</th><th className="px-5 py-3"><span className="inline-flex items-center gap-1">Applied Date <ChevronUp className="h-3 w-3 text-slate-400" /></span></th><th className="px-5 py-3">Match Score</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-center">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan="7" className="px-5 py-12 text-center"><Loader className="mx-auto h-7 w-7 animate-spin text-[#6658dd]" /></td></tr> : data.applications.length ? data.applications.map((application) => (
                  <tr key={application.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${application.avatarTone} text-xs font-black text-slate-700 ring-2 ring-white`}>{application.initials}</span><div><Link to={`/employer/applications/${application.id}`} className="text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd]">{application.name}</Link><p className="mt-0.5 text-xs font-semibold text-slate-400">{application.email || application.phone}</p><p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-400"><MapPin className="h-3 w-3" />{application.location}</p></div></div></td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-extrabold text-[#3f4254]">{application.jobTitle}</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-400">{application.jobType}</p>
                      {application.status === 'Rejected' && (
                        <p className="mt-1 text-xs font-black text-rose-500">Rejected after: {application.rejectedFromStatus || 'Not available'}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">{application.experience}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">{application.displayDate}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded px-2.5 py-1 text-xs font-black ${scoreTone(application.matchScore)}`}>{application.matchScore}%</span></td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded px-2.5 py-1 text-xs font-black ${statusTone[application.status] || statusTone.Applied}`}>{application.status}</span></td>
                    <td className="px-5 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 justify-center">
                        <Link to={`/employer/applications/${application.id}`} className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-[#6658dd] px-2 text-xs font-extrabold text-[#6658dd] transition hover:bg-violet-50"><Eye className="h-3.5 w-3.5" />View</Link>
                        <Link to={`/employer/messages?application=${application.id}`} className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-sky-200 px-2 text-xs font-extrabold text-sky-600 transition hover:bg-sky-50"><MessageCircle className="h-3.5 w-3.5" />Message</Link>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="7" className="px-5 py-12 text-center text-sm font-bold text-slate-400">No applications found.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-3 text-xs font-semibold text-slate-600 sm:flex-row sm:items-center sm:text-sm">
            <span>Showing {pagination.total ? startIndex + 1 : 0} to {Math.min(startIndex + pagination.limit, pagination.total)} of {pagination.total} entries</span>
            <div className="flex items-center justify-center gap-2"><button type="button" onClick={() => goToPage(1)} disabled={pagination.page === 1} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronsLeft className="h-4 w-4" /></button><button type="button" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button><button type="button" className="flex h-9 min-w-9 items-center justify-center rounded-md bg-[#6658dd] px-3 text-sm font-black text-white">{pagination.page}</button><button type="button" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button><button type="button" onClick={() => goToPage(pagination.totalPages)} disabled={pagination.page === pagination.totalPages} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronsRight className="h-4 w-4" /></button></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmployerApplications;
