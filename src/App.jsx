import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, isSuperAdminUser, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

/* ==========================================
   1. PAGE COMPONENT IMPORTS
   ========================================== */

// Auth Pages (Job Seekers & Employers)
import PublicLogin from './pages/auth/Login';
import SuperAdminLogin from './pages/superadmin/auth/Login';
import JobSeekerRegister from './pages/auth/Register';
import EmployerRegister from './pages/auth/EmployerRegister';
import ForgotPassword from './pages/superadmin/auth/ForgotPassword';

// Public Portal Pages (Visitor Pages)
import PublicPage from './pages/public/PublicPage';
import PublicBlogs from './pages/public/PublicBlogs';

// Protected Route Guards
import { EmployerProtectedRoute, JobseekerProtectedRoute } from './utils/protectedRoutes';

// Lazily imported dashboards to keep initial page load bundle size small
const EmployerLayout = lazy(() => import('./pages/employer/EmployerLayout'));
const EmployerDashboard = lazy(() => import('./pages/employer/dashboard/EmployerDashboard'));
const EmployerPlaceholder = lazy(() => import('./pages/employer/EmployerPlaceholder'));
const EmployerCompanyProfile = lazy(() => import('./pages/employer/company/EmployerCompanyProfile'));
const EmployerSubscription = lazy(() => import('./pages/employer/subscription/EmployerSubscription'));
const EmployerTalentPool = lazy(() => import('./pages/employer/talentpool/EmployerTalentPool'));
const EmployerSettings = lazy(() => import('./pages/employer/settings/EmployerSettings'));
const EmployerSupport = lazy(() => import('./pages/employer/support/EmployerSupport'));
const EmployerJobDetails = lazy(() => import('./pages/employer/jobs/EmployerJobDetails'));
const EmployerJobs = lazy(() => import('./pages/employer/jobs/EmployerJobs'));
const EmployerPostJob = lazy(() => import('./pages/employer/jobs/EmployerPostJob'));
const EmployerSearchCandidates = lazy(() => import('./pages/employer/candidates/EmployerSearchCandidates'));
const EmployerCandidateProfile = lazy(() => import('./pages/employer/candidates/EmployerCandidateProfile'));
const EmployerApplications = lazy(() => import('./pages/employer/applications/EmployerApplications'));
const EmployerApplicationDetails = lazy(() => import('./pages/employer/applications/EmployerApplicationDetails'));
const EmployerShortlisted = lazy(() => import('./pages/employer/candidates/EmployerShortlisted'));
const EmployerInterviews = lazy(() => import('./pages/employer/interviews/EmployerInterviews'));
const EmployerPortalReports = lazy(() => import('./pages/employer/reports/EmployerReports'));
const EmployerSelected = lazy(() => import('./pages/employer/selected/EmployerSelected'));

// Jobseeker Portal
const JobseekerLayout = lazy(() => import('./pages/jobseeker/JobseekerLayout'));
const JobseekerDashboard = lazy(() => import('./pages/jobseeker/dashboard/JobseekerDashboard'));
const JobseekerApplications = lazy(() => import('./pages/jobseeker/applications/JobseekerApplications'));
const JobseekerChat = lazy(() => import('./pages/jobseeker/chat/JobseekerChat'));
const JobseekerSubscription = lazy(() => import('./pages/jobseeker/subscription/JobseekerSubscription'));
const JobseekerProfile = lazy(() => import('./pages/jobseeker/profile/JobseekerProfile'));
const JobseekerSavedJobs = lazy(() => import('./pages/jobseeker/savedjobs/JobseekerSavedJobs'));
const JobseekerSavedEmployers = lazy(() => import('./pages/jobseeker/savedemployers/JobseekerSavedEmployers'));

// Admin Core & Master Pages
const Dashboard = lazy(() => import('./pages/superadmin/dashboard/Dashboard'));
const Country = lazy(() => import('./pages/superadmin/masters/Country'));
const State = lazy(() => import('./pages/superadmin/masters/State'));
const District = lazy(() => import('./pages/superadmin/masters/District'));
const IndustryType = lazy(() => import('./pages/superadmin/masters/IndustryType'));
const JobType = lazy(() => import('./pages/superadmin/masters/JobType'));
const JobCategory = lazy(() => import('./pages/superadmin/masters/JobCategory'));
const Qualification = lazy(() => import('./pages/superadmin/masters/Qualification'));
const City = lazy(() => import('./pages/superadmin/masters/City'));

