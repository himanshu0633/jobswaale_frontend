import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
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
} from 'lucide-react';

export const Jobseekers = () => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
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
    setFilteredList(
      list.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        (item.userId?.email && item.userId.email.toLowerCase().includes(q)) ||
        item.experience.toLowerCase().includes(q)
      )
    );
  }, [search, list]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
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
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-base font-bold text-slate-800">Jobseeker Listings</h4>
          <Link
            to="/jobseekers/add"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Jobseeker
          </Link>
        </div>

        {/* Card Body */}
        <div className="p-5">

          {/* Search + Count */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, phone or experience…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-72 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            </div>
            <span className="ml-auto text-xs text-slate-400 font-medium">
              Showing {filteredList.length} of {list.length} jobseekers
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
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
                    <tr key={item._id} className="odd:bg-white even:bg-slate-50 {/*hover:bg-slate-50/50 transition-colors*/}">
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
                          {item.qualification?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs font-medium">{item.experience}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        <div className="font-medium text-slate-700">{item.city}</div>
                        <div className="text-slate-400">{item.state}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-indigo-600 text-xs">
                          {item.currentPlan?.planName || 'N/A'}
                        </div>
                        {item.planValidity && (
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
                          {item.status}
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
                            onClick={() => navigate(`/jobseekers/edit/${item._id}`)}
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