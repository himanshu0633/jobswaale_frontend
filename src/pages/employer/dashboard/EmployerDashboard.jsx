import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Briefcase,
  Send,
  Clock,
  Users,
  Star,
  Calendar,
  UserCheck,
  Mail,
  XCircle,
  Search,
  ChevronRight,
  Eye,
  MoreVertical,
  SlidersHorizontal,
  Plus,
  Crown,
  FileText,
  Pause
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_API_URL } from '../../../context/AuthContext';
import PageSkeleton from '../../../components/SkeletonLoader';

const emptyDashboard = {
  stats: {
    jobs: { total: 0, active: 0, draft: 0, expired: 0, closed: 0 },
    applications: 0,
    reviewed: 0,
    shortlisted: 0,
    interviews: 0,
    selected: 0,
    offered: 0,
    rejected: 0,
    expired: 0
  },
  pipeline: {
    active: 0,
    applied: 0,
    reviewed: 0,
    shortlisted: 0,
    interview: 0,
    onHold: 0,
    selected: 0,
    offered: 0,
    rejected: 0,
    expired: 0
  },
  activeJobs: [],
  upcomingInterviews: [],
  subscription: {}
};

const formatDate = (value, fallback = '-') => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
};

const normalizeTime = (value) => {
  if (!value) return '-';
  const raw = String(value).trim();
  if (!raw) return '-';
  if (/[ap]m/i.test(raw)) return raw.toUpperCase();

  const [hourPart, minutePart = '0'] = raw.split(':');
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return raw;

  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const JobStatLabel = ({ children, tooltip }) => (
  <span className="group relative mt-1 inline-flex cursor-help justify-end text-xs font-semibold text-slate-400">
    {children}
    <span
      role="tooltip"
      className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-56 -translate-x-1/2 rounded-md bg-slate-900 px-3 py-2 text-left text-[11px] font-semibold leading-4 text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100"
    >
      {tooltip}
    </span>
  </span>
);

export const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state for table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [activeMenuJobId, setActiveMenuJobId] = useState(null);

  useEffect(() => {
    let alive = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('publicToken');
        const response = await axios.get(`${BASE_API_URL}/employer/dashboard`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (alive) {
          setDashboard({ ...emptyDashboard, ...response.data });
        }
      } catch (err) {
        if (alive) {
          setError(err.response?.data?.message || 'Dashboard data could not be loaded.');
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      alive = false;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    return (dashboard.activeJobs || []).filter(job => {
      const matchesSearch = String(job.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [dashboard.activeJobs, searchTerm, statusFilter]);

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  const subscription = dashboard.subscription || {};
  const upcomingInterviews = dashboard.upcomingInterviews || [];

  return (
    <div className="space-y-6 px-3 sm:px-0" style={{ fontFamily: "'Inter', sans-serif" }}>
      {error && (
        <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* Header section with page title */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
        <h1 className="text-xl font-extrabold text-[#111827] sm:text-2xl">Dashboard Overview</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 sm:text-sm">
          <span className="text-[#3f4254]">JobsWaale</span>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <span className="text-slate-500">Dashboard</span>
        </div>
      </div>

      {/* Subscription card */}
      <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <Crown className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                {/* Plan Info */}
                <div className="min-w-0 shrink-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="text-base font-extrabold text-[#111827]">{subscription.planName || 'Premium Plan'}</h2>
                    <span className="inline-flex items-center rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white">{subscription.status || 'Active'}</span>
                    <span className="text-slate-300 hidden sm:inline">|</span>
                    <p className="text-xs font-semibold text-slate-400">
                      Valid until: <span className="font-extrabold text-slate-700">{formatDate(subscription.validUntil, 'Not assigned')}</span>
                    </p>
                  </div>
                </div>

                {/* Status boxes */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 flex-1 max-w-[620px]">
                  {/* Job Posts */}
                  <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-2.5 px-3.5">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500">Job Posts</h4>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400">Used / Limit</p>
                        <p className="text-xs font-extrabold text-slate-750">{subscription.jobsUsed || 0} <span className="text-slate-400">/ {subscription.jobLimit || 0}</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400">Remaining</p>
                        <p className="text-xs font-extrabold text-emerald-600">{subscription.remainingCredits || 0}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full bg-indigo-500 transition-all duration-350" style={{ width: `${subscription.utilization || 0}%` }} />
                      </div>
                      <p className="mt-0.5 text-[9px] font-bold text-slate-400">{subscription.utilization || 0}% utilized</p>
                    </div>
                  </div>

                  {/* Resume Unlocks */}
                  <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-2.5 px-3.5">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500">Resume Unlocks</h4>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400">Unlocked / Limit</p>
                        <p className="text-xs font-extrabold text-slate-750">{subscription.unlocksUsed || 0} <span className="text-slate-400">/ {subscription.unlockLimit || 0}</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400">Remaining</p>
                        <p className="text-xs font-extrabold text-emerald-600">{subscription.remainingUnlocks ?? 0}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      {(() => {
                        const total = Number(subscription.unlockLimit);
                        const used = Number(subscription.unlocksUsed || 0);
                        const percent = total > 0 && total !== Number.MAX_SAFE_INTEGER
                          ? Math.min(Math.round((used / total) * 100), 100)
                          : 0;
                        return (
                          <>
                            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200">
                              <div className="h-full bg-emerald-500 transition-all duration-350" style={{ width: `${percent}%` }} />
                            </div>
                            <p className="mt-0.5 text-[9px] font-bold text-slate-400">{percent}% utilized</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Upgrade Button */}
                <Link to="/employer/subscription" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#6658dd] px-5 text-[13px] font-extrabold text-white shadow-md shadow-indigo-605/10 transition hover:bg-[#5848d8] sm:w-auto shrink-0">
                  <Crown className="h-4 w-4" />
                  Upgrade Plan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Stats Cards */}
      <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Card 1: Total Jobs */}
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between h-36">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0047C7] text-white">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <span className="block text-3xl font-extrabold text-slate-800">{dashboard.stats?.jobs?.total || 0}</span>
                  <JobStatLabel tooltip="All jobs created by you, including active, draft, paused, closed, and expired jobs.">Total Jobs</JobStatLabel>
                </div>
              </div>
              <Link to="/employer/jobs" className="text-xs font-bold text-[#0047C7] hover:underline mt-auto">View all</Link>
            </div>

            {/* Card 2: Active Jobs */}
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between h-36">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Send className="h-5 w-5 rotate-45" />
                </div>
                <div className="text-right">
                  <span className="block text-3xl font-extrabold text-slate-800">{dashboard.stats?.jobs?.active || 0}</span>
                  <JobStatLabel tooltip="Published jobs that are currently visible to candidates and open for applications.">Active Jobs</JobStatLabel>
                </div>
              </div>
              <Link to="/employer/jobs?status=Active" className="text-xs font-bold text-[#0047C7] hover:underline mt-auto">View all</Link>
            </div>

            {/* Card 3: Inactive Jobs */}
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between h-36">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-white">
                  <XCircle className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <span className="block text-3xl font-extrabold text-slate-800">{dashboard.stats?.jobs?.draft || 0}</span>
                  <JobStatLabel tooltip="Draft jobs saved by you but not published yet. Candidates cannot see or apply to them until you publish.">Inactive Jobs</JobStatLabel>
                </div>
              </div>
              <Link to="/employer/jobs?status=Draft" className="text-xs font-bold text-[#0047C7] hover:underline mt-auto">View all</Link>
            </div>

            {/* Card 4: Paused Jobs */}
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between h-36">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8e44ad] text-white">
                  <Pause className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <span className="block text-3xl font-extrabold text-slate-800">{dashboard.stats?.jobs?.closed || 0}</span>
                  <JobStatLabel tooltip="Jobs paused or closed by you before expiry. They stay hidden until you reopen or renew them.">Paused Jobs</JobStatLabel>
                </div>
              </div>
              <Link to="/employer/jobs?status=Closed" className="text-xs font-bold text-[#0047C7] hover:underline mt-auto">View all</Link>
            </div>

            {/* Card 5: Expired Jobs */}
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between h-36">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500 text-white">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <span className="block text-3xl font-extrabold text-slate-800">{dashboard.stats?.jobs?.expired || 0}</span>
                  <JobStatLabel tooltip="Jobs whose expiry date has passed automatically. Renew them to make them active again.">Expired Jobs</JobStatLabel>
                </div>
              </div>
              <Link to="/employer/jobs?status=Expired" className="text-xs font-bold text-[#0047C7] hover:underline mt-auto">View all</Link>
            </div>
        </div>
      </section>

      {/* Hiring Pipeline Block */}
      <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-extrabold text-[#111827] mb-4">Hiring Pipeline <span className="text-slate-400 font-medium">(All Jobs)</span></h2>
        
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            {/* Applied */}
            <Link to="/employer/applications?status=Applied" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[11px] font-bold text-slate-450">Applied</span>
                  <span className="block text-sm font-extrabold text-slate-800">{dashboard.pipeline?.applied || 0}</span>
                </div>
              </div>
            </Link>

            {/* Reviewed */}
            <Link to="/employer/applications?status=Reviewed" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                  <Eye className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[11px] font-bold text-slate-450">Reviewed</span>
                  <span className="block text-sm font-extrabold text-slate-800">{dashboard.pipeline?.reviewed || dashboard.stats?.reviewed || 0}</span>
                </div>
              </div>
            </Link>

            {/* Shortlisted */}
            <Link to="/employer/shortlisted" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Star className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[11px] font-bold text-slate-450">Shortlisted</span>
                  <span className="block text-sm font-extrabold text-slate-800">{dashboard.pipeline?.shortlisted || 0}</span>
                </div>
              </div>
            </Link>

            {/* Interview */}
            <Link to="/employer/interviews" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-[#6658dd]">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[11px] font-bold text-slate-450">Interview</span>
                  <span className="block text-sm font-extrabold text-slate-800">{dashboard.pipeline?.interview || 0}</span>
                </div>
              </div>
            </Link>

            {/* On Hold */}
            <Link to="/employer/applications?status=OnHold" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[11px] font-bold text-slate-450">On Hold</span>
                  <span className="block text-sm font-extrabold text-slate-800">{dashboard.pipeline?.onHold || 0}</span>
                </div>
              </div>
            </Link>

            {/* Selected */}
            <Link to="/employer/selected?status=Selected" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[11px] font-bold text-slate-450">Selected</span>
                  <span className="block text-sm font-extrabold text-slate-800">{dashboard.pipeline?.selected || 0}</span>
                </div>
              </div>
            </Link>

            {/* Offered */}
            <Link to="/employer/selected?status=Offer+Sent" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[11px] font-bold text-slate-450">Offered</span>
                  <span className="block text-sm font-extrabold text-slate-800">{dashboard.pipeline?.offered || 0}</span>
                </div>
              </div>
            </Link>

            {/* Rejected */}
            <Link to="/employer/applications?status=Rejected" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <XCircle className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[11px] font-bold text-slate-450">Rejected</span>
                  <span className="block text-sm font-extrabold text-slate-800">{dashboard.pipeline?.rejected || 0}</span>
                </div>
              </div>
            </Link>
        </div>
      </section>

      {/* Upcoming Interviews Block */}
      <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-[#111827]">Upcoming Interviews</h2>
            <p className="mt-1 text-xs font-semibold text-slate-400">Today se upcoming scheduled interviews.</p>
          </div>
          <Link to="/employer/interviews" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0047C7] hover:underline">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {upcomingInterviews.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {upcomingInterviews.map((interview) => (
              <Link
                key={interview.id}
                to={`/employer/applications/${interview.id}`}
                className="flex flex-col gap-3 rounded-lg border border-slate-100 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-[#6658dd]">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-800">{interview.candidateName || 'N/A'}</p>
                    <p className="truncate text-xs font-semibold text-slate-400">{interview.position || 'Open Position'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-left sm:min-w-[260px]">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wide text-slate-400">Date</span>
                    <span className="block text-xs font-extrabold text-slate-700">{interview.scheduledAt || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wide text-slate-400">Time</span>
                    <span className="block text-xs font-extrabold text-slate-700">{normalizeTime(interview.scheduledTime)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wide text-slate-400">Mode</span>
                    <span className="block truncate text-xs font-extrabold text-slate-700">{interview.type || '-'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-400">
            No upcoming interviews scheduled.
          </div>
        )}
      </section>

      {/* Your Jobs Table Block */}
      <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
        {/* Top bar of Table */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-base font-extrabold text-[#111827]">Your Jobs</h2>
          
          <div className="flex flex-wrap items-center gap-2 sm:self-end">
            {/* Search job input */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full sm:w-56 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0047C7] transition"
              />
            </div>

            {/* Filter button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterDropdownOpen(current => !current)}
                className="flex h-10 items-center gap-2 rounded-lg border border-slate-250 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filter</span>
              </button>
              {filterDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setFilterDropdownOpen(false)} />
                  <div className="absolute right-0 z-20 mt-1.5 w-40 rounded-lg border border-slate-100 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => { setStatusFilter(''); setFilterDropdownOpen(false); }}
                      className={`flex w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 ${!statusFilter ? 'text-[#0047C7] bg-[#f8fafc]' : 'text-slate-600'}`}
                    >
                      All Jobs
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStatusFilter('Active'); setFilterDropdownOpen(false); }}
                      className={`flex w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 ${statusFilter === 'Active' ? 'text-[#0047C7] bg-[#f8fafc]' : 'text-slate-600'}`}
                    >
                      Active Jobs
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStatusFilter('Expired'); setFilterDropdownOpen(false); }}
                      className={`flex w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 ${statusFilter === 'Expired' ? 'text-[#0047C7] bg-[#f8fafc]' : 'text-slate-600'}`}
                    >
                      Expired Jobs
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Post Job Button */}
            <Link
              to="/employer/jobs/create"
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0047C7] px-4 text-sm font-bold text-white shadow-md shadow-blue-600/10 transition hover:bg-[#0035a0]"
            >
              <Plus className="h-4 w-4" />
              <span>Post a Job</span>
            </Link>
          </div>
        </div>

        {/* Table view */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1380px] text-left border-separate border-spacing-0">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="w-[220px] border-b border-slate-100 pb-3 pr-5 text-left">Job Title</th>
                <th className="w-[110px] border-b border-slate-100 px-4 pb-3 text-left">Status</th>
                <th className="w-[130px] border-b border-slate-100 px-4 pb-3 text-left">Action</th>
                <th className="w-[120px] border-b border-slate-100 border-l border-slate-100 bg-slate-50/60 px-4 pb-3 text-center leading-4">Total<br />Applicants</th>
                <th className="w-[95px] border-b border-slate-100 border-l border-slate-100 px-4 pb-3 text-center">Applied</th>
                <th className="w-[105px] border-b border-slate-100 border-l border-slate-100 bg-slate-50/60 px-4 pb-3 text-center">Reviewed</th>
                <th className="w-[115px] border-b border-slate-100 border-l border-slate-100 px-4 pb-3 text-center">Shortlisted</th>
                <th className="w-[105px] border-b border-slate-100 border-l border-slate-100 bg-slate-50/60 px-4 pb-3 text-center">Interview</th>
                <th className="w-[95px] border-b border-slate-100 border-l border-slate-100 px-4 pb-3 text-center leading-4">On<br />Hold</th>
                <th className="w-[100px] border-b border-slate-100 border-l border-slate-100 bg-slate-50/60 px-4 pb-3 text-center">Selected</th>
                <th className="w-[95px] border-b border-slate-100 border-l border-slate-100 px-4 pb-3 text-center">Offered</th>
                <th className="w-[100px] border-b border-slate-100 border-l border-slate-100 bg-slate-50/60 px-4 pb-3 text-center">Rejected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.map((job, index) => (
                <tr key={job.id} className={`text-sm transition hover:bg-indigo-50/40 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  <td className="py-4 pr-5">
                    <Link to={`/employer/jobs/${job.id}`} className="font-bold text-slate-800 hover:text-[#0047C7] transition block truncate max-w-[210px]">{job.title}</Link>
                    <span className="text-[11px] font-semibold text-slate-400">{job.location || '-'}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-extrabold uppercase border ${
                      job.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border-rose-155'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-left">
                    <div className="flex items-center justify-start gap-2 relative">
                      {/* View Job detail link */}
                      <Link
                        to={`/employer/jobs/${job.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                        title="View Job"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      
                      {/* View Candidates link */}
                      <Link
                        to={`/employer/applications?jobTitle=${encodeURIComponent(job.title)}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                        title="Candidates"
                      >
                        <Users className="h-4 w-4" />
                      </Link>

                      {/* Dropdown Menu for Action */}
                      <button
                        type="button"
                        onClick={() => setActiveMenuJobId(current => current === job.id ? null : job.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {activeMenuJobId === job.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveMenuJobId(null)} />
                          <div className="absolute left-0 top-9 z-20 w-40 rounded-lg border border-slate-100 bg-white py-1 shadow-lg text-left">
                            <Link
                              to={`/employer/jobs/${job.id}/edit`}
                              className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              onClick={() => setActiveMenuJobId(null)}
                            >
                              Edit Job
                            </Link>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('publicToken');
                                  await axios.post(`${BASE_API_URL}/employer/jobs/${job.id}/duplicate`, {}, {
                                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                                  });
                                  window.location.reload();
                                } catch (e) {
                                  console.error(e);
                                }
                                setActiveMenuJobId(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Duplicate Job
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="border-l border-slate-100 bg-slate-50/40 px-4 py-4 text-center font-bold text-slate-700">
                    <Link to={`/employer/applications?jobTitle=${encodeURIComponent(job.title)}`} className="hover:text-[#0047C7]">{job.applications || 0}</Link>
                  </td>
                  <td className="border-l border-slate-100 px-4 py-4 text-center font-bold text-slate-700">
                    <Link to={`/employer/applications?jobTitle=${encodeURIComponent(job.title)}&status=Applied`} className="hover:text-[#0047C7]">{job.applied || 0}</Link>
                  </td>
                  <td className="border-l border-slate-100 bg-slate-50/40 px-4 py-4 text-center font-bold text-slate-700">
                    <Link to={`/employer/applications?jobTitle=${encodeURIComponent(job.title)}&status=Reviewed`} className="hover:text-[#0047C7]">{job.reviewed || 0}</Link>
                  </td>
                  <td className="border-l border-slate-100 px-4 py-4 text-center font-bold text-slate-700">
                    <Link to={`/employer/shortlisted?jobTitle=${encodeURIComponent(job.title)}`} className="hover:text-[#0047C7]">{job.shortlisted || 0}</Link>
                  </td>
                  <td className="border-l border-slate-100 bg-slate-50/40 px-4 py-4 text-center font-bold text-slate-700">
                    <Link to={`/employer/interviews?jobTitle=${encodeURIComponent(job.title)}`} className="hover:text-[#0047C7]">{job.interviews || 0}</Link>
                  </td>
                  <td className="border-l border-slate-100 px-4 py-4 text-center font-bold text-slate-700">
                    <Link to={`/employer/applications?jobTitle=${encodeURIComponent(job.title)}&status=OnHold`} className="hover:text-[#0047C7]">{job.onHold || 0}</Link>
                  </td>
                  <td className="border-l border-slate-100 bg-slate-50/40 px-4 py-4 text-center font-bold text-slate-700">
                    <Link to={`/employer/selected?jobTitle=${encodeURIComponent(job.title)}&status=Selected`} className="hover:text-[#0047C7]">{job.selected || 0}</Link>
                  </td>
                  <td className="border-l border-slate-100 px-4 py-4 text-center font-bold text-slate-700">
                    <Link to={`/employer/selected?jobTitle=${encodeURIComponent(job.title)}&status=Offer+Sent`} className="hover:text-[#0047C7]">{job.offered || 0}</Link>
                  </td>
                  <td className="border-l border-slate-100 bg-slate-50/40 px-4 py-4 text-center font-bold text-slate-700">
                    <Link to={`/employer/applications?jobTitle=${encodeURIComponent(job.title)}&status=Rejected`} className="hover:text-[#0047C7]">{job.rejected || 0}</Link>
                  </td>
                </tr>
              ))}
              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan="12" className="py-8 text-center text-sm font-bold text-slate-400">No jobs found matching the search/filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

  
    </div>
  );
};

export default EmployerDashboard;
