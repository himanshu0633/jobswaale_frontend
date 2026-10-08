import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

/**
 * Backward compatibility redirector for legacy /admin/cms-pages routes.
 * Routes directly to the dedicated sidebar page.
 */
export const CMSPages = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  if (tab === 'about') {
    return <Navigate to="/admin/about-us" replace />;
  }
  if (tab === 'terms') {
    return <Navigate to="/admin/terms-conditions" replace />;
  }
  if (tab === 'privacy') {
    return <Navigate to="/admin/privacy-policy" replace />;
  }
  return <Navigate to="/admin/custom-pages" replace />;
};

export default CMSPages;
