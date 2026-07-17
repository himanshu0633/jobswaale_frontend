import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CalendarPlus,
  Check,
  Download,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  User,
  UserCheck,
  UserPlus,
  UserX
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const statusTone = {
  Applied: 'bg-emerald-50 text-emerald-600',
  Reviewed: 'bg-sky-50 text-sky-600',
  Shortlisted: 'bg-amber-50 text-amber-600',
  Interview: 'bg-violet-50 text-violet-600',
  Offered: 'bg-blue-50 text-blue-600',
  Rejected: 'bg-rose-50 text-rose-600'
};

const timelineSteps = ['Applied', 'Reviewed', 'Shortlisted', 'Interview', 'Offered'];

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

const EmployerApplicationDetails = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${BASE_API_URL}/employer/applications/${id}`, { headers: getTokenHeaders() });
      setApplication(response.data);
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
      setMessage(`Application ${status} successfully.`);
      await loadDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Status update failed.');
    } finally {
      setSaving('');
    }
  };

  const scheduleInterview = async () => {
    setSaving('Interview');
    setError('');
    setMessage('');
    try {
      await axios.post(
        `${BASE_API_URL}/employer/applications/${id}/schedule-interview`,
        { date: new Date().toISOString().slice(0, 10), time: '10:00', type: 'Video Call', status: 'Scheduled' },
        { headers: getTokenHeaders() }
      );
      setMessage('Interview scheduled successfully.');
      await loadDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Interview schedule failed.');
    } finally {
      setSaving('');
    }
  };

  const activeStepIndex = useMemo(() => {
    if (!application?.status) return 0;
    if (application.status === 'Rejected') return 0;
    return Math.max(timelineSteps.findIndex((step) => step === application.status), 0);
  }, [application?.status]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#6658dd] border-t-transparent" />
      </div>
    );
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
  const resumeHref = candidate.resume ? `${BASE_API_URL.replace(/\/api$/, '')}/${candidate.resume}` : '#';

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

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-sky-100 bg-sky-50 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#3f4254]">
          <span className={`rounded px-2.5 py-1 text-xs font-black ${statusTone[application.status] || statusTone.Applied}`}>{application.status}</span>
          <span className="inline-flex items-center gap-1"><User className="h-4 w-4" /><strong>{candidate.name}</strong></span>
          <span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.title}</span>
          <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />Applied: {application.appliedDisplayDate}</span>
        </div>
        <span className="rounded bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-600"><Star className="mr-1 inline h-3.5 w-3.5" />{application.matchScore}% Match</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton tone="bg-amber-400 text-white hover:bg-amber-500" icon={UserCheck} onClick={() => updateStatus('Shortlisted')} disabled={Boolean(saving)}>Shortlist</ActionButton>
        <ActionButton tone="bg-[#6658dd] text-white hover:bg-[#5848d8]" icon={CalendarPlus} onClick={scheduleInterview} disabled={Boolean(saving)}>Schedule Interview</ActionButton>
        <ActionButton tone="bg-emerald-500 text-white hover:bg-emerald-600" icon={UserPlus} onClick={() => updateStatus('Offered')} disabled={Boolean(saving)}>Select</ActionButton>
        <ActionButton tone="border border-rose-200 bg-white text-rose-600 hover:bg-rose-50" icon={UserX} onClick={() => updateStatus('Rejected')} disabled={Boolean(saving)}>Reject</ActionButton>
        <a href={resumeHref} target="_blank" rel="noreferrer" className={`inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 ${!candidate.resume ? 'pointer-events-none opacity-60' : ''}`}>
          <Download className="h-4 w-4" /> Download Resume
        </a>
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
              <Link to={`/employer/messages?application=${application.id}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-sky-200 px-3 py-2 text-xs font-extrabold text-sky-600 hover:bg-sky-50"><MessageCircle className="h-4 w-4" /> Send Message</Link>
            </div>
          </Card>

          <Card title="Application Timeline">
            <div className="space-y-4">
              {timelineSteps.map((step, index) => {
                const done = application.status === 'Rejected' ? step === 'Applied' : index <= activeStepIndex;
                return (
                  <div key={step} className="flex items-start gap-3">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${done ? 'bg-emerald-500' : 'bg-slate-300'}`}>{done ? <Check className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}</span>
                    <div><p className="text-sm font-extrabold text-[#3f4254]">{step === 'Offered' ? 'Selected / Hired' : step}</p><span className="text-xs font-semibold text-slate-400">{done ? (step === 'Applied' ? application.appliedDisplayDate : 'Completed') : 'Pending'}</span></div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Quick Actions">
            <div className="grid gap-2">
              <ActionButton tone="bg-amber-400 text-white hover:bg-amber-500" icon={UserCheck} onClick={() => updateStatus('Shortlisted')} disabled={Boolean(saving)}>Shortlist Candidate</ActionButton>
              <ActionButton tone="bg-[#6658dd] text-white hover:bg-[#5848d8]" icon={CalendarPlus} onClick={scheduleInterview} disabled={Boolean(saving)}>Schedule Interview</ActionButton>
              <ActionButton tone="bg-emerald-500 text-white hover:bg-emerald-600" icon={UserPlus} onClick={() => updateStatus('Offered')} disabled={Boolean(saving)}>Move to Selected</ActionButton>
              <ActionButton tone="border border-rose-200 bg-white text-rose-600 hover:bg-rose-50" icon={UserX} onClick={() => updateStatus('Rejected')} disabled={Boolean(saving)}>Reject Application</ActionButton>
              <a href={resumeHref} target="_blank" rel="noreferrer" className={`inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 ${!candidate.resume ? 'pointer-events-none opacity-60' : ''}`}><Download className="h-4 w-4" /> Download Resume</a>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default EmployerApplicationDetails;
