import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    duration = 5000
  ) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      duration,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, duration);
    }

    return notification.id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const success = useCallback((title: string, message: string, duration?: number) => {
    return addNotification('success', title, message, duration);
  }, [addNotification]);

  const error = useCallback((title: string, message: string, duration?: number) => {
    return addNotification('error', title, message, duration);
  }, [addNotification]);

  const warning = useCallback((title: string, message: string, duration?: number) => {
    return addNotification('warning', title, message, duration);
  }, [addNotification]);

  const info = useCallback((title: string, message: string, duration?: number) => {
    return addNotification('info', title, message, duration);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };
}