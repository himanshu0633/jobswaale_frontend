import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Alignment,
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
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
import { BASE_API_URL } from '../context/AuthContext';
import {
  AlertCircle,
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
  CirclePlus,
  ClipboardList,
  Edit2,
  FileText,
  ImagePlus,
  Loader,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  X
} from 'lucide-react';

const defaultContent = '<section style="padding:80px 24px;text-align:center;"><h1>New Page</h1><p>Start editing this CMS page.</p></section>';

const createBlankForm = () => ({
  title: '',
  slug: '',
  parentPage: '',
  published: true,
  featuredImage: '',
  sortingOrder: 10,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  contentHtml: defaultContent,
  projectData: { editor: 'ckeditor', html: defaultContent }
});

const normalizeProjectData = (projectData, html = '') => {
  if (!projectData) return { editor: 'ckeditor', html: html || defaultContent };
  if (typeof projectData === 'string') {
    try {
      return JSON.parse(projectData);
    } catch {
      return { editor: 'ckeditor', html: html || defaultContent };
    }
  }
  return typeof projectData === 'object' && !Array.isArray(projectData) && Object.keys(projectData).length
    ? projectData
    : { editor: 'ckeditor', html: html || defaultContent };
};

const extractContentHtml = (page = {}) => {
  if (page.html) return page.html;
  const projectData = normalizeProjectData(page.projectData);
  if (projectData.editor === 'ckeditor' && projectData.html) return projectData.html;
  return projectData.pages?.[0]?.component || defaultContent;
};

const slugify = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9/-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/\/+/g, '/') || 'home'
);

const statusLabel = (published) => published ? 'Active' : 'Inactive';

