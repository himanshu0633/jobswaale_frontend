import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bookmark, MapPin, PlusCircle, Building, Globe, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BASE_API_URL } from '../../../context/AuthContext';

export const JobseekerSavedEmployers = () => {
  const [savedEmployers, setSavedEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchSavedEmployers = async () => {
      try {
        const token = localStorage.getItem('publicToken');
        const res = await axios.get(`${BASE_API_URL}/jobseeker/saved-employers`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setSavedEmployers(res.data || []);
      } catch (err) {
        console.error('Fetch saved employers error:', err);
        setError('Failed to load saved employers. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSavedEmployers();
  }, []);

  const removeSaved = async (id) => {
    setRemovingId(id);
    try {
      const token = localStorage.getItem('publicToken');
      await axios.post(`${BASE_API_URL}/jobseeker/saved-employers/${id}/toggle`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setTimeout(() => {
        setSavedEmployers(prev => prev.filter(emp => emp.id !== id));
        setRemovingId(null);
      }, 300);
    } catch (err) {
      console.error('Remove saved employer error:', err);
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
          Saved Employers ({savedEmployers.length})
        </h4>
        <Link
          to="/employers"
          className="inline-flex items-center gap-[0.35rem] text-[0.85rem] font-semibold text-[#0047C7] transition-colors hover:text-[#FF6B00]"
        >
          <PlusCircle className="h-4 w-4" /> Browse More Employers
        </Link>
      </div>

      {/* Saved Employers Grid */}
      {savedEmployers.length === 0 ? (
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-12 text-center">
          <Building className="mx-auto mb-4 h-14 w-14 text-[#e2e8f0]" />
          <h5 className="text-lg font-bold text-[#0f172a]">No saved employers yet</h5>
          <p className="mt-1 text-sm text-[#94a3b8]">Start saving employers you're interested in.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedEmployers.map(employer => (
            <div
              key={employer.id}
              className={`flex flex-col rounded-xl border border-[#e2e8f0] bg-white p-[1.8rem] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(0,102,255,0.2)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] ${
                removingId === employer.id
                  ? 'scale-95 opacity-0'
                  : 'scale-100 opacity-100'
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  {employer.logoImg ? (
                    <img
                      src={employer.logoImg}
                      alt={employer.name}
                      className="h-[52px] w-[52px] rounded-lg object-cover border border-[#e2e8f0]"
                    />
                  ) : (
                    <div
                      className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-lg text-[1.4rem] font-bold ${employer.tone}`}
                    >
                      {employer.initial}
                    </div>
                  )}
                  <div>
                    <h3 className="mb-[0.2rem] text-base font-semibold leading-tight text-[#212529]">
                      <Link to={`/employer-detail?id=${employer.id}`} className="hover:underline">
                        {employer.name}
                      </Link>
                    </h3>
                    <p className="mb-0 text-[0.82rem] text-[#475569]">
                      {employer.industry}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeSaved(employer.id)}
                  title="Remove from saved"
                  className="shrink-0 rounded-[10px] border-0 px-5 py-3 text-[#dc3545] transition-colors hover:text-[#bb2d3b]"
                >
                  <Bookmark className="h-4 w-4 fill-current" />
                </button>
              </div>

              <div className="mb-4 flex flex-col gap-[0.4rem] text-[0.8rem] text-[#475569] mt-3">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#94a3b8]" /> {employer.location}
                </span>
                {employer.website && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-[#94a3b8]" />
                    <a
                      href={employer.website.startsWith('http') ? employer.website : `https://${employer.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-[#0047C7] truncate max-w-[180px]"
                    >
                      {employer.website.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </span>
                )}
                {employer.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#94a3b8]" /> {employer.phone}
                  </span>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-[#e2e8f0] pt-[0.8rem]">
                <span className="text-[0.85rem] font-bold text-[#0f172a]">
                  Active Employer
                </span>
                <Link
                  to={`/employer-detail?id=${employer.id}`}
                  className="rounded-[6px] bg-[#0047C7] px-5 py-3 text-sm font-normal leading-none text-white transition-colors hover:bg-[#0052cc]"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobseekerSavedEmployers;
