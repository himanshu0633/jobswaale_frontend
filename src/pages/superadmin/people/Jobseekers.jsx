import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';
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
  LayoutDashboard,
  ChevronRight,
  History,
  X,
} from 'lucide-react';
import ResponsiveCardList from '../../../components/ResponsiveCardList';

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
  const [message, setMessage] = useState({ type: '', text: '' });
  const [historyModal, setHistoryModal] = useState({ open: false, loading: false, error: '', data: null });
  const navigate = useNavigate();

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
    const q = search.toLowerCase();
    const filtered = list.filter(item =>
      (item.name || '').toLowerCase().includes(q) ||
      (item.phone || '').includes(q) ||
      (item.userId?.email && item.userId.email.toLowerCase().includes(q)) ||
      (item.experience || '').toLowerCase().includes(q) ||
      (item.workStatus || '').toLowerCase().includes(q) ||
      (item.source || '').toLowerCase().includes(q)
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
  }, [search, list, sortBy]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5">
      {historyModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">Application History</h2>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {historyModal.data?.jobseeker?.name || 'Jobseeker'} {historyModal.data?.jobseeker?.email ? `· ${historyModal.data.jobseeker.email}` : ''}
                </p>
              </div>
              <button type="button" onClick={closeHistory} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close history">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(88vh-76px)] overflow-y-auto p-5">
              {historyModal.loading ? (
                <div className="flex min-h-64 items-center justify-center">
                  <Loader className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : historyModal.error ? (
                <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{historyModal.error}</div>
              ) : (
                <>
                  <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                    {[
                      ['Total', historyModal.data?.stats?.total || 0],
                      ['Applied', historyModal.data?.stats?.applied || 0],
                      ['Shortlisted', historyModal.data?.stats?.shortlisted || 0],
                      ['Interview', historyModal.data?.stats?.interview || 0],
                      ['Offered', historyModal.data?.stats?.offered || 0],
                      ['Rejected', historyModal.data?.stats?.rejected || 0],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-400">{label}</p>
                        <p className="mt-1 text-xl font-black text-slate-800">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Employer</th>
                          <th className="px-4 py-3">Job</th>
                          <th className="px-4 py-3">Applied</th>
                          <th className="px-4 py-3">Application Status</th>
                          <th className="px-4 py-3">Job Status</th>
                          <th className="px-4 py-3">Match</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(historyModal.data?.history || []).length ? historyModal.data.history.map((row) => (
                          <tr key={row.id}>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-800">{row.employerName}</div>
                              <div className="text-xs text-slate-400">{row.employerEmail || '—'}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-800">{row.jobTitle}</div>
                              <div className="text-xs text-slate-400">{row.jobLocation || '—'}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{row.appliedDisplayDate}</td>
                            <td className="px-4 py-3"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">{row.applicationStatus}</span></td>
                            <td className="px-4 py-3 text-slate-600">{row.jobStatus || '—'}</td>
                            <td className="px-4 py-3 font-black text-indigo-600">{row.matchScore}%</td>
                          </tr>
                        )) : (
                          <tr><td colSpan="6" className="px-4 py-10 text-center text-sm font-bold text-slate-400">No applications found for this jobseeker.</td></tr>
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
            items={filteredList}
            emptyMessage="No candidates found."
            renderCard={(item, index) => (
              <div className="flex flex-col gap-2">
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
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${item.resume ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                        {item.status !== 'active' && (
                          <button onClick={() => toggleStatus(item, 'active')} className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        {item.status !== 'blacklist' && (
                          <button onClick={() => toggleStatus(item, 'blacklist')} className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => navigate(`/admin/jobseekers/edit/${item._id}`)} className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => openHistory(item)} className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                          <History className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {item.profileIncomplete && (
                      <button onClick={() => openHistory(item)} className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
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
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-slate-400 text-sm">
                      No candidates found.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, index) => (
                    <tr key={item._id} className="odd:bg-white even:bg-slate-50">
                      <td className="px-4 py-3 text-slate-400 text-xs font-medium">
                        {String(index + 1).padStart(3, '0')}
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
                                onClick={() => openHistory(item)}
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
                                  className="w-7 h-7 rounded-full flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-500 transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {item.status !== 'active' && (
                                <button
                                  onClick={() => toggleStatus(item, 'active')}
                                  title="Activate"
                                  className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {item.status !== 'blacklist' && (
                                <button
                                  onClick={() => toggleStatus(item, 'blacklist')}
                                  title="Blacklist"
                                  className="w-7 h-7 rounded-full flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-500 transition-colors"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => navigate(`/admin/jobseekers/edit/${item._id}`)}
                                title="Edit"
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openHistory(item)}
                                title="Application History"
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-sky-50 hover:bg-sky-100 text-sky-600 transition-colors"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
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

        </div>
      </div>

    </div>
  );
};

export default Jobseekers;
