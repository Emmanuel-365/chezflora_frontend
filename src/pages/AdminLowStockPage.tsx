"use client";

import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { AlertTriangle, Search, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { ModalContainer, ModalBody, ModalFooter } from "../components/ModalContainer";

interface LowStockProduct {
  id: string;
  nom: string;
  stock: number;
  categorie__nom: string | null;
}

interface LowStockResponse {
  seuil: number;
  total_low_stock: number;
  products: LowStockProduct[];
}

const AdminLowStockPage: React.FC = () => {
  const [lowStockData, setLowStockData] = useState<LowStockResponse | null>(null);
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditSeuilModalOpen, setIsEditSeuilModalOpen] = useState(false);
  const [newSeuil, setNewSeuil] = useState<string>("");
  const productsPerPage = 10;

  useEffect(() => {
    fetchLowStock();
  }, [currentPage, searchQuery]);

  const fetchLowStock = async () => {
    setLoading(true);
    try {
      const response = await api.get<LowStockResponse>("/produits/low_stock/", {
        params: {
          page: currentPage,
          per_page: productsPerPage,
          search: searchQuery || undefined,
        },
      });
      console.log(response.data);
      setLowStockData(response.data);
      setProducts(response.data.products || []);
      setTotalProducts(response.data.total_low_stock || 0);
      setTotalPages(Math.ceil((response.data.total_low_stock || 0) / productsPerPage));
      setNewSeuil(response.data.seuil.toString());
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des produits en stock faible:", err.response?.data);
      setError("Erreur lors du chargement des produits en stock faible.");
      setProducts([]);
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

  const openEditSeuilModal = () => {
    setIsEditSeuilModalOpen(true);
  };

  const closeEditSeuilModal = () => {
    setIsEditSeuilModalOpen(false);
  };

  const handleEditSeuil = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const seuilParam = await api.get("/parametres/", { params: { cle: "SEUIL_STOCK_FAIBLE" } });
      const paramId = seuilParam.data[0]?.id;
      if (paramId) {
        await api.put(`/parametres/${paramId}/`, {
          cle: "SEUIL_STOCK_FAIBLE",
          valeur: newSeuil,
          description: "Seuil pour alerter sur un stock faible",
        });
      } else {
        await api.post("/parametres/", {
          cle: "SEUIL_STOCK_FAIBLE",
          valeur: newSeuil,
          description: "Seuil pour alerter sur un stock faible",
        });
      }
      closeEditSeuilModal();
      fetchLowStock();
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du seuil:", err.response?.data);
      setError("Erreur lors de la mise à jour du seuil.");
    }
  };

  const renderLowStockPlaceholder = () => (
    <div className="space-y-6">
      <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-5 w-40 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-lightCard dark:bg-darkCard">
            <tr className="border-b border-lightBorder dark:border-darkBorder">
              {["ID", "Nom", "Stock", "Catégorie"].map((header) => (
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
                <td className="py-3 px-4"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <AlertTriangle className="h-6 w-6 mr-2" /> Produits en Stock Faible
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Seuil actuel : <strong>{lowStockData?.seuil ?? "N/A"}</strong> unités
            </span>
            <ButtonPrimary
              onClick={openEditSeuilModal}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center"
            >
              <Edit className="h-5 w-5 mr-2" /> Modifier le seuil
            </ButtonPrimary>
          </div>
        </div>

        {loading ? (
          renderLowStockPlaceholder()
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <>
            <div className="mb-6">
              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" /> Total Produits en Stock Faible
                </h2>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {lowStockData?.total_low_stock ?? 0}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-lightCard dark:bg-darkCard">
                  <tr className="border-b border-lightBorder dark:border-darkBorder">
                    <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Stock</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Catégorie</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.id}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.nom}</td>
                        <td className="py-3 px-4 text-red-600 dark:text-red-400">{product.stock}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {product.categorie__nom || "Sans catégorie"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                        Aucun produit en stock faible trouvé.
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

        {/* Modal pour modifier le seuil */}
        {isEditSeuilModalOpen && (
          <ModalContainer
            isOpen={isEditSeuilModalOpen}
            onClose={closeEditSeuilModal}
            title="Modifier le seuil d’alerte"
            size="md"
          >
            <ModalBody>
              <form onSubmit={handleEditSeuil} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                    Nouveau seuil
                  </label>
                  <input
                    type="number"
                    value={newSeuil}
                    onChange={(e) => setNewSeuil(e.target.value)}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                    min="1"
                  />
                </div>
                <ModalFooter>
                  <ButtonPrimary
                    type="button"
                    onClick={closeEditSeuilModal}
                    className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </ButtonPrimary>
                  <ButtonPrimary
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Enregistrer
                  </ButtonPrimary>
                </ModalFooter>
              </form>
            </ModalBody>
          </ModalContainer>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLowStockPage;