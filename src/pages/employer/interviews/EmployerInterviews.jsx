import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Building2,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Eye,
  Loader,
  Phone,
  Search,
  Video
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const initialFilters = { search: '', jobTitle: '', status: '', type: '', fromDate: '' };

const statConfig = [
  { key: 'total', title: 'Total', icon: CalendarCheck, tone: 'bg-violet-50 text-[#6658dd]' },
  { key: 'scheduled', title: 'Scheduled', icon: Calendar, tone: 'bg-cyan-50 text-cyan-500' },
  { key: 'completed', title: 'Completed', icon: CalendarCheck, tone: 'bg-emerald-50 text-emerald-500' },
  { key: 'rescheduled', title: 'Rescheduled', icon: CalendarClock, tone: 'bg-amber-50 text-amber-500' },
  { key: 'cancelled', title: 'Cancelled', icon: CalendarX, tone: 'bg-rose-50 text-rose-500' }
];

const statusTone = {
  Scheduled: 'bg-cyan-50 text-cyan-500',
  Completed: 'bg-emerald-50 text-emerald-500',
  Rescheduled: 'bg-amber-50 text-amber-500',
  Cancelled: 'bg-rose-50 text-rose-500'
};

const typeTone = {
  'Video Call': { className: 'bg-cyan-50 text-cyan-500', icon: Video },
  'In-Person': { className: 'bg-emerald-50 text-emerald-500', icon: Building2 },
  Telephonic: { className: 'bg-blue-50 text-blue-500', icon: Phone }
};

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
};

const normalizeTime = (time) => {
  if (!time) return '-';
  if (/am|pm/i.test(time)) return time.toUpperCase();
  const [hoursValue, minutesValue = '00'] = String(time).split(':');
  const hours = Number(hoursValue);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, '0')}:${minutesValue.padStart(2, '0')} ${suffix}`;
};

const SelectField = ({ label, value, onChange, children }) => (
  <div>
    <label className="mb-2 block text-xs font-extrabold text-slate-500">{label}</label>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100">
      {children}
    </select>
  </div>
);

export const EmployerInterviews = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [tableSearch, setTableSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({
    stats: { total: 0, scheduled: 0, completed: 0, rescheduled: 0, cancelled: 0 },
    filters: { jobTitles: [], types: [] },
    interviews: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    const search = [filters.search, tableSearch].filter(Boolean).join(' ').trim();
    if (search) params.set('search', search);
    if (filters.jobTitle) params.set('jobTitle', filters.jobTitle);
    if (filters.status) params.set('status', filters.status);
    if (filters.type) params.set('type', filters.type);
    if (filters.fromDate) params.set('fromDate', filters.fromDate);
    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));
    return params.toString();
  }, [currentPage, filters, pageSize, tableSearch]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');

    axios.get(`${BASE_API_URL}/employer/interviews?${queryParams}`, { headers: getTokenHeaders() })
      .then((response) => {
        if (!alive) return;
        setData({
          stats: { total: 0, scheduled: 0, completed: 0, rescheduled: 0, cancelled: 0 },
          filters: { jobTitles: [], types: [] },
          interviews: [],
          pagination: { page: 1, limit: pageSize, total: 0, totalPages: 1 },
          ...response.data
        });
      })
      .catch((err) => {
        if (!alive) return;
        setError(err.response?.data?.message || 'Interview schedule could not be loaded.');
        setData((current) => ({ ...current, interviews: [] }));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false; };
  }, [pageSize, queryParams]);

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setTableSearch('');
    setCurrentPage(1);
  };

  const optionFilters = data.filters || { jobTitles: [], types: [] };
  const stats = data.stats || { total: 0, scheduled: 0, completed: 0, rescheduled: 0, cancelled: 0 };
  const pagination = data.pagination || { page: currentPage, limit: pageSize, total: 0, totalPages: 1 };
  const totalPages = pagination.totalPages || 1;
  const safePage = pagination.page || 1;
  const startIndex = pagination.total ? (safePage - 1) * pagination.limit : 0;
  const visibleRows = data.interviews || [];
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages));

  return (
    <div className="space-y-4 px-3 sm:space-y-5 sm:px-0">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center md:gap-3">
        <h1 className="text-lg font-extrabold text-[#3f4254] sm:text-xl">Interviews</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 sm:text-sm"><span className="text-[#3f4254]">JobsWaale</span><ChevronRight className="h-4 w-4" /><span>Interviews</span></div>
      </div>

      {error && <div className="rounded-md border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">{error}</div>}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        {statConfig.map((card) => (
          <section key={card.key} className="rounded-md border border-slate-100 bg-white p-3 shadow-sm sm:p-5">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${card.tone}`}><card.icon className="h-4 w-4 sm:h-5 sm:w-5" /></span>
              <div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-400 sm:text-sm">{card.title}</p><p className="mt-1 text-base font-black text-[#3f4254] sm:text-xl">{Number(stats[card.key] || 0).toLocaleString('en-IN')}</p></div>
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-md border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-dashed border-slate-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center">
          <div><h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Interview Schedule</h2><p className="mt-1 text-xs font-semibold text-slate-400 sm:text-sm">Manage all upcoming, ongoing, and past interviews. Schedule, reschedule, or cancel as needed.</p></div>
          <Link to="/employer/shortlisted" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white transition hover:bg-[#5848d8]">
            <CalendarPlus className="h-4 w-4" /> Schedule New Interview
          </Link>
        </div>

        <div className="p-4 sm:p-5">
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-500">Search Candidate / Job</label>
              <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="h-10 w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} placeholder="Name, email, job, interviewer" /></div>
            </div>
            <SelectField label="Job Title" value={filters.jobTitle} onChange={(value) => setFilter('jobTitle', value)}><option value="">All Jobs</option>{optionFilters.jobTitles.map((item) => <option key={item}>{item}</option>)}</SelectField>
            <SelectField label="Status" value={filters.status} onChange={(value) => setFilter('status', value)}><option value="">All Status</option>{['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'].map((item) => <option key={item}>{item}</option>)}</SelectField>
            <SelectField label="Interview Type" value={filters.type} onChange={(value) => setFilter('type', value)}><option value="">All Types</option>{optionFilters.types.map((item) => <option key={item}>{item}</option>)}</SelectField>
            <div><label className="mb-2 block text-xs font-extrabold text-slate-500">From Date</label><input type="date" value={filters.fromDate} onChange={(event) => setFilter('fromDate', event.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100" /></div>
            <div className="flex items-end"><button type="button" onClick={resetFilters} className="h-10 w-full rounded-md bg-[#18b99b] px-4 text-sm font-extrabold text-white transition hover:bg-[#13a98d] xl:w-auto">Reset</button></div>
          </div>

          <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select>entries per page</div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">Search:<input value={tableSearch} onChange={(event) => { setTableSearch(event.target.value); setCurrentPage(1); }} className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100 sm:w-48" /></label>
          </div>

          {/* Card list — mobile only */}
          <div className="divide-y divide-slate-100 rounded-md border border-slate-100 sm:hidden">
            {loading ? (
              <div className="py-12 text-center"><Loader className="mx-auto h-7 w-7 animate-spin text-[#6658dd]" /></div>
            ) : visibleRows.length ? visibleRows.map((interview) => {
              const TypeIcon = typeTone[interview.type]?.icon || Calendar;
              return (
                <div key={interview.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${interview.avatarTone} text-xs font-black text-slate-700 ring-2 ring-white`}>{interview.initials}</span>
                    <div className="min-w-0 flex-1">
                      <Link to="/employer/applications" className="truncate text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd]">{interview.name}</Link>
                      <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">{interview.email}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-400"><Phone className="h-3 w-3 shrink-0" />{interview.phone}</p>
                    </div>
                    <span className={`shrink-0 rounded px-2 py-1 text-[11px] font-black ${statusTone[interview.status] || 'bg-slate-100 text-slate-600'}`}>{interview.status}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500">
                    <p className="truncate"><span className="text-slate-400">Job:</span> {interview.jobTitle}</p>
                    <p className="truncate"><span className="text-slate-400">Type:</span> {interview.jobType}</p>
                    <p><span className="text-slate-400">Date:</span> {interview.displayDate || formatDate(interview.interviewDate)}</p>
                    <p><span className="text-slate-400">Time:</span> {normalizeTime(interview.time)}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-black ${typeTone[interview.type]?.className || 'bg-slate-100 text-slate-600'}`}><TypeIcon className="h-3.5 w-3.5" />{interview.type}</span>
                    <div className="flex items-center gap-2">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${interview.interviewerTone} text-[10px] font-black text-slate-700 ring-2 ring-white`}>{interview.interviewer.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>
                      <span className="truncate text-xs font-semibold text-slate-600">{interview.interviewer}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Link to="/employer/applications" className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#6658dd] px-3 text-xs font-extrabold text-[#6658dd] transition hover:bg-violet-50"><Eye className="h-4 w-4" />View</Link>
                  </div>
                </div>
              );
            }) : (
              <p className="px-4 py-12 text-center text-sm font-bold text-slate-400">No interviews found.</p>
            )}
          </div>

          {/* Table — sm and up */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-[#dbe6f6] text-[11px] uppercase text-slate-600"><tr><th className="px-5 py-3">Candidate</th><th className="px-5 py-3">Job Applied</th><th className="px-5 py-3">Type</th><th className="px-5 py-3"><span className="inline-flex items-center gap-1">Date & Time <ChevronUp className="h-3 w-3 text-slate-400" /></span></th><th className="px-5 py-3">Interviewer</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-center">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan="7" className="px-5 py-12 text-center"><Loader className="mx-auto h-7 w-7 animate-spin text-[#6658dd]" /></td></tr> : visibleRows.length ? visibleRows.map((interview) => {
                  const TypeIcon = typeTone[interview.type]?.icon || Calendar;
                  return (
                    <tr key={interview.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${interview.avatarTone} text-xs font-black text-slate-700 ring-2 ring-white`}>{interview.initials}</span><div><Link to="/employer/applications" className="text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd]">{interview.name}</Link><p className="mt-0.5 text-xs font-semibold text-slate-400">{interview.email}</p><p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-400"><Phone className="h-3 w-3" />{interview.phone}</p></div></div></td>
                      <td className="px-5 py-4"><p className="text-sm font-extrabold text-[#3f4254]">{interview.jobTitle}</p><p className="mt-0.5 text-xs font-semibold text-slate-400">{interview.jobType}</p></td>
                      <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-black ${typeTone[interview.type]?.className || 'bg-slate-100 text-slate-600'}`}><TypeIcon className="h-3.5 w-3.5" />{interview.type}</span></td>
                      <td className="px-5 py-4 text-sm font-semibold leading-6 text-slate-600">{interview.displayDate || formatDate(interview.interviewDate)}<br />{normalizeTime(interview.time)}</td>
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${interview.interviewerTone} text-[11px] font-black text-slate-700 ring-2 ring-white`}>{interview.interviewer.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span className="text-sm font-semibold text-slate-600">{interview.interviewer}</span></div></td>
                      <td className="px-5 py-4"><span className={`inline-flex rounded px-2.5 py-1 text-xs font-black ${statusTone[interview.status] || 'bg-slate-100 text-slate-600'}`}>{interview.status}</span></td>
                      <td className="px-5 py-4 text-center"><Link to="/employer/applications" className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#6658dd] px-3 text-xs font-extrabold text-[#6658dd] transition hover:bg-violet-50"><Eye className="h-4 w-4" />View</Link></td>
                    </tr>
                  );
                }) : <tr><td colSpan="7" className="px-5 py-12 text-center text-sm font-bold text-slate-400">No interviews found.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-3 text-xs font-semibold text-slate-600 sm:flex-row sm:items-center sm:text-sm">
            <span>Showing {pagination.total ? startIndex + 1 : 0} to {Math.min(startIndex + pagination.limit, pagination.total)} of {pagination.total} entries</span>
            <div className="flex items-center justify-center gap-2"><button type="button" onClick={() => goToPage(1)} disabled={safePage === 1} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronsLeft className="h-4 w-4" /></button><button type="button" onClick={() => goToPage(safePage - 1)} disabled={safePage === 1} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button><button type="button" className="flex h-9 min-w-9 items-center justify-center rounded-md bg-[#6658dd] px-3 text-sm font-black text-white">{safePage}</button><button type="button" onClick={() => goToPage(safePage + 1)} disabled={safePage === totalPages} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button><button type="button" onClick={() => goToPage(totalPages)} disabled={safePage === totalPages} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronsRight className="h-4 w-4" /></button></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmployerInterviews;