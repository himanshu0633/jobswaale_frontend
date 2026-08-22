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
  FileText
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
      { name: 'Rejected', value: pipeline.rejected || 0, color: '#ef4444', link: '/employer/applications?status=Rejected' },
      { name: 'Expired', value: pipeline.expired || 0, color: '#64748b', link: '/employer/jobs?status=Expired' }
    ];
  }, [dashboard.pipeline]);

  const maxPipelineVal = useMemo(() => {
    const vals = pipelineData.map(d => d.value);
    return Math.max(...vals, 1);
  }, [pipelineData]);

  const totalPipelineCandidates = useMemo(() => {
    return pipelineData.reduce((sum, d) => sum + d.value, 0);
  }, [pipelineData]);

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

      {/* 4 Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Card 3: Interview Scheduled */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-white">
              <Clock className="h-5 w-5" />
            </div>
            <div className="text-right">
              <span className="block text-3xl font-extrabold text-slate-800">{dashboard.stats?.interviews || 0}</span>
              <span className="text-xs font-semibold text-slate-400 mt-1 block">Interview Scheduled</span>
            </div>
          </div>
          <Link to="/employer/interviews" className="text-xs font-bold text-[#0047C7] hover:underline mt-auto">View all</Link>
        </div>

        {/* Card 4: Total Candidates */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8e44ad] text-white">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-right">
              <span className="block text-3xl font-extrabold text-slate-800">{dashboard.stats?.applications || 0}</span>
              <span className="text-xs font-semibold text-slate-400 mt-1 block">Total Candidates</span>
            </div>
          </div>
          <Link to="/employer/applications" className="text-xs font-bold text-[#0047C7] hover:underline mt-auto">View all</Link>
        </div>
      </div>

      {/* Hiring Pipeline Block */}
      <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-extrabold text-[#111827] mb-4">Hiring Pipeline <span className="text-slate-400 font-medium">(All Jobs)</span></h2>
        <div className="flex flex-wrap items-center gap-2">
          {/* Applied */}
          <Link to="/employer/applications?status=Applied" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition w-full sm:w-auto min-w-[120px] justify-between">
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
          
          <ChevronRight className="hidden sm:block h-4 w-4 text-slate-300" />

          {/* Shortlisted */}
          <Link to="/employer/shortlisted" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition w-full sm:w-auto min-w-[120px] justify-between">
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

          <ChevronRight className="hidden sm:block h-4 w-4 text-slate-300" />

          {/* Interview */}
          <Link to="/employer/interviews" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition w-full sm:w-auto min-w-[120px] justify-between">
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

          <ChevronRight className="hidden sm:block h-4 w-4 text-slate-300" />

          {/* On Hold */}
          <Link to="/employer/applications?status=OnHold" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition w-full sm:w-auto min-w-[120px] justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <Clock className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="block text-[11px] font-bold text-slate-450">On Hold for Interview</span>
                <span className="block text-sm font-extrabold text-slate-800">{dashboard.pipeline?.onHold || 0}</span>
              </div>
            </div>
          </Link>

          <ChevronRight className="hidden sm:block h-4 w-4 text-slate-300" />

          {/* Selected */}
          <Link to="/employer/selected?status=Selected" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition w-full sm:w-auto min-w-[120px] justify-between">
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

          <ChevronRight className="hidden sm:block h-4 w-4 text-slate-300" />

          {/* Offered */}
          <Link to="/employer/selected?status=Offer+Sent" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition w-full sm:w-auto min-w-[120px] justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Mail className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="block text-[11px] font-bold text-slate-450">Offered</span>
                <span className="block text-sm font-extrabold text-slate-800">{dashboard.pipeline?.offered || 0}</span>
              </div>
            </div>
          </Link>

          <ChevronRight className="hidden sm:block h-4 w-4 text-slate-300" />

          {/* Rejected */}
          <Link to="/employer/applications?status=Rejected" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition w-full sm:w-auto min-w-[120px] justify-between">
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

          <ChevronRight className="hidden sm:block h-4 w-4 text-slate-300" />

          {/* Expired */}
          <Link to="/employer/jobs?status=Expired" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition w-full sm:w-auto min-w-[120px] justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Clock className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="block text-[11px] font-bold text-slate-450">Expired</span>
                <span className="block text-sm font-extrabold text-slate-800">{dashboard.pipeline?.expired || 0}</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Visual Graph Representation */}
        <div className="mt-6 pt-6 border-t border-dashed border-slate-200">
          <style>{`
            @keyframes reportGrowY {
              from { transform: scaleY(0); }
              to { transform: scaleY(1); }
            }
          `}</style>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Pipeline Distribution Graph</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">Visual representation of candidates across pipeline stages</p>
            </div>
            {totalPipelineCandidates > 0 && (
              <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-100">
                Total Applicants: {totalPipelineCandidates}
              </span>
            )}
          </div>

          {totalPipelineCandidates === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-slate-150 bg-[#f8fafc]">
              <span className="text-sm font-bold text-slate-400">No candidates in the hiring pipeline yet.</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Vertical Bar Chart Container */}
              <div className="overflow-x-auto">
                <div className="min-w-[600px] h-60 flex items-end gap-6 border-b border-slate-200 px-4 pb-2 pt-6">
                  {pipelineData.map((stage, idx) => {
                    const pct = totalPipelineCandidates > 0 ? (stage.value / totalPipelineCandidates) * 100 : 0;
                    const heightPct = (stage.value / maxPipelineVal) * 100;
                    return (
                      <div key={stage.name} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                          <div className="bg-[#1e293b] text-white text-[10px] sm:text-xs font-bold rounded-lg px-2.5 py-1.5 shadow-md flex flex-col items-center whitespace-nowrap">
                            <span className="text-[10px] font-medium opacity-85">{stage.name}</span>
                            <span className="text-xs font-black mt-0.5">{stage.value} ({pct.toFixed(1)}%)</span>
                          </div>
                          {/* Triangle indicator */}
                          <div className="w-2 h-2 bg-[#1e293b] rotate-45 mx-auto -mt-1" />
                        </div>

                        {/* Top indicator of exact value */}
                        <span className="text-[10px] font-black text-slate-550 mb-1 transition-transform duration-200 group-hover:scale-110">
                          {stage.value}
                        </span>

                        {/* The interactive bar */}
                        <Link
                          to={stage.link}
                          className="w-full max-w-[42px] rounded-t-md transition-all duration-350 ease-out hover:brightness-95 hover:shadow-lg relative overflow-hidden"
                          style={{
                            height: `${Math.max(heightPct, stage.value ? 4 : 0)}%`,
                            backgroundColor: stage.color,
                            transformOrigin: 'bottom',
                            animation: `reportGrowY 750ms ease-out ${idx * 60}ms both`
                          }}
                        >
                          {/* Glass light effect inside bar */}
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </Link>

                        {/* Label at bottom */}
                        <span className="mt-2 text-center text-[10px] sm:text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors duration-200 truncate w-full">
                          {stage.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid representation for overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {pipelineData.map((stage) => {
                  const pct = totalPipelineCandidates > 0 ? (stage.value / totalPipelineCandidates) * 100 : 0;
                  return (
                    <div key={stage.name} className="p-3 rounded-lg border border-slate-100 bg-[#f8fafc] flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold text-slate-400 truncate">{stage.name}</span>
                        <span className="block text-xs font-black text-slate-700 mt-0.5">{stage.value} <span className="text-[10px] text-slate-400 font-semibold">({pct.toFixed(0)}%)</span></span>
                      </div>
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
