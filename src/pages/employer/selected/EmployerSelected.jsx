import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  FileText,
  Loader,
  MailCheck,
  MapPin,
  MoreVertical,
  Search,
  Send,
  UserPlus,
  UserX
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const initialFilters = { search: '', jobTitle: '', status: '', selectionDate: '', minSalary: '' };

const statCards = [
  { key: 'total', title: 'Total Selected', icon: UserPlus, tone: 'bg-emerald-50 text-emerald-500' },
  { key: 'offerSent', title: 'Total Offer Sent', icon: MailCheck, tone: 'bg-violet-50 text-[#6658dd]' },
  { key: 'offerAccepted', title: 'Offer Accepted', icon: BadgeCheck, tone: 'bg-cyan-50 text-cyan-500' },
  { key: 'hired', title: 'Total Hired', icon: Briefcase, tone: 'bg-blue-50 text-blue-500' },
  { key: 'offerDeclined', title: 'Offer Declined', icon: UserX, tone: 'bg-rose-50 text-rose-500' }
];

const statusTone = {
  'Offer Sent': 'bg-violet-50 text-[#6658dd]',
  'Offer Accepted': 'bg-cyan-50 text-cyan-500',
  Hired: 'bg-emerald-50 text-emerald-500',
  'Offer Declined': 'bg-rose-50 text-rose-500'
};