// Admin Plans & Settings Pages
const FeatureMaster = lazy(() => import('./pages/superadmin/plans/FeatureMaster'));
const PlanMaster = lazy(() => import('./pages/superadmin/plans/PlanMaster'));
const PlanMapping = lazy(() => import('./pages/superadmin/plans/PlanMapping'));

// Destructured admin plans module wrappers to prevent import breaks
const EmployerPlanForm = (props) => {
  const [Component, setComponent] = useState(null);
  useEffect(() => {
    import('./pages/superadmin/plans/EmployerPlans').then(m => setComponent(() => m.EmployerPlanForm));
  }, []);
  return Component ? <Component {...props} /> : null;
};

const EmployerPlanListings = (props) => {
  const [Component, setComponent] = useState(null);
  useEffect(() => {
    import('./pages/superadmin/plans/EmployerPlans').then(m => setComponent(() => m.EmployerPlanListings));
  }, []);
  return Component ? <Component {...props} /> : null;
};

// Admin People Management Pages
const Employers = lazy(() => import('./pages/superadmin/people/Employers'));
const AddEmployer = lazy(() => import('./pages/superadmin/people/AddEmployer'));
const Jobseekers = lazy(() => import('./pages/superadmin/people/Jobseekers'));
const AddJobseeker = lazy(() => import('./pages/superadmin/people/AddJobseeker'));
const Jobs = lazy(() => import('./pages/superadmin/people/Jobs'));
const PostJob = lazy(() => import('./pages/superadmin/people/PostJob'));

// Admin Finance & Content Management
const Payments = lazy(() => import('./pages/superadmin/finance/Payments'));
const AddPayment = lazy(() => import('./pages/superadmin/finance/AddPayment'));
const Transactions = lazy(() => import('./pages/superadmin/finance/Transactions'));
const CMSPages = lazy(() => import('./pages/superadmin/content/CMSPages'));
const Blog = lazy(() => import('./pages/superadmin/content/Blog'));
const BlogCategory = lazy(() => import('./pages/superadmin/content/BlogCategory'));

// Admin Reports Pages
const Reports = lazy(() => import('./pages/superadmin/reports/Reports'));
const JobReports = lazy(() => import('./pages/superadmin/reports/JobReports'));
const ApplicationReports = lazy(() => import('./pages/superadmin/reports/ApplicationReports'));
const CandidateReports = lazy(() => import('./pages/superadmin/reports/CandidateReports'));
const EmployerReports = lazy(() => import('./pages/superadmin/reports/EmployerReports'));
const FinanceReports = lazy(() => import('./pages/superadmin/reports/FinanceReports'));

// Admin System Settings Pages
const UsersRoles = lazy(() => import('./pages/superadmin/system/UsersRoles'));
const Roles = lazy(() => import('./pages/superadmin/system/Roles'));
const AddRole = lazy(() => import('./pages/superadmin/system/AddRole'));
const Users = lazy(() => import('./pages/superadmin/system/Users'));
const AddUser = lazy(() => import('./pages/superadmin/system/AddUser'));
const Settings = lazy(() => import('./pages/superadmin/system/Settings'));


/* ==========================================
   2. SECURITY GUARDS & ROUTE REDIRECTS
   ========================================== */

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search]);

  return null;
};

// Protected Route Guard: Checks auth and superadmin access
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/superadmin-login" replace />;
  }

  const canAccessAdmin = isSuperAdminUser(user);
  if (!canAccessAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-4 max-w-sm">
          Your account role ({user.roleName || user.role}) does not have permissions to view administrative records.
        </p>
        <Navigate to="/superadmin-login" replace />
      </div>
    );
  }

  return <Outlet />;
};




/* ==========================================
   3. SECURE ADMIN ROUTE CONTROLLER
   ========================================== */

// Sub-router containing all administrative panels
const AdminSubRoutes = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Routes>
        {/* Core Dashboard */}
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Masters Data */}
        <Route path="countries" element={<Country />} />
        <Route path="states" element={<State />} />
        <Route path="districts" element={<District />} />
        <Route path="cities" element={<City />} />
        <Route path="industry-types" element={<IndustryType />} />
        <Route path="job-types" element={<JobType />} />
        <Route path="job-categories" element={<JobCategory />} />
        <Route path="qualifications" element={<Qualification />} />

        {/* Plan Configurations */}
        <Route path="jobseeker-features" element={<FeatureMaster />} />
        <Route path="jobseeker-plans" element={<PlanMaster />} />
        <Route path="jobseeker-plan-mappings" element={<PlanMapping />} />
        <Route path="features" element={<Navigate to="/admin/jobseeker-features" replace />} />
        <Route path="jobseeker-packages" element={<Navigate to="/admin/jobseeker-plans" replace />} />
        <Route path="plans" element={<Navigate to="/admin/jobseeker-plans" replace />} />
        <Route path="plan-mappings" element={<Navigate to="/admin/jobseeker-plan-mappings" replace />} />
        <Route path="employer-plans" element={<EmployerPlanListings />} />
        <Route path="employer-plans/add" element={<EmployerPlanForm />} />
        <Route path="employer-plans/edit/:id" element={<EmployerPlanForm />} />

        {/* People / Directory Management */}
        <Route path="employers" element={<Employers />} />
        <Route path="employers/add" element={<AddEmployer />} />
        <Route path="employers/edit/:id" element={<AddEmployer />} />
        <Route path="jobseekers" element={<Jobseekers />} />
        <Route path="jobseekers/add" element={<AddJobseeker />} />
        <Route path="jobseekers/edit/:id" element={<AddJobseeker />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/add" element={<PostJob />} />
        <Route path="jobs/edit/:id" element={<PostJob />} />

        {/* Finance Management */}
        <Route path="payments" element={<Payments />} />
        <Route path="payments/add" element={<AddPayment />} />
        <Route path="payments/edit/:id" element={<AddPayment />} />
        <Route path="payments/transactions" element={<Transactions />} />

        {/* Content Management (CMS & Blogs) */}
        <Route path="cms-pages" element={<CMSPages />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog-categories" element={<BlogCategory />} />

        {/* Administrative System Roles & Users */}
        <Route path="users-roles" element={<UsersRoles />} />
        <Route path="users-roles/roles" element={<Roles />} />
        <Route path="users-roles/roles/add" element={<AddRole />} />
        <Route path="users-roles/roles/edit/:id" element={<AddRole />} />
        <Route path="users-roles/users" element={<Users />} />
        <Route path="users-roles/users/add" element={<AddUser />} />
        <Route path="users-roles/users/edit/:id" element={<AddUser />} />
        <Route path="settings" element={<Settings />} />

        {/* System Reports */}
        <Route path="reports" element={<Reports />} />
        <Route path="reports/jobs" element={<JobReports />} />
        <Route path="reports/applications" element={<ApplicationReports />} />
        <Route path="reports/candidates" element={<CandidateReports />} />
        <Route path="reports/employers" element={<EmployerReports />} />
        <Route path="reports/finance" element={<FinanceReports />} />

        {/* Wildcard admin fallback */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Suspense>
  );
};


/* ==========================================
   4. ADMINISTRATIVE CORE PORTAL LAYOUT
   ========================================== */

// Layout wrapper for all authenticated admin screens
const AppLayout = () => {
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpenMobile(!sidebarOpenMobile);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Navigation Header bar */}
      <Header 
        toggleSidebar={handleToggleSidebar} 
        isCollapsed={sidebarCollapsed} 
        title="JobsWaale Admin Portal" 
      />

      <div className="flex flex-1 relative min-w-0 pt-16">
        {/* Left Navigation Sidebar panel */}
        <Sidebar 
          isOpen={sidebarOpenMobile} 
          isCollapsed={sidebarCollapsed} 
          toggleSidebar={() => setSidebarOpenMobile(false)} 
        />

        {/* Dynamic Route Screen view container */}
        <div className={`min-w-0 flex-grow flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'} bg-slate-50 `}>
          <main className="admin-content min-w-0 flex-grow p-4 md:p-6 lg:p-8 w-full mx-auto overflow-x-hidden">
            <AdminSubRoutes />
          </main>
        </div>
      </div>
    </div>
  );
};


