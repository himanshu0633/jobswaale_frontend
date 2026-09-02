import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';
import PageSkeleton from '../../../components/SkeletonLoader';
import {
  AlertCircle,
  Briefcase,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  FileText,
  Loader,
  MapPin,
  Save,
} from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];
const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

const emptyForm = {
  postingDate: today(),
  jobTitle: '',
  jobCategory: '',
  jobType: '',
  vacancies: '',
  workMode: 'Onsite',
  jobLocations: '',
  description: '',
  jobSummary: '',
  detailedDescription: '',
  responsibilities: '',
  qualification: '',
  experience: '',
  requiredExperience: '',
  salary: '',
  minSalary: '',
  maxSalary: '',
  salaryUnit: 'P.A.',
  salaryNegotiable: true,
  noticePeriod: '',
  joiningDate: '',
  shiftTiming: '',
  jobExpiry: '',
  benefits: '',
  aboutCompany: '',
  skills: '',
  languages: '',
  candidateLocationPreference: 'Open to all locations',
  screeningQuestions: '',
  publishStatus: 'publish',
  country: '',
  state: '',
  district: '',
  city: '',
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  currentPlan: '',
  planValidity: '',
  document: '',
  status: 'active',
  blacklistReason: '',
};

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'featured', label: 'Featured' },
  { value: 'blacklist', label: 'Blacklist' },
];

