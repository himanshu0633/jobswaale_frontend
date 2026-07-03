import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarCheck,
  ChevronUp,
  CircleHelp,
  CreditCard,
  Database,
  FileText,
  Grid2X2,
  MessageCircle,
  Search,
  Settings,
  Star,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';

const mainMenu = [
  { to: '/employer', icon: Grid2X2, label: 'Dashboard', exact: true },
  {
    to: '/employer/jobs',
    icon: Briefcase,
    label: 'Jobs',
    suffix: ChevronUp,
    children: [
      { to: '/employer/jobs/create', label: 'Post a Job' },
      { to: '/employer/jobs', label: 'Manage Jobs', exact: true }
    ]
  },
  { to: '/employer/applications', icon: FileText, label: 'Applications' },
  { to: '/employer/shortlisted', icon: UserCheck, label: 'Shortlisted' },
  { to: '/employer/interviews', icon: CalendarCheck, label: 'Interviews' },
  { to: '/employer/selected', icon: UserPlus, label: 'Selected' },
  { to: '/employer/candidates', icon: Search, label: 'Search Candidates' },
  { to: '/employer/reports', icon: Grid2X2, label: 'Reports' },
  { to: '/employer/messages', icon: MessageCircle, label: 'Messages', badge: '3' }
];

const companyMenu = [
  { to: '/employer/company', icon: Building2, label: 'Company Profile' },
  { to: '/employer/subscription', icon: CreditCard, label: 'Subscription' },
  { to: '/employer/talent-pool', icon: Database, label: 'Talent Pool' },
  { to: '/employer/settings', icon: Settings, label: 'Settings' },
  { to: '/employer/support', icon: CircleHelp, label: 'Support Center' }
];

const getEmployerUser = () => {
  try {
    return JSON.parse(localStorage.getItem('publicUser') || 'null');
  } catch {
    return null;
  }
};

export const EmployerSidebar = ({ isOpen, isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const user = getEmployerUser();
  const [profile, setProfile] = useState({
    name: user?.companyName || user?.firstName || 'Employer',
    planName: 'No Plan',
    isVerified: false
  });
  const [openMenus, setOpenMenus] = useState({ jobs: true });

  const isActive = (item) => item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
  const isChildActive = (item) => item.children?.some((child) => (
    child.exact ? location.pathname === child.to : location.pathname.startsWith(child.to)
  ));
  const closeMobileSidebar = () => {
    if (window.innerWidth < 1024) toggleSidebar();
  };

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('publicToken');

    axios.get(`${BASE_API_URL}/employer/profile`, {
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
            name: user?.companyName || user?.firstName || 'Employer'
          }));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.companyName, user?.firstName]);

  const linkClass = (active) => `flex items-center justify-between rounded-lg transition-all duration-150 ${
    isCollapsed ? 'mx-auto h-10 w-10 justify-center p-2.5' : 'px-3 py-2 text-[13px] font-bold'
  } ${active ? 'bg-[#e8e6fa] text-[#6658dd]' : 'text-[#6c757d] hover:bg-[#f6f7fb] hover:text-[#313a46]'}`;

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const Suffix = item.suffix;
    const active = isActive(item) || isChildActive(item);
    const menuKey = item.label.toLowerCase().replace(/\s+/g, '-');
    const isMenuOpen = Boolean(openMenus[menuKey]);

    if (item.children) {
      return (
        <div>
          {isCollapsed ? (
            <Link to={item.to} onClick={closeMobileSidebar} title={item.label} className={linkClass(active)}>
              <span className="flex items-center">
                <Icon className="h-4 w-4 shrink-0" />
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setOpenMenus((current) => ({ ...current, [menuKey]: !current[menuKey] }))}
              className={`w-full ${linkClass(active)}`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </span>
              {Suffix && <Suffix className={`h-4 w-4 text-[#6658dd] transition-transform ${isMenuOpen ? '' : 'rotate-180'}`} />}
            </button>
          )}
          {!isCollapsed && isMenuOpen && (
            <div className="ml-8 mt-1.5 space-y-1.5 pb-1.5">
              {item.children.map((child) => {
                const childActive = child.exact
                  ? location.pathname === child.to
                  : location.pathname.startsWith(child.to);

                return (
                  <Link
                    key={child.to}
                    to={child.to}
                    onClick={closeMobileSidebar}
                    className={`block rounded-lg px-3 py-1.5 text-[13px] font-bold transition ${
                      childActive ? 'bg-[#f3f0ff] text-[#6658dd]' : 'text-[#6c757d] hover:bg-[#f6f7fb] hover:text-[#313a46]'
                    }`}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link to={item.to} onClick={closeMobileSidebar} title={isCollapsed ? item.label : ''} className={linkClass(active)}>
        <span className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
          <Icon className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>{item.label}</span>}
        </span>
        {!isCollapsed && (
          <>
            {Suffix && <Suffix className="h-4 w-4 text-slate-500" />}
            {item.badge && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-black text-white">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`fixed bottom-0 left-0 top-[66px] z-50 flex flex-col border-r border-slate-200 bg-white text-slate-700 transition-all duration-300 lg:z-20 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <nav className={`flex-grow overflow-y-auto ${isCollapsed ? 'px-1 py-5' : 'px-4 py-5'}`}>
          {!isCollapsed && (
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8e6fa] text-[#6658dd]">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-extrabold text-slate-800">{profile.name}</h3>
                <div className={`mt-1 flex items-center gap-1.5 text-xs font-extrabold ${profile.planName === 'No Plan' ? 'text-slate-400' : 'text-amber-500'}`}>
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {profile.planName}
                </div>
                <div className={`mt-3 inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-extrabold ${
                  profile.isVerified ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-600'
                }`}>
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {profile.isVerified ? 'Verified' : 'Unverified'}
                </div>
              </div>
            </div>
          )}

          {!isCollapsed && <div className="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#6c757d]">Main Menu</div>}
          <div className="space-y-1">
            {mainMenu.map((item) => <NavItem key={item.to} item={item} />)}
          </div>

          {!isCollapsed && <div className="mb-3 mt-6 text-[10px] font-black uppercase tracking-[0.12em] text-[#6c757d]">Company</div>}
          <div className="space-y-1">
            {companyMenu.map((item) => <NavItem key={item.to} item={item} />)}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default EmployerSidebar;
