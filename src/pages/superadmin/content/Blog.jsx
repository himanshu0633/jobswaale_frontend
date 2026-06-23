import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Alignment,
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  Indent,
  IndentBlock,
  Italic,
  Paragraph,
  SourceEditing,
  Strikethrough,
  Table,
  TableToolbar,
  Underline
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { BASE_API_URL } from '../../../context/AuthContext';
import { getNextMasterId, onlyDigits, toWholeNumber } from '../../../utils/masterForm';
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
  Trash2,
  ImagePlus,
  Search,
  Settings
} from 'lucide-react';
import ResponsiveCardList from '../../../components/ResponsiveCardList';

const slugify = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9/-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/\/+/g, '/') || 'post'
);

const createBlankForm = () => ({
  id: '',
  title: '',
  slug: '',
  category: '',
  content: '',
  sortingNo: '',
  status: 'active',
  featuredImage: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: ''
});

export const Blog = () => {
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
  const [form, setForm] = useState(createBlankForm);
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
      return await getNextMasterId(axios, `${BASE_API_URL}/cms/blogs`, 'id');
    } catch (err) {
      console.error(err);
      return '';
    }
  };

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_API_URL}/cms/blog-categories`);
      setCategories(res.data || []);
    } catch (err) {
      console.error('Error fetching blog categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
        `${BASE_API_URL}/cms/blogs?page=${currentPage}&limit=${entriesPerPage}&search=${search}&paginate=true`
      );
      setList(response.data.docs || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      showAlert('error', 'Error retrieving blogs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [currentPage, entriesPerPage, search]);

  const handleImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(prev => ({ ...prev, featuredImage: reader.result || '' }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id) {
      showAlert('error', 'Blog ID is required.');
      return;
    }
    if (!form.title.trim()) {
      showAlert('error', 'Blog Title is required.');
      return;
    }
    if (!form.category) {
      showAlert('error', 'Blog Category is required.');
      return;
    }
    if (!form.content || !form.content.trim()) {
      showAlert('error', 'Blog Content is required.');
      return;
    }
    if (!form.featuredImage) {
      showAlert('error', 'Featured Image is required.');
      return;
    }

    setSaving(true);
    const payload = {
      id: form.id,
      title: form.title.trim(),
      slug: slugify(form.slug || form.title),
      category: form.category,
      content: form.content,
      sortingNo: toWholeNumber(form.sortingNo),
      status: form.status,
      featuredImage: form.featuredImage,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      seoKeywords: form.seoKeywords
    };

    try {
      if (editingId) {
        // Edit Mode
        await axios.put(`${BASE_API_URL}/cms/blogs/${editingId}`, payload);
        showAlert('success', 'Success! Record updated successfully.');
        setTimeout(() => {
          setView('list');
          setEditingId(null);
          setForm(createBlankForm());
          fetchList(); // reload table
        }, 1500);
      } else {
        // Add Mode
        await axios.post(`${BASE_API_URL}/cms/blogs`, payload);
        showAlert('success', 'Success! Record added successfully.');
        setForm(createBlankForm());
        setTimeout(() => {
          setView('list');
          fetchList(); // reload table
        }, 1500);
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Oops! Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({ 
      id: item.id, 
      title: item.title, 
      slug: item.slug, 
      category: item.category?._id || item.category || '', 
      content: item.content || '',
      sortingNo: item.sortingNo, 
      status: item.status,
      featuredImage: item.featuredImage || '',
      seoTitle: item.seoTitle || '',
      seoDescription: item.seoDescription || '',
      seoKeywords: item.seoKeywords || ''
    });
    setAlert({ type: '', text: '' });
    setView('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await axios.delete(`${BASE_API_URL}/cms/blogs/${id}`);
        showAlert('success', 'Blog deleted successfully.');
        fetchList();
      } catch (err) {
        console.error(err);
        showAlert('error', err.response?.data?.message || 'Error deleting blog.');
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

  const editorConfig = useMemo(() => ({
    licenseKey: 'GPL',
    plugins: [
      Alignment,
      BlockQuote,
      Bold,
      Essentials,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      Heading,
      Indent,
      IndentBlock,
      Italic,
      Paragraph,
      SourceEditing,
      Strikethrough,
      Table,
      TableToolbar,
      Underline
    ],
    toolbar: {
      items: [
        'heading',
        '|',
        'fontFamily',
        'fontSize',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'alignment',
        'bulletedList',
        'numberedList',
        'outdent',
        'indent',
        '|',
        'blockQuote',
        'insertTable',
        '|',
        'sourceEditing',
        'undo',
        'redo'
      ],
      shouldNotGroupWhenFull: true
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    }
  }), []);

  return (
    <div className="space-y-6">
      
      {/* Title & Breadcrumb header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Blog
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="text-indigo-600">
            {view === 'list' ? 'Manage Blogs' : editingId ? 'Edit Blog' : 'Add Blog'}
          </span>
        </div>
      </div>

      {view === 'list' ? (
        /* ============================================================== */
        /* LISTINGS SCREEN */
        /* ============================================================== */
        <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
          
          {/* Card Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-base font-bold text-slate-800">
              Blog Listing
            </h3>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setEditingId(null);
                  const nextId = await getNextId();
                  const nextForm = createBlankForm();
                  nextForm.id = nextId;
                  setForm(nextForm);
                  setAlert({ type: '', text: '' });
                  setView('form');
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Blog</span>
              </button>
              <Link
                to="/admin/blog-categories"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </Link>
            </div>
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
                    <div className="text-sm font-bold text-slate-800">{item.title}</div>
                    <div className="text-xs text-slate-400">Category: {item.category?.name || 'N/A'}</div>
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
                  <th className="px-6 py-3.5 font-bold">Blog Title</th>
                  <th className="px-6 py-3.5 font-bold">Category</th>
                  <th className="px-6 py-3.5 font-bold">Sort</th>
                  <th className="px-6 py-3.5 font-bold">Status</th>
                  <th className="px-6 py-3.5 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {list.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">No matching records found.</td>
                  </tr>
                ) : (
                  list.map((item, index) => (
                    <tr
                      key={item._id}
                      className={index % 2 === 0 ? 'bg-[white]' : 'bg-slate-50'}
                    >
                      <td className="px-6 py-4 font-bold text-slate-800 uppercase">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{item.title}</td>
                      <td className="px-6 py-4 text-slate-500">{item.category?.name || 'N/A'}</td>
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
      ) : (
        /* ============================================================== */
        /* ADD / EDIT FORM SCREEN */
        /* ============================================================== */
        <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
          
          {/* Card Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">
              {editingId ? 'Edit Blog' : 'Add Blog'}
            </h3>
            <button
              onClick={() => {
                setView('list');
                setEditingId(null);
                setForm(createBlankForm());
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
              
              <div className="grid gap-6 lg:grid-cols-3">
                
                {/* Main Inputs (Left/Middle columns) */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Blog Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter blog title"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                      />
                    </div>

                    {/* Slug */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Slug <span className="text-xs text-slate-400 font-normal">(Leave empty to auto-generate)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. interview-tips"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sorting No */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Sorting No.
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g. 1"
                        value={form.sortingNo}
                        onChange={(e) => setForm({ ...form, sortingNo: onlyDigits(e.target.value) })}
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                      />
                    </div>
                  </div>

                  {/* CKEditor content */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Blog Content <span className="text-rose-500">*</span>
                    </label>
                    <div className="rounded border border-slate-200 overflow-hidden text-slate-700">
                      <CKEditor
                        editor={ClassicEditor}
                        config={editorConfig}
                        data={form.content}
                        onChange={(_, editor) => {
                          const html = editor.getData();
                          setForm(prev => ({ ...prev, content: html }));
                        }}
                      />
                    </div>
                  </div>

                  {/* SEO section */}
                  <div className="rounded-xl bg-slate-100 px-4 py-3 text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Search className="w-4.5 h-4.5" />
                    <span>SEO Details</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SEO Title</label>
                      <input 
                        value={form.seoTitle} 
                        onChange={(e) => setForm(prev => ({ ...prev, seoTitle: e.target.value }))} 
                        placeholder="Meta SEO Title" 
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SEO Description</label>
                      <textarea 
                        value={form.seoDescription} 
                        onChange={(e) => setForm(prev => ({ ...prev, seoDescription: e.target.value }))} 
                        placeholder="Meta SEO Description" 
                        rows={3} 
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SEO Keywords</label>
                      <input 
                        value={form.seoKeywords} 
                        onChange={(e) => setForm(prev => ({ ...prev, seoKeywords: e.target.value }))} 
                        placeholder="keyword1, keyword2" 
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white" 
                      />
                    </div>
                  </div>
                </div>

                {/* Right side options */}
                <div className="space-y-5">
                  <div className="rounded-xl bg-slate-100 px-4 py-3 text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Settings className="w-4.5 h-4.5" />
                    <span>Other Details</span>
                  </div>

                  {/* Featured Image */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Featured Image <span className="text-rose-500">*</span></label>
                    <label className="flex min-h-[160px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-4 py-6 text-center text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files?.[0])} />
                      {form.featuredImage ? (
                        <div className="relative group">
                          <img src={form.featuredImage} alt="Featured preview" className="max-h-36 rounded-lg object-contain" />
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setForm(prev => ({ ...prev, featuredImage: '' }));
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <ImagePlus className="mx-auto h-7 w-7 text-slate-400" />
                          <span>Drag & Drop your files or Browse</span>
                          <span className="block text-[10px] text-slate-400 font-normal">Max 3MB. Recommended size: 800x600px</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status <span className="text-rose-500">*</span></label>
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

              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md shadow-indigo-600/10 transition-colors text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('list');
                    setEditingId(null);
                    setForm(createBlankForm());
                    setAlert({ type: '', text: '' });
                  }}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

    </div>
  );
};

export default Blog;
