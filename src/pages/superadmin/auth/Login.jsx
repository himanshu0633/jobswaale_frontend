import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { BASE_API_URL, useAuth } from '../../../context/AuthContext';
import logoBlack from '../../../assets/logo-black.png';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(email, password);
      setSuccess('Logged in successfully! Redirecting...');
      setTimeout(() => navigate('/admin'), 700);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAdmin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post(`${BASE_API_URL}/auth/seed-admin`, {
        email: 'admin@jobswaale.com',
        password: 'AdminPassword123'
      });
      setSuccess('Initial super admin (admin@jobswaale.com / AdminPassword123) seeded successfully! Log in to proceed.');
      setEmail('admin@jobswaale.com');
      setPassword('AdminPassword123');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin seeding failed. It might already be seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[120px] -top-20 -left-20" />
        <div className="absolute w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-[120px] -bottom-20 -right-20" />
      </div>

      <div className="w-full max-w-[420px] z-10 space-y-6">
        <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 overflow-hidden">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <img src={logoBlack} alt="JobsWaale Logo" className="h-12" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Super Admin Sign In</h1>
            <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
              Enter your super admin email and password to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {success && (
              <div className="flex items-center gap-2.5 p-3 text-sm font-semibold border rounded-xl bg-emerald-50 border-emerald-100 text-emerald-800">
                <div className="flex-grow">{success}</div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2.5 p-3 text-sm font-semibold border rounded-xl bg-rose-50 border-rose-100 text-rose-800">
                <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500" />
                <div className="flex-grow">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="superAdminEmail" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email address <span className="text-rose-500">*</span>
              </label>
              <input
                id="superAdminEmail"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
              />
            </div>

            <div>
              <label htmlFor="superAdminPassword" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="superAdminPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span>Keep me signed in</span>
              </label>
              <Link to="/forgot-password" className="underline hover:text-slate-700">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-md shadow-indigo-600/10 transition-colors text-sm"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="pt-5 mt-5 border-t border-slate-100 text-center space-y-2">
            <button
              type="button"
              onClick={handleSeedAdmin}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Seed Initial Super Admin Account
            </button>
            <p className="text-[10px] text-slate-400 font-semibold">
              Creates initial super admin: admin@jobswaale.com / AdminPassword123
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 font-semibold">
          &copy; {new Date().getFullYear()} JobsWaale - by <span className="font-bold text-slate-500">Duke Infosys</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
