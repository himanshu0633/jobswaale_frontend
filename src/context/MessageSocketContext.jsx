/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { BASE_API_URL } from './AuthContext';

const MessageSocketContext = createContext(null);
const SOCKET_URL = BASE_API_URL.replace(/\/api\/?$/, '');

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getEndpoint = (role) => `${BASE_API_URL}/${role === 'employer' ? 'employer' : 'jobseeker'}/messages`;

const playNotificationSound = () => {
  if (typeof window === 'undefined') return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  try {
    const audioContext = new AudioContext();
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.45);
    gain.connect(audioContext.destination);

    [880, 1175].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + (index * 0.12));
      oscillator.connect(gain);
      oscillator.start(audioContext.currentTime + (index * 0.12));
      oscillator.stop(audioContext.currentTime + 0.18 + (index * 0.12));
    });

    window.setTimeout(() => audioContext.close().catch(() => {}), 700);
  } catch {
    // Browsers may block sound until the user interacts with the page.
  }
};

export const MessageSocketProvider = ({ role, children }) => {
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const endpoint = useMemo(() => getEndpoint(role), [role]);

  const refreshUnread = async () => {
    try {
      const response = await axios.get(`${endpoint}/unread`, { headers: getTokenHeaders() });
      setUnreadCount(Number(response.data?.unreadCount || 0));
    } catch {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    refreshUnread();
  }, [endpoint]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Promise.resolve(Notification.requestPermission()).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('publicToken');
    if (!token) return undefined;

    const nextSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    nextSocket.on('message:new', (payload) => {
      if (payload?.senderRole !== role) {
        setUnreadCount(Number(payload?.unreadCount || 0));
        playNotificationSound();

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && document.hidden) {
          const title = payload?.notification?.title || 'New message';
          const body = payload?.notification?.body || 'You have a new chat message.';
          new Notification(title, { body });
        }
      }
    });

    nextSocket.on('messages:unread', (payload) => {
      setUnreadCount(Number(payload?.unreadCount || 0));
    });

    setSocket(nextSocket);

    return () => {
      nextSocket.disconnect();
      setSocket(null);
    };
  }, [role]);

  const value = useMemo(() => ({
    socket,
    unreadCount,
    refreshUnread,
    setUnreadCount
  }), [socket, unreadCount]);

  return (
    <MessageSocketContext.Provider value={value}>
      {children}
    </MessageSocketContext.Provider>
  );
};

export const useMessageSocket = () => useContext(MessageSocketContext) || {
  socket: null,
  unreadCount: 0,
  refreshUnread: () => {},
  setUnreadCount: () => {}
};

export default MessageSocketContext;
