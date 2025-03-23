"use client";

import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";
import { Package, BarChart2, DollarSign, AlertTriangle } from "lucide-react";

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
      const response = await api.get<ProductStats>("/produits/stats/", { params: { days: daysFilter } });
      setStatsData(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des statistiques des produits:", err.response?.data);
      setError("Erreur lors du chargement des statistiques des produits.");
      setStatsData(null);
      setLoading(false);
    }
  };

  const handleFilterChange = (days: number) => {
    setDaysFilter(days);
  };

  const salesByProductChartData = {
    labels: statsData?.sales_by_product.map((item) => item.nom) || [],
    datasets: [
      {
        label: "Ventes par produit (FCFA)",
        data: statsData?.sales_by_product.map((item) => parseFloat(item.total_sales)) || [],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  };

  const stockByCategoryChartData = {
    labels: statsData?.stock_by_category.map((item) => item.categorie_nom || "Sans catégorie") || [],
    datasets: [
      {
        label: "Stock par catégorie",
        data: statsData?.stock_by_category.map((item) => item.total_stock) || [],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
        fill: true,
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

  const renderStatsPlaceholder = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow animate-pulse">
          <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  );

  const renderChartPlaceholder = () => (
    <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow animate-pulse">
      <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
      <div className="h-48 sm:h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  );

  const renderLowStockPlaceholder = () => (
    <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow animate-pulse">
      <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-lightBg dark:bg-darkBg">
            <tr className="border-b border-lightBorder dark:border-darkBorder">
              <th className="py-3 px-4"><div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div></th>
              <th className="py-3 px-4"><div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div></th>
              <th className="py-3 px-4"><div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 3 }).map((_, index) => (
              <tr key={index} className="border-b border-lightBorder dark:border-darkBorder animate-pulse">
                <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                <td className="py-3 px-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                <td className="py-3 px-4"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <BarChart2 className="h-6 w-6 mr-2" /> Statistiques des Produits
        </h1>

        {/* Filtres */}
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

        {loading ? (
          <>
            {renderStatsPlaceholder()}
            <div className="space-y-6">
              {renderChartPlaceholder()}
              {renderChartPlaceholder()}
              {renderLowStockPlaceholder()}
            </div>
          </>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : statsData ? (
          <>
            {/* Statistiques générales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
                  <Package className="h-5 w-5 mr-2" /> Total Produits
                </h2>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{statsData.total_products}</p>
              </div>
              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
                  <Package className="h-5 w-5 mr-2" /> Produits Actifs
                </h2>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{statsData.active_products}</p>
              </div>
              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" /> Stock Faible
                </h2>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{statsData.low_stock_products}</p>
              </div>
              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" /> Total Ventes ({daysFilter} jours)
                </h2>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{statsData.total_sales} FCFA</p>
              </div>
            </div>

            {/* Graphiques */}
            <div className="space-y-6">
              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Ventes par produit</h2>
                <div className="h-48 sm:h-64">
                  <Bar
                    data={salesByProductChartData}
                    options={{
                      ...chartOptions,
                      plugins: { ...chartOptions.plugins, title: { display: true, text: `Ventes sur ${daysFilter} jours` } },
                    }}
                  />
                </div>
              </div>

              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Stock par catégorie</h2>
                <div className="h-48 sm:h-64">
                  <Line
                    data={stockByCategoryChartData}
                    options={{
                      ...chartOptions,
                      plugins: { ...chartOptions.plugins, title: { display: true, text: "Répartition du stock" } },
                    }}
                  />
                </div>
              </div>

              {/* Liste des produits en stock faible */}
              {statsData.low_stock_details.length > 0 && (
                <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow">
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
                        {statsData.low_stock_details.map((product) => (
                          <tr
                            key={product.id}
                            className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
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
          </>
        ) : (
          <div className="text-center py-16 text-gray-700 dark:text-gray-300">Aucune donnée disponible.</div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProductsStatsPage;