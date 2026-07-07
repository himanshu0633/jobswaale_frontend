import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';
import {
  Users,
  UserCheck,
  UserPlus,
  ShieldCheck,
  ArrowLeft,
  Filter,
  RotateCcw,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader
} from 'lucide-react';

export const CandidateReports = () => {
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({ totalCandidates: 2543, active: 1892, newThisMonth: 128, verified: 1045 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [regDate, setRegDate] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Fetch report data from API
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_API_URL}/reports/candidates`);
      if (response.data) {
        setCandidates(response.data.candidates || []);
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch candidate reports:', err);
      setError('Could not retrieve live candidate reports database from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // Reset Filters
  const handleReset = () => {
    setSearch('');
    setSelectedExperience('');
    setSelectedLocation('');
    setSelectedSkill('');
    setRegDate('');
    setCurrentPage(1);
  };

  // Filter Logic
  const filteredCandidates = useMemo(() => {
    setCurrentPage(1); // Reset to page 1 when filter changes
    return candidates.filter(candidate => {
      const matchSearch = 
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase()) ||
        candidate.id.toLowerCase().includes(search.toLowerCase());

      const matchExperience = selectedExperience 
        ? candidate.experience === selectedExperience || 
          (selectedExperience === '0 - 1 Years' && candidate.experience === '1 Year') ||
          (selectedExperience === '1 - 3 Years' && (candidate.experience === '2 Years' || candidate.experience === '3 Years' || candidate.experience === '1 - 3 Years')) ||
          (selectedExperience === '3 - 5 Years' && (candidate.experience === '4 Years' || candidate.experience === '5 Years' || candidate.experience === '3 - 5 Years')) ||
          (selectedExperience === '5 - 10 Years' && (candidate.experience === '6 Years' || candidate.experience === '7 Years' || candidate.experience === '8 Years' || candidate.experience === '5 - 10 Years'))
        : true;

      const matchLocation = selectedLocation ? candidate.location === selectedLocation : true;
      const matchSkill = selectedSkill ? candidate.skills.includes(selectedSkill) : true;
      const matchRegDate = regDate ? candidate.regDate.includes(regDate) : true;

      return matchSearch && matchExperience && matchLocation && matchSkill && matchRegDate;
    });
  }, [candidates, search, selectedExperience, selectedLocation, selectedSkill, regDate]);

  // Pagination Logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredCandidates.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredCandidates.length / entriesPerPage) || 1;

  // Export Simulated
  const handleExport = (format) => {
    alert(`Exporting Candidate Report listings as ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-slate-800">Candidate Reports</h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <span>Reports</span>
          <span>&gt;</span>
          <span className="text-indigo-600">Candidate Reports</span>
        </div>
      </div>

      {/* Dashboard Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Candidates */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">{stats.totalCandidates.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 font-semibold">Total Candidates</p>
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">{stats.active.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 font-semibold">Active</p>
            </div>
          </div>
        </div>

        {/* New This Month */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">{stats.newThisMonth.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 font-semibold">New This Month</p>
            </div>
          </div>
        </div>

        {/* Verified */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning-50 text-warning-600 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">{stats.verified.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 font-semibold">Verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid View / Card Listings */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden -ml-3 lg:-ml-5">
        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-base font-bold text-slate-800">Candidate Report Listings</h4>
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Reports
          </Link>
        </div>

        {/* Filters and List */}
        <div className="p-5 space-y-4">
          
          {/* Filters Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Registration Date filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Reg. Date</label>
              <input 
                type="text" 
                value={regDate}
                onChange={(e) => setRegDate(e.target.value)}
                placeholder="e.g. Jan 2024"
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Experience</label>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Experience</option>
                <option value="Fresher">Fresher</option>
                <option value="0 - 1 Years">0 - 1 Years</option>
                <option value="1 - 3 Years">1 - 3 Years</option>
                <option value="3 - 5 Years">3 - 5 Years</option>
                <option value="5 - 10 Years">5 - 10 Years</option>
                <option value="10+ Years">10+ Years</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Locations</option>
                <option value="Chandigarh">Chandigarh</option>
                <option value="Hamirpur">Hamirpur</option>
                <option value="Delhi">Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Pune">Pune</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Skills</label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Skills</option>
                <option value="React">React</option>
                <option value="Angular">Angular</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="PHP">PHP</option>
                <option value="Laravel">Laravel</option>
                <option value="UI/UX">UI/UX</option>
                <option value="Digital Marketing">Digital Marketing</option>
              </select>
            </div>

            {/* Search term */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Search</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search candidate..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            </div>

            {/* Export options */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExport('csv')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Table Container */}
          <div className="border border-slate-100 rounded-xl overflow-hidden mt-4 min-h-[150px] flex flex-col justify-center">
            {loading ? (
              <div className="flex items-center justify-center p-8 text-slate-500 text-xs font-semibold gap-2">
                <Loader className="w-4 h-4 animate-spin text-indigo-600" />
                Loading candidate reports database...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 bg-slate-50/50">
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Candidate ID</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Name</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Email</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Experience</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Registration Date</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentEntries.length > 0 ? (
                      currentEntries.map(candidate => (
                        <tr key={candidate.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-4 text-slate-500">{candidate.id}</td>
                          <td className="py-3 px-4 text-slate-800 font-bold">{candidate.name}</td>
                          <td className="py-3 px-4 text-slate-600">{candidate.email}</td>
                          <td className="py-3 px-4 text-slate-500">{candidate.experience}</td>
                          <td className="py-3 px-4 text-slate-500">{candidate.regDate}</td>
                          <td className="py-3 px-4 text-slate-500">{candidate.lastLogin}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400 font-normal">
                          No candidate reports match your active filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {!loading && filteredCandidates.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-normal">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
                <span className="text-xs text-slate-500 font-normal">entries</span>
                <span className="text-xs text-slate-400 font-normal ml-3">
                  Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredCandidates.length)} of {filteredCandidates.length} records
                </span>
              </div>

              {/* Page Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                      currentPage === page
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CandidateReports;
