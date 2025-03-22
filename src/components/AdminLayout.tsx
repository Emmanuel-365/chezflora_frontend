"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { Sun, Moon } from "lucide-react";

const applyTheme = () => {
  const isDark = localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (isDark) document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
  return isDark;
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    return savedState ? JSON.parse(savedState) : window.innerWidth >= 768;
  });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [isDarkMode, setIsDarkMode] = useState(applyTheme);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev: boolean) => {
      const newState = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(newState));
      return newState;
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev: boolean) => {
      const newMode = !prev;
      localStorage.setItem("theme", newMode ? "dark" : "light");
      if (newMode) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return newMode;
    });
  };

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (!desktop && isSidebarOpen) setIsSidebarOpen(false); // Ferme la sidebar sur mobile lors du resize
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  const contentMargin = isSidebarOpen ? "ml-[250px]" : isDesktop ? "ml-[80px]" : "ml-[60px]"; // Alignement avec la sidebar mobile

  return (
    <div className="flex min-h-screen">
      <div
        className={`fixed top-0 left-0 h-full transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        aria-hidden={!isSidebarOpen && !isDesktop}
      >
        <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      <div className="flex-1 w-full transition-all duration-300">
        <div className={`min-h-screen ${contentMargin} transition-all duration-300 bg-lightBg dark:bg-darkBg`}>
          <header className="flex justify-end p-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-cream-beige dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              aria-label={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </header>
          <main className="px-4 pb-6">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                  <Spinner />
                </div>
              }
            >
              {children}
            </Suspense>
          </main>
        </div>
      </div>

      {isSidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
          aria-label="Fermer la barre latérale"
        />
      )}
    </div>
  );
};

const Spinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" aria-label="Chargement en cours" />
);

export default AdminLayout;