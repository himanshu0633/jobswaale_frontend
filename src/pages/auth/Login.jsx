import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Briefcase,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  ShieldAlert,
  User
} from 'lucide-react';
import { BASE_API_URL } from '../../context/AuthContext';
import logoAsset from '../../assets/logo-black.png';

const makeCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const RoleButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition ${
      active ? 'bg-white text-[#0058bf] shadow-sm' : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    <Icon className="h-5 w-5" />
    {label}
  </button>
);

export const Login = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(searchParams.get('role') === 'employer' ? 'employer' : 'jobseeker');
  const [loginMethod, setLoginMethod] = useState('password');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaEnabled, setCaptchaEnabled] = useState(false);
  const [captchaCode, setCaptchaCode] = useState(makeCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);

  const navigate = useNavigate();
  const registerPath = role === 'employer' ? '/employer-register' : '/jobseeker-register';

  const identifierIcon = useMemo(() => {
    return /^[0-9+() -]{3,}$/.test(identifier.trim()) ? Phone : Mail;
  }, [identifier]);
  const IdentifierIcon = identifierIcon;

  useEffect(() => {
    const loadPublicSettings = async () => {
      try {
        const response = await axios.get(`${BASE_API_URL}/settings/public`);
        const enabled = response.data?.captchaEnabled === true;
        setCaptchaEnabled(enabled);
        const regEnabled = response.data?.userRegistration !== false;
        setRegistrationEnabled(regEnabled);
        if (enabled) setCaptchaCode(makeCaptcha());
      } catch {
        setCaptchaEnabled(false);
        setRegistrationEnabled(true);
      }
    };
    loadPublicSettings();
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const refreshCaptcha = () => {
    setCaptchaCode(makeCaptcha());
    setCaptchaInput('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (captchaEnabled && captchaInput.trim().toUpperCase() !== captchaCode) {
      setError('Captcha does not match. Please try again.');
      refreshCaptcha();
      return;
    }

    if (loginMethod === 'otp') {
      setError('OTP login is not connected yet. Please use password login.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_API_URL}/auth/login`, {
        email: identifier,
        password
      });
      const accountType = response.data?.accountType || response.data?.role;
      if (role === 'jobseeker' && accountType !== 'jobseeker' && response.data?.role !== 'Jobseeker') {
        setError('Please select the correct account type for this login.');
        return;
      }
      if (role === 'employer' && accountType !== 'employer' && response.data?.role !== 'Employer') {
        setError('Please select the correct account type for this login.');
        return;
      }
      localStorage.setItem('publicUser', JSON.stringify(response.data));
      if (response.data?.token) localStorage.setItem('publicToken', response.data.token);
      setSuccess('Logged in successfully.');
      setTimeout(() => navigate('/'), 700);
    } catch (err) {
      setError(err.message || 'Invalid login credentials.');
      if (captchaEnabled) refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#f1f5f9] bg-[radial-gradient(circle_at_0%_0%,rgba(255,87,34,0.08)_0%,transparent_35%),radial-gradient(circle_at_0%_100%,rgba(30,64,175,0.12)_0%,transparent_40%),radial-gradient(circle_at_100%_100%,rgba(255,87,34,0.12)_0%,transparent_40%)] text-slate-900">
      <main className="flex flex-1 items-start justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-[560px]">
          <div className="mb-9 flex justify-center">
            <Link to="/" className="inline-flex">
              <img src={logoAsset} alt="JobsWaale" className="h-16 w-auto object-contain" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-10">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">Account Sign In</h1>
              <p className="mt-2 text-base font-medium text-slate-400">Choose your profile and enter your credentials</p>
            </div>

            {success && (
              <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex rounded-2xl bg-slate-50 p-2">
                <RoleButton active={role === 'jobseeker'} icon={User} label="Job Seeker" onClick={() => setRole('jobseeker')} />
                <RoleButton active={role === 'employer'} icon={Briefcase} label="Employer" onClick={() => setRole('employer')} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold text-slate-800">Email or Phone Number</label>
                <div className="relative flex items-center rounded-xl border border-slate-300 bg-white transition focus-within:border-[#0058bf] focus-within:ring-2 focus-within:ring-blue-100">
                  <IdentifierIcon className="absolute left-4 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="Enter email or mobile number"
                    className="w-full rounded-xl border-0 bg-transparent py-4 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {loginMethod === 'password' ? (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-extrabold text-slate-800">Password</label>
                    <Link to="/forgot-password" className="text-xs font-bold text-[#0058bf] hover:underline">Forgot Password?</Link>
                  </div>
                  <div className="relative flex items-center rounded-xl border border-slate-300 bg-white transition focus-within:border-[#0058bf] focus-within:ring-2 focus-within:ring-blue-100">
                    <Lock className="absolute left-4 h-5 w-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border-0 bg-transparent py-4 pl-12 pr-14 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-extrabold text-slate-800">One-Time Password (OTP)</label>
                  <div className="flex rounded-xl border border-slate-300 bg-white">
                    <input
                      type="text"
                      value={otp}
                      onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full rounded-l-xl border-0 bg-transparent px-4 py-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    <button type="button" className="rounded-r-xl bg-slate-100 px-4 text-sm font-bold text-slate-600">
                      Send OTP
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod((current) => current === 'password' ? 'otp' : 'password');
                    setError('');
                  }}
                  className="text-sm font-extrabold text-[#0058bf] hover:underline"
                >
                  {loginMethod === 'password' ? 'Login with OTP instead' : 'Login with Password instead'}
                </button>
              </div>

              {captchaEnabled && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-2 block text-sm font-extrabold text-slate-800">Captcha Verification</label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex min-w-36 items-center justify-between rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3">
                      <span className="select-none font-mono text-xl font-black tracking-[0.3em] text-slate-800">{captchaCode}</span>
                      <button type="button" onClick={refreshCaptcha} className="text-[#0058bf]" aria-label="Refresh captcha">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={(event) => setCaptchaInput(event.target.value.toUpperCase())}
                      placeholder="Enter captcha"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold uppercase outline-none focus:border-[#0058bf] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#0058bf] px-5 py-4 text-base font-extrabold text-white shadow-lg shadow-blue-600/10 transition hover:bg-[#004aa3] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Logging in...' : 'Login to Account'}
              </button>

              <div className="relative flex items-center justify-center py-1">
                <div className="h-px w-full bg-slate-100" />
                <span className="absolute bg-white px-4 text-sm font-medium text-slate-400">Or connect with</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                  <span className="text-lg font-extrabold text-rose-500">G</span>
                  Google
                </button>
                <button type="button" className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                  <span className="rounded bg-blue-600 px-1.5 py-0.5 text-xs font-extrabold text-white">in</span>
                  LinkedIn
                </button>
              </div>

              {registrationEnabled && (
                <div className="text-center text-sm font-medium text-slate-400">
                  Don't have an account? <Link to={registerPath} className="font-extrabold text-[#0058bf] hover:underline">Sign up here</Link>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-[#001b35] px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm font-medium text-white/50 md:flex-row">
          <p>© 2026 JobsWaale. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-white">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
