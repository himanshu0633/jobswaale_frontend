import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  Gauge,
  Headphones,
  HelpCircle,
  Info,
  Landmark,
  Lock,
  Mail,
  Phone,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  User,
  Users
} from 'lucide-react';
import { BASE_API_URL } from '../../context/AuthContext';
import { getPublicSettings } from '../../utils/publicSettings';
import logoAsset from '../../assets/logo-black.png';
import RegImg from './authImages/register-illustration.png'

const benefits = [
  {
    icon: Briefcase,
    iconClass: 'bg-white/10 text-orange-400',
    title: 'Post jobs & find talent',
    text: 'Reach thousands of active job seekers instantly.'
  },
  {
    icon: Users,
    iconClass: 'bg-white/10 text-slate-300',
    title: 'Access verified candidates',
    text: 'Browse pre-screened, quality applicant profiles.'
  },
  {
    icon: Phone,
    iconClass: 'bg-white/10 text-orange-400',
    title: 'Direct contact with applicants',
    text: 'Call or message candidates without intermediaries.'
  },
  {
    icon: Gauge,
    iconClass: 'bg-white/10 text-slate-300',
    title: 'Smart hiring dashboard',
    text: 'Track applications, manage jobs & analytics.'
  },
  {
    icon: Gauge,
    iconClass: 'h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-gray-300 to-gray-500',   
    title: '2,500 + Employers',  
    text: 'Already hiring on JobsWaale.'
  }
];

const companyTypes = [
  {
    value: 'startup',
    icon: Rocket,
    title: 'Startup',
    text: 'Building from the ground up',
    iconClass: 'bg-blue-50 text-blue-600'
  },
  {
    value: 'enterprise',
    icon: Building2,
    title: 'Enterprise',
    text: 'Established organization',
    iconClass: 'bg-slate-100 text-slate-700'
  },
  {
    value: 'recruitment-agency',
    icon: Users,
    title: 'Recruitment Agency',
    text: 'Connecting talent with companies',
    iconClass: 'bg-orange-50 text-orange-600'
  }
];

