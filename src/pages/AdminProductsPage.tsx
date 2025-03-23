import React, { useState, useEffect, useContext } from "react";import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { Package, Search, Edit, Trash2, PlusCircle, Eye, ChevronLeft, ChevronRight, X } from "lucide-react";
import { ModalContainer, ModalBody, ModalFooter } from "../components/ModalContainer";
import { ThemeContext } from "../components/AdminLayout";

interface Photo {
  id: string;
  image: string; // URL de l'image
  uploaded_at: string;
}

interface Product {
  id: string;
  nom: string;
  prix: string;
  stock: number;
  is_active: boolean;
  categorie: { id: string; nom: string } | null;
  description: string;
  promotions: { id: string; nom: string }[];
  photos: Photo[];
}

interface ApiResponse {
  results: Product[];
  count: number;
  next: string | null;
  previous: string | null;
}

interface Category {
  id: string;
  nom: string;
}

interface Promotion {
  id: string;
  nom: string;
}

const Spinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" aria-label="Chargement en cours" />
);

const AdminProductsPage: React.FC = () => {
  const theme = useContext(ThemeContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    nom: "",
    prix: "",
    stock: "",
    is_active: true,
    categorie: "",
    description: "",
    promotions: [] as string[],
    photos: [] as File[],
  });
  const [editProduct, setEditProduct] = useState({
    nom: "",
    prix: "",
    stock: "",
    is_active: true,
    categorie: "",
    description: "",
    promotions: [] as string[],
    photos: [] as File[],
  });
  const productsPerPage = 10;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchPromotions();
  }, [currentPage, searchQuery, filterStatus]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>("/produits/", {
        params: {
          page: currentPage,
          per_page: productsPerPage,
          search: searchQuery || undefined,
          is_active: filterStatus !== "all" ? filterStatus : undefined,
        },
      });
      const results = Array.isArray(response.data.results) ? response.data.results : [];
      setProducts(results);
      setTotalProducts(response.data.count || 0);
      setTotalPages(Math.ceil((response.data.count || 0) / productsPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des produits:", err.response?.data);
      setError("Erreur lors du chargement des produits.");
      setProducts([]);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories/");
      setCategories(Array.isArray(response.data.results) ? response.data.results : []);
    } catch (err: any) {
      console.error("Erreur lors du chargement des catégories:", err.response?.data);
      setError("Erreur lors du chargement des catégories.");
      setCategories([]);
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await api.get("/promotions/");
      setPromotions(Array.isArray(response.data.results) ? response.data.results : []);
    } catch (err: any) {
      console.error("Erreur lors du chargement des promotions:", err.response?.data);
      setError("Erreur lors du chargement des promotions.");
      setPromotions([]);
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
    setNewProduct({
      nom: "",
      prix: "",
      stock: "",
      is_active: true,
      categorie: "",
      description: "",
      promotions: [],
      photos: [],
    });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddProduct = async (e?: React.FormEvent | React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault(); // Vérifie que e existe avant d’appeler preventDefault
    try {
      const productData = {
        nom: newProduct.nom,
        prix: parseFloat(newProduct.prix).toString(),
        stock: parseInt(newProduct.stock, 10),
        is_active: newProduct.is_active,
        categorie: newProduct.categorie || null,
        description: newProduct.description,
        promotions: newProduct.promotions,
      };
      const response = await api.post("/produits/", productData);
      const productId = response.data.id;

      for (const photo of newProduct.photos) {
        const formData = new FormData();
        formData.append("image", photo);
        formData.append("entity_type", "produit");
        formData.append("entity_id", productId);
        await api.post("/photos/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setIsAddModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error("Erreur lors de l’ajout du produit:", err.response?.data);
      setError("Erreur lors de l’ajout du produit.");
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setEditProduct({
      nom: product.nom,
      prix: product.prix,
      stock: product.stock.toString(),
      is_active: product.is_active,
      categorie: product.categorie?.id || "",
      description: product.description,
      promotions: product.promotions.map((p) => p.id),
      photos: [],
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleEditProduct = async (e?: React.FormEvent | React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault(); // Vérifie que e existe avant d’appeler preventDefault
    if (!selectedProduct) return;

    try {
      const productData = {
        nom: editProduct.nom,
        prix: parseFloat(editProduct.prix).toString(),
        stock: parseInt(editProduct.stock, 10),
        is_active: editProduct.is_active,
        categorie: editProduct.categorie || null,
        description: editProduct.description,
        promotions: editProduct.promotions,
      };
      await api.put(`/produits/${selectedProduct.id}/`, productData);

      for (const photo of editProduct.photos) {
        const formData = new FormData();
        formData.append("image", photo);
        formData.append("entity_type", "produit");
        formData.append("entity_id", selectedProduct.id);
        await api.post("/photos/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setIsEditModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du produit:", err.response?.data);
      setError("Erreur lors de la mise à jour du produit.");
    }
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await api.delete(`/produits/${selectedProduct.id}/`);
      setIsDeleteModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error("Erreur lors de la suppression du produit:", err.response?.data);
      setError("Erreur lors de la suppression du produit.");
    }
  };

  const openDetailsModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!selectedProduct) return;

    try {
      await api.delete(`/photos/${photoId}/`);
      setSelectedProduct({
        ...selectedProduct,
        photos: selectedProduct.photos.filter((photo) => photo.id !== photoId),
      });
      fetchProducts();
    } catch (err: any) {
      console.error("Erreur lors de la suppression de la photo:", err.response?.data);
      setError("Erreur lors de la suppression de la photo.");
    }
  };

  const handlePromotionChange = (e: React.ChangeEvent<HTMLInputElement>, type: "new" | "edit") => {
    const promotionId = e.target.value;
    const isChecked = e.target.checked;
    if (type === "new") {
      const updatedPromotions = isChecked
        ? [...newProduct.promotions, promotionId]
        : newProduct.promotions.filter((id) => id !== promotionId);
      setNewProduct({ ...newProduct, promotions: updatedPromotions });
    } else {
      const updatedPromotions = isChecked
        ? [...editProduct.promotions, promotionId]
        : editProduct.promotions.filter((id) => id !== promotionId);
      setEditProduct({ ...editProduct, promotions: updatedPromotions });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: "new" | "edit") => {
    const files = Array.from(e.target.files || []);
    if (type === "new") {
      setNewProduct({ ...newProduct, photos: [...newProduct.photos, ...files] });
    } else {
      setEditProduct({ ...editProduct, photos: [...editProduct.photos, ...files] });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-4 sm:mb-6 flex items-center">
          <Package className="h-6 w-6 mr-2" /> Gestion des Produits
        </h1>

        {error && <div className="text-center py-4 text-red-500">{error}</div>}

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Rechercher par nom ou description..."
                className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={handleFilterStatus}
              className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un produit
          </ButtonPrimary>
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-lightCard dark:bg-darkCard">
                  <tr className="border-b border-lightBorder dark:border-darkBorder">
                    <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Prix</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Stock</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Statut</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Catégorie</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Promotions</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Photos</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(products) && products.length > 0 ? (
                    products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.id}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.nom}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.prix} FCFA</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.stock}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.is_active
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {product.is_active ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {product.categorie?.nom || "Sans catégorie"}
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {product.promotions.length > 0
                            ? product.promotions.map((p) => p.nom).join(", ")
                            : "Aucune"}
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {product.photos.length} photo(s)
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <ButtonPrimary
                            onClick={() => openDetailsModal(product)}
                            className="px-2 py-1 bg-gray-500 text-white hover:bg-gray-600 flex items-center text-sm"
                          >
                            <Eye className="h-4 w-4 mr-1" /> Détails
                          </ButtonPrimary>
                          <ButtonPrimary
                            onClick={() => openEditModal(product)}
                            className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                          >
                            <Edit className="h-4 w-4 mr-1" /> Modifier
                          </ButtonPrimary>
                          <ButtonPrimary
                            onClick={() => openDeleteModal(product)}
                            className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                          </ButtonPrimary>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                        Aucun produit trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de {(currentPage - 1) * productsPerPage + 1} à{" "}
                {Math.min(currentPage * productsPerPage, totalProducts)} sur {totalProducts} produits
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
          </>
        )}

        {/* Modal pour ajouter un produit */}
        <ModalContainer
          isOpen={isAddModalOpen}
          onClose={closeAddModal}
          title="Ajouter un produit"
          size="md"
          theme={theme}
        >          
          <ModalBody>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-soft-brown mb-1">Nom</label>
                <input
                  type="text"
                  value={newProduct.nom}
                  onChange={(e) => setNewProduct({ ...newProduct, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-[#F5E8C7] rounded-lg bg-[#F5F5F5] text-soft-brown focus:outline-none focus:ring-2 focus:ring-[#A8D5BA]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-soft-brown mb-1">Prix (FCFA)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.prix}
                  onChange={(e) => setNewProduct({ ...newProduct, prix: e.target.value })}
                  className="w-full px-3 py-2 border border-[#F5E8C7] rounded-lg bg-[#F5F5F5] text-soft-brown focus:outline-none focus:ring-2 focus:ring-[#A8D5BA]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-soft-brown mb-1">Stock</label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="w-full px-3 py-2 border border-[#F5E8C7] rounded-lg bg-[#F5F5F5] text-soft-brown focus:outline-none focus:ring-2 focus:ring-[#A8D5BA]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-soft-brown mb-1">Actif</label>
                <input
                  type="checkbox"
                  checked={newProduct.is_active}
                  onChange={(e) => setNewProduct({ ...newProduct, is_active: e.target.checked })}
                  className="h-5 w-5 text-[#A8D5BA] focus:ring-[#A8D5BA] border-[#F5E8C7] rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-soft-brown mb-1">Catégorie</label>
                <select
                  value={newProduct.categorie}
                  onChange={(e) => setNewProduct({ ...newProduct, categorie: e.target.value })}
                  className="w-full px-3 py-2 border border-[#F5E8C7] rounded-lg bg-[#F5F5F5] text-soft-brown focus:outline-none focus:ring-2 focus:ring-[#A8D5BA]"
                >
                  <option value="">Sans catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-soft-brown mb-1">Promotions</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {promotions.map((promo) => (
                    <div key={promo.id} className="flex items-center">
                      <input
                        type="checkbox"
                        value={promo.id}
                        checked={newProduct.promotions.includes(promo.id)}
                        onChange={(e) => handlePromotionChange(e, "new")}
                        className="h-4 w-4 text-[#A8D5BA] focus:ring-[#A8D5BA] border-[#F5E8C7] rounded"
                      />
                      <label className="ml-2 text-sm text-soft-brown">{promo.nom}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-soft-brown mb-1">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#F5E8C7] rounded-lg bg-[#F5F5F5] text-soft-brown focus:outline-none focus:ring-2 focus:ring-[#A8D5BA]"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-soft-brown mb-1">Photos</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoChange(e, "new")}
                  className="w-full text-sm text-soft-brown file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#A8D5BA] file:text-white hover:file:bg-[#8CC7A1]"
                />
                {newProduct.photos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newProduct.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setNewProduct({
                              ...newProduct,
                              photos: newProduct.photos.filter((_, i) => i !== index),
                            })
                          }
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <ButtonPrimary
              onClick={closeAddModal}
              className="px-4 py-2 bg-[#F5E8C7] text-soft-brown hover:bg-[#E8DAB2]"
            >
              Annuler
            </ButtonPrimary>
            <ButtonPrimary
              onClick={(e) => handleAddProduct(e)}
              className="px-4 py-2 bg-[#A8D5BA] text-white hover:bg-[#8CC7A1]"
            >
              Ajouter
            </ButtonPrimary>
          </ModalFooter>
        </ModalContainer>

        {/* Modal pour modifier un produit */}
        <ModalContainer isOpen={isEditModalOpen} onClose={closeEditModal} title="Modifier le produit" size="md" theme={theme}>
          {selectedProduct && (
            <>
              <ModalBody>
                <form onSubmit={handleEditProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-soft-brown mb-1">Nom</label>
                    <input
                      type="text"
                      value={editProduct.nom}
                      onChange={(e) => setEditProduct({ ...editProduct, nom: e.target.value })}
                      className="w-full px-3 py-2 border border-[#F5E8C7] rounded-lg bg-[#F5F5F5] text-soft-brown focus:outline-none focus:ring-2 focus:ring-[#A8D5BA]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-soft-brown mb-1">Prix (FCFA)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editProduct.prix}
                      onChange={(e) => setEditProduct({ ...editProduct, prix: e.target.value })}
                      className="w-full px-3 py-2 border border-[#F5E8C7] rounded-lg bg-[#F5F5F5] text-soft-brown focus:outline-none focus:ring-2 focus:ring-[#A8D5BA]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-soft-brown mb-1">Stock</label>
                    <input
                      type="number"
                      value={editProduct.stock}
                      onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-[#F5E8C7] rounded-lg bg-[#F5F5F5] text-soft-brown focus:outline-none focus:ring-2 focus:ring-[#A8D5BA]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-soft-brown mb-1">Actif</label>
                    <input
                      type="checkbox"
                      checked={editProduct.is_active}
                      onChange={(e) => setEditProduct({ ...editProduct, is_active: e.target.checked })}
                      className="h-5 w-5 text-[#A8D5BA] focus:ring-[#A8D5BA] border-[#F5E8C7] rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-soft-brown mb-1">Catégorie</label>
                    <select
                      value={editProduct.categorie}
                      onChange={(e) => setEditProduct({ ...editProduct, categorie: e.target.value })}
                      className="w-full px-3 py-2 border border-[#F5E8C7] rounded-lg bg-[#F5F5F5] text-soft-brown focus:outline-none focus:ring-2 focus:ring-[#A8D5BA]"
                    >
                      <option value="">Sans catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-soft-brown mb-1">Promotions</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {promotions.map((promo) => (
                        <div key={promo.id} className="flex items-center">
                          <input
                            type="checkbox"
                            value={promo.id}
                            checked={editProduct.promotions.includes(promo.id)}
                            onChange={(e) => handlePromotionChange(e, "edit")}
                            className="h-4 w-4 text-[#A8D5BA] focus:ring-[#A8D5BA] border-[#F5E8C7] rounded"
                          />
                          <label className="ml-2 text-sm text-soft-brown">{promo.nom}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-soft-brown mb-1">Description</label>
                    <textarea
                      value={editProduct.description}
                      onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                      className="w-full px-3 py-2 border border-[#F5E8C7] rounded-lg bg-[#F5F5F5] text-soft-brown focus:outline-none focus:ring-2 focus:ring-[#A8D5BA]"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-soft-brown mb-1">Ajouter des photos</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhotoChange(e, "edit")}
                      className="w-full text-sm text-soft-brown file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#A8D5BA] file:text-white hover:file:bg-[#8CC7A1]"
                    />
                    {editProduct.photos.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {editProduct.photos.map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Preview ${index}`}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setEditProduct({
                                  ...editProduct,
                                  photos: editProduct.photos.filter((_, i) => i !== index),
                                })
                              }
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <ButtonPrimary
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-[#F5E8C7] text-soft-brown hover:bg-[#E8DAB2]"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={(e) => handleEditProduct(e)} // Encapsulation avec événement
                  className="px-4 py-2 bg-[#A8D5BA] text-white hover:bg-[#8CC7A1]"
                >
                  Enregistrer
                </ButtonPrimary>
              </ModalFooter>
            </>
          )}
        </ModalContainer>

        {/* Modal pour supprimer un produit */}
        <ModalContainer isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Supprimer le produit" size="sm" theme={theme}>
          {selectedProduct && (
            <>
              <ModalBody>
                <p className="text-soft-brown">
                  Êtes-vous sûr de vouloir supprimer le produit{" "}
                  <span className="font-medium">{selectedProduct.nom}</span> ?
                </p>
              </ModalBody>
              <ModalFooter>
                <ButtonPrimary
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-[#F5E8C7] text-soft-brown hover:bg-[#E8DAB2]"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleDeleteProduct}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Supprimer
                </ButtonPrimary>
              </ModalFooter>
            </>
          )}
        </ModalContainer>

        {/* Modal pour voir les détails */}
        <ModalContainer isOpen={isDetailsModalOpen} onClose={closeDetailsModal} title="Détails du produit" size="lg" theme={theme}>
          {selectedProduct && (
            <>
              <ModalBody>
                <div className="space-y-2">
                  <p className="text-soft-brown">
                    <strong>ID :</strong> {selectedProduct.id}
                  </p>
                  <p className="text-soft-brown">
                    <strong>Nom :</strong> {selectedProduct.nom}
                  </p>
                  <p className="text-soft-brown">
                    <strong>Prix :</strong> {selectedProduct.prix} FCFA
                  </p>
                  <p className="text-soft-brown">
                    <strong>Stock :</strong> {selectedProduct.stock}
                  </p>
                  <p className="text-soft-brown">
                    <strong>Statut :</strong> {selectedProduct.is_active ? "Actif" : "Inactif"}
                  </p>
                  <p className="text-soft-brown">
                    <strong>Catégorie :</strong> {selectedProduct.categorie?.nom || "Sans catégorie"}
                  </p>
                  <p className="text-soft-brown">
                    <strong>Promotions :</strong>{" "}
                    {selectedProduct.promotions.length > 0
                      ? selectedProduct.promotions.map((p) => p.nom).join(", ")
                      : "Aucune"}
                  </p>
                  <p className="text-soft-brown">
                    <strong>Description :</strong> {selectedProduct.description || "Aucune"}
                  </p>
                  <div>
                    <strong className="text-soft-brown">Photos :</strong>
                    {selectedProduct.photos.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedProduct.photos.map((photo) => (
                          <div key={photo.id} className="relative">
                            <img
                              src={photo.image}
                              alt={`Photo ${photo.id}`}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-soft-brown">Aucune photo</p>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <ButtonPrimary
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-[#F5E8C7] text-soft-brown hover:bg-[#E8DAB2]"
                >
                  Fermer
                </ButtonPrimary>
              </ModalFooter>
            </>
          )}
        </ModalContainer>
      </div>
    </AdminLayout>
  );
};

export default AdminProductsPage;