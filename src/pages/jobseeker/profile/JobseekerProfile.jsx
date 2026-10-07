import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  Briefcase,
  Calendar,
  Camera,
  Check,
  CheckCircle,
  Coins,
  Download,
  Edit3,
  Eye,
  FileText,
  GraduationCap,
  Link2,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  UploadCloud,
  User,
  X,
  XCircle
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import PageSkeleton from '../../../components/SkeletonLoader';
import { getWithCache } from '../../../utils/apiCache';

const getRefLabel = (value, keys = []) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return keys.map(key => value?.[key]).find(Boolean) || value?.name || value?._id || '';
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();
const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || '').trim());

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
const getQualificationLabel = (qualification) => qualification?.name || '';
const experienceOptions = ['Fresher', ...Array.from({ length: 10 }, (_, index) => `${index + 1}+ Years`)];
const currentYear = new Date().getFullYear();
const passingYearOptions = Array.from(
  { length: (currentYear + 4) - 1970 + 1 },
  (_, index) => String((currentYear + 4) - index)
);

const getFormattedResumeName = (candidateName, version = 1, filenameOrExt = '.pdf') => {
  const nameSlug = (candidateName || 'candidate')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'candidate';
  const extMatch = String(filenameOrExt || '').match(/\.[a-zA-Z0-9]+$/);
  const ext = extMatch ? extMatch[0] : (filenameOrExt && filenameOrExt.includes('.') ? `.${filenameOrExt.split('.').pop().split(/[?#]/)[0]}` : '.pdf');
  const ver = Number(version) || 1;
  return ver <= 1 ? `${nameSlug}_resume${ext}` : `${nameSlug}_resume_${ver}${ext}`;
};

const emptyExperience = {
  position: '',
  company: '',
  employmentType: 'Full-time',
  startDate: '',
  endDate: '',
  currentlyWorking: false,
  description: ''
};

const monthIndex = (value) => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})/);
  return match ? Number(match[1]) * 12 + Number(match[2]) : NaN;
};

const calculateTotalExperience = (exps) => {
  let totalMonths = 0;
  for (const exp of exps) {
    if (!exp.startDate) continue;
    const start = monthIndex(exp.startDate);
    const end = exp.currentlyWorking ? monthIndex(new Date().toISOString().slice(0, 7)) : monthIndex(exp.endDate);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      totalMonths += (end - start + 1);
    }
  }
  if (totalMonths === 0) return 'Fresher';
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  return parts.join(' ');
};

const validateExperiencePeriods = (experiences = []) => {
  const ranges = experiences.map((item, index) => ({
    index,
    start: monthIndex(item.startDate),
    end: item.currentlyWorking ? Number.MAX_SAFE_INTEGER : monthIndex(item.endDate)
  }));

  for (const item of ranges) {
    if (!Number.isFinite(item.start) || !Number.isFinite(item.end)) {
      return 'Start and end month are required for every experience.';
    }
    if (item.end < item.start) {
      return 'Experience end month cannot be before start month.';
    }
  }

  for (let i = 0; i < ranges.length; i += 1) {
    for (let j = i + 1; j < ranges.length; j += 1) {
      if (ranges[i].start <= ranges[j].end && ranges[j].start <= ranges[i].end) {
        return 'Two experiences cannot have the same or overlapping time period.';
      }
    }
  }

  return '';
};

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
  const displayValue = selected ? getOptionLabel(selected) : (isMongoObjectId(value) ? '' : value);
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

const SearchableMultiCitySelect = ({ label, values, onChange, options, required = false, disabled = false }) => {
  const [query, setQuery] = useState('');
  const selectedValues = values.map(value => normalizeText(value));
  const filtered = options
    .filter(city => getCityLabel(city).toLowerCase().includes(query.toLowerCase()))
    .filter(city => !selectedValues.includes(normalizeText(getCityValue(city))))
    .slice(0, 80);

  const addCity = (cityName) => {
    if (disabled || !cityName || selectedValues.includes(normalizeText(cityName))) return;
    onChange([...values, cityName]);
    setQuery('');
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-600">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className={`rounded-md border border-slate-200 p-3 transition ${disabled ? 'bg-slate-50/70' : 'bg-white'}`}>
        <div className="flex flex-wrap items-center gap-2">
          {values.map(city => (
            <span
              key={city}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0047C7]"
            >
              {city}
              {!disabled && (
                <button type="button" onClick={() => onChange(values.filter(item => item !== city))} aria-label={`Remove ${city}`} className="cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
          {values.length === 0 && disabled && (
            <span className="text-xs font-medium text-slate-400">None selected</span>
          )}
          {!disabled && (
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
          )}
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
  const [currentSalary, setCurrentSalary] = useState('');
  const [currentMonthlySalary, setCurrentMonthlySalary] = useState('');
  const [currentAnnualSalary, setCurrentAnnualSalary] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [annualSalary, setAnnualSalary] = useState('');
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
  const [experiences, setExperiences] = useState([]);
  const [relocate, setRelocate] = useState('yes');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeVersion, setResumeVersion] = useState(0);
  const [viewResumeModal, setViewResumeModal] = useState(false);

  // Edit mode & Change tracking
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const initialSnapshotRef = useRef('');
  const initialValuesRef = useRef(null);

  const getSnapshotObj = (data) => ({
    name: data.name ?? '',
    phone: data.phone ?? '',
    gender: data.gender ?? '',
    dob: data.dob ?? '',
    city: data.city ?? '',
    state: data.state ?? '',
    country: data.country ?? 'India',
    district: data.district ?? '',
    address: data.address ?? '',
    pinCode: data.pinCode ?? '',
    currentSalary: data.currentSalary ?? '',
    currentMonthlySalary: String(data.currentMonthlySalary ?? ''),
    currentAnnualSalary: String(data.currentAnnualSalary ?? ''),
    expectedSalary: data.expectedSalary ?? '',
    monthlySalary: String(data.monthlySalary ?? ''),
    annualSalary: String(data.annualSalary ?? ''),
    industryType: data.industryType ?? '',
    jobCategory: data.jobCategory ?? '',
    jobType: data.jobType ?? '',
    jobSearchStatus: data.jobSearchStatus ?? 'looking',
    qualification: data.qualification ?? '',
    passingYear: String(data.passingYear ?? ''),
    studyField: data.studyField ?? '',
    university: data.university ?? '',
    linkedin: data.linkedin ?? '',
    portfolio: data.portfolio ?? '',
    github: data.github ?? '',
    skills: Array.isArray(data.skills) ? [...data.skills] : [],
    relocate: data.relocate ?? 'yes',
    experiences: Array.isArray(data.experiences) ? data.experiences.map(e => ({
      position: e.position || '',
      company: e.company || '',
      employmentType: e.employmentType || 'Full-time',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
      currentlyWorking: Boolean(e.currentlyWorking),
      description: e.description || ''
    })) : [],
    locations: Array.isArray(data.locations) ? [...data.locations] : []
  });

  const captureInitialState = (data) => {
    const snapObj = getSnapshotObj(data);
    initialSnapshotRef.current = JSON.stringify(snapObj);
    initialValuesRef.current = snapObj;
  };

  const hasChanges = useMemo(() => {
    if (!isEditing || !initialSnapshotRef.current) return false;
    const currentObj = getSnapshotObj({
      name, phone, gender, dob, city, state, country, district, address, pinCode,
      currentSalary, currentMonthlySalary, currentAnnualSalary,
      expectedSalary, monthlySalary, annualSalary,
      industryType, jobCategory, jobType, jobSearchStatus,
      qualification, passingYear, studyField, university,
      linkedin, portfolio, github,
      skills, relocate, experiences, locations
    });
    return JSON.stringify(currentObj) !== initialSnapshotRef.current;
  }, [
    isEditing, name, phone, gender, dob, city, state, country, district, address, pinCode,
    currentSalary, currentMonthlySalary, currentAnnualSalary,
    expectedSalary, monthlySalary, annualSalary,
    industryType, jobCategory, jobType, jobSearchStatus,
    qualification, passingYear, studyField, university,
    linkedin, portfolio, github,
    skills, relocate, experiences, locations
  ]);

  const handleCancelEdit = () => {
    if (!initialValuesRef.current) {
      setIsEditing(false);
      return;
    }
    const init = initialValuesRef.current;
    setName(init.name);
    setPhone(init.phone);
    setGender(init.gender);
    setDob(init.dob);
    setCity(init.city);
    setState(init.state);
    setCountry(init.country);
    setDistrict(init.district);
    setAddress(init.address);
    setPinCode(init.pinCode);
    setCurrentSalary(init.currentSalary);
    setCurrentMonthlySalary(init.currentMonthlySalary);
    setCurrentAnnualSalary(init.currentAnnualSalary);
    setExpectedSalary(init.expectedSalary);
    setMonthlySalary(init.monthlySalary);
    setAnnualSalary(init.annualSalary);
    setIndustryType(init.industryType);
    setJobCategory(init.jobCategory);
    setJobType(init.jobType);
    setJobSearchStatus(init.jobSearchStatus);
    setQualification(init.qualification);
    setPassingYear(init.passingYear);
    setStudyField(init.studyField);
    setUniversity(init.university);
    setLinkedin(init.linkedin);
    setPortfolio(init.portfolio);
    setGithub(init.github);
    setSkills([...init.skills]);
    setRelocate(init.relocate);
    setExperiences(init.experiences.length > 0 ? [...init.experiences] : [{ ...emptyExperience }]);
    setLocations([...init.locations]);
    setError('');
    setIsEditing(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setViewResumeModal(false);
      }
    };
    if (viewResumeModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewResumeModal]);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [countryData, stateData, districtData, cityData, industryData, categoryData, typeData, qualificationData] = await Promise.all([
          getWithCache(`${BASE_API_URL}/masters/countries`, true),
          getWithCache(`${BASE_API_URL}/masters/states`, true),
          getWithCache(`${BASE_API_URL}/masters/districts`, true),
          getWithCache(`${BASE_API_URL}/masters/cities`, true),
          getWithCache(`${BASE_API_URL}/masters/industry-types`, true),
          getWithCache(`${BASE_API_URL}/masters/job-categories`, true),
          getWithCache(`${BASE_API_URL}/masters/job-types`, true),
          getWithCache(`${BASE_API_URL}/masters/qualifications`, true)
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
        const storedCurMonthly = Number(seeker.currentMonthlySalary) || 0;
        const storedCurAnnual = Number(seeker.currentAnnualSalary) || 0;
        const existingCurrent = seeker.currentSalary || '';
        let initCurMonthly = '';
        let initCurAnnual = '';
        let initCurrentSalary = existingCurrent;

        if (storedCurMonthly > 0 || storedCurAnnual > 0) {
          const cmVal = storedCurMonthly > 0 ? storedCurMonthly : Math.round(storedCurAnnual / 12);
          const caVal = storedCurAnnual > 0 ? storedCurAnnual : (storedCurMonthly * 12);
          initCurMonthly = String(cmVal);
          initCurAnnual = String(caVal);
          const cLpa = (caVal / 100000).toFixed(1).replace(/\.0$/, '');
          initCurrentSalary = existingCurrent || `₹${cmVal.toLocaleString('en-IN')} / Month (₹${caVal.toLocaleString('en-IN')} / Year · ${cLpa} LPA)`;
        } else if (existingCurrent) {
          const numbers = existingCurrent.match(/\d[\d,]*/g);
          if (numbers && numbers.length > 0) {
            const num = Number(numbers[0].replace(/,/g, ''));
            if (num > 0) {
              if (/ann|year|lpa|p\.?a/i.test(existingCurrent) && !/month/i.test(existingCurrent)) {
                initCurAnnual = String(num);
                initCurMonthly = String(Math.round(num / 12));
              } else {
                initCurMonthly = String(num);
                initCurAnnual = String(num * 12);
              }
            }
          }
        }
        setCurrentMonthlySalary(initCurMonthly);
        setCurrentAnnualSalary(initCurAnnual);
        setCurrentSalary(initCurrentSalary);

        const storedMonthly = Number(seeker.monthlySalary) || 0;
        const storedAnnual = Number(seeker.annualSalary) || 0;
        const existingExpected = seeker.expectedSalary || '';

        if (storedMonthly > 0 || storedAnnual > 0) {
          const mVal = storedMonthly > 0 ? storedMonthly : Math.round(storedAnnual / 12);
          const aVal = storedAnnual > 0 ? storedAnnual : (storedMonthly * 12);
          setMonthlySalary(String(mVal));
          setAnnualSalary(String(aVal));
          setExpectedSalary(existingExpected || `₹${mVal.toLocaleString('en-IN')} / Month (₹${aVal.toLocaleString('en-IN')} / Year)`);
        } else if (existingExpected) {
          const numbers = existingExpected.match(/\d[\d,]*/g);
          if (numbers && numbers.length > 0) {
            const num = Number(numbers[0].replace(/,/g, ''));
            if (num > 0) {
              if (/ann|year|lpa|p\.?a/i.test(existingExpected) && !/month/i.test(existingExpected)) {
                setAnnualSalary(String(num));
                setMonthlySalary(String(Math.round(num / 12)));
              } else {
                setMonthlySalary(String(num));
                setAnnualSalary(String(num * 12));
              }
            }
          }
          setExpectedSalary(existingExpected);
        } else {
          setMonthlySalary('');
          setAnnualSalary('');
          setExpectedSalary('');
        }
        setIndustryType(seeker.industryType?._id || getRefLabel(seeker.industryType, ['industryType', 'industryName', 'name']));
        setJobCategory(seeker.jobCategory?._id || getRefLabel(seeker.jobCategory, ['categoryName', 'name']));
        setJobType(seeker.jobType?._id || getRefLabel(seeker.jobType, ['jobType', 'name']));
        setCurrentPlan(getRefLabel(seeker.currentPlan, ['planName', 'name']));
        setPlanValidity(seeker.planValidity ? new Date(seeker.planValidity).toISOString().split('T')[0] : '');
        setStatus(seeker.status || '');
        setJobSearchStatus(seeker.jobSearchStatus || 'looking');
        setBio(seeker.bio || '');
        setQualification(getRefLabel(seeker.qualification, ['name']) || seeker.qualification?._id || '');
        setPassingYear(seeker.passingYear || '');
        setStudyField(seeker.studyField || '');
        setUniversity(seeker.university || '');
        setLinkedin(seeker.linkedin || '');
        setPortfolio(seeker.portfolio || '');
        setGithub(seeker.github || '');
        setProfileCompletionScore(Number(seeker.profileCompletionScore || 0));
        setSkills(seeker.skills || []);
        setRelocate(seeker.relocate || 'yes');
        const fetchedExps = Array.isArray(seeker.experiences) ? seeker.experiences : [];
        setExperiences(fetchedExps.length > 0 ? fetchedExps : [{ ...emptyExperience }]);
        
        if (seeker.preferredLocation) {
          setLocations(seeker.preferredLocation.split(',').map(l => l.trim()).filter(Boolean));
        }

        if (seeker.resume) {
          const candidateName = seeker.name || (seeker.userId ? `${seeker.userId.firstName || ''} ${seeker.userId.lastName || ''}`.trim() : '') || 'candidate';
          const defaultFormattedName = getFormattedResumeName(candidateName, seeker.resumeVersion || 1, seeker.resume);
          const resumeDisplayName = seeker.resumeName || defaultFormattedName;
          setResumeVersion(seeker.resumeVersion || 1);
          setResumeFile({
            name: resumeDisplayName,
            url: seeker.resume,
            size: 'Uploaded Document'
          });
        } else {
          setResumeFile(null);
          setResumeVersion(seeker.resumeVersion || 0);
        }

        const initialLocs = seeker.preferredLocation
          ? seeker.preferredLocation.split(',').map(l => l.trim()).filter(Boolean)
          : [];

        captureInitialState({
          name: seeker.name || '',
          phone: seeker.phone || '',
          gender: seeker.gender || '',
          dob: seeker.dob || '',
          city: seeker.city || '',
          state: seeker.state || '',
          country: seeker.country || 'India',
          district: seeker.district || '',
          address: seeker.address || '',
          pinCode: seeker.pinCode || '',
          currentSalary: initCurrentSalary,
          currentMonthlySalary: initCurMonthly,
          currentAnnualSalary: initCurAnnual,
          expectedSalary: (storedMonthly > 0 || storedAnnual > 0) ? (existingExpected || `₹${(storedMonthly > 0 ? storedMonthly : Math.round(storedAnnual / 12)).toLocaleString('en-IN')} / Month (₹${(storedAnnual > 0 ? storedAnnual : (storedMonthly * 12)).toLocaleString('en-IN')} / Year)`) : existingExpected,
          monthlySalary: String(storedMonthly > 0 ? storedMonthly : (storedAnnual > 0 ? Math.round(storedAnnual / 12) : '')),
          annualSalary: String(storedAnnual > 0 ? storedAnnual : (storedMonthly > 0 ? (storedMonthly * 12) : '')),
          industryType: seeker.industryType?._id || getRefLabel(seeker.industryType, ['industryType', 'industryName', 'name']),
          jobCategory: seeker.jobCategory?._id || getRefLabel(seeker.jobCategory, ['categoryName', 'name']),
          jobType: seeker.jobType?._id || getRefLabel(seeker.jobType, ['jobType', 'name']),
          jobSearchStatus: seeker.jobSearchStatus || 'looking',
          qualification: getRefLabel(seeker.qualification, ['name']) || seeker.qualification?._id || '',
          passingYear: seeker.passingYear || '',
          studyField: seeker.studyField || '',
          university: seeker.university || '',
          linkedin: seeker.linkedin || '',
          portfolio: seeker.portfolio || '',
          github: seeker.github || '',
          skills: seeker.skills || [],
          relocate: seeker.relocate || 'yes',
          experiences: fetchedExps.length > 0 ? fetchedExps : [{ ...emptyExperience }],
          locations: initialLocs
        });
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

    // Reset input so re-selecting same file triggers onChange
    e.target.value = '';

    const candidateName = name || 'candidate';
    const nextVer = (resumeVersion || 0) + 1;
    const tempDisplayName = getFormattedResumeName(candidateName, nextVer, file.name);

    setResumeFile({
      name: tempDisplayName,
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
        const ver = response.data.resumeVersion || nextVer;
        setResumeVersion(ver);
        const resumeDisplayName = response.data.resumeName || getFormattedResumeName(candidateName, ver, file.name);
        setResumeFile({
          name: resumeDisplayName,
          url: response.data.resume,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB · Uploaded Document`
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
        setViewResumeModal(false);
      } catch (err) {
        console.error('Failed to delete resume:', err);
        setError(err.response?.data?.message || 'Failed to delete resume.');
      }
    }
  };

  const handleCurrentMonthlySalaryChange = (value) => {
    const cleanNum = value.replace(/[^0-9]/g, '');
    setCurrentMonthlySalary(cleanNum);
    if (!cleanNum) {
      setCurrentAnnualSalary('');
      setCurrentSalary('');
      return;
    }
    const m = Number(cleanNum);
    const a = m * 12;
    setCurrentAnnualSalary(String(a));
    const lpa = (a / 100000).toFixed(1).replace(/\.0$/, '');
    setCurrentSalary(`₹${m.toLocaleString('en-IN')} / Month (₹${a.toLocaleString('en-IN')} / Year · ${lpa} LPA)`);
  };

  const handleCurrentAnnualSalaryChange = (value) => {
    const cleanNum = value.replace(/[^0-9]/g, '');
    setCurrentAnnualSalary(cleanNum);
    if (!cleanNum) {
      setCurrentMonthlySalary('');
      setCurrentSalary('');
      return;
    }
    const a = Number(cleanNum);
    const m = Math.round(a / 12);
    setCurrentMonthlySalary(String(m));
    const lpa = (a / 100000).toFixed(1).replace(/\.0$/, '');
    setCurrentSalary(`₹${m.toLocaleString('en-IN')} / Month (₹${a.toLocaleString('en-IN')} / Year · ${lpa} LPA)`);
  };

  const handleSetCurrentSalaryFresher = () => {
    setCurrentMonthlySalary('0');
    setCurrentAnnualSalary('0');
    setCurrentSalary('₹0 (Fresher / Unemployed)');
  };

  const handleMonthlySalaryChange = (value) => {
    const cleanNum = value.replace(/[^0-9]/g, '');
    setMonthlySalary(cleanNum);
    if (!cleanNum) {
      setAnnualSalary('');
      setExpectedSalary('');
      return;
    }
    const m = Number(cleanNum);
    const a = m * 12;
    setAnnualSalary(String(a));
    const lpa = (a / 100000).toFixed(1).replace(/\.0$/, '');
    setExpectedSalary(`₹${m.toLocaleString('en-IN')} / Month (₹${a.toLocaleString('en-IN')} / Year · ${lpa} LPA)`);
  };

  const handleAnnualSalaryChange = (value) => {
    const cleanNum = value.replace(/[^0-9]/g, '');
    setAnnualSalary(cleanNum);
    if (!cleanNum) {
      setMonthlySalary('');
      setExpectedSalary('');
      return;
    }
    const a = Number(cleanNum);
    const m = Math.round(a / 12);
    setMonthlySalary(String(m));
    const lpa = (a / 100000).toFixed(1).replace(/\.0$/, '');
    setExpectedSalary(`₹${m.toLocaleString('en-IN')} / Month (₹${a.toLocaleString('en-IN')} / Year · ${lpa} LPA)`);
  };

  const addSkill = (e) => {
    if (e && e.key && e.key !== 'Enter' && e.key !== ',') return;
    if (e && e.preventDefault) e.preventDefault();
    const value = skillInput.replace(/,/g, '').trim();
    if (!value) return;
    if (/^\d+$/.test(value)) {
      setError('Skill name cannot consist solely of digits.');
      return;
    }
    if (!/^[a-zA-Z0-9+#.\s/-]{2,40}$/.test(value)) {
      setError('Please enter a valid skill name.');
      return;
    }
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setError('Skill has already been added.');
      return;
    }
    setError('');
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

  useEffect(() => {
    if (!isMongoObjectId(qualification) || !selectedQualification) return;
    const label = getQualificationLabel(selectedQualification);
    if (label) setQualification(label);
  }, [qualification, selectedQualification]);

  const handleSave = async () => {
    if (!hasChanges || saving) return;
    setError('');
    setSaved(false);
    setSaving(true);

    if (phone) {
      const cleaned = String(phone).replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleaned)) {
        setError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
        setSaving(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (studyField && (studyField.trim().length < 2 || !/[a-zA-Z]/.test(studyField.trim()))) {
      setError('Please enter a valid Field of Study containing letters (e.g. Computer Science).');
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (university && (university.trim().length < 2 || !/[a-zA-Z]/.test(university.trim()))) {
      setError('Please enter a valid College / University name containing letters.');
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    let finalSkills = [...skills];
    if (skillInput.trim()) {
      const raw = skillInput.replace(/,/g, '').trim();
      if (/^\d+$/.test(raw)) {
        setError('Skill name cannot consist solely of digits.');
        setSaving(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!/^[a-zA-Z0-9+#.\s/-]{2,40}$/.test(raw)) {
        setError('Please enter a valid skill name.');
        setSaving(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!finalSkills.some(s => s.toLowerCase() === raw.toLowerCase())) {
        finalSkills.push(raw);
        setSkills(finalSkills);
      }
      setSkillInput('');
    }

    try {
      const cleanExperiences = experiences
        .map(item => ({
          ...item,
          position: String(item.position || '').trim(),
          company: String(item.company || '').trim(),
          employmentType: item.employmentType || 'Full-time',
          startDate: String(item.startDate || '').slice(0, 7),
          endDate: item.currentlyWorking ? '' : String(item.endDate || '').slice(0, 7),
          description: String(item.description || '').trim()
        }))
        .filter(item => item.position || item.company || item.startDate || item.endDate || item.description);
      const periodError = validateExperiencePeriods(cleanExperiences);
      if (periodError) {
        setError(periodError);
        setSaving(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const computedDesignation = cleanExperiences[0]?.position || '';
      const computedBio = cleanExperiences[0]?.description || '';
      const computedExperience = calculateTotalExperience(cleanExperiences);

      setDesignation(computedDesignation);
      setBio(computedBio);
      setExperience(computedExperience);

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
        designation: computedDesignation,
        relocate,
        experience: computedExperience,
        experiences: cleanExperiences,
        currentSalary,
        currentMonthlySalary: Number(currentMonthlySalary) || 0,
        currentAnnualSalary: Number(currentAnnualSalary) || 0,
        expectedSalary,
        monthlySalary: Number(monthlySalary) || 0,
        annualSalary: Number(annualSalary) || 0,
        industryType: selectedIndustry?._id || industryType,
        jobCategory: selectedJobCategory?._id || jobCategory,
        jobType: selectedJobType?._id || jobType,
        bio: computedBio,
        skills: finalSkills,
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

      captureInitialState({
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
        currentSalary,
        currentMonthlySalary: String(currentMonthlySalary),
        currentAnnualSalary: String(currentAnnualSalary),
        expectedSalary,
        monthlySalary: String(monthlySalary),
        annualSalary: String(annualSalary),
        industryType: selectedIndustry?._id || industryType,
        jobCategory: selectedJobCategory?._id || jobCategory,
        jobType: selectedJobType?._id || jobType,
        jobSearchStatus,
        qualification: selectedQualification?._id || qualification,
        passingYear,
        studyField,
        university,
        linkedin,
        portfolio,
        github,
        skills: finalSkills,
        relocate,
        experiences: cleanExperiences,
        locations
      });

      setIsEditing(false);
      setSaved(true);
      setToast({ show: true, message: 'Profile updated successfully!', type: 'success' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSaved(false), 3000);
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
    } catch (err) {
      console.error('Save profile error:', err);
      const errMsg = err.response?.data?.message || 'Failed to save changes. Please try again.';
      setError(errMsg);
      setToast({ show: true, message: errMsg, type: 'error' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageSkeleton variant="detail" />;
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl transition-all animate-in slide-in-from-top-4 duration-300 ${
          toast.type === 'error'
            ? 'border-rose-200 bg-white shadow-rose-500/15'
            : 'border-emerald-200 bg-white shadow-emerald-500/15'
        }`}>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            toast.type === 'error'
              ? 'bg-rose-100 text-rose-600'
              : 'bg-emerald-100 text-emerald-600'
          }`}>
            {toast.type === 'error' ? <XCircle className="h-5 w-5" /> : <Check className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              {toast.type === 'error' ? 'Error' : 'Success'}
            </p>
            <p className="text-xs font-semibold text-slate-600 max-w-xs sm:max-w-sm">
              {toast.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToast({ show: false, message: '', type: 'success' })}
            className="ml-3 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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

          {isEditing && (
            <>
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
            </>
          )}
        </div>

        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-[#0f172a]">
                {name}
              </h3>
              <div className="mt-1 text-sm text-slate-500">
                <span className="font-bold text-slate-700">{designation || 'Job Seeker'}</span>
              </div>
            </div>

            {/* Header Action Button */}
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 self-center sm:self-start rounded-xl bg-[#0047C7] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#00389c] hover:shadow cursor-pointer"
              >
                <Edit3 className="h-4 w-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 self-center sm:self-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> Editing Mode
                </span>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold text-white shadow-sm transition ${
                    hasChanges && !saving
                      ? 'bg-[#FF6B00] hover:bg-[#e05e00] cursor-pointer'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
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
                  disabled={!isEditing}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
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
                  disabled={!isEditing}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  disabled={!isEditing}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Gender
                </label>
                <select
                  value={gender}
                  disabled={!isEditing}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
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
                disabled={!isEditing}
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
                disabled={!isEditing || !selectedCountryKey}
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
                disabled={!isEditing || !selectedStateKey}
              />

              <SearchableSelect
                label="City"
                value={city}
                onChange={setCity}
                options={availableCities}
                getOptionValue={getCityValue}
                getOptionLabel={getCityLabel}
                placeholder="Search city..."
                disabled={!isEditing || !selectedDistrictKey}
              />

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Pin Code
                </label>
                <input
                  type="text"
                  value={pinCode}
                  disabled={!isEditing}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Full Address
                </label>
                <input
                  type="text"
                  value={address}
                  disabled={!isEditing}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                />
              </div>

              {/* Designation is automatically calculated from experiences */}

              {/* Preferred Location */}
              <div className="sm:col-span-2">
                <SearchableMultiCitySelect
                  label="Preferred Location"
                  values={locations}
                  onChange={setLocations}
                  options={cities}
                  disabled={!isEditing}
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
                    disabled={!isEditing}
                    onClick={() => setRelocate('yes')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-bold transition ${
                      relocate === 'yes'
                        ? 'border-[#0047C7] bg-blue-50 text-[#0047C7]'
                        : 'border-slate-200 text-slate-500'
                    } ${!isEditing ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                  >
                    <CheckCircle className="h-4 w-4" /> Yes, willing
                  </button>
                  <button
                    type="button"
                    disabled={!isEditing}
                    onClick={() => setRelocate('no')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-bold transition ${
                      relocate === 'no'
                        ? 'border-[#0047C7] bg-blue-50 text-[#0047C7]'
                        : 'border-slate-200 text-slate-500'
                    } ${!isEditing ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
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
              {/* Current Salary with Auto-Calculation (Added before Expected Salary) */}
              <div className="sm:col-span-2 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-slate-50/60 p-4 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <Coins className="h-4 w-4" />
                    </span>
                    <div>
                      <label className="block text-sm font-bold text-slate-800">
                        Current Salary (वर्तमान वेतन)
                      </label>
                      <span className="text-xs font-semibold text-slate-500">
                        Last drawn or current monthly & annual compensation
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentAnnualSalary && Number(currentAnnualSalary) > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700">
                        {(Number(currentAnnualSalary) / 100000).toFixed(1).replace(/\.0$/, '')} LPA
                      </span>
                    ) : null}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleSetCurrentSalaryFresher}
                        className="rounded-md border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-50"
                      >
                        Fresher / ₹0
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Current Monthly Salary Input */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      Current Monthly Salary (₹ / Month)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-sm font-bold text-slate-400">₹</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={currentMonthlySalary}
                        disabled={!isEditing}
                        onChange={(e) => handleCurrentMonthlySalaryChange(e.target.value)}
                        placeholder="e.g. 25000"
                        className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-2.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                      />
                    </div>
                    {currentMonthlySalary && Number(currentMonthlySalary) > 0 ? (
                      <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                        ₹{Number(currentMonthlySalary).toLocaleString('en-IN')} per month
                      </p>
                    ) : null}
                  </div>

                  {/* Current Annual Salary Input */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      Current Annual Salary (₹ / Year)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-sm font-bold text-slate-400">₹</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={currentAnnualSalary}
                        disabled={!isEditing}
                        onChange={(e) => handleCurrentAnnualSalaryChange(e.target.value)}
                        placeholder="e.g. 300000"
                        className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-2.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                      />
                    </div>
                    {currentAnnualSalary && Number(currentAnnualSalary) > 0 ? (
                      <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                        ₹{Number(currentAnnualSalary).toLocaleString('en-IN')} per year
                      </p>
                    ) : null}
                  </div>
                </div>

                {currentSalary ? (
                  <div className="mt-3 flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-700 border border-emerald-200/80">
                    <span className="text-slate-400">Current Salary Summary:</span>
                    <span className="font-bold text-emerald-700">{currentSalary}</span>
                  </div>
                ) : null}
              </div>

              {/* Expected Salary with Auto-Calculation */}
              <div className="sm:col-span-2 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-slate-50/60 p-4 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-[#0047C7]">
                      <TrendingUp className="h-4 w-4" />
                    </span>
                    <div>
                      <label className="block text-sm font-bold text-slate-800">
                        Expected Salary (अपेक्षित वेतन)
                      </label>
                      <span className="text-xs font-semibold text-blue-600">
                        Target compensation for future opportunities
                      </span>
                    </div>
                  </div>
                  {annualSalary && Number(annualSalary) > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-extrabold text-[#0047C7]">
                      {(Number(annualSalary) / 100000).toFixed(1).replace(/\.0$/, '')} LPA
                    </span>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Monthly Salary Input */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      Expected Monthly Salary (₹ / Month)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-sm font-bold text-slate-400">₹</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={monthlySalary}
                        disabled={!isEditing}
                        onChange={(e) => handleMonthlySalaryChange(e.target.value)}
                        placeholder="e.g. 25000"
                        className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-2.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-[#0047C7] focus:outline-none focus:ring-1 focus:ring-[#0047C7] disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                      />
                    </div>
                    {monthlySalary && Number(monthlySalary) > 0 ? (
                      <p className="mt-1 text-[11px] font-semibold text-[#0047C7]">
                        ₹{Number(monthlySalary).toLocaleString('en-IN')} per month
                      </p>
                    ) : null}
                  </div>

                  {/* Annual Salary Input */}
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">
                      Expected Annual Salary (₹ / Year)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-sm font-bold text-slate-400">₹</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={annualSalary}
                        disabled={!isEditing}
                        onChange={(e) => handleAnnualSalaryChange(e.target.value)}
                        placeholder="e.g. 300000"
                        className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-2.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-[#0047C7] focus:outline-none focus:ring-1 focus:ring-[#0047C7] disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                      />
                    </div>
                    {annualSalary && Number(annualSalary) > 0 ? (
                      <p className="mt-1 text-[11px] font-semibold text-[#0047C7]">
                        ₹{Number(annualSalary).toLocaleString('en-IN')} per year
                      </p>
                    ) : null}
                  </div>
                </div>

                {expectedSalary ? (
                  <div className="mt-3 flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-700 border border-blue-200/80">
                    <span className="text-slate-400">Expected Salary Summary:</span>
                    <span className="font-bold text-[#0047C7]">{expectedSalary}</span>
                  </div>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Job Search Status
                </label>
                <select
                  value={jobSearchStatus}
                  disabled={!isEditing}
                  onChange={(e) => setJobSearchStatus(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                >
                  <option value="looking">Looking for job</option>
                  <option value="not-looking">Not looking</option>
                </select>
              </div>

              <SearchableSelect
                label="Industry Type"
                value={industryType}
                disabled={!isEditing}
                onChange={setIndustryType}
                options={industries}
                getOptionValue={getIndustryValue}
                getOptionLabel={getIndustryLabel}
                placeholder="Search industry..."
              />

              <SearchableSelect
                label="Job Category"
                value={jobCategory}
                disabled={!isEditing}
                onChange={setJobCategory}
                options={jobCategories}
                getOptionValue={getJobCategoryValue}
                getOptionLabel={getJobCategoryLabel}
                placeholder="Search job category..."
              />

              <SearchableSelect
                label="Job Type"
                value={jobType}
                disabled={!isEditing}
                onChange={setJobType}
                options={jobTypes}
                getOptionValue={getJobTypeValue}
                getOptionLabel={getJobTypeLabel}
                placeholder="Search job type..."
              />

              {/* Summary is automatically calculated from experiences */}

              <div className="sm:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <label className="block text-sm font-bold text-slate-600">
                    Company Experience
                  </label>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setExperiences([...experiences, { ...emptyExperience }])}
                      className="rounded-md border border-[#0047C7] px-3 py-1.5 text-xs font-extrabold text-[#0047C7] hover:bg-blue-50 cursor-pointer"
                    >
                      + Add Experience
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {experiences.map((item, index) => (
                    <div key={index} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-extrabold text-slate-700">Experience {index + 1}</p>
                        {isEditing && index > 0 && (
                          <button
                            type="button"
                            onClick={() => setExperiences(experiences.filter((_, itemIndex) => itemIndex !== index))}
                            className="text-xs font-extrabold text-rose-600 cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={item.position || ''}
                          disabled={!isEditing}
                          onChange={(e) => setExperiences(experiences.map((exp, itemIndex) => itemIndex === index ? { ...exp, position: e.target.value } : exp))}
                          placeholder="Position"
                          className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                        />
                        <input
                          type="text"
                          value={item.company || ''}
                          disabled={!isEditing}
                          onChange={(e) => setExperiences(experiences.map((exp, itemIndex) => itemIndex === index ? { ...exp, company: e.target.value } : exp))}
                          placeholder="Company"
                          className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                        />
                        <input
                          type="text"
                          value={item.employmentType || ''}
                          disabled={!isEditing}
                          onChange={(e) => setExperiences(experiences.map((exp, itemIndex) => itemIndex === index ? { ...exp, employmentType: e.target.value } : exp))}
                          placeholder="Employment Type"
                          className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                        />
                        <label className={`flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 ${!isEditing ? 'opacity-80 cursor-not-allowed' : ''}`}>
                          <input
                            type="checkbox"
                            disabled={!isEditing}
                            checked={Boolean(item.currentlyWorking)}
                            onChange={(e) => setExperiences(experiences.map((exp, itemIndex) => itemIndex === index ? { ...exp, currentlyWorking: e.target.checked, endDate: e.target.checked ? '' : exp.endDate } : exp))}
                          />
                          Currently working here
                        </label>
                        <div>
                          <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Start Date</label>
                          <input
                            type="month"
                            value={item.startDate || ''}
                            disabled={!isEditing}
                            onChange={(e) => setExperiences(experiences.map((exp, itemIndex) => itemIndex === index ? { ...exp, startDate: e.target.value } : exp))}
                            className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-slate-500">End Date</label>
                          <input
                            type="month"
                            value={item.currentlyWorking ? '' : (item.endDate || '')}
                            disabled={!isEditing || Boolean(item.currentlyWorking)}
                            onChange={(e) => setExperiences(experiences.map((exp, itemIndex) => itemIndex === index ? { ...exp, endDate: e.target.value } : exp))}
                            className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                          />
                        </div>
                        <textarea
                          rows={3}
                          value={item.description || ''}
                          disabled={!isEditing}
                          onChange={(e) => setExperiences(experiences.map((exp, itemIndex) => itemIndex === index ? { ...exp, description: e.target.value } : exp))}
                          placeholder="What did you work on?"
                          className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none sm:col-span-2 disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
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
              onClick={() => { if (isEditing) document.getElementById('skillInput')?.focus(); }}
              className={`flex flex-wrap items-center gap-2 rounded-md border border-slate-200 p-3 ${
                isEditing ? 'cursor-text bg-white' : 'cursor-default bg-slate-50/70'
              }`}
            >
              {skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0047C7]"
                >
                  {skill}
                  {isEditing && (
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
                  )}
                </span>
              ))}
              {isEditing && (
                <input
                  type="text"
                  id="skillInput"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  placeholder="Type skill and press Enter..."
                  className="min-w-[140px] flex-1 border-none bg-transparent px-1 py-1 text-xs text-slate-700 focus:outline-none"
                />
              )}
            </div>
            {isEditing ? (
              <p className="mt-1.5 text-xs text-slate-400">
                Press Enter to add a skill.
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-400">
                Click &quot;Edit Profile&quot; to add or remove skills.
              </p>
            )}
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
                disabled={!isEditing}
              />

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Year of Passing
                </label>
                <select
                  value={passingYear}
                  disabled={!isEditing}
                  onChange={(e) => setPassingYear(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                >
                  <option value="">Select year</option>
                  {passingYearOptions.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Field of Study
                </label>
                <input
                  type="text"
                  value={studyField}
                  disabled={!isEditing}
                  onChange={(e) => setStudyField(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  College / University
                </label>
                <input
                  type="text"
                  value={university}
                  disabled={!isEditing}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
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
              htmlFor={isEditing ? 'resumeUpload' : undefined}
              className={`flex flex-col items-center gap-2 rounded-md border-2 border-dashed border-slate-200 px-6 py-8 text-center transition ${
                isEditing
                  ? 'cursor-pointer hover:border-[#0047C7] hover:bg-blue-50/40'
                  : 'cursor-not-allowed bg-slate-50/60 opacity-75'
              }`}
            >
              <UploadCloud className="h-8 w-8 text-[#0047C7]" />
              <h6 className="text-sm font-bold text-[#0f172a]">
                {resumeFile ? 'Upload New Resume (Replaces Current)' : 'Upload your resume'}
              </h6>
              <p className="text-xs text-slate-400">
                {isEditing ? 'PDF, DOC, or DOCX format. Max 5 MB.' : 'Click "Edit Profile" to change resume.'}
              </p>
              {isEditing && (
                <input
                  type="file"
                  id="resumeUpload"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleResumeUpload}
                />
              )}
            </label>

            {resumeFile && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200/80 bg-slate-50/60 p-4 transition">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 border border-rose-100">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-slate-800" title={resumeFile.name}>
                      {resumeFile.name}
                    </div>
                    <div className="text-xs font-medium text-slate-400">
                      {resumeFile.size}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {resumeFile.url && (
                    <button
                      type="button"
                      onClick={() => setViewResumeModal(true)}
                      title="View Resume"
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-blue-50 hover:text-[#0047C7] hover:border-blue-200"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={deleteResume}
                      title="Remove resume"
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
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
                  disabled={!isEditing}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  Portfolio Website
                </label>
                <input
                  type="url"
                  value={portfolio}
                  disabled={!isEditing}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-600">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  value={github}
                  disabled={!isEditing}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/yourusername"
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-[#0047C7] focus:outline-none disabled:bg-slate-50/70 disabled:text-slate-600 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className="flex items-center justify-center gap-1.5 rounded-md bg-[#0047C7] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#00389c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
                {!hasChanges && (
                  <span className="text-xs italic text-slate-400">
                    (No changes made yet)
                  </span>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="flex items-center justify-center gap-2 rounded-md bg-[#0047C7] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#00389c]"
              >
                <Edit3 className="h-4 w-4" /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* In-App Resume Preview Modal */}
      {viewResumeModal && resumeFile && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setViewResumeModal(false)}
        >
          <div
            className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 border border-rose-100">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-extrabold text-slate-800 sm:text-base" title={resumeFile.name}>
                    {resumeFile.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">{resumeFile.size || 'Document Preview'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {resumeFile.url && (
                  <a
                    href={resumeFile.url}
                    download={resumeFile.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-100 hover:text-[#0047C7]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setViewResumeModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                  title="Close preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Document Preview */}
            <div className="relative flex-1 bg-slate-100/70 overflow-hidden">
              {resumeFile.url ? (
                resumeFile.name.toLowerCase().endsWith('.doc') || resumeFile.name.toLowerCase().endsWith('.docx') ? (
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(resumeFile.url)}&embedded=true`}
                    title={resumeFile.name}
                    className="h-full w-full border-0"
                  />
                ) : (
                  <iframe
                    src={`${resumeFile.url}#toolbar=1`}
                    title={resumeFile.name}
                    className="h-full w-full border-0"
                  />
                )
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-500">
                  <FileText className="h-12 w-12 text-slate-300 mb-2" />
                  <p className="text-sm font-semibold">Preview not available for this document.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobseekerProfile;
