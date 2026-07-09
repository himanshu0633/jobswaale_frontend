import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ArrowRight,
  Briefcase,
  CalendarCheck,
  CheckCircle,
  Eye,
  MapPin,
  Send
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BASE_API_URL } from '../../../context/AuthContext';

const emptyDashboard = {
  user: {},
  stats: {},
  recentActivity: [],
  recommendedJobs: []
};

// Dummy data from HTML
const dummyDashboard = {
  user: {
    name: 'Rahul Kumar',
    initials: 'RK',
    role: 'Job Seeker',
    plan: 'Free Plan'
  },
  stats: {
    jobsApplied: {
      value: 6,
      change: '+2 this week'
    },
    shortlisted: {
      value: 3,
      change: '+1 this week'
    },
    interviews: {
      value: 2,
      change: 'Scheduled'
    },
    profileViews: {
      value: 28,
      change: '+5 this week'
    }
  },
  recentActivity: [
    {
      type: 'accepted',
      text: 'Your application for Frontend Developer at Microsoft was shortlisted',
      time: '2 hours ago'
    },
    {
      type: 'pending',
      text: 'Application sent for UI/UX Designer at TCS',
      time: '1 day ago'
    },
    {
      type: 'viewed',
      text: 'Infosys viewed your profile',
      time: '2 days ago'
    },
    {
      type: 'accepted',
      text: 'Interview scheduled with Wipro for HR Executive position',
      time: '3 days ago'
    },
    {
      type: 'rejected',
      text: 'Application for System Analyst at Infosys was not selected',
      time: '5 days ago'
    },
    {
      type: 'pending',
      text: 'Application sent for Frontend Developer at Google',
      time: '1 week ago'
    }
  ],
  recommendedJobs: [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'Google',
      location: 'Bangalore, KA',
      salary: '₹20 - 35 LPA',
      type: 'Full Time',
      logo: 'G'
    },
    {
      id: 2,
      title: 'React Developer',
      company: 'Amazon',
      location: 'Hyderabad, TS',
      salary: '₹12 - 18 LPA',
      type: 'Full Time',
      logo: 'A'
    },
    {
      id: 3,
      title: 'Software Engineer',
      company: 'Flipkart',
      location: 'Bangalore, KA',
      salary: '₹8 - 14 LPA',
      type: 'Full Time',
      logo: 'F'
    }
  ]
};

const statConfig = [
  {
    key: 'jobsApplied',
    label: 'Jobs Applied',
    icon: Send,
    tone: 'bg-sky-50 text-sky-600'
  },
  {
    key: 'shortlisted',
    label: 'Shortlisted',
    icon: CheckCircle,
    tone: 'bg-emerald-50 text-emerald-600'
  },
  {
    key: 'interviews',
    label: 'Interviews',
    icon: CalendarCheck,
    tone: 'bg-amber-50 text-amber-600'
  },
  {
    key: 'profileViews',
    label: 'Profile Views',
    icon: Eye,
    tone: 'bg-indigo-50 text-indigo-600'
  }
];

const activityColors = {
  accepted: 'bg-emerald-500',
  pending: 'bg-amber-500',
  rejected: 'bg-rose-500',
  viewed: 'bg-blue-500'
};

export const JobseekerDashboard = () => {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [useDummyData, setUseDummyData] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem('publicToken');

        const response = await axios.get(
          `${BASE_API_URL}/jobseeker/dashboard`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {}
          }
        );

        setDashboard({
          ...emptyDashboard,
          ...response.data
        });
        setUseDummyData(false);

      } catch (err) {
        // Use dummy data if API fails
        setDashboard(dummyDashboard);
        setUseDummyData(true);
        setError(
          err.response?.data?.message ||
          'Dashboard data could not be loaded. Showing sample data.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0047C7] border-t-transparent"/>
      </div>
    );
  }

  const stats = dashboard.stats || {};

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statConfig.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="rounded-md border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-13 w-13 items-center justify-center rounded-xl ${item.tone}`}
                >
                  <Icon className="h-6 w-6"/>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    {item.label}
                  </p>
                  <p className="text-2xl font-bold text-[#0f172a]">
                    {stats[item.key]?.value || 0}
                  </p>
                  {stats[item.key]?.change && (
                    <p className={`text-xs font-semibold ${
                      stats[item.key].change.includes('+') || stats[item.key].change === 'Scheduled'
                        ? 'text-emerald-500'
                        : 'text-rose-500'
                    }`}>
                      {stats[item.key].change}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity + Recommended */}
      <div className="grid gap-6 lg:grid-cols-7">

        {/* Recent Activity */}
        <section className="lg:col-span-4 rounded-md border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-[#0f172a] m-0">
              Recent Activity
            </h2>
            <Link
              to="/jobseeker/jobs-applied"
              className="text-sm font-semibold text-[#0047C7] hover:text-[#0035a0] transition-colors inline-flex items-center gap-1"
            >
              View All <ArrowRight className="h-3.5 w-3.5"/>
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {dashboard.recentActivity.map((item, index) => (
              <div
                key={index}
                className="flex gap-3 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <span
                  className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                    activityColors[item.type] || 'bg-slate-400'
                  }`}
                />
                <div>
                  <p 
                    className="text-sm text-slate-600"
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  />
                  <p className="text-xs font-medium text-slate-400">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recommended Jobs */}
        <section className="lg:col-span-3 rounded-md border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-[#0f172a] m-0">
              Recommended Jobs
            </h2>
            <Link
              to="/jobs"
              className="text-sm font-semibold text-[#0047C7] hover:text-[#0035a0] transition-colors inline-flex items-center gap-1"
            >
              View All <ArrowRight className="h-3.5 w-3.5"/>
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {dashboard.recommendedJobs.map(job => (
              <div
                key={job.id}
                className="px-6 py-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Company Logo */}
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${
                    job.company === 'Google' ? 'bg-blue-600' :
                    job.company === 'Amazon' ? 'bg-emerald-600' :
                    job.company === 'Flipkart' ? 'bg-amber-500 text-slate-800' :
                    'bg-slate-600'
                  }`}>
                    {job.logo || job.company.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-[15px] leading-tight">
                      <Link to={`/jobs/${job.id}`} className="text-slate-800 hover:text-[#0047C7] transition-colors">
                        {job.title}
                      </Link>
                    </h3>
                    <p className="text-sm font-medium text-slate-500">
                      {job.company}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3.5 w-3.5"/>
                      <span>{job.location}</span>
                    </div>
                  </div>
                </div>

                {/* Job Footer */}
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
                  {job.salary && (
                    <span className="text-sm font-bold text-slate-800">
                      {job.salary}
                    </span>
                  )}
                  {job.type && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                      {job.type}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default JobseekerDashboard;