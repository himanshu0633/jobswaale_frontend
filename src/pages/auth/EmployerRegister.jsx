import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Briefcase,
  Building2,
  CheckCircle2,
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
import logoAsset from '../../assets/logo.png';

const benefits = [
  {
    icon: Briefcase,
    iconClass: 'bg-sky-100 text-sky-600',
    title: 'Post jobs & find talent',
    text: 'Reach thousands of active job seekers instantly.'
  },
  {
    icon: Users,
    iconClass: 'bg-orange-100 text-orange-600',
    title: 'Access verified candidates',
    text: 'Browse pre-screened, quality applicant profiles.'
  },
  {
    icon: Phone,
    iconClass: 'bg-sky-100 text-blue-600',
    title: 'Direct contact with applicants',
    text: 'Call or message candidates without intermediaries.'
  },
  {
    icon: Gauge,
    iconClass: 'bg-orange-100 text-orange-500',
    title: 'Smart hiring dashboard',
    text: 'Track applications, manage jobs & analytics.'
  }
];

const companyTypes = [
  {
    value: 'startup',
    icon: Rocket,
    title: 'Startup',
    text: 'Building from the ground up',
    iconClass: 'bg-sky-100 text-blue-600'
  },
  {
    value: 'enterprise',
    icon: Building2,
    title: 'Enterprise',
    text: 'Established organization',
    iconClass: 'bg-orange-100 text-orange-500'
  },
  {
    value: 'recruitment-agency',
    icon: Users,
    title: 'Recruitment Agency',
    text: 'Connecting talent with companies',
    iconClass: 'bg-sky-100 text-sky-600'
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
      className={`relative flex min-h-[118px] items-center gap-4 rounded-xl border p-5 text-left transition ${
        selected ? 'border-[#0058d6] bg-blue-50' : 'border-slate-300 bg-white hover:border-slate-400'
      }`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${option.iconClass}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="pr-8">
        <span className="block text-base font-extrabold text-slate-900">{option.title}</span>
        <span className="mt-1 block text-sm font-medium leading-6 text-slate-500">{option.text}</span>
      </span>
      <span className={`absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 ${
        selected ? 'border-[#0058d6]' : 'border-slate-300'
      }`}>
        {selected && <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0058d6]" />}
      </span>
    </button>
  );
};

const RegisterIllustration = () => (
  <div className="relative mx-auto mb-8 flex h-56 max-w-sm items-end justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-orange-50 to-white">
    <div className="absolute left-16 top-10 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg">
      <User className="h-8 w-8" />
    </div>
    <div className="absolute right-20 top-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-100 bg-white text-blue-600 shadow-md">
      <Briefcase className="h-6 w-6" />
    </div>
    <div className="absolute right-12 top-24 flex h-12 w-16 items-center justify-center rounded-2xl border border-orange-100 bg-white text-blue-600 shadow-md">
      <svg width="30" height="24" viewBox="0 0 30 24" fill="none" aria-hidden="true">
        <path d="M3 20H27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M5 17L12 10L17 14L25 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 5H25V7" stroke="#ff6b00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <div className="relative z-10 mb-8 h-36 w-28 rounded-t-[48px] bg-orange-500 shadow-xl">
      <div className="absolute -top-12 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-[#ffd7bd] shadow-md">
        <div className="absolute left-4 top-8 h-2 w-2 rounded-full bg-slate-900" />
        <div className="absolute right-4 top-8 h-2 w-2 rounded-full bg-slate-900" />
        <div className="absolute left-1/2 top-12 h-1.5 w-8 -translate-x-1/2 rounded-full bg-slate-700" />
      </div>
      <div className="absolute -top-16 left-6 h-10 w-16 rounded-full bg-slate-900" />
      <div className="absolute left-8 top-8 h-24 w-12 rounded-t-full bg-white" />
    </div>
    <div className="relative z-20 mb-7 h-24 w-40 rounded-t-xl border border-slate-200 bg-slate-100 shadow-xl">
      <div className="absolute left-1/2 top-8 h-4 w-4 -translate-x-1/2 rounded-full bg-white" />
    </div>
    <div className="absolute bottom-7 h-1 w-72 rounded-full bg-slate-200" />
  </div>
);

export const EmployerRegister = () => {
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
        const response = await axios.get(`${BASE_API_URL}/settings/public`);
        setSettings({
          userRegistration: response.data?.userRegistration !== false,
          minPassLen: Math.max(response.data?.minPassLen || 8, 8)
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

      setSuccess('Employer account created successfully. You can now sign in as Employer.');
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
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] bg-[radial-gradient(circle_at_0%_0%,rgba(255,87,34,0.08)_0%,transparent_35%),radial-gradient(circle_at_0%_100%,rgba(30,64,175,0.12)_0%,transparent_40%),radial-gradient(circle_at_100%_100%,rgba(255,87,34,0.12)_0%,transparent_40%)] px-4 py-8 text-slate-900">
      <header className="mx-auto mb-8 flex w-full max-w-7xl items-center justify-between">
        <Link to="/" className="inline-flex flex-col">
          <img src={logoAsset} alt="JobsWaale" className="h-14 w-auto object-contain" />
        </Link>
        <div className="hidden text-base font-bold text-slate-800 sm:block">
          Already Registered? <Link to="/login?role=employer" className="text-orange-600 hover:underline">Employer Login</Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.8fr]">
        <aside className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:min-h-[980px]">
          <RegisterIllustration />

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-950">Why register as an</h2>
            <h3 className="mt-2 text-3xl font-extrabold">
              <span className="text-[#0058d6]">Employer</span> <span className="text-[#ff6b00]">?</span>
            </h3>
          </div>

          <div className="space-y-7">
            {benefits.map(({ icon: Icon, iconClass, title, text }) => (
              <div key={title} className="flex gap-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">{title}</h4>
                  <p className="mt-1 text-base font-medium leading-7 text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-10">
          <div className="mb-9">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
              Register your <span className="text-[#0058d6]">Company</span> <span className="text-[#ff6b00]">Today</span>
            </h1>
            <p className="mt-2 text-base font-medium leading-7 text-slate-400">
              Join hundreds of employers hiring top talent on JobsWaale. Post jobs, connect with candidates, and grow your team.
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
              helper="We'll send candidate applications and updates to this email."
            />

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

            <div>
              <label className="mb-3 block text-sm font-bold text-slate-800">Company Type <span className="text-rose-500">*</span></label>
              <div className="grid gap-4 lg:grid-cols-3">
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
              <select
                required
                value={form.companySize}
                onChange={(event) => setField('companySize', event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-[#0058d6] focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select number of employees</option>
                {companySizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
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
              <button type="button" className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                <span className="text-lg font-extrabold text-rose-500">G</span>
                Google
              </button>
              <button type="button" className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                <span className="rounded bg-blue-600 px-1.5 py-0.5 text-xs font-extrabold text-white">in</span>
                LinkedIn
              </button>
            </div>
          </form>
        </section>
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
