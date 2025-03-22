import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { ShoppingCart, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface LigneCommande {
  id: string;
  commande: {
    id: string;
    client: { username: string; email: string };
    total: string;
  };
  produit: { id: string; nom: string };
  quantite: number;
  prix_unitaire: string;
}

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