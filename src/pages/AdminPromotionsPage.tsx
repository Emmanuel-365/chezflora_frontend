"use client";

import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { Tag, Search, Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import debounce from "lodash/debounce";
import { ModalContainer, ModalBody, ModalFooter } from "../components/ModalContainer";

interface Promotion {
  id: string;
  nom: string;
  reduction: number;
  date_debut: string;
  date_fin: string;
  produits: { id: string; nom: string }[];
}

interface Product {
  id: string;
  nom: string;
}

interface Category {
  id: string;
  nom: string;
}

interface ApiResponse {
  results: Promotion[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminPromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [totalPromotions, setTotalPromotions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorPromotions, setErrorPromotions] = useState<string | null>(null);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newPromotion, setNewPromotion] = useState({
    nom: "",
    reduction: "",
    date_debut: "",
    date_fin: "",
    produits: [] as string[],
    categorie: "" as string,
  });
  const [editPromotion, setEditPromotion] = useState({
    nom: "",
    reduction: "",
    date_debut: "",
    date_fin: "",
    produit_ids: [] as string[],
    categorie_id: "" as string,
  });
  const promotionsPerPage = 10;

  useEffect(() => {
    fetchPromotions();
    fetchCategories();
    fetchProducts("");
  }, [currentPage, searchQuery, filterStatus]);

  const fetchPromotions = async () => {
    setLoadingPromotions(true);
    try {
      const response = await api.get<ApiResponse>("/promotions/", {
        params: {
          page: currentPage,
          per_page: promotionsPerPage,
          search: searchQuery || undefined,
          status: filterStatus !== "all" ? filterStatus : undefined,
        },
      });
      setPromotions(response.data.results || []);
      setTotalPromotions(response.data.count || 0);
      setTotalPages(Math.ceil((response.data.count || 0) / promotionsPerPage));
      setLoadingPromotions(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des promotions:", err.response?.data);
      setErrorPromotions("Erreur lors du chargement des promotions.");
      setPromotions([]);
      setLoadingPromotions(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await api.get("/categories/");
      setCategories(response.data.results || response.data || []);
      setLoadingCategories(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des catégories:", err.response?.data);
      setErrorCategories("Erreur lors du chargement des catégories.");
      setCategories([]);
      setLoadingCategories(false);
    }
  };

  const fetchProducts = useCallback(
    debounce(async (query: string) => {
      setLoadingProducts(true);
      try {
        const response = await api.get("/produits/", {
          params: { search: query || undefined, per_page: 50 },
        });
        setProducts(response.data.results || []);
        setLoadingProducts(false);
      } catch (err: any) {
        console.error("Erreur lors du chargement des produits:", err.response?.data);
        setErrorProducts("Erreur lors du chargement des produits.");
        setProducts([]);
        setLoadingProducts(false);
      }
    }, 300),
    []
  );

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
    setNewPromotion({ nom: "", reduction: "", date_debut: "", date_fin: "", produits: [], categorie: "" });
    setProductSearch("");
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setProductSearch("");
  };

  const handleAddPromotion = async (e: React.FormEvent | MouseEvent | undefined) => {
    e && e.preventDefault();
    try {
      const promotionData = {
        nom: newPromotion.nom,
        reduction: parseFloat(newPromotion.reduction),
        date_debut: new Date(newPromotion.date_debut).toISOString(),
        date_fin: new Date(newPromotion.date_fin).toISOString(),
        produit_ids: newPromotion.produits.length > 0 ? newPromotion.produits : [],
        categorie_id: newPromotion.categorie || null,
      };
      await api.post("/promotions/", promotionData);
      closeAddModal();
      fetchPromotions();
    } catch (err: any) {
      console.error("Erreur lors de l’ajout de la promotion:", err.response?.data);
      setErrorPromotions("Erreur lors de l’ajout de la promotion.");
    }
  };

  const openEditModal = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setEditPromotion({
      nom: promotion.nom,
      reduction: promotion.reduction.toString(),
      date_debut: new Date(promotion.date_debut).toISOString().split("T")[0],
      date_fin: new Date(promotion.date_fin).toISOString().split("T")[0],
      produit_ids: promotion.produits.map((p) => p.id),
      categorie_id: "",
    });
    setProductSearch("");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedPromotion(null);
    setProductSearch("");
  };

  const handleEditPromotion = async (e: React.FormEvent | MouseEvent | undefined) => {
    e && e.preventDefault();
    if (!selectedPromotion) return;

    try {
      const promotionData = {
        nom: editPromotion.nom,
        reduction: parseFloat(editPromotion.reduction),
        date_debut: new Date(editPromotion.date_debut).toISOString(),
        date_fin: new Date(editPromotion.date_fin).toISOString(),
        produit_ids: editPromotion.produit_ids.length > 0 ? editPromotion.produit_ids : [],
        categorie_id: editPromotion.categorie_id || null,
      };
      await api.put(`/promotions/${selectedPromotion.id}/`, promotionData);
      closeEditModal();
      fetchPromotions();
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour de la promotion:", err.response?.data);
      setErrorPromotions("Erreur lors de la mise à jour de la promotion.");
    }
  };

  const openDeleteModal = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedPromotion(null);
  };

  const handleDeletePromotion = async () => {
    if (!selectedPromotion) return;

    try {
      await api.delete(`/promotions/${selectedPromotion.id}/`);
      closeDeleteModal();
      fetchPromotions();
    } catch (err: any) {
      console.error("Erreur lors de la suppression de la promotion:", err.response?.data);
      setErrorPromotions("Erreur lors de la suppression de la promotion.");
    }
  };

  const handleProductSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setProductSearch(query);
    fetchProducts(query);
  };

  const handleProductToggle = (productId: string, type: "new" | "edit") => {
    if (type === "new") {
      const updatedProducts = newPromotion.produits.includes(productId)
        ? newPromotion.produits.filter((id) => id !== productId)
        : [...newPromotion.produits, productId];
      setNewPromotion({ ...newPromotion, produits: updatedProducts, categorie: "" });
    } else {
      const updatedProducts = editPromotion.produit_ids.includes(productId)
        ? editPromotion.produit_ids.filter((id) => id !== productId)
        : [...editPromotion.produit_ids, productId];
      setEditPromotion({ ...editPromotion, produit_ids: updatedProducts, categorie_id: "" });
    }
  };

  const handleCategorySelect = (categoryId: string, type: "new" | "edit") => {
    if (type === "new") {
      setNewPromotion({ ...newPromotion, categorie: categoryId, produits: [] });
    } else {
      setEditPromotion({ ...editPromotion, categorie_id: categoryId, produit_ids: [] });
    }
  };

  const renderPromotionsPlaceholder = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-lightCard dark:bg-darkCard">
          <tr className="border-b border-lightBorder dark:border-darkBorder">
            {["ID", "Nom", "Réduction", "Début", "Fin", "Nb Produits", "Actions"].map((header) => (
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
              <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
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
          <Tag className="h-6 w-6 mr-2" /> Gestion des Promotions
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
              className="w-full sm:w-40 px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="expired">Expirées</option>
            </select>
          </div>
          <ButtonPrimary
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter une promotion
          </ButtonPrimary>
        </div>

        {loadingPromotions ? (
          renderPromotionsPlaceholder()
        ) : errorPromotions ? (
          <div className="text-center py-8 text-red-500">{errorPromotions}</div>
        ) : promotions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-lightCard dark:bg-darkCard">
                  <tr className="border-b border-lightBorder dark:border-darkBorder">
                    <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Réduction</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Début</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Fin</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Nb Produits</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((promotion) => (
                    <tr
                      key={promotion.id}
                      className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{promotion.id}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{promotion.nom}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{promotion.reduction}%</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {new Date(promotion.date_debut).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {new Date(promotion.date_fin).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{promotion.produits.length}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <ButtonPrimary
                          onClick={() => openEditModal(promotion)}
                          className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                        >
                          <Edit className="h-4 w-4 mr-1" /> Modifier
                        </ButtonPrimary>
                        <ButtonPrimary
                          onClick={() => openDeleteModal(promotion)}
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

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de {(currentPage - 1) * promotionsPerPage + 1} à{" "}
                {Math.min(currentPage * promotionsPerPage, totalPromotions)} sur {totalPromotions} promotions
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
          <div className="text-center py-8 text-gray-700 dark:text-gray-300">Aucune promotion trouvée.</div>
        )}

        {/* Modal pour ajouter une promotion */}
        <ModalContainer isOpen={isAddModalOpen} onClose={closeAddModal} title="Ajouter une promotion" size="lg">
          <ModalBody>
            <form onSubmit={handleAddPromotion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                  <input
                    type="text"
                    value={newPromotion.nom}
                    onChange={(e) => setNewPromotion({ ...newPromotion, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Réduction (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={newPromotion.reduction}
                    onChange={(e) => setNewPromotion({ ...newPromotion, reduction: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date de début</label>
                  <input
                    type="date"
                    value={newPromotion.date_debut}
                    onChange={(e) => setNewPromotion({ ...newPromotion, date_debut: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={newPromotion.date_fin}
                    onChange={(e) => setNewPromotion({ ...newPromotion, date_fin: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-lightText dark:text-darkText">Appliquer à :</label>
                  <div className="flex gap-2">
                    <ButtonPrimary
                      type="button"
                      onClick={() => setNewPromotion({ ...newPromotion, categorie: "", produits: [] })}
                      className={`px-3 py-1 text-sm ${
                        newPromotion.categorie === ""
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      Produits spécifiques
                    </ButtonPrimary>
                    <ButtonPrimary
                      type="button"
                      onClick={() => setNewPromotion({ ...newPromotion, produits: [], categorie: categories[0]?.id || "" })}
                      className={`px-3 py-1 text-sm ${
                        newPromotion.categorie !== ""
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      Toute une catégorie
                    </ButtonPrimary>
                  </div>
                </div>

                {newPromotion.categorie === "" ? (
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                      Rechercher des produits
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={handleProductSearch}
                        placeholder="Rechercher un produit..."
                        className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                      />
                    </div>
                    <div className="mt-2 max-h-40 overflow-y-auto border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg">
                      {loadingProducts ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">Chargement des produits...</div>
                      ) : errorProducts ? (
                        <div className="text-center py-4 text-red-500">{errorProducts}</div>
                      ) : products.length > 0 ? (
                        products.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <input
                              type="checkbox"
                              value={product.id}
                              checked={newPromotion.produits.includes(product.id)}
                              onChange={() => handleProductToggle(product.id, "new")}
                              className="h-4 w-4 text-soft-green dark:text-dark-soft-green focus:ring-soft-green dark:focus:ring-dark-soft-green border-lightBorder dark:border-darkBorder rounded"
                            />
                            <span className="ml-2 text-sm text-lightText dark:text-darkText">{product.nom}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-700 dark:text-gray-300">Aucun produit trouvé.</div>
                      )}
                    </div>
                    {newPromotion.produits.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {newPromotion.produits.map((id) => {
                          const product = products.find((p) => p.id === id);
                          return product ? (
                            <span
                              key={id}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs flex items-center"
                            >
                              {product.nom}
                              <button
                                type="button"
                                onClick={() => handleProductToggle(id, "new")}
                                className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                      Sélectionner une catégorie
                    </label>
                    {loadingCategories ? (
                      <div className="text-center py-2 text-gray-500 dark:text-gray-400">Chargement des catégories...</div>
                    ) : errorCategories ? (
                      <div className="text-center py-2 text-red-500">{errorCategories}</div>
                    ) : (
                      <select
                        value={newPromotion.categorie}
                        onChange={(e) => handleCategorySelect(e.target.value, "new")}
                        className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                      >
                        <option value="">Aucune catégorie</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nom}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <ButtonPrimary
              onClick={closeAddModal}
              className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Annuler
            </ButtonPrimary>
            <ButtonPrimary
              onClick={(e) => handleAddPromotion(e)}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600"
            >
              Ajouter
            </ButtonPrimary>
          </ModalFooter>
        </ModalContainer>

        {/* Modal pour modifier une promotion */}
        <ModalContainer isOpen={isEditModalOpen} onClose={closeEditModal} title="Modifier la promotion" size="lg">
          {selectedPromotion && (
            <>
              <ModalBody>
                <form onSubmit={handleEditPromotion} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                      <input
                        type="text"
                        value={editPromotion.nom}
                        onChange={(e) => setEditPromotion({ ...editPromotion, nom: e.target.value })}
                        className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                        Réduction (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={editPromotion.reduction}
                        onChange={(e) => setEditPromotion({ ...editPromotion, reduction: e.target.value })}
                        className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                        Date de début
                      </label>
                      <input
                        type="date"
                        value={editPromotion.date_debut}
                        onChange={(e) => setEditPromotion({ ...editPromotion, date_debut: e.target.value })}
                        className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        value={editPromotion.date_fin}
                        onChange={(e) => setEditPromotion({ ...editPromotion, date_fin: e.target.value })}
                        className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium text-lightText dark:text-darkText">Appliquer à :</label>
                      <div className="flex gap-2">
                        <ButtonPrimary
                          type="button"
                          onClick={() => setEditPromotion({ ...editPromotion, categorie_id: "", produit_ids: [] })}
                          className={`px-3 py-1 text-sm ${
                            editPromotion.categorie_id === ""
                              ? "bg-blue-500 text-white hover:bg-blue-600"
                              : "bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          Produits spécifiques
                        </ButtonPrimary>
                        <ButtonPrimary
                          type="button"
                          onClick={() =>
                            setEditPromotion({ ...editPromotion, produit_ids: [], categorie_id: categories[0]?.id || "" })
                          }
                          className={`px-3 py-1 text-sm ${
                            editPromotion.categorie_id !== ""
                              ? "bg-blue-500 text-white hover:bg-blue-600"
                              : "bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          Toute une catégorie
                        </ButtonPrimary>
                      </div>
                    </div>

                    {editPromotion.categorie_id === "" ? (
                      <div>
                        <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                          Rechercher des produits
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={productSearch}
                            onChange={handleProductSearch}
                            placeholder="Rechercher un produit..."
                            className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                          />
                        </div>
                        <div className="mt-2 max-h-40 overflow-y-auto border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg">
                          {loadingProducts ? (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                              Chargement des produits...
                            </div>
                          ) : errorProducts ? (
                            <div className="text-center py-4 text-red-500">{errorProducts}</div>
                          ) : products.length > 0 ? (
                            products.map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <input
                                  type="checkbox"
                                  value={product.id}
                                  checked={editPromotion.produit_ids.includes(product.id)}
                                  onChange={() => handleProductToggle(product.id, "edit")}
                                  className="h-4 w-4 text-soft-green dark:text-dark-soft-green focus:ring-soft-green dark:focus:ring-dark-soft-green border-lightBorder dark:border-darkBorder rounded"
                                />
                                <span className="ml-2 text-sm text-lightText dark:text-darkText">{product.nom}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-gray-700 dark:text-gray-300">
                              Aucun produit trouvé.
                            </div>
                          )}
                        </div>
                        {editPromotion.produit_ids.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {editPromotion.produit_ids.map((id) => {
                              const product = products.find((p) => p.id === id);
                              return product ? (
                                <span
                                  key={id}
                                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs flex items-center"
                                >
                                  {product.nom}
                                  <button
                                    type="button"
                                    onClick={() => handleProductToggle(id, "edit")}
                                    className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                                  >
                                    ×
                                  </button>
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                          Sélectionner une catégorie
                        </label>
                        {loadingCategories ? (
                          <div className="text-center py-2 text-gray-500 dark:text-gray-400">
                            Chargement des catégories...
                          </div>
                        ) : errorCategories ? (
                          <div className="text-center py-2 text-red-500">{errorCategories}</div>
                        ) : (
                          <select
                            value={editPromotion.categorie_id}
                            onChange={(e) => handleCategorySelect(e.target.value, "edit")}
                            className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                          >
                            <option value="">Aucune catégorie</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.nom}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <ButtonPrimary
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={(e) => handleEditPromotion(e)}
                  className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600"
                >
                  Enregistrer
                </ButtonPrimary>
              </ModalFooter>
            </>
          )}
        </ModalContainer>

        {/* Modal pour supprimer une promotion */}
        <ModalContainer isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Supprimer la promotion" size="sm">
          {selectedPromotion && (
            <>
              <ModalBody>
                <p className="text-lightText dark:text-darkText">
                  Êtes-vous sûr de vouloir supprimer la promotion{" "}
                  <span className="font-medium">{selectedPromotion.nom}</span> ?
                </p>
              </ModalBody>
              <ModalFooter>
                <ButtonPrimary
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleDeletePromotion}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Supprimer
                </ButtonPrimary>
              </ModalFooter>
            </>
          )}
        </ModalContainer>
      </div>
    </AdminLayout>
  );
};

export default AdminPromotionsPage;