export const PostJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [categories, setCategories] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const inputCls = 'w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400';
  const labelCls = 'block text-xs font-bold text-slate-600 mb-2';

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const fetchMasters = async () => {
    const [resC, resT, resQ, resCo, resS, resD, resCt, resP] = await Promise.all([
      axios.get(`${BASE_API_URL}/masters/job-categories`),
      axios.get(`${BASE_API_URL}/masters/job-types`),
      axios.get(`${BASE_API_URL}/masters/qualifications`),
      axios.get(`${BASE_API_URL}/masters/countries`),
      axios.get(`${BASE_API_URL}/masters/states`),
      axios.get(`${BASE_API_URL}/masters/districts`),
      axios.get(`${BASE_API_URL}/masters/cities`),
      axios.get(`${BASE_API_URL}/masters/plans?limit=1000`),
    ]);
    setCategories(Array.isArray(resC.data) ? resC.data : resC.data.docs || []);
    setJobTypes(Array.isArray(resT.data) ? resT.data : resT.data.docs || []);
    setQualifications(Array.isArray(resQ.data) ? resQ.data : resQ.data.docs || []);
    setCountries(Array.isArray(resCo.data) ? resCo.data : resCo.data.docs || []);
    setStates(Array.isArray(resS.data) ? resS.data : resS.data.docs || []);
    setDistricts(Array.isArray(resD.data) ? resD.data : resD.data.docs || []);
    setCities(Array.isArray(resCt.data) ? resCt.data : resCt.data.docs || []);
    const planRows = Array.isArray(resP.data) ? resP.data : resP.data.docs || [];
    setPlans(planRows.filter((plan) => plan.status !== 'inactive'));
    return {
      categories: Array.isArray(resC.data) ? resC.data : resC.data.docs || [],
      jobTypes: Array.isArray(resT.data) ? resT.data : resT.data.docs || [],
      qualifications: Array.isArray(resQ.data) ? resQ.data : resQ.data.docs || [],
      countries: Array.isArray(resCo.data) ? resCo.data : resCo.data.docs || [],
      states: Array.isArray(resS.data) ? resS.data : resS.data.docs || [],
      districts: Array.isArray(resD.data) ? resD.data : resD.data.docs || [],
      cities: Array.isArray(resCt.data) ? resCt.data : resCt.data.docs || [],
      plans: planRows.filter((plan) => plan.status !== 'inactive'),
    };
  };

  const fetchExisting = async (masters = {}) => {
    if (!id) return;
    const response = await axios.get(`${BASE_API_URL}/jobs/${id}?raw=1`);
    const job = response.data?.job || response.data;
    if (!job) {
      showMessage('error', 'Job posting not found.');
      return;
    }
    const countryRow = (masters.countries || []).find((item) => item.cid === job.country || item.countryName === job.country);
    const stateRow = (masters.states || []).find((item) => item.sid === job.state || item.stateName === job.state);
    const districtRow = (masters.districts || []).find((item) => item.did === job.district || item.districtName === job.district);
    setForm({
      postingDate: toDateInput(job.postingDate) || today(),
      jobTitle: job.jobTitle || '',
      jobCategory: job.jobCategory?._id || job.jobCategory || '',
      jobType: job.jobType?._id || job.jobType || '',
      vacancies: String(job.vacancies || ''),
      workMode: job.workMode || 'Onsite',
      jobLocations: Array.isArray(job.jobLocations) ? job.jobLocations.join(', ') : job.jobLocations || '',
      description: job.description || '',
      jobSummary: job.jobSummary || '',
      detailedDescription: job.detailedDescription || job.description || '',
      responsibilities: job.responsibilities || '',
      qualification: job.qualification?._id || job.qualification || '',
      experience: job.experience || '',
      requiredExperience: job.requiredExperience || job.experience || '',
      salary: job.salary || '',
      minSalary: job.minSalary ?? '',
      maxSalary: job.maxSalary ?? '',
      salaryUnit: job.salaryUnit || 'P.A.',
      salaryNegotiable: Boolean(job.salaryNegotiable),
      noticePeriod: job.noticePeriod || '',
      joiningDate: toDateInput(job.joiningDate),
      shiftTiming: job.shiftTiming || '',
      jobExpiry: toDateInput(job.jobExpiry),
      benefits: job.benefits || '',
      aboutCompany: job.aboutCompany || '',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills || '',
      languages: Array.isArray(job.languages) ? job.languages.join(', ') : job.languages || '',
      candidateLocationPreference: job.candidateLocationPreference || 'Open to all locations',
      screeningQuestions: job.screeningQuestions || '',
      publishStatus: job.publishStatus || 'publish',
      country: countryRow?.cid || job.country || '',
      state: stateRow?.sid || job.state || '',
      district: districtRow?.did || job.district || '',
      city: job.city || '',
      companyName: job.companyName || '',
      contactPerson: job.contactPerson || '',
      email: job.email || '',
      phone: job.phone || '',
      currentPlan: job.currentPlan?._id || job.currentPlan || '',
      planValidity: toDateInput(job.planValidity),
      document: job.document || '',
      status: job.status || 'active',
      blacklistReason: job.blacklistReason || '',
    });
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const masters = await fetchMasters();
        await fetchExisting(masters);
      } catch (err) {
        console.error(err);
        showMessage('error', 'Error loading job form data.');
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [id]);

  const availableStates = form.country ? states.filter((item) => item.cid === form.country) : [];
  const availableDistricts = form.state ? districts.filter((item) => item.sid === form.state) : [];
  const availableCities = form.district ? cities.filter((item) => item.did === form.district) : [];
  const selectedPlan = plans.find((plan) => plan._id === form.currentPlan);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.jobTitle || !form.jobCategory || !form.jobType || !form.vacancies || !form.description || !form.experience || !form.country || !form.state || !form.district || !form.city || !form.companyName || !form.email || !form.phone || !form.status) {
      showMessage('error', 'Please fill in all required job details.');
      return;
    }
    if (form.status === 'blacklist' && !form.blacklistReason.trim()) {
      showMessage('error', 'Please write a reason for blacklist.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        vacancies: Number(form.vacancies) || 0,
        currentPlan: form.currentPlan || null,
        planValidity: form.planValidity || null,
        qualification: form.qualification || null,
        description: form.detailedDescription || form.description,
        detailedDescription: form.detailedDescription || form.description,
        experience: form.requiredExperience || form.experience,
        requiredExperience: form.requiredExperience || form.experience,
        minSalary: form.minSalary === '' ? null : Number(form.minSalary),
        maxSalary: form.maxSalary === '' ? null : Number(form.maxSalary),
        joiningDate: form.joiningDate || null,
        jobExpiry: form.jobExpiry || null,
        jobLocations: String(form.jobLocations || '').split(',').map((item) => item.trim()).filter(Boolean),
        skills: String(form.skills || '').split(',').map((item) => item.trim()).filter(Boolean),
        languages: String(form.languages || '').split(',').map((item) => item.trim()).filter(Boolean),
      };
      if (id) {
        await axios.put(`${BASE_API_URL}/jobs/${id}`, payload);
        showMessage('success', 'Success! Record added/updated successfully.');
      } else {
        await axios.post(`${BASE_API_URL}/jobs`, payload);
        showMessage('success', 'Success! Record added/updated successfully.');
      }
      setTimeout(() => navigate('/admin/jobs'), 1200);
    } catch (err) {
      console.error(err);
      showMessage('error', err.response?.data?.message || 'Oops! Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-slate-800">Jobs</h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 text-[0.9rem]">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="text-indigo-600">Add Jobs</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden -ml-3 lg:-ml-5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h4 className="text-base font-bold text-slate-800">Add/Update Job</h4>
          <Link to="/admin/jobs" className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors">
            <ClipboardList className="w-3.5 h-3.5" />
            View Listings
          </Link>
        </div>

        <div className="p-5">
          {message.text && (
            <div className={`mb-4 flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
              <div className="space-y-4">
                <SectionTitle icon={<Briefcase className="w-4 h-4" />} label="Basic Information" />
                <div className="grid gap-4 md:grid-cols-12">
                  <Field className="md:col-span-4" label="Job Posting Date">
                    <input type="date" value={form.postingDate} onChange={(e) => setValue('postingDate', e.target.value)} className={inputCls} />
                  </Field>
                  <Field className="md:col-span-12" label="Job Title" required>
                    <input type="text" value={form.jobTitle} onChange={(e) => setValue('jobTitle', e.target.value)} placeholder="Job Title" className={inputCls} />
                  </Field>
                  <Field className="md:col-span-6" label="Job Category" required>
                    <select value={form.jobCategory} onChange={(e) => setValue('jobCategory', e.target.value)} className={inputCls}>
                      <option value="">Choose</option>
                      {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.categoryName}</option>)}
                    </select>
                  </Field>
                  <Field className="md:col-span-6" label="Job Type" required>
                    <select value={form.jobType} onChange={(e) => setValue('jobType', e.target.value)} className={inputCls}>
                      <option value="">Choose</option>
                      {jobTypes.map((type) => <option key={type._id} value={type._id}>{type.jobType}</option>)}
                    </select>
                  </Field>
                  <Field className="md:col-span-6" label="No of Vacancies" required>
                    <input type="number" min="1" value={form.vacancies} onChange={(e) => setValue('vacancies', e.target.value)} placeholder="No of Vacancies" className={inputCls} />
                  </Field>
                  <Field className="md:col-span-6" label="Work Mode">
                    <select value={form.workMode} onChange={(e) => setValue('workMode', e.target.value)} className={inputCls}>
                      <option value="Onsite">Onsite</option>
                      <option value="Office">Office</option>
                      <option value="Remote">Remote</option>
                      <option value="Work from Home">Work from Home</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </Field>
                </div>

                <SectionTitle icon={<Briefcase className="w-4 h-4" />} label="Job Detail" />
                <div className="grid gap-4 md:grid-cols-12">
                  <Field className="md:col-span-12" label="Short Summary">
                    <textarea value={form.jobSummary} onChange={(e) => setValue('jobSummary', e.target.value)} rows={3} placeholder="Short summary for candidates" className={inputCls} />
                  </Field>
                  <Field className="md:col-span-12" label="Job Description" required>
                    <textarea value={form.detailedDescription || form.description} onChange={(e) => { setValue('detailedDescription', e.target.value); setValue('description', e.target.value); }} rows={7} placeholder="Write job description" className={inputCls} />
                  </Field>
                  <Field className="md:col-span-12" label="Responsibilities">
                    <textarea value={form.responsibilities} onChange={(e) => setValue('responsibilities', e.target.value)} rows={5} placeholder="Responsibilities" className={inputCls} />
                  </Field>
                  <Field className="md:col-span-6" label="Qualification">
                    <select value={form.qualification} onChange={(e) => setValue('qualification', e.target.value)} className={inputCls}>
                      <option value="">Choose</option>
                      {qualifications.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                    </select>
                  </Field>
                  <Field className="md:col-span-6" label="Required Experience" required>
                    <select value={form.requiredExperience || form.experience} onChange={(e) => { setValue('requiredExperience', e.target.value); setValue('experience', e.target.value); }} className={inputCls}>
                      <option value="">Choose</option>
                      <option>Fresher</option>
                      {Array.from({ length: 10 }, (_, index) => <option key={index + 1}>{index + 1}+ Years</option>)}
                    </select>
                  </Field>
                  <Field className="md:col-span-6" label="Salary (Rs.)">
                    <select value={form.salary} onChange={(e) => setValue('salary', e.target.value)} className={inputCls}>
                      <option value="">Choose</option>
                      <option>20000 - 30000</option>
                      <option>30000 - 50000</option>
                      <option>More Than 50000</option>
                    </select>
                  </Field>
                  <Field className="md:col-span-6" label="Salary Negotiable?">
                    <div className="flex items-center gap-5 h-10">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-600"><input type="radio" name="salaryNegotiable" checked={form.salaryNegotiable} onChange={() => setValue('salaryNegotiable', true)} /> Yes</label>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-600"><input type="radio" name="salaryNegotiable" checked={!form.salaryNegotiable} onChange={() => setValue('salaryNegotiable', false)} /> No</label>
                    </div>
                  </Field>
                  <Field className="md:col-span-4" label="Min Salary">
                    <input type="number" value={form.minSalary} onChange={(e) => setValue('minSalary', e.target.value)} placeholder="Min Salary" className={inputCls} />
                  </Field>
                  <Field className="md:col-span-4" label="Max Salary">
                    <input type="number" value={form.maxSalary} onChange={(e) => setValue('maxSalary', e.target.value)} placeholder="Max Salary" className={inputCls} />
                  </Field>
                  <Field className="md:col-span-4" label="Salary Unit">
                    <select value={form.salaryUnit} onChange={(e) => setValue('salaryUnit', e.target.value)} className={inputCls}>
                      <option>P.A.</option>
                      <option>Monthly</option>
                    </select>
                  </Field>
                </div>

                <SectionTitle icon={<MapPin className="w-4 h-4" />} label="Job Location" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Country" required>
                    <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value, state: '', district: '', city: '' })} className={inputCls}>
                      <option value="">Choose</option>
                      {countries.map((item) => <option key={item.cid} value={item.cid}>{item.countryName}</option>)}
                    </select>
                  </Field>
                  <Field label="State" required>
                    <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value, district: '', city: '' })} disabled={!form.country} className={inputCls}>
                      <option value="">Choose</option>
                      {availableStates.map((item) => <option key={item.sid} value={item.sid}>{item.stateName}</option>)}
                    </select>
                  </Field>
                  <Field label="District" required>
                    <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value, city: '' })} disabled={!form.state} className={inputCls}>
                      <option value="">Choose</option>
                      {availableDistricts.map((item) => <option key={item.did} value={item.did}>{item.districtName}</option>)}
                    </select>
                  </Field>
                  <Field label="City" required>
                    <select value={form.city} onChange={(e) => setValue('city', e.target.value)} disabled={!form.district} className={inputCls}>
                      <option value="">Choose</option>
                      {availableCities.map((item) => <option key={item.ctid} value={item.cityName}>{item.cityName}</option>)}
                    </select>
                  </Field>
                  <Field className="md:col-span-2" label="Job Locations">
                    <input type="text" value={form.jobLocations} onChange={(e) => setValue('jobLocations', e.target.value)} placeholder="City 1, City 2" className={inputCls} />
                  </Field>
                </div>

                <SectionTitle icon={<FileText className="w-4 h-4" />} label="Requirements & Timing" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Notice Period">
                    <select value={form.noticePeriod} onChange={(e) => setValue('noticePeriod', e.target.value)} className={inputCls}>
                      <option value="">Choose</option>
                      <option>Immediate</option>
                      <option>15 Days</option>
                      <option>30 Days</option>
                      <option>60 Days</option>
                    </select>
                  </Field>
                  <Field label="Date of Joining">
                    <input type="date" value={form.joiningDate} onChange={(e) => setValue('joiningDate', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Shift Timings">
                    <select value={form.shiftTiming} onChange={(e) => setValue('shiftTiming', e.target.value)} className={inputCls}>
                      <option value="">Choose</option>
                      <option>Day Shift</option>
                      <option>Night Shift</option>
                      <option>Rotational Shift</option>
                    </select>
                  </Field>
                  <Field label="Job Expiry">
                    <input type="date" value={form.jobExpiry} onChange={(e) => setValue('jobExpiry', e.target.value)} className={inputCls} />
                  </Field>
                  <Field className="md:col-span-2" label="Benefits & Perks">
                    <input type="text" value={form.benefits} onChange={(e) => setValue('benefits', e.target.value)} placeholder="PF, Health Insurance, Bonus" className={inputCls} />
                  </Field>
                  <Field className="md:col-span-2" label="Key Skills">
                    <input type="text" value={form.skills} onChange={(e) => setValue('skills', e.target.value)} placeholder="JavaScript, React.js, HTML" className={inputCls} />
                  </Field>
                  <Field label="Language Preference">
                    <input type="text" value={form.languages} onChange={(e) => setValue('languages', e.target.value)} placeholder="English, Hindi" className={inputCls} />
                  </Field>
                  <Field label="Candidate Location Preference">
                    <select value={form.candidateLocationPreference} onChange={(e) => setValue('candidateLocationPreference', e.target.value)} className={inputCls}>
                      <option>Open to all locations</option>
                      <option>Same city only</option>
                      <option>Same state only</option>
                    </select>
                  </Field>
                  <Field className="md:col-span-2" label="Screening Questions">
                    <textarea value={form.screeningQuestions} onChange={(e) => setValue('screeningQuestions', e.target.value)} rows={4} className={inputCls} />
                  </Field>
                  <Field className="md:col-span-2" label="About Company">
                    <textarea value={form.aboutCompany} onChange={(e) => setValue('aboutCompany', e.target.value)} rows={3} className={inputCls} />
                  </Field>
                </div>

                <SectionTitle icon={<Briefcase className="w-4 h-4" />} label="Company Detail" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Company Name" required>
                    <input type="text" value={form.companyName} onChange={(e) => setValue('companyName', e.target.value)} placeholder="Name of Company" className={inputCls} />
                  </Field>
                  <Field label="Contact Person">
                    <input type="text" value={form.contactPerson} onChange={(e) => setValue('contactPerson', e.target.value)} placeholder="Contact Person" className={inputCls} />
                  </Field>
                  <Field label="Email" required>
                    <input type="email" value={form.email} onChange={(e) => setValue('email', e.target.value)} placeholder="Email" className={inputCls} />
                  </Field>
                  <Field label="Phone" required>
                    <input type="text" value={form.phone} onChange={(e) => setValue('phone', e.target.value)} placeholder="Phone Number" className={inputCls} />
                  </Field>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
                  <h5 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4"><CalendarDays className="w-4 h-4" /> Subscription Detail</h5>
                  <div className="space-y-4">
                    <Field label="Current Plan">
                      <select value={form.currentPlan} onChange={(e) => setValue('currentPlan', e.target.value)} className={inputCls}>
                        <option value="">Choose</option>
                        {plans.map((plan) => <option key={plan._id} value={plan._id}>{plan.planName} - {Number(plan.cost || 0)}</option>)}
                      </select>
                    </Field>
                    {selectedPlan?.features?.length > 0 && (
                      <ul className="space-y-1 text-xs font-semibold text-slate-600">
                        {selectedPlan.features.slice(0, 4).map((feature) => <li key={feature._id} className="text-emerald-700">✓ {feature.featureName || feature.name}</li>)}
                      </ul>
                    )}
                    <Field label="Plan Validity">
                      <input type="date" value={form.planValidity} onChange={(e) => setValue('planValidity', e.target.value)} className={inputCls} />
                    </Field>
                    {form.planValidity && <p className="text-sm font-bold text-emerald-600">Valid Till : {new Date(form.planValidity).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>}
                  </div>
                </div>

                <SectionTitle icon={<FileText className="w-4 h-4" />} label="Other Detail" />
                <Field label="Upload document">
                  <input type="file" onChange={(e) => setValue('document', e.target.files?.[0]?.name || '')} className={inputCls} />
                  {form.document && <span className="mt-1 block text-xs font-semibold text-indigo-600">View Document: {form.document}</span>}
                </Field>
                <Field label="Status" required>
                  <select value={form.status} onChange={(e) => setValue('status', e.target.value)} className={inputCls}>
                    {statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </Field>
                <Field label="Publish Status">
                  <select value={form.publishStatus} onChange={(e) => setValue('publishStatus', e.target.value)} className={inputCls}>
                    <option value="publish">Publish Immediately</option>
                    <option value="draft">Save as Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </Field>
                <Field label="Reson for Blacklist" required={form.status === 'blacklist'}>
                  <textarea value={form.blacklistReason} onChange={(e) => setValue('blacklistReason', e.target.value)} rows={4} placeholder="Write a Reason" className={inputCls} />
                </Field>
              </div>
            </div>

            <div className="mt-5">
              <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-60">
                {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, required = false, className = '', children }) => (
  <div className={className}>
    <label className="block text-xs font-bold text-slate-600 mb-2">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const SectionTitle = ({ icon, label }) => (
  <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-bold px-3 py-3 rounded-lg">
    {icon}
    {label}
  </h5>
);

export default PostJob;
