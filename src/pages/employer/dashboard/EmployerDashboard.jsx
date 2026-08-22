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
    shortlisted: 0,
    interview: 0,
    selected: 0,
    offered: 0,
    rejected: 0,
    expired: 0
  },
  activeJobs: [],
  subscription: {}
};

const formatDate = (value, fallback = '-') => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
};

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

  const pipelineData = useMemo(() => {
    const pipeline = dashboard.pipeline || {};
    return [
      { name: 'Applied', value: pipeline.applied || 0, color: '#10b981', link: '/employer/applications?status=Applied' },
      { name: 'Shortlisted', value: pipeline.shortlisted || 0, color: '#f59e0b', link: '/employer/shortlisted' },
      { name: 'Interview', value: pipeline.interview || 0, color: '#6658dd', link: '/employer/interviews' },
      { name: 'On Hold', value: pipeline.onHold || 0, color: '#f97316', link: '/employer/applications?status=OnHold' },
      { name: 'Selected', value: pipeline.selected || 0, color: '#10b981', link: '/employer/selected?status=Selected' },
      { name: 'Offered', value: pipeline.offered || 0, color: '#ec4899', link: '/employer/selected?status=Offer+Sent' },
      { name: 'Rejected', value: pipeline.rejected || 0, color: '#ef4444', link: '/employer/applications?status=Rejected' }
    ];
  }, [dashboard.pipeline]);

  const maxPipelineVal = useMemo(() => {
    const vals = pipelineData.map(d => d.value);
    return Math.max(...vals, 1);
  }, [pipelineData]);

  const totalPipelineCandidates = useMemo(() => {
    return pipelineData.reduce((sum, d) => sum + d.value, 0);
  }, [pipelineData]);

  const jobSources = useMemo(() => {
    const jobs = dashboard.stats?.jobs || {};
    return [
      { name: 'Active', value: jobs.active || 0, color: '#10b981' },
      { name: 'Inactive', value: jobs.draft || 0, color: '#f59e0b' },
      { name: 'Paused', value: jobs.closed || 0, color: '#8e44ad' },
      { name: 'Expired', value: jobs.expired || 0, color: '#ef4444' }
    ];
  }, [dashboard.stats?.jobs]);

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
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <Crown className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-base font-extrabold text-[#111827]">{subscription.planName || 'Premium Plan'}</h2>
                <span className="inline-flex items-center rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white">{subscription.status || 'Active'}</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Valid until: <span className="font-extrabold text-slate-700">{formatDate(subscription.validUntil, 'Not assigned')}</span>
              </p>
              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 sm:max-w-[780px]">
                <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Job Posts</h4>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400">Used / Limit</p>
                      <p className="text-sm font-extrabold text-slate-750">{subscription.jobsUsed || 0} <span className="text-slate-400">/ {subscription.jobLimit || 0}</span></p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400">Remaining</p>
                      <p className="text-sm font-extrabold text-emerald-600">{subscription.remainingCredits || 0}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full bg-indigo-500 transition-all duration-350" style={{ width: `${subscription.utilization || 0}%` }} />
                    </div>
                    <p className="mt-1.5 text-[10px] font-bold text-slate-400">{subscription.utilization || 0}% utilized</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Resume Unlocks</h4>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400">Unlocked / Limit</p>
                      <p className="text-sm font-extrabold text-slate-750">{subscription.unlocksUsed || 0} <span className="text-slate-400">/ {subscription.unlockLimit || 0}</span></p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400">Remaining</p>
                      <p className="text-sm font-extrabold text-emerald-600">{subscription.remainingUnlocks ?? 0}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    {(() => {
                      const total = Number(subscription.unlockLimit);
                      const used = Number(subscription.unlocksUsed || 0);
                      const percent = total > 0 && total !== Number.MAX_SAFE_INTEGER
                        ? Math.min(Math.round((used / total) * 100), 100)
                        : 0;
                      return (
                        <>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full bg-emerald-500 transition-all duration-350" style={{ width: `${percent}%` }} />
                          </div>
                          <p className="mt-1.5 text-[10px] font-bold text-slate-400">{percent}% utilized</p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Link to="/employer/subscription" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#6658dd] px-5 text-[13px] font-extrabold text-white shadow-md shadow-indigo-605/10 transition hover:bg-[#5848d8] lg:w-auto">
            <Crown className="h-4 w-4" />
            Upgrade Plan
          </Link>
        </div>
      </section>

      {/* 4 Stats Cards + Donut Chart Layout */}
      <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Stats Cards (Left Column) */}
          <div className="lg:col-span-8 grid gap-4 sm:grid-cols-2">
            {/* Card 1: Total Jobs */}
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between h-36">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0047C7] text-white">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <span className="block text-3xl font-extrabold text-slate-800">{dashboard.stats?.jobs?.total || 0}</span>
                  <span className="text-xs font-semibold text-slate-400 mt-1 block">Total Jobs</span>
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
                  <span className="text-xs font-semibold text-slate-400 mt-1 block">Active Jobs</span>
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
                  <span className="text-xs font-semibold text-slate-400 mt-1 block">Inactive Jobs</span>
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
                  <span className="text-xs font-semibold text-slate-400 mt-1 block">Paused Jobs</span>
                </div>
              </div>
              <Link to="/employer/jobs?status=Closed" className="text-xs font-bold text-[#0047C7] hover:underline mt-auto">View all</Link>
            </div>
          </div>

          {/* Donut Chart (Right Column) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center border-t border-slate-100 lg:border-t-0 lg:border-l lg:border-slate-100 pt-6 lg:pt-0 lg:pl-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Jobs Distribution</h3>
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 190 190" className="-rotate-90">
                <circle cx="95" cy="95" r="70" fill="none" stroke="#f1f5f9" strokeWidth="24" />
                {(() => {
                  const radius = 70;
                  const circumference = 2 * Math.PI * radius;
                  let offset = 0;
                  const total = dashboard.stats?.jobs?.total || 0;

                  return jobSources.map((source) => {
                    const dash = total ? (source.value / total) * circumference : 0;
                    const strokeOffset = -offset;
                    offset += dash;

                    if (dash === 0) return null;

                    return (
                      <circle
                        key={source.name}
                        cx="95"
                        cy="95"
                        r={radius}
                        fill="none"
                        stroke={source.color}
                        strokeWidth="24"
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeDashoffset={strokeOffset}
                        className="transition-all duration-550 ease-in-out"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800">{dashboard.stats?.jobs?.total || 0}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Jobs</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5 max-w-[240px]">
              {jobSources.map((source) => {
                const pct = (dashboard.stats?.jobs?.total > 0) ? (source.value / dashboard.stats?.jobs?.total) * 100 : 0;
                return (
                  <div key={source.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: source.color }} />
                    <span>{source.name} ({pct.toFixed(0)}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Hiring Pipeline Block */}
      <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-extrabold text-[#111827] mb-4">Hiring Pipeline <span className="text-slate-400 font-medium">(All Jobs)</span></h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Pipeline Cards (Left Column) */}
          <div className="lg:col-span-8 grid gap-3 grid-cols-2 sm:grid-cols-3">
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
            <Link to="/employer/applications?status=Rejected" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition justify-between col-span-2 sm:col-span-1">
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

          {/* Donut Chart (Right Column) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center border-t border-slate-100 lg:border-t-0 lg:border-l lg:border-slate-100 pt-6 lg:pt-0 lg:pl-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Pipeline Distribution</h3>
            {totalPipelineCandidates === 0 ? (
              <div className="flex flex-col items-center justify-center h-40">
                <span className="text-xs font-bold text-slate-400">No candidates in pipeline</span>
              </div>
            ) : (
              <>
                <div className="relative h-32 w-32">
                  <svg viewBox="0 0 190 190" className="-rotate-90">
                    <circle cx="95" cy="95" r="70" fill="none" stroke="#f1f5f9" strokeWidth="24" />
                    {(() => {
                      const radius = 70;
                      const circumference = 2 * Math.PI * radius;
                      let offset = 0;

                      return pipelineData.map((stage) => {
                        const dash = totalPipelineCandidates ? (stage.value / totalPipelineCandidates) * circumference : 0;
                        const strokeOffset = -offset;
                        offset += dash;

                        if (dash === 0) return null;

                        return (
                          <circle
                            key={stage.name}
                            cx="95"
                            cy="95"
                            r={radius}
                            fill="none"
                            stroke={stage.color}
                            strokeWidth="24"
                            strokeDasharray={`${dash} ${circumference - dash}`}
                            strokeDashoffset={strokeOffset}
                            className="transition-all duration-550 ease-in-out"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-800">{totalPipelineCandidates}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Candidates</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1 max-w-[260px]">
                  {pipelineData.map((stage) => {
                    const pct = totalPipelineCandidates > 0 ? (stage.value / totalPipelineCandidates) * 100 : 0;
                    if (stage.value === 0) return null;
                    return (
                      <div key={stage.name} className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                        <span>{stage.name} ({pct.toFixed(0)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
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
          <table className="w-full min-w-[780px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-400">
                <th className="pb-3 text-left w-[220px]">Job Title</th>
                <th className="pb-3 text-left w-[100px]">Status</th>
                <th className="pb-3 text-center">Applicants</th>
                <th className="pb-3 text-center">Shortlisted</th>
                <th className="pb-3 text-center">Interview</th>
                <th className="pb-3 text-center">On Hold</th>
                <th className="pb-3 text-center">Selected</th>
                <th className="pb-3 text-center">Offered</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="text-sm hover:bg-slate-50/40">
                  <td className="py-4">
                    <Link to={`/employer/jobs/${job.id}`} className="font-bold text-slate-800 hover:text-[#0047C7] transition block truncate max-w-[210px]">{job.title}</Link>
                    <span className="text-[11px] font-semibold text-slate-400">{job.location || '-'}</span>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-extrabold uppercase border ${
                      job.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border-rose-155'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-4 text-center font-bold text-slate-700">
                    <Link to={`/employer/applications?jobTitle=${encodeURIComponent(job.title)}`} className="hover:text-[#0047C7]">{job.applications || 0}</Link>
                  </td>
                  <td className="py-4 text-center font-bold text-slate-700">
                    <Link to={`/employer/shortlisted?jobTitle=${encodeURIComponent(job.title)}`} className="hover:text-[#0047C7]">{job.shortlisted || 0}</Link>
                  </td>
                  <td className="py-4 text-center font-bold text-slate-700">
                    <Link to={`/employer/interviews?jobTitle=${encodeURIComponent(job.title)}`} className="hover:text-[#0047C7]">{job.interviews || 0}</Link>
                  </td>
                  <td className="py-4 text-center font-bold text-slate-700">
                    <Link to={`/employer/applications?jobTitle=${encodeURIComponent(job.title)}&status=OnHold`} className="hover:text-[#0047C7]">{job.onHold || 0}</Link>
                  </td>
                  <td className="py-4 text-center font-bold text-slate-700">
                    <Link to={`/employer/selected?jobTitle=${encodeURIComponent(job.title)}&status=Selected`} className="hover:text-[#0047C7]">{job.selected || 0}</Link>
                  </td>
                  <td className="py-4 text-center font-bold text-slate-700">
                    <Link to={`/employer/selected?jobTitle=${encodeURIComponent(job.title)}&status=Offer+Sent`} className="hover:text-[#0047C7]">{job.offered || 0}</Link>
                  </td>
                  <td className="py-4 text-right pr-2">
                    <div className="flex items-center justify-end gap-2 relative">
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
                          <div className="absolute right-0 top-9 z-20 w-40 rounded-lg border border-slate-100 bg-white py-1 shadow-lg text-left">
                            <Link
                              to={`/employer/jobs/${job.id}`}
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
                </tr>
              ))}
              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-sm font-bold text-slate-400">No jobs found matching the search/filters.</td>
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
