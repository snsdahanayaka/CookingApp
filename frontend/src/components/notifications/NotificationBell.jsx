import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import notificationService from '../../services/notification.service';
import NotificationItem from './NotificationItem';

const NotificationBell = () => {
  const { currentUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread notification count
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationService.getUnreadCount();
        setUnreadCount(response.data.unreadCount);
      } catch (err) {
        console.error('Error fetching notification count:', err);
      }
    };
    
    // Initial fetch
    fetchUnreadCount();
    
    // Set up polling interval (every 30 seconds)
    const intervalId = setInterval(fetchUnreadCount, 30000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [currentUser]);
  
  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const fetchNotifications = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const response = await notificationService.getNotifications(0, 5);
      setNotifications(response.data.content);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleDropdown = async () => {
    const newState = !dropdownOpen;
    setDropdownOpen(newState);
    
    if (newState) {
      await fetchNotifications();
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({
          ...notification,
          read: true
        }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };
  
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update the notification in the local state
      const updatedNotifications = notifications.map(notification => {
        if (notification.id === notificationId && !notification.read) {
          // Decrement unread count only for notifications that were unread
          setUnreadCount(prevCount => Math.max(0, prevCount - 1));
          return { ...notification, read: true };
        }
        return notification;
      });
      
      setNotifications(updatedNotifications);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Remove the notification from the local state
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        // Decrement unread count if deleting an unread notification
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };
  
  if (!currentUser) return null;

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button 
        className="btn btn-link nav-link position-relative" 
        onClick={toggleDropdown}
        aria-expanded={dropdownOpen}
      >
        <i className="bi bi-bell-fill fs-5"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
            <span className="visually-hidden">unread notifications</span>
          </span>
        )}
      </button>
      
      <div className={`dropdown-menu dropdown-menu-end notification-dropdown ${dropdownOpen ? 'show' : ''}`} style={{ minWidth: '320px' }}>
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <h6 className="m-0">Notifications</h6>
          {unreadCount > 0 && (
            <button 
              className="btn btn-sm btn-link text-decoration-none"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>
        
        <div className="notification-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading && (
            <div className="d-flex justify-content-center p-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger m-2 py-2 small" role="alert">
              {error}
            </div>
          )}
          
          {!loading && !error && notifications.length === 0 && (
            <div className="text-center p-3 text-muted">
              <i className="bi bi-bell-slash mb-2 d-block fs-4"></i>
              <p className="mb-0">No notifications yet</p>
            </div>
          )}
          
          {notifications.map(notification => (
            <NotificationItem 
              key={notification.id} 
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
        
        <div className="text-center p-2 border-top">
          <a href="#/notifications" className="text-decoration-none" onClick={() => setDropdownOpen(false)}>
            View all notifications
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;
