import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Alignment,
  AutoImage,
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  FileRepository,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  Image,
  ImageCaption,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  MediaEmbed,
  Paragraph,
  SourceEditing,
  Strikethrough,
  Table,
  TableToolbar,
  Underline
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { BASE_API_URL } from '../../../context/AuthContext';
import { resolveCmsImageUrl, getPageBanners } from '../../../utils/cmsHelper';
import {
  AlertCircle,
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
  CirclePlus,
  Edit2,
  ExternalLink,
  FileText,
  Loader,
  Save,
  Search,
  Trash2,
  Upload,
  X
} from 'lucide-react';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

class CMSUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then((file) => {
      return new Promise((resolve, reject) => {
        if (!file) return reject('No file selected.');

        if (file.size > 5 * 1024 * 1024) {
          return reject('Image size cannot exceed 5 MB.');
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          return reject('Only JPG, PNG, GIF, and WEBP images are allowed.');
        }

        const formData = new FormData();
        formData.append('image', file);

        axios.post(`${BASE_API_URL}/cms/upload-image`, formData, {
          headers: getAuthHeaders()
        })
          .then((response) => {
            const data = response.data;
            const url = resolveCmsImageUrl(data.imageUrl || data.url || data.default);
            if (url) {
              resolve({ default: url });
            } else {
              reject(data.message || 'Image upload failed.');
            }
          })
          .catch((err) => {
            reject(err.response?.data?.message || err.message || 'Image upload failed.');
          });
      });
    });
  }

  abort() {}
}

function CMSUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new CMSUploadAdapter(loader);
  };
}

const defaultNewPageContent = '<section><h2>New Page</h2><p>Start writing your page content here...</p></section>';

const createBlankForm = () => ({
  title: '',
  slug: '',
  parentPage: '',
  published: true,
  featuredImage: '',
  bannerImage: '',
  banners: [],
  sections: [],
  sortingOrder: 10,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  contentHtml: defaultNewPageContent,
  projectData: { editor: 'ckeditor', html: defaultNewPageContent }
});

const slugify = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9/-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/\/+/g, '/') || 'page'
);

const statusLabel = (published) => published ? 'Active' : 'Inactive';