const scoreTone = (score) => {
  if (score >= 90) return 'bg-emerald-50 text-emerald-500';
  if (score >= 80) return 'bg-violet-50 text-[#6658dd]';
  if (score >= 65) return 'bg-cyan-50 text-cyan-500';
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

const OfferActions = ({ candidate, isUpdating, isOpen, onToggle, buttonClassName = 'flex h-9 w-9 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-[#6658dd]', menuClassName = 'absolute right-0 z-20 mt-1.5 w-52 rounded-md border border-slate-100 bg-white py-1 shadow-lg', onUpdate }) => (
  <div className="relative inline-block text-left">
    <button type="button" disabled={isUpdating} onClick={onToggle} className={buttonClassName}>
      {isUpdating ? <Loader className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
    </button>
    {isOpen && (
      <div className={menuClassName}>
        <Link to="/employer/applications" className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"><FileText className="h-4 w-4 text-slate-500" />View Application</Link>
        <button type="button" onClick={() => onUpdate(candidate, 'Offer Sent')} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"><Send className="h-4 w-4 text-[#6658dd]" />Mark Offer Sent</button>
        <button type="button" onClick={() => onUpdate(candidate, 'Offer Accepted')} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"><CheckCircle2 className="h-4 w-4 text-cyan-500" />Mark Accepted</button>
        <button type="button" onClick={() => onUpdate(candidate, 'Hired')} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"><Briefcase className="h-4 w-4 text-emerald-500" />Mark Hired</button>
        <button type="button" onClick={() => onUpdate(candidate, 'Offer Declined')} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"><UserX className="h-4 w-4" />Mark Declined</button>
      </div>
    )}
  </div>
);

export const EmployerSelected = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [tableSearch, setTableSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({
    stats: { total: 0, offerSent: 0, offerAccepted: 0, hired: 0, offerDeclined: 0 },
    filters: { jobTitles: [] },
    selected: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

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
    if (filters.status) params.set('status', filters.status);
    if (filters.selectionDate) params.set('selectionDate', filters.selectionDate);
    if (filters.minSalary) params.set('minSalary', filters.minSalary);
    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));
    return params.toString();
  }, [currentPage, filters, pageSize, tableSearch]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');

    axios.get(`${BASE_API_URL}/employer/selected?${queryParams}`, { headers: getTokenHeaders() })
      .then((response) => {
        if (!alive) return;
        setData({
          stats: { total: 0, offerSent: 0, offerAccepted: 0, hired: 0, offerDeclined: 0 },
          filters: { jobTitles: [] },
          selected: [],
          pagination: { page: 1, limit: pageSize, total: 0, totalPages: 1 },
          ...response.data
        });
      })
      .catch((err) => {
        if (alive) setError(err.response?.data?.message || 'Selected candidates could not be loaded.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false; };
  }, [pageSize, queryParams, refreshKey]);

  const updateOfferStatus = async (candidate, offerStatus) => {
    setUpdatingId(candidate.id);
    setError('');
    setOpenDropdownId('');
    try {
      await axios.patch(
        `${BASE_API_URL}/employer/selected/${candidate.id}/offer`,
        {
          offerStatus,
          salaryOffered: candidate.salaryOffered !== null ? Number(candidate.salaryOffered) * 100000 : undefined,
          interviewScore: candidate.interviewScore,
          employmentType: candidate.jobType
        },
        { headers: getTokenHeaders() }
      );
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Offer status could not be updated.');
    } finally {
      setUpdatingId('');
    }
  };

  const pagination = data.pagination || { page: currentPage, limit: pageSize, total: 0, totalPages: 1 };
  const totalPages = pagination.totalPages || 1;
  const safePage = pagination.page || 1;
  const startIndex = pagination.total ? (safePage - 1) * pagination.limit : 0;
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  const optionFilters = data.filters || { jobTitles: [] };
  const stats = data.stats || {};
  const visibleRows = data.selected || [];

  return (
    <div className="space-y-4 px-3 sm:space-y-5 sm:px-0">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center md:gap-3">
        <h1 className="text-lg font-extrabold text-[#3f4254] sm:text-xl">Selected Candidates</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 sm:text-sm"><span className="text-[#3f4254]">JobsWaale</span><ChevronRight className="h-4 w-4" /><span>Selected</span></div>
      </div>

      {error && <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        {statCards.map((card) => (
          <section key={card.key} className="rounded-md border border-slate-100 bg-white p-3 shadow-sm sm:p-5">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${card.tone}`}><card.icon className="h-4 w-4 sm:h-5 sm:w-5" /></span>
              <div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-400 sm:text-sm">{card.title}</p><p className="mt-1 text-base font-black text-[#3f4254] sm:text-xl">{Number(stats[card.key] || 0).toLocaleString('en-IN')}</p></div>
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-md border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-dashed border-slate-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center">
          <div><h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Selected Candidates</h2><p className="mt-1 text-xs font-semibold text-slate-400 sm:text-sm">Manage selected candidates, send offer letters, and track offer acceptance status.</p></div>
          <div className="flex flex-wrap gap-2">
            <Link to="/employer/interviews" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white transition hover:bg-[#5848d8]"><MailCheck className="h-4 w-4" />All Interviews</Link>
            <Link to="/employer/applications" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-100 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200"><FileText className="h-4 w-4" />All Applications</Link>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-500">Search Candidate / Job</label>
              <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="h-10 w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} placeholder="Name, email, job, location" /></div>
            </div>
            <SelectField label="Job Title" value={filters.jobTitle} onChange={(value) => setFilter('jobTitle', value)}><option value="">All Jobs</option>{(optionFilters.jobTitles || []).map((item) => <option key={item}>{item}</option>)}</SelectField>
            <SelectField label="Status" value={filters.status} onChange={(value) => setFilter('status', value)}><option value="">All Status</option>{['Offer Sent', 'Offer Accepted', 'Offer Declined', 'Hired'].map((item) => <option key={item}>{item}</option>)}</SelectField>
            <div><label className="mb-2 block text-xs font-extrabold text-slate-500">Selection Date</label><input type="date" value={filters.selectionDate} onChange={(event) => setFilter('selectionDate', event.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100" /></div>
            <SelectField label="Min Salary (LPA)" value={filters.minSalary} onChange={(value) => setFilter('minSalary', value)}><option value="">All Salaries</option>{[5, 10, 15, 20].map((item) => <option key={item} value={item}>{item}</option>)}</SelectField>
            <div className="flex items-end"><button type="button" onClick={resetFilters} className="h-10 w-full rounded-md bg-[#18b99b] px-4 text-sm font-extrabold text-white transition hover:bg-[#13a98d] xl:w-auto">Reset</button></div>
          </div>

          <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select>entries per page</div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">Search:<input value={tableSearch} onChange={(event) => { setTableSearch(event.target.value); setCurrentPage(1); }} className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100 sm:w-48" /></label>
          </div>

          {/* Card list — mobile only */}
          <div className="divide-y divide-slate-100 rounded-md border border-slate-100 sm:hidden">
            {loading ? (
              <div className="py-12 text-center"><Loader className="mx-auto h-7 w-7 animate-spin text-[#6658dd]" /></div>
            ) : visibleRows.length ? visibleRows.map((candidate) => (
              <div key={candidate.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${candidate.avatarTone} text-xs font-black text-slate-700 ring-2 ring-white`}>{candidate.initials}</span>
                  <div className="min-w-0 flex-1">
                    <Link to="/employer/applications" className="truncate text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd]">{candidate.name}</Link>
                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">{candidate.email}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-400"><MapPin className="h-3 w-3 shrink-0" />{candidate.location}</p>
                  </div>
                  <span className={`shrink-0 rounded px-2 py-1 text-[11px] font-black ${statusTone[candidate.offerStatus] || 'bg-slate-100 text-slate-600'}`}>{candidate.offerStatus}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500">
                  <p className="truncate"><span className="text-slate-400">Job:</span> {candidate.jobTitle}</p>
                  <p className="truncate"><span className="text-slate-400">Type:</span> {candidate.jobType}</p>
                  <p><span className="text-slate-400">Selected:</span> {candidate.displayDate || '-'}</p>
                  <p><span className="text-slate-400">Salary:</span> {candidate.salaryText}</p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-black ${scoreTone(candidate.interviewScore || 0)}`}>Score: {candidate.interviewScore || 0}%</span>
                  <OfferActions
                    candidate={candidate}
                    isUpdating={updatingId === candidate.id}
                    isOpen={openDropdownId === candidate.id}
                    onToggle={() => setOpenDropdownId(openDropdownId === candidate.id ? '' : candidate.id)}
                    onUpdate={updateOfferStatus}
                  />
                </div>
              </div>
            )) : (
              <p className="px-4 py-12 text-center text-sm font-bold text-slate-400">No selected candidates found.</p>
            )}
          </div>

          {/* Table — sm and up */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[1120px] text-left">
              <thead className="bg-[#dbe6f6] text-[11px] uppercase text-slate-600"><tr><th className="px-5 py-3">Candidate</th><th className="px-5 py-3">Job Applied</th><th className="px-5 py-3"><span className="inline-flex items-center gap-1">Selection Date <ChevronUp className="h-3 w-3 text-slate-400" /></span></th><th className="px-5 py-3">Interview Score</th><th className="px-5 py-3">Offer Status</th><th className="px-5 py-3">Salary Offered</th><th className="px-5 py-3 text-center">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan="7" className="px-5 py-12 text-center"><Loader className="mx-auto h-7 w-7 animate-spin text-[#6658dd]" /></td></tr> : visibleRows.length ? visibleRows.map((candidate) => (
                  <tr key={candidate.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${candidate.avatarTone} text-xs font-black text-slate-700 ring-2 ring-white`}>{candidate.initials}</span><div><Link to="/employer/applications" className="text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd]">{candidate.name}</Link><p className="mt-0.5 text-xs font-semibold text-slate-400">{candidate.email}</p><p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-slate-400"><MapPin className="h-3 w-3" />{candidate.location}</p></div></div></td>
                    <td className="px-5 py-4"><p className="text-sm font-extrabold text-[#3f4254]">{candidate.jobTitle}</p><p className="mt-0.5 text-xs font-semibold text-slate-400">{candidate.jobType}</p></td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">{candidate.displayDate || '-'}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded px-2.5 py-1 text-xs font-black ${scoreTone(candidate.interviewScore || 0)}`}>{candidate.interviewScore || 0}%</span></td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded px-2.5 py-1 text-xs font-black ${statusTone[candidate.offerStatus] || 'bg-slate-100 text-slate-600'}`}>{candidate.offerStatus}</span></td>
                    <td className="px-5 py-4 text-sm font-extrabold text-[#3f4254]">{candidate.salaryText}</td>
                    <td className="px-5 py-4 text-center">
                      <OfferActions
                        candidate={candidate}
                        isUpdating={updatingId === candidate.id}
                        isOpen={openDropdownId === candidate.id}
                        onToggle={() => setOpenDropdownId(openDropdownId === candidate.id ? '' : candidate.id)}
                        onUpdate={updateOfferStatus}
                      />
                    </td>
                  </tr>
                )) : <tr><td colSpan="7" className="px-5 py-12 text-center text-sm font-bold text-slate-400">No selected candidates found.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-3 text-xs font-semibold text-slate-600 sm:flex-row sm:items-center sm:text-sm">
            <span>Showing {pagination.total ? startIndex + 1 : 0} to {Math.min(startIndex + pagination.limit, pagination.total)} of {pagination.total} entries</span>
            <div className="flex items-center justify-center gap-2"><button type="button" onClick={() => goToPage(1)} disabled={safePage === 1} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronsLeft className="h-4 w-4" /></button><button type="button" onClick={() => goToPage(safePage - 1)} disabled={safePage === 1} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button><button type="button" className="flex h-9 min-w-9 items-center justify-center rounded-md bg-[#6658dd] px-3 text-sm font-black text-white">{safePage}</button><button type="button" onClick={() => goToPage(safePage + 1)} disabled={safePage === totalPages} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button><button type="button" onClick={() => goToPage(totalPages)} disabled={safePage === totalPages} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronsRight className="h-4 w-4" /></button></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmployerSelected;