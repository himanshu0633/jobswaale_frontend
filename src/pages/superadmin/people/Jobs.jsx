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
  Calendar,
  FileText,
  Lock,
  Unlock,
  MapPin,
  Trash2,
  ChevronRight,
  X,
} from 'lucide-react';
import ResponsiveCardList from '../../../components/ResponsiveCardList';

// Same theme tones used across the admin (lifted from the template's CSS
// custom properties: --ins-primary / --ins-success / --ins-warning / --ins-danger / --ins-secondary
// and their *-bg-subtle counterparts) so badges/buttons resolve to identical hex values.
const tones = {
  primary: { bg: 'bg-[#e8e6fa]', text: 'text-[#6658dd]', solid: 'bg-[#6658dd] hover:bg-[#574bbc]' },
  success: { bg: 'bg-[#ddf5f0]', text: 'text-[#1abc9c]', solid: 'bg-[#1abc9c] hover:bg-[#16a085]' },
  warning: { bg: 'bg-[#fef4e4]', text: 'text-[#f7b84b]', solid: 'bg-[#f7b84b] hover:bg-[#d29c40]' },
  danger: { bg: 'bg-[#fde6e9]', text: 'text-[#f1556c]', solid: 'bg-[#f1556c] hover:bg-[#cd485c]' },
  secondary: { bg: 'bg-[#e4ecf9]', text: 'text-[#4a81d4]', solid: 'bg-[#4a81d4] hover:bg-[#3f6eb4]' },
};

const statusTone = {
  active: 'success',
  inactive: 'secondary',
  pending: 'warning',
};

