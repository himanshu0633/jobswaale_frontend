import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_API_URL } from '../../context/AuthContext';

import Home from './Home';
import Jobs from './Jobs';
import Employers from './Employers';
import EmployerDetail from './EmployerDetail';
import EmployerPlan from './EmployerPlan';
import JobseekerPlan from './JobseekerPlan';
import About from './About';
import Contact from './Contact';
import Support from './Support';
import PrivacyPolicy from './PrivacyPolicy';
import TermsConditions from './TermsConditions';
import Faq from './Faq';
import JobDetail from '../jobs/JobDetail';

import { getPublicSettings } from '../../utils/publicSettings';

// Import modular header and footer
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';

// Re-export them to prevent breaking existing imports in other files
export { PublicHeader, PublicFooter };

export const PublicPage = () => {
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Normalize slug to match keys
  const slug = location.pathname === '/' ? 'home' : location.pathname.replace(/^\/+|\/+$/g, '');

  // Load public setting configurations (e.g. maintenance mode)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getPublicSettings();
        setSettings(data || null);
      } catch {
        setSettings(null);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  // Switch rendering of local components
  const renderStaticPage = () => {
    if (slug.startsWith('jobs/')) {
      return (
        <section className="bg-slate-50 py-12 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <JobDetail />
          </div>
        </section>
      );
    }

    switch (slug) {
      case 'home':
        return <Home />;
      case 'jobs':
        return <Jobs />;
      case 'employer':
      case 'employers':
        return <Employers />;
      case 'employer-detail':
        return <EmployerDetail />;
      case 'employer-plan':
        return <EmployerPlan />;
      case 'jobseeker-plan':
        return <JobseekerPlan />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'support':
        return <Support />;
      case 'faq':
        return <Faq />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'terms-conditions':
        return <TermsConditions />;
      default:
        return (
          <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl font-bold text-slate-900">404 - Page Not Found</h1>
            <p className="text-slate-550 mt-2 text-sm">The page you are looking for does not exist or has been moved.</p>
            <Link to="/" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs transition duration-150 cursor-pointer">
              Go back home
            </Link>
          </main>
        );
    }
  };

  if (loadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-sm font-semibold text-slate-500">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (settings?.maintenanceMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-slate-50">
        <h1 className="text-3xl font-bold text-slate-900">{settings.siteName || 'JobsWaale'} is under maintenance</h1>
        <p className="mt-3 max-w-md text-sm text-slate-500 leading-relaxed">
          We are currently making updates to enhance your experience. Please check back shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Universal Public Navigation Header */}
      <PublicHeader />

      {/* Main Dynamic View Content */}
      <main className="flex-grow pt-20 sm:pt-24">
        {renderStaticPage()}
      </main>

      {/* Shared Public Footer */}
      <PublicFooter />
    </div>
  );
};

export default PublicPage;
