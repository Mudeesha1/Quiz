/**
 * Toast Component - Quiz Master Design System
 * Feedback notifications with animations
 */

import { useState, useEffect } from 'react';

export function Toast({ type = 'info', message = '', duration = 4000, onClose = () => {} }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const toastClass = {
    success: 'toast-success',
    error: 'toast-error',
    info: 'toast-info',
    warning: 'toast-warning',
  }[type] || 'toast-info';

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '!',
  };

  return (
    <div className={`toast ${toastClass} animate-slide-up`}>
      <span className="text-2xl font-bold">{icons[type]}</span>
      <p className="text-body-md flex-1">{message}</p>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message, duration = 4000) => {
    const id = Math.random();
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
    success: (msg, duration) => addToast('success', msg, duration),
    error: (msg, duration) => addToast('error', msg, duration),
    info: (msg, duration) => addToast('info', msg, duration),
    warning: (msg, duration) => addToast('warning', msg, duration),
  };
}
