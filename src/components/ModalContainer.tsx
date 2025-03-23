"use client";

import React, { useState, useEffect, useContext } from "react";
import { X } from "lucide-react";
import { ThemeContext } from "../components/AdminLayout"; // Import du ThemeContext

interface ModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "light" | "dark"; // Prop optionnelle pour forcer un thème
}

export const ModalContainer: React.FC<ModalContainerProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  theme: forcedTheme,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const globalTheme = useContext(ThemeContext); // Récupère le thème global
  const effectiveTheme = forcedTheme || globalTheme; // Thème effectif

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

  // Classes alignées avec la config Tailwind de l'interface admin
  const themeClasses = {
    light: {
      bg: "bg-lightBg", // #F9F5F0
      border: "border-lightBorder", // #B0B8B8
      text: "text-lightText", // #5C4033
      overlay: "bg-lightBorder/20", // Overlay basé sur lightBorder
      scrollbarThumb: "scrollbar-thumb-lightBorder", // #B0B8B8
      scrollbarTrack: "scrollbar-track-lightBg", // #F9F5F0
      hoverText: "hover:text-powder-pink", // #E07B91
      focusRing: "focus:ring-soft-green", // #4A704A
    },
    dark: {
      bg: "bg-darkBg", // #2F2F2F
      border: "border-darkBorder", // #6B7280
      text: "text-darkText", // #EDEDED
      overlay: "bg-darkBorder/30", // Overlay basé sur darkBorder
      scrollbarThumb: "scrollbar-thumb-dark-soft-green", // #6BAF6B
      scrollbarTrack: "scrollbar-track-darkBg", // #2F2F2F
      hoverText: "hover:text-dark-powder-pink", // #F4A1B3
      focusRing: "focus:ring-dark-soft-green", // #6BAF6B
    },
  };

  const currentTheme = themeClasses[effectiveTheme];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div className={`absolute inset-0 ${currentTheme.overlay} backdrop-blur-sm`}></div>
      <div
        className={`relative ${currentTheme.bg} rounded-xl shadow-lg transform transition-all duration-300 w-full ${
          sizeClasses[size]
        } max-h-[90vh] flex flex-col ${isOpen ? "scale-100" : "scale-95"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden opacity-5 pointer-events-none">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-floral-pattern bg-no-repeat bg-contain"></div>
        </div>
        {title && (
          <div className={`flex items-center justify-between p-4 border-b ${currentTheme.border} shrink-0`}>
            <h3 className={`text-lg font-medium ${currentTheme.text}`}>{title}</h3>
            <button
              onClick={onClose}
              className={`p-1 rounded-full ${currentTheme.text} ${currentTheme.hoverText} focus:outline-none focus:ring-2 ${currentTheme.focusRing}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div
          className={`p-6 overflow-y-auto scrollbar-thin ${currentTheme.scrollbarThumb} ${currentTheme.scrollbarTrack} flex-1`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export const ModalHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useContext(ThemeContext);
  return (
    <div className="mb-4">
      <h3 className={`text-lg font-medium ${theme === "light" ? "text-lightText" : "text-darkText"}`}>
        {children}
      </h3>
    </div>
  );
};

export const ModalBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="py-2">{children}</div>
);

export const ModalFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">{children}</div>
);