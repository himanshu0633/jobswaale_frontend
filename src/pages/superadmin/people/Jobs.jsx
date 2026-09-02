import React, { useState, useEffect, useMemo } from 'react';
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
  Briefcase,
  Clock,
  Layers,
  CheckCheck,
} from 'lucide-react';
import ResponsiveCardList from '../../../components/ResponsiveCardList';

const tones = {
  primary: { bg: 'bg-[#e8e6fa]', text: 'text-[#6658dd]', solid: 'bg-[#6658dd] hover:bg-[#574bbc]' },
  success: { bg: 'bg-[#ddf5f0]', text: 'text-[#1abc9c]', solid: 'bg-[#1abc9c] hover:bg-[#16a085]' },
  warning: { bg: 'bg-[#fef4e4]', text: 'text-[#f7b84b]', solid: 'bg-[#f7b84b] hover:bg-[#d29c40]' },
  danger: { bg: 'bg-[#fde6e9]', text: 'text-[#f1556c]', solid: 'bg-[#f1556c] hover:bg-[#cd485c]' },
  secondary: { bg: 'bg-[#e4ecf9]', text: 'text-[#4a81d4]', solid: 'bg-[#4a81d4] hover:bg-[#3f6eb4]' },
};

const statusTone = {
  active: 'success',
  featured: 'primary',
  inactive: 'warning',
  pending: 'warning',
  draft: 'secondary',
  closed: 'danger',
};

