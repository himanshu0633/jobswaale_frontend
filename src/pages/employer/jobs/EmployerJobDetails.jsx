import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  CalendarX,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Edit,
  Eye,
  FileText,
  Lock,
  Loader,
  MapPin,
  Pause,
  RefreshCw,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  Inbox,
  X
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import PageSkeleton from '../../../components/SkeletonLoader';
import InterviewLocationPicker from '../../../components/InterviewLocationPicker';

const emptyDetails = {
  stats: {},
  skills: [],
  languages: [],
  recentApplicants: []
};

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatDate = (value, fallback = '-') => {
  if (!value) return fallback;
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
};

const statusTone = {
  Active: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  Draft: 'border-amber-100 bg-amber-50 text-amber-700',
  Expired: 'border-rose-100 bg-rose-50 text-rose-700',
  Paused: 'border-slate-200 bg-slate-100 text-slate-600',
  Closed: 'border-slate-200 bg-slate-100 text-slate-600'
};

const statCards = [
  { key: 'applications', title: 'Total', icon: Inbox, tone: 'bg-slate-50 text-slate-600' },
  { key: 'applied', title: 'Applied', icon: FileText, tone: 'bg-emerald-50 text-emerald-600' },
  { key: 'reviewed', title: 'Reviewed', icon: Eye, tone: 'bg-sky-50 text-sky-500' },
  { key: 'shortlisted', title: 'Shortlisted', icon: UserCheck, tone: 'bg-amber-50 text-amber-500' },
  { key: 'interviews', title: 'Interviews', icon: Calendar, tone: 'bg-indigo-50 text-[#6658dd]' },
  { key: 'onHold', title: 'On Hold Interview', icon: Clock, tone: 'bg-orange-50 text-orange-500' },
  { key: 'selected', title: 'Selected / Hired', icon: UserPlus, tone: 'bg-emerald-50 text-emerald-500' },
  { key: 'rejected', title: 'Rejected', icon: UserX, tone: 'bg-rose-50 text-rose-500' }
];

const applicantTone = {
  Applied: 'bg-emerald-50 text-emerald-600',
  Shortlisted: 'bg-amber-50 text-amber-600',
  Interview: 'bg-indigo-50 text-[#6658dd]',
  OnHold: 'bg-orange-50 text-orange-500',
  'On Hold': 'bg-orange-50 text-orange-500',
  Reviewed: 'bg-sky-50 text-sky-600',
  Rejected: 'bg-rose-50 text-rose-600'
};

const parseJobDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const normalizeDetails = (payload) => {
  const expiry = parseJobDate(payload?.expiry);
  let status = payload?.status || 'Active';
  if (!['Draft', 'Paused', 'Closed'].includes(status)) {
    if (expiry) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      status = expiry.getTime() < today.getTime() ? 'Expired' : 'Active';
    } else if (status === 'Expired') {
      status = 'Active';
    }
  }

  return { ...emptyDetails, ...payload, status };
};

const isInPersonInterview = (type) => String(type || '').toLowerCase().includes('person');

const getInterviewLocationField = (type) => {
  const t = String(type || '').toLowerCase();
  if (t.includes('video')) return { label: 'Meeting Link', placeholder: 'Zoom link, Google Meet, or Teams link' };
  if (t.includes('phone')) return { label: 'Phone Number', placeholder: 'Enter phone number for the interview' };
  if (t.includes('other')) return { label: 'Interview Location / Details', placeholder: 'Enter meeting details/link/address' };
  return null;
};

