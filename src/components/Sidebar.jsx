import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightLeft,
  BarChart3,
  Briefcase,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Factory,
  Gauge,
  Gift,
  GraduationCap,
  Handshake,
  Layers,
  MapPin,
  Rss,
  Settings,
  Table2,
  UserCog,
  UserSearch
} from 'lucide-react';

const palette = {
  active: 'bg-[#e8e6fa] text-[#6658dd]',
  item: 'text-[#6c757d] hover:text-[#313a46] hover:bg-[#f6f7fb]',
  subItem: 'text-[#6c757d] hover:text-[#313a46] hover:bg-[#f6f7fb]',
  title: 'text-[#6c757d]'
};

export const Sidebar = ({ isOpen, isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const adminPath = (path) => `/admin${path === '/' ? '' : path}`;
  const currentPath = location.pathname.startsWith('/admin')
    ? location.pathname.slice('/admin'.length) || '/'
    : location.pathname;

  const [openMenus, setOpenMenus] = useState({
    plans: currentPath.startsWith('/jobseeker-packages') || currentPath.startsWith('/plans') || currentPath.startsWith('/features') || currentPath.startsWith('/plan-mappings'),
    locations: currentPath.startsWith('/countries') || currentPath.startsWith('/states') || currentPath.startsWith('/districts') || currentPath.startsWith('/cities')
  });

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isActive = (path) => currentPath === path;
  const isGroupActive = (paths) => paths.some(path => currentPath.startsWith(path));

  const sectionClass = 'px-3 pt-5 mb-2 text-[11px] font-extrabold uppercase tracking-wide';
  const linkClass = (active) => `flex items-center rounded-lg transition-all duration-150 ${
    isCollapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'gap-3 px-3 py-2.5 text-sm font-semibold'
  } ${active ? palette.active : palette.item}`;
  const buttonClass = (active) => `flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
    active ? 'text-[#6658dd]' : palette.item
  }`;
  const subLinkClass = (active) => `block py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
    active ? 'text-[#6658dd]' : palette.subItem
  }`;

  const NavLink = ({ to, icon: Icon, label, active, title }) => (
    <Link to={to} title={isCollapsed ? (title || label) : ''} className={linkClass(active)}>
      <Icon className="w-4.5 h-4.5 shrink-0" />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );

  const PlaceholderLink = ({ icon: Icon, label }) => (
    <NavLink to={adminPath('/')} icon={Icon} label={label} active={false} />
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`fixed top-16 lg:top-16 bottom-0 left-0 z-50 lg:z-20 flex flex-col bg-white text-slate-700 border-r border-slate-200 transition-all duration-300 transform lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        <nav className={`flex-grow py-6 overflow-y-auto ${isCollapsed ? 'px-1 space-y-4' : 'px-4 space-y-1'}`}>
          {!isCollapsed && <div className={`${sectionClass} pt-0 ${palette.title}`}>Navigation</div>}
          <NavLink to={adminPath('/')} icon={Gauge} label="Dashboard" active={isActive('/') || isActive('/dashboard')} />

          {!isCollapsed && <div className={`${sectionClass} ${palette.title}`}>People</div>}
          <NavLink to={adminPath('/jobs')} icon={Table2} label="Jobs" active={currentPath.startsWith('/jobs')} />
          <NavLink to={adminPath('/jobseekers')} icon={UserSearch} label="Jobseeker" active={currentPath.startsWith('/jobseekers')} />
          <NavLink to={adminPath('/employers')} icon={Handshake} label="Employer" active={currentPath.startsWith('/employers')} />

          {!isCollapsed && <div className={`${sectionClass} ${palette.title}`}>Masters</div>}
          <div>
            {isCollapsed ? (
              <NavLink
                to={adminPath('/jobseeker-packages')}
                icon={Gift}
                label="Plans"
                active={isGroupActive(['/jobseeker-packages', '/plans', '/features', '/plan-mappings'])}
              />
            ) : (
              <>
                <button
                  onClick={() => toggleMenu('plans')}
                  className={buttonClass(isGroupActive(['/jobseeker-packages', '/plans', '/features', '/plan-mappings']))}
                >
                  <div className="flex items-center gap-3">
                    <Gift className="w-4.5 h-4.5 shrink-0" />
                    <span>Plans</span>
                  </div>
                  {openMenus.plans ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {openMenus.plans && (
                  <div className="pl-9 mt-1 space-y-1">
                    <Link to={adminPath('/jobseeker-packages')} className={subLinkClass(isActive('/jobseeker-packages') || isActive('/plans'))}>Plan Master</Link>
                    <Link to={adminPath('/features')} className={subLinkClass(isActive('/features'))}>Feature Master</Link>
                    <Link to={adminPath('/plan-mappings')} className={subLinkClass(isActive('/plan-mappings'))}>Plan Mapping</Link>
                  </div>
                )}
              </>
            )}
          </div>
          <NavLink to={adminPath('/industry-types')} icon={Factory} label="Industrial Type" active={isActive('/industry-types')} />
          <NavLink to={adminPath('/job-categories')} icon={Layers} label="Job Categories" active={isActive('/job-categories')} />
          <NavLink to={adminPath('/job-types')} icon={Briefcase} label="Job Types" active={isActive('/job-types')} />
          <NavLink to={adminPath('/qualifications')} icon={GraduationCap} label="Qualifications" active={isActive('/qualifications')} />

          <div>
            {isCollapsed ? (
              <NavLink
                to={adminPath('/countries')}
                icon={MapPin}
                label="Locations"
                active={isGroupActive(['/countries', '/states', '/districts', '/cities'])}
              />
            ) : (
              <>
                <button
                  onClick={() => toggleMenu('locations')}
                  className={buttonClass(isGroupActive(['/countries', '/states', '/districts', '/cities']))}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4.5 h-4.5 shrink-0" />
                    <span>Locations</span>
                  </div>
                  {openMenus.locations ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {openMenus.locations && (
                  <div className="pl-9 mt-1 space-y-1">
                    <Link to={adminPath('/countries')} className={subLinkClass(isActive('/countries'))}>Country</Link>
                    <Link to={adminPath('/states')} className={subLinkClass(isActive('/states'))}>State</Link>
                    <Link to={adminPath('/districts')} className={subLinkClass(isActive('/districts'))}>District</Link>
                    <Link to={adminPath('/cities')} className={subLinkClass(isActive('/cities'))}>City</Link>
                  </div>
                )}
              </>
            )}
          </div>

          {!isCollapsed && <div className={`${sectionClass} ${palette.title}`}>Finance</div>}
          <PlaceholderLink icon={CreditCard} label="Payments" />
          <PlaceholderLink icon={ArrowRightLeft} label="Transactions" />

          {!isCollapsed && <div className={`${sectionClass} ${palette.title}`}>Content</div>}
          <NavLink to={adminPath('/cms-pages')} icon={CalendarDays} label="CMS Pages" active={isActive('/cms-pages')} />
          <NavLink to={adminPath('/header-cms')} icon={CalendarDays} label="Header CMS" active={isActive('/header-cms')} />
          <PlaceholderLink icon={Rss} label="Blog" />

          {!isCollapsed && <div className={`${sectionClass} ${palette.title}`}>System</div>}
          <PlaceholderLink icon={BarChart3} label="Reports" />
          <PlaceholderLink icon={Settings} label="Settings" />
          <PlaceholderLink icon={UserCog} label="Users & Roles" />
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
