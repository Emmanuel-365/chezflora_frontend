"use client";

import React, { useState, useEffect } from "react";
import api, { supprimerProduitWishlist } from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { Heart, Search, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { ModalContainer, ModalBody, ModalFooter } from "../components/ModalContainer";

interface Wishlist {
  id: string;
  client: {
    id: string;
    username: string;
    email: string;
  };
  produits: {
    id: string;
    nom: string;
    prix: string;
  }[];
}

interface ApiResponse {
  results: Wishlist[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminWishlistsPage: React.FC = () => {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [totalWishlists, setTotalWishlists] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [isDeleteWishlistModalOpen, setIsDeleteWishlistModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ wishlistId: string; productId: string } | null>(null);
  const wishlistsPerPage = 10;

  useEffect(() => {
    fetchWishlists();
  }, [currentPage, searchQuery]);

  const fetchWishlists = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>("/wishlist/", {
        params: {
          page: currentPage,
          per_page: wishlistsPerPage,
          search: searchQuery || undefined,
        },
      });
      setWishlists(response.data.results || []);
      setTotalWishlists(response.data.count || 0);
      setTotalPages(Math.ceil((response.data.count || 0) / wishlistsPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des wishlists:", err.response?.data);
      setError("Erreur lors du chargement des wishlists.");
      setWishlists([]);
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

  const openDetailsModal = (wishlist: Wishlist) => {
    setSelectedWishlist(wishlist);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedWishlist(null);
  };

  const openDeleteProductModal = (wishlistId: string, productId: string) => {
    setProductToDelete({ wishlistId, productId });
    setIsDeleteProductModalOpen(true);
  };

  const closeDeleteProductModal = () => {
    setIsDeleteProductModalOpen(false);
    setProductToDelete(null);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await supprimerProduitWishlist(productToDelete.productId);
      closeDeleteProductModal();
      fetchWishlists();
    } catch (err: any) {
      console.error("Erreur lors de la suppression du produit de la wishlist:", err.response?.data);
      setError("Erreur lors de la suppression du produit.");
    }
  };

  const openDeleteWishlistModal = (wishlist: Wishlist) => {
    setSelectedWishlist(wishlist);
    setIsDeleteWishlistModalOpen(true);
  };

  const closeDeleteWishlistModal = () => {
    setIsDeleteWishlistModalOpen(false);
    setSelectedWishlist(null);
  };

  const handleDeleteWishlist = async () => {
    if (!selectedWishlist) return;

    try {
      await api.delete(`/wishlist/${selectedWishlist.id}/`);
      closeDeleteWishlistModal();
      fetchWishlists();
    } catch (err: any) {
      console.error("Erreur lors de la suppression de la wishlist:", err.response?.data);
      setError("Erreur lors de la suppression de la wishlist.");
    }
  };

  const renderWishlistsPlaceholder = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-lightCard dark:bg-darkCard">
          <tr className="border-b border-lightBorder dark:border-darkBorder">
            {["ID", "Utilisateur", "Email", "Nb Produits", "Actions"].map((header) => (
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
          <Heart className="h-6 w-6 mr-2" /> Gestion des Wishlists
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par email ou nom d’utilisateur..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
            />
          </div>
        </div>

        {loading ? (
          renderWishlistsPlaceholder()
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : wishlists.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-lightCard dark:bg-darkCard">
                  <tr className="border-b border-lightBorder dark:border-darkBorder">
                    <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Utilisateur</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Email</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Nb Produits</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wishlists.map((wishlist) => (
                    <tr
                      key={wishlist.id}
                      className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{wishlist.id}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{wishlist.client.username}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{wishlist.client.email}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{wishlist.produits.length}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <ButtonPrimary
                          onClick={() => openDetailsModal(wishlist)}
                          className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                        >
                          <Eye className="h-4 w-4 mr-1" /> Détails
                        </ButtonPrimary>
                        <ButtonPrimary
                          onClick={() => openDeleteWishlistModal(wishlist)}
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
                Affichage de {(currentPage - 1) * wishlistsPerPage + 1} à{" "}
                {Math.min(currentPage * wishlistsPerPage, totalWishlists)} sur {totalWishlists} wishlists
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
          <div className="text-center py-8 text-gray-700 dark:text-gray-300">Aucune wishlist trouvée.</div>
        )}

        {/* Modal pour voir les détails */}
        <ModalContainer
          isOpen={isDetailsModalOpen}
          onClose={closeDetailsModal}
          title={`Détails de la Wishlist de ${selectedWishlist?.client.username || ""}`}
          size="lg"
        >
          {selectedWishlist && (
            <>
              <ModalBody>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-lightCard dark:bg-darkCard">
                      <tr className="border-b border-lightBorder dark:border-darkBorder">
                        <th className="py-3 px-4 text-lightText dark:text-darkText">ID Produit</th>
                        <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                        <th className="py-3 px-4 text-lightText dark:text-darkText">Prix</th>
                        <th className="py-3 px-4 text-lightText dark:text-darkText">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedWishlist.produits.map((product) => (
                        <tr
                          key={product.id}
                          className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.id}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.nom}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.prix} FCFA</td>
                          <td className="py-3 px-4">
                            <ButtonPrimary
                              onClick={() => openDeleteProductModal(selectedWishlist.id, product.id)}
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
              </ModalBody>
              <ModalFooter>
                <ButtonPrimary
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Fermer
                </ButtonPrimary>
              </ModalFooter>
            </>
          )}
        </ModalContainer>

        {/* Modal pour supprimer un produit */}
        <ModalContainer isOpen={isDeleteProductModalOpen} onClose={closeDeleteProductModal} title="Supprimer un produit" size="sm">
          <ModalBody>
            <p className="text-lightText dark:text-darkText">
              Êtes-vous sûr de vouloir supprimer ce produit de la wishlist ?
            </p>
          </ModalBody>
          <ModalFooter>
            <ButtonPrimary
              onClick={closeDeleteProductModal}
              className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
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
        </ModalContainer>

        {/* Modal pour supprimer une wishlist */}
        <ModalContainer
          isOpen={isDeleteWishlistModalOpen}
          onClose={closeDeleteWishlistModal}
          title="Supprimer la Wishlist"
          size="sm"
        >
          {selectedWishlist && (
            <>
              <ModalBody>
                <p className="text-lightText dark:text-darkText">
                  Êtes-vous sûr de vouloir supprimer la wishlist de{" "}
                  <span className="font-medium">{selectedWishlist.client.email}</span> ?
                </p>
              </ModalBody>
              <ModalFooter>
                <ButtonPrimary
                  onClick={closeDeleteWishlistModal}
                  className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleDeleteWishlist}
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

export default AdminWishlistsPage;