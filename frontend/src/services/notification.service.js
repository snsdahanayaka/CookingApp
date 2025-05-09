import api from './api';

class NotificationService {
  // Get user's notifications with pagination
  getNotifications(page = 0, size = 10) {
    return api.get(`/notifications?page=${page}&size=${size}`);
  }
  
  // Get count of unread notifications
  getUnreadCount() {
    return api.get('/notifications/unread-count');
  }
  
  // Mark a notification as read
  markAsRead(notificationId) {
    return api.patch(`/notifications/${notificationId}/read`);
  }
  
  // Mark all notifications as read
  markAllAsRead() {
    return api.patch('/notifications/mark-all-read');
  }
  
  // Delete a notification
  deleteNotification(notificationId) {
    return api.delete(`/notifications/${notificationId}`);
  }
}

export default new NotificationService();
