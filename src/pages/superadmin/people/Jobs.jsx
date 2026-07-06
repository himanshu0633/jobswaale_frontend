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
  Calendar,
  Lock,
  Unlock,
  MapPin,
  Trash2,
  ChevronRight,
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
        status: targetStatus,
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
        <Loader className="w-8 h-8 animate-spin text-[#6658dd]" />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">

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

      {/* Card */}
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

          {/* Search + Count */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
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
            <span className="ml-auto text-sm text-[#9ba6b7]">
              Showing {filteredList.length} of {list.length} jobs
            </span>
          </div>

          {/* Mobile cards */}
          <ResponsiveCardList
            items={filteredList}
            emptyMessage="No jobs posted yet."
            renderCard={(item, index) => (
              <div className="flex flex-col gap-2">
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
                    <button onClick={() => navigate(`/admin/jobs/edit/${item._id}`)} className="w-8 h-8 rounded-full bg-[#1abc9c] text-white flex items-center justify-center">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="w-8 h-8 rounded-full bg-[#f1556c] text-white flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {item.status !== 'active' ? (
                      <button onClick={() => toggleStatus(item, 'active')} className="w-8 h-8 rounded-full bg-[#1abc9c] text-white flex items-center justify-center">
                        <Unlock className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => toggleStatus(item, 'inactive')} className="w-8 h-8 rounded-full bg-[#f7b84b] text-white flex items-center justify-center">
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
                    <tr key={item._id} className="odd:bg-white even:bg-[#eef2f7]/45 border-t border-[#e7e9eb]">
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
                              onClick={() => toggleStatus(item, 'active')}
                              title="Publish Job"
                              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1abc9c] hover:bg-[#16a085] text-white transition-colors"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleStatus(item, 'inactive')}
                              title="Unpublish Job"
                              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f7b84b] hover:bg-[#d29c40] text-white transition-colors"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/admin/jobs/edit/${item._id}`)}
                            title="Edit"
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1abc9c] hover:bg-[#16a085] text-white transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            title="Delete"
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