import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { BASE_API_URL } from '../../context/AuthContext';
import logoAsset from '../../assets/logo.png';

export const PublicPage = () => {
  const location = useLocation();
  const [page, setPage] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      const slug = location.pathname === '/' ? 'home' : location.pathname.replace(/^\/+|\/+$/g, '');
      try {
        const settingsRes = await axios.get(`${BASE_API_URL}/settings/public`);
        setSettings(settingsRes.data || null);
      } catch (err) {
        setSettings(null);
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
            <img src={logoAsset} alt="JobsWaale" className="h-10 w-auto object-contain" />
          </Link>
        </div>
      </header>

      {loading ? (
        <main className="min-h-[60vh] flex items-center justify-center text-sm font-semibold text-slate-500">Loading...</main>
      ) : settings?.maintenanceMode ? (
        <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl font-bold text-slate-900">{settings.siteName || 'JobsWaale'} is under maintenance</h1>
          <p className="mt-3 max-w-md text-sm text-slate-500">We are making updates right now. Please check back soon.</p>
        </main>
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
