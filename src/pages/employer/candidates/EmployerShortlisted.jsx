import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  FileText,
  Loader,
  MapPin,
  Search,
  UserCheck,
  UserPlus,
  UserX,
  X,
  MoreVertical,
  Calendar,
  Video,
  Phone,
  Building,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const initialFilters = { search: '', jobTitle: '', status: '', minMatchScore: '', shortlistedAfter: '' };

const statusTone = {
  Shortlisted: 'bg-amber-50 text-amber-500 border border-amber-200',
  Interview: 'bg-violet-50 text-[#6658dd] border border-indigo-200',
  Offered: 'bg-emerald-50 text-emerald-500 border border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-500 border border-rose-200'
};

const statusLabel = {
  Shortlisted: 'Pending Interview',
  Interview: 'Interview Scheduled',
  Offered: 'Selected',
  Rejected: 'Rejected'
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

export const EmployerShortlisted = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [tableSearch, setTableSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({ stats: {}, pipeline: {}, filters: {}, applications: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dropdown states
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Modals state
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [modalType, setModalType] = useState(null); // 'interview', 'select', 'reject', 'viewProfile'
  
  // Modal Form Inputs
  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    type: 'Video Call',
    locationOrLink: '',
    notes: ''
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

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
    
    // Status mapping from frontend UI selections to DB statuses
    if (filters.status) {
      if (filters.status === 'Pending Interview') params.set('status', 'Shortlisted');
      else if (filters.status === 'Interview Scheduled') params.set('status', 'Interview');
      else if (filters.status === 'Selected') params.set('status', 'Offered');
      else if (filters.status === 'Rejected') params.set('status', 'Rejected');
    }
    
    if (filters.minMatchScore) params.set('minMatchScore', filters.minMatchScore);
    if (filters.shortlistedAfter) params.set('appliedAfter', filters.shortlistedAfter); // filter dates
    
    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));
    return params.toString();
  }, [filters, tableSearch, currentPage, pageSize]);

  const loadData = () => {
    setLoading(true);
    setError('');
    axios.get(`${BASE_API_URL}/employer/applications?${queryParams}`, { headers: getTokenHeaders() })
      .then((response) => {
        // Filter shortlist-specific candidates: Shortlisted, Interview, Offered, Rejected
        const resData = response.data;
        let filteredApps = resData.applications || [];
        
        // If status filter is not set on the query side, we restrict to shortlisted items on client side
        if (!filters.status) {
          filteredApps = filteredApps.filter(app => ['Shortlisted', 'Interview', 'Offered', 'Rejected'].includes(app.status));
        }

        setData({
          stats: resData.stats || {},
          pipeline: resData.pipeline || {},
          filters: resData.filters || {},
          applications: filteredApps,
          pagination: resData.pagination || { page: currentPage, limit: pageSize, total: filteredApps.length, totalPages: 1 }
        });
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Shortlisted candidates could not be loaded.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [queryParams, pageSize]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleOutsideClick = () => setOpenDropdownId(null);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleStatusUpdate = async (id, status) => {
    setModalLoading(true);
    setModalError('');
    try {
      await axios.patch(`${BASE_API_URL}/employer/applications/${id}/status`, { status }, { headers: getTokenHeaders() });
      setActiveCandidate(null);
      setModalType(null);
      loadData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update candidate status.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!interviewForm.date || !interviewForm.time) {
      setModalError('Please specify date and time.');
      return;
    }
    setModalLoading(true);
    setModalError('');
    try {
      await axios.post(
        `${BASE_API_URL}/employer/applications/${activeCandidate.id}/schedule-interview`,
        interviewForm,
        { headers: getTokenHeaders() }
      );
      setActiveCandidate(null);
      setModalType(null);
      setInterviewForm({ date: '', time: '', type: 'Video Call', locationOrLink: '', notes: '' });
      loadData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to schedule interview.');
    } finally {
      setModalLoading(false);
    }
  };

  const pagination = data.pagination || { page: currentPage, limit: pageSize, total: 0, totalPages: 1 };
  const startIndex = pagination.total ? (pagination.page - 1) * pagination.limit : 0;
  const optionFilters = data.filters || {};
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(page, 1), pagination.totalPages || 1));

  // Compute dynamic stats based on all pipeline items
  const statsCounts = useMemo(() => {
    const pipe = data.pipeline || {};
    const totalShortlisted = Number(pipe.shortlisted || 0) + Number(pipe.interview || 0) + Number(pipe.offered || 0);
    return {
      total: totalShortlisted,
      pending: Number(pipe.shortlisted || 0),
      scheduled: Number(pipe.interview || 0),
      selected: Number(pipe.offered || 0),
      rejected: Number(pipe.rejected || 0)
    };
  }, [data.pipeline]);

  // Open modals helper
  const openModal = (candidate, type) => {
    setActiveCandidate(candidate);
    setModalType(type);
    setModalError('');
    if (type === 'interview') {
      const details = candidate.interviewDetails || {};
      setInterviewForm({
        date: details.date ? new Date(details.date).toISOString().slice(0, 10) : '',
        time: details.time || '',
        type: details.type || 'Video Call',
        locationOrLink: details.locationOrLink || '',
        notes: details.notes || ''
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Title & Breadcrumbs */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <h1 className="text-xl font-extrabold text-[#3f4254]">Shortlisted Candidates</h1>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
          <span className="text-[#3f4254]">JobsWaale</span>
          <ChevronRight className="h-4 w-4" />
          <span>Shortlisted</span>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* Stats Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { title: 'Total Shortlisted', value: statsCounts.total, icon: UserCheck, tone: 'bg-warning-subtle text-amber-500 bg-amber-50 border border-amber-100' },
          { title: 'Pending Interview', value: statsCounts.pending, icon: Loader, tone: 'bg-info-subtle text-sky-500 bg-sky-50 border border-sky-100' },
          { title: 'Interview Scheduled', value: statsCounts.scheduled, icon: CalendarCheck, tone: 'bg-primary-subtle text-indigo-500 bg-indigo-50 border border-indigo-100' },
          { title: 'Selected Candidates', value: statsCounts.selected, icon: UserPlus, tone: 'bg-success-subtle text-emerald-500 bg-emerald-50 border border-emerald-100' },
          { title: 'Rejected Candidates', value: statsCounts.rejected, icon: UserX, tone: 'bg-danger-subtle text-rose-500 bg-rose-50 border border-rose-100' }
        ].map((stat, idx) => (
          <section key={idx} className="rounded-md border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${stat.tone}`}>
                <stat.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-400">{stat.title}</p>
                <p className="mt-1 text-xl font-black text-[#3f4254]">{stat.value}</p>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Filter and Table Card */}
      <section className="rounded-md border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-dashed border-slate-200 px-5 py-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-extrabold text-[#3f4254]">Shortlisted Candidates</h2>
            <p className="mt-1 text-sm font-semibold text-slate-400">Review and manage shortlisted candidates. Schedule interviews or move them forward in the pipeline.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/employer/interviews" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white transition hover:bg-[#5848d8]">
              <CalendarCheck className="h-4 w-4" /> Scheduled Interviews
            </Link>
            <button type="button" onClick={() => alert('Bulk email functionality coming soon!')} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-100 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200">
              Send Bulk Email
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Multi-Criteria Filters */}
          <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1.2fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-500">Search Candidate / Job</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input className="h-10 w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} placeholder="Name, email, job, location" />
              </div>
            </div>
            <SelectField label="Job Title" value={filters.jobTitle} onChange={(value) => setFilter('jobTitle', value)}>
              <option value="">All Jobs</option>
              {(optionFilters.jobTitles || []).map((item) => <option key={item}>{item}</option>)}
            </SelectField>
            <SelectField label="Status" value={filters.status} onChange={(value) => setFilter('status', value)}>
              <option value="">All Status</option>
              {['Pending Interview', 'Interview Scheduled', 'Selected', 'Rejected'].map((item) => <option key={item}>{item}</option>)}
            </SelectField>
            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-500">Shortlisted After</label>
              <input type="date" value={filters.shortlistedAfter} onChange={(event) => setFilter('shortlistedAfter', event.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100" />
            </div>
            <SelectField label="Min Match Score" value={filters.minMatchScore} onChange={(value) => setFilter('minMatchScore', value)}>
              <option value="">All Scores</option>
              <option value="90">90%+</option>
              <option value="80">80%+</option>
              <option value="70">70%+</option>
              <option value="60">60%+</option>
            </SelectField>
            <div className="flex items-end">
              <button type="button" onClick={resetFilters} className="h-10 w-full rounded-md bg-[#18b99b] px-4 text-sm font-extrabold text-white transition hover:bg-[#13a98d] xl:w-auto">
                Reset
              </button>
            </div>
          </div>

          <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              entries per page
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              Search:
              <input value={tableSearch} onChange={(event) => { setTableSearch(event.target.value); setCurrentPage(1); }} className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100 sm:w-48" />
            </label>
          </div>

          {/* Candidates Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-[#dbe6f6] text-[11px] uppercase text-slate-600">
                <tr>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-5 py-3">Job Applied</th>
                  <th className="px-5 py-3">Shortlisted Date</th>
                  <th className="px-5 py-3">Match Score</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center">
                      <Loader className="mx-auto h-7 w-7 animate-spin text-[#6658dd]" />
                    </td>
                  </tr>
                ) : data.applications.length ? (
                  data.applications.map((app) => (
                    <tr key={app.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${app.avatarTone} text-xs font-black text-slate-700 ring-2 ring-white`}>
                            {app.initials}
                          </span>
                          <div>
                            <button type="button" onClick={() => openModal(app, 'viewProfile')} className="text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd] text-left">
                              {app.name}
                            </button>
                            <p className="mt-0.5 text-xs font-semibold text-slate-400">{app.email}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-400">
                              <MapPin className="h-3 w-3" />
                              {app.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-extrabold text-[#3f4254]">{app.jobTitle}</p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-400">{app.jobType}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                        {app.displayDate || '-'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded px-2.5 py-1 text-xs font-black ${scoreTone(app.matchScore)}`}>
                          {app.matchScore}%
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded px-2.5 py-1 text-xs font-black ${statusTone[app.status] || 'bg-slate-100 text-slate-600'}`}>
                          {statusLabel[app.status] || app.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === app.id ? null : app.id);
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          {openDropdownId === app.id && (
                            <div className="absolute right-0 mt-1.5 z-10 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none py-1">
                              <button
                                type="button"
                                onClick={() => openModal(app, 'viewProfile')}
                                className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 font-semibold"
                              >
                                <Eye className="mr-2 h-4 w-4 text-slate-500" /> View Profile
                              </button>
                              <button
                                type="button"
                                onClick={() => openModal(app, 'interview')}
                                className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 font-semibold"
                              >
                                <CalendarPlus className="mr-2 h-4 w-4 text-indigo-500" /> Schedule Interview
                              </button>
                              {app.status !== 'Offered' && (
                                <button
                                  type="button"
                                  onClick={() => openModal(app, 'select')}
                                  className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 font-semibold"
                                >
                                  <UserPlus className="mr-2 h-4 w-4 text-emerald-500" /> Move to Selected
                                </button>
                              )}
                              {app.status !== 'Rejected' && (
                                <button
                                  type="button"
                                  onClick={() => openModal(app, 'reject')}
                                  className="flex w-full items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-semibold"
                                >
                                  <UserX className="mr-2 h-4 w-4 text-rose-500" /> Reject
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-sm font-bold text-slate-400">
                      No shortlisted candidates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-5 flex flex-col justify-between gap-3 text-sm font-semibold text-slate-600 sm:flex-row sm:items-center">
            <span>Showing {pagination.total ? startIndex + 1 : 0} to {Math.min(startIndex + pagination.limit, pagination.total)} of {pagination.total} entries</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => goToPage(1)} disabled={pagination.page === 1} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50">
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" className="flex h-9 min-w-9 items-center justify-center rounded-md bg-[#6658dd] px-3 text-sm font-black text-white">
                {pagination.page}
              </button>
              <button type="button" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => goToPage(pagination.totalPages)} disabled={pagination.page === pagination.totalPages} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50">
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODALS IMPLEMENTATION
          ========================================================================= */}

      {/* Modal Overlay */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          {/* Modal Card */}
          <div className="relative w-full max-w-lg rounded-lg border border-slate-100 bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-extrabold text-[#3f4254]">
                {modalType === 'interview' && 'Schedule Interview'}
                {modalType === 'select' && 'Move Candidate to Selected'}
                {modalType === 'reject' && 'Reject Candidate'}
                {modalType === 'viewProfile' && 'Candidate Profile Summary'}
              </h3>
              <button type="button" onClick={() => { setActiveCandidate(null); setModalType(null); }} className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Error */}
            {modalError && (
              <div className="mx-5 mt-4 rounded border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700">
                {modalError}
              </div>
            )}

            {/* Modal Body */}
            <div className="p-5 max-h-[75vh] overflow-y-auto">
              {/* SCHEDULE INTERVIEW MODAL */}
              {modalType === 'interview' && (
                <form onSubmit={handleScheduleInterview} className="space-y-4">
                  <p className="text-xs font-semibold text-slate-400">
                    Schedule a dynamic interview with <span className="font-extrabold text-[#3f4254]">{activeCandidate?.name}</span> for the position of <span className="font-extrabold text-[#3f4254]">{activeCandidate?.jobTitle}</span>.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Interview Date</label>
                      <input
                        type="date"
                        required
                        value={interviewForm.date}
                        onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Interview Time</label>
                      <input
                        type="time"
                        required
                        value={interviewForm.time}
                        onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Interview Type</label>
                    <select
                      value={interviewForm.type}
                      onChange={(e) => setInterviewForm({ ...interviewForm, type: e.target.value })}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-[#6658dd]"
                    >
                      <option>Video Call</option>
                      <option>Phone Call</option>
                      <option>In-Person</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Meeting Link / Location</label>
                    <input
                      type="text"
                      placeholder="Zoom link, Google Meet, or office address"
                      value={interviewForm.locationOrLink}
                      onChange={(e) => setInterviewForm({ ...interviewForm, locationOrLink: e.target.value })}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Interviewer Notes</label>
                    <textarea
                      rows="3"
                      placeholder="Topics to discuss or instruction notes..."
                      value={interviewForm.notes}
                      onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                      className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={modalLoading}
                      onClick={() => { setActiveCandidate(null); setModalType(null); }}
                      className="h-10 rounded-md bg-slate-100 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="h-10 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white transition hover:bg-[#5848d8] flex items-center justify-center gap-2"
                    >
                      {modalLoading ? <Loader className="h-4 w-4 animate-spin" /> : 'Confirm Interview'}
                    </button>
                  </div>
                </form>
              )}

              {/* MOVE TO SELECTED MODAL */}
              {modalType === 'select' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Confirm Selected Candidate</p>
                      <p className="text-xs font-semibold text-slate-400">Are you sure you want to move this candidate to selected?</p>
                    </div>
                  </div>
                  
                  <div className="rounded-md bg-slate-50 p-4 border border-slate-100 space-y-1 text-sm font-semibold text-slate-600">
                    <p>Candidate: <span className="font-extrabold text-slate-800">{activeCandidate?.name}</span></p>
                    <p>Job Applied: <span className="font-extrabold text-slate-800">{activeCandidate?.jobTitle}</span></p>
                    <p>Match Score: <span className="font-extrabold text-emerald-600">{activeCandidate?.matchScore}%</span></p>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-400">
                    * By selecting the candidate, their status will update to 'Selected' and they will be shifted in the selection pipeline.
                  </p>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={modalLoading}
                      onClick={() => { setActiveCandidate(null); setModalType(null); }}
                      className="h-10 rounded-md bg-slate-100 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={modalLoading}
                      onClick={() => handleStatusUpdate(activeCandidate.id, 'Offered')}
                      className="h-10 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white transition hover:bg-[#5848d8] flex items-center justify-center gap-2"
                    >
                      {modalLoading ? <Loader className="h-4 w-4 animate-spin" /> : 'Confirm Selection'}
                    </button>
                  </div>
                </div>
              )}

              {/* REJECT CANDIDATE MODAL */}
              {modalType === 'reject' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                      <UserX className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Confirm Rejection</p>
                      <p className="text-xs font-semibold text-slate-400">Are you sure you want to reject this applicant?</p>
                    </div>
                  </div>

                  <div className="rounded-md bg-slate-50 p-4 border border-slate-100 space-y-1 text-sm font-semibold text-slate-600">
                    <p>Candidate: <span className="font-extrabold text-slate-800">{activeCandidate?.name}</span></p>
                    <p>Job Applied: <span className="font-extrabold text-slate-800">{activeCandidate?.jobTitle}</span></p>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-400">
                    * The candidate status will change to 'Rejected'. Rejection emails will not be triggered automatically.
                  </p>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={modalLoading}
                      onClick={() => { setActiveCandidate(null); setModalType(null); }}
                      className="h-10 rounded-md bg-slate-100 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={modalLoading}
                      onClick={() => handleStatusUpdate(activeCandidate.id, 'Rejected')}
                      className="h-10 rounded-md bg-rose-600 px-4 text-sm font-extrabold text-white transition hover:bg-rose-700 flex items-center justify-center gap-2"
                    >
                      {modalLoading ? <Loader className="h-4 w-4 animate-spin" /> : 'Confirm Rejection'}
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW PROFILE MODAL (PREVIEW) */}
              {modalType === 'viewProfile' && (
                <div className="space-y-5 text-slate-700">
                  {/* Top Header Card */}
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${activeCandidate?.avatarTone} text-lg font-black text-slate-700 ring-4 ring-white`}>
                      {activeCandidate?.initials}
                    </span>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800">{activeCandidate?.name}</h4>
                      <p className="text-sm font-semibold text-slate-400">{activeCandidate?.email}</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-300" /> {activeCandidate?.location}
                      </p>
                    </div>
                  </div>

                  {/* Candidate Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-slate-100 rounded-md p-3">
                      <p className="text-xs font-bold text-slate-400">Match Match Score</p>
                      <p className="mt-1 text-sm font-extrabold text-indigo-600">{activeCandidate?.matchScore}% MATCHED</p>
                    </div>
                    <div className="border border-slate-100 rounded-md p-3">
                      <p className="text-xs font-bold text-slate-400">Current Pipeline Status</p>
                      <p className={`mt-1 text-xs font-extrabold inline-block rounded px-2 py-0.5 ${statusTone[activeCandidate?.status] || 'bg-slate-100 text-slate-600'}`}>
                        {statusLabel[activeCandidate?.status] || activeCandidate?.status}
                      </p>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3 text-sm">
                      <Briefcase className="h-4.5 w-4.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-extrabold text-slate-800">Professional Experience</p>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">{activeCandidate?.experience || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                      <Building className="h-4.5 w-4.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-extrabold text-slate-800">Job Applied For</p>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">{activeCandidate?.jobTitle} • {activeCandidate?.jobType}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                      <Phone className="h-4.5 w-4.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-extrabold text-slate-800">Contact Details</p>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">Phone: {activeCandidate?.phone || 'Not Shared'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Interview Details (If Interview state) */}
                  {activeCandidate?.status === 'Interview' && activeCandidate?.interviewDetails && (
                    <div className="border border-indigo-100 rounded-md bg-indigo-50/30 p-4 space-y-2">
                      <p className="text-xs font-extrabold text-[#6658dd] flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" /> SCHEDULED INTERVIEW
                      </p>
                      <div className="text-xs font-semibold text-slate-600 space-y-1">
                        <p>Date: <span className="font-extrabold text-slate-800">{new Date(activeCandidate.interviewDetails.date).toDateString()}</span></p>
                        <p>Time: <span className="font-extrabold text-slate-800">{activeCandidate.interviewDetails.time}</span></p>
                        <p>Format: <span className="font-extrabold text-slate-800">{activeCandidate.interviewDetails.type}</span></p>
                        {activeCandidate.interviewDetails.locationOrLink && (
                          <p>
                            Location/Link:{' '}
                            <a
                              href={activeCandidate.interviewDetails.locationOrLink}
                              target="_blank"
                              rel="noreferrer"
                              className="font-extrabold text-indigo-600 hover:underline break-all"
                            >
                              {activeCandidate.interviewDetails.locationOrLink}
                            </a>
                          </p>
                        )}
                        {activeCandidate.interviewDetails.notes && (
                          <p>Notes: <span className="text-slate-500 italic">{activeCandidate.interviewDetails.notes}</span></p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => { setActiveCandidate(null); setModalType(null); }}
                      className="h-10 rounded-md bg-[#6658dd] px-5 text-sm font-extrabold text-white transition hover:bg-[#5848d8]"
                    >
                      Close Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerShortlisted;
