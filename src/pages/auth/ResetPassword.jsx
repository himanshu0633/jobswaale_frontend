import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { BASE_API_URL } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, AlertOctagon, CheckCircle2, Loader, ArrowLeft, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import logoBlack from '../../assets/logo-black.png';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setError('Password reset link is missing or invalid. Please request a new one.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await axios.get(`${BASE_API_URL}/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
        if (isMounted) {
          if (res.data.valid) {
            setTokenValid(true);
            setUserInfo(res.data);
          } else {
            setTokenValid(false);
            setError(res.data.message || 'Password reset link is invalid or has expired.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setTokenValid(false);
          setError(err.response?.data?.message || 'Password reset link is invalid or has expired. Please request a new one.');
        }
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter a new password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(`${BASE_API_URL}/auth/reset-password`, {
        token,
        password
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  const isSuperAdmin = userInfo?.accountType === 'admin' || userInfo?.role?.toLowerCase() === 'admin';

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blur decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[120px] -top-20 -left-20" />
        <div className="absolute w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-[120px] -bottom-20 -right-20" />
      </div>

      <div className="w-full max-w-[440px] z-10 space-y-6">
        <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 overflow-hidden">
          
          {/* Logo Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img src={logoBlack} alt="JobsWaale Logo" className="h-10" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">
              {success ? 'Password Reset Complete' : 'Reset Your Password'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
              {success
                ? 'Your password has been successfully updated.'
                : userInfo?.email
                ? `Enter a new password for ${userInfo.email}`
                : 'Choose a strong password to protect your account.'}
            </p>
          </div>

          {/* 1. Verifying State */}
          {verifying && (
            <div className="py-12 text-center space-y-3">
              <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">Verifying your reset link...</p>
            </div>
          )}

          {/* 2. Success State */}
          {!verifying && success && (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-600 font-medium">
                  You can now log in using your new password.
                </p>
              </div>

              <div className="pt-2 space-y-2.5">
                {isSuperAdmin ? (
                  <Link
                    to="/superadmin-login"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md shadow-indigo-600/10 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <span>Sign In to Super Admin</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md shadow-indigo-600/10 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <span>Sign In to JobsWaale</span>
                    </Link>
                    <Link
                      to="/superadmin-login"
                      className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5"
                    >
                      <span>Super Admin Sign In</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 3. Invalid Token State */}
          {!verifying && !tokenValid && !success && (
            <div className="space-y-6 text-center animate-in fade-in duration-200">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-800">Invalid or Expired Link</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
                  {error || 'This password reset link is invalid or has expired. Password reset links expire after 1 hour.'}
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Link
                  to="/forgot-password"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md shadow-indigo-600/10 transition-colors text-sm flex items-center justify-center gap-1.5"
                >
                  <span>Request New Reset Link</span>
                </Link>
                <div className="flex items-center justify-center gap-3 text-xs font-semibold text-slate-500">
                  <Link to="/login" className="hover:text-slate-800">User Sign In</Link>
                  <span>•</span>
                  <Link to="/superadmin-login" className="hover:text-slate-800">Super Admin Sign In</Link>
                </div>
              </div>
            </div>
          )}

          {/* 4. Active Reset Password Form */}
          {!verifying && tokenValid && !success && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
              {error && (
                <div className="flex items-start gap-2.5 p-3 text-xs sm:text-sm font-semibold border rounded-xl bg-amber-50 border-amber-200 text-amber-900" role="alert">
                  <AlertOctagon className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                  <span className="flex-grow">{error}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password (min. 8 characters)"
                    minLength={8}
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    minLength={8}
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Must be at least 8 characters long</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-md shadow-indigo-600/10 transition-colors text-sm flex items-center justify-center gap-1.5"
                >
                  {submitting && <Loader className="w-4 h-4 animate-spin" />}
                  <span>{submitting ? 'Resetting Password...' : 'Reset Password'}</span>
                </button>
              </div>

              <p className="text-slate-500 text-center text-xs pt-3 font-semibold">
                Back to{' '}
                <Link to={isSuperAdmin ? '/superadmin-login' : '/login'} className="underline hover:text-slate-800 font-bold text-indigo-600">
                  {isSuperAdmin ? 'Super Admin Sign In' : 'Sign In'}
                </Link>
              </p>
            </form>
          )}

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 font-semibold">
          &copy; {new Date().getFullYear()} JobsWaale — by{' '}
          <a
            href="https://www.dukeinfosys.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-slate-500 hover:text-[#6658dd] transition-colors"
          >
            Duke Infosys
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
