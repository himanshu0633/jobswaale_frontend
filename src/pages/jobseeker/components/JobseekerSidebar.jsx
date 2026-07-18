import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Bookmark,
  Briefcase,
  Building,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  User
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import { useMessageSocket } from '../../../context/MessageSocketContext';
import logoasset from '../../../assets/logo.png';

const mainMenu = [
  { to: '/jobseeker/dashboard', icon: LayoutGrid, label: 'Dashboard', exact: true },
  { to: '/jobseeker/profile', icon: User, label: 'My Profile' },
  { to: '/jobseeker/jobs-applied', icon: Briefcase, label: 'Jobs Applied', badgeKey: 'jobsApplied' },
  { to: '/jobseeker/saved-jobs', icon: Bookmark, label: 'Saved Jobs' },
  { to: '/jobseeker/saved-employers', icon: Building, label: 'Saved Employers' },
  { to: '/jobseeker/subscription', icon: Star, label: 'My Plan' },
  { to: '/jobseeker/messages', icon: MessageSquare, label: 'Messages', badgeKey: 'messages' }
];

const settingsMenu = [
  { to: '/jobseeker/profile', icon: Settings, label: 'My Account' }
];

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

const getJobseekerUser = () => {
  try {
    return JSON.parse(localStorage.getItem('publicUser') || 'null');
  } catch {
    return null;
  }
};

export const JobseekerSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { unreadCount } = useMessageSocket();
  const user = getJobseekerUser();
  const [profile, setProfile] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Job Seeker',
    role: 'Job Seeker',
    jobSearchStatus: 'looking',
    profileCompletionScore: 0,
    counts: {}
  });
  const [savingStatus, setSavingStatus] = useState(false);

  const isActive = (item) => (item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to));

  const closeMobileSidebar = () => {
    if (window.innerWidth < 1200) toggleSidebar();
  };

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('publicToken');

    axios
      .get(`${BASE_API_URL}/jobseeker/profile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      .then((response) => {
        if (isMounted) {
          setProfile((current) => ({ ...current, ...response.data }));
        }
      })
      .catch(() => {
        if (isMounted) {
          setProfile((current) => ({
            ...current,
            name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Job Seeker'
          }));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.firstName, user?.lastName]);

  const initials = getInitials(profile.name) || 'JS';
  const isLookingForJob = profile.jobSearchStatus !== 'not-looking';

  const handleJobSearchStatusToggle = async () => {
    if (savingStatus) return;
    const nextStatus = isLookingForJob ? 'not-looking' : 'looking';
    const previousStatus = profile.jobSearchStatus || 'looking';
    const token = localStorage.getItem('publicToken');

    setSavingStatus(true);
    setProfile((current) => ({ ...current, jobSearchStatus: nextStatus }));

    try {
      await axios.put(
        `${BASE_API_URL}/jobseeker/profile`,
        { jobSearchStatus: nextStatus },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
    } catch {
      setProfile((current) => ({ ...current, jobSearchStatus: previousStatus }));
      window.alert('Job search status update nahi ho paaya. Please try again.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('publicToken');
      localStorage.removeItem('publicUser');
      window.location.href = '/login';
    }
  };

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item);
    const badgeValue = item.badgeKey === 'messages' ? unreadCount : item.badgeKey ? profile.counts?.[item.badgeKey] : null;

    return (
      <Link
        to={item.to}
        onClick={closeMobileSidebar}
        className={`flex items-center gap-3 border-l-[3px] px-5 py-[0.65rem] text-sm font-medium transition-colors duration-150 ${
          active
            ? 'border-[#FF6B00] bg-white/10 text-white'
            : 'border-transparent text-white/70 hover:bg-white/[0.06] hover:text-white'
        }`}
      >
        <Icon className="h-[18px] w-[22px] shrink-0" />
        <span className="whitespace-nowrap">{item.label}</span>
        {Boolean(badgeValue) && (
          <span className="ml-auto rounded-full bg-[#FF6B00] px-2.5 py-0.5 text-[0.7rem] font-medium text-white">
            {badgeValue > 99 ? '99+' : badgeValue}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[1039] bg-black/40 xl:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[1040] flex w-[260px] flex-col overflow-y-auto bg-gradient-to-b from-[#001c3d] to-[#002856] text-white/85 transition-transform duration-300 xl:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.08] px-5 py-[1.2rem]">
          <Link to="/" className="text-lg font-bold text-white">
            <img src={logoasset} alt="JobsWaale" className="h-9 sm:h-13 w-auto object-contain" />
          </Link>
        </div>

        {/* User Block */}
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-5">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#FF6B00] text-sm font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="truncate text-sm font-semibold text-white">{profile.name}</div>
            <div className="text-xs text-white/60">{profile.role || 'Job Seeker'}</div>
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-white/55">
                <span>Profile score</span>
                <span>{Number(profile.profileCompletionScore || 0)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-[#FF6B00] transition-all"
                  style={{ width: `${Math.min(Math.max(Number(profile.profileCompletionScore || 0), 0), 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-white/[0.08] px-5 py-4">
          <button
            type="button"
            onClick={handleJobSearchStatusToggle}
            disabled={savingStatus}
            className="flex w-full items-center justify-between gap-3 rounded-lg bg-white/[0.06] px-3 py-2.5 text-left transition hover:bg-white/[0.1] disabled:opacity-70"
          >
            <span className="min-w-0">
              <span className="block text-xs font-bold text-white">Job Search Status</span>
              <span className={`mt-0.5 block text-[11px] font-semibold ${isLookingForJob ? 'text-emerald-300' : 'text-white/50'}`}>
                {isLookingForJob ? 'Looking for job' : 'Not looking'}
              </span>
            </span>
            <span className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${isLookingForJob ? 'bg-emerald-500' : 'bg-white/20'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${isLookingForJob ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3">
          <div className="px-5 pb-2 pt-4 text-[0.65rem] font-bold uppercase tracking-[1.2px] text-white/35">
            Main Menu
          </div>
          {mainMenu.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}

          <div className="px-5 pb-2 pt-4 text-[0.65rem] font-bold uppercase tracking-[1.2px] text-white/35">
            Settings
          </div>
          {settingsMenu.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="shrink-0 border-t border-white/[0.08] py-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-5 py-[0.65rem] text-sm font-medium text-red-400/70 transition-colors duration-150 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-[18px] w-[22px] shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default JobseekerSidebar;
