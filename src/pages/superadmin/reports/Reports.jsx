import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  Briefcase, 
  FileText, 
  Users, 
  Building2, 
  PieChart, 
  ChevronRight, 
  ArrowLeft, 
  Download, 
  Search, 
  Filter, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';

const reportTypes = [
  {
    id: 'jobs',
    title: 'Job Reports',
    description: 'Shows details of job postings including active, expired, and categorized jobs.',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'blue',
    colorClasses: {
      bg: 'bg-blue-50 text-blue-600',
      hoverBg: 'group-hover:bg-blue-100',
      border: 'border-blue-100',
    },
    stats: [
      { label: 'Total Jobs Posted', value: '1,240' },
      { label: 'Active Jobs', value: '820', color: 'text-emerald-600' },
      { label: 'Expired Jobs', value: '380', color: 'text-rose-600' },
      { label: 'Draft / Pending', value: '40', color: 'text-amber-500' }
    ],
    categories: [
      { name: 'IT & Software', count: 558, percentage: '45%' },
      { name: 'Sales & Marketing', count: 248, percentage: '20%' },
      { name: 'Customer Support', count: 186, percentage: '15%' },
      { name: 'Finance & Accounts', count: 124, percentage: '10%' },
      { name: 'Others', count: 124, percentage: '10%' }
    ]
  },
  {
    id: 'applications',
    title: 'Application Reports',
    description: 'Displays application statuses such as pending, shortlisted, rejected, and selected candidates.',
    icon: <FileText className="w-6 h-6" />,
    color: 'green',
    colorClasses: {
      bg: 'bg-emerald-50 text-emerald-600',
      hoverBg: 'group-hover:bg-emerald-100',
      border: 'border-emerald-100',
    },
    stats: [
      { label: 'Total Applications', value: '4,850' },
      { label: 'Selected', value: '320', color: 'text-emerald-600' },
      { label: 'Shortlisted', value: '890', color: 'text-indigo-600' },
      { label: 'Pending Review', value: '2,400', color: 'text-amber-500' },
      { label: 'Rejected', value: '1,240', color: 'text-rose-600' }
    ],
    categories: [
      { name: 'Shortlisted Rate', count: '18.3%', percentage: '18%' },
      { name: 'Selection Rate', count: '6.6%', percentage: '6%' },
      { name: 'Rejection Rate', count: '25.5%', percentage: '25%' },
      { name: 'Pending Review Rate', count: '49.6%', percentage: '49%' }
    ]
  },
  {
    id: 'candidates',
    title: 'Candidate Reports',
    description: 'Contains candidate profiles, skills, experience, and complete application history details.',
    icon: <Users className="w-6 h-6" />,
    color: 'purple',
    colorClasses: {
      bg: 'bg-purple-50 text-purple-600',
      hoverBg: 'group-hover:bg-purple-100',
      border: 'border-purple-100',
    },
    stats: [
      { label: 'Total Registered Jobseekers', value: '8,430' },
      { label: 'Verified Profiles', value: '6,800', color: 'text-emerald-600' },
      { label: 'Active in Last 30 Days', value: '3,240', color: 'text-indigo-600' },
      { label: 'Fresh Graduates', value: '2,150', color: 'text-blue-600' }
    ],
    categories: [
      { name: 'React Developers', count: 1240, percentage: '15%' },
      { name: 'Sales Executives', count: 980, percentage: '12%' },
      { name: 'Digital Marketers', count: 820, percentage: '10%' },
      { name: 'Node.js Engineers', count: 750, percentage: '9%' },
      { name: 'UI/UX Designers', count: 510, percentage: '6%' }
    ]
  },
  {
    id: 'employers',
    title: 'Employer Reports',
    description: 'Includes employer information, job postings, hiring activity, and account-related records.',
    icon: <Building2 className="w-6 h-6" />,
    color: 'orange',
    colorClasses: {
      bg: 'bg-orange-50 text-orange-600',
      hoverBg: 'group-hover:bg-orange-100',
      border: 'border-orange-100',
    },
    stats: [
      { label: 'Total Registered Employers', value: '450' },
      { label: 'Active Job Posters', value: '180', color: 'text-emerald-600' },
      { label: 'Premium Subscribed', value: '95', color: 'text-indigo-600' },
      { label: 'Pending Verification', value: '12', color: 'text-amber-500' }
    ],
    categories: [
      { name: 'Google (India)', count: '24 jobs', percentage: '15%' },
      { name: 'Meta', count: '18 jobs', percentage: '12%' },
      { name: 'TCS', count: '35 jobs', percentage: '22%' },
      { name: 'Infosys', count: '28 jobs', percentage: '18%' },
      { name: 'Wipro', count: '15 jobs', percentage: '10%' }
    ]
  },
  {
    id: 'finance',
    title: 'Finance Reports',
    description: 'Provides payment transactions, subscription details, and overall revenue performance data.',
    icon: <PieChart className="w-6 h-6" />,
    color: 'green',
    colorClasses: {
      bg: 'bg-emerald-50 text-emerald-600',
      hoverBg: 'group-hover:bg-emerald-100',
      border: 'border-emerald-100',
    },
    stats: [
      { label: 'Total Revenue Generated', value: '₹12,45,000' },
      { label: 'Employer Subscriptions', value: '₹8,50,000', color: 'text-indigo-600' },
      { label: 'Jobseeker Premium Upgrades', value: '₹2,75,000', color: 'text-blue-600' },
      { label: 'Individual Job Boosts', value: '₹1,20,000', color: 'text-emerald-600' }
    ],
    categories: [
      { name: 'Quarter 1', count: '₹2,80,000', percentage: '22%' },
      { name: 'Quarter 2', count: '₹3,40,000', percentage: '27%' },
      { name: 'Quarter 3', count: '₹4,10,000', percentage: '33%' },
      { name: 'Quarter 4 (Current)', count: '₹2,15,000', percentage: '18%' }
    ]
  }
];

