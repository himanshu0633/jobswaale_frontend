import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';
import PageSkeleton from '../../../components/SkeletonLoader';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Building2,
  Briefcase,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  Info,
  Sparkles
} from 'lucide-react';

const fieldLabels = {
  jobTitle: 'Job Title',
  jobCategory: 'Category',
  jobType: 'Job Type',
  vacancies: 'Openings / Vacancies',
  workMode: 'Work Mode',
  jobLocations: 'Locations',
  city: 'City',
  state: 'State',
  district: 'District',
  country: 'Country',
  salary: 'Salary Text',
  minSalary: 'Min Salary',
  maxSalary: 'Max Salary',
  salaryUnit: 'Salary Unit',
  salaryNegotiable: 'Negotiable Salary',
  experience: 'Experience',
  requiredExperience: 'Required Experience',
  qualification: 'Qualification',
  noticePeriod: 'Notice Period',
  joiningDate: 'Joining Date',
  shiftTiming: 'Shift Timing',
  jobExpiry: 'Job Expiry Date',
  skills: 'Skills',
  languages: 'Languages',
  description: 'Job Description',
  jobSummary: 'Job Summary',
  detailedDescription: 'Detailed Description',
  responsibilities: 'Responsibilities',
  benefits: 'Perks & Benefits',
  aboutCompany: 'About Company'
};

const formatValue = (val) => {
  if (val === null || val === undefined || val === '') return <span className="text-slate-400 italic">Not specified</span>;
  if (Array.isArray(val)) {
    if (!val.length) return <span className="text-slate-400 italic">None</span>;
    return val.join(', ');
  }
  if (typeof val === 'boolean') {
    return val ? 'Yes' : 'No';
  }
  if (typeof val === 'object') {
    return val.name || val.categoryName || val.jobType || JSON.stringify(val);
  }
  return String(val);
};

export const JobRequests = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('status') || 'all';

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ all: 0, pending: 0, viewed: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [viewTab, setViewTab] = useState('diff'); // 'diff' or 'full'

  const getTokenHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadRequests = async (statusFilter = activeTab, search = searchQuery, pageNum = page) => {
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      params.append('page', pageNum);
      params.append('limit', 20);

      const res = await axios.get(`${BASE_API_URL}/admin/job-requests?${params.toString()}`, {
        headers: getTokenHeaders()
      });

      if (res.data?.success) {
        setRequests(res.data.requests || []);
        setStats(res.data.stats || { all: 0, pending: 0, viewed: 0, approved: 0, rejected: 0 });
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load job edit requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(activeTab, searchQuery, 1);
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadRequests(activeTab, searchQuery, 1);
  };

  const handleTabChange = (status) => {
    setSearchParams(status === 'all' ? {} : { status });
    setPage(1);
  };

  // Open Request Details & Diff Modal (Marks as viewed immediately in employer portal!)
  const handleOpenReview = async (reqItem) => {
    setDetailLoading(true);
    setSelectedRequest(reqItem);
    setViewTab('diff');
    setShowRejectModal(false);
    setRejectReason('');

    try {
      const res = await axios.get(`${BASE_API_URL}/admin/job-requests/${reqItem._id}`, {
        headers: getTokenHeaders()
      });
      if (res.data?.success) {
        setSelectedRequest(res.data.request);
        // Refresh list to update badge from pending to viewed
        loadRequests(activeTab, searchQuery, page);
      }
    } catch (err) {
      console.error('Failed to open request details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Approve Job Request
  const handleApprove = async () => {
    if (!selectedRequest?._id) return;
    if (!window.confirm(`Are you sure you want to approve and publish changes for "${selectedRequest.jobTitle}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await axios.post(`${BASE_API_URL}/admin/job-requests/${selectedRequest._id}/approve`, {}, {
        headers: getTokenHeaders()
      });
      if (res.data?.success) {
        setSelectedRequest(res.data.request || { ...selectedRequest, status: 'approved' });
        loadRequests(activeTab, searchQuery, page);
      }
    } catch (err) {
      console.error('Approval failed:', err);
      alert(err.response?.data?.message || 'Failed to approve job request.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Job Request
  const handleReject = async (e) => {
    e.preventDefault();
    if (!selectedRequest?._id) return;
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason explaining what needs to be changed.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await axios.post(`${BASE_API_URL}/admin/job-requests/${selectedRequest._id}/reject`, {
        reason: rejectReason.trim()
      }, {
        headers: getTokenHeaders()
      });
      if (res.data?.success) {
        setSelectedRequest(res.data.request || { ...selectedRequest, status: 'rejected', rejectionReason: rejectReason.trim() });
        setShowRejectModal(false);
        loadRequests(activeTab, searchQuery, page);
      }
    } catch (err) {
      console.error('Rejection failed:', err);
      alert(err.response?.data?.message || 'Failed to reject job request.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] text-xs font-bold bg-[#fef4e4] text-[#f7b84b]">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      case 'viewed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] text-xs font-bold bg-[#e4ecf9] text-[#4a81d4]">
            <Eye className="w-3 h-3" /> Under Review (Viewed)
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] text-xs font-bold bg-[#ddf5f0] text-[#1abc9c]">
            <CheckCircle className="w-3 h-3" /> Approved & Published
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] text-xs font-bold bg-[#fde6e9] text-[#f1556c]">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  // Compile Diff fields list
  const diffItems = useMemo(() => {
    if (!selectedRequest) return [];
    const prev = selectedRequest.previousData || {};
    const prop = selectedRequest.proposedData || {};
    const changed = Array.isArray(selectedRequest.changedFields) && selectedRequest.changedFields.length
      ? selectedRequest.changedFields
      : Object.keys(fieldLabels);

    return changed.map(field => {
      const label = fieldLabels[field] || field;
      const oldVal = prev[field];
      const newVal = prop[field];
      return {
        field,
        label,
        oldVal,
        newVal
      };
    });
  }, [selectedRequest]);

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="space-y-4 px-2 sm:px-4 py-3">
      {/* Page Title & Breadcrumb (Matches Jobs Management layout) */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-1">
        <div>
          <h1 className="text-lg font-bold text-[#4c4c5c]">Job Edit Requests</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage and review employer job edit requests before publishing</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-[#9ba6b7]">
          <Link to="/admin/dashboard" className="hover:text-slate-600 transition">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/admin/jobs" className="hover:text-slate-600 transition">Jobs</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#9ba6b7]">Job Requests</span>
        </div>
      </div>

      {/* Top KPI Stat Cards (Matches Jobs Management exactly) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Pending Card */}
        <div
          onClick={() => handleTabChange('pending')}
          className={`cursor-pointer rounded-[5px] bg-white p-4 border transition-all shadow-sm relative ${
            activeTab === 'pending'
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
              : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          {stats.pending > 0 && (
            <span className="absolute top-2 right-2 inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 animate-pulse">
              Needs Review
            </span>
          )}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending</span>
              <p className="mt-1 text-2xl font-black text-amber-600">{stats.pending}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Awaiting review</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Under Review (Viewed) Card */}
        <div
          onClick={() => handleTabChange('viewed')}
          className={`cursor-pointer rounded-[5px] bg-white p-4 border transition-all shadow-sm ${
            activeTab === 'viewed'
              ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
              : 'border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Under Review</span>
              <p className="mt-1 text-2xl font-black text-blue-600">{stats.viewed}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Viewed by admin</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Eye className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Approved Card */}
        <div
          onClick={() => handleTabChange('approved')}
          className={`cursor-pointer rounded-[5px] bg-white p-4 border transition-all shadow-sm ${
            activeTab === 'approved'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
              : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Approved</span>
              <p className="mt-1 text-2xl font-black text-emerald-600">{stats.approved}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Published live</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Rejected Card */}
        <div
          onClick={() => handleTabChange('rejected')}
          className={`cursor-pointer rounded-[5px] bg-white p-4 border transition-all shadow-sm ${
            activeTab === 'rejected'
              ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-md'
              : 'border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rejected</span>
              <p className="mt-1 text-2xl font-black text-rose-600">{stats.rejected}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Needs employer edit</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Total Requests Card */}
        <div
          onClick={() => handleTabChange('all')}
          className={`cursor-pointer rounded-[5px] bg-white p-4 border transition-all shadow-sm ${
            activeTab === 'all'
              ? 'border-[#6658dd] ring-2 ring-[#6658dd]/20 shadow-md'
              : 'border-slate-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Requests</span>
              <p className="mt-1 text-2xl font-black text-[#6658dd]">{stats.all}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">All submissions</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8e6fa] text-[#6658dd]">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-[5px] bg-white p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto hide-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'viewed', label: 'Under Review' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' }
            ].map(tab => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3 py-1.5 rounded-[5px] text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#6658dd] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search job, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-[5px] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6658dd]/20"
            />
          </form>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-[5px] bg-white border border-slate-200 shadow-sm overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Job Edit Requests Found</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              {searchQuery
                ? `No requests matching "${searchQuery}".`
                : activeTab === 'all'
                  ? 'There are currently no job edit requests submitted by employers.'
                  : `There are no requests in the "${activeTab}" status.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Employer / Company</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Requested On</th>
                  <th className="py-3 px-4">Modifications</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {requests.map((item) => {
                  const changedCount = item.changedFields?.length || 0;
                  const employerName = item.employer?.companyName || item.companyName || `${item.employer?.firstName || ''} ${item.employer?.lastName || ''}`.trim() || 'Employer';

                  return (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      {/* Job Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[#6658dd] font-black">
                            <Briefcase className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-extrabold text-slate-900 line-clamp-1">{item.jobTitle}</p>
                            <span className="text-[11px] text-slate-400">
                              ID: {String(item.job?._id || item.job || '').slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Employer / Company */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">{employerName}</p>
                            <p className="text-[11px] text-slate-400">{item.employer?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-[5px] text-[11px] font-extrabold bg-slate-100 text-slate-700">
                          {item.planName || 'Standard'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </td>

                      {/* Modifications */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          {changedCount} {changedCount === 1 ? 'field' : 'fields'} changed
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenReview(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#6658dd] hover:bg-[#574bbc] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Changes</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review / Comparison Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6658dd] text-white shadow-sm font-black">
                  <Briefcase className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {selectedRequest.jobTitle}
                    </h3>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Requested by <span className="font-bold text-slate-700">{selectedRequest.companyName || selectedRequest.employer?.companyName || 'Employer'}</span> ({selectedRequest.employer?.email || 'N/A'})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* View Selector Tabs */}
            <div className="flex items-center justify-between px-5 pt-3 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewTab('diff')}
                  className={`pb-2.5 text-xs font-bold transition border-b-2 cursor-pointer ${
                    viewTab === 'diff'
                      ? 'border-[#6658dd] text-[#6658dd]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Modifications Diff ({diffItems.length} Fields)
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab('full')}
                  className={`pb-2.5 text-xs font-bold transition border-b-2 cursor-pointer ${
                    viewTab === 'full'
                      ? 'border-[#6658dd] text-[#6658dd]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Full Proposed Job Details
                </button>
              </div>

              {selectedRequest.status === 'viewed' && (
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full mb-2">
                  Employer notified: Viewed / Under Review
                </span>
              )}
            </div>

            {/* Modal Body Scrollable */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[62vh] space-y-4">
              {detailLoading ? (
                <div className="p-8">
                  <PageSkeleton variant="card" />
                </div>
              ) : viewTab === 'diff' ? (
                <div className="space-y-4">
                  {/* Informational Callout */}
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Comparing original vs newly edited fields:</span>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Values in <span className="bg-rose-100 px-1 py-0.2 rounded font-bold text-rose-700">Red</span> represent previous values (Pehle kya tha), and values in <span className="bg-emerald-100 px-1 py-0.2 rounded font-bold text-emerald-700">Green</span> represent new requested values (Ab new kya h).
                      </p>
                    </div>
                  </div>

                  {/* Diff Cards Table */}
                  <div className="space-y-3">
                    {diffItems.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-6">No specific field changes recorded.</p>
                    ) : (
                      diffItems.map(item => (
                        <div key={item.field} className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
                          <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                              {item.label}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                              Field: {item.field}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
                            {/* Previous Value */}
                            <div className="p-3 bg-rose-50/30">
                              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
                                Pehle kya tha (Previous):
                              </span>
                              <div className="text-slate-700 font-medium break-words leading-relaxed">
                                {formatValue(item.oldVal)}
                              </div>
                            </div>

                            {/* New Proposed Value */}
                            <div className="p-3 bg-emerald-50/40">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                                Ab new kya h (New Requested):
                              </span>
                              <div className="text-slate-900 font-bold break-words leading-relaxed">
                                {formatValue(item.newVal)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* Full Proposed Details Tab */
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Openings:</span>
                      <span className="font-bold text-slate-800">{selectedRequest.proposedData?.vacancies || 1}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Work Mode:</span>
                      <span className="font-bold text-slate-800">{selectedRequest.proposedData?.workMode || 'Office'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Experience:</span>
                      <span className="font-bold text-slate-800">{selectedRequest.proposedData?.experience || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Salary:</span>
                      <span className="font-bold text-slate-800">{selectedRequest.proposedData?.salary || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Location:</span>
                      <span className="font-bold text-slate-800">
                        {Array.isArray(selectedRequest.proposedData?.jobLocations)
                          ? selectedRequest.proposedData.jobLocations.join(', ')
                          : selectedRequest.proposedData?.city || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Expiry Date:</span>
                      <span className="font-bold text-slate-800">{selectedRequest.proposedData?.jobExpiry ? new Date(selectedRequest.proposedData.jobExpiry).toLocaleDateString('en-IN') : 'N/A'}</span>
                    </div>
                  </div>

                  {selectedRequest.proposedData?.description && (
                    <div className="p-4 rounded-lg border border-slate-200 bg-white">
                      <span className="text-xs font-bold text-slate-800 block mb-1">Job Description:</span>
                      <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {selectedRequest.proposedData.description}
                      </div>
                    </div>
                  )}

                  {selectedRequest.proposedData?.responsibilities && (
                    <div className="p-4 rounded-lg border border-slate-200 bg-white">
                      <span className="text-xs font-bold text-slate-800 block mb-1">Responsibilities:</span>
                      <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {selectedRequest.proposedData.responsibilities}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Rejection Details if rejected */}
              {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <span className="font-black block uppercase tracking-wider mb-1">Rejection Reason Provided:</span>
                  <p className="font-medium">{selectedRequest.rejectionReason}</p>
                  {selectedRequest.reviewedAt && (
                    <span className="text-[10px] text-rose-600 block mt-1">
                      Reviewed on: {new Date(selectedRequest.reviewedAt).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              )}

              {/* Approval Details if approved */}
              {selectedRequest.status === 'approved' && (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-black">This job edit has been approved and published live.</span>
                    {selectedRequest.reviewedAt && (
                      <p className="text-[11px] text-emerald-700">
                        Approved on: {new Date(selectedRequest.reviewedAt).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-[5px] border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>

              {/* Show Approve/Reject buttons if pending or viewed */}
              {(selectedRequest.status === 'pending' || selectedRequest.status === 'viewed') && (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[5px] bg-[#f1556c] hover:bg-[#cd485c] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-[5px] bg-[#1abc9c] hover:bg-[#16a085] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve & Publish</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Sub-Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-rose-50">
              <h4 className="text-sm font-black text-rose-950 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                Reject Job Edit Request
              </h4>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleReject} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reason for Rejection <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Explain why this job edit cannot be approved (e.g., Inappropriate salary range, duplicate title, incomplete qualifications). Employer will see this reason to fix their job."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-3 rounded-[5px] border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-3.5 py-1.5 rounded-[5px] border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !rejectReason.trim()}
                  className="px-4 py-1.5 rounded-[5px] bg-[#f1556c] hover:bg-[#cd485c] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobRequests;
