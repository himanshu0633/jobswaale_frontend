import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Briefcase,
  Calendar,
  ChevronRight,
  Eye,
  MapPin,
  Search
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import PageSkeleton from '../../../components/SkeletonLoader';

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
  Expired: 'bg-rose-50 text-rose-600',
  Paused: 'bg-slate-100 text-slate-600',
  Closed: 'bg-slate-100 text-slate-600'
};

const getSearchParam = (search) => new URLSearchParams(search).get('q')?.trim() || '';

const searchableText = (job) => [
  job.title,
  job.location,
  job.jobType,
  job.category,
  job.status,
  job.workMode,
  job.vacancies
].join(' ').toLowerCase();

const EmployerSearchResults = () => {
  const location = useLocation();
  const query = getSearchParam(location.search);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    const loadJobs = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${BASE_API_URL}/employer/jobs`, { headers: getTokenHeaders() });
        if (alive) setJobs(Array.isArray(response.data?.jobs) ? response.data.jobs : []);
      } catch (err) {
        if (alive) setError(err.response?.data?.message || 'Search results could not be loaded.');
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadJobs();
    return () => {
      alive = false;
    };
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    if (!normalizedQuery) return [];
    return jobs.filter((job) => searchableText(job).includes(normalizedQuery));
  }, [jobs, query]);

  if (loading) {
    return <PageSkeleton variant="list" />;
  }

  return (
    <div className="space-y-5 px-3 sm:px-0">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <div>
          <h1 className="text-lg font-extrabold text-[#3f4254] sm:text-xl">Search Results</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            {query ? `Showing jobs matching "${query}"` : 'Enter a keyword from the quick search box.'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 sm:text-sm">
          <span className="text-[#3f4254]">JobsWaale</span>
          <ChevronRight className="h-4 w-4" />
          <span>Search Results</span>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      <section className="rounded-md border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-dashed border-slate-200 px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">
              {results.length} Job{results.length === 1 ? '' : 's'} Found
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-400 sm:text-sm">Matches include title, location, category, type, status, and work mode.</p>
          </div>
          <Search className="h-5 w-5 shrink-0 text-[#6658dd]" />
        </div>

        <div className="divide-y divide-slate-100">
          {results.length ? results.map((job) => (
            <article key={job.id} className="p-4 transition hover:bg-slate-50 sm:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[#6658dd]">
                    <Briefcase className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-extrabold text-slate-800">{job.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-slate-400">
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location || 'N/A'}</span>
                      <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.jobType || 'N/A'}</span>
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Posted {formatDate(job.postDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded px-2.5 py-1 text-xs font-black ${statusTone[job.status] || statusTone.Active}`}>
                    {job.status || 'Active'}
                  </span>
                  <Link
                    to={`/employer/jobs/${job.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#6658dd] px-3 py-2 text-xs font-extrabold text-white transition hover:bg-[#5848d8]"
                  >
                    <Eye className="h-4 w-4" /> View
                  </Link>
                </div>
              </div>
            </article>
          )) : (
            <div className="px-4 py-14 text-center">
              <Search className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 text-sm font-extrabold text-slate-500">No jobs found for this keyword.</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">Try a job title, skill, category, location, or job type.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EmployerSearchResults;
