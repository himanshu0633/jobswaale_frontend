import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../../../context/AuthContext';
import {
  LEGAL_DOCS_CONFIG,
  DEFAULT_PRIVACY_POLICY_DOC,
  generateLegalDocumentHtml,
  getFormattedCurrentDate
} from '../../../utils/legalPolicyDefaults';
import {
  Shield,
  FileText,
  Calendar,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ListPlus,
  ChevronDown,
  ChevronUp,
  Check,
  Search,
  Scale
} from 'lucide-react';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const LegalDocumentCMS = ({ pageKey = 'privacy' }) => {
  const config = LEGAL_DOCS_CONFIG[pageKey] || LEGAL_DOCS_CONFIG.privacy;
  const isPrivacy = config.key === 'privacy';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [autoUpdateDateOnSave, setAutoUpdateDateOnSave] = useState(true);

  // Document state
  const [docData, setDocData] = useState(() => {
    return JSON.parse(JSON.stringify(config.defaultDoc || DEFAULT_PRIVACY_POLICY_DOC));
  });

  // Track expanded points for cleaner UX
  const [expandedPoints, setExpandedPoints] = useState({});

  const alertTimerRef = useRef(null);
  const showAlert = (type, text) => {
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setAlert({ type, text });
    alertTimerRef.current = setTimeout(() => {
      setAlert({ type: '', text: '' });
    }, 6000);
  };

  // Fetch page from backend
  const fetchPage = async () => {
    setLoading(true);
    setAlert({ type: '', text: '' });
    try {
      const res = await axios.get(`${BASE_API_URL}/cms/pages/by-slug/${config.slug}`, {
        headers: getAuthHeaders()
      });

      if (res.data) {
        const p = res.data;
        const projectData = p.projectData || {};

        // If backend already has structured legal document
        if (projectData.clauses && Array.isArray(projectData.clauses) && projectData.clauses.length > 0) {
          setDocData({
            title: p.title || config.defaultDoc.title,
            slug: p.slug || config.slug,
            publicUrl: config.publicUrl,
            lastUpdated: projectData.lastUpdated || (p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : config.defaultDoc.lastUpdated),
            introText: projectData.introText !== undefined ? projectData.introText : config.defaultDoc.introText,
            clauses: projectData.clauses
          });
        } else {
          // Fallback to rich default doc, maintaining the title & updatedAt
          setDocData({
            ...JSON.parse(JSON.stringify(config.defaultDoc)),
            title: p.title || config.defaultDoc.title,
            lastUpdated: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : config.defaultDoc.lastUpdated
          });
        }
      }
    } catch (err) {
      // If page doesn't exist yet in DB (404), smoothly use the default template without aggressive red warnings
      setDocData(JSON.parse(JSON.stringify(config.defaultDoc)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [pageKey]);

  // Set default all expanded
  useEffect(() => {
    if (docData?.clauses) {
      const map = {};
      docData.clauses.forEach((c) => {
        map[c.id] = true;
      });
      setExpandedPoints(map);
    }
  }, [docData?.clauses?.length]);

  // Update Page Header Info
  const handleHeaderChange = (field, value) => {
    setDocData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Set today's date
  const handleSetTodayDate = () => {
    const today = getFormattedCurrentDate();
    handleHeaderChange('lastUpdated', today);
    showAlert('success', `Last Updated date set to: "${today}"`);
  };

  // Clauses operations
  const handleClauseChange = (clauseId, field, value) => {
    setDocData(prev => ({
      ...prev,
      clauses: prev.clauses.map(c => c.id === clauseId ? { ...c, [field]: value } : c)
    }));
  };

  // Add new clause
  const handleAddClause = () => {
    const nextNumber = (docData.clauses?.length || 0) + 1;
    const newClause = {
      id: `clause-${Date.now()}`,
      title: `${nextNumber}. New Clause / Point Heading`,
      description: '',
      items: []
    };

    setDocData(prev => ({
      ...prev,
      clauses: [...prev.clauses, newClause]
    }));

    setExpandedPoints(prev => ({ ...prev, [newClause.id]: true }));
    showAlert('success', `Added new point #${nextNumber}. Scroll down to fill details.`);
  };

  // Move clause up
  const handleMoveUp = (index) => {
    if (index === 0) return;
    setDocData(prev => {
      const newClauses = [...prev.clauses];
      const temp = newClauses[index - 1];
      newClauses[index - 1] = newClauses[index];
      newClauses[index] = temp;
      return { ...prev, clauses: newClauses };
    });
  };

  // Move clause down
  const handleMoveDown = (index) => {
    if (index >= docData.clauses.length - 1) return;
    setDocData(prev => {
      const newClauses = [...prev.clauses];
      const temp = newClauses[index + 1];
      newClauses[index + 1] = newClauses[index];
      newClauses[index] = temp;
      return { ...prev, clauses: newClauses };
    });
  };

  // Delete clause
  const handleDeleteClause = (clauseId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title || 'this point'}"?`)) return;
    setDocData(prev => ({
      ...prev,
      clauses: prev.clauses.filter(c => c.id !== clauseId)
    }));
    showAlert('success', 'Point deleted successfully.');
  };

  // Bullet items operations
  const handleAddBulletItem = (clauseId) => {
    setDocData(prev => ({
      ...prev,
      clauses: prev.clauses.map(c => {
        if (c.id === clauseId) {
          const items = Array.isArray(c.items) ? [...c.items] : [];
          items.push({ label: '', text: '' });
          return { ...c, items };
        }
        return c;
      })
    }));
  };

  const handleBulletItemChange = (clauseId, itemIndex, field, value) => {
    setDocData(prev => ({
      ...prev,
      clauses: prev.clauses.map(c => {
        if (c.id === clauseId) {
          const items = [...c.items];
          items[itemIndex] = {
            ...items[itemIndex],
            [field]: value
          };
          return { ...c, items };
        }
        return c;
      })
    }));
  };

  const handleDeleteBulletItem = (clauseId, itemIndex) => {
    setDocData(prev => ({
      ...prev,
      clauses: prev.clauses.map(c => {
        if (c.id === clauseId) {
          const items = c.items.filter((_, idx) => idx !== itemIndex);
          return { ...c, items };
        }
        return c;
      })
    }));
  };

  // Toggle point expand/collapse
  const togglePointExpand = (clauseId) => {
    setExpandedPoints(prev => ({
      ...prev,
      [clauseId]: !prev[clauseId]
    }));
  };

  // Reset to default template
  const handleResetToDefault = () => {
    if (!window.confirm(`Reset "${config.pageName}" to the original 11 standard default points? Any unsaved edits will be lost.`)) return;
    setDocData(JSON.parse(JSON.stringify(config.defaultDoc)));
    showAlert('success', `Reset to default ${config.pageName} template. Click "Save & Publish" to commit.`);
  };

  // Save to Backend
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setAlert({ type: '', text: '' });

    try {
      const updatedDate = autoUpdateDateOnSave ? getFormattedCurrentDate() : (docData.lastUpdated || getFormattedCurrentDate());
      const currentDoc = {
        ...docData,
        lastUpdated: updatedDate
      };

      const generatedHtml = generateLegalDocumentHtml(currentDoc);

      const payload = {
        title: currentDoc.title || config.pageName,
        slug: config.slug,
        html: generatedHtml,
        published: true,
        projectData: {
          pageType: 'legal-document',
          lastUpdated: updatedDate,
          introText: currentDoc.introText || '',
          clauses: currentDoc.clauses || []
        }
      };

      await axios.put(
        `${BASE_API_URL}/cms/pages/by-slug/${config.slug}`,
        payload,
        { headers: getAuthHeaders() }
      );

      setDocData(currentDoc);
      showAlert('success', `"${config.pageName}" successfully saved & published! Updated date: ${updatedDate}`);
    } catch (err) {
      console.error('Save legal doc error:', err);
      showAlert('error', err.response?.data?.message || `Failed to save ${config.pageName}. Please check your connection.`);
    } finally {
      setSaving(false);
    }
  };

  // Filter clauses by search
  const filteredClauses = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return docData.clauses || [];
    return (docData.clauses || []).filter(c => (
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      (Array.isArray(c.items) && c.items.some(it => (it.label?.toLowerCase().includes(q) || it.text?.toLowerCase().includes(q))))
    ));
  }, [docData.clauses, searchTerm]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0047C7] mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading {config.pageName} Content...</p>
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
            {isPrivacy ? <Shield className="w-6 h-6" /> : <Scale className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {config.pageName} Editor
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Points &amp; List Format
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Easily add, edit or remove points, bullet lists, and manage the last updated date.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href={config.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            View Live Page
          </a>

          <button
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition shadow-xs"
            title="Reset to standard default template"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            Reset Template
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

      {/* Main Document Settings Card (Title, Last Updated Date, Intro Paragraph) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0047C7]" />
            Page Header &amp; Update Date
          </h2>
          <span className="text-xs text-slate-400">Header info visible at the top of the policy page</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Page Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Page Heading / Title *
            </label>
            <input
              type="text"
              value={docData.title || ''}
              onChange={(e) => handleHeaderChange('title', e.target.value)}
              placeholder="e.g. Privacy Policy"
              className="w-full px-4 py-2.5 text-sm font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0047C7]/20 focus:border-[#0047C7] outline-none"
            />
          </div>

          {/* Last Updated Date */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Last Updated Date *
              </label>
              <button
                type="button"
                onClick={handleSetTodayDate}
                className="text-xs font-semibold text-[#0047C7] hover:underline flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                Set Today's Date
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={docData.lastUpdated || ''}
                onChange={(e) => handleHeaderChange('lastUpdated', e.target.value)}
                placeholder="e.g. October 8, 2026 or June 24, 2026"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0047C7]/20 focus:border-[#0047C7] outline-none"
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-slate-400">
                Shown as: <em>Last Updated: {docData.lastUpdated || 'Not set'}</em>
              </span>
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={autoUpdateDateOnSave}
                  onChange={(e) => setAutoUpdateDateOnSave(e.target.checked)}
                  className="rounded text-[#0047C7] focus:ring-[#0047C7] w-3.5 h-3.5"
                />
                Auto-update on Save
              </label>
            </div>
          </div>
        </div>

        {/* Intro Paragraph */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Introductory Paragraph
          </label>
          <textarea
            rows={3}
            value={docData.introText || ''}
            onChange={(e) => handleHeaderChange('introText', e.target.value)}
            placeholder="Welcome to JobsWaale. We are committed to protecting your personal information..."
            className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0047C7]/20 focus:border-[#0047C7] outline-none resize-y"
          />
          <p className="text-xs text-slate-400 mt-1">
            This introductory paragraph is displayed right above Point #1.
          </p>
        </div>
      </div>

      {/* Points & Clauses List Section */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-[#0047C7] font-bold text-sm flex items-center justify-center">
              {docData.clauses?.length || 0}
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Points &amp; Clauses List
              </h2>
              <p className="text-xs text-slate-500">
                Each point has a heading, paragraph text, and optional bullet points.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick search filter */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search points..."
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0047C7] w-40 sm:w-52"
              />
            </div>

            <button
              onClick={handleAddClause}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0047C7] rounded-xl hover:bg-[#003cb0] transition shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add New Point
            </button>
          </div>
        </div>

        {/* Clauses List */}
        {filteredClauses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <p className="text-slate-500 text-sm">
              {searchTerm ? `No points match "${searchTerm}".` : 'No points in this document yet.'}
            </p>
            <button
              onClick={handleAddClause}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0047C7] bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition"
            >
              <Plus className="w-4 h-4" />
              Add First Point
            </button>
          </div>
        ) : (
          filteredClauses.map((clause, index) => {
            const isExpanded = expandedPoints[clause.id] !== false;
            const itemsCount = clause.items?.length || 0;

            return (
              <div
                key={clause.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-xs transition-all overflow-hidden hover:border-slate-300"
              >
                {/* Clause Header Bar */}
                <div
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-slate-50/70 border-b border-slate-100 cursor-pointer select-none"
                  onClick={() => togglePointExpand(clause.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-[#0047C7] border border-blue-200 shrink-0">
                      #{index + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 truncate">
                      {clause.title || 'Untitled Point'}
                    </h3>
                    {itemsCount > 0 && (
                      <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {itemsCount} bullet {itemsCount === 1 ? 'item' : 'items'}
                      </span>
                    )}
                  </div>

                  {/* Header Actions */}
                  <div
                    className="flex items-center gap-1 sm:gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 rounded-lg hover:bg-slate-200/60 transition"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index >= docData.clauses.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 rounded-lg hover:bg-slate-200/60 transition"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClause(clause.id, clause.title)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition"
                      title="Delete Point"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePointExpand(clause.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition ml-1"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Clause Body Form */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-5">
                    {/* Heading / Title */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Point Heading / Title *
                      </label>
                      <input
                        type="text"
                        value={clause.title || ''}
                        onChange={(e) => handleClauseChange(clause.id, 'title', e.target.value)}
                        placeholder="e.g. 1. Information We Collect"
                        className="w-full px-4 py-2.5 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0047C7]/20 focus:border-[#0047C7] outline-none"
                      />
                    </div>

                    {/* Description Paragraph */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Description / Text Under Heading
                      </label>
                      <textarea
                        rows={3}
                        value={clause.description || ''}
                        onChange={(e) => handleClauseChange(clause.id, 'description', e.target.value)}
                        placeholder="Enter the main explanation text for this section..."
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0047C7]/20 focus:border-[#0047C7] outline-none resize-y"
                      />
                    </div>

                    {/* Bullet Points / List Items */}
                    <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <ListPlus className="w-3.5 h-3.5 text-[#0047C7]" />
                            Bullet Points / List Items ({itemsCount})
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Optional. Add bullets for sub-points, key details, or contact items.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddBulletItem(clause.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0047C7] bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Bullet
                        </button>
                      </div>

                      {/* Items List */}
                      {itemsCount === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400 bg-white/70 border border-dashed border-slate-200 rounded-lg">
                          No bullet points for this section. Click "+ Add Bullet" if you need sub-items or lists.
                        </div>
                      ) : (
                        <div className="space-y-2.5 pt-1">
                          {clause.items.map((item, itemIdx) => {
                            const labelVal = typeof item === 'object' ? item.label : '';
                            const textVal = typeof item === 'object' ? item.text : item;

                            return (
                              <div
                                key={itemIdx}
                                className="flex items-start gap-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs"
                              >
                                <span className="text-slate-400 text-sm mt-2 select-none px-1 font-bold">•</span>

                                {/* Optional Bold Prefix/Label */}
                                <div className="w-1/3 min-w-[130px]">
                                  <input
                                    type="text"
                                    value={labelVal}
                                    onChange={(e) => handleBulletItemChange(clause.id, itemIdx, 'label', e.target.value)}
                                    placeholder="Bold Prefix (e.g. Email:)"
                                    className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg focus:border-[#0047C7] outline-none"
                                  />
                                </div>

                                {/* Text/Detail */}
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={textVal}
                                    onChange={(e) => handleBulletItemChange(clause.id, itemIdx, 'text', e.target.value)}
                                    placeholder="Bullet point description or details..."
                                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-[#0047C7] outline-none"
                                  />
                                </div>

                                {/* Remove item */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBulletItem(clause.id, itemIdx)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition shrink-0"
                                  title="Delete Bullet"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Large Add Point Button at bottom */}
        <button
          type="button"
          onClick={handleAddClause}
          className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-[#0047C7] rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#0047C7] bg-white hover:bg-blue-50/30 transition shadow-xs"
        >
          <Plus className="w-5 h-5 text-[#0047C7]" />
          Add New Point / Section
        </button>
      </div>

      {/* Floating / Sticky Save Footer */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>
            {docData.clauses?.length || 0} points configured. Last updated date is set to: <strong className="text-slate-700">{docData.lastUpdated || 'Today'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={config.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-slate-600 hover:text-[#0047C7] flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview Live
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

export default LegalDocumentCMS;
