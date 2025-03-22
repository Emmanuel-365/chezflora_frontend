import React, { useState, ChangeEvent, FocusEvent } from 'react';

interface TextFieldCustomProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  suffix?: React.ReactNode;
  icon?: React.ReactNode;  // Ajout de la prop icon
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

const TextFieldCustom: React.FC<TextFieldCustomProps> = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  error,
  required = false,
  disabled = false,
  className = '',
  suffix,
  icon,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className={`relative ${className}`}>
      <label
        htmlFor={id}
        className={`block text-sm font-medium transition-all duration-200 ${error ? 'text-powder-pink' : 'text-soft-brown'} ${required ? 'after:content-["*"] after:ml-0.5 after:text-powder-pink' : ''}`}
      >
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full px-3 py-2 ${icon ? 'pl-10' : 'pl-3'} ${suffix ? 'pr-10' : 'pr-3'} bg-[#F5F5F5] border rounded-md shadow-sm placeholder-[#D2B48C]/50
            focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${error ? 'border-powder-pink focus:border-powder-pink focus:ring-[#F8C1CC]/50' : isFocused ? 'border-soft-green focus:border-soft-green focus:ring-[#A8D5BA]/50' : 'border-[#F5E8C7] focus:border-soft-green focus:ring-[#A8D5BA]/50'}
          `}
        />
        {suffix && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            {suffix}
          </div>
        )}
        {isFocused && !error && !suffix && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <div className="w-4 h-4 text-soft-green opacity-50">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 3C12 7.97056 16.0294 12 21 12C16.0294 12 12 16.0294 12 21C12 16.0294 7.97056 12 3 12C7.97056 12 12 7.97056 12 3Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-powder-pink">{error}</p>}
    </div>
  );
};

export default TextFieldCustom;