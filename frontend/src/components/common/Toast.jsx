import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import '../../styles/toast.css';

const Toast = forwardRef(({ position = 'bottom-right' }, ref) => {
  const [toasts, setToasts] = useState([]);
  
  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    show: (message, type = 'info', duration = 3000) => {
      const id = Date.now();
      const newToast = { id, message, type, duration };
      setToasts(prev => [...prev, newToast]);
      
      // Auto-remove toast after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);
      
      return id;
    },
    hide: (id) => {
      removeToast(id);
    }
  }));
  
  const removeToast = (id) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (toast) {
        // Mark for removal animation
        return prev.map(t => t.id === id ? { ...t, removing: true } : t);
      }
      return prev;
    });
    
    // Remove after animation completes
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300); // Match animation duration
  };
  
  // Get icon based on toast type
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'error':
        return 'bi-exclamation-circle-fill';
      case 'warning':
        return 'bi-exclamation-triangle-fill';
      case 'info':
      default:
        return 'bi-info-circle-fill';
    }
  };
  
  return (
    <div className={`toast-container ${position}`}>
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`custom-toast ${toast.type} ${toast.removing ? 'removing' : ''}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="toast-content">
            <i className={`bi ${getIcon(toast.type)} toast-icon`}></i>
            <div className="toast-message">{toast.message}</div>
            <button 
              className="toast-close" 
              onClick={() => removeToast(toast.id)}
              aria-label="Close toast"
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
          <div 
            className="toast-progress" 
            style={{ animationDuration: `${toast.duration}ms` }}
          ></div>
        </div>
      ))}
    </div>
  );
});

export default Toast;
