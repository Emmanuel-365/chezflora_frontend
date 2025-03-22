import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, updateUser } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Users, Search, XCircle, CheckCircle, ChevronLeft, ChevronRight, Ban } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  is_banned: boolean;
  date_creation: string;
  last_login: string | null;
}

interface ApiResponse {
  results: User[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminUserBansPage: React.FC = () => {
  
  const [bannedUsers, setBannedUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUnbanModalOpen, setIsUnbanModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const usersPerPage = 10;

  useEffect(() => {
    fetchBannedUsers();
  }, [currentPage, searchQuery]);

  const fetchBannedUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        page: currentPage,
        per_page: usersPerPage,
        search: searchQuery || undefined,
        is_banned: 'true', // Filtrer uniquement les utilisateurs bannis
      });
      setBannedUsers(response.data.results);
      setTotalUsers(response.data.count);
      setTotalPages(Math.ceil(response.data.count / usersPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des utilisateurs bannis:', err.response?.data);
      setError('Erreur lors du chargement des utilisateurs bannis.');
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

  const openUnbanModal = (user: User) => {
    setSelectedUser(user);
    setIsUnbanModalOpen(true);
  };

  const closeUnbanModal = () => {
    setIsUnbanModalOpen(false);
    setSelectedUser(null);
  };

  const handleUnbanUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, { is_banned: false, is_active: true });
      setIsUnbanModalOpen(false);
      fetchBannedUsers();
    } catch (err: any) {
      console.error('Erreur lors du dé-bannissement de l’utilisateur:', err.response?.data);
      setError('Erreur lors du dé-bannissement de l’utilisateur.');
    }
  };

  const openBanModal = () => {
    setIsBanModalOpen(true);
  };

  const closeBanModal = () => {
    setIsBanModalOpen(false);
    setSelectedUser(null);
  };

  const handleBanUser = async (email: string) => {
    try {
      const response = await getUsers({ search: email });
      const userToBan = response.data.results.find((u: User) => u.email === email);
      if (!userToBan) {
        setError('Utilisateur non trouvé.');
        return;
      }
      if (userToBan.is_banned) {
        setError('Cet utilisateur est déjà banni.');
        return;
      }
      await updateUser(userToBan.id, { is_banned: true, is_active: false });
      setIsBanModalOpen(false);
      fetchBannedUsers();
    } catch (err: any) {
      console.error('Erreur lors du bannissement de l’utilisateur:', err.response?.data);
      setError('Erreur lors du bannissement de l’utilisateur.');
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
          <Ban className="h-6 w-6 mr-2" /> Gestion des Bannissements
        </h1>

        {/* Recherche et Bouton Bannir */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par email ou nom..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ButtonPrimary
            onClick={openBanModal}
            className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 flex items-center"
          >
            <Ban className="h-5 w-5 mr-2" /> Bannir un utilisateur
          </ButtonPrimary>
        </div>

        {/* Liste des utilisateurs bannis */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Email</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Rôle</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Statut</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Créé le</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Dernière connexion</th>
                <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bannedUsers.map((user) => (
                <tr key={user.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.username}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.role}</td>
                  <td className="py-3 px-4">
                    {user.is_banned && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      <XCircle className="h-4 w-4 mr-1" /> Banni
                    </span>)}
                  </td>
                    
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(user.date_creation).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Jamais'}
                  </td>
                  <td className="py-3 px-4">
                    {user.is_banned && 
                        (
                            <ButtonPrimary
                      onClick={() => openUnbanModal(user)}
                      className="px-2 py-1 bg-green-500 text-white hover:bg-green-600 flex items-center text-sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Lever le ban
                    </ButtonPrimary>
                        )
                    }
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * usersPerPage + 1} à{' '}
            {Math.min(currentPage * usersPerPage, totalUsers)} sur {totalUsers} utilisateurs bannis
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

        {/* Modal pour lever un ban */}
        {isUnbanModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" /> Lever le bannissement
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir lever le bannissement de <span className="font-medium">{selectedUser.email}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary
                  type="button"
                  onClick={closeUnbanModal}
                  className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleUnbanUser}
                  className="px-4 py-2 bg-green-500 text-white hover:bg-green-600"
                >
                  Confirmer
                </ButtonPrimary>
              </div>
            </div>
          </div>
        )}

        {/* Modal pour bannir un utilisateur */}
        {isBanModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Ban className="h-5 w-5 mr-2" /> Bannir un utilisateur
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const email = (e.target as any).email.value;
                  handleBanUser(email);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Email de l’utilisateur</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary
                    type="button"
                    onClick={closeBanModal}
                    className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-red-500 text-white hover:bg-red-600">
                    Bannir
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUserBansPage;