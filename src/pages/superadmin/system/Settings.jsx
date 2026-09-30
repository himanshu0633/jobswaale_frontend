import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Settings as SettingsIcon, 
  BellRing, 
  ShieldCheck, 
  Mail, 
  Globe, 
  Key, 
  Sliders, 
  Save, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  X,
  LayoutDashboard,
  BarChart3,
  Layers,
  Plus,
  Trash2,
  Building2,
  Users,
  Star,
  Upload,
  Crop,
  Camera,
  UserCheck
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import { clearPublicSettingsCache } from '../../../utils/publicSettings';
import PassportPhotoCropperModal from '../../../components/PassportPhotoCropperModal';

const defaultSettings = {
  // General
  siteName: 'JobsWaale',
  siteUrl: 'https://jobswaale.com',
  siteEmail: 'Jobswaale.india@gmail.com',
  sitePhone: '+91 99998 84424',
  siteAddress: 'Hamirpur, Himachal Pradesh, India',
  defaultLang: 'en',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  dateFormat: 'd-m-Y',
  maintenanceMode: false,
  userRegistration: true,
  jobApprovalRequired: true,

  // Notifications
  notifNewJob: true,
  notifNewApp: true,
  notifNewEmp: true,
  notifPayment: true,
  notifReport: false,

  // Security
  minPassLen: 8,
  passExpiry: 0,
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  twoFactor: true,
  captchaEnabled: true,
  sessionTimeout: true,

  // Email
  mailDriver: 'smtp',
  mailHost: 'smtp.gmail.com',
  mailPort: 587,
  mailEncryption: 'tls',
  mailUsername: 'noreply@jobswaale.com',
  mailPassword: '',
  mailFromName: 'JobsWaale',
  mailFromEmail: 'noreply@jobswaale.com',

  // Home Dashboard
  heroTitle: 'Find Your Dream Job & Build Your Future',
  heroSubtitle: 'Find the jobs faster and easier. We connect job seekers with nearby opportunities and help employers hire quickly.',
  showHeroSearch: true,
  showTrendingSearches: true,
  showAccountTypeCards: true,
  showStatsBar: true,
  showPopularCategories: true,
  showFeaturedJobs: true,
  showTopCompanies: true,
  showDoubleCTA: true,
  showMeetOurTeam: true,
  showHappyCustomers: true,
  statOpenJobs: '2,000+',
  statCompanies: '500+',
  statJobseekers: '15,000+',
  statCities: '50+',
  maxFeaturedJobs: 6,
  maxPopularCategories: 8,
  trustedCompanies: [
    { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
    { name: 'Airbnb', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg' },
    { name: 'Dropbox', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg' },
    { name: 'FedEx', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/FedEx_Express.svg' },
    { name: 'Walmart', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Walmart_logo_%282025%29.svg' },
    { name: 'HubSpot', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/HubSpot_Logo.svg' }
  ],
  teamMembers: [
    {
      name: 'Elon Musk',
      role: 'Marketing Crew',
      photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Bernard Arnault',
      role: 'Marketing Crew',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Jeff Bezos',
      role: 'Marketing Crew',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Bill Gates',
      role: 'Marketing Crew',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    }
  ],
  happyCustomers: [
    {
      name: 'Sarah Harding',
      role: 'Visual Designer',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      review: 'We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as'
    },
    {
      name: 'Sarah Harding',
      role: 'Visual Designer',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      review: 'We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as'
    },
    {
      name: 'Sarah Harding',
      role: 'Visual Designer',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      review: 'We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as'
    }
  ]
};

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState(defaultSettings);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [testingEmail, setTestingEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', logo: '' });
  const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '', photo: '' });
  const [newCustomer, setNewCustomer] = useState({ name: '', role: '', photo: '', rating: 5, review: '' });
  const [cropperModal, setCropperModal] = useState({
    isOpen: false,
    initialImage: null,
    targetType: null,
    targetIndex: null
  });

  const handleAddCompany = () => {
    if (!newCompany.name.trim()) {
      showMessage('error', 'Company name is required.');
      return;
    }
    const currentList = Array.isArray(form.trustedCompanies) ? form.trustedCompanies : (defaultSettings.trustedCompanies || []);
    const updated = [...currentList, { name: newCompany.name.trim(), logo: newCompany.logo.trim() }];
    setForm(prev => ({ ...prev, trustedCompanies: updated }));
    setNewCompany({ name: '', logo: '' });
    showMessage('success', 'Company added to list. Click "Save Home Dashboard Settings" to persist.');
  };

  const handleRemoveCompany = (index) => {
    const currentList = Array.isArray(form.trustedCompanies) ? form.trustedCompanies : (defaultSettings.trustedCompanies || []);
    const updated = currentList.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, trustedCompanies: updated }));
  };

  const handleCompanyChange = (index, field, value) => {
    const currentList = Array.isArray(form.trustedCompanies) ? [...form.trustedCompanies] : [...(defaultSettings.trustedCompanies || [])];
    currentList[index] = { ...currentList[index], [field]: value };
    setForm(prev => ({ ...prev, trustedCompanies: currentList }));
  };

  // Team Member handlers
  const handleAddTeamMember = () => {
    if (!newTeamMember.name.trim()) {
      showMessage('error', 'Team member name is required.');
      return;
    }
    const currentList = Array.isArray(form.teamMembers) ? form.teamMembers : (defaultSettings.teamMembers || []);
    const updated = [...currentList, { 
      name: newTeamMember.name.trim(), 
      role: newTeamMember.role.trim() || 'Marketing Crew', 
      photo: newTeamMember.photo.trim() 
    }];
    setForm(prev => ({ ...prev, teamMembers: updated }));
    setNewTeamMember({ name: '', role: '', photo: '' });
    showMessage('success', 'Team member added to list. Click "Save Home Dashboard Settings" to persist.');
  };

  const handleRemoveTeamMember = (index) => {
    const currentList = Array.isArray(form.teamMembers) ? form.teamMembers : (defaultSettings.teamMembers || []);
    const updated = currentList.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, teamMembers: updated }));
  };

  const handleTeamMemberChange = (index, field, value) => {
    const currentList = Array.isArray(form.teamMembers) ? [...form.teamMembers] : [...(defaultSettings.teamMembers || [])];
    currentList[index] = { ...currentList[index], [field]: value };
    setForm(prev => ({ ...prev, teamMembers: currentList }));
  };

  // Customer testimonial handlers
  const handleAddCustomer = () => {
    if (!newCustomer.name.trim()) {
      showMessage('error', 'Customer name is required.');
      return;
    }
    const currentList = Array.isArray(form.happyCustomers) ? form.happyCustomers : (defaultSettings.happyCustomers || []);
    const updated = [...currentList, { 
      name: newCustomer.name.trim(), 
      role: newCustomer.role.trim() || 'Visual Designer', 
      photo: newCustomer.photo.trim(),
      rating: Number(newCustomer.rating) || 5,
      review: newCustomer.review.trim() || 'We are on the hunt for a designer who is exceptional in both making incredible product interfaces as well as'
    }];
    setForm(prev => ({ ...prev, happyCustomers: updated }));
    setNewCustomer({ name: '', role: '', photo: '', rating: 5, review: '' });
    showMessage('success', 'Customer testimonial added to list. Click "Save Home Dashboard Settings" to persist.');
  };

  const handleRemoveCustomer = (index) => {
    const currentList = Array.isArray(form.happyCustomers) ? form.happyCustomers : (defaultSettings.happyCustomers || []);
    const updated = currentList.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, happyCustomers: updated }));
  };

  const handleCustomerChange = (index, field, value) => {
    const currentList = Array.isArray(form.happyCustomers) ? [...form.happyCustomers] : [...(defaultSettings.happyCustomers || [])];
    currentList[index] = { ...currentList[index], [field]: value };
    setForm(prev => ({ ...prev, happyCustomers: currentList }));
  };

  // Passport Cropper triggers
  const handleFileSelectForCrop = (e, targetType, targetIndex = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCropperModal({
        isOpen: true,
        initialImage: event.target.result,
        targetType,
        targetIndex
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = (finalImageUrl) => {
    const { targetType, targetIndex } = cropperModal;
    if (targetType === 'newTeamMember') {
      setNewTeamMember(prev => ({ ...prev, photo: finalImageUrl }));
    } else if (targetType === 'teamMember' && targetIndex !== null) {
      handleTeamMemberChange(targetIndex, 'photo', finalImageUrl);
    } else if (targetType === 'newCustomer') {
      setNewCustomer(prev => ({ ...prev, photo: finalImageUrl }));
    } else if (targetType === 'customer' && targetIndex !== null) {
      handleCustomerChange(targetIndex, 'photo', finalImageUrl);
    }
    setCropperModal({ isOpen: false, initialImage: null, targetType: null, targetIndex: null });
    showMessage('success', 'Photo cropped & updated. Click "Save Home Dashboard Settings" to persist.');
  };

  const getAdminHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_API_URL}/settings`, { headers: getAdminHeaders() });
        setForm({ ...defaultSettings, ...(response.data || {}) });
      } catch (err) {
        showMessage('error', err.response?.data?.message || 'Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleToggle = (key) => {
    setForm(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (tabName) => {
    setSaving(true);
    try {
      const response = await axios.put(`${BASE_API_URL}/settings`, form, { headers: getAdminHeaders() });
      setForm({ ...defaultSettings, ...(response.data.settings || {}) });
      clearPublicSettingsCache();
      showMessage('success', `${tabName.charAt(0).toUpperCase() + tabName.slice(1)} settings saved successfully.`);
    } catch (err) {
      console.error(err);
      showMessage('error', err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      const response = await axios.post(`${BASE_API_URL}/settings/test-email`, form, { headers: getAdminHeaders() });
      showMessage('success', response.data.message || 'Test email sent successfully.');
    } catch (err) {
      const rawMessage = err.response?.data?.message || 'Failed to send test email.';
      const friendlyMessage = rawMessage.includes('getaddrinfo EBUSY')
        ? 'SMTP DNS lookup is busy. Please try again in a few seconds.'
        : rawMessage;
      showMessage('error', friendlyMessage);
    } finally {
      setTestingEmail(false);
    }
  };

  const inputCls = "w-full px-3.5 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm disabled:bg-slate-50";
  const labelCls = "block text-sm font-medium text-slate-600 mb-1";
  
  const ToggleSwitch = ({ checked, onChange, label, subtext }) => (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="flex-grow pr-2 sm:pr-4">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        {subtext && <p className="text-xs text-slate-400 font-normal mt-0.5">{subtext}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          checked ? 'bg-indigo-600' : 'bg-slate-200'
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  const tabs = [
    { key: 'general', label: 'General', icon: <SettingsIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> },
    { key: 'notification', label: 'Notifications', icon: <BellRing className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> },
    { key: 'security', label: 'Security', icon: <ShieldCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> },
    { key: 'email', label: 'Email', icon: <Mail className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> },
    { key: 'homeDashboard', label: 'Home dashboard', icon: <LayoutDashboard className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> }
  ];

  return (
    <div className="space-y-4 px-3 sm:space-y-5 sm:px-0">
      {/* Breadcrumb Header */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <h4 className="text-lg font-bold text-slate-800 sm:text-xl">Settings</h4>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <span>JobsWaale</span>
          <span>&gt;</span>
          <span className="text-indigo-600">Settings</span>
        </div>
      </div>

      {/* Alert Banner */}
      {message.text && (
        <div className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium transition-all ${
          message.type === 'success'
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
            : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage({ type: '', text: '' })} className="ml-auto shrink-0 rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-4 py-4 border-b border-slate-100 sm:px-5">
          <h4 className="text-base font-bold text-slate-800">System Settings</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure global system settings, notifications, security preferences, email configuration, and home dashboard for the platform.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-3 overflow-x-auto sm:px-5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors sm:gap-2 sm:px-5 sm:py-3 sm:text-sm ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-5">
          {loading && (
            <div className="py-12 text-center text-sm font-semibold text-slate-500">Loading settings...</div>
          )}
          {/* Tab 1: General Settings */}
          {!loading && activeTab === 'general' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <Globe className="w-4 h-4 text-slate-500" />
                  Site Configuration
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Site Name <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={form.siteName}
                      onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                      className={inputCls} 
                      placeholder="JobsWaale"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Site URL <span className="text-rose-500">*</span></label>
                    <input 
                      type="url" 
                      value={form.siteUrl}
                      onChange={(e) => setForm({ ...form, siteUrl: e.target.value })}
                      className={inputCls} 
                      placeholder="https://jobswaale.com"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Support Email <span className="text-rose-500">*</span></label>
                    <input 
                      type="email" 
                      value={form.siteEmail}
                      onChange={(e) => setForm({ ...form, siteEmail: e.target.value })}
                      className={inputCls} 
                      placeholder="support@jobswaale.com"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Support Phone <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={form.sitePhone}
                      onChange={(e) => setForm({ ...form, sitePhone: e.target.value })}
                      className={inputCls} 
                      placeholder="+91 99998 84424"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Site Address / Office Location <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={form.siteAddress || ''}
                      onChange={(e) => setForm({ ...form, siteAddress: e.target.value })}
                      className={inputCls} 
                      placeholder="Hamirpur, Himachal Pradesh, India"
                    />
                    <small className="text-xs text-slate-400 mt-1 block">Displayed in the public footer Contact Us section.</small>
                  </div>
                  <div>
                    <label className={labelCls}>Default Language <span className="text-rose-500">*</span></label>
                    <select 
                      value={form.defaultLang}
                      onChange={(e) => setForm({ ...form, defaultLang: e.target.value })}
                      className={inputCls}
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="pa">Punjabi</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Timezone <span className="text-rose-500">*</span></label>
                    <select 
                      value={form.timezone}
                      onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                      className={inputCls}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (UTC +5:30)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York (UTC -5:00)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Default Currency <span className="text-rose-500">*</span></label>
                    <select 
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      className={inputCls}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Date Format <span className="text-rose-500">*</span></label>
                    <select 
                      value={form.dateFormat}
                      onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}
                      className={inputCls}
                    >
                      <option value="d-m-Y">DD-MM-YYYY</option>
                      <option value="m-d-Y">MM-DD-YYYY</option>
                      <option value="Y-m-d">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  System Status
                </h5>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <ToggleSwitch 
                    label="Maintenance Mode" 
                    subtext="When enabled, only administrators can access the site."
                    checked={form.maintenanceMode} 
                    onChange={() => handleToggle('maintenanceMode')} 
                  />
                  <ToggleSwitch 
                    label="User Registration" 
                    subtext="Allow new users to register on the platform."
                    checked={form.userRegistration} 
                    onChange={() => handleToggle('userRegistration')} 
                  />
                  <ToggleSwitch 
                    label="Require SuperAdmin Approval for Job Postings" 
                    subtext="When enabled (ON), employer job posts default to Inactive and require SuperAdmin approval. When disabled (OFF), job posts are published live as Active directly."
                    checked={form.jobApprovalRequired} 
                    onChange={() => handleToggle('jobApprovalRequired')} 
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSave('general')}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-60 sm:w-auto"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save General Settings'}
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Notification Settings */}
          {!loading && activeTab === 'notification' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <BellRing className="w-4 h-4 text-slate-500" />
                  Email Notifications
                </h5>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <ToggleSwitch 
                    label="New Job Posting" 
                    subtext="Send notification when a new job is posted."
                    checked={form.notifNewJob} 
                    onChange={() => handleToggle('notifNewJob')} 
                  />
                  <ToggleSwitch 
                    label="New Application" 
                    subtext="Send notification when a candidate applies for a job."
                    checked={form.notifNewApp} 
                    onChange={() => handleToggle('notifNewApp')} 
                  />
                  <ToggleSwitch 
                    label="New Employer Registration" 
                    subtext="Send notification when a new employer registers."
                    checked={form.notifNewEmp} 
                    onChange={() => handleToggle('notifNewEmp')} 
                  />
                  <ToggleSwitch 
                    label="Payment Received" 
                    subtext="Send notification when a payment is received."
                    checked={form.notifPayment} 
                    onChange={() => handleToggle('notifPayment')} 
                  />
                  <ToggleSwitch 
                    label="Weekly Report" 
                    subtext="Send weekly summary report to admin."
                    checked={form.notifReport} 
                    onChange={() => handleToggle('notifReport')} 
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSave('notification')}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-60 sm:w-auto"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Notification Settings'}
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Security Settings */}
          {!loading && activeTab === 'security' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <Key className="w-4 h-4 text-slate-500" />
                  Password Policy
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Minimum Password Length <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      min="6" 
                      max="20"
                      value={form.minPassLen}
                      onChange={(e) => setForm({ ...form, minPassLen: parseInt(e.target.value) || 8 })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Password Expiry (Days) <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      min="0" 
                      max="365"
                      value={form.passExpiry}
                      onChange={(e) => setForm({ ...form, passExpiry: parseInt(e.target.value) || 0 })}
                      className={inputCls}
                    />
                    <small className="text-xs text-slate-400 mt-1 block">Set 0 for never expire.</small>
                  </div>
                  <div>
                    <label className={labelCls}>Max Login Attempts <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10"
                      value={form.maxLoginAttempts}
                      onChange={(e) => setForm({ ...form, maxLoginAttempts: parseInt(e.target.value) || 5 })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Lockout Duration (Minutes) <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      min="1" 
                      max="1440"
                      value={form.lockoutDuration}
                      onChange={(e) => setForm({ ...form, lockoutDuration: parseInt(e.target.value) || 30 })}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  Security Options
                </h5>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <ToggleSwitch 
                    label="Two-Factor Authentication" 
                    subtext="Allow admins to enable two-factor authentication."
                    checked={form.twoFactor} 
                    onChange={() => handleToggle('twoFactor')} 
                  />
                  <ToggleSwitch 
                    label="reCAPTCHA on Login" 
                    subtext="Enable reCAPTCHA on login and registration forms."
                    checked={form.captchaEnabled} 
                    onChange={() => handleToggle('captchaEnabled')} 
                  />
                  <ToggleSwitch 
                    label="Session Timeout" 
                    subtext="Automatically log out inactive users after 60 minutes."
                    checked={form.sessionTimeout} 
                    onChange={() => handleToggle('sessionTimeout')} 
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSave('security')}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-60 sm:w-auto"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Security Settings'}
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Email Settings */}
          {!loading && activeTab === 'email' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <Mail className="w-4 h-4 text-slate-500" />
                  SMTP Configuration
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Mail Driver <span className="text-rose-500">*</span></label>
                    <select 
                      value={form.mailDriver}
                      onChange={(e) => setForm({ ...form, mailDriver: e.target.value })}
                      className={inputCls}
                    >
                      <option value="smtp">SMTP</option>
                      <option value="sendmail">Sendmail</option>
                      <option value="mailgun">Mailgun</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>SMTP Host <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={form.mailHost}
                      onChange={(e) => setForm({ ...form, mailHost: e.target.value })}
                      className={inputCls}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>SMTP Port <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      value={form.mailPort}
                      onChange={(e) => setForm({ ...form, mailPort: parseInt(e.target.value) || 587 })}
                      className={inputCls}
                      placeholder="587"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Encryption <span className="text-rose-500">*</span></label>
                    <select 
                      value={form.mailEncryption}
                      onChange={(e) => setForm({ ...form, mailEncryption: e.target.value })}
                      className={inputCls}
                    >
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>SMTP Username <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={form.mailUsername}
                      onChange={(e) => setForm({ ...form, mailUsername: e.target.value })}
                      className={inputCls}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>SMTP Password <span className="text-rose-500">*</span></label>
                    <input 
                      type="password" 
                      value={form.mailPassword}
                      onChange={(e) => setForm({ ...form, mailPassword: e.target.value })}
                      className={inputCls}
                      placeholder="Enter password"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>From Name <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={form.mailFromName}
                      onChange={(e) => setForm({ ...form, mailFromName: e.target.value })}
                      className={inputCls}
                      placeholder="JobsWaale"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>From Email <span className="text-rose-500">*</span></label>
                    <input 
                      type="email" 
                      value={form.mailFromEmail}
                      onChange={(e) => setForm({ ...form, mailFromEmail: e.target.value })}
                      className={inputCls}
                      placeholder="noreply@jobswaale.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                  className="inline-flex w-full items-center justify-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 sm:w-auto"
                >
                  <Send className="w-4 h-4" />
                  {testingEmail ? 'Sending...' : 'Send Test Email'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('email')}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-60 sm:w-auto"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Email Configuration'}
                </button>
              </div>
            </div>
          )}

          {/* Tab 5: Home Dashboard Settings */}
          {!loading && activeTab === 'homeDashboard' && (
            <div className="space-y-6">
              {/* Hero Banner Section */}
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <Globe className="w-4 h-4 text-slate-500" />
                  Hero Banner & Search Configuration
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Hero Headline Title</label>
                    <input 
                      type="text" 
                      value={form.heroTitle || ''}
                      onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                      className={inputCls} 
                      placeholder="Find Your Dream Job & Build Your Future"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Hero Subtitle / Description</label>
                    <textarea 
                      rows={2}
                      value={form.heroSubtitle || ''}
                      onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                      className={inputCls} 
                      placeholder="Connect with thousands of employers and find the right job for your career growth."
                    />
                  </div>
                </div>

                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 mt-3">
                  <ToggleSwitch 
                    label="Hero Search Bar" 
                    subtext="Display the interactive job & candidate search form on the homepage hero."
                    checked={form.showHeroSearch ?? true} 
                    onChange={() => handleToggle('showHeroSearch')} 
                  />
                  <ToggleSwitch 
                    label="Trending Searches" 
                    subtext="Display popular trending job categories below the search form."
                    checked={form.showTrendingSearches ?? true} 
                    onChange={() => handleToggle('showTrendingSearches')} 
                  />
                  <ToggleSwitch 
                    label="Account Type Selection Cards" 
                    subtext="Display Job Seeker and Employer choice cards on the homepage hero."
                    checked={form.showAccountTypeCards ?? true} 
                    onChange={() => handleToggle('showAccountTypeCards')} 
                  />
                </div>
              </div>

              {/* Homepage Sections Visibility */}
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <Layers className="w-4 h-4 text-slate-500" />
                  Homepage Sections Visibility
                </h5>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <ToggleSwitch 
                    label="Stats Overview Bar" 
                    subtext="Display the floating metrics banner (Jobs, Companies, Seekers, Cities) on the homepage."
                    checked={form.showStatsBar ?? true} 
                    onChange={() => handleToggle('showStatsBar')} 
                  />
                  <ToggleSwitch 
                    label="Popular Job Categories Section" 
                    subtext="Show top categories with job counts and direct navigation."
                    checked={form.showPopularCategories ?? true} 
                    onChange={() => handleToggle('showPopularCategories')} 
                  />
                  <ToggleSwitch 
                    label="Featured Jobs Section" 
                    subtext="Show verified and featured open job opportunities."
                    checked={form.showFeaturedJobs ?? true} 
                    onChange={() => handleToggle('showFeaturedJobs')} 
                  />
                  <ToggleSwitch 
                    label="Top Employers & Companies Section" 
                    subtext="Display prominent hiring companies and corporate logos."
                    checked={form.showTopCompanies ?? true} 
                    onChange={() => handleToggle('showTopCompanies')} 
                  />
                  <ToggleSwitch 
                    label="Dual Call-to-Action (CTA) Banner" 
                    subtext="Display the employer and candidate promotional banners with action buttons."
                    checked={form.showDoubleCTA ?? true} 
                    onChange={() => handleToggle('showDoubleCTA')} 
                  />
                  <ToggleSwitch 
                    label="Meet Our Team Section" 
                    subtext="Display the 'Meet our team' section with executive/team members on the About page."
                    checked={form.showMeetOurTeam ?? true} 
                    onChange={() => handleToggle('showMeetOurTeam')} 
                  />
                  <ToggleSwitch 
                    label="Our Happy Customer (Testimonials) Section" 
                    subtext="Display customer feedback, ratings, and reviews on the About page."
                    checked={form.showHappyCustomers ?? true} 
                    onChange={() => handleToggle('showHappyCustomers')} 
                  />
                </div>
              </div>

              {/* Homepage Statistics Counters */}
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  Stats Bar Counters
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className={labelCls}>Open Jobs Count</label>
                    <input 
                      type="text" 
                      value={form.statOpenJobs || ''}
                      onChange={(e) => setForm({ ...form, statOpenJobs: e.target.value })}
                      className={inputCls} 
                      placeholder="2,000+"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Top Companies Count</label>
                    <input 
                      type="text" 
                      value={form.statCompanies || ''}
                      onChange={(e) => setForm({ ...form, statCompanies: e.target.value })}
                      className={inputCls} 
                      placeholder="500+"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Job Seekers Count</label>
                    <input 
                      type="text" 
                      value={form.statJobseekers || ''}
                      onChange={(e) => setForm({ ...form, statJobseekers: e.target.value })}
                      className={inputCls} 
                      placeholder="15,000+"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Cities Covered Count</label>
                    <input 
                      type="text" 
                      value={form.statCities || ''}
                      onChange={(e) => setForm({ ...form, statCities: e.target.value })}
                      className={inputCls} 
                      placeholder="50+"
                    />
                  </div>
                </div>
              </div>

              {/* Display Limits */}
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  Section Display Limits
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Max Featured Jobs Displayed</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="24"
                      value={form.maxFeaturedJobs || 6}
                      onChange={(e) => setForm({ ...form, maxFeaturedJobs: parseInt(e.target.value) || 6 })}
                      className={inputCls} 
                    />
                    <small className="text-xs text-slate-400 mt-1 block">Number of job cards shown in the featured jobs grid.</small>
                  </div>
                  <div>
                    <label className={labelCls}>Max Popular Categories Displayed</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="24"
                      value={form.maxPopularCategories || 8}
                      onChange={(e) => setForm({ ...form, maxPopularCategories: parseInt(e.target.value) || 8 })}
                      className={inputCls} 
                    />
                    <small className="text-xs text-slate-400 mt-1 block">Number of category cards shown on the homepage.</small>
                  </div>
                </div>
              </div>

              {/* Trusted Leading Companies Configuration */}
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  Trusted Leading Companies (Homepage Carousel)
                </h5>
                <p className="text-xs text-slate-500">
                  Manage the companies and logos featured in the "Trusted by 500+ Leading Companies" section of the homepage.
                </p>

                {/* Company Items List */}
                <div className="space-y-3">
                  {(Array.isArray(form.trustedCompanies) ? form.trustedCompanies : defaultSettings.trustedCompanies).map((company, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50/70 border border-slate-200 rounded-xl">
                      {/* Logo Preview */}
                      <div className="w-16 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        {company.logo ? (
                          <img 
                            src={company.logo} 
                            alt={company.name} 
                            className="max-h-full max-w-full object-contain" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                        <input
                          type="text"
                          value={company.name}
                          onChange={(e) => handleCompanyChange(index, 'name', e.target.value)}
                          placeholder="Company Name"
                          className={inputCls}
                        />
                        <input
                          type="text"
                          value={company.logo}
                          onChange={(e) => handleCompanyChange(index, 'logo', e.target.value)}
                          placeholder="Logo URL (SVG/PNG)"
                          className={inputCls}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCompany(index)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                        title="Delete Company"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Company Row */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                  <h6 className="text-xs font-bold text-indigo-900 mb-2">Add New Company</h6>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                      placeholder="Company Name (e.g. Microsoft)"
                      className={inputCls}
                    />
                    <input
                      type="text"
                      value={newCompany.logo}
                      onChange={(e) => setNewCompany({ ...newCompany, logo: e.target.value })}
                      placeholder="Logo URL (e.g. https://.../logo.svg)"
                      className={inputCls}
                    />
                  </div>
                  <div className="mt-2.5 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddCompany}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Company
                    </button>
                  </div>
                </div>
              </div>

              {/* Meet Our Team Configuration */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                    <Users className="w-4 h-4 text-slate-500" />
                    Meet Our Team Configuration
                  </h5>
                  <span className="text-xs text-slate-400">Passport-size photo framing with interactive cropper</span>
                </div>
                <p className="text-xs text-slate-500">
                  Manage executive and leadership team members. Photos are framed in passport format so faces remain clearly centered and visible. You can upload large photos and crop them to passport size.
                </p>

                {/* Team Members List */}
                <div className="space-y-3">
                  {(Array.isArray(form.teamMembers) ? form.teamMembers : defaultSettings.teamMembers).map((member, index) => (
                    <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
                      {/* Passport Photo Preview + Quick Crop Overlay */}
                      <div className="relative group w-16 h-20 rounded-xl border border-slate-200 overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-sm">
                        {member.photo ? (
                          <img 
                            src={member.photo} 
                            alt={member.name} 
                            className="w-full h-full object-cover object-top" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                          />
                        ) : (
                          <Users className="w-7 h-7 text-slate-300" />
                        )}
                        <label 
                          title="Click to change & crop photo"
                          className="absolute inset-0 bg-slate-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-[10px] font-bold"
                        >
                          <Crop className="w-4 h-4 mb-0.5" />
                          <span>Crop</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileSelectForCrop(e, 'teamMember', index)} 
                          />
                        </label>
                      </div>

                      {/* Fields */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Member Name</label>
                          <input
                            type="text"
                            value={member.name || ''}
                            onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                            placeholder="e.g. Elon Musk"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Job Title / Role</label>
                          <input
                            type="text"
                            value={member.role || ''}
                            onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)}
                            placeholder="e.g. Marketing Crew"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Photo URL / Path</label>
                          <input
                            type="text"
                            value={member.photo || ''}
                            onChange={(e) => handleTeamMemberChange(index, 'photo', e.target.value)}
                            placeholder="https://... or uploaded path"
                            className={inputCls}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center mt-2 md:mt-0">
                        <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload & Crop</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileSelectForCrop(e, 'teamMember', index)} 
                          />
                        </label>
                        {member.photo && (
                          <button
                            type="button"
                            onClick={() => setCropperModal({ isOpen: true, initialImage: member.photo, targetType: 'teamMember', targetIndex: index })}
                            className="inline-flex items-center gap-1 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                            title="Adjust crop of current photo"
                          >
                            <Crop className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveTeamMember(index)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Team Member Card */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                  <h6 className="text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Add New Team Member
                  </h6>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="text-[11px] font-semibold text-indigo-950 block mb-1">Full Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={newTeamMember.name}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                        placeholder="e.g. Satya Nadella"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-indigo-950 block mb-1">Job Title / Role</label>
                      <input
                        type="text"
                        value={newTeamMember.role}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                        placeholder="e.g. Technical Director"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-indigo-950 block mb-1">Photo (Upload or URL)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTeamMember.photo}
                          onChange={(e) => setNewTeamMember({ ...newTeamMember, photo: e.target.value })}
                          placeholder="Photo URL"
                          className={inputCls}
                        />
                        <label className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition cursor-pointer shrink-0">
                          <Crop className="w-3.5 h-3.5" />
                          <span>Crop</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileSelectForCrop(e, 'newTeamMember')} 
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  {newTeamMember.photo && (
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="w-10 h-12 rounded-lg border border-indigo-200 overflow-hidden bg-white">
                        <img src={newTeamMember.photo} alt="Preview" className="w-full h-full object-cover object-top" />
                      </div>
                      <span className="text-xs text-indigo-700">Photo ready for addition</span>
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddTeamMember}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Team Member
                    </button>
                  </div>
                </div>
              </div>

              {/* Our Happy Customer Configuration */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h5 className="flex items-center gap-2 bg-slate-50 text-slate-700 text-sm font-semibold px-3 py-2 rounded-lg">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Our Happy Customer (Testimonials) Configuration
                  </h5>
                  <span className="text-xs text-slate-400">Customer feedback and star ratings</span>
                </div>
                <p className="text-xs text-slate-500">
                  Manage real customer reviews and testimonials shown on the About page. Supports uploading and cropping customer avatar photos, star ratings, and custom testimonials.
                </p>

                {/* Customers Testimonials List */}
                <div className="space-y-3">
                  {(Array.isArray(form.happyCustomers) ? form.happyCustomers : defaultSettings.happyCustomers).map((customer, index) => (
                    <div key={index} className="flex flex-col gap-3 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        {/* Customer Avatar Preview + Crop Overlay */}
                        <div className="relative group w-14 h-14 rounded-full border-2 border-slate-200 overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-sm">
                          {customer.photo ? (
                            <img 
                              src={customer.photo} 
                              alt={customer.name} 
                              className="w-full h-full object-cover object-top" 
                              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                            />
                          ) : (
                            <Users className="w-6 h-6 text-slate-300" />
                          )}
                          <label 
                            title="Click to change & crop photo"
                            className="absolute inset-0 bg-slate-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-[10px] font-bold"
                          >
                            <Crop className="w-3.5 h-3.5 mb-0.5" />
                            <span>Crop</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleFileSelectForCrop(e, 'customer', index)} 
                            />
                          </label>
                        </div>

                        {/* Top row fields: Name, Role, Rating, Photo URL */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Customer Name</label>
                            <input
                              type="text"
                              value={customer.name || ''}
                              onChange={(e) => handleCustomerChange(index, 'name', e.target.value)}
                              placeholder="e.g. Sarah Harding"
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Designation / Role</label>
                            <input
                              type="text"
                              value={customer.role || ''}
                              onChange={(e) => handleCustomerChange(index, 'role', e.target.value)}
                              placeholder="e.g. Visual Designer"
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Star Rating (1-5)</label>
                            <select
                              value={customer.rating || 5}
                              onChange={(e) => handleCustomerChange(index, 'rating', Number(e.target.value))}
                              className={inputCls}
                            >
                              <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                              <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                              <option value={3}>⭐⭐⭐ (3 Stars)</option>
                              <option value={2}>⭐⭐ (2 Stars)</option>
                              <option value={1}>⭐ (1 Star)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Photo URL</label>
                            <input
                              type="text"
                              value={customer.photo || ''}
                              onChange={(e) => handleCustomerChange(index, 'photo', e.target.value)}
                              placeholder="https://... or path"
                              className={inputCls}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload & Crop</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleFileSelectForCrop(e, 'customer', index)} 
                            />
                          </label>
                          {customer.photo && (
                            <button
                              type="button"
                              onClick={() => setCropperModal({ isOpen: true, initialImage: customer.photo, targetType: 'customer', targetIndex: index })}
                              className="inline-flex items-center gap-1 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                              title="Adjust crop of customer avatar"
                            >
                              <Crop className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomer(index)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Review Text */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Customer Review / Feedback</label>
                        <textarea
                          rows={2}
                          value={customer.review || ''}
                          onChange={(e) => handleCustomerChange(index, 'review', e.target.value)}
                          placeholder="Write customer feedback here..."
                          className={inputCls}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Customer Card */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                  <h6 className="text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Add New Customer Testimonial
                  </h6>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="text-[11px] font-semibold text-indigo-950 block mb-1">Customer Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        placeholder="e.g. Jessica Alba"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-indigo-950 block mb-1">Designation / Role</label>
                      <input
                        type="text"
                        value={newCustomer.role}
                        onChange={(e) => setNewCustomer({ ...newCustomer, role: e.target.value })}
                        placeholder="e.g. Product Lead"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-indigo-950 block mb-1">Rating</label>
                      <select
                        value={newCustomer.rating}
                        onChange={(e) => setNewCustomer({ ...newCustomer, rating: Number(e.target.value) })}
                        className={inputCls}
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                        <option value={3}>⭐⭐⭐ (3 Stars)</option>
                        <option value={2}>⭐⭐ (2 Stars)</option>
                        <option value={1}>⭐ (1 Star)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-indigo-950 block mb-1">Photo (Upload or URL)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCustomer.photo}
                          onChange={(e) => setNewCustomer({ ...newCustomer, photo: e.target.value })}
                          placeholder="Photo URL"
                          className={inputCls}
                        />
                        <label className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition cursor-pointer shrink-0">
                          <Crop className="w-3.5 h-3.5" />
                          <span>Crop</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileSelectForCrop(e, 'newCustomer')} 
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-[11px] font-semibold text-indigo-950 block mb-1">Customer Review / Feedback</label>
                    <textarea
                      rows={2}
                      value={newCustomer.review}
                      onChange={(e) => setNewCustomer({ ...newCustomer, review: e.target.value })}
                      placeholder="Write customer feedback here..."
                      className={inputCls}
                    />
                  </div>
                  {newCustomer.photo && (
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-indigo-200 overflow-hidden bg-white">
                        <img src={newCustomer.photo} alt="Preview" className="w-full h-full object-cover object-top" />
                      </div>
                      <span className="text-xs text-indigo-700">Avatar ready for addition</span>
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddCustomer}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Testimonial
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSave('home dashboard')}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-60 sm:w-auto"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Home Dashboard Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Passport Photo Cropper Modal */}
      <PassportPhotoCropperModal
        isOpen={cropperModal.isOpen}
        onClose={() => setCropperModal({ isOpen: false, initialImage: null, targetType: null, targetIndex: null })}
        imageSrc={cropperModal.initialImage}
        onCropComplete={handleCropComplete}
        title={cropperModal.targetType?.includes('Customer') ? 'Adjust & Crop Customer Photo' : 'Adjust & Crop Team Member Photo'}
        shape={cropperModal.targetType?.includes('Customer') ? 'circle' : 'square'}
      />
    </div>
  );
};

export default Settings;
