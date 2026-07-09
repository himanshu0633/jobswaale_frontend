import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bookmark, Clock, MapPin, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BASE_API_URL } from '../../../context/AuthContext';

export const JobseekerSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const token = localStorage.getItem('publicToken');
        const res = await axios.get(`${BASE_API_URL}/jobseeker/saved-jobs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setSavedJobs(res.data || []);
      } catch (err) {
        console.error('Fetch saved jobs error:', err);
        setError('Failed to load saved jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSavedJobs();
  }, []);

  const removeSaved = async (id) => {
    setRemovingId(id);
    try {
      const token = localStorage.getItem('publicToken');
      await axios.post(`${BASE_API_URL}/jobseeker/saved-jobs/${id}/toggle`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setTimeout(() => {
        setSavedJobs(prev => prev.filter(job => job.id !== id));
        setRemovingId(null);
      }, 300);
    } catch (err) {
      console.error('Remove saved job error:', err);
      setError('Failed to remove bookmark. Please try again.');
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0047C7] border-t-transparent"/>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* Section Header */}
      <div className="mb-5 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="text-[1.1rem] font-bold text-[#0f172a]">
          Saved Jobs ({savedJobs.length})
        </h4>
        <Link
          to="/"
          className="inline-flex items-center gap-[0.35rem] text-[0.85rem] font-semibold text-[#0047C7] transition-colors hover:text-[#FF6B00]"
        >
          <PlusCircle className="h-4 w-4" /> Browse More Jobs
        </Link>
      </div>

      {/* Saved Jobs Grid */}
      {savedJobs.length === 0 ? (
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-12 text-center">
          <Bookmark className="mx-auto mb-4 h-14 w-14 text-[#e2e8f0]" />
          <h5 className="text-lg font-bold text-[#0f172a]">No saved jobs yet</h5>
          <p className="mt-1 text-sm text-[#94a3b8]">Start saving jobs you're interested in.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedJobs.map(job => (
            <div
              key={job.id}
              className={`flex flex-col rounded-xl border border-[#e2e8f0] bg-white p-[1.8rem] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(0,102,255,0.2)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] ${
                removingId === job.id
                  ? 'scale-95 opacity-0'
                  : 'scale-100 opacity-100'
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-lg text-[1.4rem] font-bold ${job.tone}`}
                  >
                    {job.initial}
                  </div>
                  <div>
                    <h3 className="mb-[0.2rem] text-base font-semibold leading-tight text-[#212529]">
                      <Link to={`/jobs/${job.id}`} className="hover:underline">
                        {job.title}
                      </Link>
                    </h3>
                    <p className="mb-0 text-[0.82rem] text-[#475569]">
                      {job.company}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeSaved(job.id)}
                  title="Remove from saved"
                  className="shrink-0 rounded-[10px] border-0 px-5 py-3 text-[#dc3545] transition-colors hover:text-[#bb2d3b]"
                >
                  <Bookmark className="h-4 w-4 fill-current" />
                </button>
              </div>

              <div className="mb-4 flex flex-col gap-[0.4rem] text-[0.8rem] text-[#475569]">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {job.type}
                </span>
              </div>

              <div className="mt-0 flex items-center justify-between border-t border-[#e2e8f0] pt-[0.8rem]">
                <span className="text-[0.85rem] font-bold text-[#0f172a]">
                  {job.salary}
                </span>
                <Link
                  to={`/jobs/${job.id}`}
                  className="rounded-[6px] bg-[#0047C7] px-5 py-3 text-sm font-normal leading-none text-white transition-colors hover:bg-[#0052cc]"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobseekerSavedJobs;