import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const getPublicUser = () => {
  try {
    return JSON.parse(localStorage.getItem('publicUser') || 'null');
  } catch {
    return null;
  }
};

const isEmployerUser = (user) => {
  const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '');
  const accountType = normalize(user?.accountType);
  const role = normalize(user?.role);
  const roleName = normalize(user?.roleName);
  if (accountType) return accountType === 'employer';
  return role === 'employer' || roleName === 'employer';
};

const isJobseekerUser = (user) => {
  const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '');
  const accountType = normalize(user?.accountType);
  const role = normalize(user?.role);
  const roleName = normalize(user?.roleName);
  if (accountType) return accountType === 'jobseeker';
  return role === 'jobseeker' || roleName === 'jobseeker';
};

const FloatingChatButton = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getPublicUser());
  }, []);

  if (!user) return null;

  let chatPath = '/jobseeker/messages';
  if (isEmployerUser(user)) {
    chatPath = '/employer/messages';
  } else if (!isJobseekerUser(user)) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        to={chatPath}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-[#0047C7] text-white shadow-lg hover:bg-[#0052cc] transition-all hover:scale-105"
        aria-label="Open messages"
      >
        <MessageCircle className="h-7 w-7" />
      </Link>
    </div>
  );
};

export default FloatingChatButton;
