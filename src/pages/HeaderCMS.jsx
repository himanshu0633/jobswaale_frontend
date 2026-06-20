import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Eye, EyeOff, Loader, Plus, Save, Trash2 } from 'lucide-react';

const newMenu = () => ({
  label: '',
  path: '',
  order: 1,
  visible: true,
  children: []
});

const normalizeOrders = (menus) => menus.map((menu, index) => ({
  ...menu,
  order: index + 1,
  children: normalizeOrders(menu.children || [])
}));

const MenuEditor = ({ menus, pages, onChange, level = 0 }) => {
  const [dragIndex, setDragIndex] = useState(null);

  const setMenu = (index, patch) => {
    onChange(menus.map((menu, idx) => idx === index ? { ...menu, ...patch } : menu));
  };

  const addChild = (index) => {
    setMenu(index, { children: normalizeOrders([...(menus[index].children || []), newMenu()]) });
  };

  const moveMenu = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= menus.length) return;
    const next = [...menus];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(normalizeOrders(next));
  };

  const removeMenu = (index) => {
    onChange(normalizeOrders(menus.filter((_, idx) => idx !== index)));
  };

  const dropMenu = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...menus];
    const [item] = next.splice(dragIndex, 1);
    next.splice(index, 0, item);
    setDragIndex(null);
    onChange(normalizeOrders(next));
  };

  return (
    <div className={level ? 'ml-5 mt-3 space-y-3 border-l border-slate-200 pl-4' : 'space-y-3'}>
      {menus.map((menu, index) => (
        <div
          key={menu._id || `${level}-${index}`}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => dropMenu(index)}
          onDragEnd={() => setDragIndex(null)}
          className={`border border-slate-200 rounded-xl bg-white p-4 cursor-move ${dragIndex === index ? 'opacity-60 ring-2 ring-indigo-200' : ''}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_90px_auto] gap-3">
            <input
              value={menu.label}
              onChange={(e) => setMenu(index, { label: e.target.value })}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Menu label"
            />
            <div className="flex gap-2">
              <input
                value={menu.path}
                onChange={(e) => setMenu(index, { path: e.target.value })}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                placeholder="/about-us or https://..."
              />
              <select
                value=""
                onChange={(e) => e.target.value && setMenu(index, { path: e.target.value })}
                className="w-32 px-2 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="">Pages</option>
                {pages.map(page => (
                  <option key={page._id} value={`/${page.slug === 'home' ? '' : page.slug}`}>
                    {page.title}
                  </option>
                ))}
              </select>
            </div>
            <input
              value={menu.order || index + 1}
              onChange={(e) => setMenu(index, { order: Number(e.target.value) || index + 1 })}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Order"
            />
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => moveMenu(index, -1)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => moveMenu(index, 1)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
                <ChevronDown className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setMenu(index, { visible: !menu.visible })} className={`w-8 h-8 rounded-lg flex items-center justify-center ${menu.visible !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {menu.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button type="button" onClick={() => addChild(index)} className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => removeMenu(index)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {(menu.children || []).length > 0 && (
            <MenuEditor
              menus={menu.children || []}
              pages={pages}
              onChange={(children) => setMenu(index, { children: normalizeOrders(children) })}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export const HeaderCMS = () => {
  const [logo, setLogo] = useState('');
  const [menus, setMenus] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: '', text: '' });

  const showAlert = (type, text) => {
    setAlert({ type, text });
    if (type === 'success') setTimeout(() => setAlert({ type: '', text: '' }), 2500);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [headerRes, pagesRes] = await Promise.all([
          axios.get(`${BASE_API_URL}/cms/header`),
          axios.get(`${BASE_API_URL}/cms/pages`)
        ]);
        setLogo(headerRes.data.logo || '');
        setMenus(normalizeOrders(headerRes.data.menus || []));
        setPages(pagesRes.data || []);
      } catch (err) {
        showAlert('error', err.response?.data?.message || 'Header data could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${BASE_API_URL}/cms/header`, { logo, menus: normalizeOrders(menus) });
      setMenus(normalizeOrders(res.data.menus || []));
      showAlert('success', 'Header menu saved successfully.');
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Header could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Header CMS</h1>
          <p className="text-sm text-slate-500">Menus, submenus, visibility, order, internal pages aur external URLs manage karein.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white rounded-lg text-sm font-semibold">
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Header
        </button>
      </div>

      {alert.text && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
          {alert.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {alert.text}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Logo URL</label>
            <input value={logo} onChange={(e) => setLogo(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" placeholder="https://.../logo.png" />
          </div>
          <button type="button" onClick={() => setMenus(normalizeOrders([...menus, newMenu()]))} className="lg:mt-6 inline-flex items-center justify-center gap-2 px-4 py-2 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold">
            <Plus className="w-4 h-4" />
            Add Menu
          </button>
        </div>

        <div className="p-5 bg-slate-50/60">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader className="w-6 h-6 animate-spin text-indigo-600" /></div>
          ) : menus.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl">No menus yet.</div>
          ) : (
            <MenuEditor menus={menus} pages={pages} onChange={(next) => setMenus(normalizeOrders(next))} />
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderCMS;
