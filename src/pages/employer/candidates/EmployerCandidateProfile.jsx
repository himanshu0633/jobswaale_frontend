import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Bookmark,
  Briefcase,
  CalendarPlus,
  CheckCircle2,
  Download,
  Mail,
  MapPin,
  Phone,
  Star,
  UserCheck,
  UserPlus,
  UserX,
  Loader,
  X,
  Check,
  FileText,
  Clock,
  Send,
  MessageSquare
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import PageSkeleton from '../../../components/SkeletonLoader';
import InterviewLocationPicker from '../../../components/InterviewLocationPicker';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
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

const timelineSteps = ['Applied', 'Reviewed', 'Shortlisted', 'Interview', 'Offered'];
const actionStepIndex = {
  Shortlisted: 2,
  Interview: 3,
  Offered: 4
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

const Card = ({ title, children }) => (
  <section className="rounded-md border border-slate-100 bg-white shadow-sm">
    <div className="border-b border-dashed border-slate-200 px-5 py-4">
      <h2 className="text-base font-extrabold text-[#3f4254]">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const ActionButton = ({ tone, icon: Icon, children, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60 ${tone}`}
  >
    <Icon className="h-4 w-4" />
    {children}
  </button>
);

const ResumeDownloadLink = ({ candidate, onDownload, className }) => {
  if (!candidate.hasResume) return null;

  return (
    <button
      type="button"
      onClick={onDownload}
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 ${className || ''}`}
    >
      <Download className="h-4 w-4" /> Download Resume
    </button>
  );
};

const SkillBadge = ({ children, tone = 'bg-blue-50 text-blue-600' }) => (
  <span className={`mb-1 mr-1 inline-flex rounded px-2 py-1 text-xs font-black ${tone}`}>{children}</span>
);

const EmployerCandidateProfile = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    type: 'Video Call',
    locationOrLink: '',
    notes: '',
    onHold: false
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

  const openInterviewModal = () => {
    setError('');
    setMessage('');
    setInterviewForm({
      date: '',
      time: '',
      type: 'Video Call',
      locationOrLink: '',
      notes: '',
      onHold: false,
      manualAddress: ''
    });
    setShowInterviewModal(true);
  };

  const scheduleInterview = async (event) => {
    event.preventDefault();
    if (!interviewForm.onHold && (!interviewForm.date || !interviewForm.time)) {
      setError('Please specify interview date and time.');
      return;
    }
    if (!interviewForm.onHold) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (interviewForm.date <= todayStr) {
        setError('Interview cannot be scheduled or rescheduled for today or a past date. Please choose a future date.');
        return;
      }
    }
    setSaving('Interview');
    setError('');
    setMessage('');
    try {
      const payload = {
        ...interviewForm,
        locationOrLink: interviewForm.manualAddress || interviewForm.locationOrLink || ''
      };
      await axios.post(
        `${BASE_API_URL}/employer/applications/${candidate.application.id}/schedule-interview`,
        payload,
        { headers: getTokenHeaders() }
      );
      setShowInterviewModal(false);
      setInterviewForm({ date: '', time: '', type: 'Video Call', locationOrLink: '', notes: '', onHold: false, manualAddress: '' });
      setMessage(interviewForm.onHold ? 'Application moved to interview on hold.' : 'Interview scheduled successfully.');
      const response = await axios.get(`${BASE_API_URL}/employer/candidateProfile/${id}`, { headers: getTokenHeaders() });
      setCandidate(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Interview schedule failed.');
    } finally {
      setSaving('');
    }
  };

  const updateStatus = async (status) => {
    if (!candidate.application?.id) return;
    setSaving(status);
    setError('');
    setMessage('');
    try {
      await axios.patch(`${BASE_API_URL}/employer/applications/${candidate.application.id}/status`, { status }, { headers: getTokenHeaders() });
      setMessage(`Application ${status} successfully.`);
      const response = await axios.get(`${BASE_API_URL}/employer/candidateProfile/${id}`, { headers: getTokenHeaders() });
      setCandidate(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Status update failed.');
    } finally {
      setSaving('');
    }
  };

  const updateOfferStatus = async (offerStatus) => {
    if (!candidate.application?.id) return;
    setSaving('OfferStatus');
    setError('');
    setMessage('');
    try {
      await axios.patch(
        `${BASE_API_URL}/employer/applications/${candidate.application.id}/offer-status`,
        { offerStatus },
        { headers: getTokenHeaders() }
      );
      setMessage(`Offer status updated to ${offerStatus}.`);
      const response = await axios.get(`${BASE_API_URL}/employer/candidateProfile/${id}`, { headers: getTokenHeaders() });
      setCandidate(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update offer status.');
    } finally {
      setSaving('');
    }
  };

  const handleSaveToTalentPool = async () => {
    setSaving('TalentPool');
    setError('');
    setMessage('');
    try {
      if (candidate.talentPool) {
        await axios.delete(`${BASE_API_URL}/employer/talent-pool/${candidate.talentPool.id}`, { headers: getTokenHeaders() });
        setMessage('Candidate removed from talent pool.');
      } else {
        await axios.post(`${BASE_API_URL}/employer/talent-pool`, {
          candidateId: candidate.id,
          category: 'High Potential',
          skills: candidate.skills,
          note: 'Saved from candidate profile'
        }, { headers: getTokenHeaders() });
        setMessage('Candidate saved to talent pool.');
      }
      const response = await axios.get(`${BASE_API_URL}/employer/candidateProfile/${id}`, { headers: getTokenHeaders() });
      setCandidate(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update talent pool status.');
    } finally {
      setSaving('');
    }
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    axios.get(`${BASE_API_URL}/employer/candidateProfile/${id}`, { headers: getTokenHeaders() })
      .then((response) => {
        if (alive) {
          setCandidate(response.data);
          if (response.data.hasCandidateAccess === false) {
            setShowUpgradeModal(true);
          } else if (response.data.unlockLimitExhausted === true) {
            setShowLimitModal(true);
          } else if (response.data.autoUnlocked === true) {
            setUnlockSuccessModal({
              show: true,
              remainingUnlocks: response.data.remainingUnlocks ?? ''
            });
          }
        }
      })
      .catch((err) => {
        if (alive) setError(err.response?.data?.message || 'Candidate profile could not be loaded.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [id]);

  const quickActions = useMemo(() => {
    const list = [];
    if (!candidate || !candidate.application) return list;

    const status = candidate.application.status;
    const details = candidate.application.interviewDetails || {};
    const onHold = details.onHold;

    // 1. Mark as Applied
    list.push({
      key: 'Applied',
      label: 'Mark as Applied',
      tone: 'border border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50',
      icon: FileText,
      onClick: () => updateStatus('Applied')
    });

    // 2. Schedule / Reschedule Interview
    const isInterview = status === 'Interview';
    list.push({
      key: 'InterviewSchedule',
      label: (isInterview && !onHold) ? 'Reschedule Interview' : 'Schedule Interview',
      tone: 'bg-[#6658dd] text-white hover:bg-[#5848d8]',
      icon: CalendarPlus,
      onClick: openInterviewModal
    });

    // 3. On Hold for Interview
    list.push({
      key: 'InterviewOnHold',
      label: 'On Hold for Interview',
      tone: 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
      icon: Clock,
      onClick: async () => {
        setSaving('InterviewOnHold');
        setError('');
        setMessage('');
        try {
          await axios.post(
            `${BASE_API_URL}/employer/applications/${candidate.application.id}/schedule-interview`,
            {
              onHold: true,
              type: candidate.application.interviewDetails?.type || 'Video Call',
              notes: candidate.application.interviewDetails?.notes || 'Interview kept on hold.'
            },
            { headers: getTokenHeaders() }
          );
          setMessage('Application moved to interview on hold.');
          const response = await axios.get(`${BASE_API_URL}/employer/candidateProfile/${id}`, { headers: getTokenHeaders() });
          setCandidate(response.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to move application to interview on hold.');
        } finally {
          setSaving('');
        }
      }
    });

    // 4. Select
    list.push({
      key: 'Offered',
      label: 'Select',
      tone: 'bg-emerald-500 text-white hover:bg-emerald-600',
      icon: UserPlus,
      onClick: () => updateStatus('Offered')
    });

    // 5. Offer Sent
    list.push({
      key: 'OfferSent',
      label: 'Offer Sent',
      tone: 'bg-[#6658dd] text-white hover:bg-[#5848d8]',
      icon: Send,
      onClick: () => updateOfferStatus('Offer Sent')
    });

    // 6. Accept
    list.push({
      key: 'OfferAccept',
      label: 'Accept',
      tone: 'bg-cyan-500 text-white hover:bg-cyan-600',
      icon: Check,
      onClick: () => updateOfferStatus('Offer Accepted')
    });

    // 7. Hire
    list.push({
      key: 'Hire',
      label: 'Hire',
      tone: 'bg-emerald-500 text-white hover:bg-emerald-600',
      icon: Briefcase,
      onClick: () => updateOfferStatus('Hired')
    });

    // 8. Reject
    list.push({
      key: 'Rejected',
      label: 'Reject',
      tone: 'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50',
      icon: UserX,
      onClick: () => updateStatus('Rejected')
    });

    return list;
  }, [candidate]);

  if (loading) {
    return <PageSkeleton variant="detail" />;
  }

  if (!candidate) {
    return <div className="rounded-md border border-rose-100 bg-rose-50 p-6 text-sm font-bold text-rose-700">{error || 'Candidate not found.'}</div>;
  }

  const matchScore = candidate.application?.matchScore || 0;

  let availableActions = [];
  const appStatus = candidate.application?.status;
  if (appStatus === 'Applied' || appStatus === 'Reviewed') {
    availableActions = [
      {
        status: 'Shortlisted',
        label: 'Shortlist',
        tone: 'bg-amber-400 text-white hover:bg-amber-500',
        icon: UserCheck,
        onClick: () => updateStatus('Shortlisted')
      }
    ];
  } else if (appStatus === 'Shortlisted') {
    availableActions = [
      {
        status: 'Interview',
        label: 'Schedule Interview',
        tone: 'bg-[#6658dd] text-white hover:bg-[#5848d8]',
        icon: CalendarPlus,
        onClick: openInterviewModal
      }
    ];
  } else if (appStatus === 'Interview') {
    availableActions = [
      {
        status: 'Offered',
        label: 'Select',
        tone: 'bg-emerald-500 text-white hover:bg-emerald-600',
        icon: UserPlus,
        onClick: () => updateStatus('Offered')
      }
    ];
  }

  const canReject = candidate.application && ['Applied', 'Reviewed', 'Shortlisted', 'Interview'].includes(appStatus);

  const interviewLocationField = getInterviewLocationField(interviewForm.type);
  const showMapPicker = isInPersonInterview(interviewForm.type);

  const handleResumeDownload = () => {
    if (candidate.hasCandidateAccess === false) {
      setShowUpgradeModal(true);
      return;
    }
    if (candidate.unlockLimitExhausted === true) {
      setShowLimitModal(true);
      return;
    }
    if (candidate.hasResume && !candidate.allowResumeDownload) {
      setShowUpgradeModal(true);
      return;
    }
    downloadCandidateResume(candidate);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <Link to={candidate.application?.id ? `/employer/applications/${candidate.application.id}` : '/employer/applications'} className="mb-2 inline-flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-[#6658dd]">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-xl font-extrabold text-[#3f4254]">Candidate Profile</h1>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400"><span className="text-[#3f4254]">JobsWaale</span><span>/</span><span>Applications</span><span>/</span><span>{candidate.name}</span></div>
      </div>

      {error && <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}

      {message && <div className="rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div>}

      <div className="flex flex-wrap items-center gap-2">
        {candidate.application ? (
          <>
            <ActionButton
              tone="bg-[#6658dd] text-white hover:bg-[#5848d8]"
              icon={CalendarPlus}
              onClick={openInterviewModal}
              disabled={Boolean(saving)}
            >
              {(candidate.application.status === 'Interview' && !candidate.application.interviewDetails?.onHold) ? 'Reschedule Interview' : 'Schedule Interview'}
            </ActionButton>

            <ActionButton
              tone="border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
              icon={Clock}
              onClick={async () => {
                setSaving('InterviewOnHold');
                setError('');
                setMessage('');
                try {
                  await axios.post(
                    `${BASE_API_URL}/employer/applications/${candidate.application.id}/schedule-interview`,
                    {
                      onHold: true,
                      type: candidate.application.interviewDetails?.type || 'Video Call',
                      notes: candidate.application.interviewDetails?.notes || 'Interview kept on hold.'
                    },
                    { headers: getTokenHeaders() }
                  );
                  setMessage('Application moved to interview on hold.');
                  const response = await axios.get(`${BASE_API_URL}/employer/candidateProfile/${id}`, { headers: getTokenHeaders() });
                  setCandidate(response.data);
                } catch (err) {
                  setError(err.response?.data?.message || 'Failed to move application to interview on hold.');
                } finally {
                  setSaving('');
                }
              }}
              disabled={Boolean(saving)}
            >
              On Hold for Interview
            </ActionButton>

            <ActionButton
              tone="border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
              icon={UserX}
              onClick={() => updateStatus('Rejected')}
              disabled={Boolean(saving)}
            >
              Reject
            </ActionButton>
          </>
        ) : (
          availableActions.map((action) => (
            <ActionButton key={action.status} tone={action.tone} icon={action.icon} onClick={action.onClick} disabled={Boolean(saving)}>
              {action.label}
            </ActionButton>
          ))
        )}

        <ActionButton
          tone={candidate.talentPool ? 'bg-slate-600 text-white hover:bg-slate-700' : 'bg-slate-500 text-white hover:bg-slate-600'}
          icon={Bookmark}
          onClick={handleSaveToTalentPool}
          disabled={Boolean(saving)}
        >
          {candidate.talentPool ? 'Saved to Talent Pool' : 'Save to Talent Pool'}
        </ActionButton>

        {!candidate.application && (
          <button
            type="button"
            onClick={handleResumeDownload}
            disabled={Boolean(saving)}
            className={`inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 ${!candidate.hasResume ? 'pointer-events-none opacity-60' : ''}`}
          >
            <Download className="h-4 w-4" /> Download Resume
          </button>
        )}
      </div>

      {candidate.application && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
          <Link to={`/employer/messages?application=${candidate.application.id}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-sky-200 bg-white px-3 py-2 text-xs font-extrabold text-sky-600 hover:bg-sky-50 w-full">
            <MessageSquare className="h-4 w-4" /> Send Message
          </Link>
          <ResumeDownloadLink candidate={candidate} onDownload={handleResumeDownload} className="w-full" />
        </div>
      )}

      <section className="rounded-md border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <span className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${candidate.avatarTone || 'from-violet-200 to-pink-200'} text-2xl font-black text-[#3f4254] ring-4 ring-white`}>
            {candidate.initials}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-black text-[#3f4254]">{candidate.name}</h2>
            <p className="mt-1 text-base font-semibold text-slate-400">{candidate.designation || candidate.role}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{candidate.location}</span>
              <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" />{candidate.email || 'N/A'}</span>
              <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4" />{candidate.phone || 'N/A'}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-600"><Star className="mr-1 inline h-3.5 w-3.5" />{matchScore}% Match</span>
              <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-600">{candidate.noticePeriod}</span>
              {candidate.linkedin && <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="rounded bg-sky-50 px-2 py-1 text-xs font-black text-sky-600">LinkedIn</a>}
              {candidate.github && <a href={candidate.github} target="_blank" rel="noreferrer" className="rounded bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">GitHub</a>}
            </div>
          </div>
        </div>
        <div className="my-5 border-t border-slate-100" />
        <div className="grid gap-4 text-center sm:grid-cols-2 xl:grid-cols-4">
          <div><h3 className="text-lg font-black text-[#3f4254]">{candidate.experience}</h3><span className="text-sm font-semibold text-slate-400">Total Experience</span></div>
          <div><h3 className="text-lg font-black text-[#3f4254]">{candidate.currentSalary}</h3><span className="text-sm font-semibold text-slate-400">Current CTC</span></div>
          <div><h3 className="text-lg font-black text-[#3f4254]">{candidate.expectedSalary}</h3><span className="text-sm font-semibold text-slate-400">Expected CTC</span></div>
          <div><h3 className="text-lg font-black text-[#3f4254]">{candidate.noticePeriod}</h3><span className="text-sm font-semibold text-slate-400">Notice Period</span></div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card title="Professional Summary">
            <p className="text-sm leading-6 text-slate-600">{candidate.bio}</p>
          </Card>

          <Card title="Work Experience">
            {(candidate.workExperience || []).map((item, index) => (
              <div key={`${item.title}-${index}`} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between gap-4">
                  <div><h3 className="text-sm font-extrabold text-[#3f4254]">{item.title}</h3><p className="text-xs font-semibold text-slate-400">{item.company}</p><p className="text-xs font-semibold text-slate-400">{item.location}</p></div>
                  <span className="text-xs font-semibold text-slate-400">{item.period}</span>
                </div>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {(item.points || []).map((point) => <li key={point}>{point}</li>)}
                </ul>
              </div>
            ))}
          </Card>

          <Card title="Education">
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

          <Card title="Certifications">
            {(candidate.certifications || []).map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><CheckCircle2 className="h-5 w-5" /></span>
                <div><h3 className="text-sm font-extrabold text-[#3f4254]">{item.title}</h3><p className="text-xs font-semibold text-slate-400">{item.issuer} · {item.year}</p></div>
              </div>
            ))}
          </Card>
        </div>

        <aside className="space-y-5">
          {candidate.application && (
            <Card title="Quick Actions">
              <div className="grid gap-2">
                {quickActions.map((action) => (
                  <ActionButton key={action.key} tone={action.tone} icon={action.icon} onClick={action.onClick} disabled={Boolean(saving)}>
                    {action.label}
                  </ActionButton>
                ))}
                <ResumeDownloadLink candidate={candidate} onDownload={handleResumeDownload} />
              </div>
            </Card>
          )}

          <Card title="Skills">
            <div className="mb-4">
              <label className="mb-2 block text-[11px] font-black uppercase text-slate-400">Frontend</label>
              <div>{(candidate.frontendSkills || candidate.skills || []).map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}</div>
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-[11px] font-black uppercase text-slate-400">Backend</label>
              <div>{(candidate.backendSkills || []).map((skill) => <SkillBadge key={skill} tone="bg-emerald-50 text-emerald-600">{skill}</SkillBadge>)}</div>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase text-slate-400">Tools & Platforms</label>
              <div>{(candidate.toolSkills || []).map((skill) => <SkillBadge key={skill} tone="bg-sky-50 text-sky-600">{skill}</SkillBadge>)}</div>
            </div>
          </Card>

          <Card title="Languages">
            <div className="space-y-3">
              {(candidate.languages || []).map((language, index) => (
                <div key={language} className="flex items-center justify-between text-sm font-semibold text-[#3f4254]">
                  <span>{language}</span>
                  <span className={`rounded px-2 py-1 text-xs font-black ${index === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'}`}>{index === 0 ? 'Fluent' : 'Native'}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Application Details">
            <div className="space-y-3 text-sm font-semibold text-slate-600">
              <p className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-slate-400" />Applied For: {candidate.application?.jobTitle || 'N/A'}</p>
              <p className="flex items-center gap-2"><Star className="h-4 w-4 text-slate-400" />Match Score: {matchScore}%</p>
              <p>Status: <span className="rounded bg-blue-50 px-2 py-1 text-xs font-black text-blue-600">{candidate.application?.status || 'Available'}</span></p>
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
                  Schedule a dynamic interview with <span className="font-extrabold text-[#3f4254]">{candidate.name}</span> for the position of <span className="font-extrabold text-[#3f4254]">{candidate.application?.jobTitle || 'Applied Job'}</span>.
                </p>

                <label className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-3 transition ${interviewForm.onHold ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                  <input
                    type="checkbox"
                    checked={interviewForm.onHold}
                    onChange={(event) => setInterviewForm({ ...interviewForm, onHold: event.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#6658dd] focus:ring-[#6658dd]"
                  />
                  <span>
                    <span className="block text-sm font-extrabold text-[#3f4254]">On Hold</span>
                    <span className="mt-0.5 block text-xs font-semibold text-slate-500">Move this candidate to the interview stage now. You can add the schedule details later from the Interviews page.</span>
                  </span>
                </label>

                {!interviewForm.onHold && (
                  <>
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
                            onChange={(locationOrLink) => setInterviewForm(prev => ({ ...prev, locationOrLink }))}
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
                  </>
                )}

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
                    {saving === 'Interview' ? <Loader className="h-4 w-4 animate-spin" /> : interviewForm.onHold ? 'Mark On Hold' : 'Confirm Interview'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-4">
          <div className="relative w-full max-w-md rounded-lg border border-slate-100 bg-white p-6 shadow-xl text-center">
            <h3 className="text-lg font-extrabold text-slate-800">Upgrade Plan Required</h3>
            <p className="mt-3 text-sm text-slate-500 font-semibold leading-relaxed">
              Candidate contact details and resume downloads are not supported under your current plan. Please upgrade your plan to access candidate details.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link
                to="/employer/subscription"
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#6658dd] px-6 text-sm font-extrabold text-white transition hover:bg-[#5848d8]"
              >
                Upgrade Plan
              </Link>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="h-10 rounded-md bg-slate-100 px-6 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Limit Exhausted Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-4">
          <div className="relative w-full max-w-md rounded-lg border border-slate-100 bg-white p-6 shadow-xl text-center">
            <h3 className="text-lg font-extrabold text-slate-800">Unlock Limit Exhausted</h3>
            <p className="mt-3 text-sm text-slate-500 font-semibold leading-relaxed">
              Your plan's resume unlock limit is exhausted. Please upgrade your plan to view more candidates' details or download resumes.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link
                to="/employer/subscription"
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#6658dd] px-6 text-sm font-extrabold text-white transition hover:bg-[#5848d8]"
              >
                Upgrade Plan
              </Link>
              <button
                type="button"
                onClick={() => setShowLimitModal(false)}
                className="h-10 rounded-md bg-slate-100 px-6 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Unlock Success Modal */}
      {unlockSuccessModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Candidate Profile Unlocked!</h3>
            <p className="mt-2 text-sm text-slate-500 font-semibold leading-relaxed">
              Candidate contact details and resume access are now available.
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

export default EmployerCandidateProfile;
