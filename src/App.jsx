import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, isSuperAdminUser, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import PublicLogin from './pages/auth/Login';
import SuperAdminLogin from './pages/superadmin/auth/Login';
import JobSeekerRegister from './pages/auth/Register';
import EmployerRegister from './pages/auth/EmployerRegister';
import ForgotPassword from './pages/superadmin/auth/ForgotPassword';
import PublicPage from './pages/public/PublicPage';
import PublicBlogs from './pages/public/PublicBlogs';
import Dashboard from './pages/superadmin/dashboard/Dashboard';
import Country from './pages/superadmin/masters/Country';
import State from './pages/superadmin/masters/State';
import District from './pages/superadmin/masters/District';
import IndustryType from './pages/superadmin/masters/IndustryType';
import JobType from './pages/superadmin/masters/JobType';
import JobCategory from './pages/superadmin/masters/JobCategory';
import Qualification from './pages/superadmin/masters/Qualification';
import City from './pages/superadmin/masters/City';
import FeatureMaster from './pages/superadmin/plans/FeatureMaster';
import PlanMaster from './pages/superadmin/plans/PlanMaster';
import PlanMapping from './pages/superadmin/plans/PlanMapping';
import { EmployerPlanForm, EmployerPlanListings } from './pages/superadmin/plans/EmployerPlans';
import Employers from './pages/superadmin/people/Employers';
import AddEmployer from './pages/superadmin/people/AddEmployer';
import Jobseekers from './pages/superadmin/people/Jobseekers';
import AddJobseeker from './pages/superadmin/people/AddJobseeker';
import Jobs from './pages/superadmin/people/Jobs';
import PostJob from './pages/superadmin/people/PostJob';
import Payments from './pages/superadmin/finance/Payments';
import AddPayment from './pages/superadmin/finance/AddPayment';
import Transactions from './pages/superadmin/finance/Transactions';
import CMSPages from './pages/superadmin/content/CMSPages';
import Blog from './pages/superadmin/content/Blog';
import BlogCategory from './pages/superadmin/content/BlogCategory';
import Reports from './pages/superadmin/reports/Reports';
import JobReports from './pages/superadmin/reports/JobReports';
import ApplicationReports from './pages/superadmin/reports/ApplicationReports';
import CandidateReports from './pages/superadmin/reports/CandidateReports';
import EmployerReports from './pages/superadmin/reports/EmployerReports';
import FinanceReports from './pages/superadmin/reports/FinanceReports';
import UsersRoles from './pages/superadmin/system/UsersRoles';
import Roles from './pages/superadmin/system/Roles';
import AddRole from './pages/superadmin/system/AddRole';
import Users from './pages/superadmin/system/Users';
import AddUser from './pages/superadmin/system/AddUser';
import Settings from './pages/superadmin/system/Settings';



// Protected Route Guard
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

const AdminLegacyRedirect = () => {
  const location = useLocation();
  return <Navigate to={`/admin${location.pathname}${location.search}`} replace />;
};

