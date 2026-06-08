import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import { 
  Building, 
  MapPin, 
  CreditCard, 
  FileText, 
  ArrowLeft, 
  Save, 
  Loader,
  AlertCircle,
  CheckCircle 
} from 'lucide-react';

export const AddEmployer = () => {
  const { id } = useParams(); // Profile ID if editing
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
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${BASE_API_URL}/employers`);
      const emp = response.data.find(x => x._id === id);
      if (emp) {
        setForm({
          email: emp.userId?.email || '',
          password: '', // Leave blank when editing
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

    // Validations
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
        // Update profile details
        await axios.put(`${BASE_API_URL}/employers/${id}`, form);
        showMessage('success', 'Employer profile updated successfully.');
        setTimeout(() => navigate('/employers'), 1500);
      } else {
        // Create new login and profile
        await axios.post(`${BASE_API_URL}/employers`, form);
        showMessage('success', 'Employer registered successfully.');
        setTimeout(() => navigate('/employers'), 1500);
      }
    } catch (err) {
      console.error(err);
      showMessage('error', err.response?.data?.message || 'Error saving employer details.');
    } finally {
      setSubmitting(false);
    }
  };

  // Cascading lists based on form selections
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
          to="/employers"
          className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            {id ? 'Modify Employer Details' : 'Register New Employer'}
          </h1>
          <p className="text-sm text-slate-500">
            {id ? 'Update company credentials and status limits.' : 'Create login credentials and link company profile.'}
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
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'company' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building className="w-4 h-4" />
          Company Details
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
        
        {/* Tab 1: Company Details */}
        {activeTab === 'company' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Credentials & Contact Info</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  disabled={!!id}
                  placeholder="name@company.com"
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
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Duke Infosys"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
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
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Industry Type <span className="text-rose-500">*</span>
                </label>
                <select
                  required
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

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Website URL
                </label>
                <input
                  type="text"
                  placeholder="www.company.com"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Company Description
                </label>
                <textarea
                  rows="4"
                  placeholder="Describe your company services or product offerings..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  Office Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Plot/Floor No, Sector/Building Name"
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
                  placeholder="e.g. 110001"
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
                  {plans.filter(p => p.category === 'Employer').map(p => (
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
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Company Brand & Blacklist Status</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Logo URL / File Link
                </label>
                <input
                  type="text"
                  placeholder="https://image-server.com/logo.png"
                  value={form.logo}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
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
                    placeholder="Specify the reason why this corporate employer is being blacklisted..."
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
            to="/employers"
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
            <span>{submitting ? 'Saving...' : 'Save Employer Profile'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
export default AddEmployer;