/* ==========================================
   5. TOP LEVEL ROUTING ARCHITECTURE
   ========================================== */

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* A. Visitor Authentication Routes */}
          <Route path="/login" element={<PublicLogin />} />
          <Route path="/superadmin-login" element={<SuperAdminLogin />} />      
          <Route path="/jobseeker-register" element={<JobSeekerRegister />} />
          <Route path="/employer-register" element={<EmployerRegister />} />
          <Route path="/forgot-password-SuperAdmin" element={<ForgotPassword />} />

          {/* B. Secure SuperAdmin Console Route Block */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/*" element={<AppLayout />} />
          </Route>

          {/* C. Public Employers Page */}
          <Route path="/employers" element={<PublicPage />} />

          {/* D. Secure Employer Console Route Block */}
          <Route element={<EmployerProtectedRoute />}>
            <Route path="/employer" element={
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen bg-slate-50">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                <EmployerLayout />
              </Suspense>
            }>
              <Route index element={<EmployerDashboard />} />
              <Route path="dashboard" element={<EmployerDashboard />} />
              <Route path="jobs" element={<EmployerJobs />} />
              <Route path="jobs/create" element={<EmployerPostJob />} />
              <Route path="jobs/:id/edit" element={<EmployerPostJob />} />
              <Route path="jobs/:id" element={<EmployerJobDetails />} />
              <Route path="applications" element={<EmployerApplications />} />
              <Route path="applications/:id" element={<EmployerApplicationDetails />} />
              <Route path="shortlisted" element={<EmployerShortlisted />} />
              <Route path="interviews" element={<EmployerInterviews />} />
              <Route path="selected" element={<EmployerSelected />} />
              <Route path="candidates" element={<EmployerSearchCandidates />} />
              <Route path="candidateProfile/:id" element={<EmployerCandidateProfile />} />
              <Route path="company" element={<EmployerCompanyProfile />} />
              <Route path="payments" element={<EmployerPlaceholder title="Payments" />} />
              <Route path="subscription" element={<EmployerSubscription />} />
              <Route path="talent-pool" element={<EmployerTalentPool />} />
              <Route path="messages" element={<EmployerPlaceholder title="Messages" />} />
              <Route path="reports" element={<EmployerPortalReports />} />
              <Route path="settings" element={<EmployerSettings />} />
              <Route path="support" element={<EmployerSupport />} />
              <Route path="*" element={<Navigate to="/employer" replace />} />
            </Route>
          </Route>

          {/* E. Public Web Blogs Pages */}
          <Route path="/blogs" element={<PublicBlogs />} />
          <Route path="/blogs/:slug" element={<PublicBlogs />} />
          
          {/* F. Secure Jobseeker Console Route Block */}
          <Route element={<JobseekerProtectedRoute />}>
            <Route path="/jobseeker" element={
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen bg-slate-50">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                <JobseekerLayout />
              </Suspense>
            }>
              <Route index element={<JobseekerDashboard />} />
              <Route path="dashboard" element={<JobseekerDashboard />} />
              <Route path="profile" element={<JobseekerProfile />} />
              <Route path="subscription" element={<JobseekerSubscription />} />
              <Route path="jobs-applied" element={<JobseekerApplications />} />
              <Route path="saved-jobs" element={<JobseekerSavedJobs />} />
              <Route path="saved-employers" element={<JobseekerSavedEmployers />} />
              <Route path="messages" element={<JobseekerChat />} />
              <Route path="applications" element={<JobseekerApplications />} />
              
              <Route path="*" element={<Navigate to="/jobseeker" replace />} />
            </Route>
          </Route>
          
          {/* F. Public Web Portal Wildcard Route Fallback */}
          <Route path="/jobs/:id" element={<PublicPage />} />
          <Route path="*" element={<PublicPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
