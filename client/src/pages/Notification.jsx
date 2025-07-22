// Notification.jsx - Provides notification context and UI for alerts
import React, {useState, useEffect, createContext, useContext} from "react";
import {CheckCircle, XCircle, X} from "lucide-react";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({children}) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = {id, type, message};

    setNotifications((prev) => [...prev, notification]);

    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const clearNotifications = () => setNotifications([]);

  const showSuccess = (message) => addNotification("success", message);
  const showError = (message) => addNotification("error", message);

  const value = {
    showSuccess,
    showError,
    notifications,
    removeNotification,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = ({notifications, removeNotification}) => {
  return (
    <div className="fixed top-22 left-5 right-auto z-50 max-w-xs w-full sm:max-w-sm">
      <div className="flex flex-col gap-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`alert pointer-events-auto transform transition-all duration-300 max-w-md ${
              notification.type === "success"
                ? "alert-success bg-success/10 border-success text-success"
                : "alert-error bg-error/10 border-error text-error"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="flex-1">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="btn btn-ghost btn-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
