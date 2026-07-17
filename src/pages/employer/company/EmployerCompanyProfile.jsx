/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Building2,
  Crown,
  Edit,
  Globe,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Briefcase,
  UserCheck,
  Eye,
  Star,
  Users,
  Save,
  X,
  Loader,
  BadgeAlert,
  Gem,
  CheckCircle2,
  Upload
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const Linkedin = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Twitter = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const Youtube = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </svg>
);

const Facebook = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatDate = (value, fallback = '-') => {
  if (!value) return fallback;
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
};

export const EmployerCompanyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'team'

  // Modals visibility
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // Editing form states
  const [editForm, setEditForm] = useState({});
  const [logoUploading, setLogoUploading] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', role: '', accessLevel: 'Member' });
  const [editingMemberIndex, setEditingMemberIndex] = useState(null);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${BASE_API_URL}/employer/profile`, { headers: getTokenHeaders() });
      setProfile(response.data);
      setEditForm(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Profile could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      await axios.put(`${BASE_API_URL}/employer/profile`, editForm, { headers: getTokenHeaders() });
      setSuccessMessage('Company profile updated successfully!');
      setShowEditModal(false);
      await loadProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
      setError('Only JPG, PNG, GIF, and WEBP logo images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Logo image cannot exceed 5 MB.');
      return;
    }

    setLogoUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('logo', file);
      const response = await axios.post(`${BASE_API_URL}/employer/profile/logo`, formData, {
        headers: getTokenHeaders()
      });
      setEditForm((current) => ({ ...current, logo: response.data?.logo || '' }));
      setProfile((current) => current ? { ...current, logo: response.data?.logo || '' } : current);
      setSuccessMessage('Logo uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Logo could not be uploaded.');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleAddOrEditMember = async (e) => {
    e.preventDefault();
    if (!memberForm.name.trim() || !memberForm.role.trim()) {
      alert('Please fill out name and role.');
      return;
    }

    const updatedMembers = [...(profile.teamMembers || [])];
    if (editingMemberIndex !== null) {
      updatedMembers[editingMemberIndex] = memberForm;
    } else {
      updatedMembers.push(memberForm);
    }

    setError('');
    setSuccessMessage('');
    try {
      await axios.put(
        `${BASE_API_URL}/employer/profile`,
        { ...profile, teamMembers: updatedMembers },
        { headers: getTokenHeaders() }
      );
      setSuccessMessage(editingMemberIndex !== null ? 'Team member updated!' : 'Team member added!');
      setShowMemberModal(false);
      await loadProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save team member.');
    }
  };

  const handleDeleteMember = async (index) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) return;
    const updatedMembers = profile.teamMembers.filter((_, idx) => idx !== index);

    setError('');
    setSuccessMessage('');
    try {
      await axios.put(
        `${BASE_API_URL}/employer/profile`,
        { ...profile, teamMembers: updatedMembers },
        { headers: getTokenHeaders() }
      );
      setSuccessMessage('Team member removed successfully.');
      await loadProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete team member.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <Loader className="h-9 w-9 animate-spin text-[#6658dd]" />
      </div>
    );
  }

  const stats = profile?.stats || { activeJobs: 0, hired: 0, profileViews: 5230, rating: 4.2 };
  const subscription = profile?.subscription || { planName: 'Free', status: 'Active', validUntil: null, jobsUsed: 0, jobLimit: 50, remainingCredits: 50, utilization: 0 };
  const valueTextClass = (value) => (
    value ? 'text-sm font-extrabold text-[#3f4254]' : 'text-sm font-semibold text-slate-400'
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3f4254]">Company Profile</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">View and update your company details, logo, address, and manage team members.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
          <span className="text-[#3f4254]">JobsWaale</span>
          <span className="text-slate-300">/</span>
          <span>Company</span>
          <span className="text-slate-300">/</span>
          <span className="text-[#6658dd]">Profile</span>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 flex items-center gap-2">
          <BadgeAlert className="h-5 w-5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SECTION 1: SUBSCRIPTION BANNER */}
      <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <Crown className="h-8 w-8" />
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h5 className="text-lg font-extrabold text-[#3f4254]">{subscription.planName}</h5>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                  {subscription.status}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400">
                Valid until: <span className="text-[#3f4254]">{formatDate(subscription.validUntil, 'Dec 31, 2026')}</span>
              </p>
              
              <div className="pt-2 flex items-center gap-4 flex-wrap text-sm">
                <div>
                  <span className="text-xs font-bold text-slate-400 block">Jobs Used</span>
                  <span className="font-extrabold text-[#3f4254]">{subscription.jobsUsed} <span className="font-medium text-slate-400">/ {subscription.jobLimit}</span></span>
                </div>
                <div className="h-8 w-px bg-slate-100"></div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block">Remaining Credits</span>
                  <span className="font-extrabold text-emerald-600">{subscription.remainingCredits}</span>
                </div>
                <div className="h-8 w-px bg-slate-100"></div>
                <div className="w-40">
                  <span className="text-xs font-bold text-slate-400 block mb-1">Utilization</span>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-[#6658dd]" style={{ width: `${subscription.utilization}%` }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block">{subscription.utilization}% utilized</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <a href="/employer/subscription" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6658dd] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#5848d8]">
              <Gem className="h-4 w-4" />
              Upgrade Plan
            </a>
          </div>
        </div>
      </div>

      {/* SECTION 2: HERO CARD */}
      <div className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-sm overflow-hidden border border-slate-100">
              {profile.logo ? (
                <img src={profile.logo} alt="Company Logo" className="h-full w-full object-contain" />
              ) : (
                <Building2 className="h-9 w-9 text-[#6658dd]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`text-xl font-extrabold ${profile.companyName ? 'text-[#3f4254]' : 'text-slate-400'}`}>{profile.companyName || 'Not Provided'}</h2>
                {profile.isVerified && (
                  <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-600">
                    Verified
                  </span>
                )}
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                  {subscription.planName}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-400 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-slate-400" />
                {profile.industryType?.industryType || 'Not Provided'}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-400 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-slate-400" />
                {profile.companySize || 'Not Provided'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:min-w-56">
            <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between text-xs font-black text-slate-500">
                <span>Profile score</span>
                <span className="text-[#6658dd]">{Number(profile.profileCompletionScore || 0)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-[#6658dd] transition-all"
                  style={{ width: `${Math.min(Math.max(Number(profile.profileCompletionScore || 0), 0), 100)}%` }}
                />
              </div>
          
            </div>
            <button
              onClick={() => {
                setEditForm({ ...profile });
                setShowEditModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: STATS GRID */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'bg-indigo-50 text-indigo-500' },
          { title: 'Hired Candidates', value: stats.hired, icon: UserCheck, color: 'bg-emerald-50 text-emerald-500' },
          { title: 'Profile Views', value: stats.profileViews, icon: Eye, color: 'bg-sky-50 text-sky-500' },
          { title: 'Rating', value: `${stats.rating} / 5`, icon: Star, color: 'bg-amber-50 text-amber-500' }
        ].map((item, index) => (
          <div key={index} className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-4">
            <span className={`flex h-12 w-12 items-center justify-center rounded-full ${item.color}`}>
              <item.icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-400">{item.title}</p>
              <p className="mt-1 text-xl font-black text-[#3f4254]">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 4: TABS PANEL */}
      <div className="rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* Navigation Headers */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-4 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all duration-150 ${
              activeTab === 'info'
                ? 'border-[#6658dd] text-[#6658dd] bg-white'
                : 'border-transparent text-slate-400 hover:text-[#3f4254]'
            }`}
          >
            <Building2 className="h-4.5 w-4.5" />
            Company Info
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-6 py-4 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all duration-150 ${
              activeTab === 'team'
                ? 'border-[#6658dd] text-[#6658dd] bg-white'
                : 'border-transparent text-slate-400 hover:text-[#3f4254]'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            Team Members
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'info' ? (
            <div className="grid gap-6 md:grid-cols-3">
              {/* Main Info */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-2">About Company</label>
                  <p className={`text-sm font-semibold leading-relaxed whitespace-pre-line ${profile.description ? 'text-slate-600' : 'text-slate-400'}`}>
                    {profile.description || 'Not Provided'}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Company Tagline</label>
                    <p className={`mt-1 ${valueTextClass(profile.tagline)}`}>{profile.tagline || 'Not Provided'}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Founded Year</label>
                    <p className={`mt-1 ${valueTextClass(profile.foundedYear)}`}>{profile.foundedYear || 'Not Provided'}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Industry</label>
                    <p className={`mt-1 ${valueTextClass(profile.industryType?.industryType)}`}>{profile.industryType?.industryType || 'Not Provided'}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Company Size</label>
                    <p className={`mt-1 ${valueTextClass(profile.companySize)}`}>{profile.companySize || 'Not Provided'}</p>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Address details */}
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-3">Address & Legal Info</label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block">Country</span>
                      <span className={valueTextClass(profile.country)}>{profile.country || 'Not Provided'}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block">State</span>
                      <span className={valueTextClass(profile.state)}>{profile.state || 'Not Provided'}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block">City</span>
                      <span className={valueTextClass(profile.city)}>{profile.city || 'Not Provided'}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block">Pincode</span>
                      <span className={valueTextClass(profile.pinCode)}>{profile.pinCode || 'Not Provided'}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-xs font-bold text-slate-400 block">Full Address</span>
                      <span className={valueTextClass(profile.address)}>{profile.address || 'Not Provided'}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block">GST / VAT Number</span>
                      <span className={valueTextClass(profile.gstNumber)}>{profile.gstNumber || 'Not Provided'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacts / Socials Sidebar */}
              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50/50 p-4 border border-slate-100 space-y-4">
                  <h4 className="font-extrabold text-[#3f4254] text-sm">Contact Information</h4>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-400 block">Website</span>
                        {profile.website ? (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="font-extrabold text-[#6658dd] hover:underline">
                            {profile.website}
                          </a>
                        ) : (
                          <span className="text-sm font-semibold text-slate-400">Not Provided</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-400 block">Email</span>
                        <span className={valueTextClass(profile.email)}>{profile.email || 'Not Provided'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-400 block">Phone</span>
                        <span className={valueTextClass(profile.phone)}>{profile.phone || 'Not Provided'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-400 block">Location</span>
                        <span className={valueTextClass(profile.city)}>{profile.city ? `${profile.city}, ${profile.state}` : 'Not Provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Links Card */}
                <div className="rounded-lg bg-slate-50/50 p-4 border border-slate-100 space-y-3">
                  <h4 className="font-extrabold text-[#3f4254] text-sm">Social Links</h4>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { key: 'linkedin', icon: Linkedin, color: 'text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100' },
                      { key: 'twitter', icon: Twitter, color: 'text-sky-500 bg-sky-50 border-sky-100 hover:bg-sky-100' },
                      { key: 'youtube', icon: Youtube, color: 'text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100' },
                      { key: 'facebook', icon: Facebook, color: 'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100' },
                      { key: 'instagram', icon: Instagram, color: 'text-pink-600 bg-pink-50 border-pink-100 hover:bg-pink-100' }
                    ].map((social) => {
                      const url = profile.socialLinks?.[social.key] || '#';
                      return (
                        <a
                          key={social.key}
                          href={url !== '#' ? url : undefined}
                          target={url !== '#' ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${social.color}`}
                        >
                          <social.icon className="h-4 w-4" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Team Members Tab content
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-extrabold text-[#3f4254]">Registered Team Members</h3>
                  <p className="text-xs font-bold text-slate-400">Manage individuals who have access to coordinate postings under this employer profile.</p>
                </div>
                <button
                  onClick={() => {
                    setMemberForm({ name: '', role: '', accessLevel: 'Member' });
                    setEditingMemberIndex(null);
                    setShowMemberModal(true);
                  }}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#6658dd] px-3.5 text-xs font-extrabold text-white transition hover:bg-[#5848d8]"
                >
                  <Plus className="h-4 w-4" />
                  Add Member
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-3">
                {(profile.teamMembers || []).map((member, index) => (
                  <div key={index} className="rounded-lg border border-slate-100 p-4 bg-white shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-100 flex items-center justify-center">
                        {member.image ? (
                          <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-black text-[#6658dd] uppercase">
                            {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="font-extrabold text-[#3f4254] text-sm">{member.name}</h5>
                        <p className="text-xs font-bold text-slate-400">{member.role}</p>
                        
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold mt-1.5 ${
                          member.accessLevel === 'Owner' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : member.accessLevel === 'Admin'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {member.accessLevel}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-dashed border-slate-100 flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setMemberForm({ ...member });
                          setEditingMemberIndex(index);
                          setShowMemberModal(true);
                        }}
                        className="p-1.5 rounded text-[#6658dd] hover:bg-slate-50 transition"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      {member.accessLevel !== 'Owner' && (
                        <button
                          onClick={() => handleDeleteMember(index)}
                          className="p-1.5 rounded text-rose-500 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EDIT COMPANY PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="font-black text-lg text-[#3f4254]">Edit Company Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditProfileSubmit} className="p-6 max-h-[70vh] overflow-y-auto space-y-4 text-xs font-bold text-slate-500">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                    value={editForm.companyName || ''}
                    onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">Company Tagline</label>
                  <input
                    type="text"
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                    value={editForm.tagline || ''}
                    onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">Industry Type</label>
                  <select
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                    value={editForm.industryType?._id || editForm.industryType || ''}
                    onChange={(e) => setEditForm({ ...editForm, industryType: e.target.value })}
                  >
                    <option value="">Select Industry</option>
                    {(profile.industries || []).map((ind) => (
                      <option key={ind._id} value={ind._id}>
                        {ind.industryType}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">Company Size</label>
                  <select
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                    value={editForm.companySize || ''}
                    onChange={(e) => setEditForm({ ...editForm, companySize: e.target.value })}
                  >
                    <option value="">Select Size</option>
                    <option>1-10 Employees</option>
                    <option>11-50 Employees</option>
                    <option>51-200 Employees</option>
                    <option>201-500 Employees</option>
                    <option>501-1000 Employees</option>
                    <option>1000+ Employees</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">Founded Year</label>
                  <input
                    type="number"
                    min="1900"
                    max="2026"
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                    value={editForm.foundedYear || ''}
                    onChange={(e) => setEditForm({ ...editForm, foundedYear: parseInt(e.target.value) || '' })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">Website URL</label>
                  <input
                    type="url"
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                    value={editForm.website || ''}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">Contact Email</label>
                  <input
                    type="email"
                    disabled
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-400 bg-slate-50 outline-none"
                    value={editForm.email || ''}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">GST / VAT Number</label>
                  <input
                    type="text"
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                    value={editForm.gstNumber || ''}
                    onChange={(e) => setEditForm({ ...editForm, gstNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">Company Logo</label>
                  <div className="flex items-center gap-3 rounded border border-slate-200 bg-white px-3 py-2">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-xs font-black text-slate-400">
                      {editForm.logo ? (
                        <img src={editForm.logo} alt="Company logo preview" className="h-full w-full object-contain" />
                      ) : (
                        'Logo'
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#f3f0ff] px-3 py-2 text-xs font-extrabold text-[#6658dd] transition hover:bg-[#ebe7ff]">
                        {logoUploading ? <Loader className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {logoUploading ? 'Uploading...' : 'Upload logo'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          disabled={logoUploading}
                          className="hidden"
                          onChange={(e) => {
                            handleLogoUpload(e.target.files?.[0]);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <p className="mt-1 truncate text-[0.68rem] font-semibold text-slate-400">
                        JPG, PNG, GIF, WEBP up to 5 MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-1">About Company</label>
                <textarea
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                  rows="4"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                ></textarea>
              </div>

              <hr className="border-slate-100" />
              <h4 className="font-extrabold text-[#3f4254] text-xs">Location Details</h4>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">Country</label>
                  <select
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                    value={editForm.country || ''}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  >
                    <option value="">Select Country</option>
                    {(profile.countries || []).map((c) => (
                      <option key={c._id} value={c.countryName || c.name || c.cid}>
                        {c.countryName || c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">State</label>
                  <select
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                    value={editForm.state || ''}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                  >
                    <option value="">Select State</option>
                    {(profile.states || []).map((s) => (
                      <option key={s._id} value={s.stateName || s.name || s.sid}>
                        {s.stateName || s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">District</label>
                  <select
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                    value={editForm.district || ''}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                  >
                    <option value="">Select District</option>
                    {(profile.districts || []).map((d) => (
                      <option key={d._id} value={d.districtName || d.name || d.did}>
                        {d.districtName || d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">City</label>
                  <select
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] bg-white focus:border-[#6658dd] outline-none"
                    value={editForm.city || ''}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  >
                    <option value="">Select City</option>
                    {(profile.cities || []).map((c) => (
                      <option key={c._id} value={c.cityName || c.name || c.ctid}>
                        {c.cityName || c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-500 mb-1">Full Address</label>
                  <input
                    type="text"
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                    value={editForm.address || ''}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1">Pincode</label>
                  <input
                    type="text"
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                    value={editForm.pinCode || ''}
                    onChange={(e) => setEditForm({ ...editForm, pinCode: e.target.value })}
                  />
                </div>
              </div>

              <hr className="border-slate-100" />
              <h4 className="font-extrabold text-[#3f4254] text-xs">Social Links</h4>

              <div className="grid gap-4 sm:grid-cols-2">
                {['linkedin', 'twitter', 'youtube', 'facebook', 'instagram'].map((platform) => (
                  <div key={platform}>
                    <label className="block text-xs font-black text-slate-500 mb-1 capitalize">{platform}</label>
                    <input
                      type="url"
                      placeholder={`https://www.${platform}.com/company`}
                      className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                      value={editForm.socialLinks?.[platform] || ''}
                      onChange={(e) => {
                        const links = { ...editForm.socialLinks, [platform]: e.target.value };
                        setEditForm({ ...editForm, socialLinks: links });
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#6658dd] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#5848d8] flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT TEAM MEMBER MODAL */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="font-black text-lg text-[#3f4254]">{editingMemberIndex !== null ? 'Edit Team Member' : 'Add Team Member'}</h3>
              <button onClick={() => setShowMemberModal(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddOrEditMember} className="p-6 space-y-4 text-xs font-bold text-slate-500">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-1">Member Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arjun Mehta"
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                  value={memberForm.name || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tech Lead"
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                  value={memberForm.role || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-1">Access Permission Level</label>
                <select
                  disabled={memberForm.accessLevel === 'Owner'}
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] bg-white focus:border-[#6658dd] outline-none disabled:bg-slate-50 disabled:text-slate-400"
                  value={memberForm.accessLevel || 'Member'}
                  onChange={(e) => setMemberForm({ ...memberForm, accessLevel: e.target.value })}
                >
                  <option value="Admin">Admin</option>
                  <option value="Member">Member</option>
                  {memberForm.accessLevel === 'Owner' && <option value="Owner">Owner</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-1">Avatar Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://example.com/photo.jpg"
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-[#3f4254] focus:border-[#6658dd] outline-none"
                  value={memberForm.image || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, image: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#6658dd] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#5848d8] flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerCompanyProfile;
