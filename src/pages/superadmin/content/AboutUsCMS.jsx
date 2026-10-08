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
  Check
} from 'lucide-react';

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

  // Sections State
  const [sections, setSections] = useState(() => {
    return JSON.parse(JSON.stringify(DEFAULT_ABOUT_SECTIONS_DATA));
  });

  const alertTimerRef = useRef(null);
  const showAlert = (type, text) => {
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setAlert({ type, text });
    alertTimerRef.current = setTimeout(() => {
      setAlert({ type: '', text: '' });
    }, 6000);
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
        if (Array.isArray(pageSections) && pageSections.length > 0) {
          // Merge with default data to guarantee all keys exist
          const merged = DEFAULT_ABOUT_SECTIONS_DATA.map(def => {
            const found = pageSections.find(s => s.id === def.id);
            if (!found) return def;
            return {
              ...def,
              ...found,
              cards: found.cards || def.cards,
              members: found.members || def.members,
              testimonials: found.testimonials || def.testimonials,
              primaryButton: { ...def.primaryButton, ...found.primaryButton },
              secondaryButton: { ...def.secondaryButton, ...found.secondaryButton },
              image: { ...def.image, ...found.image }
            };
          });
          setSections(merged);
        } else {
          setSections(JSON.parse(JSON.stringify(DEFAULT_ABOUT_SECTIONS_DATA)));
        }
      }
    } catch (err) {
      // If 404 / not saved in DB, smoothly use the complete defaults
      setSections(JSON.parse(JSON.stringify(DEFAULT_ABOUT_SECTIONS_DATA)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, []);

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
    setSections(JSON.parse(JSON.stringify(DEFAULT_ABOUT_SECTIONS_DATA)));
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

      showAlert('success', 'About Us page updated and published successfully! Changes are live on /about.');
    } catch (err) {
      console.error('Save About Us error:', err);
      showAlert('error', err.response?.data?.message || 'Failed to save About Us page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Helper for current section
  const currentSection = sections.find(s => s.id === activeTab) || sections[0];

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
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
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-[#0047C7] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#0047C7]' : 'text-slate-400'}`} />
              {tab.label}
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

              {/* 4 Feature Cards */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  4 Feature Cards Content &amp; Icons
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(currentSection.cards || []).map((card, cardIdx) => {
                    const defaultIcon = ABOUT_DEFAULT_IMAGES.features[cardIdx];
                    const activeIcon = card.image ? resolveCmsImageUrl(card.image) : defaultIcon;
                    const uploadKey = `card_${cardIdx}`;

                    return (
                      <div
                        key={card.id || cardIdx}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">Card #{cardIdx + 1}</span>
                          <span className="text-[11px] text-slate-400">
                            {card.image ? 'Custom Icon' : 'Default Icon'}
                          </span>
                        </div>

                        {/* Icon Preview + Upload + Remove */}
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-center shrink-0">
                            <img src={activeIcon} alt="Icon" className="max-h-full max-w-full object-contain" />
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="px-2.5 py-1 text-xs font-semibold text-[#0047C7] bg-white border border-blue-200 hover:bg-blue-50 rounded-lg cursor-pointer transition">
                              {uploadingImage[uploadKey] ? 'Uploading...' : 'Change Icon'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingImage[uploadKey]}
                                onChange={(e) => handleUploadImage(e.target.files?.[0], (url) => updateArrayItem('features', 'cards', cardIdx, 'image', url), uploadKey)}
                              />
                            </label>

                            {card.image && (
                              <button
                                type="button"
                                onClick={() => updateArrayItem('features', 'cards', cardIdx, 'image', '')}
                                className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg"
                                title="Restore default icon"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Title</label>
                          <input
                            type="text"
                            value={card.title || ''}
                            onChange={(e) => updateArrayItem('features', 'cards', cardIdx, 'title', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg outline-none"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                          <textarea
                            rows={2}
                            value={card.description || ''}
                            onChange={(e) => updateArrayItem('features', 'cards', cardIdx, 'description', e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none resize-none"
                          />
                        </div>

                        {/* Link */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">Link Text</label>
                            <input
                              type="text"
                              value={card.linkText || 'Read more'}
                              onChange={(e) => updateArrayItem('features', 'cards', cardIdx, 'linkText', e.target.value)}
                              className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">URL Path</label>
                            <input
                              type="text"
                              value={card.url || ''}
                              onChange={(e) => updateArrayItem('features', 'cards', cardIdx, 'url', e.target.value)}
                              className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg outline-none"
                            />
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
              {/* Header Title & Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={currentSection.title || ''}
                    onChange={(e) => updateSectionField('team', 'title', e.target.value)}
                    placeholder="Meet our team"
                    className="w-full px-4 py-2 text-sm font-semibold border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subtitle Description
                  </label>
                  <input
                    type="text"
                    value={currentSection.subtitle || ''}
                    onChange={(e) => updateSectionField('team', 'subtitle', e.target.value)}
                    placeholder="Find the type of work you need..."
                    className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* 4 Team Members */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  4 Team Members Cards (Photo, Name, Role)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(currentSection.members || []).map((member, mIdx) => {
                    const defaultPhoto = ABOUT_DEFAULT_IMAGES.team[mIdx];
                    const activePhoto = member.photo ? resolveCmsImageUrl(member.photo) : defaultPhoto;
                    const uploadKey = `team_${mIdx}`;

                    return (
                      <div
                        key={member.id || mIdx}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3 text-center"
                      >
                        <div className="w-full h-36 bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center p-1">
                          <img
                            src={activePhoto}
                            alt={member.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>

                        <div className="flex items-center justify-center gap-1.5">
                          <label className="px-2.5 py-1 text-[11px] font-bold text-[#0047C7] bg-white border border-blue-200 hover:bg-blue-50 rounded-lg cursor-pointer transition">
                            {uploadingImage[uploadKey] ? 'Uploading...' : 'Change Photo'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingImage[uploadKey]}
                              onChange={(e) => handleUploadImage(e.target.files?.[0], (url) => updateArrayItem('team', 'members', mIdx, 'photo', url), uploadKey)}
                            />
                          </label>

                          {member.photo && (
                            <button
                              type="button"
                              onClick={() => updateArrayItem('team', 'members', mIdx, 'photo', '')}
                              className="p-1 text-rose-500 hover:text-rose-700 rounded"
                              title="Restore default photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5 text-left">Name</label>
                          <input
                            type="text"
                            value={member.name || ''}
                            onChange={(e) => updateArrayItem('team', 'members', mIdx, 'name', e.target.value)}
                            className="w-full px-2.5 py-1 text-xs font-semibold border border-slate-300 rounded-lg outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5 text-left">Role / Designation</label>
                          <input
                            type="text"
                            value={member.role || ''}
                            onChange={(e) => updateArrayItem('team', 'members', mIdx, 'role', e.target.value)}
                            className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 6. OUR HAPPY CUSTOMERS / TESTIMONIALS */}
          {currentSection.id === 'testimonials' && (
            <div className="space-y-6">
              {/* Header Title & Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={currentSection.title || ''}
                    onChange={(e) => updateSectionField('testimonials', 'title', e.target.value)}
                    placeholder="Our Happy Customer"
                    className="w-full px-4 py-2 text-sm font-semibold border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subtitle Description
                  </label>
                  <input
                    type="text"
                    value={currentSection.subtitle || ''}
                    onChange={(e) => updateSectionField('testimonials', 'subtitle', e.target.value)}
                    placeholder="What our candidates and employers have to say..."
                    className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* 3 Testimonials Cards */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3 Customer Testimonial Cards
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(currentSection.testimonials || []).map((t, tIdx) => {
                    const defaultAvatar = ABOUT_DEFAULT_IMAGES.testimonials[tIdx];
                    const activeAvatar = t.photo ? resolveCmsImageUrl(t.photo) : defaultAvatar;
                    const uploadKey = `testi_${tIdx}`;

                    return (
                      <div
                        key={t.id || tIdx}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-center flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Avatar Photo */}
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 mx-auto bg-white flex items-center justify-center">
                            <img
                              src={activeAvatar}
                              alt={t.name}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>

                          <div className="flex items-center justify-center gap-1.5">
                            <label className="px-2.5 py-1 text-[11px] font-bold text-[#0047C7] bg-white border border-blue-200 hover:bg-blue-50 rounded-lg cursor-pointer transition">
                              {uploadingImage[uploadKey] ? 'Uploading...' : 'Change Avatar'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingImage[uploadKey]}
                                onChange={(e) => handleUploadImage(e.target.files?.[0], (url) => updateArrayItem('testimonials', 'testimonials', tIdx, 'photo', url), uploadKey)}
                              />
                            </label>

                            {t.photo && (
                              <button
                                type="button"
                                onClick={() => updateArrayItem('testimonials', 'testimonials', tIdx, 'photo', '')}
                                className="p-1 text-rose-500 hover:text-rose-700 rounded"
                                title="Restore default avatar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Review */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5 text-left">Review Text</label>
                            <textarea
                              rows={3}
                              value={t.review || ''}
                              onChange={(e) => updateArrayItem('testimonials', 'testimonials', tIdx, 'review', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg outline-none resize-none"
                            />
                          </div>
                        </div>

                        {/* Name & Role & Rating */}
                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5 text-left">Customer Name</label>
                              <input
                                type="text"
                                value={t.name || ''}
                                onChange={(e) => updateArrayItem('testimonials', 'testimonials', tIdx, 'name', e.target.value)}
                                className="w-full px-2 py-1 text-xs font-semibold border border-slate-300 rounded-lg outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5 text-left">Role / Title</label>
                              <input
                                type="text"
                                value={t.role || ''}
                                onChange={(e) => updateArrayItem('testimonials', 'testimonials', tIdx, 'role', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5 text-left">Star Rating (1-5)</label>
                            <select
                              value={t.rating || 5}
                              onChange={(e) => updateArrayItem('testimonials', 'testimonials', tIdx, 'rating', Number(e.target.value) || 5)}
                              className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg outline-none bg-white"
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
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Sticky Save Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>All 6 sections ready for live deployment.</span>
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
    </div>
  );
};

export default AboutUsCMS;
