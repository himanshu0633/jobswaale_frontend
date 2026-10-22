import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity,
  Bookmark,
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Clock,
  Download,
  Eye,
  Filter,
  GraduationCap,
  IndianRupee,
  Info,
  Layers,
  Loader,
  Lock,
  MapPin,
  MessageCircle,
  MoreVertical,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Unlock,
  User,
  UserCheck,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import ClearFilterButton from '../../../components/ClearFilterButton';
import { downloadBlobResponse, viewBlobResponse } from '../../../utils/downloadFile';
import SkillMultiSelectFilter from '../../../components/SkillMultiSelectFilter';

const initialFilters = {
  // 9 Filters: Title/Skills, Exp, Loc, Salary, Gender, Qual, Industry Type, Job Category, Activity
  search: '',
  jobTitle: '',
  skills: [],
  skill: '',
  minExp: '',
  maxExp: '',
  location: '',
  locations: [],
  includeRelocate: true,
  excludeAnywhere: false,
  minSalary: '',
  maxSalary: '',
  gender: '',
  qualification: '',
  industryType: '',
  jobCategory: '',
  department: '',
  activity: '',
  // Sorting & Extra
  sortBy: ''
};

const minExpOptions = [
  { value: '', label: 'Min Exp (Any)' },
  { value: '0', label: '0 (Fresher)' },
  { value: '1', label: '1 Year' },
  { value: '2', label: '2 Years' },
  { value: '3', label: '3 Years' },
  { value: '4', label: '4 Years' },
  { value: '5', label: '5 Years' },
  { value: '7', label: '7 Years' },
  { value: '10', label: '10 Years' },
  { value: '15', label: '15+ Years' }
];

const maxExpOptions = [
  { value: '', label: 'Max Exp (Any)' },
  { value: '1', label: '1 Year' },
  { value: '2', label: '2 Years' },
  { value: '3', label: '3 Years' },
  { value: '5', label: '5 Years' },
  { value: '7', label: '7 Years' },
  { value: '10', label: '10 Years' },
  { value: '15', label: '15 Years' },
  { value: '20', label: '20+ Years' }
];

const minSalaryOptions = [
  { value: '', label: 'Min CTC (Any)' },
  { value: '1', label: '₹1 LPA' },
  { value: '2', label: '₹2 LPA' },
  { value: '3', label: '₹3 LPA' },
  { value: '5', label: '₹5 LPA' },
  { value: '7', label: '₹7 LPA' },
  { value: '10', label: '₹10 LPA' },
  { value: '15', label: '₹15 LPA' },
  { value: '20', label: '₹20 LPA' },
  { value: '25', label: '₹25 LPA' },
  { value: '30', label: '₹30 LPA' },
  { value: '50', label: '₹50 LPA' }
];

const maxSalaryOptions = [
  { value: '', label: 'Max CTC (Any)' },
  { value: '2', label: '₹2 LPA' },
  { value: '3', label: '₹3 LPA' },
  { value: '5', label: '₹5 LPA' },
  { value: '7', label: '₹7 LPA' },
  { value: '10', label: '₹10 LPA' },
  { value: '15', label: '₹15 LPA' },
  { value: '20', label: '₹20 LPA' },
  { value: '25', label: '₹25 LPA' },
  { value: '30', label: '₹30 LPA' },
  { value: '50', label: '₹50 LPA' },
  { value: '75', label: '₹75 LPA' },
  { value: '100', label: '₹100 LPA' }
];

const genderOptions = [
  { value: '', label: 'Any Gender' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' }
];

const activityOptions = [
  { value: '', label: 'All Candidates' },
  { value: '3months', label: 'Active within 3 Months' },
  { value: '6months', label: 'Active within 6 Months' },
  { value: '1month', label: 'Active within 30 Days' }
];

const standardQualifications = [
  'B.Pharm', 'M.Pharm', 'B.Sc.', 'M.Sc.', 'MBA', 'B.Tech', 'M.Tech', 'B.Com', 'Diploma', 'Ph.D', '12th Pass'
];

const standardIndustries = [
  'Pharmaceutical',
  'Biotechnology',
  'Healthcare & Hospitals',
  'Chemical & Petrochemical',
  'Medical Devices',
  'Clinical Research (CRO)',
  'FMCG / Food & Beverage',
  'Cosmetics & Personal Care',
  'Ayush / Herbal & Ayurvedic',
  'Information Technology / Pharma IT',
  'Manufacturing',
  'Packaging & Logistics'
];

const standardJobCategories = [
  'Quality Assurance (QA)',
  'Quality Control (QC)',
  'Production & Manufacturing',
  'Regulatory Affairs (RA)',
  'R&D / Formulation',
  'Analytical Development (AR&D)',
  'Microbiology',
  'Packaging & Labeling',
  'Maintenance & Engineering',
  'Pharmacovigilance (PV)',
  'Clinical Operations',
  'Supply Chain & Warehouse',
  'Human Resources (HR)',
  'Sales & Marketing',
  'Administration'
];

const statCards = [
  { key: 'total', title: 'Total', icon: Users, tone: 'bg-violet-50 text-[#6658dd]' },
  { key: 'availableNow', title: 'Available Now', icon: UserCheck, tone: 'bg-emerald-50 text-emerald-500' },
  { key: 'newThisWeek', title: 'New This Week', icon: UserPlus, tone: 'bg-sky-50 text-sky-500' },
  { key: 'premiumProfiles', title: 'Premium Profiles', icon: Star, tone: 'bg-amber-50 text-amber-500' },
  { key: 'activeToday', title: 'Active Today', icon: Activity, tone: 'bg-blue-50 text-blue-500' }
];

const availabilityTone = {
  Immediate: 'bg-emerald-50 text-emerald-500',
  '15 Days': 'bg-sky-50 text-sky-500',
  '30 Days': 'bg-amber-50 text-amber-500',
  '60 Days': 'bg-slate-100 text-slate-500',
  '90 Days': 'bg-slate-100 text-slate-500'
};

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const downloadCandidateResume = async (candidate) => {
  if (!candidate?.id) return;
  try {
    const response = await axios.get(`${BASE_API_URL}/employer/candidates/${candidate.id}/resume-download`, {
      headers: getTokenHeaders(),
      responseType: 'blob'
    });
    await downloadBlobResponse(response, `${candidate.name || 'candidate'}-resume`);

    const remainingUnlocks = response.headers['x-remaining-unlocks'];
    const isNewUnlock = response.headers['x-is-new-unlock'] === 'true';

    if (isNewUnlock && remainingUnlocks !== undefined) {
      const event = new CustomEvent('resume-unlock-success', { detail: { remainingUnlocks } });
      window.dispatchEvent(event);
    }
  } catch (err) {
    if (err.response?.data instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const errorObj = JSON.parse(reader.result);
          alert(errorObj.message || 'Resume could not be downloaded.');
        } catch {
          alert('Resume could not be downloaded.');
        }
      };
      reader.readAsText(err.response.data);
    } else {
      alert(err.response?.data?.message || 'Resume could not be downloaded.');
    }
  }
};

const viewCandidateResume = async (candidate) => {
  if (!candidate?.id) return;
  const newTab = window.open('about:blank', '_blank');
  try {
    const response = await axios.get(`${BASE_API_URL}/employer/candidates/${candidate.id}/resume-download`, {
      headers: getTokenHeaders(),
      responseType: 'blob'
    });
    await viewBlobResponse(response, newTab);

    const remainingUnlocks = response.headers['x-remaining-unlocks'];
    const isNewUnlock = response.headers['x-is-new-unlock'] === 'true';

    if (isNewUnlock && remainingUnlocks !== undefined) {
      const event = new CustomEvent('resume-unlock-success', { detail: { remainingUnlocks } });
      window.dispatchEvent(event);
    }
  } catch (err) {
    if (newTab && !newTab.closed) {
      newTab.close();
    }
    if (err.response?.data instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const errorObj = JSON.parse(reader.result);
          alert(errorObj.message || 'Resume could not be viewed.');
        } catch {
          alert('Resume could not be viewed.');
        }
      };
      reader.readAsText(err.response.data);
    } else {
      alert(err.response?.data?.message || 'Resume could not be viewed.');
    }
  }
};

const renderCandidateSalaryCell = (val, isExpected = false) => {
  if (!val || val === 'Not specified' || val === '-' || val === 'N/A') {
    return <span className="text-xs font-medium text-slate-400">Not specified</span>;
  }
  const str = String(val).trim();

  const monthlyMatch = str.match(/^₹?([0-9,]+)\s*\/\s*(?:Month|mo)\s*\((.+)\)$/i);
  if (monthlyMatch) {
    const monthlyAmt = `₹${monthlyMatch[1]}/mo`;
    const details = monthlyMatch[2];
    const lpaMatch = details.match(/([0-9.]+\s*LPA)/i);
    const subText = lpaMatch ? lpaMatch[1] : details.replace(/\s*\/\s*Year/i, '/yr');
    return (
      <div className="leading-tight">
        <span className={`text-xs font-bold ${isExpected ? 'text-[#0047C7]' : 'text-slate-700'}`}>
          {monthlyAmt}
        </span>
        <span className={`block text-[10.5px] font-semibold mt-0.5 ${isExpected ? 'text-blue-500/80' : 'text-slate-400'}`}>
          {subText}
        </span>
      </div>
    );
  }

  if (/^\d+$/.test(str)) {
    const num = Number(str);
    if (num >= 100000) {
      const lpa = (num / 100000).toFixed(1).replace(/\.0$/, '');
      return (
        <div className="leading-tight">
          <span className={`text-xs font-bold ${isExpected ? 'text-[#0047C7]' : 'text-slate-700'}`}>
            ₹{lpa} LPA
          </span>
          <span className={`block text-[10px] font-semibold mt-0.5 ${isExpected ? 'text-blue-500/80' : 'text-slate-400'}`}>
            ₹{num.toLocaleString('en-IN')}/yr
          </span>
        </div>
      );
    }
    return (
      <span className={`text-xs font-bold ${isExpected ? 'text-[#0047C7]' : 'text-slate-700'}`}>
        ₹{num.toLocaleString('en-IN')}
      </span>
    );
  }

  return (
    <span className={`text-xs font-bold ${isExpected ? 'text-[#0047C7]' : 'text-slate-700'}`}>
      {str}
    </span>
  );
};

const formatInlineSalary = (val) => {
  if (!val || val === 'Not specified' || val === '-' || val === 'N/A') return 'Not specified';
  const str = String(val).trim();
  const monthlyMatch = str.match(/^₹?([0-9,]+)\s*\/\s*(?:Month|mo)\s*\((.+)\)$/i);
  if (monthlyMatch) {
    const lpaMatch = monthlyMatch[2].match(/([0-9.]+\s*LPA)/i);
    return lpaMatch ? `₹${monthlyMatch[1]}/mo (${lpaMatch[1]})` : `₹${monthlyMatch[1]}/mo`;
  }
  if (/^\d+$/.test(str)) {
    const num = Number(str);
    if (num >= 100000) return `₹${(num / 100000).toFixed(1).replace(/\.0$/, '')} LPA`;
    return `₹${num.toLocaleString('en-IN')}`;
  }
  return str;
};

const filterLabelClass = 'mb-1.5 block text-xs font-extrabold text-slate-600';
const filterControlClass = 'candidate-filter-control h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-[#6658dd] focus:ring-2 focus:ring-indigo-100 transition';

