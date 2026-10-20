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
  Move,
  ArrowRight
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import { clearPublicSettingsCache } from '../../../utils/publicSettings';
import PromoCropperModal from '../../../components/PromoCropperModal';
import PromoPopupModal, { resolvePromoImageUrl } from '../../../components/PromoPopupModal';

const defaultSettings = {
  // Popup Banners List (Multi-banner with targetType and page targeting)
  popupBanners: [
    {
      id: 'banner_employer_plans',
      title: 'Employer Subscription Plans',
      enabled: true,
      targetType: 'employer',
      pages: ['/employer'],
      image: '/promo-banner.jpg',
      width: '850px',
      height: 'auto',
      buttonEnabled: true,
      buttonText: 'Upgrade Plan',
      buttonLink: '/employer/subscription'
    }
  ],

  // Promo / Announcement Popup Modal (Legacy fallback)
  showPromoPopup: true,
  promoPopupImage: '/promo-banner.jpg',
  promoPopupWidth: '850px',
  promoPopupHeight: 'auto',
  promoPopupButtonText: 'Upgrade Plan',
  promoPopupButtonLink: '/employer/subscription',
  promoPopupButtonEnabled: true,
  promoPopupTarget: 'employer',

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

const BANNER_TARGETS = {
  jobseeker: {
    key: 'jobseeker',
    label: 'Jobseeker (After Login)',
    badge: 'Jobseeker Pages',
    pages: [
      { path: '/jobseeker/dashboard', label: 'Jobseeker Dashboard' },
      { path: '/', label: 'Home' },
      { path: '/jobs', label: 'Jobs' },
      { path: '/employers', label: 'Employers' },
      { path: '/jobseeker-plan', label: 'Pricing / Plans' },
      { path: '/jobseeker/jobs-applied', label: 'Jobs Applied' },
      { path: '/jobseeker/saved-jobs', label: 'Saved Jobs' },
      { path: '/jobseeker/saved-employers', label: 'Saved Employers' },
      { path: '/jobseeker/messages', label: 'Messages' },
      { path: '/jobseeker/profile', label: 'My Profile' },
      { path: '/about', label: 'About Us' }
    ]
  },
  employer: {
    key: 'employer',
    label: 'Employer (After Login)',
    badge: 'Employer Pages',
    pages: [
      { path: '/employer', label: 'Employer Dashboard' },
      { path: '/', label: 'Home' },
      { path: '/employer/jobs/create', label: 'Post a Job' },
      { path: '/employer/jobs', label: 'Manage Jobs' },
      { path: '/employer/applications', label: 'Applications' },
      { path: '/employer/shortlisted', label: 'Shortlisted' },
      { path: '/employer/company', label: 'Company Profile' },
      { path: '/employer/subscription', label: 'Subscription / Plans' },
      { path: '/employer/reports', label: 'Reports' },
      { path: '/employer/messages', label: 'Messages' },
      { path: '/about', label: 'About Us' }
    ]
  },
  public: {
    key: 'public',
    label: 'Public / Visitor (Without Login)',
    badge: 'Public Pages',
    pages: [
      { path: '/', label: 'Home Page' },
      { path: '/jobs', label: 'Jobs' },
      { path: '/employers', label: 'Employers' },
      { path: '/pricing', label: 'Pricing' },
      { path: '/about', label: 'About Us' },
      { path: '/privacy-policy', label: 'Privacy Policy' },
      { path: '/terms-conditions', label: 'Terms & Conditions' }
    ]
  }
};

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState(defaultSettings);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [testingEmail, setTestingEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', logo: '' });
  const [cropperModal, setCropperModal] = useState({ isOpen: false, imageSrc: null, originalFile: null, bannerIndex: null });
  const [previewBannerItem, setPreviewBannerItem] = useState(null);
  const [uploadBannerIndex, setUploadBannerIndex] = useState(null);
  const bannerFileInputRef = useRef(null);

  const triggerBannerUpload = (index) => {
    setUploadBannerIndex(index);
    bannerFileInputRef.current?.click();
  };

  const handleBannerFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || uploadBannerIndex === null) return;
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropperModal({
        isOpen: true,
        imageSrc: reader.result,
        originalFile: file,
        bannerIndex: uploadBannerIndex
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBannerCropComplete = (uploadedUrl) => {
    if (cropperModal.bannerIndex === null || cropperModal.bannerIndex === undefined) return;
    const idx = cropperModal.bannerIndex;
    setForm(prev => {
      const banners = Array.isArray(prev.popupBanners) ? [...prev.popupBanners] : [];
      if (banners[idx]) {
        banners[idx] = { ...banners[idx], image: uploadedUrl };
      }
      return { ...prev, popupBanners: banners };
    });
    showMessage('success', 'Banner image uploaded successfully!');
  };

  const handleAdjustBannerCrop = (index) => {
    const banner = form.popupBanners?.[index];
    if (!banner?.image) return;
    setCropperModal({
      isOpen: true,
      imageSrc: banner.image,
      originalFile: null,
      bannerIndex: index
    });
  };

  const handleRemoveBannerImage = (index) => {
    handleUpdateBanner(index, 'image', '');
    showMessage('success', 'Banner image removed.');
  };

  const handleAddBanner = () => {
    const newBanner = {
      id: `banner_${Date.now()}`,
      title: `Banner ${(form.popupBanners?.length || 0) + 1}`,
      enabled: true,
      targetType: 'jobseeker',
      pages: ['/jobseeker/dashboard'],
      image: '',
      width: '850px',
      height: 'auto',
      buttonEnabled: true,
      buttonText: 'Upgrade Plan',
      buttonLink: '/jobseeker-plan'
    };
    setForm(prev => ({
      ...prev,
      popupBanners: [...(prev.popupBanners || []), newBanner]
    }));
    showMessage('success', 'New banner added.');
  };

  const handleTargetTypeChange = (index, targetType) => {
    const defaultPage = BANNER_TARGETS[targetType]?.pages[0]?.path || '/';
    setForm(prev => {
      const banners = [...(prev.popupBanners || [])];
      if (banners[index]) {
        banners[index] = {
          ...banners[index],
          targetType,
          pages: [defaultPage]
        };
      }
      return { ...prev, popupBanners: banners };
    });
  };

  const handleSelectAllPages = (index, targetType) => {
    const allPaths = BANNER_TARGETS[targetType]?.pages.map(p => p.path) || [];
    setForm(prev => {
      const banners = [...(prev.popupBanners || [])];
      const banner = banners[index];
      if (!banner) return prev;
      const currentPages = Array.isArray(banner.pages) ? banner.pages : [];
      const allSelected = allPaths.length > 0 && allPaths.every(p => currentPages.includes(p));
      banners[index] = {
        ...banner,
        pages: allSelected ? [] : allPaths
      };
      return { ...prev, popupBanners: banners };
    });
  };

  const handleRemoveBanner = (index) => {
    setForm(prev => {
      const banners = [...(prev.popupBanners || [])];
      banners.splice(index, 1);
      return { ...prev, popupBanners: banners };
    });
    showMessage('success', 'Banner removed.');
  };

  const handleUpdateBanner = (index, field, value) => {
    setForm(prev => {
      const banners = [...(prev.popupBanners || [])];
      if (banners[index]) {
        banners[index] = { ...banners[index], [field]: value };
      }
      return { ...prev, popupBanners: banners };
    });
  };

  const handleToggleBannerPage = (index, pageKey) => {
    setForm(prev => {
      const banners = [...(prev.popupBanners || [])];
      const banner = banners[index];
      if (!banner) return prev;
      const currentPages = Array.isArray(banner.pages) ? [...banner.pages] : [];
      const exists = currentPages.includes(pageKey);
      const updatedPages = exists
        ? currentPages.filter(p => p !== pageKey)
        : [...currentPages, pageKey];
      banners[index] = { ...banner, pages: updatedPages };
      return { ...prev, popupBanners: banners };
    });
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
        const loaded = response.data || {};
        let banners = Array.isArray(loaded.popupBanners) && loaded.popupBanners.length > 0
          ? loaded.popupBanners
          : (loaded.promoPopupImage ? [{
              id: 'banner_employer_plans',
              title: 'Employer Subscription Plans',
              enabled: loaded.showPromoPopup !== false,
              targetType: 'employer',
              pages: ['/employer'],
              image: loaded.promoPopupImage,
              width: loaded.promoPopupWidth || '850px',
              height: loaded.promoPopupHeight || 'auto',
              buttonEnabled: loaded.promoPopupButtonEnabled !== false,
              buttonText: loaded.promoPopupButtonText || 'Upgrade Plan',
              buttonLink: loaded.promoPopupButtonLink || '/employer/subscription'
            }] : defaultSettings.popupBanners);

        // Normalize targetType and pages
        banners = banners.map(b => {
          let targetType = b.targetType;
          let rawPages = Array.isArray(b.pages) ? b.pages : [];
          if (!targetType) {
            if (rawPages.includes('employer_login') || rawPages.some(p => String(p).startsWith('/employer'))) {
              targetType = 'employer';
            } else if (rawPages.includes('jobseeker_login') || rawPages.some(p => String(p).startsWith('/jobseeker'))) {
              targetType = 'jobseeker';
            } else {
              targetType = 'public';
            }
          }
          const mappedPages = rawPages.map(p => {
            if (p === 'employer_login') return '/employer';
            if (p === 'jobseeker_login') return '/jobseeker/dashboard';
            if (p === 'home') return '/';
            if (p === 'about_us') return '/about';
            return p;
          });
          return {
            ...b,
            targetType: targetType || 'employer',
            pages: mappedPages.length > 0 ? mappedPages : (targetType === 'employer' ? ['/employer'] : targetType === 'jobseeker' ? ['/jobseeker/dashboard'] : ['/'])
          };
        });

        setForm({
          ...defaultSettings,
          ...loaded,
          popupBanners: banners
        });
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
      const firstBanner = form.popupBanners?.[0];
      const payload = {
        ...form,
        showPromoPopup: firstBanner ? firstBanner.enabled !== false : false,
        promoPopupImage: firstBanner?.image || '',
        promoPopupWidth: firstBanner?.width || '850px',
        promoPopupHeight: firstBanner?.height || 'auto',
        promoPopupButtonText: firstBanner?.buttonText || 'Upgrade Plan',
        promoPopupButtonLink: firstBanner?.buttonLink || '/employer/subscription',
        promoPopupButtonEnabled: firstBanner ? firstBanner.buttonEnabled !== false : true,
      };

      const response = await axios.put(`${BASE_API_URL}/settings`, payload, { headers: getAdminHeaders() });
      const loaded = response.data.settings || {};
      let banners = Array.isArray(loaded.popupBanners) && loaded.popupBanners.length > 0
        ? loaded.popupBanners
        : (form.popupBanners || defaultSettings.popupBanners);

      setForm({
        ...defaultSettings,
        ...loaded,
        popupBanners: banners
      });
      clearPublicSettingsCache();
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    { key: 'homeDashboard', label: 'Home dashboard', icon: <LayoutDashboard className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> },
    { key: 'bannerUpdate', label: 'Banner Update', icon: <Megaphone className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> }
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

          {/* Tab 6: Banner Update */}
          {activeTab === 'bannerUpdate' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                <div>
                  <h5 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-indigo-600" />
                    Popup Banners
                  </h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure popup banners, customize modal dimensions, and target specific audience pages.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddBanner}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add More Banner
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave('banner settings')}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Banner Settings'}
                  </button>
                </div>
              </div>

              {/* Hidden Banner File Input */}
              <input
                type="file"
                ref={bannerFileInputRef}
                accept="image/*"
                onChange={handleBannerFileSelect}
                className="hidden"
              />

              {/* Banners List */}
              {(!form.popupBanners || form.popupBanners.length === 0) ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                  <Megaphone className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No Banners Added</p>
                  <p className="text-xs text-slate-400 mt-1">Click below to create your first popup banner.</p>
                  <button
                    type="button"
                    onClick={handleAddBanner}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Banner
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {form.popupBanners.map((banner, index) => {
                    const currentTargetType = banner.targetType || 'employer';
                    const targetConfig = BANNER_TARGETS[currentTargetType] || BANNER_TARGETS.employer;
                    const selectedPages = Array.isArray(banner.pages) ? banner.pages : [];
                    const allTargetPages = targetConfig.pages.map(p => p.path);
                    const isAllSelected = allTargetPages.length > 0 && allTargetPages.every(p => selectedPages.includes(p));

                    const rawWidth = String(banner.width || '850px').trim();
                    const rawHeight = String(banner.height || 'auto').trim();

                    return (
                      <div
                        key={banner.id || index}
                        className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4.5 shadow-xs space-y-4"
                      >
                        {/* Banner Top Bar */}
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700">
                              {index + 1}
                            </span>
                            <div>
                              <h6 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                                {banner.title || `Banner ${index + 1}`}
                              </h6>
                              <span className="text-[10px] font-semibold text-indigo-600 block leading-none mt-0.5">
                                {targetConfig.label}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            {/* Active Toggle */}
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                              <span className="text-[11px]">{banner.enabled !== false ? 'Active' : 'Inactive'}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateBanner(index, 'enabled', banner.enabled === false)}
                                className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                  banner.enabled !== false ? 'bg-indigo-600' : 'bg-slate-200'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    banner.enabled !== false ? 'translate-x-3.5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </label>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveBanner(index)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete banner"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Main 2-Column Grid: Left (Preview & Image Actions) + Right (Title, Audience & Pages) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                          {/* LEFT COLUMN: Live Popup Preview (Modal) & Image Controls */}
                          <div className="lg:col-span-5 flex flex-col space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 px-0.5">
                              <span className="flex items-center gap-1 text-indigo-600">
                                <Eye className="w-3.5 h-3.5" />
                                Live Popup Preview
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                Modal: {rawWidth} × {rawHeight}
                              </span>
                            </div>

                            {/* Modal Preview Card */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 sm:p-3 flex items-center justify-center">
                              <div className="relative bg-white rounded-xl shadow-md border border-slate-200/90 flex flex-col overflow-hidden w-full max-w-[340px]">
                                {/* Close Cut Button */}
                                <div className="absolute top-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/60 text-white shadow pointer-events-none backdrop-blur-xs">
                                  <X className="w-2.5 h-2.5 stroke-[2.5]" />
                                </div>

                                {/* Full Image Container - NO CROPPING OR CUTTING OFF */}
                                <div className="w-full bg-white flex items-center justify-center p-0.5">
                                  {banner.image ? (
                                    <img
                                      src={resolvePromoImageUrl(banner.image)}
                                      alt="Live Banner Preview"
                                      className="w-full h-auto object-contain block rounded-t-lg select-none"
                                    />
                                  ) : (
                                    <div 
                                      onClick={() => triggerBannerUpload(index)}
                                      className="p-6 w-full text-center text-slate-400 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50 transition"
                                    >
                                      <Upload className="w-5 h-5 text-indigo-500" />
                                      <span className="text-xs font-semibold text-slate-600">No image uploaded</span>
                                      <span className="text-[10px] text-indigo-600 font-bold underline">Click to upload</span>
                                    </div>
                                  )}
                                </div>

                                {/* Action Button Footer Preview */}
                                {banner.buttonEnabled !== false && (
                                  <div className="p-2 sm:p-2.5 bg-white border-t border-slate-100 flex items-center justify-end">
                                    <div className="inline-flex items-center justify-center gap-1 rounded-md bg-[#46c9f2] px-3 py-1 text-[11px] font-bold text-white shadow-xs pointer-events-none">
                                      <span>{banner.buttonText || 'Upgrade Plan'}</span>
                                      <ArrowRight className="w-3 h-3" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Image Upload / Replace / Adjust Crop / Remove buttons */}
                            {banner.image ? (
                              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => triggerBannerUpload(index)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-lg transition cursor-pointer shadow-2xs"
                                  >
                                    <Upload className="w-3 h-3 text-slate-500" />
                                    Replace
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustBannerCrop(index)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg transition cursor-pointer"
                                  >
                                    <Crop className="w-3 h-3 text-indigo-600" />
                                    Adjust Crop
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBannerImage(index)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] font-bold transition cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => triggerBannerUpload(index)}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg transition cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                Upload Banner Image
                              </button>
                            )}
                          </div>

                          {/* RIGHT COLUMN: Banner Title, 1. Target Audience, 2. Pages */}
                          <div className="lg:col-span-7 space-y-3">
                            {/* Banner Title */}
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                                Banner Title
                              </label>
                              <input
                                type="text"
                                value={banner.title || ''}
                                onChange={(e) => handleUpdateBanner(index, 'title', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white text-slate-900 font-medium"
                                placeholder="e.g. Employer Subscription Plans"
                              />
                            </div>

                            {/* 1. Target Audience Selector (Choose 1 Option) */}
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                                1. Select Target Audience (Choose 1 Option)
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {Object.values(BANNER_TARGETS).map((target) => {
                                  const isSelected = currentTargetType === target.key;
                                  return (
                                    <button
                                      key={target.key}
                                      type="button"
                                      onClick={() => handleTargetTypeChange(index, target.key)}
                                      className={`flex flex-col items-start p-2 rounded-lg border-2 text-left transition cursor-pointer ${
                                        isSelected
                                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-2xs'
                                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span className="text-[11px] font-bold leading-tight">{target.label}</span>
                                        <div className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0 ml-1 ${
                                          isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                                        }`}>
                                          {isSelected && <div className="h-1 w-1 rounded-full bg-white" />}
                                        </div>
                                      </div>
                                      <span className="text-[10px] text-slate-400 mt-0.5">
                                        {target.badge}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* 2. Display Pages Selection */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                  2. Select Pages to Display Banner ({targetConfig.label})
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleSelectAllPages(index, currentTargetType)}
                                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                                >
                                  {isAllSelected ? 'Deselect All' : 'Select All'}
                                </button>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[175px] overflow-y-auto pr-0.5">
                                {targetConfig.pages.map((p) => {
                                  const isChecked = selectedPages.includes(p.path);
                                  return (
                                    <label
                                      key={p.path}
                                      className={`flex items-center gap-1.5 p-1.5 px-2 rounded-lg border text-[11px] font-medium cursor-pointer transition select-none ${
                                        isChecked
                                          ? 'border-indigo-300 bg-indigo-50 text-indigo-950 font-bold shadow-2xs'
                                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleToggleBannerPage(index, p.path)}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                                      />
                                      <span className="truncate">{p.label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* BOTTOM ROW: Modal Dimensions & Action Button Controls */}
                        <div className="border-t border-slate-100 pt-3 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
                          {/* Modal Dimensions (md:col-span-5) */}
                          <div className="md:col-span-5 space-y-2">
                            <label className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                              Modal Dimensions
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Width</label>
                                <input
                                  type="text"
                                  value={banner.width || '850px'}
                                  onChange={(e) => handleUpdateBanner(index, 'width', e.target.value)}
                                  className="w-full px-2.5 py-1 text-xs rounded-md border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white font-medium"
                                  placeholder="850px"
                                />
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-[9px] text-slate-400">Presets:</span>
                                  {['550px', '650px', '850px'].map((w) => (
                                    <button
                                      key={w}
                                      type="button"
                                      onClick={() => handleUpdateBanner(index, 'width', w)}
                                      className="text-[9px] font-bold px-1 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                                    >
                                      {w}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Max Height</label>
                                <input
                                  type="text"
                                  value={banner.height || 'auto'}
                                  onChange={(e) => handleUpdateBanner(index, 'height', e.target.value)}
                                  className="w-full px-2.5 py-1 text-xs rounded-md border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white font-medium"
                                  placeholder="auto"
                                />
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-[9px] text-slate-400">Presets:</span>
                                  {['auto', '450px', '600px'].map((h) => (
                                    <button
                                      key={h}
                                      type="button"
                                      onClick={() => handleUpdateBanner(index, 'height', h)}
                                      className="text-[9px] font-bold px-1 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                                    >
                                      {h}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Button Settings (md:col-span-7) */}
                          <div className="md:col-span-7 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                Action Button (Bottom Right of Popup)
                              </label>
                              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                                <span className="text-[11px]">{banner.buttonEnabled !== false ? 'Enabled' : 'Disabled'}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateBanner(index, 'buttonEnabled', banner.buttonEnabled === false)}
                                  className={`relative inline-flex h-4 w-7.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                    banner.buttonEnabled !== false ? 'bg-indigo-600' : 'bg-slate-200'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      banner.buttonEnabled !== false ? 'translate-x-3.5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                              </label>
                            </div>

                            {banner.buttonEnabled !== false ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Button Text</label>
                                  <input
                                    type="text"
                                    value={banner.buttonText || ''}
                                    onChange={(e) => handleUpdateBanner(index, 'buttonText', e.target.value)}
                                    className="w-full px-2.5 py-1 text-xs rounded-md border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white font-medium"
                                    placeholder="Upgrade Plan"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Destination URL</label>
                                  <input
                                    type="text"
                                    value={banner.buttonLink || ''}
                                    onChange={(e) => handleUpdateBanner(index, 'buttonLink', e.target.value)}
                                    className="w-full px-2.5 py-1 text-xs rounded-md border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white font-medium"
                                    placeholder="/employer/subscription"
                                  />
                                </div>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">No action button will be displayed on this popup.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleAddBanner}
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add More Banner
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave('banner settings')}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-lg transition shadow-sm cursor-pointer disabled:opacity-60"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Banner Settings'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Promo Image Cropper Modal */}
      <PromoCropperModal
        isOpen={cropperModal.isOpen}
        onClose={() => setCropperModal({ isOpen: false, imageSrc: null, originalFile: null, bannerIndex: null })}
        imageSrc={cropperModal.imageSrc}
        originalFile={cropperModal.originalFile}
        onCropComplete={handleBannerCropComplete}
      />

      {/* Live Preview Modal for Admin */}
      {previewBannerItem && (
        <PromoPopupModal
          forcePreview={true}
          previewBanner={previewBannerItem}
          onClosePreview={() => setPreviewBannerItem(null)}
        />
      )}
    </div>
  );
};

export default Settings;
