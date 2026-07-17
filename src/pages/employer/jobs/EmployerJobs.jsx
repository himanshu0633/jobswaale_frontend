import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  ChevronRight,
  Clock,
  Copy,
  Edit,
  Eye,
  FilePenLine,
  Lock,
  Loader,
  Pause,
  Plus,
  RefreshCw,
  Search,
  Trash2
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const emptyJobs = {
  stats: { active: 0, draft: 0, expiring: 0, closed: 0 },
  filters: { locations: [], jobTypes: [] },
  jobs: []
};

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatDate = (value, fallback = '-') => {
  if (!value) return fallback;
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
};

const statusTone = {
  Active: 'bg-emerald-50 text-emerald-600',
  Draft: 'bg-amber-50 text-amber-600',
  Expiring: 'bg-rose-50 text-rose-600',
  Paused: 'bg-slate-100 text-slate-600',
  Closed: 'bg-slate-100 text-slate-600'
};

const statCards = [
  { key: 'active', title: 'Active Jobs', icon: Briefcase, tone: 'bg-emerald-50 text-emerald-500' },
  { key: 'draft', title: 'Draft Jobs', icon: FilePenLine, tone: 'bg-amber-50 text-amber-500' },
  { key: 'expiring', title: 'Expiring Soon', icon: Clock, tone: 'bg-rose-50 text-rose-500' },
  { key: 'closed', title: 'Closed Jobs', icon: Lock, tone: 'bg-slate-100 text-slate-500' }
];

