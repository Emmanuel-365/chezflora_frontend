import React from 'react';

interface ButtonSecondaryProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  fullWidth = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'py-1 px-3 text-xs',
    md: 'py-2 px-4 text-sm',
    lg: 'py-3 px-6 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden bg-[#F8C1CC] text-soft-brown font-medium rounded-lg 
        hover:bg-[#FFC9C9] transition-all duration-300 shadow-sm
        focus:outline-none focus:ring-2 focus:ring-[#F8C1CC] focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      <span className="absolute inset-0 overflow-hidden rounded-lg">
        <span className="absolute -left-1 -top-1 w-12 h-12 bg-white/10 rounded-full transform rotate-45"></span>
      </span>
      <span className="relative">{children}</span>
    </button>
  );
};

export default ButtonSecondary;