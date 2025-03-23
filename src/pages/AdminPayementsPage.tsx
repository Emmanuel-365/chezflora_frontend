"use client";

import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { DollarSign, Search, Edit, Trash2, ChevronLeft, ChevronRight, BarChart2 } from "lucide-react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";

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
  const [loadingPaiements, setLoadingPaiements] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorPaiements, setErrorPaiements] = useState<string | null>(null);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const paiementsPerPage = 10;

  useEffect(() => {
    fetchPaiements();
    fetchStats();
  }, [currentPage, searchQuery]);

  const fetchPaiements = async () => {
    setLoadingPaiements(true);
    try {
      const response = await api.get<ApiResponse>("/paiements/", {
        params: { page: currentPage, per_page: paiementsPerPage, search: searchQuery || undefined },
      });
      setPaiements(response.data.results || []);
      setTotalPaiements(response.data.count || 0);
      setTotalPages(Math.ceil((response.data.count || 0) / paiementsPerPage));
      setLoadingPaiements(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des paiements:", err.response?.data);
      setErrorPaiements("Erreur lors du chargement des paiements.");
      setPaiements([]);
      setLoadingPaiements(false);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await api.get<Stats>("/paiements/stats/", { params: { days: 30 } });
      setStats(response.data);
      setLoadingStats(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des statistiques:", err.response?.data);
      setErrorStats("Erreur lors du chargement des statistiques.");
      setStats(null);
      setLoadingStats(false);
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

  const handleSimulerPaiement = async (paiementId: string) => {
    try {
      await api.post(`/paiements/${paiementId}/simuler/`);
      fetchPaiements();
    } catch (err: any) {
      console.error("Erreur lors de la simulation du paiement:", err.response?.data);
      setErrorPaiements("Erreur lors de la simulation du paiement.");
    }
  };

  const handleRembourserPaiement = async (paiementId: string) => {
    try {
      await api.post(`/paiements/${paiementId}/rembourser/`);
      fetchPaiements();
    } catch (err: any) {
      console.error("Erreur lors du remboursement du paiement:", err.response?.data);
      setErrorPaiements("Erreur lors du remboursement du paiement.");
    }
  };

  const renderChart = (title: string, labels: string[], data: number[], type: "bar" | "line" = "bar") => {
    const chartData = {
      labels,
      datasets: [
        {
          label: title,
          data,
          backgroundColor: type === "bar" ? "rgba(54, 162, 235, 0.6)" : undefined,
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
          fill: false,
        },
      ],
    };
    const options = {
      responsive: true,
      plugins: { legend: { position: "top" as const }, title: { display: true, text: title } },
    };
    return type === "bar" ? <Bar data={chartData} options={options} /> : <Line data={chartData} options={options} />;
  };

  const renderStatsPlaceholder = () => (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow animate-pulse">
          <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          {Array.from({ length: index % 2 === 0 ? 7 : 5 }).map((_, i) => (
            <div key={i} className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderPaiementsPlaceholder = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-lightCard dark:bg-darkCard">
          <tr className="border-b border-lightBorder dark:border-darkBorder">
            {["ID", "Type", "Méthode", "Montant", "Statut", "Date", "Actions"].map((header) => (
              <th key={header} className="py-3 px-4">
                <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index} className="border-b border-lightBorder dark:border-darkBorder animate-pulse">
              <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <DollarSign className="h-6 w-6 mr-2" /> Gestion des Paiements
        </h1>

        {/* Statistiques */}
        {loadingStats ? (
          renderStatsPlaceholder()
        ) : errorStats ? (
          <div className="text-center py-8 text-red-500">{errorStats}</div>
        ) : stats ? (
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
                "Paiements par Jour (30 derniers jours)",
                stats.last_30_days.by_day.map((item) => item.date),
                stats.last_30_days.by_day.map((item) => item.count),
                "line"
              )}
            </div>
            <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
              {renderChart(
                "Montant par Type de Transaction",
                stats.by_type_transaction.map((item) => item.type),
                stats.by_type_transaction.map((item) => parseFloat(item.total))
              )}
            </div>
            <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
              {renderChart(
                "Montant par Statut",
                stats.by_status.map((item) => item.status),
                stats.by_status.map((item) => parseFloat(item.total))
              )}
            </div>
            <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
              {renderChart(
                "Montant par Méthode",
                stats.by_method.map((item) => item.method),
                stats.by_method.map((item) => parseFloat(item.total))
              )}
            </div>
            <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
              {renderChart(
                "Top 5 Clients par Montant",
                stats.top_clients.map((item) => item.client),
                stats.top_clients.map((item) => parseFloat(item.total))
              )}
            </div>
          </div>
        ) : null}

        {/* Recherche */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par type ou méthode..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
            />
          </div>
        </div>

        {/* Liste des paiements */}
        {loadingPaiements ? (
          renderPaiementsPlaceholder()
        ) : errorPaiements ? (
          <div className="text-center py-8 text-red-500">{errorPaiements}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-lightCard dark:bg-darkCard">
                <tr className="border-b border-lightBorder dark:border-darkBorder">
                  <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Type</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Méthode</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Montant</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Statut</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Date</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paiements.length > 0 ? (
                  paiements.map((paiement) => (
                    <tr
                      key={paiement.id}
                      className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{paiement.id}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{paiement.type_transaction}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{paiement.methode_paiement || "N/A"}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{paiement.montant} FCFA</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            paiement.statut === "effectue"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : paiement.statut === "rembourse"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {paiement.statut === "effectue" ? "Effectué" : paiement.statut === "rembourse" ? "Remboursé" : "Simulé"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {new Date(paiement.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        {paiement.statut === "simule" && (
                          <ButtonPrimary
                            onClick={() => handleSimulerPaiement(paiement.id)}
                            className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                          >
                            <Edit className="h-4 w-4 mr-1" /> Simuler
                          </ButtonPrimary>
                        )}
                        {["simule", "effectue"].includes(paiement.statut) && (
                          <ButtonPrimary
                            onClick={() => handleRembourserPaiement(paiement.id)}
                            className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Rembourser
                          </ButtonPrimary>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                      Aucun paiement trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * paiementsPerPage + 1} à{" "}
            {Math.min(currentPage * paiementsPerPage, totalPaiements)} sur {totalPaiements} paiements
          </p>
          <div className="flex gap-2">
            <ButtonPrimary
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
            >
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPaiementsPage;