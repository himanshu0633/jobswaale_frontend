import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Users,
  Star,
  Code,
  ShieldAlert,
  UserPlus,
  Search,
  Bookmark,
  MapPin,
  MoreVertical,
  Trash2,
  Plus,
  X,
  Loader,
  CheckCircle2,
  Mail,
  User,
  Filter,
  RefreshCw,
  FolderPlus,
  Briefcase
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
};

const getCategoryColor = (cat) => {
  switch (cat) {
    case 'High Potential':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Technical Skills':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'Leadership Quality':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Cultural Fit':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const CandidateMenu = ({ candidate, isOpen, onToggle, onClose, onRemove, align = 'right-4' }) => (
  <div className="inline-block text-left">
    <button
      onClick={onToggle}
      className="p-1 rounded text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
    >
      <MoreVertical className="h-4.5 w-4.5" />
    </button>

    {isOpen && (
      <>
        <div className="fixed inset-0 z-10" onClick={onClose}></div>
        <div className={`absolute ${align} mt-1 w-40 rounded bg-white shadow-lg border border-slate-100 z-20 text-left py-1 text-xs`}>
          <a
            href={`mailto:${candidate.email}`}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:bg-slate-50 transition font-bold"
            onClick={onClose}
          >
            <Mail className="h-3.5 w-3.5" />
            Email Candidate
          </a>
          <button
            onClick={() => {
              onClose();
              onRemove(candidate.talentPoolId);
            }}
            className="w-full flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 transition font-bold border-t border-slate-50"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            Remove Candidate
          </button>
        </div>
      </>
    )}
  </div>
);

export const EmployerTalentPool = () => {
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({ totalCount: 0, highPotentialCount: 0, technicalCount: 0, leadershipCount: 0, newThisMonthCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Dropdown menus state
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Add to Pool Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchNonPoolText, setSearchNonPoolText] = useState('');
  const [nonPoolCandidates, setNonPoolCandidates] = useState([]);
  const [searchingNonPool, setSearchingNonPool] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [addForm, setAddForm] = useState({ category: 'High Potential', skills: '', note: '' });

  const loadTalentPool = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter) params.category = categoryFilter;
      if (experienceFilter) params.experience = experienceFilter;
      if (sortBy) params.sortBy = sortBy;

      const response = await axios.get(`${BASE_API_URL}/employer/talent-pool`, {
        headers: getTokenHeaders(),
        params
      });
      setCandidates(response.data.candidates || []);
      setStats(response.data.stats || { totalCount: 0, highPotentialCount: 0, technicalCount: 0, leadershipCount: 0, newThisMonthCount: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load talent pool candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTalentPool();
  }, [searchQuery, categoryFilter, experienceFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setExperienceFilter('');
    setSortBy('');
    setSuccess('Filters reset successfully.');
  };

  const handleRemoveCandidate = async (id) => {
    if (!window.confirm('Are you sure you want to remove this candidate from your talent pool?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${BASE_API_URL}/employer/talent-pool/${id}`, { headers: getTokenHeaders() });
      setSuccess('Candidate removed from talent pool.');
      await loadTalentPool();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove candidate.');
    }
  };

  // Search candidate database to add
  const handleSearchCandidates = async () => {
    setSearchingNonPool(true);
    setError('');
    try {
      const response = await axios.get(`${BASE_API_URL}/employer/talent-pool/search`, {
        headers: getTokenHeaders(),
        params: { search: searchNonPoolText }
      });
      setNonPoolCandidates(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search candidate repository.');
    } finally {
      setSearchingNonPool(false);
    }
  };

  // Add Candidate to Pool Submit
  const handleAddToPoolSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) {
      alert('Please select a candidate to add.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const skillsArray = addForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      await axios.post(`${BASE_API_URL}/employer/talent-pool`, {
        candidateId: selectedCandidate.id || selectedCandidate._id,
        category: addForm.category,
        skills: skillsArray,
        note: addForm.note
      }, { headers: getTokenHeaders() });

      setSuccess(`Successfully added ${selectedCandidate.name} to talent pool!`);
      setShowAddModal(false);
      setSelectedCandidate(null);
      setAddForm({ category: 'High Potential', skills: '', note: '' });
      setSearchNonPoolText('');
      setNonPoolCandidates([]);
      await loadTalentPool();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save candidate to pool.');
    }
  };

  return (
    <div className="space-y-4 px-3 sm:space-y-6 sm:px-0">
      {/* Title */}
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center md:gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-[#3f4254] sm:text-2xl">Talent Pool</h1>
          <p className="mt-1 text-xs font-semibold text-slate-400 sm:text-sm">Save, organize, and manage candidate profiles for future vacancies.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400 sm:text-sm">
          <span className="text-[#3f4254]">JobsWaale</span>
          <span className="text-slate-300">/</span>
          <span>Company</span>
          <span className="text-slate-300">/</span>
          <span className="text-[#6658dd]">Talent Pool</span>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* STATS METRIC ROW */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {[
          { title: 'Total in Pool', value: stats.totalCount, icon: Users, color: 'bg-indigo-50 text-indigo-500' },
          { title: 'High Potential', value: stats.highPotentialCount, icon: Star, color: 'bg-amber-50 text-amber-500' },
          { title: 'Technical Skills', value: stats.technicalCount, icon: Code, color: 'bg-sky-50 text-sky-500' },
          { title: 'Leadership Quality', value: stats.leadershipCount, icon: ShieldAlert, color: 'bg-purple-50 text-purple-500' },
          { title: 'New This Month', value: stats.newThisMonthCount, icon: UserPlus, color: 'bg-emerald-50 text-emerald-500' }
        ].map((item, idx) => (
          <div key={idx} className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm flex items-center gap-2 sm:p-5 sm:gap-3.5">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 sm:h-12 sm:w-12 ${item.color}`}>
              <item.icon className="h-4 w-4 sm:h-5.5 sm:w-5.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-400">{item.title}</p>
              <p className="mt-0.5 text-base font-black text-[#3f4254] sm:text-xl">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FILTER & DATA CARD */}
      <div className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex flex-col justify-between gap-4 sm:p-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-extrabold text-[#3f4254] text-base">Talent Pool Candidates</h3>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage bookmarks, categorize candidate profiles, and contact them directly.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setSelectedCandidate(null);
                setSearchNonPoolText('');
                setNonPoolCandidates([]);
                setShowAddModal(true);
              }}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#6658dd] px-4.5 text-xs font-extrabold text-white transition hover:bg-[#5848d8] shadow-sm sm:flex-none"
            >
              <Bookmark className="h-4 w-4" />
              Add to Pool
            </button>
            <a
              href="/employer/candidates"
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4.5 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 sm:flex-none"
            >
              <Search className="h-4 w-4" />
              Search Candidates
            </a>
          </div>
        </div>

        <div className="p-4 space-y-4 sm:p-5">
          {/* Filter Bar */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-12 text-xs font-bold text-slate-500">
            <div className="lg:col-span-2 xl:col-span-4">
              <label className="block mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Name, skills, location..."
                  className="w-full rounded border border-slate-200 pl-8 pr-3 py-2.5 text-xs text-[#3f4254] focus:border-[#6658dd] outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="xl:col-span-2">
              <label className="block mb-1">Category</label>
              <select
                className="w-full rounded border border-slate-200 px-3 py-2.5 text-xs text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option>High Potential</option>
                <option>Technical Skills</option>
                <option>Leadership Quality</option>
                <option>Cultural Fit</option>
                <option>Future Reference</option>
              </select>
            </div>

            <div className="xl:col-span-2">
              <label className="block mb-1">Experience</label>
              <select
                className="w-full rounded border border-slate-200 px-3 py-2.5 text-xs text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
              >
                <option value="">All Experience</option>
                <option>Fresher</option>
                <option>1 - 2 Years</option>
                <option>2 - 5 Years</option>
                <option>5+ Years</option>
              </select>
            </div>

            <div className="xl:col-span-2">
              <label className="block mb-1">Sort By</label>
              <select
                className="w-full rounded border border-slate-200 px-3 py-2.5 text-xs text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Newest First</option>
                <option>Oldest First</option>
                <option>Name A-Z</option>
                <option>Name Z-A</option>
              </select>
            </div>

            <div className="xl:col-span-2 flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full inline-flex h-9.5 items-center justify-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-700 hover:bg-emerald-100 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Candidates List */}
          {loading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader className="h-8 w-8 animate-spin text-[#6658dd]" />
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-100 rounded-lg space-y-2">
              <User className="h-10 w-10 text-slate-300 mx-auto" />
              <h5 className="font-extrabold text-[#3f4254] text-sm">No Candidates Found</h5>
              <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto px-4">Try refining your filter preferences or add new candidate profiles to your bookmarks list.</p>
            </div>
          ) : (
            <>
              {/* Card list — mobile only */}
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 sm:hidden">
                {candidates.map((candidate) => (
                  <div key={candidate.talentPoolId} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${candidate.avatarTone} text-slate-700 font-extrabold shadow-sm border border-slate-100`}>
                        {candidate.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h6 className="truncate font-extrabold text-[#3f4254] text-sm">{candidate.name}</h6>
                        <span className="block truncate text-slate-400 text-[11px] font-semibold">{candidate.email}</span>
                        <span className="inline-flex items-center gap-0.5 text-slate-400 text-[10px] font-bold">
                          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                          {candidate.location}
                        </span>
                      </div>
                      <CandidateMenu
                        candidate={candidate}
                        isOpen={activeDropdownId === candidate.talentPoolId}
                        onToggle={() => setActiveDropdownId(activeDropdownId === candidate.talentPoolId ? null : candidate.talentPoolId)}
                        onClose={() => setActiveDropdownId(null)}
                        onRemove={handleRemoveCandidate}
                        align="right-0"
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 4).map((skill, sIdx) => (
                        <span key={sIdx} className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 4 && (
                        <span className="inline-flex items-center rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-black text-[#6658dd]">
                          +{candidate.skills.length - 4}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-bold text-slate-500">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black ${getCategoryColor(candidate.category)}`}>
                        {candidate.category}
                      </span>
                      <span>{candidate.experience}</span>
                      <span className="text-slate-400">{formatDate(candidate.dateAdded)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table — sm and up */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-nowrap text-left border-collapse align-middle">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Skills</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Experience</th>
                      <th className="py-3 px-4">Date Added</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-bold text-[#3f4254]">
                    {candidates.map((candidate) => (
                      <tr key={candidate.talentPoolId} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-4.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${candidate.avatarTone} text-slate-700 font-extrabold shadow-sm border border-slate-100`}>
                              {candidate.initials}
                            </div>
                            <div className="space-y-0.5">
                              <h6 className="font-extrabold text-[#3f4254] text-sm hover:text-[#6658dd] cursor-pointer">
                                {candidate.name}
                              </h6>
                              <span className="block text-slate-400 text-[11px] font-semibold">{candidate.email}</span>
                              <span className="inline-flex items-center gap-0.5 text-slate-400 text-[10px] font-bold">
                                <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                {candidate.location}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4.5 px-4 whitespace-normal max-w-xs">
                          <div className="flex gap-1 flex-wrap">
                            {candidate.skills.slice(0, 4).map((skill, sIdx) => (
                              <span key={sIdx} className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 4 && (
                              <span className="inline-flex items-center rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-black text-[#6658dd]">
                                +{candidate.skills.length - 4}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4.5 px-4">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black ${getCategoryColor(candidate.category)}`}>
                            {candidate.category}
                          </span>
                        </td>
                        <td className="py-4.5 px-4 font-extrabold text-slate-500">{candidate.experience}</td>
                        <td className="py-4.5 px-4 text-slate-400 font-semibold">{formatDate(candidate.dateAdded)}</td>
                        <td className="py-4.5 px-4 text-center relative">
                          <CandidateMenu
                            candidate={candidate}
                            isOpen={activeDropdownId === candidate.talentPoolId}
                            onToggle={() => setActiveDropdownId(activeDropdownId === candidate.talentPoolId ? null : candidate.talentPoolId)}
                            onClose={() => setActiveDropdownId(null)}
                            onRemove={handleRemoveCandidate}
                            align="right-4"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ADD TO TALENT POOL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
              <h3 className="font-black text-base text-[#3f4254] flex items-center gap-1.5 sm:text-lg">
                <FolderPlus className="h-5 w-5 shrink-0 text-[#6658dd] sm:h-5.5 sm:w-5.5" />
                Add Candidate to Pool
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedCandidate(null);
                }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs font-bold text-slate-500 sm:p-6">
              {/* Search candidate input */}
              {!selectedCandidate ? (
                <div className="space-y-2">
                  <label className="block text-slate-600">Search Candidate Database</label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        placeholder="Search name, phone, or location..."
                        className="w-full rounded border border-slate-200 pl-8 pr-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                        value={searchNonPoolText}
                        onChange={e => setSearchNonPoolText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearchCandidates()}
                      />
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchCandidates}
                      className="rounded bg-[#6658dd] px-4 py-2 font-extrabold text-white hover:bg-[#5848d8] transition flex items-center justify-center gap-1"
                    >
                      {searchingNonPool ? <Loader className="h-4 w-4 animate-spin" /> : 'Search'}
                    </button>
                  </div>

                  {/* Search Results List */}
                  <div className="border border-slate-100 rounded-lg max-h-48 overflow-y-auto divide-y divide-slate-100 mt-2">
                    {searchingNonPool ? (
                      <div className="flex py-6 justify-center">
                        <Loader className="h-6 w-6 animate-spin text-[#6658dd]" />
                      </div>
                    ) : nonPoolCandidates.length === 0 ? (
                      <p className="text-center py-6 text-slate-400">Search for candidates above to select and bookmark them.</p>
                    ) : (
                      nonPoolCandidates.map(c => (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCandidate(c)}
                          className="p-3 hover:bg-slate-50/60 transition cursor-pointer flex justify-between items-center gap-2"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="h-8 w-8 shrink-0 rounded-full bg-indigo-50 text-[#6658dd] flex items-center justify-center font-extrabold text-[10px]">
                              {c.initials}
                            </div>
                            <div className="min-w-0">
                              <span className="font-extrabold text-[#3f4254] text-xs block truncate">{c.name}</span>
                              <span className="text-[10px] font-semibold text-slate-400 block truncate">{c.email} • {c.location}</span>
                            </div>
                          </div>
                          <span className="shrink-0 text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5">
                            {c.experience}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                // Selected Candidate info and categorization options
                <form onSubmit={handleAddToPoolSubmit} className="space-y-4">
                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-[#6658dd] text-white font-black flex items-center justify-center">
                        {selectedCandidate.initials}
                      </div>
                      <div className="min-w-0">
                        <h5 className="truncate font-extrabold text-sm text-[#3f4254]">{selectedCandidate.name}</h5>
                        <p className="truncate text-xs font-semibold text-slate-400">{selectedCandidate.email} • {selectedCandidate.location}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCandidate(null)}
                      className="shrink-0 text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded hover:bg-rose-100 transition"
                    >
                      Change
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-slate-600 mb-1">Pool Category *</label>
                      <select
                        required
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                        value={addForm.category}
                        onChange={e => setAddForm({ ...addForm, category: e.target.value })}
                      >
                        <option>High Potential</option>
                        <option>Technical Skills</option>
                        <option>Leadership Quality</option>
                        <option>Cultural Fit</option>
                        <option>Future Reference</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Key Skills (Comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. React, Node, REST API"
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                        value={addForm.skills}
                        onChange={e => setAddForm({ ...addForm, skills: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Optional Notes</label>
                    <textarea
                      rows="3"
                      placeholder="Write feedback, key qualities, or notes about this candidate..."
                      className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                      value={addForm.note}
                      onChange={e => setAddForm({ ...addForm, note: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col-reverse justify-end gap-2 pt-4 border-t border-slate-100 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setSelectedCandidate(null);
                      }}
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#6658dd] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#5848d8]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Add to Pool
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerTalentPool;