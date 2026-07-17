import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, ArrowRight, X } from 'lucide-react';
import { BASE_API_URL } from '../context/AuthContext';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const portalSettings = {
  employer: {
    endpoint: `${BASE_API_URL}/employer/profile`,
    profilePath: '/employer/company',
    title: 'Complete your employer profile',
    message: 'Your company profile score should be above 90%. Complete the pending details so jobseekers can trust your listing and contact details.',
    minimumScore: 90
  },
  jobseeker: {
    endpoint: `${BASE_API_URL}/jobseeker/profile`,
    profilePath: '/jobseeker/profile',
    title: 'Complete your jobseeker profile',
    message: 'Your profile is pending. Complete it so employers can review your skills, experience, and contact details.'
  }
};

export const ProfileCompletionPopup = ({ portal }) => {
  const location = useLocation();
  const settings = portalSettings[portal];
  const [showPopup, setShowPopup] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [profileScore, setProfileScore] = useState(0);
  const [dismissedForPath, setDismissedForPath] = useState('');

  const isProfilePage = settings?.profilePath && location.pathname.startsWith(settings.profilePath);

  useEffect(() => {
    if (!settings || isProfilePage) return undefined;

    let alive = true;

    axios.get(settings.endpoint, { headers: getTokenHeaders() })
      .then((response) => {
        if (!alive) return;
        const isIncomplete = response.data?.profileIncomplete === true;
        const score = Number(response.data?.profileCompletionScore || 0);
        const shouldShowPopup = settings.minimumScore
          ? score < settings.minimumScore
          : isIncomplete;
        setMissingFields(response.data?.profileMissingFields || []);
        setProfileScore(score);
        setShowPopup(shouldShowPopup && dismissedForPath !== location.pathname);
      })
      .catch(() => {
        if (alive) setShowPopup(false);
      });

    return () => {
      alive = false;
    };
  }, [dismissedForPath, isProfilePage, location.pathname, settings]);

  if (!settings || isProfilePage || !showPopup) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <AlertCircle className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-extrabold text-slate-900">{settings.title}</h2>
            <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">{settings.message}</p>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs font-black text-slate-500">
                <span>Profile score</span>
                <span>{profileScore}%{settings.minimumScore ? ` / ${settings.minimumScore}% required` : ''}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#0047C7] transition-all"
                  style={{ width: `${Math.min(Math.max(profileScore, 0), 100)}%` }}
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setDismissedForPath(location.pathname);
              setShowPopup(false);
            }}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close profile reminder"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {missingFields.length > 0 && (
          <div className="px-5 py-4">
            <p className="text-xs font-black uppercase text-slate-400">Pending details</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {missingFields.slice(0, 6).map((field) => (
                <span key={field} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {field}
                </span>
              ))}
              {missingFields.length > 6 && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  +{missingFields.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={() => {
              setDismissedForPath(location.pathname);
              setShowPopup(false);
            }}
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
          >
            Later
          </button>
          <Link
            to={settings.profilePath}
            className="inline-flex items-center gap-2 rounded-md bg-[#0047C7] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[#0039a3]"
          >
            Complete profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionPopup;
