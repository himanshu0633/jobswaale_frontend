import { Navigate, Outlet } from 'react-router-dom';

const getPublicUser = () => {
  try {
    return JSON.parse(localStorage.getItem('publicUser') || 'null');
  } catch {
    return null;
  }
};

export const isEmployerUser = (user) => {
  const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '');
  const accountType = normalize(user?.accountType);
  const role = normalize(user?.role);
  const roleName = normalize(user?.roleName);
  if (accountType) return accountType === 'employer';
  return role === 'employer' || roleName === 'employer';
};

export const isJobseekerUser = (user) => {
  const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '');
  const accountType = normalize(user?.accountType);
  const role = normalize(user?.role);
  const roleName = normalize(user?.roleName);
  if (accountType) return accountType === 'jobseeker';
  return role === 'jobseeker' || roleName === 'jobseeker';
};

export const EmployerProtectedRoute = () => {
  const user = getPublicUser();
  const token = localStorage.getItem('publicToken');

  if (!user || !token || !isEmployerUser(user)) {
    if (user || token) {
      localStorage.removeItem('publicUser');
      localStorage.removeItem('publicToken');
    }
    return <Navigate to="/login?role=employer" replace />;
  }

  return <Outlet />;
};

export const JobseekerProtectedRoute = () => {
  const user = getPublicUser();
  const token = localStorage.getItem('publicToken');

  if (!user || !token || !isJobseekerUser(user)) {
    if (user || token) {
      localStorage.removeItem('publicUser');
      localStorage.removeItem('publicToken');
    }
    return <Navigate to="/login?role=jobseeker" replace />;
  }

  return <Outlet />;
};
