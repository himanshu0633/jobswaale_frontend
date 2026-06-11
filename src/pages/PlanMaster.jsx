import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import { onlyDigits, toWholeNumber } from '../utils/masterForm';
import { 
  Plus, 
  Edit2, 
  Trash2,
  X, 
  AlertCircle, 
  CheckCircle2,
  Loader,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export const PlanMaster = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Pagination States
  const [searchVal, setSearchVal] = useState('');
  const [search, setSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Form State
  const [form, setForm] = useState({ 
    planName: '', 
    planType: 'Free', 
    cost: '', 
    planValidity: 'One Time', 
    displayOrder: '', 
    status: 'active'
  });
  const [editingId, setEditingId] = useState(null);

  // Success / Error Alerts
  const [alert, setAlert] = useState({ type: '', text: '' });

  const showAlert = (type, text) => {
    setAlert({ type, text });
    if (type === 'success') {
      setTimeout(() => setAlert({ type: '', text: '' }), 3000);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchVal);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchVal]);

  // Fetch paginated lists from backend
  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_API_URL}/masters/plans?page=${currentPage}&limit=${entriesPerPage}&search=${search}&paginate=true`
      );
      setList(response.data.docs || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      showAlert('error', 'Error retrieving plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [currentPage, entriesPerPage, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { planName, planType, cost, planValidity, displayOrder, status } = form;
    
    if (!planName) {
      showAlert('error', 'Plan Name is required.');
      return;
    }
    if (planType === 'Paid' && (cost === undefined || cost === '')) {
      showAlert('error', 'Price is required.');
      return;
    }
    if (!displayOrder) {
      showAlert('error', 'Display Order is required.');
      return;
    }

    try {
      if (editingId) {
        // Edit Mode
        await axios.put(`${BASE_API_URL}/masters/plans/${editingId}`, {
          category: 'Jobseeker',
          planName,
          cost: planType === 'Paid' ? Number(cost) : 0,
          planValidity,
          planType,
          displayOrder: toWholeNumber(displayOrder),
          status
        });
        showAlert('success', 'Success! Record added/updated successfully.');
        setTimeout(() => {
          setEditingId(null);
          setForm({ 
            planName: '', 
            planType: 'Free', 
            cost: '', 
            planValidity: 'One Time', 
            displayOrder: '', 
            status: 'active'
          });
          fetchList(); // reload table
        }, 1500);
      } else {
        // Add Mode
        await axios.post(`${BASE_API_URL}/masters/plans`, {
          category: 'Jobseeker',
          planName,
          cost: planType === 'Paid' ? Number(cost) : 0,
          planValidity,
          planType,
          displayOrder: toWholeNumber(displayOrder),
          status
        });
        showAlert('success', 'Success! Record added/updated successfully.');
        setForm({ 
          planName: '', 
          planType: 'Free', 
          cost: '', 
          planValidity: 'One Time', 
          displayOrder: '', 
          status: 'active'
        });
        setTimeout(() => {
          fetchList(); // reload table
        }, 1500);
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Oops! Something went wrong. Please try again.');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({ 
      planName: item.planName, 
      planType: item.planType || 'Free', 
      cost: item.cost, 
      planValidity: item.planValidity, 
      displayOrder: item.displayOrder, 
      status: item.status
    });
    setAlert({ type: '', text: '' });
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete the plan "${item.planName}"?`)) return;
    try {
      await axios.delete(`${BASE_API_URL}/masters/plans/${item._id}`);
      showAlert('success', 'Plan deleted successfully.');
      fetchList();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Error deleting plan.');
    }
  };

  // Pagination Indices
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
            Jobseeker Plan Master
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="text-indigo-600">Jobseeker Plan Master</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ADD / EDIT FORM SCREEN (STACKED AT TOP) */}
      {/* ============================================================== */}
      <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
        
        {/* Card Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">
            {editingId ? 'Edit Plan' : 'Add Plan'}
          </h3>
        </div>

        {/* Form Content */}
        <div className="p-6">
          
          {/* Alert Boxes */}
          {alert.text && (
            <div className="mb-5 relative animate-in fade-in slide-in-from-top-2 duration-200">
              <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-semibold ${
                alert.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                  : 'bg-rose-50 border-rose-100 text-rose-800'
              }`}>
                {alert.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                )}
                <div className="flex-grow">{alert.text}</div>
                <button 
                  onClick={() => setAlert({ type: '', text: '' })}
                  className="p-0.5 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Form Input Grid */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {/* Plan Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Plan Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g Free, Basic"
                  value={form.planName}
                  onChange={(e) => setForm({ ...form, planName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                />
              </div>

              {/* Plan Type */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Plan Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.planType}
                  onChange={(e) => setForm({ ...form, planType: e.target.value, cost: e.target.value === 'Paid' ? form.cost : '' })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                >
                  <option value="Free">Free</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {form.planType === 'Paid' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Price (Rs.) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Price of the Plan"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                  />
                </div>
              )}

              {/* Validity */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Validity <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.planValidity}
                  onChange={(e) => setForm({ ...form, planValidity: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                >
                  <option value="One Time">One Time</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Half-Yearly">Half-Yearly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Always Free">Always Free</option>
                </select>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Display Order <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="e.g 1, 2"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: onlyDigits(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md shadow-indigo-600/10 transition-colors text-sm"
              >
                Submit
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ 
                      planName: '', 
                      planType: 'Free', 
                      cost: '', 
                      planValidity: 'One Time', 
                      displayOrder: '', 
                      status: 'active'
                    });
                  }}
                  className="px-6 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

          </form>
        </div>

      </div>

      {/* ============================================================== */}
      {/* LISTINGS SCREEN (STACKED AT BOTTOM) */}
      {/* ============================================================== */}
      <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
        
        {/* Card Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Jobseeker Plan Listing
          </h3>
        </div>

        {/* Table Controls (Search and Show Entries) */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 bg-slate-50/30">
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

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Search:</span>
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 bg-white w-full sm:w-48 font-normal"
            />
          </div>
        </div>

        {/* Mobile cards */}
        <ResponsiveCardList
          items={list}
          emptyMessage="No matching records found."
          renderCard={(item, index) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800">{item.planName}</div>
                  <div className="text-xs text-slate-500">{item.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-emerald-600">Rs. {item.cost}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">{item.duration} days</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(item)} className="w-8 h-8 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="w-8 h-8 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        />

        {/* Listings Table */}
        <div className="overflow-x-auto relative min-h-[200px] hidden md:block">
          {loading ? (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
              <Loader className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : null}
          

          <table className="w-full text-xs md:text-sm text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-400 uppercase">
                <th className="px-6 py-3.5 font-bold">ID</th>
                <th className="px-6 py-3.5 font-bold">Plan Name</th>
                <th className="px-6 py-3.5 font-bold">Plan Type</th>
                <th className="px-6 py-3.5 font-bold">Price (Rs.)</th>
                <th className="px-6 py-3.5 font-bold">Validity</th>
                <th className="px-6 py-3.5 font-bold">Display Order</th>
                <th className="px-6 py-3.5 font-bold">Status</th>
                <th className="px-6 py-3.5 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {list.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400">No matching records found.</td>
                </tr>
              ) : (
                list.map((item, idx) => (
                  <tr key={item._id}  className={`${idx % 2 === 0 ? '[bg-white]' : 'bg-slate-50'} hover:bg-slate-50/30`}>
                    <td className="px-6 py-4 font-bold text-slate-800 uppercase">
                      {String(startIndex + idx + 1).padStart(3, '0')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{item.planName}</td>
                    <td className="px-6 py-4 text-slate-500">{item.planType || 'Free'}</td>
                    <td className="px-6 py-4 text-slate-500 font-semibold">{item.cost}</td>
                    <td className="px-6 py-4 text-slate-500">{item.planValidity}</td>
                    <td className="px-6 py-4 text-slate-500">{item.displayOrder}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {item.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEdit(item)}
                          className="w-7 h-7 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="w-7 h-7 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                          title="Delete"
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

        {/* Table Footer (Pagination) */}
        <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs font-semibold text-slate-400">
            Showing {total === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + entriesPerPage, total)} of {total} entries
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            {/* First Page */}
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50 transition-colors"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            {/* Prev Page */}
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            
            {/* Individual Page Numbers */}
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

            {/* Next Page */}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {/* Last Page */}
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

export default PlanMaster;
