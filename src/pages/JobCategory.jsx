import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import { getNextMasterId, onlyDigits, toWholeNumber } from '../utils/masterForm';
import { 
  Plus, 
  Edit2, 
  X, 
  AlertCircle, 
  CheckCircle2,
  Loader,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  List,
  Trash2
} from 'lucide-react';
import ResponsiveCardList from '../components/ResponsiveCardList';

export const JobCategory = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Pagination States
  const [searchVal, setSearchVal] = useState('');
  const [search, setSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Toggle View State: 'list' or 'form'
  const [view, setView] = useState('list');

  // Form State
  const [form, setForm] = useState({ id: '', categoryName: '', sortingNo: '', status: 'active' });
  const [editingId, setEditingId] = useState(null);

  // Success / Error Alerts
  const [alert, setAlert] = useState({ type: '', text: '' });

  const showAlert = (type, text) => {
    setAlert({ type, text });
    if (type === 'success') {
      setTimeout(() => setAlert({ type: '', text: '' }), 3000);
    }
  };

  const getNextId = async () => {
    try {
      return await getNextMasterId(axios, `${BASE_API_URL}/masters/job-categories`, 'id');
    } catch (err) {
      console.error(err);
      return '';
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
        `${BASE_API_URL}/masters/job-categories?page=${currentPage}&limit=${entriesPerPage}&search=${search}&paginate=true`
      );
      setList(response.data.docs || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      showAlert('error', 'Error retrieving job categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [currentPage, entriesPerPage, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id) {
      showAlert('error', 'Category ID is required.');
      return;
    }
    if (!form.categoryName) {
      showAlert('error', 'Category Name is required.');
      return;
    }

    try {
      if (editingId) {
        // Edit Mode
        await axios.put(`${BASE_API_URL}/masters/job-categories/${editingId}`, {
          categoryName: form.categoryName,
          sortingNo: toWholeNumber(form.sortingNo),
          status: form.status
        });
        showAlert('success', 'Success! Record added/updated successfully.');
        setTimeout(() => {
          setView('list');
          setEditingId(null);
          setForm({ id: '', categoryName: '', sortingNo: '', status: 'active' });
          fetchList(); // reload table
        }, 1500);
      } else {
        // Add Mode
        await axios.post(`${BASE_API_URL}/masters/job-categories`, {
          id: form.id,
          categoryName: form.categoryName,
          sortingNo: toWholeNumber(form.sortingNo),
          status: form.status
        });
        showAlert('success', 'Success! Record added/updated successfully.');
        setForm({ id: '', categoryName: '', sortingNo: '', status: 'active' });
        setTimeout(() => {
          setView('list');
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
      id: item.id, 
      categoryName: item.categoryName, 
      sortingNo: item.sortingNo, 
      status: item.status 
    });
    setAlert({ type: '', text: '' });
    setView('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this job category?")) {
      try {
        await axios.delete(`${BASE_API_URL}/masters/job-categories/${id}`);
        showAlert('success', 'Job category deleted successfully.');
        fetchList();
      } catch (err) {
        console.error(err);
        showAlert('error', err.response?.data?.message || 'Error deleting job category.');
      }
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
            Job Category
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="text-indigo-600">
            {view === 'list' ? 'Manage Job Category' : editingId ? 'Edit Job Category' : 'Add Job Category'}
          </span>
        </div>
      </div>

      {view === 'list' ? (
        /* ============================================================== */
        /* LISTINGS SCREEN */
        /* ============================================================== */
        <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
          
          {/* Card Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">
              Job Category
            </h3>
            <button
              onClick={async () => {
                setEditingId(null);
                const nextId = await getNextId();
                setForm({ id: nextId, categoryName: '', sortingNo: '', status: 'active' });
                setAlert({ type: '', text: '' });
                setView('form');
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Job Category</span>
            </button>
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
                    <div className="text-sm font-bold text-slate-800">{item.categoryName}</div>
                    <div className="text-xs text-slate-500">ID: {String(item.id).padStart(3, '0')}</div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                      {item.status === 'active' ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">Sort: {item.sortingNo}</div>
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
                  <th className="px-6 py-3.5 font-bold">Name</th>
                  <th className="px-6 py-3.5 font-bold">Sort</th>
                  <th className="px-6 py-3.5 font-bold">Status</th>
                  <th className="px-6 py-3.5 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {list.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">No matching records found.</td>
                  </tr>
                ) : (
                  list.map((item, index) => (
                      <tr
                        key={item._id}
                        className={`{/*hover:bg-slate-50/30*/} ${
                          index % 2 === 0 ? 'bg-[white]' : 'bg-[slate-50]'
                        }`}
                      >
                      <td className="px-6 py-4 font-bold text-slate-800 uppercase">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{item.categoryName}</td>
                      <td className="px-6 py-4 text-slate-500">{item.sortingNo}</td>
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="w-7 h-7 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="w-7 h-7 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors"
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
      ) : (
        /* ============================================================== */
        /* ADD / EDIT FORM SCREEN */
        /* ============================================================== */
        <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
          
          {/* Card Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">
              {editingId ? 'Edit Job Category' : 'Add Job Category'}
            </h3>
            <button
              onClick={() => {
                setView('list');
                setEditingId(null);
                setForm({ id: '', categoryName: '', sortingNo: '', status: 'active' });
                setAlert({ type: '', text: '' });
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              <List className="w-3.5 h-3.5" />
              <span>View Listings</span>
            </button>
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

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Form Input Grid */}
              <div className="grid gap-6 md:grid-cols-4">
                <input type="hidden" value={form.id} readOnly />

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Telecalling"
                    value={form.categoryName}
                    onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                  />
                </div>

                {/* Sorting No */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Sorting No.
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Sort No."
                    value={form.sortingNo}
                    onChange={(e) => setForm({ ...form, sortingNo: onlyDigits(e.target.value) })}
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

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md shadow-indigo-600/10 transition-colors text-sm"
                >
                  Submit
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

    </div>
  );
};

export default JobCategory;
