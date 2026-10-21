import { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';

const NotificationContext = createContext(null);

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error('Gagal ambil notifikasi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Real-time listener
  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      // payload: { id, user_id, actor_id, type, title, message, link, data, is_read, created_at, actor }
      setNotifications((prev) => [payload, ...prev]);
      setUnreadCount((c) => c + 1);
    };
    socket.on('notification:new', handler);
    return () => socket.off('notification:new', handler);
  }, [socket]);

  const markRead = async (id) => {
    try {
      if (id) {
        await fetch(`/api/notifications/read/${id}`, {
          method: 'PUT',
          credentials: 'include',
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      } else {
        await fetch('/api/notifications/read', {
          method: 'PUT',
          credentials: 'include',
        });
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
      }
      setUnreadCount(0);
    } catch (err) {
      console.error('Gagal tandai baca:', err);
    }
  };

  const deleteNotif = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setNotifications((prev) => {
        const next = prev.filter((n) => n.id !== id);
        setUnreadCount(next.filter((n) => !n.is_read).length);
        return next;
      });
    } catch (err) {
      console.error('Gagal hapus notifikasi:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markRead,
        deleteNotif,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}