export const EmployerJobs = () => {
  const [data, setData] = useState(emptyJobs);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [duplicatingJobId, setDuplicatingJobId] = useState('');
  const [actionState, setActionState] = useState({ jobId: '', action: '' });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    location: '',
    jobType: '',
    postDate: ''
  });

  const loadJobs = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${BASE_API_URL}/employer/jobs`, { headers: getTokenHeaders() });
      setData({ ...emptyJobs, ...response.data });
    } catch (err) {
      setError(err.response?.data?.message || 'Jobs could not be loaded.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const postDate = filters.postDate ? new Date(filters.postDate) : null;

    return (data.jobs || []).filter((job) => {
      const matchesSearch = !search
        || [job.title, job.location, job.jobType, job.category].some((value) => String(value || '').toLowerCase().includes(search));
      const matchesStatus = !filters.status || job.status === filters.status;
      const matchesLocation = !filters.location || String(job.location || '').includes(filters.location);
      const matchesType = !filters.jobType || job.jobType === filters.jobType;
      const matchesDate = !postDate || (job.postDate && new Date(job.postDate) >= postDate);

      return matchesSearch && matchesStatus && matchesLocation && matchesType && matchesDate;
    });
  }, [data.jobs, filters]);

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const resetFilters = () => setFilters({ search: '', status: '', location: '', jobType: '', postDate: '' });
  const duplicateJob = async (jobId) => {
    setDuplicatingJobId(jobId);
    setMessage('');
    setError('');
    try {
      await axios.post(`${BASE_API_URL}/employer/jobs/${jobId}/duplicate`, {}, { headers: getTokenHeaders() });
      setMessage('Job duplicated successfully. Copy saved in draft.');
      await loadJobs({ silent: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to duplicate job.');
    } finally {
      setDuplicatingJobId('');
    }
  };
  const runJobAction = async (jobId, action) => {
    const confirmMessages = {
      delete: 'Are you sure you want to delete this job?',
      close: 'Are you sure you want to close this job?'
    };

    if (confirmMessages[action] && !window.confirm(confirmMessages[action])) {
      return;
    }

    setActionState({ jobId, action });
    setMessage('');
    setError('');
    try {
      if (action === 'delete') {
        await axios.delete(`${BASE_API_URL}/employer/jobs/${jobId}`, { headers: getTokenHeaders() });
      } else {
        await axios.patch(`${BASE_API_URL}/employer/jobs/${jobId}/action`, { action }, { headers: getTokenHeaders() });
      }
      const messages = {
        pause: 'Job paused successfully.',
        close: 'Job closed successfully.',
        reopen: 'Job reopened successfully.',
        renew: 'Job renewed successfully.',
        publish: 'Draft published successfully.',
        delete: 'Job deleted successfully.'
      };
      setMessage(messages[action] || 'Job updated successfully.');
      await loadJobs({ silent: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete job action.');
    } finally {
      setActionState({ jobId: '', action: '' });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-[#6658dd]" />
      </div>
    );
  }

  const renderRowActions = (job) => (
    <>
      <Link to={`/employer/jobs/${job.id}`} title="View" className="rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#6658dd]"><Eye className="h-4 w-4" /></Link>
      <Link to={`/employer/jobs/${job.id}/edit`} title={job.status === 'Draft' ? 'Continue Draft' : 'Edit'} className="rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#6658dd]"><Edit className="h-4 w-4" /></Link>
      <button type="button" title="Duplicate" onClick={() => duplicateJob(job.id)} disabled={duplicatingJobId === job.id} className="rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#6658dd] disabled:opacity-60">
        {duplicatingJobId === job.id ? <Loader className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
      </button>
      {job.status === 'Closed' || job.status === 'Paused' || job.status === 'Expiring' ? (
        <button type="button" title={job.status === 'Expiring' ? 'Renew' : 'Reopen'} onClick={() => runJobAction(job.id, job.status === 'Expiring' ? 'renew' : 'reopen')} disabled={actionState.jobId === job.id} className="rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-600 disabled:opacity-60">
          {actionState.jobId === job.id && ['renew', 'reopen'].includes(actionState.action) ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </button>
      ) : (
        <button type="button" title={job.status === 'Draft' ? 'Publish' : 'Pause'} onClick={() => runJobAction(job.id, job.status === 'Draft' ? 'publish' : 'pause')} disabled={actionState.jobId === job.id} className="rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-amber-600 disabled:opacity-60">
          {actionState.jobId === job.id && ['pause', 'publish'].includes(actionState.action) ? <Loader className="h-4 w-4 animate-spin" /> : <Pause className="h-4 w-4" />}
        </button>
      )}
      <button type="button" title="Delete" onClick={() => runJobAction(job.id, 'delete')} disabled={actionState.jobId === job.id} className="rounded p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60">
        {actionState.jobId === job.id && actionState.action === 'delete' ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </>
  );

  return (
    <div className="space-y-4 px-3 sm:space-y-5 sm:px-0">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center md:gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-[#3f4254] sm:text-xl">Manage Jobs</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 sm:text-sm">
          <span className="text-[#3f4254]">JobsWaale</span>
          <ChevronRight className="h-4 w-4" />
          <span>Jobs</span>
          <ChevronRight className="h-4 w-4" />
          <span>Manage Jobs</span>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statCards.map((card) => (
          <section key={card.key} className="rounded-md border border-slate-100 bg-white p-3 shadow-sm sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${card.tone}`}>
                <card.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-400 sm:text-sm">{card.title}</p>
                <p className="mt-1 text-lg font-black text-[#3f4254] sm:text-2xl">{data.stats?.[card.key] || 0}</p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-md border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-dashed border-slate-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Job Listings</h2>
            <p className="mt-1 text-xs font-semibold text-slate-400 sm:text-sm">Track published, draft, expiring, and closed roles from one place.</p>
          </div>
          <Link to="/employer/jobs/create" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white transition hover:bg-[#5848d8]">
            <Plus className="h-4 w-4" />
            Post a Job
          </Link>
        </div>

        <div className="p-4 sm:p-5">
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-500">Job Title</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100"
                  value={filters.search}
                  onChange={(event) => setFilter('search', event.target.value)}
                  placeholder="Title, skill, location"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-500">Status</label>
              <select className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]" value={filters.status} onChange={(event) => setFilter('status', event.target.value)}>
                <option value="">All Status</option>
                <option>Active</option>
                <option>Draft</option>
                <option>Expiring</option>
                <option>Paused</option>
                <option>Closed</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-500">Locations</label>
              <select className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]" value={filters.location} onChange={(event) => setFilter('location', event.target.value)}>
                <option value="">All Locations</option>
                {(data.filters?.locations || []).map((location) => <option key={location}>{location}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-500">Job Type</label>
              <select className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]" value={filters.jobType} onChange={(event) => setFilter('jobType', event.target.value)}>
                <option value="">All Types</option>
                {(data.filters?.jobTypes || []).map((type) => <option key={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-500">Post Date</label>
              <input className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]" type="date" value={filters.postDate} onChange={(event) => setFilter('postDate', event.target.value)} />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={resetFilters} className="h-10 w-full rounded-md bg-emerald-500 px-4 text-sm font-extrabold text-white transition hover:bg-emerald-600 xl:w-auto">
                Reset
              </button>
            </div>
          </div>

          {/* Card list — mobile only */}
          <div className="divide-y divide-slate-100 rounded-md border border-slate-100 sm:hidden">
            {filteredJobs.length ? filteredJobs.map((job) => (
              <div key={job.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[#6658dd]">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-extrabold text-slate-800">{job.title}</p>
                      <span className={`shrink-0 rounded px-2 py-1 text-[11px] font-black ${statusTone[job.status] || statusTone.Active}`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-slate-400">{job.vacancies} openings</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500">
                  <p><span className="text-slate-400">Posted:</span> {formatDate(job.postDate)}</p>
                  <p><span className="text-slate-400">Expiry:</span> {formatDate(job.expiry, 'Not set')}</p>
                  <p className="truncate"><span className="text-slate-400">Location:</span> {job.location}</p>
                  <p className="truncate"><span className="text-slate-400">Type:</span> {job.jobType}</p>
                </div>
                <div className="mt-3 flex justify-end gap-1 border-t border-slate-100 pt-3">
                  {renderRowActions(job)}
                </div>
              </div>
            )) : (
              <p className="px-4 py-12 text-center text-sm font-bold text-slate-400">No jobs found.</p>
            )}
          </div>

          {/* Table — sm and up */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[920px] text-left">
              <thead className="bg-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Job Title</th>
                  <th className="px-4 py-3">Post Date</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Job Type</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.length ? filteredJobs.map((job) => (
                  <tr key={job.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[#6658dd]">
                          <Briefcase className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-extrabold text-slate-800">{job.title}</p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-400">{job.vacancies} openings</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-500">{formatDate(job.postDate)}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-500">{job.location}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-500">{job.jobType}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-500">{formatDate(job.expiry, 'Not set')}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded px-2 py-1 text-xs font-black ${statusTone[job.status] || statusTone.Active}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1">
                        {renderRowActions(job)}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-sm font-bold text-slate-400">
                      No jobs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmployerJobs;