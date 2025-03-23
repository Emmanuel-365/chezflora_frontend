"use client";

import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { Folder, Search, Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { ModalContainer, ModalBody, ModalFooter } from "../components/ModalContainer";

interface Category {
  id: string;
  nom: string;
  is_active: boolean;
  date_creation: string;
}

interface ApiResponse {
  results: Category[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ nom: "", is_active: true });
  const [editCategory, setEditCategory] = useState({ nom: "", is_active: true });
  const categoriesPerPage = 10;

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchQuery, filterStatus]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>("/categories/", {
        params: {
          page: currentPage,
          per_page: categoriesPerPage,
          search: searchQuery || undefined,
          is_active: filterStatus !== "all" ? filterStatus : undefined,
        },
      });
      const results = Array.isArray(response.data.results) ? response.data.results : [];
      setCategories(results);
      setTotalCategories(response.data.count || 0);
      setTotalPages(Math.ceil((response.data.count || 0) / categoriesPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des catégories:", err.response?.data);
      setError("Erreur lors du chargement des catégories.");
      setCategories([]);
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

  const openAddModal = () => {
    setNewCategory({ nom: "", is_active: true });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/categories/", newCategory);
      closeAddModal();
      fetchCategories();
    } catch (err: any) {
      console.error("Erreur lors de l’ajout de la catégorie:", err.response?.data);
      setError("Erreur lors de l’ajout de la catégorie.");
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setEditCategory({ nom: category.nom, is_active: category.is_active });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCategory(null);
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    try {
      await api.put(`/categories/${selectedCategory.id}/`, editCategory);
      closeEditModal();
      fetchCategories();
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour de la catégorie:", err.response?.data);
      setError("Erreur lors de la mise à jour de la catégorie.");
    }
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    try {
      await api.delete(`/categories/${selectedCategory.id}/`);
      closeDeleteModal();
      fetchCategories();
    } catch (err: any) {
      console.error("Erreur lors de la suppression de la catégorie:", err.response?.data);
      setError("Erreur lors de la suppression de la catégorie.");
    }
  };

  const renderCategoriesPlaceholder = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-lightCard dark:bg-darkCard">
          <tr className="border-b border-lightBorder dark:border-darkBorder">
            {["ID", "Nom", "Statut", "Date de création", "Actions"].map((header) => (
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
              <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
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
          <Folder className="h-6 w-6 mr-2" /> Gestion des Catégories
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Rechercher par nom..."
                className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
              />
            </div>
            <select
              value={filterStatus}
              onChange={handleFilterStatus}
              className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
            >
              <option value="all">Tous les statuts</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>
          <ButtonPrimary
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter une catégorie
          </ButtonPrimary>
        </div>

        {loading ? (
          renderCategoriesPlaceholder()
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-lightCard dark:bg-darkCard">
                  <tr className="border-b border-lightBorder dark:border-darkBorder">
                    <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Statut</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Date de création</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <tr
                        key={category.id}
                        className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{category.id}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{category.nom}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              category.is_active
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {category.is_active ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {new Date(category.date_creation).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <ButtonPrimary
                            onClick={() => openEditModal(category)}
                            className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                          >
                            <Edit className="h-4 w-4 mr-1" /> Modifier
                          </ButtonPrimary>
                          <ButtonPrimary
                            onClick={() => openDeleteModal(category)}
                            className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                          </ButtonPrimary>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                        Aucune catégorie trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de {(currentPage - 1) * categoriesPerPage + 1} à{" "}
                {Math.min(currentPage * categoriesPerPage, totalCategories)} sur {totalCategories} catégories
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

        {/* Modal pour ajouter une catégorie */}
        {isAddModalOpen && (
          <ModalContainer isOpen={isAddModalOpen} onClose={closeAddModal} title="Ajouter une catégorie" size="md">
            <ModalBody>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                  <input
                    type="text"
                    value={newCategory.nom}
                    onChange={(e) => setNewCategory({ ...newCategory, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input
                    type="checkbox"
                    checked={newCategory.is_active}
                    onChange={(e) => setNewCategory({ ...newCategory, is_active: e.target.checked })}
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

        {/* Modal pour modifier une catégorie */}
        {isEditModalOpen && selectedCategory && (
          <ModalContainer isOpen={isEditModalOpen} onClose={closeEditModal} title="Modifier la catégorie" size="md">
            <ModalBody>
              <form onSubmit={handleEditCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                  <input
                    type="text"
                    value={editCategory.nom}
                    onChange={(e) => setEditCategory({ ...editCategory, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input
                    type="checkbox"
                    checked={editCategory.is_active}
                    onChange={(e) => setEditCategory({ ...editCategory, is_active: e.target.checked })}
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

        {/* Modal pour supprimer une catégorie */}
        {isDeleteModalOpen && selectedCategory && (
          <ModalContainer isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Supprimer la catégorie" size="md">
            <ModalBody>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer la catégorie{" "}
                <span className="font-medium">{selectedCategory.nom}</span> ?
              </p>
              <ModalFooter>
                <ButtonPrimary
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary onClick={handleDeleteCategory} className="px-4 py-2 bg-red-500 text-white hover:bg-red-600">
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

export default AdminCategoriesPage;