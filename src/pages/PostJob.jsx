import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import {
  Briefcase,
  MapPin,
  Building,
  FileText,
  Save,
  Loader,
  AlertCircle,
  CheckCircle,
  ClipboardList,
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
    if (!id) { setLoading(false); return; }
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
        setTimeout(() => navigate('/admin/jobs'), 1500);
      } else {
        await axios.post(`${BASE_API_URL}/jobs`, form);
        showMessage('success', 'Job posted successfully.');
        setTimeout(() => navigate('/admin/jobs'), 1500);
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

  const inputCls = "w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm disabled:bg-slate-50";
  const labelCls = "block text-sm font-medium text-slate-600 mb-1";

  const tabs = [
    { key: 'basic',     label: 'Basic Details',    icon: <Briefcase className="w-4 h-4" /> },
    { key: 'detail',    label: 'Job Requirements', icon: <FileText className="w-4 h-4" /> },
    { key: 'location',  label: 'Job Location',     icon: <MapPin className="w-4 h-4" /> },
    { key: 'company',   label: 'Company Details',  icon: <Building className="w-4 h-4" /> },
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
        <h4 className="text-xl font-bold text-slate-800">Jobs</h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="text-indigo-600">{id ? 'Edit Job' : 'Post Job'}</span>
        </div>
      </div>

      {/* Card  */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-base font-bold text-slate-800">
            {id ? 'Edit Job Posting' : 'Post New Job Opening'}
          </h4>
          <Link
            to="/admin/jobs"
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

            {/* Tab 1: Basic Details */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  Basic Details
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className={labelCls}>Job Posting Date</label>
                    <input type="date" value={form.postingDate}
                      onChange={(e) => setForm({ ...form, postingDate: e.target.value })}
                      className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Job Title <span className="text-rose-500">*</span></label>
                    <input type="text" required placeholder="e.g. Senior Node.js Developer"
                      value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                      className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Job Category <span className="text-rose-500">*</span></label>
                    <select required value={form.jobCategory}
                      onChange={(e) => setForm({ ...form, jobCategory: e.target.value })} className={inputCls}>
                      <option value="">-- Choose Category --</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Job Type <span className="text-rose-500">*</span></label>
                    <select required value={form.jobType}
                      onChange={(e) => setForm({ ...form, jobType: e.target.value })} className={inputCls}>
                      <option value="">-- Choose Type --</option>
                      {jobTypes.map(t => (
                        <option key={t._id} value={t._id}>{t.jobType}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>No. of Vacancies <span className="text-rose-500">*</span></label>
                    <input type="number" required min="1" value={form.vacancies}
                      onChange={(e) => setForm({ ...form, vacancies: parseInt(e.target.value) || 1 })}
                      className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Work Mode</label>
                    <select value={form.workMode}
                      onChange={(e) => setForm({ ...form, workMode: e.target.value })} className={inputCls}>
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
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Description & Requirements
                </h5>
                <div className="space-y-4">

                  <div>
                    <label className={labelCls}>Job Description <span className="text-rose-500">*</span></label>
                    <textarea required rows="6"
                      placeholder="Outline roles, responsibilities, required skills, and daily tasks..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className={inputCls + " font-sans"} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <label className={labelCls}>Required Qualification</label>
                      <select value={form.qualification}
                        onChange={(e) => setForm({ ...form, qualification: e.target.value })} className={inputCls}>
                        <option value="">-- Choose Qualification --</option>
                        {qualifications.map(q => (
                          <option key={q._id} value={q._id}>{q.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Required Experience <span className="text-rose-500">*</span></label>
                      <select value={form.experience}
                        onChange={(e) => setForm({ ...form, experience: e.target.value })} className={inputCls}>
                        <option value="Fresher">Fresher</option>
                        <option value="1-2 Years">1-2 Years</option>
                        <option value="2-3 Years">2-3 Years</option>
                        <option value="3+ Years">3+ Years</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Salary (Rs. / Year or Range)</label>
                      <input type="text" placeholder="e.g. 5,00,000 - 8,00,000"
                        value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })}
                        className={inputCls} />
                    </div>

                    <div>
                      <label className={labelCls}>Salary Negotiable?</label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                          <input type="radio" name="negotiable"
                            checked={form.salaryNegotiable === true}
                            onChange={() => setForm({ ...form, salaryNegotiable: true })}
                            className="text-indigo-600 focus:ring-indigo-500" />
                          Yes
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                          <input type="radio" name="negotiable"
                            checked={form.salaryNegotiable === false}
                            onChange={() => setForm({ ...form, salaryNegotiable: false })}
                            className="text-indigo-600 focus:ring-indigo-500" />
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
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  Job Location
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className={labelCls}>Country <span className="text-rose-500">*</span></label>
                    <select required value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value, state: '', district: '', city: '' })} className={inputCls}>
                      <option value="">-- Choose Country --</option>
                      {countries.map(c => (
                        <option key={c.cid} value={c.cid}>{c.countryName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>State <span className="text-rose-500">*</span></label>
                    <select required disabled={!form.country} value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value, district: '', city: '' })} className={inputCls}>
                      <option value="">-- Choose State --</option>
                      {availableStates.map(s => (
                        <option key={s.sid} value={s.sid}>{s.stateName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>District <span className="text-rose-500">*</span></label>
                    <select required disabled={!form.state} value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value, city: '' })} className={inputCls}>
                      <option value="">-- Choose District --</option>
                      {availableDistricts.map(d => (
                        <option key={d.did} value={d.did}>{d.districtName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>City <span className="text-rose-500">*</span></label>
                    <select required disabled={!form.district} value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls}>
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
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <Building className="w-4 h-4 text-slate-500" />
                  Company Details
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className={labelCls}>Company Name <span className="text-rose-500">*</span></label>
                    <input type="text" required placeholder="e.g. Duke Infosys"
                      value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Contact Person Name</label>
                    <input type="text" placeholder="e.g. John Doe"
                      value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                      className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Contact Email <span className="text-rose-500">*</span></label>
                    <input type="email" required placeholder="recruitment@company.com"
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Contact Phone <span className="text-rose-500">*</span></label>
                    <input type="text" required placeholder="+91 9876543210"
                      value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Campaign Document Link</label>
                    <input type="text" placeholder="https://company-docs.com/job-flyer.pdf"
                      value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })}
                      className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Publishing Status</label>
                    <select value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="closed">Closed / Expired</option>
                    </select>
                  </div>

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

export default PostJob;
