"use client";

import React, { useState, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Users, BarChart2, XCircle, CheckCircle } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { getUserStats } from "../services/api";

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
    fetchAllData();
  }, [daysFilter]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [dashboardResponse, statsResponse] = await Promise.all([
        getUserStats({ days: daysFilter, endpoint: "/utilisateurs/dashboard/" }),
        getUserStats({ days: daysFilter }),
      ]);
      setDashboardData(dashboardResponse.data || null);
      setStatsData(statsResponse.data || null);
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des données:", err.response?.data);
      setError("Erreur lors du chargement des données ou statistiques.");
      setDashboardData(null);
      setStatsData(null);
      setLoading(false);
    }
  };

  const handleFilterChange = (days: number) => {
    setDaysFilter(days);
  };

  const roleChartData = {
    labels: dashboardData ? Object.keys(dashboardData.users.by_role) : [],
    datasets: [
      {
        label: "Nombre d’utilisateurs par rôle",
        data: dashboardData ? Object.values(dashboardData.users.by_role) : [],
        backgroundColor: "#2196F3",
      },
    ],
  };

  const registrationChartData = {
    labels: statsData ? statsData.registrations_by_day.map((item) => item.date) : [],
    datasets: [
      {
        label: "Inscriptions par jour",
        data: statsData ? statsData.registrations_by_day.map((item) => item.count) : [],
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        fill: true,
      },
    ],
  };

  const loginChartData = {
    labels: statsData ? statsData.logins_by_day.map((item) => item.date) : [],
    datasets: [
      {
        label: "Connexions par jour",
        data: statsData ? statsData.logins_by_day.map((item) => item.count) : [],
        borderColor: "#FF9800",
        backgroundColor: "rgba(255, 152, 0, 0.2)",
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

  const renderPlaceholder = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md animate-pulse">
            <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md animate-pulse">
          <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <BarChart2 className="h-6 w-6 mr-2" /> Statistiques des Utilisateurs
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

        {loading ? (
          renderPlaceholder()
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : dashboardData && statsData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
                  <Users className="h-5 w-5 mr-2" /> Total
                </h2>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{dashboardData.users.total}</p>
              </div>
              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 dark:text-green-400" /> Actifs
                </h2>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{dashboardData.users.active}</p>
              </div>
              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
                  <XCircle className="h-5 w-5 mr-2 text-red-500 dark:text-red-400" /> Bannis
                </h2>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{dashboardData.users.banned}</p>
              </div>
              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
                  <Users className="h-5 w-5 mr-2" /> Nouveaux ({daysFilter} jours)
                </h2>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{dashboardData.users.new_last_7_days}</p>
              </div>
            </div>

            <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-4">Utilisateurs par rôle</h2>
              <div className="h-48 sm:h-64">
                <Bar
                  data={roleChartData}
                  options={{
                    ...chartOptions,
                    plugins: { ...chartOptions.plugins, title: { text: "Répartition par rôle" } },
                  }}
                />
              </div>
            </div>

            <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-4">Inscriptions par jour</h2>
              <div className="h-48 sm:h-64">
                <Line
                  data={registrationChartData}
                  options={{
                    ...chartOptions,
                    plugins: { ...chartOptions.plugins, title: { text: `Inscriptions sur ${daysFilter} jours` } },
                  }}
                />
              </div>
            </div>

            <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-4">Connexions par jour</h2>
              <div className="h-48 sm:h-64">
                <Line
                  data={loginChartData}
                  options={{
                    ...chartOptions,
                    plugins: { ...chartOptions.plugins, title: { text: `Connexions sur ${daysFilter} jours` } },
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-700 dark:text-gray-300">Aucune donnée disponible.</div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUserStatsPage;