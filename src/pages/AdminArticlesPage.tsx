"use client";

import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { FileText, Search, Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { ModalContainer, ModalBody, ModalFooter } from "../components/ModalContainer";
import ReactQuill from "react-quill-new"; // Utilisation de react-quill-new
import "react-quill-new/dist/quill.snow.css"; // Chemin mis à jour pour les styles

interface Article {
  id: string;
  titre: string;
  contenu: string;
  cover: string | null;
  auteur: string;
  date_publication: string;
  is_active: boolean;
}

interface ApiResponse {
  results: Article[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({ titre: "", contenu: "", cover: null as File | null, is_active: true });
  const [editArticle, setEditArticle] = useState({ titre: "", contenu: "", cover: null as File | null, is_active: true });
  const articlesPerPage = 10;

  const quillRefAdd = useRef<ReactQuill>(null);
  const quillRefEdit = useRef<ReactQuill>(null);

  useEffect(() => {
    fetchArticles();
  }, [currentPage, searchQuery]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>("/articles/", {
        params: { page: currentPage, per_page: articlesPerPage, search: searchQuery || undefined },
      });
      setArticles(Array.isArray(response.data.results) ? response.data.results : []);
      setTotalArticles(response.data.count || 0);
      setTotalPages(Math.ceil((response.data.count || 0) / articlesPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des articles:", err.response?.data);
      setError("Erreur lors du chargement des articles.");
      setArticles([]);
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

  const openAddModal = () => {
    setNewArticle({ titre: "", contenu: "", cover: null, is_active: true });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("titre", newArticle.titre);
      formData.append("contenu", newArticle.contenu);
      if (newArticle.cover) formData.append("cover", newArticle.cover);
      formData.append("is_active", newArticle.is_active.toString());
      await api.post("/articles/", formData, { headers: { "Content-Type": "multipart/form-data" } });
      closeAddModal();
      fetchArticles();
    } catch (err: any) {
      console.error("Erreur lors de l’ajout de l’article:", err.response?.data);
      setError("Erreur lors de l’ajout de l’article.");
    }
  };

  const openEditModal = (article: Article) => {
    setSelectedArticle(article);
    setEditArticle({ titre: article.titre, contenu: article.contenu, cover: null, is_active: article.is_active });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedArticle(null);
  };

  const handleEditArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) return;
    try {
      const formData = new FormData();
      formData.append("titre", editArticle.titre);
      formData.append("contenu", editArticle.contenu);
      if (editArticle.cover) formData.append("cover", editArticle.cover);
      formData.append("is_active", editArticle.is_active.toString());
      await api.put(`/articles/${selectedArticle.id}/`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      closeEditModal();
      fetchArticles();
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour de l’article:", err.response?.data);
      setError("Erreur lors de la mise à jour de l’article.");
    }
  };

  const openDeleteModal = (article: Article) => {
    setSelectedArticle(article);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedArticle(null);
  };

  const handleDeleteArticle = async () => {
    if (!selectedArticle) return;
    try {
      await api.delete(`/articles/${selectedArticle.id}/`);
      closeDeleteModal();
      fetchArticles();
    } catch (err: any) {
      console.error("Erreur lors de la suppression de l’article:", err.response?.data);
      setError("Erreur lors de la suppression de l’article.");
    }
  };

  const toolbarOptions = [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["image", "link"],
    ["clean"],
  ];

  const imageHandler = (quillRef: React.MutableRefObject<ReactQuill | null>) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file && quillRef.current) {
        const formData = new FormData();
        formData.append("image", file);
        try {
          const response = await api.post("/upload-image/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          if (range) {
            quill.insertEmbed(range.index, "image", response.data.url);
          } else {
            quill.insertEmbed(quill.getLength(), "image", response.data.url);
          }
        } catch (err) {
          console.error("Erreur lors de l'upload de l'image:", err);
          setError("Erreur lors de l'upload de l'image.");
        }
      }
    };
  };

  const modulesAdd = {
    toolbar: {
      container: toolbarOptions,
      handlers: { image: () => imageHandler(quillRefAdd) },
    },
  };

  const modulesEdit = {
    toolbar: {
      container: toolbarOptions,
      handlers: { image: () => imageHandler(quillRefEdit) },
    },
  };

  const renderArticlesPlaceholder = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-lightCard dark:bg-darkCard">
          <tr className="border-b border-lightBorder dark:border-darkBorder">
            {["ID", "Titre", "Auteur", "Date", "Statut", "Actions"].map((header) => (
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
              <td className="py-3 px-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
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
          <FileText className="h-6 w-6 mr-2" /> Gestion des Articles
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par titre..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ButtonPrimary onClick={openAddModal} className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center">
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un article
          </ButtonPrimary>
        </div>

        {loading ? (
          renderArticlesPlaceholder()
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-lightCard dark:bg-darkCard">
                  <tr className="border-b border-lightBorder dark:border-darkBorder">
                    <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Titre</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Auteur</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Date</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Statut</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.length > 0 ? (
                    articles.map((article) => (
                      <tr
                        key={article.id}
                        className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{article.id}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{article.titre}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{article.auteur}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {new Date(article.date_publication).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              article.is_active
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {article.is_active ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <ButtonPrimary
                            onClick={() => openEditModal(article)}
                            className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                          >
                            <Edit className="h-4 w-4 mr-1" /> Modifier
                          </ButtonPrimary>
                          <ButtonPrimary
                            onClick={() => openDeleteModal(article)}
                            className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                          </ButtonPrimary>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                        Aucun article trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de {(currentPage - 1) * articlesPerPage + 1} à{" "}
                {Math.min(currentPage * articlesPerPage, totalArticles)} sur {totalArticles} articles
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
        )}

        {/* Modal d'ajout */}
        {isAddModalOpen && (
          <ModalContainer isOpen={isAddModalOpen} onClose={closeAddModal} title="Ajouter un article" size="md">
            <ModalBody>
              <form onSubmit={handleAddArticle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Titre</label>
                  <input
                    type="text"
                    value={newArticle.titre}
                    onChange={(e) => setNewArticle({ ...newArticle, titre: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Contenu</label>
                  <ReactQuill
                    ref={quillRefAdd}
                    value={newArticle.contenu}
                    onChange={(value) => setNewArticle({ ...newArticle, contenu: value })}
                    modules={modulesAdd}
                    className="bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Image de couverture</label>
                  <input
                    type="file"
                    onChange={(e) => setNewArticle({ ...newArticle, cover: e.target.files?.[0] || null })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input
                    type="checkbox"
                    checked={newArticle.is_active}
                    onChange={(e) => setNewArticle({ ...newArticle, is_active: e.target.checked })}
                    className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded"
                  />
                </div>
                <ModalFooter>
                  <ButtonPrimary
                    type="button"
                    onClick={closeAddModal}
                    className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
                    Ajouter
                  </ButtonPrimary>
                </ModalFooter>
              </form>
            </ModalBody>
          </ModalContainer>
        )}

        {/* Modal d'édition */}
        {isEditModalOpen && selectedArticle && (
          <ModalContainer isOpen={isEditModalOpen} onClose={closeEditModal} title="Modifier l’article" size="md">
            <ModalBody>
              <form onSubmit={handleEditArticle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Titre</label>
                  <input
                    type="text"
                    value={editArticle.titre}
                    onChange={(e) => setEditArticle({ ...editArticle, titre: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Contenu</label>
                  <ReactQuill
                    ref={quillRefEdit}
                    value={editArticle.contenu}
                    onChange={(value) => setEditArticle({ ...editArticle, contenu: value })}
                    modules={modulesEdit}
                    className="bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Image de couverture</label>
                  <input
                    type="file"
                    onChange={(e) => setEditArticle({ ...editArticle, cover: e.target.files?.[0] || null })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText"
                  />
                  {selectedArticle.cover && !editArticle.cover && (
                    <img src={selectedArticle.cover} alt="Cover" className="mt-2 h-16 w-16 object-cover rounded" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input
                    type="checkbox"
                    checked={editArticle.is_active}
                    onChange={(e) => setEditArticle({ ...editArticle, is_active: e.target.checked })}
                    className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded"
                  />
                </div>
                <ModalFooter>
                  <ButtonPrimary
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
                    Enregistrer
                  </ButtonPrimary>
                </ModalFooter>
              </form>
            </ModalBody>
          </ModalContainer>
        )}

        {/* Modal de suppression */}
        {isDeleteModalOpen && selectedArticle && (
          <ModalContainer isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Supprimer l’article" size="md">
            <ModalBody>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer l’article{" "}
                <span className="font-medium">{selectedArticle.titre}</span> ?
              </p>
              <ModalFooter>
                <ButtonPrimary
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary onClick={handleDeleteArticle} className="px-4 py-2 bg-red-500 text-white hover:bg-red-600">
                  Supprimer
                </ButtonPrimary>
              </ModalFooter>
            </ModalBody>
          </ModalContainer>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminArticlesPage;