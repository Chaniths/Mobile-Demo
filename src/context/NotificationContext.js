import React, {
  createContext, useContext, useState, useCallback,
  useMemo, useEffect, useRef,
} from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../api/client';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const token = useSelector((st) => st.auth.token);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(false);
  const pollRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await apiClient.get('/notifications');
      setNotifications((prev) => {
        const localOnly  = prev.filter((n) => n.data?.type === 'CART_REMINDER');
        const serverIds  = new Set(data.map((n) => n.id));
        const uniqueLocal = localOnly.filter((n) => !serverIds.has(n.id));
        return [...uniqueLocal, ...data];
      });
    } catch {
      /* silently fail */
    }
  }, [token]);

  // fetch on login, poll every 30s, clear + stop polling on logout
  useEffect(() => {
    if (!token) {
      setNotifications([]);
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 30_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [token, fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    if (!token) return;
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      await apiClient.patch('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
    setLoading(false);
  }, [token]);

  const deleteNotification = useCallback(async (id) => {
    if (!token) return;
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [token]);

  const deleteAll = useCallback(async () => {
    if (!token) return;
    try {
      await apiClient.delete('/notifications');
      setNotifications([]);
    } catch (err) {
      console.error('Failed to delete all notifications:', err);
    }
  }, [token]);

  const clearAll = useCallback(() => setNotifications([]), []);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      notifications, unreadCount, loading,
      fetchNotifications, markAsRead, markAllAsRead,
      clearAll, deleteNotification, deleteAll, addNotification,
    }),
    [
      notifications, unreadCount, loading,
      fetchNotifications, markAsRead, markAllAsRead,
      clearAll, deleteNotification, deleteAll, addNotification,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};