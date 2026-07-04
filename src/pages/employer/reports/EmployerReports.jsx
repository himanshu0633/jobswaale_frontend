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
  X
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

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
  { key: 'interview', label: 'Interviewed', color: '#f59e0b' },
  { key: 'selected', label: 'Selected', color: '#06b6d4' },
  { key: 'rejected', label: 'Rejected', color: '#ef4444' }
];

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getInitialRange = () => {
  const to = new Date();
  const from = new Date(to.getFullYear(), to.getMonth() - 5, 1);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10)
  };
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

const DonutChart = ({ sources = [], total = 0 }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-48 w-48">
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
          <span className="text-2xl font-black text-[#3f4254]">{total}</span>
          <span className="text-sm font-bold text-slate-400">Total</span>
        </div>
      </div>
    </div>
  );
};

export const EmployerReports = () => {
  const [range, setRange] = useState(getInitialRange);
  const [data, setData] = useState({ stats: {}, monthlyOverview: [], sources: [], funnel: [], recentActivity: [], topJobs: [], range: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (range.from) params.set('from', range.from);
    if (range.to) params.set('to', range.to);
    return params.toString();
  }, [range]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');

    axios.get(`${BASE_API_URL}/employer/reports?${queryString}`, { headers: getTokenHeaders() })
      .then((response) => {
        if (alive) setData({ stats: {}, monthlyOverview: [], sources: [], funnel: [], recentActivity: [], topJobs: [], range: {}, ...response.data });
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

  const exportRows = useMemo(() => {
    const statsRows = statCards.map((item) => ['Summary', item.title, data.stats?.[item.key] ?? 0, '', '', '']);
    const monthlyRows = (data.monthlyOverview || []).map((item) => [
      'Monthly Overview',
      item.month,
      item.applied || 0,
      item.reviewed || 0,
      item.shortlisted || 0,
      item.interview || 0,
      item.selected || 0,
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

    return { statsRows, monthlyRows, sourceRows, funnelRows, jobRows };
  }, [data]);

  const handleExcelExport = () => {
    const sections = [
      ['JobsWaale Employer Reports'],
      ['Range', data.range?.label || 'Selected range'],
      [],
      ['Section', 'Metric', 'Value A', 'Value B', 'Value C', 'Value D', 'Value E', 'Value F'],
      ...exportRows.statsRows,
      [],
      ['Section', 'Month', 'Applied', 'Reviewed', 'Shortlisted', 'Interviewed', 'Selected', 'Rejected'],
      ...exportRows.monthlyRows,
      [],
      ['Section', 'Source', 'Applications', 'Percent'],
      ...exportRows.sourceRows,
      [],
      ['Section', 'Stage', 'Candidates', 'Percent'],
      ...exportRows.funnelRows,
      [],
      ['Section', 'Job Title', 'Applications', 'Shortlisted', 'Interview Rate', 'Hired', 'Conversion'],
      ...exportRows.jobRows
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
          <table><thead><tr><th>Month</th><th>Applied</th><th>Reviewed</th><th>Shortlisted</th><th>Interviewed</th><th>Selected</th><th>Rejected</th></tr></thead><tbody>${rows('Monthly', exportRows.monthlyRows.map((row) => row.slice(1)))}</tbody></table>
          <h2>Application Sources</h2>
          <table><thead><tr><th>Source</th><th>Applications</th><th>Percent</th></tr></thead><tbody>${rows('Sources', exportRows.sourceRows.map((row) => row.slice(1, 4)))}</tbody></table>
          <h2>Hiring Funnel</h2>
          <table><thead><tr><th>Stage</th><th>Candidates</th><th>Percent</th></tr></thead><tbody>${rows('Funnel', exportRows.funnelRows.map((row) => row.slice(1, 4)))}</tbody></table>
          <h2>Top Job Postings</h2>
          <table><thead><tr><th>Job</th><th>Applications</th><th>Shortlisted</th><th>Interview Rate</th><th>Hired</th><th>Conversion</th></tr></thead><tbody>${rows('Jobs', exportRows.jobRows.map((row) => row.slice(1)))}</tbody></table>
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
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader className="h-9 w-9 animate-spin text-[#6658dd]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <style>{`
        @keyframes reportFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes reportGrowY { from { transform: scaleY(0); } to { transform: scaleY(1); } }
      `}</style>

      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <h1 className="text-xl font-extrabold text-[#3f4254]">Reports & Analytics</h1>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400"><span className="text-[#3f4254]">JobsWaale</span><ChevronRight className="h-4 w-4" /><span>Reports & Analytics</span></div>
      </div>

      {error && <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}

      <Card>
        <div className="border-b border-dashed border-slate-200 px-5 py-4"><h2 className="text-lg font-extrabold text-[#3f4254]">Filter</h2></div>
        <div className="grid gap-3 p-5 md:grid-cols-[1fr_1fr_auto]">
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="date" value={range.from} onChange={(event) => setRange((current) => ({ ...current, from: event.target.value }))} className="h-10 rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-600 outline-none focus:border-[#6658dd]" />
            <input type="date" value={range.to} onChange={(event) => setRange((current) => ({ ...current, to: event.target.value }))} className="h-10 rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-600 outline-none focus:border-[#6658dd]" />
          </div>
          <div className="flex h-10 items-center gap-2 rounded-md bg-slate-100 px-4 text-sm font-bold text-slate-500"><Filter className="h-4 w-4" />{data.range?.label || 'Selected range'}</div>
          <button type="button" onClick={handleExcelExport} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-5 text-sm font-extrabold text-white transition hover:bg-[#5848d8]"><Download className="h-4 w-4" />Export</button>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card, index) => (
          <Card key={card.key} delay={index * 65}>
            <div className="flex items-center gap-5 p-5">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${card.tone}`}><card.icon className="h-5 w-5" /></span>
              <div><p className="text-sm font-semibold text-slate-400">{card.title}</p><p className="mt-1 text-xl font-black text-[#3f4254]">{Number(data.stats?.[card.key] || 0).toLocaleString('en-IN')}{card.suffix || ''}</p><p className={`mt-1 text-xs font-black ${card.down ? 'text-rose-500' : 'text-emerald-500'}`}>{card.trend}</p></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Card delay={120}>
          <div className="border-b border-dashed border-slate-200 px-5 py-4"><h2 className="text-lg font-extrabold text-[#3f4254]">Applications Overview</h2><p className="text-sm font-semibold text-slate-400">Monthly breakdown by application status</p></div>
          <div className="p-5">
            <div className="flex h-[340px] items-end gap-7 border-b border-l border-slate-200 px-6 py-4">
              {(data.monthlyOverview || []).map((month, monthIndex) => (
                <div key={month.month} className="flex h-full flex-1 flex-col justify-end">
                  <div className="flex min-h-0 w-full flex-col justify-end overflow-hidden rounded-t-sm">
                    {statusConfig.map((status, statusIndex) => {
                      const value = Number(month[status.key] || 0);
                      const height = Math.max((value / maxMonthly) * 300, value ? 5 : 0);
                      return <div key={status.key} title={`${status.label}: ${value}`} style={{ height, backgroundColor: status.color, transformOrigin: 'bottom', animation: `reportGrowY 700ms ease-out ${monthIndex * 90 + statusIndex * 25}ms both` }} />;
                    })}
                  </div>
                  <span className="mt-3 text-center text-xs font-bold text-slate-500">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {statusConfig.map((item) => <span key={item.key} className="flex items-center gap-2 text-xs font-bold text-slate-500"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>)}
            </div>
          </div>
        </Card>

        <Card delay={180}>
          <div className="border-b border-dashed border-slate-200 px-5 py-4"><h2 className="text-lg font-extrabold text-[#3f4254]">Application Sources</h2><p className="text-sm font-semibold text-slate-400">Where candidates are coming from</p></div>
          <div className="p-5">
            <DonutChart sources={data.sources || []} total={sourceTotal} />
            <div className="mt-5 space-y-3">
              {(data.sources || []).map((source, index) => <div key={source.name} className="flex items-center justify-between text-sm font-bold text-slate-600"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />{source.name}</span><span>{source.value} ({source.percent}%)</span></div>)}
              {!data.sources?.length && <p className="py-8 text-center text-sm font-bold text-slate-400">No source data found.</p>}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card delay={220}>
          <div className="border-b border-dashed border-slate-200 px-5 py-4"><h2 className="text-lg font-extrabold text-[#3f4254]">Hiring Funnel</h2><p className="text-sm font-semibold text-slate-400">Conversion rates across hiring stages</p></div>
          <div className="space-y-5 p-5">
            {(data.funnel || []).map((item, index) => (
              <div key={item.key} className="grid grid-cols-[110px_1fr_90px] items-center gap-3">
                <span className="text-sm font-extrabold text-slate-600">{item.title}</span>
                <div className="h-7 overflow-hidden rounded bg-slate-100"><div className="flex h-full items-center justify-end rounded bg-[#3b82f6] pr-2 text-xs font-black text-white transition-all duration-700" style={{ width: `${Math.max((item.value / funnelMax) * 100, item.value ? 7 : 0)}%`, transitionDelay: `${index * 90}ms` }}>{item.value}</div></div>
                <span className="text-xs font-black text-slate-500">{item.percent}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card delay={260}>
          <div className="flex items-center justify-between border-b border-dashed border-slate-200 px-5 py-4"><div><h2 className="text-lg font-extrabold text-[#3f4254]">Recent Activity</h2></div><button className="rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500">All Activity</button></div>
          <div className="divide-y divide-slate-100 p-5">
            {(data.recentActivity || []).map((item, index) => (
              <div key={item.id || index} className="flex items-start gap-3 py-3" style={{ animation: `reportFadeUp 500ms ease-out ${index * 70}ms both` }}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-[#6658dd]"><RefreshCcw className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><p className="text-sm font-extrabold text-[#3f4254]">{item.title}</p><p className="mt-0.5 truncate text-xs font-semibold text-slate-400">{item.description}</p></div>
                <span className="text-xs font-bold text-slate-400">{item.time}</span>
              </div>
            ))}
            {!data.recentActivity?.length && <p className="py-8 text-center text-sm font-bold text-slate-400">No recent activity found.</p>}
          </div>
        </Card>
      </div>

      <Card delay={300}>
        <div className="flex items-center justify-between border-b border-dashed border-slate-200 px-5 py-4"><div><h2 className="text-lg font-extrabold text-[#3f4254]">Top Job Postings</h2><p className="text-sm font-semibold text-slate-400">Performance metrics by job</p></div><Link to="/employer/jobs" className="text-sm font-extrabold text-[#6658dd]">View All Jobs</Link></div>
        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-[#dbe6f6] text-[11px] uppercase text-slate-600"><tr><th className="px-5 py-3">Job Title</th><th className="px-5 py-3">Applications</th><th className="px-5 py-3">Shortlisted</th><th className="px-5 py-3">Interview Rate</th><th className="px-5 py-3">Hired</th><th className="px-5 py-3">Conv. %</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(data.topJobs || []).map((job, index) => <tr key={job.id} className="transition hover:bg-slate-50"><td className="px-5 py-4"><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-[#6658dd]"><Briefcase className="h-4 w-4" /></span><span className="ml-3 text-sm font-extrabold text-[#3f4254]">{job.title}</span></td><td className="px-5 py-4 text-sm font-bold text-slate-600">{job.applications}</td><td className="px-5 py-4 text-sm font-bold text-slate-600">{job.shortlisted}</td><td className="px-5 py-4"><span className="mr-3 inline-block h-1.5 w-14 overflow-hidden rounded bg-slate-100 align-middle"><span className="block h-full rounded bg-[#6658dd]" style={{ width: `${job.interviewRate}%`, transition: 'width 700ms ease', transitionDelay: `${index * 80}ms` }} /></span><span className="text-sm font-bold text-slate-600">{job.interviewRate}%</span></td><td className="px-5 py-4 text-sm font-bold text-slate-600">{job.hired}</td><td className="px-5 py-4"><span className="rounded bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-500">{job.conversionRate}%</span></td></tr>)}
              {!data.topJobs?.length && <tr><td colSpan="6" className="px-5 py-10 text-center text-sm font-bold text-slate-400">No job performance data found.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Card delay={340}>
        <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-[#6658dd]"><Download className="h-6 w-6" /></span><div><h2 className="text-base font-extrabold text-[#3f4254]">Download Reports</h2><p className="text-sm font-semibold text-slate-400">Export your hiring data for offline analysis or presentations.</p></div></div>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={handlePdfExport} className="inline-flex h-10 items-center gap-2 rounded-md border-2 border-blue-600 bg-slate-100 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"><FileDown className="h-4 w-4" />PDF</button><button type="button" onClick={handleExcelExport} className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-100 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200"><FileSpreadsheet className="h-4 w-4" />Excel</button><button type="button" onClick={handleScheduleExport} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white transition hover:bg-[#5848d8]"><Grid2X2 className="h-4 w-4" />Schedule</button></div>
        </div>
      </Card>
    </div>
  );
};

export default EmployerReports;
