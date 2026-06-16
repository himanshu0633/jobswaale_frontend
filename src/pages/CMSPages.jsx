import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { BASE_API_URL } from '../context/AuthContext';
import { AlertCircle, CheckCircle2, Edit2, FileText, Loader, Plus, Save, Trash2 } from 'lucide-react';

const createEmptyProject = () => ({
  pages: [{
    component: '<section style="padding:80px 24px;text-align:center;"><h1>New Page</h1><p>Start editing this CMS page.</p></section>'
  }],
  styles: []
});

const normalizeProjectData = (projectData) => {
  if (!projectData) return createEmptyProject();

  if (typeof projectData === 'string') {
    try {
      return JSON.parse(projectData);
    } catch {
      return createEmptyProject();
    }
  }

  if (typeof projectData !== 'object' || Array.isArray(projectData)) {
    return createEmptyProject();
  }

  return Object.keys(projectData).length ? projectData : createEmptyProject();
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

export const CMSPages = () => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const blockContainerRef = useRef(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', published: true, projectData: createEmptyProject() });
  const [alert, setAlert] = useState({ type: '', text: '' });

  const showAlert = (type, text) => {
    setAlert({ type, text });
    if (type === 'success') setTimeout(() => setAlert({ type: '', text: '' }), 2500);
  };

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_API_URL}/cms/pages`);
      setPages(res.data || []);
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Pages load nahi ho paye.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !blockContainerRef.current || editorRef.current) return;

    editorRef.current = grapesjs.init({
      container: containerRef.current,
      height: '620px',
      storageManager: false,
      fromElement: false,
      canvas: {
        styles: [
          'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
        ]
      },
      blockManager: {
        appendTo: blockContainerRef.current,
        blocks: [
          {
            id: 'section',
            label: 'Section',
            content: '<section style="padding:64px 24px;"><h2>Section title</h2><p>Write your content here.</p></section>'
          },
          {
            id: 'hero',
            label: 'Hero',
            content: '<section style="padding:96px 24px;background:#0f172a;color:white;text-align:center;"><h1>Your headline</h1><p>Supporting copy for this page.</p><a href="/contact-us" style="display:inline-block;margin-top:16px;color:white;border:1px solid white;padding:10px 18px;text-decoration:none;">Contact</a></section>'
          },
          {
            id: 'grid',
            label: 'Grid',
            content: '<section style="padding:56px 24px;"><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;"><div><h3>One</h3><p>Detail</p></div><div><h3>Two</h3><p>Detail</p></div><div><h3>Three</h3><p>Detail</p></div></div></section>'
          },
          {
            id: 'button',
            label: 'Button',
            content: '<a href="#" style="display:inline-block;background:#4f46e5;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;">Button</a>'
          }
        ]
      }
    });

    editorRef.current.loadProjectData(normalizeProjectData(form.projectData));
    editorRef.current.refresh();

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []);

  const loadProject = (projectData) => {
    if (!editorRef.current) return;
    editorRef.current.loadProjectData(normalizeProjectData(projectData));
    editorRef.current.refresh();
  };

  const handleNew = () => {
    setEditingId(null);
    const next = { title: '', slug: '', published: true, projectData: createEmptyProject() };
    setForm(next);
    loadProject(next.projectData);
    setAlert({ type: '', text: '' });
  };

  const handleEdit = async (page) => {
    try {
      const res = await axios.get(`${BASE_API_URL}/cms/pages/${page._id}`);
      const data = res.data;
      setEditingId(data._id);
      setForm({
        title: data.title || '',
        slug: data.slug || '',
        published: data.published !== false,
        projectData: normalizeProjectData(data.projectData)
      });
      loadProject(data.projectData);
      setAlert({ type: '', text: '' });
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Page open nahi ho paya.');
    }
  };

  const handleDelete = async (page) => {
    if (!window.confirm(`Delete page "${page.title}"?`)) return;
    try {
      await axios.delete(`${BASE_API_URL}/cms/pages/${page._id}`);
      showAlert('success', 'Page deleted successfully.');
      fetchPages();
      if (editingId === page._id) handleNew();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Page delete nahi ho paya.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showAlert('error', 'Title required hai.');
      return;
    }
    if (!editorRef.current) return;

    setSaving(true);
    const projectData = editorRef.current.getProjectData();
    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();
    const payload = {
      title: form.title.trim(),
      slug: slugify(form.slug || form.title),
      published: form.published,
      projectData,
      html,
      css
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
      showAlert('success', 'Page structure, HTML aur CSS save ho gaya.');
      fetchPages();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Page save nahi ho paya.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">CMS Pages</h1>
          <p className="text-sm text-slate-500">GrapesJS projectData, generated HTML aur CSS ek saath save honge.</p>
        </div>
        <button onClick={handleNew} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" />
          New Page
        </button>
      </div>

      {alert.text && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
          {alert.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {alert.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-5">
        <aside className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 font-bold text-sm text-slate-800">Pages</div>
          <div className="max-h-[720px] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 flex justify-center"><Loader className="w-5 h-5 animate-spin text-indigo-600" /></div>
            ) : pages.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">No CMS pages.</div>
            ) : pages.map(page => (
              <div key={page._id} className={`p-4 ${editingId === page._id ? 'bg-indigo-50/50' : 'bg-white'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-slate-800 truncate">{page.title}</div>
                    <div className="text-xs text-slate-500 truncate">/{page.slug === 'home' ? '' : page.slug}</div>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[11px] font-bold ${page.published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {page.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(page)} className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(page)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <form onSubmit={handleSave} className="p-4 border-b border-slate-100 grid grid-cols-1 lg:grid-cols-[1fr_220px_auto_auto] gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" placeholder="About Us" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" placeholder="about-us" />
            </div>
            <label className="flex items-center gap-2 mt-5 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="text-indigo-600" />
              Published
            </label>
            <button disabled={saving} className="mt-4 lg:mt-5 inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white rounded-lg text-sm font-semibold">
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)]">
            <div className="border-b lg:border-b-0 lg:border-r border-slate-100 p-3 bg-slate-50">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 mb-3">
                <FileText className="w-4 h-4" />
                Blocks
              </div>
              <div ref={blockContainerRef} className="space-y-2" />
            </div>
            <div ref={containerRef} className="min-h-[620px]" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default CMSPages;