// Main Layout Wrapper
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
      {/* Top Header spans full-width across top of screen */}
      <Header 
        toggleSidebar={handleToggleSidebar} 
        isCollapsed={sidebarCollapsed} 
        title="JobsWaale Admin Portal" 
      />

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpenMobile} 
          isCollapsed={sidebarCollapsed} 
          toggleSidebar={() => setSidebarOpenMobile(false)} 
        />

        {/* Main Content Area */}
        <div className={`flex-grow flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'} bg-slate-50 `}>
          {/* Dynamic Route Content */}
          <main className="admin-content flex-grow p-4 md:p-6 lg:p-8 w-full mx-auto">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="countries" element={<Country />} />
              <Route path="states" element={<State />} />
              <Route path="districts" element={<District />} />
              <Route path="industry-types" element={<IndustryType />} />
              <Route path="job-types" element={<JobType />} />
              <Route path="job-categories" element={<JobCategory />} />
              <Route path="jobseeker-features" element={<FeatureMaster />} />
              <Route path="jobseeker-plans" element={<PlanMaster />} />
              <Route path="features" element={<Navigate to="/admin/jobseeker-features" replace />} />
              <Route path="jobseeker-packages" element={<Navigate to="/admin/jobseeker-plans" replace />} />
              <Route path="plans" element={<Navigate to="/admin/jobseeker-plans" replace />} />
              <Route path="qualifications" element={<Qualification />} />
              <Route path="cities" element={<City />} />
              <Route path="jobseeker-plan-mappings" element={<PlanMapping />} />
              <Route path="plan-mappings" element={<Navigate to="/admin/jobseeker-plan-mappings" replace />} />
              <Route path="employer-plans" element={<EmployerPlanListings />} />
              <Route path="employer-plans/add" element={<EmployerPlanForm />} />
              <Route path="employer-plans/edit/:id" element={<EmployerPlanForm />} />
              <Route path="employers" element={<Employers />} />
              <Route path="employers/add" element={<AddEmployer />} />
              <Route path="employers/edit/:id" element={<AddEmployer />} />
              <Route path="jobseekers" element={<Jobseekers />} />
              <Route path="jobseekers/add" element={<AddJobseeker />} />
              <Route path="jobseekers/edit/:id" element={<AddJobseeker />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="jobs/add" element={<PostJob />} />
              <Route path="jobs/edit/:id" element={<PostJob />} />
              <Route path="payments" element={<Payments />} />
              <Route path="payments/add" element={<AddPayment />} />
              <Route path="payments/edit/:id" element={<AddPayment />} />
              <Route path="payments/transactions" element={<Transactions />} />
              <Route path="cms-pages" element={<CMSPages />} />
              <Route path="users-roles" element={<UsersRoles />} />
              <Route path="users-roles/roles" element={<Roles />} />
              <Route path="users-roles/roles/add" element={<AddRole />} />
              <Route path="users-roles/roles/edit/:id" element={<AddRole />} />
              <Route path="users-roles/users" element={<Users />} />
              <Route path="users-roles/users/add" element={<AddUser />} />
              <Route path="users-roles/users/edit/:id" element={<AddUser />} />
              <Route path="settings" element={<Settings />} />
              <Route path="reports" element={<Reports />} />
              <Route path="reports/jobs" element={<JobReports />} />
              <Route path="reports/applications" element={<ApplicationReports />} />
              <Route path="reports/candidates" element={<CandidateReports />} />
              <Route path="reports/employers" element={<EmployerReports />} />
              <Route path="reports/finance" element={<FinanceReports />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog-categories" element={<BlogCategory />} />


              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Endpoints */}
          <Route path="/login" element={<PublicLogin />} />
          <Route path="/superadmin-login" element={<SuperAdminLogin />} />
          <Route path="/login-SuperAdmin" element={<Navigate to="/superadmin-login" replace />} />
          <Route path="/admin-login" element={<Navigate to="/superadmin-login" replace />} />
          <Route path="/jobseeker-register" element={<JobSeekerRegister />} />
          <Route path="/employer-register" element={<EmployerRegister />} />
          <Route path="/register" element={<Navigate to="/jobseeker-register" replace />} />
          <Route path="/JobSeekerRegister" element={<Navigate to="/jobseeker-register" replace />} />
          <Route path="/EmployerRegister" element={<Navigate to="/employer-register" replace />} />
          <Route path="/forgot-password-SuperAdmin" element={<ForgotPassword />} />

          {/* Secure Administrative Paths */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/*" element={<AppLayout />} />
          </Route>

          <Route path="/blogs" element={<PublicBlogs />} />
          <Route path="/blogs/:slug" element={<PublicBlogs />} />

          <Route path="/dashboard/*" element={<AdminLegacyRedirect />} />
          <Route path="/countries/*" element={<AdminLegacyRedirect />} />
          <Route path="/states/*" element={<AdminLegacyRedirect />} />
          <Route path="/districts/*" element={<AdminLegacyRedirect />} />
          <Route path="/industry-types/*" element={<AdminLegacyRedirect />} />
          <Route path="/job-types/*" element={<AdminLegacyRedirect />} />
          <Route path="/job-categories/*" element={<AdminLegacyRedirect />} />
          <Route path="/jobseeker-features/*" element={<AdminLegacyRedirect />} />
          <Route path="/jobseeker-plans/*" element={<AdminLegacyRedirect />} />
          <Route path="/features/*" element={<AdminLegacyRedirect />} />
          <Route path="/jobseeker-packages/*" element={<AdminLegacyRedirect />} />
          <Route path="/plans/*" element={<AdminLegacyRedirect />} />
          <Route path="/qualifications/*" element={<AdminLegacyRedirect />} />
          <Route path="/cities/*" element={<AdminLegacyRedirect />} />
          <Route path="/jobseeker-plan-mappings/*" element={<AdminLegacyRedirect />} />
          <Route path="/plan-mappings/*" element={<AdminLegacyRedirect />} />
          <Route path="/employer-plans/*" element={<AdminLegacyRedirect />} />
          <Route path="/employers/*" element={<AdminLegacyRedirect />} />
          <Route path="/jobseekers/*" element={<AdminLegacyRedirect />} />
          <Route path="/jobs/*" element={<AdminLegacyRedirect />} />
          <Route path="/payments/*" element={<AdminLegacyRedirect />} />
          <Route path="/payments/transactions/*" element={<AdminLegacyRedirect />} />
          <Route path="/cms-pages/*" element={<AdminLegacyRedirect />} />
          <Route path="/users-roles/*" element={<AdminLegacyRedirect />} />
          <Route path="/settings/*" element={<AdminLegacyRedirect />} />
          <Route path="/reports/*" element={<AdminLegacyRedirect />} />
          <Route path="/blog/*" element={<AdminLegacyRedirect />} />
          <Route path="/blog-categories/*" element={<AdminLegacyRedirect />} />

          {/* Public website fallback */}
          <Route path="*" element={<PublicPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
