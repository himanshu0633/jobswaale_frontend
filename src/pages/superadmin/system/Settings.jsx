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
  X 
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const defaultSettings = {
  // General
  siteName: 'JobsWaale',
  siteUrl: 'https://jobswaale.com',
  siteEmail: 'support@jobswaale.com',
  sitePhone: '+91 8628821441',
  defaultLang: 'en',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  dateFormat: 'd-m-Y',
  maintenanceMode: false,
  userRegistration: true,

  // Notifications
  notifNewJob: true,
  notifNewApp: true,
  notifNewEmp: true,
  notifPayment: true,
  notifReport: false,

  // Security
  minPassLen: 8,
  passExpiry: 90,
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
  mailFromEmail: 'noreply@jobswaale.com'
};

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState(defaultSettings);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [testingEmail, setTestingEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_API_URL}/settings`);
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
      const response = await axios.put(`${BASE_API_URL}/settings`, form);
      setForm({ ...defaultSettings, ...(response.data.settings || {}) });
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
      const response = await axios.post(`${BASE_API_URL}/settings/test-email`);
      showMessage('success', response.data.message || 'Test email sent successfully.');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to send test email.');
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
    { key: 'email', label: 'Email', icon: <Mail className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> }
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
            Configure global system settings, notifications, security preferences, and email configuration for the platform.
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
                      placeholder="+91 8628821441"
                    />
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
        </div>
      </div>
    </div>
  );
};

export default Settings;