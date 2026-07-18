import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit2,
  Loader,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import { onlyDigits, toWholeNumber } from '../../../utils/masterForm';
import ResponsiveCardList from '../../../components/ResponsiveCardList';

const emptyForm = {
  planName: '',
  planSubtitle: '',
  planValidity: 'Weekly',
  cost: '',
  unlockCount: '',
  freeJobPosts: '',
  autoMailLimit: '',
  showBadge: false,
  badge: '',
  employerFeatures: ['Direct Contact Access', 'Employer Dashboard', 'Priority Support', 'Candidate Tracking'],
  offerEnabled: false,
  offerTitle: '',
  offerDescription: '',
  displayOrder: '',
  status: 'active'
};

const badgeClasses = {
  'BEST VALUE': 'bg-amber-50 text-amber-500',
  'MOST POPULAR': 'bg-violet-100 text-violet-600',
  'ENTERPRISE CHOICE': 'bg-cyan-50 text-cyan-500',
  PREMIUM: 'bg-rose-50 text-rose-500',
  BASIC: 'bg-blue-50 text-blue-500'
};

const formatPrice = (value) => Number(value || 0).toLocaleString('en-IN');

const PlanBadge = ({ value }) => {
  if (!value) return <span className="text-slate-300">-</span>;
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-extrabold ${badgeClasses[value] || 'bg-slate-100 text-slate-600'}`}>
      {value}
    </span>
  );
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-extrabold ${
    status === 'active' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
  }`}>
    {status === 'active' ? 'Active' : 'Inactive'}
  </span>
);

