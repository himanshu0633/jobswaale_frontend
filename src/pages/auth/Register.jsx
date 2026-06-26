import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Headphones,
  HelpCircle,
  Info,
  Lock,
  Mail,
  Phone,
  Send,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  User,
  UserPlus
} from 'lucide-react';
import { BASE_API_URL } from '../../context/AuthContext';
import logoAsset from '../../assets/logo-black.png';
import RegImg from './authImages/register-illustration.png'

const benefits = [
  {
    icon: User,
    iconClass: 'bg-sky-100 text-sky-600',
    title: 'Create your profile',
    text: 'and let verified recruiters find you easily.'
  },
  {
    icon: Briefcase,
    iconClass: 'bg-orange-100 text-orange-600',
    title: 'Get relevant opportunities',
    text: 'delivered directly into your primary inbox.'
  },
  {
    icon: Send,
    iconClass: 'bg-sky-100 text-blue-600',
    title: 'Apply with one click',
    text: 'and systematically manage job applications.'
  },
  {
    icon: Trophy,
    iconClass: 'bg-orange-100 text-orange-500',
    title: 'Find the right match',
    text: 'and systematically scale your career paths.'
  }
];

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
    <label className="block text-sm font-bold text-slate-800 mb-2">
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

const WorkStatusCard = ({ value, selected, onChange, icon: Icon, title, text, iconClass }) => (
  <button
    type="button"
    onClick={() => onChange(value)}
    className={`relative flex min-h-[110px] items-center gap-4 rounded-xl border p-5 text-left transition ${
      selected ? 'border-[#0058d6] bg-blue-50' : 'border-slate-300 bg-white hover:border-slate-400'
    }`}
  >
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
      <Icon className="h-5 w-5" />
    </span>
    <span className="pr-8">
      <span className="block text-base font-extrabold text-slate-900">{title}</span>
      <span className="mt-1 block text-sm font-medium leading-6 text-slate-500">{text}</span>
    </span>
    <span className={`absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 ${
      selected ? 'border-[#0058d6]' : 'border-slate-300'
    }`}>
      {selected && <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0058d6]" />}
    </span>
  </button>
);

const RegisterIllustration = () => (
  <div>
    <img src={RegImg} alt="" />
  </div>
);

export const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    mobile: '',
    workStatus: 'experienced',
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

    if (!form.termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BASE_API_URL}/auth/register`, {
        role: 'Jobseeker',
        fullName: form.fullName,
        phone: form.mobile,
        workStatus: form.workStatus,
        updatesConsent: form.updatesConsent,
        email: form.email,
        password: form.password
      });

      setSuccess('Account created successfully. Redirecting to login...');
      setForm({
        fullName: '',
        email: '',
        password: '',
        mobile: '',
        workStatus: 'experienced',
        updatesConsent: true,
        termsAccepted: true
      });
      setTimeout(() => {
        navigate('/login?role=jobseeker', { state: { message: 'Account created successfully. You can now sign in.' } });
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
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            New user registrations are currently disabled by the administrator. Please check back later.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link to="/login" className="w-full py-3 bg-[#0058bf] hover:bg-[#004aa3] text-white font-bold rounded-xl transition shadow-md">
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
    <div className="min-h-screen bg-[#f1f5f9] bg-[radial-gradient(circle_at_0%_0%,rgba(255,87,34,0.08)_0%,transparent_35%),radial-gradient(circle_at_0%_100%,rgba(30,64,175,0.12)_0%,transparent_40%),radial-gradient(circle_at_100%_100%,rgba(255,87,34,0.12)_0%,transparent_40%)] px-4 py-8 text-slate-900">
      <header className="mx-auto mb-8 flex w-full max-w-7xl items-center justify-between">
        <Link to="/" className="inline-flex flex-col">
          <img src={logoAsset} alt="JobsWaale" className="h-14 w-auto object-contain" />
        </Link>
        <div className="hidden text-base font-bold text-slate-800 sm:block">
          Already Registered? <Link to="/login?role=jobseeker" className="text-orange-600 hover:underline">Login here</Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.8fr]">
        <aside className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:min-h-[760px]">
          <RegisterIllustration />

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-950">Why register with</h2>
            <h3 className="mt-2 text-3xl font-extrabold">
              <span className="text-[#0058d6]">Jobs</span><span className="text-[#ff6b00]">Waale</span>?
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
              Create your <span className="text-[#0058d6]">Jobs</span><span className="text-[#ff6b00]">Waale</span> account
            </h1>
            <p className="mt-2 text-base font-medium text-slate-400">
              Join thousands of active job seekers and discover real career matches today.
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
              label="Email Address"
              required
              type="email"
              value={form.email}
              onChange={(event) => setField('email', event.target.value)}
              placeholder="name@example.com"
              helper="We'll send relevant jobs and updates to this email."
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
              label="Mobile Number"
              required
              type="tel"
              value={form.mobile}
              onChange={(event) => setField('mobile', event.target.value.replace(/[^0-9+\s-]/g, ''))}
              placeholder="e.g. +91 99999 88888"
              helper="Recruiters may contact you on this number."
            />

            <div>
              <label className="mb-3 block text-sm font-bold text-slate-800">Work Status<span className="text-rose-500">*</span></label>
              <div className="grid gap-4 md:grid-cols-2">
                <WorkStatusCard
                  value="experienced"
                  selected={form.workStatus === 'experienced'}
                  onChange={(value) => setField('workStatus', value)}
                  icon={Briefcase}
                  title="I'm experienced"
                  text="I have work experience (excluding internships)"
                  iconClass="bg-sky-100 text-blue-600"
                />
                <WorkStatusCard
                  value="fresher"
                  selected={form.workStatus === 'fresher'}
                  onChange={(value) => setField('workStatus', value)}
                  icon={GraduationCap}
                  title="I'm a fresher"
                  text="I am a student / Haven't worked after graduation"
                  iconClass="bg-orange-100 text-orange-500"
                />
              </div>
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
              <UserPlus className="h-5 w-5" />
              {loading ? 'Creating Account...' : 'Create Account'}
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

export default Register;
