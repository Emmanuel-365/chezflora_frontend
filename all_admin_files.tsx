// Chemin relatif : src\components\AdminLayout.tsx

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { Sun, Moon } from "lucide-react";

// Applique le thème immédiatement
const applyTheme = () => {
  const isDark = localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  return isDark;
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    return savedState ? JSON.parse(savedState) : window.innerWidth >= 768;
  });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [isDarkMode, setIsDarkMode] = useState(applyTheme);
  const [isLoading, setIsLoading] = useState(false); // État de chargement
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
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newMode;
    });
  };

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Simule le chargement lors du changement de page
  useEffect(() => {
    setIsLoading(true);
    // Simule un délai de chargement (remplace par une vraie logique de fetch si besoin)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Ajuste ce délai selon tes besoins réels

    return () => clearTimeout(timer);
  }, [location.pathname]); // Déclenche à chaque changement de route

  const contentMargin = isSidebarOpen ? "ml-[250px]" : isDesktop ? "ml-[80px]" : "ml-[40px]";

  return (
    <div className="flex min-h-screen">
      <div
        className={`fixed top-0 left-0 h-full transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      <div className="flex-1 w-full transition-all duration-300">
        <div className={`min-h-screen ${contentMargin} transition-all duration-300 bg-lightBg dark:bg-darkBg`}>
          <div className="flex justify-end p-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-cream-beige dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          {/* Affiche l’ancienne page ou un loader pendant le chargement */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
              <p className="text-lightText dark:text-darkText">Chargement...</p>
            </div>
          ) : (
            <Suspense fallback={<div>Chargement...</div>}>
              {children}
            </Suspense>
          )}
        </div>
      </div>

      {isSidebarOpen && !isDesktop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleSidebar} />
      )}
    </div>
  );
};

export default AdminLayout;

==================================================
// Chemin relatif : src\components\AdminSidebar.tsx

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/auth");
  };

  const isMobile = window.innerWidth < 768;
  const iconSize = isMobile ? 10 : 20;

  // Variantes sans animation initiale
  const sidebarVariants = {
    open: { width: "250px" },
    closed: { width: isMobile ? "40px" : "80px" },
  };

  const textVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 },
  };

  return (
    <motion.div
      className="fixed top-0 left-0 h-screen bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText shadow-lg z-50 overflow-y-auto"
      variants={sidebarVariants}
      initial={false} // Pas d'animation au montage initial
      animate={isOpen ? "open" : "closed"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-2 border-b border-lightBorder dark:border-darkBorder">
          <AnimatePresence>
            {isOpen && (
              <motion.div variants={textVariants} initial={false} animate="open" exit="closed">
                <h2 className={`font-semibold ${isMobile ? "text-sm" : "text-xl"}`}>ChezFlora Admin</h2>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-cream-beige dark:hover:bg-gray-600 rounded-full"
          >
            {isOpen ? <ChevronRight size={iconSize} /> : <ChevronDown size={iconSize} />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          <SidebarItem
            icon={<Home size={iconSize} />}
            label="Tableau de bord"
            isOpen={isOpen}
            onClick={() => navigate("/admin")}
            textVariants={textVariants}
            isMobile={isMobile}
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
            />
            <SidebarSubItem
              label="Statistiques"
              isOpen={isOpen}
              onClick={() => navigate("/admin/users/stats")}
              textVariants={textVariants}
              isMobile={isMobile}
            />
            <SidebarSubItem
              label="Bannissements"
              isOpen={isOpen}
              onClick={() => navigate("/admin/users/bans")}
              textVariants={textVariants}
              isMobile={isMobile}
            />
            <SidebarSubItem
              label="Adresses"
              isOpen={isOpen}
              onClick={() => navigate("/admin/addresses")}
              textVariants={textVariants}
              isMobile={isMobile}
            />
            <SidebarSubItem
              label="Wishlists"
              isOpen={isOpen}
              onClick={() => navigate("/admin/wishlists")}
              textVariants={textVariants}
              isMobile={isMobile}
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
            />
            <SidebarSubItem
              label="Lignes de commande"
              isOpen={isOpen}
              onClick={() => navigate("/admin/command-lines")}
              textVariants={textVariants}
              isMobile={isMobile}
            />
            <SidebarSubItem
              label="Paniers"
              isOpen={isOpen}
              onClick={() => navigate("/admin/carts")}
              textVariants={textVariants}
              isMobile={isMobile}
            />
            <SidebarSubItem
              label="Revenus"
              isOpen={isOpen}
              onClick={() => navigate("/admin/commands/revenue")}
              textVariants={textVariants}
              isMobile={isMobile}
            />
            <SidebarSubItem
              label="En attente"
              isOpen={isOpen}
              onClick={() => navigate("/admin/commands/pending")}
              textVariants={textVariants}
              isMobile={isMobile}
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
            />
            <SidebarSubItem
              label="Statistiques"
              isOpen={isOpen}
              onClick={() => navigate("/admin/products/stats")}
              textVariants={textVariants}
              isMobile={isMobile}
            />
            <SidebarSubItem
              label="Catégories"
              isOpen={isOpen}
              onClick={() => navigate("/admin/categories")}
              textVariants={textVariants}
              isMobile={isMobile}
            />
            <SidebarSubItem
              label="Promotions"
              isOpen={isOpen}
              onClick={() => navigate("/admin/promotions")}
              textVariants={textVariants}
              isMobile={isMobile}
            />
            <SidebarSubItem
              label="Stock faible"
              isOpen={isOpen}
              onClick={() => navigate("/admin/products/low-stock")}
              textVariants={textVariants}
              isMobile={isMobile}
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
            />
            <SidebarSubItem
              label="Statistiques"
              isOpen={isOpen}
              onClick={() => navigate("/admin/ateliers/stats")}
              textVariants={textVariants}
              isMobile={isMobile}
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
            />
            <SidebarSubItem
              label="Ajouter un service"
              isOpen={isOpen}
              onClick={() => navigate("/admin/services/add")}
              textVariants={textVariants}
              isMobile={isMobile}
            />
            <SidebarSubItem
              label="Devis"
              isOpen={isOpen}
              onClick={() => navigate("/admin/devis")}
              textVariants={textVariants}
              isMobile={isMobile}
            />
            <SidebarSubItem
              label="Abonnements"
              isOpen={isOpen}
              onClick={() => navigate("/admin/subscriptions")}
              textVariants={textVariants}
              isMobile={isMobile}
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
            />
            <SidebarSubItem
              label="Commentaires"
              isOpen={isOpen}
              onClick={() => navigate("/admin/comments")}
              textVariants={textVariants}
              isMobile={isMobile}
            />
            <SidebarSubItem
              label="Réalisations"
              isOpen={isOpen}
              onClick={() => navigate("/admin/realisations")}
              textVariants={textVariants}
              isMobile={isMobile}
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
            />
            <SidebarSubItem
              label="Statistiques"
              isOpen={isOpen}
              onClick={() => navigate("/admin/payments/stats")}
              textVariants={textVariants}
              isMobile={isMobile}
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
            />
            <SidebarSubItem
              label="OTP"
              isOpen={isOpen}
              onClick={() => navigate("/admin/settings/otp")}
              textVariants={textVariants}
              isMobile={isMobile}
            />
          </SidebarSection>
        </nav>

        <div className="p-2 border-t border-lightBorder dark:border-darkBorder">
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
}> = ({ icon, label, isOpen, onClick, textVariants, isMobile }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center ${isMobile ? "p-1" : "p-3"} text-lightText dark:text-darkText hover:bg-cream-beige dark:hover:bg-gray-600 rounded-lg transition-colors duration-200`}
  >
    {icon}
    <AnimatePresence>
      {isOpen && (
        <motion.span variants={textVariants} initial={false} animate="open" exit="closed" className={isMobile ? "ml-1 text-sm" : "ml-3"}>
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
      className={`w-full flex items-center justify-between ${isMobile ? "p-1" : "p-3"} text-lightText dark:text-darkText hover:bg-cream-beige dark:hover:bg-gray-600 rounded-lg transition-colors duration-200`}
    >
      <div className="flex items-center">
        {icon}
        <AnimatePresence>
          {isOpen && (
            <motion.span variants={textVariants} initial={false} animate="open" exit="closed" className={isMobile ? "ml-1 text-sm" : "ml-3"}>
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {isOpen && (
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={isMobile ? 8 : 16} />
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
          className={isMobile ? "ml-3 mt-0.5 space-y-0.5" : "ml-6 mt-1 space-y-1"}
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
}> = ({ label, isOpen, onClick, textVariants, isMobile }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center ${isMobile ? "p-0.5 text-xs" : "p-2 text-sm"} text-gray-600 dark:text-gray-300 hover:bg-cream-beige dark:hover:bg-gray-600 rounded-lg transition-colors duration-200`}
  >
    <span className={isMobile ? "w-2" : "w-5"} />
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

==================================================
// Chemin relatif : src\pages\AdminAbonnementsPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { CreditCard, Search, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Produit {
  id: string;
  nom: string;
}

interface Abonnement {
  id: string;
  client: string;
  type: string;
  produits: Produit[];
  date_debut: string;
  date_fin: string | null;
  prix: string;
  is_active: boolean;
  prochaine_livraison: string | null;
}

interface Stats {
  total_abonnements: number;
  active_abonnements: number;
  revenus: string;
  abonnements_by_type: { type: string; total: number }[];
}

interface ApiResponse {
  results: Abonnement[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminAbonnementsPage: React.FC = () => {
  
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [totalAbonnements, setTotalAbonnements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedAbonnement, setSelectedAbonnement] = useState<Abonnement | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAbonnement, setEditAbonnement] = useState({ type: '', date_debut: '', date_fin: '', prix: '', is_active: true, prochaine_livraison: '' });
  const abonnementsPerPage = 10;

  useEffect(() => {
    fetchAbonnements();
    fetchStats();
  }, [currentPage, searchQuery, filterType]);

  const fetchAbonnements = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/abonnements/', {
        params: {
          page: currentPage,
          per_page: abonnementsPerPage,
          search: searchQuery || undefined,
          type: filterType !== 'all' ? filterType : undefined,
        },
      });
      setAbonnements(response.data.results);
      setTotalAbonnements(response.data.count);
      setTotalPages(Math.ceil(response.data.count / abonnementsPerPage));
      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors du chargement des abonnements.');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/abonnements/stats/');
      setStats(response.data);
    } catch (err: any) {
      setError('Erreur lors du chargement des statistiques.');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const openEditModal = (abonnement: Abonnement) => {
    setSelectedAbonnement(abonnement);
    setEditAbonnement({
      type: abonnement.type,
      date_debut: abonnement.date_debut.split('T')[0],
      date_fin: abonnement.date_fin ? abonnement.date_fin.split('T')[0] : '',
      prix: abonnement.prix,
      is_active: abonnement.is_active,
      prochaine_livraison: abonnement.prochaine_livraison ? abonnement.prochaine_livraison.split('T')[0] : '',
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => { setIsEditModalOpen(false); setSelectedAbonnement(null); };

  const handleEditAbonnement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAbonnement) return;
    try {
      const data = {
        ...editAbonnement,
        prix: parseFloat(editAbonnement.prix).toString(),
        date_fin: editAbonnement.date_fin || null,
        prochaine_livraison: editAbonnement.prochaine_livraison || null,
      };
      await api.put(`/abonnements/${selectedAbonnement.id}/`, data);
      setIsEditModalOpen(false);
      fetchAbonnements();
      fetchStats();
    } catch (err: any) {
      setError('Erreur lors de la mise à jour de l’abonnement.');
    }
  };

  const abonnementsChartData = {
    labels: stats ? stats.abonnements_by_type.map((item) => item.type) : [],
    datasets: [
      {
        label: 'Abonnements par type',
        data: stats ? stats.abonnements_by_type.map((item) => item.total) : [],
        backgroundColor: '#2196F3',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Abonnements actifs par type' } },
  };

  if (loading) return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <CreditCard className="h-6 w-6 mr-2" /> Gestion des Abonnements
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Total Abonnements</h2>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats?.total_abonnements}</p>
          </div>
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Abonnements Actifs</h2>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats?.active_abonnements}</p>
          </div>
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Revenus (FCFA)</h2>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats?.revenus}</p>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Rechercher par client..."
                className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={handleFilterType}
              className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="mensuel">Mensuel</option>
              <option value="hebdomadaire">Hebdomadaire</option>
              <option value="annuel">Annuel</option>
            </select>
          </div>
        </div>

        <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Abonnements par type</h2>
          <div className="h-48 sm:h-64">
            <Bar data={abonnementsChartData} options={chartOptions} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:bordergimdarkBorder">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Produits</th>
                <th className="py-3 px-4">Début</th>
                <th className="py-3 px-4">Fin</th>
                <th className="py-3 px-4">Prix (FCFA)</th>
                <th className="py-3 px-4">Prochaine Livraison</th>
                <th className="py-3 px-4">Actif</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {abonnements.map((abonnement) => (
                <tr key={abonnement.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.client}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.type}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.produits.length}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(abonnement.date_debut).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.date_fin ? new Date(abonnement.date_fin).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.prix}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.prochaine_livraison ? new Date(abonnement.prochaine_livraison).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${abonnement.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {abonnement.is_active ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <ButtonPrimary onClick={() => openEditModal(abonnement)} className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm">
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * abonnementsPerPage + 1} à {Math.min(currentPage * abonnementsPerPage, totalAbonnements)} sur {totalAbonnements} abonnements
          </p>
          <div className="flex gap-2">
            <ButtonPrimary onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {isEditModalOpen && selectedAbonnement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier l’abonnement
              </h2>
              <form onSubmit={handleEditAbonnement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Type</label>
                  <select
                    value={editAbonnement.type}
                    onChange={(e) => setEditAbonnement({ ...editAbonnement, type: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mensuel">Mensuel</option>
                    <option value="hebdomadaire">Hebdomadaire</option>
                    <option value="annuel">Annuel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date de début</label>
                  <input type="date" value={editAbonnement.date_debut} onChange={(e) => setEditAbonnement({ ...editAbonnement, date_debut: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date de fin</label>
                  <input type="date" value={editAbonnement.date_fin} onChange={(e) => setEditAbonnement({ ...editAbonnement, date_fin: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prix (FCFA)</label>
                  <input type="number" step="0.01" value={editAbonnement.prix} onChange={(e) => setEditAbonnement({ ...editAbonnement, prix: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prochaine livraison</label>
                  <input type="date" value={editAbonnement.prochaine_livraison} onChange={(e) => setEditAbonnement({ ...editAbonnement, prochaine_livraison: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={editAbonnement.is_active} onChange={(e) => setEditAbonnement({ ...editAbonnement, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeEditModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Enregistrer</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAbonnementsPage;

==================================================
// Chemin relatif : src\pages\AdminAddressesPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Utilisation de l’instance axios existante
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { MapPin, Search, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Address {
  id: string;
  client: {
    id: string;
    username: string;
    email: string;
  };
  nom: string;
  rue: string;
  ville: string;
  code_postal: string;
  pays: string;
}

interface ApiResponse {
  results: Address[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminAddressesPage: React.FC = () => {
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [totalAddresses, setTotalAddresses] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editAddress, setEditAddress] = useState({
    nom: '',
    rue: '',
    ville: '',
    code_postal: '',
    pays: '',
  });
  const addressesPerPage = 10;

  useEffect(() => {
    fetchAddresses();
  }, [currentPage, searchQuery]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/adresses/', {
        params: {
          page: currentPage,
          per_page: addressesPerPage,
          search: searchQuery || undefined, // Recherche par email ou nom d’utilisateur du client
        },
      });
      setAddresses(response.data.results);
      setTotalAddresses(response.data.count);
      setTotalPages(Math.ceil(response.data.count / addressesPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des adresses:', err.response?.data);
      setError('Erreur lors du chargement des adresses.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openEditModal = (address: Address) => {
    setSelectedAddress(address);
    setEditAddress({
      nom: address.nom,
      rue: address.rue,
      ville: address.ville,
      code_postal: address.code_postal,
      pays: address.pays,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedAddress(null);
  };

  const handleEditAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) return;

    try {
      await api.put(`/adresses/${selectedAddress.id}/`, editAddress);
      setIsEditModalOpen(false);
      fetchAddresses();
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de l’adresse:', err.response?.data);
      setError('Erreur lors de la mise à jour de l’adresse.');
    }
  };

  const openDeleteModal = (address: Address) => {
    setSelectedAddress(address);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedAddress(null);
  };

  const handleDeleteAddress = async () => {
    if (!selectedAddress) return;

    try {
      await api.delete(`/adresses/${selectedAddress.id}/`);
      setIsDeleteModalOpen(false);
      fetchAddresses();
    } catch (err: any) {
      console.error('Erreur lors de la suppression de l’adresse:', err.response?.data);
      setError('Erreur lors de la suppression de l’adresse.');
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <MapPin className="h-6 w-6 mr-2" /> Gestion des Adresses
        </h1>

        {/* Recherche */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par email ou nom d’utilisateur..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Liste des adresses */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Utilisateur</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Email</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Rue</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Ville</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Code Postal</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Pays</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
              </tr>
            </thead>
            <tbody>
              {addresses.map((address) => (
                <tr key={address.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{address.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{address.client.username}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{address.client.email}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{address.nom}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{address.rue}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{address.ville}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{address.code_postal}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{address.pays}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary
                      onClick={() => openEditModal(address)}
                      className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                    <ButtonPrimary
                      onClick={() => openDeleteModal(address)}
                      className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                    </ButtonPrimary>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * addressesPerPage + 1} à{' '}
            {Math.min(currentPage * addressesPerPage, totalAddresses)} sur {totalAddresses} adresses
          </p>
          <div className="flex gap-2">
            <ButtonPrimary
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {/* Modal pour modifier une adresse */}
        {isEditModalOpen && selectedAddress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier l’adresse
              </h2>
              <form onSubmit={handleEditAddress} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                  <input
                    type="text"
                    value={editAddress.nom}
                    onChange={(e) => setEditAddress({ ...editAddress, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Rue</label>
                  <input
                    type="text"
                    value={editAddress.rue}
                    onChange={(e) => setEditAddress({ ...editAddress, rue: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Ville</label>
                  <input
                    type="text"
                    value={editAddress.ville}
                    onChange={(e) => setEditAddress({ ...editAddress, ville: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Code Postal</label>
                  <input
                    type="text"
                    value={editAddress.code_postal}
                    onChange={(e) => setEditAddress({ ...editAddress, code_postal: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Pays</label>
                  <input
                    type="text"
                    value={editAddress.pays}
                    onChange={(e) => setEditAddress({ ...editAddress, pays: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
                    Enregistrer
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal pour supprimer une adresse */}
        {isDeleteModalOpen && selectedAddress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer l’adresse
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer l’adresse de <span className="font-medium">{selectedAddress.client.email}</span> ({selectedAddress.nom}) ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleDeleteAddress}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Supprimer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAddressesPage;

==================================================
// Chemin relatif : src\pages\AdminArticlesPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { FileText, Search, Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Article {
  id: string;
  titre: string;
  contenu: string;
  cover: string | null;
  auteur: string;
  date_publication: string;
  is_active: boolean;
}

interface ApiResponse {
  results: Article[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({ titre: '', contenu: '', cover: null as File | null, is_active: true });
  const [editArticle, setEditArticle] = useState({ titre: '', contenu: '', cover: null as File | null, is_active: true });
  const articlesPerPage = 10;

  useEffect(() => {
    fetchArticles();
  }, [currentPage, searchQuery]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/articles/', {
        params: { page: currentPage, per_page: articlesPerPage, search: searchQuery || undefined },
      });
      setArticles(response.data.results);
      setTotalArticles(response.data.count);
      setTotalPages(Math.ceil(response.data.count / articlesPerPage));
      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors du chargement des articles.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const openAddModal = () => {
    setNewArticle({ titre: '', contenu: '', cover: null, is_active: true });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => { setIsAddModalOpen(false); };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('titre', newArticle.titre);
      formData.append('contenu', newArticle.contenu);
      if (newArticle.cover) formData.append('cover', newArticle.cover);
      formData.append('is_active', newArticle.is_active.toString());
      await api.post('/articles/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsAddModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      setError('Erreur lors de l’ajout de l’article.');
    }
  };

  const openEditModal = (article: Article) => {
    setSelectedArticle(article);
    setEditArticle({ titre: article.titre, contenu: article.contenu, cover: null, is_active: article.is_active });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => { setIsEditModalOpen(false); setSelectedArticle(null); };

  const handleEditArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) return;
    try {
      const formData = new FormData();
      formData.append('titre', editArticle.titre);
      formData.append('contenu', editArticle.contenu);
      if (editArticle.cover) formData.append('cover', editArticle.cover);
      formData.append('is_active', editArticle.is_active.toString());
      await api.put(`/articles/${selectedArticle.id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsEditModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      setError('Erreur lors de la mise à jour de l’article.');
    }
  };

  const openDeleteModal = (article: Article) => { setSelectedArticle(article); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setIsDeleteModalOpen(false); setSelectedArticle(null); };

  const handleDeleteArticle = async () => {
    if (!selectedArticle) return;
    try {
      await api.delete(`/articles/${selectedArticle.id}/`);
      setIsDeleteModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      setError('Erreur lors de la suppression de l’article.');
    }
  };

  if (loading) return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <FileText className="h-6 w-6 mr-2" /> Gestion des Articles
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par titre..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ButtonPrimary onClick={openAddModal} className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center">
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un article
          </ButtonPrimary>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Titre</th>
                <th className="py-3 px-4">Auteur</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{article.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{article.titre}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{article.auteur}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(article.date_publication).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${article.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {article.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary onClick={() => openEditModal(article)} className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm">
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                    <ButtonPrimary onClick={() => openDeleteModal(article)} className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm">
                      <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                    </ButtonPrimary>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * articlesPerPage + 1} à {Math.min(currentPage * articlesPerPage, totalArticles)} sur {totalArticles} articles
          </p>
          <div className="flex gap-2">
            <ButtonPrimary onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un article
              </h2>
              <form onSubmit={handleAddArticle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Titre</label>
                  <input type="text" value={newArticle.titre} onChange={(e) => setNewArticle({ ...newArticle, titre: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Contenu</label>
                  <textarea value={newArticle.contenu} onChange={(e) => setNewArticle({ ...newArticle, contenu: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={5} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Image de couverture</label>
                  <input type="file" onChange={(e) => setNewArticle({ ...newArticle, cover: e.target.files?.[0] || null })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={newArticle.is_active} onChange={(e) => setNewArticle({ ...newArticle, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeAddModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Ajouter</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && selectedArticle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier l’article
              </h2>
              <form onSubmit={handleEditArticle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Titre</label>
                  <input type="text" value={editArticle.titre} onChange={(e) => setEditArticle({ ...editArticle, titre: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Contenu</label>
                  <textarea value={editArticle.contenu} onChange={(e) => setEditArticle({ ...editArticle, contenu: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={5} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Image de couverture</label>
                  <input type="file" onChange={(e) => setEditArticle({ ...editArticle, cover: e.target.files?.[0] || null })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText" />
                  {selectedArticle.cover && !editArticle.cover && <img src={selectedArticle.cover} alt="Cover" className="mt-2 h-16 w-16 object-cover rounded" />}
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={editArticle.is_active} onChange={(e) => setEditArticle({ ...editArticle, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeEditModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Enregistrer</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && selectedArticle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer l’article
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer l’article <span className="font-medium">{selectedArticle.titre}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary type="button" onClick={closeDeleteModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                <ButtonPrimary onClick={handleDeleteArticle} className="px-4 py-2 bg-red-500 text-white hover:bg-red-600">Supprimer</ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminArticlesPage;

==================================================
// Chemin relatif : src\pages\AdminAteliersPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Calendar, Search, Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Atelier {
  id: string;
  nom: string;
  description: string;
  date: string;
  duree: number;
  prix: string;
  places_totales: number;
  is_active: boolean;
  places_disponibles: number;
}

interface ApiResponse {
  results: Atelier[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminAteliersPage: React.FC = () => {
  
  const [ateliers, setAteliers] = useState<Atelier[]>([]);
  const [totalAteliers, setTotalAteliers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAtelier, setSelectedAtelier] = useState<Atelier | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newAtelier, setNewAtelier] = useState({
    nom: '', description: '', date: '', duree: '', prix: '', places_totales: '', is_active: true,
  });
  const [editAtelier, setEditAtelier] = useState({
    nom: '', description: '', date: '', duree: '', prix: '', places_totales: '', is_active: true,
  });
  const ateliersPerPage = 10;

  useEffect(() => {
    fetchAteliers();
  }, [currentPage, searchQuery]);

  const fetchAteliers = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/ateliers/', {
        params: { page: currentPage, per_page: ateliersPerPage, search: searchQuery || undefined },
      });
      setAteliers(response.data.results);
      setTotalAteliers(response.data.count);
      setTotalPages(Math.ceil(response.data.count / ateliersPerPage));
      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors du chargement des ateliers.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const openAddModal = () => {
    setNewAtelier({ nom: '', description: '', date: '', duree: '', prix: '', places_totales: '', is_active: true });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => { setIsAddModalOpen(false); };

  const handleAddAtelier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const atelierData = {
        ...newAtelier,
        duree: parseInt(newAtelier.duree),
        prix: parseFloat(newAtelier.prix).toString(),
        places_totales: parseInt(newAtelier.places_totales),
      };
      await api.post('/ateliers/', atelierData);
      setIsAddModalOpen(false);
      fetchAteliers();
    } catch (err: any) {
      setError('Erreur lors de l’ajout de l’atelier.');
    }
  };

  const openEditModal = (atelier: Atelier) => {
    setSelectedAtelier(atelier);
    setEditAtelier({
      nom: atelier.nom,
      description: atelier.description,
      date: atelier.date.split('T')[0],
      duree: atelier.duree.toString(),
      prix: atelier.prix,
      places_totales: atelier.places_totales.toString(),
      is_active: atelier.is_active,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => { setIsEditModalOpen(false); setSelectedAtelier(null); };

  const handleEditAtelier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAtelier) return;
    try {
      const atelierData = {
        ...editAtelier,
        duree: parseInt(editAtelier.duree),
        prix: parseFloat(editAtelier.prix).toString(),
        places_totales: parseInt(editAtelier.places_totales),
      };
      await api.put(`/ateliers/${selectedAtelier.id}/`, atelierData);
      setIsEditModalOpen(false);
      fetchAteliers();
    } catch (err: any) {
      setError('Erreur lors de la mise à jour de l’atelier.');
    }
  };

  console.log(ateliers)

  const openDeleteModal = (atelier: Atelier) => { setSelectedAtelier(atelier); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setIsDeleteModalOpen(false); setSelectedAtelier(null); };

  const handleDeleteAtelier = async () => {
    if (!selectedAtelier) return;
    try {
      await api.delete(`/ateliers/${selectedAtelier.id}/`);
      setIsDeleteModalOpen(false);
      fetchAteliers();
    } catch (err: any) {
      setError('Erreur lors de la suppression de l’atelier.');
    }
  };

  if (loading) return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <Calendar className="h-6 w-6 mr-2" /> Gestion des Ateliers
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par nom..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ButtonPrimary onClick={openAddModal} className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center">
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un atelier
          </ButtonPrimary>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nom</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Durée (min)</th>
                <th className="py-3 px-4">Prix (FCFA)</th>
                <th className="py-3 px-4">Places Totales</th>
                <th className="py-3 px-4">Places Disponibles</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ateliers.map((atelier) => (
                <tr key={atelier.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.nom}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(atelier.date).toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.duree}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.prix}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.places_totales}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.places_disponibles}</td>                  
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${atelier.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {atelier.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary onClick={() => openEditModal(atelier)} className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm">
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                    <ButtonPrimary onClick={() => openDeleteModal(atelier)} className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm">
                      <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                    </ButtonPrimary>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * ateliersPerPage + 1} à {Math.min(currentPage * ateliersPerPage, totalAteliers)} sur {totalAteliers} ateliers
          </p>
          <div className="flex gap-2">
            <ButtonPrimary onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un atelier
              </h2>
              <form onSubmit={handleAddAtelier} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                  <input type="text" value={newAtelier.nom} onChange={(e) => setNewAtelier({ ...newAtelier, nom: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea value={newAtelier.description} onChange={(e) => setNewAtelier({ ...newAtelier, description: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date</label>
                  <input type="datetime-local" value={newAtelier.date} onChange={(e) => setNewAtelier({ ...newAtelier, date: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Durée (minutes)</label>
                  <input type="number" value={newAtelier.duree} onChange={(e) => setNewAtelier({ ...newAtelier, duree: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prix (FCFA)</label>
                  <input type="number" step="0.01" value={newAtelier.prix} onChange={(e) => setNewAtelier({ ...newAtelier, prix: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Places totales</label>
                  <input type="number" value={newAtelier.places_totales} onChange={(e) => setNewAtelier({ ...newAtelier, places_totales: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={newAtelier.is_active} onChange={(e) => setNewAtelier({ ...newAtelier, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeAddModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Ajouter</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && selectedAtelier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier l’atelier
              </h2>
              <form onSubmit={handleEditAtelier} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                  <input type="text" value={editAtelier.nom} onChange={(e) => setEditAtelier({ ...editAtelier, nom: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea value={editAtelier.description} onChange={(e) => setEditAtelier({ ...editAtelier, description: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date</label>
                  <input type="date" value={editAtelier.date} onChange={(e) => setEditAtelier({ ...editAtelier, date: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Durée (minutes)</label>
                  <input type="number" value={editAtelier.duree} onChange={(e) => setEditAtelier({ ...editAtelier, duree: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prix (FCFA)</label>
                  <input type="number" step="0.01" value={editAtelier.prix} onChange={(e) => setEditAtelier({ ...editAtelier, prix: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Places totales</label>
                  <input type="number" value={editAtelier.places_totales} onChange={(e) => setEditAtelier({ ...editAtelier, places_totales: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={editAtelier.is_active} onChange={(e) => setEditAtelier({ ...editAtelier, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeEditModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Enregistrer</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && selectedAtelier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer l’atelier
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer l’atelier <span className="font-medium">{selectedAtelier.nom}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary type="button" onClick={closeDeleteModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                <ButtonPrimary onClick={handleDeleteAtelier} className="px-4 py-2 bg-red-500 text-white hover:bg-red-600">Supprimer</ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAteliersPage;

==================================================
// Chemin relatif : src\pages\AdminAteliersParticipantsPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Users, Search, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

interface Participant {
  id: string;
  utilisateur: string;
  date_inscription: string;
  statut: string;
}

interface Atelier {
  id: string;
  nom: string;
}

// interface ApiResponse {
//   results: Participant[];
//   count: number;
//   next: string | null;
//   previous: string | null;
// }

const AdminAteliersParticipantsPage: React.FC = () => {
  
  const { atelierId } = useParams<{ atelierId: string }>();
  const [atelier, setAtelier] = useState<Atelier | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const participantsPerPage = 10;
  const navigate = useNavigate();


  useEffect(() => {
    fetchAtelier();
    fetchParticipants();
  }, [atelierId, currentPage, searchQuery]);

  const fetchAtelier = async () => {
    try {
      const response = await api.get(`/ateliers/${atelierId}/`);
      setAtelier(response.data);
    } catch (err: any) {
      setError('Erreur lors du chargement de l’atelier.');
    }
  };

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/ateliers/${atelierId}/participants/`, {
        params: { page: currentPage, per_page: participantsPerPage, search: searchQuery || undefined },
      });
      setParticipants(response.data);
      setTotalParticipants(response.data.length); // Ajuster si pagination côté serveur
      setTotalPages(Math.ceil(response.data.length / participantsPerPage));
      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors du chargement des participants.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const handleBack = () => { navigate('/admin/ateliers'); };

  if (loading) return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText flex items-center">
            <Users className="h-6 w-6 mr-2" /> Participants - {atelier?.nom}
          </h1>
          <ButtonPrimary onClick={handleBack} className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 flex items-center">
            <ArrowLeft className="h-5 w-5 mr-2" /> Retour
          </ButtonPrimary>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par utilisateur..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Utilisateur</th>
                <th className="py-3 px-4">Date d’inscription</th>
                <th className="py-3 px-4">Statut</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{participant.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{participant.utilisateur}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(participant.date_inscription).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${participant.statut === 'present' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : participant.statut === 'annule' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                      {participant.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * participantsPerPage + 1} à {Math.min(currentPage * participantsPerPage, totalParticipants)} sur {totalParticipants} participants
          </p>
          <div className="flex gap-2">
            <ButtonPrimary onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAteliersParticipantsPage;

==================================================
// Chemin relatif : src\pages\AdminAteliersStatsPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { BarChart2, Calendar, DollarSign} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AtelierStats {
  total_ateliers: number;
  active_ateliers: number;
  total_revenus: string;
  inscriptions_by_atelier: { atelier__nom: string; total: number }[];
}

const AdminAteliersStatsPage: React.FC = () => {
  const [statsData, setStatsData] = useState<AtelierStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysFilter, setDaysFilter] = useState<number>(30);

  useEffect(() => {
    fetchStatsData();
  }, [daysFilter]);

  const fetchStatsData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ateliers/stats/', { params: { days: daysFilter } });
      setStatsData(response.data);
      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors du chargement des statistiques des ateliers.');
      setLoading(false);
    }
  };

  const handleFilterChange = (days: number) => {
    setDaysFilter(days);
  };

  const inscriptionsChartData = {
    labels: statsData ? statsData.inscriptions_by_atelier.map((item) => item.atelier__nom) : [],
    datasets: [
      {
        label: 'Inscriptions par atelier',
        data: statsData ? statsData.inscriptions_by_atelier.map((item) => item.total) : [],
        backgroundColor: '#2196F3',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const }, title: { display: true, text: `Inscriptions sur ${daysFilter} jours` } },
  };

  if (loading) return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <BarChart2 className="h-6 w-6 mr-2" /> Statistiques des Ateliers
        </h1>

        <div className="mb-6 flex flex-wrap gap-2">
          <ButtonPrimary onClick={() => handleFilterChange(7)} className={`px-4 py-2 ${daysFilter === 7 ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>7 jours</ButtonPrimary>
          <ButtonPrimary onClick={() => handleFilterChange(30)} className={`px-4 py-2 ${daysFilter === 30 ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>30 jours</ButtonPrimary>
          <ButtonPrimary onClick={() => handleFilterChange(90)} className={`px-4 py-2 ${daysFilter === 90 ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>90 jours</ButtonPrimary>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
              <Calendar className="h-5 w-5 mr-2" /> Total Ateliers
            </h2>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{statsData?.total_ateliers}</p>
          </div>
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
              <Calendar className="h-5 w-5 mr-2" /> Ateliers Actifs
            </h2>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{statsData?.active_ateliers}</p>
          </div>
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" /> Total Revenus
            </h2>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{statsData?.total_revenus} FCFA</p>
          </div>
        </div>

        <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Inscriptions par atelier</h2>
          <div className="h-48 sm:h-64">
            <Bar data={inscriptionsChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAteliersStatsPage;

==================================================
// Chemin relatif : src\pages\AdminCartsPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { ShoppingBag, Search, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Panier {
  id: string;
  client: { id: string; username: string; email: string };
  items: { id: string; produit: { id: string; nom: string; prix: string }; quantite: number }[];
}

interface ApiResponse {
  results: Panier[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminCartsPage: React.FC = () => {
  
  const [carts, setCarts] = useState<Panier[]>([]);
  const [totalCarts, setTotalCarts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCart, setSelectedCart] = useState<Panier | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const cartsPerPage = 10;

  useEffect(() => {
    fetchCarts();
  }, [currentPage, searchQuery]);

  const fetchCarts = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/paniers/', {
        params: {
          page: currentPage,
          per_page: cartsPerPage,
          search: searchQuery || undefined,
        },
      });
      setCarts(response.data.results);
      setTotalCarts(response.data.count);
      setTotalPages(Math.ceil(response.data.count / cartsPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des paniers:', err.response?.data);
      setError('Erreur lors du chargement des paniers.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openDetailsModal = (cart: Panier) => {
    setSelectedCart(cart);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCart(null);
  };

  const openDeleteModal = (cart: Panier) => {
    setSelectedCart(cart);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCart(null);
  };

  const handleDeleteCart = async () => {
    if (!selectedCart) return;

    try {
      await api.delete(`/paniers/${selectedCart.id}/`);
      setIsDeleteModalOpen(false);
      fetchCarts();
    } catch (err: any) {
      console.error('Erreur lors de la suppression du panier:', err.response?.data);
      setError('Erreur lors de la suppression du panier.');
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <ShoppingBag className="h-6 w-6 mr-2" /> Gestion des Paniers
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par email ou nom d’utilisateur..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Utilisateur</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Email</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Nb Articles</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Total</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
              </tr>
            </thead>
            <tbody>
              {carts.map((cart) => {
                const total = cart.items.reduce((sum, item) => sum + parseFloat(item.produit.prix) * item.quantite, 0);
                return (
                  <tr key={cart.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{cart.id}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{cart.client.username}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{cart.client.email}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{cart.items.length}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{total.toFixed(2)} FCFA</td>
                    <td className="py-3 px-4 flex gap-2">
                      <ButtonPrimary
                        onClick={() => openDetailsModal(cart)}
                        className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" /> Détails
                      </ButtonPrimary>
                      <ButtonPrimary
                        onClick={() => openDeleteModal(cart)}
                        className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                      </ButtonPrimary>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * cartsPerPage + 1} à{' '}
            {Math.min(currentPage * cartsPerPage, totalCarts)} sur {totalCarts} paniers
          </p>
          <div className="flex gap-2">
            <ButtonPrimary
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {isDetailsModalOpen && selectedCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-2xl">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2" /> Détails du Panier de {selectedCart.client.username}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-lightCard dark:bg-darkCard">
                    <tr className="border-b border-lightBorder dark:border-darkBorder">
                      <th className="py-3 px-4 text-lightText dark:text-darkText">ID Produit</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Quantité</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Prix</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCart.items.map((item) => (
                      <tr key={item.id} className="border-b border-lightBorder dark:border-darkBorder">
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.produit.id}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.produit.nom}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.quantite}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.produit.prix} FCFA</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{(parseFloat(item.produit.prix) * item.quantite).toFixed(2)} FCFA</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <ButtonPrimary
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Fermer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}

        {isDeleteModalOpen && selectedCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer le Panier
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer le panier de <span className="font-medium">{selectedCart.client.email}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleDeleteCart}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Supprimer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCartsPage;

==================================================
// Chemin relatif : src\pages\AdminCategoriesPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Folder, Search, Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  nom: string;
  is_active: boolean;
  date_creation: string;
}

interface ApiResponse {
  results: Category[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminCategoriesPage: React.FC = () => {
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    nom: '',
    is_active: true,
  });
  const [editCategory, setEditCategory] = useState({
    nom: '',
    is_active: true,
  });
  const categoriesPerPage = 10;

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchQuery, filterStatus]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/categories/', {
        params: {
          page: currentPage,
          per_page: categoriesPerPage,
          search: searchQuery || undefined,
          is_active: filterStatus !== 'all' ? filterStatus : undefined,
        },
      });
      setCategories(response.data.results);
      setTotalCategories(response.data.count);
      setTotalPages(Math.ceil(response.data.count / categoriesPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des catégories:', err.response?.data);
      setError('Erreur lors du chargement des catégories.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openAddModal = () => {
    setNewCategory({ nom: '', is_active: true });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/categories/', newCategory);
      setIsAddModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      console.error('Erreur lors de l’ajout de la catégorie:', err.response?.data);
      setError('Erreur lors de l’ajout de la catégorie.');
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setEditCategory({
      nom: category.nom,
      is_active: category.is_active,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCategory(null);
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      await api.put(`/categories/${selectedCategory.id}/`, editCategory);
      setIsEditModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la catégorie:', err.response?.data);
      setError('Erreur lors de la mise à jour de la catégorie.');
    }
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      await api.delete(`/categories/${selectedCategory.id}/`);
      setIsDeleteModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la catégorie:', err.response?.data);
      setError('Erreur lors de la suppression de la catégorie.');
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <Folder className="h-6 w-6 mr-2" /> Gestion des Catégories
        </h1>

        {/* Filtres et Recherche */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Rechercher par nom..."
                className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={handleFilterStatus}
              className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>
          <ButtonPrimary
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter une catégorie
          </ButtonPrimary>
        </div>

        {/* Liste des catégories */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Statut</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Date de création</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{category.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{category.nom}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        category.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {category.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {new Date(category.date_creation).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary
                      onClick={() => openEditModal(category)}
                      className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                    <ButtonPrimary
                      onClick={() => openDeleteModal(category)}
                      className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                    </ButtonPrimary>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * categoriesPerPage + 1} à{' '}
            {Math.min(currentPage * categoriesPerPage, totalCategories)} sur {totalCategories} catégories
          </p>
          <div className="flex gap-2">
            <ButtonPrimary
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {/* Modal pour ajouter une catégorie */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" /> Ajouter une catégorie
              </h2>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                  <input
                    type="text"
                    value={newCategory.nom}
                    onChange={(e) => setNewCategory({ ...newCategory, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input
                    type="checkbox"
                    checked={newCategory.is_active}
                    onChange={(e) => setNewCategory({ ...newCategory, is_active: e.target.checked })}
                    className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary
                    type="button"
                    onClick={closeAddModal}
                    className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
                    Ajouter
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal pour modifier une catégorie */}
        {isEditModalOpen && selectedCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier la catégorie
              </h2>
              <form onSubmit={handleEditCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                  <input
                    type="text"
                    value={editCategory.nom}
                    onChange={(e) => setEditCategory({ ...editCategory, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input
                    type="checkbox"
                    checked={editCategory.is_active}
                    onChange={(e) => setEditCategory({ ...editCategory, is_active: e.target.checked })}
                    className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
                    Enregistrer
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal pour supprimer une catégorie */}
        {isDeleteModalOpen && selectedCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer la catégorie
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer la catégorie <span className="font-medium">{selectedCategory.nom}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleDeleteCategory}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Supprimer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCategoriesPage;

==================================================
// Chemin relatif : src\pages\AdminCommandLinesPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { ShoppingCart, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface LigneCommande {
  id: string;
  commande: string
  produit: { id: string; nom: string };
  quantite: number;
  prix_unitaire: string;
}

// interface Commande {
//   id: string;
//   client: { username: string; email: string };
//   total: string;
// };

interface ApiResponse {
  results: LigneCommande[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminCommandLinesPage: React.FC = () => {
  
  const [lines, setLines] = useState<LigneCommande[]>([]);
  const [totalLines, setTotalLines] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const linesPerPage = 10;

  useEffect(() => {
    fetchCommandLines();
  }, [currentPage, searchQuery]);

  const fetchCommandLines = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/lignes-commande/', {
        params: {
          page: currentPage,
          per_page: linesPerPage,
          search: searchQuery || undefined,
        },
      });
      setLines(response.data.results);
      setTotalLines(response.data.count);
      setTotalPages(Math.ceil(response.data.count / linesPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des lignes de commande:', err.response?.data);
      setError('Erreur lors du chargement des lignes de commande.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) {
    return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <ShoppingCart className="h-6 w-6 mr-2" /> Gestion des Lignes de Commande
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par nom d’utilisateur..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Commande</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Produit</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Quantité</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Prix Unitaire</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Total Ligne</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{line.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{line.commande}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{line.produit.nom}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{line.quantite}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{line.prix_unitaire} FCFA</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {(parseFloat(line.prix_unitaire) * line.quantite).toFixed(2)} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * linesPerPage + 1} à{' '}
            {Math.min(currentPage * linesPerPage, totalLines)} sur {totalLines} lignes de commande
          </p>
          <div className="flex gap-2">
            <ButtonPrimary
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCommandLinesPage;

==================================================
// Chemin relatif : src\pages\AdminCommandsPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Utilisation de l’instance axios existante
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { ShoppingCart, Search, Eye, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Commande {
  id: string;
  client: {
    id: string;
    username: string;
    email: string;
  };
  total: string;
  statut: 'en_attente' | 'en_cours' | 'expediee' | 'livree' | 'annulee';
  date: string;
  adresse: {
    nom: string;
    rue: string;
    ville: string;
    code_postal: string;
    pays: string;
  };
  lignes: {
    id: string;
    produit: {
      id: string;
      nom: string;
    };
    quantite: number;
    prix_unitaire: string;
  }[];
}

interface ApiResponse {
  results: Commande[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminCommandsPage: React.FC = () => {
  
  const [commands, setCommands] = useState<Commande[]>([]);
  const [totalCommands, setTotalCommands] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCommand, setSelectedCommand] = useState<Commande | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const commandsPerPage = 10;

  useEffect(() => {
    fetchCommands();
  }, [currentPage, searchQuery, filterStatus]);

  const fetchCommands = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/commandes/', {
        params: {
          page: currentPage,
          per_page: commandsPerPage,
          search: searchQuery || undefined,
          statut: filterStatus !== 'all' ? filterStatus : undefined,
        },
      });
      setCommands(response.data.results);
      setTotalCommands(response.data.count);
      setTotalPages(Math.ceil(response.data.count / commandsPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des commandes:', err.response?.data);
      setError('Erreur lors du chargement des commandes.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openDetailsModal = (command: Commande) => {
    setSelectedCommand(command);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCommand(null);
  };

  const openCancelModal = (command: Commande) => {
    setSelectedCommand(command);
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedCommand(null);
  };

  const handleCancelCommand = async () => {
    if (!selectedCommand) return;

    try {
      await api.post(`/commandes/${selectedCommand.id}/cancel/`);
      setIsCancelModalOpen(false);
      fetchCommands();
    } catch (err: any) {
      console.error('Erreur lors de l’annulation de la commande:', err.response?.data);
      setError('Erreur lors de l’annulation de la commande.');
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <ShoppingCart className="h-6 w-6 mr-2" /> Gestion des Commandes
        </h1>

        {/* Filtres et Recherche */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Rechercher par nom d’utilisateur..."
                className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={handleFilterStatus}
              className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="expediee">Expédiée</option>
              <option value="livree">Livrée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Utilisateur</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Email</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Total</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Statut</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Date</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commands.map((command) => (
                <tr key={command.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{command.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{command.client.username}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{command.client.email}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{command.total} FCFA</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        command.statut === 'en_attente'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : command.statut === 'en_cours'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : command.statut === 'expediee'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : command.statut === 'livree'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {command.statut.charAt(0).toUpperCase() + command.statut.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(command.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary
                      onClick={() => openDetailsModal(command)}
                      className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                    >
                      <Eye className="h-4 w-4 mr-1" /> Détails
                    </ButtonPrimary>
                    {['en_attente', 'en_cours'].includes(command.statut) && (
                      <ButtonPrimary
                        onClick={() => openCancelModal(command)}
                        className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm"
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Annuler
                      </ButtonPrimary>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * commandsPerPage + 1} à{' '}
            {Math.min(currentPage * commandsPerPage, totalCommands)} sur {totalCommands} commandes
          </p>
          <div className="flex gap-2">
            <ButtonPrimary
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {/* Modal pour voir les détails */}
        {isDetailsModalOpen && selectedCommand && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-2xl">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2" /> Détails de la Commande #{selectedCommand.id}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Utilisateur :</strong> {selectedCommand.client.username} ({selectedCommand.client.email})
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Total :</strong> {selectedCommand.total} FCFA
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Statut :</strong> {selectedCommand.statut.charAt(0).toUpperCase() + selectedCommand.statut.slice(1)}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Date :</strong> {new Date(selectedCommand.date).toLocaleString()}
                  </p>
                </div>
                { selectedCommand.adresse && (
                    <div>
                    <h3 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Adresse de livraison</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedCommand.adresse.nom}</p>
                    <p className="text-gray-700 dark:text-gray-300">{selectedCommand.adresse.rue}</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedCommand.adresse.ville}, {selectedCommand.adresse.code_postal}, {selectedCommand.adresse.pays}
                    </p>
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  <h3 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Produits</h3>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-lightCard dark:bg-darkCard">
                      <tr className="border-b border-lightBorder dark:border-darkBorder">
                        <th className="py-3 px-4 text-lightText dark:text-darkText">ID Produit</th>
                        <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                        <th className="py-3 px-4 text-lightText dark:text-darkText">Quantité</th>
                        <th className="py-3 px-4 text-lightText dark:text-darkText">Prix Unitaire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCommand.lignes.map((ligne) => (
                        <tr key={ligne.id} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{ligne.produit.id}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{ligne.produit.nom}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{ligne.quantite}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{ligne.prix_unitaire} FCFA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <ButtonPrimary
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Fermer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}

        {/* Modal pour annuler une commande */}
        {isCancelModalOpen && selectedCommand && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <XCircle className="h-5 w-5 mr-2" /> Annuler la Commande
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir annuler la commande #{selectedCommand.id} de{' '}
                <span className="font-medium">{selectedCommand.client.email}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary
                  type="button"
                  onClick={closeCancelModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleCancelCommand}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Confirmer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCommandsPage;

==================================================
// Chemin relatif : src\pages\AdminCommandsPendingPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { ShoppingCart, Search, Eye, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Commande {
  id: string;
  client: { id: string; username: string; email: string };
  total: string;
  statut: 'en_attente';
  date: string;
  adresse: { nom: string; rue: string; ville: string; code_postal: string; pays: string };
  lignes: { id: string; produit: { id: string; nom: string }; quantite: number; prix_unitaire: string }[];
}

interface ApiResponse {
  results: Commande[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminCommandsPendingPage: React.FC = () => {
  
  const [commands, setCommands] = useState<Commande[]>([]);
  const [totalCommands, setTotalCommands] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommand, setSelectedCommand] = useState<Commande | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const commandsPerPage = 10;

  useEffect(() => {
    fetchPendingCommands();
  }, [currentPage, searchQuery]);

  const fetchPendingCommands = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/commandes/', {
        params: {
          page: currentPage,
          per_page: commandsPerPage,
          search: searchQuery || undefined,
          statut: 'en_attente',
        },
      });
      setCommands(response.data.results);
      setTotalCommands(response.data.count);
      setTotalPages(Math.ceil(response.data.count / commandsPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des commandes en attente:', err.response?.data);
      setError('Erreur lors du chargement des commandes en attente.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openDetailsModal = (command: Commande) => {
    setSelectedCommand(command);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCommand(null);
  };

  const openCancelModal = (command: Commande) => {
    setSelectedCommand(command);
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedCommand(null);
  };

  const handleCancelCommand = async () => {
    if (!selectedCommand) return;

    try {
      await api.post(`/commandes/${selectedCommand.id}/cancel/`);
      setIsCancelModalOpen(false);
      fetchPendingCommands();
    } catch (err: any) {
      console.error('Erreur lors de l’annulation de la commande:', err.response?.data);
      setError('Erreur lors de l’annulation de la commande.');
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <ShoppingCart className="h-6 w-6 mr-2" /> Commandes en Attente
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par nom d’utilisateur..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Utilisateur</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Email</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Total</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Date</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commands.map((command) => (
                <tr key={command.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{command.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{command.client.username}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{command.client.email}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{command.total} FCFA</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(command.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary
                      onClick={() => openDetailsModal(command)}
                      className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                    >
                      <Eye className="h-4 w-4 mr-1" /> Détails
                    </ButtonPrimary>
                    <ButtonPrimary
                      onClick={() => openCancelModal(command)}
                      className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm"
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Annuler
                    </ButtonPrimary>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * commandsPerPage + 1} à{' '}
            {Math.min(currentPage * commandsPerPage, totalCommands)} sur {totalCommands} commandes en attente
          </p>
          <div className="flex gap-2">
            <ButtonPrimary
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {isDetailsModalOpen && selectedCommand && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-2xl">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2" /> Détails de la Commande #{selectedCommand.id}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 dark:text-gray-300"><strong>Utilisateur :</strong> {selectedCommand.client.username} ({selectedCommand.client.email})</p>
                  <p className="text-gray-700 dark:text-gray-300"><strong>Total :</strong> {selectedCommand.total} FCFA</p>
                  <p className="text-gray-700 dark:text-gray-300"><strong>Date :</strong> {new Date(selectedCommand.date).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Adresse de livraison</h3>
                  <p className="text-gray-700 dark:text-gray-300">{selectedCommand.adresse.nom}</p>
                  <p className="text-gray-700 dark:text-gray-300">{selectedCommand.adresse.rue}</p>
                  <p className="text-gray-700 dark:text-gray-300">{selectedCommand.adresse.ville}, {selectedCommand.adresse.code_postal}, {selectedCommand.adresse.pays}</p>
                </div>
                <div className="overflow-x-auto">
                  <h3 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Produits</h3>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-lightCard dark:bg-darkCard">
                      <tr className="border-b border-lightBorder dark:border-darkBorder">
                        <th className="py-3 px-4 text-lightText dark:text-darkText">ID Produit</th>
                        <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                        <th className="py-3 px-4 text-lightText dark:text-darkText">Quantité</th>
                        <th className="py-3 px-4 text-lightText dark:text-darkText">Prix Unitaire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCommand.lignes.map((ligne) => (
                        <tr key={ligne.id} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{ligne.produit.id}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{ligne.produit.nom}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{ligne.quantite}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{ligne.prix_unitaire} FCFA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <ButtonPrimary
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Fermer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}

        {isCancelModalOpen && selectedCommand && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <XCircle className="h-5 w-5 mr-2" /> Annuler la Commande
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir annuler la commande #{selectedCommand.id} de{' '}
                <span className="font-medium">{selectedCommand.client.email}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary
                  onClick={closeCancelModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleCancelCommand}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Confirmer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCommandsPendingPage;

==================================================
// Chemin relatif : src\pages\AdminCommandsRevenuePage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { DollarSign } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface RevenueData {
  total_revenue: string;
  revenue_by_day: { date: string; total: string }[]; // 'date' reste correct car c’est la clé renvoyée dans la réponse
  revenue_by_status: { statut: string; total: string }[];
}

const AdminCommandsRevenuePage: React.FC = () => {
  
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysFilter, setDaysFilter] = useState<number>(7);

  useEffect(() => {
    fetchRevenueData();
  }, [daysFilter]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/commandes/revenue/', { params: { days: daysFilter } });
      setRevenueData(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des données de revenus:', err.response?.data);
      setError('Erreur lors du chargement des données de revenus.');
      setLoading(false);
    }
  };

  const handleFilterChange = (days: number) => {
    setDaysFilter(days);
  };

  const revenueByDayChartData = {
    labels: revenueData ? revenueData.revenue_by_day.map((item) => item.date) : [],
    datasets: [
      {
        label: 'Revenus par jour (FCFA)',
        data: revenueData ? revenueData.revenue_by_day.map((item) => parseFloat(item.total)) : [],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        fill: true,
      },
    ],
  };

  const revenueByStatusChartData = {
    labels: revenueData ? revenueData.revenue_by_status.map((item) => item.statut) : [],
    datasets: [
      {
        label: 'Revenus par statut (FCFA)',
        data: revenueData ? revenueData.revenue_by_status.map((item) => parseFloat(item.total)) : [],
        backgroundColor: '#2196F3',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const }, title: { display: true, text: '' } },
  };

  if (loading) {
    return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <DollarSign className="h-6 w-6 mr-2" /> Revenus des Commandes
        </h1>

        <div className="mb-6 flex flex-wrap gap-2">
          <ButtonPrimary
            onClick={() => handleFilterChange(7)}
            className={`px-4 py-2 text-sm sm:text-base ${daysFilter === 7 ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            7 jours
          </ButtonPrimary>
          <ButtonPrimary
            onClick={() => handleFilterChange(30)}
            className={`px-4 py-2 text-sm sm:text-base ${daysFilter === 30 ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            30 jours
          </ButtonPrimary>
          <ButtonPrimary
            onClick={() => handleFilterChange(90)}
            className={`px-4 py-2 text-sm sm:text-base ${daysFilter === 90 ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            90 jours
          </ButtonPrimary>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" /> Total des Revenus
            </h2>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{revenueData?.total_revenue} FCFA</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Revenus par jour</h2>
            <div className="h-48 sm:h-64">
              <Line
                data={revenueByDayChartData}
                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: `Revenus sur ${daysFilter} jours` } } }}
              />
            </div>
          </div>

          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Revenus par statut</h2>
            <div className="h-48 sm:h-64">
              <Bar
                data={revenueByStatusChartData}
                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Répartition par statut' } } }}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCommandsRevenuePage;

==================================================
// Chemin relatif : src\pages\AdminCommentairesPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { MessageSquare, Search, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

interface Commentaire {
  id: string;
  article: string;
  client: string;
  texte: string;
  date: string;
  parent: string | null;
  is_active: boolean;
}

interface ApiResponse {
  results: Commentaire[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminCommentairesPage: React.FC = () => {
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [totalCommentaires, setTotalCommentaires] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCommentaire, setSelectedCommentaire] = useState<Commentaire | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCommentaire, setEditCommentaire] = useState({ texte: '', is_active: true });
  const commentairesPerPage = 10;

  useEffect(() => {
    fetchCommentaires();
  }, [currentPage, searchQuery, filterStatus]);

  const fetchCommentaires = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/commentaires/', {
        params: {
          page: currentPage,
          per_page: commentairesPerPage,
          search: searchQuery || undefined,
          is_active: filterStatus === 'all' ? undefined : filterStatus === 'active',
        },
      });
      setCommentaires(response.data.results);
      setTotalCommentaires(response.data.count);
      setTotalPages(Math.ceil(response.data.count / commentairesPerPage));
      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors du chargement des commentaires.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const openEditModal = (commentaire: Commentaire) => {
    setSelectedCommentaire(commentaire);
    setEditCommentaire({ texte: commentaire.texte, is_active: commentaire.is_active });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => { setIsEditModalOpen(false); setSelectedCommentaire(null); };

  const handleEditCommentaire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommentaire) return;
    try {
      await api.put(`/commentaires/${selectedCommentaire.id}/`, editCommentaire);
      setIsEditModalOpen(false);
      fetchCommentaires();
    } catch (err: any) {
      setError('Erreur lors de la mise à jour du commentaire.');
    }
  };

  if (loading) return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <MessageSquare className="h-6 w-6 mr-2" /> Gestion des Commentaires
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Rechercher par texte..."
                className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={handleFilterStatus}
              className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Texte</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commentaires.map((commentaire) => (
                <tr key={commentaire.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{commentaire.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{commentaire.article}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{commentaire.client}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300 truncate max-w-xs">{commentaire.texte}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(commentaire.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${commentaire.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {commentaire.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <ButtonPrimary onClick={() => openEditModal(commentaire)} className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm">
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * commentairesPerPage + 1} à {Math.min(currentPage * commentairesPerPage, totalCommentaires)} sur {totalCommentaires} commentaires
          </p>
          <div className="flex gap-2">
            <ButtonPrimary onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {isEditModalOpen && selectedCommentaire && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier le commentaire
              </h2>
              <form onSubmit={handleEditCommentaire} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Texte</label>
                  <textarea value={editCommentaire.texte} onChange={(e) => setEditCommentaire({ ...editCommentaire, texte: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={editCommentaire.is_active} onChange={(e) => setEditCommentaire({ ...editCommentaire, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeEditModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Enregistrer</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCommentairesPage;

==================================================
// Chemin relatif : src\pages\AdminDashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonPrimary from '../components/ButtonPrimary';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Calendar, Users, ShoppingCart, Package, AlertTriangle, DollarSign, BarChart2 } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend);

interface DashboardData {
  users: {
    total: number;
    active: number;
    banned: number;
    by_role: { [key: string]: number };
    new_last_7_days: number;
  };
  commands: {
    total: number;
    by_status: { [key: string]: number };
    total_revenue: string;
    revenue_last_7_days: string;
  };
  products: {
    total: number;
    active: number;
    low_stock: number;
    by_category: { [key: string]: number };
    low_stock_details: { id: string; nom: string; stock: number }[];
  };
  ateliers: {
    total: number;
    active: number;
    cancelled: number;
    total_participants: number;
  };
  payments: {
    total: number;
    by_type: { [key: string]: number };
    total_amount: string;
  };
  subscriptions: {
    total: number;
    active: number;
    total_revenue: string;
  };
}

const AdminDashboardPage: React.FC = () => {
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysFilter, setDaysFilter] = useState<number>(7);
  const [selectedSection, setSelectedSection] = useState<string>('overview');
  const navigate = useNavigate();


  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const response = await axios.get(`https://chezflora-api.onrender.com/api/utilisateurs/dashboard/?days=${daysFilter}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Dashboard data:', response.data);
        setData(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement:', err.response?.data);
        setError('Erreur lors du chargement du tableau de bord.');
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/auth');
        }
      }
    };

    fetchDashboard();
  }, [navigate, daysFilter]);

  const handleFilterChange = (days: number) => {
    setDaysFilter(days);
    setLoading(true);
  };

  const userChartData = {
    labels: ['Total', 'Actifs', 'Bannis', `Nouveaux (${daysFilter} jours)`],
    datasets: [
      {
        label: 'Utilisateurs',
        data: data ? [data.users.total, data.users.active, data.users.banned, data.users.new_last_7_days] : [],
        backgroundColor: ['#4CAF50', '#F44336', '#FF9800', '#2196F3'],
      },
    ],
  };

  const commandStatusChartData = {
    labels: data ? Object.keys(data.commands.by_status) : [],
    datasets: [
      {
        data: data ? Object.values(data.commands.by_status) : [],
        backgroundColor: ['#4CAF50', '#F44336', '#FF9800', '#2196F3', '#9C27B0'],
      },
    ],
  };

  const revenueChartData = {
    labels: [`Total`, `Derniers ${daysFilter} jours`],
    datasets: [
      {
        label: 'Revenus (FCFA)',
        data: data ? [data.commands.total_revenue, data.commands.revenue_last_7_days] : [],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        fill: true,
      },
    ],
  };

  const productCategoryChartData = {
    labels: data ? Object.keys(data.products.by_category) : [],
    datasets: [
      {
        label: 'Produits par catégorie',
        data: data ? Object.values(data.products.by_category) : [],
        backgroundColor: '#2196F3',
      },
    ],
  };

  const paymentTypeChartData = {
    labels: data ? Object.keys(data.payments.by_type) : [],
    datasets: [
      {
        data: data ? Object.values(data.payments.by_type) : [],
        backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
      },
    ],
  };

  const ateliersChartData = {
    labels: ['Total', 'Actifs', 'Annulés', 'Participants'],
    datasets: [
      {
        label: 'Ateliers',
        data: data ? [data.ateliers.total, data.ateliers.active, data.ateliers.cancelled, data.ateliers.total_participants] : [],
        backgroundColor: ['#4CAF50', '#2196F3', '#F44336', '#FF9800'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '' },
    },
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
            <Users className="h-5 w-5 mr-2" /> Utilisateurs
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Total : {data?.users.total}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Actifs : {data?.users.active}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Bannis : {data?.users.banned}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Nouveaux ({daysFilter} jours) : {data?.users.new_last_7_days}</p>
        </div>
        <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" /> Commandes
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Total : {data?.commands.total}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Revenus total : {data?.commands.total_revenue} FCFA</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Revenus ({daysFilter} jours) : {data?.commands.revenue_last_7_days} FCFA</p>
        </div>
        <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
            <Package className="h-5 w-5 mr-2" /> Produits
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Total : {data?.products.total}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Actifs : {data?.products.active}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Stock faible : {data?.products.low_stock}</p>
        </div>
        <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
            <Calendar className="h-5 w-5 mr-2" /> Ateliers
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Total : {data?.ateliers.total}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Actifs : {data?.ateliers.active}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Annulés : {data?.ateliers.cancelled}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Participants : {data?.ateliers.total_participants}</p>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Répartition des utilisateurs</h2>
        <div className="h-48 sm:h-64">
          <Bar data={userChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Statistiques Utilisateurs' } } }} />
        </div>
      </div>
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Utilisateurs par rôle</h2>
        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          {data && Object.entries(data.users.by_role).map(([role, count]) => (
            <li key={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)} : {count}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderCommands = () => (
    <div className="space-y-6">
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Statut des commandes</h2>
        <div className="h-48 sm:h-64">
          <Pie data={commandStatusChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Répartition par statut' } } }} />
        </div>
      </div>
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Revenus</h2>
        <div className="h-48 sm:h-64">
          <Line data={revenueChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Revenus Commandes' } } }} />
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Produits par catégorie</h2>
        <div className="h-48 sm:h-64">
          <Bar
            data={productCategoryChartData}
            options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Répartition par catégorie' } } }}
          />
        </div>
      </div>
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" /> Produits en stock faible
        </h2>
        {data && data.products.low_stock_details.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-2 text-lightText dark:text-darkText">ID</th>
                <th className="py-2 text-lightText dark:text-darkText">Nom</th>
                <th className="py-2 text-lightText dark:text-darkText">Stock</th>
              </tr>
            </thead>
            <tbody>
              {data.products.low_stock_details.map((product) => (
                <tr key={product.id} className="border-b border-lightBorder dark:border-darkBorder">
                  <td className="py-2 text-gray-700 dark:text-gray-300">{product.id}</td>
                  <td className="py-2 text-gray-700 dark:text-gray-300">{product.nom}</td>
                  <td className="py-2 text-red-600">{product.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">Aucun produit en stock faible.</p>
        )}
      </div>
    </div>
  );

  const renderAteliers = () => (
    <div className="space-y-6">
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Statistiques des ateliers</h2>
        <div className="h-48 sm:h-64">
          <Bar
            data={ateliersChartData}
            options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Statistiques Ateliers' } } }}
          />
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Types de paiements</h2>
        <div className="h-48 sm:h-64">
          <Pie
            data={paymentTypeChartData}
            options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Répartition par type' } } }}
          />
        </div>
      </div>
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" /> Résumé des paiements
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Total des paiements : {data?.payments.total}</p>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Montant total : {data?.payments.total_amount} FCFA</p>
      </div>
    </div>
  );

  const renderSubscriptions = () => (
    <div className="space-y-6">
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
          <BarChart2 className="h-5 w-5 mr-2" /> Abonnements
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Total : {data?.subscriptions.total}</p>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Actifs : {data?.subscriptions.active}</p>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Revenus total : {data?.subscriptions.total_revenue} FCFA</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case 'users':
        return renderUsers();
      case 'commands':
        return renderCommands();
      case 'products':
        return renderProducts();
      case 'ateliers':
        return renderAteliers();
      case 'payments':
        return renderPayments();
      case 'subscriptions':
        return renderSubscriptions();
      case 'overview':
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6">
          Tableau de bord Admin
        </h1>

        <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
          <ButtonPrimary
            onClick={() => handleFilterChange(7)}
            className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base ${
              daysFilter === 7 ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            7 jours
          </ButtonPrimary>
          <ButtonPrimary
            onClick={() => handleFilterChange(30)}
            className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base ${
              daysFilter === 30 ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            30 jours
          </ButtonPrimary>
          <ButtonPrimary
            onClick={() => handleFilterChange(90)}
            className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base ${
              daysFilter === 90 ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            90 jours
          </ButtonPrimary>
        </div>

        <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 border-b border-lightBorder dark:border-darkBorder">
          {['overview', 'users', 'commands', 'products', 'ateliers', 'payments', 'subscriptions'].map((section) => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`pb-2 px-2 sm:px-4 text-sm sm:text-base ${
                selectedSection === section
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1) === 'Overview' ? 'Aperçu' : section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-6">{renderContent()}</div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;

==================================================
// Chemin relatif : src\pages\AdminDevisPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { FileText, Search, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

interface Devis {
  id: string;
  client: string;
  service: string;
  description: string;
  date_demande: string;
  statut: string;
  prix_propose: string | null;
  date_mise_a_jour: string;
  is_active: boolean;
}

interface ApiResponse {
  results: Devis[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminDevisPage: React.FC = () => {
  
  const [devis, setDevis] = useState<Devis[]>([]);
  const [totalDevis, setTotalDevis] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDevis, setEditDevis] = useState({ description: '', prix_propose: '', statut: '', is_active: true });
  const devisPerPage = 10;

  useEffect(() => {
    fetchDevis();
  }, [currentPage, searchQuery, filterStatut]);

  const fetchDevis = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/devis/', {
        params: {
          page: currentPage,
          per_page: devisPerPage,
          search: searchQuery || undefined,
          statut: filterStatut !== 'all' ? filterStatut : undefined,
        },
      });
      setDevis(response.data.results);
      setTotalDevis(response.data.count);
      setTotalPages(Math.ceil(response.data.count / devisPerPage));
      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors du chargement des devis.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStatut = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatut(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const openEditModal = (devis: Devis) => {
    setSelectedDevis(devis);
    setEditDevis({
      description: devis.description,
      prix_propose: devis.prix_propose || '',
      statut: devis.statut,
      is_active: devis.is_active,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => { setIsEditModalOpen(false); setSelectedDevis(null); };

  const handleEditDevis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevis) return;
    try {
      await api.put(`/devis/${selectedDevis.id}/`, {
        ...editDevis,
        prix_propose: editDevis.prix_propose ? parseFloat(editDevis.prix_propose).toString() : null,
      });
      setIsEditModalOpen(false);
      fetchDevis();
    } catch (err: any) {
      setError('Erreur lors de la mise à jour du devis.');
    }
  };

  if (loading) return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <FileText className="h-6 w-6 mr-2" /> Gestion des Devis
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Rechercher par client ou service..."
                className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatut}
              onChange={handleFilterStatut}
              className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="accepte">Accepté</option>
              <option value="refuse">Refusé</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Prix proposé (FCFA)</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Actif</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devis.map((devisItem) => (
                <tr key={devisItem.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{devisItem.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{devisItem.client}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{devisItem.service}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(devisItem.date_demande).toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{devisItem.prix_propose || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${devisItem.statut === 'accepte' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : devisItem.statut === 'refuse' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                      {devisItem.statut}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${devisItem.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {devisItem.is_active ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <ButtonPrimary onClick={() => openEditModal(devisItem)} className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm">
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * devisPerPage + 1} à {Math.min(currentPage * devisPerPage, totalDevis)} sur {totalDevis} devis
          </p>
          <div className="flex gap-2">
            <ButtonPrimary onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {isEditModalOpen && selectedDevis && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier le devis
              </h2>
              <form onSubmit={handleEditDevis} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea value={editDevis.description} onChange={(e) => setEditDevis({ ...editDevis, description: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prix proposé (FCFA)</label>
                  <input type="number" step="0.01" value={editDevis.prix_propose} onChange={(e) => setEditDevis({ ...editDevis, prix_propose: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Statut</label>
                  <select
                    value={editDevis.statut}
                    onChange={(e) => setEditDevis({ ...editDevis, statut: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en_attente">En attente</option>
                    <option value="accepte">Accepté</option>
                    <option value="refuse">Refusé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={editDevis.is_active} onChange={(e) => setEditDevis({ ...editDevis, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeEditModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Enregistrer</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDevisPage;

==================================================
// Chemin relatif : src\pages\AdminLowStockPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { AlertTriangle, Search, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

interface LowStockProduct {
  id: string;
  nom: string;
  stock: number;
  categorie__nom: string | null;
}

interface LowStockResponse {
  seuil: number;
  total_low_stock: number;
  products: LowStockProduct[];
}

// interface ApiResponse {
//   results: LowStockProduct[];
//   count: number;
//   next: string | null;
//   previous: string | null;
// }

const AdminLowStockPage: React.FC = () => {
  
  const [lowStockData, setLowStockData] = useState<LowStockResponse | null>(null);
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditSeuilModalOpen, setIsEditSeuilModalOpen] = useState(false);
  const [newSeuil, setNewSeuil] = useState<string>('');
  const productsPerPage = 10;

  useEffect(() => {
    fetchLowStock();
  }, [currentPage, searchQuery]);

  const fetchLowStock = async () => {
    setLoading(true);
    try {
      const response = await api.get<LowStockResponse>('/produits/low_stock/', {
        params: {
          page: currentPage,
          per_page: productsPerPage,
          search: searchQuery || undefined,
        },
      });
      console.log(response.data)
      setLowStockData(response.data);
      setProducts(response.data.products);
      setTotalProducts(response.data.total_low_stock);
      setTotalPages(Math.ceil(response.data.total_low_stock / productsPerPage));
      setNewSeuil(response.data.seuil.toString());
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des produits en stock faible:', err.response?.data);
      setError('Erreur lors du chargement des produits en stock faible.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openEditSeuilModal = () => {
    setIsEditSeuilModalOpen(true);
  };

  const closeEditSeuilModal = () => {
    setIsEditSeuilModalOpen(false);
  };

  const handleEditSeuil = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const seuilParam = await api.get('/parametres/', { params: { cle: 'SEUIL_STOCK_FAIBLE' } });
      const paramId = seuilParam.data[0]?.id;
      if (paramId) {
        await api.put(`/parametres/${paramId}/`, {
          cle: 'SEUIL_STOCK_FAIBLE',
          valeur: newSeuil,
          description: 'Seuil pour alerter sur un stock faible',
        });
      } else {
        await api.post('/parametres/', {
          cle: 'SEUIL_STOCK_FAIBLE',
          valeur: newSeuil,
          description: 'Seuil pour alerter sur un stock faible',
        });
      }
      setIsEditSeuilModalOpen(false);
      fetchLowStock();
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du seuil:', err.response?.data);
      setError('Erreur lors de la mise à jour du seuil.');
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <AlertTriangle className="h-6 w-6 mr-2" /> Produits en Stock Faible
        </h1>

        {/* Seuil et Recherche */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Rechercher par nom..."
                className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Seuil actuel : <strong>{lowStockData?.seuil}</strong> unités
            </span>
            <ButtonPrimary
              onClick={openEditSeuilModal}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center"
            >
              <Edit className="h-5 w-5 mr-2" /> Modifier le seuil
            </ButtonPrimary>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mb-6">
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" /> Total Produits en Stock Faible
            </h2>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{lowStockData?.total_low_stock}</p>
          </div>
        </div>

        {/* Liste des produits */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Stock</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Catégorie</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.nom}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.stock}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.categorie__nom || 'Sans catégorie'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * productsPerPage + 1} à{' '}
            {Math.min(currentPage * productsPerPage, totalProducts)} sur {totalProducts} produits
          </p>
          <div className="flex gap-2">
            <ButtonPrimary
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {/* Modal pour modifier le seuil */}
        {isEditSeuilModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier le seuil d’alerte
              </h2>
              <form onSubmit={handleEditSeuil} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nouveau seuil</label>
                  <input
                    type="number"
                    value={newSeuil}
                    onChange={(e) => setNewSeuil(e.target.value)}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary
                    type="button"
                    onClick={closeEditSeuilModal}
                    className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
                    Enregistrer
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLowStockPage;

==================================================
// Chemin relatif : src\pages\AdminParametresPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Settings, Search, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

interface Parametre {
  id: number;
  cle: string;
  valeur: string;
  description: string | null;
  date_mise_a_jour: string;
}

interface ApiResponse {
  results: Parametre[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminParametresPage: React.FC = () => {
  const [parametres, setParametres] = useState<Parametre[]>([]);
  const [totalParametres, setTotalParametres] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParametre, setSelectedParametre] = useState<Parametre | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editParametre, setEditParametre] = useState({ cle: '', valeur: '', description: '' });
  const parametresPerPage = 10;

  useEffect(() => {
    fetchParametres();
  }, [currentPage, searchQuery]);

  const fetchParametres = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/parametres/', {
        params: { page: currentPage, per_page: parametresPerPage, search: searchQuery || undefined },
      });
      setParametres(response.data.results);
      setTotalParametres(response.data.count);
      setTotalPages(Math.ceil(response.data.count / parametresPerPage));
      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors du chargement des paramètres.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const openEditModal = (parametre: Parametre) => {
    setSelectedParametre(parametre);
    setEditParametre({ cle: parametre.cle, valeur: parametre.valeur, description: parametre.description || '' });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedParametre(null);
  };

  const handleEditParametre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParametre) return;
    try {
      await api.put(`/parametres/${selectedParametre.id}/`, editParametre);
      setIsEditModalOpen(false);
      fetchParametres();
    } catch (err: any) {
      setError('Erreur lors de la mise à jour du paramètre.');
    }
  };

  const otpParametres = parametres.filter(p => p.cle.startsWith('otp_'));
  const otherParametres = parametres.filter(p => !p.cle.startsWith('otp_'));

  if (loading) return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <Settings className="h-6 w-6 mr-2" /> Gestion des Paramètres
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par clé ou valeur..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Section Paramètres OTP */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4">Paramètres OTP</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-lightCard dark:bg-darkCard">
                <tr className="border-b border-lightBorder dark:border-darkBorder">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Clé</th>
                  <th className="py-3 px-4">Valeur</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Dernière mise à jour</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {otpParametres.length > 0 ? (
                  otpParametres.map((parametre) => (
                    <tr key={parametre.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{parametre.id}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{parametre.cle}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{parametre.valeur}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{parametre.description || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(parametre.date_mise_a_jour).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <ButtonPrimary
                          onClick={() => openEditModal(parametre)}
                          className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                        >
                          <Edit className="h-4 w-4 mr-1" /> Modifier
                        </ButtonPrimary>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-3 px-4 text-center text-gray-500 dark:text-gray-400">
                      Aucun paramètre OTP trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section Autres Paramètres */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4">Autres Paramètres</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-lightCard dark:bg-darkCard">
                <tr className="border-b border-lightBorder dark:border-darkBorder">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Clé</th>
                  <th className="py-3 px-4">Valeur</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Dernière mise à jour</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {otherParametres.map((parametre) => (
                  <tr key={parametre.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{parametre.id}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{parametre.cle}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{parametre.valeur}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{parametre.description || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(parametre.date_mise_a_jour).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <ButtonPrimary
                        onClick={() => openEditModal(parametre)}
                        className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                      >
                        <Edit className="h-4 w-4 mr-1" /> Modifier
                      </ButtonPrimary>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * parametresPerPage + 1} à {Math.min(currentPage * parametresPerPage, totalParametres)} sur {totalParametres} paramètres
          </p>
          <div className="flex gap-2">
            <ButtonPrimary
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {isEditModalOpen && selectedParametre && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier le paramètre
              </h2>
              <form onSubmit={handleEditParametre} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Clé</label>
                  <input
                    type="text"
                    value={editParametre.cle}
                    onChange={(e) => setEditParametre({ ...editParametre, cle: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Valeur</label>
                  <input
                    type={editParametre.cle === 'otp_length' || editParametre.cle === 'otp_validity_minutes' ? 'number' : 'text'}
                    value={editParametre.valeur}
                    onChange={(e) => setEditParametre({ ...editParametre, valeur: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min={editParametre.cle === 'otp_length' ? 4 : editParametre.cle === 'otp_validity_minutes' ? 1 : undefined}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea
                    value={editParametre.description}
                    onChange={(e) => setEditParametre({ ...editParametre, description: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Enregistrer
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminParametresPage;

==================================================
// Chemin relatif : src\pages\AdminPayementsPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { DollarSign, Search, Edit, Trash2, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface Paiement {
  id: string;
  type_transaction: string;
  methode_paiement: string;
  montant: string;
  statut: string;
  date: string;
}

interface Stats {
  global: {
    total_paiements: number;
    total_montant: string;
    avg_montant: string;
    max_montant: string;
    min_montant: string;
    success_rate: number;
    avg_delay_days: number;
  };
  last_30_days: {
    total_paiements: number;
    total_montant: string;
    by_day: { date: string; count: number; total: string }[];
  };
  by_month_last_year: { month: string; count: number; total: string }[];
  by_year: { year: string; count: number; total: string }[];
  by_type_transaction: { type: string; count: number; total: string }[];
  by_status: { status: string; count: number; total: string }[];
  by_method: { method: string; count: number; total: string }[];
  top_clients: { client: string; total: string }[];
}

interface ApiResponse {
  results: Paiement[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminPaiementsPage: React.FC = () => {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [totalPaiements, setTotalPaiements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const paiementsPerPage = 10;

  useEffect(() => {
    fetchPaiements();
    fetchStats();
  }, [currentPage, searchQuery]);

  const fetchPaiements = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/paiements/', {
        params: { page: currentPage, per_page: paiementsPerPage, search: searchQuery || undefined },
      });
      setPaiements(response.data.results);
      setTotalPaiements(response.data.count);
      setTotalPages(Math.ceil(response.data.count / paiementsPerPage));
      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors du chargement des paiements.');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get<Stats>('/paiements/stats/', { params: { days: 30 } });
      setStats(response.data);
    } catch (err: any) {
      setError('Erreur lors du chargement des statistiques.');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const renderChart = (title: string, labels: string[], data: number[], type: 'bar' | 'line' = 'bar') => {
    const chartData = {
      labels,
      datasets: [{
        label: title,
        data,
        backgroundColor: type === 'bar' ? 'rgba(54, 162, 235, 0.6)' : undefined,
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        fill: false,
      }],
    };
    const options = {
      responsive: true,
      plugins: { legend: { position: 'top' as const }, title: { display: true, text: title } },
    };
    return type === 'bar' ? <Bar data={chartData} options={options} /> : <Line data={chartData} options={options} />;
  };

  if (loading) return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <DollarSign className="h-6 w-6 mr-2" /> Gestion des Paiements
        </h1>

        {/* Statistiques */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
              <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
                <BarChart2 className="h-5 w-5 mr-2" /> Statistiques Globales
              </h2>
              <p>Total Paiements: {stats.global.total_paiements}</p>
              <p>Total Montant: {stats.global.total_montant} FCFA</p>
              <p>Montant Moyen: {stats.global.avg_montant} FCFA</p>
              <p>Montant Max: {stats.global.max_montant} FCFA</p>
              <p>Montant Min: {stats.global.min_montant} FCFA</p>
              <p>Taux de Réussite: {stats.global.success_rate}%</p>
              <p>Délai Moyen: {stats.global.avg_delay_days} jours</p>
            </div>
            <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
              {renderChart(
                'Paiements par Jour (30 derniers jours)',
                stats.last_30_days.by_day.map(item => item.date),
                stats.last_30_days.by_day.map(item => item.count),
                'line'
              )}
            </div>
            <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
              {renderChart(
                'Montant par Type de Transaction',
                stats.by_type_transaction.map(item => item.type),
                stats.by_type_transaction.map(item => parseFloat(item.total))
              )}
            </div>
            <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
              {renderChart(
                'Montant par Statut',
                stats.by_status.map(item => item.status),
                stats.by_status.map(item => parseFloat(item.total))
              )}
            </div>
            <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
              {renderChart(
                'Montant par Méthode',
                stats.by_method.map(item => item.method),
                stats.by_method.map(item => parseFloat(item.total))
              )}
            </div>
            <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
              {renderChart(
                'Top 5 Clients par Montant',
                stats.top_clients.map(item => item.client),
                stats.top_clients.map(item => parseFloat(item.total))
              )}
            </div>
          </div>
        )}

        {/* Liste des paiements */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par type ou méthode..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Méthode</th>
                <th className="py-3 px-4">Montant</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paiements.map((paiement) => (
                <tr key={paiement.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{paiement.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{paiement.type_transaction}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{paiement.methode_paiement || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{paiement.montant} FCFA</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${paiement.statut === 'effectue' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : paiement.statut === 'rembourse' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                      {paiement.statut}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(paiement.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 flex gap-2">
                    {paiement.statut === 'simule' && (
                      <ButtonPrimary onClick={() => api.post(`/paiements/${paiement.id}/simuler/`).then(fetchPaiements)} className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm">
                        <Edit className="h-4 w-4 mr-1" /> Simuler
                      </ButtonPrimary>
                    )}
                    {['simule', 'effectue'].includes(paiement.statut) && (
                      <ButtonPrimary onClick={() => api.post(`/paiements/${paiement.id}/rembourser/`).then(fetchPaiements)} className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm">
                        <Trash2 className="h-4 w-4 mr-1" /> Rembourser
                      </ButtonPrimary>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * paiementsPerPage + 1} à {Math.min(currentPage * paiementsPerPage, totalPaiements)} sur {totalPaiements} paiements
          </p>
          <div className="flex gap-2">
            <ButtonPrimary onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPaiementsPage;

==================================================
// Chemin relatif : src\pages\AdminProductsPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Package, Search, Edit, Trash2, PlusCircle, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Photo {
  id: string;
  image: string; // URL de l'image
  uploaded_at: string;
}

interface Product {
  id: string;
  nom: string;
  prix: string;
  stock: number;
  is_active: boolean;
  categorie: { id: string; nom: string } | null;
  description: string;
  promotions: { id: string; nom: string }[];
  photos: Photo[];
}

interface ApiResponse {
  results: Product[];
  count: number;
  next: string | null;
  previous: string | null;
}

interface Category {
  id: string;
  nom: string;
}

interface Promotion {
  id: string;
  nom: string;
}

const AdminProductsPage: React.FC = () => {
  
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    nom: '',
    prix: '',
    stock: '',
    is_active: true,
    categorie: '',
    description: '',
    promotions: [] as string[],
    photos: [] as File[], // Ajout des fichiers photos pour l'upload
  });
  const [editProduct, setEditProduct] = useState({
    nom: '',
    prix: '',
    stock: '',
    is_active: true,
    categorie: '',
    description: '',
    promotions: [] as string[],
    photos: [] as File[], // Ajout des fichiers photos pour l'upload
  });
  const productsPerPage = 10;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchPromotions();
  }, [currentPage, searchQuery, filterStatus]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/produits/', {
        params: {
          page: currentPage,
          per_page: productsPerPage,
          search: searchQuery || undefined,
          is_active: filterStatus !== 'all' ? filterStatus : undefined,
        },
      });
      setProducts(response.data.results);
      setTotalProducts(response.data.count);
      setTotalPages(Math.ceil(response.data.count / productsPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des produits:', err.response?.data);
      setError('Erreur lors du chargement des produits.');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data.results);
    } catch (err: any) {
      console.error('Erreur lors du chargement des catégories:', err.response?.data);
      setError('Erreur lors du chargement des catégories.');
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await api.get('/promotions/');
      setPromotions(response.data.results);
    } catch (err: any) {
      console.error('Erreur lors du chargement des promotions:', err.response?.data);
      setError('Erreur lors du chargement des promotions.');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openAddModal = () => {
    setNewProduct({
      nom: '',
      prix: '',
      stock: '',
      is_active: true,
      categorie: '',
      description: '',
      promotions: [],
      photos: [],
    });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        nom: newProduct.nom,
        prix: parseFloat(newProduct.prix).toString(),
        stock: parseInt(newProduct.stock, 10),
        is_active: newProduct.is_active,
        categorie: newProduct.categorie || null,
        description: newProduct.description,
        promotions: newProduct.promotions,
      };
      const response = await api.post('/produits/', productData);
      const productId = response.data.id;

      // Upload des photos via /photos/
      for (const photo of newProduct.photos) {
        const formData = new FormData();
        formData.append('image', photo);
        formData.append('entity_type', 'produit');
        formData.append('entity_id', productId);
        await api.post('/photos/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setIsAddModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error('Erreur lors de l’ajout du produit:', err.response?.data);
      setError('Erreur lors de l’ajout du produit.');
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setEditProduct({
      nom: product.nom,
      prix: product.prix,
      stock: product.stock.toString(),
      is_active: product.is_active,
      categorie: product.categorie?.id || '',
      description: product.description,
      promotions: product.promotions.map((p) => p.id),
      photos: [],
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const productData = {
        nom: editProduct.nom,
        prix: parseFloat(editProduct.prix).toString(),
        stock: parseInt(editProduct.stock, 10),
        is_active: editProduct.is_active,
        categorie: editProduct.categorie || null,
        description: editProduct.description,
        promotions: editProduct.promotions,
      };
      await api.put(`/produits/${selectedProduct.id}/`, productData);

      // Upload des nouvelles photos via /photos/
      for (const photo of editProduct.photos) {
        const formData = new FormData();
        formData.append('image', photo);
        formData.append('entity_type', 'produit');
        formData.append('entity_id', selectedProduct.id);
        await api.post('/photos/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setIsEditModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du produit:', err.response?.data);
      setError('Erreur lors de la mise à jour du produit.');
    }
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await api.delete(`/produits/${selectedProduct.id}/`);
      setIsDeleteModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error('Erreur lors de la suppression du produit:', err.response?.data);
      setError('Erreur lors de la suppression du produit.');
    }
  };

  const openDetailsModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!selectedProduct) return;
  
    try {
      await api.delete(`/photos/${photoId}/`);
      setSelectedProduct({
        ...selectedProduct,
        photos: selectedProduct.photos.filter((photo) => photo.id !== photoId),
      });
      fetchProducts();
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la photo:', err.response?.data);
      setError('Erreur lors de la suppression de la photo.');
    }
  };

  const handlePromotionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'new' | 'edit'
  ) => {
    const promotionId = e.target.value;
    const isChecked = e.target.checked;
    if (type === 'new') {
      const updatedPromotions = isChecked
        ? [...newProduct.promotions, promotionId]
        : newProduct.promotions.filter((id) => id !== promotionId);
      setNewProduct({ ...newProduct, promotions: updatedPromotions });
    } else {
      const updatedPromotions = isChecked
        ? [...editProduct.promotions, promotionId]
        : editProduct.promotions.filter((id) => id !== promotionId);
      setEditProduct({ ...editProduct, promotions: updatedPromotions });
    }
  };

  const handlePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'new' | 'edit'
  ) => {
    const files = Array.from(e.target.files || []);
    if (type === 'new') {
      setNewProduct({ ...newProduct, photos: [...newProduct.photos, ...files] });
    } else {
      setEditProduct({ ...editProduct, photos: [...editProduct.photos, ...files] });
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <Package className="h-6 w-6 mr-2" /> Gestion des Produits
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Rechercher par nom ou description..."
                className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={handleFilterStatus}
              className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>
          <ButtonPrimary
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un produit
          </ButtonPrimary>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Prix</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Stock</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Statut</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Catégorie</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Promotions</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Photos</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.nom}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.prix} FCFA</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.stock}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {product.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {product.categorie?.nom || 'Sans catégorie'}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {product.promotions.length > 0
                      ? product.promotions.map((p) => p.nom).join(', ')
                      : 'Aucune'}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {product.photos.length} photo(s)
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary
                      onClick={() => openDetailsModal(product)}
                      className="px-2 py-1 bg-gray-500 text-white hover:bg-gray-600 flex items-center text-sm"
                    >
                      <Eye className="h-4 w-4 mr-1" /> Détails
                    </ButtonPrimary>
                    <ButtonPrimary
                      onClick={() => openEditModal(product)}
                      className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                    <ButtonPrimary
                      onClick={() => openDeleteModal(product)}
                      className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                    </ButtonPrimary>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * productsPerPage + 1} à{' '}
            {Math.min(currentPage * productsPerPage, totalProducts)} sur {totalProducts} produits
          </p>
          <div className="flex gap-2">
            <ButtonPrimary
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un produit
              </h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={newProduct.nom}
                    onChange={(e) => setNewProduct({ ...newProduct, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Prix (FCFA)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.prix}
                    onChange={(e) => setNewProduct({ ...newProduct, prix: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Actif
                  </label>
                  <input
                    type="checkbox"
                    checked={newProduct.is_active}
                    onChange={(e) => setNewProduct({ ...newProduct, is_active: e.target.checked })}
                    className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Catégorie
                  </label>
                  <select
                    value={newProduct.categorie}
                    onChange={(e) => setNewProduct({ ...newProduct, categorie: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sans catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Promotions
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {promotions.map((promo) => (
                      <div key={promo.id} className="flex items-center">
                        <input
                          type="checkbox"
                          value={promo.id}
                          checked={newProduct.promotions.includes(promo.id)}
                          onChange={(e) => handlePromotionChange(e, 'new')}
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded"
                        />
                        <label className="ml-2 text-sm text-lightText dark:text-darkText">
                          {promo.nom}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Description
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Photos
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePhotoChange(e, 'new')}
                    className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600"
                  />
                  {newProduct.photos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {newProduct.photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Preview ${index}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setNewProduct({
                                ...newProduct,
                                photos: newProduct.photos.filter((_, i) => i !== index),
                              })
                            }
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary
                    type="button"
                    onClick={closeAddModal}
                    className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Ajouter
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier le produit
              </h2>
              <form onSubmit={handleEditProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={editProduct.nom}
                    onChange={(e) => setEditProduct({ ...editProduct, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Prix (FCFA)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editProduct.prix}
                    onChange={(e) => setEditProduct({ ...editProduct, prix: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={editProduct.stock}
                    onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Actif
                  </label>
                  <input
                    type="checkbox"
                    checked={editProduct.is_active}
                    onChange={(e) => setEditProduct({ ...editProduct, is_active: e.target.checked })}
                    className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Catégorie
                  </label>
                  <select
                    value={editProduct.categorie}
                    onChange={(e) => setEditProduct({ ...editProduct, categorie: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sans catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Promotions
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {promotions.map((promo) => (
                      <div key={promo.id} className="flex items-center">
                        <input
                          type="checkbox"
                          value={promo.id}
                          checked={editProduct.promotions.includes(promo.id)}
                          onChange={(e) => handlePromotionChange(e, 'edit')}
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded"
                        />
                        <label className="ml-2 text-sm text-lightText dark:text-darkText">
                          {promo.nom}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Description
                  </label>
                  <textarea
                    value={editProduct.description}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Ajouter des photos
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePhotoChange(e, 'edit')}
                    className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600"
                  />
                  {editProduct.photos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {editProduct.photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Preview ${index}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setEditProduct({
                                ...editProduct,
                                photos: editProduct.photos.filter((_, i) => i !== index),
                              })
                            }
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Enregistrer
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer le produit
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer le produit{' '}
                <span className="font-medium">{selectedProduct.nom}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleDeleteProduct}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Supprimer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}

        {isDetailsModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-lg">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2" /> Détails du produit
              </h2>
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>ID :</strong> {selectedProduct.id}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Nom :</strong> {selectedProduct.nom}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Prix :</strong> {selectedProduct.prix} FCFA
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Stock :</strong> {selectedProduct.stock}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Statut :</strong> {selectedProduct.is_active ? 'Actif' : 'Inactif'}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Catégorie :</strong> {selectedProduct.categorie?.nom || 'Sans catégorie'}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Promotions :</strong>{' '}
                  {selectedProduct.promotions.length > 0
                    ? selectedProduct.promotions.map((p) => p.nom).join(', ')
                    : 'Aucune'}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Description :</strong> {selectedProduct.description || 'Aucune'}
                </p>
                <div>
                  <strong className="text-gray-700 dark:text-gray-300">Photos :</strong>
                  {selectedProduct.photos.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedProduct.photos.map((photo) => (
                        <div key={photo.id} className="relative">
                          <img
                            src={photo.image}
                            alt={`Photo ${photo.id}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">Aucune photo</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <ButtonPrimary
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Fermer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProductsPage;

==================================================
// Chemin relatif : src\pages\AdminProductsStatsPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Package, BarChart2, DollarSign, AlertTriangle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface ProductStats {
  total_products: number;
  active_products: number;
  low_stock_products: number;
  total_sales: string;
  sales_by_product: { produit_id: string; nom: string; total_sales: string }[];
  stock_by_category: { categorie_nom: string | null; total_stock: number }[];
  low_stock_details: { id: string; nom: string; stock: number }[];
}

const AdminProductsStatsPage: React.FC = () => {
  
  const [statsData, setStatsData] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysFilter, setDaysFilter] = useState<number>(30);

  useEffect(() => {
    fetchStatsData();
  }, [daysFilter]);

  const fetchStatsData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/produits/stats/', { params: { days: daysFilter } });
      setStatsData(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des statistiques des produits:', err.response?.data);
      setError('Erreur lors du chargement des statistiques des produits.');
      setLoading(false);
    }
  };

  const handleFilterChange = (days: number) => {
    setDaysFilter(days);
  };

  const salesByProductChartData = {
    labels: statsData ? statsData.sales_by_product.map((item) => item.nom) : [],
    datasets: [
      {
        label: 'Ventes par produit (FCFA)',
        data: statsData ? statsData.sales_by_product.map((item) => parseFloat(item.total_sales)) : [],
        backgroundColor: '#2196F3',
      },
    ],
  };

  const stockByCategoryChartData = {
    labels: statsData ? statsData.stock_by_category.map((item) => item.categorie_nom || 'Sans catégorie') : [],
    datasets: [
      {
        label: 'Stock par catégorie',
        data: statsData ? statsData.stock_by_category.map((item) => item.total_stock) : [],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const }, title: { display: true, text: '' } },
  };

  if (loading) {
    return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <BarChart2 className="h-6 w-6 mr-2" /> Statistiques des Produits
        </h1>

        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-2">
          <ButtonPrimary
            onClick={() => handleFilterChange(7)}
            className={`px-4 py-2 text-sm sm:text-base ${daysFilter === 7 ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            7 jours
          </ButtonPrimary>
          <ButtonPrimary
            onClick={() => handleFilterChange(30)}
            className={`px-4 py-2 text-sm sm:text-base ${daysFilter === 30 ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            30 jours
          </ButtonPrimary>
          <ButtonPrimary
            onClick={() => handleFilterChange(90)}
            className={`px-4 py-2 text-sm sm:text-base ${daysFilter === 90 ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            90 jours
          </ButtonPrimary>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
              <Package className="h-5 w-5 mr-2" /> Total Produits
            </h2>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{statsData?.total_products}</p>
          </div>
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
              <Package className="h-5 w-5 mr-2" /> Produits Actifs
            </h2>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{statsData?.active_products}</p>
          </div>
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" /> Stock Faible
            </h2>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{statsData?.low_stock_products}</p>
          </div>
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" /> Total Ventes ({daysFilter} jours)
            </h2>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{statsData?.total_sales} FCFA</p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="space-y-6">
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Ventes par produit</h2>
            <div className="h-48 sm:h-64">
              <Bar
                data={salesByProductChartData}
                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: `Ventes sur ${daysFilter} jours` } } }}
              />
            </div>
          </div>

          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Stock par catégorie</h2>
            <div className="h-48 sm:h-64">
              <Line
                data={stockByCategoryChartData}
                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Répartition du stock' } } }}
              />
            </div>
          </div>

          {/* Liste des produits en stock faible */}
          {statsData && statsData?.low_stock_details.length > 0 && (
            <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" /> Produits en stock faible
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-lightBg dark:bg-darkBg">
                    <tr className="border-b border-lightBorder dark:border-darkBorder">
                      <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsData && statsData.low_stock_details.map((product) => (
                      <tr key={product.id} className="border-b border-lightBorder dark:border-darkBorder">
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.id}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.nom}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductsStatsPage;

==================================================
// Chemin relatif : src\pages\AdminPromotionsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Tag, Search, Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import debounce from 'lodash/debounce';

interface Promotion {
  id: string;
  nom: string;
  reduction: number;
  date_debut: string;
  date_fin: string;
  produits: { id: string; nom: string }[];
}

interface Product {
  id: string;
  nom: string;
}

interface Category {
  id: string;
  nom: string;
}

interface ApiResponse {
  results: Promotion[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminPromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [totalPromotions, setTotalPromotions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newPromotion, setNewPromotion] = useState({
    nom: '',
    reduction: '',
    date_debut: '',
    date_fin: '',
    produits: [] as string[],
    categorie: '' as string | Category,
  });
  const [editPromotion, setEditPromotion] = useState({
    nom: '',
    reduction: '',
    date_debut: '',
    date_fin: '',
    produit_ids: [] as string[],
    categorie_id: '' as string | Category,
  });
  const promotionsPerPage = 10;

  useEffect(() => {
    fetchPromotions();
    fetchCategories();
    fetchProducts('');
  }, [currentPage, searchQuery, filterStatus]);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/promotions/', {
        params: {
          page: currentPage,
          per_page: promotionsPerPage,
          search: searchQuery || undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
        },
      });
      setPromotions(response.data.results);
      setTotalPromotions(response.data.count);
      setTotalPages(Math.ceil(response.data.count / promotionsPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des promotions:', err.response?.data);
      setError('Erreur lors du chargement des promotions.');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data.results);
    } catch (err: any) {
      console.error('Erreur lors du chargement des catégories:', err.response?.data);
      setError('Erreur lors du chargement des catégories.');
    }
  };

  const fetchProducts = useCallback(
    debounce(async (query: string) => {
      try {
        const response = await api.get('/produits/', {
          params: { search: query || undefined, per_page: 50 },
        });
        setProducts(response.data.results);
      } catch (err: any) {
        console.error('Erreur lors du chargement des produits:', err.response?.data);
        setError('Erreur lors du chargement des produits.');
      }
    }, 300),
    []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openAddModal = () => {
    setNewPromotion({ nom: '', reduction: '', date_debut: '', date_fin: '', produits: [], categorie: '' });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setProductSearch('');
  };

  const handleAddPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const promotionData = {
        ...newPromotion,
        reduction: parseFloat(newPromotion.reduction),
        produit_ids: newPromotion.produits,
        categorie_id: typeof newPromotion.categorie === 'string' ? null : newPromotion.categorie.id || null,
        date_debut: new Date(newPromotion.date_debut).toISOString(),
        date_fin: new Date(newPromotion.date_fin).toISOString(),
      };
      await api.post('/promotions/', promotionData);
      setIsAddModalOpen(false);
      fetchPromotions();
    } catch (err: any) {
      console.error('Erreur lors de l’ajout de la promotion:', err.response?.data);
      setError('Erreur lors de l’ajout de la promotion.');
    }
  };

  const openEditModal = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setEditPromotion({
      nom: promotion.nom,
      reduction: promotion.reduction.toString(),
      date_debut: new Date(promotion.date_debut).toISOString().split('T')[0],
      date_fin: new Date(promotion.date_fin).toISOString().split('T')[0],
      produit_ids: promotion.produits.map((p) => p.id),
      categorie_id: '',
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedPromotion(null);
    setProductSearch('');
  };

  const handleEditPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromotion) return;

    try {
      const promotionData = {
        ...editPromotion,
        reduction: parseFloat(editPromotion.reduction),
        produit_ids: editPromotion.produit_ids,
        categorie_id: typeof editPromotion.categorie_id === 'string' ? editPromotion.categorie_id || null : editPromotion.categorie_id.id || null,
        date_debut: new Date(editPromotion.date_debut).toISOString(),
        date_fin: new Date(editPromotion.date_fin).toISOString(),
      };
      await api.put(`/promotions/${selectedPromotion.id}/`, promotionData);
      setIsEditModalOpen(false);
      fetchPromotions();
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la promotion:', err.response?.data);
      setError('Erreur lors de la mise à jour de la promotion.');
    }
  };

  const openDeleteModal = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedPromotion(null);
  };

  const handleDeletePromotion = async () => {
    if (!selectedPromotion) return;

    try {
      await api.delete(`/promotions/${selectedPromotion.id}/`);
      setIsDeleteModalOpen(false);
      fetchPromotions();
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la promotion:', err.response?.data);
      setError('Erreur lors de la suppression de la promotion.');
    }
  };

  const handleProductSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setProductSearch(query);
    fetchProducts(query);
  };

  const handleProductToggle = (productId: string, type: 'new' | 'edit') => {
    if (type === 'new') {
      const updatedProducts = newPromotion.produits.includes(productId)
        ? newPromotion.produits.filter((id) => id !== productId)
        : [...newPromotion.produits, productId];
      setNewPromotion({ ...newPromotion, produits: updatedProducts, categorie: '' });
    } else {
      const updatedProducts = editPromotion.produit_ids.includes(productId)
        ? editPromotion.produit_ids.filter((id) => id !== productId)
        : [...editPromotion.produit_ids, productId];
      setEditPromotion({ ...editPromotion, produit_ids: updatedProducts, categorie_id: '' });
    }
  };

  const handleCategorySelect = (categoryId: string, type: 'new' | 'edit') => {
    if (type === 'new') {
      const selectedCategory = categories.find(cat => cat.id === categoryId) || '';
      setNewPromotion({ ...newPromotion, categorie: selectedCategory, produits: [] });
    } else {
      const selectedCategory = categories.find(cat => cat.id === categoryId) || '';
      setEditPromotion({ ...editPromotion, categorie_id: selectedCategory, produit_ids: [] });
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <Tag className="h-6 w-6 mr-2" /> Gestion des Promotions
        </h1>

        {/* Filtres et Recherche */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Rechercher par nom..."
                className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={handleFilterStatus}
              className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="expired">Expirées</option>
            </select>
          </div>
          <ButtonPrimary
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter une promotion
          </ButtonPrimary>
        </div>

        {/* Liste des promotions */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Réduction</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Début</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Fin</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Nb Produits</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <tr key={promotion.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{promotion.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{promotion.nom}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{promotion.reduction}%</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(promotion.date_debut).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(promotion.date_fin).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{promotion.produits.length}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary
                      onClick={() => openEditModal(promotion)}
                      className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                    <ButtonPrimary
                      onClick={() => openDeleteModal(promotion)}
                      className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                    </ButtonPrimary>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * promotionsPerPage + 1} à{' '}
            {Math.min(currentPage * promotionsPerPage, totalPromotions)} sur {totalPromotions} promotions
          </p>
          <div className="flex gap-2">
            <ButtonPrimary
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {/* Modal pour ajouter une promotion */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-2xl">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" /> Ajouter une promotion
              </h2>
              <form onSubmit={handleAddPromotion} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                    <input
                      type="text"
                      value={newPromotion.nom}
                      onChange={(e) => setNewPromotion({ ...newPromotion, nom: e.target.value })}
                      className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Réduction (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      max={1}
                      min={0}
                      value={newPromotion.reduction}
                      onChange={(e) => setNewPromotion({ ...newPromotion, reduction: e.target.value })}
                      className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date de début</label>
                    <input
                      type="date"
                      value={newPromotion.date_debut}
                      onChange={(e) => setNewPromotion({ ...newPromotion, date_debut: e.target.value })}
                      className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date de fin</label>
                    <input
                      type="date"
                      value={newPromotion.date_fin}
                      onChange={(e) => setNewPromotion({ ...newPromotion, date_fin: e.target.value })}
                      className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Sélection des produits ou catégorie */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-lightText dark:text-darkText">Appliquer à :</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewPromotion({ ...newPromotion, categorie: '', produits: [] })}
                        className={`px-3 py-1 rounded-lg text-sm ${typeof newPromotion.categorie === 'string' ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                      >
                        Produits spécifiques
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewPromotion({ ...newPromotion, produits: [], categorie: categories[0] || '' })}
                        className={`px-3 py-1 rounded-lg text-sm ${typeof newPromotion.categorie !== 'string' ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                      >
                        Toute une catégorie
                      </button>
                    </div>
                  </div>

                  {typeof newPromotion.categorie === 'string' ? (
                    <div>
                      <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Rechercher des produits</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={handleProductSearch}
                          placeholder="Rechercher un produit..."
                          className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="mt-2 max-h-40 overflow-y-auto border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard">
                        {products.map((product) => (
                          <div key={product.id} className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <input
                              type="checkbox"
                              value={product.id}
                              checked={newPromotion.produits.includes(product.id)}
                              onChange={() => handleProductToggle(product.id, 'new')}
                              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded"
                            />
                            <span className="ml-2 text-sm text-lightText dark:text-darkText">{product.nom}</span>
                          </div>
                        ))}
                      </div>
                      {newPromotion.produits.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {newPromotion.produits.map((id) => {
                            const product = products.find((p) => p.id === id);
                            return product ? (
                              <span
                                key={id}
                                className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs flex items-center"
                              >
                                {product.nom}
                                <button
                                  type="button"
                                  onClick={() => handleProductToggle(id, 'new')}
                                  className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                                >
                                  ×
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Sélectionner une catégorie</label>
                      <select
                        value={typeof newPromotion.categorie === 'string' ? newPromotion.categorie : newPromotion.categorie.id}
                        onChange={(e) => handleCategorySelect(e.target.value, 'new')}
                        className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.nom}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <ButtonPrimary
                    type="button"
                    onClick={closeAddModal}
                    className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
                    Ajouter
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal pour modifier une promotion */}
        {isEditModalOpen && selectedPromotion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-2xl">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier la promotion
              </h2>
              <form onSubmit={handleEditPromotion} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                    <input
                      type="text"
                      value={editPromotion.nom}
                      onChange={(e) => setEditPromotion({ ...editPromotion, nom: e.target.value })}
                      className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Réduction (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      max={1}
                      min={0}
                      value={editPromotion.reduction}
                      onChange={(e) => setEditPromotion({ ...editPromotion, reduction: e.target.value })}
                      className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date de début</label>
                    <input
                      type="date"
                      value={editPromotion.date_debut}
                      onChange={(e) => setEditPromotion({ ...editPromotion, date_debut: e.target.value })}
                      className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date de fin</label>
                    <input
                      type="date"
                      value={editPromotion.date_fin}
                      onChange={(e) => setEditPromotion({ ...editPromotion, date_fin: e.target.value })}
                      className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-lightText dark:text-darkText">Appliquer à :</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditPromotion({ ...editPromotion, categorie_id: '', produit_ids: editPromotion.produit_ids })}
                        className={`px-3 py-1 rounded-lg text-sm ${typeof editPromotion.categorie_id === 'string' ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                      >
                        Produits spécifiques
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditPromotion({ ...editPromotion, produit_ids: [], categorie_id: categories[0] || '' })}
                        className={`px-3 py-1 rounded-lg text-sm ${typeof editPromotion.categorie_id !== 'string' ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                      >
                        Toute une catégorie
                      </button>
                    </div>
                  </div>

                  {typeof editPromotion.categorie_id === 'string' ? (
                    <div>
                      <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Rechercher des produits</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={handleProductSearch}
                          placeholder="Rechercher un produit..."
                          className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="mt-2 max-h-40 overflow-y-auto border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard">
                        {products.map((product) => (
                          <div key={product.id} className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <input
                              type="checkbox"
                              value={product.id}
                              checked={editPromotion.produit_ids.includes(product.id)}
                              onChange={() => handleProductToggle(product.id, 'edit')}
                              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded"
                            />
                            <span className="ml-2 text-sm text-lightText dark:text-darkText">{product.nom}</span>
                          </div>
                        ))}
                      </div>
                      {editPromotion.produit_ids.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {editPromotion.produit_ids.map((id) => {
                            const product = products.find((p) => p.id === id);
                            return product ? (
                              <span
                                key={id}
                                className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs flex items-center"
                              >
                                {product.nom}
                                <button
                                  type="button"
                                  onClick={() => handleProductToggle(id, 'edit')}
                                  className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                                >
                                  ×
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Sélectionner une catégorie</label>
                      <select
                        value={typeof editPromotion.categorie_id === 'string' ? editPromotion.categorie_id : editPromotion.categorie_id.id}
                        onChange={(e) => handleCategorySelect(e.target.value, 'edit')}
                        className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.nom}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end">
                  <ButtonPrimary
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
                    Enregistrer
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal pour supprimer une promotion */}
        {isDeleteModalOpen && selectedPromotion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer la promotion
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer la promotion <span className="font-medium">{selectedPromotion.nom}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleDeletePromotion}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Supprimer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPromotionsPage;

==================================================
// Chemin relatif : src\pages\AdminRealisationsPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Wrench, Search, Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Service {
  id: string;
  nom: string;
}

interface Realisation {
  id: string;
  service: Service;
  titre: string;
  description: string;
  photos: string[];
  date: string;
  admin: string;
  is_active: boolean;
}

interface Service {
  id: string;
  nom: string;
}

interface ApiResponse {
  results: Realisation[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminRealisationsPage: React.FC = () => {
  const [realisations, setRealisations] = useState<Realisation[]>([]);
  const [totalRealisations, setTotalRealisations] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [selectedRealisation, setSelectedRealisation] = useState<Realisation | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newRealisation, setNewRealisation] = useState({ service: '', titre: '', description: '', photos: [] as File[], date: '', is_active: true });
  const [editRealisation, setEditRealisation] = useState({ service: '', titre: '', description: '', photos: [] as File[], date: '', is_active: true });
  const realisationsPerPage = 10;

  useEffect(() => {
    fetchRealisations();
    fetchServices();
  }, [currentPage, searchQuery]);

  const fetchRealisations = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/realisations/', {
        params: { page: currentPage, per_page: realisationsPerPage, search: searchQuery || undefined },
      });
      setRealisations(response.data.results);
      setTotalRealisations(response.data.count);
      setTotalPages(Math.ceil(response.data.count / realisationsPerPage));
      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors du chargement des réalisations.');
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get<{ results: Service[] }>('/services/');
      setServices(response.data.results);
      console.log(response.data)
    } catch (err: any) {
      setError('Erreur lors du chargement des services.');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const openAddModal = () => {
    setNewRealisation({ service: services[0]?.id || '', titre: '', description: '', photos: [], date: new Date().toISOString().split('T')[0], is_active: true });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => { setIsAddModalOpen(false); };

  const handleAddRealisation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('service', newRealisation.service);
      formData.append('titre', newRealisation.titre);
      formData.append('description', newRealisation.description);
      newRealisation.photos.forEach((photo) => formData.append('photos', photo));
      formData.append('date', newRealisation.date);
      formData.append('is_active', newRealisation.is_active.toString());
      await api.post('/realisations/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsAddModalOpen(false);
      fetchRealisations();
    } catch (err: any) {
      setError('Erreur lors de l’ajout de la réalisation.');
    }
  };

  const openEditModal = (realisation: Realisation) => {
    setSelectedRealisation(realisation);
    setEditRealisation({ service: realisation.service.nom, titre: realisation.titre, description: realisation.description, photos: [], date: realisation.date.split('T')[0], is_active: realisation.is_active });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => { setIsEditModalOpen(false); setSelectedRealisation(null); };

  const handleEditRealisation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRealisation) return;
    try {
      const formData = new FormData();
      formData.append('service', editRealisation.service);
      formData.append('titre', editRealisation.titre);
      formData.append('description', editRealisation.description);
      editRealisation.photos.forEach((photo) => formData.append('photos', photo));
      formData.append('date', editRealisation.date);
      formData.append('is_active', editRealisation.is_active.toString());
      await api.put(`/realisations/${selectedRealisation.id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsEditModalOpen(false);
      fetchRealisations();
    } catch (err: any) {
      setError('Erreur lors de la mise à jour de la réalisation.');
    }
  };

  const openDeleteModal = (realisation: Realisation) => { setSelectedRealisation(realisation); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setIsDeleteModalOpen(false); setSelectedRealisation(null); };

  const handleDeleteRealisation = async () => {
    if (!selectedRealisation) return;
    try {
      await api.delete(`/realisations/${selectedRealisation.id}/`);
      setIsDeleteModalOpen(false);
      fetchRealisations();
    } catch (err: any) {
      setError('Erreur lors de la suppression de la réalisation.');
    }
  };

  if (loading) return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <Wrench className="h-6 w-6 mr-2" /> Gestion des Réalisations
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par titre..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ButtonPrimary onClick={openAddModal} className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center">
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter une réalisation
          </ButtonPrimary>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Titre</th>
                <th className="py-3 px-4">Photos</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {realisations.map((realisation) => (
                <tr key={realisation.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{realisation.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{realisation.service.nom}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{realisation.titre}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{realisation.photos.length}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(realisation.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${realisation.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {realisation.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary onClick={() => openEditModal(realisation)} className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm">
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                    <ButtonPrimary onClick={() => openDeleteModal(realisation)} className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm">
                      <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                    </ButtonPrimary>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * realisationsPerPage + 1} à {Math.min(currentPage * realisationsPerPage, totalRealisations)} sur {totalRealisations} réalisations
          </p>
          <div className="flex gap-2">
            <ButtonPrimary onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" /> Ajouter une réalisation
              </h2>
              <form onSubmit={handleAddRealisation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Service</label>
                  <select value={newRealisation.service} onChange={(e) => setNewRealisation({ ...newRealisation, service: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>{service.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Titre</label>
                  <input type="text" value={newRealisation.titre} onChange={(e) => setNewRealisation({ ...newRealisation, titre: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea value={newRealisation.description} onChange={(e) => setNewRealisation({ ...newRealisation, description: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Photos</label>
                  <input type="file" multiple onChange={(e) => setNewRealisation({ ...newRealisation, photos: Array.from(e.target.files || []) })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date</label>
                  <input type="date" value={newRealisation.date} onChange={(e) => setNewRealisation({ ...newRealisation, date: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={newRealisation.is_active} onChange={(e) => setNewRealisation({ ...newRealisation, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeAddModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Ajouter</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && selectedRealisation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier la réalisation
              </h2>
              <form onSubmit={handleEditRealisation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Service</label>
                  <select value={editRealisation.service} onChange={(e) => setEditRealisation({ ...editRealisation, service: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>{service.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Titre</label>
                  <input type="text" value={editRealisation.titre} onChange={(e) => setEditRealisation({ ...editRealisation, titre: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea value={editRealisation.description} onChange={(e) => setEditRealisation({ ...editRealisation, description: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Photos</label>
                  <input type="file" multiple onChange={(e) => setEditRealisation({ ...editRealisation, photos: Array.from(e.target.files || []) })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText" />
                  {selectedRealisation.photos.length > 0 && editRealisation.photos.length === 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {selectedRealisation.photos.map((photo, index) => (
                        <img key={index} src={photo} alt="Prévisualisation" className="h-16 w-16 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date</label>
                  <input type="date" value={editRealisation.date} onChange={(e) => setEditRealisation({ ...editRealisation, date: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={editRealisation.is_active} onChange={(e) => setEditRealisation({ ...editRealisation, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeEditModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Enregistrer</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && selectedRealisation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer la réalisation
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer la réalisation <span className="font-medium">{selectedRealisation.titre}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary type="button" onClick={closeDeleteModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                <ButtonPrimary onClick={handleDeleteRealisation} className="px-4 py-2 bg-red-500 text-white hover:bg-red-600">Supprimer</ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRealisationsPage;

==================================================
// Chemin relatif : src\pages\AdminServicesPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Wrench, Search, Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Service {
  id: string;
  nom: string;
  description: string;
  photos: string[];
  is_active: boolean;
  date_creation: string;
}

interface ApiResponse {
  results: Service[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminServicesPage: React.FC = () => {
  
  const [services, setServices] = useState<Service[]>([]);
  const [totalServices, setTotalServices] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newService, setNewService] = useState({ nom: '', description: '', photos: [] as String[], is_active: true });
  const [editService, setEditService] = useState({ nom: '', description: '', photos: [] as String[], is_active: true });
  const servicesPerPage = 10;

  useEffect(() => {
    fetchServices();
  }, [currentPage, searchQuery]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/services/', {
        params: { page: currentPage, per_page: servicesPerPage, search: searchQuery || undefined },
      });
      setServices(response.data.results);
      setTotalServices(response.data.count);
      setTotalPages(Math.ceil(response.data.count / servicesPerPage));
      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors du chargement des services.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const openAddModal = () => {
    setNewService({ nom: '', description: '', photos: [], is_active: true });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => { setIsAddModalOpen(false); };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/services/', newService);
      setIsAddModalOpen(false);
      fetchServices();
    } catch (err: any) {
      setError('Erreur lors de l’ajout du service.');
    }
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setEditService({ nom: service.nom, description: service.description, photos: service.photos, is_active: service.is_active });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => { setIsEditModalOpen(false); setSelectedService(null); };

  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    try {
      await api.put(`/services/${selectedService.id}/`, editService);
      setIsEditModalOpen(false);
      fetchServices();
    } catch (err: any) {
      setError('Erreur lors de la mise à jour du service.');
    }
  };

  const openDeleteModal = (service: Service) => { setSelectedService(service); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setIsDeleteModalOpen(false); setSelectedService(null); };

  const handleDeleteService = async () => {
    if (!selectedService) return;
    try {
      await api.delete(`/services/${selectedService.id}/`);
      setIsDeleteModalOpen(false);
      fetchServices();
    } catch (err: any) {
      setError('Erreur lors de la suppression du service.');
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'new' | 'edit') => {
    const files = e.target.files;
    if (files) {
      const photoUrls = Array.from(files).map(file => URL.createObjectURL(file));
      if (type === 'new') {
        setNewService({ ...newService, photos: photoUrls });
      } else {
        setEditService({ ...editService, photos: photoUrls });
      }
    }
  };

  if (loading) return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <Wrench className="h-6 w-6 mr-2" /> Gestion des Services
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par nom..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ButtonPrimary onClick={openAddModal} className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center">
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un service
          </ButtonPrimary>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nom</th>
                <th className="py-3 px-4">Photos</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{service.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{service.nom}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{service.photos.length} photo(s)</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${service.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {service.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary onClick={() => openEditModal(service)} className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm">
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                    <ButtonPrimary onClick={() => openDeleteModal(service)} className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm">
                      <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                    </ButtonPrimary>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * servicesPerPage + 1} à {Math.min(currentPage * servicesPerPage, totalServices)} sur {totalServices} services
          </p>
          <div className="flex gap-2">
            <ButtonPrimary onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un service
              </h2>
              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                  <input type="text" value={newService.nom} onChange={(e) => setNewService({ ...newService, nom: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Photos</label>
                  <input type="file" multiple onChange={(e) => handlePhotoChange(e, 'new')} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={newService.is_active} onChange={(e) => setNewService({ ...newService, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeAddModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Ajouter</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier le service
              </h2>
              <form onSubmit={handleEditService} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                  <input type="text" value={editService.nom} onChange={(e) => setEditService({ ...editService, nom: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea value={editService.description} onChange={(e) => setEditService({ ...editService, description: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Photos</label>
                  <input type="file" multiple onChange={(e) => handlePhotoChange(e, 'edit')} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={editService.is_active} onChange={(e) => setEditService({ ...editService, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeEditModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Enregistrer</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer le service
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer le service <span className="font-medium">{selectedService.nom}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary type="button" onClick={closeDeleteModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                <ButtonPrimary onClick={handleDeleteService} className="px-4 py-2 bg-red-500 text-white hover:bg-red-600">Supprimer</ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminServicesPage;

==================================================
// Chemin relatif : src\pages\AdminUserBansPage.tsx

import React, { useState, useEffect } from 'react';
import { getUsers, updateUser } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Search, XCircle, CheckCircle, ChevronLeft, ChevronRight, Ban } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  is_banned: boolean;
  date_creation: string;
  last_login: string | null;
}

// interface ApiResponse {
//   results: User[];
//   count: number;
//   next: string | null;
//   previous: string | null;
// }

const AdminUserBansPage: React.FC = () => {
  
  const [bannedUsers, setBannedUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUnbanModalOpen, setIsUnbanModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const usersPerPage = 10;

  useEffect(() => {
    fetchBannedUsers();
  }, [currentPage, searchQuery]);

  const fetchBannedUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        page: currentPage,
        per_page: usersPerPage,
        search: searchQuery || undefined,
        is_banned: 'true', // Filtrer uniquement les utilisateurs bannis
      });
      setBannedUsers(response.data.results);
      setTotalUsers(response.data.count);
      setTotalPages(Math.ceil(response.data.count / usersPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des utilisateurs bannis:', err.response?.data);
      setError('Erreur lors du chargement des utilisateurs bannis.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openUnbanModal = (user: User) => {
    setSelectedUser(user);
    setIsUnbanModalOpen(true);
  };

  const closeUnbanModal = () => {
    setIsUnbanModalOpen(false);
    setSelectedUser(null);
  };

  const handleUnbanUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, { is_banned: false, is_active: true });
      setIsUnbanModalOpen(false);
      fetchBannedUsers();
    } catch (err: any) {
      console.error('Erreur lors du dé-bannissement de l’utilisateur:', err.response?.data);
      setError('Erreur lors du dé-bannissement de l’utilisateur.');
    }
  };

  const openBanModal = () => {
    setIsBanModalOpen(true);
  };

  const closeBanModal = () => {
    setIsBanModalOpen(false);
    setSelectedUser(null);
  };

  const handleBanUser = async (email: string) => {
    try {
      const response = await getUsers({ search: email });
      const userToBan = response.data.results.find((u: User) => u.email === email);
      if (!userToBan) {
        setError('Utilisateur non trouvé.');
        return;
      }
      if (userToBan.is_banned) {
        setError('Cet utilisateur est déjà banni.');
        return;
      }
      await updateUser(userToBan.id, { is_banned: true, is_active: false });
      setIsBanModalOpen(false);
      fetchBannedUsers();
    } catch (err: any) {
      console.error('Erreur lors du bannissement de l’utilisateur:', err.response?.data);
      setError('Erreur lors du bannissement de l’utilisateur.');
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <Ban className="h-6 w-6 mr-2" /> Gestion des Bannissements
        </h1>

        {/* Recherche et Bouton Bannir */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par email ou nom..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ButtonPrimary
            onClick={openBanModal}
            className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 flex items-center"
          >
            <Ban className="h-5 w-5 mr-2" /> Bannir un utilisateur
          </ButtonPrimary>
        </div>

        {/* Liste des utilisateurs bannis */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Email</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Rôle</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Statut</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Créé le</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Dernière connexion</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bannedUsers.map((user) => (
                <tr key={user.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.username}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.role}</td>
                  <td className="py-3 px-4">
                    {user.is_banned && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      <XCircle className="h-4 w-4 mr-1" /> Banni
                    </span>)}
                  </td>
                    
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(user.date_creation).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Jamais'}
                  </td>
                  <td className="py-3 px-4">
                    {user.is_banned && 
                        (
                            <ButtonPrimary
                      onClick={() => openUnbanModal(user)}
                      className="px-2 py-1 bg-green-500 text-white hover:bg-green-600 flex items-center text-sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Lever le ban
                    </ButtonPrimary>
                        )
                    }
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * usersPerPage + 1} à{' '}
            {Math.min(currentPage * usersPerPage, totalUsers)} sur {totalUsers} utilisateurs bannis
          </p>
          <div className="flex gap-2">
            <ButtonPrimary
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {/* Modal pour lever un ban */}
        {isUnbanModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" /> Lever le bannissement
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir lever le bannissement de <span className="font-medium">{selectedUser.email}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary
                  type="button"
                  onClick={closeUnbanModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleUnbanUser}
                  className="px-4 py-2 bg-green-500 text-white hover:bg-green-600"
                >
                  Confirmer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}

        {/* Modal pour bannir un utilisateur */}
        {isBanModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Ban className="h-5 w-5 mr-2" /> Bannir un utilisateur
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const email = (e.target as any).email.value;
                  handleBanUser(email);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Email de l’utilisateur</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary
                    type="button"
                    onClick={closeBanModal}
                    className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-red-500 text-white hover:bg-red-600">
                    Bannir
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUserBansPage;

==================================================
// Chemin relatif : src\pages\AdminUsersPage.tsx

import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api'; // Importez depuis api.ts
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Users, Search, Edit, Trash2, PlusCircle, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  is_banned: boolean;
  date_creation: string;
  last_login: string | null;
}

// interface ApiResponse {
//   results: User[]; // Avec pagination
//   count: number;
//   next: string | null;
//   previous: string | null;
// }

const AdminUsersPage: React.FC = () => {
  
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', username: '', password: '', role: 'client' });
  const [editUser, setEditUser] = useState({ email: '', username: '', role: '', is_active: true, is_banned: false });
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, filterRole, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const statusFilter = filterStatus === 'all' ? undefined : filterStatus === 'active' ? 'true' : 'false';
      const response = await getUsers({
        page: currentPage,
        per_page: usersPerPage,
        search: searchQuery || undefined,
        role: filterRole !== 'all' ? filterRole : undefined,
        is_active: statusFilter,
      });
      setUsers(response.data.results);
      setTotalUsers(response.data.count);
      setTotalPages(Math.ceil(response.data.count / usersPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des utilisateurs:', err.response?.data);
      setError('Erreur lors du chargement des utilisateurs.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRole(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openCreateModal = () => {
    setNewUser({ email: '', username: '', password: '', role: 'client' });
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(newUser);
      setIsCreateModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Erreur lors de la création de l’utilisateur:', err.response?.data);
      setError('Erreur lors de la création de l’utilisateur.');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      email: user.email,
      username: user.username,
      role: user.role,
      is_active: user.is_active,
      is_banned: user.is_banned,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, editUser);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de l’utilisateur:', err.response?.data);
      setError('Erreur lors de la mise à jour de l’utilisateur.');
    }
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Erreur lors de la suppression de l’utilisateur:', err.response?.data);
      setError('Erreur lors de la suppression de l’utilisateur.');
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <Users className="h-6 w-6 mr-2" /> Gestion des Utilisateurs
        </h1>

        {/* Filtres et Recherche */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Rechercher par email ou nom..."
                className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={handleFilterRole}
                className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les rôles</option>
                <option value="admin">Admin</option>
                <option value="client">Client</option>
              </select>
              <select
                value={filterStatus}
                onChange={handleFilterStatus}
                className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>
          <ButtonPrimary
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un utilisateur
          </ButtonPrimary>
        </div>

        {/* Liste des utilisateurs */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Email</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Rôle</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Statut</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Créé le</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Dernière connexion</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.username}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.role}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_active && !user.is_banned
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : user.is_banned
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {user.is_active && !user.is_banned ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1" />
                      )}
                      {user.is_active && !user.is_banned ? 'Actif' : user.is_banned ? 'Banni' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(user.date_creation).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Jamais'}
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-1 text-blue-500 hover:text-blue-700"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(user)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * usersPerPage + 1} à{' '}
            {Math.min(currentPage * usersPerPage, totalUsers)} sur {totalUsers} utilisateurs
          </p>
          <div className="flex gap-2">
            <ButtonPrimary
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {/* Modal de création */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un utilisateur
              </h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom d’utilisateur</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Rôle</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary
                    type="button"
                    onClick={closeCreateModal}
                    className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
                    Créer
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal d’édition */}
        {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier l’utilisateur
              </h2>
              <form onSubmit={handleEditUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom d’utilisateur</label>
                  <input
                    type="text"
                    value={editUser.username}
                    onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Email</label>
                  <input
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Rôle</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input
                    type="checkbox"
                    checked={editUser.is_active}
                    onChange={(e) => setEditUser({ ...editUser, is_active: e.target.checked })}
                    className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Banni</label>
                  <input
                    type="checkbox"
                    checked={editUser.is_banned}
                    onChange={(e) => setEditUser({ ...editUser, is_banned: e.target.checked })}
                    className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
                    Enregistrer
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de suppression */}
        {isDeleteModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer l’utilisateur
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer l’utilisateur <span className="font-medium">{selectedUser.email}</span> ? Cette action est irréversible.
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Supprimer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;

==================================================
// Chemin relatif : src\pages\AdminUserStatsPage.tsx

import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Users, BarChart2, XCircle, CheckCircle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { getUserStats } from '../services/api'; // Utilisation de l’instance axios existante
import api from '../services/api'; // Utilisation de l’instance axios existante


ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface DashboardData {
  users: {
    total: number;
    active: number;
    banned: number;
    by_role: { [key: string]: number };
    new_last_7_days: number;
  };
}

interface UserStats {
  registrations_by_day: { date: string; count: number }[];
  logins_by_day: { date: string; count: number }[];
}

const AdminUserStatsPage: React.FC = () => {
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [statsData, setStatsData] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysFilter, setDaysFilter] = useState<number>(7);

  useEffect(() => {
    fetchDashboardData();
    fetchStatsData();
  }, [daysFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/utilisateurs/dashboard/', {
        params: { days: daysFilter },
      });
      setDashboardData(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des données du tableau de bord:', err.response?.data);
      setError('Erreur lors du chargement des données.');
      setLoading(false);
    }
  };

  const fetchStatsData = async () => {
    setLoading(true);
    try {
      const response = await getUserStats(
        { days: daysFilter },
      );
      setStatsData(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des statistiques:', err.response?.data);
      setError('Erreur lors du chargement des statistiques.');
      setLoading(false);
    }
  };

  const handleFilterChange = (days: number) => {
    setDaysFilter(days);
  };

  // Graphique des utilisateurs par rôle
  const roleChartData = {
    labels: dashboardData ? Object.keys(dashboardData.users.by_role) : [],
    datasets: [
      {
        label: 'Nombre d’utilisateurs par rôle',
        data: dashboardData ? Object.values(dashboardData.users.by_role) : [],
        backgroundColor: '#2196F3',
      },
    ],
  };

  // Graphique des inscriptions par jour
  const registrationChartData = {
    labels: statsData ? statsData.registrations_by_day.map((item) => item.date) : [],
    datasets: [
      {
        label: 'Inscriptions par jour',
        data: statsData ? statsData.registrations_by_day.map((item) => item.count) : [],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        fill: true,
      },
    ],
  };

  // Graphique des connexions par jour
  const loginChartData = {
    labels: statsData ? statsData.logins_by_day.map((item) => item.date) : [],
    datasets: [
      {
        label: 'Connexions par jour',
        data: statsData ? statsData.logins_by_day.map((item) => item.count) : [],
        borderColor: '#FF9800',
        backgroundColor: 'rgba(255, 152, 0, 0.2)',
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '' },
    },
  };

  if (loading) {
    return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <BarChart2 className="h-6 w-6 mr-2" /> Statistiques des Utilisateurs
        </h1>

        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-2">
          <ButtonPrimary
            onClick={() => handleFilterChange(7)}
            className={`px-4 py-2 text-sm sm:text-base ${daysFilter === 7 ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            7 jours
          </ButtonPrimary>
          <ButtonPrimary
            onClick={() => handleFilterChange(30)}
            className={`px-4 py-2 text-sm sm:text-base ${daysFilter === 30 ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            30 jours
          </ButtonPrimary>
          <ButtonPrimary
            onClick={() => handleFilterChange(90)}
            className={`px-4 py-2 text-sm sm:text-base ${daysFilter === 90 ? 'bg-blue-500 text-white' : 'bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
          >
            90 jours
          </ButtonPrimary>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
              <Users className="h-5 w-5 mr-2" /> Total
            </h2>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{dashboardData?.users.total}</p>
          </div>
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" /> Actifs
            </h2>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{dashboardData?.users.active}</p>
          </div>
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
              <XCircle className="h-5 w-5 mr-2" /> Bannis
            </h2>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{dashboardData?.users.banned}</p>
          </div>
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
              <Users className="h-5 w-5 mr-2" /> Nouveaux ({daysFilter} jours)
            </h2>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{dashboardData?.users.new_last_7_days}</p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="space-y-6">
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Utilisateurs par rôle</h2>
            <div className="h-48 sm:h-64">
              <Bar
                data={roleChartData}
                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Répartition par rôle' } } }}
              />
            </div>
          </div>

          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Inscriptions par jour</h2>
            <div className="h-48 sm:h-64">
              <Line
                data={registrationChartData}
                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Inscriptions sur ' + daysFilter + ' jours' } } }}
              />
            </div>
          </div>

          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Connexions par jour</h2>
            <div className="h-48 sm:h-64">
              <Line
                data={loginChartData}
                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Connexions sur ' + daysFilter + ' jours' } } }}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUserStatsPage;

==================================================
// Chemin relatif : src\pages\AdminWishListsPage.tsx

import React, { useState, useEffect } from 'react';
import api, { supprimerProduitWishlist,  } from '../services/api'; // Importez les fonctions nécessaires
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Heart, Search, Trash2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface Wishlist {
  id: string;
  client: {
    id: string;
    username: string;
    email: string;
  };
  produits: {
    id: string;
    nom: string;
    prix: string;
  }[];
}

interface ApiResponse {
  results: Wishlist[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminWishlistsPage: React.FC = () => {
  
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [totalWishlists, setTotalWishlists] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [isDeleteWishlistModalOpen, setIsDeleteWishlistModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ wishlistId: string; productId: string } | null>(null);
  const wishlistsPerPage = 10;

  useEffect(() => {
    fetchWishlists();
  }, [currentPage, searchQuery]);

  const fetchWishlists = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/wishlist/', {
        params: {
          page: currentPage,
          per_page: wishlistsPerPage,
          search: searchQuery || undefined, // Recherche par email ou nom d’utilisateur du client
        },
      });
      setWishlists(response.data.results);
      setTotalWishlists(response.data.count);
      setTotalPages(Math.ceil(response.data.count / wishlistsPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des wishlists:', err.response?.data);
      setError('Erreur lors du chargement des wishlists.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openDetailsModal = (wishlist: Wishlist) => {
    setSelectedWishlist(wishlist);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedWishlist(null);
  };

  const openDeleteProductModal = (wishlistId: string, productId: string) => {
    setProductToDelete({ wishlistId, productId });
    setIsDeleteProductModalOpen(true);
  };

  const closeDeleteProductModal = () => {
    setIsDeleteProductModalOpen(false);
    setProductToDelete(null);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await supprimerProduitWishlist(productToDelete.productId);
      setIsDeleteProductModalOpen(false);
      fetchWishlists(); // Rafraîchir la liste
    } catch (err: any) {
      console.error('Erreur lors de la suppression du produit de la wishlist:', err.response?.data);
      setError('Erreur lors de la suppression du produit.');
    }
  };

  const openDeleteWishlistModal = (wishlist: Wishlist) => {
    setSelectedWishlist(wishlist);
    setIsDeleteWishlistModalOpen(true);
  };

  const closeDeleteWishlistModal = () => {
    setIsDeleteWishlistModalOpen(false);
    setSelectedWishlist(null);
  };

  const handleDeleteWishlist = async () => {
    if (!selectedWishlist) return;

    try {
      await api.delete(`/wishlist/${selectedWishlist.id}/`);
      setIsDeleteWishlistModalOpen(false);
      fetchWishlists();
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la wishlist:', err.response?.data);
      setError('Erreur lors de la suppression de la wishlist.');
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <Heart className="h-6 w-6 mr-2" /> Gestion des Wishlists
        </h1>

        {/* Recherche */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par email ou nom d’utilisateur..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Liste des wishlists */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Utilisateur</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Email</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Nb Produits</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wishlists.map((wishlist) => (
                <tr key={wishlist.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{wishlist.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{wishlist.client.username}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{wishlist.client.email}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{wishlist.produits.length}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary
                      onClick={() => openDetailsModal(wishlist)}
                      className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                    >
                      <Eye className="h-4 w-4 mr-1" /> Détails
                    </ButtonPrimary>
                    <ButtonPrimary
                      onClick={() => openDeleteWishlistModal(wishlist)}
                      className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                    </ButtonPrimary>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * wishlistsPerPage + 1} à{' '}
            {Math.min(currentPage * wishlistsPerPage, totalWishlists)} sur {totalWishlists} wishlists
          </p>
          <div className="flex gap-2">
            <ButtonPrimary
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {/* Modal pour voir les détails */}
        {isDetailsModalOpen && selectedWishlist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-2xl">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2" /> Détails de la Wishlist de {selectedWishlist.client.username}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-lightCard dark:bg-darkCard">
                    <tr className="border-b border-lightBorder dark:border-darkBorder">
                      <th className="py-3 px-4 text-lightText dark:text-darkText">ID Produit</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Prix</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedWishlist.produits.map((product) => (
                      <tr key={product.id} className="border-b border-lightBorder dark:border-darkBorder">
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.id}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.nom}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.prix} FCFA</td>
                        <td className="py-3 px-4">
                          <ButtonPrimary
                            onClick={() => openDeleteProductModal(selectedWishlist.id, product.id)}
                            className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                          </ButtonPrimary>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <ButtonPrimary
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Fermer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}

        {/* Modal pour supprimer un produit */}
        {isDeleteProductModalOpen && productToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer un produit
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer ce produit de la wishlist ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary
                  type="button"
                  onClick={closeDeleteProductModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleDeleteProduct}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Supprimer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}

        {/* Modal pour supprimer une wishlist */}
        {isDeleteWishlistModalOpen && selectedWishlist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer la Wishlist
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer la wishlist de <span className="font-medium">{selectedWishlist.client.email}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary
                  type="button"
                  onClick={closeDeleteWishlistModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleDeleteWishlist}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Supprimer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminWishlistsPage;

==================================================
