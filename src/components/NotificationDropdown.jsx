import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, Check } from 'lucide-react';
import { BASE_API_URL } from '../context/AuthContext';
import { useMessageSocket } from '../context/MessageSocketContext';

export const NotificationDropdown = ({ theme }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { socket } = useMessageSocket();

  const token = localStorage.getItem('publicToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BASE_API_URL}/notifications`, { headers });
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    socket.on('notification:new', handleNewNotification);
    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket]);

  const unseenCount = notifications.filter((n) => n.status === 'unseen').length;

  const markAllAsRead = async () => {
    try {
      await axios.put(`${BASE_API_URL}/notifications/seen-all`, {}, { headers });
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'seen' })));
    } catch (err) {
      console.error('Failed to mark all seen:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    setOpen(false);
    if (notif.status === 'unseen') {
      try {
        await axios.put(`${BASE_API_URL}/notifications/${notif._id}/seen`, {}, { headers });
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, status: 'seen' } : n))
        );
      } catch (err) {
        console.error('Failed to mark seen:', err);
      }
    }
    if (notif.redirectUrl) {
      navigate(notif.redirectUrl);
    }
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
          theme === 'dark'
            ? 'border-slate-700 bg-slate-800 text-slate-300 hover:border-blue-500 hover:text-white'
            : 'border-[#e2e8f0] bg-white text-[#475569] hover:border-[#0047C7] hover:bg-[#f8fafc] hover:text-[#0047C7]'
        }`}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unseenCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[9px] font-bold text-white animate-pulse">
            {unseenCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute right-0 z-50 mt-2 w-80 rounded-xl border shadow-xl ${
            theme === 'dark'
              ? 'border-slate-800 bg-[#303a44] text-slate-100 shadow-slate-950/50'
              : 'border-slate-200 bg-white text-slate-800 shadow-slate-100'
          }`}
        >
          <div className={`flex items-center justify-between border-b px-4 py-3 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
            <span className="text-sm font-extrabold">Notifications</span>
            {unseenCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[11px] font-bold text-[#6658dd] hover:underline"
              >
                <Check className="h-3 w-3" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-slate-400 font-semibold">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex cursor-pointer gap-3 border-b px-4 py-3 transition-colors ${
                    notif.status === 'unseen'
                      ? theme === 'dark'
                        ? 'bg-slate-800/40 hover:bg-slate-800/80'
                        : 'bg-indigo-50/30 hover:bg-indigo-50/60'
                      : theme === 'dark'
                      ? 'hover:bg-slate-800/20'
                      : 'hover:bg-slate-50'
                  } ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'}`}
                >
                  <div className="mt-0.5 shrink-0">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                        notif.status === 'unseen'
                          ? 'bg-[#6658dd]/10 text-[#6658dd]'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Bell className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`truncate text-xs font-bold ${notif.status === 'unseen' ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500'}`}>
                        {notif.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {formatTimeAgo(notif.createDate)}
                      </span>
                    </div>
                    <p className={`mt-0.5 text-[11px] leading-relaxed ${notif.status === 'unseen' ? 'text-slate-600 dark:text-slate-300 font-medium' : 'text-slate-400'}`}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
