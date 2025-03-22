import React from 'react';

interface ButtonPrimaryProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  href?: string; // Nouvelle prop pour les liens
}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  fullWidth = false,
  size = 'md',
  href,
}) => {
  const sizeClasses = {
    sm: 'py-1 px-3 text-xs',
    md: 'py-2 px-4 text-sm',
    lg: 'py-3 px-6 text-base',
  };

  const baseClasses = `
    relative overflow-hidden bg-[#A8D5BA] text-soft-brown font-medium rounded-lg 
    hover:bg-[#B2F2BB] transition-all duration-300 shadow-sm
    focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:ring-offset-2
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
      >
        <span className="absolute inset-0 overflow-hidden rounded-lg">
          <span className="absolute -right-1 -top-1 w-12 h-12 bg-white/10 rounded-full transform rotate-45"></span>
        </span>
        <span className="relative">{children}</span>
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
    >
      <span className="absolute inset-0 overflow-hidden rounded-lg">
        <span className="absolute -right-1 -top-1 w-12 h-12 bg-white/10 rounded-full transform rotate-45"></span>
      </span>
      <span className="relative">{children}</span>
    </button>
  );
};

export default ButtonPrimary;