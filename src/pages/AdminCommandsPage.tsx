import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Utilisation de l’instance axios existante
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { ShoppingCart, Search, Eye, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Commande {
  id: string;
  client: {
    id: string;
    username: string;
    email: string;
  };
  total: string;
  statut: 'en_attente' | 'en_cours' | 'expediee' | 'livree' | 'annulee';
  date: string;
  adresse: {
    nom: string;
    rue: string;
    ville: string;
    code_postal: string;
    pays: string;
  };
  lignes: {
    id: string;
    produit: {
      id: string;
      nom: string;
    };
    quantite: number;
    prix_unitaire: string;
  }[];
}

interface ApiResponse {
  results: Commande[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminCommandsPage: React.FC = () => {
  
  const [commands, setCommands] = useState<Commande[]>([]);
  const [totalCommands, setTotalCommands] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCommand, setSelectedCommand] = useState<Commande | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const commandsPerPage = 10;

  useEffect(() => {
    fetchCommands();
  }, [currentPage, searchQuery, filterStatus]);

  const fetchCommands = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/commandes/', {
        params: {
          page: currentPage,
          per_page: commandsPerPage,
          search: searchQuery || undefined,
          statut: filterStatus !== 'all' ? filterStatus : undefined,
        },
      });
      setCommands(response.data.results);
      setTotalCommands(response.data.count);
      setTotalPages(Math.ceil(response.data.count / commandsPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des commandes:', err.response?.data);
      setError('Erreur lors du chargement des commandes.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openDetailsModal = (command: Commande) => {
    setSelectedCommand(command);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCommand(null);
  };

  const openCancelModal = (command: Commande) => {
    setSelectedCommand(command);
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedCommand(null);
  };

  const handleCancelCommand = async () => {
    if (!selectedCommand) return;

    try {
      await api.post(`/commandes/${selectedCommand.id}/cancel/`);
      setIsCancelModalOpen(false);
      fetchCommands();
    } catch (err: any) {
      console.error('Erreur lors de l’annulation de la commande:', err.response?.data);
      setError('Erreur lors de l’annulation de la commande.');
    }
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
          <ShoppingCart className="h-6 w-6 mr-2" /> Gestion des Commandes
        </h1>

        {/* Filtres et Recherche */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
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
            <select
              value={filterStatus}
              onChange={handleFilterStatus}
              className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="expediee">Expédiée</option>
              <option value="livree">Livrée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Utilisateur</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Email</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Total</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Statut</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Date</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commands.map((command) => (
                <tr key={command.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{command.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{command.client.username}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{command.client.email}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{command.total} FCFA</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        command.statut === 'en_attente'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : command.statut === 'en_cours'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : command.statut === 'expediee'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : command.statut === 'livree'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {command.statut.charAt(0).toUpperCase() + command.statut.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(command.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary
                      onClick={() => openDetailsModal(command)}
                      className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                    >
                      <Eye className="h-4 w-4 mr-1" /> Détails
                    </ButtonPrimary>
                    {['en_attente', 'en_cours'].includes(command.statut) && (
                      <ButtonPrimary
                        onClick={() => openCancelModal(command)}
                        className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm"
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Annuler
                      </ButtonPrimary>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * commandsPerPage + 1} à{' '}
            {Math.min(currentPage * commandsPerPage, totalCommands)} sur {totalCommands} commandes
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

        {/* Modal pour voir les détails */}
        {isDetailsModalOpen && selectedCommand && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-2xl">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2" /> Détails de la Commande #{selectedCommand.id}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Utilisateur :</strong> {selectedCommand.client.username} ({selectedCommand.client.email})
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Total :</strong> {selectedCommand.total} FCFA
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Statut :</strong> {selectedCommand.statut.charAt(0).toUpperCase() + selectedCommand.statut.slice(1)}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Date :</strong> {new Date(selectedCommand.date).toLocaleString()}
                  </p>
                </div>
                { selectedCommand.adresse && (
                    <div>
                    <h3 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Adresse de livraison</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedCommand.adresse.nom}</p>
                    <p className="text-gray-700 dark:text-gray-300">{selectedCommand.adresse.rue}</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedCommand.adresse.ville}, {selectedCommand.adresse.code_postal}, {selectedCommand.adresse.pays}
                    </p>
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  <h3 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Produits</h3>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-lightCard dark:bg-darkCard">
                      <tr className="border-b border-lightBorder dark:border-darkBorder">
                        <th className="py-3 px-4 text-lightText dark:text-darkText">ID Produit</th>
                        <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                        <th className="py-3 px-4 text-lightText dark:text-darkText">Quantité</th>
                        <th className="py-3 px-4 text-lightText dark:text-darkText">Prix Unitaire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCommand.lignes.map((ligne) => (
                        <tr key={ligne.id} className="border-b border-lightBorder dark:border-darkBorder">
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{ligne.produit.id}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{ligne.produit.nom}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{ligne.quantite}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{ligne.prix_unitaire} FCFA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <ButtonPrimary
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Fermer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}

        {/* Modal pour annuler une commande */}
        {isCancelModalOpen && selectedCommand && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <XCircle className="h-5 w-5 mr-2" /> Annuler la Commande
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir annuler la commande #{selectedCommand.id} de{' '}
                <span className="font-medium">{selectedCommand.client.email}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary
                  type="button"
                  onClick={closeCancelModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleCancelCommand}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Confirmer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCommandsPage;