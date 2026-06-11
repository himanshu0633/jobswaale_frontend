import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import {
  Briefcase,
  MapPin,
  CreditCard,
  FileText,
  Save,
  Loader,
  AlertCircle,
  CheckCircle,
  ClipboardList,
} from 'lucide-react';

export const AddEmployer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Masters
  const [industries, setIndustries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [plans, setPlans] = useState([]);

  // Form State
  const [form, setForm] = useState({
    email: '',
    password: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    industryType: '',
    website: '',
    description: '',
    country: '',
    state: '',
    district: '',
    city: '',
    address: '',
    pinCode: '',
    currentPlan: '',
    planValidity: '',
    logo: '',
    status: 'active',
    blacklistReason: ''
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchMasters = async () => {
    try {
      const [resI, resC, resS, resD, resCt, resP] = await Promise.all([
        axios.get(`${BASE_API_URL}/masters/industry-types`),
        axios.get(`${BASE_API_URL}/masters/countries`),
        axios.get(`${BASE_API_URL}/masters/states`),
        axios.get(`${BASE_API_URL}/masters/districts`),
        axios.get(`${BASE_API_URL}/masters/cities`),
        axios.get(`${BASE_API_URL}/masters/plans`)
      ]);
      setIndustries(resI.data);
      setCountries(resC.data);
      setStates(resS.data);
      setDistricts(resD.data);
      setCities(resCt.data);
      setPlans(resP.data);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error loading master data lists.');
    }
  };

  const fetchExisting = async () => {
    if (!id) { setLoading(false); return; }
    try {
      const response = await axios.get(`${BASE_API_URL}/employers`);
      const emp = response.data.find(x => x._id === id);
      if (emp) {
        setForm({
          email: emp.userId?.email || '',
          password: '',
          companyName: emp.companyName || '',
          contactPerson: emp.contactPerson || '',
          phone: emp.phone || '',
          industryType: emp.industryType?._id || emp.industryType || '',
          website: emp.website || '',
          description: emp.description || '',
          country: emp.country || '',
          state: emp.state || '',
          district: emp.district || '',
          city: emp.city || '',
          address: emp.address || '',
          pinCode: emp.pinCode || '',
          currentPlan: emp.currentPlan?._id || emp.currentPlan || '',
          planValidity: emp.planValidity ? new Date(emp.planValidity).toISOString().split('T')[0] : '',
          logo: emp.logo || '',
          status: emp.status || 'active',
          blacklistReason: emp.blacklistReason || ''
        });
      } else {
        showMessage('error', 'Employer profile not found.');
      }
    } catch (err) {
      console.error(err);
      showMessage('error', 'Failed to retrieve employer record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchMasters();
      await fetchExisting();
    };
    initialize();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.phone || !form.industryType || !form.country || !form.state || !form.district || !form.city || !form.address || !form.pinCode) {
      showMessage('error', 'Please fill in all required profile details.');
      return;
    }
    if (!id && (!form.email || !form.password)) {
      showMessage('error', 'Login email and password are required for new registrations.');
      return;
    }
    setSubmitting(true);
    try {
      if (id) {
        await axios.put(`${BASE_API_URL}/employers/${id}`, form);
        showMessage('success', 'Employer profile updated successfully.');
        setTimeout(() => navigate('/admin/employers'), 1500);
      } else {
        await axios.post(`${BASE_API_URL}/employers`, form);
        showMessage('success', 'Employer registered successfully.');
        setTimeout(() => navigate('/admin/employers'), 1500);
      }
    } catch (err) {
      console.error(err);
      showMessage('error', err.response?.data?.message || 'Error saving employer details.');
    } finally {
      setSubmitting(false);
    }
  };

  const availableStates = form.country ? states.filter(s => s.cid === form.country) : [];
  const availableDistricts = form.state ? districts.filter(d => d.sid === form.state) : [];
  const availableCities = form.district ? cities.filter(c => c.did === form.district) : [];

  const inputCls = "w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm disabled:bg-slate-50";
  const labelCls = "block text-sm font-medium text-slate-600 mb-1";

  const tabs = [
    { key: 'company',      label: 'Company Details',   icon: <Briefcase className="w-4 h-4" /> },
    { key: 'address',      label: 'Address Detail',    icon: <MapPin className="w-4 h-4" /> },
    { key: 'subscription', label: 'Subscription Plan', icon: <CreditCard className="w-4 h-4" /> },
    { key: 'other',        label: 'Other Detail',      icon: <FileText className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-slate-800">Employer</h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="text-indigo-600">{id ? 'Edit Employer' : 'Add Employer'}</span>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-base font-semibold text-slate-800">
            {id ? 'Edit Employer' : 'Add Employer'}
          </h4>
          <Link
            to="/admin/employers"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            View Listings
          </Link>
        </div>

        {/* Alert Message */}
        {message.text && (
          <div className={`flex items-center gap-2.5 px-5 py-3 border-b text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}>
            {message.type === 'success'
              ? <CheckCircle className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-5 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-5">

            {/* Tab 1: Company Details */}
            {activeTab === 'company' && (
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  Company Details
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className={labelCls}>Company Name <span className="text-rose-500">*</span></label>
                    <input type="text" required placeholder="Name of Company" value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })} className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Contact Person</label>
                    <input type="text" placeholder="Contact Person" value={form.contactPerson}
                      onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>
                      Email <span className="text-rose-500">*</span>
                      {id && <span className="text-slate-400 font-normal text-xs ml-1">(cannot change)</span>}
                    </label>
                    <input type="email" required disabled={!!id} placeholder="Email" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>
                      Password{' '}
                      {id
                        ? <span className="text-slate-400 font-normal text-xs">(leave blank to keep)</span>
                        : <span className="text-rose-500">*</span>}
                    </label>
                    <input type="password" required={!id} placeholder="••••••••" value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Phone <span className="text-rose-500">*</span></label>
                    <input type="text" required placeholder="Phone Number" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Industry Type <span className="text-rose-500">*</span></label>
                    <select required value={form.industryType}
                      onChange={(e) => setForm({ ...form, industryType: e.target.value })} className={inputCls}>
                      <option value="">-- Choose --</option>
                      {industries.map(ind => (
                        <option key={ind._id} value={ind._id}>{ind.industryType}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelCls}>Company Website</label>
                    <input type="text" placeholder="www.company.com" value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputCls} />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelCls}>Company Description</label>
                    <textarea rows="4" placeholder="Write a brief about company" value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
                  </div>

                </div>
              </div>
            )}

            {/* Tab 2: Address Detail */}
            {activeTab === 'address' && (
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  Address Detail
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className={labelCls}>Country <span className="text-rose-500">*</span></label>
                    <select required value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value, state: '', district: '', city: '' })} className={inputCls}>
                      <option value="">-- Choose --</option>
                      {countries.map(c => (
                        <option key={c.cid} value={c.cid}>{c.countryName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>State <span className="text-rose-500">*</span></label>
                    <select required disabled={!form.country} value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value, district: '', city: '' })} className={inputCls}>
                      <option value="">-- Choose --</option>
                      {availableStates.map(s => (
                        <option key={s.sid} value={s.sid}>{s.stateName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>District <span className="text-rose-500">*</span></label>
                    <select required disabled={!form.state} value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value, city: '' })} className={inputCls}>
                      <option value="">-- Choose --</option>
                      {availableDistricts.map(d => (
                        <option key={d.did} value={d.did}>{d.districtName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>City <span className="text-rose-500">*</span></label>
                    <select required disabled={!form.district} value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls}>
                      <option value="">-- Choose --</option>
                      {availableCities.map(c => (
                        <option key={c.ctid} value={c.cityName}>{c.cityName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelCls}>Address <span className="text-rose-500">*</span></label>
                    <input type="text" required placeholder="Address of the Company" value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Pin Code <span className="text-rose-500">*</span></label>
                    <input type="text" required placeholder="Pin Code" value={form.pinCode}
                      onChange={(e) => setForm({ ...form, pinCode: e.target.value })} className={inputCls} />
                  </div>

                </div>
              </div>
            )}

            {/* Tab 3: Subscription Plan */}
            {activeTab === 'subscription' && (
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  Subscription Detail
                </h5>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <label className={labelCls}>Current Plan</label>
                      <select value={form.currentPlan}
                        onChange={(e) => setForm({ ...form, currentPlan: e.target.value })}
                        className="w-full px-3.5 py-2 border border-amber-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 text-sm bg-white">
                        <option value="">-- None --</option>
                        {plans.filter(p => p.category === 'Employer').map(p => (
                          <option key={p._id} value={p._id}>{p.planName} (Rs. {p.cost})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Plan Validity</label>
                      <input type="date" value={form.planValidity}
                        onChange={(e) => setForm({ ...form, planValidity: e.target.value })}
                        className="w-full px-3.5 py-2 border border-amber-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 text-sm bg-white" />
                      {form.planValidity && (
                        <p className="text-xs font-semibold text-emerald-600 mt-1.5">
                          Valid Till: {new Date(form.planValidity).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Other Detail */}
            {activeTab === 'other' && (
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Other Detail
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="md:col-span-2">
                    <label className={labelCls}>Upload Logo</label>
                    <input type="text" placeholder="https://image-server.com/logo.png" value={form.logo}
                      onChange={(e) => setForm({ ...form, logo: e.target.value })} className={inputCls} />
                    {form.logo && (
                      <img src={form.logo} alt="logo preview"
                        className="mt-2 w-16 h-16 object-cover rounded-lg border border-slate-200" />
                    )}
                  </div>

                  <div>
                    <label className={labelCls}>Status <span className="text-rose-500">*</span></label>
                    <select value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="blacklist">Blacklist</option>
                    </select>
                  </div>

                  {form.status === 'blacklist' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-rose-600 mb-1">
                        Reason for Blacklist <span className="text-rose-500">*</span>
                      </label>
                      <textarea required rows="4" placeholder="Write a Reason" value={form.blacklistReason}
                        onChange={(e) => setForm({ ...form, blacklistReason: e.target.value })}
                        className="w-full px-3.5 py-2 border border-rose-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm bg-rose-50/30" />
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>

          {/* Submit */}
          <div className="px-5 py-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors text-sm disabled:bg-slate-300"
            >
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {submitting ? 'Saving...' : 'Submit'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default AddEmployer;
