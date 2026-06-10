import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Gauge, 
  Factory, 
  Briefcase, 
  Layers, 
  GraduationCap,
  MapPin, 
  Gift,
  ChevronDown,
  ChevronRight,
  Users,
  Handshake
} from 'lucide-react';

export const Sidebar = ({ isOpen, isCollapsed, toggleSidebar }) => {
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState({
    locations: location.pathname.startsWith('/countries') || location.pathname.startsWith('/states') || location.pathname.startsWith('/districts') || location.pathname.startsWith('/cities'),
    packages: location.pathname.startsWith('/jobseeker-packages') || location.pathname.startsWith('/plans') || location.pathname.startsWith('/features') || location.pathname.startsWith('/plan-mappings')
  });

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isActive = (path) => location.pathname === path;
  const isGroupActive = (paths) => paths.some(path => location.pathname.startsWith(path));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 lg:top-16 bottom-0 left-0 z-50 lg:z-20 flex flex-col bg-white text-slate-700 border-r border-slate-200 transition-all duration-300 transform lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>

        {/* Navigation Menu */}
        <nav className={`flex-grow py-6 overflow-y-auto ${isCollapsed ? 'px-1 space-y-4' : 'px-4 space-y-1'}`}>
          
          {/* NAVIGATION */}
          {!isCollapsed && (
            <div className="px-3 mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
          )}

          {/* Dashboard */}
          <Link
            to="/"
            title={isCollapsed ? "Dashboard" : ""}
            className={`flex items-center rounded-lg transition-all duration-150 ${
              isCollapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'gap-3 px-3 py-2.5 text-sm font-semibold'
            } ${
              isActive('/') 
                ? 'bg-indigo-50/70 text-indigo-600' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Gauge className="w-4.5 h-4.5 shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>

          {/* MASTERS */}
          {!isCollapsed && (
            <div className="px-3 pt-5 mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Masters
            </div>
          )}

          {/* Industry Type */}
          <Link
            to="/industry-types"
            title={isCollapsed ? "Industry Type" : ""}
            className={`flex items-center rounded-lg transition-all duration-150 ${
              isCollapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'gap-3 px-3 py-2.5 text-sm font-semibold'
            } ${
              isActive('/industry-types') 
                ? 'bg-indigo-50/70 text-indigo-600' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Factory className="w-4.5 h-4.5 shrink-0" />
            {!isCollapsed && <span>Industry Type</span>}
          </Link>

          {/* Job Type */}
          <Link
            to="/job-types"
            title={isCollapsed ? "Job Type" : ""}
            className={`flex items-center rounded-lg transition-all duration-150 ${
              isCollapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'gap-3 px-3 py-2.5 text-sm font-semibold'
            } ${
              isActive('/job-types') 
                ? 'bg-indigo-50/70 text-indigo-600' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Briefcase className="w-4.5 h-4.5 shrink-0" />
            {!isCollapsed && <span>Job Type</span>}
          </Link>

          {/* Job Category */}
          <Link
            to="/job-categories"
            title={isCollapsed ? "Job Category" : ""}
            className={`flex items-center rounded-lg transition-all duration-150 ${
              isCollapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'gap-3 px-3 py-2.5 text-sm font-semibold'
            } ${
              isActive('/job-categories') 
                ? 'bg-indigo-50/70 text-indigo-600' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4.5 h-4.5 shrink-0" />
            {!isCollapsed && <span>Job Category</span>}
          </Link>

          {/* Qualification */}
          <Link
            to="/qualifications"
            title={isCollapsed ? "Qualification" : ""}
            className={`flex items-center rounded-lg transition-all duration-150 ${
              isCollapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'gap-3 px-3 py-2.5 text-sm font-semibold'
            } ${
              isActive('/qualifications') 
                ? 'bg-indigo-50/70 text-indigo-600' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <GraduationCap className="w-4.5 h-4.5 shrink-0" />
            {!isCollapsed && <span>Qualification</span>}
          </Link>

          {/* Collapsible Locations */}
          <div>
            {isCollapsed ? (
              <Link
                to="/countries"
                title="Locations"
                className={`flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all duration-150 ${
                  isGroupActive(['/countries', '/states', '/districts', '/cities'])
                    ? 'bg-indigo-50/70 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-4.5 h-4.5 shrink-0" />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => toggleMenu('locations')}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isGroupActive(['/countries', '/states', '/districts', '/cities'])
                      ? 'text-indigo-600 bg-indigo-50/30'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4.5 h-4.5 shrink-0" />
                    <span>Locations</span>
                  </div>
                  {openMenus.locations ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>
                
                {openMenus.locations && (
                  <div className="pl-9 mt-1 space-y-1">
                    <Link
                      to="/countries"
                      className={`block py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                        isActive('/countries')
                          ? 'text-indigo-600 bg-indigo-50/50'
                          : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                      }`}
                    >
                      Country
                    </Link>
                    <Link
                      to="/states"
                      className={`block py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                        isActive('/states')
                          ? 'text-indigo-600 bg-indigo-50/50'
                          : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                      }`}
                    >
                      State
                    </Link>
                    <Link
                      to="/districts"
                      className={`block py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                        isActive('/districts')
                          ? 'text-indigo-600 bg-indigo-50/50'
                          : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                      }`}
                    >
                      District
                    </Link>
                    <Link
                      to="/cities"
                      className={`block py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                        isActive('/cities')
                          ? 'text-indigo-600 bg-indigo-50/50'
                          : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                      }`}
                    >
                      City
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Collapsible Packages */}
          <div>
            {isCollapsed ? (
              <Link
                to="/jobseeker-packages"
                title="Jobseeker Packages"
                className={`flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all duration-150 ${
                  isGroupActive(['/jobseeker-packages', '/plans', '/features', '/plan-mappings'])
                    ? 'bg-indigo-50/70 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <Gift className="w-4.5 h-4.5 shrink-0" />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => toggleMenu('packages')}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isGroupActive(['/jobseeker-packages', '/plans', '/features', '/plan-mappings'])
                      ? 'text-indigo-600 bg-indigo-50/30'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Gift className="w-4.5 h-4.5 shrink-0" />
                    <span>Jobseeker Packages</span>
                  </div>
                  {openMenus.packages ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>
                
                {openMenus.packages && (
                  <div className="pl-9 mt-1 space-y-1">
                    <Link
                      to="/jobseeker-packages"
                      className={`block py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                        isActive('/jobseeker-packages') || isActive('/plans')
                          ? 'text-indigo-600 bg-indigo-50/50'
                          : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                      }`}
                    >
                      Jobseeker Plan Master
                    </Link>
                    <Link
                      to="/features"
                      className={`block py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                        isActive('/features')
                          ? 'text-indigo-600 bg-indigo-50/50'
                          : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                      }`}
                    >
                      Feature Master
                    </Link>
                    <Link
                      to="/plan-mappings"
                      className={`block py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                        isActive('/plan-mappings')
                          ? 'text-indigo-600 bg-indigo-50/50'
                          : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                      }`}
                    >
                      Plan Mapping
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* APPLICATION */}
          {!isCollapsed && (
            <div className="px-3 pt-5 mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Application
            </div>
          )}

          {/* Employer */}
          <Link
            to="/employers"
            title={isCollapsed ? "Employer" : ""}
            className={`flex items-center rounded-lg transition-all duration-150 ${
              isCollapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'gap-3 px-3 py-2.5 text-sm font-semibold'
            } ${
              location.pathname.startsWith('/employers')
                ? 'bg-indigo-50/70 text-indigo-600'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Handshake className="w-4.5 h-4.5 shrink-0" />
            {!isCollapsed && <span>Employer</span>}
          </Link>

          {/* Jobseeker */}
          <Link
            to="/jobseekers"
            title={isCollapsed ? "Jobseeker" : ""}
            className={`flex items-center rounded-lg transition-all duration-150 ${
              isCollapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'gap-3 px-3 py-2.5 text-sm font-semibold'
            } ${
              location.pathname.startsWith('/jobseekers')
                ? 'bg-indigo-50/70 text-indigo-600'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4.5 h-4.5 shrink-0" />
            {!isCollapsed && <span>Jobseeker</span>}
          </Link>

          {/* Jobs Posting */}
          <Link
            to="/jobs"
            title={isCollapsed ? "Jobs" : ""}
            className={`flex items-center rounded-lg transition-all duration-150 ${
              isCollapsed ? 'justify-center p-2.5 mx-auto w-10 h-10' : 'gap-3 px-3 py-2.5 text-sm font-semibold'
            } ${
              location.pathname.startsWith('/jobs')
                ? 'bg-indigo-50/70 text-indigo-600'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Briefcase className="w-4.5 h-4.5 shrink-0" />
            {!isCollapsed && <span>Jobs</span>}
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
