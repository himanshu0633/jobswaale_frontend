import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CalendarCheck,
  CheckCircle,
  MapPin,
  MessageCircle,
  Send,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BASE_API_URL } from '../../../context/AuthContext';

const statConfig = [
  { key: 'total', label: 'Total Applied', icon: Send, tone: 'bg-sky-50 text-sky-600' },
  { key: 'shortlisted', label: 'Shortlisted', icon: CheckCircle, tone: 'bg-emerald-50 text-emerald-600' },
  { key: 'interview', label: 'Interview', icon: CalendarCheck, tone: 'bg-amber-50 text-amber-600' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, tone: 'bg-violet-50 text-violet-600' }
];

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview', label: 'Interview' },
  { key: 'rejected', label: 'Rejected' }
];

const statusStyles = {
  applied: 'bg-blue-50 text-blue-600',
  pending: 'bg-amber-50 text-amber-600',
  shortlisted: 'bg-emerald-50 text-emerald-600',
  interview: 'bg-sky-50 text-sky-600',
  rejected: 'bg-rose-50 text-rose-600'
};

const statusLabels = {
  applied: 'Applied',
  pending: 'Pending',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  rejected: 'Rejected'
};

const canJobseekerMessage = (status) => ['shortlisted', 'interview', 'offered'].includes(String(status || '').toLowerCase());

export const JobseekerApplications = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('publicToken');
        const res = await axios.get(`${BASE_API_URL}/jobseeker/applications`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setAppliedJobs(res.data || []);
      } catch (err) {
        console.error('Fetch applications error:', err);
        setError('Failed to load applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const countByStatus = (status) => {
    if (status === 'all') return appliedJobs.length;
    return appliedJobs.filter(job => String(job.status).toLowerCase() === status).length;
  };

  const stats = {
    total: { value: appliedJobs.length },
    shortlisted: { value: countByStatus('shortlisted') },
    interview: { value: countByStatus('interview') },
    rejected: { value: countByStatus('rejected') }
  };

  const visibleJobs = activeFilter === 'all'
    ? appliedJobs
    : appliedJobs.filter(job => String(job.status).toLowerCase() === activeFilter);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0047C7] border-t-transparent"/>
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
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    {item.label}
                  </p>
                  <p className="text-2xl font-bold text-[#0f172a]">
                    {stats[item.key]?.value || 0}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 rounded-md border border-slate-100 bg-white p-3 shadow-sm">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
              activeFilter === tab.key
                ? 'bg-[#0047C7] text-white'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab.label} ({countByStatus(tab.key)})
          </button>
        ))}
      </div>

      {/* Applied Jobs List */}
      <div className="space-y-3">
        {visibleJobs.length === 0 && (
          <div className="rounded-md border border-slate-100 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-400">
              No applications in this category yet.
            </p>
          </div>
        )}

        {visibleJobs.map(job => (
          <div
            key={job.id}
            className="flex flex-col gap-4 rounded-md border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 sm:flex-row sm:items-center"
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-lg font-bold text-white"
              style={{ background: job.color || '#0047C7' }}
            >
              {job.initial}
            </div>

            <div className="flex-1">
              <div className="font-bold text-slate-800">
                {job.title}
              </div>
              <div className="text-sm font-semibold text-slate-500">
                {job.company}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-400">
                <MapPin className="h-3.5 w-3.5" />
                {job.location} · Applied on {job.appliedOn}
              </div>
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusStyles[job.status] || 'bg-slate-50 text-slate-500'}`}
            >
              {statusLabels[job.status] || job.status}
            </span>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                to={`/jobs/${job.jobId}`}
                className={`rounded-md px-4 py-2 text-center text-sm font-bold transition ${
                  job.status === 'interview'
                    ? 'bg-[#0047C7] text-white hover:bg-[#00389c]'
                    : job.status === 'rejected'
                    ? 'border border-slate-200 text-slate-400 hover:bg-slate-50'
                    : 'border border-[#0047C7] text-[#0047C7] hover:bg-blue-50'
                }`}
              >
                {job.status === 'interview' ? 'View Details' : 'View'}
              </Link>
              {canJobseekerMessage(job.status) && (
                <Link
                  to={`/jobseeker/messages?application=${job.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-sky-200 px-4 py-2 text-sm font-bold text-sky-600 transition hover:bg-sky-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobseekerApplications;
