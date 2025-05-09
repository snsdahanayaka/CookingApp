import { createContext, useContext, useRef } from 'react';
import Toast from '../components/common/Toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const toastRef = useRef(null);
  
  const value = {
    showToast: (message, type, duration) => {
      if (toastRef.current) {
        return toastRef.current.show(message, type, duration);
      }
    },
    hideToast: (id) => {
      if (toastRef.current) {
        toastRef.current.hide(id);
      }
    }
  };
  
  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast ref={toastRef} position="bottom-right" />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