export const Reports = () => {
  const navigate = useNavigate();
  const [selectedReportId, setSelectedReportId] = useState(null);

  const [dateRange, setDateRange] = useState('30days');
  const [exporting, setExporting] = useState(false);

  const selectedReport = reportTypes.find(r => r.id === selectedReportId);

  const handleExport = (format) => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert(`Report exported successfully as ${format.toUpperCase()}!`);
    }, 1200);
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-slate-800">
          {selectedReport ? selectedReport.title : 'Reports'}
        </h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <span>JobsWaale</span>
          <span>&gt;</span>
          <span 
            className={`cursor-pointer ${!selectedReport ? 'text-indigo-600' : 'hover:text-indigo-600'}`}
            onClick={() => setSelectedReportId(null)}
          >
            Reports
          </span>
          {selectedReport && (
            <>
              <span>&gt;</span>
              <span className="text-indigo-600">{selectedReport.title}</span>
            </>
          )}
        </div>
      </div>

      {!selectedReport ? (
        /* Main Grid View */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden -ml-3 lg:-ml-5">
          {/* Card Header */}
          <div className="px-5 py-4 border-b border-slate-100">
            <h4 className="text-base font-bold text-slate-800">System Reports Overview</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              The Reports section provides an overview of all system-generated reports related to job postings, applications, candidates, employers, and financial activities. It helps administrators monitor and analyze platform performance.
            </p>
          </div>

          {/* Grid Body */}
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map(report => (
                <button
                  key={report.id}
                  onClick={() => {
                    if (report.id === 'jobs' || report.id === 'applications' || report.id === 'candidates' || report.id === 'employers' || report.id === 'finance') {
                      navigate(`/admin/reports/${report.id}`);
                    } else {
                      setSelectedReportId(report.id);
                    }


                  }}
                  type="button"

                  className="group flex items-start text-left p-4 border border-slate-200 rounded-xl hover:shadow-md hover:border-indigo-100 bg-white transition-all duration-200 cursor-pointer"
                >
                  <div className={`shrink-0 p-3 rounded-lg transition-colors ${report.colorClasses.bg} ${report.colorClasses.hoverBg}`}>
                    {report.icon}
                  </div>

                  <div className="ml-4 flex-grow pr-2">
                    <h5 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {report.title}
                    </h5>
                    <p className="text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  <div className="shrink-0 self-center">
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Report Category View */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden -ml-3 lg:-ml-5">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedReportId(null)}
                className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
              <div>
                <h4 className="text-base font-bold text-slate-800">{selectedReport.title} Analysis</h4>
                <p className="text-xs text-slate-400 mt-0.5 font-normal">Real-time statistics & system logs</p>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="thismonth">This Month</option>
                  <option value="alltime">All Time</option>
                </select>
              </div>

              {/* Export Buttons */}
              <button
                type="button"
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                disabled={exporting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </button>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Stats Cards Widget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedReport.stats.map((stat, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-xs font-semibold text-slate-500 block">{stat.label}</span>
                  <span className={`text-2xl font-extrabold block mt-2 ${stat.color || 'text-slate-800'}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Panel: Distribution Chart representation & data table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Distribution */}
              <div className="lg:col-span-1 p-5 border border-slate-100 rounded-xl bg-slate-50/50">
                <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Distribution Summary
                </h5>
                <div className="space-y-4">
                  {selectedReport.categories.map((cat, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-600">{cat.name}</span>
                        <span className="text-slate-800">{cat.count}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full" 
                          style={{ width: cat.percentage }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Table */}
              <div className="lg:col-span-2 p-5 border border-slate-100 rounded-xl bg-white">
                <h5 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
                  <span>Recent Records Log</span>
                  <span className="text-xs font-normal text-slate-400">Showing last 5 active logs</span>
                </h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 bg-slate-50/50">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Entity Name</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Action Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-3 text-slate-500">20 Jun 2026</td>
                        <td className="py-3 px-3 text-slate-700">Senior React Developer</td>
                        <td className="py-3 px-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px]">SUCCESS</span></td>
                        <td className="py-3 px-3 text-slate-500">Published to platform</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 text-slate-500">19 Jun 2026</td>
                        <td className="py-3 px-3 text-slate-700">Rahul Sharma (Jobseeker)</td>
                        <td className="py-3 px-3"><span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[10px]">VERIFIED</span></td>
                        <td className="py-3 px-3 text-slate-500">Profile approved by system</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 text-slate-500">19 Jun 2026</td>
                        <td className="py-3 px-3 text-slate-700">Meta Inc. (Employer)</td>
                        <td className="py-3 px-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px]">SUCCESS</span></td>
                        <td className="py-3 px-3 text-slate-500">Quarterly billing plan renew</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 text-slate-500">18 Jun 2026</td>
                        <td className="py-3 px-3 text-slate-700">Node.js Intern Application</td>
                        <td className="py-3 px-3"><span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px]">PENDING</span></td>
                        <td className="py-3 px-3 text-slate-500">Pending review from recruiter</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 text-slate-500">17 Jun 2026</td>
                        <td className="py-3 px-3 text-slate-700">TCS (Tech Solutions)</td>
                        <td className="py-3 px-3"><span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-full text-[10px]">REJECTED</span></td>
                        <td className="py-3 px-3 text-slate-500">Incorrect GSTIN document upload</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
