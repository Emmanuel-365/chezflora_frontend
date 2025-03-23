"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";
import { Calendar, Users, ShoppingCart, Package, AlertTriangle, DollarSign, BarChart2 } from "lucide-react";

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
  const [selectedSection, setSelectedSection] = useState<string>("overview");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/auth");
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(`/utilisateurs/dashboard/?days=${daysFilter}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Dashboard data:", response.data);
        setData(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error("Erreur lors du chargement:", err.response?.data);
        setError("Erreur lors du chargement du tableau de bord.");
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/auth");
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
    labels: ["Total", "Actifs", "Bannis", `Nouveaux (${daysFilter} jours)`],
    datasets: [
      {
        label: "Utilisateurs",
        data: data ? [data.users.total, data.users.active, data.users.banned, data.users.new_last_7_days] : [],
        backgroundColor: ["#4CAF50", "#F44336", "#FF9800", "#2196F3"],
      },
    ],
  };

  const commandStatusChartData = {
    labels: data?.commands.by_status ? Object.keys(data.commands.by_status) : [],
    datasets: [
      {
        data: data?.commands.by_status ? Object.values(data.commands.by_status) : [],
        backgroundColor: ["#4CAF50", "#F44336", "#FF9800", "#2196F3", "#9C27B0"],
      },
    ],
  };

  const revenueChartData = {
    labels: [`Total`, `Derniers ${daysFilter} jours`],
    datasets: [
      {
        label: "Revenus (FCFA)",
        data: data ? [data.commands.total_revenue, data.commands.revenue_last_7_days] : [],
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        fill: true,
      },
    ],
  };

  const productCategoryChartData = {
    labels: data?.products.by_category ? Object.keys(data.products.by_category) : [],
    datasets: [
      {
        label: "Produits par catégorie",
        data: data?.products.by_category ? Object.values(data.products.by_category) : [],
        backgroundColor: "#2196F3",
      },
    ],
  };

  const paymentTypeChartData = {
    labels: data?.payments.by_type ? Object.keys(data.payments.by_type) : [],
    datasets: [
      {
        data: data?.payments.by_type ? Object.values(data.payments.by_type) : [],
        backgroundColor: ["#4CAF50", "#FF9800", "#F44336"],
      },
    ],
  };

  const ateliersChartData = {
    labels: ["Total", "Actifs", "Annulés", "Participants"],
    datasets: [
      {
        label: "Ateliers",
        data: data ? [data.ateliers.total, data.ateliers.active, data.ateliers.cancelled, data.ateliers.total_participants] : [],
        backgroundColor: ["#4CAF50", "#2196F3", "#F44336", "#FF9800"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "" },
    },
  };

  const renderPlaceholder = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md animate-pulse">
            <div className="h-5 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="space-y-1">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      {selectedSection !== "overview" && (
        <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
          <div className="h-5 w-40 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-48 sm:h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      )}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
            <Users className="h-5 w-5 mr-2" /> Utilisateurs
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Total : {data?.users.total ?? 0}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Actifs : {data?.users.active ?? 0}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Bannis : {data?.users.banned ?? 0}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Nouveaux ({daysFilter} jours) : {data?.users.new_last_7_days ?? 0}</p>
        </div>
        <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" /> Commandes
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Total : {data?.commands.total ?? 0}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Revenus total : {data?.commands.total_revenue ?? "0"} FCFA</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Revenus ({daysFilter} jours) : {data?.commands.revenue_last_7_days ?? "0"} FCFA</p>
        </div>
        <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
            <Package className="h-5 w-5 mr-2" /> Produits
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Total : {data?.products.total ?? 0}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Actifs : {data?.products.active ?? 0}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Stock faible : {data?.products.low_stock ?? 0}</p>
        </div>
        <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
            <Calendar className="h-5 w-5 mr-2" /> Ateliers
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Total : {data?.ateliers.total ?? 0}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Actifs : {data?.ateliers.active ?? 0}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Annulés : {data?.ateliers.cancelled ?? 0}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Participants : {data?.ateliers.total_participants ?? 0}</p>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Répartition des utilisateurs</h2>
        <div className="h-48 sm:h-64">
          <Bar data={userChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: "Statistiques Utilisateurs" } } }} />
        </div>
      </div>
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Utilisateurs par rôle</h2>
        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          {data?.users.by_role && Object.entries(data.users.by_role).length > 0 ? (
            Object.entries(data.users.by_role).map(([role, count]) => (
              <li key={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)} : {count}
              </li>
            ))
          ) : (
            <li>Aucun rôle disponible</li>
          )}
        </ul>
      </div>
    </div>
  );

  const renderCommands = () => (
    <div className="space-y-6">
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Statut des commandes</h2>
        <div className="h-48 sm:h-64">
          <Pie data={commandStatusChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: "Répartition par statut" } } }} />
        </div>
      </div>
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Revenus</h2>
        <div className="h-48 sm:h-64">
          <Line data={revenueChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: "Revenus Commandes" } } }} />
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
            options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: "Répartition par catégorie" } } }}
          />
        </div>
      </div>
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" /> Produits en stock faible
        </h2>
        {data?.products.low_stock_details && data.products.low_stock_details.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-2 px-4 text-lightText dark:text-darkText">ID</th>
                <th className="py-2 px-4 text-lightText dark:text-darkText">Nom</th>
                <th className="py-2 px-4 text-lightText dark:text-darkText">Stock</th>
              </tr>
            </thead>
            <tbody>
              {data.products.low_stock_details.map((product) => (
                <tr key={product.id} className="border-b border-lightBorder dark:border-darkBorder">
                  <td className="py-2 px-4 text-gray-700 dark:text-gray-300">{product.id}</td>
                  <td className="py-2 px-4 text-gray-700 dark:text-gray-300">{product.nom}</td>
                  <td className="py-2 px-4 text-red-600 dark:text-red-400">{product.stock}</td>
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
            options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: "Statistiques Ateliers" } } }}
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
            options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: "Répartition par type" } } }}
          />
        </div>
      </div>
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" /> Résumé des paiements
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Total des paiements : {data?.payments.total ?? 0}</p>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Montant total : {data?.payments.total_amount ?? "0"} FCFA</p>
      </div>
    </div>
  );

  const renderSubscriptions = () => (
    <div className="space-y-6">
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
          <BarChart2 className="h-5 w-5 mr-2" /> Abonnements
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Total : {data?.subscriptions.total ?? 0}</p>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Actifs : {data?.subscriptions.active ?? 0}</p>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Revenus total : {data?.subscriptions.total_revenue ?? "0"} FCFA</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case "users":
        return renderUsers();
      case "commands":
        return renderCommands();
      case "products":
        return renderProducts();
      case "ateliers":
        return renderAteliers();
      case "payments":
        return renderPayments();
      case "subscriptions":
        return renderSubscriptions();
      case "overview":
      default:
        return renderOverview();
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6">
          Tableau de bord Admin
        </h1>

        <div className="mb-6 flex flex-wrap gap-2">
          <ButtonPrimary
            onClick={() => handleFilterChange(7)}
            className={`px-4 py-2 text-sm sm:text-base ${
              daysFilter === 7
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            7 jours
          </ButtonPrimary>
          <ButtonPrimary
            onClick={() => handleFilterChange(30)}
            className={`px-4 py-2 text-sm sm:text-base ${
              daysFilter === 30
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            30 jours
          </ButtonPrimary>
          <ButtonPrimary
            onClick={() => handleFilterChange(90)}
            className={`px-4 py-2 text-sm sm:text-base ${
              daysFilter === 90
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            90 jours
          </ButtonPrimary>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-lightBorder dark:border-darkBorder">
          {["overview", "users", "commands", "products", "ateliers", "payments", "subscriptions"].map((section) => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`pb-2 px-4 text-sm sm:text-base ${
                selectedSection === section
                  ? "border-b-2 border-blue-500 text-blue-500 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              {section === "overview"
                ? "Aperçu"
                : section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          renderPlaceholder()
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="space-y-6">{renderContent()}</div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;