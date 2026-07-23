import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Briefcase,
  Calendar,
  Camera,
  Check,
  CheckCircle,
  FileText,
  GraduationCap,
  Link2,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  User,
  X,
  XCircle
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import { getWithCache } from '../../../utils/apiCache';

const getRefLabel = (value, keys = []) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return keys.map(key => value?.[key]).find(Boolean) || value?.name || value?._id || '';
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const getCountryValue = (country) => country?.cid || country?.countryName || '';
const getCountryLabel = (country) => country?.countryName || country?.cid || '';
const getStateValue = (state) => state?.sid || state?.stateName || '';
const getStateLabel = (state) => state?.stateName || state?.sid || '';
const getDistrictValue = (district) => district?.did || district?.districtName || '';
const getDistrictLabel = (district) => district?.districtName || district?.did || '';
const getCityValue = (city) => city?.cityName || city?.ctid || '';
const getCityLabel = (city) => city?.cityName || city?.ctid || '';
const getIndustryValue = (industry) => industry?._id || industry?.id || '';
const getIndustryLabel = (industry) => industry?.industryType || industry?.industryName || industry?.name || industry?.id || '';
const getJobCategoryValue = (category) => category?._id || category?.id || '';
const getJobCategoryLabel = (category) => category?.categoryName || category?.name || category?.id || '';
const getJobTypeValue = (type) => type?._id || type?.id || '';
const getJobTypeLabel = (type) => type?.jobType || type?.name || type?.id || '';
const getQualificationValue = (qualification) => qualification?._id || qualification?.id || '';
const getQualificationLabel = (qualification) => qualification?.name || qualification?.id || '';
const experienceOptions = ['Fresher', ...Array.from({ length: 10 }, (_, index) => `${index + 1}+ Years`)];

const findByValueOrLabel = (items, value, getValue, getLabel) => {
  const current = normalizeText(value);
  if (!current) return null;
  return items.find(item =>
    normalizeText(getValue(item)) === current || normalizeText(getLabel(item)) === current
  ) || null;
};

