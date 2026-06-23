import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Scale, 
  Activity, 
  Loader,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye
} from 'lucide-react';
import ResponsiveCardList from '../../../components/ResponsiveCardList';

const formatDate = (dateString) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const options = { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  };
  return d.toLocaleString('en-US', options);
};

export const Transactions = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCredits: 0,
    totalDebits: 0,
    netBalance: 0,
    todaysActivity: 0
  });

  // Filter States
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [userType, setUserType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Active filters applied to request
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    userType: '',
    fromDate: '',
    toDate: '',
    search: ''
  });

  // Pagination States
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Transactions from API
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage,
        limit: entriesPerPage,
        type: filters.type,
        category: filters.category,
        userType: filters.userType,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        search: filters.search,
        paginate: 'true'
      });

      const res = await axios.get(`${BASE_API_URL}/payments/transactions?${query.toString()}`);
      setList(res.data.docs || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, entriesPerPage, filters]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setFilters({
      type,
      category,
      userType,
      fromDate,
      toDate,
      search: searchVal
    });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setType('');
    setCategory('');
    setUserType('');
    setFromDate('');
    setToDate('');
    setSearchVal('');
    setFilters({
      type: '',
      category: '',
      userType: '',
      fromDate: '',
      toDate: '',
      search: ''
    });
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * entriesPerPage;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Breadcrumb header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Transactions
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="text-indigo-600">Transaction Ledger</span>
        </div>
      </div>

      {/* Metrics Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Card 1: Total Credits */}
        <div className="border border-slate-200 bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold text-slate-800">
              Rs. {stats.totalCredits.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Total Credits</p>
          </div>
        </div>

        {/* Card 2: Total Debits */}
        <div className="border border-slate-200 bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold text-slate-800">
              Rs. {stats.totalDebits.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Total Debits</p>
          </div>
        </div>

        {/* Card 3: Net Balance */}
        <div className="border border-slate-200 bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold text-slate-800">
              Rs. {stats.netBalance.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Net Balance</p>
          </div>
        </div>

        {/* Card 4: Today's Activity */}
        <div className="border border-slate-200 bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold text-slate-800">
              {stats.todaysActivity}
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Today's Activity</p>
          </div>
        </div>
      </div>

      {/* Filter and Ledger section */}
      <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
        
        {/* Card Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">
            Transaction Ledger
          </h3>
          <Link
            to="/admin/payments"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <span>View Payments</span>
          </Link>
        </div>

        {/* Controls and Filters */}
        <form onSubmit={handleFilterSubmit} className="p-5 border-b border-slate-100 bg-slate-50/20 space-y-4">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-6">
            {/* Type */}
            <div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="">All Types</option>
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="">All Categories</option>
                <option value="Plan Purchase">Plan Purchase</option>
                <option value="Refund">Refund</option>
                <option value="Adjustment">Adjustment</option>
                <option value="Manual Entry">Manual Entry</option>
              </select>
            </div>

            {/* User Type */}
            <div>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="">All User Types</option>
                <option value="Employer">Employer</option>
                <option value="Jobseeker">Jobseeker</option>
              </select>
            </div>

            {/* From Date */}
            <div>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {/* To Date */}
            <div>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Search */}
            <div>
              <input
                type="search"
                placeholder="Txn ID, ref..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:border-indigo-500 font-normal"
              />
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries per page</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                Filter
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        {/* Mobile View Card List */}
        <ResponsiveCardList
          items={list}
          emptyMessage="No matching transactions found."
          renderCard={(item, index) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800">{item.txnId}</div>
                  <div className="text-xs text-slate-400">{formatDate(item.txnDate)}</div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.type === 'Credit' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    {item.type}
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-600 font-medium">{item.customerName} ({item.userType})</div>
              <div className="text-xs text-slate-500 italic mt-0.5">{item.description}</div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                <span className={`text-sm font-bold ${item.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {item.type === 'Credit' ? '+' : '-'}Rs. {item.amount.toLocaleString('en-IN')}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.status === 'Success' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : item.status === 'Pending'
                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                    : 'bg-rose-50 text-rose-600 border border-rose-100'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          )}
        />

        {/* Table View */}
        <div className="overflow-x-auto relative min-h-[250px] hidden md:block">
          {loading ? (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
              <Loader className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : null}

          <table className="w-full text-xs md:text-sm text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase">
                <th className="px-6 py-3.5 font-bold">Txn ID</th>
                <th className="px-6 py-3.5 font-bold">Date & Time</th>
                <th className="px-6 py-3.5 font-bold">Type</th>
                <th className="px-6 py-3.5 font-bold">Category</th>
                <th className="px-6 py-3.5 font-bold">Payment Ref</th>
                <th className="px-6 py-3.5 font-bold">User Type</th>
                <th className="px-6 py-3.5 font-bold">Customer</th>
                <th className="px-6 py-3.5 font-bold">Amount (Rs.)</th>
                <th className="px-6 py-3.5 font-bold">Description</th>
                <th className="px-6 py-3.5 font-bold">Status</th>
                <th className="px-6 py-3.5 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {list.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-6 py-8 text-center text-slate-400">No matching transactions found.</td>
                </tr>
              ) : (
                list.map((item, index) => (
                  <tr
                    key={item._id}
                    className={index % 2 === 0 ? 'bg-[white]' : 'bg-slate-50'}
                  >
                    <td className="px-6 py-4 font-bold text-slate-800 uppercase">{item.txnId}</td>
                    <td className="px-6 py-4 font-medium text-slate-600 text-nowrap">{formatDate(item.txnDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.type === 'Credit' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">{item.category}</td>
                    <td className="px-6 py-4 font-medium">
                      {item.paymentRef && item.paymentRef !== '—' ? (
                        <Link to={`/admin/payments`} className="text-indigo-600 hover:text-indigo-500 font-bold">
                          {item.paymentRef}
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.userType === 'Employer'
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-sky-50 text-sky-600 border border-sky-100'
                      }`}>
                        {item.userType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{item.customerName}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${item.type === 'Credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.type === 'Credit' ? '+' : '-'}Rs. {item.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate" title={item.description}>
                      {item.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.status === 'Success' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : item.status === 'Pending'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to="/admin/payments"
                        className="w-7 h-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center transition-colors"
                        title="View Payments"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs font-semibold text-slate-400">
            Showing {total === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + entriesPerPage, total)} of {total} entries
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50 transition-colors"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            
            {getPageNumbers().map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 flex items-center justify-center font-bold text-xs rounded-lg transition-colors shadow-sm ${
                  currentPage === p
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50 transition-colors"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Transactions;
