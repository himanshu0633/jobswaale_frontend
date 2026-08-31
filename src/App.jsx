import { Component, useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, isSuperAdminUser, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PageSkeleton from './components/SkeletonLoader';
import { hasPermission } from './utils/permissions';

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
const EmployerSearchResults = lazy(() => import('./pages/employer/search/EmployerSearchResults'));
const EmployerSearchCandidates = lazy(() => import('./pages/employer/candidates/EmployerSearchCandidates'));
const EmployerCandidateProfile = lazy(() => import('./pages/employer/candidates/EmployerCandidateProfile'));
const EmployerApplications = lazy(() => import('./pages/employer/applications/EmployerApplications'));
const EmployerApplicationDetails = lazy(() => import('./pages/employer/applications/EmployerApplicationDetails'));
const EmployerApplicantHistory = lazy(() => import('./pages/employer/applicants/EmployerApplicantHistory'));
const EmployerShortlisted = lazy(() => import('./pages/employer/candidates/EmployerShortlisted'));
const EmployerInterviews = lazy(() => import('./pages/employer/interviews/EmployerInterviews'));
const EmployerPortalReports = lazy(() => import('./pages/employer/reports/EmployerReports'));
const EmployerSelected = lazy(() => import('./pages/employer/selected/EmployerSelected'));
const EmployerMessages = lazy(() => import('./pages/employer/messages/EmployerMessages'));
const EmployerAutoMail = lazy(() => import('./pages/employer/automail/EmployerAutoMail'));
const EmployerOffers = lazy(() => import('./pages/employer/offers/EmployerOffers'));
const EmployerHired = lazy(() => import('./pages/employer/offers/EmployerHired'));
const EmployerEmailTemplates = lazy(() => import('./pages/employer/offers/EmployerEmailTemplates'));
const EmployerRejected = lazy(() => import('./pages/employer/candidates/EmployerRejected'));

// Jobseeker Portal
const JobseekerLayout = lazy(() => import('./pages/jobseeker/JobseekerLayout'));
const JobseekerDashboard = lazy(() => import('./pages/jobseeker/dashboard/JobseekerDashboard'));
const JobseekerApplications = lazy(() => import('./pages/jobseeker/applications/JobseekerApplications'));
const JobseekerChat = lazy(() => import('./pages/jobseeker/chat/JobseekerChat'));
const JobseekerSubscription = lazy(() => import('./pages/jobseeker/subscription/JobseekerSubscription'));
const JobseekerProfile = lazy(() => import('./pages/jobseeker/profile/JobseekerProfile'));
const JobseekerSavedJobs = lazy(() => import('./pages/jobseeker/savedjobs/JobseekerSavedJobs'));
const JobseekerSavedEmployers = lazy(() => import('./pages/jobseeker/savedemployers/JobseekerSavedEmployers'));
const JobseekerApplicationTracker = lazy(() => import('./pages/jobseeker/applications/JobseekerApplicationTracker'));

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

const isChunkLoadError = (error) => {
  const message = String(error?.message || error || '').toLowerCase();
  return (
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('loading chunk') ||
    message.includes('chunkloaderror')
  );
};

const reloadOnceForFreshAssets = () => {
  const key = 'jobswaale:asset-reload-attempted';
  if (sessionStorage.getItem(key) === '1') return false;
  sessionStorage.setItem(key, '1');
  window.location.reload();
  return true;
};

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    if (isChunkLoadError(error)) {
      reloadOnceForFreshAssets();
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-extrabold text-slate-900">Page could not be loaded</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Please refresh once. The latest website files may still be loading.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-md bg-[#6658dd] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#5848d8]"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}

const AssetRefreshGuard = () => {
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      if (isChunkLoadError(event.reason)) {
        reloadOnceForFreshAssets();
      }
    };

    const handleError = (event) => {
      if (isChunkLoadError(event.error || event.message)) {
        reloadOnceForFreshAssets();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
};

// Protected Route Guard: Checks auth and superadmin access
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-full max-w-6xl p-6">
          <PageSkeleton />
        </div>
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

const routePermissions = [
  { permission: 'dashboard.view', path: '/admin/dashboard' },
  { permission: 'people.jobs.view', path: '/admin/jobs' },
  { permission: 'people.jobseekers.view', path: '/admin/jobseekers' },
  { permission: 'people.employers.view', path: '/admin/employers' },
  { permission: 'masters.plans', path: '/admin/jobseeker-plans' },
  { permission: 'masters.industry', path: '/admin/industry-types' },
  { permission: 'masters.categories', path: '/admin/job-categories' },
  { permission: 'masters.jobtypes', path: '/admin/job-types' },
  { permission: 'masters.qualifications', path: '/admin/qualifications' },
  { permission: 'masters.locations', path: '/admin/countries' },
  { permission: 'finance.payments.view', path: '/admin/payments' },
  { permission: 'finance.transactions.view', path: '/admin/payments/transactions' },
  { permission: 'system.reports', path: '/admin/reports' },
  { permission: 'system.settings', path: '/admin/settings' },
  { permission: 'system.users', path: '/admin/users-roles/users' },
  { permission: 'system.roles', path: '/admin/users-roles/roles' },
];

const firstAllowedAdminPath = (user) => {
  const route = routePermissions.find(item => hasPermission(user, item.permission));
  return route?.path || null;
};

const PermissionRoute = ({ permission, children }) => {
  const { user } = useAuth();
  const permissions = Array.isArray(permission) ? permission : [permission];

  if (permission && !permissions.some(item => hasPermission(user, item))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="mb-2 text-2xl font-extrabold text-slate-900">Access Denied</h1>
        <p className="max-w-md text-sm font-medium text-slate-500">
          Your role does not have permission to open this page.
        </p>
      </div>
    );
  }

  return children;
};

const withPermission = (permission, element) => (
  <PermissionRoute permission={permission}>{element}</PermissionRoute>
);

const AuthorizedLanding = () => {
  const { user } = useAuth();
  const path = firstAllowedAdminPath(user);

  if (path) return <Navigate to={path} replace />;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="mb-2 text-2xl font-extrabold text-slate-900">No Access Assigned</h1>
      <p className="max-w-md text-sm font-medium text-slate-500">
        No pages are assigned to this role yet. Please ask the super admin to update role permissions.
      </p>
    </div>
  );
};




