import React, { useState, useEffect, useContext } from "react";
import api from "../services/api";
import AdminLayout, { ThemeContext } from "../components/AdminLayout"; // Import du ThemeContext
import ButtonPrimary from "../components/ButtonPrimary";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";
import { DollarSign } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface RevenueData {
  total_revenue: string;
  revenue_by_day: { date: string; total: string }[];
  revenue_by_status: { statut: string; total: string }[];
}

const AdminCommandsRevenuePage: React.FC = () => {
  const theme = useContext(ThemeContext); // Récupération du thème via le contexte
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
      const response = await api.get("/commandes/revenue/", { params: { days: daysFilter } });
      setRevenueData(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des données de revenus:", err.response?.data);
      setError("Erreur lors du chargement des données de revenus.");
      setLoading(false);
    }
  };

  const handleFilterChange = (days: number) => {
    setDaysFilter(days);
  };

  // Adaptation des couleurs des graphiques en fonction du thème
  const revenueByDayChartData = {
    labels: revenueData ? revenueData.revenue_by_day.map((item) => item.date) : [],
    datasets: [
      {
        label: "Revenus par jour (FCFA)",
        data: revenueData ? revenueData.revenue_by_day.map((item) => parseFloat(item.total)) : [],
        borderColor: theme === "light" ? "#4CAF50" : "#8CC7A1", // Vert clair en mode sombre
        backgroundColor: theme === "light" ? "rgba(76, 175, 80, 0.2)" : "rgba(140, 199, 161, 0.2)",
        fill: true,
      },
    ],
  };

  const revenueByStatusChartData = {
    labels: revenueData ? revenueData.revenue_by_status.map((item) => item.statut) : [],
    datasets: [
      {
        label: "Revenus par statut (FCFA)",
        data: revenueData ? revenueData.revenue_by_status.map((item) => parseFloat(item.total)) : [],
        backgroundColor: theme === "light" ? "#2196F3" : "#A8D5BA", // Bleu clair -> Vert clair en mode sombre
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
    scales: {
      x: { ticks: { color: theme === "light" ? "#374151" : "#D1D5DB" } }, // Gris foncé clair / Gris clair sombre
      y: { ticks: { color: theme === "light" ? "#374151" : "#D1D5DB" } },
    },
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-16 text-red-500">{error}</div>
      </AdminLayout>
    );
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
            className={`px-4 py-2 text-sm sm:text-base ${
              daysFilter === 7
                ? "bg-blue-500 text-white"
                : theme === "light"
                ? "bg-lightCard hover:bg-gray-300"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }`}
          >
            7 jours
          </ButtonPrimary>
          <ButtonPrimary
            onClick={() => handleFilterChange(30)}
            className={`px-4 py-2 text-sm sm:text-base ${
              daysFilter === 30
                ? "bg-blue-500 text-white"
                : theme === "light"
                ? "bg-lightCard hover:bg-gray-300"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }`}
          >
            30 jours
          </ButtonPrimary>
          <ButtonPrimary
            onClick={() => handleFilterChange(90)}
            className={`px-4 py-2 text-sm sm:text-base ${
              daysFilter === 90
                ? "bg-blue-500 text-white"
                : theme === "light"
                ? "bg-lightCard hover:bg-gray-300"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }`}
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
                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: "Répartition par statut" } } }}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCommandsRevenuePage;