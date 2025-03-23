"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const ModalContainer: React.FC<ModalContainerProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[#D2B48C]/20 dark:bg-[#4A3F35]/30 backdrop-blur-sm"></div>
      <div
        className={`relative bg-lightBg dark:bg-darkBg rounded-xl shadow-lg transform transition-all duration-300 w-full ${
          sizeClasses[size]
        } max-h-[90vh] flex flex-col ${isOpen ? "scale-100" : "scale-95"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden opacity-5 pointer-events-none">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-floral-pattern bg-no-repeat bg-contain"></div>
        </div>
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-lightBorder dark:border-darkBorder shrink-0">
            <h3 className="text-lg font-medium text-lightText dark:text-darkText">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-lightText dark:text-darkText hover:text-powder-pink dark:hover:text-dark-powder-pink focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[#D2B48C] dark:scrollbar-thumb-[#8CC7A1] scrollbar-track-[#F5E8C7] dark:scrollbar-track-[#4A3F35] flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ModalHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4">
    <h3 className="text-lg font-medium text-lightText dark:text-darkText">{children}</h3>
  </div>
);

export const ModalBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="py-2">{children}</div>
);

export const ModalFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">{children}</div>
);