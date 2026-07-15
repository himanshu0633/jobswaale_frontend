import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const getPublicUser = () => {
  try {
    return JSON.parse(localStorage.getItem('publicUser') || 'null');
  } catch {
    return null;
  }
};

export const isEmployerUser = (user) => {
  const accountType = String(user?.accountType || '').trim().toLowerCase();
  const role = String(user?.role || '').trim().toLowerCase();
  if (accountType) return accountType === 'employer';
  return role === 'employer';
};

export const isJobseekerUser = (user) => {
  const accountType = String(user?.accountType || '').trim().toLowerCase();
  const role = String(user?.role || '').trim().toLowerCase();
  if (accountType) return accountType === 'jobseeker';
  return role === 'jobseeker';
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
