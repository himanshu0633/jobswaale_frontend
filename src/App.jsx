import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Country from './pages/Country';
import State from './pages/State';
import District from './pages/District';
import IndustryType from './pages/IndustryType';
import JobType from './pages/JobType';
import JobCategory from './pages/JobCategory';
import FeatureMaster from './pages/FeatureMaster';
import PlanMaster from './pages/PlanMaster';
import Qualification from './pages/Qualification';
import City from './pages/City';
import PlanMapping from './pages/PlanMapping';
import Employers from './pages/Employers';
import AddEmployer from './pages/AddEmployer';
import Jobseekers from './pages/Jobseekers';
import AddJobseeker from './pages/AddJobseeker';
import Jobs from './pages/Jobs';
import PostJob from './pages/PostJob';

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
    return <Navigate to="/login" replace />;
  }

  // Ensure only Admin role can access administrative master controls
  if (user.role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-4 max-w-sm">
          Your account role ({user.role}) does not have permissions to view administrative master records.
        </p>
        <Navigate to="/login" replace />
      </div>
    );
  }

  return <Outlet />;
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
        <div className={`flex-grow flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
          {/* Dynamic Route Content */}
          <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/countries" element={<Country />} />
              <Route path="/states" element={<State />} />
              <Route path="/districts" element={<District />} />
              <Route path="/industry-types" element={<IndustryType />} />
              <Route path="/job-types" element={<JobType />} />
              <Route path="/job-categories" element={<JobCategory />} />
              <Route path="/features" element={<FeatureMaster />} />
              <Route path="/plans" element={<PlanMaster />} />
              <Route path="/qualifications" element={<Qualification />} />
              <Route path="/cities" element={<City />} />
              <Route path="/plan-mappings" element={<PlanMapping />} />
              <Route path="/employers" element={<Employers />} />
              <Route path="/employers/add" element={<AddEmployer />} />
              <Route path="/employers/edit/:id" element={<AddEmployer />} />
              <Route path="/jobseekers" element={<Jobseekers />} />
              <Route path="/jobseekers/add" element={<AddJobseeker />} />
              <Route path="/jobseekers/edit/:id" element={<AddJobseeker />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/add" element={<PostJob />} />
              <Route path="/jobs/edit/:id" element={<PostJob />} />
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure Administrative Paths */}
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<AppLayout />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
