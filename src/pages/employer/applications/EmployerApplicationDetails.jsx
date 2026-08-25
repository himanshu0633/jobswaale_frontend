import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CalendarPlus,
  Check,
  Clock,
  Download,
  FileText,
  Loader,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  User,
  UserCheck,
  UserPlus,
  UserX,
  X
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import PageSkeleton from '../../../components/SkeletonLoader';
import InterviewLocationPicker from '../../../components/InterviewLocationPicker';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const downloadCandidateResume = async (candidate) => {
  if (!candidate?.id) return;
  try {
    const response = await axios.get(`${BASE_API_URL}/employer/candidates/${candidate.id}/resume-download`, {
      headers: getTokenHeaders(),
      responseType: 'blob'
    });
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${candidate.name || 'candidate'}-resume`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);

    const remainingUnlocks = response.headers['x-remaining-unlocks'];
    const isNewUnlock = response.headers['x-is-new-unlock'] === 'true';

    if (isNewUnlock && remainingUnlocks !== undefined) {
      const event = new CustomEvent('resume-unlock-success', { detail: { remainingUnlocks } });
      window.dispatchEvent(event);
    }
  } catch (err) {
    if (err.response?.data instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const errorObj = JSON.parse(reader.result);
          alert(errorObj.message || 'Resume could not be downloaded.');
        } catch {
          alert('Resume could not be downloaded.');
        }
      };
      reader.readAsText(err.response.data);
    } else {
      alert(err.response?.data?.message || 'Resume could not be downloaded.');
    }
  }
};

const statusTone = {
  Applied: 'bg-emerald-50 text-emerald-600',
  Reviewed: 'bg-sky-50 text-sky-600',
  Shortlisted: 'bg-amber-50 text-amber-600',
  Interview: 'bg-violet-50 text-violet-600',
  Selected: 'bg-emerald-50 text-emerald-600',
  'Offer Sent': 'bg-blue-50 text-blue-600',
  'Offer Accepted': 'bg-cyan-50 text-cyan-600',
  Hired: 'bg-emerald-50 text-emerald-600',
  'Offer Declined': 'bg-rose-50 text-rose-600',
  Offered: 'bg-blue-50 text-blue-600',
  Rejected: 'bg-rose-50 text-rose-600'
};

const timelineSteps = ['Applied', 'Reviewed', 'Shortlisted', 'Interview', 'Offered'];
const actionStepIndex = {
  Shortlisted: 2,
  Interview: 3,
  Offered: 4
};

const getInterviewLocationField = (type) => {
  const normalizedType = String(type || '').toLowerCase();
  if (normalizedType.includes('phone')) return null;
  if (normalizedType.includes('person')) {
    return {
      label: 'Interview Location',
      placeholder: 'Office address or interview venue'
    };
  }
  if (normalizedType.includes('other')) {
    return {
      label: 'Interview Details',
      placeholder: 'Location, link, or custom interview instructions'
    };
  }
  return {
    label: 'Meeting Link',
    placeholder: 'Zoom link, Google Meet, or Teams link'
  };
};

const isInPersonInterview = (type) => String(type || '').toLowerCase().includes('person');

const Field = ({ label, children }) => (
  <div className="mb-5">
    <label className="mb-1 block text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</label>
    <div className="text-sm font-semibold text-[#3f4254]">{children || 'Not specified'}</div>
  </div>
);

const Card = ({ title, children, className = '' }) => (
  <section className={`rounded-md border border-slate-100 bg-white shadow-sm ${className}`}>
    {title && <div className="border-b border-dashed border-slate-200 px-5 py-4"><h2 className="text-base font-extrabold text-[#3f4254]">{title}</h2></div>}
    <div className="p-5">{children}</div>
  </section>
);

const ActionButton = ({ tone, icon: Icon, children, onClick, disabled, className }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60 ${tone} ${className || ''}`}
  >
    <Icon className="h-4 w-4" />
    {children}
  </button>
);

