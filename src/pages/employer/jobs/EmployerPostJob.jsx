import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  ChevronRight,
  ClipboardList,
  Info,
  Loader,
  MapPin,
  Pencil,
  Save,
  Send,
  ShieldCheck,
  Tags
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const today = () => new Date().toISOString().split('T')[0];
const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

const steps = [
  { title: 'Job Details', subtitle: 'Basic information' },
  { title: 'Job Description', subtitle: 'Role and responsibilities' },
  { title: 'Requirements', subtitle: 'Skills and experience' },
  { title: 'Preview & Publish', subtitle: 'Review and publish' }
];

const emptyForm = {
  jobTitle: '',
  jobCategory: '',
  jobType: '',
  experience: '',
  workMode: 'Office',
  country: '',
  state: '',
  district: '',
  location: [],
  vacancies: '',
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
  jobSummary: '',
  description: '',
  responsibilities: '',
  qualification: '',
  requiredExperience: '',
  skills: 'JavaScript, React.js, HTML, CSS',
  language: 'English, Hindi',
  candidateLocation: 'Open to all locations',
  screeningQuestions: '',
  publishStatus: 'publish'
};

const emptyPreview = {
  title: 'Software Developer',
  companyName: 'Employer',
  companyLogo: '',
  location: 'Bangalore, Karnataka',
  employmentType: 'Full Time',
  experience: '2 - 5 Years',
  salary: 'Salary not specified',
  workMode: 'Office',
  openings: 2,
  skills: ['JavaScript', 'React.js', 'HTML', 'CSS'],
  description: 'Write a concise summary for candidates.'
};

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getAssetUrl = (value) => {
  if (!value) return '';
  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:')) return value;
  const apiOrigin = BASE_API_URL.replace(/\/api\/?$/, '');
  return `${apiOrigin}${value.startsWith('/') ? '' : '/'}${value}`;
};

const SearchableSelect = ({ label, value, options, search, onSearch, onSelect, placeholder, disabled, invalid }) => {
  const [isOpen, setIsOpen] = useState(false);
  const filteredOptions = options.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()));
  const selectedOption = options.find((item) => item.value === value);
  const displayValue = isOpen ? search : selectedOption?.name || '';

  return (
    <div>
      <label className="mb-1.5 block text-xs font-extrabold text-slate-600">{label}</label>
      <div className={`rounded-md border bg-white p-2 ${invalid ? '!border-rose-500 !ring-2 !ring-rose-200' : 'border-slate-200'} ${disabled ? 'opacity-60' : ''}`}>
        <input
          className={`w-full rounded-md border bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100 ${invalid ? '!border-rose-400 !bg-rose-50' : 'border-slate-200'}`}
          value={displayValue}
          onChange={(e) => {
            onSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          placeholder={selectedOption?.name || placeholder}
          disabled={disabled}
        />
        {!disabled && isOpen && (
          <div className="mt-2 max-h-36 overflow-y-auto rounded-md border border-slate-100">
            {filteredOptions.length ? filteredOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(item.value);
                  onSearch('');
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm font-bold transition hover:bg-indigo-50 ${value === item.value ? 'bg-indigo-50 text-[#6658dd]' : 'text-slate-600'}`}
              >
                <span>{item.name}</span>
                {value === item.value && <Check className="h-4 w-4" />}
              </button>
            )) : (
              <div className="px-3 py-3 text-sm font-semibold text-slate-400">No records found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const EmployerPostJob = () => {
  const navigate = useNavigate();
  const { id: editJobId } = useParams();
  const isEditMode = Boolean(editJobId);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [missingFields, setMissingFields] = useState([]);
  const [upgradePopup, setUpgradePopup] = useState({ open: false, remainingCredits: null });
  const [meta, setMeta] = useState({ employer: {}, categories: [], jobTypes: [], qualifications: [], countries: [], states: [], districts: [], locations: [] });
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(emptyPreview);
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  useEffect(() => {
    const loadFormData = async () => {
      setLoading(true);
      try {
        const [formResponse, jobResponse, subscriptionResponse] = await Promise.all([
          axios.get(`${BASE_API_URL}/employer/job-form`, { headers: getTokenHeaders() }),
          isEditMode ? axios.get(`${BASE_API_URL}/employer/jobs/${editJobId}`, { headers: getTokenHeaders() }) : Promise.resolve(null),
          isEditMode ? Promise.resolve(null) : axios.get(`${BASE_API_URL}/employer/subscription-details`, { headers: getTokenHeaders() })
        ]);
        const formData = formResponse.data || {};
        const jobForm = jobResponse?.data?.form;
        const remainingCredits = Number(subscriptionResponse?.data?.subscription?.remainingCredits ?? 0);
        setMeta(formData);
        if (!isEditMode && remainingCredits <= 0) {
          setUpgradePopup({ open: true, remainingCredits });
        }

        const employerCity = formData?.employer?.city || '';
        const initialLocations = jobForm
          ? (jobForm.jobLocations?.length ? jobForm.jobLocations : jobForm.city ? [jobForm.city] : [])
          : employerCity ? [employerCity] : [];
        const primaryLocation = initialLocations[0] || '';
        const locationMeta = formData?.locations?.find((item) => item.name === primaryLocation);
        const countryMeta = formData?.countries?.find((item) => item.name === (jobForm?.country || formData?.employer?.country));
        const stateMeta = formData?.states?.find((item) => item.name === (jobForm?.state || formData?.employer?.state));
        const districtMeta = formData?.districts?.find((item) => item.name === (jobForm?.district || formData?.employer?.district));

        if (jobForm) {
          setForm({
            ...emptyForm,
            jobTitle: jobForm.jobTitle || '',
            jobCategory: String(jobForm.jobCategory || ''),
            jobType: String(jobForm.jobType || ''),
            experience: jobForm.experience || jobForm.requiredExperience || '',
            workMode: jobForm.workMode || 'Office',
            country: locationMeta?.cid || countryMeta?.cid || '',
            state: locationMeta?.sid || stateMeta?.sid || '',
            district: locationMeta?.did || districtMeta?.did || '',
            location: initialLocations,
            vacancies: jobForm.vacancies ? String(jobForm.vacancies) : '',
            minSalary: jobForm.minSalary ?? '',
            maxSalary: jobForm.maxSalary ?? '',
            salaryUnit: jobForm.salaryUnit || 'P.A.',
            salaryNegotiable: jobForm.salaryNegotiable !== false,
            noticePeriod: jobForm.noticePeriod || '',
            joiningDate: toDateInput(jobForm.joiningDate),
            shiftTiming: jobForm.shiftTiming || '',
            jobExpiry: toDateInput(jobForm.jobExpiry),
            benefits: jobForm.benefits || '',
            aboutCompany: jobForm.aboutCompany || '',
            jobSummary: jobForm.jobSummary || '',
            description: jobForm.detailedDescription || jobForm.description || '',
            responsibilities: jobForm.responsibilities || '',
            qualification: String(jobForm.qualification || ''),
            requiredExperience: jobForm.requiredExperience || jobForm.experience || '',
            skills: Array.isArray(jobForm.skills) ? jobForm.skills.join(', ') : jobForm.skills || '',
            language: Array.isArray(jobForm.languages) ? jobForm.languages.join(', ') : jobForm.languages || '',
            candidateLocation: jobForm.candidateLocationPreference || 'Open to all locations',
            screeningQuestions: jobForm.screeningQuestions || '',
            publishStatus: jobForm.publishStatus || 'publish'
          });
        } else {
          setForm((current) => ({
            ...current,
            country: locationMeta?.cid || countryMeta?.cid || '',
            state: locationMeta?.sid || stateMeta?.sid || '',
            district: locationMeta?.did || districtMeta?.did || '',
            location: employerCity ? [employerCity] : [],
            aboutCompany: formData?.employer?.companyName ? `About ${formData.employer.companyName}` : ''
          }));
        }

        setPreview((current) => ({
          ...current,
          companyName: formData?.employer?.companyName || current.companyName,
          companyLogo: formData?.employer?.logo || current.companyLogo,
          location: primaryLocation || formData?.employer?.city || current.location
        }));
      } catch (err) {
        setMessage({ type: 'error', text: err.response?.data?.message || (isEditMode ? 'Unable to load job data.' : 'Unable to load job form data.') });
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [editJobId, isEditMode]);

  useEffect(() => {
    if (loading) return undefined;

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await axios.post(`${BASE_API_URL}/employer/jobs/preview`, {
          ...form,
          jobLocations: form.location,
          detailedDescription: form.description,
          requiredExperience: form.requiredExperience || form.experience,
          languages: form.language
        }, { headers: getTokenHeaders() });
        setPreview({ ...emptyPreview, ...response.data });
      } catch {
        setPreview((current) => current);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [form, loading]);

  const setValue = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMissingFields((current) => current.filter((field) => field !== key));
  };
  const toggleLocation = (locationName) => {
    setForm((current) => {
      const selectedLocations = current.location || [];
      const nextLocations = selectedLocations.includes(locationName)
        ? selectedLocations.filter((item) => item !== locationName)
        : [...selectedLocations, locationName];

      return { ...current, location: nextLocations };
    });
    setMissingFields((current) => current.filter((field) => field !== 'location'));
    setCityDropdownOpen(false);
  };
  const selectCountry = (countryId) => {
    setForm((current) => ({ ...current, country: countryId, state: '', district: '', location: [] }));
    setMissingFields((current) => current.filter((field) => !['country'].includes(field)));
    setStateSearch('');
    setDistrictSearch('');
    setLocationSearch('');
    setCityDropdownOpen(false);
  };
  const selectState = (stateId) => {
    setForm((current) => ({ ...current, state: stateId, district: '', location: [] }));
    setMissingFields((current) => current.filter((field) => !['state'].includes(field)));
    setDistrictSearch('');
    setLocationSearch('');
    setCityDropdownOpen(false);
  };
  const selectDistrict = (districtId) => {
    setForm((current) => ({ ...current, district: districtId, location: [] }));
    setMissingFields((current) => current.filter((field) => !['district'].includes(field)));
    setLocationSearch('');
    setCityDropdownOpen(false);
  };
  const inputClass = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100';
  const fieldClass = (key) => `${inputClass} ${missingFields.includes(key) ? '!border-2 !border-rose-500 !bg-rose-50 !ring-2 !ring-rose-200 focus:!border-rose-500 focus:!ring-rose-200' : ''}`;
  const labelClass = 'mb-1.5 block text-xs font-extrabold text-slate-600';
  const isMissing = (key) => missingFields.includes(key);
  const countryOptions = meta.countries.map((item) => ({ value: item.cid, name: item.name }));
  const stateOptions = meta.states.filter((item) => !form.country || item.cid === form.country).map((item) => ({ value: item.sid, name: item.name }));
  const districtOptions = meta.districts.filter((item) => !form.state || item.sid === form.state).map((item) => ({ value: item.did, name: item.name }));
  const availableLocations = meta.locations.filter((item) => (
    (!form.country || item.cid === form.country)
    && (!form.state || item.sid === form.state)
    && (!form.district || item.did === form.district)
  ));
  const filteredLocations = availableLocations.filter((item) => item.name.toLowerCase().includes(locationSearch.trim().toLowerCase()));
  const selectedCountryMeta = meta.countries.find((item) => item.cid === form.country) || {};
  const selectedStateMeta = meta.states.find((item) => item.sid === form.state) || {};
  const selectedDistrictMeta = meta.districts.find((item) => item.did === form.district) || {};
  const selectedLocationMeta = meta.locations.find((item) => item.name === form.location[0]) || {};

  const validateStep = () => {
    if (upgradePopup.open) return false;

    const requiredByStep = [
      ['jobTitle', 'jobCategory', 'jobType', 'experience', 'country', 'state', 'district', 'vacancies', 'location', 'minSalary', 'maxSalary'],
      ['jobSummary', 'description'],
      ['skills'],
      []
    ];
    const stepMissingFields = requiredByStep[step].filter((key) => {
      const value = form[key];
      return Array.isArray(value) ? value.length === 0 : !String(value || '').trim();
    });
    setMissingFields(stepMissingFields);
    if (stepMissingFields.length) {
      setMessage({ type: 'error', text: 'Please fill required fields before continuing.' });
      return false;
    }
    setMessage({ type: '', text: '' });
    setMissingFields([]);
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const submitJob = async (status = 'publish') => {
    if (!isEditMode && upgradePopup.open) {
      setMessage({ type: 'error', text: 'Please upgrade your subscription before posting a job.' });
      return;
    }

    const submitMissingFields = ['jobTitle', 'jobCategory', 'jobType', 'vacancies', 'description'].filter((key) => !String(form[key] || '').trim());
    if (submitMissingFields.length) {
      setMissingFields(submitMissingFields);
      setMessage({ type: 'error', text: 'Please complete required job information.' });
      setStep(submitMissingFields.includes('description') ? 1 : 0);
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const employer = meta.employer || {};
      const payload = {
        jobTitle: form.jobTitle,
        jobCategory: form.jobCategory,
        jobType: form.jobType,
        vacancies: Number(form.vacancies) || 1,
        workMode: form.workMode,
        jobLocations: form.location,
        description: form.description,
        jobSummary: form.jobSummary,
        detailedDescription: form.description,
        responsibilities: form.responsibilities,
        qualification: form.qualification || null,
        experience: form.experience,
        requiredExperience: form.requiredExperience || form.experience,
        salary: preview.salary,
        minSalary: form.minSalary,
        maxSalary: form.maxSalary,
        salaryUnit: form.salaryUnit,
        salaryNegotiable: form.salaryNegotiable,
        noticePeriod: form.noticePeriod,
        joiningDate: form.joiningDate || null,
        shiftTiming: form.shiftTiming,
        jobExpiry: form.jobExpiry || null,
        benefits: form.benefits,
        aboutCompany: form.aboutCompany,
        skills: form.skills,
        languages: form.language,
        candidateLocationPreference: form.candidateLocation,
        screeningQuestions: form.screeningQuestions,
        publishStatus: status === 'draft' ? 'draft' : 'publish',
        city: form.location[0] || employer.city,
        country: selectedCountryMeta.name || selectedLocationMeta.country || employer.country,
        state: selectedStateMeta.name || selectedLocationMeta.state || employer.state,
        district: selectedDistrictMeta.name || selectedLocationMeta.district || employer.district,
        companyName: employer.companyName,
        contactPerson: employer.contactPerson,
        email: employer.email,
        phone: employer.phone,
        currentPlan: employer.currentPlan,
        planValidity: form.jobExpiry || employer.planValidity,
        status: status === 'draft' ? 'draft' : 'publish'
      };
      if (isEditMode) {
        await axios.put(`${BASE_API_URL}/employer/jobs/${editJobId}`, payload, { headers: getTokenHeaders() });
      } else {
        await axios.post(`${BASE_API_URL}/employer/jobs`, payload, { headers: getTokenHeaders() });
      }
      setMessage({ type: 'success', text: isEditMode ? 'Job updated successfully.' : status === 'draft' ? 'Draft saved successfully.' : 'Job published successfully.' });
      setTimeout(() => navigate('/employer/jobs'), 900);
    } catch (err) {
      if (!isEditMode && err.response?.status === 403) {
        setUpgradePopup({ open: true, remainingCredits: 0 });
      }
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to save job.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-[#6658dd]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl font-extrabold text-[#3f4254]">{isEditMode ? 'Edit Job' : 'Post a New Job'}</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">{isEditMode ? 'Update job details and save the latest information.' : 'Fill in the details to find the right candidate for your job.'}</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
          <span className="text-[#3f4254]">JobsWaale</span>
          <ChevronRight className="h-4 w-4" />
          <span>Jobs</span>
          <ChevronRight className="h-4 w-4" />
          <span>{isEditMode ? 'Edit Job' : 'Post a Job'}</span>
        </div>
      </div>

      {message.text && (
        <div className={`rounded-md border px-4 py-3 text-sm font-bold ${message.type === 'success' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-rose-100 bg-rose-50 text-rose-700'}`}>
          {message.text}
        </div>
      )}

      {upgradePopup.open && !isEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-lg border border-slate-100 bg-white shadow-2xl">
            <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                <AlertCircle className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-[#3f4254]">Upgrade subscription required</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Your remaining credits are 0. Please upgrade your subscription before posting a job.
                </p>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate('/employer/jobs')}
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => navigate('/employer/subscription')}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#6658dd] px-4 text-sm font-extrabold text-white shadow-md shadow-indigo-500/20 transition hover:bg-[#5848d8]"
              >
                Upgrade Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => index <= step || validateStep() ? setStep(index) : null}
            className={`rounded-lg border p-3 text-left transition ${step === index ? 'border-[#6658dd] bg-[#e8e6fa]' : index < step ? 'border-[#6658dd]/50 bg-white' : 'border-slate-200 bg-[#e8eaef]'}`}
          >
            <span className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${index <= step ? 'bg-[#6658dd] text-white' : 'bg-white text-slate-500'}`}>{index + 1}</span>
              <span>
                <span className="block text-sm font-extrabold text-slate-800">{item.title}</span>
                <span className="block text-xs font-semibold text-slate-500">{item.subtitle}</span>
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="space-y-5">
          {step === 0 && (
            <>
              <section className="rounded-md border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-base font-extrabold text-[#3f4254]">Basic Job Information</h2></div>
                <div className="grid gap-4 p-5 md:grid-cols-2">
                  <div><label className={labelClass}>Job Title *</label><input className={fieldClass('jobTitle')} value={form.jobTitle} onChange={(e) => setValue('jobTitle', e.target.value)} placeholder="e.g. Software Developer" /></div>
                  <div><label className={labelClass}>Job Category *</label><select className={fieldClass('jobCategory')} value={form.jobCategory} onChange={(e) => setValue('jobCategory', e.target.value)}><option value="">Select Category</option>{meta.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
                  <div><label className={labelClass}>Employment Type *</label><select className={fieldClass('jobType')} value={form.jobType} onChange={(e) => setValue('jobType', e.target.value)}><option value="">Select Employment Type</option>{meta.jobTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
                  <div><label className={labelClass}>Experience Level *</label><select className={fieldClass('experience')} value={form.experience} onChange={(e) => setValue('experience', e.target.value)}><option value="">Select Experience</option><option>Fresher</option><option>1 - 2 Years</option><option>2 - 5 Years</option><option>5+ Years</option></select></div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Work Mode *</label>
                    <div className="grid gap-2 md:grid-cols-3">
                      {[['Office', 'Office', Building2], ['Work from Home', 'Work from Home', Briefcase], ['Hybrid', 'Hybrid', Building2]].map(([value, label, Icon]) => (
                        <button key={label} type="button" onClick={() => setValue('workMode', value)} className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-bold ${form.workMode === value ? 'border-[#6658dd] bg-[#e8e6fa] text-[#6658dd]' : 'border-slate-200 text-slate-600'}`}><Icon className="h-4 w-4" />{label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Job Location *</label>
                    <div className="mb-3 grid gap-3 md:grid-cols-3">
                      <SearchableSelect
                        label="Country"
                        value={form.country}
                        options={countryOptions}
                        search={countrySearch}
                        onSearch={setCountrySearch}
                        onSelect={selectCountry}
                        placeholder="Search country..."
                        invalid={isMissing('country')}
                      />
                      <SearchableSelect
                        label="State"
                        value={form.state}
                        options={stateOptions}
                        search={stateSearch}
                        onSearch={setStateSearch}
                        onSelect={selectState}
                        placeholder="Search state..."
                        disabled={!form.country}
                        invalid={isMissing('state')}
                      />
                      <SearchableSelect
                        label="District"
                        value={form.district}
                        options={districtOptions}
                        search={districtSearch}
                        onSearch={setDistrictSearch}
                        onSelect={selectDistrict}
                        placeholder="Search district..."
                        disabled={!form.state}
                        invalid={isMissing('district')}
                      />
                    </div>
                    <div className={`rounded-md border bg-white p-3 ${isMissing('location') ? '!border-rose-500 !ring-2 !ring-rose-200' : 'border-slate-200'}`}>
                      <label className={labelClass}>City</label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          className={`w-full rounded-md border bg-slate-50 py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100 ${isMissing('location') ? '!border-rose-400 !bg-rose-50' : 'border-slate-200'}`}
                          value={locationSearch}
                          onChange={(e) => {
                            setLocationSearch(e.target.value);
                            setCityDropdownOpen(true);
                          }}
                          onFocus={() => setCityDropdownOpen(true)}
                          onBlur={() => window.setTimeout(() => setCityDropdownOpen(false), 120)}
                          placeholder={form.district ? 'Search city...' : 'Select district first'}
                          disabled={!form.district}
                        />
                      </div>

                      {form.location.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {form.location.map((locationName) => (
                            <button
                              key={locationName}
                              type="button"
                              onClick={() => toggleLocation(locationName)}
                              className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2.5 py-1 text-xs font-extrabold text-[#6658dd]"
                            >
                              {locationName}
                              <span className="text-sm leading-none">x</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {cityDropdownOpen && <div className="mt-3 max-h-44 overflow-y-auto rounded-md border border-slate-100">
                        {!form.district ? (
                          <div className="px-3 py-3 text-sm font-semibold text-slate-400">Select district to view cities</div>
                        ) : filteredLocations.length ? filteredLocations.map((item) => {
                          const isSelected = form.location.includes(item.name);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => toggleLocation(item.name)}
                              className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm font-bold transition hover:bg-indigo-50 ${isSelected ? 'bg-indigo-50 text-[#6658dd]' : 'text-slate-600'}`}
                            >
                              <span>{item.name}</span>
                              {isSelected && <Check className="h-4 w-4" />}
                            </button>
                          );
                        }) : (
                          <div className="px-3 py-3 text-sm font-semibold text-slate-400">No locations found</div>
                        )}
                      </div>}
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-400">Country, state, district, and city are managed by superadmin masters.</p>
                  </div>
                  <div><label className={labelClass}>No. of Openings *</label><input type="number" min="1" className={fieldClass('vacancies')} value={form.vacancies} onChange={(e) => setValue('vacancies', e.target.value)} /></div>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div><label className={labelClass}>Min Salary *</label><input type="number" className={fieldClass('minSalary')} value={form.minSalary} onChange={(e) => setValue('minSalary', e.target.value)} /></div>
                    <div><label className={labelClass}>Max Salary *</label><input type="number" className={fieldClass('maxSalary')} value={form.maxSalary} onChange={(e) => setValue('maxSalary', e.target.value)} /></div>
                    <div><label className={labelClass}>Unit</label><select className={inputClass} value={form.salaryUnit} onChange={(e) => setValue('salaryUnit', e.target.value)}><option>P.A.</option><option>Monthly</option></select></div>
                  </div>
                </div>
              </section>
              <section className="rounded-md border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-base font-extrabold text-[#3f4254]">Additional Information</h2></div>
                <div className="grid gap-4 p-5 md:grid-cols-2">
                  <div><label className={labelClass}>Notice Period</label><select className={inputClass} value={form.noticePeriod} onChange={(e) => setValue('noticePeriod', e.target.value)}><option value="">Select Notice Period</option><option>Immediate</option><option>15 Days</option><option>30 Days</option><option>60 Days</option></select></div>
                  <div><label className={labelClass}>Date of Joining</label><input type="date" className={inputClass} value={form.joiningDate} onChange={(e) => setValue('joiningDate', e.target.value)} /></div>
                  <div><label className={labelClass}>Shift Timings</label><select className={inputClass} value={form.shiftTiming} onChange={(e) => setValue('shiftTiming', e.target.value)}><option value="">Select Shift Timing</option><option>Day Shift</option><option>Night Shift</option><option>Rotational Shift</option></select></div>
                  <div><label className={labelClass}>Job Expiry</label><input type="date" className={inputClass} value={form.jobExpiry} onChange={(e) => setValue('jobExpiry', e.target.value)} min={today()} /></div>
                  <div className="md:col-span-2"><label className={labelClass}>Benefits & Perks</label><input className={inputClass} value={form.benefits} onChange={(e) => setValue('benefits', e.target.value)} placeholder="PF, Health Insurance, Bonus" /></div>
                  <div className="md:col-span-2"><label className={labelClass}>About Company</label><textarea className={inputClass} rows="3" maxLength="500" value={form.aboutCompany} onChange={(e) => setValue('aboutCompany', e.target.value)} /></div>
                </div>
              </section>
            </>
          )}

          {step === 1 && (
            <section className="rounded-md border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-base font-extrabold text-[#3f4254]">Job Description</h2></div>
              <div className="space-y-4 p-5">
                <div><label className={labelClass}>Short Summary *</label><textarea className={fieldClass('jobSummary')} rows="3" value={form.jobSummary} onChange={(e) => setValue('jobSummary', e.target.value)} /></div>
                <div><label className={labelClass}>Detailed Job Description *</label><textarea className={fieldClass('description')} rows="8" value={form.description} onChange={(e) => setValue('description', e.target.value)} /></div>
                <div><label className={labelClass}>Responsibilities</label><textarea className={inputClass} rows="6" value={form.responsibilities} onChange={(e) => setValue('responsibilities', e.target.value)} /></div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="rounded-md border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-base font-extrabold text-[#3f4254]">Requirements</h2></div>
              <div className="grid gap-4 p-5 md:grid-cols-2">
                <div><label className={labelClass}>Qualification</label><select className={inputClass} value={form.qualification} onChange={(e) => setValue('qualification', e.target.value)}><option value="">Select Qualification</option>{meta.qualifications.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
                <div><label className={labelClass}>Required Experience</label><select className={inputClass} value={form.requiredExperience} onChange={(e) => setValue('requiredExperience', e.target.value)}><option value="">Select Experience</option><option>Fresher</option><option>1 - 2 Years</option><option>2 - 5 Years</option><option>5+ Years</option></select></div>
                <div className="md:col-span-2"><label className={labelClass}>Key Skills *</label><input className={fieldClass('skills')} value={form.skills} onChange={(e) => setValue('skills', e.target.value)} placeholder="JavaScript, React.js, HTML" /></div>
                <div><label className={labelClass}>Language Preference</label><input className={inputClass} value={form.language} onChange={(e) => setValue('language', e.target.value)} /></div>
                <div><label className={labelClass}>Candidate Location Preference</label><select className={inputClass} value={form.candidateLocation} onChange={(e) => setValue('candidateLocation', e.target.value)}><option>Open to all locations</option><option>Same city only</option><option>Same state only</option></select></div>
                <div className="md:col-span-2"><label className={labelClass}>Screening Questions</label><textarea className={inputClass} rows="4" value={form.screeningQuestions} onChange={(e) => setValue('screeningQuestions', e.target.value)} /></div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="rounded-md border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-base font-extrabold text-[#3f4254]">Preview & Publish</h2></div>
              <div className="space-y-4 p-5">
                <div className="flex items-center gap-2 rounded-md border border-sky-100 bg-sky-50 p-3 text-sm font-bold text-sky-700"><Info className="h-5 w-5" /> Once you publish the job, it will be visible to relevant candidates.</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-md border border-slate-200 p-4"><p className="text-xs font-bold text-slate-400">Plan Usage</p><h3 className="mt-1 text-base font-extrabold text-slate-800">Jobs credits are checked by your active plan.</h3></div>
                  <div className="rounded-md border border-slate-200 p-4"><p className="text-xs font-bold text-slate-400">Publishing Checklist</p><ul className="mt-2 space-y-1 text-sm font-semibold text-slate-600"><li><Check className="inline h-4 w-4 text-emerald-500" /> Basic details completed</li><li><Check className="inline h-4 w-4 text-emerald-500" /> Description added</li><li><Check className="inline h-4 w-4 text-emerald-500" /> Skills selected</li></ul></div>
                </div>
                <div><label className={labelClass}>Publish Status</label><select className={inputClass} value={form.publishStatus} onChange={(e) => setValue('publishStatus', e.target.value)}><option value="publish">Publish Immediately</option><option value="draft">Save as Draft</option></select></div>
              </div>
            </section>
          )}

          <div className="flex flex-wrap justify-between gap-2">
            <button type="button" onClick={() => submitJob('draft')} disabled={submitting} className="inline-flex items-center gap-2 rounded-md border border-[#6658dd] px-4 py-2 text-sm font-extrabold text-[#6658dd]"><Save className="h-4 w-4" /> Save as Draft</button>
            <div className="flex gap-2">
              {step > 0 && <button type="button" onClick={() => setStep((current) => current - 1)} className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-extrabold text-white"><ArrowLeft className="h-4 w-4" /> Back</button>}
              {step < 3 ? (
                <button type="button" onClick={handleNext} className="inline-flex items-center gap-2 rounded-md bg-[#6658dd] px-4 py-2 text-sm font-extrabold text-white">Save & Continue <ArrowRight className="h-4 w-4" /></button>
              ) : (
                <button type="button" onClick={() => submitJob(form.publishStatus)} disabled={submitting} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white disabled:opacity-60">{submitting ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {isEditMode ? 'Update Job' : 'Publish Job'}</button>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-md border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-base font-extrabold text-[#3f4254]">Job Posting Tips</h2></div>
            <div className="space-y-4 p-5">
              {[[Pencil, 'Write a clear job title', 'Use simple and specific titles to get better candidates.'], [ClipboardList, 'Add detailed description', 'Explain role, responsibilities, and expectations clearly.'], [Tags, 'Mention important skills', 'Add key skills to attract relevant candidates.'], [ShieldCheck, 'Set a competitive salary', 'Attractive salary ranges help you get quality applicants.']].map(([Icon, title, text]) => (
                <div key={title} className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[#6658dd]"><Icon className="h-4 w-4" /></span><div><h3 className="text-sm font-extrabold text-slate-800">{title}</h3><p className="mt-1 text-xs font-semibold text-slate-500">{text}</p></div></div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-base font-extrabold text-[#3f4254]">Job Preview</h2></div>
            <div className="p-5">
              <div className="overflow-hidden rounded-md border border-slate-200">
                <div className="flex h-20 items-center justify-center bg-slate-100 text-sm font-bold text-slate-400">
                  {preview.companyLogo ? (
                    <img src={getAssetUrl(preview.companyLogo)} alt={preview.companyName} className="h-full w-full object-contain p-3" />
                  ) : (
                    <><Building2 className="mr-1 h-4 w-4" /> Company Logo</>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-extrabold text-[#6658dd]">{preview.title}</h3>
                  <p className="mt-1 text-sm font-extrabold text-slate-800">{preview.companyName}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500"><MapPin className="inline h-3.5 w-3.5" /> {preview.location}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500"><Briefcase className="inline h-3.5 w-3.5" /> {preview.employmentType}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Experience: {preview.experience}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{preview.salary}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5"><span className="rounded bg-indigo-50 px-2 py-1 text-xs font-bold text-[#6658dd]">{preview.workMode}</span><span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{preview.openings} Openings</span></div>
                  <h4 className="mt-4 text-sm font-extrabold text-slate-800">Key Skills</h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">{(preview.skills || []).map((skill) => <span key={skill} className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{skill}</span>)}</div>
                  <h4 className="mt-4 text-sm font-extrabold text-slate-800">Job Description</h4>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{preview.description}</p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default EmployerPostJob;
