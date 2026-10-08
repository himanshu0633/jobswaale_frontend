import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';
import {
  DEFAULT_PAGES_SEO,
  DEFAULT_PAGES_MAP,
  SITE_DOMAIN
} from '../../../utils/seoHelper';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  Globe,
  Info,
  Loader,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Table,
  Tag,
  X
} from 'lucide-react';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const SEOSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbPages, setDbPages] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'overview'
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [alert, setAlert] = useState({ type: '', text: '' });
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customPageInput, setCustomPageInput] = useState({ title: '', slug: '' });

  // Form state for selected page
  const [form, setForm] = useState({
    title: '',
    slug: 'home',
    path: '/',
    fullUrl: 'https://jobswaale.com/',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    canonicalUrl: '',
    robots: 'index, follow'
  });

  const showAlert = (type, text) => {
    setAlert({ type, text });
    if (type === 'success') {
      setTimeout(() => setAlert({ type: '', text: '' }), 4000);
    }
  };

  // Fetch all pages from backend
  const fetchAllPages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_API_URL}/cms/pages`, {
        headers: getAuthHeaders()
      });
      const pages = Array.isArray(res.data) ? res.data : [];
      setDbPages(pages);
    } catch (err) {
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPages();
  }, []);

  // Map of pages stored in DB
  const dbPagesMap = useMemo(() => {
    const map = {};
    dbPages.forEach(p => {
      if (p.slug) {
        map[p.slug] = p;
      }
    });
    return map;
  }, [dbPages]);

  // Combined list of pages (Default Core Pages + Custom DB Pages)
  const allPagesList = useMemo(() => {
    const defaultSlugs = new Set(DEFAULT_PAGES_SEO.map(p => p.slug));
    const list = [...DEFAULT_PAGES_SEO];

    // Add any custom DB pages that aren't in defaults
    dbPages.forEach(p => {
      if (p.slug && !defaultSlugs.has(p.slug)) {
        list.push({
          key: p.slug,
          slug: p.slug,
          label: p.title || p.slug,
          path: `/${p.slug}`,
          fullUrl: `${SITE_DOMAIN}/${p.slug}`,
          defaultTitle: `${p.title} - JobsWaale`,
          defaultDescription: `Read more about ${p.title} on JobsWaale.`,
          defaultKeywords: `${p.title}, JobsWaale, career`,
          isCustom: true
        });
      }
    });

    return list;
  }, [dbPages]);

  // Filtered pages by search
  const filteredPages = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allPagesList;
    return allPagesList.filter(p => (
      p.label?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      p.path?.toLowerCase().includes(q)
    ));
  }, [allPagesList, searchTerm]);

  // Selected page definition
  const activePageDef = useMemo(() => {
    return allPagesList.find(p => p.slug === selectedSlug) || allPagesList[0] || DEFAULT_PAGES_SEO[0];
  }, [allPagesList, selectedSlug]);

  // Populate form when activePageDef or dbPagesMap changes
  useEffect(() => {
    if (!activePageDef) return;

    const dbRecord = dbPagesMap[activePageDef.slug];

    setForm({
      title: dbRecord?.title || activePageDef.label || activePageDef.slug,
      slug: activePageDef.slug,
      path: activePageDef.path || `/${activePageDef.slug}`,
      fullUrl: activePageDef.fullUrl || `${SITE_DOMAIN}/${activePageDef.slug}`,
      seoTitle: dbRecord?.seoTitle || activePageDef.defaultTitle || '',
      seoDescription: dbRecord?.seoDescription || activePageDef.defaultDescription || '',
      seoKeywords: dbRecord?.seoKeywords || activePageDef.defaultKeywords || '',
      canonicalUrl: activePageDef.fullUrl || `${SITE_DOMAIN}/${activePageDef.slug}`,
      robots: 'index, follow'
    });
  }, [selectedSlug, dbPagesMap, activePageDef]);

  // Handle page selection
  const handleSelectPage = (slug) => {
    setSelectedSlug(slug);
    setActiveTab('editor');
    setAlert({ type: '', text: '' });
  };

  // Reset current page to standard defaults
  const handleResetToDefault = () => {
    if (!activePageDef) return;
    if (window.confirm(`Reset SEO meta tags for "${activePageDef.label}" to standard recommended defaults?`)) {
      setForm(prev => ({
        ...prev,
        seoTitle: activePageDef.defaultTitle || '',
        seoDescription: activePageDef.defaultDescription || '',
        seoKeywords: activePageDef.defaultKeywords || '',
        canonicalUrl: activePageDef.fullUrl || `${SITE_DOMAIN}/${activePageDef.slug}`
      }));
      showAlert('success', 'Reset to recommended template. Click "Save SEO Changes" to apply.');
    }
  };

  // Save SEO settings
  const handleSaveSEO = async (e) => {
    if (e) e.preventDefault();
    if (!form.seoTitle.trim()) {
      showAlert('error', 'SEO Meta Title cannot be empty.');
      return;
    }

    setSaving(true);
    setAlert({ type: '', text: '' });

    try {
      const payload = {
        title: form.title.trim() || activePageDef.label,
        slug: form.slug,
        seoTitle: form.seoTitle.trim(),
        seoDescription: form.seoDescription.trim(),
        seoKeywords: form.seoKeywords.trim(),
        published: true
      };

      await axios.put(
        `${BASE_API_URL}/cms/pages/by-slug/${form.slug}`,
        payload,
        { headers: getAuthHeaders() }
      );

      showAlert('success', `SEO meta tags for "${activePageDef.label}" updated successfully! Changes are live on ${activePageDef.fullUrl}.`);
      await fetchAllPages();
    } catch (err) {
      console.error('Save SEO error:', err);
      showAlert('error', err.response?.data?.message || 'Could not save SEO settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Add custom URL / slug
  const handleAddCustomPage = (e) => {
    e.preventDefault();
    const cleanSlug = customPageInput.slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9/-]+/g, '-');
    if (!cleanSlug) {
      showAlert('error', 'Valid URL slug is required.');
      return;
    }

    const title = customPageInput.title.trim() || cleanSlug;
    setSelectedSlug(cleanSlug);
    setCustomPageInput({ title: '', slug: '' });
    setShowAddCustomModal(false);
    showAlert('info', `Page "/${cleanSlug}" selected. Configure its meta tags below and click "Save SEO Changes".`);
  };

  // Character count color helpers
  const titleLen = form.seoTitle.length;
  const descLen = form.seoDescription.length;

  const getTitleLenColor = () => {
    if (titleLen === 0) return 'text-slate-400';
    if (titleLen >= 40 && titleLen <= 65) return 'text-emerald-600 font-bold';
    if (titleLen > 65) return 'text-rose-600 font-bold';
    return 'text-amber-600 font-bold';
  };

  const getDescLenColor = () => {
    if (descLen === 0) return 'text-slate-400';
    if (descLen >= 120 && descLen <= 165) return 'text-emerald-600 font-bold';
    if (descLen > 165) return 'text-rose-600 font-bold';
    return 'text-amber-600 font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Globe className="h-5 w-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                Page SEO &amp; Meta Tags Management
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
              Configure meta titles, descriptions, keywords, and Google search appearances for public pages on <strong className="text-slate-700">jobswaale.com</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'editor' ? 'overview' : 'editor')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            >
              <Table className="h-4 w-4 text-indigo-600" />
              <span>{activeTab === 'editor' ? 'All Pages Summary Table' : 'Single Page Editor'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddCustomModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Custom Page URL</span>
            </button>
          </div>
        </div>

        {/* Quick Nav Pills for Priority Pages */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Quick Select Core Pages:
            </span>
            <span className="text-xs text-slate-400">
              Showing {filteredPages.length} configured pages
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {allPagesList.slice(0, 7).map(p => {
              const isSelected = selectedSlug === p.slug;
              const hasDb = Boolean(dbPagesMap[p.slug]?.seoTitle);
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => handleSelectPage(p.slug)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${hasDb ? 'bg-emerald-400' : 'bg-amber-400'}`}
                    title={hasDb ? 'Saved in database' : 'Using default template'}
                  />
                  <span>{p.label}</span>
                  <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {p.path}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Global Alert Notification */}
      {alert.text && (
        <div className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold shadow-sm ${
          alert.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {alert.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />}
            <span>{alert.text}</span>
          </div>
          <button type="button" onClick={() => setAlert({ type: '', text: '' })} title="Dismiss">
            <X className="h-4 w-4 opacity-70 hover:opacity-100 cursor-pointer" />
          </button>
        </div>
      )}

      {/* MAIN VIEW: SINGLE PAGE EDITOR OR OVERVIEW TABLE */}
      {activeTab === 'overview' ? (
        /* ========================================================================= */
        /* ALL PAGES SUMMARY TABLE                                                   */
        /* ========================================================================= */
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-6 py-4 gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-800">
                All Website Pages SEO Overview ({allPagesList.length} Pages)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review titles, meta descriptions, and indexing statuses across the entire website at a glance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search page or URL..."
                className="w-56 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm border-collapse">
              <thead className="bg-slate-50 text-xs font-bold text-slate-700 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Page Name</th>
                  <th className="px-4 py-3">Target URL</th>
                  <th className="px-4 py-3">Meta Title</th>
                  <th className="px-4 py-3">Meta Description</th>
                  <th className="px-4 py-3">DB Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPages.map(page => {
                  const dbRecord = dbPagesMap[page.slug];
                  const hasCustom = Boolean(dbRecord?.seoTitle);
                  const displayTitle = dbRecord?.seoTitle || page.defaultTitle;
                  const displayDesc = dbRecord?.seoDescription || page.defaultDescription;

                  return (
                    <tr key={page.slug} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                        {page.label}
                      </td>
                      <td className="px-4 py-3 font-mono text-indigo-600 whitespace-nowrap">
                        <a
                          href={page.fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{page.path}</span>
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-xs truncate" title={displayTitle}>
                        {displayTitle}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-sm truncate" title={displayDesc}>
                        {displayDesc}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          hasCustom ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${hasCustom ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {hasCustom ? 'Customized' : 'Default'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleSelectPage(page.slug)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold transition cursor-pointer"
                        >
                          Edit SEO
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        /* ========================================================================= */
        /* TWO-COLUMN PAGE SEO EDITOR & LIVE GOOGLE PREVIEW                           */
        /* ========================================================================= */
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Left Column: Pages List Selector */}
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-800">
                  Select Page to Edit
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {allPagesList.length} pages
                </span>
              </div>

              {/* Search filter input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter pages..."
                  className="w-full rounded-md border border-slate-200 pl-8 pr-3 py-1.5 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Pages Scrollable List */}
              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                {filteredPages.map(page => {
                  const isSelected = selectedSlug === page.slug;
                  const hasDb = Boolean(dbPagesMap[page.slug]?.seoTitle);

                  return (
                    <button
                      key={page.slug}
                      type="button"
                      onClick={() => handleSelectPage(page.slug)}
                      className={`w-full text-left p-3 rounded-lg border transition cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-500 text-slate-800 ring-1 ring-indigo-500 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-extrabold text-xs text-slate-800 truncate">
                          {page.label}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${hasDb ? 'bg-emerald-500' : 'bg-amber-400'}`}
                          title={hasDb ? 'Customized in database' : 'Default template'}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="truncate">{page.path}</span>
                        {hasDb && <span className="text-[10px] text-emerald-600 font-sans font-bold">Custom</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Editor & Google Search Preview */}
          <div className="space-y-6">
            <form onSubmit={handleSaveSEO} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              {/* Active Page Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-800">
                      {activePageDef.label}
                    </h2>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      dbPagesMap[activePageDef.slug]?.seoTitle ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dbPagesMap[activePageDef.slug]?.seoTitle ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {dbPagesMap[activePageDef.slug]?.seoTitle ? 'Configured in DB' : 'Default Template'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Target URL: <strong className="text-indigo-600">{activePageDef.fullUrl}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={activePageDef.fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View Live</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    title="Reset to recommended defaults"
                    className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>

              {/* LIVE GOOGLE SEARCH APPEARANCE PREVIEW */}
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/30 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Live Google Search Snippet Preview
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-slate-200 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                        previewDevice === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                        previewDevice === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Mobile
                    </button>
                  </div>
                </div>

                {/* Google Search Card Box */}
                <div className="rounded-lg border border-slate-200 bg-white p-4 font-sans shadow-xs max-w-2xl">
                  {/* Google Breadcrumb */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[10px] font-black text-indigo-600 border border-slate-200">
                      J
                    </div>
                    <div className="flex flex-col text-xs leading-tight">
                      <span className="font-medium text-slate-900">JobsWaale</span>
                      <span className="text-[11px] text-slate-500 font-mono truncate">
                        {activePageDef.fullUrl}
                      </span>
                    </div>
                  </div>

                  {/* Google Blue Title */}
                  <h4 className="text-lg text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug line-clamp-1 mb-1">
                    {form.seoTitle || activePageDef.defaultTitle || 'Page Title - JobsWaale'}
                  </h4>

                  {/* Google Snippet Description */}
                  <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                    {form.seoDescription || activePageDef.defaultDescription || 'No description provided. Search engines will generate a snippet from your page content.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span>
                    Google typically displays up to <strong>60 characters</strong> of the title and <strong>160 characters</strong> of the description.
                  </span>
                </div>
              </div>

              {/* INPUT FIELDS */}
              <div className="space-y-5">
                {/* 1. SEO Meta Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      SEO Meta Title (<code className="text-indigo-600">&lt;title&gt;</code>) <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-xs ${getTitleLenColor()}`}>
                      {titleLen} / 60 characters
                      {titleLen >= 40 && titleLen <= 65 && ' (Optimal)'}
                      {titleLen > 65 && ' (May be truncated by Google)'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={form.seoTitle}
                    onChange={(e) => setForm(prev => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder="Enter catchy, keyword-rich page title"
                    className="w-full rounded-md border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    This appears as the main clickable headline in search engine results and on the browser tab bar.
                  </span>
                </div>

                {/* 2. SEO Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      SEO Meta Description (<code className="text-indigo-600">&lt;meta name="description"&gt;</code>)
                    </label>
                    <span className={`text-xs ${getDescLenColor()}`}>
                      {descLen} / 160 characters
                      {descLen >= 120 && descLen <= 165 && ' (Optimal)'}
                      {descLen > 165 && ' (May be truncated)'}
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={form.seoDescription}
                    onChange={(e) => setForm(prev => ({ ...prev, seoDescription: e.target.value }))}
                    placeholder="Briefly summarize what this page offers to attract visitors from search results..."
                    className="w-full rounded-md border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    A compelling 1-2 sentence summary that encourages searchers to click through to your website.
                  </span>
                </div>

                {/* 3. SEO Meta Keywords */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-indigo-600" />
                      <span>SEO Meta Keywords (<code className="text-indigo-600">&lt;meta name="keywords"&gt;</code>)</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={form.seoKeywords}
                    onChange={(e) => setForm(prev => ({ ...prev, seoKeywords: e.target.value }))}
                    placeholder="Comma-separated keywords (e.g. jobs, hiring, india, recruitment)"
                    className="w-full rounded-md border border-slate-200 px-3.5 py-2 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
                  />

                  {/* Render Keyword Badges */}
                  {form.seoKeywords && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {form.seoKeywords.split(',').map((kw, idx) => {
                        const trimmed = kw.trim();
                        if (!trimmed) return null;
                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                          >
                            <span>#{trimmed}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Canonical URL & Robots Meta Settings */}
                <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Canonical Link URL
                    </label>
                    <input
                      type="text"
                      value={form.canonicalUrl}
                      onChange={(e) => setForm(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                      placeholder={activePageDef.fullUrl}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs font-mono text-slate-700 focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Prevents duplicate content penalties across domain variants.
                    </span>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Search Engine Robots Indexing
                    </label>
                    <select
                      value={form.robots}
                      onChange={(e) => setForm(prev => ({ ...prev, robots: e.target.value }))}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs font-medium focus:border-indigo-500 focus:outline-none bg-white"
                    >
                      <option value="index, follow">Index, Follow (Allow search engines to rank this page)</option>
                      <option value="noindex, follow">NoIndex, Follow (Hide page from Google but follow links)</option>
                      <option value="index, nofollow">Index, NoFollow (Rank page but do not follow links)</option>
                      <option value="noindex, nofollow">NoIndex, NoFollow (Completely block search engines)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bottom Submit Controls */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-sm font-extrabold text-white shadow-sm transition cursor-pointer disabled:bg-slate-300"
                >
                  {saving ? <Loader className="h-4 w-4 animate-spin text-white" /> : <Save className="h-4 w-4 text-white" />}
                  <span>{saving ? 'Saving Changes...' : 'Save SEO Changes'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Reset to Default
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom URL Page Modal */}
      {showAddCustomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddCustomModal(false);
          }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-left border border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddCustomModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Plus className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800">
                Add Custom Page URL
              </h3>
            </div>

            <form onSubmit={handleAddCustomPage} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                  Page Display Name *
                </label>
                <input
                  type="text"
                  value={customPageInput.title}
                  onChange={(e) => setCustomPageInput(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Careers, Press Releases"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                  Target URL Slug *
                </label>
                <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono">
                  <span className="text-slate-400 mr-1">https://jobswaale.com/</span>
                  <input
                    type="text"
                    value={customPageInput.slug}
                    onChange={(e) => setCustomPageInput(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="careers"
                    className="w-full bg-transparent text-slate-800 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-extrabold text-white transition cursor-pointer"
                >
                  Configure SEO
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOSettingsPage;
