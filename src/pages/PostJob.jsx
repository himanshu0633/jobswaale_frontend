import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import { 
  Briefcase, 
  MapPin, 
  Building, 
  FileText, 
  ArrowLeft, 
  Save, 
  Loader,
  AlertCircle,
  CheckCircle 
} from 'lucide-react';

export const PostJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Masters
  const [categories, setCategories] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  // Form State
  const [form, setForm] = useState({
    postingDate: new Date().toISOString().split('T')[0],
    jobTitle: '',
    jobCategory: '',
    jobType: '',
    vacancies: 1,
    workMode: 'Onsite',
    description: '',
    qualification: '',
    experience: 'Fresher',
    salary: '',
    salaryNegotiable: false,
    country: '',
    state: '',
    district: '',
    city: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    document: '',
    status: 'active'
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchMasters = async () => {
    try {
      const [resC, resT, resQ, resCo, resS, resD, resCt] = await Promise.all([
        axios.get(`${BASE_API_URL}/masters/job-categories`),
        axios.get(`${BASE_API_URL}/masters/job-types`),
        axios.get(`${BASE_API_URL}/masters/qualifications`),
        axios.get(`${BASE_API_URL}/masters/countries`),
        axios.get(`${BASE_API_URL}/masters/states`),
        axios.get(`${BASE_API_URL}/masters/districts`),
        axios.get(`${BASE_API_URL}/masters/cities`)
      ]);
      setCategories(resC.data);
      setJobTypes(resT.data);
      setQualifications(resQ.data);
      setCountries(resCo.data);
      setStates(resS.data);
      setDistricts(resD.data);
      setCities(resCt.data);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error loading master data listings.');
    }
  };

  const fetchExisting = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${BASE_API_URL}/jobs`);
      const job = response.data.find(x => x._id === id);
      if (job) {
        setForm({
          postingDate: job.postingDate ? new Date(job.postingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          jobTitle: job.jobTitle || '',
          jobCategory: job.jobCategory?._id || job.jobCategory || '',
          jobType: job.jobType?._id || job.jobType || '',
          vacancies: job.vacancies || 1,
          workMode: job.workMode || 'Onsite',
          description: job.description || '',
          qualification: job.qualification?._id || job.qualification || '',
          experience: job.experience || 'Fresher',
          salary: job.salary || '',
          salaryNegotiable: job.salaryNegotiable || false,
          country: job.country || '',
          state: job.state || '',
          district: job.district || '',
          city: job.city || '',
          companyName: job.companyName || '',
          contactPerson: job.contactPerson || '',
          email: job.email || '',
          phone: job.phone || '',
          document: job.document || '',
          status: job.status || 'active'
        });
      } else {
        showMessage('error', 'Job posting not found.');
      }
    } catch (err) {
      console.error(err);
      showMessage('error', 'Failed to retrieve job details.');
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

    if (!form.jobTitle || !form.jobCategory || !form.jobType || !form.vacancies || !form.description || !form.experience || !form.country || !form.state || !form.district || !form.city || !form.companyName || !form.email || !form.phone) {
      showMessage('error', 'Please fill in all required job details.');
      return;
    }

    setSubmitting(true);
    try {
      if (id) {
        await axios.put(`${BASE_API_URL}/jobs/${id}`, form);
        showMessage('success', 'Job posting updated successfully.');
        setTimeout(() => navigate('/jobs'), 1500);
      } else {
        await axios.post(`${BASE_API_URL}/jobs`, form);
        showMessage('success', 'Job posted successfully.');
        setTimeout(() => navigate('/jobs'), 1500);
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
          to="/jobs"
          className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            {id ? 'Modify Job Posting' : 'Post New Job Opening'}
          </h1>
          <p className="text-sm text-slate-500">
            {id ? 'Update campaign details, vacancies, or requirements.' : 'Define job requirements, location and company details.'}
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
          onClick={() => setActiveTab('basic')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'basic' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Basic Details
        </button>
        <button
          onClick={() => setActiveTab('detail')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'detail' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Job Requirements
        </button>
        <button
          onClick={() => setActiveTab('location')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'location' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Job Location
        </button>
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
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="border border-slate-200 bg-white rounded-b-2xl shadow-sm p-6 space-y-6">
        
        {/* Tab 1: Basic Details */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Campaign Meta</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Job Posting Date
                </label>
                <input
                  type="date"
                  value={form.postingDate}
                  onChange={(e) => setForm({ ...form, postingDate: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Node.js Developer"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Job Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={form.jobCategory}
                  onChange={(e) => setForm({ ...form, jobCategory: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Job Type <span className="text-rose-500">*</span>
                </label>
                <select
                  required
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
                  No of Vacancies <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.vacancies}
                  onChange={(e) => setForm({ ...form, vacancies: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Work Mode
                </label>
                <select
                  value={form.workMode}
                  onChange={(e) => setForm({ ...form, workMode: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="Onsite">Onsite</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Job Requirements */}
        {activeTab === 'detail' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Description & Skills</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Job Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows="6"
                  placeholder="Outline roles, responsibilities, required skills, and daily tasks..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-sans"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Required Qualification
                  </label>
                  <select
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
                    Required Experience <span className="text-rose-500">*</span>
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
                    Salary (Rs. / Year or Range)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5,00,000 - 8,00,000"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Salary Negotiable?
                  </label>
                  <div className="flex gap-4 mt-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="negotiable"
                        checked={form.salaryNegotiable === true}
                        onChange={() => setForm({ ...form, salaryNegotiable: true })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="negotiable"
                        checked={form.salaryNegotiable === false}
                        onChange={() => setForm({ ...form, salaryNegotiable: false })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Job Location */}
        {activeTab === 'location' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Geographic Location Target</h3>
            
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
            </div>
          </div>
        )}

        {/* Tab 4: Company Details */}
        {activeTab === 'company' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Employer Profile Details</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
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
                  Contact Person Name
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
                  Contact Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="recruitment@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Contact Phone Number <span className="text-rose-500">*</span>
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
                  Campaign Document Link (optional)
                </label>
                <input
                  type="text"
                  placeholder="https://company-docs.com/job-flyer.pdf"
                  value={form.document}
                  onChange={(e) => setForm({ ...form, document: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Publishing Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="closed">Closed / Expired</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/jobs"
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
            <span>{submitting ? 'Saving...' : 'Save Job Posting'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
export default PostJob;
