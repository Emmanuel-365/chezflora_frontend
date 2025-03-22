import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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