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
  UserPlus,
  UserX,
  X,
  Clock,
  AlertCircle,
  Send,
  BadgeCheck,
  Briefcase
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import ClearFilterButton from '../../../components/ClearFilterButton';
import InterviewLocationPicker from '../../../components/InterviewLocationPicker';
import { downloadBlobResponse } from '../../../utils/downloadFile';

const isInPersonInterview = (type) => String(type || '').toLowerCase().includes('person');

const getInterviewLocationField = (type) => {
  const t = String(type || '').toLowerCase();
  if (t.includes('video')) return { label: 'Meeting Link', placeholder: 'Zoom link, Google Meet, or Teams link' };
  if (t.includes('phone')) return { label: 'Phone Number', placeholder: 'Enter phone number for the interview' };
  if (t.includes('other')) return { label: 'Interview Location / Details', placeholder: 'Enter meeting details/link/address' };
  return null;
};

const initialFilters = { search: '', jobTitle: '', status: '', experience: '', appliedAfter: '', applicationActivity: 'active' };

const statCards = [
  { key: 'total', title: 'Total Applications', titleLines: ['Total', 'Applications'], status: '', icon: Inbox, tone: 'bg-slate-50 text-slate-600' },
  { key: 'applied', title: 'Applied', status: 'Applied', icon: FileText, tone: 'bg-violet-50 text-[#6658dd]' },
  { key: 'reviewed', title: 'Reviewed', status: 'Reviewed', icon: Eye, tone: 'bg-emerald-50 text-emerald-500' },
  { key: 'shortlisted', title: 'Shortlisted', status: 'Shortlisted', icon: UserCheck, tone: 'bg-amber-50 text-amber-500' },
  { key: 'interview', title: 'Interview', status: 'Interview', icon: Calendar, tone: 'bg-sky-50 text-sky-500' },
  { key: 'onHold', title: 'On Hold', titleLines: ['On', 'Hold'], status: 'OnHold', icon: Clock, tone: 'bg-orange-50 text-orange-500' },
  { key: 'selected', title: 'Selected', status: 'Selected', icon: UserPlus, tone: 'bg-teal-50 text-teal-500' },
  { key: 'offerSent', title: 'Offer Sent', titleLines: ['Offer', 'Sent'], status: 'Offer Sent', icon: MailCheck, tone: 'bg-indigo-50 text-[#6658dd]' },
  { key: 'offerAccepted', title: 'Offer Accepted', titleLines: ['Offer', 'Accepted'], status: 'Offer Accepted', icon: BadgeCheck, tone: 'bg-cyan-50 text-cyan-500' },
  { key: 'hired', title: 'Hired', status: 'Hired', icon: Briefcase, tone: 'bg-emerald-50 text-emerald-500' },
  { key: 'rejected', title: 'Rejected', status: 'Rejected', icon: UserX, tone: 'bg-rose-50 text-rose-500' }
];

const pipelineConfig = [
  { key: 'applied', title: 'Applied', status: 'Applied', icon: FileText, tone: 'bg-[#18b99b] text-white' },
  { key: 'reviewed', title: 'Reviewed', status: 'Reviewed', icon: Eye, tone: 'bg-sky-500 text-white' },
  { key: 'shortlisted', title: 'Shortlisted', status: 'Shortlisted', icon: UserCheck, tone: 'bg-amber-400 text-white' },
  { key: 'interview', title: 'Interview', status: 'Interview', icon: Calendar, tone: 'bg-[#6658dd] text-white' },
  { key: 'onHold', title: 'Hold', status: 'OnHold', icon: Clock, tone: 'bg-orange-400 text-white' },
  { key: 'offered', title: 'Selected', status: 'Offered', icon: MailCheck, tone: 'bg-blue-500 text-white' },
  { key: 'rejected', title: 'Rejected', status: 'Rejected', icon: X, tone: 'bg-rose-500 text-white' }
];

