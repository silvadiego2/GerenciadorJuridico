import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotifications, Notification } from '../../hooks/useNotifications';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      default:
        return Info;
    }
  };

  const getColors = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const Icon = getIcon(notification.type);
        const colors = getColors(notification.type);

        return (
          <div
            key={notification.id}
            className={`max-w-sm w-full border rounded-lg p-4 shadow-lg ${colors} animate-in slide-in-from-right duration-300`}
          >
            <div className="flex items-start">
              <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium">{notification.title}</h4>
                <p className="text-sm mt-1">{notification.message}</p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-3 flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationContainer;