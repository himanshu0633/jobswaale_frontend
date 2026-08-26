import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Mail,
  FileText,
  Plus,
  Edit,
  Trash2,
  Download,
  Loader,
  AlertCircle,
  Check,
  ChevronRight,
  X,
  Search,
  Send
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import ClearFilterButton from '../../../components/ClearFilterButton';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
};

const statusTone = {
  'Offer Sent': 'bg-violet-50 text-[#6658dd]',
  'Offer Accepted': 'bg-cyan-50 text-cyan-500',
  Hired: 'bg-emerald-50 text-emerald-500',
  'Offer Declined': 'bg-rose-50 text-rose-500',
  Rejected: 'bg-rose-50 text-rose-500'
};

const getOfferStatus = (offer) => {
  if (offer.application?.status === 'Rejected') return 'Rejected';
  return offer.application?.selectionDetails?.offerStatus || 'Offer Sent';
};

export const EmployerOffers = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('offers'); // 'offers' or 'templates'
  const [offers, setOffers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search/Filters states
  const [offersSearch, setOffersSearch] = useState('');
  const [templatesSearch, setTemplatesSearch] = useState('');
  
  const [filterJob, setFilterJob] = useState(searchParams.get('jobTitle') || '');
  const [filterAttachment, setFilterAttachment] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Modal / Form state for template create/edit
  const [templateModal, setTemplateModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' or 'edit'
    id: null,
    name: '',
    subject: '',
    body: '',
    loading: false,
    error: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [offersRes, templatesRes] = await Promise.all([
        axios.get(`${BASE_API_URL}/employer/sent-offers`, { headers: getTokenHeaders() }),
        axios.get(`${BASE_API_URL}/employer/email-templates`, { headers: getTokenHeaders() })
      ]);
      setOffers(offersRes.data || []);
      setTemplates(templatesRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTemplateModal = (mode, template = null) => {
    if (mode === 'edit' && template) {
      setTemplateModal({
        isOpen: true,
        mode: 'edit',
        id: template._id,
        name: template.name || '',
        subject: template.subject || '',
        body: template.body || '',
        loading: false,
        error: ''
      });
    } else {
      setTemplateModal({
        isOpen: true,
        mode: 'create',
        id: null,
        name: '',
        subject: '',
        body: '',
        loading: false,
        error: ''
      });
    }
  };

  const handleCloseTemplateModal = () => {
    setTemplateModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSubmitTemplate = async (e) => {
    e.preventDefault();
    const { mode, id, name, subject, body } = templateModal;

    if (!name.trim() || !subject.trim() || !body.trim()) {
      setTemplateModal((prev) => ({ ...prev, error: 'All fields are required.' }));
      return;
    }

    setTemplateModal((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      if (mode === 'create') {
        await axios.post(
          `${BASE_API_URL}/employer/email-templates`,
          { name, subject, body },
          { headers: getTokenHeaders() }
        );
        setSuccess('Template created successfully!');
      } else {
        await axios.put(
          `${BASE_API_URL}/employer/email-templates/${id}`,
          { name, subject, body },
          { headers: getTokenHeaders() }
        );
        setSuccess('Template updated successfully!');
      }
      handleCloseTemplateModal();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setTemplateModal((prev) => ({
        ...prev,
        error: err.response?.data?.message || 'Failed to save email template.'
      }));
    } finally {
      setTemplateModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    setLoading(true);
    try {
      await axios.delete(`${BASE_API_URL}/employer/email-templates/${id}`, {
        headers: getTokenHeaders()
      });
      setSuccess('Template deleted successfully!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete template.');
    } finally {
      setLoading(false);
    }
  };

  const updateOfferStatus = async (applicationId, newStatus) => {
    setLoading(true);
    setError('');
    try {
      await axios.patch(
        `${BASE_API_URL}/employer/selected/${applicationId}/offer`,
        {
          offerStatus: newStatus
        },
        { headers: getTokenHeaders() }
      );
      setSuccess(`Offer status updated to ${newStatus}!`);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update offer status.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (applicationId) => {
    if (!window.confirm('Are you sure you want to reject this candidate?')) return;
    setLoading(true);
    setError('');
    try {
      await axios.patch(
        `${BASE_API_URL}/employer/applications/${applicationId}/status`,
        { status: 'Rejected' },
        { headers: getTokenHeaders() }
      );
      setSuccess('Candidate rejected successfully!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject candidate.');
    } finally {
      setLoading(false);
    }
  };

  const uniquePositions = useMemo(() => {
    const jobs = offers.map(o => o.application?.job?.jobTitle).filter(Boolean);
    return [...new Set(jobs)];
  }, [offers]);

  // Filtered lists
  const filteredOffers = offers.filter((o) => {
    const q = offersSearch.toLowerCase();
    const candName = o.candidate?.name?.toLowerCase() || '';
    const candEmail = o.candidateEmail?.toLowerCase() || '';
    const jobTitle = o.application?.job?.jobTitle || '';
    const subj = o.subject?.toLowerCase() || '';
    
    const matchesSearch = candName.includes(q) || candEmail.includes(q) || jobTitle.toLowerCase().includes(q) || subj.includes(q);
    const matchesJob = !filterJob || jobTitle === filterJob;
    const matchesAttachment = !filterAttachment || 
      (filterAttachment === 'pdf' && o.attachmentUrl) ||
      (filterAttachment === 'none' && !o.attachmentUrl);
    const matchesDate = !filterDate || new Date(o.createDate) >= new Date(filterDate);

    return matchesSearch && matchesJob && matchesAttachment && matchesDate;
  });

  const filteredTemplates = templates.filter((t) => {
    const q = templatesSearch.toLowerCase();
    return (t.name || '').toLowerCase().includes(q) || (t.subject || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4 px-3 sm:space-y-5 sm:px-0">
      {/* Page Title & Breadcrumbs */}
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center md:gap-3">
        <h1 className="text-lg font-extrabold text-[#3f4254] sm:text-xl">Offers & Templates</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 sm:text-sm">
          <span className="text-[#3f4254]">JobsWaale</span>
          <ChevronRight className="h-4 w-4" />
          <span>Offers</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#6658dd]">
            <Send className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Offers Sent</p>
            <h3 className="text-xl font-black text-slate-800 mt-0.5">{offers.length}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Offers with PDF</p>
            <h3 className="text-xl font-black text-slate-800 mt-0.5">{offers.filter(o => o.attachmentUrl).length}</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Saved Templates</p>
            <h3 className="text-xl font-black text-slate-800 mt-0.5">{templates.length}</h3>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 bg-white rounded-md p-1 shadow-sm max-w-md">
        <button
          type="button"
          disabled={loading}
          onClick={() => setActiveTab('offers')}
          className={`flex-1 py-2 text-center text-sm font-extrabold rounded-md transition ${activeTab === 'offers' ? 'bg-[#6658dd] text-white shadow-sm' : 'text-slate-500 hover:text-[#6658dd]'}`}
        >
          Sent Offers
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-2 text-center text-sm font-extrabold rounded-md transition ${activeTab === 'templates' ? 'bg-[#6658dd] text-white shadow-sm' : 'text-slate-500 hover:text-[#6658dd]'}`}
        >
          Email Templates
        </button>
      </div>

      {/* Sent Offers Tab */}
      {activeTab === 'offers' && (
        <section className="rounded-md border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-dashed border-slate-200 px-4 py-4 sm:px-5">
            <h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Sent Offers Log</h2>
            <p className="mt-1 text-xs font-semibold text-slate-400 sm:text-sm">
              View history of all job offers sent to candidates with their attachments.
            </p>
          </div>

          {/* Filters Row */}
          <div className="grid gap-4 border-b border-dashed border-slate-200 px-4 py-4 sm:px-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-end bg-slate-50/50">
            <div>
              <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  disabled={loading}
                  type="text"
                  placeholder="Search candidate or subject..."
                  value={offersSearch}
                  onChange={(e) => setOffersSearch(e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Filter by Position</label>
              <select
                disabled={loading}
                value={filterJob}
                onChange={(e) => setFilterJob(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-[#6658dd]"
              >
                <option value="">All Positions</option>
                {uniquePositions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Filter by Attachment</label>
              <select
                disabled={loading}
                value={filterAttachment}
                onChange={(e) => setFilterAttachment(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-[#6658dd]"
              >
                <option value="">All Attachments</option>
                <option value="pdf">With PDF Attachment</option>
                <option value="none">No Attachment</option>
              </select>
            </div>

            <div className="flex gap-2 items-center">
              <div className="flex-grow">
                <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Sent After Date</label>
                <input
                  disabled={loading}
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-[#6658dd]"
                />
              </div>
              {(offersSearch || filterJob || filterAttachment || filterDate) && (
                <ClearFilterButton
                  onClick={() => {
                    setOffersSearch('');
                    setFilterJob('');
                    setFilterAttachment('');
                    setFilterDate('');
                  }}
                  className="h-10 mt-6 shrink-0"
                />
              )}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {loading && offers.length === 0 ? (
              <div className="py-12 text-center">
                <Loader className="mx-auto h-8 w-8 animate-spin text-[#6658dd]" />
              </div>
            ) : filteredOffers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-[#dbe6f6] text-[11px] uppercase text-slate-600">
                    <tr>
                      <th className="px-5 py-3">Candidate</th>
                      <th className="px-5 py-3">Position</th>
                      <th className="px-5 py-3">Subject</th>
                      <th className="px-5 py-3">Sent Date</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-center">Attachment</th>
                      <th className="px-5 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOffers.map((offer) => (
                      <tr key={offer._id} className="transition hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <div>
                            {offer.candidate?._id ? (
                              <Link
                                to={`/employer/candidateProfile/${offer.candidate._id}`}
                                className="text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd]"
                              >
                                {offer.candidate.name}
                              </Link>
                            ) : (
                              <span className="text-sm font-extrabold text-slate-400">N/A</span>
                            )}
                            <p className="mt-0.5 text-xs font-semibold text-slate-400">{offer.candidateEmail}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-extrabold text-[#3f4254]">
                          {offer.application?.job?.jobTitle || 'Open Position'}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                          {offer.subject}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                          {formatDate(offer.createDate)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex rounded px-2.5 py-1 text-xs font-black ${statusTone[getOfferStatus(offer)] || 'bg-slate-100 text-slate-600'}`}>
                            {getOfferStatus(offer)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {offer.attachmentUrl ? (
                            <a
                              href={`${BASE_API_URL}${offer.attachmentUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Download Offer Letter PDF"
                              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-extrabold text-[#6658dd] hover:bg-indigo-50"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download PDF</span>
                            </a>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {getOfferStatus(offer) === 'Offer Sent' && (
                              <>
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={() => updateOfferStatus(offer.application?._id, 'Offer Accepted')}
                                  className="rounded bg-cyan-500 px-2.5 py-1 text-xs font-extrabold text-white hover:bg-cyan-600 transition"
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={() => handleReject(offer.application?._id)}
                                  className="rounded bg-rose-500 px-2.5 py-1 text-xs font-extrabold text-white hover:bg-rose-600 transition"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {getOfferStatus(offer) === 'Offer Accepted' && (
                              <>
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={() => updateOfferStatus(offer.application?._id, 'Hired')}
                                  className="rounded bg-emerald-500 px-2.5 py-1 text-xs font-extrabold text-white hover:bg-emerald-600 transition"
                                >
                                  Hire
                                </button>
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={() => handleReject(offer.application?._id)}
                                  className="rounded bg-rose-500 px-2.5 py-1 text-xs font-extrabold text-white hover:bg-rose-600 transition"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-sm font-bold text-slate-400">
                {offersSearch ? 'No offers match your search.' : 'No sent offers yet.'}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Email Templates Tab */}
      {activeTab === 'templates' && (
        <section className="rounded-md border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-dashed border-slate-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Offer Templates</h2>
              <p className="mt-1 text-xs font-semibold text-slate-400 sm:text-sm">
                Create and manage reusable templates for candidate offer emails.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  disabled={loading}
                  type="text"
                  placeholder="Search templates..."
                  value={templatesSearch}
                  onChange={(e) => setTemplatesSearch(e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6658dd] sm:w-48"
                />
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleOpenTemplateModal('create')}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white transition hover:bg-[#5848d8]"
              >
                <Plus className="h-4 w-4" /> Create Template
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {loading && templates.length === 0 ? (
              <div className="py-12 text-center">
                <Loader className="mx-auto h-8 w-8 animate-spin text-[#6658dd]" />
              </div>
            ) : filteredTemplates.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredTemplates.map((template) => (
                  <div
                    key={template._id}
                    className="rounded-lg border border-slate-100 p-4 shadow-xs transition hover:border-[#6658dd] bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#6658dd]" />
                        <h3 className="text-sm font-extrabold text-slate-800 truncate">{template.name}</h3>
                      </div>
                      <p className="mt-2 text-xs font-bold text-slate-500 truncate">
                        <span className="text-slate-400">Subject:</span> {template.subject}
                      </p>
                      <p className="mt-1.5 text-xs text-slate-400 font-semibold line-clamp-3 leading-relaxed whitespace-pre-line">
                        {template.body}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleOpenTemplateModal('edit', template)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-3 text-xs font-extrabold text-[#6658dd] hover:bg-indigo-50"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleDeleteTemplate(template._id)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 px-3 text-xs font-extrabold text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-sm font-bold text-slate-400">
                {templatesSearch ? 'No templates match your search.' : 'No saved templates. Click Create Template to add one.'}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Template Create/Edit Modal */}
      {templateModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
              <h3 className="text-sm font-extrabold text-[#3f4254] sm:text-base">
                {templateModal.mode === 'create' ? 'Create Email Template' : 'Edit Email Template'}
              </h3>
              <button
                type="button"
                onClick={handleCloseTemplateModal}
                disabled={templateModal.loading}
                className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {templateModal.error && (
              <div className="mx-4 mt-4 rounded-md border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 sm:mx-5 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{templateModal.error}</span>
              </div>
            )}

            {/* Form */}
            <div className="overflow-y-auto p-4 sm:p-5">
              <form onSubmit={handleSubmitTemplate} className="space-y-4">
                {/* Template Name */}
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-500">Template Name / Label</label>
                  <input
                    type="text"
                    required
                    disabled={templateModal.loading}
                    placeholder="e.g. Developer Offer Template"
                    value={templateModal.name}
                    onChange={(e) => setTemplateModal((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                  />
                </div>

                {/* Email Subject */}
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-500">Email Subject</label>
                  <input
                    type="text"
                    required
                    disabled={templateModal.loading}
                    placeholder="e.g. Job Offer details from Duke Infosys"
                    value={templateModal.subject}
                    onChange={(e) => setTemplateModal((prev) => ({ ...prev, subject: e.target.value }))}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                  />
                </div>

                {/* Email Body */}
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-500">Email Body Message</label>
                  <textarea
                    rows="6"
                    required
                    disabled={templateModal.loading}
                    placeholder="Write template message content..."
                    value={templateModal.body}
                    onChange={(e) => setTemplateModal((prev) => ({ ...prev, body: e.target.value }))}
                    className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={templateModal.loading}
                    onClick={handleCloseTemplateModal}
                    className="h-10 rounded-md bg-slate-100 px-5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={templateModal.loading}
                    className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-6 text-sm font-extrabold text-white transition hover:bg-[#5848d8] disabled:opacity-60"
                  >
                    {templateModal.loading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>Save Template</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerOffers;
