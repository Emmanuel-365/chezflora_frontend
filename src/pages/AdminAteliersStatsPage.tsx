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