export const CMSPages = () => {
  const [view, setView] = useState('list');
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(createBlankForm);
  const [alert, setAlert] = useState({ type: '', text: '' });

  const showAlert = (type, text) => {
    setAlert({ type, text });
    if (type === 'success') setTimeout(() => setAlert({ type: '', text: '' }), 3000);
  };

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_API_URL}/cms/pages`);
      setPages(res.data || []);
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Pages could not be loaded.');
    } finally {
      setLoading(false);
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

  const editorConfig = useMemo(() => ({
    licenseKey: 'GPL',
    plugins: [
      Alignment,
      BlockQuote,
      Bold,
      Essentials,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      Heading,
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
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    },
    link: {
      addTargetToExternalLinks: true
    }
  }), []);

  const openList = () => {
    setView('list');
    setAlert({ type: '', text: '' });
  };

  const handleNew = () => {
    setEditingId(null);
    const next = createBlankForm();
    setForm(next);
    setView('form');
    setAlert({ type: '', text: '' });
  };

  const handleEdit = async (page) => {
    try {
      const res = await axios.get(`${BASE_API_URL}/cms/pages/${page._id}`);
      const data = res.data;
      const contentHtml = extractContentHtml(data);
      const next = {
        title: data.title || '',
        slug: data.slug || '',
        parentPage: data.parentPage?._id || data.parentPage || '',
        published: data.published !== false,
        featuredImage: data.featuredImage || '',
        sortingOrder: data.sortingOrder || 10,
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || '',
        seoKeywords: data.seoKeywords || '',
        contentHtml,
        projectData: normalizeProjectData(data.projectData, contentHtml)
      };
      setEditingId(data._id);
      setForm(next);
      setView('form');
      setAlert({ type: '', text: '' });
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Page could not be opened.');
    }
  };

  const handleDelete = async (page) => {
    if (!window.confirm(`Delete page "${page.title}"?`)) return;
    try {
      await axios.delete(`${BASE_API_URL}/cms/pages/${page._id}`);
      showAlert('success', 'Page deleted successfully.');
      fetchPages();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Page could not be deleted.');
    }
  };

  const handleImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(prev => ({ ...prev, featuredImage: reader.result || '' }));
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showAlert('error', 'Page Title is required.');
      return;
    }

    setSaving(true);
    const contentHtml = form.contentHtml || '';
    const projectData = { editor: 'ckeditor', html: contentHtml };
    const payload = {
      title: form.title.trim(),
      slug: slugify(form.slug || form.title),
      parentPage: form.parentPage || null,
      published: form.published,
      featuredImage: form.featuredImage,
      sortingOrder: Number(form.sortingOrder) || 10,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      seoKeywords: form.seoKeywords,
      projectData,
      html: contentHtml,
      css: ''
    };

    try {
      if (editingId) {
        const res = await axios.put(`${BASE_API_URL}/cms/pages/${editingId}`, payload);
        setForm(prev => ({ ...prev, slug: res.data.slug, projectData }));
      } else {
        const res = await axios.post(`${BASE_API_URL}/cms/pages`, payload);
        setEditingId(res.data._id);
        setForm(prev => ({ ...prev, slug: res.data.slug, projectData }));
      }
      showAlert('success', 'Success! Record added/updated successfully.');
      await fetchPages();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Oops! Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {view === 'list' ? (
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <h1 className="text-base font-extrabold text-slate-800">All CMS Pages</h1>
            <button onClick={handleNew} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-indigo-500">
              <CirclePlus className="h-4 w-4" />
              Add New Page
            </button>
          </div>

          {alert.text && (
            <div className={`mx-6 mt-5 flex items-center gap-2 rounded-md px-4 py-3 text-sm font-semibold ${alert.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {alert.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {alert.text}
            </div>
          )}

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
                <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 rounded border border-slate-200 px-3 py-2 text-sm" />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border border-slate-100 text-left text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="border-r border-slate-100 px-4 py-4">Title</th>
                    <th className="border-r border-slate-100 px-4 py-4">Slug</th>
                    <th className="border-r border-slate-100 px-4 py-4">Parent Page</th>
                    <th className="border-r border-slate-100 px-4 py-4">Status</th>
                    <th className="border-r border-slate-100 px-4 py-4">Sorting Order</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="px-4 py-10 text-center"><Loader className="mx-auto h-5 w-5 animate-spin text-indigo-600" /></td></tr>
                  ) : visiblePages.length === 0 ? (
                    <tr><td colSpan="6" className="px-4 py-10 text-center text-slate-400">No CMS pages found.</td></tr>
                  ) : visiblePages.map((page) => (
                    <tr key={page._id} className="border-t border-slate-100 odd:bg-slate-50/60">
                      <td className="border-r border-slate-100 px-4 py-4 font-semibold text-slate-700">{page.title}</td>
                      <td className="border-r border-slate-100 px-4 py-4 font-mono text-rose-400">/{page.slug === 'home' ? '' : page.slug}</td>
                      <td className="border-r border-slate-100 px-4 py-4">{page.parentPage?.title || '—'}</td>
                      <td className="border-r border-slate-100 px-4 py-4">
                        <span className={`inline-flex rounded px-2 py-1 text-xs font-extrabold text-white ${page.published ? 'bg-emerald-500' : 'bg-amber-400'}`}>
                          {statusLabel(page.published)}
                        </span>
                      </td>
                      <td className="border-r border-slate-100 px-4 py-4">{page.sortingOrder || 10}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleEdit(page)} className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(page)} className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-col gap-3 text-sm font-semibold text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <span>Showing {filteredPages.length ? ((currentPage - 1) * entriesPerPage) + 1 : 0} to {Math.min(currentPage * entriesPerPage, filteredPages.length)} of {filteredPages.length} entries</span>
              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="rounded border border-slate-200 px-3 py-2 disabled:text-slate-300"><ChevronsLeft className="h-4 w-4" /></button>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="rounded border border-slate-200 px-3 py-2 disabled:text-slate-300">‹</button>
                <span className="rounded bg-indigo-600 px-4 py-2 text-white">{currentPage}</span>
                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} className="rounded border border-slate-200 px-3 py-2 disabled:text-slate-300">›</button>
                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)} className="rounded border border-slate-200 px-3 py-2 disabled:text-slate-300"><ChevronsRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h1 className="text-base font-extrabold text-slate-800">{editingId ? 'Edit CMS Page' : 'Add CMS Page'}</h1>
            <button onClick={openList} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-indigo-500">
              <ClipboardList className="h-4 w-4" />
              View Listings
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5 p-6">
            {alert.text && (
              <div className={`flex items-center justify-between rounded-md px-4 py-3 text-sm font-semibold ${alert.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <span className="flex items-center gap-2">
                  {alert.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {alert.text}
                </span>
                <button type="button" onClick={() => setAlert({ type: '', text: '' })}><X className="h-4 w-4" /></button>
              </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
              <div className="space-y-5">
                <div className="rounded bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-700">
                  <FileText className="mr-2 inline h-4 w-4" />
                  Page Details
                </div>

                <div>
                  <label className="mb-2 block text-sm font-extrabold">Page Title <span className="text-rose-500">*</span></label>
                  <input value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value, slug: prev.slug || slugify(e.target.value) }))} placeholder="Title of the CMS Page" className="w-full rounded border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-extrabold">Page Slug (URL) <span className="text-rose-500">*</span></label>
                  <input value={form.slug} onChange={(e) => setForm(prev => ({ ...prev, slug: slugify(e.target.value) }))} placeholder="page-slug-url" className="w-full rounded border border-slate-200 px-3 py-2.5 text-sm" />
                  <p className="mt-1 text-xs font-semibold text-slate-400">Auto-generated from title, but you can edit manually.</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-extrabold">Parent Page</label>
                  <select value={form.parentPage} onChange={(e) => setForm(prev => ({ ...prev, parentPage: e.target.value }))} className="w-full rounded border border-slate-200 px-3 py-2.5 text-sm">
                    <option value="">None (Top Level Page)</option>
                    {pages.filter(page => page._id !== editingId).map(page => (
                      <option key={page._id} value={page._id}>{page.title}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs font-semibold text-slate-400">Select a parent if this page is a sub-page.</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-extrabold">Page Content <span className="text-rose-500">*</span></label>
                  <div className="cms-ckeditor rounded border border-slate-200">
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

                <div className="rounded bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-700">
                  <Search className="mr-2 inline h-4 w-4" />
                  SEO Details
                </div>
                <div>
                  <label className="mb-2 block text-sm font-extrabold">SEO Title</label>
                  <input value={form.seoTitle} onChange={(e) => setForm(prev => ({ ...prev, seoTitle: e.target.value }))} placeholder="Meta SEO Title" className="w-full rounded border border-slate-200 px-3 py-2.5 text-sm" />
                  <p className="mt-1 text-xs font-semibold text-slate-400">Recommended: 50-60 characters for best search results.</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-extrabold">SEO Description</label>
                  <textarea value={form.seoDescription} onChange={(e) => setForm(prev => ({ ...prev, seoDescription: e.target.value }))} placeholder="Meta SEO Description" rows={3} className="w-full rounded border border-slate-200 px-3 py-2.5 text-sm" />
                  <p className="mt-1 text-xs font-semibold text-slate-400">Recommended: 155-160 characters.</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-extrabold">SEO Keywords</label>
                  <input value={form.seoKeywords} onChange={(e) => setForm(prev => ({ ...prev, seoKeywords: e.target.value }))} placeholder="keyword1, keyword2, keyword3" className="w-full rounded border border-slate-200 px-3 py-2.5 text-sm" />
                  <p className="mt-1 text-xs font-semibold text-slate-400">Comma-separated keywords (max 3-7 keywords).</p>
                </div>
              </div>

              <aside className="space-y-5">
                <div className="rounded bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-700">
                  <Settings className="mr-2 inline h-4 w-4" />
                  Other Details
                </div>
                <div>
                  <label className="mb-2 block text-sm font-extrabold">Featured Image/Banner</label>
                  <label className="flex min-h-20 cursor-pointer items-center justify-center rounded border-2 border-dashed border-slate-200 px-4 py-6 text-center text-sm font-semibold text-slate-600">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files?.[0])} />
                    {form.featuredImage ? (
                      <img src={form.featuredImage} alt="Featured preview" className="max-h-28 rounded object-contain" />
                    ) : (
                      <span><ImagePlus className="mx-auto mb-2 h-5 w-5" />Drag & Drop your files or Browse</span>
                    )}
                  </label>
                  <p className="mt-1 text-xs font-semibold text-slate-400">Max 3MB. Recommended size: 1200x400px</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-extrabold">Sorting Order</label>
                  <input type="number" value={form.sortingOrder} onChange={(e) => setForm(prev => ({ ...prev, sortingOrder: e.target.value }))} className="w-full rounded border border-slate-200 px-3 py-2.5 text-sm" />
                  <p className="mt-1 text-xs font-semibold text-slate-400">Use increments (10, 20, 30) for flexibility in reordering.</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-extrabold">Status <span className="text-rose-500">*</span></label>
                  <select value={form.published ? 'active' : 'inactive'} onChange={(e) => setForm(prev => ({ ...prev, published: e.target.value === 'active' }))} className="w-full rounded border border-slate-200 px-3 py-2.5 text-sm">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <p className="mt-1 text-xs font-semibold text-slate-400">Only Active pages will be visible on frontend.</p>
                </div>
                <div className="border-t border-slate-100 pt-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-700"><ShieldCheck className="h-4 w-4" />System Information</h3>
                  <div className="space-y-4 text-xs font-semibold text-slate-400">
                    <p>Created By: Admin User</p>
                    <p>Created Date: {new Date().toLocaleString()}</p>
                    <p>Updated Date: {new Date().toLocaleString()}</p>
                  </div>
                </div>
              </aside>
            </div>

            <div className="flex items-center gap-3">
              <button disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-indigo-500 disabled:bg-slate-300">
                {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Submit
              </button>
              <button type="button" onClick={openList} className="rounded-md bg-amber-400 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-amber-500">
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

export default CMSPages;
