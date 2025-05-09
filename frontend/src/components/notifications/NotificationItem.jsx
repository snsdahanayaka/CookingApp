import React from 'react';
import { Link } from 'react-router-dom';

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LIKE':
        return <i className="bi bi-heart-fill text-danger"></i>;
      case 'COMMENT':
        return <i className="bi bi-chat-fill text-primary"></i>;
      case 'FOLLOW':
        return <i className="bi bi-person-plus-fill text-success"></i>;
      case 'ENROLLMENT':
        return <i className="bi bi-mortarboard-fill text-info"></i>;
      case 'SYSTEM_MESSAGE':
        return <i className="bi bi-info-circle-fill text-secondary"></i>;
      default:
        return <i className="bi bi-bell-fill text-secondary"></i>;
    }
  };

  const getNotificationLink = () => {
    const { relatedEntityType, relatedEntityId } = notification;
    
    switch (relatedEntityType) {
      case 'POST':
        return `/posts/${relatedEntityId}`;
      case 'LEARNING_PLAN':
        return `/learning-plans/${relatedEntityId}`;
      default:
        return '#';
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) {
        return 'just now';
      }
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
      }
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
      }
      
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (err) {
      console.error('Error formatting date:', err);
      return '';
    }
  };

  return (
    <div className={`notification-item border-bottom px-3 py-2 ${!notification.read ? 'bg-light' : ''}`}>
      <div className="d-flex">
        <div className="notification-icon me-3 fs-5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="notification-content flex-grow-1">
          <Link
            to={getNotificationLink()}
            className="text-reset text-decoration-none"
            onClick={handleClick}
          >
            <div className="notification-message mb-1">
              {notification.sender && (
                <span className="fw-bold">{notification.sender.username} </span>
              )}
              <span>{notification.message}</span>
            </div>
            <div className="notification-time small text-muted">
              {formatTimestamp(notification.createdAt)}
            </div>
          </Link>
        </div>
        <div className="notification-actions">
          <button
            className="btn btn-sm text-danger"
            onClick={() => onDelete(notification.id)}
            title="Delete notification"
          >
            <i className="bi bi-trash"></i>
            <span className="visually-hidden">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