export const EmployerJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(emptyDetails);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [duplicating, setDuplicating] = useState(false);
  const [actionState, setActionState] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [upgradePopup, setUpgradePopup] = useState({ open: false, message: '' });

  const [activeCandidate, setActiveCandidate] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [savingInterview, setSavingInterview] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    type: 'Video Call',
    locationOrLink: '',
    notes: '',
    manualAddress: ''
  });

  const openInterviewModal = (candidate) => {
    setError('');
    setMessage('');
    setActiveCandidate(candidate);
    const details = candidate.interviewDetails || {};
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
        ...interviewForm,
        locationOrLink: interviewForm.manualAddress || interviewForm.locationOrLink || ''
      };
      await axios.post(
        `${BASE_API_URL}/employer/applications/${activeCandidate.id}/schedule-interview`,
        payload,
        { headers: getTokenHeaders() }
      );
      setShowInterviewModal(false);
      setInterviewForm({ date: '', time: '', type: 'Video Call', locationOrLink: '', notes: '', manualAddress: '' });
      setMessage(activeCandidate.status === 'Interview' ? 'Interview rescheduled successfully.' : 'Interview scheduled successfully.');
      await loadDetails({ silent: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule interview.');
    } finally {
      setSavingInterview(false);
    }
  };

  const loadDetails = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${BASE_API_URL}/employer/jobs/${id}`, { headers: getTokenHeaders() });
      setDetails(normalizeDetails(response.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Job details could not be loaded.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const duplicateJob = async () => {
    setDuplicating(true);
    setMessage('');
    setError('');
    try {
      const response = await axios.post(`${BASE_API_URL}/employer/jobs/${id}/duplicate`, {}, { headers: getTokenHeaders() });
      const copiedId = response.data?.job?._id || response.data?.job?.id;
      setMessage('Job duplicated successfully. Copy saved in draft.');
      if (copiedId) {
        window.setTimeout(() => navigate(`/employer/jobs/${copiedId}/edit`), 500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to duplicate job.');
    } finally {
      setDuplicating(false);
    }
  };
  const runJobAction = async (action) => {
    if (action === 'close' && !window.confirm('Are you sure you want to close this job?')) {
      return;
    }

    setActionState(action);
    setMessage('');
    try {
      await axios.patch(`${BASE_API_URL}/employer/jobs/${id}/action`, { action }, { headers: getTokenHeaders() });
      const messages = {
        pause: 'Job paused successfully.',
        close: 'Job closed successfully.',
        reopen: 'Job reopened successfully.',
        renew: 'Job renewed successfully.'
      };
      setMessage(messages[action] || 'Job updated successfully.');
      await loadDetails({ silent: true });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to complete job action.');
    } finally {
      setActionState('');
    }
  };

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

  const handleInterviewOnHold = async (candidateId) => {
    setMessage('');
    setError('');
    try {
      await axios.post(
        `${BASE_API_URL}/employer/applications/${candidateId}/schedule-interview`,
        {
          onHold: true,
          type: 'Video Call',
          notes: 'Interview kept on hold.'
        },
        { headers: getTokenHeaders() }
      );
      setMessage('Candidate moved to interview on hold.');
      await loadDetails({ silent: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to move candidate to interview on hold.');
    }
  };

  const updateCandidateStatus = async (candidateId, newStatus) => {
    setMessage('');
    setError('');
    try {
      await axios.patch(`${BASE_API_URL}/employer/applications/${candidateId}/status`, { status: newStatus }, { headers: getTokenHeaders() });
      setMessage(newStatus === 'Offered' ? 'Candidate selected successfully.' : `Candidate status updated to ${newStatus}.`);
      await loadDetails({ silent: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update candidate status.');
    }
  };

  const downloadResume = async (candidateId, candidateName) => {
    setMessage('');
    setError('');
    try {
      const response = await axios.get(`${BASE_API_URL}/employer/candidates/${candidateId}/resume-download`, {
        headers: getTokenHeaders(),
        responseType: 'blob'
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${candidateName || 'candidate'}-resume`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      
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
    }
  };

  if (loading) {
    return <PageSkeleton variant="detail" />;
  }

  if (error) {
    return (
      <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
        {error}
      </div>
    );
  }

  const totalApplications = Number(details.stats?.applications || 0) || 1;
  const meta = {
    views: Number(details.views || 0),
    impressions: Number(details.impressions || 0),
    applications: Number(details.stats?.applications || 0),
    averageMatchScore: Number(details.stats?.averageMatchScore || 0)
  };
  const pipeline = [
    { key: 'applied', title: 'Applied', icon: FileText, tone: 'bg-emerald-500' },
    { key: 'reviewed', title: 'Reviewed', icon: Eye, tone: 'bg-sky-500' },
    { key: 'shortlisted', title: 'Shortlisted', icon: UserCheck, tone: 'bg-amber-500' },
    { key: 'interviews', title: 'Interviews', icon: Calendar, tone: 'bg-[#6658dd]' },
    { key: 'onHold', title: 'On Hold for Interview', icon: Clock, tone: 'bg-orange-500' },
    { key: 'selected', title: 'Selected / Hired', icon: UserPlus, tone: 'bg-emerald-500' },
    { key: 'rejected', title: 'Rejected', icon: UserX, tone: 'bg-rose-500' }
  ];

  const filteredApplicants = (details.recentApplicants || []).filter((candidate) => {
    if (selectedStatus === 'all' || selectedStatus === 'applications') return true;
    if (selectedStatus === 'applied') return candidate.status === 'Applied';
    if (selectedStatus === 'reviewed') return candidate.status === 'Reviewed';
    if (selectedStatus === 'shortlisted') return candidate.status === 'Shortlisted';
    if (selectedStatus === 'interviews') return candidate.status === 'Interview' && !candidate.interviewDetails?.onHold;
    if (selectedStatus === 'onHold') return candidate.status === 'Interview' && candidate.interviewDetails?.onHold;
    if (selectedStatus === 'selected') return ['Offered', 'Selected', 'Hired'].includes(candidate.status);
    if (selectedStatus === 'rejected') return candidate.status === 'Rejected';
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <h1 className="text-xl font-extrabold text-[#3f4254]">{details.title}</h1>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
          <span className="text-[#3f4254]">JobsWaale</span>
          <ChevronRight className="h-4 w-4" />
          <Link to="/employer/jobs" className="hover:text-[#6658dd]">Jobs</Link>
          <ChevronRight className="h-4 w-4" />
          <span>Job Details</span>
        </div>
      </div>

      <section className={`flex flex-col justify-between gap-3 rounded-md border px-4 py-3 md:flex-row md:items-center ${statusTone[details.status] || statusTone.Active}`}>
        <div className="flex flex-wrap items-center gap-3 text-sm font-bold">
          <span className="rounded bg-white/70 px-2 py-1 text-xs font-black">{details.status}</span>
          <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> Posted: {formatDate(details.postDate)}</span>
          <span className="inline-flex items-center gap-1"><CalendarX className="h-4 w-4" /> Expires: {formatDate(details.expiry, 'Not set')}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> <strong>{details.remainingDays ?? 0} days</strong> remaining</span>
        </div>
        <div className="inline-flex items-center gap-2 text-sm font-black">
          <Eye className="h-4 w-4" />
          {details.views || 0} Views
        </div>
      </section>

      {message && (
        <div className="rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {message}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link to={`/employer/jobs/${details.id}/edit`} className="inline-flex items-center gap-2 rounded-md bg-[#6658dd] px-3 py-2 text-sm font-extrabold text-white"><Edit className="h-4 w-4" /> Edit Job</Link>
        <Link to={`/employer/applications?jobTitle=${encodeURIComponent(details.title || '')}`} className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-3 py-2 text-sm font-extrabold text-white"><FileText className="h-4 w-4" /> View Applications</Link>
        <button type="button" onClick={duplicateJob} disabled={duplicating} className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-sm font-extrabold text-white disabled:opacity-60">{duplicating ? <Loader className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />} Duplicate</button>
        {details.status === 'Closed' || details.status === 'Paused' ? (
          <button type="button" onClick={() => runJobAction('reopen')} disabled={Boolean(actionState)} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-extrabold text-white disabled:opacity-60">{actionState === 'reopen' ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Reopen Job</button>
        ) : details.status === 'Expired' ? (
          <button type="button" onClick={() => runJobAction('renew')} disabled={Boolean(actionState)} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-extrabold text-white disabled:opacity-60">{actionState === 'renew' ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Renew Job</button>
        ) : (
          <button type="button" onClick={() => runJobAction('pause')} disabled={Boolean(actionState)} className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-3 py-2 text-sm font-extrabold text-white disabled:opacity-60">{actionState === 'pause' ? <Loader className="h-4 w-4 animate-spin" /> : <Pause className="h-4 w-4" />} Pause Job</button>
        )}
        {details.status !== 'Closed' && (
          <button type="button" onClick={() => runJobAction('close')} disabled={Boolean(actionState)} className="inline-flex items-center gap-2 rounded-md bg-rose-500 px-3 py-2 text-sm font-extrabold text-white disabled:opacity-60">{actionState === 'close' ? <Loader className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Mark as Closed</button>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <section className="rounded-md border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-dashed border-slate-200 px-5 py-4">
            <h2 className="text-lg font-extrabold text-[#3f4254]">Job Information</h2>
          </div>
          <div className="space-y-5 p-5">
            <div className="grid gap-5 md:grid-cols-2">
              {[
                ['Job Title', details.title],
                ['Job Type', details.jobType],
                ['Location', details.location],
                ['Department / Category', details.category],
                ['Experience Required', details.experience],
                ['Salary Range', details.salary],
                ['Vacancies', `${details.vacancies || 0} Positions`],
                ['Posted By', details.contactPerson || details.companyName],
                ['Posted Date', formatDate(details.postDate)],
                ['Expiry Date', formatDate(details.expiry, 'Not set')]
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-700">{value || '-'}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-5">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Job Description</p>
              <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-slate-600">{details.description || '-'}</p>
              {details.responsibilities && (
                <>
                  <p className="mt-4 text-sm font-extrabold text-slate-800">Key Responsibilities</p>
                  <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-slate-600">{details.responsibilities}</p>
                </>
              )}
            </div>

            <div className="border-t border-slate-100 pt-5">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Skills Required</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(details.skills || []).length ? details.skills.map((skill) => (
                  <span key={skill} className="rounded bg-indigo-50 px-2.5 py-1 text-xs font-black text-[#6658dd]">{skill}</span>
                )) : <span className="text-sm font-semibold text-slate-400">No skills added.</span>}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Qualifications</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">{details.qualification || '-'}</p>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-md border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-dashed border-slate-200 px-5 py-4">
              <h2 className="text-lg font-extrabold text-[#3f4254]">Hiring Pipeline</h2>
            </div>
            <div className="space-y-4 p-5">
              {pipeline.map((item) => {
                const value = Number(details.stats?.[item.key] || 0);
                const width = Math.min(Math.round((value / totalApplications) * 100), 100);
                return (
                  <div key={item.key} className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${item.tone}`}>
                      <item.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-grow">
                      <div className="flex justify-between text-sm font-bold text-slate-600">
                        <span>{item.title}</span>
                        <span>{value}</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className={item.tone} style={{ width: `${width}%`, height: '100%' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-md border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-dashed border-slate-200 px-5 py-4">
              <h2 className="text-lg font-extrabold text-[#3f4254]">Job Meta</h2>
            </div>
            <div className="space-y-3 p-5 text-sm font-semibold text-slate-500">
              <div className="flex justify-between"><span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> Total Views</span><strong>{meta.views.toLocaleString('en-IN')}</strong></div>
              <div className="flex justify-between"><span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> Total Impressions</span><strong>{meta.impressions.toLocaleString('en-IN')}</strong></div>
              <div className="flex justify-between"><span className="inline-flex items-center gap-1"><FileText className="h-4 w-4" /> Applications</span><strong>{meta.applications.toLocaleString('en-IN')}</strong></div>
              <div className="flex justify-between"><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Match Avg. Score</span><strong>{meta.applications ? `${meta.averageMatchScore}%` : '-'}</strong></div>
              <div className="flex justify-between"><span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> Work Mode</span><strong>{details.workMode || '-'}</strong></div>
            </div>
          </section>
        </aside>
      </div>

      <section className="rounded-md border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-dashed border-slate-200 px-5 py-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-extrabold text-[#3f4254]">Recent Applicants</h2>
            <p className="mt-1 text-sm font-semibold text-slate-400">Latest candidates who applied for this position.</p>
          </div>
          <Link to={`/employer/applications?jobTitle=${encodeURIComponent(details.title || '')}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white">
            <Eye className="h-4 w-4" />
            View All Applications
          </Link>
        </div>

        <div className="grid gap-4 p-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-6 border-b border-dashed border-slate-100">
          {statCards.map((card) => {
            const isSelected = selectedStatus === card.key;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setSelectedStatus(isSelected ? 'all' : card.key)}
                className={`flex items-center gap-3 rounded-md border p-4 text-left transition w-full shadow-sm outline-none ${
                  isSelected
                    ? 'border-[#6658dd] bg-[#e8e6fa] ring-2 ring-[#6658dd]/20'
                    : 'border-slate-100 bg-white hover:border-slate-300'
                }`}
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${card.tone}`}>
                  <card.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-400">{card.title}</p>
                  <p className="mt-1 text-2xl font-black text-[#3f4254]">{details.stats?.[card.key] || 0}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto p-5 pb-24">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Applied Date</th>
                <th className="px-4 py-3">Match Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplicants.map((candidate) => (
                <tr key={candidate.id}>
                  <td className="px-4 py-4">
                    <p className="text-sm font-extrabold text-slate-800">{candidate.name}</p>
                    <p className="text-xs font-semibold text-slate-400">{candidate.email}</p>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-500">{formatDate(candidate.appliedAt)}</td>
                  <td className="px-4 py-4"><span className="rounded bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-600">{candidate.matchScore}%</span></td>
                  <td className="px-4 py-4"><span className={`rounded px-2 py-1 text-xs font-black ${applicantTone[candidate.status === 'Interview' && candidate.interviewDetails?.onHold ? 'OnHold' : candidate.status] || applicantTone.Applied}`}>{candidate.status === 'Interview' && candidate.interviewDetails?.onHold ? 'On Hold for Interview' : candidate.status}</span></td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-wrap items-center gap-1.5 justify-end max-w-[280px] ml-auto">
                      <Link to={`/employer/applications/${candidate.id}`} title="View Application Details" className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50">
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Link>
                      
                      {/* Download Resume */}
                      {candidate.hasResume && (
                        <button
                          type="button"
                          onClick={() => downloadResume(candidate.candidateId, candidate.name)}
                          title="Download Resume"
                          className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-extrabold text-[#6658dd] transition hover:bg-indigo-50"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Resume</span>
                        </button>
                      )}

                      {/* Shortlist */}
                      {['Applied', 'Reviewed'].includes(candidate.status) && (
                        <button
                          type="button"
                          onClick={() => updateCandidateStatus(candidate.id, 'Shortlisted')}
                          title="Shortlist"
                          className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-extrabold text-amber-500 transition hover:bg-amber-50"
                        >
                          <UserCheck className="h-4 w-4" />
                          <span>Shortlist</span>
                        </button>
                      )}

                      {/* Schedule / Reschedule Interview */}
                      {(candidate.status === 'Shortlisted' || candidate.status === 'Interview') && (
                        <button
                          type="button"
                          onClick={() => openInterviewModal(candidate)}
                          title={candidate.status === 'Interview' ? "Reschedule Interview" : "Schedule Interview"}
                          className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-extrabold text-[#6658dd] transition hover:bg-indigo-50"
                        >
                          <Calendar className="h-4 w-4" />
                          <span>{candidate.status === 'Interview' ? "Reschedule" : "Interview"}</span>
                        </button>
                      )}

                      {/* On Hold for Interview */}
                      {(candidate.status === 'Shortlisted' ||
                        (candidate.status === 'Interview' && !candidate.interviewDetails?.onHold && !getIsInterviewPassed(candidate))) && (
                        <button
                          type="button"
                          onClick={() => handleInterviewOnHold(candidate.id)}
                          title="On Hold for Interview"
                          className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-extrabold text-amber-700 transition hover:bg-amber-50"
                        >
                          <Clock className="h-4 w-4" />
                          <span>Hold</span>
                        </button>
                      )}

                      {/* Select / Hire */}
                      {candidate.status === 'Interview' && !candidate.interviewDetails?.onHold && getIsInterviewPassed(candidate) && (
                        <button
                          type="button"
                          onClick={() => updateCandidateStatus(candidate.id, 'Offered')}
                          title="Select / Hire"
                          className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-extrabold text-emerald-500 transition hover:bg-emerald-50"
                        >
                          <UserPlus className="h-4 w-4" />
                          <span>Select</span>
                        </button>
                      )}

                      {/* Reject */}
                      {['Applied', 'Reviewed', 'Shortlisted', 'Interview'].includes(candidate.status) && (
                        <button
                          type="button"
                          onClick={() => updateCandidateStatus(candidate.id, 'Rejected')}
                          title="Reject"
                          className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-extrabold text-rose-500 transition hover:bg-rose-50"
                        >
                          <UserX className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredApplicants.length && (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-sm font-bold text-slate-400">No recent applicants found.</td>
                </tr>
              )}
            </tbody>
          </table>
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

      {showInterviewModal && activeCandidate && (
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
                  Schedule a dynamic interview with <span className="font-extrabold text-[#3f4254]">{activeCandidate.name}</span> for the position of <span className="font-extrabold text-[#3f4254]">{details.title}</span>.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Interview Date</label>
                    <input
                      type="date"
                      required
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
                        onChange={(locationOrLink) => setInterviewForm({ ...interviewForm, locationOrLink })}
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

export default EmployerJobDetails;
