import React, { useState, useEffect, useContext } from "react";
import api from "../services/api";
import AdminLayout, { ThemeContext } from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { MessageSquare, Search, Edit, ChevronLeft, ChevronRight } from "lucide-react";

interface Commentaire {
  id: string;
  article: string;
  client: string;
  texte: string;
  date: string;
  parent: string | null;
  is_active: boolean;
}

interface ApiResponse {
  results: Commentaire[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminCommentairesPage: React.FC = () => {
  const theme = useContext(ThemeContext); // Récupération du thème via le contexte
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [totalCommentaires, setTotalCommentaires] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedCommentaire, setSelectedCommentaire] = useState<Commentaire | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCommentaire, setEditCommentaire] = useState({ texte: "", is_active: true });
  const commentairesPerPage = 10;

  useEffect(() => {
    fetchCommentaires();
  }, [currentPage, searchQuery, filterStatus]);

  const fetchCommentaires = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>("/commentaires/", {
        params: {
          page: currentPage,
          per_page: commentairesPerPage,
          search: searchQuery || undefined,
          is_active: filterStatus === "all" ? undefined : filterStatus === "active",
        },
      });
      setCommentaires(response.data.results);
      setTotalCommentaires(response.data.count);
      setTotalPages(Math.ceil(response.data.count / commentairesPerPage));
      setLoading(false);
    } catch (err: any) {
      setError("Erreur lors du chargement des commentaires.");
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

  const openEditModal = (commentaire: Commentaire) => {
    setSelectedCommentaire(commentaire);
    setEditCommentaire({ texte: commentaire.texte, is_active: commentaire.is_active });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCommentaire(null);
  };

  const handleEditCommentaire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommentaire) return;
    try {
      await api.put(`/commentaires/${selectedCommentaire.id}/`, editCommentaire);
      setIsEditModalOpen(false);
      fetchCommentaires();
    } catch (err: any) {
      setError("Erreur lors de la mise à jour du commentaire.");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <MessageSquare className="h-6 w-6 mr-2" /> Gestion des Commentaires
        </h1>

        {loading ? (
          <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Rechercher par texte..."
                    className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={handleFilterStatus}
                  className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-lightCard dark:bg-darkCard">
                  <tr className="border-b border-lightBorder dark:border-darkBorder">
                    <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Article</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Client</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Texte</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Date</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Statut</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commentaires.map((commentaire) => (
                    <tr
                      key={commentaire.id}
                      className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{commentaire.id}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{commentaire.article}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{commentaire.client}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300 truncate max-w-xs">
                        {commentaire.texte}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {new Date(commentaire.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            commentaire.is_active
                              ? theme === "light"
                                ? "bg-green-100 text-green-800"
                                : "bg-green-900 text-green-200"
                              : theme === "light"
                              ? "bg-red-100 text-red-800"
                              : "bg-red-900 text-red-200"
                          }`}
                        >
                          {commentaire.is_active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <ButtonPrimary
                          onClick={() => openEditModal(commentaire)}
                          className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                        >
                          <Edit className="h-4 w-4 mr-1" /> Modifier
                        </ButtonPrimary>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de {(currentPage - 1) * commentairesPerPage + 1} à{" "}
                {Math.min(currentPage * commentairesPerPage, totalCommentaires)} sur {totalCommentaires}{" "}
                commentaires
              </p>
              <div className="flex gap-2">
                <ButtonPrimary
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 ${
                    theme === "light"
                      ? "bg-lightCard text-gray-700 hover:bg-gray-300"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  } disabled:opacity-50 flex items-center`}
                >
                  <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 ${
                    theme === "light"
                      ? "bg-lightCard text-gray-700 hover:bg-gray-300"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  } disabled:opacity-50 flex items-center`}
                >
                  Suivant <ChevronRight className="h-5 w-5 ml-1" />
                </ButtonPrimary>
              </div>
            </div>

            {isEditModalOpen && selectedCommentaire && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div
                  className={`p-6 rounded-lg shadow-lg w-full max-w-md ${
                    theme === "light" ? "bg-lightBg" : "bg-darkBg"
                  }`}
                >
                  <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                    <Edit className="h-5 w-5 mr-2" /> Modifier le commentaire
                  </h2>
                  <form onSubmit={handleEditCommentaire} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                        Texte
                      </label>
                      <textarea
                        value={editCommentaire.texte}
                        onChange={(e) => setEditCommentaire({ ...editCommentaire, texte: e.target.value })}
                        className={`w-full px-3 py-2 border ${
                          theme === "light" ? "border-lightBorder" : "border-darkBorder"
                        } rounded-lg ${
                          theme === "light" ? "bg-lightCard" : "bg-darkCard"
                        } text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                        Actif
                      </label>
                      <input
                        type="checkbox"
                        checked={editCommentaire.is_active}
                        onChange={(e) => setEditCommentaire({ ...editCommentaire, is_active: e.target.checked })}
                        className={`h-5 w-5 text-blue-500 focus:ring-blue-500 ${
                          theme === "light" ? "border-lightBorder" : "border-darkBorder"
                        } rounded`}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <ButtonPrimary
                        type="button"
                        onClick={closeEditModal}
                        className={`px-4 py-2 ${
                          theme === "light"
                            ? "bg-lightCard text-gray-700 hover:bg-gray-300"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        Annuler
                      </ButtonPrimary>
                      <ButtonPrimary
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600"
                      >
                        Enregistrer
                      </ButtonPrimary>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCommentairesPage;