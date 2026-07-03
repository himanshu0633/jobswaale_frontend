import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  ArrowRight,
  Briefcase,
  CalendarCheck,
  Check,
  ChevronRight,
  Clock,
  Crown,
  Download,
  Eye,
  FileText,
  Plus,
  Search,
  UserCheck,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BASE_API_URL } from '../../../context/AuthContext';

const emptyDashboard = {
  company: {},
  subscription: {},
  actionCenter: {},
  pipeline: {},
  activeJobs: [],
  latestApplications: [],
  upcomingInterviews: [],
  recentActivity: []
};

const formatDate = (value, fallback = '-') => {
  if (!value) return fallback;
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
};

const actionConfig = [
  { key: 'newApplications', title: 'New Applications', subtitle: 'Need Review', action: 'View all', to: '/employer/applications', icon: FileText, tone: 'bg-[#f3f0ff] text-[#6658dd]', card: 'bg-[#f7f4ff]' },
  { key: 'interviews', title: 'Interviews', subtitle: 'To Confirm', action: 'View schedule', to: '/employer/interviews', icon: CalendarCheck, tone: 'bg-amber-50 text-amber-500', card: 'bg-[#fff9ef]' },
  { key: 'candidates', title: 'Candidates', subtitle: 'Ready for Selection', action: 'View list', to: '/employer/shortlisted', icon: UserCheck, tone: 'bg-emerald-50 text-emerald-500', card: 'bg-[#f0fbf7]' },
  { key: 'jobsExpiring', title: 'Jobs Expiring', subtitle: 'Tomorrow', action: 'Renew now', to: '/employer/jobs', icon: Clock, tone: 'bg-rose-50 text-rose-500', card: 'bg-[#fff3f5]' }
];

const quickActions = [
  { title: 'Post a Job', subtitle: 'Post a new job opening', to: '/employer/jobs/create', icon: Plus, tone: 'bg-[#e8e6fa] text-[#6658dd]' },
  { title: 'Review Applications', subtitle: 'View and manage job applications', to: '/employer/applications', icon: FileText, tone: 'bg-emerald-50 text-emerald-500' },
  { title: 'Search Candidates', subtitle: 'Find and connect with potential hires', to: '/employer/candidates', icon: Search, tone: 'bg-sky-50 text-sky-500' },
  { title: 'Schedule Interview', subtitle: 'Manage and organize your interviews', to: '/employer/interviews', icon: CalendarCheck, tone: 'bg-amber-50 text-amber-500' },
  { title: 'Download Report', subtitle: 'Access and download your reports', to: '/employer/reports', icon: Download, tone: 'bg-blue-50 text-blue-500' },
  { title: 'Upgrade Plan', subtitle: 'Enhance your experience', to: '/employer/subscription', icon: Crown, tone: 'bg-rose-50 text-rose-500' }
];

const pipelineRows = [
  { key: 'applied', title: 'Applied', icon: FileText, tone: 'bg-[#6658dd]' },
  { key: 'underReview', title: 'Under Review', icon: Eye, tone: 'bg-sky-500' },
  { key: 'shortlisted', title: 'Shortlisted', icon: UserCheck, tone: 'bg-emerald-500' },
  { key: 'interview', title: 'Interview', icon: CalendarCheck, tone: 'bg-amber-500' },
  { key: 'selected', title: 'Selected', icon: Check, tone: 'bg-slate-500' },
  { key: 'notSelected', title: 'Not Selected', icon: X, tone: 'bg-rose-500' }
];

const activityIcon = {
  application: FileText,
  shortlisted: UserCheck,
  interview: CalendarCheck,
  job: Briefcase,
  expiry: Clock
};

export const EmployerDashboard = () => {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('publicToken');
        const response = await axios.get(`${BASE_API_URL}/employer/dashboard`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setDashboard({ ...emptyDashboard, ...response.data });
      } catch (err) {
        setError(err.response?.data?.message || 'Dashboard data could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const subscription = dashboard.subscription || {};
  const pipelineTotal = useMemo(() => {
    return Object.values(dashboard.pipeline || {}).reduce((sum, value) => sum + Number(value || 0), 0) || 1;
  }, [dashboard.pipeline]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#6658dd] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-xl font-extrabold text-[#3f4254]">Employer Dashboard</h1>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
          <span className="text-[#3f4254]">JobsWaale</span>
          <ChevronRight className="h-4 w-4" />
          <span>Dashboard</span>
        </div>
      </div>

      <section className="rounded-md border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-400">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-base font-extrabold text-[#3f4254]">{subscription.planName || 'Premium Plan'}</h2>
                <span className="inline-flex items-center rounded bg-emerald-500 px-2 py-1 text-xs font-black text-white">{subscription.status || 'Active'}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-400">
                Valid until: <span className="font-extrabold text-[#3f4254]">{formatDate(subscription.validUntil, 'Not assigned')}</span>
              </p>
              <div className="mt-4 grid max-w-[680px] gap-5 sm:grid-cols-[95px_125px_300px]">
                <div>
                  <p className="text-sm font-bold text-slate-400">Jobs Used</p>
                  <p className="mt-1 text-sm font-extrabold text-[#3f4254]">{subscription.jobsUsed || 0} <span className="text-slate-400">/ {subscription.jobLimit || 0}</span></p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400">Remaining Credits</p>
                  <p className="mt-1 text-sm font-extrabold text-emerald-500">{subscription.remainingCredits || 0}</p>
                </div>
                <div className="pt-3">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-[#6658dd]" style={{ width: `${subscription.utilization || 0}%` }} />
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-400">{subscription.utilization || 0}% utilized</p>
                </div>
              </div>
            </div>
          </div>
          <Link to="/employer/subscription" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-5 text-[13px] font-extrabold text-white shadow-md shadow-indigo-600/10 transition hover:bg-[#5848d8]">
            <Crown className="h-4 w-4" />
            Upgrade Plan
          </Link>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.42fr_1fr]">
        <section className="rounded-md border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-dashed border-slate-200 px-5 py-4">
            <h2 className="text-lg font-extrabold text-[#3f4254]">Action Center</h2>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            {actionConfig.map((item) => (
              <div key={item.key} className={`rounded-md border border-slate-100 p-5 ${item.card}`}>
                <div className="flex items-start gap-5">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#3f4254]">{dashboard.actionCenter?.[item.key] || 0}</p>
                    <h3 className="mt-1.5 text-base font-extrabold text-[#3f4254]">{item.title}</h3>
                    <p className="mt-2 text-sm font-semibold text-[#3f4254]">{item.subtitle}</p>
                    <Link to={item.to} className={`mt-5 inline-flex items-center gap-2 text-sm font-extrabold ${item.tone.split(' ')[1]}`}>
                      {item.action} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-dashed border-slate-200 px-5 py-4">
            <h2 className="text-lg font-extrabold text-[#3f4254]">Quick Actions</h2>
          </div>
          <div className="p-5">
            {quickActions.map((item) => (
              <Link key={item.title} to={item.to} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition hover:bg-slate-50">
                <span className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold text-slate-900">{item.title}</span>
                    <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">{item.subtitle}</span>
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-800" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-md border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-dashed border-slate-200 px-6 py-5">
          <h2 className="text-lg font-extrabold text-[#3f4254]">Your Active Jobs</h2>
          <Link to="/employer/jobs" className="text-sm font-extrabold text-[#6658dd]">View All Jobs <ArrowRight className="inline h-4 w-4" /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Applications</th>
                <th className="px-6 py-4">Shortlisted</th>
                <th className="px-6 py-4">Interviews</th>
                <th className="px-6 py-4">Selected</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(dashboard.activeJobs || []).map((job) => (
                <tr key={job.id} className="text-sm">
                  <td className="px-6 py-4">
                    <p className="font-extrabold text-slate-800">{job.title}</p>
                    <p className="text-xs font-semibold text-slate-400">{job.location || '-'} • {job.workMode || '-'}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600">{job.applications}</td>
                  <td className="px-6 py-4 font-bold text-slate-600">{job.shortlisted}</td>
                  <td className="px-6 py-4 font-bold text-slate-600">{job.interviews}</td>
                  <td className="px-6 py-4 font-bold text-slate-600">{job.selected}</td>
                  <td className="px-6 py-4"><span className="rounded bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-600">{job.status}</span></td>
                </tr>
              ))}
              {dashboard.activeJobs?.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-sm font-bold text-slate-400">No jobs posted yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-7 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-md border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-dashed border-slate-200 px-6 py-5">
            <h2 className="text-lg font-extrabold text-[#3f4254]">Hiring Pipeline</h2>
          </div>
          <div className="p-6">
            {pipelineRows.map((row) => {
              const value = dashboard.pipeline?.[row.key] || 0;
              const percent = Math.round((value / pipelineTotal) * 100);
              return (
                <div key={row.key} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${row.tone}`}><row.icon className="h-4 w-4" /></span>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">{row.title}</p>
                      <p className="text-xs font-semibold text-slate-400">{value} Candidates</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-slate-700">{value} <span className="text-xs text-slate-400">({percent}%)</span></p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-md border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-dashed border-slate-200 px-6 py-5">
            <h2 className="text-lg font-extrabold text-[#3f4254]">Latest Applications</h2>
            <Link to="/employer/applications" className="text-sm font-extrabold text-[#6658dd]">View All <ArrowRight className="inline h-4 w-4" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4">Applied</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(dashboard.latestApplications || []).map((item) => (
                  <tr key={item.id} className="text-sm">
                    <td className="px-6 py-4"><p className="font-extrabold text-slate-800">{item.candidateName}</p><p className="text-xs text-slate-400">{item.email}</p></td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{item.position}</td>
                    <td className="px-6 py-4 font-semibold text-slate-400">{formatDate(item.appliedAt)}</td>
                    <td className="px-6 py-4"><span className="rounded bg-indigo-50 px-2 py-1 text-xs font-black text-indigo-600">{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="grid gap-7 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-md border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-dashed border-slate-200 px-6 py-5">
            <h2 className="text-lg font-extrabold text-[#3f4254]">Upcoming Interviews</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {(dashboard.upcomingInterviews || []).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div>
                  <p className="text-sm font-extrabold text-slate-800">{item.candidateName}</p>
                  <p className="text-xs font-semibold text-slate-400">{item.position}</p>
                </div>
                <p className="text-xs font-bold text-slate-500">{formatDate(item.scheduledAt)}</p>
                <div className="flex gap-2">
                  <button type="button" className="rounded bg-emerald-500 p-2 text-white"><Check className="h-4 w-4" /></button>
                  <button type="button" className="rounded bg-slate-100 p-2 text-slate-600"><Eye className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-dashed border-slate-200 px-6 py-5">
            <h2 className="text-lg font-extrabold text-[#3f4254]">Recent Activity</h2>
          </div>
          <div className="divide-y divide-slate-100 p-6">
            {(dashboard.recentActivity || []).map((item, index) => {
              const Icon = activityIcon[item.type] || FileText;
              return (
                <div key={`${item.title}-${index}`} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[#6658dd]"><Icon className="h-4 w-4" /></span>
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">{item.title}</p>
                    <p className="text-xs font-semibold text-slate-500">{item.description}</p>
                    <p className="mt-1 text-[11px] font-bold text-slate-400">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmployerDashboard;
