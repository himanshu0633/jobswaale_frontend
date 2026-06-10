import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import { 
  Users, 
  Plus, 
  Edit2, 
  Search, 
  AlertCircle, 
  CheckCircle,
  Loader,
  Ban,
  ShieldCheck,
  FileText,
  Trash2
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

  // Filter based on search input
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
      if (reason === null) return; // Cancelled
    }

    try {
      const res = await axios.put(`${BASE_API_URL}/jobseekers/${item._id}/status`, {
        status: targetStatus,
        blacklistReason: reason
      });
      setList(list.map(js => js._id === item._id ? { ...js, status: res.data.status, blacklistReason: res.data.blacklistReason } : js));
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            Jobseekers Directory
          </h1>
          <p className="text-sm text-slate-500">
            View, approve, modify, or blacklist candidate jobseeker profiles.
          </p>
        </div>
        <Link
          to="/jobseekers/add"
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/10 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Jobseeker</span>
        </Link>
      </div>

      {message.text && (
        <div className={`flex items-center gap-2.5 p-4 rounded-xl border text-sm font-medium transition-all ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter and Table Grid */}
      <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by Name, Email, Phone or Experience..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
            />
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          </div>
          <div className="text-xs text-slate-400 font-medium sm:ml-auto">
            Showing {filteredList.length} of {list.length} jobseekers
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs uppercase bg-slate-50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Candidate Info</th>
                <th className="px-6 py-4 font-semibold">Professional Details</th>
                <th className="px-6 py-4 font-semibold">Location Preference</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">No candidates found.</td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{item.name}</h4>
                          <span className="text-xs text-slate-400 block mt-0.5">{item.userId?.email || 'No login linked'}</span>
                          <span className="text-xs text-indigo-500 font-medium block">{item.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-slate-700">Qual: {item.qualification?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Exp: <span className="font-bold">{item.experience}</span></div>
                      {item.resume && (
                        <a 
                          href={item.resume.startsWith('http') ? item.resume : `http://${item.resume}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5 mt-1"
                        >
                          <FileText className="w-3 h-3" /> View Resume
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div>Preferred: <span className="font-semibold text-slate-700">{item.preferredLocation || 'Any'}</span></div>
                      <div className="mt-1 text-[11px] text-slate-400 uppercase">
                        {item.city}, {item.state} ({item.pinCode})
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div className="font-bold text-indigo-600">{item.currentPlan?.planName || 'N/A'}</div>
                      {item.planValidity && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Till: {new Date(item.planValidity).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : item.status === 'pending'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      {item.status === 'blacklist' && item.blacklistReason && (
                        <span className="text-[10px] text-rose-500 block max-w-[150px] truncate mt-1.5" title={item.blacklistReason}>
                          Reason: {item.blacklistReason}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {item.status !== 'active' && (
                          <button
                            onClick={() => toggleStatus(item, 'active')}
                            title="Activate Candidate"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        {item.status !== 'blacklist' && (
                          <button
                            onClick={() => toggleStatus(item, 'blacklist')}
                            title="Blacklist Candidate"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/jobseekers/edit/${item._id}`)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 border border-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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
  );
};
export default Jobseekers;
