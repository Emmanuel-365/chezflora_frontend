import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertMessageProps {
  type?: AlertType;
  message: string;
  duration?: number;
  onClose?: () => void;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
  type = 'info',
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return { bg: 'bg-pastel-green/80', border: 'border-soft-green', icon: <CheckCircle className="h-5 w-5 text-soft-green" /> };
      case 'error':
        return { bg: 'bg-pastel-pink/80', border: 'border-powder-pink', icon: <AlertCircle className="h-5 w-5 text-powder-pink" /> };
      case 'warning':
        return { bg: 'bg-light-beige', border: 'border-soft-brown', icon: <AlertCircle className="h-5 w-5 text-soft-brown" /> };
      default:
        return { bg: 'bg-[#B2F2BB]/50', border: 'border-soft-green', icon: <CheckCircle className="h-5 w-5 text-soft-green" /> };
    }
  };

  const styles = getAlertStyles();

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md transform transition-all duration-300 ease-in-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <div className={`flex items-center p-4 rounded-lg shadow-md border ${styles.bg} ${styles.border}`}>
        <div className="flex-shrink-0">{styles.icon}</div>
        <div className="ml-3 mr-8 text-sm font-medium text-soft-brown">{message}</div>
        <button
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-soft-brown hover:text-powder-pink focus:outline-none"
          onClick={handleClose}
        >
          <span className="sr-only">Fermer</span>
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AlertMessage;