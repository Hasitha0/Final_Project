import { supabase } from '../lib/supabase.js';

// Get user notifications
export const getUserNotifications = async (userId, limit = 20, unreadOnly = false) => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;

    return {
      success: true,
      count: count || 0
    };
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create manual notification (for admin use)
export const createNotification = async (userId, type, title, message, data = {}, actionUrl = null, relatedId = null) => {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: type,
        title: title,
        message: message,
        data: data,
        action_url: actionUrl,
        related_id: relatedId
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: notification
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Subscribe to real-time notifications
export const subscribeToNotifications = (userId, callback) => {
  const subscription = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
};

// Unsubscribe from notifications
export const unsubscribeFromNotifications = (subscription) => {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
};

// Format notification time
export const formatNotificationTime = (timestamp) => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}d ago`;
  }
};

// Get notification icon based on type
export const getNotificationIcon = (type) => {
  const icons = {
    reschedule: '📅',
    status_update: '📋',
    assignment: '👤',
    completion: '✅',
    payment: '💰',
    general: '📢',
    sustainability_contribution: '🌱'
  };
  return icons[type] || '📢';
};

// Get notification color based on type
export const getNotificationColor = (type) => {
  const colors = {
    reschedule: 'bg-blue-50 border-blue-200 text-blue-800',
    status_update: 'bg-green-50 border-green-200 text-green-800',
    assignment: 'bg-purple-50 border-purple-200 text-purple-800',
    completion: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    payment: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    general: 'bg-gray-50 border-gray-200 text-gray-800',
    sustainability_contribution: 'bg-emerald-50 border-emerald-200 text-emerald-800'
  };
  return colors[type] || 'bg-gray-50 border-gray-200 text-gray-800';
};

export default {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  deleteNotification,
  createNotification,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  formatNotificationTime,
  getNotificationIcon,
  getNotificationColor
}; 