/* ==========================================
   3. SECURE ADMIN ROUTE CONTROLLER
   ========================================== */

// Sub-router containing all administrative panels
const AdminSubRoutes = () => {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* Core Dashboard */}
        <Route index element={<AuthorizedLanding />} />
        <Route path="dashboard" element={withPermission('dashboard.view', <Dashboard />)} />

        {/* Masters Data */}
        <Route path="countries" element={withPermission('masters.locations', <Country />)} />
        <Route path="states" element={withPermission('masters.locations', <State />)} />
        <Route path="districts" element={withPermission('masters.locations', <District />)} />
        <Route path="cities" element={withPermission('masters.locations', <City />)} />
        <Route path="industry-types" element={withPermission('masters.industry', <IndustryType />)} />
        <Route path="job-types" element={withPermission('masters.jobtypes', <JobType />)} />
        <Route path="job-categories" element={withPermission('masters.categories', <JobCategory />)} />
        <Route path="qualifications" element={withPermission('masters.qualifications', <Qualification />)} />

        {/* Plan Configurations */}
        <Route path="jobseeker-features" element={withPermission('masters.plans', <FeatureMaster />)} />
        <Route path="jobseeker-plans" element={withPermission('masters.plans', <PlanMaster />)} />
        <Route path="jobseeker-plan-mappings" element={withPermission('masters.plans', <PlanMapping />)} />
        <Route path="features" element={<Navigate to="/admin/jobseeker-features" replace />} />
        <Route path="jobseeker-packages" element={<Navigate to="/admin/jobseeker-plans" replace />} />
        <Route path="plans" element={<Navigate to="/admin/jobseeker-plans" replace />} />
        <Route path="plan-mappings" element={<Navigate to="/admin/jobseeker-plan-mappings" replace />} />
        <Route path="employer-plans" element={withPermission('masters.plans', <EmployerPlanListings />)} />
        <Route path="employer-plans/add" element={withPermission('masters.plans', <EmployerPlanForm />)} />
        <Route path="employer-plans/edit/:id" element={withPermission('masters.plans', <EmployerPlanForm />)} />

        {/* People / Directory Management */}
        <Route path="employers" element={withPermission('people.employers.view', <Employers />)} />
        <Route path="employers/add" element={withPermission('people.employers.manage', <AddEmployer />)} />
        <Route path="employers/edit/:id" element={withPermission('people.employers.manage', <AddEmployer />)} />
        <Route path="jobseekers" element={withPermission('people.jobseekers.view', <Jobseekers />)} />
        <Route path="jobseekers/add" element={withPermission('people.jobseekers.manage', <AddJobseeker />)} />
        <Route path="jobseekers/edit/:id" element={withPermission('people.jobseekers.manage', <AddJobseeker />)} />
        <Route path="jobs" element={withPermission('people.jobs.view', <Jobs />)} />
        <Route path="jobs/add" element={withPermission('people.jobs.create', <PostJob />)} />
        <Route path="jobs/edit/:id" element={withPermission('people.jobs.edit', <PostJob />)} />

        {/* Finance Management */}
        <Route path="payments" element={withPermission('finance.payments.view', <Payments />)} />
        <Route path="payments/add" element={withPermission('finance.payments.manage', <AddPayment />)} />
        <Route path="payments/edit/:id" element={withPermission('finance.payments.manage', <AddPayment />)} />
        <Route path="payments/transactions" element={withPermission('finance.transactions.view', <Transactions />)} />

        {/* Content Management (CMS & Blogs) */}
        <Route path="cms-pages" element={withPermission('content.cms', <CMSPages />)} />
        <Route path="blog" element={withPermission('content.blog', <Blog />)} />
        <Route path="blog-categories" element={withPermission('content.blog', <BlogCategory />)} />

        {/* Administrative System Roles & Users */}
        <Route path="users-roles" element={withPermission(['system.users', 'system.roles'], <UsersRoles />)} />
        <Route path="users-roles/roles" element={withPermission('system.roles', <Roles />)} />
        <Route path="users-roles/roles/add" element={withPermission('system.roles', <AddRole />)} />
        <Route path="users-roles/roles/edit/:id" element={withPermission('system.roles', <AddRole />)} />
        <Route path="users-roles/users" element={withPermission('system.users', <Users />)} />
        <Route path="users-roles/users/add" element={withPermission('system.users', <AddUser />)} />
        <Route path="users-roles/users/edit/:id" element={withPermission('system.users', <AddUser />)} />
        <Route path="settings" element={withPermission('system.settings', <Settings />)} />

        {/* System Reports */}
        <Route path="reports" element={withPermission('system.reports', <Reports />)} />
        <Route path="reports/jobs" element={withPermission('system.reports', <JobReports />)} />
        <Route path="reports/applications" element={withPermission('system.reports', <ApplicationReports />)} />
        <Route path="reports/candidates" element={withPermission('system.reports', <CandidateReports />)} />
        <Route path="reports/employers" element={withPermission('system.reports', <EmployerReports />)} />
        <Route path="reports/finance" element={withPermission('finance.reports', <FinanceReports />)} />

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
    <AppErrorBoundary>
      <AuthProvider>
        <Router>
          <AssetRefreshGuard />
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
                <div className="min-h-screen bg-slate-50 p-6">
                  <PageSkeleton />
                </div>
              }>
                <EmployerLayout />
              </Suspense>
            }>
              <Route index element={<EmployerDashboard />} />
              <Route path="dashboard" element={<EmployerDashboard />} />
              <Route path="search-results" element={<EmployerSearchResults />} />
              <Route path="jobs" element={<EmployerJobs />} />
              <Route path="jobs/create" element={<EmployerPostJob />} />
              <Route path="jobs/:id/edit" element={<EmployerPostJob />} />
              <Route path="jobs/:id" element={<EmployerJobDetails />} />
              <Route path="applications" element={<EmployerApplications />} />
              <Route path="applications/:id" element={<EmployerApplicationDetails />} />
              <Route path="applicant-history" element={<EmployerApplicantHistory />} />
              <Route path="shortlisted" element={<EmployerShortlisted />} />
              <Route path="interviews" element={<EmployerInterviews />} />
              <Route path="selected" element={<EmployerSelected />} />
              <Route path="rejected" element={<EmployerRejected />} />
              <Route path="offers" element={<EmployerOffers />} />
              <Route path="hired" element={<EmployerHired />} />
              <Route path="email-templates" element={<EmployerEmailTemplates />} />
              <Route path="candidates" element={<EmployerSearchCandidates />} />
              <Route path="candidateProfile/:id" element={<EmployerCandidateProfile />} />
              <Route path="company" element={<EmployerCompanyProfile />} />
              <Route path="payments" element={<EmployerPlaceholder title="Payments" />} />
              <Route path="subscription" element={<EmployerSubscription />} />
              <Route path="talent-pool" element={<EmployerTalentPool />} />
              <Route path="messages" element={<EmployerMessages />} />
              <Route path="auto-mail" element={<EmployerAutoMail />} />
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
                <div className="min-h-screen bg-slate-50 p-6">
                  <PageSkeleton />
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
              <Route path="applications/:id" element={<JobseekerApplicationTracker />} />
              
              <Route path="*" element={<Navigate to="/jobseeker" replace />} />
            </Route>
          </Route>
          
          {/* F. Public Web Portal Wildcard Route Fallback */}
          <Route path="/jobs/:id" element={<PublicPage />} />
          <Route path="*" element={<PublicPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </AppErrorBoundary>
  );
}

export default App;
