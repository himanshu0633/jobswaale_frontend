import { useState } from 'react';
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
import EmployerLayout, { EmployerProtectedRoute } from './pages/employer/EmployerLayout';
import EmployerDashboard from './pages/employer/dashboard/EmployerDashboard';
import EmployerPlaceholder from './pages/employer/EmployerPlaceholder';
import EmployerJobDetails from './pages/employer/jobs/EmployerJobDetails';
import EmployerJobs from './pages/employer/jobs/EmployerJobs';
import EmployerPostJob from './pages/employer/jobs/EmployerPostJob';
import EmployerSearchCandidates from './pages/employer/candidates/EmployerSearchCandidates';
import EmployerApplications from './pages/employer/applications/EmployerApplications';
import EmployerShortlisted from './pages/employer/candidates/EmployerShortlisted';

// Admin Core & Master Pages
import Dashboard from './pages/superadmin/dashboard/Dashboard';
import Country from './pages/superadmin/masters/Country';
import State from './pages/superadmin/masters/State';
import District from './pages/superadmin/masters/District';
import IndustryType from './pages/superadmin/masters/IndustryType';
import JobType from './pages/superadmin/masters/JobType';
import JobCategory from './pages/superadmin/masters/JobCategory';
import Qualification from './pages/superadmin/masters/Qualification';
import City from './pages/superadmin/masters/City';

// Admin Plans & Settings Pages
import FeatureMaster from './pages/superadmin/plans/FeatureMaster';
import PlanMaster from './pages/superadmin/plans/PlanMaster';
import PlanMapping from './pages/superadmin/plans/PlanMapping';
import { EmployerPlanForm, EmployerPlanListings } from './pages/superadmin/plans/EmployerPlans';

// Admin People Management Pages
import Employers from './pages/superadmin/people/Employers';
import AddEmployer from './pages/superadmin/people/AddEmployer';
import Jobseekers from './pages/superadmin/people/Jobseekers';
import AddJobseeker from './pages/superadmin/people/AddJobseeker';
import Jobs from './pages/superadmin/people/Jobs';
import PostJob from './pages/superadmin/people/PostJob';

// Admin Finance & Content Management
import Payments from './pages/superadmin/finance/Payments';
import AddPayment from './pages/superadmin/finance/AddPayment';
import Transactions from './pages/superadmin/finance/Transactions';
import CMSPages from './pages/superadmin/content/CMSPages';
import Blog from './pages/superadmin/content/Blog';
import BlogCategory from './pages/superadmin/content/BlogCategory';

// Admin Reports Pages
import Reports from './pages/superadmin/reports/Reports';
import JobReports from './pages/superadmin/reports/JobReports';
import ApplicationReports from './pages/superadmin/reports/ApplicationReports';
import CandidateReports from './pages/superadmin/reports/CandidateReports';
import EmployerReports from './pages/superadmin/reports/EmployerReports';
import FinanceReports from './pages/superadmin/reports/FinanceReports';

// Admin System Settings Pages
import UsersRoles from './pages/superadmin/system/UsersRoles';
import Roles from './pages/superadmin/system/Roles';
import AddRole from './pages/superadmin/system/AddRole';
import Users from './pages/superadmin/system/Users';
import AddUser from './pages/superadmin/system/AddUser';
import Settings from './pages/superadmin/system/Settings';


/* ==========================================
   2. SECURITY GUARDS & ROUTE REDIRECTS
   ========================================== */

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

          {/* C. Secure Employer Console Route Block */}
          <Route element={<EmployerProtectedRoute />}>
            <Route path="/employer" element={<EmployerLayout />}>
              <Route index element={<EmployerDashboard />} />
              <Route path="dashboard" element={<EmployerDashboard />} />
              <Route path="jobs" element={<EmployerJobs />} />
              <Route path="jobs/create" element={<EmployerPostJob />} />
              <Route path="jobs/:id/edit" element={<EmployerPostJob />} />
              <Route path="jobs/:id" element={<EmployerJobDetails />} />
              <Route path="applications" element={<EmployerApplications />} />
              <Route path="shortlisted" element={<EmployerShortlisted />} />
              <Route path="interviews" element={<EmployerPlaceholder title="Interviews" />} />
              <Route path="selected" element={<EmployerPlaceholder title="Selected" />} />
              <Route path="candidates" element={<EmployerSearchCandidates />} />
              <Route path="company" element={<EmployerPlaceholder title="Company Profile" />} />
              <Route path="payments" element={<EmployerPlaceholder title="Payments" />} />
              <Route path="subscription" element={<EmployerPlaceholder title="Subscription" />} />
              <Route path="talent-pool" element={<EmployerPlaceholder title="Talent Pool" />} />
              <Route path="messages" element={<EmployerPlaceholder title="Messages" />} />
              <Route path="reports" element={<EmployerPlaceholder title="Reports" />} />
              <Route path="settings" element={<EmployerPlaceholder title="Settings" />} />
              <Route path="support" element={<EmployerPlaceholder title="Support Center" />} />
              <Route path="*" element={<Navigate to="/employer" replace />} />
            </Route>
          </Route>

          {/* D. Public Web Blogs Pages */}
          <Route path="/blogs" element={<PublicBlogs />} />
          <Route path="/blogs/:slug" element={<PublicBlogs />} />
          
          {/* E. Public Web Portal Wildcard Route Fallback */}
          <Route path="*" element={<PublicPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
