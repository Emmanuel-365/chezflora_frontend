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
  theme: forcedTheme, // Renommé pour indiquer qu'il est optionnel
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const globalTheme = useContext(ThemeContext); // Récupère le thème global

  // Utilise forcedTheme s'il est fourni, sinon fallback sur globalTheme
  const effectiveTheme = forcedTheme || globalTheme;

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

  // Classes basées sur Tailwind avec support darkMode: 'class'
  const themeClasses = {
    light: {
      bg: "bg-[#F5F5F5]", // Fond clair (off-white)
      border: "border-[#F5E8C7]", // Bordure beige clair
      text: "text-soft-brown", // Texte marron doux (#5C4033)
      overlay: "bg-[#D2B48C]/20", // Overlay beige clair
      scrollbarThumb: "scrollbar-thumb-[#D2B48C]", // Pouce beige
      scrollbarTrack: "scrollbar-track-[#F5E8C7]", // Piste beige clair
      hoverText: "hover:text-powder-pink", // Survol rose (#E07B91)
      focusRing: "focus:ring-[#A8D5BA]", // Anneau vert clair
    },
    dark: {
      bg: "bg-[#2D2D2D]", // Fond sombre (proche de darkBg: #2F2F2F)
      border: "border-[#4A3F35]", // Bordure marron foncé
      text: "text-[#E8DAB2]", // Texte beige clair (proche de darkText: #EDEDED)
      overlay: "bg-[#4A3F35]/30", // Overlay marron foncé
      scrollbarThumb: "scrollbar-thumb-[#8CC7A1]", // Pouce vert clair
      scrollbarTrack: "scrollbar-track-[#4A3F35]", // Piste marron foncé
      hoverText: "hover:text-[#A8D5BA]", // Survol vert clair
      focusRing: "focus:ring-[#8CC7A1]", // Anneau vert foncé
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

// Mise à jour des composants associés pour utiliser ThemeContext
export const ModalHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useContext(ThemeContext);
  return (
    <div className="mb-4">
      <h3 className={`text-lg font-medium ${theme === "light" ? "text-soft-brown" : "text-[#E8DAB2]"}`}>
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