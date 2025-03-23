import React, { useState, useEffect, useCallback, useContext } from "react";
import api from "../services/api";
import AdminLayout, { ThemeContext } from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { Tag, Search, Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import debounce from "lodash/debounce";

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
  const theme = useContext(ThemeContext); // Récupération du thème
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
    categorie: "" as string | Category,
  });
  const [editPromotion, setEditPromotion] = useState({
    nom: "",
    reduction: "",
    date_debut: "",
    date_fin: "",
    produit_ids: [] as string[],
    categorie_id: "" as string | Category,
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
      setPromotions(response.data.results);
      setTotalPromotions(response.data.count);
      setTotalPages(Math.ceil(response.data.count / promotionsPerPage));
      setLoadingPromotions(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des promotions:", err.response?.data);
      setErrorPromotions("Erreur lors du chargement des promotions.");
      setLoadingPromotions(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await api.get("/categories/");
      setCategories(response.data.results);
      setLoadingCategories(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des catégories:", err.response?.data);
      setErrorCategories("Erreur lors du chargement des catégories.");
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
        setProducts(response.data.results);
        setLoadingProducts(false);
      } catch (err: any) {
        console.error("Erreur lors du chargement des produits:", err.response?.data);
        setErrorProducts("Erreur lors du chargement des produits.");
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
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setProductSearch("");
  };

  const handleAddPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const promotionData = {
        ...newPromotion,
        reduction: parseFloat(newPromotion.reduction),
        produit_ids: newPromotion.produits,
        categorie_id: typeof newPromotion.categorie === "string" ? null : newPromotion.categorie.id || null,
        date_debut: new Date(newPromotion.date_debut).toISOString(),
        date_fin: new Date(newPromotion.date_fin).toISOString(),
      };
      await api.post("/promotions/", promotionData);
      setIsAddModalOpen(false);
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
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedPromotion(null);
    setProductSearch("");
  };

  const handleEditPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromotion) return;

    try {
      const promotionData = {
        ...editPromotion,
        reduction: parseFloat(editPromotion.reduction),
        produit_ids: editPromotion.produit_ids,
        categorie_id: typeof editPromotion.categorie_id === "string" ? editPromotion.categorie_id || null : editPromotion.categorie_id.id || null,
        date_debut: new Date(editPromotion.date_debut).toISOString(),
        date_fin: new Date(editPromotion.date_fin).toISOString(),
      };
      await api.put(`/promotions/${selectedPromotion.id}/`, promotionData);
      setIsEditModalOpen(false);
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
      setIsDeleteModalOpen(false);
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
      const selectedCategory = categories.find((cat) => cat.id === categoryId) || "";
      setNewPromotion({ ...newPromotion, categorie: selectedCategory, produits: [] });
    } else {
      const selectedCategory = categories.find((cat) => cat.id === categoryId) || "";
      setEditPromotion({ ...editPromotion, categorie_id: selectedCategory, produit_ids: [] });
    }
  };

  const renderPromotionsPlaceholder = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-lightCard dark:bg-darkCard">
          <tr className="border-b border-lightBorder dark:border-darkBorder">
            <th className="py-3 px-4"><div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div></th>
            <th className="py-3 px-4"><div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div></th>
            <th className="py-3 px-4"><div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div></th>
            <th className="py-3 px-4"><div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div></th>
            <th className="py-3 px-4"><div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div></th>
            <th className="py-3 px-4"><div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 rounded"></div></th>
            <th className="py-3 px-4"><div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div></th>
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
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <Tag className="h-6 w-6 mr-2" /> Gestion des Promotions
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
                placeholder="Rechercher par nom..."
                className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={handleFilterStatus}
              className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Liste des promotions */}
        {loadingPromotions ? (
          renderPromotionsPlaceholder()
        ) : errorPromotions ? (
          <div className="text-center py-8 text-red-500">{errorPromotions}</div>
        ) : (
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
        )}

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * promotionsPerPage + 1} à{" "}
            {Math.min(currentPage * promotionsPerPage, totalPromotions)} sur {totalPromotions} promotions
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

        {/* Modal pour ajouter une promotion */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div
              className={`p-6 rounded-lg shadow-lg w-full max-w-2xl ${
                theme === "light" ? "bg-lightBg" : "bg-darkBg"
              }`}
            >
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" /> Ajouter une promotion
              </h2>
              <form onSubmit={handleAddPromotion} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                    <input
                      type="text"
                      value={newPromotion.nom}
                      onChange={(e) => setNewPromotion({ ...newPromotion, nom: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        theme === "light" ? "border-lightBorder" : "border-darkBorder"
                      } rounded-lg ${
                        theme === "light" ? "bg-lightCard" : "bg-darkCard"
                      } text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                      max={1}
                      min={0}
                      value={newPromotion.reduction}
                      onChange={(e) => setNewPromotion({ ...newPromotion, reduction: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        theme === "light" ? "border-lightBorder" : "border-darkBorder"
                      } rounded-lg ${
                        theme === "light" ? "bg-lightCard" : "bg-darkCard"
                      } text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={newPromotion.date_debut}
                      onChange={(e) => setNewPromotion({ ...newPromotion, date_debut: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        theme === "light" ? "border-lightBorder" : "border-darkBorder"
                      } rounded-lg ${
                        theme === "light" ? "bg-lightCard" : "bg-darkCard"
                      } text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={newPromotion.date_fin}
                      onChange={(e) => setNewPromotion({ ...newPromotion, date_fin: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        theme === "light" ? "border-lightBorder" : "border-darkBorder"
                      } rounded-lg ${
                        theme === "light" ? "bg-lightCard" : "bg-darkCard"
                      } text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                </div>

                {/* Sélection des produits ou catégorie */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-lightText dark:text-darkText">Appliquer à :</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewPromotion({ ...newPromotion, categorie: "", produits: [] })}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          typeof newPromotion.categorie === "string"
                            ? "bg-blue-500 text-white"
                            : theme === "light"
                            ? "bg-lightCard text-gray-700 hover:bg-gray-300"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        Produits spécifiques
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setNewPromotion({ ...newPromotion, produits: [], categorie: categories[0] || "" })
                        }
                        className={`px-3 py-1 rounded-lg text-sm ${
                          typeof newPromotion.categorie !== "string"
                            ? "bg-blue-500 text-white"
                            : theme === "light"
                            ? "bg-lightCard text-gray-700 hover:bg-gray-300"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        Toute une catégorie
                      </button>
                    </div>
                  </div>

                  {typeof newPromotion.categorie === "string" ? (
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
                          className={`w-full pl-10 pr-4 py-2 border ${
                            theme === "light" ? "border-lightBorder" : "border-darkBorder"
                          } rounded-lg ${
                            theme === "light" ? "bg-lightCard" : "bg-darkCard"
                          } text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      <div
                        className={`mt-2 max-h-40 overflow-y-auto border ${
                          theme === "light" ? "border-lightBorder" : "border-darkBorder"
                        } rounded-lg ${theme === "light" ? "bg-lightCard" : "bg-darkCard"}`}
                      >
                        {loadingProducts ? (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            Chargement des produits...
                          </div>
                        ) : errorProducts ? (
                          <div className="text-center py-4 text-red-500">{errorProducts}</div>
                        ) : (
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
                                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded"
                              />
                              <span className="ml-2 text-sm text-lightText dark:text-darkText">{product.nom}</span>
                            </div>
                          ))
                        )}
                      </div>
                      {newPromotion.produits.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {newPromotion.produits.map((id) => {
                            const product = products.find((p) => p.id === id);
                            return product ? (
                              <span
                                key={id}
                                className={`px-2 py-1 ${
                                  theme === "light"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-blue-900 text-blue-200"
                                } rounded-full text-xs flex items-center`}
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
                        <div className="text-center py-2 text-gray-500 dark:text-gray-400">
                          Chargement des catégories...
                        </div>
                      ) : errorCategories ? (
                        <div className="text-center py-2 text-red-500">{errorCategories}</div>
                      ) : (
                        <select
                          value={
                            typeof newPromotion.categorie === "string"
                              ? newPromotion.categorie
                              : newPromotion.categorie.id
                          }
                          onChange={(e) => handleCategorySelect(e.target.value, "new")}
                          className={`w-full px-3 py-2 border ${
                            theme === "light" ? "border-lightBorder" : "border-darkBorder"
                          } rounded-lg ${
                            theme === "light" ? "bg-lightCard" : "bg-darkCard"
                          } text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
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

                <div className="flex gap-2 justify-end">
                  <ButtonPrimary
                    type="button"
                    onClick={closeAddModal}
                    className={`px-4 py-2 ${
                      theme === "light"
                        ? "bg-lightCard text-gray-700 hover:bg-gray-300"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
                    Ajouter
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal pour modifier une promotion */}
        {isEditModalOpen && selectedPromotion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div
              className={`p-6 rounded-lg shadow-lg w-full max-w-2xl ${
                theme === "light" ? "bg-lightBg" : "bg-darkBg"
              }`}
            >
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier la promotion
              </h2>
              <form onSubmit={handleEditPromotion} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                    <input
                      type="text"
                      value={editPromotion.nom}
                      onChange={(e) => setEditPromotion({ ...editPromotion, nom: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        theme === "light" ? "border-lightBorder" : "border-darkBorder"
                      } rounded-lg ${
                        theme === "light" ? "bg-lightCard" : "bg-darkCard"
                      } text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                      max={1}
                      min={0}
                      value={editPromotion.reduction}
                      onChange={(e) => setEditPromotion({ ...editPromotion, reduction: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        theme === "light" ? "border-lightBorder" : "border-darkBorder"
                      } rounded-lg ${
                        theme === "light" ? "bg-lightCard" : "bg-darkCard"
                      } text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                      className={`w-full px-3 py-2 border ${
                        theme === "light" ? "border-lightBorder" : "border-darkBorder"
                      } rounded-lg ${
                        theme === "light" ? "bg-lightCard" : "bg-darkCard"
                      } text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                      className={`w-full px-3 py-2 border ${
                        theme === "light" ? "border-lightBorder" : "border-darkBorder"
                      } rounded-lg ${
                        theme === "light" ? "bg-lightCard" : "bg-darkCard"
                      } text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-lightText dark:text-darkText">Appliquer à :</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditPromotion({ ...editPromotion, categorie_id: "", produit_ids: editPromotion.produit_ids })
                        }
                        className={`px-3 py-1 rounded-lg text-sm ${
                          typeof editPromotion.categorie_id === "string"
                            ? "bg-blue-500 text-white"
                            : theme === "light"
                            ? "bg-lightCard text-gray-700 hover:bg-gray-300"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        Produits spécifiques
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditPromotion({ ...editPromotion, produit_ids: [], categorie_id: categories[0] || "" })
                        }
                        className={`px-3 py-1 rounded-lg text-sm ${
                          typeof editPromotion.categorie_id !== "string"
                            ? "bg-blue-500 text-white"
                            : theme === "light"
                            ? "bg-lightCard text-gray-700 hover:bg-gray-300"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        Toute une catégorie
                      </button>
                    </div>
                  </div>

                  {typeof editPromotion.categorie_id === "string" ? (
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
                          className={`w-full pl-10 pr-4 py-2 border ${
                            theme === "light" ? "border-lightBorder" : "border-darkBorder"
                          } rounded-lg ${
                            theme === "light" ? "bg-lightCard" : "bg-darkCard"
                          } text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      <div
                        className={`mt-2 max-h-40 overflow-y-auto border ${
                          theme === "light" ? "border-lightBorder" : "border-darkBorder"
                        } rounded-lg ${theme === "light" ? "bg-lightCard" : "bg-darkCard"}`}
                      >
                        {loadingProducts ? (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            Chargement des produits...
                          </div>
                        ) : errorProducts ? (
                          <div className="text-center py-4 text-red-500">{errorProducts}</div>
                        ) : (
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
                                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded"
                              />
                              <span className="ml-2 text-sm text-lightText dark:text-darkText">{product.nom}</span>
                            </div>
                          ))
                        )}
                      </div>
                      {editPromotion.produit_ids.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {editPromotion.produit_ids.map((id) => {
                            const product = products.find((p) => p.id === id);
                            return product ? (
                              <span
                                key={id}
                                className={`px-2 py-1 ${
                                  theme === "light"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-blue-900 text-blue-200"
                                } rounded-full text-xs flex items-center`}
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
                          value={
                            typeof editPromotion.categorie_id === "string"
                              ? editPromotion.categorie_id
                              : editPromotion.categorie_id.id
                          }
                          onChange={(e) => handleCategorySelect(e.target.value, "edit")}
                          className={`w-full px-3 py-2 border ${
                            theme === "light" ? "border-lightBorder" : "border-darkBorder"
                          } rounded-lg ${
                            theme === "light" ? "bg-lightCard" : "bg-darkCard"
                          } text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
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
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
                    Enregistrer
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal pour supprimer une promotion */}
        {isDeleteModalOpen && selectedPromotion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div
              className={`p-6 rounded-lg shadow-lg w-full max-w-md ${
                theme === "light" ? "bg-lightBg" : "bg-darkBg"
              }`}
            >
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer la promotion
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer la promotion{" "}
                <span className="font-medium">{selectedPromotion.nom}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary
                  type="button"
                  onClick={closeDeleteModal}
                  className={`px-4 py-2 ${
                    theme === "light"
                      ? "bg-lightCard text-gray-700 hover:bg-gray-300"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleDeletePromotion}
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

export default AdminPromotionsPage;