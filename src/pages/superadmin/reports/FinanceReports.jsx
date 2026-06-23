import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';
import {
  DollarSign,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowLeft,
  Filter,
  RotateCcw,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader
} from 'lucide-react';

export const FinanceReports = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 12500, successful: 18, pending: 3, failedRefunded: 2 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedGateway, setSelectedGateway] = useState('');
  const [dateRange, setDateRange] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Fetch report data from API
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_API_URL}/reports/finance`);
      if (response.data) {
        setTransactions(response.data.transactions || []);
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch finance reports:', err);
      setError('Could not retrieve live finance reports database from backend.');
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
    setSelectedPaymentType('');
    setSelectedStatus('');
    setSelectedGateway('');
    setDateRange('');
    setCurrentPage(1);
  };

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    setCurrentPage(1); // Reset to page 1 when filter changes
    return transactions.filter(txn => {
      const matchSearch = 
        txn.customer.toLowerCase().includes(search.toLowerCase()) ||
        txn.id.toLowerCase().includes(search.toLowerCase());

      const matchPaymentType = selectedPaymentType ? txn.paymentType === selectedPaymentType : true;
      const matchStatus = selectedStatus ? txn.status === selectedStatus : true;
      const matchGateway = selectedGateway ? txn.gateway === selectedGateway : true;
      const matchDate = dateRange ? txn.date.includes(dateRange) : true;

      return matchSearch && matchPaymentType && matchStatus && matchGateway && matchDate;
    });
  }, [transactions, search, selectedPaymentType, selectedStatus, selectedGateway, dateRange]);

  // Pagination Logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredTransactions.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredTransactions.length / entriesPerPage) || 1;

  // Export Simulated
  const handleExport = (format) => {
    alert(`Exporting Finance Report listings as ${format.toUpperCase()}...`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Refunded':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Failed':
      case 'Cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-slate-800">Finance Reports</h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <span>Reports</span>
          <span>&gt;</span>
          <span className="text-indigo-600">Finance Reports</span>
        </div>
      </div>

      {/* Dashboard Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">₹{stats.totalRevenue.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 font-semibold">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Successful */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">{stats.successful.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 font-semibold">Successful</p>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning-50 text-warning-600 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">{stats.pending.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 font-semibold">Pending</p>
            </div>
          </div>
        </div>

        {/* Failed / Refunded */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">{stats.failedRefunded.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 font-semibold">Failed / Refunded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid View / Card Listings */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-base font-bold text-slate-800">Finance Report Listings</h4>
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
            {/* Date Range filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Date Range</label>
              <input 
                type="text" 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                placeholder="e.g. Jun 2026"
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Payment Type</label>
              <select
                value={selectedPaymentType}
                onChange={(e) => setSelectedPaymentType(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Payment Types</option>
                <option value="Subscription">Subscription</option>
                <option value="Job Posting">Job Posting</option>
                <option value="Featured Job">Featured Job</option>
                <option value="Resume Access">Resume Access</option>
                <option value="Refund">Refund</option>
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
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Gateway */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Gateway</label>
              <select
                value={selectedGateway}
                onChange={(e) => setSelectedGateway(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Gateways</option>
                <option value="Razorpay">Razorpay</option>
                <option value="PayU">PayU</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="NEFT">NEFT</option>
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
                  placeholder="Search customer..."
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
                Loading finance reports database...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 bg-slate-50/50">
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Transaction ID</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Customer</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px] text-right">Amount</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px] text-right">Tax</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px] text-right">Final Amount</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Payment Date</th>
                      <th className="py-3 px-4 uppercase font-bold text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentEntries.length > 0 ? (
                      currentEntries.map(txn => (
                        <tr key={txn.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-4 text-slate-500">{txn.id}</td>
                          <td className="py-3 px-4 text-slate-800 font-bold">{txn.customer}</td>
                          <td className="py-3 px-4 text-slate-700 text-right font-bold">₹{txn.amount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-slate-700 text-right font-bold">₹{txn.tax.toLocaleString()}</td>
                          <td className="py-3 px-4 text-slate-800 text-right font-bold">₹{txn.finalAmount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-slate-500">{txn.date}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 border rounded-full text-[10px] ${getStatusBadge(txn.status)}`}>
                              {txn.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-400 font-normal">
                          No finance reports match your active filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {!loading && filteredTransactions.length > 0 && (
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
                  Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredTransactions.length)} of {filteredTransactions.length} records
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

export default FinanceReports;
