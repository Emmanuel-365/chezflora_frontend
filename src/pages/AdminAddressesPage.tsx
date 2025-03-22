import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Utilisation de l’instance axios existante
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { MapPin, Search, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Address {
  id: string;
  client: {
    id: string;
    username: string;
    email: string;
  };
  nom: string;
  rue: string;
  ville: string;
  code_postal: string;
  pays: string;
}

interface ApiResponse {
  results: Address[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminAddressesPage: React.FC = () => {
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [totalAddresses, setTotalAddresses] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editAddress, setEditAddress] = useState({
    nom: '',
    rue: '',
    ville: '',
    code_postal: '',
    pays: '',
  });
  const addressesPerPage = 10;

  useEffect(() => {
    fetchAddresses();
  }, [currentPage, searchQuery]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/adresses/', {
        params: {
          page: currentPage,
          per_page: addressesPerPage,
          search: searchQuery || undefined, // Recherche par email ou nom d’utilisateur du client
        },
      });
      setAddresses(response.data.results);
      setTotalAddresses(response.data.count);
      setTotalPages(Math.ceil(response.data.count / addressesPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des adresses:', err.response?.data);
      setError('Erreur lors du chargement des adresses.');
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

  const openEditModal = (address: Address) => {
    setSelectedAddress(address);
    setEditAddress({
      nom: address.nom,
      rue: address.rue,
      ville: address.ville,
      code_postal: address.code_postal,
      pays: address.pays,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedAddress(null);
  };

  const handleEditAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) return;

    try {
      await api.put(`/adresses/${selectedAddress.id}/`, editAddress);
      setIsEditModalOpen(false);
      fetchAddresses();
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de l’adresse:', err.response?.data);
      setError('Erreur lors de la mise à jour de l’adresse.');
    }
  };

  const openDeleteModal = (address: Address) => {
    setSelectedAddress(address);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedAddress(null);
  };

  const handleDeleteAddress = async () => {
    if (!selectedAddress) return;

    try {
      await api.delete(`/adresses/${selectedAddress.id}/`);
      setIsDeleteModalOpen(false);
      fetchAddresses();
    } catch (err: any) {
      console.error('Erreur lors de la suppression de l’adresse:', err.response?.data);
      setError('Erreur lors de la suppression de l’adresse.');
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
          <MapPin className="h-6 w-6 mr-2" /> Gestion des Adresses
        </h1>

        {/* Recherche */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par email ou nom d’utilisateur..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Liste des adresses */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Utilisateur</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Email</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Rue</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Ville</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Code Postal</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Pays</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
              </tr>
            </thead>
            <tbody>
              {addresses.map((address) => (
                <tr key={address.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{address.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{address.client.username}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{address.client.email}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{address.nom}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{address.rue}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{address.ville}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{address.code_postal}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{address.pays}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary
                      onClick={() => openEditModal(address)}
                      className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                    <ButtonPrimary
                      onClick={() => openDeleteModal(address)}
                      className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                    </ButtonPrimary>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * addressesPerPage + 1} à{' '}
            {Math.min(currentPage * addressesPerPage, totalAddresses)} sur {totalAddresses} adresses
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

        {/* Modal pour modifier une adresse */}
        {isEditModalOpen && selectedAddress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier l’adresse
              </h2>
              <form onSubmit={handleEditAddress} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                  <input
                    type="text"
                    value={editAddress.nom}
                    onChange={(e) => setEditAddress({ ...editAddress, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Rue</label>
                  <input
                    type="text"
                    value={editAddress.rue}
                    onChange={(e) => setEditAddress({ ...editAddress, rue: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Ville</label>
                  <input
                    type="text"
                    value={editAddress.ville}
                    onChange={(e) => setEditAddress({ ...editAddress, ville: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Code Postal</label>
                  <input
                    type="text"
                    value={editAddress.code_postal}
                    onChange={(e) => setEditAddress({ ...editAddress, code_postal: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Pays</label>
                  <input
                    type="text"
                    value={editAddress.pays}
                    onChange={(e) => setEditAddress({ ...editAddress, pays: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
                    Enregistrer
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal pour supprimer une adresse */}
        {isDeleteModalOpen && selectedAddress && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer l’adresse
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer l’adresse de <span className="font-medium">{selectedAddress.client.email}</span> ({selectedAddress.nom}) ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleDeleteAddress}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Supprimer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAddressesPage;