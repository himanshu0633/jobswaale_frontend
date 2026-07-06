import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';
import {
  ArrowUp,
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

// Theme tones lifted 1:1 from the template's CSS custom properties
// (--ins-primary / --ins-success / --ins-warning / --ins-danger / --ins-info / --ins-secondary
// and their matching *-bg-subtle values), so badges, stat icons and quick-action
// icons all resolve to the exact same hex values as the source HTML/CSS.
const tones = {
  primary: { bg: 'bg-[#e8e6fa]', text: 'text-[#6658dd]' },
  success: { bg: 'bg-[#ddf5f0]', text: 'text-[#1abc9c]' },
  warning: { bg: 'bg-[#fef4e4]', text: 'text-[#f7b84b]' },
  danger: { bg: 'bg-[#fde6e9]', text: 'text-[#f1556c]' },
  info: { bg: 'bg-[#e3f5fb]', text: 'text-[#43bfe5]' },
  secondary: { bg: 'bg-[#e4ecf9]', text: 'text-[#4a81d4]' }
};

const statusTone = {
  Applied: 'success',
  Active: 'success',
  Interview: 'primary',
  Shortlisted: 'warning',
  Pending: 'warning',
  Expired: 'danger',
  Inactive: 'secondary',
  Selected: 'info',
  Blacklist: 'danger'
};

const quickActions = [
  { title: 'Add New Job', subtitle: 'Post a new job opening', icon: Plus, color: 'bg-blue-600', to: '/admin/jobs/add' },
  { title: 'Verify Candidates', subtitle: 'Review pending candidates', icon: Check, color: 'bg-green-500', to: '/admin/jobseekers' },
  { title: 'Manage Applications', subtitle: 'View and manage applications', icon: Briefcase, color: 'bg-purple-600', to: '/admin/jobs' },
  { title: 'View Payments', subtitle: 'Track payments and transactions', icon: CreditCard, color: 'bg-orange-500', to: '/admin' },
  { title: 'Generate Report', subtitle: 'Download performance report', icon: FileText, color: 'bg-green-500', to: '/admin' }
];

const StatusBadge = ({ status }) => {
  const tone = tones[statusTone[status] || 'secondary'];
  return (
    <span className={`inline-block rounded-[5px] px-2 py-1 text-xs font-bold ${tone.bg} ${tone.text}`}>
      {status}
    </span>
  );
};

const Pagination = ({ label }) => (
  <div className="flex flex-col gap-3 border-t border-dashed border-[#cbd2d9] px-6 py-4 text-sm text-[#9ba6b7] sm:flex-row sm:items-center sm:justify-between">
    <span>{label}</span>
    <div className="flex items-center gap-1">
      <button className="flex h-9 w-9 items-center justify-center rounded-[5px] border border-[#e7e9eb] text-[#9ba6b7]">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-[#6658dd] text-white">1</button>
      <button className="flex h-9 w-9 items-center justify-center rounded-[5px] border border-[#e7e9eb] text-[#4c4c5c]">2</button>
      <button className="flex h-9 w-9 items-center justify-center rounded-[5px] border border-[#e7e9eb] text-[#4c4c5c]">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const DashboardCard = ({ title, children, action }) => (
  <section className="overflow-hidden rounded-[5px] bg-white shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)]">
    <div className="flex min-h-[56px] items-center justify-between border-b border-dashed border-[#cbd2d9] px-6 py-[18px]">
      <h2 className="text-base font-semibold text-[#4c4c5c]">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

const ViewAllButton = ({ to }) => (
  <Link to={to} className="inline-flex items-center gap-1.5 rounded-[5px] bg-[#6658dd] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#5a4dd0]">
    <Eye className="h-4 w-4" />
    View All
  </Link>
);

const StatCard = ({ icon: Icon, value, title, tone }) => {
  const t = tones[tone];
  return (
    <div className="rounded-[5px] bg-white p-2 shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)]">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[5px] ${t.bg} ${t.text}`}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="text-right">
          <h3 className="mb-0 text-2xl font-semibold text-[#4c4c5c]">{formatNumber(value)}</h3>
          <p className="mb-0 text-sm text-[#9ba6b7]">{title}</p>
        </div>
      </div>
      <div className="mt-3 text-sm text-[#9ba6b7]">
        <span className="inline-flex items-center gap-0.5 font-bold text-[#1abc9c]">
          <ArrowUp className="h-3.5 w-3.5" />
          12.5%
        </span>{' '}
        from last week
      </div>
    </div>
  );
};

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
    <div className="px-6 py-6">
      <svg viewBox="0 0 660 220" className="h-72 w-full">
        {[50, 100, 150].map((y) => (
          <line key={y} x1="0" x2="660" y1={y} y2={y} stroke="#e8eef7" strokeDasharray="7 10" />
        ))}
        <text x="0" y="52" fill="#9ba6b7" fontSize="16">{formatNumber(maxValue)}</text>
        <text x="10" y="102" fill="#9ba6b7" fontSize="16">{formatNumber(Math.round(maxValue * 0.6))}</text>
        <text x="10" y="152" fill="#9ba6b7" fontSize="16">{formatNumber(Math.round(maxValue * 0.3))}</text>
        <path d={`M ${points}`} fill="none" stroke="#6658dd" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.split(' ').map((point) => {
          const [cx, cy] = point.split(',');
          return <circle key={point} cx={cx} cy={cy} r="5" fill="white" stroke="#6658dd" strokeWidth="4" />;
        })}
        {rows.map((item, index) => (
          <text key={`${item.label}-${index}`} x={rows.length === 1 ? 0 : index * (width / rows.length)} y="210" fill="#9ba6b7" fontSize="16">{item.label}</text>
        ))}
      </svg>
    </div>
  );
};

const DonutChart = ({ data = {} }) => {
  const total = Number(data.total || 0);
  const rows = [
    ['#6658dd', 'Applied', Number(data.applied || 0)],
    ['#f7b84b', 'Shortlisted', Number(data.shortlisted || 0)],
    ['#43bfe5', 'Interview', Number(data.interview || 0)],
    ['#1abc9c', 'Hired', Number(data.hired || 0)],
    ['#f1556c', 'Rejected', Number(data.rejected || 0)]
  ];
  let cursor = 0;
  const gradient = total
    ? rows.map(([color, , value]) => {
      const start = cursor;
      cursor += (value / total) * 100;
      return `${color} ${start}% ${cursor}%`;
    }).join(', ')
    : '#e7e9eb 0% 100%';

  return (
  <div className="grid gap-6 px-6 py-6 md:grid-cols-[240px_minmax(0,1fr)] md:items-center">
    <div className="relative mx-auto h-56 w-56 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
      <div className="absolute inset-10 flex flex-col items-center justify-center rounded-full bg-white">
        <span className="text-3xl font-semibold text-[#4c4c5c]">{formatNumber(total)}</span>
        <span className="text-sm text-[#9ba6b7]">Total</span>
      </div>
    </div>
    <div className="space-y-4 text-sm font-semibold text-[#4c4c5c]">
      {rows.map(([color, label, value]) => (
        <div key={label} className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
          <span>{label}</span>
          <span className="ml-auto font-normal text-[#9ba6b7]">{formatNumber(value)} ({total ? ((value / total) * 100).toFixed(1) : '0.0'}%)</span>
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
        <Loader className="h-8 w-8 animate-spin text-[#6658dd]" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Jobs', value: stats.jobsPosted, icon: Briefcase, tone: 'primary' },
    { title: 'Active Jobs', value: stats.activeJobs, icon: ClipboardCheck, tone: 'success' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, tone: 'warning' },
    { title: 'Active Users', value: stats.activeUsers, icon: UserRound, tone: 'danger' },
    { title: 'Companies', value: stats.employers, icon: Building2, tone: 'info' },
    { title: 'Active Companies', value: stats.activeCompanies, icon: Home, tone: 'secondary' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 py-1 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-bold text-[#4c4c5c]">Dashboard</h1>
        <div className="flex items-center gap-1 text-sm text-[#9ba6b7]">
          <span>JobsWaale</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#9ba6b7]">Dashboard</span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[7fr_5fr]">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {statCards.map((card) => <StatCard key={card.title} {...card} />)}
        </div>

        <DashboardCard title="Quick Actions">
          <div className="p-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.to}
                  className="flex items-center gap-3 rounded-xl border border-[#e9edf5] p-[10.5px] text-[#4c4c5c] transition hover:border-[#d8e0ee] hover:bg-[#f2f6fc] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                >
                  <span className={`flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-lg text-white ${action.color}`}>
                    <Icon className="h-[22px] w-[22px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-[#0f172a]">{action.title}</span>
                    <span className="block text-sm text-[#64748b]">{action.subtitle}</span>
                  </span>
                  <ChevronRight className="ml-auto h-6 w-6 font-bold text-[#334155]" />
                </Link>
              );
            })}
          </div>
        </DashboardCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2 h-90">
        <DashboardCard title="Applications Overview">
          <LineChart data={stats.applicationsOverview} />
        </DashboardCard>

        <DashboardCard title="Applications by Status">
          <DonutChart data={stats.applicationsByStatus} />
        </DashboardCard>
      </div>

      <DashboardCard title="Recent Job Posting" action={<ViewAllButton to="/admin/jobs" />}>
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead>
              <tr className="text-[#4c4c5c]">
                <th className="px-[18px] py-3 font-semibold">Job Title</th>
                <th className="px-2 py-3 font-semibold">Company</th>
                <th className="px-2 py-3 font-semibold">Applications</th>
                <th className="px-2 py-3 font-semibold">Posted On</th>
                <th className="px-2 py-3 font-semibold">Status</th>
                <th className="px-[18px] py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentJobs.length ? stats.recentJobs.map((job) => (
                <tr key={job.id} className="border-t border-[#e7e9eb]">
                  <td className="px-[18px] py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6658dd]/10 text-[#6658dd]">
                        <Image className="h-[18px] w-[18px]" />
                      </span>
                      <span className="text-sm font-semibold text-[#4c4c5c]">{job.title}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 font-normal text-[#4c4c5c]">{job.company}</td>
                  <td className="px-2 py-3 font-normal text-[#4c4c5c]">{formatNumber(job.vacancies)}</td>
                  <td className="px-2 py-3 font-normal text-[#4c4c5c]">{job.postedOn || '-'}</td>
                  <td className="px-2 py-3"><StatusBadge status={job.status} /></td>
                  <td className="px-[18px] py-3 text-right text-[#9ba6b7]"><MoreVertical className="ml-auto h-[18px] w-[18px]" /></td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-[#9ba6b7]">No recent jobs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination label={`Showing ${stats.recentJobs.length ? 1 : 0} to ${stats.recentJobs.length} of ${stats.recentJobs.length} jobs`} />
      </DashboardCard>

      <DashboardCard title="Recent Candidates" action={<ViewAllButton to="/admin/jobseekers" />}>
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-left text-sm">
            <thead>
              <tr className="text-[#4c4c5c]">
                <th className="px-[18px] py-3 font-semibold">Candidate</th>
                <th className="px-2 py-3 font-semibold">Job Title</th>
                <th className="px-2 py-3 font-semibold">Company</th>
                <th className="px-2 py-3 font-semibold">Applied On</th>
                <th className="px-2 py-3 font-semibold">Status</th>
                <th className="px-[18px] py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentCandidates.length ? stats.recentCandidates.map((candidate) => (
                <tr key={candidate.id} className="border-t border-[#e7e9eb]">
                  <td className="px-[18px] py-3">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${candidate.gradient || 'from-slate-400 to-slate-200'} text-xs font-bold text-white`}>
                        {candidate.initials}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-[#4c4c5c]">{candidate.name}</span>
                        <span className="block text-xs text-[#9ba6b7]">{candidate.email || '-'}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-3 font-normal text-[#4c4c5c]">{candidate.jobTitle}</td>
                  <td className="px-2 py-3 font-normal text-[#4c4c5c]">{candidate.company}</td>
                  <td className="px-2 py-3 font-normal text-[#4c4c5c]">{candidate.joinedOn || '-'}</td>
                  <td className="px-2 py-3"><StatusBadge status={candidate.status} /></td>
                  <td className="px-[18px] py-3 text-right text-[#9ba6b7]"><MoreVertical className="ml-auto h-[18px] w-[18px]" /></td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-[#9ba6b7]">No recent candidates found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination label={`Showing ${stats.recentCandidates.length ? 1 : 0} to ${stats.recentCandidates.length} of ${stats.recentCandidates.length} candidates`} />
      </DashboardCard>
    </div>
  );
};

export default Dashboard;