const StatusBadge = ({ status }) => {
  const tone = tones[statusTone[status] || 'danger'];
  return (
    <span className={`inline-block whitespace-nowrap rounded-[5px] px-3 py-1 text-xs font-bold capitalize ${tone.bg} ${tone.text}`}>
      {status}
    </span>
  );
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const Jobs = () => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [detailModal, setDetailModal] = useState({ open: false, loading: false, error: '', data: null });
  const [autoOpenedJobId, setAutoOpenedJobId] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get('q') || '';
  const queryStatus = searchParams.get('status') || '';
  const queryJobId = searchParams.get('job') || '';

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/jobs`);
      setList(response.data);
      setFilteredList(response.data);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Failed to retrieve jobs database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  useEffect(() => {
    const q = search.toLowerCase();
    const filtered = list.filter(item =>
      (!queryStatus || item.status === queryStatus) && (
        (item.jobTitle || '').toLowerCase().includes(q) ||
        (item.companyName || '').toLowerCase().includes(q) ||
        (item.experience || '').toLowerCase().includes(q) ||
        (item.email || '').toLowerCase().includes(q)
      )
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'latest') {
        const dateA = new Date(a.postingDate || a.createDate || a.createdAt || 0);
        const dateB = new Date(b.postingDate || b.createDate || b.createdAt || 0);
        return dateB - dateA;
      }
      if (sortBy === 'oldest') {
        const dateA = new Date(a.postingDate || a.createDate || a.createdAt || 0);
        const dateB = new Date(b.postingDate || b.createDate || b.createdAt || 0);
        return dateA - dateB;
      }
      if (sortBy === 'az') {
        return (a.jobTitle || '').localeCompare(b.jobTitle || '');
      }
      if (sortBy === 'za') {
        return (b.jobTitle || '').localeCompare(a.jobTitle || '');
      }
      return 0;
    });

    setFilteredList(sorted);
  }, [search, list, sortBy, queryStatus]);

  const handleDelete = async (uid) => {
    if (!window.confirm('Delete this job posting permanently?')) return;
    try {
      await axios.delete(`${BASE_API_URL}/jobs/${uid}`);
      setList(list.filter(item => item._id !== uid));
      showMessage('success', 'Job posting deleted successfully.');
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error deleting job.');
    }
  };

  const toggleStatus = async (item, targetStatus) => {
    try {
      const res = await axios.put(`${BASE_API_URL}/jobs/${item._id}`, {
        ...item,
        jobCategory: item.jobCategory?._id || item.jobCategory,
        jobType: item.jobType?._id || item.jobType,
        qualification: item.qualification?._id || item.qualification,
        currentPlan: item.currentPlan?._id || item.currentPlan,
        status: targetStatus,
      });
      setList(list.map(j => j._id === item._id ? { ...j, status: res.data.status } : j));
      showMessage('success', `Job status updated to ${targetStatus}.`);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error updating job status.');
    }
  };

  const openJobDetails = async (item) => {
    setDetailModal({ open: true, loading: true, error: '', data: null });
    try {
      const response = await axios.get(`${BASE_API_URL}/jobs/${item._id}/applications`);
      setDetailModal({ open: true, loading: false, error: '', data: response.data });
    } catch (err) {
      setDetailModal({
        open: true,
        loading: false,
        error: err.response?.data?.message || 'Job details could not be loaded.',
        data: null
      });
    }
  };

  const closeJobDetails = () => setDetailModal({ open: false, loading: false, error: '', data: null });

  useEffect(() => {
    if (!queryJobId || loading || detailModal.open || autoOpenedJobId === queryJobId) return;
    const target = list.find((item) => String(item._id) === String(queryJobId));
    if (target) {
      setAutoOpenedJobId(queryJobId);
      openJobDetails(target);
    }
  }, [queryJobId, loading, list, detailModal.open, autoOpenedJobId]);

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="min-w-0 space-y-6">
      {detailModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="max-h-[88vh] w-full max-w-6xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">{detailModal.data?.job?.title || 'Job Details'}</h2>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {detailModal.data?.job?.company || 'Company'} {detailModal.data?.job?.location ? `· ${detailModal.data.job.location}` : ''}
                </p>
              </div>
              <button type="button" onClick={closeJobDetails} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close job details">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(88vh-76px)] overflow-y-auto p-5">
              {detailModal.loading ? (
                <div className="flex min-h-64 items-center justify-center">
                  <Loader className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : detailModal.error ? (
                <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{detailModal.error}</div>
              ) : (
                <>
                  <div className="mb-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                      <div className="grid gap-3 text-sm sm:grid-cols-2">
                        <div><span className="block text-xs font-bold uppercase text-slate-400">Category / Type</span><span className="font-bold text-slate-800">{detailModal.data?.job?.category} · {detailModal.data?.job?.type}</span></div>
                        <div><span className="block text-xs font-bold uppercase text-slate-400">Status</span><span className="font-bold capitalize text-slate-800">{detailModal.data?.job?.status || '—'}</span></div>
                        <div><span className="block text-xs font-bold uppercase text-slate-400">Vacancies</span><span className="font-bold text-slate-800">{detailModal.data?.job?.vacancies || 0}</span></div>
                        <div><span className="block text-xs font-bold uppercase text-slate-400">Experience</span><span className="font-bold text-slate-800">{detailModal.data?.job?.experience || '—'}</span></div>
                        <div><span className="block text-xs font-bold uppercase text-slate-400">Salary</span><span className="font-bold text-emerald-600">{detailModal.data?.job?.salary || 'Negotiable'}</span></div>
                        <div><span className="block text-xs font-bold uppercase text-slate-400">Posted</span><span className="font-bold text-slate-800">{formatDate(detailModal.data?.job?.postedOn)}</span></div>
                        <div><span className="block text-xs font-bold uppercase text-slate-400">Contact</span><span className="font-bold text-slate-800">{detailModal.data?.job?.contactPerson || '—'}</span></div>
                        <div><span className="block text-xs font-bold uppercase text-slate-400">Email / Phone</span><span className="font-bold text-slate-800">{detailModal.data?.job?.email || '—'} · {detailModal.data?.job?.phone || '—'}</span></div>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
                      {[
                        ['Total Applicants', detailModal.data?.stats?.total || 0],
                        ['Applied', detailModal.data?.stats?.applied || 0],
                        ['Shortlisted', detailModal.data?.stats?.shortlisted || 0],
                        ['Interview', detailModal.data?.stats?.interview || 0],
                        ['Offered', detailModal.data?.stats?.offered || 0],
                        ['Rejected', detailModal.data?.stats?.rejected || 0],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                          <p className="text-xs font-bold text-slate-400">{label}</p>
                          <p className="mt-1 text-xl font-black text-slate-800">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Candidate</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3">Location</th>
                          <th className="px-4 py-3">Experience</th>
                          <th className="px-4 py-3">Applied</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Match</th>
                          <th className="px-4 py-3">Resume</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(detailModal.data?.applicants || []).length ? detailModal.data.applicants.map((row) => (
                          <tr key={row.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/admin/jobseekers?q=${encodeURIComponent(row.candidateEmail || row.candidateName || '')}`)}>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-800">{row.candidateName}</div>
                              <div className="text-xs text-slate-400">{row.candidateEmail || '—'}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{row.candidatePhone || '—'}</td>
                            <td className="px-4 py-3 text-slate-600">{row.candidateLocation || '—'}</td>
                            <td className="px-4 py-3 text-slate-600">{row.experience || '—'}</td>
                            <td className="px-4 py-3 text-slate-600">{row.appliedDisplayDate}</td>
                            <td className="px-4 py-3"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">{row.applicationStatus}</span></td>
                            <td className="px-4 py-3 font-black text-indigo-600">{row.matchScore}%</td>
                            <td className="px-4 py-3">
                              {row.resume ? (
                                <a href={row.resume.startsWith('http') ? row.resume : `http://${row.resume}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600">
                                  <FileText className="h-4 w-4" /> Resume
                                </a>
                              ) : '—'}
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="8" className="px-4 py-10 text-center text-sm font-bold text-slate-400">No candidates have applied to this job yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page title head */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-1">
        <h1 className="text-lg font-bold text-[#4c4c5c]">Jobs</h1>
        <div className="flex items-center gap-1 text-sm text-[#9ba6b7]">
          <span>Dashboard</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#9ba6b7]">Manage Jobs</span>
        </div>
      </div>

      {/* Alert Message */}
      {message.text && (
        <div className={`flex items-center gap-2.5 rounded-[5px] px-4 py-3 text-sm font-medium ${
          message.type === 'success'
            ? 'bg-[#ddf5f0] text-[#16a085]'
            : 'bg-[#fde6e9] text-[#cd485c]'
        }`}>
          {message.type === 'success'
            ? <CheckCircle className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* ana */}
      <div className="min-w-0 overflow-hidden rounded-[5px] bg-white shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)]">

        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[#cbd2d9] px-6 py-[18px]">
          <h2 className="text-base font-semibold text-[#4c4c5c]">Job Listings</h2>
          <Link
            to="/admin/jobs/add"
            className="inline-flex items-center gap-1.5 rounded-[5px] bg-[#6658dd] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#574bbc]"
          >
            <Plus className="w-4 h-4" />
            Post a Job
          </Link>
        </div>

        {/* Card Body */}
        <div className="min-w-0 p-6">

          {/* Search + Sort + Count */}
          <div className="flex items-center gap-3 mb-4 flex-wrap w-full">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by job title, company, or keywords…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-full sm:w-72 border border-[#e7e9eb] rounded-[5px] text-sm text-[#4c4c5c] placeholder-[#9ba6b7] focus:outline-none focus:ring-2 focus:ring-[#6658dd]/20 focus:border-[#6658dd] bg-white"
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#9ba6b7]" />
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
              Showing {filteredList.length} of {list.length} jobs
            </span>
          </div>

          {/* Mobile cards */}
          <ResponsiveCardList
            items={filteredList}
            emptyMessage="No jobs posted yet."
            renderCard={(item) => (
              <div
                role="button"
                tabIndex={0}
                onClick={() => openJobDetails(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') openJobDetails(item);
                }}
                className="flex w-full cursor-pointer flex-col gap-2 text-left"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-[#4c4c5c]">{item.jobTitle}</div>
                    <div className="text-xs text-[#9ba6b7]">{item.companyName}</div>
                    <div className="text-xs text-[#6658dd] mt-1">{item.email} • {item.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#9ba6b7]">{new Date(item.postingDate).toLocaleDateString()}</div>
                    <div className="text-xs font-semibold text-[#1abc9c]">{item.salary || 'Negotiable'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#4c4c5c]">
                  <div>
                    <div className="text-[#4c4c5c]">{item.jobCategory?.categoryName || 'General'} • {item.jobType?.jobType || 'N/A'}</div>
                    <div className="text-[#9ba6b7]">{item.city}, {item.state}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/jobs/edit/${item._id}`); }} title="Edit Job" aria-label="Edit Job" className="w-8 h-8 rounded-full bg-[#1abc9c] text-white flex items-center justify-center">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }} title="Delete Job" aria-label="Delete Job" className="w-8 h-8 rounded-full bg-[#f1556c] text-white flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {item.status !== 'active' ? (
                      <button onClick={(e) => { e.stopPropagation(); toggleStatus(item, 'active'); }} title="Publish Job" aria-label="Publish Job" className="w-8 h-8 rounded-full bg-[#1abc9c] text-white flex items-center justify-center">
                        <Unlock className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); toggleStatus(item, 'inactive'); }} title="Unpublish Job" aria-label="Unpublish Job" className="w-8 h-8 rounded-full bg-[#f7b84b] text-white flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          />

          {/* Table */}
          <div className="max-w-full overflow-x-auto hidden md:block">
            <table className="w-full text-sm text-left min-w-[1120px]">
              <thead>
                <tr className="bg-[#dbe6f6] text-[11px] font-bold uppercase tracking-wide text-[#313a46]">
                  <th className="px-4 py-2.5">ID</th>
                  <th className="px-4 py-2.5">Job Title</th>
                  <th className="px-4 py-2.5">Company</th>
                  <th className="px-4 py-2.5">Category / Type</th>
                  <th className="px-4 py-2.5">Experience</th>
                  <th className="px-4 py-2.5">Salary</th>
                  <th className="px-4 py-2.5">Location</th>
                  <th className="px-4 py-2.5">Posted</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-[#9ba6b7] text-sm">
                      No jobs posted yet.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, index) => (
                    <tr key={item._id} onClick={() => openJobDetails(item)} className="cursor-pointer odd:bg-white even:bg-[#eef2f7]/45 border-t border-[#e7e9eb] hover:bg-[#f8f9fd]">
                      <td className="px-4 py-3 text-[#9ba6b7] text-xs font-medium">
                        {String(index + 1).padStart(3, '0')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#4c4c5c] whitespace-nowrap">{item.jobTitle}</div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] bg-[#fde6e9] text-[#f1556c] uppercase mt-1 inline-block">
                          {item.workMode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#4c4c5c] whitespace-nowrap">{item.companyName}</div>
                        <div className="text-xs text-[#9ba6b7] mt-0.5">{item.email}</div>
                        <div className="text-xs text-[#6658dd] font-medium mt-0.5">{item.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-[5px] bg-[#e8e6fa] text-[#6658dd] text-xs font-semibold block w-fit mb-1">
                          {item.jobCategory?.categoryName || 'General'}
                        </span>
                        <span className="px-2 py-0.5 rounded-[5px] bg-[#e4ecf9] text-[#4a81d4] text-xs font-semibold block w-fit">
                          {item.jobType?.jobType || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#4c4c5c] text-xs font-medium whitespace-nowrap">
                        {item.experience}
                      </td>
                      <td className="px-4 py-3 text-[#1abc9c] text-xs font-semibold whitespace-nowrap">
                        {item.salary || 'Negotiable'}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#4c4c5c]">
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <MapPin className="w-3 h-3 text-[#9ba6b7] shrink-0" />
                          {item.city}, {item.state}
                        </div>
                        <div className="text-[10px] text-[#9ba6b7] uppercase mt-0.5">{item.country}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#9ba6b7] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 shrink-0" />
                          {new Date(item.postingDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {item.status !== 'active' ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleStatus(item, 'active'); }}
                              title="Publish Job"
                              aria-label="Publish Job"
                              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1abc9c] hover:bg-[#16a085] text-white transition-colors"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleStatus(item, 'inactive'); }}
                              title="Unpublish Job"
                              aria-label="Unpublish Job"
                              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f7b84b] hover:bg-[#d29c40] text-white transition-colors"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/jobs/edit/${item._id}`); }}
                            title="Edit Job"
                            aria-label="Edit Job"
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1abc9c] hover:bg-[#16a085] text-white transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                            title="Delete Job"
                            aria-label="Delete Job"
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f1556c] hover:bg-[#cd485c] text-white transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Jobs;
