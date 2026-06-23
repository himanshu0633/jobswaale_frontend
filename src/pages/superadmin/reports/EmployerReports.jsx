import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';
import {
  Building2,
  UserCheck,
  PlusCircle,
  Briefcase,
  ArrowLeft,
  Filter,
  RotateCcw,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader
} from 'lucide-react';

export const EmployerReports = () => {
  const [employers, setEmployers] = useState([]);
  const [stats, setStats] = useState({ totalEmployers: 432, active: 245, newThisMonth: 18, totalJobsPosted: 856 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [regDate, setRegDate] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Fetch report data from API
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_API_URL}/reports/employers`);
      if (response.data) {
        setEmployers(response.data.employers || []);
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch employer reports:', err);
      setError('Could not retrieve live employer reports database from backend.');
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
    setSelectedCompany('');
    setSelectedIndustry('');
    setRegDate('');
    setCurrentPage(1);
  };

  // Filter Logic
  const filteredEmployers = useMemo(() => {
    setCurrentPage(1); // Reset to page 1 when filter changes
    return employers.filter(employer => {
      const matchSearch = 
        employer.companyName.toLowerCase().includes(search.toLowerCase()) ||
        employer.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        employer.id.toLowerCase().includes(search.toLowerCase());

      const matchCompany = selectedCompany ? employer.companyName === selectedCompany : true;
      const matchIndustry = selectedIndustry ? employer.industry === selectedIndustry : true;
      const matchRegDate = regDate ? employer.regDate.includes(regDate) : true;

      return matchSearch && matchCompany && matchIndustry && matchRegDate;
    });
  }, [employers, search, selectedCompany, selectedIndustry, regDate]);

  // Pagination Logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredEmployers.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredEmployers.length / entriesPerPage) || 1;

  // Export Simulated
  const handleExport = (format) => {
    alert(`Exporting Employer Report listings as ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-slate-800">Employer Reports</h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <span>Reports</span>
          <span>&gt;</span>
          <span className="text-indigo-600">Employer Reports</span>
        </div>
      </div>

      {/* Dashboard Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employers */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">{stats.totalEmployers.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 font-semibold">Total Employers</p>
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
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">{stats.newThisMonth.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 font-semibold">New This Month</p>
            </div>
          </div>
        </div>

        {/* Total Jobs Posted */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning-50 text-warning-600 rounded-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">{stats.totalJobsPosted.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 font-semibold">Total Jobs Posted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid View / Card Listings */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-base font-bold text-slate-800">Employer Report Listings</h4>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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

            {/* Company Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Company</label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Companies</option>
                <option value="Tech Solutions Inc.">Tech Solutions Inc.</option>
                <option value="Creative Minds">Creative Minds</option>
                <option value="Web tech Pvt Ltd">Web tech Pvt Ltd</option>
                <option value="Brands Mart">Brands Mart</option>
                <option value="Duke Infosys">Duke Infosys</option>
                <option value="Lord Shiva Institute">Lord Shiva Institute</option>
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
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
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
                  placeholder="Search company or contact..."
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
                Loading employer reports database...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 bg-slate-50/50">
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Employer ID</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Company Name</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Contact Person</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px] text-center">Jobs Posted</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px] text-center">Active Jobs</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentEntries.length > 0 ? (
                      currentEntries.map(employer => (
                        <tr key={employer.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-4 text-slate-500">{employer.id}</td>
                          <td className="py-3 px-4 text-slate-800 font-bold">{employer.companyName}</td>
                          <td className="py-3 px-4 text-slate-600">{employer.contactPerson}</td>
                          <td className="py-3 px-4 text-slate-700 text-center font-bold">{employer.jobsPosted}</td>
                          <td className="py-3 px-4 text-slate-700 text-center font-bold">{employer.activeJobs}</td>
                          <td className="py-3 px-4 text-slate-500">{employer.regDate}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400 font-normal">
                          No employer reports match your active filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {!loading && filteredEmployers.length > 0 && (
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
                  Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredEmployers.length)} of {filteredEmployers.length} records
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

export default EmployerReports;
