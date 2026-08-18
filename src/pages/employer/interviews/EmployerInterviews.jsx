import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
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
  Edit,
  Eye,
  Loader,
  Phone,
  Search,
  Video,
  X
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import ClearFilterButton from '../../../components/ClearFilterButton';
import InterviewLocationPicker from '../../../components/InterviewLocationPicker';

const initialFilters = { search: '', jobTitle: '', status: '', type: '', fromDate: '' };

const statConfig = [
  { key: 'total', title: 'Total', status: '', icon: CalendarCheck, tone: 'bg-violet-50 text-[#6658dd]' },
  { key: 'scheduled', title: 'Scheduled', status: 'Scheduled', icon: Calendar, tone: 'bg-cyan-50 text-cyan-500' },
  { key: 'onHold', title: 'On Hold', status: 'On Hold', icon: CalendarClock, tone: 'bg-amber-50 text-amber-500' },
  { key: 'completed', title: 'Completed', status: 'Completed', icon: CalendarCheck, tone: 'bg-emerald-50 text-emerald-500' },
  { key: 'rescheduled', title: 'Rescheduled', status: 'Rescheduled', icon: CalendarClock, tone: 'bg-amber-50 text-amber-500' },
  { key: 'cancelled', title: 'Cancelled', status: 'Cancelled', icon: CalendarX, tone: 'bg-rose-50 text-rose-500' }
];

const statusTone = {
  Scheduled: 'bg-cyan-50 text-cyan-500',
  'On Hold': 'bg-amber-50 text-amber-600',
  Completed: 'bg-emerald-50 text-emerald-500',
  Rescheduled: 'bg-amber-50 text-amber-500',
  Cancelled: 'bg-rose-50 text-rose-500'
};

const getInterviewLocationField = (type) => {
  const normalizedType = String(type || '').toLowerCase();
  if (normalizedType.includes('phone')) return null;
  if (normalizedType.includes('person')) return { label: 'Interview Location', placeholder: 'Office address or interview venue' };
  if (normalizedType.includes('other')) return { label: 'Interview Details', placeholder: 'Location, link, or custom interview instructions' };
  return { label: 'Meeting Link', placeholder: 'Zoom link, Google Meet, or Teams link' };
};

const isInPersonInterview = (type) => String(type || '').toLowerCase().includes('person');

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
  const [searchParams] = useSearchParams();
  const getUrlFilters = () => ({
    search: searchParams.get('search') || '',
    jobTitle: searchParams.get('jobTitle') || '',
    status: searchParams.get('status') || '',
    type: searchParams.get('type') || '',
    fromDate: searchParams.get('fromDate') || ''
  });
  const [filters, setFilters] = useState(getUrlFilters);
  const [tableSearch, setTableSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({
    stats: { total: 0, scheduled: 0, onHold: 0, completed: 0, rescheduled: 0, cancelled: 0 },
    filters: { jobTitles: [], types: [] },
    interviews: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingInterview, setEditingInterview] = useState(null);
  const [editForm, setEditForm] = useState({ date: '', time: '', type: 'Video Call', locationOrLink: '', notes: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

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
          stats: { total: 0, scheduled: 0, onHold: 0, completed: 0, rescheduled: 0, cancelled: 0 },
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
  const stats = data.stats || { total: 0, scheduled: 0, onHold: 0, completed: 0, rescheduled: 0, cancelled: 0 };
  const pagination = data.pagination || { page: currentPage, limit: pageSize, total: 0, totalPages: 1 };
  const totalPages = pagination.totalPages || 1;
  const safePage = pagination.page || 1;
  const startIndex = pagination.total ? (safePage - 1) * pagination.limit : 0;
  const visibleRows = data.interviews || [];
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  const hasActiveFilters = Object.values(filters).some(Boolean) || Boolean(tableSearch);
  const editLocationField = getInterviewLocationField(editForm.type);
  const showEditMapPicker = isInPersonInterview(editForm.type);

  const openEditModal = (interview) => {
    setEditingInterview(interview);
    setEditError('');
    setEditForm({
      date: interview.interviewDate || '',
      time: interview.time || '',
      type: interview.type === 'Telephonic' ? 'Phone Call' : (interview.type || 'Video Call'),
      locationOrLink: interview.locationOrLink || '',
      notes: interview.notes || ''
    });
  };

  const submitEditInterview = async (event) => {
    event.preventDefault();
    if (!editForm.date || !editForm.time) {
      setEditError('Please specify interview date and time.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(editForm.date + 'T00:00:00');
    if (selectedDate.getTime() <= today.getTime()) {
      setEditError('Interview cannot be scheduled or rescheduled for today or a past date. Please choose a future date.');
      return;
    }

    if (isInPersonInterview(editForm.type) && !editForm.locationOrLink) {
      setEditError('Please select interview location from the map.');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      await axios.post(
        `${BASE_API_URL}/employer/applications/${editingInterview.applicationId}/schedule-interview`,
        { ...editForm, onHold: false, status: 'Scheduled' },
        { headers: getTokenHeaders() }
      );
      setEditingInterview(null);
      setEditForm({ date: '', time: '', type: 'Video Call', locationOrLink: '', notes: '' });
      const response = await axios.get(`${BASE_API_URL}/employer/interviews?${queryParams}`, { headers: getTokenHeaders() });
      setData({
        stats: { total: 0, scheduled: 0, onHold: 0, completed: 0, rescheduled: 0, cancelled: 0 },
        filters: { jobTitles: [], types: [] },
        interviews: [],
        pagination: { page: 1, limit: pageSize, total: 0, totalPages: 1 },
        ...response.data
      });
    } catch (err) {
      setEditError(err.response?.data?.message || 'Interview update failed.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, nextStatus) => {
    setLoading(true);
    setError('');
    try {
      await axios.patch(
        `${BASE_API_URL}/employer/applications/${applicationId}/status`,
        { status: nextStatus },
        { headers: getTokenHeaders() }
      );
      const response = await axios.get(`${BASE_API_URL}/employer/interviews?${queryParams}`, { headers: getTokenHeaders() });
      setData({
        stats: { total: 0, scheduled: 0, onHold: 0, completed: 0, rescheduled: 0, cancelled: 0 },
        filters: { jobTitles: [], types: [] },
        interviews: [],
        pagination: { page: 1, limit: pageSize, total: 0, totalPages: 1 },
        ...response.data
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update candidate status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-3 sm:space-y-5 sm:px-0">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center md:gap-3">
        <h1 className="text-lg font-extrabold text-[#3f4254] sm:text-xl">Interviews</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 sm:text-sm"><span className="text-[#3f4254]">JobsWaale</span><ChevronRight className="h-4 w-4" /><span>Interviews</span></div>
      </div>

      {error && <div className="rounded-md border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">{error}</div>}

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
            <SelectField label="Status" value={filters.status} onChange={(value) => setFilter('status', value)}><option value="">All Status</option>{['Pending Interview', 'Scheduled', 'Rescheduled', 'On Hold'].map((item) => <option key={item}>{item}</option>)}</SelectField>
            <SelectField label="Interview Type" value={filters.type} onChange={(value) => setFilter('type', value)}><option value="">All Types</option>{optionFilters.types.map((item) => <option key={item}>{item}</option>)}</SelectField>
            <div><label className="mb-2 block text-xs font-extrabold text-slate-500">From Date</label><input type="date" value={filters.fromDate} onChange={(event) => setFilter('fromDate', event.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100" /></div>
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
            ) : visibleRows.length ? visibleRows.map((interview) => {
              const TypeIcon = typeTone[interview.type]?.icon || Calendar;
              return (
                <div key={interview.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${interview.avatarTone} text-xs font-black text-slate-700 ring-2 ring-white`}>{interview.initials}</span>
                    <div className="min-w-0 flex-1">
                      <Link to={`/employer/candidateProfile/${interview.candidateId}`} className="truncate text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd]">{interview.name}</Link>
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

                  <div className="mt-3 flex justify-end gap-2">
                    <button type="button" onClick={() => openEditModal(interview)} className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-amber-500 px-3 text-xs font-extrabold text-white transition hover:bg-amber-600">Update</button>
                    <button type="button" onClick={() => handleStatusUpdate(interview.applicationId, 'Offered')} className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-emerald-500 px-3 text-xs font-extrabold text-white transition hover:bg-emerald-600">Select</button>
                    <button type="button" onClick={() => handleStatusUpdate(interview.applicationId, 'Rejected')} className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-rose-500 px-3 text-xs font-extrabold text-white transition hover:bg-rose-600">Reject</button>
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
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${interview.avatarTone} text-xs font-black text-slate-700 ring-2 ring-white`}>{interview.initials}</span><div><Link to={`/employer/candidateProfile/${interview.candidateId}`} className="text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd]">{interview.name}</Link><p className="mt-0.5 text-xs font-semibold text-slate-400">{interview.email}</p><p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-400"><Phone className="h-3 w-3" />{interview.phone}</p></div></div></td>
                      <td className="px-5 py-4"><p className="text-sm font-extrabold text-[#3f4254]">{interview.jobTitle}</p><p className="mt-0.5 text-xs font-semibold text-slate-400">{interview.jobType}</p></td>
                      <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-black ${typeTone[interview.type]?.className || 'bg-slate-100 text-slate-600'}`}><TypeIcon className="h-3.5 w-3.5" />{interview.type}</span></td>
                      <td className="px-5 py-4 text-sm font-semibold leading-6 text-slate-600">{interview.displayDate || formatDate(interview.interviewDate)}<br />{normalizeTime(interview.time)}</td>
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${interview.interviewerTone} text-[11px] font-black text-slate-700 ring-2 ring-white`}>{interview.interviewer.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span className="text-sm font-semibold text-slate-600">{interview.interviewer}</span></div></td>
                      <td className="px-5 py-4"><span className={`inline-flex rounded px-2.5 py-1 text-xs font-black ${statusTone[interview.status] || 'bg-slate-100 text-slate-600'}`}>{interview.status}</span></td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button type="button" onClick={() => openEditModal(interview)} className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-amber-500 px-3 text-xs font-extrabold text-white transition hover:bg-amber-600">Update</button>
                          <button type="button" onClick={() => handleStatusUpdate(interview.applicationId, 'Offered')} className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-emerald-500 px-3 text-xs font-extrabold text-white transition hover:bg-emerald-600">Select</button>
                          <button type="button" onClick={() => handleStatusUpdate(interview.applicationId, 'Rejected')} className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-rose-500 px-3 text-xs font-extrabold text-white transition hover:bg-rose-600">Reject</button>
                        </div>
                      </td>
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

      {editingInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-slate-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
              <h3 className="text-sm font-extrabold text-[#3f4254] sm:text-base">Edit Interview</h3>
              <button
                type="button"
                onClick={() => setEditingInterview(null)}
                disabled={editLoading}
                className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editError && (
              <div className="mx-4 mt-4 rounded border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 sm:mx-5">
                {editError}
              </div>
            )}

            <div className="overflow-y-auto p-4 sm:p-5">
              <form onSubmit={submitEditInterview} className="space-y-4">
                <p className="text-xs font-semibold text-slate-400">
                  Add schedule details for <span className="font-extrabold text-[#3f4254]">{editingInterview.name}</span> for <span className="font-extrabold text-[#3f4254]">{editingInterview.jobTitle}</span>.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Interview Date</label>
                    <input
                      type="date"
                      required
                      value={editForm.date}
                      onChange={(event) => setEditForm({ ...editForm, date: event.target.value })}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Interview Time</label>
                    <input
                      type="time"
                      required
                      value={editForm.time}
                      onChange={(event) => setEditForm({ ...editForm, time: event.target.value })}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Interview Type</label>
                  <select
                    value={editForm.type}
                    onChange={(event) => setEditForm({ ...editForm, type: event.target.value, locationOrLink: '' })}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-[#6658dd]"
                  >
                    <option>Video Call</option>
                    <option>Phone Call</option>
                    <option>In-Person</option>
                    <option>Other</option>
                  </select>
                </div>

                {showEditMapPicker ? (
                  <InterviewLocationPicker
                    value={editForm.locationOrLink}
                    onChange={(locationOrLink) => setEditForm({ ...editForm, locationOrLink })}
                  />
                ) : editLocationField && (
                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-slate-500">{editLocationField.label}</label>
                    <input
                      type="text"
                      placeholder={editLocationField.placeholder}
                      value={editForm.locationOrLink}
                      onChange={(event) => setEditForm({ ...editForm, locationOrLink: event.target.value })}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Interviewer Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Topics to discuss or instruction notes..."
                    value={editForm.notes}
                    onChange={(event) => setEditForm({ ...editForm, notes: event.target.value })}
                    className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                  />
                </div>

                <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={editLoading}
                    onClick={() => setEditingInterview(null)}
                    className="h-10 rounded-md bg-slate-100 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white transition hover:bg-[#5848d8] disabled:opacity-60"
                  >
                    {editLoading ? <Loader className="h-4 w-4 animate-spin" /> : 'Confirm Interview'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerInterviews;