const SearchableSelect = ({
  label,
  value,
  onChange,
  options,
  getOptionValue,
  getOptionLabel,
  placeholder = 'Search and select...',
  disabled = false,
  required = false
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const selected = findByValueOrLabel(options, value, getOptionValue, getOptionLabel);
  const displayValue = selected ? getOptionLabel(selected) : value;
  const filtered = options.filter(option => getOptionLabel(option).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-bold text-slate-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setOpen(prev => !prev);
          setQuery('');
        }}
        className="flex min-h-[42px] w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-700 transition focus:border-[#0047C7] focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        <span className={displayValue ? 'truncate' : 'truncate text-slate-400'}>
          {displayValue || placeholder}
        </span>
        <Search className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 p-2">
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0047C7]"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length > 0 ? filtered.map(option => {
              const optionValue = getOptionValue(option);
              const optionLabel = getOptionLabel(option);
              return (
                <button
                  key={optionValue}
                  type="button"
                  onClick={() => {
                    onChange(optionValue, option);
                    setOpen(false);
                    setQuery('');
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-blue-50 ${
                    normalizeText(value) === normalizeText(optionValue) ? 'bg-blue-50 font-bold text-[#0047C7]' : 'text-slate-700'
                  }`}
                >
                  {optionLabel}
                </button>
              );
            }) : (
              <div className="px-3 py-3 text-sm font-semibold text-slate-400">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SearchableMultiCitySelect = ({ label, values, onChange, options, required = false }) => {
  const [query, setQuery] = useState('');
  const selectedValues = values.map(value => normalizeText(value));
  const filtered = options
    .filter(city => getCityLabel(city).toLowerCase().includes(query.toLowerCase()))
    .filter(city => !selectedValues.includes(normalizeText(getCityValue(city))))
    .slice(0, 80);

  const addCity = (cityName) => {
    if (!cityName || selectedValues.includes(normalizeText(cityName))) return;
    onChange([...values, cityName]);
    setQuery('');
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="rounded-md border border-slate-200 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {values.map(city => (
            <span
              key={city}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0047C7]"
            >
              {city}
              <button type="button" onClick={() => onChange(values.filter(item => item !== city))} aria-label={`Remove ${city}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <div className="relative min-w-[180px] flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city..."
              className="w-full border-none px-1 py-1 text-xs text-slate-700 focus:outline-none"
            />
            {query && (
              <div className="absolute left-0 right-0 top-8 z-30 max-h-56 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
                {filtered.length > 0 ? filtered.map(city => (
                  <button
                    key={city.ctid || city.cityName}
                    type="button"
                    onClick={() => addCity(getCityValue(city))}
                    className="block w-full px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-blue-50"
                  >
                    {getCityLabel(city)}
                  </button>
                )) : (
                  <div className="px-3 py-3 text-sm font-semibold text-slate-400">No cities found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const JobseekerProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [jobCategories, setJobCategories] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [qualifications, setQualifications] = useState([]);

  // Profile data state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [designation, setDesignation] = useState('');
  const [experience, setExperience] = useState('Fresher');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [industryType, setIndustryType] = useState('');
  const [jobCategory, setJobCategory] = useState('');
  const [jobType, setJobType] = useState('');
  const [currentPlan, setCurrentPlan] = useState('');
  const [planValidity, setPlanValidity] = useState('');
  const [status, setStatus] = useState('');
  const [jobSearchStatus, setJobSearchStatus] = useState('looking');
  const [bio, setBio] = useState('');
  const [qualification, setQualification] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [studyField, setStudyField] = useState('');
  const [university, setUniversity] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [github, setGithub] = useState('');
  const [profileCompletionScore, setProfileCompletionScore] = useState(0);
  
  // Custom states
  const [gender, setGender] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [locations, setLocations] = useState([]);
  const [relocate, setRelocate] = useState('yes');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [countryData, stateData, districtData, cityData, industryData, categoryData, typeData, qualificationData] = await Promise.all([
          getWithCache(`${BASE_API_URL}/masters/countries`),
          getWithCache(`${BASE_API_URL}/masters/states`),
          getWithCache(`${BASE_API_URL}/masters/districts`),
          getWithCache(`${BASE_API_URL}/masters/cities`),
          getWithCache(`${BASE_API_URL}/masters/industry-types`),
          getWithCache(`${BASE_API_URL}/masters/job-categories`),
          getWithCache(`${BASE_API_URL}/masters/job-types`),
          getWithCache(`${BASE_API_URL}/masters/qualifications`)
        ]);

        setCountries(countryData || []);
        setStates(stateData || []);
        setDistricts(districtData || []);
        setCities(cityData || []);
        setIndustries(industryData || []);
        setJobCategories(categoryData || []);
        setJobTypes(typeData || []);
        setQualifications(qualificationData || []);
      } catch (err) {
        console.error('Fetch masters error:', err);
        setError('Failed to load dropdown data. Please refresh.');
      }
    };

    fetchMasters();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('publicToken');
        const res = await axios.get(`${BASE_API_URL}/jobseeker/profile`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        const seeker = res.data || {};
        setName(seeker.name || '');
        setPhone(seeker.phone || '');
        setEmail(seeker.userId?.email || '');
        setGender(seeker.gender || '');
        setDob(seeker.dob || '');
        setCity(seeker.city || '');
        setState(seeker.state || '');
        setCountry(seeker.country || '');
        setDistrict(seeker.district || '');
        setAddress(seeker.address || '');
        setPinCode(seeker.pinCode || '');
        setDesignation(seeker.designation || '');
        setExperience(seeker.experience || '');
        setExpectedSalary(seeker.expectedSalary || '');
        setIndustryType(seeker.industryType?._id || getRefLabel(seeker.industryType, ['industryType', 'industryName', 'name']));
        setJobCategory(seeker.jobCategory?._id || getRefLabel(seeker.jobCategory, ['categoryName', 'name']));
        setJobType(seeker.jobType?._id || getRefLabel(seeker.jobType, ['jobType', 'name']));
        setCurrentPlan(getRefLabel(seeker.currentPlan, ['planName', 'name']));
        setPlanValidity(seeker.planValidity ? new Date(seeker.planValidity).toISOString().split('T')[0] : '');
        setStatus(seeker.status || '');
        setJobSearchStatus(seeker.jobSearchStatus || 'looking');
        setBio(seeker.bio || '');
        setQualification(seeker.qualification?._id || getRefLabel(seeker.qualification, ['name']) || '');
        setPassingYear(seeker.passingYear || '');
        setStudyField(seeker.studyField || '');
        setUniversity(seeker.university || '');
        setLinkedin(seeker.linkedin || '');
        setPortfolio(seeker.portfolio || '');
        setGithub(seeker.github || '');
        setProfileCompletionScore(Number(seeker.profileCompletionScore || 0));
        setSkills(seeker.skills || []);
        setRelocate(seeker.relocate || 'yes');
        
        if (seeker.preferredLocation) {
          setLocations(seeker.preferredLocation.split(',').map(l => l.trim()).filter(Boolean));
        }

        if (seeker.resume) {
          setResumeFile({
            name: seeker.resume.split('/').pop() || 'Uploaded_Resume.pdf',
            size: seeker.resume
          });
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
        setError('Failed to load profile. Please refresh or login again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setAvatarPreview(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile({
      name: file.name,
      size: 'Uploading...'
    });

    try {
      const token = localStorage.getItem('publicToken');
      const formData = new FormData();
      formData.append('resume', file);

      const response = await axios.post(`${BASE_API_URL}/jobseeker/profile/resume`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.resume) {
        setResumeFile({
          name: response.data.resume.split('/').pop() || file.name,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB · Uploaded`
        });
      }
    } catch (err) {
      console.error('Resume upload failed:', err);
      setError(err.response?.data?.message || 'Failed to upload resume.');
      setResumeFile(null);
    }
  };

  const deleteResume = async () => {
    if (window.confirm('Remove your resume?')) {
      try {
        const token = localStorage.getItem('publicToken');
        await axios.delete(`${BASE_API_URL}/jobseeker/profile/resume`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setResumeFile(null);
      } catch (err) {
        console.error('Failed to delete resume:', err);
        setError(err.response?.data?.message || 'Failed to delete resume.');
      }
    }
  };

  const addSkill = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const value = skillInput.trim();
    if (!value || skills.includes(value)) return;
    setSkills([...skills, value]);
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const selectedCountry = findByValueOrLabel(countries, country, getCountryValue, getCountryLabel);
  const selectedCountryKey = selectedCountry?.cid || country;
  const availableStates = states.filter(item => normalizeText(item.cid) === normalizeText(selectedCountryKey));
  const selectedState = findByValueOrLabel(states, state, getStateValue, getStateLabel);
  const selectedStateKey = selectedState?.sid || state;
  const availableDistricts = districts.filter(item => normalizeText(item.sid) === normalizeText(selectedStateKey));
  const selectedDistrict = findByValueOrLabel(districts, district, getDistrictValue, getDistrictLabel);
  const selectedDistrictKey = selectedDistrict?.did || district;
  const availableCities = cities.filter(item => normalizeText(item.did) === normalizeText(selectedDistrictKey));
  const headerState = selectedState ? getStateLabel(selectedState) : state;
  const selectedIndustry = findByValueOrLabel(industries, industryType, getIndustryValue, getIndustryLabel);
  const selectedJobCategory = findByValueOrLabel(jobCategories, jobCategory, getJobCategoryValue, getJobCategoryLabel);
  const selectedJobType = findByValueOrLabel(jobTypes, jobType, getJobTypeValue, getJobTypeLabel);
  const selectedQualification = findByValueOrLabel(qualifications, qualification, getQualificationValue, getQualificationLabel);

  const handleSave = async () => {
    setError('');
    setSaved(false);
    try {
      const token = localStorage.getItem('publicToken');
      const payload = {
        name,
        phone,
        gender,
        dob,
        city,
        state,
        country,
        district,
        address,
        pinCode,
        designation,
        relocate,
        experience,
        expectedSalary,
        industryType: selectedIndustry?._id || industryType,
        jobCategory: selectedJobCategory?._id || jobCategory,
        jobType: selectedJobType?._id || jobType,
        bio,
        skills,
        linkedin,
        portfolio,
        github,
        qualification: selectedQualification?._id || qualification,
        passingYear,
        studyField,
        university,
        jobSearchStatus,
        preferredLocation: locations.join(', ')
      };

      const response = await axios.put(`${BASE_API_URL}/jobseeker/profile`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setProfileCompletionScore(Number(response.data?.seeker?.profileCompletionScore || profileCompletionScore));

      setSaved(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save profile error:', err);
      setError(err.response?.data?.message || 'Failed to save changes. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0047C7] border-t-transparent"/>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {saved && (
        <div className="rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      {/* Profile Header */}
      <div className="flex flex-col items-center gap-5 rounded-md border border-slate-100 bg-white p-8 shadow-sm sm:flex-row sm:items-center">
        <div className="group relative h-24 w-24 shrink-0">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile"
              className="h-24 w-24 rounded-full object-cover border-2 border-slate-200"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FF6B00] text-3xl font-bold text-white">
              {name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'JS'}
            </div>
          )}

          <label
            htmlFor="photoUpload"
            className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100"
          >
            <Camera className="h-6 w-6" />
          </label>
          <input
            type="file"
            id="photoUpload"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>

        <div className="text-center sm:text-left">
          <h3 className="text-xl font-bold text-[#0f172a]">
            {name}
          </h3>
          <div className="mt-1 text-sm text-slate-500">
            <span className="font-bold text-slate-700">{designation || 'Job Seeker'}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-400 sm:justify-start">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {[city, headerState].filter(Boolean).join(', ') || 'Location not specified'}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> {email}
            </span>
            {phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> {phone}
              </span>
            )}
          </div>
        </div>
        <div className="w-full rounded-md border border-slate-100 bg-slate-50 p-4 sm:ml-auto sm:w-56">
          <div className="mb-2 flex items-center justify-between text-xs font-black text-slate-500">
            <span>Profile score</span>
            <span className="text-[#0047C7]">{profileCompletionScore}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-[#0047C7] transition-all"
              style={{ width: `${Math.min(Math.max(profileCompletionScore, 0), 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] font-bold text-slate-400">
            Complete more details to improve visibility.
          </p>
        </div>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Personal Information */}
          <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
            <h5 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-4 text-lg font-bold text-[#0f172a]">
              <User className="h-5 w-5 text-[#0047C7]" /> Personal Information
            </h5>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <SearchableSelect
                label="Country"
                value={country}
                onChange={(value) => {
                  setCountry(value);
                  setState('');
                  setDistrict('');
                  setCity('');
                }}
                options={countries}
                getOptionValue={getCountryValue}
                getOptionLabel={getCountryLabel}
                placeholder="Search country..."
              />

              <SearchableSelect
                label="State"
                value={state}
                onChange={(value) => {
                  setState(value);
                  setDistrict('');
                  setCity('');
                }}
                options={availableStates}
                getOptionValue={getStateValue}
                getOptionLabel={getStateLabel}
                placeholder="Search state..."
                disabled={!selectedCountryKey}
              />

              <SearchableSelect
                label="District"
                value={district}
                onChange={(value) => {
                  setDistrict(value);
                  setCity('');
                }}
                options={availableDistricts}
                getOptionValue={getDistrictValue}
                getOptionLabel={getDistrictLabel}
                placeholder="Search district..."
                disabled={!selectedStateKey}
              />

              <SearchableSelect
                label="City"
                value={city}
                onChange={setCity}
                options={availableCities}
                getOptionValue={getCityValue}
                getOptionLabel={getCityLabel}
                placeholder="Search city..."
                disabled={!selectedDistrictKey}
              />

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Pin Code
                </label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Full Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Current Designation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                />
              </div>

              {/* Preferred Location */}
              <div className="sm:col-span-2">
                <SearchableMultiCitySelect
                  label="Preferred Location"
                  values={locations}
                  onChange={setLocations}
                  options={cities}
                  required
                />
              </div>

              {/* Want to Relocate */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-600">
                  Want to Relocate? <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRelocate('yes')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-bold transition ${
                      relocate === 'yes'
                        ? 'border-[#0047C7] bg-blue-50 text-[#0047C7]'
                        : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" /> Yes, willing
                  </button>
                  <button
                    type="button"
                    onClick={() => setRelocate('no')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-bold transition ${
                      relocate === 'no'
                        ? 'border-[#0047C7] bg-blue-50 text-[#0047C7]'
                        : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    <XCircle className="h-4 w-4" /> No, prefer local
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
            <h5 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-4 text-lg font-bold text-[#0f172a]">
              <Briefcase className="h-5 w-5 text-[#0047C7]" /> Work Experience
            </h5>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Total Experience <span className="text-rose-500">*</span>
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                >
                  <option value="">Select experience</option>
                  {experienceOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Expected Salary
                </label>
                <input
                  type="text"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  placeholder="e.g. 30000 / Month"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Job Search Status
                </label>
                <select
                  value={jobSearchStatus}
                  onChange={(e) => setJobSearchStatus(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                >
                  <option value="looking">Looking for job</option>
                  <option value="not-looking">Not looking</option>
                </select>
              </div>

              <SearchableSelect
                label="Industry Type"
                value={industryType}
                onChange={setIndustryType}
                options={industries}
                getOptionValue={getIndustryValue}
                getOptionLabel={getIndustryLabel}
                placeholder="Search industry..."
              />

              <SearchableSelect
                label="Job Category"
                value={jobCategory}
                onChange={setJobCategory}
                options={jobCategories}
                getOptionValue={getJobCategoryValue}
                getOptionLabel={getJobCategoryLabel}
                placeholder="Search job category..."
              />

              <SearchableSelect
                label="Job Type"
                value={jobType}
                onChange={setJobType}
                options={jobTypes}
                getOptionValue={getJobTypeValue}
                getOptionLabel={getJobTypeLabel}
                placeholder="Search job type..."
              />

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Brief Bio / Summary
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Skills */}
          <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
            <h5 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-4 text-lg font-bold text-[#0f172a]">
              <Sparkles className="h-5 w-5 text-[#0047C7]" /> Skills <span className="text-rose-500">*</span>
            </h5>
            <div
              onClick={() => document.getElementById('skillInput')?.focus()}
              className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 p-3 cursor-text"
            >
              {skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0047C7]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSkill(skill);
                    }}
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                id="skillInput"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                placeholder="Type skill and press Enter..."
                className="min-w-[140px] flex-1 border-none px-1 py-1 text-xs text-slate-700 focus:outline-none"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Press Enter to add a skill.
            </p>
          </div>

          {/* Education */}
          <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
            <h5 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-4 text-lg font-bold text-[#0f172a]">
              <GraduationCap className="h-5 w-5 text-[#0047C7]" /> Education
            </h5>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SearchableSelect
                label="Highest Qualification"
                value={qualification}
                onChange={setQualification}
                options={qualifications}
                getOptionValue={getQualificationValue}
                getOptionLabel={getQualificationLabel}
                placeholder="Search qualification..."
                required
              />

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Year of Passing
                </label>
                <select
                  value={passingYear}
                  onChange={(e) => setPassingYear(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                >
                  <option value="">Select year</option>
                  <option>2020</option>
                  <option>2021</option>
                  <option>2022</option>
                  <option>2023</option>
                  <option>2024</option>
                  <option>2025</option>
                  <option>2026</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Field of Study
                </label>
                <input
                  type="text"
                  value={studyField}
                  onChange={(e) => setStudyField(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  College / University
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Resume */}
          <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
            <h5 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-4 text-lg font-bold text-[#0f172a]">
              <FileText className="h-5 w-5 text-[#0047C7]" /> Resume <span className="text-rose-500">*</span>
            </h5>

            <label
              htmlFor="resumeUpload"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed border-slate-200 px-6 py-8 text-center transition hover:border-[#0047C7] hover:bg-blue-50/40"
            >
              <UploadCloud className="h-8 w-8 text-[#0047C7]" />
              <h6 className="text-sm font-bold text-[#0f172a]">
                Upload your resume
              </h6>
              <p className="text-xs text-slate-400">
                PDF, DOC, or DOCX format. Max 5 MB.
              </p>
              <input
                type="file"
                id="resumeUpload"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleResumeUpload}
              />
            </label>

            {resumeFile && (
              <div className="mt-4 flex items-center gap-3 rounded-md border border-slate-100 p-4">
                <FileText className="h-8 w-8 shrink-0 text-rose-500" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-slate-800">
                    {resumeFile.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {resumeFile.size}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={deleteResume}
                  title="Remove resume"
                  className="shrink-0 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Account & Subscription */}
          <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
            <h5 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-4 text-lg font-bold text-[#0f172a]">
              <Calendar className="h-5 w-5 text-[#0047C7]" /> Account & Subscription
            </h5>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Current Plan
                </label>
                <input
                  type="text"
                  value={currentPlan}
                  readOnly
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Plan Validity
                </label>
                <input
                  type="date"
                  value={planValidity}
                  readOnly
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Account Status
                </label>
                <input
                  type="text"
                  value={status}
                  readOnly
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm capitalize text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="rounded-md border border-slate-100 bg-white p-6 shadow-sm">
            <h5 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-4 text-lg font-bold text-[#0f172a]">
              <Link2 className="h-5 w-5 text-[#0047C7]" /> Social & Professional Links
            </h5>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Portfolio Website
                </label>
                <input
                  type="url"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/yourusername"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Save / Cancel */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-md bg-[#0047C7] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#00389c]"
            >
              <Check className="h-4 w-4" /> Save Changes
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobseekerProfile;
