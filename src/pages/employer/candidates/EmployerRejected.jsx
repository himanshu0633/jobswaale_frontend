import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Loader,
  MapPin,
  Search,
  UserX,
  Briefcase,
  RefreshCcw,
  Calendar,
  Sparkles
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import ClearFilterButton from '../../../components/ClearFilterButton';

const initialFilters = { search: '', jobTitle: '', rejectedFrom: '', minMatchScore: '' };

const scoreTone = (score) => {
  if (score >= 90) return 'bg-emerald-50 text-emerald-500';
  if (score >= 80) return 'bg-violet-50 text-[#6658dd]';
  if (score >= 70) return 'bg-sky-50 text-sky-500';
  return 'bg-rose-50 text-rose-500';
};

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const SelectField = ({ label, value, onChange, children }) => (
  <div>
    <label className="mb-2 block text-xs font-extrabold text-slate-500">{label}</label>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100">
      {children}
    </select>
  </div>
);

export const EmployerRejected = () => {
  const [searchParams] = useSearchParams();
  const searchParamString = searchParams.toString();

  const getUrlFilters = () => ({
    search: searchParams.get('search') || '',
    jobTitle: searchParams.get('jobTitle') || '',
    rejectedFrom: searchParams.get('rejectedFrom') || '',
    minMatchScore: searchParams.get('minMatchScore') || ''
  });

  const [filters, setFilters] = useState(getUrlFilters);
  const [tableSearch, setTableSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({
    applications: [],
    filters: { jobTitles: [] },
    pagination: { total: 0, totalPages: 1, page: 1, limit: 10 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState('');

  useEffect(() => {
    setFilters(getUrlFilters());
    setTableSearch('');
    setCurrentPage(1);
  }, [searchParamString]);

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setTableSearch('');
    setCurrentPage(1);
  };

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    const search = [filters.search, tableSearch].filter(Boolean).join(' ').trim();
    if (search) params.set('search', search);
    if (filters.jobTitle) params.set('jobTitle', filters.jobTitle);
    
    params.set('status', 'Rejected');
    
    if (filters.minMatchScore) params.set('minMatchScore', filters.minMatchScore);
    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));
    return params.toString();
  }, [filters, tableSearch, currentPage, pageSize]);

  const loadData = () => {
    setLoading(true);
    setError('');

    // Fetch all rejected candidates
    axios.get(`${BASE_API_URL}/employer/applications?${queryParams}`, { headers: getTokenHeaders() })
      .then((response) => {
        const resData = response.data;
        let apps = resData.applications || [];

        // Apply local filter for rejectedFrom status if selected
        if (filters.rejectedFrom) {
          apps = apps.filter(app => (app.rejectedFromStatus || '').toLowerCase() === filters.rejectedFrom.toLowerCase());
        }

        const total = apps.length;
        const limit = pageSize;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const startIndex = (currentPage - 1) * limit;
        const paginatedApps = apps.slice(startIndex, startIndex + limit);

        setData({
          applications: paginatedApps,
          filters: {
            jobTitles: resData.filters?.jobTitles || []
          },
          pagination: {
            total,
            totalPages,
            page: currentPage,
            limit
          }
        });
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load rejected candidates.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [queryParams, filters.rejectedFrom]);

  const handleReevaluate = async (applicationId, previousStatus) => {
    if (!window.confirm('Are you sure you want to re-evaluate this candidate? This will revert their status back to Applied/Reviewed.')) return;
    setActionLoadingId(applicationId);
    setError('');
    setSuccess('');
    try {
      const targetStatus = previousStatus || 'Applied';
      await axios.patch(
        `${BASE_API_URL}/employer/applications/${applicationId}/status`,
        { status: targetStatus },
        { headers: getTokenHeaders() }
      );
      setSuccess('Candidate status reverted successfully!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to re-evaluate candidate.');
    } finally {
      setActionLoadingId('');
    }
  };

  const pagination = data.pagination || { page: currentPage, limit: pageSize, total: 0, totalPages: 1 };
  const totalPages = pagination.totalPages || 1;
  const safePage = pagination.page || 1;
  const startIndex = pagination.total ? (safePage - 1) * pagination.limit : 0;
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  const optionFilters = data.filters || { jobTitles: [] };
  const visibleRows = data.applications || [];
  const hasActiveFilters = Object.values(filters).some(Boolean) || Boolean(tableSearch);

  return (
    <div className="space-y-4 px-3 sm:space-y-5 sm:px-0">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center md:gap-3">
        <h1 className="text-lg font-extrabold text-[#3f4254] sm:text-xl">Rejected Candidates</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 sm:text-sm">
          <span className="text-[#3f4254]">JobsWaale</span>
          <ChevronRight className="h-4.5 w-4.5" />
          <span>Rejected</span>
        </div>
      </div>

      {error && <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}
      {success && <div className="rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{success}</div>}

      <section className="rounded-md border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-dashed border-slate-200 px-4 py-4 sm:px-5">
          <h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Rejected Candidates List</h2>
          <p className="mt-1 text-xs font-semibold text-slate-400 sm:text-sm">
            View all candidate profiles that have been marked as rejected and revert/re-evaluate them.
          </p>
        </div>

        <div className="p-4 sm:p-5">
          {/* Filters Row */}
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1.2fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-500">Search Candidate / Job</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="h-10 w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100"
                  value={filters.search}
                  onChange={(event) => setFilter('search', event.target.value)}
                  placeholder="Name, email, job, location"
                />
              </div>
            </div>

            <SelectField label="Job Title" value={filters.jobTitle} onChange={(value) => setFilter('jobTitle', value)}>
              <option value="">All Jobs</option>
              {(optionFilters.jobTitles || []).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </SelectField>

            <SelectField label="Rejected From Stage" value={filters.rejectedFrom} onChange={(value) => setFilter('rejectedFrom', value)}>
              <option value="">All Stages</option>
              <option value="Applied">Applied</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Offered">Selected</option>
            </SelectField>

            <SelectField label="Min Score" value={filters.minMatchScore} onChange={(value) => setFilter('minMatchScore', value)}>
              <option value="">All Scores</option>
              {[50, 60, 70, 80, 90].map((score) => (
                <option key={score} value={score}>{score}% & Above</option>
              ))}
            </SelectField>

            <div className="flex items-end">
              <ClearFilterButton active={hasActiveFilters} onClick={resetFilters} />
            </div>
          </div>

          <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <select
                value={pageSize}
                onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              entries per page
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              Search:
              <input
                value={tableSearch}
                onChange={(event) => { setTableSearch(event.target.value); setCurrentPage(1); }}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100 sm:w-48"
              />
            </label>
          </div>

          {/* Card list — mobile only */}
          <div className="divide-y divide-slate-100 rounded-md border border-slate-100 sm:hidden">
            {loading ? (
              <div className="py-12 text-center"><Loader className="mx-auto h-7 w-7 animate-spin text-[#6658dd]" /></div>
            ) : visibleRows.length ? visibleRows.map((app) => (
              <div key={app.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-black text-slate-700 ring-2 ring-white`}>
                    {app.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-extrabold text-[#3f4254]">{app.name}</h3>
                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">{app.email}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-400">
                      <MapPin className="h-3 w-3 shrink-0" />{app.location}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-md">
                  <p className="truncate"><span className="text-slate-400">Job:</span> {app.jobTitle}</p>
                  <p><span className="text-slate-400">Match:</span> <span className={`inline-flex rounded px-1.5 py-0.5 font-bold ${scoreTone(app.matchScore)}`}>{app.matchScore}%</span></p>
                  <p><span className="text-slate-400">Rejected From:</span> <span className="font-extrabold text-amber-600">{app.rejectedFromStatus || 'Applied'}</span></p>
                  <p><span className="text-slate-400">Date:</span> {app.rejectedDate || '-'}</p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Link
                    to={`/employer/applications/${app.id}`}
                    title="View Application Details"
                    className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-500 hover:bg-slate-50 transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View</span>
                  </Link>
                  <button
                    disabled={actionLoadingId === app.id}
                    onClick={() => handleReevaluate(app.id, app.previousStatus)}
                    className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-indigo-50 border border-indigo-100 px-3 text-xs font-extrabold text-[#6658dd] hover:bg-indigo-100 transition disabled:opacity-50"
                  >
                    <RefreshCcw className={`h-3.5 w-3.5 ${actionLoadingId === app.id ? 'animate-spin' : ''}`} />
                    <span>Re-evaluate</span>
                  </button>
                </div>
              </div>
            )) : (
              <p className="px-4 py-12 text-center text-sm font-bold text-slate-400">No rejected candidates found.</p>
            )}
          </div>

          {/* Table view — desktop */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-[#dbe6f6] text-[11px] uppercase text-slate-600">
                <tr>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-5 py-3">Job Applied</th>
                  <th className="px-5 py-3">Match Score</th>
                  <th className="px-5 py-3">Rejected Date</th>
                  <th className="px-5 py-3">Rejected From Stage</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center">
                      <Loader className="mx-auto h-7 w-7 animate-spin text-[#6658dd]" />
                    </td>
                  </tr>
                ) : visibleRows.length ? visibleRows.map((app) => (
                  <tr key={app.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700 ring-2 ring-white">
                          {app.initials}
                        </span>
                        <div>
                          <Link to={`/employer/applications/${app.id}`} className="text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd]">
                            {app.name}
                          </Link>
                          <p className="mt-0.5 text-xs font-semibold text-slate-400">{app.email}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-400">
                            <MapPin className="h-3 w-3" />{app.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-extrabold text-[#3f4254]">{app.jobTitle}</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-400">{app.jobType}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded px-2.5 py-1 text-xs font-black ${scoreTone(app.matchScore)}`}>
                        {app.matchScore}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                      {app.rejectedDate || '-'}
                    </td>
                    <td className="px-5 py-4 text-sm font-extrabold text-rose-500">
                      {app.rejectedFromStatus || 'Applied'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/employer/applications/${app.id}`}
                          title="View Application Details"
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-500 hover:bg-slate-50 transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Link>
                        <button
                          disabled={actionLoadingId === app.id}
                          onClick={() => handleReevaluate(app.id, app.previousStatus)}
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-indigo-50 border border-indigo-100 px-3 text-xs font-extrabold text-[#6658dd] hover:bg-indigo-100 transition disabled:opacity-50"
                        >
                          <RefreshCcw className={`h-3.5 w-3.5 ${actionLoadingId === app.id ? 'animate-spin' : ''}`} />
                          <span>Re-evaluate</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-sm font-bold text-slate-400">
                      No rejected candidates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-5 flex flex-col justify-between gap-3 text-xs font-semibold text-slate-600 sm:flex-row sm:items-center sm:text-sm border-t border-slate-100 pt-5">
            <span>Showing {pagination.total ? startIndex + 1 : 0} to {Math.min(startIndex + pagination.limit, pagination.total)} of {pagination.total} entries</span>
            <div className="flex items-center justify-center gap-2">
              <button type="button" onClick={() => goToPage(1)} disabled={safePage === 1} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronsLeft className="h-4 w-4" /></button>
              <button type="button" onClick={() => goToPage(safePage - 1)} disabled={safePage === 1} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" className="flex h-9 min-w-9 items-center justify-center rounded-md bg-[#6658dd] px-3 text-sm font-black text-white">{safePage}</button>
              <button type="button" onClick={() => goToPage(safePage + 1)} disabled={safePage === totalPages} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
              <button type="button" onClick={() => goToPage(totalPages)} disabled={safePage === totalPages} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronsRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmployerRejected;