const ResumeDownloadLink = ({ candidate, className }) => {
  if (!candidate.hasResume) return null;

  const handleDownload = () => {
    if (!candidate.allowResumeDownload) {
      alert("Please upgrade your plan to download candidate resumes.");
      return;
    }
    downloadCandidateResume(candidate);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 ${className || ''}`}
    >
      <Download className="h-4 w-4" /> Download Resume
    </button>
  );
};

const EmployerApplicationDetails = () => {
  const { id } = useParams();
  const todayDateString = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    type: 'Video Call',
    locationOrLink: '',
    notes: ''
  });
  const [unlockSuccessModal, setUnlockSuccessModal] = useState({
    show: false,
    remainingUnlocks: ''
  });

  useEffect(() => {
    const handleUnlockSuccess = (e) => {
      setUnlockSuccessModal({
        show: true,
        remainingUnlocks: e.detail.remainingUnlocks
      });
    };
    window.addEventListener('resume-unlock-success', handleUnlockSuccess);
    return () => {
      window.removeEventListener('resume-unlock-success', handleUnlockSuccess);
    };
  }, []);

  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Check every second to auto-update view on interview time passed

    return () => clearInterval(interval);
  }, []);

  const interviewDateTime = useMemo(() => {
    const details = application?.interviewDetails;
    if (!details?.date || !details?.time || details?.onHold || application?.status !== 'Interview') {
      return null;
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
    return d;
  }, [application]);

  const isInterviewPassed = useMemo(() => {
    if (!interviewDateTime) return false;
    return currentTime > interviewDateTime.getTime();
  }, [interviewDateTime, currentTime]);

  const loadDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${BASE_API_URL}/employer/applications/${id}`, { headers: getTokenHeaders() });
      if (response.data?.status === 'Applied') {
        await axios.patch(`${BASE_API_URL}/employer/applications/${id}/status`, { status: 'Reviewed' }, { headers: getTokenHeaders() });
        setApplication({ ...response.data, status: 'Reviewed' });
      } else {
        setApplication(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Application details could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const updateStatus = async (status) => {
    setSaving(status);
    setError('');
    setMessage('');
    try {
      await axios.patch(`${BASE_API_URL}/employer/applications/${id}/status`, { status }, { headers: getTokenHeaders() });
      setMessage(status === 'Offered' ? 'Application Selected successfully.' : `Application ${status} successfully.`);
      await loadDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Status update failed.');
    } finally {
      setSaving('');
    }
  };

  const openInterviewModal = () => {
    setError('');
    setMessage('');
    setInterviewForm({
      date: '',
      time: '',
      type: 'Video Call',
      locationOrLink: '',
      notes: '',
      manualAddress: ''
    });
    setShowInterviewModal(true);
  };

  const scheduleInterview = async (event) => {
    event.preventDefault();
    if (!interviewForm.date || !interviewForm.time) {
      setError('Please specify interview date and time.');
      return;
    }
    setSaving('Interview');
    setError('');
    setMessage('');
    try {
      const payload = {
        ...interviewForm
      };
      await axios.post(
        `${BASE_API_URL}/employer/applications/${id}/schedule-interview`,
        payload,
        { headers: getTokenHeaders() }
      );
      setShowInterviewModal(false);
      setInterviewForm({ date: '', time: '', type: 'Video Call', locationOrLink: '', notes: '' });
      setMessage('Interview scheduled successfully.');
      await loadDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Interview schedule failed.');
    } finally {
      setSaving('');
    }
  };

  const scheduleInterviewOnHold = async () => {
    setSaving('InterviewOnHold');
    setError('');
    setMessage('');
    try {
      await axios.post(
        `${BASE_API_URL}/employer/applications/${id}/schedule-interview`,
        {
          onHold: true,
          type: application?.interviewDetails?.type || 'Video Call',
          notes: application?.interviewDetails?.notes || 'Interview kept on hold.'
        },
        { headers: getTokenHeaders() }
      );
      setMessage('Application moved to interview on hold.');
      await loadDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to move application to interview on hold.');
    } finally {
      setSaving('');
    }
  };

  const topActions = useMemo(() => {
    const list = [];
    if (!application) return list;

    const status = application.status;
    const details = application.interviewDetails || {};
    const onHold = details.onHold;

    // 1. If status is Applied or Reviewed:
    // Only show: Shortlist, Reject
    if (status === 'Applied' || status === 'Reviewed') {
      list.push({
        key: 'Shortlisted',
        label: 'Shortlist',
        tone: 'bg-amber-500 text-white hover:bg-amber-600',
        icon: UserCheck,
        onClick: () => updateStatus('Shortlisted')
      });
      list.push({
        key: 'Rejected',
        label: 'Reject',
        tone: 'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50',
        icon: UserX,
        onClick: () => updateStatus('Rejected')
      });
    }

    // 2. If status is Shortlisted:
    // Only show: Schedule Interview, On Hold for Interview, Reject
    else if (status === 'Shortlisted') {
      list.push({
        key: 'InterviewSchedule',
        label: 'Schedule Interview',
        tone: 'bg-[#6658dd] text-white hover:bg-[#5848d8]',
        icon: CalendarPlus,
        onClick: openInterviewModal
      });
      list.push({
        key: 'InterviewOnHold',
        label: 'On Hold for Interview',
        tone: 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
        icon: Clock,
        onClick: scheduleInterviewOnHold
      });
      list.push({
        key: 'Rejected',
        label: 'Reject',
        tone: 'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50',
        icon: UserX,
        onClick: () => updateStatus('Rejected')
      });
    }

    // 3. If status is Interview:
    else if (status === 'Interview') {
      if (onHold) {
        // If on hold:
        // Only show: Schedule Interview, Reject
        list.push({
          key: 'InterviewSchedule',
          label: 'Schedule Interview',
          tone: 'bg-[#6658dd] text-white hover:bg-[#5848d8]',
          icon: CalendarPlus,
          onClick: openInterviewModal
        });
        list.push({
          key: 'Rejected',
          label: 'Reject',
          tone: 'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50',
          icon: UserX,
          onClick: () => updateStatus('Rejected')
        });
      } else {
        // If NOT on hold:
        if (isInterviewPassed) {
          // If interview time has passed:
          // Only show: Select, Reject
          list.push({
            key: 'Offered',
            label: 'Select',
            tone: 'bg-emerald-500 text-white hover:bg-emerald-600',
            icon: UserPlus,
            onClick: () => updateStatus('Offered')
          });
          list.push({
            key: 'Rejected',
            label: 'Reject',
            tone: 'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50',
            icon: UserX,
            onClick: () => updateStatus('Rejected')
          });
        } else {
          // If interview time has NOT passed:
          // Only show: Reschedule Interview, On Hold for Interview, Reject
          list.push({
            key: 'InterviewSchedule',
            label: 'Reschedule Interview',
            tone: 'bg-[#6658dd] text-white hover:bg-[#5848d8]',
            icon: CalendarPlus,
            onClick: openInterviewModal
          });
          list.push({
            key: 'InterviewOnHold',
            label: 'On Hold for Interview',
            tone: 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
            icon: Clock,
            onClick: scheduleInterviewOnHold
          });
          list.push({
            key: 'Rejected',
            label: 'Reject',
            tone: 'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50',
            icon: UserX,
            onClick: () => updateStatus('Rejected')
          });
        }
      }
    }

    return list;
  }, [application, isInterviewPassed]);

  const quickActions = useMemo(() => {
    const list = [];
    if (!application) return list;

    const status = application.status;
    const details = application.interviewDetails || {};
    const onHold = details.onHold;

    if (['Offered', 'Hired'].includes(status)) return list;

    // 0. Mark as Applied button: shown if status is not Applied
    if (status !== 'Applied') {
      list.push({
        key: 'Applied',
        label: 'Mark as Applied',
        tone: 'border border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50',
        icon: FileText,
        onClick: () => updateStatus('Applied')
      });
    }

    // 1. Shortlist button: shown if status is Applied, Reviewed, or Rejected
    if (['Applied', 'Reviewed', 'Rejected'].includes(status)) {
      list.push({
        key: 'Shortlisted',
        label: 'Shortlist',
        tone: 'bg-amber-500 text-white hover:bg-amber-600',
        icon: UserCheck,
        onClick: () => updateStatus('Shortlisted')
      });
    }

    // 2. Schedule Interview or Reschedule Interview button:
    // shown if status is Applied, Reviewed, Shortlisted, Interview, or Rejected
    if (['Applied', 'Reviewed', 'Shortlisted', 'Interview', 'Rejected'].includes(status)) {
      const isInterview = status === 'Interview';
      list.push({
        key: 'InterviewSchedule',
        label: (isInterview && !onHold) ? 'Reschedule Interview' : 'Schedule Interview',
        tone: 'bg-[#6658dd] text-white hover:bg-[#5848d8]',
        icon: CalendarPlus,
        onClick: openInterviewModal
      });
    }

    // 3. On Hold for Interview button:
    // shown if status is Applied, Reviewed, Shortlisted, Interview, or Rejected (and not already on hold)
    if (['Applied', 'Reviewed', 'Shortlisted', 'Interview', 'Rejected'].includes(status)) {
      if (!(status === 'Interview' && onHold)) {
        list.push({
          key: 'InterviewOnHold',
          label: 'On Hold for Interview',
          tone: 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
          icon: Clock,
          onClick: scheduleInterviewOnHold
        });
      }
    }

    // 4. Select button:
    // shown if status is Applied, Reviewed, Shortlisted, Interview, or Rejected
    if (['Applied', 'Reviewed', 'Shortlisted', 'Interview', 'Rejected'].includes(status)) {
      list.push({
        key: 'Offered',
        label: 'Select',
        tone: 'bg-emerald-500 text-white hover:bg-emerald-600',
        icon: UserPlus,
        onClick: () => updateStatus('Offered')
      });
    }

    // 5. Reject button:
    // shown if status is Applied, Reviewed, Shortlisted, Interview, or Rejected
    if (['Applied', 'Reviewed', 'Shortlisted', 'Interview', 'Rejected'].includes(status)) {
      list.push({
        key: 'Rejected',
        label: 'Reject',
        tone: 'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50',
        icon: UserX,
        onClick: () => updateStatus('Rejected')
      });
    }

    return list;
  }, [application]);

  const activeStepIndex = useMemo(() => {
    if (!application?.status) return 0;
    if (application.status === 'Rejected') {
      return Math.max(timelineSteps.findIndex((step) => step === application.rejectedFromStatus), 0);
    }
    return Math.max(timelineSteps.findIndex((step) => step === application.status), 0);
  }, [application]);

  if (loading) {
    return <PageSkeleton variant="detail" />;
  }

  if (!application) {
    return (
      <div className="rounded-md border border-rose-100 bg-rose-50 p-6 text-sm font-bold text-rose-700">
        {error || 'Application not found.'}
      </div>
    );
  }

  const candidate = application.candidate || {};
  const job = application.job || {};
  const interviewLocationField = getInterviewLocationField(interviewForm.type);
  const showMapPicker = isInPersonInterview(interviewForm.type);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <Link to="/employer/applications" className="mb-2 inline-flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-[#6658dd]">
            <ArrowLeft className="h-4 w-4" /> Back to Applications
          </Link>
          <h1 className="text-xl font-extrabold text-[#3f4254]">Application Details</h1>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400"><span className="text-[#3f4254]">JobsWaale</span><span>/</span><span>Applications</span><span>/</span><span>Application Details</span></div>
      </div>

      {error && <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}
      {message && <div className="rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div>}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#3f4254]">
          <span className={`rounded px-2.5 py-1 text-xs font-black ${statusTone[application.status === 'Offered' ? (application.selectionDetails?.offerStatus || 'Selected') : application.status] || statusTone.Applied}`}>
            {application.status === 'Offered' ? (application.selectionDetails?.offerStatus || 'Selected') : application.status}
          </span>
          <span className="inline-flex items-center gap-1"><User className="h-4 w-4" /><strong>{candidate.name}</strong></span>
          <span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.title}</span>
          <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />Applied: {application.appliedDisplayDate}</span>
          {application.status === 'Rejected' && (
            <span className="inline-flex items-center gap-1 text-rose-600"><UserX className="h-4 w-4" />Rejected after: {application.rejectedFromStatus || 'Not available'}</span>
          )}
        </div>
        <span className="rounded bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-600"><Star className="mr-1 inline h-3.5 w-3.5" />{application.matchScore}% Match</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
        {topActions.map((action) => (
          <ActionButton key={action.key} tone={action.tone} icon={action.icon} onClick={action.onClick} disabled={Boolean(saving)} className="w-full">
            {action.label}
          </ActionButton>
        ))}
        <Link to={`/employer/messages?application=${application.id}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-sky-200 bg-white px-3 py-2 text-xs font-extrabold text-sky-600 hover:bg-sky-50 w-full">
          <MessageCircle className="h-4 w-4" /> Send Message
        </Link>
        <ResumeDownloadLink candidate={candidate} className="w-full" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card title="Applicant Summary">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Field label="Candidate Name">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-[#6658dd]">{candidate.initials}</span>
                    <div><p className="mb-0 font-extrabold">{candidate.name}</p><span className="text-xs text-slate-400">{candidate.email}</span></div>
                  </div>
                </Field>
                <Field label="Applied Date">{application.appliedDisplayDate}</Field>
                <Field label="Job Applied To"><span>{job.title}</span><br /><span className="mt-1 inline-flex rounded bg-blue-50 px-2 py-1 text-xs font-black text-blue-600">{job.type}</span></Field>
                {application.status === 'Rejected' && (
                  <>
                    <Field label="Rejected After">{application.rejectedFromStatus || 'Not available'}</Field>
                    <Field label="Rejected Date">{application.rejectedDisplayDate || 'Not specified'}</Field>
                  </>
                )}
                <Field label="Experience">{candidate.experience}</Field>
                <Field label="Ready to Relocate?">{candidate.relocate}</Field>
              </div>
              <div>
                <Field label="Current Salary">{candidate.currentSalary}</Field>
                <Field label="Expected Salary"><span className="text-base font-extrabold">{candidate.expectedSalary}</span></Field>
                <Field label="Notice Period"><span className="rounded bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-600">{candidate.noticePeriod}</span></Field>
                <Field label="Location"><span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-slate-400" />{candidate.location}</span></Field>
              </div>
            </div>
          </Card>

          <Card title="Cover Letter / Message">
            <p className="mb-3 text-sm leading-6 text-slate-600">Dear Hiring Team,</p>
            <p className="mb-3 text-sm leading-6 text-slate-600">{candidate.bio || `I am interested in the ${job.title} position at ${job.company}. My profile and experience match the role requirements.`}</p>
            <p className="mb-0 text-sm leading-6 text-slate-600">Best regards,<br /><strong>{candidate.name}</strong></p>
          </Card>

          <Card title="Education & Qualifications">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-slate-100 text-[11px] uppercase text-slate-500"><tr><th className="px-4 py-3">Degree</th><th className="px-4 py-3">Institution</th><th className="px-4 py-3">Year</th><th className="px-4 py-3">Grade</th></tr></thead>
                <tbody>
                  {(candidate.education || []).map((item, index) => (
                    <tr key={`${item.degree}-${index}`} className="border-b border-slate-100 last:border-0"><td className="px-4 py-3">{item.degree}</td><td className="px-4 py-3">{item.institution}</td><td className="px-4 py-3">{item.year}</td><td className="px-4 py-3">{item.grade}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Work Experience">
            {(candidate.workExperience || []).map((item, index) => (
              <div key={`${item.title}-${index}`} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between gap-4">
                  <div><h3 className="text-sm font-extrabold text-[#3f4254]">{item.title}</h3><p className="text-xs font-semibold text-slate-400">{item.company}</p></div>
                  <span className="text-xs font-semibold text-slate-400">{item.period}</span>
                </div>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {(item.points || []).map((point) => <li key={point}>{point}</li>)}
                </ul>
              </div>
            ))}
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title="Quick Actions">
            <div className="grid gap-2">
              {quickActions.map((action) => (
                <ActionButton key={action.key} tone={action.tone} icon={action.icon} onClick={action.onClick} disabled={Boolean(saving)}>
                  {action.label}
                </ActionButton>
              ))}
              <ResumeDownloadLink candidate={candidate} />
            </div>
          </Card>

          <Card title="Candidate Quick Profile">
            <div className="text-center">
              <span className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-2xl font-black text-[#6658dd]">{candidate.initials}</span>
              <h3 className="text-base font-extrabold text-[#3f4254]">{candidate.name}</h3>
              <p className="text-sm font-semibold text-slate-400">{candidate.designation}</p>
              <div className="mt-3 flex justify-center gap-2"><span className="rounded bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-600">{application.matchScore}% Match</span><span className="rounded bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-600">{candidate.noticePeriod}</span></div>
            </div>
            <div className="my-4 border-t border-slate-100" />
            <div className="space-y-2 text-sm font-semibold text-slate-600">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" />{candidate.email || 'N/A'}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" />{candidate.phone || 'N/A'}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" />{candidate.location}</p>
            </div>
            <div className="my-4 border-t border-slate-100" />
            <label className="mb-2 block text-[11px] font-black uppercase tracking-wide text-slate-400">Skills</label>
            <div className="flex flex-wrap gap-1.5">
              {(candidate.skills || []).map((skill) => <span key={skill} className="rounded bg-blue-50 px-2 py-1 text-xs font-black text-blue-600">{skill}</span>)}
            </div>
            <div className="mt-4 grid gap-2">
              <Link to={`/employer/candidateProfile/${candidate.id}`} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#6658dd] px-3 py-2 text-xs font-extrabold text-white"><User className="h-4 w-4" /> View Full Profile</Link>
            </div>
          </Card>

          <Card title="Application Timeline">
            <div className="space-y-4">
              {timelineSteps.map((step, index) => {
                const done = index <= activeStepIndex;
                let BulletIcon = done ? Check : Calendar;
                let bulletBg = done ? 'bg-emerald-500' : 'bg-slate-300';
                let statusText = done ? 'Completed' : 'Pending';
                let statusColor = 'text-slate-400';

                if (step === 'Applied' && done) {
                  statusText = application.appliedDisplayDate;
                } else if (step === 'Interview' && application.status === 'Interview') {
                  if (application.interviewDetails?.onHold) {
                    BulletIcon = Clock;
                    bulletBg = 'bg-amber-500';
                    statusText = 'On Hold';
                    statusColor = 'text-amber-600 font-extrabold';
                  } else {
                    BulletIcon = Calendar;
                    bulletBg = 'bg-violet-500';
                    statusText = 'Scheduled';
                    statusColor = 'text-violet-600 font-extrabold';
                  }
                }

                return (
                  <div key={step} className="flex items-start gap-3">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${bulletBg}`}>
                      <BulletIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-[#3f4254]">
                        {step === 'Offered' ? (application.selectionDetails?.offerStatus || 'Selected') : step}
                      </p>
                      <span className={`text-xs font-semibold ${statusColor}`}>{statusText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

        </aside>
      </div>

      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-slate-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
              <h3 className="text-sm font-extrabold text-[#3f4254] sm:text-base">Schedule Interview</h3>
              <button
                type="button"
                onClick={() => setShowInterviewModal(false)}
                disabled={Boolean(saving)}
                className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mx-4 mt-4 rounded border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 sm:mx-5">
                {error}
              </div>
            )}

            <div className="overflow-y-auto p-4 sm:p-5">
              <form onSubmit={scheduleInterview} className="space-y-4">
                <p className="text-xs font-semibold text-slate-400">
                  Schedule a dynamic interview with <span className="font-extrabold text-[#3f4254]">{candidate.name}</span> for the position of <span className="font-extrabold text-[#3f4254]">{job.title}</span>.
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

                {showMapPicker ? (
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
                ) : interviewLocationField && (
                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-slate-500">{interviewLocationField.label}</label>
                    <input
                      type="text"
                      placeholder={interviewLocationField.placeholder}
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
                    disabled={Boolean(saving)}
                    onClick={() => setShowInterviewModal(false)}
                    className="h-10 rounded-md bg-slate-100 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={Boolean(saving)}
                    className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white transition hover:bg-[#5848d8] disabled:opacity-60"
                  >
                    {saving === 'Interview' ? <Loader className="h-4 w-4 animate-spin" /> : 'Confirm Interview'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Resume Unlock Success Modal */}
      {unlockSuccessModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Resume Unlocked!</h3>
            <p className="mt-2 text-sm text-slate-500 font-semibold leading-relaxed">
              Candidate's resume has been successfully unlocked and downloaded.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <span>Remaining Unlocks:</span>
              <span className="font-extrabold">{unlockSuccessModal.remainingUnlocks}</span>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setUnlockSuccessModal({ show: false, remainingUnlocks: '' })}
                className="w-full h-11 rounded-xl bg-slate-900 text-white font-extrabold text-sm transition hover:bg-slate-800 shadow-md shadow-slate-900/10 cursor-pointer"
              >
                Awesome
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerApplicationDetails;
