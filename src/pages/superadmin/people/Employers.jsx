import { useMemo, useState, useEffect } from 'react';
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
  Globe,
  Trash2,
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

const isEmployerVerified = (item) => item.isVerified === true && !item.profileIncomplete && item.status === 'active' && item.userId?.status !== 'inactive';

const VerificationBadge = ({ item }) => {
  const verified = isEmployerVerified(item);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
      verified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
    }`}>
      {verified ? <ShieldCheck className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
      {verified ? 'Verified' : 'Unverified'}
    </span>
  );
};

export const Employers = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  useEffect(() => {
    let isMounted = true;

    axios.get(`${BASE_API_URL}/employers`)
      .then((response) => {
        if (isMounted) {
          setList(response.data);
        }
      })
      .catch((err) => {
        console.error(err);
        showMessage('error', 'Failed to retrieve employers database.');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredList = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = list.filter(item => {
      const verificationText = isEmployerVerified(item) ? 'verified' : 'unverified';
      return (
        (item.companyName || '').toLowerCase().includes(q) ||
        (item.contactPerson && item.contactPerson.toLowerCase().includes(q)) ||
        (item.phone || '').includes(q) ||
        (item.userId?.email && item.userId.email.toLowerCase().includes(q)) ||
        (item.designation || '').toLowerCase().includes(q) ||
        (item.companyType || '').toLowerCase().includes(q) ||
        (item.companySize || '').toLowerCase().includes(q) ||
        verificationText.includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
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
        return (a.companyName || '').localeCompare(b.companyName || '');
      }
      if (sortBy === 'za') {
        return (b.companyName || '').localeCompare(a.companyName || '');
      }
      return 0;
    });
  }, [search, list, sortBy]);

  const handleDelete = async (uid) => {
    if (!window.confirm('Delete this employer profile and login user?')) return;
    try {
      await axios.delete(`${BASE_API_URL}/employers/${uid}`);
      setList(list.filter(item => item._id !== uid));
      showMessage('success', 'Employer deleted successfully.');
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error deleting employer.');
    }
  };

  const toggleStatus = async (item, targetStatus) => {
    let reason = '';
    if (targetStatus === 'blacklist') {
      reason = window.prompt('Specify reason for blacklisting:');
      if (reason === null) return;
    }
    try {
      const res = await axios.put(`${BASE_API_URL}/employers/${item._id}/status`, {
        status: targetStatus,
        blacklistReason: reason,
      });
      setList(list.map(emp =>
        emp._id === item._id
          ? { ...emp, status: res.data.status, blacklistReason: res.data.blacklistReason, isVerified: res.data.isVerified }
          : emp
      ));
      showMessage('success', `Employer status changed to ${targetStatus}.`);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error changing status.');
    }
  };

  const verifyEmployer = async (item) => {
    if (item.profileIncomplete) {
      showMessage('error', 'Complete employer profile before verification.');
      return;
    }

    try {
      const res = await axios.put(`${BASE_API_URL}/employers/${item._id}/verify`);
      setList(list.map(emp => emp._id === item._id ? { ...emp, ...res.data } : emp));
      showMessage('success', 'Employer verified successfully.');
    } catch (err) {
      console.error(err);
      showMessage('error', err.response?.data?.message || 'Error verifying employer.');
    }
  };

  const unverifyEmployer = async (item) => {
    try {
      const res = await axios.put(`${BASE_API_URL}/employers/${item._id}/unverify`);
      setList(list.map(emp => emp._id === item._id ? { ...emp, ...res.data } : emp));
      showMessage('success', 'Employer marked as unverified.');
    } catch (err) {
      console.error(err);
      showMessage('error', err.response?.data?.message || 'Error unverifying employer.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5">

      {/* Breadcrumb Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
  <h4 className="text-xl font-bold text-slate-800">Employers</h4>
  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
    <span>Dashboard</span>
    <span>&gt;</span>
    <span className="text-indigo-600">Manage Employer</span>
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
          <h4 className="text-base font-bold text-slate-800">Employer Listings</h4>
          <Link
            to="/admin/employers/add"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Employer
          </Link>
        </div>

        {/* Card Body */}
        <div className="min-w-0 p-4 md:p-5">

          {/* Search + Sort + Count */}
          <div className="flex items-center gap-3 mb-4 flex-wrap w-full">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by company, contact, email or phone…"
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
              Showing {filteredList.length} of {list.length} employers
            </span>
          </div>

          {/* Mobile cards */}
          <ResponsiveCardList
            items={filteredList}
            emptyMessage="No employers found."
            renderCard={(item) => (
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">{item.companyName}</div>
                    <div className="text-xs text-slate-500">{item.contactPerson || 'N/A'}</div>
                    {item.profileIncomplete && item.designation && (
                      <div className="text-xs text-slate-500">{item.designation}</div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">{item.userId?.email || '—'}</div>
                    <div className="mt-2">
                      <VerificationBadge item={item} />
                    </div>
                  </div>
                  <div className="text-right">
                    {item.website && (
                      <a href={item.website.startsWith('http') ? item.website : `http://${item.website}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-500">Website</a>
                    )}
                    <div className="text-xs text-slate-400">
                      {item.profileIncomplete ? `Registered: ${formatDate(item.registeredOn || item.createDate)}` : `${item.city}, ${item.state}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div>
                    <div className="text-slate-700 font-medium">
                      {item.profileIncomplete ? item.companyType || 'Company type not filled' : item.industryType?.industryType || 'N/A'}
                    </div>
                    <div className="text-slate-500">
                      {item.profileIncomplete ? `Size: ${item.companySize || '—'} • Updates: ${formatConsent(item.updatesConsent)}` : `Plan: ${item.currentPlan?.planName || 'N/A'}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.profileIncomplete ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600">Profile pending</span>
                    ) : (
                      <>
                        {!isEmployerVerified(item) && (
                          <button onClick={() => verifyEmployer(item)} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center" title="Verify">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {isEmployerVerified(item) && (
                          <button onClick={() => unverifyEmployer(item)} className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center" title="Unverify">
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        )}
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
                        <button onClick={() => navigate(`/admin/employers/edit/${item._id}`)} className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          />

          {/* Table */}
          <div className="max-w-full overflow-x-auto hidden md:block">
            <table className="w-full text-xs md:text-sm text-left min-w-[1220px]">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Contact Person</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Industry Type</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="px-4 py-8 text-center text-slate-400 text-sm">
                      No employers found.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, index) => (
                    <tr key={item._id} className="odd:bg-white even:bg-slate-50">
                      <td className="px-4 py-3 text-slate-400 text-xs font-medium">
                        {String(index + 1).padStart(3, '0')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{item.companyName}</div>
                        {item.website && (
                          <a
                            href={item.website.startsWith('http') ? item.website : `http://${item.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-0.5 text-xs text-slate-400 hover:text-indigo-500 mt-0.5"
                          >
                            <Globe className="w-3 h-3" /> Website
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{item.contactPerson || 'N/A'}</div>
                        {item.profileIncomplete && item.designation && (
                          <div className="text-[11px] text-slate-400">{item.designation}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{item.userId?.email || '—'}</td>
                      <td className="px-4 py-3 text-indigo-500 font-medium">{item.phone}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold">
                          {item.profileIncomplete ? item.companyType || 'Public Registration' : item.industryType?.industryType || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        <div className="font-medium">
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
                        <VerificationBadge item={item} />
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
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600">Profile pending</span>
                          ) : (
                            <>
                              {!isEmployerVerified(item) && (
                                <button
                                  onClick={() => verifyEmployer(item)}
                                  title="Verify"
                                  className="w-7 h-7 rounded-full flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {isEmployerVerified(item) && (
                                <button
                                  onClick={() => unverifyEmployer(item)}
                                  title="Unverify"
                                  className="w-7 h-7 rounded-full flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors"
                                >
                                  <AlertCircle className="w-3.5 h-3.5" />
                                </button>
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
                                onClick={() => navigate(`/admin/employers/edit/${item._id}`)}
                                title="Edit"
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
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

export default Employers;
