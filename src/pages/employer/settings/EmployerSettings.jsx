import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  User,
  Bell,
  Settings,
  EyeOff,
  Trash2,
  Upload,
  Laptop,
  Smartphone,
  Tablet,
  Save,
  RefreshCw,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Mail,
  Languages,
  Clock,
  Calendar,
  Globe,
  Loader
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const EmployerSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Tab Navigation items
  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'privacy', label: 'Privacy', icon: EyeOff },
    { id: 'delete', label: 'Delete Account', icon: Trash2 }
  ];

  // Forms States
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    altEmail: '',
    bio: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  const [notifications, setNotifications] = useState({
    newApplications: true,
    interviewReminders: true,
    candidateMessages: true,
    pipelineProgress: true,
    billingUpdates: true,
    weeklyDigest: false,
    appApplications: true,
    appReminders: true,
    appAnnouncements: true
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'IST',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12hr',
    currency: 'INR',
    itemsPerPage: '10'
  });

  const [privacy, setPrivacy] = useState({
    showPublic: true,
    showPhone: false,
    readReceipts: true,
    emailSearch: true
  });

  const [sessions, setSessions] = useState([
    { id: '1', device: 'Windows PC - Chrome', location: 'Bangalore, India · Current session', icon: Laptop, active: true },
    { id: '2', device: 'iPhone 15 - Safari', location: 'Bangalore, India · 2 hours ago', icon: Smartphone, active: false },
    { id: '3', device: 'iPad - Chrome', location: 'New Delhi, India · 3 days ago', icon: Tablet, active: false }
  ]);

  const loadSettings = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await axios.get(`${BASE_API_URL}/employer/settings`, { headers: getTokenHeaders() });
      if (response.data.profile) setProfileForm(response.data.profile);
      if (response.data.settings?.notifications) setNotifications(response.data.settings.notifications);
      if (response.data.settings?.preferences) setPreferences(response.data.settings.preferences);
      if (response.data.settings?.privacy) setPrivacy(response.data.settings.privacy);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load settings details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await axios.put(`${BASE_API_URL}/employer/settings`, {
        type: 'profile',
        profile: profileForm
      }, { headers: getTokenHeaders() });
      showNotification('Profile information saved successfully!');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save profile settings.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (passwordForm.newPass !== passwordForm.confirm) {
      alert('New password and confirm password do not match.');
      return;
    }
    try {
      await axios.put(`${BASE_API_URL}/employer/settings`, {
        type: 'password',
        password: passwordForm
      }, { headers: getTokenHeaders() });
      showNotification('Password updated successfully!');
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update password.');
    }
  };

  const handleSaveNotifications = async () => {
    setErrorMsg('');
    try {
      await axios.put(`${BASE_API_URL}/employer/settings`, {
        type: 'notifications',
        notifications
      }, { headers: getTokenHeaders() });
      showNotification('Notification preferences saved.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save notifications.');
    }
  };

  const handleSavePreferences = async () => {
    setErrorMsg('');
    try {
      await axios.put(`${BASE_API_URL}/employer/settings`, {
        type: 'preferences',
        preferences
      }, { headers: getTokenHeaders() });
      showNotification('App preferences saved.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save app preferences.');
    }
  };

  const handleSavePrivacy = async () => {
    setErrorMsg('');
    try {
      await axios.put(`${BASE_API_URL}/employer/settings`, {
        type: 'privacy',
        privacy
      }, { headers: getTokenHeaders() });
      showNotification('Privacy preferences updated.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save privacy.');
    }
  };

  const handleSessionLogout = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
    showNotification('Session terminated.');
  };

  const handleDeleteAccountSubmit = async () => {
    const checked = document.getElementById('confirmDelete')?.checked;
    if (!checked) {
      alert('Please check the confirmation box to delete your account.');
      return;
    }
    if (window.confirm('WARNING: Are you absolutely sure you want to delete your recruiter account? This is irreversible.')) {
      setErrorMsg('');
      try {
        await axios.put(`${BASE_API_URL}/employer/settings`, { type: 'delete' }, { headers: getTokenHeaders() });
        alert('Account deleted successfully. You will be redirected.');
        localStorage.clear();
        window.location.href = '/login';
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Failed to delete account.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <Loader className="h-9 w-9 animate-spin text-[#6658dd]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3f4254]">Settings</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">Configure your personal profile details, account security, notifications, and preferences.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
          <span className="text-[#3f4254]">JobsWaale</span>
          <span className="text-slate-300">/</span>
          <span>Company</span>
          <span className="text-slate-300">/</span>
          <span className="text-[#6658dd]">Settings</span>
        </div>
      </div>

      {/* Success Alert Popup */}
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid gap-6 xl:grid-cols-4">
        
        {/* LEFT NAVIGATION COLUMN */}
        <div className="xl:col-span-1">
          <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm space-y-4">
            
            {/* Header info */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 border border-slate-100">
                <img src="/assets/images/users/user-3.jpg" alt="User avatar" className="h-full w-full object-cover" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" }} />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-extrabold text-[#3f4254] text-sm">{profileForm.fullName}</h5>
                <span className="block text-slate-400 text-xs font-semibold break-all">{profileForm.email}</span>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="flex flex-col gap-1 text-xs font-bold text-slate-500">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setErrorMsg('');
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center gap-2.5 rounded-lg py-2.5 px-3 transition-all ${
                    activeTab === item.id
                      ? 'bg-[#6658dd] text-white font-extrabold shadow-sm'
                      : 'hover:bg-slate-50 text-slate-500 hover:text-[#3f4254]'
                  }`}
                >
                  <item.icon className="h-4.5 w-4.5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* RIGHT PANELS CONTENT */}
        <div className="xl:col-span-3">
          <div className="tab-content">
            
            {/* 1. MY PROFILE PANEL */}
            {activeTab === 'profile' && (
              <div className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-5 bg-slate-50/50">
                  <h3 className="font-extrabold text-[#3f4254] text-base">Personal Information</h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Update your personal details and profile photo.</p>
                </div>
                <form onSubmit={handleProfileSubmit} className="p-5 space-y-5 text-xs font-bold text-slate-500">
                  
                  {/* Photo upload section */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50/60 rounded-lg border border-slate-100">
                    <div className="h-16 w-16 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm bg-slate-100">
                      <img src="/assets/images/users/user-3.jpg" alt="Profile" className="h-full w-full object-cover" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" }} />
                    </div>
                    <div className="space-y-1.5">
                      <h6 className="font-extrabold text-sm text-[#3f4254]">Profile Photo</h6>
                      <p className="text-xs font-semibold text-slate-400">Upload a professional photo. Maximum size: 2MB.</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => alert('Photo upload dialog triggered')} className="inline-flex items-center gap-1 bg-[#6658dd] text-white px-2.5 py-1.5 rounded hover:bg-[#5848d8] transition">
                          <Upload className="h-3.5 w-3.5" />
                          Upload New
                        </button>
                        <button type="button" onClick={() => alert('Photo removed')} className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 px-2.5 py-1.5 rounded hover:bg-rose-100 transition border border-rose-100">
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Form inputs */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-slate-600">Full Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                        value={profileForm.fullName}
                        onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-600">Email Address</label>
                      <input
                        type="email"
                        disabled
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-400 bg-slate-50 outline-none"
                        value={profileForm.email}
                      />
                      <span className="text-[10px] font-semibold text-slate-400 block mt-1">Email cannot be changed. Contact support to update.</span>
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-600">Phone Number</label>
                      <input
                        type="text"
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                        value={profileForm.phone}
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-600">Job Title / Designation</label>
                      <input
                        type="text"
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                        value={profileForm.jobTitle}
                        onChange={e => setProfileForm({ ...profileForm, jobTitle: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-600">Department</label>
                      <input
                        type="text"
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                        value={profileForm.department}
                        onChange={e => setProfileForm({ ...profileForm, department: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-600">Alternate Email</label>
                      <input
                        type="email"
                        placeholder="backup@email.com"
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                        value={profileForm.altEmail}
                        onChange={e => setProfileForm({ ...profileForm, altEmail: e.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block mb-1 text-slate-600">Bio</label>
                      <textarea
                        rows="3"
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                        value={profileForm.bio}
                        onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={loadSettings}
                      className="rounded-lg border border-slate-200 px-4.5 py-2.5 text-sm font-extrabold text-slate-600 hover:bg-slate-50 transition flex items-center gap-1"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-[#6658dd] px-4.5 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-[#5848d8] transition flex items-center gap-1.5"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. SECURITY PANEL */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                
                {/* Change Password */}
                <div className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-slate-100 p-5 bg-slate-50/50">
                    <h3 className="font-extrabold text-[#3f4254] text-base">Change Password</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Update your password to keep your account secure.</p>
                  </div>
                  <form onSubmit={handlePasswordSubmit} className="p-5 space-y-4 text-xs font-bold text-slate-500">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block mb-1 text-slate-600">Current Password</label>
                        <input
                          type="password"
                          required
                          placeholder="Enter current password"
                          className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                          value={passwordForm.current}
                          onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-600">New Password</label>
                        <input
                          type="password"
                          required
                          placeholder="Enter new password"
                          className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                          value={passwordForm.newPass}
                          onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                        />
                        <div className="mt-2 space-y-1">
                          <div className="flex gap-1.5">
                            <div className="h-1 flex-grow rounded-full bg-rose-500"></div>
                            <div className="h-1 flex-grow rounded-full bg-rose-500"></div>
                            <div className="h-1 flex-grow rounded-full bg-amber-500"></div>
                            <div className="h-1 flex-grow rounded-full bg-slate-100"></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">Use 8+ chars with symbols & numbers</span>
                        </div>
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-600">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          placeholder="Confirm new password"
                          className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                          value={passwordForm.confirm}
                          onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="inline-flex h-9.5 items-center gap-1.5 rounded-lg bg-[#6658dd] px-4 text-xs font-extrabold text-white shadow-sm hover:bg-[#5848d8] transition"
                      >
                        <Lock className="h-4 w-4" />
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>

                {/* Two-Factor Authentication */}
                <div className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-slate-100 p-5 bg-slate-50/50">
                    <h3 className="font-extrabold text-[#3f4254] text-base">Two-Factor Authentication (2FA)</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Add an extra layer of security to your account.</p>
                  </div>
                  <div className="p-5 divide-y divide-slate-100 text-xs font-bold text-slate-500">
                    <div className="flex items-center justify-between pb-4">
                      <div>
                        <h6 className="mb-0.5 font-extrabold text-sm text-[#3f4254]">Enable 2FA via Authenticator App</h6>
                        <p className="text-xs font-semibold text-slate-400">Use Google Authenticator, Microsoft Authenticator, or Authy.</p>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="authApp" className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6658dd]"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 pb-1">
                      <div>
                        <h6 className="mb-0.5 font-extrabold text-sm text-[#3f4254]">Email OTP Verification</h6>
                        <p className="text-xs font-semibold text-slate-400">Receive a one-time password on your registered email.</p>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="emailOTP" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6658dd]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-slate-100 p-5 bg-slate-50/50">
                    <h3 className="font-extrabold text-[#3f4254] text-base">Active Sessions</h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Manage devices and sessions where you are logged in.</p>
                  </div>
                  <div className="p-5 space-y-3">
                    {sessions.map(s => (
                      <div key={s.id} className="rounded-lg p-3.5 bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs font-bold text-[#3f4254]">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-[#6658dd] shrink-0">
                            <s.icon className="h-5.5 w-5.5" />
                          </span>
                          <div>
                            <h6 className="font-extrabold text-sm text-[#3f4254]">{s.device}</h6>
                            <span className="text-slate-400 text-xs font-semibold">{s.location}</span>
                          </div>
                        </div>

                        {s.active ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700">Active</span>
                        ) : (
                          <button
                            onClick={() => handleSessionLogout(s.id)}
                            className="rounded border border-rose-200 bg-white px-2.5 py-1 text-[10px] font-black text-rose-600 hover:bg-rose-50 transition"
                          >
                            Logout
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setSessions(sessions.filter(s => s.active));
                          showNotification('All other sessions terminated.');
                        }}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-4 text-xs font-black text-rose-600 hover:bg-rose-50 transition"
                      >
                        Logout All Other Sessions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. NOTIFICATIONS PANEL */}
            {activeTab === 'notifications' && (
              <div className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-5 bg-slate-50/50">
                  <h3 className="font-extrabold text-[#3f4254] text-base">Notification Preferences</h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Configure which alerts and digests you want to receive.</p>
                </div>
                <div className="p-5 space-y-6 text-xs font-bold text-slate-500">
                  
                  {/* Email Digests */}
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-sm text-[#3f4254] border-b border-slate-100 pb-2">Email Notifications</h4>
                    
                    {[
                      { key: 'newApplications', title: 'New Job Applications', desc: 'Get notified immediately when a candidate applies to your job.' },
                      { key: 'interviewReminders', title: 'Interview Reminders', desc: 'Receive reminders before scheduled candidate interviews.' },
                      { key: 'candidateMessages', title: 'Messages from Candidates', desc: 'Get notified when a candidate sends you a chat message.' },
                      { key: 'pipelineProgress', title: 'Candidate Pipeline Updates', desc: 'Alerts when a candidate progresses (Shortlisted, Offered, etc.).' },
                      { key: 'billingUpdates', title: 'Subscription & Billing Updates', desc: 'Get receipts, renewals, and invoice updates.' },
                      { key: 'weeklyDigest', title: 'Weekly Recap Digest', desc: 'Receive a weekly digest summary of application rates and activities.' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-start justify-between">
                        <div>
                          <h6 className="font-extrabold text-[#3f4254] text-xs">{item.title}</h6>
                          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={notifications[item.key]}
                            onChange={e => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6658dd]"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* In-App Digests */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="font-extrabold text-sm text-[#3f4254] border-b border-slate-100 pb-2">In-App Alerts</h4>

                    {[
                      { key: 'appApplications', title: 'Application Badges', desc: 'Show notification badge counts inside the dashboard sidebar.' },
                      { key: 'appReminders', title: 'Desktop Interview Alarms', desc: 'Receive alarm alerts in the web browser before scheduled slots.' },
                      { key: 'appAnnouncements', title: 'System Updates & Bulletins', desc: 'Get news of maintenance schedules, feature updates, and policies.' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-start justify-between">
                        <div>
                          <h6 className="font-extrabold text-[#3f4254] text-xs">{item.title}</h6>
                          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={notifications[item.key]}
                            onChange={e => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6658dd]"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      onClick={handleSaveNotifications}
                      className="rounded-lg bg-[#6658dd] px-4.5 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-[#5848d8] transition flex items-center gap-1.5"
                    >
                      <Save className="h-4 w-4" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. PREFERENCES PANEL */}
            {activeTab === 'preferences' && (
              <div className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-5 bg-slate-50/50">
                  <h3 className="font-extrabold text-[#3f4254] text-base">Application Preferences</h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Customize your language, formatting, and regional parameters.</p>
                </div>
                <div className="p-5 space-y-4 text-xs font-bold text-slate-500">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-slate-600">Language</label>
                      <select
                        className="w-full rounded border border-slate-200 px-3 py-2.5 text-xs text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                        value={preferences.language}
                        onChange={e => setPreferences({ ...preferences, language: e.target.value })}
                      >
                        <option value="en">English (US)</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                        <option value="mr">मराठी (Marathi)</option>
                        <option value="ta">தமிழ் (Tamil)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-600">Timezone</label>
                      <select
                        className="w-full rounded border border-slate-200 px-3 py-2.5 text-xs text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                        value={preferences.timezone}
                        onChange={e => setPreferences({ ...preferences, timezone: e.target.value })}
                      >
                        <option value="IST">India Standard Time (IST) - UTC +5:30</option>
                        <option value="EST">Eastern Standard Time (EST) - UTC -5:00</option>
                        <option value="GMT">Greenwich Mean Time (GMT) - UTC +0:00</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-600">Date Format</label>
                      <select
                        className="w-full rounded border border-slate-200 px-3 py-2.5 text-xs text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                        value={preferences.dateFormat}
                        onChange={e => setPreferences({ ...preferences, dateFormat: e.target.value })}
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY (25/06/2026)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (06/25/2026)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (2026-06-25)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-600">Time Format</label>
                      <select
                        className="w-full rounded border border-slate-200 px-3 py-2.5 text-xs text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                        value={preferences.timeFormat}
                        onChange={e => setPreferences({ ...preferences, timeFormat: e.target.value })}
                      >
                        <option value="12hr">12-Hour format (04:30 PM)</option>
                        <option value="24hr">24-Hour format (16:30)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-600">Currency Settings</label>
                      <select
                        className="w-full rounded border border-slate-200 px-3 py-2.5 text-xs text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                        value={preferences.currency}
                        onChange={e => setPreferences({ ...preferences, currency: e.target.value })}
                      >
                        <option value="INR">INR (₹) - Indian Rupee</option>
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-600">Default Items per Page</label>
                      <select
                        className="w-full rounded border border-slate-200 px-3 py-2.5 text-xs text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                        value={preferences.itemsPerPage}
                        onChange={e => setPreferences({ ...preferences, itemsPerPage: e.target.value })}
                      >
                        <option value="10">10 Entries</option>
                        <option value="25">25 Entries</option>
                        <option value="50">50 Entries</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      onClick={handleSavePreferences}
                      className="rounded-lg bg-[#6658dd] px-4.5 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-[#5848d8] transition flex items-center gap-1.5"
                    >
                      <Save className="h-4 w-4" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. PRIVACY PANEL */}
            {activeTab === 'privacy' && (
              <div className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-5 bg-slate-50/50">
                  <h3 className="font-extrabold text-[#3f4254] text-base">Privacy Settings</h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Control your search visibility and contact settings.</p>
                </div>
                <div className="p-5 space-y-4 text-xs font-bold text-slate-500">
                  
                  {[
                    { key: 'showPublic', title: 'Show Company Profile in Directory', desc: 'Allow jobseekers and public visitors to search and view your company detail page.' },
                    { key: 'showPhone', title: 'Show Recruiter Phone Number', desc: 'Display recruiter contact phone numbers on active job postings.' },
                    { key: 'readReceipts', title: 'Enable Read Receipts in Messages', desc: 'Show candidates when you have read their chat messages.' },
                    { key: 'emailSearch', title: 'Allow Search by email', desc: 'Allow users to search your corporate profile using backup/alternate email fields.' }
                  ].map(item => (
                    <div key={item.key} className="flex items-start justify-between">
                      <div>
                        <h6 className="font-extrabold text-[#3f4254] text-xs">{item.title}</h6>
                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={privacy[item.key]}
                          onChange={e => setPrivacy({ ...privacy, [item.key]: e.target.checked })}
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6658dd]"></div>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      onClick={handleSavePrivacy}
                      className="rounded-lg bg-[#6658dd] px-4.5 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-[#5848d8] transition flex items-center gap-1.5"
                    >
                      <Save className="h-4 w-4" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. DELETE ACCOUNT PANEL */}
            {activeTab === 'delete' && (
              <div className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-5 bg-slate-50/50">
                  <h3 className="font-extrabold text-[#3f4254] text-base">Delete Account</h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">Permanently remove your recruiter account and active job postings.</p>
                </div>
                <div className="p-5 space-y-4 text-xs font-bold text-slate-500">
                  
                  {/* Warning Warning Box */}
                  <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-4 text-rose-700 flex items-start gap-3">
                    <AlertTriangle className="h-5.5 w-5.5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="font-black text-sm">Warning: This Action is Permanent</h5>
                      <p className="font-semibold text-xs leading-relaxed text-rose-600">
                        Deleting your account will delete all job openings, candidate matches, resume unlocks, and active subscriptions. This information cannot be retrieved.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-600">Please tell us why you are leaving (Optional)</label>
                    <textarea rows="3" placeholder="e.g. Completed hiring cycle, switching tools..." className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none" />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="confirmDelete" className="h-4 w-4 text-[#6658dd] border-slate-200 rounded focus:ring-[#6658dd]" />
                    <label htmlFor="confirmDelete" className="text-[11px] font-bold text-slate-500">I confirm that I want to delete my recruiter account and all associated records.</label>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleDeleteAccountSubmit}
                      className="rounded-lg bg-rose-600 px-4.5 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-rose-700 transition flex items-center gap-1.5"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Recruiter Account
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployerSettings;
