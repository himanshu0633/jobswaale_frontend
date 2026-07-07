import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightLeft,
  BarChart3,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Factory,
  FileText,
  Gauge,
  Gift,
  GraduationCap,
  Handshake,
  Layers,
  MapPin,
  Rss,
  Settings,
  Table2,
  Users,
  UserSearch
} from 'lucide-react';
import { hasPermission } from '../utils/permissions';
import { useAuth } from '../context/AuthContext';

// Colors and sizing pulled directly from the source template
// (--ins-sidenav-item-color, --ins-sidenav-item-hover-color / active-color,
// --ins-sidenav-item-gap, --ins-sidenav-item-padding-x/y, --ins-sidenav-item-icon-size,
// --ins-sidenav-width, --ins-sidenav-border-color) for the default (light) skin.
const palette = {
  itemColor: 'text-[#6c757d]',
  hoverActiveColor: 'hover:text-[#6658dd] focus:text-[#6658dd]',
  active: 'text-[#6658dd]',
  title: 'text-[#6c757d]'
};

export const Sidebar = ({ isOpen, isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();
  const adminPath = (path) => `/admin${path === '/' ? '' : path}`;
  const currentPath = location.pathname.startsWith('/admin')
    ? location.pathname.slice('/admin'.length) || '/'
    : location.pathname;

  const isActive = (path) => currentPath === path;
  const isPathActive = (path) => currentPath === path || currentPath.startsWith(`${path}/`);
  const isGroupActive = (paths) => paths.some(path => isPathActive(path));
  const jobseekerPlanPaths = ['/jobseeker-plans', '/jobseeker-features', '/jobseeker-plan-mappings'];
  const legacyPlanPaths = ['/jobseeker-packages', '/plans', '/features', '/plan-mappings'];
  const allJobseekerPlanPaths = [...jobseekerPlanPaths, ...legacyPlanPaths];
  const employerPlanPaths = ['/employer-plans'];

  const [openMenus, setOpenMenus] = useState({
    plans: isGroupActive(allJobseekerPlanPaths),
    employerPlans: isGroupActive(employerPlanPaths),
    locations: isGroupActive(['/countries', '/states', '/districts', '/cities'])
  });

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const can = (permission) => hasPermission(user, permission);

  // .side-nav-title: uppercase, letter-spacing .1em (tracking-widest),
  // font-size = item-font-size(0.875rem) * .7, font-weight 700 (bold),
  // padding: item-padding-y(8px) item-padding-x*2(24px)
  const sectionClass = 'px-6 py-2 text-[9.8px] font-bold uppercase tracking-widest whitespace-nowrap';

  // .side-nav .side-nav-item .side-nav-link: flex, gap 12px, color transitions only
  // (no background on hover/active in the default light skin), font-size 0.875rem,
  // font-weight 400, padding 8px 12px, border-radius 5px
  const linkClass = (active) => `flex items-center rounded-[5px] transition-colors duration-[250ms] ease-in-out whitespace-nowrap text-sm font-normal ${
    isCollapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'gap-3 px-3 py-2'
  } ${active ? palette.active : `${palette.itemColor} ${palette.hoverActiveColor}`}`;

  const buttonClass = (active) => `flex items-center justify-between w-full rounded-[5px] px-3 py-2 text-sm font-normal transition-colors duration-[250ms] ease-in-out ${
    active ? palette.active : `${palette.itemColor} ${palette.hoverActiveColor}`
  }`;

  // .side-nav .sub-menu .side-nav-item .side-nav-link: font-size 0.875rem, font-weight 400,
  // padding: 7px 12px 7px calc(16px + 12px + 12px) => 7px 12px 7px 40px (pl-10)
  const subLinkClass = (active) => `block rounded-[5px] py-[7px] pr-3 pl-10 text-sm font-normal transition-colors duration-[250ms] ease-in-out ${
    active ? palette.active : `${palette.itemColor} ${palette.hoverActiveColor}`
  }`;

  const NavLink = ({ to, icon: Icon, label, active, title }) => (
    <Link to={to} title={isCollapsed ? (title || label) : ''} className={linkClass(active)}>
      <Icon className={isCollapsed ? 'w-4 h-4 shrink-0' : 'w-4 h-4 shrink-0'} />
      {!isCollapsed && <span className="overflow-hidden text-ellipsis">{label}</span>}
    </Link>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* --ins-sidenav-width: 240px (w-60), --ins-sidenav-width-sm: 75px,
          --ins-sidenav-bg: #fff, --ins-sidenav-border-color: #e7e9eb */}
      <aside className={`fixed top-16 lg:top-16 bottom-0 left-0 z-50 lg:z-20 flex flex-col bg-white text-[#6c757d] border-r border-[#e7e9eb] transition-all duration-300 transform lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        isCollapsed ? 'w-[75px]' : 'w-60'
      }`}>
        {/* .side-nav: flex column, gap 5px, padding-bottom 50px */}
        <nav className={`hide-scrollbar flex-grow flex flex-col gap-[5px] pt-2 pb-[50px] ${isCollapsed ? 'px-1' : 'px-[10px]'}`}>
          {!isCollapsed && <div className={`${sectionClass} mt-2 ${palette.title}`}>Navigation</div>}
          {can('dashboard.view') && <NavLink to={adminPath('/')} icon={Gauge} label="Dashboard" active={isActive('/') || isActive('/dashboard')} />}

          {!isCollapsed && <div className={`${sectionClass} mt-2 ${palette.title}`}>People</div>}
          {can('people.jobs.view') && <NavLink to={adminPath('/jobs')} icon={Table2} label="Jobs" active={isPathActive('/jobs')} />}
          {can('people.jobseekers.view') && <NavLink to={adminPath('/jobseekers')} icon={UserSearch} label="Jobseeker" active={isPathActive('/jobseekers')} />}
          {can('people.employers.view') && <NavLink to={adminPath('/employers')} icon={Handshake} label="Employer" active={isPathActive('/employers')} />}

          {!isCollapsed && <div className={`${sectionClass} ${palette.title}`}>Masters</div>}
          {can('masters.plans') && <div>
            {isCollapsed ? (
              <NavLink
                to={adminPath('/jobseeker-plans')}
                icon={Gift}
                label="Jobseeker Plans"
                active={isGroupActive(allJobseekerPlanPaths)}
              />
            ) : (
              <>
                <button
                  onClick={() => toggleMenu('plans')}
                  className={buttonClass(isGroupActive(allJobseekerPlanPaths))}
                >
                  <div className="flex items-center gap-3">
                    <Gift className="w-4 h-4 shrink-0" />
                    <span>Jobseeker Plans</span>
                  </div>
                  {openMenus.plans ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {openMenus.plans && (
                  <div className="flex flex-col gap-1 mt-[5px]">
                    <Link to={adminPath('/jobseeker-plans')} className={subLinkClass(isActive('/jobseeker-plans') || isActive('/jobseeker-packages') || isActive('/plans'))}>Plan Master</Link>
                    <Link to={adminPath('/jobseeker-features')} className={subLinkClass(isActive('/jobseeker-features') || isActive('/features'))}>Feature Master</Link>
                    <Link to={adminPath('/jobseeker-plan-mappings')} className={subLinkClass(isActive('/jobseeker-plan-mappings') || isActive('/plan-mappings'))}>Plan Mapping</Link>
                  </div>
                )}
              </>
            )}
          </div>}
          {can('masters.plans') && <div>
            {isCollapsed ? (
              <NavLink
                to={adminPath('/employer-plans')}
                icon={Building2}
                label="Employer Plans"
                active={isGroupActive(employerPlanPaths)}
              />
            ) : (
              <>
                <button
                  onClick={() => toggleMenu('employerPlans')}
                  className={buttonClass(isGroupActive(employerPlanPaths))}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>Employer Plans</span>
                  </div>
                  {openMenus.employerPlans ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {openMenus.employerPlans && (
                  <div className="flex flex-col gap-1 mt-[5px]">
                    <Link to={adminPath('/employer-plans')} className={subLinkClass(isActive('/employer-plans'))}>Plan Listings</Link>
                    <Link to={adminPath('/employer-plans/add')} className={subLinkClass(isActive('/employer-plans/add'))}>Add Plan</Link>
                  </div>
                )}
              </>
            )}
          </div>}
          {can('masters.industry') && <NavLink to={adminPath('/industry-types')} icon={Factory} label="Industrial Type" active={isActive('/industry-types')} />}
          {can('masters.categories') && <NavLink to={adminPath('/job-categories')} icon={Layers} label="Job Categories" active={isActive('/job-categories')} />}
          {can('masters.jobtypes') && <NavLink to={adminPath('/job-types')} icon={Briefcase} label="Job Types" active={isActive('/job-types')} />}
          {can('masters.qualifications') && <NavLink to={adminPath('/qualifications')} icon={GraduationCap} label="Qualifications" active={isActive('/qualifications')} />}

          {can('masters.locations') && <div>
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
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>Locations</span>
                  </div>
                  {openMenus.locations ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {openMenus.locations && (
                  <div className="flex flex-col gap-1 mt-[5px]">
                    <Link to={adminPath('/countries')} className={subLinkClass(isActive('/countries'))}>Country</Link>
                    <Link to={adminPath('/states')} className={subLinkClass(isActive('/states'))}>State</Link>
                    <Link to={adminPath('/districts')} className={subLinkClass(isActive('/districts'))}>District</Link>
                    <Link to={adminPath('/cities')} className={subLinkClass(isActive('/cities'))}>City</Link>
                  </div>
                )}
              </>
            )}
          </div>}

          {!isCollapsed && <div className={`${sectionClass} ${palette.title}`}>Finance</div>}
          {can('finance.payments.view') && <NavLink to={adminPath('/payments')} icon={CreditCard} label="Payments" active={isPathActive('/payments')} />}
          {can('finance.transactions.view') && <NavLink to={adminPath('/payments/transactions')} icon={ArrowRightLeft} label="Transactions" active={isPathActive('/payments/transactions')} />}

          {!isCollapsed && <div className={`${sectionClass} ${palette.title}`}>Content</div>}
          {can('content.cms') && <NavLink to={adminPath('/cms-pages')} icon={FileText} label="CMS Pages" active={isActive('/cms-pages')} />}
          {can('content.blog') && <NavLink to={adminPath('/blog')} icon={Rss} label="Blog" active={isPathActive('/blog') || isPathActive('/blog-categories')} />}

          {!isCollapsed && <div className={`${sectionClass} ${palette.title}`}>System</div>}
          {can('system.reports') && <NavLink to={adminPath('/reports')} icon={BarChart3} label="Reports" active={isPathActive('/reports')} />}
          {can('system.settings') && <NavLink to={adminPath('/settings')} icon={Settings} label="Settings" active={isActive('/settings')} />}
          {(can('system.users') || can('system.roles')) && (
            <NavLink to={adminPath('/users-roles')} icon={Users} label="Users & Roles" active={isPathActive('/users-roles')} />
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;