import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Edit2,
  Plus,
  ReceiptText,
  RefreshCcw,
  Search,
} from 'lucide-react';
import ResponsiveCardList from '../components/ResponsiveCardList';
import { BASE_API_URL } from '../context/AuthContext';

const formatAmount = (value) => Number(value || 0).toLocaleString('en-IN');

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

const statusClass = {
  Success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Pending: 'bg-amber-50 text-amber-600 border-amber-100',
  Failed: 'bg-rose-50 text-rose-600 border-rose-100',
  Refunded: 'bg-rose-50 text-rose-600 border-rose-100',
};

const userTypeClass = {
  Employer: 'bg-[#e8e6fa] text-[#6658dd]',
  Jobseeker: 'bg-cyan-50 text-cyan-600',
};

const normalizePayment = (item) => ({
  _id: item._id,
  id: item.paymentId,
  date: item.paymentDate,
  userType: item.userType,
  customer: item.customerName,
  email: item.email,
  plan: item.planName || item.plan?.planName || '',
  amount: item.paidAmount,
  method: item.paymentMethod,
  gatewayTxnId: item.gatewayTxnId,
  status: item.paymentStatus,
});

export const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ revenue: 0, success: 0, pending: 0, failed: 0, plans: [], methods: [] });
  const [filters, setFilters] = useState({
    userType: '',
    status: '',
    plan: '',
    method: '',
    search: '',
  });

  const plans = useMemo(() => summary.plans || [], [summary.plans]);
  const methods = useMemo(() => summary.methods || [], [summary.methods]);

  const fetchSummary = async () => {
    const response = await axios.get(`${BASE_API_URL}/payments/summary`);
    setSummary({
      revenue: response.data.revenue || 0,
      success: response.data.success || 0,
      pending: response.data.pending || 0,
      failed: response.data.failed || 0,
      plans: response.data.plans || [],
      methods: response.data.methods || [],
    });
  };

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(entriesPerPage),
      });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const response = await axios.get(`${BASE_API_URL}/payments?${params.toString()}`);
      const rows = Array.isArray(response.data) ? response.data : response.data.docs || [];
      setPayments(rows.map(normalizePayment));
      setTotal(response.data.total || rows.length || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setPayments([]);
      setTotal(0);
      setTotalPages(1);
      setError(err.response?.data?.message || 'Payments load nahi ho paye.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary().catch(() => setSummary({ revenue: 0, success: 0, pending: 0, failed: 0, plans: [], methods: [] }));
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [currentPage, entriesPerPage, filters]);

  const startIndex = (currentPage - 1) * entriesPerPage;

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ userType: '', status: '', plan: '', method: '', search: '' });
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - maxVisible + 1));
    const end = Math.min(totalPages, start + maxVisible - 1);
    for (let page = start; page <= end; page += 1) pages.push(page);
    return pages;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-slate-800">Payments</h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="text-indigo-600">Manage Payments</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<span className="text-2xl font-bold">Rs.</span>} value={formatAmount(summary.revenue)} label="Total Revenue (Rs.)" tone="indigo" />
        <SummaryCard icon={<CheckCircle2 className="w-6 h-6" />} value={summary.success} label="Successful" tone="emerald" />
        <SummaryCard icon={<RefreshCcw className="w-6 h-6" />} value={summary.pending} label="Pending" tone="amber" />
        <SummaryCard icon={<ReceiptText className="w-6 h-6" />} value={summary.failed} label="Failed / Refunded" tone="rose" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-base font-bold text-slate-800">Payment Listings</h4>
          <Link
            to="/admin/payments/add"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Payment
          </Link>
        </div>

        <div className="p-5 border-b border-slate-100 space-y-4">
          {error && <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</div>}
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto_auto]">
            <select value={filters.userType} onChange={(e) => updateFilter('userType', e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
              <option value="">All User Types</option>
              <option value="Jobseeker">Jobseeker</option>
              <option value="Employer">Employer</option>
            </select>
            <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
              <option value="">All Status</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
            <select value={filters.plan} onChange={(e) => updateFilter('plan', e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
              <option value="">All Plans</option>
              {plans.map((plan) => <option key={plan} value={plan}>{plan}</option>)}
            </select>
            <select value={filters.method} onChange={(e) => updateFilter('method', e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
              <option value="">All Methods</option>
              {methods.map((method) => <option key={method} value={method}>{method}</option>)}
            </select>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Name, email, txn ID..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            </div>
            <button type="button" onClick={fetchPayments} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg">Filter</button>
            <button type="button" onClick={resetFilters} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">Reset</button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              entries per page
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              Search:
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 bg-white w-full sm:w-48 font-normal"
              />
            </label>
          </div>
        </div>

        <ResponsiveCardList
          items={payments}
          emptyMessage={loading ? 'Loading payments...' : 'No payments found.'}
          renderCard={(item) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-800">{item.id}</div>
                  <div className="text-xs text-slate-500">{item.customer}</div>
                  <div className="text-xs text-slate-400">{item.email}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${statusClass[item.status] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                  {item.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{formatDate(item.date)} - {item.plan}</span>
                <strong className="text-slate-800">Rs. {formatAmount(item.amount)}</strong>
              </div>
            </div>
          )}
        />

        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-xs md:text-sm text-left min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-400 font-semibold">
                <th className="px-4 py-3">Payment ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">User Type</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount (Rs.)</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Gateway Txn ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-slate-400">{loading ? 'Loading payments...' : 'No payments found.'}</td>
                </tr>
              ) : payments.map((item) => (
                <tr key={item._id || item.id} className="odd:bg-white even:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-700">{item.id}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(item.date)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${userTypeClass[item.userType] || 'bg-slate-50 text-slate-500'}`}>{item.userType}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.customer}</td>
                  <td className="px-4 py-3 text-slate-500">{item.email}</td>
                  <td className="px-4 py-3 text-slate-600">{item.plan}</td>
                  <td className="px-4 py-3 text-slate-600">{formatAmount(item.amount)}</td>
                  <td className="px-4 py-3 text-slate-600">{item.method || '-'}</td>
                  <td className="px-4 py-3 text-slate-500">{item.gatewayTxnId || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${statusClass[item.status] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>{item.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => navigate(`/admin/payments/edit/${item._id}`)} className="w-8 h-8 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center" title="Receipt">
                        <ClipboardList className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs font-semibold text-slate-400">
            Showing {total === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + entriesPerPage, total)} of {total} entries
          </div>
          <div className="flex items-center gap-1 self-end sm:self-auto">
            <PagerButton disabled={currentPage === 1} onClick={() => setCurrentPage(1)} icon={<ChevronsLeft className="w-3.5 h-3.5" />} />
            <PagerButton disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} icon={<ChevronLeft className="w-3.5 h-3.5" />} />
            {getPageNumbers().map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 flex items-center justify-center font-bold text-xs rounded-lg ${currentPage === page ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-500'}`}>
                {page}
              </button>
            ))}
            <PagerButton disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} icon={<ChevronRight className="w-3.5 h-3.5" />} />
            <PagerButton disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} icon={<ChevronsRight className="w-3.5 h-3.5" />} />
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, value, label, tone }) => {
  const tones = {
    indigo: 'bg-[#e8e6fa] text-[#6658dd]',
    emerald: 'bg-emerald-50 text-emerald-500',
    amber: 'bg-amber-50 text-amber-500',
    rose: 'bg-rose-50 text-rose-500',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-5 py-4 flex items-center justify-between">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${tones[tone]}`}>
        {icon}
      </div>
      <div className="text-right">
        <div className="text-2xl font-extrabold text-slate-800">{value}</div>
        <div className="text-sm font-semibold text-slate-400">{label}</div>
      </div>
    </div>
  );
};

const PagerButton = ({ disabled, onClick, icon }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50"
  >
    {icon}
  </button>
);

export default Payments;
