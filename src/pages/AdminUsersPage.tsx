import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api'; // Importez depuis api.ts
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Users, Search, Filter, Edit, Trash2, PlusCircle, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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
  results: User[]; // Avec pagination
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminUsersPage: React.FC = () => {
  
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', username: '', password: '', role: 'client' });
  const [editUser, setEditUser] = useState({ email: '', username: '', role: '', is_active: true, is_banned: false });
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, filterRole, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const statusFilter = filterStatus === 'all' ? undefined : filterStatus === 'active' ? 'true' : 'false';
      const response = await getUsers({
        page: currentPage,
        per_page: usersPerPage,
        search: searchQuery || undefined,
        role: filterRole !== 'all' ? filterRole : undefined,
        is_active: statusFilter,
      });
      setUsers(response.data.results);
      setTotalUsers(response.data.count);
      setTotalPages(Math.ceil(response.data.count / usersPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error('Erreur lors du chargement des utilisateurs:', err.response?.data);
      setError('Erreur lors du chargement des utilisateurs.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRole(e.target.value);
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

  const openCreateModal = () => {
    setNewUser({ email: '', username: '', password: '', role: 'client' });
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(newUser);
      setIsCreateModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Erreur lors de la création de l’utilisateur:', err.response?.data);
      setError('Erreur lors de la création de l’utilisateur.');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      email: user.email,
      username: user.username,
      role: user.role,
      is_active: user.is_active,
      is_banned: user.is_banned,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, editUser);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de l’utilisateur:', err.response?.data);
      setError('Erreur lors de la mise à jour de l’utilisateur.');
    }
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Erreur lors de la suppression de l’utilisateur:', err.response?.data);
      setError('Erreur lors de la suppression de l’utilisateur.');
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
          <Users className="h-6 w-6 mr-2" /> Gestion des Utilisateurs
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
                placeholder="Rechercher par email ou nom..."
                className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={handleFilterRole}
                className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les rôles</option>
                <option value="admin">Admin</option>
                <option value="client">Client</option>
              </select>
              <select
                value={filterStatus}
                onChange={handleFilterStatus}
                className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>
          <ButtonPrimary
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un utilisateur
          </ButtonPrimary>
        </div>

        {/* Liste des utilisateurs */}
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
              {users.map((user) => (
                <tr key={user.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.username}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.role}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_active && !user.is_banned
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : user.is_banned
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {user.is_active && !user.is_banned ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1" />
                      )}
                      {user.is_active && !user.is_banned ? 'Actif' : user.is_banned ? 'Banni' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(user.date_creation).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Jamais'}
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-1 text-blue-500 hover:text-blue-700"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(user)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
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
            {Math.min(currentPage * usersPerPage, totalUsers)} sur {totalUsers} utilisateurs
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

        {/* Modal de création */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un utilisateur
              </h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom d’utilisateur</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Rôle</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary
                    type="button"
                    onClick={closeCreateModal}
                    className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
                    Créer
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal d’édition */}
        {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier l’utilisateur
              </h2>
              <form onSubmit={handleEditUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom d’utilisateur</label>
                  <input
                    type="text"
                    value={editUser.username}
                    onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Email</label>
                  <input
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Rôle</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input
                    type="checkbox"
                    checked={editUser.is_active}
                    onChange={(e) => setEditUser({ ...editUser, is_active: e.target.checked })}
                    className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Banni</label>
                  <input
                    type="checkbox"
                    checked={editUser.is_banned}
                    onChange={(e) => setEditUser({ ...editUser, is_banned: e.target.checked })}
                    className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded"
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

        {/* Modal de suppression */}
        {isDeleteModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer l’utilisateur
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer l’utilisateur <span className="font-medium">{selectedUser.email}</span> ? Cette action est irréversible.
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
                  onClick={handleDeleteUser}
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

export default AdminUsersPage;