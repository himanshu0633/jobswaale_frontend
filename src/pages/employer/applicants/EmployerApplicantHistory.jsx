/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  Eye,
  Loader,
  Search,
  UserCheck,
  UserRoundCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import ClearFilterButton from '../../../components/ClearFilterButton';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const statusTone = {
  Applied: 'bg-emerald-50 text-emerald-600',
  Reviewed: 'bg-sky-50 text-sky-600',
  Shortlisted: 'bg-amber-50 text-amber-600',
  Interview: 'bg-violet-50 text-violet-600',
  Offered: 'bg-blue-50 text-blue-600',
  Rejected: 'bg-rose-50 text-rose-600'
};

const statCards = [
  { key: 'total', title: 'Total Applicants', icon: UserRoundCheck, tone: 'bg-violet-50 text-[#6658dd]' },
  { key: 'applied', title: 'Applied', icon: Briefcase, tone: 'bg-emerald-50 text-emerald-500' },
  { key: 'shortlisted', title: 'Shortlisted', icon: UserCheck, tone: 'bg-amber-50 text-amber-500' },
  { key: 'interview', title: 'Interview', icon: Calendar, tone: 'bg-sky-50 text-sky-500' },
  { key: 'rejected', title: 'Rejected', icon: UserX, tone: 'bg-rose-50 text-rose-500' }
];

export const EmployerApplicantHistory = () => {
  const [searchParams] = useSearchParams();
  const searchParamString = searchParams.toString();
  const [data, setData] = useState({ stats: {}, filters: {}, applicants: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } });
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [jobId, setJobId] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setStatus(searchParams.get('status') || '');
    setCurrentPage(1);
  }, [searchParamString]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, jobId, status]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (jobId) params.set('jobId', jobId);
    if (status) params.set('status', status);
    params.set('page', currentPage);
    params.set('limit', 10);
    return params.toString();
  }, [search, jobId, status, currentPage]);

  const hasActiveFilters = Boolean(search.trim() || jobId || status);
  const resetFilters = () => {
    setSearch('');
    setJobId('');
    setStatus('');
    setCurrentPage(1);
  };

  const pagination = data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const safePage = Math.max(1, Math.min(currentPage, pagination.totalPages || 1));
  const totalPages = pagination.totalPages || 1;
  const startIndex = (safePage - 1) * (pagination.limit || 10);

  const goToPage = (pageNumber) => {
    const target = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(target);
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    axios.get(`${BASE_API_URL}/employer/applicant-history?${queryParams}`, { headers: getTokenHeaders() })
      .then((response) => {
        if (alive) {
          setData({
            stats: {},
            filters: {},
            applicants: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
            ...response.data
          });
        }
      })
      .catch((err) => {
        if (alive) setError(err.response?.data?.message || 'Applicant history could not be loaded.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [queryParams]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <h1 className="text-xl font-extrabold text-[#3f4254]">Applicants History</h1>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
          <span className="text-[#3f4254]">JobsWaale</span><span>/</span><span>Applicants History</span>
        </div>
      </div>

      {error && <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <section key={card.key} className="rounded-md border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${card.tone}`}>
                <card.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-400">{card.title}</p>
                <p className="mt-1 text-xl font-black text-[#3f4254]">{Number(data.stats?.[card.key] || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-md border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-dashed border-slate-200 px-5 py-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-extrabold text-[#3f4254]">All Applicants</h2>
            <p className="mt-1 text-sm font-semibold text-slate-400">Every jobseeker who has applied to your jobs, with job and status history.</p>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-5 grid gap-3 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-500">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Candidate, email, phone, job"
                  className="h-10 w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-500">Job</label>
              <select value={jobId} onChange={(event) => setJobId(event.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100">
                <option value="">All Jobs</option>
                {(data.filters?.jobs || []).map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-500">Status</label>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100">
                <option value="">All Status</option>
                {['Applied', 'Reviewed', 'Shortlisted', 'Interview', 'Offered', 'Rejected'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <ClearFilterButton active={hasActiveFilters} onClick={resetFilters} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1020px] text-left">
              <thead className="bg-[#dbe6f6] text-[11px] uppercase text-slate-600">
                <tr>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-5 py-3">Job Applied</th>
                  <th className="px-5 py-3">Applied Date</th>
                  <th className="px-5 py-3">Match</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Job Status</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="7" className="px-5 py-12 text-center"><Loader className="mx-auto h-7 w-7 animate-spin text-[#6658dd]" /></td></tr>
                ) : data.applicants.length ? data.applicants.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="text-sm font-extrabold text-[#3f4254]">{item.name}</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-400">{item.email || item.phone || 'No contact'}</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-400">{item.location || 'Location not specified'}</p>
                    </td>
                    <td className="px-5 py-4"><p className="text-sm font-extrabold text-[#3f4254]">{item.jobTitle}</p></td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">{item.appliedDisplayDate}</td>
                    <td className="px-5 py-4 text-sm font-black text-[#6658dd]">{item.matchScore}%</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded px-2.5 py-1 text-xs font-black ${statusTone[item.status] || statusTone.Applied}`}>{item.status}</span></td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">{item.jobStatus || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      <Link to={`/employer/applications/${item.applicationId}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#6658dd] px-3 text-xs font-extrabold text-[#6658dd] transition hover:bg-violet-50">
                        <Eye className="h-4 w-4" /> View
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" className="px-5 py-12 text-center text-sm font-bold text-slate-400">No applicant history found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.total > 0 && (
            <div className="mt-5 flex flex-col justify-between gap-3 text-xs font-semibold text-slate-600 sm:flex-row sm:items-center sm:text-sm border-t border-dashed border-slate-100 pt-5">
              <span>
                Showing {startIndex + 1} to {Math.min(startIndex + (pagination.limit || 10), pagination.total)} of {pagination.total} entries
              </span>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(1)}
                  disabled={safePage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition hover:bg-slate-50"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(safePage - 1)}
                  disabled={safePage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" className="flex h-9 min-w-9 items-center justify-center rounded-md bg-[#6658dd] px-3 text-sm font-black text-white">
                  {safePage}
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(safePage + 1)}
                  disabled={safePage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition hover:bg-slate-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(totalPages)}
                  disabled={safePage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition hover:bg-slate-50"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EmployerApplicantHistory;
