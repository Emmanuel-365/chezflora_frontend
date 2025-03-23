"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  ShoppingCart,
  Package,
  Calendar,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Briefcase,
  DollarSign,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    users: false,
    commands: false,
    products: false,
    ateliers: false,
    content: false,
    services: false,
    payments: false,
    settings: false,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = window.innerWidth < 768;
  const iconSize = isMobile ? 16 : 20; // Harmonisation des tailles d'icônes

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/auth");
  };

  const sidebarVariants = {
    open: { width: "250px" },
    closed: { width: isMobile ? "60px" : "80px" }, // Augmentation légère sur mobile
  };

  const textVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 },
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.div
      className="fixed top-0 left-0 h-screen bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText shadow-lg z-50 overflow-y-auto"
      variants={sidebarVariants}
      initial={false}
      animate={isOpen ? "open" : "closed"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      aria-label="Barre de navigation latérale"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-lightBorder dark:border-darkBorder">
          <AnimatePresence>
            {isOpen && (
              <motion.div variants={textVariants} initial={false} animate="open" exit="closed">
                <h2 className={`font-semibold ${isMobile ? "text-base" : "text-xl"}`}>ChezFlora Admin</h2>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-cream-beige dark:hover:bg-gray-600 rounded-full"
            aria-label={isOpen ? "Fermer la barre latérale" : "Ouvrir la barre latérale"}
          >
            {isOpen ? <ChevronRight size={iconSize} /> : <ChevronDown size={iconSize} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem
            icon={<Home size={iconSize} />}
            label="Tableau de bord"
            isOpen={isOpen}
            onClick={() => navigate("/admin")}
            textVariants={textVariants}
            isMobile={isMobile}
            isActive={isActive("/admin")}
          />
          <SidebarSection
            icon={<Users size={iconSize} />}
            label="Utilisateurs"
            isOpen={isOpen}
            expanded={expandedSections.users}
            toggle={() => toggleSection("users")}
            textVariants={textVariants}
            isMobile={isMobile}
          >
            <SidebarSubItem
              label="Tous les utilisateurs"
              isOpen={isOpen}
              onClick={() => navigate("/admin/users")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/users")}
            />
            <SidebarSubItem
              label="Statistiques"
              isOpen={isOpen}
              onClick={() => navigate("/admin/users/stats")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/users/stats")}
            />
            <SidebarSubItem
              label="Bannissements"
              isOpen={isOpen}
              onClick={() => navigate("/admin/users/bans")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/users/bans")}
            />
            <SidebarSubItem
              label="Adresses"
              isOpen={isOpen}
              onClick={() => navigate("/admin/addresses")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/addresses")}
            />
            <SidebarSubItem
              label="Wishlists"
              isOpen={isOpen}
              onClick={() => navigate("/admin/wishlists")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/wishlists")}
            />
          </SidebarSection>
          <SidebarSection
            icon={<ShoppingCart size={iconSize} />}
            label="Commandes"
            isOpen={isOpen}
            expanded={expandedSections.commands}
            toggle={() => toggleSection("commands")}
            textVariants={textVariants}
            isMobile={isMobile}
          >
            <SidebarSubItem
              label="Liste des commandes"
              isOpen={isOpen}
              onClick={() => navigate("/admin/commands")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/commands")}
            />
            <SidebarSubItem
              label="Lignes de commande"
              isOpen={isOpen}
              onClick={() => navigate("/admin/command-lines")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/command-lines")}
            />
            <SidebarSubItem
              label="Paniers"
              isOpen={isOpen}
              onClick={() => navigate("/admin/carts")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/carts")}
            />
            <SidebarSubItem
              label="Revenus"
              isOpen={isOpen}
              onClick={() => navigate("/admin/commands/revenue")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/commands/revenue")}
            />
            <SidebarSubItem
              label="En attente"
              isOpen={isOpen}
              onClick={() => navigate("/admin/commands/pending")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/commands/pending")}
            />
          </SidebarSection>
          <SidebarSection
            icon={<Package size={iconSize} />}
            label="Produits"
            isOpen={isOpen}
            expanded={expandedSections.products}
            toggle={() => toggleSection("products")}
            textVariants={textVariants}
            isMobile={isMobile}
          >
            <SidebarSubItem
              label="Tous les produits"
              isOpen={isOpen}
              onClick={() => navigate("/admin/products")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/products")}
            />
            <SidebarSubItem
              label="Statistiques"
              isOpen={isOpen}
              onClick={() => navigate("/admin/products/stats")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/products/stats")}
            />
            <SidebarSubItem
              label="Catégories"
              isOpen={isOpen}
              onClick={() => navigate("/admin/categories")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/categories")}
            />
            <SidebarSubItem
              label="Promotions"
              isOpen={isOpen}
              onClick={() => navigate("/admin/promotions")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/promotions")}
            />
            <SidebarSubItem
              label="Stock faible"
              isOpen={isOpen}
              onClick={() => navigate("/admin/products/low-stock")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/products/low-stock")}
            />
          </SidebarSection>
          <SidebarSection
            icon={<Calendar size={iconSize} />}
            label="Ateliers"
            isOpen={isOpen}
            expanded={expandedSections.ateliers}
            toggle={() => toggleSection("ateliers")}
            textVariants={textVariants}
            isMobile={isMobile}
          >
            <SidebarSubItem
              label="Liste des ateliers"
              isOpen={isOpen}
              onClick={() => navigate("/admin/ateliers")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/ateliers")}
            />
            <SidebarSubItem
              label="Statistiques"
              isOpen={isOpen}
              onClick={() => navigate("/admin/ateliers/stats")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/ateliers/stats")}
            />
          </SidebarSection>
          <SidebarSection
            icon={<Briefcase size={iconSize} />}
            label="Services"
            isOpen={isOpen}
            expanded={expandedSections.services}
            toggle={() => toggleSection("services")}
            textVariants={textVariants}
            isMobile={isMobile}
          >
            <SidebarSubItem
              label="Liste des services"
              isOpen={isOpen}
              onClick={() => navigate("/admin/services")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/services")}
            />
            <SidebarSubItem
              label="Devis"
              isOpen={isOpen}
              onClick={() => navigate("/admin/devis")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/devis")}
            />
            <SidebarSubItem
              label="Abonnements"
              isOpen={isOpen}
              onClick={() => navigate("/admin/subscriptions")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/subscriptions")}
            />
          </SidebarSection>
          <SidebarSection
            icon={<BookOpen size={iconSize} />}
            label="Contenu"
            isOpen={isOpen}
            expanded={expandedSections.content}
            toggle={() => toggleSection("content")}
            textVariants={textVariants}
            isMobile={isMobile}
          >
            <SidebarSubItem
              label="Articles"
              isOpen={isOpen}
              onClick={() => navigate("/admin/articles")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/articles")}
            />
            <SidebarSubItem
              label="Commentaires"
              isOpen={isOpen}
              onClick={() => navigate("/admin/comments")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/comments")}
            />
            <SidebarSubItem
              label="Réalisations"
              isOpen={isOpen}
              onClick={() => navigate("/admin/realisations")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/realisations")}
            />
          </SidebarSection>
          <SidebarSection
            icon={<DollarSign size={iconSize} />}
            label="Paiements"
            isOpen={isOpen}
            expanded={expandedSections.payments}
            toggle={() => toggleSection("payments")}
            textVariants={textVariants}
            isMobile={isMobile}
          >
            <SidebarSubItem
              label="Liste des paiements"
              isOpen={isOpen}
              onClick={() => navigate("/admin/payments")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/payments")}
            />
            <SidebarSubItem
              label="Statistiques"
              isOpen={isOpen}
              onClick={() => navigate("/admin/payments/stats")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/payments/stats")}
            />
          </SidebarSection>
          <SidebarSection
            icon={<Settings size={iconSize} />}
            label="Paramètres"
            isOpen={isOpen}
            expanded={expandedSections.settings}
            toggle={() => toggleSection("settings")}
            textVariants={textVariants}
            isMobile={isMobile}
          >
            <SidebarSubItem
              label="Paramètres généraux"
              isOpen={isOpen}
              onClick={() => navigate("/admin/settings/general")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/settings/general")}
            />
            <SidebarSubItem
              label="OTP"
              isOpen={isOpen}
              onClick={() => navigate("/admin/settings/otp")}
              textVariants={textVariants}
              isMobile={isMobile}
              isActive={isActive("/admin/settings/otp")}
            />
          </SidebarSection>
        </nav>

        <div className="p-4 border-t border-lightBorder dark:border-darkBorder">
          <SidebarItem
            icon={<LogOut size={iconSize} />}
            label="Déconnexion"
            isOpen={isOpen}
            onClick={handleLogout}
            textVariants={textVariants}
            isMobile={isMobile}
          />
        </div>
      </div>

      {/* Bouton flottant pour mobile */}
      {!isOpen && isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 p-2 bg-blue-500 text-white rounded-full shadow-lg z-50"
          aria-label="Ouvrir la barre latérale"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </motion.div>
  );
};

const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  onClick: () => void;
  textVariants: any;
  isMobile: boolean;
  isActive?: boolean;
}> = ({ icon, label, isOpen, onClick, textVariants, isMobile, isActive }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center ${isMobile ? "p-2" : "p-3"} text-lightText dark:text-darkText hover:bg-cream-beige dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 ${
      isActive ? "bg-cream-beige dark:bg-gray-600" : ""
    }`}
    aria-label={label}
  >
    {icon}
    <AnimatePresence>
      {isOpen && (
        <motion.span
          variants={textVariants}
          initial={false}
          animate="open"
          exit="closed"
          className={isMobile ? "ml-2 text-sm" : "ml-3"}
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  </button>
);

const SidebarSection: React.FC<{
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  expanded: boolean;
  toggle: () => void;
  textVariants: any;
  children: React.ReactNode;
  isMobile: boolean;
}> = ({ icon, label, isOpen, expanded, toggle, textVariants, children, isMobile }) => (
  <div>
    <button
      onClick={toggle}
      className={`w-full flex items-center justify-between ${isMobile ? "p-2" : "p-3"} text-lightText dark:text-darkText hover:bg-cream-beige dark:hover:bg-gray-600 rounded-lg transition-colors duration-200`}
      aria-expanded={expanded}
      aria-label={`Section ${label}`}
    >
      <div className="flex items-center">
        {icon}
        <AnimatePresence>
          {isOpen && (
            <motion.span
              variants={textVariants}
              initial={false}
              animate="open"
              exit="closed"
              className={isMobile ? "ml-2 text-sm" : "ml-3"}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {isOpen && (
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={isMobile ? 12 : 16} />
        </motion.div>
      )}
    </button>
    <AnimatePresence>
      {expanded && isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={isMobile ? "ml-4 mt-1 space-y-1" : "ml-6 mt-2 space-y-2"}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const SidebarSubItem: React.FC<{
  label: string;
  isOpen: boolean;
  onClick: () => void;
  textVariants: any;
  isMobile: boolean;
  isActive?: boolean;
}> = ({ label, isOpen, onClick, textVariants, isMobile, isActive }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center ${isMobile ? "p-1 text-sm" : "p-2 text-base"} text-gray-600 dark:text-gray-300 hover:bg-cream-beige dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 ${
      isActive ? "bg-cream-beige dark:bg-gray-600" : ""
    }`}
    aria-label={label}
  >
    <span className={isMobile ? "w-3" : "w-5"} />
    <AnimatePresence>
      {isOpen && (
        <motion.span variants={textVariants} initial={false} animate="open" exit="closed">
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  </button>
);

export default AdminSidebar;