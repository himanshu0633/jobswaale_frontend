import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import { 
  User as UserIcon, 
  MapPin, 
  CreditCard, 
  FileText, 
  ArrowLeft, 
  Save, 
  Loader,
  AlertCircle,
  CheckCircle 
} from 'lucide-react';

export const AddJobseeker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Masters
  const [qualifications, setQualifications] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [plans, setPlans] = useState([]);

  // Form State
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    gender: 'Male',
    qualification: '',
    industryType: '',
    jobCategory: '',
    jobType: '',
    experience: 'Fresher',
    expectedSalary: '',
    preferredLocation: '',
    country: '',
    state: '',
    district: '',
    city: '',
    address: '',
    pinCode: '',
    currentPlan: '',
    planValidity: '',
    resume: '',
    status: 'active',
    blacklistReason: ''
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchMasters = async () => {
    try {
      const [resQ, resI, resC, resT, resCo, resS, resD, resCt, resP] = await Promise.all([
        axios.get(`${BASE_API_URL}/masters/qualifications`),
        axios.get(`${BASE_API_URL}/masters/industry-types`),
        axios.get(`${BASE_API_URL}/masters/job-categories`),
        axios.get(`${BASE_API_URL}/masters/job-types`),
        axios.get(`${BASE_API_URL}/masters/countries`),
        axios.get(`${BASE_API_URL}/masters/states`),
        axios.get(`${BASE_API_URL}/masters/districts`),
        axios.get(`${BASE_API_URL}/masters/cities`),
        axios.get(`${BASE_API_URL}/masters/plans`)
      ]);
      setQualifications(resQ.data);
      setIndustries(resI.data);
      setCategories(resT.data);
      setJobTypes(resCo.data);
      setCountries(resC.data);
      setStates(resS.data);
      setDistricts(resD.data);
      setCities(resCt.data);
      setPlans(resP.data);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error loading master data libraries.');
    }
  };

  const fetchExisting = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${BASE_API_URL}/jobseekers`);
      const js = response.data.find(x => x._id === id);
      if (js) {
        setForm({
          email: js.userId?.email || '',
          password: '',
          name: js.name || '',
          phone: js.phone || '',
          gender: js.gender || 'Male',
          qualification: js.qualification?._id || js.qualification || '',
          industryType: js.industryType?._id || js.industryType || '',
          jobCategory: js.jobCategory?._id || js.jobCategory || '',
          jobType: js.jobType?._id || js.jobType || '',
          experience: js.experience || 'Fresher',
          expectedSalary: js.expectedSalary || '',
          preferredLocation: js.preferredLocation || '',
          country: js.country || '',
          state: js.state || '',
          district: js.district || '',
          city: js.city || '',
          address: js.address || '',
          pinCode: js.pinCode || '',
          currentPlan: js.currentPlan?._id || js.currentPlan || '',
          planValidity: js.planValidity ? new Date(js.planValidity).toISOString().split('T')[0] : '',
          resume: js.resume || '',
          status: js.status || 'active',
          blacklistReason: js.blacklistReason || ''
        });
      } else {
        showMessage('error', 'Jobseeker profile not found.');
      }
    } catch (err) {
      console.error(err);
      showMessage('error', 'Failed to retrieve jobseeker details.');
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

    if (!form.name || !form.phone || !form.gender || !form.qualification || !form.experience || !form.country || !form.state || !form.district || !form.city || !form.address || !form.pinCode) {
      showMessage('error', 'Please fill in all required profile details.');
      return;
    }

    if (!id && (!form.email || !form.password)) {
      showMessage('error', 'Login email and password are required for new jobseekers.');
      return;
    }

    setSubmitting(true);
    try {
      if (id) {
        await axios.put(`${BASE_API_URL}/jobseekers/${id}`, form);
        showMessage('success', 'Jobseeker profile updated successfully.');
        setTimeout(() => navigate('/jobseekers'), 1500);
      } else {
        await axios.post(`${BASE_API_URL}/jobseekers`, form);
        showMessage('success', 'Jobseeker profile created successfully.');
        setTimeout(() => navigate('/jobseekers'), 1500);
      }
    } catch (err) {
      console.error(err);
      showMessage('error', err.response?.data?.message || 'Error processing request.');
    } finally {
      setSubmitting(false);
    }
  };

  const availableStates = form.country ? states.filter(s => s.cid === form.country) : [];
  const availableDistricts = form.state ? districts.filter(d => d.sid === form.state) : [];
  const availableCities = form.district ? cities.filter(c => c.did === form.district) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/jobseekers"
          className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            {id ? 'Modify Candidate Details' : 'Register New Jobseeker'}
          </h1>
          <p className="text-sm text-slate-500">
            {id ? 'Update credentials, qualifications and preferred location targets.' : 'Create login credentials and link professional profile.'}
          </p>
        </div>
      </div>

      {message.text && (
        <div className={`flex items-center gap-2.5 p-4 rounded-xl border text-sm font-medium transition-all ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl shadow-sm px-4 pt-2">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'personal' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Personal & Professional
        </button>
        <button
          onClick={() => setActiveTab('address')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'address' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Address Detail
        </button>
        <button
          onClick={() => setActiveTab('subscription')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'subscription' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Subscription Plan
        </button>
        <button
          onClick={() => setActiveTab('other')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'other' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Other Detail
        </button>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="border border-slate-200 bg-white rounded-b-2xl shadow-sm p-6 space-y-6">
        
        {/* Tab 1: Personal & Professional */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Profile Credentials & Info</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  disabled={!!id}
                  placeholder="candidate@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Password {id ? '(Leave blank to keep current)' : <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="password"
                  required={!id}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Candidate Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Himanshu Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 9999999999"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Qualification <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={form.qualification}
                  onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="">-- Choose Qualification --</option>
                  {qualifications.map(q => (
                    <option key={q._id} value={q._id}>{q.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Industry Type
                </label>
                <select
                  value={form.industryType}
                  onChange={(e) => setForm({ ...form, industryType: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="">-- Choose Industry --</option>
                  {industries.map(ind => (
                    <option key={ind._id} value={ind._id}>{ind.industryType}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Job Category
                </label>
                <select
                  value={form.jobCategory}
                  onChange={(e) => setForm({ ...form, jobCategory: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.categoryName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Job Type
                </label>
                <select
                  value={form.jobType}
                  onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="">-- Choose Type --</option>
                  {jobTypes.map(t => (
                    <option key={t._id} value={t._id}>{t.jobType}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Experience <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="Fresher">Fresher</option>
                  <option value="1-2 Years">1-2 Years</option>
                  <option value="2-3 Years">2-3 Years</option>
                  <option value="3+ Years">3+ Years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Expected Salary (Rs. / Month)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 30,000"
                  value={form.expectedSalary}
                  onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Preferred Work Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chandigarh, Delhi"
                  value={form.preferredLocation}
                  onChange={(e) => setForm({ ...form, preferredLocation: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Address Detail */}
        {activeTab === 'address' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Geographic Location</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Country <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value, state: '', district: '', city: '' })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="">-- Choose Country --</option>
                  {countries.map(c => (
                    <option key={c.cid} value={c.cid}>{c.countryName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  State <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  disabled={!form.country}
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value, district: '', city: '' })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm disabled:bg-slate-50"
                >
                  <option value="">-- Choose State --</option>
                  {availableStates.map(s => (
                    <option key={s.sid} value={s.sid}>{s.stateName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  District <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  disabled={!form.state}
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value, city: '' })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm disabled:bg-slate-50"
                >
                  <option value="">-- Choose District --</option>
                  {availableDistricts.map(d => (
                    <option key={d.did} value={d.did}>{d.districtName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  City <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  disabled={!form.district}
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm disabled:bg-slate-50"
                >
                  <option value="">-- Choose City --</option>
                  {availableCities.map(c => (
                    <option key={c.ctid} value={c.cityName}>{c.cityName}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="House No, Landmark, Sector/Village"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Zip/Pin Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 143001"
                  value={form.pinCode}
                  onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Subscription Detail */}
        {activeTab === 'subscription' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Active Packages</h3>
            
            <div className="grid gap-4 md:grid-cols-2 bg-amber-50/40 p-5 rounded-2xl border border-amber-100/50">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Current Plan
                </label>
                <select
                  value={form.currentPlan}
                  onChange={(e) => setForm({ ...form, currentPlan: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                >
                  <option value="">-- None --</option>
                  {plans.filter(p => p.category === 'Jobseeker').map(p => (
                    <option key={p._id} value={p._id}>{p.planName} (Rs. {p.cost})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Plan Validity (Expiry Date)
                </label>
                <input
                  type="date"
                  value={form.planValidity}
                  onChange={(e) => setForm({ ...form, planValidity: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Other Detail */}
        {activeTab === 'other' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Documents & Blacklist Status</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Resume Link / Doc Link
                </label>
                <input
                  type="text"
                  placeholder="https://resume-host.com/my-cv.pdf"
                  value={form.resume}
                  onChange={(e) => setForm({ ...form, resume: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Account Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="blacklist">Blacklist</option>
                </select>
              </div>

              {form.status === 'blacklist' && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 text-rose-600">
                    Reason for Blacklisting <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Specify the reason why this candidate is being blacklisted..."
                    value={form.blacklistReason}
                    onChange={(e) => setForm({ ...form, blacklistReason: e.target.value })}
                    className="w-full px-3.5 py-2 border border-rose-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm bg-rose-50/20"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/jobseekers"
            className="py-2.5 px-5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/10 transition-colors text-sm disabled:bg-slate-300 disabled:shadow-none"
          >
            {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{submitting ? 'Saving...' : 'Save Jobseeker Profile'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
export default AddJobseeker;
