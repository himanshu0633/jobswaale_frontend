import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';
import { 
  Briefcase, 
  ClipboardCheck, 
  Clock, 
  FileSpreadsheet, 
  ArrowLeft, 
  Filter, 
  RotateCcw, 
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader
} from 'lucide-react';

export const JobReports = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ totalJobs: 856, activeJobs: 247, expiredJobs: 129, totalApplications: 4582 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedEmployer, setSelectedEmployer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Fetch report data from API
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_API_URL}/reports/jobs`);
      if (response.data) {
        setJobs(response.data.jobs || []);
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch job reports:', err);
      setError('Could not retrieve live job reports database from backend.');
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
    setSelectedEmployer('');
    setSelectedStatus('');
    setSelectedType('');
    setSelectedIndustry('');
    setSelectedLocation('');
    setCurrentPage(1);
  };

  // Filter Logic
  const filteredJobs = useMemo(() => {
    setCurrentPage(1); // Reset to page 1 when filter changes
    return jobs.filter(job => {
      const matchSearch = 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.employer.toLowerCase().includes(search.toLowerCase()) ||
        job.id.toLowerCase().includes(search.toLowerCase());

      const matchEmployer = selectedEmployer ? job.employer === selectedEmployer : true;
      const matchStatus = selectedStatus ? job.status === selectedStatus : true;
      const matchType = selectedType ? job.type === selectedType : true;
      const matchIndustry = selectedIndustry ? job.industry === selectedIndustry : true;
      const matchLocation = selectedLocation ? job.location === selectedLocation : true;

      return matchSearch && matchEmployer && matchStatus && matchType && matchIndustry && matchLocation;
    });
  }, [jobs, search, selectedEmployer, selectedStatus, selectedType, selectedIndustry, selectedLocation]);

  // Pagination Logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredJobs.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredJobs.length / entriesPerPage) || 1;

  // Export Simulated
  const handleExport = (format) => {
    alert(`Exporting Job Report listings as ${format.toUpperCase()}...`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Inactive':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Expired':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-slate-800">Job Reports</h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <span>Reports</span>
          <span>&gt;</span>
          <span className="text-indigo-600">Job Reports</span>
        </div>
      </div>

      {/* Dashboard Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Jobs */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">{stats.totalJobs}</h3>
              <p className="text-xs text-slate-500 font-semibold">Total Jobs</p>
            </div>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">{stats.activeJobs}</h3>
              <p className="text-xs text-slate-500 font-semibold">Active Jobs</p>
            </div>
          </div>
        </div>

        {/* Expired Jobs */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">{stats.expiredJobs}</h3>
              <p className="text-xs text-slate-500 font-semibold">Expired Jobs</p>
            </div>
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">{stats.totalApplications.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 font-semibold">Total Applications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid View / Card Listings */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden -ml-3 lg:-ml-5">
        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-base font-bold text-slate-800">Job Report Listings</h4>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Date Range placeholder / Search input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Search</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search jobs..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Employer */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Employer</label>
              <select
                value={selectedEmployer}
                onChange={(e) => setSelectedEmployer(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Employers</option>
                <option value="Tech Solutions Inc.">Tech Solutions Inc.</option>
                <option value="Creative Minds">Creative Minds</option>
                <option value="Web tech Pvt Ltd">Web tech Pvt Ltd</option>
                <option value="Brands Mart">Brands Mart</option>
                <option value="Duke Infosys">Duke Infosys</option>
                <option value="Lord Shiva Institute">Lord Shiva Institute</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Expired">Expired</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Job Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Job Types</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Industry</label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Industries</option>
                <option value="IT">IT</option>
                <option value="Education">Education</option>
                <option value="Finance">Finance</option>
                <option value="Manufacturing">Manufacturing</option>
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
              </select>
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
                Loading job reports database...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 bg-slate-50/50">
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Job ID</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Job Title</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Employer</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Posted Date</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Expiry Date</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px] text-center">Applications</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px] text-center">Views</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentEntries.length > 0 ? (
                      currentEntries.map(job => (
                        <tr key={job.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-4 text-slate-500">{job.id}</td>
                          <td className="py-3 px-4 text-slate-800 font-bold">{job.title}</td>
                          <td className="py-3 px-4 text-slate-600">{job.employer}</td>
                          <td className="py-3 px-4 text-slate-500">{job.postedDate}</td>
                          <td className="py-3 px-4 text-slate-500">{job.expiryDate}</td>
                          <td className="py-3 px-4 text-slate-700 text-center font-bold">{job.applications}</td>
                          <td className="py-3 px-4 text-slate-700 text-center font-bold">{job.views.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 border rounded-full text-[10px] ${getStatusBadge(job.status)}`}>
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-slate-400 font-normal">
                          No job reports match your active filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {!loading && filteredJobs.length > 0 && (
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
                  Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredJobs.length)} of {filteredJobs.length} records
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

export default JobReports;