export const EmployerPlanListings = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [search, setSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const startIndex = (currentPage - 1) * entriesPerPage;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchVal);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchVal]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_API_URL}/masters/plans?category=Employer&page=${currentPage}&limit=${entriesPerPage}&search=${search}&paginate=true`
      );
      setList(response.data.docs || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    axios.get(
      `${BASE_API_URL}/masters/plans?category=Employer&page=${currentPage}&limit=${entriesPerPage}&search=${search}&paginate=true`
    ).then((response) => {
      if (cancelled) return;
      setList(response.data.docs || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [currentPage, entriesPerPage, search]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let page = start; page <= end; page += 1) pages.push(page);
    return pages;
  }, [currentPage, totalPages]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete the plan "${item.planName}"?`)) return;
    await axios.delete(`${BASE_API_URL}/masters/plans/${item._id}`);
    fetchList();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Employer Plan Listings</h1>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-400">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span>Employer Plan Listings</span>
        </div>
      </div>

      <div className="border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden -ml-3 lg:-ml-5">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-700">Employer Plan Listings</h3>
          <Link
            to="/admin/employer-plans/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Plan
          </Link>
        </div>

        <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <select
              value={entriesPerPage}
              onChange={(event) => {
                setEntriesPerPage(Number(event.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-md text-slate-700 bg-white focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries per page</span>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <span>Search:</span>
            <input
              type="text"
              value={searchVal}
              onChange={(event) => setSearchVal(event.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-indigo-500 bg-white w-full sm:w-56 font-normal"
            />
          </div>
        </div>

        <ResponsiveCardList
          items={list}
          emptyMessage="No matching records found."
          renderCard={(item, index) => (
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-800">{String(startIndex + index + 1).padStart(3, '0')} - {item.planName}</div>
                  <div className="text-xs text-slate-500">{item.planValidity} | Rs. {formatPrice(item.cost)}</div>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">Unlock: {item.unlockCount || '-'} | Sort: {item.displayOrder}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(`/admin/employer-plans/edit/${item._id}`)} className="w-8 h-8 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item)} className="w-8 h-8 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        />

        <div className="overflow-x-auto relative min-h-[200px] hidden md:block">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
              <Loader className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          )}
          <table className="w-full text-sm text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="bg-[#dbe8f8] text-xs text-slate-700 uppercase">
                <th className="px-4 py-3.5 font-extrabold">ID</th>
                <th className="px-4 py-3.5 font-extrabold">Plan Name</th>
                <th className="px-4 py-3.5 font-extrabold">Plan Type</th>
                <th className="px-4 py-3.5 font-extrabold">Price (Rs.)</th>
                <th className="px-4 py-3.5 font-extrabold">Unlock Count</th>
                <th className="px-4 py-3.5 font-extrabold">Auto Mail Limit</th>
                <th className="px-4 py-3.5 font-extrabold">Badge</th>
                <th className="px-4 py-3.5 font-extrabold">Sort Order</th>
                <th className="px-4 py-3.5 font-extrabold">Status</th>
                <th className="px-4 py-3.5 font-extrabold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {list.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-slate-400">No matching records found.</td>
                </tr>
              ) : (
                list.map((item, index) => (
                  <tr key={item._id} className={index % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}>
                    <td className="px-4 py-4 font-medium">{String(startIndex + index + 1).padStart(3, '0')}</td>
                    <td className="px-4 py-4 font-semibold">{item.planName}</td>
                    <td className="px-4 py-4">{item.planValidity}</td>
                    <td className="px-4 py-4">{formatPrice(item.cost)}</td>
                    <td className="px-4 py-4">{item.unlockCount || '-'}</td>
                    <td className="px-4 py-4">{item.autoMailLimit || 0}</td>
                    <td className="px-4 py-4"><PlanBadge value={item.badge} /></td>
                    <td className="px-4 py-4">{item.displayOrder}</td>
                    <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/employer-plans/edit/${item._id}`)}
                          className="w-8 h-8 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="w-8 h-8 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm font-semibold text-slate-500">
            Showing {total === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + entriesPerPage, total)} of {total} entries
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-md bg-white text-slate-400 disabled:opacity-50">
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-md bg-white text-slate-400 disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 flex items-center justify-center font-bold text-sm rounded-md transition-colors ${
                  currentPage === page ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-500'
                }`}
              >
                {page}
              </button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-md bg-white text-slate-400 disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-md bg-white text-slate-400 disabled:opacity-50">
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormSection = ({ title, children }) => (
  <div className="border border-slate-200 rounded-md p-5 bg-white">
    <div className="mb-5 px-4 py-3 rounded-md bg-slate-100 text-slate-700 text-sm font-extrabold">
      {title}
    </div>
    {children}
  </div>
);

export const EmployerPlanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_API_URL}/masters/plans?category=Employer&limit=1000`);
        const plan = (Array.isArray(response.data) ? response.data : []).find((item) => item._id === id);
        if (!plan) {
          setAlert({ type: 'error', text: 'Plan not found.' });
          return;
        }
        setForm({
          planName: plan.planName || '',
          planSubtitle: plan.planSubtitle || '',
          planValidity: plan.planValidity || 'Weekly',
          cost: String(plan.cost ?? ''),
          unlockCount: plan.unlockCount || '',
          freeJobPosts: String(plan.freeJobPosts ?? ''),
          autoMailLimit: String(plan.autoMailLimit ?? ''),
          showBadge: Boolean(plan.showBadge),
          badge: plan.badge || '',
          employerFeatures: plan.employerFeatures?.length ? plan.employerFeatures : emptyForm.employerFeatures,
          offerEnabled: Boolean(plan.offerEnabled),
          offerTitle: plan.offerTitle || '',
          offerDescription: plan.offerDescription || '',
          displayOrder: String(plan.displayOrder ?? ''),
          status: plan.status || 'active'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.planName.trim()) {
      setAlert({ type: 'error', text: 'Plan Name is required.' });
      return;
    }
    if (form.cost === '') {
      setAlert({ type: 'error', text: 'Price is required.' });
      return;
    }
    if (!form.displayOrder) {
      setAlert({ type: 'error', text: 'Sort Order is required.' });
      return;
    }

    const payload = {
      category: 'Employer',
      planName: form.planName,
      planType: 'Paid',
      planValidity: form.planValidity,
      cost: Number(form.cost),
      unlockCount: form.unlockCount,
      freeJobPosts: Number(form.freeJobPosts) || 0,
      autoMailLimit: Number(form.autoMailLimit) || 0,
      showBadge: form.showBadge,
      badge: form.badge,
      planSubtitle: form.planSubtitle,
      employerFeatures: form.employerFeatures,
      offerEnabled: form.offerEnabled,
      offerTitle: form.offerTitle,
      offerDescription: form.offerDescription,
      displayOrder: toWholeNumber(form.displayOrder),
      status: form.status
    };

    setSaving(true);
    try {
      if (id) {
        await axios.put(`${BASE_API_URL}/masters/plans/${id}`, payload);
      } else {
        await axios.post(`${BASE_API_URL}/masters/plans`, payload);
      }
      setAlert({ type: 'success', text: 'Employer plan saved successfully.' });
      setTimeout(() => navigate('/admin/employer-plans'), 700);
    } catch (error) {
      setAlert({ type: 'error', text: error.response?.data?.message || 'Oops! Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const updateFeature = (index, value) => {
    setForm({
      ...form,
      employerFeatures: form.employerFeatures.map((feature, idx) => idx === index ? value : feature)
    });
  };

  const removeFeature = (index) => {
    setForm({
      ...form,
      employerFeatures: form.employerFeatures.filter((_, idx) => idx !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Employer Plan Management</h1>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-400">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span>Employer Plan Management</span>
        </div>
      </div>

      <div className="border border-slate-200 bg-white rounded-lg shadow-sm overflow-hidden -ml-3 lg:-ml-5">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-700">{id ? 'Update Employer Plan' : 'Create Employer Plan'}</h3>
          <Link to="/admin/employer-plans" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-bold">
            View Plan Listings
          </Link>
        </div>

        <div className="p-6">
          {alert.text && (
            <div className={`mb-5 flex items-center gap-3 p-4 rounded-md text-sm font-semibold ${
              alert.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <div className="flex-grow">{alert.text}</div>
              <button type="button" onClick={() => setAlert({ type: '', text: '' })} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <FormSection title="Basic Information">
                <div className="grid gap-5 lg:grid-cols-4">
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Plan Name <span className="text-rose-500">*</span></label>
                    <input value={form.planName} onChange={(event) => setForm({ ...form, planName: event.target.value })} placeholder="e.g. Basic, Pro, Enterprise" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Plan Type <span className="text-rose-500">*</span></label>
                    <select value={form.planValidity} onChange={(event) => setForm({ ...form, planValidity: event.target.value })} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500 bg-white">
                      <option value="">Select Plan Type</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Half-Yearly">Half-Yearly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Sort Order</label>
                    <input inputMode="numeric" value={form.displayOrder} onChange={(event) => setForm({ ...form, displayOrder: onlyDigits(event.target.value) })} placeholder="e.g. 1, 2, 3" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-bold text-slate-600 mb-2">Plan Subtitle</label>
                    <input value={form.planSubtitle} onChange={(event) => setForm({ ...form, planSubtitle: event.target.value })} placeholder="e.g. Best for small businesses" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-3">Status</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, status: form.status === 'active' ? 'inactive' : 'active' })}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
                    >
                      <span className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${form.status === 'active' ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${form.status === 'active' ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </span>
                      Active
                    </button>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Pricing Details">
                <div className="grid gap-5 lg:grid-cols-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Price <span className="text-rose-500">*</span></label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 border border-r-0 border-slate-200 rounded-l-md bg-slate-50 text-slate-600 text-sm font-bold">Rs.</span>
                      <input type="number" value={form.cost} onChange={(event) => setForm({ ...form, cost: event.target.value })} placeholder="0.00" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-r-md text-sm focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Unlock Count</label>
                    <input value={form.unlockCount} onChange={(event) => setForm({ ...form, unlockCount: event.target.value })} placeholder="e.g. 50" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Free Job Posts</label>
                    <input inputMode="numeric" value={form.freeJobPosts} onChange={(event) => setForm({ ...form, freeJobPosts: onlyDigits(event.target.value) })} placeholder="e.g. 10" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Auto Mail Limit</label>
                    <input inputMode="numeric" value={form.autoMailLimit} onChange={(event) => setForm({ ...form, autoMailLimit: onlyDigits(event.target.value) })} placeholder="e.g. 100" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Badge Settings">
                <label className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <input type="checkbox" checked={form.showBadge} onChange={(event) => setForm({ ...form, showBadge: event.target.checked })} className="w-4 h-4 rounded border-slate-300" />
                  Show Badge
                </label>
                <label className="block text-sm font-bold text-slate-600 mb-2">Badge Text</label>
                <input value={form.badge} onChange={(event) => setForm({ ...form, badge: event.target.value.toUpperCase() })} placeholder="e.g. MOST POPULAR, BEST VALUE, ENTERPRISE CHOICE" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500" />
                <div className="mt-3 flex flex-wrap gap-3">
                  {['MOST POPULAR', 'BEST VALUE', 'ENTERPRISE CHOICE'].map((badge) => (
                    <button key={badge} type="button" onClick={() => setForm({ ...form, showBadge: true, badge })} className={`px-6 py-2 rounded-md text-xs font-extrabold ${badgeClasses[badge] || 'bg-slate-100 text-slate-600'}`}>
                      {badge}
                    </button>
                  ))}
                </div>
              </FormSection>

              <FormSection title="Features">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="bg-[#dbe8f8] text-slate-700">
                        <th className="px-3 py-3 text-left font-extrabold">Feature Name</th>
                        <th className="px-3 py-3 text-center font-extrabold w-36">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {form.employerFeatures.map((feature, index) => (
                        <tr key={`${index}-${feature}`}>
                          <td className="px-3 py-2">
                            <input value={feature} onChange={(event) => updateFeature(index, event.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500" />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button type="button" onClick={() => removeFeature(index)} className="w-8 h-8 bg-rose-500 hover:bg-rose-600 text-white rounded-full inline-flex items-center justify-center">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={() => setForm({ ...form, employerFeatures: [...form.employerFeatures, ''] })} className="mt-3 px-4 py-2 rounded-md bg-indigo-50 text-indigo-600 text-sm font-bold">
                  + Add Feature
                </button>
              </FormSection>

              <FormSection title="Promotional Offer">
                <label className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <input type="checkbox" checked={form.offerEnabled} onChange={(event) => setForm({ ...form, offerEnabled: event.target.checked })} className="w-4 h-4 rounded border-slate-300" />
                  Enable Offer
                </label>
                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Offer Title</label>
                    <input value={form.offerTitle} onChange={(event) => setForm({ ...form, offerTitle: event.target.value.toUpperCase() })} placeholder="e.g. FIRST TIME OFFER" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Offer Description</label>
                    <input value={form.offerDescription} onChange={(event) => setForm({ ...form, offerDescription: event.target.value })} placeholder="e.g. Weekly Plan FREE with your First Job Post" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <div className="mt-5 rounded-md bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-600">
                  Example: {form.offerTitle || 'FIRST TIME OFFER'} - {form.offerDescription || 'Weekly Plan FREE with your First Job Post'}
                </div>
              </FormSection>

              <div className="border border-slate-200 rounded-md p-5 bg-white flex items-center gap-2">
                <button disabled={saving} type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold rounded-md text-sm">
                  {saving ? 'Saving...' : 'Save Plan'}
                </button>
                <button type="button" onClick={() => navigate('/admin/employer-plans')} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-sm font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerPlanListings;
