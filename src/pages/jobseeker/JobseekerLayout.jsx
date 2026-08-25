/* eslint-disable react-refresh/only-export-components */
import { Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { MessageSocketProvider } from '../../context/MessageSocketContext';
import FloatingChatButton from '../../components/FloatingChatButton';
import ProfileCompletionPopup from '../../components/ProfileCompletionPopup';
import PageSkeleton from '../../components/SkeletonLoader';
import { PublicFooter, PublicHeader } from '../public/PublicPage';

const getPublicUser = () => {
  try {
    return JSON.parse(localStorage.getItem('publicUser') || 'null');
  } catch {
    return null;
  }
};

export const isJobseekerUser = (user) => {
  const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '');
  const accountType = normalize(user?.accountType);
  const role = normalize(user?.role);
  const roleName = normalize(user?.roleName);
  if (accountType) return accountType === 'jobseeker';
  return role === 'jobseeker' || roleName === 'jobseeker';
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

export const JobseekerLayout = () => {
  return (
    <MessageSocketProvider role="jobseeker">
      <div className="flex min-h-screen flex-col bg-white text-slate-900">
        <PublicHeader />
        <main className="min-w-0 flex-grow bg-[#f5f6f8] pt-20 sm:pt-24">
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <ProfileCompletionPopup portal="jobseeker" />
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
        <PublicFooter />
        <FloatingChatButton />
      </div>
    </MessageSocketProvider>
  );
};

export default JobseekerLayout;
