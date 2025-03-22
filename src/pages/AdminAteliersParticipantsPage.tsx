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

interface ApiResponse {
  results: Participant[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminAteliersParticipantsPage: React.FC = () => {
  const navigate = useNavigate();
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