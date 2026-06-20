import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { BASE_API_URL } from '../context/AuthContext';
import logoAsset from '../assets/logo.png';

const sortVisible = (menus = []) => (
  [...menus]
    .filter(menu => menu.visible !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
);

const isExternal = (path = '') => /^https?:\/\//i.test(path);
const isImageUrl = (value = '') => /^(https?:\/\/|data:image\/|\/)/i.test(value);
const normalizePath = (path = '') => {
  const cleanPath = String(path || '').trim();
  if (!cleanPath) return '#';
  if (isExternal(cleanPath) || cleanPath.startsWith('#') || cleanPath.startsWith('/')) return cleanPath;
  return `/${cleanPath}`;
};

const MenuItem = ({ menu, depth = 0 }) => {
  const [open, setOpen] = useState(false);
  const children = sortVisible(menu.children || []);
  const path = normalizePath(menu.path);
  const linkClass = `${depth ? 'w-full justify-between' : ''} flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md`;
  const item = isExternal(path) ? (
    <a href={path} className={linkClass} target="_blank" rel="noreferrer">
      <span>{menu.label}</span>
      {children.length > 0 && <span className="text-xs text-slate-400">v</span>}
    </a>
  ) : (
    <Link to={path || '#'} className={linkClass}>
      <span>{menu.label}</span>
      {children.length > 0 && <span className="text-xs text-slate-400">v</span>}
    </Link>
  );

  if (children.length === 0) return <li className="relative">{item}</li>;

  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {item}
      {open && (
        <ul className={depth
          ? 'mt-1 ml-3 border-l border-slate-200 pl-3'
          : 'absolute left-0 top-full z-50 min-w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-lg'
        }>
          {children.map((child, index) => <MenuItem key={`${child.label}-${index}`} menu={child} depth={depth + 1} />)}
        </ul>
      )}
    </li>
  );
};

export const PublicPage = () => {
  const location = useLocation();
  const [header, setHeader] = useState({ logo: '', menus: [] });
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      const slug = location.pathname === '/' ? 'home' : location.pathname.replace(/^\/+|\/+$/g, '');
      try {
        const headerRes = await axios.get(`${BASE_API_URL}/cms/public/header`);
        setHeader(headerRes.data || { logo: '', menus: [] });
      } catch (err) {
        setHeader({ logo: '', menus: [] });
      }

      try {
        const pageRes = await axios.get(`${BASE_API_URL}/cms/public/pages/${encodeURIComponent(slug)}`);
        setPage(pageRes.data);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Page not found' : 'Page could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 bg-white/95 border-b border-slate-200 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-5">
          <Link to="/" className="flex items-center gap-3">
            <img src={isImageUrl(header.logo) ? header.logo : logoAsset} alt="JobsWaale" className="h-10 w-auto object-contain" />
          </Link>
          <nav className="block min-w-0 overflow-visible">
            <ul className="flex items-center gap-1 whitespace-nowrap">
              {sortVisible(header.menus).map((menu, index) => <MenuItem key={`${menu.label}-${index}`} menu={menu} />)}
            </ul>
          </nav>
        </div>
      </header>

      {loading ? (
        <main className="min-h-[60vh] flex items-center justify-center text-sm font-semibold text-slate-500">Loading...</main>
      ) : error ? (
        <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl font-bold text-slate-900">{error}</h1>
          <Link to="/" className="mt-4 text-indigo-600 font-semibold">Go home</Link>
        </main>
      ) : (
        <main>
          <style>{page?.css || ''}</style>
          <div dangerouslySetInnerHTML={{ __html: page?.html || '' }} />
        </main>
      )}
    </div>
  );
};

export default PublicPage;
