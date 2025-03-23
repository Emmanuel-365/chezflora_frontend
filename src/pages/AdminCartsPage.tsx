"use client";

import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { ShoppingBag, Search, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { ModalContainer, ModalBody, ModalFooter } from "../components/ModalContainer";

interface Panier {
  id: string;
  client: { id: string; username: string; email: string };
  items: { id: string; produit: { id: string; nom: string; prix: string }; quantite: number }[];
}

interface ApiResponse {
  results: Panier[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminCartsPage: React.FC = () => {
  const [carts, setCarts] = useState<Panier[]>([]);
  const [totalCarts, setTotalCarts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCart, setSelectedCart] = useState<Panier | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const cartsPerPage = 10;

  useEffect(() => {
    fetchCarts();
  }, [currentPage, searchQuery]);

  const fetchCarts = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>("/paniers/", {
        params: {
          page: currentPage,
          per_page: cartsPerPage,
          search: searchQuery || undefined,
        },
      });
      const results = Array.isArray(response.data.results) ? response.data.results : [];
      setCarts(results);
      setTotalCarts(response.data.count || 0);
      setTotalPages(Math.ceil((response.data.count || 0) / cartsPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des paniers:", err.response?.data);
      setError("Erreur lors du chargement des paniers.");
      setCarts([]);
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

  const openDetailsModal = (cart: Panier) => {
    setSelectedCart(cart);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCart(null);
  };

  const openDeleteModal = (cart: Panier) => {
    setSelectedCart(cart);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCart(null);
  };

  const handleDeleteCart = async () => {
    if (!selectedCart) return;
    try {
      await api.delete(`/paniers/${selectedCart.id}/`);
      closeDeleteModal();
      fetchCarts();
    } catch (err: any) {
      console.error("Erreur lors de la suppression du panier:", err.response?.data);
      setError("Erreur lors de la suppression du panier.");
    }
  };

  const renderCartsPlaceholder = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-lightCard dark:bg-darkCard">
          <tr className="border-b border-lightBorder dark:border-darkBorder">
            {["ID", "Utilisateur", "Email", "Nb Articles", "Total", "Actions"].map((header) => (
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
              <td className="py-3 px-4"><div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
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
          <ShoppingBag className="h-6 w-6 mr-2" /> Gestion des Paniers
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par email ou nom d’utilisateur..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          renderCartsPlaceholder()
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-lightCard dark:bg-darkCard">
                  <tr className="border-b border-lightBorder dark:border-darkBorder">
                    <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Utilisateur</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Email</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Nb Articles</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Total</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {carts.length > 0 ? (
                    carts.map((cart) => {
                      const total = cart.items.reduce(
                        (sum, item) => sum + parseFloat(item.produit.prix) * item.quantite,
                        0
                      );
                      return (
                        <tr
                          key={cart.id}
                          className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{cart.id}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{cart.client.username}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{cart.client.email}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{cart.items.length}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{total.toFixed(2)} FCFA</td>
                          <td className="py-3 px-4 flex gap-2">
                            <ButtonPrimary
                              onClick={() => openDetailsModal(cart)}
                              className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                            >
                              <Eye className="h-4 w-4 mr-1" /> Détails
                            </ButtonPrimary>
                            <ButtonPrimary
                              onClick={() => openDeleteModal(cart)}
                              className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm"
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                            </ButtonPrimary>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                        Aucun panier trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de {(currentPage - 1) * cartsPerPage + 1} à{" "}
                {Math.min(currentPage * cartsPerPage, totalCarts)} sur {totalCarts} paniers
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

        {/* Modal des détails */}
        {isDetailsModalOpen && selectedCart && (
          <ModalContainer
            isOpen={isDetailsModalOpen}
            onClose={closeDetailsModal}
            title={`Détails du Panier de ${selectedCart.client.username}`}
            size="lg"
          >
            <ModalBody>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-lightCard dark:bg-darkCard">
                    <tr className="border-b border-lightBorder dark:border-darkBorder">
                      <th className="py-3 px-4 text-lightText dark:text-darkText">ID Produit</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Quantité</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Prix</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCart.items.map((item) => (
                      <tr key={item.id} className="border-b border-lightBorder dark:border-darkBorder">
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.produit.id}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.produit.nom}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.quantite}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.produit.prix} FCFA</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {(parseFloat(item.produit.prix) * item.quantite).toFixed(2)} FCFA
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ModalFooter>
                <ButtonPrimary
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Fermer
                </ButtonPrimary>
              </ModalFooter>
            </ModalBody>
          </ModalContainer>
        )}

        {/* Modal de suppression */}
        {isDeleteModalOpen && selectedCart && (
          <ModalContainer isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Supprimer le Panier" size="md">
            <ModalBody>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer le panier de{" "}
                <span className="font-medium">{selectedCart.client.email}</span> ?
              </p>
              <ModalFooter>
                <ButtonPrimary
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary onClick={handleDeleteCart} className="px-4 py-2 bg-red-500 text-white hover:bg-red-600">
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

export default AdminCartsPage;