import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';
import PageSkeleton from '../../../components/SkeletonLoader';
import {
  Plus,
  Edit2,
  Search,
  AlertCircle,
  CheckCircle,
  Loader,
  Ban,
  ShieldCheck,
  FileText,
  Trash2,
  ChevronRight,
  History,
  X,
} from 'lucide-react';
import ResponsiveCardList from '../../../components/ResponsiveCardList';
import AdminPagination from '../../../components/AdminPagination';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatConsent = (value) => {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return '—';
};

export const Jobseekers = () => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [historyModal, setHistoryModal] = useState({ open: false, loading: false, error: '', data: null });
  const [autoOpenedCandidateId, setAutoOpenedCandidateId] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get('q') || '';
  const queryStatus = searchParams.get('status') || '';
  const queryCandidateId = searchParams.get('candidate') || '';

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchJobseekers = async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/jobseekers`);
      setList(response.data);
      setFilteredList(response.data);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Failed to retrieve jobseekers database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobseekers();
  }, []);

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  useEffect(() => {
    const q = search.toLowerCase();
    const filtered = list.filter(item =>
      (!queryStatus || item.status === queryStatus) && (
        (item.name || '').toLowerCase().includes(q) ||
        (item.phone || '').includes(q) ||
        (item.userId?.email && item.userId.email.toLowerCase().includes(q)) ||
        (item.experience || '').toLowerCase().includes(q) ||
        (item.workStatus || '').toLowerCase().includes(q) ||
        (item.source || '').toLowerCase().includes(q)
      )
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'latest') {
        const dateA = new Date(a.registeredOn || a.createDate || a.createdAt || 0);
        const dateB = new Date(b.registeredOn || b.createDate || b.createdAt || 0);
        return dateB - dateA;
      }
      if (sortBy === 'oldest') {
        const dateA = new Date(a.registeredOn || a.createDate || a.createdAt || 0);
        const dateB = new Date(b.registeredOn || b.createDate || b.createdAt || 0);
        return dateA - dateB;
      }
      if (sortBy === 'az') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'za') {
        return (b.name || '').localeCompare(a.name || '');
      }
      return 0;
    });

    setFilteredList(sorted);
  }, [search, list, sortBy, queryStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / entriesPerPage));
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + entriesPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy, queryStatus, entriesPerPage]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const handleDelete = async (uid) => {
    if (!window.confirm('Delete this jobseeker profile and login user?')) return;
    try {
      await axios.delete(`${BASE_API_URL}/jobseekers/${uid}`);
      setList(list.filter(item => item._id !== uid));
      showMessage('success', 'Jobseeker deleted successfully.');
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error deleting jobseeker.');
    }
  };

  const toggleStatus = async (item, targetStatus) => {
    let reason = '';
    if (targetStatus === 'blacklist') {
      reason = window.prompt('Specify reason for blacklisting:');
      if (reason === null) return;
    }
    try {
      const res = await axios.put(`${BASE_API_URL}/jobseekers/${item._id}/status`, {
        status: targetStatus,
        blacklistReason: reason,
      });
      setList(list.map(js =>
        js._id === item._id
          ? { ...js, status: res.data.status, blacklistReason: res.data.blacklistReason }
          : js
      ));
      showMessage('success', `Jobseeker status changed to ${targetStatus}.`);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error changing status.');
    }
  };

  const openHistory = async (item) => {
    setHistoryModal({ open: true, loading: true, error: '', data: null });
    try {
      const response = await axios.get(`${BASE_API_URL}/jobseekers/${item._id}/applications`);
      setHistoryModal({ open: true, loading: false, error: '', data: response.data });
    } catch (err) {
      setHistoryModal({
        open: true,
        loading: false,
        error: err.response?.data?.message || 'Application history could not be loaded.',
        data: null
      });
    }
  };

  const closeHistory = () => setHistoryModal({ open: false, loading: false, error: '', data: null });

  useEffect(() => {
    if (!historyModal.open) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [historyModal.open]);

  useEffect(() => {
    if (!queryCandidateId || loading || historyModal.open || autoOpenedCandidateId === queryCandidateId) return;
    const target = list.find((item) => String(item._id) === String(queryCandidateId));
    if (target) {
      setAutoOpenedCandidateId(queryCandidateId);
      openHistory(target);
    }
  }, [queryCandidateId, loading, list, historyModal.open, autoOpenedCandidateId]);

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="min-w-0 space-y-5">
      {historyModal.open && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/55 p-3 sm:p-5">
          <div className="flex h-[min(860px,calc(100vh-40px))] w-[min(1180px,calc(100vw-32px))] max-w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <h2 className="truncate text-base font-extrabold text-slate-800 sm:text-lg">Application History</h2>
                <p className="mt-0.5 truncate text-xs font-semibold text-slate-400 sm:text-sm">
                  {historyModal.data?.jobseeker?.name || 'Jobseeker'} {historyModal.data?.jobseeker?.email ? `· ${historyModal.data.jobseeker.email}` : ''}
                </p>
              </div>
              <button type="button" onClick={closeHistory} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close history">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/40 p-4 sm:p-5">
              {historyModal.loading ? (
                <div className="flex min-h-64 items-center justify-center">
                  <Loader className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : historyModal.error ? (
                <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{historyModal.error}</div>
              ) : (
                <>
                  <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <div className="min-w-0"><span className="block text-[11px] font-extrabold uppercase text-slate-400">Phone</span><span className="block truncate font-bold text-slate-800">{historyModal.data?.jobseeker?.phone || '—'}</span></div>
                      <div className="min-w-0"><span className="block text-[11px] font-extrabold uppercase text-slate-400">Location</span><span className="block truncate font-bold text-slate-800">{historyModal.data?.jobseeker?.location || '—'}</span></div>
                      <div className="min-w-0"><span className="block text-[11px] font-extrabold uppercase text-slate-400">Qualification</span><span className="block truncate font-bold text-slate-800">{historyModal.data?.jobseeker?.qualification || '—'}</span></div>
                      <div className="min-w-0"><span className="block text-[11px] font-extrabold uppercase text-slate-400">Experience</span><span className="block truncate font-bold text-slate-800">{historyModal.data?.jobseeker?.experience || '—'}</span></div>
                      <div className="min-w-0"><span className="block text-[11px] font-extrabold uppercase text-slate-400">Status</span><span className="block truncate font-bold capitalize text-slate-800">{historyModal.data?.jobseeker?.status || '—'}</span></div>
                      <div>
                        <span className="block text-[11px] font-extrabold uppercase text-slate-400">Resume</span>
                        {historyModal.data?.jobseeker?.resume ? (
                          <a
                            href={historyModal.data.jobseeker.resume.startsWith('http') ? historyModal.data.jobseeker.resume : `http://${historyModal.data.jobseeker.resume}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-indigo-600"
                          >
                            <FileText className="h-4 w-4" /> Resume
                          </a>
                        ) : (
                          <span className="font-bold text-slate-800">—</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                      ['Total', historyModal.data?.stats?.total || 0],
                      ['Applied', historyModal.data?.stats?.applied || 0],
                      ['Shortlisted', historyModal.data?.stats?.shortlisted || 0],
                      ['Interview', historyModal.data?.stats?.interview || 0],
                      ['Offered', historyModal.data?.stats?.offered || 0],
                      ['Rejected', historyModal.data?.stats?.rejected || 0],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                        <p className="text-xs font-extrabold text-slate-400">{label}</p>
                        <p className="mt-1 text-2xl font-black leading-none text-slate-800">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="max-w-full overflow-x-auto">
                    <table className="w-full min-w-[920px] text-left text-sm">
                      <thead className="bg-slate-100 text-[11px] uppercase text-slate-500">
                        <tr>
                          <th className="w-[27%] px-4 py-3">Employer</th>
                          <th className="w-[28%] px-4 py-3">Job</th>
                          <th className="w-[13%] px-4 py-3">Applied</th>
                          <th className="w-[14%] px-4 py-3">Application Status</th>
                          <th className="w-[10%] px-4 py-3">Job Status</th>
                          <th className="w-[8%] px-4 py-3 text-right">Match</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(historyModal.data?.history || []).length ? historyModal.data.history.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 align-top">
                              <div className="max-w-[280px] truncate font-bold text-slate-800" title={row.employerName}>{row.employerName}</div>
                              <div className="max-w-[280px] truncate text-xs font-semibold text-slate-400" title={row.employerEmail || ''}>{row.employerEmail || '—'}</div>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="max-w-[300px] truncate font-bold text-slate-800" title={row.jobTitle}>{row.jobTitle}</div>
                              <div className="max-w-[300px] truncate text-xs font-semibold text-slate-400" title={row.jobLocation || ''}>{row.jobLocation || '—'}</div>
                            </td>
                            <td className="px-4 py-3 align-top font-semibold text-slate-600">{row.appliedDisplayDate}</td>
                            <td className="px-4 py-3 align-top"><span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-extrabold text-indigo-600">{row.applicationStatus}</span></td>
                            <td className="px-4 py-3 align-top font-semibold capitalize text-slate-600">{row.jobStatus || '—'}</td>
                            <td className="px-4 py-3 text-right align-top font-black text-indigo-600">{row.matchScore}%</td>
                          </tr>
                        )) : (
                          <tr><td colSpan="6" className="px-4 py-10 text-center text-sm font-bold text-slate-400">No applications found for this jobseeker.</td></tr>
                        )}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
  <h4 className="text-xl font-bold text-slate-800">Jobseekers</h4>
  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
    <span>Dashboard</span>
    <span>&gt;</span>
    <span className="text-indigo-600">Manage Jobseekers</span>
  </div>
