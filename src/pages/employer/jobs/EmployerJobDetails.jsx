import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Briefcase,
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
  Users
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

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
  Expiring: 'border-rose-100 bg-rose-50 text-rose-700',
  Paused: 'border-slate-200 bg-slate-100 text-slate-600',
  Closed: 'border-slate-200 bg-slate-100 text-slate-600'
};

const statCards = [
  { key: 'applications', title: 'Total Applications', icon: FileText, tone: 'bg-indigo-50 text-[#6658dd]' },
  { key: 'shortlisted', title: 'Shortlisted', icon: UserCheck, tone: 'bg-amber-50 text-amber-500' },
  { key: 'interviews', title: 'Interviews', icon: Calendar, tone: 'bg-sky-50 text-sky-500' },
  { key: 'selected', title: 'Selected / Hired', icon: UserPlus, tone: 'bg-emerald-50 text-emerald-500' }
];

const applicantTone = {
  Applied: 'bg-emerald-50 text-emerald-600',
  Shortlisted: 'bg-amber-50 text-amber-600',
  Interview: 'bg-indigo-50 text-[#6658dd]',
  Reviewed: 'bg-sky-50 text-sky-600',
  Rejected: 'bg-rose-50 text-rose-600'
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

  const loadDetails = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${BASE_API_URL}/employer/jobs/${id}`, { headers: getTokenHeaders() });
      setDetails({ ...emptyDetails, ...response.data });
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
      setMessage('Job duplicate ho gaya. Copy draft me save ho gayi hai.');
      if (copiedId) {
        window.setTimeout(() => navigate(`/employer/jobs/${copiedId}/edit`), 500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Job duplicate nahi ho paya.');
    } finally {
      setDuplicating(false);
    }
  };
  const runJobAction = async (action) => {
    if (action === 'close' && !window.confirm('Kya aap is job ko close karna chahte hain?')) {
      return;
    }

    setActionState(action);
    setMessage('');
    try {
      await axios.patch(`${BASE_API_URL}/employer/jobs/${id}/action`, { action }, { headers: getTokenHeaders() });
      const messages = {
        pause: 'Job pause ho gayi.',
        close: 'Job close ho gayi.',
        reopen: 'Job reopen ho gayi.',
        renew: 'Job renew ho gayi.'
      };
      setMessage(messages[action] || 'Job update ho gayi.');
      await loadDetails({ silent: true });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Job action complete nahi ho paya.');
    } finally {
      setActionState('');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-[#6658dd]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
        {error}
      </div>
    );
  }

  const totalApplications = Number(details.stats?.applications || 0) || 1;
  const pipeline = [
    { key: 'applications', title: 'Applied', icon: FileText, tone: 'bg-emerald-500' },
    { key: 'reviewed', title: 'Reviewed', icon: Eye, tone: 'bg-sky-500' },
    { key: 'shortlisted', title: 'Shortlisted', icon: UserCheck, tone: 'bg-amber-500' },
    { key: 'interviews', title: 'Interviews', icon: Calendar, tone: 'bg-[#6658dd]' },
    { key: 'selected', title: 'Selected / Hired', icon: UserPlus, tone: 'bg-emerald-500' }
  ];

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
        <Link to="/employer/applications" className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-3 py-2 text-sm font-extrabold text-white"><FileText className="h-4 w-4" /> View Applications</Link>
        <button type="button" onClick={duplicateJob} disabled={duplicating} className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-sm font-extrabold text-white disabled:opacity-60">{duplicating ? <Loader className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />} Duplicate</button>
        {details.status === 'Closed' || details.status === 'Paused' ? (
          <button type="button" onClick={() => runJobAction('reopen')} disabled={Boolean(actionState)} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-extrabold text-white disabled:opacity-60">{actionState === 'reopen' ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Reopen Job</button>
        ) : details.status === 'Expiring' ? (
          <button type="button" onClick={() => runJobAction('renew')} disabled={Boolean(actionState)} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-extrabold text-white disabled:opacity-60">{actionState === 'renew' ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Renew Job</button>
        ) : (
          <button type="button" onClick={() => runJobAction('pause')} disabled={Boolean(actionState)} className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-3 py-2 text-sm font-extrabold text-white disabled:opacity-60">{actionState === 'pause' ? <Loader className="h-4 w-4 animate-spin" /> : <Pause className="h-4 w-4" />} Pause Job</button>
        )}
        {details.status !== 'Closed' && (
          <button type="button" onClick={() => runJobAction('close')} disabled={Boolean(actionState)} className="inline-flex items-center gap-2 rounded-md bg-rose-500 px-3 py-2 text-sm font-extrabold text-white disabled:opacity-60">{actionState === 'close' ? <Loader className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Mark as Closed</button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <section key={card.key} className="rounded-md border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`flex h-12 w-12 items-center justify-center rounded-full ${card.tone}`}>
                <card.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-400">{card.title}</p>
                <p className="mt-1 text-2xl font-black text-[#3f4254]">{details.stats?.[card.key] || 0}</p>
              </div>
            </div>
          </section>
        ))}
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
              <div className="flex justify-between"><span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> Total Views</span><strong>{details.views || 0}</strong></div>
              <div className="flex justify-between"><span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> Total Impressions</span><strong>{details.impressions || 0}</strong></div>
              <div className="flex justify-between"><span className="inline-flex items-center gap-1"><FileText className="h-4 w-4" /> Applications</span><strong>{details.stats?.applications || 0}</strong></div>
              <div className="flex justify-between"><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Match Avg. Score</span><strong>76%</strong></div>
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
          <Link to="/employer/applications" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white">
            <Eye className="h-4 w-4" />
            View All Applications
          </Link>
        </div>
        <div className="overflow-x-auto p-5">
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
              {(details.recentApplicants || []).map((candidate) => (
                <tr key={candidate.id}>
                  <td className="px-4 py-4">
                    <p className="text-sm font-extrabold text-slate-800">{candidate.name}</p>
                    <p className="text-xs font-semibold text-slate-400">{candidate.email}</p>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-500">{formatDate(candidate.appliedAt)}</td>
                  <td className="px-4 py-4"><span className="rounded bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-600">{candidate.matchScore}%</span></td>
                  <td className="px-4 py-4"><span className={`rounded px-2 py-1 text-xs font-black ${applicantTone[candidate.status] || applicantTone.Applied}`}>{candidate.status}</span></td>
                  <td className="px-4 py-4 text-right"><button type="button" className="rounded border border-slate-200 p-2 text-[#6658dd]"><Eye className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default EmployerJobDetails;
