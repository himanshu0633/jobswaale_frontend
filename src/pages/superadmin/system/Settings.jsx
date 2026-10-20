import React, { useEffect, useState, useRef } from 'react';
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
  Megaphone,
  Eye,
  Move
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import { clearPublicSettingsCache } from '../../../utils/publicSettings';
import PromoCropperModal from '../../../components/PromoCropperModal';
import PromoPopupModal, { resolvePromoImageUrl } from '../../../components/PromoPopupModal';

const defaultSettings = {
  // Promo / Announcement Popup Modal
  showPromoPopup: true,
  promoPopupImage: '/promo-banner.jpg',
  promoPopupWidth: '550px',
  promoPopupHeight: 'auto',
  promoPopupButtonText: 'Upgrade Plan',
  promoPopupButtonLink: '/employer/subscription',
  promoPopupButtonEnabled: true,
  promoPopupTarget: 'all',

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

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState(defaultSettings);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [testingEmail, setTestingEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', logo: '' });
  const [cropperModal, setCropperModal] = useState({ isOpen: false, imageSrc: null, originalFile: null });
  const [showLivePreview, setShowLivePreview] = useState(false);
  const promoFileInputRef = useRef(null);

  const handlePromoFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropperModal({
        isOpen: true,
        imageSrc: reader.result,
        originalFile: file
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePromoCropComplete = (uploadedUrl) => {
    setForm(prev => ({
      ...prev,
      promoPopupImage: uploadedUrl
    }));
    showMessage('success', 'Promo popup image uploaded successfully! Click "Save Home Dashboard Settings" to persist.');
  };

  const handleAdjustExistingCrop = () => {
    if (!form.promoPopupImage) return;
    setCropperModal({
      isOpen: true,
      imageSrc: form.promoPopupImage,
      originalFile: null
    });
  };

  const handleRemovePromoImage = () => {
    setForm(prev => ({
      ...prev,
      promoPopupImage: ''
    }));
    showMessage('success', 'Promo popup image removed.');
  };

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

              {/* Promo & Announcement Popup Modal Section (Above Stats Bar Counters) */}
              <div className="space-y-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/25 p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/70 pb-3">
                  <div>
                    <h5 className="flex items-center gap-2 text-indigo-950 text-sm font-bold">
                      <Megaphone className="w-4 h-4 text-indigo-600" />
                      Promo & Announcement Popup Modal
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Display an announcement or promo popup modal to users after login or register on their dashboard.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {form.promoPopupImage && (
                      <button
                        type="button"
                        onClick={() => setShowLivePreview(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold transition shadow-xs cursor-pointer"
                        title="Preview how the popup modal looks"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview Popup
                      </button>
                    )}
                  </div>
                </div>

                {/* On / Off Toggle Switch */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
                  <ToggleSwitch
                    label="Enable Promo Popup Modal"
                    subtext="When ON, eligible users will see this popup on the dashboard after login or registration with a cut (X) button."
                    checked={form.showPromoPopup ?? false}
                    onChange={() => handleToggle('showPromoPopup')}
                  />
                </div>

                {/* Image Upload & Adjustments */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      Banner Image & Cropper
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">
                      Supports full image & crop adjustments
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={promoFileInputRef}
                    accept="image/*"
                    onChange={handlePromoFileSelect}
                    className="hidden"
                  />

                  {form.promoPopupImage ? (
                    <div className="space-y-3">
                      {/* Image Preview Box */}
                      <div className="relative group rounded-xl border border-slate-200 bg-slate-900/5 p-2 flex items-center justify-center overflow-hidden min-h-[160px] max-h-[260px]">
                        <img
                          src={resolvePromoImageUrl(form.promoPopupImage)}
                          alt="Promo banner preview"
                          className="max-h-[240px] w-auto max-w-full rounded-lg object-contain shadow-sm"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => promoFileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-bold shadow hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Replace Image
                          </button>
                          <button
                            type="button"
                            onClick={handleAdjustExistingCrop}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow hover:bg-indigo-700 transition cursor-pointer"
                          >
                            <Crop className="w-3.5 h-3.5" />
                            Adjust Crop
                          </button>
                        </div>
                      </div>

                      {/* Image Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => promoFileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
                          >
                            <Upload className="w-3.5 h-3.5 text-slate-500" />
                            Replace Image
                          </button>
                          <button
                            type="button"
                            onClick={handleAdjustExistingCrop}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition cursor-pointer"
                          >
                            <Crop className="w-3.5 h-3.5 text-indigo-600" />
                            Adjust Crop
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePromoImage}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Empty State: Upload Prompt */
                    <div
                      onClick={() => promoFileInputRef.current?.click()}
                      className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Click to upload & crop promo image
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Upload high-resolution image banner. You can crop, zoom, and adjust, or keep full image.
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-white px-3 py-1 rounded-full border border-indigo-100 shadow-xs">
                        <Crop className="w-3 h-3" /> Select Image
                      </span>
                    </div>
                  )}

                  {/* Width & Height Dimensions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                    <div>
                      <label className={labelCls}>
                        Modal Width (e.g. 550px, 600px, 90%)
                      </label>
                      <input
                        type="text"
                        value={form.promoPopupWidth || '550px'}
                        onChange={(e) => setForm({ ...form, promoPopupWidth: e.target.value })}
                        className={inputCls}
                        placeholder="550px"
                      />
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-[10px] text-slate-400">Presets:</span>
                        {['460px', '550px', '650px'].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setForm({ ...form, promoPopupWidth: w })}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>
                        Modal Max Height (e.g. auto, 450px)
                      </label>
                      <input
                        type="text"
                        value={form.promoPopupHeight || 'auto'}
                        onChange={(e) => setForm({ ...form, promoPopupHeight: e.target.value })}
                        className={inputCls}
                        placeholder="auto"
                      />
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-[10px] text-slate-400">Presets:</span>
                        {['auto', '400px', '500px'].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setForm({ ...form, promoPopupHeight: h })}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button & Path Configuration */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <h6 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        Popup Action Button (Upgrade Plan / Custom Path)
                      </h6>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Configure the action button displayed below the image with custom name and destination path.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('promoPopupButtonEnabled')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        form.promoPopupButtonEnabled !== false ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          form.promoPopupButtonEnabled !== false ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {form.promoPopupButtonEnabled !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className={labelCls}>
                          Button Name / Text <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.promoPopupButtonText || ''}
                          onChange={(e) => setForm({ ...form, promoPopupButtonText: e.target.value })}
                          className={inputCls}
                          placeholder="Upgrade Plan"
                        />
                        <small className="text-[11px] text-slate-400 mt-1 block">
                          Example: "Upgrade Plan", "Claim Offer", "Explore Packages"
                        </small>
                      </div>

                      <div>
                        <label className={labelCls}>
                          Destination Path / URL <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.promoPopupButtonLink || ''}
                          onChange={(e) => setForm({ ...form, promoPopupButtonLink: e.target.value })}
                          className={inputCls}
                          placeholder="/employer/subscription"
                        />
                        <small className="text-[11px] text-slate-400 mt-1 block">
                          Example: "/employer/subscription", "/pricing", or external URL
                        </small>
                      </div>

                      <div className="sm:col-span-2">
                        <label className={labelCls}>
                          Target Audience
                        </label>
                        <select
                          value={form.promoPopupTarget || 'all'}
                          onChange={(e) => setForm({ ...form, promoPopupTarget: e.target.value })}
                          className={inputCls}
                        >
                          <option value="all">All Users (Employers & Jobseekers)</option>
                          <option value="employer">Employers Only</option>
                          <option value="jobseeker">Jobseekers Only</option>
                        </select>
                        <small className="text-[11px] text-slate-400 mt-1 block">
                          Choose which users will see this popup on their dashboard after logging in or registering.
                        </small>
                      </div>
                    </div>
                  )}
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

      {/* Promo Image Cropper Modal */}
      <PromoCropperModal
        isOpen={cropperModal.isOpen}
        onClose={() => setCropperModal({ isOpen: false, imageSrc: null, originalFile: null })}
        imageSrc={cropperModal.imageSrc}
        originalFile={cropperModal.originalFile}
        onCropComplete={handlePromoCropComplete}
      />

      {/* Live Preview Modal for Admin */}
      {showLivePreview && (
        <PromoPopupModal
          forcePreview={true}
          previewSettings={form}
          onClosePreview={() => setShowLivePreview(false)}
        />
      )}
    </div>
  );
};

export default Settings;
