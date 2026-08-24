import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  CalendarCheck,
  ChevronRight,
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Filter,
  Gift,
  Grid2X2,
  Loader,
  RefreshCcw,
  UserCheck,
  Users,
  X,
  Star,
  Calendar,
  Clock,
  Mail,
  XCircle
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import PageSkeleton from '../../../components/SkeletonLoader';

const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#10b981', '#9ca3af'];

const statCards = [
  { key: 'totalApplications', title: 'Total Applications', icon: FileText, tone: 'bg-violet-50 text-[#6658dd]', trend: '+12.5%' },
  { key: 'shortlisted', title: 'Shortlisted', icon: UserCheck, tone: 'bg-emerald-50 text-emerald-500', trend: '+8.3%' },
  { key: 'interviews', title: 'Interviews', icon: CalendarCheck, tone: 'bg-amber-50 text-amber-500', trend: '-3.1%', down: true },
  { key: 'offersMade', title: 'Offers Made', icon: Gift, tone: 'bg-cyan-50 text-cyan-500', trend: '+15.2%' },
  { key: 'hires', title: 'Hires', icon: Users, tone: 'bg-emerald-50 text-emerald-500', trend: '+5.0%' },
  { key: 'rejectionRate', title: 'Rejection Rate', icon: X, tone: 'bg-rose-50 text-rose-500', suffix: '%', trend: '-2.1%' }
];

const statusConfig = [
  { key: 'applied', label: 'Applied', color: '#3b82f6' },
  { key: 'reviewed', label: 'Under Review', color: '#8b5cf6' },
  { key: 'shortlisted', label: 'Shortlisted', color: '#10b981' },
  { key: 'interview', label: 'Interviewed', color: '#6658dd' },
  { key: 'onHold', label: 'On Hold', color: '#f97316' },
  { key: 'selected', label: 'Selected', color: '#06b6d4' },
  { key: 'offered', label: 'Offered', color: '#ec4899' },
  { key: 'rejected', label: 'Rejected', color: '#ef4444' }
];

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const toInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getInitialRange = () => {
  const to = new Date();
  const from = new Date(to.getFullYear(), to.getMonth() - 5, 1);
  return {
    from: toInputDate(from),
    to: toInputDate(to)
  };
};

const quickRanges = [
  {
    key: 'today',
    label: 'Today',
    getRange: () => {
      const today = toInputDate(new Date());
      return { from: today, to: today };
    }
  },
  {
    key: 'week',
    label: 'This Week',
    getRange: () => {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      return { from: toInputDate(start), to: toInputDate(today) };
    }
  },
  {
    key: 'month',
    label: 'This Month',
    getRange: () => {
      const today = new Date();
      return { from: toInputDate(new Date(today.getFullYear(), today.getMonth(), 1)), to: toInputDate(today) };
    }
  },
  {
    key: 'lastMonth',
    label: 'Last Month',
    getRange: () => {
      const today = new Date();
      return {
        from: toInputDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
        to: toInputDate(new Date(today.getFullYear(), today.getMonth(), 0))
      };
    }
  },
  {
    key: 'quarter',
    label: 'Last 3 Months',
    getRange: () => {
      const today = new Date();
      return { from: toInputDate(new Date(today.getFullYear(), today.getMonth() - 2, 1)), to: toInputDate(today) };
    }
  }
];

const formatComparison = (comparison, suffix = '') => {
  if (!comparison) return 'No previous data';
  const value = Number(comparison.change || 0);
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString('en-IN')}${suffix} vs previous`;
};

const escapeCsv = (value) => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const downloadBlob = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const formatFileDate = () => new Date().toISOString().slice(0, 10);

const Card = ({ children, className = '', delay = 0 }) => (
  <section
    className={`rounded-md border border-slate-100 bg-white shadow-sm transition duration-700 ease-out ${className}`}
    style={{ animation: `reportFadeUp 620ms ease-out ${delay}ms both` }}
  >
    {children}
  </section>
);

const statusTone = {
  applied: 'bg-blue-50 text-blue-600',
  reviewed: 'bg-violet-50 text-violet-600',
  shortlisted: 'bg-emerald-50 text-emerald-600',
  interview: 'bg-indigo-50 text-indigo-600',
  onHold: 'bg-orange-50 text-orange-600',
  selected: 'bg-cyan-50 text-cyan-600',
  offered: 'bg-pink-50 text-pink-600',
  rejected: 'bg-rose-50 text-rose-600'
};

const DonutChart = ({ sources = [], total = 0 }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-40 sm:h-48 sm:w-48">
        <svg viewBox="0 0 190 190" className="-rotate-90">
          <circle cx="95" cy="95" r={radius} fill="none" stroke="#eef2f7" strokeWidth="28" />
          {sources.map((source, index) => {
            const dash = total ? (source.value / total) * circumference : 0;
            const circle = (
              <circle
                key={source.name}
                cx="95"
                cy="95"
                r={radius}
                fill="none"
                stroke={colors[index % colors.length]}
                strokeWidth="28"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                style={{ transition: 'stroke-dasharray 900ms ease, stroke-dashoffset 900ms ease' }}
              />
            );
            offset += dash;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-[#3f4254] sm:text-2xl">{total}</span>
          <span className="text-xs font-bold text-slate-400 sm:text-sm">Total</span>
        </div>
      </div>
    </div>
  );
};

export const EmployerReports = () => {
  const defaultRange = useMemo(getInitialRange, []);
  const [range, setRange] = useState(defaultRange);
  const [filters, setFilters] = useState({ jobId: 'all', status: 'all' });
  const [data, setData] = useState({ stats: {}, monthlyOverview: [], sources: [], funnel: [], recentActivity: [], topJobs: [], range: {}, filters: { jobs: [], statuses: [] }, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasActiveFilters = range.from !== defaultRange.from || range.to !== defaultRange.to || filters.jobId !== 'all' || filters.status !== 'all';

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (range.from) params.set('from', range.from);
    if (range.to) params.set('to', range.to);
    if (filters.jobId !== 'all') params.set('jobId', filters.jobId);
    if (filters.status !== 'all') params.set('status', filters.status);
    return params.toString();
  }, [range, filters]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');

    axios.get(`${BASE_API_URL}/employer/reports?${queryString}`, { headers: getTokenHeaders() })
      .then((response) => {
        if (alive) setData({ stats: {}, monthlyOverview: [], sources: [], funnel: [], recentActivity: [], topJobs: [], range: {}, filters: { jobs: [], statuses: [] }, history: [], ...response.data });
      })
      .catch((err) => {
        if (alive) setError(err.response?.data?.message || 'Reports could not be loaded.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false; };
  }, [queryString]);

  const maxMonthly = Math.max(...(data.monthlyOverview || []).map((month) => statusConfig.reduce((sum, item) => sum + Number(month[item.key] || 0), 0)), 1);
  const sourceTotal = (data.sources || []).reduce((sum, item) => sum + Number(item.value || 0), 0);
  const funnelMax = Math.max(...(data.funnel || []).map((item) => Number(item.value || 0)), 1);

  const pipelineData = useMemo(() => {
    const pipeline = data.pipeline || {};
    return [
      { name: 'Applied', value: pipeline.applied || 0, color: '#3b82f6', link: '/employer/applications?status=Applied' },
      { name: 'Shortlisted', value: pipeline.shortlisted || 0, color: '#10b981', link: '/employer/shortlisted' },
      { name: 'Interview', value: pipeline.interview || 0, color: '#6658dd', link: '/employer/interviews' },
      { name: 'On Hold', value: pipeline.onHold || 0, color: '#f97316', link: '/employer/applications?status=OnHold' },
      { name: 'Selected', value: pipeline.selected || 0, color: '#06b6d4', link: '/employer/selected?status=Selected' },
      { name: 'Offered', value: pipeline.offered || 0, color: '#ec4899', link: '/employer/selected?status=Offer+Sent' },
      { name: 'Rejected', value: pipeline.rejected || 0, color: '#ef4444', link: '/employer/applications?status=Rejected' }
    ];
  }, [data.pipeline]);

  const totalPipelineCandidates = useMemo(() => {
    return pipelineData.reduce((sum, d) => sum + d.value, 0);
  }, [pipelineData]);

  const exportRows = useMemo(() => {
    const statsRows = statCards.map((item) => ['Summary', item.title, data.stats?.[item.key] ?? 0, '', '', '']);
    const monthlyRows = (data.monthlyOverview || []).map((item) => [
      'Monthly Overview',
      item.month,
      item.applied || 0,
      item.reviewed || 0,
      item.shortlisted || 0,
      item.interview || 0,
      item.onHold || 0,
      item.selected || 0,
      item.offered || 0,
      item.rejected || 0
    ]);
    const sourceRows = (data.sources || []).map((item) => ['Application Sources', item.name, item.value || 0, `${item.percent || 0}%`, '', '']);
    const funnelRows = (data.funnel || []).map((item) => ['Hiring Funnel', item.title, item.value || 0, `${item.percent || 0}%`, '', '']);
    const jobRows = (data.topJobs || []).map((item) => [
      'Top Jobs',
      item.title,
      item.applications || 0,
      item.shortlisted || 0,
      `${item.interviewRate || 0}%`,
      item.hired || 0,
      `${item.conversionRate || 0}%`
    ]);
    const historyRows = (data.history || []).map((item) => [
      'History',
      item.candidateName,
      item.jobTitle,
      item.status,
      item.appliedDate,
      item.updatedDate
    ]);

    return { statsRows, monthlyRows, sourceRows, funnelRows, jobRows, historyRows };
  }, [data]);

  const handleExcelExport = () => {
    const sections = [
      ['JobsWaale Employer Reports'],
      ['Range', data.range?.label || 'Selected range'],
      ['Job', data.filters?.jobs?.find((job) => String(job.id) === filters.jobId)?.title || 'All Jobs'],
      ['Status', data.filters?.statuses?.find((status) => status.key === filters.status)?.label || 'All Statuses'],
      [],
      ['Section', 'Metric', 'Value A', 'Value B', 'Value C', 'Value D', 'Value E', 'Value F'],
      ...exportRows.statsRows,
      [],
      ['Section', 'Month', 'Applied', 'Reviewed', 'Shortlisted', 'Interviewed', 'On Hold', 'Selected', 'Offered', 'Rejected'],
      ...exportRows.monthlyRows,
      [],
      ['Section', 'Source', 'Applications', 'Percent'],
      ...exportRows.sourceRows,
      [],
      ['Section', 'Stage', 'Candidates', 'Percent'],
      ...exportRows.funnelRows,
      [],
      ['Section', 'Job Title', 'Applications', 'Shortlisted', 'Interview Rate', 'Hired', 'Conversion'],
      ...exportRows.jobRows,
      [],
      ['Section', 'Candidate', 'Job Title', 'Status', 'Applied Date', 'Updated Date'],
      ...exportRows.historyRows
    ];
    const csv = sections.map((row) => row.map(escapeCsv).join(',')).join('\n');
    downloadBlob(csv, `jobswaale-employer-report-${formatFileDate()}.csv`, 'text/csv;charset=utf-8;');
  };

  const handlePdfExport = () => {
    const printable = window.open('', '_blank', 'noopener,noreferrer,width=1100,height=800');
    if (!printable) {
      setError('Popup blocked. Please allow popups to export PDF.');
      return;
    }

    const rows = (label, values) => values.map((row) => `<tr>${row.map((cell) => `<td>${String(cell ?? '')}</td>`).join('')}</tr>`).join('');
    printable.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>JobsWaale Employer Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #313a46; padding: 28px; }
            h1 { margin: 0 0 6px; font-size: 24px; }
            h2 { margin: 28px 0 10px; font-size: 16px; }
            p { margin: 0 0 18px; color: #667085; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #eef2ff; }
            @media print { button { display: none; } body { padding: 0; } }
          </style>
        </head>
        <body>
          <button onclick="window.print()" style="float:right;padding:10px 14px;border:0;background:#6658dd;color:white;border-radius:6px;font-weight:700">Print / Save PDF</button>
          <h1>JobsWaale Employer Report</h1>
          <p>${data.range?.label || 'Selected range'}</p>
          <h2>Summary</h2>
          <table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>${statCards.map((item) => `<tr><td>${item.title}</td><td>${data.stats?.[item.key] ?? 0}${item.suffix || ''}</td></tr>`).join('')}</tbody></table>
          <h2>Monthly Overview</h2>
          <table><thead><tr><th>Month</th><th>Applied</th><th>Reviewed</th><th>Shortlisted</th><th>Interviewed</th><th>On Hold</th><th>Selected</th><th>Offered</th><th>Rejected</th></tr></thead><tbody>${rows('Monthly', exportRows.monthlyRows.map((row) => row.slice(1)))}</tbody></table>
          <h2>Application Sources</h2>
          <table><thead><tr><th>Source</th><th>Applications</th><th>Percent</th></tr></thead><tbody>${rows('Sources', exportRows.sourceRows.map((row) => row.slice(1, 4)))}</tbody></table>
          <h2>Hiring Funnel</h2>
          <table><thead><tr><th>Stage</th><th>Candidates</th><th>Percent</th></tr></thead><tbody>${rows('Funnel', exportRows.funnelRows.map((row) => row.slice(1, 4)))}</tbody></table>
          <h2>Top Job Postings</h2>
          <table><thead><tr><th>Job</th><th>Applications</th><th>Shortlisted</th><th>Interview Rate</th><th>Hired</th><th>Conversion</th></tr></thead><tbody>${rows('Jobs', exportRows.jobRows.map((row) => row.slice(1)))}</tbody></table>
          <h2>Application History</h2>
          <table><thead><tr><th>Candidate</th><th>Job</th><th>Status</th><th>Applied</th><th>Updated</th></tr></thead><tbody>${rows('History', exportRows.historyRows.map((row) => row.slice(1)))}</tbody></table>
          <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script>
        </body>
      </html>
    `);
    printable.document.close();
  };

  const handleScheduleExport = () => {
    const schedule = {
      enabled: true,
      frequency: 'weekly',
      format: 'PDF',
      range,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('employerReportSchedule', JSON.stringify(schedule));
    window.alert('Weekly report export schedule saved for this browser.');
  };

  if (loading && !data.monthlyOverview.length) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="space-y-4 px-3 sm:space-y-5 sm:px-0">
      <style>{`
        @keyframes reportFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes reportGrowY { from { transform: scaleY(0); } to { transform: scaleY(1); } }
      `}</style>

      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center md:gap-3">
        <h1 className="text-lg font-extrabold text-[#3f4254] sm:text-xl">Reports & Analytics</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 sm:text-sm"><span className="text-[#3f4254]">JobsWaale</span><ChevronRight className="h-4 w-4" /><span>Reports & Analytics</span></div>
      </div>

      {error && <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}

      <Card>
        <div className="border-b border-dashed border-slate-200 px-4 py-4 sm:px-5">
          <h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Filters</h2>
          <p className="mt-1 text-xs font-semibold text-slate-400">Select date range, job, and status to see matching report data.</p>
        </div>
        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            {quickRanges.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setRange(item.getRange())}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-600 transition hover:border-[#6658dd] hover:text-[#6658dd]"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.3fr_1fr_auto_auto]">
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase text-slate-400">Start Date</label>
              <input type="date" value={range.from} max={range.to || undefined} onChange={(event) => setRange((current) => ({ ...current, from: event.target.value }))} className="h-10 w-full rounded-md border border-slate-200 px-2 text-xs font-bold text-slate-600 outline-none focus:border-[#6658dd] sm:px-3 sm:text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase text-slate-400">End Date</label>
              <input type="date" value={range.to} min={range.from || undefined} onChange={(event) => setRange((current) => ({ ...current, to: event.target.value }))} className="h-10 w-full rounded-md border border-slate-200 px-2 text-xs font-bold text-slate-600 outline-none focus:border-[#6658dd] sm:px-3 sm:text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase text-slate-400">Job</label>
              <select value={filters.jobId} onChange={(event) => setFilters((current) => ({ ...current, jobId: event.target.value }))} className="h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 outline-none focus:border-[#6658dd] sm:px-3 sm:text-sm">
                <option value="all">All Jobs</option>
                {(data.filters?.jobs || []).map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase text-slate-400">Status</label>
              <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 outline-none focus:border-[#6658dd] sm:px-3 sm:text-sm">
                <option value="all">All Statuses</option>
                {(data.filters?.statuses || []).map((status) => <option key={status.key} value={status.key}>{status.label}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button type="button" onClick={() => { setRange(defaultRange); setFilters({ jobId: 'all', status: 'all' }); }} disabled={!hasActiveFilters} className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border px-4 text-sm font-extrabold transition ${hasActiveFilters ? 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200' : 'border-slate-100 bg-slate-50 text-slate-300'}`}><RefreshCcw className="h-4 w-4" />Clear</button>
            </div>
            <div className="flex items-end">
              <button type="button" onClick={handleExcelExport} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#6658dd] px-5 text-sm font-extrabold text-white transition hover:bg-[#5848d8]"><Download className="h-4 w-4" />Export</button>
            </div>
          </div>

          <div className="grid gap-2 border-t border-dashed border-slate-100 pt-3 text-xs font-bold text-slate-500 md:grid-cols-2">
            <div className="flex min-w-0 items-center gap-2 rounded-md bg-slate-50 px-3 py-2"><Filter className="h-4 w-4 shrink-0 text-slate-400" /><span className="truncate">Showing: {data.range?.label || 'Selected range'}</span></div>
            <div className="rounded-md bg-slate-50 px-3 py-2">Comparing with: <span className="text-slate-700">{data.range?.previousLabel || 'previous matching period'}</span></div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card, index) => (
          <Card key={card.key} delay={index * 65}>
            <div className="flex items-center gap-2 p-3 sm:gap-5 sm:p-5">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${card.tone}`}><card.icon className="h-4 w-4 sm:h-5 sm:w-5" /></span>
              <div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-400 sm:text-sm">{card.title}</p><p className="mt-1 text-base font-black text-[#3f4254] sm:text-xl">{Number(data.stats?.[card.key] || 0).toLocaleString('en-IN')}{card.suffix || ''}</p><p className={`mt-1 text-[11px] font-black sm:text-xs ${Number(data.comparison?.[card.key]?.change || 0) < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatComparison(data.comparison?.[card.key], card.suffix || '')}</p></div>
            </div>
          </Card>
        ))}
      </div>

      <Card delay={95}>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-5">
          <div>
            <p className="text-xs font-black uppercase text-slate-400">Dashboard All-time</p>
            <p className="mt-1 text-sm font-bold text-slate-600">Use this row to match dashboard totals.</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-[11px] font-bold text-slate-400">Applications</p>
            <p className="mt-1 text-lg font-black text-slate-800">{Number(data.dashboardSnapshot?.stats?.totalApplications || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-[11px] font-bold text-slate-400">Interview / On Hold</p>
            <p className="mt-1 text-lg font-black text-slate-800">{Number(data.dashboardSnapshot?.pipeline?.interview || 0).toLocaleString('en-IN')} / {Number(data.dashboardSnapshot?.pipeline?.onHold || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-[11px] font-bold text-slate-400">Selected / Offered / Rejected</p>
            <p className="mt-1 text-lg font-black text-slate-800">{Number(data.dashboardSnapshot?.pipeline?.selected || 0).toLocaleString('en-IN')} / {Number(data.dashboardSnapshot?.pipeline?.offered || 0).toLocaleString('en-IN')} / {Number(data.dashboardSnapshot?.pipeline?.rejected || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Card delay={120}>
          <div className="border-b border-dashed border-slate-200 px-4 py-4 sm:px-5"><h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Applications Overview</h2><p className="text-xs font-semibold text-slate-400 sm:text-sm">Monthly breakdown by application status</p></div>
          <div className="p-4 sm:p-5">
            <div className="overflow-x-auto">
              <div className="flex h-[260px] min-w-[520px] items-end gap-4 border-b border-l border-slate-200 px-4 py-4 sm:h-[340px] sm:min-w-0 sm:gap-7 sm:px-6">
                {(data.monthlyOverview || []).map((month, monthIndex) => (
                  <div key={month.month} className="flex h-full flex-1 flex-col justify-end">
                    <div className="flex min-h-0 w-full flex-col justify-end overflow-hidden rounded-t-sm">
                      {statusConfig.map((status, statusIndex) => {
                        const value = Number(month[status.key] || 0);
                        const height = Math.max((value / maxMonthly) * 300, value ? 5 : 0);
                        return <div key={status.key} title={`${status.label}: ${value}`} style={{ height, backgroundColor: status.color, transformOrigin: 'bottom', animation: `reportGrowY 700ms ease-out ${monthIndex * 90 + statusIndex * 25}ms both` }} />;
                      })}
                    </div>
                    <span className="mt-3 text-center text-[11px] font-bold text-slate-500 sm:text-xs">{month.month}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:gap-4">
              {statusConfig.map((item) => <span key={item.key} className="flex items-center gap-2 text-[11px] font-bold text-slate-500 sm:text-xs"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>)}
            </div>
          </div>
        </Card>

        <Card delay={180}>
          <div className="border-b border-dashed border-slate-200 px-4 py-4 sm:px-5"><h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Application Sources</h2><p className="text-xs font-semibold text-slate-400 sm:text-sm">Where candidates are coming from</p></div>
          <div className="p-4 sm:p-5">
            <DonutChart sources={data.sources || []} total={sourceTotal} />
            <div className="mt-5 space-y-3">
              {(data.sources || []).map((source, index) => <div key={source.name} className="flex items-center justify-between text-xs font-bold text-slate-600 sm:text-sm"><span className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} /><span className="truncate">{source.name}</span></span><span className="shrink-0">{source.value} ({source.percent}%)</span></div>)}
              {!data.sources?.length && <p className="py-8 text-center text-sm font-bold text-slate-400">No source data found.</p>}
            </div>
          </div>
        </Card>
      </div>

      {/* Hiring Pipeline Block */}
      <Card delay={220}>
        <div className="border-b border-dashed border-slate-200 px-4 py-4 sm:px-5">
          <h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Hiring Pipeline <span className="text-slate-400 font-medium">(All Jobs)</span></h2>
        </div>
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Pipeline Cards (Left Column) */}
            <div className="lg:col-span-8 grid gap-3 grid-cols-2 sm:grid-cols-3">
              {/* Applied */}
              <Link to="/employer/applications?status=Applied" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[11px] font-bold text-slate-450">Applied</span>
                    <span className="block text-sm font-extrabold text-slate-800">{data.pipeline?.applied || 0}</span>
                  </div>
                </div>
              </Link>

              {/* Shortlisted */}
              <Link to="/employer/shortlisted" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Star className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[11px] font-bold text-slate-450">Shortlisted</span>
                    <span className="block text-sm font-extrabold text-slate-800">{data.pipeline?.shortlisted || 0}</span>
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
                    <span className="block text-sm font-extrabold text-slate-800">{data.pipeline?.interview || 0}</span>
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
                    <span className="block text-sm font-extrabold text-slate-800">{data.pipeline?.onHold || 0}</span>
                  </div>
                </div>
              </Link>

              {/* Selected */}
              <Link to="/employer/selected?status=Selected" className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[11px] font-bold text-slate-450">Selected</span>
                    <span className="block text-sm font-extrabold text-slate-800">{data.pipeline?.selected || 0}</span>
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
                    <span className="block text-sm font-extrabold text-slate-800">{data.pipeline?.offered || 0}</span>
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
                    <span className="block text-sm font-extrabold text-slate-800">{data.pipeline?.rejected || 0}</span>
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
        </div>
      </Card>

      {/* Recent Activity Block */}
      <Card delay={260}>
        <div className="flex items-center justify-between border-b border-dashed border-slate-200 px-4 py-4 sm:px-5">
          <div><h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Recent Activity</h2></div>
          <button className="rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500">All Activity</button>
        </div>
        <div className="divide-y divide-slate-100 p-4 sm:p-5">
          {(data.recentActivity || []).map((item, index) => (
            <div key={item.id || index} className="flex items-start gap-3 py-3" style={{ animation: `reportFadeUp 500ms ease-out ${index * 70}ms both` }}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-[#6658dd]"><RefreshCcw className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-[#3f4254]">{item.title}</p>
                <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">{item.description}</p>
              </div>
              <span className="shrink-0 text-xs font-bold text-slate-400">{item.time}</span>
            </div>
          ))}
          {!data.recentActivity?.length && <p className="py-8 text-center text-sm font-bold text-slate-400">No recent activity found.</p>}
        </div>
      </Card>

      <Card delay={300}>
        <div className="flex items-center justify-between border-b border-dashed border-slate-200 px-4 py-4 sm:px-5"><div><h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Top Job Postings</h2><p className="text-xs font-semibold text-slate-400 sm:text-sm">Performance metrics by job</p></div><Link to="/employer/jobs" className="text-xs font-extrabold text-[#6658dd] sm:text-sm">View All Jobs</Link></div>

        {/* Card list — mobile only */}
        <div className="divide-y divide-slate-100 p-4 sm:hidden">
          {(data.topJobs || []).map((job) => (
            <div key={job.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-[#6658dd]"><Briefcase className="h-4 w-4" /></span>
                <p className="min-w-0 flex-1 truncate text-sm font-extrabold text-[#3f4254]">{job.title}</p>
                <span className="shrink-0 rounded bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-500">{job.conversionRate}%</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs font-semibold text-slate-500">
                <p><span className="text-slate-400">Apps:</span> {job.applications}</p>
                <p><span className="text-slate-400">Shortlist:</span> {job.shortlisted}</p>
                <p><span className="text-slate-400">Hired:</span> {job.hired}</p>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-1.5 flex-1 overflow-hidden rounded bg-slate-100"><span className="block h-full rounded bg-[#6658dd]" style={{ width: `${job.interviewRate}%` }} /></span>
                <span className="text-xs font-bold text-slate-600">{job.interviewRate}% interview rate</span>
              </div>
            </div>
          ))}
          {!data.topJobs?.length && <p className="py-8 text-center text-sm font-bold text-slate-400">No job performance data found.</p>}
        </div>

        {/* Table — sm and up */}
        <div className="hidden overflow-x-auto p-5 sm:block">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-[#dbe6f6] text-[11px] uppercase text-slate-600"><tr><th className="px-5 py-3">Job Title</th><th className="px-5 py-3">Applications</th><th className="px-5 py-3">Shortlisted</th><th className="px-5 py-3">Interview Rate</th><th className="px-5 py-3">Hired</th><th className="px-5 py-3">Conv. %</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(data.topJobs || []).map((job, index) => <tr key={job.id} className="transition hover:bg-slate-50"><td className="px-5 py-4"><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-[#6658dd]"><Briefcase className="h-4 w-4" /></span><span className="ml-3 text-sm font-extrabold text-[#3f4254]">{job.title}</span></td><td className="px-5 py-4 text-sm font-bold text-slate-600">{job.applications}</td><td className="px-5 py-4 text-sm font-bold text-slate-600">{job.shortlisted}</td><td className="px-5 py-4"><span className="mr-3 inline-block h-1.5 w-14 overflow-hidden rounded bg-slate-100 align-middle"><span className="block h-full rounded bg-[#6658dd]" style={{ width: `${job.interviewRate}%`, transition: 'width 700ms ease', transitionDelay: `${index * 80}ms` }} /></span><span className="text-sm font-bold text-slate-600">{job.interviewRate}%</span></td><td className="px-5 py-4 text-sm font-bold text-slate-600">{job.hired}</td><td className="px-5 py-4"><span className="rounded bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-500">{job.conversionRate}%</span></td></tr>)}
              {!data.topJobs?.length && <tr><td colSpan="6" className="px-5 py-10 text-center text-sm font-bold text-slate-400">No job performance data found.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Card delay={320}>
        <div className="flex flex-col justify-between gap-2 border-b border-dashed border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
          <div>
            <h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Application History</h2>
            <p className="text-xs font-semibold text-slate-400 sm:text-sm">Candidates matching the selected filters</p>
          </div>
          <span className="rounded-md bg-slate-100 px-3 py-2 text-xs font-black text-slate-500">{Number(data.history?.length || 0).toLocaleString('en-IN')} records</span>
        </div>

        <div className="divide-y divide-slate-100 p-4 sm:hidden">
          {(data.history || []).map((item) => (
            <div key={item.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-[#3f4254]">{item.candidateName}</p>
                  <p className="mt-0.5 truncate text-xs font-bold text-slate-400">{item.jobTitle}</p>
                </div>
                <span className={`shrink-0 rounded px-2 py-1 text-[11px] font-black ${statusTone[item.statusKey] || 'bg-slate-100 text-slate-600'}`}>{item.status}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500">
                <p><span className="text-slate-400">Applied:</span> {item.appliedDate || '-'}</p>
                <p><span className="text-slate-400">Updated:</span> {item.updatedDate || '-'}</p>
              </div>
            </div>
          ))}
          {!data.history?.length && <p className="py-8 text-center text-sm font-bold text-slate-400">No history found for selected filters.</p>}
        </div>

        <div className="hidden overflow-x-auto p-5 sm:block">
          <table className="w-full min-w-[780px] text-left">
            <thead className="bg-[#dbe6f6] text-[11px] uppercase text-slate-600">
              <tr>
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Job</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Applied Date</th>
                <th className="px-5 py-3">Updated Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data.history || []).map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="text-sm font-extrabold text-[#3f4254]">{item.candidateName}</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-400">{item.email || '-'}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-600">{item.jobTitle}</td>
                  <td className="px-5 py-4"><span className={`rounded px-2 py-1 text-xs font-black ${statusTone[item.statusKey] || 'bg-slate-100 text-slate-600'}`}>{item.status}</span></td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-600">{item.appliedDate || '-'}</td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-600">{item.updatedDate || '-'}</td>
                </tr>
              ))}
              {!data.history?.length && <tr><td colSpan="5" className="px-5 py-10 text-center text-sm font-bold text-slate-400">No history found for selected filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Card delay={340}>
        <div className="flex flex-col justify-between gap-4 p-4 sm:p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 sm:gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-50 text-[#6658dd] sm:h-12 sm:w-12"><Download className="h-5 w-5 sm:h-6 sm:w-6" /></span><div><h2 className="text-sm font-extrabold text-[#3f4254] sm:text-base">Download Reports</h2><p className="text-xs font-semibold text-slate-400 sm:text-sm">Export your hiring data for offline analysis or presentations.</p></div></div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap"><button type="button" onClick={handlePdfExport} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border-2 border-blue-600 bg-slate-100 px-2 text-xs font-extrabold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 sm:px-4 sm:text-sm"><FileDown className="h-4 w-4" /><span className="hidden xs:inline sm:inline">PDF</span></button><button type="button" onClick={handleExcelExport} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-100 px-2 text-xs font-extrabold text-slate-600 transition hover:bg-slate-200 sm:px-4 sm:text-sm"><FileSpreadsheet className="h-4 w-4" /><span className="hidden xs:inline sm:inline">Excel</span></button><button type="button" onClick={handleScheduleExport} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-2 text-xs font-extrabold text-white transition hover:bg-[#5848d8] sm:px-4 sm:text-sm"><Grid2X2 className="h-4 w-4" /><span className="hidden xs:inline sm:inline">Schedule</span></button></div>
        </div>
      </Card>
    </div>
  );
};

export default EmployerReports;
