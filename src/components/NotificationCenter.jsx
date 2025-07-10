import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Calendar, Clock, User } from 'lucide-react';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  deleteNotification,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  formatNotificationTime,
  getNotificationIcon,
  getNotificationColor
} from '../services/notificationService';

const NotificationCenter = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);

  // Load notifications and unread count
  const loadNotifications = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [notificationsResult, countResult] = await Promise.all([
        getUserNotifications(user.id, 20),
        getUnreadNotificationCount(user.id)
      ]);

      if (notificationsResult.success) {
        setNotifications(notificationsResult.data);
      }

      if (countResult.success) {
        setUnreadCount(countResult.count);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (user?.id) {
      loadNotifications();

      // Subscribe to real-time notifications
      const sub = subscribeToNotifications(user.id, (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/favicon.ico'
          });
        }
      });
      
      setSubscription(sub);

      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return () => {
        unsubscribeFromNotifications(sub);
      };
    }
  }, [user?.id]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    const result = await markNotificationAsRead(notificationId);
    if (result.success) {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    
    const result = await markAllNotificationsAsRead(user.id);
    if (result.success) {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    }
  };

  // Delete notification
  const handleDelete = async (notificationId) => {
    const result = await deleteNotification(notificationId);
    if (result.success) {
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      // Decrease unread count if it was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  // Get notification action button
  const getActionButton = (notification) => {
    if (notification.type === 'reschedule') {
      return (
        <button
          onClick={() => {
            // Navigate to collection details or calendar
            window.location.href = `#collection-${notification.related_id}`;
          }}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          View Details
        </button>
      );
    }
    return null;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                  >
                    <CheckCheck className="h-4 w-4" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No notifications</h4>
                <p className="text-sm text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                        getNotificationColor(notification.type)
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            {/* Reschedule specific details */}
                            {notification.type === 'reschedule' && notification.data && (
                              <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-4 text-xs text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>New: {notification.data.new_date}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{notification.data.new_time}</span>
                                  </div>
                                  {notification.data.collector_name && (
                                    <div className="flex items-center space-x-1">
                                      <User className="h-3 w-3" />
                                      <span>{notification.data.collector_name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {formatNotificationTime(notification.created_at)}
                              </span>
                              <div className="flex items-center space-x-2">
                                {getActionButton(notification)}
                                {!notification.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                                  >
                                    <Check className="h-3 w-3" />
                                    <span>Mark read</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(notification.id)}
                                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Unread indicator */}
                          {!notification.read && (
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to full notifications page if needed
                }}
                className="w-full text-sm text-center text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 