import React from 'react';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps {
  children: React.ReactNode;
  status?: StatusType;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ children, status = 'default', className = '' }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'success':
        return 'bg-[#B2F2BB] text-soft-green border-soft-green';
      case 'warning':
        return 'bg-light-beige text-soft-brown border-soft-brown';
      case 'error':
        return 'bg-[#FFC9C9] text-powder-pink border-powder-pink';
      case 'info':
        return 'bg-[#B2F2BB]/50 text-soft-green border-soft-green/50';
      default:
        return 'bg-light-beige/50 text-soft-brown border-[#F5E8C7]';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()} ${className}`}
    >
      {children}
    </span>
  );
};

export default StatusBadge;