const companySizes = ['1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '501-1000 employees', '1000+ employees'];

const footerLinks = [
  { label: 'About Us', icon: Info, to: '/about' },
  { label: 'Contact Us', icon: Phone, to: '/contact' },
  { label: 'FAQs', icon: HelpCircle, to: '/faq' },
  { label: 'Terms & Conditions', icon: FileText, to: '/terms-conditions' },
  { label: 'Privacy Policy', icon: ShieldCheck, to: '/privacy-policy' },
  { label: 'Help Center', icon: Headphones, to: '/contact' }
];

const getPasswordStrength = (password) => {
  if (!password) return { width: '0%', label: '', color: 'bg-transparent', text: 'text-slate-400' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { width: '25%', label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
  if (score <= 3) return { width: '60%', label: 'Medium', color: 'bg-amber-500', text: 'text-amber-600' };
  return { width: '100%', label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
};

const TextInput = ({ icon: Icon, label, required, helper, right, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-bold text-slate-800">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative flex items-center rounded-xl border border-slate-300 bg-white transition focus-within:border-[#0058d6] focus-within:ring-2 focus-within:ring-blue-100">
      <Icon className="absolute left-4 h-5 w-5 text-[#0058d6]" />
      <input
        {...props}
        className={`w-full rounded-xl border-0 bg-transparent py-4 pl-12 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 ${right ? 'pr-12' : 'pr-4'}`}
      />
      {right}
    </div>
    {helper && <p className="mt-2 pl-2 text-sm font-medium text-slate-500">{helper}</p>}
  </div>
);

const CompanyTypeCard = ({ option, selected, onChange }) => {
  const Icon = option.icon;

  return (
    <button
      type="button"
      onClick={() => onChange(option.value)}
      className={`relative flex items-center gap-3 rounded-xl border p-4 text-left transition ${
        selected ? 'border-[#0058d6] bg-blue-50' : 'border-slate-300 bg-white hover:border-slate-400'
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${option.iconClass}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-extrabold text-slate-900 truncate">{option.title}</span>
        <span className="block text-xs font-medium text-slate-500 truncate">{option.text}</span>
      </span>
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
        selected ? 'border-[#0058d6]' : 'border-slate-300'
      }`}>
        {selected && <span className="h-2 w-2 rounded-full bg-[#0058d6]" />}
      </span>
    </button>
  );
};

const CompanySizeDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedLabel = value || 'Select number of employees';

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-5 py-4 text-left text-sm font-bold outline-none transition focus:border-[#0058d6] focus:ring-2 focus:ring-blue-100 ${
          open ? 'border-[#0058d6] ring-2 ring-blue-100' : 'border-slate-300'
        } ${value ? 'text-slate-800' : 'text-slate-400'}`}
      >
        <span className="min-w-0 truncate">{selectedLabel}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-[#0058d6] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/15"
        >
          {companySizes.map((size) => {
            const selected = value === size;

            return (
              <button
                key={size}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(size);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold transition ${
                  selected ? 'bg-blue-50 text-[#0058d6]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{size}</span>
                {selected && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const RegisterIllustration = () => (
  <div className="mx-auto max-w-[260px]">
    <img src={RegImg} alt="" className="w-full h-auto drop-shadow-xl" />
  </div>
);

export const EmployerRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    designation: '',
    companyType: 'startup',
    companySize: '',
    updatesConsent: true,
    termsAccepted: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ userRegistration: true, minPassLen: 8 });

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getPublicSettings();
        setSettings({
          userRegistration: data?.userRegistration !== false,
          minPassLen: Math.max(data?.minPassLen || 8, 8)
        });
      } catch {
        setSettings({ userRegistration: true, minPassLen: 8 });
      }
    };
    loadSettings();
  }, []);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!settings.userRegistration) {
      setError('New registrations are currently disabled.');
      return;
    }

    if (form.password.length < settings.minPassLen) {
      setError(`Password must be at least ${settings.minPassLen} characters.`);
      return;
    }

    if (!form.companySize) {
      setError('Please select company size.');
      return;
    }

    if (!form.termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BASE_API_URL}/auth/register`, {
        role: 'Employer',
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        designation: form.designation,
        companyType: form.companyType,
        companySize: form.companySize,
        updatesConsent: form.updatesConsent
      });

      setSuccess('Employer account created successfully. Redirecting to login...');
      setForm({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        companyName: '',
        designation: '',
        companyType: 'startup',
        companySize: '',
        updatesConsent: true,
        termsAccepted: true
      });
      setTimeout(() => {
        navigate('/login?role=employer', { state: { message: 'Employer account created successfully. You can now sign in as Employer.' } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!settings.userRegistration) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-rose-50 text-rose-550 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Registration Disabled</h1>
          <p className="text-slate-550 text-sm mt-3 leading-relaxed">
            New employer registrations are currently disabled by the administrator. Please check back later.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link to="/login?role=employer" className="w-full py-3 bg-[#0058bf] hover:bg-[#004aa3] text-white font-bold rounded-xl transition shadow-md">
              Go to Login
            </Link>
            <Link to="/" className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold rounded-xl transition">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4ff] bg-[radial-gradient(circle_at_0%_0%,rgba(0,88,214,0.08)_0%,transparent_35%),radial-gradient(circle_at_100%_0%,rgba(0,88,191,0.10)_0%,transparent_40%),radial-gradient(circle_at_100%_100%,rgba(0,88,214,0.06)_0%,transparent_40%)] px-4 py-8 text-slate-900">
      <header className="mx-auto mb-8 flex w-full max-w-7xl items-center justify-between">
        <Link to="/" className="inline-flex flex-col">
          <img src={logoAsset} alt="JobsWaale" className="h-14 w-auto object-contain" />
        </Link>
        <div className="hidden text-base font-bold text-slate-800 sm:block">
          Already Registered? <Link to="/login?role=employer" className="text-[#0058d6] hover:underline">Employer Login</Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-10 border-t-4 border-t-[#0058d6]">
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Employer Registration</p>
              <p className="text-xs font-medium text-slate-500">Create your company account and start hiring</p>
            </div>
          </div>

          <div className="mb-9">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
              Build Your <span className="text-[#0058d6]">Employer</span> Account
            </h1>
            <p className="mt-2 text-base font-medium leading-7 text-slate-400">
              Register your organization and gain access to top talent. Manage jobs, track applications, and grow your team with JobsWaale.
            </p>
          </div>

          {success && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          {!settings.userRegistration && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              New registrations are currently disabled by admin.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput
                icon={User}
                label="Full Name"
                required
                type="text"
                value={form.fullName}
                onChange={(event) => setField('fullName', event.target.value)}
                placeholder="Enter your full name"
              />
              <TextInput
                icon={Mail}
                label="Official Email Address"
                required
                type="email"
                value={form.email}
                onChange={(event) => setField('email', event.target.value)}
                placeholder="you@company.com"
                // helper="We'll send candidate applications and updates to this email."
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <TextInput
                  icon={Lock}
                  label="Password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => setField('password', event.target.value)}
                  placeholder="Create Password"
                  helper={`Minimum ${settings.minPassLen} characters.`}
                  right={(
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-4 text-[#0058d6]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  )}
                />
                {form.password && (
                  <div className="mt-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Password Strength: <span className={strength.text}>{strength.label}</span>
                    </p>
                  </div>
                )}
              </div>
              <TextInput
                icon={Phone}
                label="Phone Number"
                required
                type="tel"
                value={form.phone}
                onChange={(event) => setField('phone', event.target.value.replace(/[^0-9+\s-]/g, ''))}
                placeholder="e.g. +91 99999 88888"
                helper="Candidates and our team may contact you on this number."
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput
                icon={Building2}
                label="Company / Organization Name"
                required
                type="text"
                value={form.companyName}
                onChange={(event) => setField('companyName', event.target.value)}
                placeholder="e.g. ABC Pvt. Ltd."
              />
              <TextInput
                icon={Landmark}
                label="Designation / Job Title"
                required
                type="text"
                value={form.designation}
                onChange={(event) => setField('designation', event.target.value)}
                placeholder="e.g. HR Manager, Founder, Recruiter"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-bold text-slate-800">Company Type <span className="text-rose-500">*</span></label>
              <div className="grid gap-3 sm:grid-cols-3">
                {companyTypes.map((option) => (
                  <CompanyTypeCard
                    key={option.value}
                    option={option}
                    selected={form.companyType === option.value}
                    onChange={(value) => setField('companyType', value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800">Company Size <span className="text-rose-500">*</span></label>
              <CompanySizeDropdown
                value={form.companySize}
                onChange={(size) => setField('companySize', size)}
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 text-sm font-medium text-slate-500">
                <input
                  type="checkbox"
                  checked={form.updatesConsent}
                  onChange={(event) => setField('updatesConsent', event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0058d6] focus:ring-[#0058d6]"
                />
                <span>Send me important updates & promotions via SMS, Email, and WhatsApp</span>
              </label>
              <label className="flex items-start gap-3 text-sm font-medium text-slate-500">
                <input
                  type="checkbox"
                  checked={form.termsAccepted}
                  onChange={(event) => setField('termsAccepted', event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0058d6] focus:ring-[#0058d6]"
                />
                <span>
                  By creating an account, you agree to JobsWaale's{' '}
                  <Link to="/terms-conditions" className="font-bold text-[#0058d6] hover:underline">Terms of Service</Link>
                  {' '} & {' '}
                  <Link to="/privacy-policy" className="font-bold text-[#0058d6] hover:underline">Privacy Policy</Link>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !settings.userRegistration}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0058bf] px-5 py-4 text-base font-extrabold text-white shadow-lg shadow-blue-600/10 transition hover:bg-[#004aa3] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Building2 className="h-5 w-5" />
              {loading ? 'Registering Employer...' : 'Register as Employer'}
            </button>

            <div className="relative flex items-center justify-center py-1">
              <div className="h-px w-full bg-slate-100" />
              <span className="absolute bg-white px-4 text-sm font-medium text-slate-400">Or sign up with</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
                <span className="text-lg font-extrabold text-rose-500">G</span>
                Google
              </button>
              <button type="button" className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
                <span className="rounded bg-blue-600 px-1.5 py-0.5 text-xs font-extrabold text-white">in</span>
                LinkedIn
              </button>
            </div>
          </form>
        </section>

        <aside className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-lg lg:min-h-[760px]">
  <div className="mb-6">
    <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">
      <Building2 className="h-3 w-3" />
      For Employers
    </div>

    <RegisterIllustration />
  </div>

  <div className="mb-6">
    <h2 className="text-xl font-bold text-gray-800">
      Why register with
    </h2>

    <h3 className="mt-2 text-3xl font-extrabold">
      <span className="text-gray-900">Jobs</span>
      <span className="text-orange-500">Waale</span>
      <span className="text-gray-900">?</span>
    </h3>
  </div>

  <div className="flex-1 space-y-3">
    {benefits.map(({ icon: Icon, iconClass, title, text }) => (
      <div
        key={title}
        className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-orange-200 hover:bg-orange-50/40"
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </span>

        <div>
          <h4 className="text-sm font-bold text-gray-900">
            {title}
          </h4>

          <p className="mt-1 text-sm leading-5 text-gray-600">
            {text}
          </p>
        </div>
      </div>
      
    ))}
  </div>

  {/* <div className="mt-6 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div className="flex -space-x-2">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-gray-300 to-gray-500"
        />
      ))}
    </div>

    <div>
      <p className="text-sm font-bold text-gray-900">
        2,500+ Employers
      </p>

      <p className="text-sm text-gray-600">
        Already hiring on JobsWaale
      </p>
    </div>
  </div> */}
</aside>
      </main>

      <footer className="mx-auto mt-8 w-full max-w-7xl pb-4 text-center">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {footerLinks.map(({ label, icon: Icon, to }, index) => (
            <span key={label} className="inline-flex items-center gap-3">
              {index > 0 && <span className="text-slate-300">|</span>}
              <Link to={to} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0058d6] hover:underline">
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </span>
          ))}
        </div>
        <p className="text-sm font-medium text-slate-400">© 2026 JobsWaale. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default EmployerRegister;