const StatusBadge = ({ status }) => {
  const toneKey = statusTone[status] || 'danger';
  const tone = tones[toneKey];
  return (
    <span className={`inline-block whitespace-nowrap rounded-[5px] px-2.5 py-0.5 text-xs font-bold capitalize ${tone.bg} ${tone.text}`}>
      {status === 'inactive' ? 'Inactive' : status}
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

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken') || localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const Jobs = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [detailModal, setDetailModal] = useState({ open: false, loading: false, error: '', data: null });
  const [autoOpenedJobId, setAutoOpenedJobId] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const querySearch = searchParams.get('q') || '';
  const queryStatus = searchParams.get('status') || '';
  const queryJobId = searchParams.get('job') || '';

  const [activeTab, setActiveTab] = useState(() => {
    if (queryStatus === 'inactive') return 'inactive';
    if (queryStatus === 'active') return 'active';
    if (queryStatus === 'both') return 'both';
    return 'active';
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/jobs`, {
        headers: getAuthHeaders()
      });
      setList(response.data);
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
    if (querySearch) {
      setSearch(querySearch);
    }
  }, [querySearch]);

  useEffect(() => {
    if (queryStatus === 'inactive') setActiveTab('inactive');
    else if (queryStatus === 'active') setActiveTab('active');
    else if (queryStatus === 'both') setActiveTab('both');
  }, [queryStatus]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    const newParams = new URLSearchParams(searchParams);
    if (tabKey === 'both') {
      newParams.set('status', 'both');
    } else {
      newParams.set('status', tabKey);
    }
    setSearchParams(newParams, { replace: true });
  };

  const filterAndSortJobs = (jobs) => {
    const q = search.toLowerCase().trim();
    const filtered = jobs.filter((item) => {
      if (!q) return true;
      return (
        (item.jobTitle || '').toLowerCase().includes(q) ||
        (item.companyName || '').toLowerCase().includes(q) ||
        (item.experience || '').toLowerCase().includes(q) ||
        (item.email || '').toLowerCase().includes(q) ||
        (item.city || '').toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
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
  };

  const activeJobs = useMemo(() => {
    return list.filter(item => item.status === 'active' || item.status === 'featured');
  }, [list]);

  const inactiveJobs = useMemo(() => {
    return list.filter(item => item.status !== 'active' && item.status !== 'featured');
  }, [list]);

  const filteredActiveJobs = useMemo(() => filterAndSortJobs(activeJobs), [activeJobs, search, sortBy]);
  const filteredInactiveJobs = useMemo(() => filterAndSortJobs(inactiveJobs), [inactiveJobs, search, sortBy]);

  const handleDelete = async (uid) => {
    if (!window.confirm('Delete this job posting permanently?')) return;
    try {
      await axios.delete(`${BASE_API_URL}/jobs/${uid}`, {
        headers: getAuthHeaders()
      });
      setList(prev => prev.filter(item => item._id !== uid));
      showMessage('success', 'Job posting deleted successfully.');
    } catch (err) {
      console.error(err);
      showMessage('error', err.response?.data?.message || 'Error deleting job.');
    }
  };

  const toggleStatus = async (item, targetStatus) => {
    setActionLoadingId(item._id);
    try {
      const res = await axios.put(`${BASE_API_URL}/jobs/${item._id}`, {
        ...item,
        jobCategory: item.jobCategory?._id || item.jobCategory,
        jobType: item.jobType?._id || item.jobType,
        qualification: item.qualification?._id || item.qualification,
        currentPlan: item.currentPlan?._id || item.currentPlan,
        status: targetStatus,
      }, {
        headers: getAuthHeaders()
      });

      const updatedStatus = res.data?.status || targetStatus;
      setList(prev => prev.map(j => j._id === item._id ? { ...j, status: updatedStatus } : j));

      if (targetStatus === 'active') {
        showMessage('success', `Job "${item.jobTitle}" is now ACTIVE and published live for candidates.`);
      } else {
        showMessage('success', `Job "${item.jobTitle}" status changed to INACTIVE.`);
      }
    } catch (err) {
      console.error(err);
      showMessage('error', err.response?.data?.message || 'Error updating job status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openJobDetails = async (item) => {
    setDetailModal({ open: true, loading: true, error: '', data: null });
    try {
      const response = await axios.get(`${BASE_API_URL}/jobs/${item._id}/applications`, {
        headers: getAuthHeaders()
      });
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

  const renderJobTable = (items, type) => {
    const isInactive = type === 'inactive';
    return (
      <div className="space-y-4">
        {/* Mobile cards */}
        <div className="md:hidden">
          <ResponsiveCardList
            items={items}
            emptyMessage={isInactive ? "No inactive jobs pending approval. All jobs are active!" : "No active jobs found."}
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
                    <div className="mt-1"><StatusBadge status={item.status} /></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#4c4c5c] pt-1 border-t border-slate-100">
                  <div>
                    <div className="text-[#4c4c5c]">{item.jobCategory?.categoryName || 'General'} • {item.jobType?.jobType || 'N/A'}</div>
                    <div className="text-[#9ba6b7]">{item.city}, {item.state}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isInactive ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleStatus(item, 'active'); }}
                        disabled={actionLoadingId === item._id}
                        title="Activate Job"
                        className="inline-flex items-center gap-1 rounded bg-[#1abc9c] px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#16a085]"
                      >
                        {actionLoadingId === item._id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
                        Activate
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleStatus(item, 'inactive'); }}
                        disabled={actionLoadingId === item._id}
                        title="Deactivate Job"
                        className="inline-flex items-center gap-1 rounded bg-[#f7b84b] px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#d29c40]"
                      >
                        {actionLoadingId === item._id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                        Deactivate
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/jobs/edit/${item._id}`); }}
                      title="Edit Job"
                      aria-label="Edit Job"
                      className="w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                      title="Delete Job"
                      aria-label="Delete Job"
                      className="w-7 h-7 rounded bg-[#fde6e9] text-[#f1556c] hover:bg-rose-100 flex items-center justify-center transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          />
        </div>

        {/* Desktop Table */}
        <div className="max-w-full overflow-x-auto hidden md:block rounded-[5px] border border-[#e7e9eb]">
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
                <th className="px-4 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-12 text-center text-[#9ba6b7] text-sm font-medium">
                    {isInactive ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CheckCheck className="w-8 h-8 text-emerald-500" />
                        <span className="font-semibold text-slate-700">No inactive jobs pending approval.</span>
                        <span className="text-xs text-slate-400">All jobs submitted by employers are currently active!</span>
                      </div>
                    ) : (
                      'No active jobs found matching your criteria.'
                    )}
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr
                    key={item._id}
                    onClick={() => openJobDetails(item)}
                    className="cursor-pointer odd:bg-white even:bg-[#eef2f7]/45 border-t border-[#e7e9eb] hover:bg-[#f8f9fd] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#9ba6b7] text-xs font-medium">
                      {String(index + 1).padStart(3, '0')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#4c4c5c] whitespace-nowrap">{item.jobTitle}</div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] bg-[#fde6e9] text-[#f1556c] uppercase mt-1 inline-block">
                        {item.workMode || 'Onsite'}
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
                        {formatDate(item.postingDate || item.createDate || item.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {isInactive ? (
                          <button
                            onClick={() => toggleStatus(item, 'active')}
                            disabled={actionLoadingId === item._id}
                            title="Activate & Publish Job"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-[5px] bg-[#1abc9c] hover:bg-[#16a085] text-white text-xs font-bold transition shadow-sm"
                          >
                            {actionLoadingId === item._id ? (
                              <Loader className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleStatus(item, 'inactive')}
                            disabled={actionLoadingId === item._id}
                            title="Deactivate Job"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-[5px] bg-[#f7b84b] hover:bg-[#d29c40] text-white text-xs font-bold transition shadow-sm"
                          >
                            {actionLoadingId === item._id ? (
                              <Loader className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                            Deactivate
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/admin/jobs/edit/${item._id}`)}
                          title="Edit Job"
                          aria-label="Edit Job"
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          title="Delete Job"
                          aria-label="Delete Job"
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-[#fde6e9] hover:bg-rose-100 text-[#f1556c] transition"
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
    );
  };

  return (
    <div className="min-w-0 space-y-6">
      {/* Detail Modal */}
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
              <button
                type="button"
                onClick={closeJobDetails}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close job details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(88vh-76px)] overflow-y-auto p-5">
              {detailModal.loading ? (
                <div className="flex min-h-64 items-center justify-center">
                  <Loader className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : detailModal.error ? (
                <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                  {detailModal.error}
                </div>
              ) : (
                <>
                  <div className="mb-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                      <div className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <span className="block text-xs font-bold uppercase text-slate-400">Category / Type</span>
                          <span className="font-bold text-slate-800">{detailModal.data?.job?.category} · {detailModal.data?.job?.type}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold uppercase text-slate-400">Status</span>
                          <span className="font-bold capitalize text-slate-800">{detailModal.data?.job?.status || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold uppercase text-slate-400">Vacancies</span>
                          <span className="font-bold text-slate-800">{detailModal.data?.job?.vacancies || 0}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold uppercase text-slate-400">Experience</span>
                          <span className="font-bold text-slate-800">{detailModal.data?.job?.experience || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold uppercase text-slate-400">Salary</span>
                          <span className="font-bold text-emerald-600">{detailModal.data?.job?.salary || 'Negotiable'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold uppercase text-slate-400">Posted</span>
                          <span className="font-bold text-slate-800">{formatDate(detailModal.data?.job?.postedOn)}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold uppercase text-slate-400">Contact</span>
                          <span className="font-bold text-slate-800">{detailModal.data?.job?.contactPerson || '—'}</span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold uppercase text-slate-400">Email / Phone</span>
                          <span className="font-bold text-slate-800">{detailModal.data?.job?.email || '—'} · {detailModal.data?.job?.phone || '—'}</span>
                        </div>
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

      {/* Page Title & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-1">
        <div>
          <h1 className="text-lg font-bold text-[#4c4c5c]">Jobs Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage and review active and inactive job postings</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-[#9ba6b7]">
          <span>Dashboard</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#9ba6b7]">Manage Jobs</span>
        </div>
      </div>

      {/* Alert Message Toast */}
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

      {/* Top KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Jobs Card */}
        <div
          onClick={() => handleTabChange('active')}
          className={`cursor-pointer rounded-[5px] bg-white p-5 border transition-all shadow-sm ${
            activeTab === 'active'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
              : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Jobs</span>
              <p className="mt-1 text-2xl font-black text-emerald-600">{activeJobs.length}</p>
              <p className="mt-1 text-xs text-slate-400">Live & searchable by candidates</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Inactive Jobs Card */}
        <div
          onClick={() => handleTabChange('inactive')}
          className={`cursor-pointer rounded-[5px] bg-white p-5 border transition-all shadow-sm relative ${
            activeTab === 'inactive'
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
              : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          {inactiveJobs.length > 0 && (
            <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 animate-pulse">
              Needs Approval
            </span>
          )}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Inactive Jobs</span>
              <p className="mt-1 text-2xl font-black text-amber-600">{inactiveJobs.length}</p>
              <p className="mt-1 text-xs text-slate-400">Awaiting superadmin activation</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Total Postings Card */}
        <div
          onClick={() => handleTabChange('both')}
          className={`cursor-pointer rounded-[5px] bg-white p-5 border transition-all shadow-sm ${
            activeTab === 'both'
              ? 'border-[#6658dd] ring-2 ring-[#6658dd]/20 shadow-md'
              : 'border-slate-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Postings</span>
              <p className="mt-1 text-2xl font-black text-slate-800">{list.length}</p>
              <p className="mt-1 text-xs text-slate-400">View both sections stacked</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e8e6fa] text-[#6658dd]">
              <Layers className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Global Controls & Tabs */}
      <div className="rounded-[5px] bg-white p-4 shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Section Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => handleTabChange('active')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-extrabold transition-all ${
                activeTab === 'active'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Active Jobs ({activeJobs.length})
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('inactive')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-extrabold transition-all ${
                activeTab === 'inactive'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Inactive Jobs ({inactiveJobs.length})
              {inactiveJobs.length > 0 && (
                <span className="rounded-full bg-amber-200/80 px-1.5 py-0.2 text-[10px] font-black text-amber-900">
                  {inactiveJobs.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('both')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-extrabold transition-all ${
                activeTab === 'both'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Both Sections
            </button>
          </div>

          {/* Right Action: Search + Sort + Post Job Button */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search job, company, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 w-full sm:w-56 border border-slate-200 rounded-[5px] text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6658dd]/20 focus:border-[#6658dd]"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-[5px] text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#6658dd]/20 cursor-pointer"
            >
              <option value="latest">Sort: Latest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="az">Sort: Title A-Z</option>
              <option value="za">Sort: Title Z-A</option>
            </select>

            <Link
              to="/admin/jobs/add"
              className="inline-flex items-center gap-1.5 rounded-[5px] bg-[#6658dd] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#574bbc]"
            >
              <Plus className="w-3.5 h-3.5" />
              Post a Job
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: INACTIVE JOBS (Shown in 'inactive' tab or 'both' stacked view)
          ========================================================================= */}
      {(activeTab === 'inactive' || activeTab === 'both') && (
        <div className="rounded-[5px] bg-white shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border border-amber-200 overflow-hidden">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-amber-200 bg-amber-50/40 px-6 py-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">!</span>
                <h2 className="text-base font-bold text-slate-800">Inactive Jobs Section</h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-extrabold text-amber-800">
                  {filteredInactiveJobs.length} {filteredInactiveJobs.length === 1 ? 'Job' : 'Jobs'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Employer postings submitted with inactive status. Superadmin can review and click <strong>Activate</strong> to publish them live.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Showing {filteredInactiveJobs.length} of {inactiveJobs.length} inactive
            </span>
          </div>

          <div className="p-6">
            {/* Helpful Approval Banner */}
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/80 p-3.5 mb-4 text-xs font-semibold text-amber-900">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800">Employer Job Postings Pending Approval</p>
                <p className="mt-0.5 text-amber-700">
                  When employers submit jobs, they automatically stay inactive until approved. Review the details below and click the green <strong>Activate</strong> button to publish them to candidate search and notify matching jobseekers.
                </p>
              </div>
            </div>

            {renderJobTable(filteredInactiveJobs, 'inactive')}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: ACTIVE JOBS (Shown in 'active' tab or 'both' stacked view)
          ========================================================================= */}
      {(activeTab === 'active' || activeTab === 'both') && (
        <div className="rounded-[5px] bg-white shadow-[0_0.75rem_6rem_rgba(56,65,74,0.03)] border border-[#cbd2d9] overflow-hidden">
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[#cbd2d9] bg-slate-50/60 px-6 py-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">✓</span>
                <h2 className="text-base font-bold text-slate-800">Active Jobs Section</h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  {filteredActiveJobs.length} {filteredActiveJobs.length === 1 ? 'Job' : 'Jobs'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Jobs currently active and visible to candidates on JobsWaale.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Showing {filteredActiveJobs.length} of {activeJobs.length} active
            </span>
          </div>

          <div className="p-6">
            {renderJobTable(filteredActiveJobs, 'active')}
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
