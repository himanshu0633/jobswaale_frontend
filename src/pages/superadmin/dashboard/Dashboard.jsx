import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';
import {
  Briefcase,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Eye,
  FileText,
  Home,
  Image,
  Loader,
  MoreVertical,
  Plus,
  UserRound,
  Users
} from 'lucide-react';

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN');

const statusStyles = {
  Applied: 'bg-emerald-50 text-emerald-500',
  Active: 'bg-emerald-50 text-emerald-500',
  Interview: 'bg-indigo-50 text-indigo-500',
  Shortlisted: 'bg-amber-50 text-amber-500',
  Pending: 'bg-amber-50 text-amber-500',
  Expired: 'bg-rose-50 text-rose-500',
  Inactive: 'bg-slate-100 text-slate-500',
  Selected: 'bg-blue-50 text-blue-500',
  Blacklist: 'bg-rose-50 text-rose-500'
};

const quickActions = [
  { title: 'Add New Job', subtitle: 'Post a new job opening', icon: Plus, color: 'bg-blue-600', to: '/admin/jobs/add' },
  { title: 'Verify Candidates', subtitle: 'Review pending candidates', icon: Check, color: 'bg-emerald-500', to: '/admin/jobseekers' },
  { title: 'Manage Applications', subtitle: 'View and manage applications', icon: Briefcase, color: 'bg-purple-600', to: '/admin/jobs' },
  { title: 'View Payments', subtitle: 'Track payments and transactions', icon: CreditCard, color: 'bg-orange-500', to: '/admin' },
  { title: 'Generate Report', subtitle: 'Download performance report', icon: FileText, color: 'bg-emerald-500', to: '/admin' }
];

const StatusBadge = ({ status }) => (
  <span className={`inline-flex min-w-24 justify-center rounded-md px-3 py-1.5 text-xs font-extrabold ${statusStyles[status] || 'bg-slate-100 text-slate-500'}`}>
    {status}
  </span>
);

const Pagination = ({ label }) => (
  <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 text-sm font-semibold text-slate-400 sm:flex-row sm:items-center sm:justify-between">
    <span>{label}</span>
    <div className="flex items-center gap-2">
      <button className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-400">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-600 text-white">1</button>
      <button className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700">2</button>
      <button className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const DashboardCard = ({ title, children, action }) => (
  <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
    <div className="flex min-h-20 items-center justify-between border-b border-dashed border-slate-200 px-6 py-4">
      <h2 className="text-lg font-extrabold text-slate-800">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

const ViewAllButton = ({ to }) => (
  <Link to={to} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-indigo-500">
    <Eye className="h-4 w-4" />
    View All
  </Link>
);

const StatCard = ({ icon: Icon, value, title, tone }) => (
  <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <div className={`flex h-[68px] w-[68px] items-center justify-center rounded-md ${tone}`}>
        <Icon className="h-8 w-8" />
      </div>
      <div className="text-right">
        <div className="text-3xl font-extrabold text-slate-800">{formatNumber(value)}</div>
        <div className="mt-2 text-sm font-semibold text-slate-400">{title}</div>
      </div>
    </div>
  </div>
);

const LineChart = ({ data = [] }) => {
  const rows = data.length ? data : [{ label: 'No data', value: 0 }];
  const maxValue = Math.max(...rows.map((item) => Number(item.value || 0)), 1);
  const width = 660;
  const chartHeight = 160;
  const points = rows.map((item, index) => {
    const x = rows.length === 1 ? 20 : 20 + index * ((width - 40) / (rows.length - 1));
    const y = 20 + chartHeight - ((Number(item.value || 0) / maxValue) * chartHeight);
    return `${x},${y}`;
  }).join(' ');
  return (
    <div className="px-8 py-8">
      <svg viewBox="0 0 660 220" className="h-72 w-full">
        {[50, 100, 150].map((y) => (
          <line key={y} x1="0" x2="660" y1={y} y2={y} stroke="#e8eef7" strokeDasharray="7 10" />
        ))}
        <text x="0" y="52" fill="#98a6ba" fontSize="16">{formatNumber(maxValue)}</text>
        <text x="10" y="102" fill="#98a6ba" fontSize="16">{formatNumber(Math.round(maxValue * 0.6))}</text>
        <text x="10" y="152" fill="#98a6ba" fontSize="16">{formatNumber(Math.round(maxValue * 0.3))}</text>
        <path d={`M ${points}`} fill="none" stroke="#6658dd" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.split(' ').map((point) => {
          const [cx, cy] = point.split(',');
          return <circle key={point} cx={cx} cy={cy} r="5" fill="white" stroke="#6658dd" strokeWidth="4" />;
        })}
        {rows.map((item, index) => (
          <text key={`${item.label}-${index}`} x={rows.length === 1 ? 0 : index * (width / rows.length)} y="210" fill="#98a6ba" fontSize="16">{item.label}</text>
        ))}
      </svg>
    </div>
  );
};

const DonutChart = ({ data = {} }) => {
  const total = Number(data.total || 0);
  const rows = [
    ['#2563ff', 'Applied', Number(data.applied || 0)],
    ['#ff8800', 'Shortlisted', Number(data.shortlisted || 0)],
    ['#883cff', 'Interview', Number(data.interview || 0)],
    ['#20c777', 'Hired', Number(data.hired || 0)],
    ['#ff2b2b', 'Rejected', Number(data.rejected || 0)]
  ];
  let cursor = 0;
  const gradient = total
    ? rows.map(([color, , value]) => {
      const start = cursor;
      cursor += (value / total) * 100;
      return `${color} ${start}% ${cursor}%`;
    }).join(', ')
    : '#e2e8f0 0% 100%';

  return (
  <div className="grid gap-8 px-8 py-8 md:grid-cols-[300px_minmax(0,1fr)] md:items-center">
    <div className="relative mx-auto h-64 w-64 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
      <div className="absolute inset-12 flex flex-col items-center justify-center rounded-full bg-white">
        <span className="text-4xl font-extrabold text-slate-900">{formatNumber(total)}</span>
        <span className="text-lg font-extrabold text-slate-500">Total</span>
      </div>
    </div>
    <div className="space-y-5 text-sm font-extrabold text-slate-900">
      {rows.map(([color, label, value]) => (
        <div key={label} className="flex items-center gap-4">
          <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
          <span>{label}</span>
          <span className="ml-auto">{formatNumber(value)} ({total ? ((value / total) * 100).toFixed(1) : '0.0'}%)</span>
        </div>
      ))}
    </div>
  </div>
  );
};

export const Dashboard = () => {
  const [stats, setStats] = useState({
    employers: 0,
    jobseekers: 0,
    jobsPosted: 0,
    activeJobs: 0,
    totalUsers: 0,
    activeUsers: 0,
    activeCompanies: 0,
    revenue: 0,
    applicationsOverview: [],
    applicationsByStatus: {},
    recentCandidates: [],
    recentJobs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    axios.get(`${BASE_API_URL}/masters/dashboard/stats`)
      .then((response) => {
        if (isMounted) {
          setStats((current) => ({ ...current, ...response.data }));
        }
      })
      .catch((err) => {
        console.error('Error fetching dashboard stats', err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Jobs', value: stats.jobsPosted, icon: Briefcase, tone: 'bg-indigo-50 text-indigo-600' },
    { title: 'Active Jobs', value: stats.activeJobs, icon: ClipboardCheck, tone: 'bg-emerald-50 text-emerald-500' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, tone: 'bg-amber-50 text-amber-500' },
    { title: 'Active Users', value: stats.activeUsers, icon: UserRound, tone: 'bg-rose-50 text-rose-500' },
    { title: 'Companies', value: stats.employers, icon: Building2, tone: 'bg-cyan-50 text-cyan-500' },
    { title: 'Active Companies', value: stats.activeCompanies, icon: Home, tone: 'bg-blue-50 text-blue-500' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[28px] font-extrabold text-slate-800">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
          <span>JobsWaale</span>
          <ChevronRight className="h-4 w-4" />
          <span>Dashboard</span>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(560px,2fr)]">
        <div className="grid gap-8 sm:grid-cols-2">
          {statCards.map((card) => <StatCard key={card.title} {...card} />)}
        </div>

        <DashboardCard title="Quick Actions">
          <div className="space-y-0 px-8 py-8">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} to={action.to} className="flex items-center gap-5 rounded-[16px] border border-slate-200 px-5 py-4 text-slate-700 transition hover:bg-slate-50">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-[12px] text-white ${action.color}`}>
                    <Icon className="h-7 w-7" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-extrabold text-slate-900">{action.title}</span>
                    <span className="block text-sm font-semibold text-slate-500">{action.subtitle}</span>
                  </span>
                  <ChevronRight className="ml-auto h-7 w-7 text-slate-700" />
                </Link>
              );
            })}
          </div>
        </DashboardCard>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <DashboardCard title="Applications Overview">
          <LineChart data={stats.applicationsOverview} />
        </DashboardCard>

        <DashboardCard title="Applications by Status">
          <DonutChart data={stats.applicationsByStatus} />
        </DashboardCard>
      </div>

      <DashboardCard title="Recent Candidates" action={<ViewAllButton to="/admin/jobseekers" />}>
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-left text-sm">
            <thead className="bg-white text-slate-700">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Joined On</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentCandidates.length ? stats.recentCandidates.map((candidate) => (
                <tr key={candidate.id} className="border-t border-slate-100">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${candidate.gradient || 'from-slate-400 to-slate-200'} text-sm font-extrabold text-white`}>
                        {candidate.initials}
                      </span>
                      <span>
                        <span className="block text-base font-extrabold text-slate-800">{candidate.name}</span>
                        <span className="block text-sm font-semibold text-slate-400">{candidate.email || '-'}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-base font-semibold text-slate-700">{candidate.jobTitle}</td>
                  <td className="px-6 py-4 text-base font-semibold text-slate-700">{candidate.company}</td>
                  <td className="px-6 py-4 text-base font-semibold text-slate-700">{candidate.joinedOn || '-'}</td>
                  <td className="px-6 py-4"><StatusBadge status={candidate.status} /></td>
                  <td className="px-6 py-4 text-right text-slate-400"><MoreVertical className="ml-auto h-5 w-5" /></td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-sm font-bold text-slate-400">No recent candidates found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination label={`Showing ${stats.recentCandidates.length ? 1 : 0} to ${stats.recentCandidates.length} of ${stats.recentCandidates.length} candidates`} />
      </DashboardCard>

      <DashboardCard title="Recent Job Posting" action={<ViewAllButton to="/admin/jobs" />}>
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="bg-white text-slate-700">
              <tr>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Vacancies</th>
                <th className="px-6 py-4">Posted On</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentJobs.length ? stats.recentJobs.map((job) => (
                <tr key={job.id} className="border-t border-slate-100">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                        <Image className="h-6 w-6" />
                      </span>
                      <span className="text-base font-extrabold text-slate-800">{job.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-base font-semibold text-slate-700">{job.company}</td>
                  <td className="px-6 py-4 text-base font-extrabold text-slate-700">{formatNumber(job.vacancies)}</td>
                  <td className="px-6 py-4 text-base font-semibold text-slate-700">{job.postedOn || '-'}</td>
                  <td className="px-6 py-4"><StatusBadge status={job.status} /></td>
                  <td className="px-6 py-4 text-right text-slate-400"><MoreVertical className="ml-auto h-5 w-5" /></td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-sm font-bold text-slate-400">No recent jobs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination label={`Showing ${stats.recentJobs.length ? 1 : 0} to ${stats.recentJobs.length} of ${stats.recentJobs.length} jobs`} />
      </DashboardCard>
    </div>
  );
};

export default Dashboard;
