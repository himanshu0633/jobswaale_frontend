import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, BASE_API_URL } from '../context/AuthContext';
import { Building, Eye, EyeOff, Key, Mail, ShieldAlert } from 'lucide-react';
import axios from 'axios';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(email, password);
      setSuccess('Logged in successfully! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 1000);
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
      const response = await axios.post(`${BASE_API_URL}/auth/seed-admin`, {
        email: 'admin@jobswaale.com',
        password: 'AdminPassword123'
      });
      setSuccess('Initial admin (admin@jobswaale.com / AdminPassword123) seeded successfully! Log in to proceed.');
      setEmail('admin@jobswaale.com');
      setPassword('AdminPassword123');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin seeding failed. It might already be seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-900">
      
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -top-40 -left-40" />
        <div className="absolute w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -bottom-40 -right-40" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center justify-center w-14 h-14 mb-3 text-white bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
            <Building className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Jobs<span className="text-indigo-400">Waale</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access control panel and manage masters
          </p>
        </div>

        {/* Card Panel */}
        <div className="overflow-hidden border bg-slate-800/80 border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="p-6 sm:p-8">
            
            {/* Success Alert */}
            {success && (
              <div className="flex items-center gap-2.5 p-3 mb-6 text-sm font-medium border rounded-lg bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-2.5 p-3 mb-6 text-sm font-medium border rounded-lg bg-rose-500/10 border-rose-500/20 text-rose-400">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Key className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-colors"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

            </form>

            {/* Public Registration Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                  Register here
                </Link>
              </p>
            </div>

            {/* Seed Admin Block */}
            <div className="pt-6 mt-6 border-t border-slate-700/60 text-center">
              <button
                type="button"
                onClick={handleSeedAdmin}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-700 hover:bg-slate-700/40 px-3 py-1.5 rounded-lg transition-all"
              >
                Seed Initial Admin Account
              </button>
              <p className="mt-1 text-[10px] text-slate-500">
                Creates initial admin: admin@jobswaale.com / AdminPassword123
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} JobsWaale — Designed by Duke Infosys
        </p>

      </div>
    </div>
  );
};
export default Login;