const statusTone = {
  Applied: 'bg-emerald-50 text-emerald-500',
  Reviewed: 'bg-sky-50 text-sky-500',
  Shortlisted: 'bg-amber-50 text-amber-500',
  Interview: 'bg-violet-50 text-[#6658dd]',
  OnHold: 'bg-orange-50 text-orange-500',
  Selected: 'bg-emerald-50 text-emerald-500',
  'Offer Sent': 'bg-blue-50 text-blue-500',
  'Offer Accepted': 'bg-cyan-50 text-cyan-500',
  Hired: 'bg-emerald-50 text-emerald-500',
  'Offer Declined': 'bg-rose-50 text-rose-500',
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

const ActionButtonContent = ({ loading, icon: Icon, label, loadingLabel = 'Processing' }) => (
  <>
    {loading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
    <span>{loading ? loadingLabel : label}</span>
  </>
);

export const EmployerApplications = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const todayDateString = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);
  const searchParamString = searchParams.toString();
  const getUrlFilters = () => ({
    search: searchParams.get('search') || '',
    jobTitle: searchParams.get('jobTitle') || '',
    status: searchParams.get('status') || '',
    experience: searchParams.get('experience') || '',
    appliedAfter: searchParams.get('appliedAfter') || '',
    applicationActivity: searchParams.get('applicationActivity') || 'active'
  });
  const [filters, setFilters] = useState(getUrlFilters);
  const [tableSearch, setTableSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({ stats: {}, pipeline: {}, filters: {}, applications: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [upgradePopup, setUpgradePopup] = useState({ open: false, message: '' });
  const [refreshKey, setRefreshKey] = useState(0);
  const loadData = () => setRefreshKey((prev) => prev + 1);

  const [activeApplication, setActiveApplication] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [savingInterview, setSavingInterview] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    type: 'Video Call',
    locationOrLink: '',
    notes: '',
    manualAddress: ''
  });

  const openInterviewModal = (app) => {
    setError('');
    setMessage('');
    setActiveApplication(app);
    const details = app.interviewDetails || {};
    setInterviewForm({
      date: details.date ? new Date(details.date).toISOString().slice(0, 10) : '',
      time: details.time || '',
      type: details.type || 'Video Call',
      locationOrLink: details.locationOrLink || '',
      notes: details.notes || '',
      manualAddress: ''
    });
    setShowInterviewModal(true);
  };

  const scheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (!interviewForm.date || !interviewForm.time) {
      setError('Please specify date and time.');
      return;
    }
    setSavingInterview(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        ...interviewForm
      };
      await axios.post(
        `${BASE_API_URL}/employer/applications/${activeApplication.id}/schedule-interview`,
        payload,
        { headers: getTokenHeaders() }
      );
      setShowInterviewModal(false);
      setInterviewForm({ date: '', time: '', type: 'Video Call', locationOrLink: '', notes: '', manualAddress: '' });
      setMessage(activeApplication.status === 'Interview' ? 'Interview rescheduled successfully.' : 'Interview scheduled successfully.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule interview.');
    } finally {
      setSavingInterview(false);
    }
  };

  const handleStatCardClick = (card) => {
    setFilter('status', card.status);
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
    }
    if (filters.experience) params.set('experience', filters.experience);
    if (filters.appliedAfter) params.set('appliedAfter', filters.appliedAfter);
    params.set('applicationActivity', filters.applicationActivity || 'active');
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
  }, [queryParams, pageSize, refreshKey]);

  const pagination = data.pagination || { page: currentPage, limit: pageSize, total: 0, totalPages: 1 };
  const startIndex = pagination.total ? (pagination.page - 1) * pagination.limit : 0;
  const optionFilters = data.filters || {};
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(page, 1), pagination.totalPages || 1));
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => key !== 'applicationActivity' && Boolean(value)) || Boolean(tableSearch) || filters.applicationActivity !== 'active';
  const getActionKey = (appId, action) => `${appId}:${action}`;
  const isActionLoading = (appId, action) => actionLoading === getActionKey(appId, action);

  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  const getIsInterviewPassed = (app) => {
    const details = app?.interviewDetails;
    if (!details?.date || !details?.time || details?.onHold || app?.status !== 'Interview') {
      return false;
    }
    const d = new Date(details.date);
    let [hours, minutes] = String(details.time).split(':').map(Number);
    if (String(details.time).toLowerCase().includes('pm') && hours < 12) {
      hours += 12;
    } else if (String(details.time).toLowerCase().includes('am') && hours === 12) {
      hours = 0;
    }
    if (!isNaN(hours) && !isNaN(minutes)) {
      d.setHours(hours, minutes, 0, 0);
    }
    return currentTime > d.getTime();
  };

  const handleInterviewOnHold = async (appId) => {
    const actionKey = getActionKey(appId, 'hold');
    if (actionLoading) return;
    setActionLoading(actionKey);
    setError('');
    setMessage('');
    try {
      await axios.post(
        `${BASE_API_URL}/employer/applications/${appId}/schedule-interview`,
        {
          onHold: true,
          type: 'Video Call',
          notes: 'Interview kept on hold.'
        },
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
      setError(err.response?.data?.message || 'Failed to move application to interview on hold.');
    } finally {
      setActionLoading('');
    }
  };

  const handleStatusUpdate = async (appId, nextStatus) => {
    const actionKey = getActionKey(appId, nextStatus);
    if (actionLoading) return;
    setActionLoading(actionKey);
    setError('');
    setMessage('');
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
    } finally {
      setActionLoading('');
    }
  };

  const handleOfferStatusUpdate = async (appId, offerStatus) => {
    const actionKey = getActionKey(appId, offerStatus);
    if (actionLoading) return;
    setActionLoading(actionKey);
    setError('');
    setMessage('');
    try {
      await axios.patch(
        `${BASE_API_URL}/employer/selected/${appId}/offer`,
        { offerStatus },
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
      setError(err.response?.data?.message || 'Failed to update offer status.');
    } finally {
      setActionLoading('');
    }
  };

  const downloadResume = async (candidateId, candidateName, appId) => {
    const actionKey = getActionKey(appId || candidateId, 'resume');
    if (actionLoading) return;
    setActionLoading(actionKey);
    setError('');
    setMessage('');
    try {
      const response = await axios.get(`${BASE_API_URL}/employer/candidates/${candidateId}/resume-download`, {
        headers: getTokenHeaders(),
        responseType: 'blob'
      });
      downloadBlobResponse(response, `${candidateName || 'candidate'}-resume`);
      
      setMessage('Resume downloaded successfully.');
    } catch (err) {
      if (err.response?.status === 451 || err.response?.status === 403) {
        if (err.response.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorObj = JSON.parse(reader.result);
              setUpgradePopup({ open: true, message: errorObj.message });
            } catch {
              setUpgradePopup({ open: true, message: 'Resume downloads are not supported under your current plan.' });
            }
          };
          reader.readAsText(err.response.data);
        } else {
          setUpgradePopup({ open: true, message: err.response?.data?.message });
        }
      } else {
        setError(err.response?.data?.message || 'Resume could not be downloaded.');
      }
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="space-y-4 px-3 sm:space-y-5 sm:px-0">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center md:gap-3">
        <h1 className="text-lg font-extrabold text-[#3f4254] sm:text-xl">Applications</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 sm:text-sm"><span className="text-[#3f4254]">JobsWaale</span><ChevronRight className="h-4 w-4" /><span>Applications</span></div>
      </div>

      {error && <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}
      {message && <div className="rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div>}

      {filters.jobTitle && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-bold text-[#6658dd]">
          <span className="text-slate-500">Showing job:</span>
          <span className="max-w-full truncate">{filters.jobTitle}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {statCards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => handleStatCardClick(card)}
            className={`min-h-24 rounded-md border bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-28 sm:p-4 ${
              filters.status === card.status ? 'border-[#6658dd] ring-2 ring-indigo-100' : 'border-slate-100'
            }`}
          >
            <div className="flex h-full items-center gap-2 sm:gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${card.tone}`}><card.icon className="h-4 w-4 sm:h-5 sm:w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold leading-4 text-slate-400 sm:text-[13px]">
                  {(card.titleLines || [card.title]).map((line) => (
                    <span key={line} className="block whitespace-nowrap">{line}</span>
                  ))}
                </p>
                <p className="mt-1 text-base font-black text-[#3f4254] sm:text-xl">
                  {Number((card.key === 'total' ? data.stats?.total : data.pipeline?.[card.key] ?? data.stats?.[card.key]) || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <section className="rounded-md border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-dashed border-slate-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center">
          <div><h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Application Queue</h2><p className="mt-1 text-xs font-semibold text-slate-400 sm:text-sm">Review candidates, update stages, and move strong profiles forward.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"><Link to="/employer/candidates" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-100 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200"><Search className="h-4 w-4" />Find Candidates</Link><Link to="/employer/interviews" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white transition hover:bg-[#5848d8]"><CalendarPlus className="h-4 w-4" />Schedule Interview</Link></div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-500">Search Candidate / Job</label>
              <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="h-10 w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} placeholder="Name, email, job, location" /></div>
            </div>
            <SelectField label="Applications" value={filters.applicationActivity} onChange={(value) => setFilter('applicationActivity', value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="both">Both</option>
            </SelectField>
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
                  <div className="min-w-0 flex-1">
                    <Link to={`/employer/applications/${application.id}`} className="truncate text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd]">{application.name}</Link>
                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">{application.email || application.phone}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-400"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{application.location}</span></p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`rounded px-2 py-1 text-[11px] font-black ${statusTone[application.status === 'Offered' ? (application.selectionDetails?.offerStatus || 'Selected') : (application.status === 'Interview' && application.interviewDetails?.onHold ? 'OnHold' : application.status)] || statusTone.Applied}`}>
                      {application.status === 'Offered' ? (application.selectionDetails?.offerStatus || 'Selected') : (application.status === 'Interview' && application.interviewDetails?.onHold ? 'On Hold for Interview' : application.status)}
                    </span>
                    {application.status === 'Interview' && !application.interviewDetails?.onHold && application.interviewDetails && (
                      <div className="mt-1 text-right text-[10px] font-semibold text-slate-500 space-y-0.5">
                        {application.interviewDetails.date && (
                          <p>
                            Date: <span className="font-extrabold text-slate-700">{new Date(application.interviewDetails.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </p>
                        )}
                        {application.interviewDetails.time && (
                          <p>
                            Time: <span className="font-extrabold text-slate-700">{application.interviewDetails.time}</span>
                          </p>
                        )}
                        {application.interviewDetails.type && (
                          <p>
                            Mode: <span className="font-extrabold text-slate-700">{application.interviewDetails.type}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
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
                    {application.status !== 'Applied' && (
                      <Link to={`/employer/messages?application=${application.id}`} className="inline-flex h-8 items-center justify-center gap-1 rounded border border-sky-200 px-2 text-[10px] font-extrabold text-sky-600 transition hover:bg-sky-50">Message</Link>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <p className="px-4 py-12 text-center text-sm font-bold text-slate-400">No applications found.</p>
            )}
          </div>

          <div className="hidden overflow-x-auto sm:block pb-24">
            <table className="w-full min-w-[1080px] text-left">
              <thead className="bg-[#dbe6f6] text-[11px] uppercase text-slate-600"><tr><th className="px-5 py-3">Candidate</th><th className="px-5 py-3">Job Applied</th><th className="px-5 py-3">Experience</th><th className="px-5 py-3"><span className="inline-flex items-center gap-1">Applied Date <ChevronUp className="h-3 w-3 text-slate-400" /></span></th><th className="px-5 py-3">Match Score</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-center">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan="7" className="px-5 py-12 text-center"><Loader className="mx-auto h-7 w-7 animate-spin text-[#6658dd]" /></td></tr> : data.applications.length ? data.applications.map((application) => (
                  <tr key={application.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4"><div><Link to={`/employer/applications/${application.id}`} className="text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd]">{application.name}</Link><p className="mt-0.5 text-xs font-semibold text-slate-400">{application.email || application.phone}</p><p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-400"><MapPin className="h-3 w-3" />{application.location}</p></div></td>
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
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`inline-flex rounded px-2.5 py-1 text-xs font-black ${statusTone[application.status === 'Offered' ? (application.selectionDetails?.offerStatus || 'Selected') : (application.status === 'Interview' && application.interviewDetails?.onHold ? 'OnHold' : application.status)] || statusTone.Applied}`}>
                          {application.status === 'Offered' ? (application.selectionDetails?.offerStatus || 'Selected') : (application.status === 'Interview' && application.interviewDetails?.onHold ? 'On Hold for Interview' : application.status)}
                        </span>
                        {application.status === 'Interview' && !application.interviewDetails?.onHold && application.interviewDetails && (
                          <div className="mt-1 text-[11px] font-semibold text-slate-500 space-y-0.5">
                            {application.interviewDetails.date && (
                              <p>
                                Date: <span className="font-extrabold text-slate-700">{new Date(application.interviewDetails.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </p>
                            )}
                            {application.interviewDetails.time && (
                              <p>
                                Time: <span className="font-extrabold text-slate-700">{application.interviewDetails.time}</span>
                              </p>
                            )}
                            {application.interviewDetails.type && (
                              <p>
                                Mode: <span className="font-extrabold text-slate-700">{application.interviewDetails.type}</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center align-middle">
                      <div className="mx-auto grid w-[260px] grid-cols-2 gap-2">
                        <Link to={`/employer/applications/${application.id}`} title="View Application Details" className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50">
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Link>

                        {application.status !== 'Applied' && (
                          <Link to={`/employer/messages?application=${application.id}`} title="Message Candidate" className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-sky-200 px-2 text-xs font-extrabold text-sky-600 transition hover:bg-sky-50"><MessageCircle className="h-3.5 w-3.5" /><span>Message</span></Link>
                        )}

                        {/* Download Resume */}
                        {application.hasResume && application.status !== 'Applied' && (
                          <button
                            type="button"
                            onClick={() => downloadResume(application.candidateId, application.name, application.id)}
                            disabled={Boolean(actionLoading)}
                            title="Download Resume"
                            className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-extrabold text-[#6658dd] transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <ActionButtonContent loading={isActionLoading(application.id, 'resume')} icon={FileText} label="Resume" />
                          </button>
                        )}

                        {/* Shortlist */}
                        {application.status === 'Reviewed' && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(application.id, 'Shortlisted')}
                            disabled={Boolean(actionLoading)}
                            title="Shortlist"
                            className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-extrabold text-amber-500 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <ActionButtonContent loading={isActionLoading(application.id, 'Shortlisted')} icon={UserCheck} label="Shortlist" />
                          </button>
                        )}

                        {/* Schedule / Reschedule Interview */}
                        {(application.status === 'Shortlisted' || application.status === 'Interview') && (
                          <button
                            type="button"
                            onClick={() => openInterviewModal(application)}
                            disabled={Boolean(actionLoading)}
                            title={application.status === 'Interview' ? "Reschedule Interview" : "Schedule Interview"}
                            className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-extrabold text-[#6658dd] transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{application.status === 'Interview' ? "Reschedule" : "Interview"}</span>
                          </button>
                        )}

                        {/* On Hold for Interview */}
                        {(application.status === 'Shortlisted' ||
                          (application.status === 'Interview' && !application.interviewDetails?.onHold && !getIsInterviewPassed(application))) && (
                          <button
                            type="button"
                            onClick={() => handleInterviewOnHold(application.id)}
                            disabled={Boolean(actionLoading)}
                            title="On Hold for Interview"
                            className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-extrabold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <ActionButtonContent loading={isActionLoading(application.id, 'hold')} icon={Clock} label="Hold" />
                          </button>
                        )}

                        {/* Select / Hire */}
                        {application.status === 'Interview' && !application.interviewDetails?.onHold && getIsInterviewPassed(application) && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(application.id, 'Offered')}
                            disabled={Boolean(actionLoading)}
                            title="Select / Hire"
                            className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-extrabold text-emerald-500 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <ActionButtonContent loading={isActionLoading(application.id, 'Offered')} icon={UserPlus} label="Select" />
                          </button>
                        )}

                        {/* Send Offer */}
                        {application.status === 'Offered' && (!application.selectionDetails || application.selectionDetails.offerStatus === 'Selected') && (
                          <button
                            type="button"
                            onClick={() => handleOfferStatusUpdate(application.id, 'Offer Sent')}
                            disabled={Boolean(actionLoading)}
                            title="Send Offer"
                            className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-extrabold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <ActionButtonContent loading={isActionLoading(application.id, 'Offer Sent')} icon={Send} label="Send Offer" />
                          </button>
                        )}

                        {/* Hire after offer acceptance */}
                        {application.status === 'Offered' && application.selectionDetails?.offerStatus === 'Offer Accepted' && (
                          <button
                            type="button"
                            onClick={() => handleOfferStatusUpdate(application.id, 'Hired')}
                            disabled={Boolean(actionLoading)}
                            title="Hire"
                            className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-extrabold text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <ActionButtonContent loading={isActionLoading(application.id, 'Hired')} icon={Briefcase} label="Hire" />
                          </button>
                        )}

                        {/* Reject */}
                        {(['Applied', 'Reviewed', 'Shortlisted', 'Interview'].includes(application.status) ||
                          (application.status === 'Offered' && application.selectionDetails?.offerStatus === 'Offer Accepted')) && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(application.id, 'Rejected')}
                            disabled={Boolean(actionLoading)}
                            title="Reject"
                            className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-extrabold text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <ActionButtonContent loading={isActionLoading(application.id, 'Rejected')} icon={UserX} label="Reject" />
                          </button>
                        )}
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

      {upgradePopup.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-lg border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                <AlertCircle className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-[#3f4254]">Upgrade Subscription Required</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {upgradePopup.message || 'Resume downloads are not supported under your current plan. Please upgrade your plan.'}
                </p>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setUpgradePopup({ open: false, message: '' })}
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => navigate('/employer/subscription')}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white shadow-md shadow-indigo-500/20 transition hover:bg-[#5848d8]"
              >
                Upgrade Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {showInterviewModal && activeApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-slate-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
              <h3 className="text-sm font-extrabold text-[#3f4254] sm:text-base">Schedule Interview</h3>
              <button
                type="button"
                onClick={() => setShowInterviewModal(false)}
                disabled={savingInterview}
                className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-5">
              <form onSubmit={scheduleInterviewSubmit} className="space-y-4">
                <p className="text-xs font-semibold text-slate-400">
                  Schedule a dynamic interview with <span className="font-extrabold text-[#3f4254]">{activeApplication.name}</span> for the position of <span className="font-extrabold text-[#3f4254]">{activeApplication.jobTitle}</span>.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Interview Date</label>
                    <input
                      type="date"
                      required
                      min={todayDateString}
                      value={interviewForm.date}
                      onChange={(event) => setInterviewForm({ ...interviewForm, date: event.target.value })}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Interview Time</label>
                    <input
                      type="time"
                      required
                      value={interviewForm.time}
                      onChange={(event) => setInterviewForm({ ...interviewForm, time: event.target.value })}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Interview Type</label>
                  <select
                    value={interviewForm.type}
                    onChange={(event) => setInterviewForm({ ...interviewForm, type: event.target.value, locationOrLink: '' })}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-[#6658dd]"
                  >
                    <option>Video Call</option>
                    <option>Phone Call</option>
                    <option>In-Person</option>
                    <option>Other</option>
                  </select>
                </div>

                {isInPersonInterview(interviewForm.type) ? (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Manual Address / Office Location (Optional)</label>
                      <input
                        type="text"
                        placeholder="Enter complete address manually"
                        value={interviewForm.manualAddress || ''}
                        onChange={(event) => setInterviewForm({ ...interviewForm, manualAddress: event.target.value })}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                      />
                    </div>
                    <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
                      <p className="mb-2 text-xs font-bold text-slate-550">Or Select on Map (Optional)</p>
                      <InterviewLocationPicker
                        value={interviewForm.locationOrLink}
                        onChange={(locationOrLink) => setInterviewForm(prev => ({ ...prev, locationOrLink }))}
                      />
                    </div>
                  </div>
                ) : getInterviewLocationField(interviewForm.type) && (
                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-slate-500">{getInterviewLocationField(interviewForm.type).label}</label>
                    <input
                      type="text"
                      placeholder={getInterviewLocationField(interviewForm.type).placeholder}
                      value={interviewForm.locationOrLink}
                      onChange={(event) => setInterviewForm({ ...interviewForm, locationOrLink: event.target.value })}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Interviewer Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Topics to discuss or instruction notes..."
                    value={interviewForm.notes}
                    onChange={(event) => setInterviewForm({ ...interviewForm, notes: event.target.value })}
                    className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                  />
                </div>

                <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={savingInterview}
                    onClick={() => setShowInterviewModal(false)}
                    className="h-10 rounded-md bg-slate-100 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={savingInterview}
                    className="h-10 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white transition hover:bg-[#5848d8] disabled:opacity-60"
                  >
                    {savingInterview ? 'Scheduling...' : 'Confirm Interview'}
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

export default EmployerApplications;
