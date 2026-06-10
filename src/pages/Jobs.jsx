import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import { 
  Briefcase, 
  Plus, 
  Edit2, 
  Search, 
  AlertCircle, 
  CheckCircle,
  Loader,
  Calendar,
  Lock,
  Unlock,
  MapPin,
  Trash2
} from 'lucide-react';

export const Jobs = () => {
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

  // Filter based on search input
  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredList(
      list.filter(item => 
        item.jobTitle.toLowerCase().includes(q) ||
        item.companyName.toLowerCase().includes(q) ||
        item.experience.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q)
      )
    );
  }, [search, list]);

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
        status: targetStatus
      });
      setList(list.map(j => j._id === item._id ? { ...j, status: res.data.status } : j));
      showMessage('success', `Job status updated to ${targetStatus}.`);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error updating job status.');
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
            Job Postings
          </h1>
          <p className="text-sm text-slate-500">
            Monitor, update, close, or publish job recruitment campaigns.
          </p>
        </div>
        <Link
          to="/jobs/add"
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/10 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Post a Job</span>
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
              placeholder="Search by Job Title, Company, or Keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
            />
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          </div>
          <div className="text-xs text-slate-400 font-medium sm:ml-auto">
            Showing {filteredList.length} of {list.length} jobs
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs uppercase bg-slate-50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Job Campaign</th>
                <th className="px-6 py-4 font-semibold">Company Details</th>
                <th className="px-6 py-4 font-semibold">Requirements</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">No jobs posted yet.</td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/30">
                    <td className="px-6 py-4">
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">{item.jobTitle}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                            {item.jobCategory?.categoryName || 'General'}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                            {item.jobType?.jobType || 'N/A'}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-600 uppercase">
                            {item.workMode}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-2">
                          <Calendar className="w-3.5 h-3.5" /> Published: {new Date(item.postingDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">{item.companyName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{item.email}</div>
                      <div className="text-xs text-indigo-500 font-medium mt-0.5">{item.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div>Exp: <span className="font-bold">{item.experience}</span></div>
                      <div className="mt-1">Qual: <span className="font-bold">{item.qualification?.name || 'Any'}</span></div>
                      <div className="mt-1">Salary: <span className="font-bold text-emerald-600">{item.salary || 'Negotiable'}</span></div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.city}, {item.state}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide block mt-1">Country: {item.country}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : item.status === 'inactive'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-rose-50 text-rose-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {item.status !== 'active' ? (
                          <button
                            onClick={() => toggleStatus(item, 'active')}
                            title="Publish Job"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleStatus(item, 'inactive')}
                            title="Unpublish Job"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-100"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/jobs/edit/${item._id}`)}
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
export default Jobs;