export const CustomPages = () => {
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(createBlankForm);
  const [alert, setAlert] = useState({ type: '', text: '' });

  // Centered Success Notification Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState({ title: '', message: '', url: '' });

  const showAlert = (type, text) => {
    setAlert({ type, text });
    if (type === 'success') {
      setTimeout(() => setAlert({ type: '', text: '' }), 4000);
    }
  };

  const fetchPages = async () => {
    setLoadingPages(true);
    try {
      const res = await axios.get(`${BASE_API_URL}/cms/pages`, {
        headers: getAuthHeaders()
      });
      setPages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load custom pages:', err);
      showAlert('error', 'Could not fetch pages list.');
    } finally {
      setLoadingPages(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const filteredPages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(page => (
      page.title?.toLowerCase().includes(q) ||
      page.slug?.toLowerCase().includes(q) ||
      page.parentPage?.title?.toLowerCase().includes(q)
    ));
  }, [pages, search]);

  const totalPages = Math.max(1, Math.ceil(filteredPages.length / entriesPerPage));
  const visiblePages = filteredPages.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const handleNewCustomPage = () => {
    setEditingId(null);
    const next = createBlankForm();
    next.sortingOrder = pages.length ? (Math.max(...pages.map(p => Number(p.sortingOrder) || 10)) + 1) : 10;
    setForm(next);
    setView('form');
    setAlert({ type: '', text: '' });
  };

  const handleEditCustomPage = async (page) => {
    try {
      const res = await axios.get(`${BASE_API_URL}/cms/pages/${page._id}`, {
        headers: getAuthHeaders()
      });
      const data = res.data;
      const bannersList = getPageBanners(data);
      const primaryBanner = bannersList[0]?.rawUrl || data.featuredImage || data.bannerImage || '';
      setEditingId(data._id);
      setForm({
        title: data.title || '',
        slug: data.slug || '',
        parentPage: data.parentPage?._id || data.parentPage || '',
        published: data.published !== false,
        featuredImage: primaryBanner,
        bannerImage: primaryBanner,
        banners: bannersList,
        sections: Array.isArray(data.sections) ? data.sections : [],
        sortingOrder: data.sortingOrder || 10,
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || '',
        seoKeywords: data.seoKeywords || '',
        contentHtml: data.html || defaultNewPageContent,
        projectData: data.projectData || { editor: 'ckeditor', html: data.html || defaultNewPageContent }
      });
      setView('form');
      setAlert({ type: '', text: '' });
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Page could not be opened.');
    }
  };

  const handleDeleteCustomPage = async (page) => {
    if (!window.confirm(`Delete page "${page.title}"?`)) return;
    try {
      await axios.delete(`${BASE_API_URL}/cms/pages/${page._id}`, {
        headers: getAuthHeaders()
      });
      showAlert('success', 'Page deleted successfully.');
      fetchPages();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Page could not be deleted.');
    }
  };

  const handleSaveCustomPage = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showAlert('error', 'Page Title is required.');
      return;
    }

    setSaving(true);
    const contentHtml = form.contentHtml || '';
    const bannersToSend = (form.banners || []).map(b => ({
      url: b.rawUrl || b.url,
      position: b.position || 'top-center',
      title: b.title || '',
      alt: b.alt || ''
    }));
    const primaryBanner = bannersToSend[0]?.url || form.featuredImage || form.bannerImage || '';
    const payload = {
      title: form.title.trim(),
      slug: slugify(form.slug || form.title),
      parentPage: form.parentPage || null,
      published: form.published,
      featuredImage: primaryBanner,
      bannerImage: primaryBanner,
      banners: bannersToSend,
      sections: form.sections || [],
      sortingOrder: Number(form.sortingOrder) || 10,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      seoKeywords: form.seoKeywords,
      projectData: { editor: 'ckeditor', html: contentHtml },
      html: contentHtml,
      css: ''
    };

    try {
      let savedSlug = '';
      if (editingId) {
        const res = await axios.put(`${BASE_API_URL}/cms/pages/${editingId}`, payload, {
          headers: getAuthHeaders()
        });
        savedSlug = res.data.slug;
        setForm(prev => ({ ...prev, slug: res.data.slug }));
      } else {
        const res = await axios.post(`${BASE_API_URL}/cms/pages`, payload, {
          headers: getAuthHeaders()
        });
        savedSlug = res.data.slug;
        setEditingId(res.data._id);
        setForm(prev => ({ ...prev, slug: res.data.slug }));
      }

      setSuccessModalData({
        title: `Page "${form.title}" Saved Successfully!`,
        message: 'Custom CMS page content and settings have been saved and updated live.',
        url: `/${savedSlug}`
      });
      setShowSuccessModal(true);
      await fetchPages();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Could not save page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCustomPageImageUpload = async (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showAlert('error', 'Only JPG, PNG, GIF, and WEBP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert('error', 'Image cannot exceed 5 MB limit.');
      return;
    }

    setUploadingBanner(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${BASE_API_URL}/cms/upload-image`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      const uploadedUrl = res.data?.imageUrl || res.data?.url || res.data?.default;
      setForm(prev => {
        const nextBanners = [{
          rawUrl: uploadedUrl,
          url: resolveCmsImageUrl(uploadedUrl),
          position: 'top-center',
          title: '',
          alt: ''
        }];
        return {
          ...prev,
          featuredImage: uploadedUrl,
          bannerImage: uploadedUrl,
          banners: nextBanners
        };
      });
      showAlert('success', 'Banner image uploaded successfully!');
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message || 'Image upload failed.');
    } finally {
      setUploadingBanner(false);
    }
  };

  // CKEditor 5 configuration
  const editorConfig = useMemo(() => ({
    licenseKey: 'GPL',
    plugins: [
      Alignment,
      AutoImage,
      BlockQuote,
      Bold,
      Essentials,
      FileRepository,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      Heading,
      Image,
      ImageCaption,
      ImageInsert,
      ImageResize,
      ImageStyle,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      List,
      MediaEmbed,
      Paragraph,
      SourceEditing,
      Strikethrough,
      Table,
      TableToolbar,
      Underline,
      CMSUploadAdapterPlugin
    ],
    toolbar: {
      items: [
        'heading',
        '|',
        'fontFamily',
        'fontSize',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'alignment',
        'bulletedList',
        'numberedList',
        'outdent',
        'indent',
        '|',
        'link',
        'insertImage',
        'blockQuote',
        'insertTable',
        'mediaEmbed',
        '|',
        'sourceEditing',
        'undo',
        'redo'
      ],
      shouldNotGroupWhenFull: true
    },
    image: {
      toolbar: [
        'imageTextAlternative',
        'toggleImageCaption',
        '|',
        'imageStyle:inline',
        'imageStyle:wrapText',
        'imageStyle:breakText',
        '|',
        'resizeImage'
      ]
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    },
    link: {
      addTargetToExternalLinks: true
    }
  }), []);

  return (
    <div className="space-y-6">
      {/* Top Header (No page tabs! Direct page view) */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <FileText className="h-6 w-6 text-indigo-600" />
              Custom CMS Pages Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create and manage custom website pages, rich content, layouts, and SEO configurations.
            </p>
          </div>
          {view === 'list' && (
            <button
              onClick={handleNewCustomPage}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-indigo-500 transition cursor-pointer"
            >
              <CirclePlus className="h-4 w-4" />
              Add New Custom Page
            </button>
          )}
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
          <button type="button" onClick={() => setAlert({ type: '', text: '' })} title="Dismiss" aria-label="Dismiss">
            <X className="h-4 w-4 opacity-70 hover:opacity-100 cursor-pointer" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {view === 'list' ? (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-base font-extrabold text-slate-800">
              All Custom Pages ({pages.length})
            </h2>
          </div>

          <div className="px-6 py-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                entries per page
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                Search:
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, slug..."
                  className="w-56 rounded border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border border-slate-100 text-left text-sm">
                <thead className="bg-slate-50 font-bold text-slate-700">
                  <tr>
                    <th className="border-r border-slate-100 px-4 py-3.5">Title</th>
                    <th className="border-r border-slate-100 px-4 py-3.5">Slug</th>
                    <th className="border-r border-slate-100 px-4 py-3.5">Parent Page</th>
                    <th className="border-r border-slate-100 px-4 py-3.5">Status</th>
                    <th className="border-r border-slate-100 px-4 py-3.5">Order</th>
                    <th className="px-4 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPages ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center">
                        <Loader className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
                      </td>
                    </tr>
                  ) : visiblePages.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center text-slate-400">
                        No custom pages found.
                      </td>
                    </tr>
                  ) : (
                    visiblePages.map((page) => (
                      <tr key={page._id} className="border-t border-slate-100 odd:bg-slate-50/60 hover:bg-indigo-50/30 transition">
                        <td className="border-r border-slate-100 px-4 py-3.5 font-semibold text-slate-800">
                          {page.title}
                        </td>
                        <td className="border-r border-slate-100 px-4 py-3.5 font-mono text-xs text-rose-500">
                          /{page.slug === 'home' ? '' : page.slug}
                        </td>
                        <td className="border-r border-slate-100 px-4 py-3.5 text-slate-500">
                          {page.parentPage?.title || '—'}
                        </td>
                        <td className="border-r border-slate-100 px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                            page.published !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${page.published !== false ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {statusLabel(page.published !== false)}
                          </span>
                        </td>
                        <td className="border-r border-slate-100 px-4 py-3.5 font-mono text-xs text-slate-500">
                          {page.sortingOrder || 10}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={`/${page.slug === 'home' ? '' : page.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View Live"
                              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => handleEditCustomPage(page)}
                              title="Edit"
                              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomPage(page)}
                              title="Delete"
                              className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
              <span>
                Showing {filteredPages.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to{' '}
                {Math.min(currentPage * entriesPerPage, filteredPages.length)} of {filteredPages.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="rounded border border-slate-200 px-2.5 py-1 disabled:opacity-50 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="rounded border border-slate-200 px-2.5 py-1 disabled:opacity-50 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronsRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Custom Page Form */
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
            <h2 className="text-base font-extrabold text-slate-800">
              {editingId ? `Edit Custom Page` : 'Add New Custom Page'}
            </h2>
            <button
              type="button"
              onClick={() => setView('list')}
              className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Back to List
            </button>
          </div>

          <form onSubmit={handleSaveCustomPage} className="space-y-6 p-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-extrabold">Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Page Title"
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-extrabold">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="Leave blank to auto-generate from title"
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-extrabold">Parent Page</label>
                  <select
                    value={form.parentPage}
                    onChange={(e) => setForm(prev => ({ ...prev, parentPage: e.target.value }))}
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">None</option>
                    {pages.filter(p => p._id !== editingId).map(p => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-extrabold">Page Content (CKEditor 5) *</label>
                  <div className="cms-ckeditor rounded border border-slate-200 overflow-hidden shadow-sm">
                    <CKEditor
                      editor={ClassicEditor}
                      config={editorConfig}
                      data={form.contentHtml}
                      onChange={(_, editor) => {
                        const html = editor.getData();
                        setForm(prev => ({ ...prev, contentHtml: html }));
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Sidebar Settings in Form */}
              <div className="space-y-4">
                <div className="rounded border border-slate-200 p-4">
                  <h3 className="mb-2 font-bold text-sm">Publishing Status</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) => setForm(prev => ({ ...prev, published: e.target.checked }))}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-semibold">Published (Active on site)</span>
                  </label>
                </div>

                <div className="rounded border border-slate-200 p-4">
                  <h3 className="mb-2 font-bold text-sm">Featured / Banner Image</h3>
                  {form.featuredImage ? (
                    <div className="mb-2">
                      <img
                        src={resolveCmsImageUrl(form.featuredImage)}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded border border-slate-200"
                      />
                    </div>
                  ) : null}
                  <label className="inline-flex items-center gap-1.5 rounded bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploadingBanner ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleCustomPageImageUpload(e.target.files?.[0])}
                      disabled={uploadingBanner}
                    />
                  </label>
                </div>

                <div className="rounded border border-slate-200 p-4">
                  <h3 className="mb-2 font-bold text-sm">Sorting Order</h3>
                  <input
                    type="number"
                    value={form.sortingOrder}
                    onChange={(e) => setForm(prev => ({ ...prev, sortingOrder: Number(e.target.value) || 0 }))}
                    className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>

                <div className="rounded border border-slate-200 p-4 space-y-2">
                  <h3 className="font-bold text-sm">SEO Meta Fields</h3>
                  <div>
                    <label className="mb-0.5 block text-xs font-semibold text-slate-600">SEO Title</label>
                    <input
                      value={form.seoTitle}
                      onChange={(e) => setForm(prev => ({ ...prev, seoTitle: e.target.value }))}
                      className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-xs font-semibold text-slate-600">SEO Description</label>
                    <textarea
                      value={form.seoDescription}
                      onChange={(e) => setForm(prev => ({ ...prev, seoDescription: e.target.value }))}
                      rows={2}
                      className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-xs font-semibold text-slate-600">SEO Keywords</label>
                    <input
                      value={form.seoKeywords}
                      onChange={(e) => setForm(prev => ({ ...prev, seoKeywords: e.target.value }))}
                      className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-extrabold text-white hover:bg-indigo-500 disabled:bg-slate-300 cursor-pointer shadow"
              >
                {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Custom Page'}
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Success Notification Modal */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSuccessModal(false);
          }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-center border border-slate-100 transform transition-all scale-100">
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9 stroke-[2.3]" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-800 mb-2">
              {successModalData.title || 'Saved Successfully!'}
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {successModalData.message || 'Page content and settings have been saved.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setView('list');
                }}
                className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm transition cursor-pointer"
              >
                Back to Listing
              </button>

              {successModalData.url && (
                <a
                  href={successModalData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Live</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomPages;
