import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';
import {
  ABOUT_DEFAULT_IMAGES,
  DEFAULT_ABOUT_SECTIONS_DATA
} from '../../../utils/aboutPageDefaults';
import { resolveCmsImageUrl } from '../../../utils/cmsHelper';
import {
  Building,
  Save,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  Image as ImageIcon,
  Type,
  Palette,
  Sparkles,
  Layers,
  Users,
  MessageSquare,
  Compass,
  ArrowRight,
  Eye,
  Check,
  Plus,
  Crop,
  Star
} from 'lucide-react';
import PassportPhotoCropperModal from '../../../components/PassportPhotoCropperModal';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const AboutUsCMS = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState({});
  const [alert, setAlert] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'features' | 'find_jobs' | 'marketing_story' | 'team' | 'testimonials'

  // Cropper Modal State
  const [cropperModal, setCropperModal] = useState({
    isOpen: false,
    initialImage: null,
    targetSection: null, // 'team' or 'testimonials'
    targetIndex: null,   // number or 'new'
    shape: 'square'      // 'square' for passport 4:5, 'circle' for avatar 1:1
  });

  // New Item Draft States
  const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '', photo: '' });
  const [newTestimonial, setNewTestimonial] = useState({ name: '', role: '', photo: '', rating: 5, review: '' });

  // Sections State
  const [sections, setSections] = useState(() => {
    return JSON.parse(JSON.stringify(DEFAULT_ABOUT_SECTIONS_DATA));
  });

  // Track saved snapshot for each section to detect unsaved changes
  const [savedSectionsSnapshot, setSavedSectionsSnapshot] = useState({});
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingTargetTab, setPendingTargetTab] = useState(null);

  const alertTimerRef = useRef(null);
  const topRef = useRef(null);

  const showAlert = (type, text) => {
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setAlert({ type, text });
    alertTimerRef.current = setTimeout(() => {
      setAlert({ type: '', text: '' });
    }, 6000);
  };

  // Check if a specific section has unsaved edits
  const isSectionDirty = (sectionId) => {
    const sec = sections.find(s => s.id === sectionId);
    if (!sec || !savedSectionsSnapshot[sectionId]) return false;
    return JSON.stringify(sec) !== savedSectionsSnapshot[sectionId];
  };

  // Fetch from backend
  const fetchPage = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_API_URL}/cms/pages/by-slug/about`, {
        headers: getAuthHeaders()
      });

      if (res.data) {
        const pageSections = res.data.sections || res.data.projectData?.sections;
        let finalSections = DEFAULT_ABOUT_SECTIONS_DATA;

        if (Array.isArray(pageSections) && pageSections.length > 0) {
          finalSections = DEFAULT_ABOUT_SECTIONS_DATA.map(def => {
            const found = pageSections.find(s => s.id === def.id);
            if (!found) return def;
            return {
              ...def,
              ...found,
              cards: Array.isArray(found.cards) ? found.cards : def.cards,
              members: Array.isArray(found.members) ? found.members : (found.members || def.members),
              testimonials: Array.isArray(found.testimonials) ? found.testimonials : (found.testimonials || def.testimonials),
              primaryButton: { ...def.primaryButton, ...found.primaryButton },
              secondaryButton: { ...def.secondaryButton, ...found.secondaryButton },
              image: { ...def.image, ...found.image }
            };
          });
        }

        setSections(finalSections);
        const snapshot = {};
        finalSections.forEach(s => { snapshot[s.id] = JSON.stringify(s); });
        setSavedSectionsSnapshot(snapshot);
      }
    } catch (err) {
      // If 404 / not saved in DB, smoothly use the complete defaults
      const defaults = JSON.parse(JSON.stringify(DEFAULT_ABOUT_SECTIONS_DATA));
      setSections(defaults);
      const snapshot = {};
      defaults.forEach(s => { snapshot[s.id] = JSON.stringify(s); });
      setSavedSectionsSnapshot(snapshot);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, []);

  // Warn user on page refresh/close if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const anyDirty = sections.some(s => isSectionDirty(s.id));
      if (anyDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sections, savedSectionsSnapshot]);

  // Section level update
  const updateSectionField = (sectionId, field, value) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, [field]: value } : s));
  };

  const updateSectionNested = (sectionId, parentKey, field, value) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          [parentKey]: {
            ...s[parentKey],
            [field]: value
          }
        };
      }
      return s;
    }));
  };

  // Sub-items updates (Cards / Members / Testimonials)
  const updateArrayItem = (sectionId, arrayKey, itemIndex, field, value) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId && Array.isArray(s[arrayKey])) {
        const updatedArray = [...s[arrayKey]];
        updatedArray[itemIndex] = {
          ...updatedArray[itemIndex],
          [field]: value
        };
        return { ...s, [arrayKey]: updatedArray };
      }
      return s;
    }));
  };

  // Passport / Avatar Cropper file trigger
  const handleFileSelectForCrop = (e, targetSection, targetIndex = null, shape = 'square') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showAlert('error', 'Image size must be less than 10 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setCropperModal({
        isOpen: true,
        initialImage: event.target.result,
        targetSection,
        targetIndex,
        shape
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = (finalImageUrl) => {
    const { targetSection, targetIndex } = cropperModal;
    if (targetSection === 'team') {
      if (targetIndex === 'new') {
        setNewTeamMember(prev => ({ ...prev, photo: finalImageUrl }));
      } else if (typeof targetIndex === 'number') {
        updateArrayItem('team', 'members', targetIndex, 'photo', finalImageUrl);
      }
    } else if (targetSection === 'testimonials') {
      if (targetIndex === 'new') {
        setNewTestimonial(prev => ({ ...prev, photo: finalImageUrl }));
      } else if (typeof targetIndex === 'number') {
        updateArrayItem('testimonials', 'testimonials', targetIndex, 'photo', finalImageUrl);
      }
    }
    setCropperModal({ isOpen: false, initialImage: null, targetSection: null, targetIndex: null, shape: 'square' });
    showAlert('success', 'Photo cropped & updated! Click "Save & Publish" to update live.');
  };

  // Add & Delete Team Members
  const handleAddTeamMember = () => {
    if (!newTeamMember.name.trim()) {
      showAlert('error', 'Team member name is required.');
      return;
    }
    const teamSec = sections.find(s => s.id === 'team');
    const currentList = Array.isArray(teamSec?.members) ? teamSec.members : [];
    const updated = [...currentList, {
      id: 'm_' + Date.now(),
      name: newTeamMember.name.trim(),
      role: newTeamMember.role.trim() || 'Marketing Crew',
      photo: newTeamMember.photo.trim()
    }];
    updateSectionField('team', 'members', updated);
    setNewTeamMember({ name: '', role: '', photo: '' });
    showAlert('success', 'New team member added! Click "Save & Publish" to persist.');
  };

  const handleDeleteTeamMember = (index) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    const teamSec = sections.find(s => s.id === 'team');
    const currentList = Array.isArray(teamSec?.members) ? teamSec.members : [];
    const updated = currentList.filter((_, i) => i !== index);
    updateSectionField('team', 'members', updated);
    showAlert('success', 'Team member removed. Click "Save & Publish" to persist.');
  };

  // Add & Delete Testimonials
  const handleAddTestimonial = () => {
    if (!newTestimonial.name.trim()) {
      showAlert('error', 'Customer name is required.');
      return;
    }
    const testiSec = sections.find(s => s.id === 'testimonials');
    const currentList = Array.isArray(testiSec?.testimonials) ? testiSec.testimonials : [];
    const updated = [...currentList, {
      id: 't_' + Date.now(),
      name: newTestimonial.name.trim(),
      role: newTestimonial.role.trim() || 'Visual Designer',
      rating: Number(newTestimonial.rating) || 5,
      review: newTestimonial.review.trim() || 'Great experience working with JobsWaale!',
      photo: newTestimonial.photo.trim()
    }];
    updateSectionField('testimonials', 'testimonials', updated);
    setNewTestimonial({ name: '', role: '', photo: '', rating: 5, review: '' });
    showAlert('success', 'New customer testimonial added! Click "Save & Publish" to persist.');
  };

  const handleDeleteTestimonial = (index) => {
    if (!window.confirm('Are you sure you want to remove this customer testimonial?')) return;
    const testiSec = sections.find(s => s.id === 'testimonials');
    const currentList = Array.isArray(testiSec?.testimonials) ? testiSec.testimonials : [];
    const updated = currentList.filter((_, i) => i !== index);
    updateSectionField('testimonials', 'testimonials', updated);
    showAlert('success', 'Customer testimonial removed. Click "Save & Publish" to persist.');
  };

  // Image Upload Handler
  const handleUploadImage = async (file, onUploaded, uploadKey = 'main') => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert('error', 'Image size must be less than 5 MB.');
      return;
    }

    setUploadingImage(prev => ({ ...prev, [uploadKey]: true }));
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await axios.post(`${BASE_API_URL}/cms/upload-image`, formData, {
        headers: getAuthHeaders()
      });

      const url = res.data?.imageUrl || res.data?.url || res.data?.default;
      if (url) {
        onUploaded(url);
        showAlert('success', 'Image uploaded successfully!');
      } else {
        showAlert('error', 'Could not retrieve uploaded image URL.');
      }
    } catch (err) {
      console.error('Upload image error:', err);
      showAlert('error', err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (!window.confirm('Are you sure you want to reset all About Us sections to the original default layout, texts, and images?')) return;
    const defaults = JSON.parse(JSON.stringify(DEFAULT_ABOUT_SECTIONS_DATA));
    setSections(defaults);
    showAlert('success', 'Reset all sections to default template. Click "Save & Publish" to apply changes live.');
  };

  // Save to Backend
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setAlert({ type: '', text: '' });

    try {
      const payload = {
        title: 'About Us',
        slug: 'about',
        sections: sections,
        published: true,
        projectData: {
          editor: 'about-cms',
          sections: sections
        }
      };

      await axios.put(
        `${BASE_API_URL}/cms/pages/by-slug/about`,
        payload,
        { headers: getAuthHeaders() }
      );

      // Update snapshots on successful save
      const snapshot = {};
      sections.forEach(s => { snapshot[s.id] = JSON.stringify(s); });
      setSavedSectionsSnapshot(snapshot);

      showAlert('success', 'About Us page updated and published successfully! Changes are live on /about.');

      // Smooth scroll to top where the success toast/alert is displayed
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Save About Us error:', err);
      showAlert('error', err.response?.data?.message || 'Failed to save About Us page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Tab switching with unsaved changes verification
  const handleTabClick = (targetTabId) => {
    if (targetTabId === activeTab) return;

    if (isSectionDirty(activeTab)) {
      setPendingTargetTab(targetTabId);
      setShowUnsavedModal(true);
    } else {
      setActiveTab(targetTabId);
    }
  };

  // Modal Action 1: Save & Continue
  const handleModalSaveAndContinue = async () => {
    setSaving(true);
    try {
      const payload = {
        title: 'About Us',
        slug: 'about',
        sections: sections,
        published: true,
        projectData: {
          editor: 'about-cms',
          sections: sections
        }
      };

      await axios.put(
        `${BASE_API_URL}/cms/pages/by-slug/about`,
        payload,
        { headers: getAuthHeaders() }
      );

      const snapshot = {};
      sections.forEach(s => { snapshot[s.id] = JSON.stringify(s); });
      setSavedSectionsSnapshot(snapshot);

      showAlert('success', `Changes saved successfully!`);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (pendingTargetTab) {
        setActiveTab(pendingTargetTab);
        setPendingTargetTab(null);
      }
      setShowUnsavedModal(false);
    } catch (err) {
      console.error('Modal save error:', err);
      showAlert('error', err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // Modal Action 2: Discard & Continue
  const handleModalDiscardAndContinue = () => {
    if (savedSectionsSnapshot[activeTab]) {
      const originalSec = JSON.parse(savedSectionsSnapshot[activeTab]);
      setSections(prev => prev.map(s => s.id === activeTab ? originalSec : s));
    }
    showAlert('success', `Unsaved edits discarded.`);

    if (pendingTargetTab) {
      setActiveTab(pendingTargetTab);
      setPendingTargetTab(null);
    }
    setShowUnsavedModal(false);
  };

  // Modal Action 3: Cancel
  const handleModalCancel = () => {
    setPendingTargetTab(null);
    setShowUnsavedModal(false);
  };

  // Helper for current section
  const currentSection = sections.find(s => s.id === activeTab) || sections[0];
  const pendingSection = sections.find(s => s.id === pendingTargetTab);

  const sectionTabs = [
    { id: 'hero', label: '1. Hero Banner', icon: Sparkles },
    { id: 'features', label: '2. Core Features (4 Cards)', icon: Layers },
    { id: 'find_jobs', label: '3. Find Jobs CTA Banner', icon: Compass },
    { id: 'marketing_story', label: '4. Quality & Results Story', icon: Building },
    { id: 'team', label: '5. Meet Our Team (4 Members)', icon: Users },
    { id: 'testimonials', label: '6. Our Happy Customers', icon: MessageSquare }
  ];

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0047C7] mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading About Us Page Content...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Unsaved Changes
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Aapne <strong>{currentSection?.name}</strong> section me changes kiye hain jo abhi save nahi hue hain.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              {pendingSection ? (
                <><strong>{pendingSection.name}</strong> par switch karne se pehle kripya chunein:</>
              ) : (
                <>Dusre section par switch karne se pehle kripya chunein:</>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleModalCancel}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleModalDiscardAndContinue}
                className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Discard Changes
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleModalSaveAndContinue}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0047C7] hover:bg-[#003cb0] rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner Alert */}
      {alert.text && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border transition-all shadow-xs ${
            alert.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-sm font-medium">{alert.text}</span>
          </div>
          <button
            onClick={() => setAlert({ type: '', text: '' })}
            className="text-xs font-semibold px-2 py-1 rounded hover:bg-black/5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0047C7] flex items-center justify-center shrink-0 border border-blue-100">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                About Us Page Editor
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-[#0047C7] border border-blue-200">
                Live Section-by-Section Editor
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Replace text, adjust font sizes, change font &amp; background colors, and customize or restore default images.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            View Live /about
          </a>

          <button
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition shadow-xs"
            title="Reset all sections to default template"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            Reset All
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0047C7] rounded-xl hover:bg-[#003cb0] disabled:opacity-60 transition shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Publishing...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80">
        {sectionTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDirty = isSectionDirty(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all relative ${
                isActive
                  ? 'bg-white text-[#0047C7] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#0047C7]' : 'text-slate-400'}`} />
              {tab.label}
              {isDirty && (
                <span
                  title="Unsaved changes in this section"
                  className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-0.5"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Section Form Card */}
      {currentSection && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          {/* Section Top Controls: Visibility & Section Background Color */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#0047C7]" />
                {currentSection.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure background color, text size, font color, and media for this section.
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Background Color Picker */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-600">Section BG:</span>
                <input
                  type="color"
                  value={currentSection.bgColor || '#ffffff'}
                  onChange={(e) => updateSectionField(currentSection.id, 'bgColor', e.target.value)}
                  className="w-7 h-7 rounded border border-slate-300 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={currentSection.bgColor || '#ffffff'}
                  onChange={(e) => updateSectionField(currentSection.id, 'bgColor', e.target.value)}
                  className="w-20 px-2 py-1 text-xs font-mono font-bold uppercase border border-slate-300 rounded-lg outline-none"
                />
              </div>

              {/* Active Toggle */}
              <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={currentSection.active !== false}
                  onChange={(e) => updateSectionField(currentSection.id, 'active', e.target.checked)}
                  className="w-4 h-4 text-[#0047C7] rounded border-slate-300 focus:ring-[#0047C7]"
                />
                <span className="text-xs font-bold text-slate-700">
                  {currentSection.active !== false ? 'Visible on Website' : 'Hidden'}
                </span>
              </label>
            </div>
          </div>

          {/* 1. HERO BANNER SECTION FIELDS */}
          {currentSection.id === 'hero' && (
            <div className="space-y-6">
              {/* Heading */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Main Heading / Title
                  </label>
                  <input
                    type="text"
                    value={currentSection.title || ''}
                    onChange={(e) => updateSectionField('hero', 'title', e.target.value)}
                    placeholder="e.g. The #1 Job Board for Graphic Design Jobs"
                    className="w-full px-4 py-2.5 text-sm font-semibold border border-slate-300 rounded-xl focus:border-[#0047C7] outline-none"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Title Font Size (px)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="24"
                      max="72"
                      value={currentSection.titleFontSize || 52}
                      onChange={(e) => updateSectionField('hero', 'titleFontSize', Number(e.target.value) || 52)}
                      className="w-24 px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl outline-none"
                    />
                    <span className="text-xs text-slate-500">px (Default 52px)</span>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Font Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSection.titleColor || '#1f2938'}
                      onChange={(e) => updateSectionField('hero', 'titleColor', e.target.value)}
                      className="w-9 h-9 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentSection.titleColor || '#1f2938'}
                      onChange={(e) => updateSectionField('hero', 'titleColor', e.target.value)}
                      className="w-20 px-2 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Subtitle / Description */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subtitle / Description Text
                  </label>
                  <textarea
                    rows={3}
                    value={currentSection.subtitle || ''}
                    onChange={(e) => updateSectionField('hero', 'subtitle', e.target.value)}
                    placeholder="Search and connect with the right candidates faster..."
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:border-[#0047C7] outline-none resize-y"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subtitle Font Size (px)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="12"
                      max="32"
                      value={currentSection.subtitleFontSize || 18}
                      onChange={(e) => updateSectionField('hero', 'subtitleFontSize', Number(e.target.value) || 18)}
                      className="w-24 px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl outline-none"
                    />
                    <span className="text-xs text-slate-500">px (Default 18px)</span>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSection.subtitleColor || '#475569'}
                      onChange={(e) => updateSectionField('hero', 'subtitleColor', e.target.value)}
                      className="w-9 h-9 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentSection.subtitleColor || '#475569'}
                      onChange={(e) => updateSectionField('hero', 'subtitleColor', e.target.value)}
                      className="w-20 px-2 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                {/* Primary Button */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase">Primary Button</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={currentSection.primaryButton?.text || ''}
                      onChange={(e) => updateSectionNested('hero', 'primaryButton', 'text', e.target.value)}
                      placeholder="Button Text (e.g. Contact us)"
                      className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none"
                    />
                    <input
                      type="text"
                      value={currentSection.primaryButton?.url || ''}
                      onChange={(e) => updateSectionNested('hero', 'primaryButton', 'url', e.target.value)}
                      placeholder="Link (e.g. /contact)"
                      className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>

                {/* Secondary Button */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase">Secondary Button</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={currentSection.secondaryButton?.text || ''}
                      onChange={(e) => updateSectionNested('hero', 'secondaryButton', 'text', e.target.value)}
                      placeholder="Button Text (e.g. Support center)"
                      className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none"
                    />
                    <input
                      type="text"
                      value={currentSection.secondaryButton?.url || ''}
                      onChange={(e) => updateSectionNested('hero', 'secondaryButton', 'url', e.target.value)}
                      placeholder="Link (e.g. /support)"
                      className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Image Management */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#0047C7]" />
                      Hero Collage Image
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Default image is the original floating team collage. You can upload a custom image or restore the default anytime.
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                    currentSection.image?.url
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {currentSection.image?.url ? 'Custom Image Active' : 'Default Collage Active'}
                  </span>
                </div>

                <div className="flex items-center gap-5">
                  <div className="w-36 h-28 bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center p-2 shadow-xs shrink-0">
                    <img
                      src={currentSection.image?.url ? resolveCmsImageUrl(currentSection.image.url) : ABOUT_DEFAULT_IMAGES.hero}
                      alt="Hero Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0047C7] hover:bg-[#003cb0] rounded-lg cursor-pointer transition shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        {uploadingImage['hero'] ? 'Uploading...' : 'Upload New Image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingImage['hero']}
                          onChange={(e) => handleUploadImage(e.target.files?.[0], (url) => updateSectionNested('hero', 'image', 'url', url), 'hero')}
                        />
                      </label>

                      {currentSection.image?.url && (
                        <button
                          type="button"
                          onClick={() => updateSectionNested('hero', 'image', 'url', '')}
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition"
                          title="Restore default collage image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove &amp; Restore Default
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Recommended: Transparent PNG or high-res JPG (Max 5 MB).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. CORE FEATURES (4 CARDS) */}
          {currentSection.id === 'features' && (
            <div className="space-y-6">
              {/* Section Header Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Section Heading / Title
                  </label>
                  <input
                    type="text"
                    value={currentSection.title || ''}
                    onChange={(e) => updateSectionField('features', 'title', e.target.value)}
                    placeholder="e.g. Core Features"
                    className="w-full px-4 py-2.5 text-sm font-semibold border border-slate-300 rounded-xl focus:border-[#0047C7] outline-none"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Title Font Size (px)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="60"
                    value={currentSection.titleFontSize || 36}
                    onChange={(e) => updateSectionField('features', 'titleFontSize', Number(e.target.value) || 36)}
                    className="w-24 px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Title Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSection.titleColor || '#1f2938'}
                      onChange={(e) => updateSectionField('features', 'titleColor', e.target.value)}
                      className="w-9 h-9 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentSection.titleColor || '#1f2938'}
                      onChange={(e) => updateSectionField('features', 'titleColor', e.target.value)}
                      className="w-20 px-2 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Subtitle */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Section Subtitle / Description
                  </label>
                  <input
                    type="text"
                    value={currentSection.subtitle || ''}
                    onChange={(e) => updateSectionField('features', 'subtitle', e.target.value)}
                    placeholder="Explore the key capabilities..."
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:border-[#0047C7] outline-none"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subtitle Font Size (px)
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="28"
                    value={currentSection.subtitleFontSize || 16}
                    onChange={(e) => updateSectionField('features', 'subtitleFontSize', Number(e.target.value) || 16)}
                    className="w-24 px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subtitle Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSection.subtitleColor || '#88929b'}
                      onChange={(e) => updateSectionField('features', 'subtitleColor', e.target.value)}
                      className="w-9 h-9 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentSection.subtitleColor || '#88929b'}
                      onChange={(e) => updateSectionField('features', 'subtitleColor', e.target.value)}
                      className="w-20 px-2 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Card Box Format / Orientation (Landscape vs Portrait) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Card Box Format &amp; Image Orientation
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose whether card images display in Landscape (Horizontal / Width) or Portrait (Vertical / Height).
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0047C7] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
                    {(currentSection.imageOrientation || 'landscape') === 'portrait' ? 'Height Focused (3:4)' : 'Width Focused (16:10)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Landscape Option */}
                  <button
                    type="button"
                    onClick={() => updateSectionField('features', 'imageOrientation', 'landscape')}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      (currentSection.imageOrientation || 'landscape') === 'landscape'
                        ? 'border-[#0047C7] bg-white ring-2 ring-[#0047C7]/20 shadow-sm'
                        : 'border-slate-200 bg-white/70 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      (currentSection.imageOrientation || 'landscape') === 'landscape'
                        ? 'bg-[#0047C7] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      <svg className="w-5 h-4" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1.5" y="1.5" width="17" height="11" rx="2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Landscape (Horizontal)</span>
                        {(currentSection.imageOrientation || 'landscape') === 'landscape' && (
                          <span className="text-[10px] font-bold text-[#0047C7] bg-blue-50 px-1.5 py-0.5 rounded">Active</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Wide card layout (Width focus)</p>
                      <div className="mt-2 text-[10px] font-semibold text-[#0047C7] bg-blue-50/80 px-2 py-0.5 rounded inline-block border border-blue-100">
                        Recommended: 600 × 380 px (16:10)
                      </div>
                    </div>
                  </button>

                  {/* Portrait Option */}
                  <button
                    type="button"
                    onClick={() => updateSectionField('features', 'imageOrientation', 'portrait')}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      (currentSection.imageOrientation || 'landscape') === 'portrait'
                        ? 'border-[#0047C7] bg-white ring-2 ring-[#0047C7]/20 shadow-sm'
                        : 'border-slate-200 bg-white/70 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      (currentSection.imageOrientation || 'landscape') === 'portrait'
                        ? 'bg-[#0047C7] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      <svg className="w-4 h-5" viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1.5" y="1.5" width="11" height="17" rx="2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Portrait (Vertical)</span>
                        {(currentSection.imageOrientation || 'landscape') === 'portrait' && (
                          <span className="text-[10px] font-bold text-[#0047C7] bg-blue-50 px-1.5 py-0.5 rounded">Active</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Tall card layout (Height focus)</p>
                      <div className="mt-2 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded inline-block border border-indigo-100">
                        Recommended: 450 × 600 px (3:4)
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 4 Feature Cards (Image Upload + Read More Only) */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    4 Feature Cards — Image Upload &amp; Read More
                  </h3>
                  <div className="text-xs text-slate-500">
                    Format: <strong className="text-slate-700">{(currentSection.imageOrientation || 'landscape') === 'portrait' ? 'Portrait (Vertical / 450×600 px)' : 'Landscape (Horizontal / 600×380 px)'}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(currentSection.cards || []).map((card, cardIdx) => {
                    const defaultIcon = ABOUT_DEFAULT_IMAGES.features[cardIdx];
                    const activeIcon = card.image ? resolveCmsImageUrl(card.image) : defaultIcon;
                    const uploadKey = `card_${cardIdx}`;
                    const orientation = currentSection.imageOrientation || 'landscape';
                    const cardFit = card.imageFit || currentSection.imageFit || 'contain';
                    const cardAlign = card.imageAlign || 'center';

                    return (
                      <div
                        key={card.id || cardIdx}
                        className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3.5 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all"
                      >
                        <div className="space-y-3">
                          {/* Card Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-700">Card #{cardIdx + 1}</span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                card.image
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {card.image ? 'Custom' : 'Default'}
                              </span>
                            </div>

                            {card.image && (
                              <button
                                type="button"
                                onClick={() => updateArrayItem('features', 'cards', cardIdx, 'image', '')}
                                className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium transition"
                                title="Restore default image"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Reset</span>
                              </button>
                            )}
                          </div>

                          {/* Full-width Image Box Preview with Aspect Ratio Matching Frontend */}
                          <div className="space-y-2">
                            <div
                              className={`relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-1.5 transition-all ${
                                orientation === 'portrait'
                                  ? 'aspect-[3/4] h-60 sm:h-64'
                                  : 'aspect-[16/10] h-36 sm:h-40'
                              }`}
                            >
                              <img
                                src={activeIcon}
                                alt={`Feature ${cardIdx + 1}`}
                                className={`w-full h-full ${cardFit === 'cover' ? 'object-cover' : 'object-contain'} ${
                                  cardFit === 'cover'
                                    ? (cardAlign === 'left' ? 'object-left' : cardAlign === 'right' ? 'object-right' : 'object-center')
                                    : 'object-center'
                                } transition-all duration-200`}
                                onError={(e) => {
                                  if (defaultIcon) e.currentTarget.src = defaultIcon;
                                }}
                              />

                              {/* Hover overlay for quick change */}
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <label className="px-2.5 py-1 text-xs font-semibold text-white bg-[#0047C7] hover:bg-[#003cb0] rounded-lg cursor-pointer transition shadow flex items-center gap-1">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>{uploadingImage[uploadKey] ? 'Uploading...' : 'Change'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingImage[uploadKey]}
                                    onChange={(e) => handleUploadImage(e.target.files?.[0], (url) => updateArrayItem('features', 'cards', cardIdx, 'image', url), uploadKey)}
                                  />
                                </label>
                              </div>
                            </div>

                            {/* Position Left / Center / Right Controls (Enabled ONLY when Fit Mode is Cover) */}
                            <div className={`flex items-center justify-between gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200/80 transition-opacity ${
                              cardFit !== 'cover' ? 'opacity-40' : ''
                            }`}>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-500">Position:</span>
                                {cardFit !== 'cover' && (
                                  <span className="text-[9px] text-slate-400 font-medium">(Only in Cover)</span>
                                )}
                              </div>
                              <div className={`flex gap-1 ${cardFit !== 'cover' ? 'pointer-events-none' : ''}`}>
                                <button
                                  type="button"
                                  disabled={cardFit !== 'cover'}
                                  onClick={() => updateArrayItem('features', 'cards', cardIdx, 'imageAlign', 'left')}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${
                                    cardAlign === 'left' ? 'bg-[#0047C7] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                  }`}
                                  title="Align Left (Available when Fit Mode is Cover)"
                                >
                                  Left
                                </button>
                                <button
                                  type="button"
                                  disabled={cardFit !== 'cover'}
                                  onClick={() => updateArrayItem('features', 'cards', cardIdx, 'imageAlign', 'center')}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${
                                    cardAlign === 'center' ? 'bg-[#0047C7] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                  }`}
                                  title="Align Center (Available when Fit Mode is Cover)"
                                >
                                  Center
                                </button>
                                <button
                                  type="button"
                                  disabled={cardFit !== 'cover'}
                                  onClick={() => updateArrayItem('features', 'cards', cardIdx, 'imageAlign', 'right')}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${
                                    cardAlign === 'right' ? 'bg-[#0047C7] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                  }`}
                                  title="Align Right (Available when Fit Mode is Cover)"
                                >
                                  Right
                                </button>
                              </div>
                            </div>

                            {/* Fit Mode (No Cut vs Fill) */}
                            <div className="flex items-center justify-between gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200/80">
                              <span className="text-[10px] font-bold text-slate-500">Fit Mode:</span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => updateArrayItem('features', 'cards', cardIdx, 'imageFit', 'contain')}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                                    cardFit === 'contain' ? 'bg-[#0047C7] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                  }`}
                                  title="Fit whole image without any cut"
                                >
                                  No Cut
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateArrayItem('features', 'cards', cardIdx, 'imageFit', 'cover')}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                                    cardFit === 'cover' ? 'bg-[#0047C7] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                  }`}
                                  title="Fill box completely"
                                >
                                  Cover
                                </button>
                              </div>
                            </div>

                            {/* Upload Action Button + Explicit Recommended Size Helper */}
                            <div className="pt-1">
                              <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0047C7] bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg cursor-pointer transition">
                                <Upload className="w-3.5 h-3.5" />
                                <span>{uploadingImage[uploadKey] ? 'Uploading...' : (card.image ? 'Change Image' : 'Upload Image')}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadingImage[uploadKey]}
                                  onChange={(e) => handleUploadImage(e.target.files?.[0], (url) => updateArrayItem('features', 'cards', cardIdx, 'image', url), uploadKey)}
                                />
                              </label>

                              <div className="text-[10px] text-slate-500 font-medium text-center mt-1">
                                {orientation === 'portrait' ? (
                                  <span>📐 Size: <strong>450 × 600 px</strong> (3:4)</span>
                                ) : (
                                  <span>📐 Size: <strong>600 × 380 px</strong> (16:10)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Read More Link Section (Title & Description Removed Completely) */}
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            Read More Link Action
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <span className="block text-[10px] font-semibold text-slate-500 mb-1">Link Text</span>
                              <input
                                type="text"
                                value={card.linkText || 'Read more'}
                                onChange={(e) => updateArrayItem('features', 'cards', cardIdx, 'linkText', e.target.value)}
                                placeholder="Read more"
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg outline-none bg-white focus:border-[#0047C7]"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] font-semibold text-slate-500 mb-1">URL Path</span>
                              <input
                                type="text"
                                value={card.url || ''}
                                onChange={(e) => updateArrayItem('features', 'cards', cardIdx, 'url', e.target.value)}
                                placeholder="/service-page"
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg outline-none bg-white focus:border-[#0047C7]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. FIND JOBS CTA BANNER */}
          {currentSection.id === 'find_jobs' && (
            <div className="space-y-6">
              {/* Eyebrow & Title */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Eyebrow Tag
                  </label>
                  <input
                    type="text"
                    value={currentSection.eyebrow || ''}
                    onChange={(e) => updateSectionField('find_jobs', 'eyebrow', e.target.value)}
                    placeholder="e.g. Find jobs"
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div className="lg:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    CTA Title Heading
                  </label>
                  <input
                    type="text"
                    value={currentSection.title || ''}
                    onChange={(e) => updateSectionField('find_jobs', 'title', e.target.value)}
                    placeholder="Create free account and start applying..."
                    className="w-full px-4 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:border-[#0047C7] outline-none"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Title Font Size (px)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="60"
                    value={currentSection.titleFontSize || 36}
                    onChange={(e) => updateSectionField('find_jobs', 'titleFontSize', Number(e.target.value) || 36)}
                    className="w-24 px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-9">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Description Text
                  </label>
                  <textarea
                    rows={2}
                    value={currentSection.subtitle || ''}
                    onChange={(e) => updateSectionField('find_jobs', 'subtitle', e.target.value)}
                    placeholder="Build your profile, explore verified openings..."
                    className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl outline-none resize-none"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Description Size (px)
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="28"
                    value={currentSection.subtitleFontSize || 18}
                    onChange={(e) => updateSectionField('find_jobs', 'subtitleFontSize', Number(e.target.value) || 18)}
                    className="w-24 px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Button & Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                {/* Button Setting */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase">Action Button</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={currentSection.primaryButton?.text || ''}
                      onChange={(e) => updateSectionNested('find_jobs', 'primaryButton', 'text', e.target.value)}
                      placeholder="Button Text (e.g. Explore more)"
                      className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none"
                    />
                    <input
                      type="text"
                      value={currentSection.primaryButton?.url || ''}
                      onChange={(e) => updateSectionNested('find_jobs', 'primaryButton', 'url', e.target.value)}
                      placeholder="Link (e.g. /jobs)"
                      className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>

                {/* Left Image Setting */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase">Left Team Image</span>
                    <span className="text-[11px] text-slate-400">
                      {currentSection.image?.url ? 'Custom Image' : 'Default Image'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-20 h-16 bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center p-1 shrink-0">
                      <img
                        src={currentSection.image?.url ? resolveCmsImageUrl(currentSection.image.url) : ABOUT_DEFAULT_IMAGES.find_jobs}
                        alt="Find Jobs Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 text-xs font-bold text-white bg-[#0047C7] hover:bg-[#003cb0] rounded-lg cursor-pointer transition shadow-xs">
                        {uploadingImage['find_jobs'] ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingImage['find_jobs']}
                          onChange={(e) => handleUploadImage(e.target.files?.[0], (url) => updateSectionNested('find_jobs', 'image', 'url', url), 'find_jobs')}
                        />
                      </label>

                      {currentSection.image?.url && (
                        <button
                          type="button"
                          onClick={() => updateSectionNested('find_jobs', 'image', 'url', '')}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg"
                          title="Restore default image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. ONLINE MARKETING & COMMITMENT STORY */}
          {currentSection.id === 'marketing_story' && (
            <div className="space-y-6">
              {/* Eyebrow & Title */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Eyebrow Tag
                  </label>
                  <input
                    type="text"
                    value={currentSection.eyebrow || ''}
                    onChange={(e) => updateSectionField('marketing_story', 'eyebrow', e.target.value)}
                    placeholder="e.g. Online Marketing"
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div className="lg:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Heading Title
                  </label>
                  <input
                    type="text"
                    value={currentSection.title || ''}
                    onChange={(e) => updateSectionField('marketing_story', 'title', e.target.value)}
                    placeholder="Committed to top quality and results"
                    className="w-full px-4 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:border-[#0047C7] outline-none"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Title Font Size (px)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="60"
                    value={currentSection.titleFontSize || 44}
                    onChange={(e) => updateSectionField('marketing_story', 'titleFontSize', Number(e.target.value) || 44)}
                    className="w-24 px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Paragraphs 1 & 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Paragraph 1 Text
                  </label>
                  <textarea
                    rows={3}
                    value={currentSection.paragraph1 || ''}
                    onChange={(e) => updateSectionField('marketing_story', 'paragraph1', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Paragraph 2 Text
                  </label>
                  <textarea
                    rows={3}
                    value={currentSection.paragraph2 || ''}
                    onChange={(e) => updateSectionField('marketing_story', 'paragraph2', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none resize-y"
                  />
                </div>
              </div>

              {/* Button & Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase">Button</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={currentSection.primaryButton?.text || ''}
                      onChange={(e) => updateSectionNested('marketing_story', 'primaryButton', 'text', e.target.value)}
                      placeholder="Button Text (e.g. Learn more)"
                      className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none"
                    />
                    <input
                      type="text"
                      value={currentSection.primaryButton?.url || ''}
                      onChange={(e) => updateSectionNested('marketing_story', 'primaryButton', 'url', e.target.value)}
                      placeholder="Link (e.g. /contact)"
                      className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase">Right Story Image</span>
                    <span className="text-[11px] text-slate-400">
                      {currentSection.image?.url ? 'Custom Image' : 'Default Image'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-20 h-16 bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center p-1 shrink-0">
                      <img
                        src={currentSection.image?.url ? resolveCmsImageUrl(currentSection.image.url) : ABOUT_DEFAULT_IMAGES.marketing_story}
                        alt="Story Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 text-xs font-bold text-white bg-[#0047C7] hover:bg-[#003cb0] rounded-lg cursor-pointer transition shadow-xs">
                        {uploadingImage['marketing_story'] ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingImage['marketing_story']}
                          onChange={(e) => handleUploadImage(e.target.files?.[0], (url) => updateSectionNested('marketing_story', 'image', 'url', url), 'marketing_story')}
                        />
                      </label>

                      {currentSection.image?.url && (
                        <button
                          type="button"
                          onClick={() => updateSectionNested('marketing_story', 'image', 'url', '')}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg"
                          title="Restore default image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. MEET OUR TEAM */}
          {currentSection.id === 'team' && (
            <div className="space-y-6">
              {/* Header Title & Font Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Section Heading / Title
                  </label>
                  <input
                    type="text"
                    value={currentSection.title || ''}
                    onChange={(e) => updateSectionField('team', 'title', e.target.value)}
                    placeholder="e.g. Meet our team"
                    className="w-full px-4 py-2.5 text-sm font-semibold border border-slate-300 rounded-xl focus:border-[#0047C7] outline-none"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Title Font Size (px)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="60"
                    value={currentSection.titleFontSize || 44}
                    onChange={(e) => updateSectionField('team', 'titleFontSize', Number(e.target.value) || 44)}
                    className="w-24 px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Title Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSection.titleColor || '#1f2938'}
                      onChange={(e) => updateSectionField('team', 'titleColor', e.target.value)}
                      className="w-9 h-9 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentSection.titleColor || '#1f2938'}
                      onChange={(e) => updateSectionField('team', 'titleColor', e.target.value)}
                      className="w-20 px-2 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Subtitle & Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Section Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    value={currentSection.subtitle || ''}
                    onChange={(e) => updateSectionField('team', 'subtitle', e.target.value)}
                    placeholder="Find the type of work you need, clearly defined and ready to start..."
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:border-[#0047C7] outline-none resize-y"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subtitle Font Size (px)
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="28"
                    value={currentSection.subtitleFontSize || 16}
                    onChange={(e) => updateSectionField('team', 'subtitleFontSize', Number(e.target.value) || 16)}
                    className="w-24 px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subtitle Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSection.subtitleColor || '#88929b'}
                      onChange={(e) => updateSectionField('team', 'subtitleColor', e.target.value)}
                      className="w-9 h-9 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentSection.subtitleColor || '#88929b'}
                      onChange={(e) => updateSectionField('team', 'subtitleColor', e.target.value)}
                      className="w-20 px-2 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Team Members List (4 per row, Passport Framed) */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#0047C7]" />
                    Team Members ({Array.isArray(currentSection.members) ? currentSection.members.length : 0}) — 4 Per Row
                  </h3>
                  <span className="text-xs text-slate-500">
                    Passport framing (<strong className="text-slate-700">4:5 Aspect Ratio</strong>) matching public /about page
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(Array.isArray(currentSection.members) ? currentSection.members : []).map((member, mIdx) => {
                    const defaultPhoto = ABOUT_DEFAULT_IMAGES.team[mIdx % ABOUT_DEFAULT_IMAGES.team.length];
                    const activePhoto = member.photo ? resolveCmsImageUrl(member.photo) : defaultPhoto;
                    const isCustom = Boolean(member.photo);

                    return (
                      <div
                        key={member.id || mIdx}
                        className="border border-[#ececec] rounded-2xl p-4 sm:p-5 bg-white hover:border-[#0047C7] hover:shadow-[0_12px_30px_0_rgba(0,71,199,0.08)] transition-all duration-300 flex flex-col justify-between shadow-xs group relative text-center"
                      >
                        <div>
                          {/* Card Top Bar */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-700">Member #{mIdx + 1}</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                isCustom ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {isCustom ? 'Custom' : 'Default'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteTeamMember(mIdx)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Delete Member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Passport Photo Preview Container (Exact /about page framing) */}
                          <div className="w-full aspect-[4/5] sm:h-[260px] rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-200 relative group/photo my-2 shadow-inner">
                            <img
                              src={activePhoto}
                              alt={member.name || 'Team Member'}
                              className="w-full h-full object-cover object-top group-hover/photo:scale-105 transition-transform duration-300"
                              onError={(e) => { e.currentTarget.src = defaultPhoto; }}
                            />

                            {/* Quick Crop Hover Overlay */}
                            <label
                              title="Click to Upload & Crop Photo"
                              className="absolute inset-0 bg-slate-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer text-xs font-bold gap-1"
                            >
                              <Crop className="w-5 h-5 mb-0.5" />
                              <span>Upload & Crop</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelectForCrop(e, 'team', mIdx, 'square')}
                              />
                            </label>
                          </div>

                          {/* Recommended Size Badge */}
                          <div className="text-[10.5px] font-semibold text-[#0047C7] bg-blue-50/80 py-1 px-2 rounded-lg border border-blue-100 flex items-center justify-center gap-1 my-1.5">
                            <span>📐 Recommended: <strong>400 × 500 px</strong> (Passport / 4:5)</span>
                          </div>

                          {/* Action Buttons: Upload & Crop / Adjust Crop / Reset */}
                          <div className="flex items-center justify-center gap-1.5 py-1 flex-wrap">
                            <label className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-[#0047C7] hover:bg-[#003cb0] rounded-lg cursor-pointer transition shadow-xs">
                              <Upload className="w-3 h-3" />
                              <span>Upload & Crop</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelectForCrop(e, 'team', mIdx, 'square')}
                              />
                            </label>

                            {member.photo && (
                              <button
                                type="button"
                                onClick={() => setCropperModal({ isOpen: true, initialImage: activePhoto, targetSection: 'team', targetIndex: mIdx, shape: 'square' })}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                                title="Adjust crop"
                              >
                                <Crop className="w-3 h-3" />
                                <span>Adjust</span>
                              </button>
                            )}

                            {isCustom && (
                              <button
                                type="button"
                                onClick={() => updateArrayItem('team', 'members', mIdx, 'photo', '')}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                                title="Restore default template photo"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Name & Role Inputs */}
                        <div className="space-y-2 pt-3 border-t border-slate-100 text-left mt-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Full Name</label>
                            <input
                              type="text"
                              value={member.name || ''}
                              onChange={(e) => updateArrayItem('team', 'members', mIdx, 'name', e.target.value)}
                              placeholder="e.g. Peter Grant"
                              className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg outline-none focus:border-[#0047C7]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Job Title / Role</label>
                            <input
                              type="text"
                              value={member.role || ''}
                              onChange={(e) => updateArrayItem('team', 'members', mIdx, 'role', e.target.value)}
                              placeholder="e.g. Marketing Director"
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-[#0047C7]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add New Team Member Form Card */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 space-y-3.5 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h6 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wider">
                      <Plus className="w-4 h-4 text-indigo-600" />
                      Add New Team Member
                    </h6>
                    <span className="text-[11px] text-indigo-600 font-medium">
                      Automatically appends to grid in 4-per-row passport layout
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
                    <div>
                      <label className="text-[11px] font-semibold text-indigo-950 block mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newTeamMember.name}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                        placeholder="e.g. Satya Nadella"
                        className="w-full px-3 py-2 text-xs border border-indigo-200 bg-white rounded-xl outline-none focus:border-indigo-600 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-indigo-950 block mb-1">
                        Job Title / Designation
                      </label>
                      <input
                        type="text"
                        value={newTeamMember.role}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                        placeholder="e.g. Chief Executive Officer"
                        className="w-full px-3 py-2 text-xs border border-indigo-200 bg-white rounded-xl outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-indigo-950">Photo Upload &amp; Crop</label>
                        <span className="text-[10px] text-indigo-600 font-semibold">📐 400 × 500 px (4:5)</span>
                      </div>
                      <div className="flex gap-2">
                        <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{newTeamMember.photo ? 'Change Cropped Photo' : 'Upload & Crop Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileSelectForCrop(e, 'team', 'new', 'square')}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {newTeamMember.photo && (
                    <div className="flex items-center gap-3 p-2.5 bg-white border border-indigo-200 rounded-xl">
                      <div className="w-10 h-12 rounded-lg border border-indigo-200 overflow-hidden bg-white shrink-0">
                        <img src={resolveCmsImageUrl(newTeamMember.photo)} alt="Preview" className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-indigo-900 truncate">Passport photo cropped successfully!</p>
                        <p className="text-[10px] text-indigo-500">Ready to be added to the team list.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddTeamMember}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Team Member
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. OUR HAPPY CUSTOMERS / TESTIMONIALS */}
          {currentSection.id === 'testimonials' && (
            <div className="space-y-6">
              {/* Header Title & Font Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Section Heading / Title
                  </label>
                  <input
                    type="text"
                    value={currentSection.title || ''}
                    onChange={(e) => updateSectionField('testimonials', 'title', e.target.value)}
                    placeholder="e.g. Our Happy Customer"
                    className="w-full px-4 py-2.5 text-sm font-semibold border border-slate-300 rounded-xl focus:border-[#0047C7] outline-none"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Title Font Size (px)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="60"
                    value={currentSection.titleFontSize || 44}
                    onChange={(e) => updateSectionField('testimonials', 'titleFontSize', Number(e.target.value) || 44)}
                    className="w-24 px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Title Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSection.titleColor || '#1f2938'}
                      onChange={(e) => updateSectionField('testimonials', 'titleColor', e.target.value)}
                      className="w-9 h-9 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentSection.titleColor || '#1f2938'}
                      onChange={(e) => updateSectionField('testimonials', 'titleColor', e.target.value)}
                      className="w-20 px-2 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Subtitle & Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Section Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    value={currentSection.subtitle || ''}
                    onChange={(e) => updateSectionField('testimonials', 'subtitle', e.target.value)}
                    placeholder="When it comes to choosing the right talent platform, hear what our verified customers have to say..."
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:border-[#0047C7] outline-none resize-y"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subtitle Font Size (px)
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="28"
                    value={currentSection.subtitleFontSize || 16}
                    onChange={(e) => updateSectionField('testimonials', 'subtitleFontSize', Number(e.target.value) || 16)}
                    className="w-24 px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subtitle Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSection.subtitleColor || '#88929b'}
                      onChange={(e) => updateSectionField('testimonials', 'subtitleColor', e.target.value)}
                      className="w-9 h-9 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentSection.subtitleColor || '#88929b'}
                      onChange={(e) => updateSectionField('testimonials', 'subtitleColor', e.target.value)}
                      className="w-20 px-2 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Testimonials List (4 per row, Avatar Framed) */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#0047C7]" />
                    Customer Reviews ({Array.isArray(currentSection.testimonials) ? currentSection.testimonials.length : 0}) — 4 Per Row
                  </h3>
                  <span className="text-xs text-slate-500">
                    Circular avatar (<strong className="text-slate-700">1:1 Square Cropper</strong>) with star ratings
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(Array.isArray(currentSection.testimonials) ? currentSection.testimonials : []).map((t, tIdx) => {
                    const defaultAvatar = ABOUT_DEFAULT_IMAGES.testimonials[tIdx % ABOUT_DEFAULT_IMAGES.testimonials.length];
                    const activeAvatar = t.photo ? resolveCmsImageUrl(t.photo) : defaultAvatar;
                    const isCustom = Boolean(t.photo);

                    return (
                      <div
                        key={t.id || tIdx}
                        className="border border-[#ececec] rounded-2xl p-4 sm:p-5 bg-white hover:border-[#0047C7] hover:shadow-[0_12px_30px_0_rgba(0,71,199,0.08)] transition-all duration-300 flex flex-col justify-between shadow-xs group relative text-center"
                      >
                        <div className="space-y-2">
                          {/* Card Top Bar */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">Review #{tIdx + 1}</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                isCustom ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {isCustom ? 'Custom' : 'Default'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteTestimonial(tIdx)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Delete Testimonial"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Avatar Photo (Exact /about page circular framing) */}
                          <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-50 flex items-center justify-center relative group/avatar my-1.5">
                            <img
                              src={activeAvatar}
                              alt={t.name || 'Customer'}
                              className="w-full h-full object-cover object-top group-hover/avatar:scale-105 transition-transform duration-300"
                              onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                            />

                            {/* Quick Crop Hover Overlay */}
                            <label
                              title="Click to Upload & Crop Avatar"
                              className="absolute inset-0 bg-slate-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
                            >
                              <Crop className="w-4 h-4 mb-0.5" />
                              <span>Crop</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelectForCrop(e, 'testimonials', tIdx, 'circle')}
                              />
                            </label>
                          </div>

                          {/* Recommended Size Badge */}
                          <div className="text-[10.5px] font-semibold text-amber-700 bg-amber-50 py-1 px-2 rounded-lg border border-amber-100 flex items-center justify-center gap-1">
                            <span>📐 Recommended: <strong>300 × 300 px</strong> (Square 1:1)</span>
                          </div>

                          {/* Action Buttons: Upload & Crop / Adjust Crop / Reset */}
                          <div className="flex items-center justify-center gap-1.5 py-1 flex-wrap">
                            <label className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-[#0047C7] hover:bg-[#003cb0] rounded-lg cursor-pointer transition shadow-xs">
                              <Upload className="w-3 h-3" />
                              <span>Upload & Crop</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelectForCrop(e, 'testimonials', tIdx, 'circle')}
                              />
                            </label>

                            {t.photo && (
                              <button
                                type="button"
                                onClick={() => setCropperModal({ isOpen: true, initialImage: activeAvatar, targetSection: 'testimonials', targetIndex: tIdx, shape: 'circle' })}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                                title="Adjust crop"
                              >
                                <Crop className="w-3 h-3" />
                                <span>Adjust</span>
                              </button>
                            )}

                            {isCustom && (
                              <button
                                type="button"
                                onClick={() => updateArrayItem('testimonials', 'testimonials', tIdx, 'photo', '')}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                                title="Restore default template avatar"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Review Text */}
                          <div className="text-left pt-1">
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Review Feedback</label>
                            <textarea
                              rows={3}
                              value={t.review || ''}
                              onChange={(e) => updateArrayItem('testimonials', 'testimonials', tIdx, 'review', e.target.value)}
                              placeholder="Customer review or feedback..."
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-[#0047C7] resize-none"
                            />
                          </div>
                        </div>

                        {/* Name, Role & Star Rating */}
                        <div className="space-y-2 pt-3 border-t border-slate-100 text-left mt-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Customer Name</label>
                              <input
                                type="text"
                                value={t.name || ''}
                                onChange={(e) => updateArrayItem('testimonials', 'testimonials', tIdx, 'name', e.target.value)}
                                placeholder="e.g. Sarah Harding"
                                className="w-full px-2 py-1 text-xs font-semibold border border-slate-300 rounded-lg outline-none focus:border-[#0047C7]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Role / Title</label>
                              <input
                                type="text"
                                value={t.role || ''}
                                onChange={(e) => updateArrayItem('testimonials', 'testimonials', tIdx, 'role', e.target.value)}
                                placeholder="e.g. Visual Designer"
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg outline-none focus:border-[#0047C7]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Rating (1 - 5 Stars)</label>
                            <select
                              value={t.rating || 5}
                              onChange={(e) => updateArrayItem('testimonials', 'testimonials', tIdx, 'rating', Number(e.target.value) || 5)}
                              className="w-full px-2.5 py-1 text-xs font-semibold border border-slate-300 rounded-lg outline-none bg-white focus:border-[#0047C7]"
                            >
                              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                              <option value="3">⭐⭐⭐ (3 Stars)</option>
                              <option value="2">⭐⭐ (2 Stars)</option>
                              <option value="1">⭐ (1 Star)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add New Customer Testimonial Form Card */}
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 space-y-3.5 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h6 className="text-xs font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wider">
                      <Plus className="w-4 h-4 text-amber-600" />
                      Add New Customer Testimonial
                    </h6>
                    <span className="text-[11px] text-amber-700 font-medium">
                      Automatically appends to grid in 4-per-row layout
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
                    <div>
                      <label className="text-[11px] font-semibold text-amber-950 block mb-1">
                        Customer Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newTestimonial.name}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                        placeholder="e.g. Sarah Harding"
                        className="w-full px-3 py-2 text-xs border border-amber-200 bg-white rounded-xl outline-none focus:border-amber-600 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-amber-950 block mb-1">
                        Designation / Role
                      </label>
                      <input
                        type="text"
                        value={newTestimonial.role}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                        placeholder="e.g. Visual Designer"
                        className="w-full px-3 py-2 text-xs border border-amber-200 bg-white rounded-xl outline-none focus:border-amber-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-amber-950 block mb-1">
                        Star Rating
                      </label>
                      <select
                        value={newTestimonial.rating}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: Number(e.target.value) || 5 })}
                        className="w-full px-3 py-2 text-xs border border-amber-200 bg-white rounded-xl outline-none focus:border-amber-600"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                        <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                        <option value="3">⭐⭐⭐ (3 Stars)</option>
                        <option value="2">⭐⭐ (2 Stars)</option>
                        <option value="1">⭐ (1 Star)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-amber-950">Avatar Photo</label>
                        <span className="text-[10px] text-amber-700 font-semibold">📐 300 × 300 px</span>
                      </div>
                      <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{newTestimonial.photo ? 'Change Avatar' : 'Upload & Crop Avatar'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileSelectForCrop(e, 'testimonials', 'new', 'circle')}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-amber-950 block mb-1">
                      Customer Review / Feedback
                    </label>
                    <textarea
                      rows={2}
                      value={newTestimonial.review}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, review: e.target.value })}
                      placeholder="Write feedback statement..."
                      className="w-full px-3 py-2 text-xs border border-amber-200 bg-white rounded-xl outline-none focus:border-amber-600"
                    />
                  </div>

                  {newTestimonial.photo && (
                    <div className="flex items-center gap-3 p-2.5 bg-white border border-amber-200 rounded-xl">
                      <div className="w-10 h-10 rounded-full border border-amber-200 overflow-hidden bg-white shrink-0">
                        <img src={resolveCmsImageUrl(newTestimonial.photo)} alt="Preview" className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-amber-900 truncate">Customer avatar cropped successfully!</p>
                        <p className="text-[10px] text-amber-600">Ready to be added to reviews.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddTestimonial}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Testimonial
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Sticky Save Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>All sections ready for live deployment.</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-slate-600 hover:text-[#0047C7] flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview Live /about
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#0047C7] rounded-xl hover:bg-[#003cb0] disabled:opacity-60 transition shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Publishing...' : 'Save & Publish All Changes'}
          </button>
        </div>
      </div>

      {/* Passport / Avatar Photo Cropper Modal */}
      <PassportPhotoCropperModal
        isOpen={cropperModal.isOpen}
        onClose={() => setCropperModal({ isOpen: false, initialImage: null, targetSection: null, targetIndex: null, shape: 'square' })}
        imageSrc={cropperModal.initialImage}
        onCropComplete={handleCropComplete}
        title={cropperModal.targetSection === 'testimonials' ? 'Adjust & Crop Customer Photo (Square 1:1)' : 'Adjust & Crop Team Member Photo (Passport 4:5)'}
        shape={cropperModal.shape || 'square'}
      />
    </div>
  );
};

export default AboutUsCMS;