</div>

      {/* Alert Message */}
      {message.text && (
        <div className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium ${
          message.type === 'success'
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
            : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {message.type === 'success'
            ? <CheckCircle className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Card */}
      <div className="min-w-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden -ml-3 lg:-ml-5">

        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-base font-bold text-slate-800">Jobseeker Listings</h4>
          <Link
            to="/admin/jobseekers/add"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Jobseeker
          </Link>
        </div>

        {/* Card Body */}
        <div className="min-w-0 p-4 md:p-5">

          {/* Search + Sort + Count */}
          <div className="flex items-center gap-3 mb-4 flex-wrap w-full">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by name, email, phone or experience…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-full sm:w-72 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            </div>

            <div className="w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 w-full sm:w-44 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 cursor-pointer"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="az">A to Z</option>
                <option value="za">Z to A</option>
              </select>
            </div>

            <span className="ml-auto text-xs text-slate-400 font-medium">
              Showing {filteredList.length} of {list.length} jobseekers
            </span>
          </div>

          {/* Mobile cards */}
          <ResponsiveCardList
            items={paginatedList}
            emptyMessage="No candidates found."
            renderCard={(item, index) => (
              <div
                role="button"
                tabIndex={0}
                onClick={() => openHistory(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') openHistory(item);
                }}
                className="flex cursor-pointer flex-col gap-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{item.name}</div>
                      <div className="text-xs text-slate-500 truncate">{item.userId?.email || '—'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-indigo-600">{item.currentPlan?.planName || 'N/A'}</div>
                    {item.planValidity && <div className="text-[10px] text-slate-400">Till: {new Date(item.planValidity).toLocaleDateString()}</div>}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div>
                    {item.profileIncomplete ? (
                      <>
                        <div className="text-slate-700 font-medium">{item.workStatus || 'Work status not filled'}</div>
                        <div className="text-slate-500">Registered: {formatDate(item.registeredOn || item.createDate)}</div>
                        <div className="text-slate-500">Updates: {formatConsent(item.updatesConsent)}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-slate-700 font-medium">{item.city}, {item.state}</div>
                        <div className="text-slate-500">{item.qualification?.name || 'N/A'} • {item.experience}</div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.profileIncomplete ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600">Profile pending</span>
                    ) : (
                      <>
                        <a
                          href={item.resume?.startsWith('http') ? item.resume : `http://${item.resume}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${item.resume ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                        {item.status !== 'active' && (
                          <button onClick={(e) => { e.stopPropagation(); toggleStatus(item, 'active'); }} className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        {item.status !== 'blacklist' && (
                          <button onClick={(e) => { e.stopPropagation(); toggleStatus(item, 'blacklist'); }} className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/jobseekers/edit/${item._id}`); }} className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); openHistory(item); }} className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                          <History className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }} className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {item.profileIncomplete && (
                      <button onClick={(e) => { e.stopPropagation(); openHistory(item); }} className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                        <History className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          />

          {/* Table */}
          <div className="max-w-full overflow-x-auto hidden md:block">
            <table className="w-full text-xs md:text-sm text-left min-w-[1120px]">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Qualification</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-slate-400 text-sm">
                      No candidates found.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item, index) => (
                    <tr key={item._id} onClick={() => openHistory(item)} className="cursor-pointer odd:bg-white even:bg-slate-50 hover:bg-slate-100">
                      <td className="px-4 py-3 text-slate-400 text-xs font-medium">
                        {String(startIndex + index + 1).padStart(3, '0')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="font-semibold text-slate-800 whitespace-nowrap">{item.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{item.userId?.email || '—'}</td>
                      <td className="px-4 py-3 text-indigo-500 font-medium text-xs">{item.phone}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold">
                          {item.profileIncomplete ? 'Public Registration' : item.qualification?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs font-medium">
                        {item.profileIncomplete ? item.workStatus || '—' : item.experience}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        <div className="font-medium text-slate-700">
                          {item.city || (item.profileIncomplete ? 'Not provided' : '—')}
                        </div>
                        <div className="text-slate-400">
                          {item.state || (item.profileIncomplete ? 'Profile pending' : '—')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-indigo-600 text-xs">
                          {item.profileIncomplete ? item.source || 'Public Registration' : item.currentPlan?.planName || 'N/A'}
                        </div>
                        {item.profileIncomplete ? (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Updates: {formatConsent(item.updatesConsent)}
                          </div>
                        ) : item.planValidity && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Till: {new Date(item.planValidity).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600'
                            : item.status === 'pending'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          {item.profileIncomplete ? 'profile pending' : item.status}
                        </span>
                        {item.status === 'blacklist' && item.blacklistReason && (
                          <div
                            className="text-[10px] text-rose-400 mt-1 max-w-[120px] truncate"
                            title={item.blacklistReason}
                          >
                            {item.blacklistReason}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {item.profileIncomplete ? (
                            <>
                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600">Profile pending</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); openHistory(item); }}
                                title="Application History"
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-sky-50 hover:bg-sky-100 text-sky-600 transition-colors"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              {item.resume && (
                                <a
                                  href={item.resume.startsWith('http') ? item.resume : `http://${item.resume}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="View Resume"
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-7 h-7 rounded-full flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-500 transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {item.status !== 'active' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleStatus(item, 'active'); }}
                                  title="Activate"
                                  className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {item.status !== 'blacklist' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleStatus(item, 'blacklist'); }}
                                  title="Blacklist"
                                  className="w-7 h-7 rounded-full flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-500 transition-colors"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/admin/jobseekers/edit/${item._id}`); }}
                                title="Edit"
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); openHistory(item); }}
                                title="Application History"
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-sky-50 hover:bg-sky-100 text-sky-600 transition-colors"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                                title="Delete"
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentPage={currentPage}
            entriesPerPage={entriesPerPage}
            total={filteredList.length}
            label="jobseekers"
            onPageChange={setCurrentPage}
            onEntriesPerPageChange={setEntriesPerPage}
          />

        </div>
      </div>

    </div>
  );
};

export default Jobseekers;
