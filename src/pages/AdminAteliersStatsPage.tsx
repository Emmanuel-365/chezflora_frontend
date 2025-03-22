import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { BarChart2, Calendar, DollarSign } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AtelierStats {
  total_ateliers: number;
  active_ateliers: number;
  total_revenus: string;
  inscriptions_by_atelier: { atelier__nom: string; total: number }[];
}

const Spinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" aria-label="Chargement en cours" />
);

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
      const response = await api.get<AtelierStats>("/ateliers/stats/", { params: { days: daysFilter } });
      setStatsData(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des statistiques des ateliers:", err.response?.data);
      setError("Erreur lors du chargement des statistiques des ateliers.");
      setStatsData(null); // Réinitialiser à null en cas d'erreur
      setLoading(false);
    }
  };

  const handleFilterChange = (days: number) => {
    setDaysFilter(days);
  };

  const inscriptionsChartData = {
    labels: statsData?.inscriptions_by_atelier.map((item) => item.atelier__nom) || [],
    datasets: [
      {
        label: "Inscriptions par atelier",
        data: statsData?.inscriptions_by_atelier.map((item) => item.total) || [],
        backgroundColor: "#2196F3",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: `Inscriptions sur ${daysFilter} jours` },
    },
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <BarChart2 className="h-6 w-6 mr-2" /> Statistiques des Ateliers
        </h1>

        {error && <div className="text-center py-4 text-red-500">{error}</div>}

        <div className="mb-6 flex flex-wrap gap-2">
          <ButtonPrimary
            onClick={() => handleFilterChange(7)}
            className={`px-4 py-2 ${daysFilter === 7 ? "bg-blue-500 text-white" : "bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"}`}
          >
            7 jours
          </ButtonPrimary>
          <ButtonPrimary
            onClick={() => handleFilterChange(30)}
            className={`px-4 py-2 ${daysFilter === 30 ? "bg-blue-500 text-white" : "bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"}`}
          >
            30 jours
          </ButtonPrimary>
          <ButtonPrimary
            onClick={() => handleFilterChange(90)}
            className={`px-4 py-2 ${daysFilter === 90 ? "bg-blue-500 text-white" : "bg-lightCard dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"}`}
          >
            90 jours
          </ButtonPrimary>
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" /> Total Ateliers
                </h2>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{statsData?.total_ateliers ?? 0}</p>
              </div>
              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" /> Ateliers Actifs
                </h2>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{statsData?.active_ateliers ?? 0}</p>
              </div>
              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" /> Total Revenus
                </h2>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {statsData?.total_revenus ? `${statsData.total_revenus} FCFA` : "0 FCFA"}
                </p>
              </div>
            </div>

            <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-4">Inscriptions par atelier</h2>
              {statsData?.inscriptions_by_atelier.length ? (
                <div className="h-80">
                  <Bar data={inscriptionsChartData} options={chartOptions} />
                </div>
              ) : (
                <p className="text-center text-gray-700 dark:text-gray-300">Aucune inscription à afficher.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAteliersStatsPage;