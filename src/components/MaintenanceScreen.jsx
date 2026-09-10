import { Link } from 'react-router-dom';
import { Wrench, ShieldAlert, Mail, Phone, ArrowRight } from 'lucide-react';
import logoBlack from '../assets/logo-black.png';

export const MaintenanceScreen = ({ settings = {} }) => {
  const siteName = settings?.siteName || 'JobsWaale';
  const supportEmail = settings?.siteEmail || 'support@jobswaale.com';
  const supportPhone = settings?.sitePhone || '+91 8628821441';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 text-slate-800">
      {/* Top Brand Area */}
      <div className="w-full max-w-2xl flex justify-center pt-6 sm:pt-10">
        <img src={logoBlack} alt={siteName} className="h-10 sm:h-12 w-auto object-contain" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-10 text-center my-8">
        {/* Animated Badge Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-8 ring-amber-50/60 animate-pulse">
          <Wrench className="h-10 w-10" />
        </div>

        {/* Headings */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 text-amber-800 text-xs font-black uppercase tracking-wider mb-4">
          <ShieldAlert className="h-3.5 w-3.5" />
          Scheduled Maintenance
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          We'll Be Back Soon!
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
          {siteName} is currently undergoing scheduled system updates and maintenance to improve platform performance.
        </p>

        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          All public, employer, and jobseeker services are temporarily paused. We appreciate your patience and will be back online shortly!
        </p>

        {/* Contact info */}
        {(supportEmail || supportPhone) && (
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-semibold text-slate-600">
            {supportEmail && (
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 transition"
              >
                <Mail className="h-4 w-4" />
                <span>{supportEmail}</span>
              </a>
            )}
            {supportPhone && (
              <a
                href={`tel:${supportPhone}`}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-800 transition"
              >
                <Phone className="h-4 w-4" />
                <span>{supportPhone}</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Footer link for SuperAdmin */}
      <div className="w-full max-w-2xl flex justify-center pb-6 sm:pb-8">
        <Link
          to="/superadmin-login"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition"
        >
          <span>Administrator Access</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

export default MaintenanceScreen;
