"use client";

import React, { useState, useEffect } from "react";
import { getUsers, updateUser } from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { Search, XCircle, CheckCircle, ChevronLeft, ChevronRight, Ban } from "lucide-react";
import { ModalContainer, ModalBody, ModalFooter } from "../components/ModalContainer";

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

// interface ApiResponse {
//   results: User[];
//   count: number;
//   next: string | null;
//   previous: string | null;
// }

const AdminUserBansPage: React.FC = () => {
  const [bannedUsers, setBannedUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUnbanModalOpen, setIsUnbanModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [banEmail, setBanEmail] = useState("");
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
        is_banned: "true", // Filtrer uniquement les utilisateurs bannis
      });
      setBannedUsers(response.data.results || []);
      setTotalUsers(response.data.count || 0);
      setTotalPages(Math.ceil((response.data.count || 0) / usersPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des utilisateurs bannis:", err.response?.data);
      setError("Erreur lors du chargement des utilisateurs bannis.");
      setBannedUsers([]);
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
      closeUnbanModal();
      fetchBannedUsers();
    } catch (err: any) {
      console.error("Erreur lors du dé-bannissement de l’utilisateur:", err.response?.data);
      setError("Erreur lors du dé-bannissement de l’utilisateur.");
    }
  };

  const openBanModal = () => {
    setBanEmail("");
    setIsBanModalOpen(true);
  };

  const closeBanModal = () => {
    setIsBanModalOpen(false);
    setBanEmail("");
    setSelectedUser(null);
  };

  const handleBanUser = async (e: React.FormEvent | MouseEvent | undefined) => {
    e && e.preventDefault();
    try {
      const response = await getUsers({ search: banEmail });
      const userToBan = response.data.results.find((u: User) => u.email === banEmail);
      if (!userToBan) {
        setError("Utilisateur non trouvé.");
        return;
      }
      if (userToBan.is_banned) {
        setError("Cet utilisateur est déjà banni.");
        return;
      }
      await updateUser(userToBan.id, { is_banned: true, is_active: false });
      closeBanModal();
      fetchBannedUsers();
    } catch (err: any) {
      console.error("Erreur lors du bannissement de l’utilisateur:", err.response?.data);
      setError("Erreur lors du bannissement de l’utilisateur.");
    }
  };

  const renderUsersPlaceholder = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-lightCard dark:bg-darkCard">
          <tr className="border-b border-lightBorder dark:border-darkBorder">
            {["ID", "Nom", "Email", "Rôle", "Statut", "Créé le", "Dernière connexion", "Actions"].map((header) => (
              <th key={header} className="py-3 px-4">
                <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index} className="border-b border-lightBorder dark:border-darkBorder animate-pulse">
              <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <Ban className="h-6 w-6 mr-2" /> Gestion des Bannissements
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par email ou nom..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
            />
          </div>
          <ButtonPrimary
            onClick={openBanModal}
            className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 flex items-center"
          >
            <Ban className="h-5 w-5 mr-2" /> Bannir un utilisateur
          </ButtonPrimary>
        </div>

        {loading ? (
          renderUsersPlaceholder()
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : bannedUsers.length > 0 ? (
          <>
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
                    <tr
                      key={user.id}
                      className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.id}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.username}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.role}</td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Banni
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {new Date(user.date_creation).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Jamais"}
                      </td>
                      <td className="py-3 px-4">
                        <ButtonPrimary
                          onClick={() => openUnbanModal(user)}
                          className="px-2 py-1 bg-green-500 text-white hover:bg-green-600 flex items-center text-sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Lever le ban
                        </ButtonPrimary>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de {(currentPage - 1) * usersPerPage + 1} à{" "}
                {Math.min(currentPage * usersPerPage, totalUsers)} sur {totalUsers} utilisateurs bannis
              </p>
              <div className="flex gap-2">
                <ButtonPrimary
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center"
                >
                  Suivant <ChevronRight className="h-5 w-5 ml-1" />
                </ButtonPrimary>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-700 dark:text-gray-300">Aucun utilisateur banni trouvé.</div>
        )}

        {/* Modal pour lever un ban */}
        <ModalContainer isOpen={isUnbanModalOpen} onClose={closeUnbanModal} title="Lever le bannissement" size="sm">
          {selectedUser && (
            <>
              <ModalBody>
                <p className="text-lightText dark:text-darkText">
                  Êtes-vous sûr de vouloir lever le bannissement de{" "}
                  <span className="font-medium">{selectedUser.email}</span> ?
                </p>
              </ModalBody>
              <ModalFooter>
                <ButtonPrimary
                  onClick={closeUnbanModal}
                  className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleUnbanUser}
                  className="px-4 py-2 bg-green-500 text-white hover:bg-green-600"
                >
                  Confirmer
                </ButtonPrimary>
              </ModalFooter>
            </>
          )}
        </ModalContainer>

        {/* Modal pour bannir un utilisateur */}
        <ModalContainer isOpen={isBanModalOpen} onClose={closeBanModal} title="Bannir un utilisateur" size="sm">
          <ModalBody>
            <form onSubmit={handleBanUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                  Email de l’utilisateur
                </label>
                <input
                  type="email"
                  value={banEmail}
                  onChange={(e) => setBanEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                  required
                />
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <ButtonPrimary
              onClick={closeBanModal}
              className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Annuler
            </ButtonPrimary>
            <ButtonPrimary
              onClick={(e) => handleBanUser(e)}
              className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
            >
              Bannir
            </ButtonPrimary>
          </ModalFooter>
        </ModalContainer>
      </div>
    </AdminLayout>
  );
};

export default AdminUserBansPage;