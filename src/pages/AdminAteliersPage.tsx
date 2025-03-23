"use client";

import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { Calendar, Search, Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { ModalContainer, ModalBody, ModalFooter } from "../components/ModalContainer";

interface Atelier {
  id: string;
  nom: string;
  description: string;
  date: string;
  duree: number;
  prix: string;
  places_totales: number;
  is_active: boolean;
  places_disponibles: number;
}

interface ApiResponse {
  results: Atelier[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminAteliersPage: React.FC = () => {
  const [ateliers, setAteliers] = useState<Atelier[]>([]);
  const [totalAteliers, setTotalAteliers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAtelier, setSelectedAtelier] = useState<Atelier | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newAtelier, setNewAtelier] = useState({
    nom: "",
    description: "",
    date: "",
    duree: "",
    prix: "",
    places_totales: "",
    is_active: true,
  });
  const [editAtelier, setEditAtelier] = useState({
    nom: "",
    description: "",
    date: "",
    duree: "",
    prix: "",
    places_totales: "",
    is_active: true,
  });
  const ateliersPerPage = 10;

  useEffect(() => {
    fetchAteliers();
  }, [currentPage, searchQuery]);

  const fetchAteliers = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>("/ateliers/", {
        params: { page: currentPage, per_page: ateliersPerPage, search: searchQuery || undefined },
      });
      const results = Array.isArray(response.data.results) ? response.data.results : [];
      setAteliers(results);
      setTotalAteliers(response.data.count || 0);
      setTotalPages(Math.ceil((response.data.count || 0) / ateliersPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des ateliers:", err.response?.data);
      setError("Erreur lors du chargement des ateliers.");
      setAteliers([]);
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
    setNewAtelier({ nom: "", description: "", date: "", duree: "", prix: "", places_totales: "", is_active: true });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const handleAddAtelier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const atelierData = {
        nom: newAtelier.nom,
        description: newAtelier.description,
        date: newAtelier.date, // Format attendu : "YYYY-MM-DDTHH:MM"
        duree: parseInt(newAtelier.duree) || 0,
        prix: parseFloat(newAtelier.prix).toString() || "0",
        places_totales: parseInt(newAtelier.places_totales) || 0,
        is_active: newAtelier.is_active,
      };
      await api.post("/ateliers/", atelierData);
      closeAddModal();
      fetchAteliers();
    } catch (err: any) {
      console.error("Erreur lors de l’ajout de l’atelier:", err.response?.data);
      setError("Erreur lors de l’ajout de l’atelier.");
    }
  };

  const openEditModal = (atelier: Atelier) => {
    setSelectedAtelier(atelier);
    setEditAtelier({
      nom: atelier.nom,
      description: atelier.description,
      date: atelier.date.split("T")[0], // Format pour input date
      duree: atelier.duree.toString(),
      prix: atelier.prix,
      places_totales: atelier.places_totales.toString(),
      is_active: atelier.is_active,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedAtelier(null);
  };

  const handleEditAtelier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAtelier) return;
    try {
      const atelierData = {
        nom: editAtelier.nom,
        description: editAtelier.description,
        date: editAtelier.date, // Format attendu : "YYYY-MM-DD"
        duree: parseInt(editAtelier.duree) || 0,
        prix: parseFloat(editAtelier.prix).toString() || "0",
        places_totales: parseInt(editAtelier.places_totales) || 0,
        is_active: editAtelier.is_active,
      };
      await api.put(`/ateliers/${selectedAtelier.id}/`, atelierData);
      closeEditModal();
      fetchAteliers();
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour de l’atelier:", err.response?.data);
      setError("Erreur lors de la mise à jour de l’atelier.");
    }
  };

  const openDeleteModal = (atelier: Atelier) => {
    setSelectedAtelier(atelier);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedAtelier(null);
  };

  const handleDeleteAtelier = async () => {
    if (!selectedAtelier) return;
    try {
      await api.delete(`/ateliers/${selectedAtelier.id}/`);
      closeDeleteModal();
      fetchAteliers();
    } catch (err: any) {
      console.error("Erreur lors de la suppression de l’atelier:", err.response?.data);
      setError("Erreur lors de la suppression de l’atelier.");
    }
  };

  const renderAteliersPlaceholder = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-lightCard dark:bg-darkCard">
          <tr className="border-b border-lightBorder dark:border-darkBorder">
            {["ID", "Nom", "Date", "Durée", "Prix", "Places Totales", "Places Dispo", "Statut", "Actions"].map(
              (header) => (
                <th key={header} className="py-3 px-4">
                  <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index} className="border-b border-lightBorder dark:border-darkBorder animate-pulse">
              <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
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
          <Calendar className="h-6 w-6 mr-2" /> Gestion des Ateliers
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
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
          <ButtonPrimary onClick={openAddModal} className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center">
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un atelier
          </ButtonPrimary>
        </div>

        {loading ? (
          renderAteliersPlaceholder()
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
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Date</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Durée (min)</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Prix (FCFA)</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Places Totales</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Places Dispo</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Statut</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ateliers.length > 0 ? (
                    ateliers.map((atelier) => (
                      <tr
                        key={atelier.id}
                        className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.id}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.nom}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {new Date(atelier.date).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.duree}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.prix}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.places_totales}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.places_disponibles}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              atelier.is_active
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {atelier.is_active ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <ButtonPrimary
                            onClick={() => openEditModal(atelier)}
                            className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                          >
                            <Edit className="h-4 w-4 mr-1" /> Modifier
                          </ButtonPrimary>
                          <ButtonPrimary
                            onClick={() => openDeleteModal(atelier)}
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
                        Aucun atelier trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de {(currentPage - 1) * ateliersPerPage + 1} à{" "}
                {Math.min(currentPage * ateliersPerPage, totalAteliers)} sur {totalAteliers} ateliers
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
          <ModalContainer isOpen={isAddModalOpen} onClose={closeAddModal} title="Ajouter un atelier" size="md">
            <ModalBody>
              <form onSubmit={handleAddAtelier} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                  <input
                    type="text"
                    value={newAtelier.nom}
                    onChange={(e) => setNewAtelier({ ...newAtelier, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea
                    value={newAtelier.description}
                    onChange={(e) => setNewAtelier({ ...newAtelier, description: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date</label>
                  <input
                    type="datetime-local"
                    value={newAtelier.date}
                    onChange={(e) => setNewAtelier({ ...newAtelier, date: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Durée (minutes)</label>
                  <input
                    type="number"
                    value={newAtelier.duree}
                    onChange={(e) => setNewAtelier({ ...newAtelier, duree: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prix (FCFA)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAtelier.prix}
                    onChange={(e) => setNewAtelier({ ...newAtelier, prix: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Places totales</label>
                  <input
                    type="number"
                    value={newAtelier.places_totales}
                    onChange={(e) => setNewAtelier({ ...newAtelier, places_totales: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input
                    type="checkbox"
                    checked={newAtelier.is_active}
                    onChange={(e) => setNewAtelier({ ...newAtelier, is_active: e.target.checked })}
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
        {isEditModalOpen && selectedAtelier && (
          <ModalContainer isOpen={isEditModalOpen} onClose={closeEditModal} title="Modifier l’atelier" size="md">
            <ModalBody>
              <form onSubmit={handleEditAtelier} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                  <input
                    type="text"
                    value={editAtelier.nom}
                    onChange={(e) => setEditAtelier({ ...editAtelier, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea
                    value={editAtelier.description}
                    onChange={(e) => setEditAtelier({ ...editAtelier, description: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date</label>
                  <input
                    type="date"
                    value={editAtelier.date}
                    onChange={(e) => setEditAtelier({ ...editAtelier, date: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Durée (minutes)</label>
                  <input
                    type="number"
                    value={editAtelier.duree}
                    onChange={(e) => setEditAtelier({ ...editAtelier, duree: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prix (FCFA)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editAtelier.prix}
                    onChange={(e) => setEditAtelier({ ...editAtelier, prix: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Places totales</label>
                  <input
                    type="number"
                    value={editAtelier.places_totales}
                    onChange={(e) => setEditAtelier({ ...editAtelier, places_totales: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input
                    type="checkbox"
                    checked={editAtelier.is_active}
                    onChange={(e) => setEditAtelier({ ...editAtelier, is_active: e.target.checked })}
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
        {isDeleteModalOpen && selectedAtelier && (
          <ModalContainer isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Supprimer l’atelier" size="md">
            <ModalBody>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer l’atelier{" "}
                <span className="font-medium">{selectedAtelier.nom}</span> ?
              </p>
              <ModalFooter>
                <ButtonPrimary
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary onClick={handleDeleteAtelier} className="px-4 py-2 bg-red-500 text-white hover:bg-red-600">
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

export default AdminAteliersPage;