const renderActivityBadge = (lastActive, availability) => {
  if (!lastActive && !availability) return null;
  const isToday = lastActive?.includes('Today') || lastActive?.includes('Yesterday');
  const isRecent = isToday || lastActive?.includes('d ago');
  const badgeClass = isToday
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : (isRecent ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-slate-50 text-slate-700 border-slate-200');
  const dotClass = isToday ? 'bg-emerald-500 animate-pulse' : (isRecent ? 'bg-sky-500' : 'bg-slate-400');

  return (
    <div className="space-y-1">
      {lastActive && (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold border ${badgeClass}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
          <span>{lastActive}</span>
        </span>
      )}
      {availability && (
        <span className={`block text-[11px] font-bold ${availabilityTone[availability] || 'text-slate-500'}`}>
          {availability}
        </span>
      )}
    </div>
  );
};

const SelectField = ({ label, value, onChange, children, uppercase = false }) => (
  <div>
    <label className={`${filterLabelClass} ${uppercase ? 'uppercase tracking-wide' : ''}`}>{label}</label>
    <select value={value} onChange={(event) => onChange(event.target.value)} className={filterControlClass}>
      {children}
    </select>
  </div>
);

const CandidateActions = ({
  candidate,
  isOpen,
  onToggle,
  onClose,
  onContact,
  onUnlock,
  align = 'right-6 top-12'
}) => (
  <div className="relative inline-block text-left">
    <button type="button" onClick={onToggle} className="rounded p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#6658dd]" aria-label={`Actions for ${candidate.name}`}>
      <MoreVertical className="h-4 w-4" />
    </button>
    {isOpen && (
      <>
        <button type="button" className="fixed inset-0 z-10 cursor-default" onClick={onClose} aria-label="Close menu" />
        <div className={`absolute ${align} z-20 w-48 rounded-md border border-slate-100 bg-white py-1.5 text-left shadow-lg`}>
          <Link to={`/employer/candidateProfile/${candidate.id}`} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
            <User className="h-4 w-4" /> View Profile
          </Link>
          <button
            type="button"
            onClick={() => {
              onClose();
              onContact(candidate);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" /> Contact
          </button>
          {candidate.hasResume && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (!candidate.allowResumeDownload) {
                    alert('Upgrade Plan: Resume viewing is not supported under your current plan. Please upgrade to view resumes.');
                    return;
                  }
                  viewCandidateResume(candidate);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-blue-600 hover:bg-blue-50 cursor-pointer"
              >
                <Eye className="h-4 w-4" /> View Resume
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!candidate.allowResumeDownload) {
                    alert('Upgrade Plan: Resume downloads are not supported under your current plan. Please upgrade to download resumes.');
                    return;
                  }
                  downloadCandidateResume(candidate);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download Resume
              </button>
            </>
          )}
        </div>
      </>
    )}
  </div>
);

export const EmployerSearchCandidates = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlLocations = searchParams.get('locations')
    ? searchParams.get('locations').split(',').map(s => s.trim()).filter(Boolean)
    : (searchParams.get('location') ? [searchParams.get('location').trim()] : []);
  const urlIncludeRelocate = searchParams.get('includeRelocate') !== null
    ? searchParams.get('includeRelocate') === 'true'
    : true;
  const urlExcludeAnywhere = searchParams.get('excludeAnywhere') === 'true';

  const [filters, setFilters] = useState(() => ({
    ...initialFilters,
    search: searchParams.get('search') || '',
    jobTitle: searchParams.get('jobTitle') || '',
    location: urlLocations[0] || '',
    locations: urlLocations,
    includeRelocate: urlIncludeRelocate,
    excludeAnywhere: urlExcludeAnywhere,
    minExp: searchParams.get('minExp') || '',
    maxExp: searchParams.get('maxExp') || '',
    minSalary: searchParams.get('minSalary') || '',
    maxSalary: searchParams.get('maxSalary') || '',
    gender: searchParams.get('gender') || '',
    qualification: searchParams.get('qualification') || '',
    industryType: searchParams.get('industryType') || searchParams.get('industry') || '',
    jobCategory: searchParams.get('jobCategory') || searchParams.get('category') || searchParams.get('department') || '',
    department: searchParams.get('department') || searchParams.get('industry') || '',
    activity: searchParams.get('activity') || '',
    sortBy: searchParams.get('sortBy') || '',
    skills: searchParams.get('skills')
      ? searchParams.get('skills').split(',').map(s => s.trim()).filter(Boolean)
      : (searchParams.get('skill') ? [searchParams.get('skill').trim()] : [])
  }));

  const urlSearch = searchParams.get('search') ?? '';
  useEffect(() => {
    setFilters((prev) => {
      if (prev.search === urlSearch) return prev;
      return { ...prev, search: urlSearch };
    });
    setCurrentPage(1);
  }, [urlSearch]);

  const [skillsSelectorOpen, setSkillsSelectorOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSearch, setTableSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [data, setData] = useState({ stats: {}, filters: {}, candidates: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unlockSuccessModal, setUnlockSuccessModal] = useState({
    show: false,
    title: 'Profile Unlocked!',
    message: "Candidate's details have been unlocked.",
    remainingUnlocks: ''
  });

  const [locationInput, setLocationInput] = useState('');
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [masterCities, setMasterCities] = useState([]);
  const locationContainerRef = useRef(null);
  const locationInputRef = useRef(null);

  useEffect(() => {
    axios.get(`${BASE_API_URL}/masters/cities`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const names = list.map(c => typeof c === 'string' ? c : (c.name || c.city || '')).filter(Boolean);
        setMasterCities(names);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationContainerRef.current && !locationContainerRef.current.contains(e.target)) {
        setLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddLocation = (loc) => {
    const clean = String(loc || '').trim();
    if (!clean) return;
    const exists = (filters.locations || []).some(l => l.toLowerCase() === clean.toLowerCase());
    if (!exists) {
      const next = [...(filters.locations || []), clean];
      setFilters(prev => ({
        ...prev,
        locations: next,
        location: next[0] || ''
      }));
      setCurrentPage(1);
    }
    setLocationInput('');
    setLocationDropdownOpen(false);
  };

  const handleRemoveLocation = (locToRemove) => {
    const next = (filters.locations || []).filter(l => l.toLowerCase() !== locToRemove.toLowerCase());
    setFilters(prev => ({
      ...prev,
      locations: next,
      location: next[0] || ''
    }));
    setCurrentPage(1);
  };

  useEffect(() => {
    const handleUnlockSuccess = (e) => {
      setUnlockSuccessModal({
        show: true,
        title: 'Resume Unlocked!',
        message: "Candidate's resume has been successfully unlocked and downloaded.",
        remainingUnlocks: e.detail.remainingUnlocks
      });
    };
    window.addEventListener('resume-unlock-success', handleUnlockSuccess);
    return () => {
      window.removeEventListener('resume-unlock-success', handleUnlockSuccess);
    };
  }, []);

  const handleContactCandidate = async (candidate) => {
    try {
      const res = await axios.post(`${BASE_API_URL}/employer/candidates/${candidate.id}/contact`, {}, {
        headers: getTokenHeaders()
      });
      if (res.data?.applicationId) {
        navigate(`/employer/messages?application=${res.data.applicationId}`);
      } else {
        navigate('/employer/messages');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not initiate conversation.');
    }
  };

  const handleUnlockCandidate = async (candidate) => {
    try {
      const res = await axios.post(`${BASE_API_URL}/employer/candidates/${candidate.id}/unlock`, {}, {
        headers: getTokenHeaders()
      });
      if (res.data?.success) {
        setData(prev => ({
          ...prev,
          candidates: prev.candidates.map(c => (c.id === candidate.id ? { ...c, ...res.data.candidate, isUnlocked: true } : c))
        }));
        setUnlockSuccessModal({
          show: true,
          title: res.data.alreadyUnlocked ? 'Already Unlocked' : 'Profile Unlocked!',
          message: res.data.alreadyUnlocked
            ? (res.data.message || 'Candidate is already unlocked under your active plan.')
            : 'Candidate profile and contact details have been successfully unlocked.',
          remainingUnlocks: res.data.remainingUnlocks ?? ''
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unlock profile.');
    }
  };

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setTableSearch('');
    setLocationInput('');
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    ['search', 'jobTitle', 'skills', 'skill', 'minExp', 'maxExp', 'location', 'locations', 'includeRelocate', 'excludeAnywhere', 'minSalary', 'maxSalary', 'gender', 'qualification', 'industryType', 'industry', 'jobCategory', 'category', 'department', 'activity', 'sortBy'].forEach(k => newParams.delete(k));
    const qs = newParams.toString();
    navigate(qs ? `?${qs}` : window.location.pathname, { replace: true });
  };

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    const search = [filters.search, tableSearch].filter(Boolean).join(' ').trim();
    if (search) params.set('search', search);
    if (filters.jobTitle) params.set('jobTitle', filters.jobTitle);
    if (filters.skills && filters.skills.length) params.set('skills', filters.skills.join(','));
    if (filters.minExp) params.set('minExp', filters.minExp);
    if (filters.maxExp) params.set('maxExp', filters.maxExp);
    
    const locList = (filters.locations && filters.locations.length > 0)
      ? filters.locations
      : (filters.location ? [filters.location] : []);
    if (locList.length > 0) {
      params.set('locations', locList.join(','));
      params.set('location', locList[0]);
    }
    if (filters.includeRelocate !== undefined) {
      params.set('includeRelocate', String(filters.includeRelocate));
    }
    if (filters.excludeAnywhere) {
      params.set('excludeAnywhere', 'true');
    }
    if (filters.minSalary) params.set('minSalary', filters.minSalary);
    if (filters.maxSalary) params.set('maxSalary', filters.maxSalary);
    if (filters.gender) params.set('gender', filters.gender);
    if (filters.qualification) params.set('qualification', filters.qualification);
    if (filters.industryType) params.set('industryType', filters.industryType);
    if (filters.jobCategory) params.set('jobCategory', filters.jobCategory);
    if (filters.activity) params.set('activity', filters.activity);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));
    return params.toString();
  }, [filters, tableSearch, currentPage, pageSize]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    axios.get(`${BASE_API_URL}/employer/candidates?${queryParams}`, { headers: getTokenHeaders() })
      .then((response) => {
        if (!alive) return;
        setError('');
        setData({ stats: {}, filters: {}, candidates: [], pagination: { page: 1, limit: pageSize, total: 0, totalPages: 1 }, ...response.data });
      })
      .catch((err) => {
        if (alive) setError(err.response?.data?.message || 'Candidates could not be loaded.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [queryParams, pageSize]);

  const pagination = data.pagination || { page: currentPage, limit: pageSize, total: 0, totalPages: 1 };
  const totalPages = pagination.totalPages || 1;
  const safePage = pagination.page || 1;
  const startIndex = pagination.total ? (safePage - 1) * pagination.limit : 0;
  const optionFilters = data.filters || {};

  const locationSuggestions = useMemo(() => {
    const query = locationInput.trim().toLowerCase();
    const all = Array.from(new Set([
      ...masterCities,
      ...(optionFilters.locations || [])
    ].map(s => String(s).trim()).filter(Boolean)));

    const selectedSet = new Set((filters.locations || []).map(l => l.toLowerCase()));
    const unselected = all.filter(l => !selectedSet.has(l.toLowerCase()));

    if (!query) {
      return unselected.slice(0, 15);
    }
    return unselected.filter(l => l.toLowerCase().includes(query)).slice(0, 15);
  }, [locationInput, masterCities, optionFilters.locations, filters.locations]);

  const qualificationOptions = useMemo(() => {
    const list = [...standardQualifications, ...(optionFilters.qualifications || [])];
    return Array.from(new Set(list.filter(Boolean)));
  }, [optionFilters.qualifications]);

  const industryTypeOptions = useMemo(() => {
    const list = [
      ...standardIndustries,
      ...(optionFilters.industryTypes || []),
      ...(optionFilters.industries || [])
    ];
    return Array.from(new Set(list.filter(Boolean)));
  }, [optionFilters.industryTypes, optionFilters.industries]);

  const jobCategoryOptions = useMemo(() => {
    const list = [
      ...standardJobCategories,
      ...(optionFilters.jobCategories || []),
      ...(optionFilters.categories || []),
      ...(optionFilters.roles || []),
      ...(optionFilters.departments || [])
    ];
    return Array.from(new Set(list.filter(Boolean)));
  }, [optionFilters.jobCategories, optionFilters.categories, optionFilters.roles, optionFilters.departments]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.jobTitle) count++;
    if (filters.skills && filters.skills.length > 0) count += filters.skills.length;
    if (filters.minExp || filters.maxExp) count++;
    if ((filters.locations && filters.locations.length > 0) || filters.location) {
      count += (filters.locations?.length || 1);
    }
    if (!filters.includeRelocate) count++;
    if (filters.excludeAnywhere) count++;
    if (filters.minSalary || filters.maxSalary) count++;
    if (filters.gender) count++;
    if (filters.qualification) count++;
    if (filters.industryType) count++;
    if (filters.jobCategory) count++;
    if (filters.activity) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  const visibleRows = data.candidates || [];

  return (
    <div className="space-y-4 px-3 sm:space-y-5 sm:px-0">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center md:gap-3">
        <h1 className="text-lg font-extrabold text-[#3f4254] sm:text-xl">Candidates</h1>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 sm:text-sm">
          <span className="text-[#3f4254]">JobsWaale</span>
          <ChevronRight className="h-4 w-4" />
          <span>Candidates</span>
        </div>
      </div>

      {error && <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        {statCards.map((card) => (
          <section key={card.key} className="rounded-md border border-slate-100 bg-white p-3 shadow-sm sm:p-5">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${card.tone}`}>
                <card.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-400 sm:text-sm">{card.title}</p>
                <p className="mt-1 text-base font-black text-[#3f4254] sm:text-xl">
                  {Number(data.stats?.[card.key] || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-indigo-50/20 px-5 py-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-extrabold text-[#3f4254] sm:text-lg">Search Candidates</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-black text-[#6658dd] border border-indigo-100 shadow-xs">
                <Sparkles className="h-3 w-3" />
                9 Search Filters
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-400 sm:text-sm">
              Combine job title & skills, experience, location, salary, gender, qualification, industry type, job category, and activity to find matching candidates.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-extrabold text-rose-600 transition hover:bg-rose-100 cursor-pointer shadow-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters ({activeFilterCount})
              </button>
            )}
            <button
              type="button"
              onClick={() => setSkillsSelectorOpen((prev) => !prev)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-extrabold text-[#6658dd] transition hover:bg-indigo-100 cursor-pointer shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {skillsSelectorOpen ? 'Hide Skill Tags' : '+ Multi-Select Skills'}
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {/* 9 Filters Grid: 3 columns on desktop (3x3 perfectly balanced), 2 on tablet, 1 on mobile */}
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Filter 1: Job Title & Job Skills */}
            <div>
              <label className={filterLabelClass}>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Briefcase className="h-3.5 w-3.5 text-[#6658dd]" />
                  <span>1. Job Title & Skills</span>
                </span>
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className={`${filterControlClass} py-2 pl-9 pr-8`}
                  value={filters.search}
                  onChange={(event) => {
                    const val = event.target.value;
                    setFilter('search', val);
                    const newParams = new URLSearchParams(searchParams);
                    if (val.trim()) {
                      newParams.set('search', val.trim());
                    } else {
                      newParams.delete('search');
                    }
                    const qs = newParams.toString();
                    navigate(qs ? `?${qs}` : window.location.pathname, { replace: true });
                  }}
                  placeholder="e.g. QA, QC, React, HPLC"
                />
                {filters.search && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilter('search', '');
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('search');
                      const qs = newParams.toString();
                      navigate(qs ? `?${qs}` : window.location.pathname, { replace: true });
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter 2: Experience: Minimum and Maximum */}
            <div>
              <label className={filterLabelClass}>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="h-3.5 w-3.5 text-[#6658dd]" />
                  <span>2. Experience (Min - Max)</span>
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.minExp}
                  onChange={(e) => setFilter('minExp', e.target.value)}
                  className={filterControlClass}
                >
                  {minExpOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select
                  value={filters.maxExp}
                  onChange={(e) => setFilter('maxExp', e.target.value)}
                  className={filterControlClass}
                >
                  {maxExpOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter 3: Current Location of Candidate */}
            <div>
              <label className={filterLabelClass}>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <MapPin className="h-3.5 w-3.5 text-[#6658dd]" />
                  <span>3. Current location of candidate</span>
                </span>
              </label>

              <div ref={locationContainerRef} className="relative">
                <div
                  onClick={() => locationInputRef.current?.focus()}
                  className="candidate-filter-control min-h-[42px] h-auto w-full rounded-md border border-slate-200 bg-white p-1.5 flex flex-wrap items-center gap-1.5 transition focus-within:border-[#6658dd] focus-within:ring-2 focus-within:ring-indigo-100 cursor-text"
                >
                  {(filters.locations || []).map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex items-center gap-1.5 rounded-sm bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs"
                    >
                      <span>{loc}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveLocation(loc);
                        }}
                        className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
                        title={`Remove ${loc}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={locationInputRef}
                    value={locationInput}
                    onChange={(e) => {
                      setLocationInput(e.target.value);
                      setLocationDropdownOpen(true);
                    }}
                    onFocus={() => setLocationDropdownOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (locationInput.trim()) {
                          handleAddLocation(locationInput.trim());
                        }
                      } else if (e.key === 'Backspace' && !locationInput && filters.locations?.length) {
                        handleRemoveLocation(filters.locations[filters.locations.length - 1]);
                      }
                    }}
                    placeholder={filters.locations?.length ? 'Add location' : 'Add location (e.g. Baddi, Delhi, Mumbai)'}
                    className="flex-1 min-w-[100px] bg-transparent text-xs font-semibold text-slate-700 outline-none placeholder:font-normal placeholder:text-slate-400"
                  />
                  {filters.locations?.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilters(prev => ({ ...prev, locations: [], location: '' }));
                        setLocationInput('');
                      }}
                      className="text-slate-300 hover:text-slate-500 p-1"
                      title="Clear all locations"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {locationDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-xl">
                    {locationInput.trim() && !(filters.locations || []).some(l => l.toLowerCase() === locationInput.trim().toLowerCase()) && (
                      <button
                        type="button"
                        onClick={() => handleAddLocation(locationInput.trim())}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-[#6658dd] hover:bg-indigo-50 border-b border-slate-100 cursor-pointer"
                      >
                        <span className="text-slate-400">+ Add</span> "{locationInput.trim()}"
                      </button>
                    )}
                    {locationSuggestions.length > 0 ? (
                      locationSuggestions.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => handleAddLocation(loc)}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {loc}
                          </span>
                        </button>
                      ))
                    ) : (
                      !locationInput.trim() && (
                        <div className="px-3 py-2 text-xs font-medium text-slate-400">
                          Type to search locations...
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Checkboxes below location input */}
              <div className="mt-2.5 space-y-2">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(filters.includeRelocate)}
                    onChange={(e) => setFilter('includeRelocate', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0047C7] focus:ring-[#0047C7]"
                  />
                  <span className="text-xs font-medium text-slate-700 leading-tight">
                    Include candidates who prefer to relocate to above locations
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(filters.excludeAnywhere)}
                    onChange={(e) => setFilter('excludeAnywhere', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0047C7] focus:ring-[#0047C7]"
                  />
                  <span className="text-xs font-medium text-slate-700 leading-tight flex items-center gap-1">
                    <span>Exclude candidates who have mentioned Anywhere in...</span>
                    <span title="Excludes candidates who selected generic 'Anywhere in India' or 'Anywhere in State' instead of specific cities.">
                      <Info className="h-3.5 w-3.5 text-slate-400 inline" />
                    </span>
                  </span>
                </label>
              </div>

              {/* Informational Message Banner */}
              <div className="mt-2.5 flex items-start gap-2 rounded-md bg-[#eef5fc] border border-[#d6e7f7] p-2.5 text-[11px] font-medium text-slate-700 leading-relaxed">
                <Info className="h-4 w-4 text-[#0047C7] shrink-0 mt-0.5" />
                <div>
                  You will get candidates who are {filters.includeRelocate ? 'either currently in OR prefer to relocate to' : 'currently in'}{' '}
                  <span className="font-bold text-slate-900">
                    {filters.locations && filters.locations.length > 0 ? filters.locations.join(', ') : 'any location'}
                  </span>.
                </div>
              </div>
            </div>

            {/* Filter 4: Salary: Minimum and Maximum */}
            <div>
              <label className={filterLabelClass}>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <IndianRupee className="h-3.5 w-3.5 text-[#6658dd]" />
                  <span>4. Salary (Min - Max LPA)</span>
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.minSalary}
                  onChange={(e) => setFilter('minSalary', e.target.value)}
                  className={filterControlClass}
                >
                  {minSalaryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select
                  value={filters.maxSalary}
                  onChange={(e) => setFilter('maxSalary', e.target.value)}
                  className={filterControlClass}
                >
                  {maxSalaryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter 5: Gender: Male, Female, Any */}
            <div>
              <label className={filterLabelClass}>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <User className="h-3.5 w-3.5 text-[#6658dd]" />
                  <span>5. Gender</span>
                </span>
              </label>
              <select
                value={filters.gender}
                onChange={(e) => setFilter('gender', e.target.value)}
                className={filterControlClass}
              >
                {genderOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Filter 6: Qualification: B.Pharm, M.Pharm, B.Sc., MBA, etc. */}
            <div>
              <label className={filterLabelClass}>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <GraduationCap className="h-3.5 w-3.5 text-[#6658dd]" />
                  <span>6. Qualification</span>
                </span>
              </label>
              <select
                value={filters.qualification}
                onChange={(e) => setFilter('qualification', e.target.value)}
                className={filterControlClass}
              >
                <option value="">All Qualifications</option>
                {qualificationOptions.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            {/* Filter 7: Industry Type: Pharmaceutical, Biotechnology, Healthcare, Chemical, etc. */}
            <div>
              <label className={filterLabelClass}>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Building2 className="h-3.5 w-3.5 text-[#6658dd]" />
                  <span>7. Industry Type</span>
                </span>
              </label>
              <select
                value={filters.industryType}
                onChange={(e) => setFilter('industryType', e.target.value)}
                className={filterControlClass}
              >
                <option value="">All Industry Types</option>
                {industryTypeOptions.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Filter 8: Job Category: QA, QC, Production, Regulatory Affairs, R&D, Packaging, HR, etc. */}
            <div>
              <label className={filterLabelClass}>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Layers className="h-3.5 w-3.5 text-[#6658dd]" />
                  <span>8. Job Category</span>
                </span>
              </label>
              <select
                value={filters.jobCategory}
                onChange={(e) => setFilter('jobCategory', e.target.value)}
                className={filterControlClass}
              >
                <option value="">All Job Categories</option>
                {jobCategoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Filter 9: Candidate Activity: Active within 3 months, 6 months, or All Candidates */}
            <div>
              <label className={filterLabelClass}>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Activity className="h-3.5 w-3.5 text-[#6658dd]" />
                  <span>9. Candidate Activity</span>
                </span>
              </label>
              <select
                value={filters.activity}
                onChange={(e) => setFilter('activity', e.target.value)}
                className={filterControlClass}
              >
                {activityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Multi-Select Skills Drawer */}
          {skillsSelectorOpen && (
            <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 shadow-inner">
              <SkillMultiSelectFilter
                label="Multi-Select Skills from Talent Pool (AND Logic)"
                selectedSkills={filters.skills || []}
                onChange={(nextSkills) => {
                  setFilter('skills', nextSkills);
                  setFilter('skill', nextSkills.join(','));
                }}
                fallbackSkills={optionFilters.skills || []}
              />
            </div>
          )}

          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
              <span className="text-xs font-black text-[#6658dd] flex items-center gap-1.5 mr-1">
                <Filter className="h-3.5 w-3.5" />
                Active Filters ({activeFilterCount}):
              </span>

              {filters.search && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs">
                  <span className="text-slate-400">Title/Skills:</span>
                  <span className="text-[#6658dd] font-black">{filters.search}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFilter('search', '');
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('search');
                      const qs = newParams.toString();
                      navigate(qs ? `?${qs}` : window.location.pathname, { replace: true });
                    }}
                    className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.skills && filters.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#6658dd] px-2.5 py-1 text-xs font-black text-white shadow-xs"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = filters.skills.filter(s => s !== skill);
                      setFilter('skills', next);
                      setFilter('skill', next.join(','));
                    }}
                    className="text-indigo-200 hover:text-white transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              {(filters.minExp || filters.maxExp) && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs">
                  <span className="text-slate-400">Exp:</span>
                  <span className="text-[#6658dd] font-black">
                    {filters.minExp ? `${filters.minExp} Yrs` : '0'} - {filters.maxExp ? `${filters.maxExp} Yrs` : 'Any'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFilter('minExp', '');
                      setFilter('maxExp', '');
                    }}
                    className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.locations && filters.locations.length > 0 && filters.locations.map((loc) => (
                <span key={loc} className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs">
                  <span className="text-slate-400">Loc:</span>
                  <span className="text-[#6658dd] font-black">{loc}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(loc)}
                    className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              {!filters.includeRelocate && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-800 shadow-xs">
                  <span>Exclude Relocate</span>
                  <button
                    type="button"
                    onClick={() => setFilter('includeRelocate', true)}
                    className="text-amber-500 hover:text-amber-700 transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.excludeAnywhere && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs">
                  <span>Exclude 'Anywhere'</span>
                  <button
                    type="button"
                    onClick={() => setFilter('excludeAnywhere', false)}
                    className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {(filters.minSalary || filters.maxSalary) && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs">
                  <span className="text-slate-400">CTC:</span>
                  <span className="text-[#6658dd] font-black">
                    ₹{filters.minSalary || '0'} - ₹{filters.maxSalary ? `${filters.maxSalary} LPA` : 'Any'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFilter('minSalary', '');
                      setFilter('maxSalary', '');
                    }}
                    className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.gender && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs">
                  <span className="text-slate-400">Gender:</span>
                  <span className="text-[#6658dd] font-black">{filters.gender}</span>
                  <button
                    type="button"
                    onClick={() => setFilter('gender', '')}
                    className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.qualification && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs">
                  <span className="text-slate-400">Qual:</span>
                  <span className="text-[#6658dd] font-black">{filters.qualification}</span>
                  <button
                    type="button"
                    onClick={() => setFilter('qualification', '')}
                    className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.industryType && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs">
                  <span className="text-slate-400">Industry:</span>
                  <span className="text-[#6658dd] font-black">{filters.industryType}</span>
                  <button
                    type="button"
                    onClick={() => setFilter('industryType', '')}
                    className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.jobCategory && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs">
                  <span className="text-slate-400">Category:</span>
                  <span className="text-[#6658dd] font-black">{filters.jobCategory}</span>
                  <button
                    type="button"
                    onClick={() => setFilter('jobCategory', '')}
                    className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.activity && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs">
                  <span className="text-slate-400">Activity:</span>
                  <span className="text-[#6658dd] font-black">
                    {filters.activity === '3months' ? 'Active in 3 Months' : (filters.activity === '6months' ? 'Active in 6 Months' : 'Active in 30 Days')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilter('activity', '')}
                    className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {loading && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs font-black text-[#6658dd] shadow-xs animate-pulse">
                  <Loader className="h-3 w-3 animate-spin text-[#6658dd]" />
                  <span>Searching...</span>
                </span>
              )}

              <button
                type="button"
                onClick={resetFilters}
                className="ml-auto text-xs font-black text-rose-600 hover:text-rose-700 underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          <div className="mb-3 mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <select
                  value={pageSize}
                  onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }}
                  className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>entries per page</span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                • Total: <span className="font-extrabold text-slate-700">{Number(pagination.total || 0).toLocaleString('en-IN')}</span> candidates
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-extrabold text-slate-500 whitespace-nowrap">Sort By:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilter('sortBy', e.target.value)}
                className={filterControlClass}
                style={{ width: 'auto' }}
              >
                <option value="">Experience (High to Low)</option>
                <option value="Experience (Low to High)">Experience (Low to High)</option>
                <option value="Salary (High to Low)">Salary (High to Low)</option>
                <option value="Salary (Low to High)">Salary (Low to High)</option>
                <option value="Newest First">Newest / Recently Active</option>
              </select>
            </div>
          </div>

          {/* Card list — mobile only */}
          <div className="divide-y divide-slate-100 rounded-md border border-slate-100 sm:hidden">
            {loading ? (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-[#6658dd]">
                  <Loader className="h-6 w-6 animate-spin text-[#6658dd]" />
                </div>
                <p className="mt-3 text-sm font-extrabold text-[#3f4254]">Filtering Candidates...</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">Loading candidate profiles</p>
              </div>
            ) : visibleRows.length ? visibleRows.map((candidate) => (
              <div key={candidate.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${candidate.avatarTone} text-xs font-black text-slate-700 ring-2 ring-white shadow-xs`}>
                    {candidate.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link to={`/employer/candidateProfile/${candidate.id}`} className="truncate text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd]">
                        {candidate.name}
                      </Link>
                      {candidate.gender && candidate.gender !== 'Not specified' && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                          {candidate.gender}
                        </span>
                      )}
                      {candidate.isApplied && (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          Applicant
                        </span>
                      )}
                    </div>
                    {(candidate.designation || candidate.role) && (
                      <p className="text-xs font-bold text-[#6658dd] mt-0.5 truncate">
                        {candidate.designation || candidate.role}
                      </p>
                    )}
                    {candidate.isUnlocked ? (
                      <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                        {[candidate.email, candidate.phone].filter(Boolean).join(' • ') || 'No contact info'}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUnlockCandidate(candidate)}
                        className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                        title="Click to unlock contact details"
                      >
                        <Lock className="h-3 w-3" />
                        <span>{candidate.email || 'Hidden (Unlock to View)'}</span>
                      </button>
                    )}
                    <div className="mt-0.5 space-y-0.5 text-xs font-semibold text-slate-400">
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{candidate.location}</span>
                        {candidate.currentJobLocation && (
                          <span className="text-indigo-600 font-bold ml-1">• Working in: {candidate.currentJobLocation}</span>
                        )}
                      </p>
                      {candidate.preferredLocation && (
                        <p className="text-[11px] text-slate-500 font-medium pl-4">
                          Prefers: <span className="text-slate-700 font-semibold">{candidate.preferredLocation}</span>
                          {candidate.relocate === 'yes' && (
                            <span className="ml-1 text-emerald-600 font-bold">(Willing to relocate)</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {renderActivityBadge(candidate.lastActive, candidate.availability)}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500">
                  <p className="truncate"><span className="text-slate-400">Experience:</span> {candidate.experience}</p>
                  <p className="truncate"><span className="text-slate-400">Qualification:</span> {candidate.qualification || '-'}</p>
                  <p className="truncate"><span className="text-slate-400">Job Category:</span> <span className="font-bold text-[#3f4254]">{candidate.jobCategory || candidate.role || '-'}</span></p>
                  <p className="truncate"><span className="text-slate-400">Industry Type:</span> <span className="font-semibold text-[#6658dd]">{candidate.industryType || candidate.industry || '-'}</span></p>
                  <p className="truncate"><span className="text-slate-400">Current CTC:</span> <span className="font-semibold text-slate-700">{formatInlineSalary(candidate.currentSalary)}</span></p>
                  <p className="truncate"><span className="text-slate-400">Expected CTC:</span> <span className="font-bold text-[#0047C7]">{formatInlineSalary(candidate.expectedSalary)}</span></p>
                </div>

                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 5).map(skill => {
                      const isMatched = (filters.skills || []).some(s => String(s || '').toLowerCase() === String(skill || '').toLowerCase());
                      return (
                        <span
                          key={skill}
                          className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold ${
                            isMatched
                              ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isMatched && '✓ '}{skill}
                        </span>
                      );
                    })}
                    {candidate.skills.length > 5 && (
                      <span className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-bold text-slate-500">
                        +{candidate.skills.length - 5}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-end border-t border-slate-100 pt-3">
                  <CandidateActions
                    candidate={candidate}
                    isOpen={openMenuId === candidate.id}
                    onToggle={() => setOpenMenuId(openMenuId === candidate.id ? null : candidate.id)}
                    onClose={() => setOpenMenuId(null)}
                    onContact={handleContactCandidate}
                    onUnlock={handleUnlockCandidate}
                    align="right-0 top-10"
                  />
                </div>
              </div>
            )) : (
              <p className="px-4 py-12 text-center text-sm font-bold text-slate-400">No candidates found matching your filter criteria.</p>
            )}
          </div>

          {/* Table — sm and up */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-[#dbe6f6] text-[11px] uppercase text-slate-600">
                <tr>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Qualification</th>
                  <th className="px-4 py-3">Job Category & Industry</th>
                  <th className="px-4 py-3">Current CTC</th>
                  <th className="px-4 py-3">Expected CTC</th>
                  <th className="px-4 py-3">Activity & Status</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-[#6658dd]">
                          <Loader className="h-6 w-6 animate-spin text-[#6658dd]" />
                        </div>
                        <p className="text-sm font-extrabold text-[#3f4254]">Filtering Candidates...</p>
                        <p className="text-xs font-semibold text-slate-400">Loading candidates matching your filter criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : visibleRows.length ? visibleRows.map((candidate) => (
                  <tr key={candidate.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-3">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${candidate.avatarTone} text-xs font-black text-slate-700 ring-2 ring-white shadow-xs`}>
                          {candidate.initials}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Link to={`/employer/candidateProfile/${candidate.id}`} className="text-sm font-extrabold text-[#3f4254] hover:text-[#6658dd]">
                              {candidate.name}
                            </Link>
                            {candidate.gender && candidate.gender !== 'Not specified' && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                                {candidate.gender}
                              </span>
                            )}
                            {candidate.isApplied && (
                              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                Applicant
                              </span>
                            )}
                          </div>
                          {(candidate.designation || candidate.role) && (
                            <p className="text-xs font-bold text-[#6658dd] mt-0.5">
                              {candidate.designation || candidate.role}
                            </p>
                          )}
                          {candidate.isUnlocked ? (
                            <p className="mt-0.5 text-xs font-semibold text-slate-500">
                              {[candidate.email, candidate.phone].filter(Boolean).join(' • ') || 'No contact info'}
                            </p>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUnlockCandidate(candidate)}
                              className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                              title="Click to unlock contact details"
                            >
                              <Lock className="h-3 w-3" />
                              <span>{candidate.email || 'Hidden (Unlock to View)'}</span>
                            </button>
                          )}
                          <div className="mt-0.5 space-y-0.5 text-xs font-semibold text-slate-400">
                            <p className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span>{candidate.location}</span>
                              {candidate.currentJobLocation && (
                                <span className="text-indigo-600 font-bold ml-1">• Working in: {candidate.currentJobLocation}</span>
                              )}
                            </p>
                            {candidate.preferredLocation && (
                              <p className="text-[11px] text-slate-500 font-medium pl-4">
                                Prefers: <span className="text-slate-700 font-semibold">{candidate.preferredLocation}</span>
                                {candidate.relocate === 'yes' && (
                                  <span className="ml-1 text-emerald-600 font-bold">(Willing to relocate)</span>
                                )}
                              </p>
                            )}
                          </div>
                          {candidate.skills && candidate.skills.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1 max-w-[280px]">
                              {candidate.skills.slice(0, 4).map(skill => {
                                const isMatched = (filters.skills || []).some(s => String(s || '').toLowerCase() === String(skill || '').toLowerCase());
                                return (
                                  <span
                                    key={skill}
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold ${
                                      isMatched
                                        ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {isMatched && '✓ '}{skill}
                                  </span>
                                );
                              })}
                              {candidate.skills.length > 4 && (
                                <span className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-bold text-slate-500">
                                  +{candidate.skills.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-600 whitespace-nowrap">
                      {candidate.experience}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-600">
                      {candidate.qualification || '-'}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-600">
                      <div className="leading-snug">
                        <span className="font-extrabold text-[#3f4254] block">
                          {candidate.jobCategory || candidate.role || '-'}
                        </span>
                        {(candidate.industryType || candidate.industry) && (
                          <span className="inline-block mt-1 text-[11px] font-semibold text-[#6658dd] bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5">
                            {candidate.industryType || candidate.industry}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">{renderCandidateSalaryCell(candidate.currentSalary, false)}</td>
                    <td className="px-4 py-3.5">{renderCandidateSalaryCell(candidate.expectedSalary, true)}</td>
                    <td className="px-4 py-3.5">
                      {renderActivityBadge(candidate.lastActive, candidate.availability)}
                    </td>
                    <td className="relative px-5 py-3.5 text-center">
                      <CandidateActions
                        candidate={candidate}
                        isOpen={openMenuId === candidate.id}
                        onToggle={() => setOpenMenuId(openMenuId === candidate.id ? null : candidate.id)}
                        onClose={() => setOpenMenuId(null)}
                        onContact={handleContactCandidate}
                        onUnlock={handleUnlockCandidate}
                        align="right-6 top-12"
                      />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="px-5 py-12 text-center text-sm font-bold text-slate-400">
                      No candidates found matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-3 text-xs font-semibold text-slate-600 sm:flex-row sm:items-center sm:text-sm">
            <span>Showing {pagination.total ? startIndex + 1 : 0} to {Math.min(startIndex + pagination.limit, pagination.total)} of {pagination.total} entries</span>
            <div className="flex items-center justify-center gap-2"><button type="button" onClick={() => goToPage(1)} disabled={safePage === 1} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronsLeft className="h-4 w-4" /></button><button type="button" onClick={() => goToPage(safePage - 1)} disabled={safePage === 1} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button><button type="button" className="flex h-9 min-w-9 items-center justify-center rounded-md bg-[#6658dd] px-3 text-sm font-black text-white">{safePage}</button><button type="button" onClick={() => goToPage(safePage + 1)} disabled={safePage === totalPages} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button><button type="button" onClick={() => goToPage(totalPages)} disabled={safePage === totalPages} className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 disabled:opacity-50"><ChevronsRight className="h-4 w-4" /></button></div>
          </div>
        </div>
      </section>
      {/* Resume Unlock Success Modal */}
      {unlockSuccessModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800">{unlockSuccessModal.title || 'Profile Unlocked!'}</h3>
            <p className="mt-2 text-sm text-slate-500 font-semibold leading-relaxed">
              {unlockSuccessModal.message || "Candidate's profile and contact details have been successfully unlocked."}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <span>Remaining Unlocks:</span>
              <span className="font-extrabold">{unlockSuccessModal.remainingUnlocks}</span>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setUnlockSuccessModal({ show: false, remainingUnlocks: '' })}
                className="w-full h-11 rounded-xl bg-slate-900 text-white font-extrabold text-sm transition hover:bg-slate-800 shadow-md shadow-slate-900/10 cursor-pointer"
              >
                Awesome
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerSearchCandidates;
