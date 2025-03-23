"use client";

import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { Wrench, Search, Edit, Trash2, PlusCircle, Eye, ChevronLeft, ChevronRight, X } from "lucide-react";
import { ModalContainer, ModalBody, ModalFooter } from "../components/ModalContainer";

interface Service {
  id: string;
  nom: string;
}

interface Photo {
  id: string;
  image: string; // URL de l'image
  uploaded_at: string;
}

interface Realisation {
  id: string;
  service: Service;
  titre: string;
  description: string;
  photos: Photo[]; // Changement ici pour utiliser l'interface Photo
  date: string;
  admin: string;
  is_active: boolean;
}

interface ApiResponse {
  results: Realisation[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminRealisationsPage: React.FC = () => {
  const [realisations, setRealisations] = useState<Realisation[]>([]);
  const [totalRealisations, setTotalRealisations] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingRealisations, setLoadingRealisations] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [errorRealisations, setErrorRealisations] = useState<string | null>(null);
  const [errorServices, setErrorServices] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [selectedRealisation, setSelectedRealisation] = useState<Realisation | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // Nouveau modal pour les détails
  const [newRealisation, setNewRealisation] = useState({
    service_id: "",
    titre: "",
    description: "",
    photos: [] as File[],
    date: "",
    is_active: true,
  });
  const [editRealisation, setEditRealisation] = useState({
    service_id: "",
    titre: "",
    description: "",
    photos: [] as File[],
    date: "",
    is_active: true,
  });
  const realisationsPerPage = 10;

  useEffect(() => {
    fetchRealisations();
    fetchServices();
  }, [currentPage, searchQuery]);

  const fetchRealisations = async () => {
    setLoadingRealisations(true);
    try {
      const response = await api.get<ApiResponse>("/realisations/", {
        params: { page: currentPage, per_page: realisationsPerPage, search: searchQuery || undefined },
      });
      setRealisations(response.data.results);
      setTotalRealisations(response.data.count);
      setTotalPages(Math.ceil(response.data.count / realisationsPerPage));
      setLoadingRealisations(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des réalisations:", err.response?.data);
      setErrorRealisations("Erreur lors du chargement des réalisations.");
      setLoadingRealisations(false);
    }
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const response = await api.get<{ results: Service[] }>("/services/");
      setServices(response.data.results);
      setLoadingServices(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des services:", err.response?.data);
      setErrorServices("Erreur lors du chargement des services.");
      setLoadingServices(false);
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
    setNewRealisation({
      service_id: services[0]?.id || "",
      titre: "",
      description: "",
      photos: [],
      date: new Date().toISOString().split("T")[0],
      is_active: true,
    });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const handleAddRealisation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("service", newRealisation.service_id);
      formData.append("titre", newRealisation.titre);
      formData.append("description", newRealisation.description);
      formData.append("date", newRealisation.date);
      formData.append("is_active", newRealisation.is_active.toString());
      const response = await api.post("/realisations/", formData);
      const realisationId = response.data.id;

      for (const photo of newRealisation.photos) {
        const photoFormData = new FormData();
        photoFormData.append("image", photo);
        photoFormData.append("entity_type", "realisation");
        photoFormData.append("entity_id", realisationId);
        await api.post("/photos/", photoFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      closeAddModal();
      fetchRealisations();
    } catch (err: any) {
      console.error("Erreur lors de l’ajout de la réalisation:", err.response?.data);
      setErrorRealisations("Erreur lors de l’ajout de la réalisation.");
    }
  };

  const openEditModal = (realisation: Realisation) => {
    setSelectedRealisation(realisation);
    setEditRealisation({
      service_id: realisation.service.id,
      titre: realisation.titre,
      description: realisation.description,
      photos: [],
      date: realisation.date.split("T")[0],
      is_active: realisation.is_active,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRealisation(null);
  };

  const handleEditRealisation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRealisation) return;
    try {
      const formData = new FormData();
      formData.append("service", editRealisation.service_id);
      formData.append("titre", editRealisation.titre);
      formData.append("description", editRealisation.description);
      formData.append("date", editRealisation.date);
      formData.append("is_active", editRealisation.is_active.toString());
      await api.put(`/realisations/${selectedRealisation.id}/`, formData);

      for (const photo of editRealisation.photos) {
        const photoFormData = new FormData();
        photoFormData.append("image", photo);
        photoFormData.append("entity_type", "realisation");
        photoFormData.append("entity_id", selectedRealisation.id);
        await api.post("/photos/", photoFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      closeEditModal();
      fetchRealisations();
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour de la réalisation:", err.response?.data);
      setErrorRealisations("Erreur lors de la mise à jour de la réalisation.");
    }
  };

  const openDeleteModal = (realisation: Realisation) => {
    setSelectedRealisation(realisation);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRealisation(null);
  };

  const handleDeleteRealisation = async () => {
    if (!selectedRealisation) return;
    try {
      await api.delete(`/realisations/${selectedRealisation.id}/`);
      closeDeleteModal();
      fetchRealisations();
    } catch (err: any) {
      console.error("Erreur lors de la suppression de la réalisation:", err.response?.data);
      setErrorRealisations("Erreur lors de la suppression de la réalisation.");
    }
  };

  const openDetailsModal = (realisation: Realisation) => {
    setSelectedRealisation(realisation);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRealisation(null);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!selectedRealisation) return;
    try {
      await api.delete(`/photos/${photoId}/`);
      setSelectedRealisation({
        ...selectedRealisation,
        photos: selectedRealisation.photos.filter((photo) => photo.id !== photoId),
      });
      fetchRealisations();
    } catch (err: any) {
      console.error("Erreur lors de la suppression de la photo:", err.response?.data);
      setErrorRealisations("Erreur lors de la suppression de la photo.");
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: "new" | "edit") => {
    const files = Array.from(e.target.files || []);
    if (type === "new") {
      setNewRealisation({ ...newRealisation, photos: [...newRealisation.photos, ...files] });
    } else {
      setEditRealisation({ ...editRealisation, photos: [...editRealisation.photos, ...files] });
    }
  };

  const removeNewPhoto = (index: number, type: "new" | "edit") => {
    if (type === "new") {
      setNewRealisation({
        ...newRealisation,
        photos: newRealisation.photos.filter((_, i) => i !== index),
      });
    } else {
      setEditRealisation({
        ...editRealisation,
        photos: editRealisation.photos.filter((_, i) => i !== index),
      });
    }
  };

  const renderRealisationsPlaceholder = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-lightCard dark:bg-darkCard">
          <tr className="border-b border-lightBorder dark:border-darkBorder">
            {["ID", "Service", "Titre", "Photos", "Date", "Statut", "Actions"].map((header) => (
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
              <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
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
          <Wrench className="h-6 w-6 mr-2" /> Gestion des Réalisations
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
          <ButtonPrimary
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter une réalisation
          </ButtonPrimary>
        </div>

        {loadingRealisations ? (
          renderRealisationsPlaceholder()
        ) : errorRealisations ? (
          <div className="text-center py-8 text-red-500">{errorRealisations}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-lightCard dark:bg-darkCard">
                <tr className="border-b border-lightBorder dark:border-darkBorder">
                  <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Service</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Titre</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Photos</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Date</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Statut</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
                </tr>
              </thead>
              <tbody>
                {realisations.map((realisation) => (
                  <tr
                    key={realisation.id}
                    className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{realisation.id}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{realisation.service.nom}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{realisation.titre}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{realisation.photos.length}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {new Date(realisation.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          realisation.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {realisation.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <ButtonPrimary
                        onClick={() => openDetailsModal(realisation)}
                        className="px-2 py-1 bg-gray-500 text-white hover:bg-gray-600 flex items-center text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" /> Détails
                      </ButtonPrimary>
                      <ButtonPrimary
                        onClick={() => openEditModal(realisation)}
                        className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                      >
                        <Edit className="h-4 w-4 mr-1" /> Modifier
                      </ButtonPrimary>
                      <ButtonPrimary
                        onClick={() => openDeleteModal(realisation)}
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

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * realisationsPerPage + 1} à{" "}
            {Math.min(currentPage * realisationsPerPage, totalRealisations)} sur {totalRealisations} réalisations
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

        {/* Modal d'ajout */}
        {isAddModalOpen && (
          <ModalContainer isOpen={isAddModalOpen} onClose={closeAddModal} title="Ajouter une réalisation" size="md">
            <ModalBody>
              <form onSubmit={handleAddRealisation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Service</label>
                  {loadingServices ? (
                    <div className="text-center py-2 text-gray-500 dark:text-gray-400">Chargement des services...</div>
                  ) : errorServices ? (
                    <div className="text-center py-2 text-red-500">{errorServices}</div>
                  ) : (
                    <select
                      value={newRealisation.service_id}
                      onChange={(e) => setNewRealisation({ ...newRealisation, service_id: e.target.value })}
                      className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                      required
                    >
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.nom}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Titre</label>
                  <input
                    type="text"
                    value={newRealisation.titre}
                    onChange={(e) => setNewRealisation({ ...newRealisation, titre: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea
                    value={newRealisation.description}
                    onChange={(e) => setNewRealisation({ ...newRealisation, description: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePhotoChange(e, "new")}
                    className="w-full text-sm text-lightText dark:text-darkText file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                  />
                  {newRealisation.photos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {newRealisation.photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Preview ${index}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewPhoto(index, "new")}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date</label>
                  <input
                    type="date"
                    value={newRealisation.date}
                    onChange={(e) => setNewRealisation({ ...newRealisation, date: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input
                    type="checkbox"
                    checked={newRealisation.is_active}
                    onChange={(e) => setNewRealisation({ ...newRealisation, is_active: e.target.checked })}
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
        {isEditModalOpen && selectedRealisation && (
          <ModalContainer isOpen={isEditModalOpen} onClose={closeEditModal} title="Modifier la réalisation" size="md">
            <ModalBody>
              <form onSubmit={handleEditRealisation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Service</label>
                  {loadingServices ? (
                    <div className="text-center py-2 text-gray-500 dark:text-gray-400">Chargement des services...</div>
                  ) : errorServices ? (
                    <div className="text-center py-2 text-red-500">{errorServices}</div>
                  ) : (
                    <select
                      value={editRealisation.service_id}
                      onChange={(e) => setEditRealisation({ ...editRealisation, service_id: e.target.value })}
                      className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                      required
                    >
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.nom}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Titre</label>
                  <input
                    type="text"
                    value={editRealisation.titre}
                    onChange={(e) => setEditRealisation({ ...editRealisation, titre: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea
                    value={editRealisation.description}
                    onChange={(e) => setEditRealisation({ ...editRealisation, description: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Ajouter des photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePhotoChange(e, "edit")}
                    className="w-full text-sm text-lightText dark:text-darkText file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                  />
                  {editRealisation.photos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {editRealisation.photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Preview ${index}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewPhoto(index, "edit")}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date</label>
                  <input
                    type="date"
                    value={editRealisation.date}
                    onChange={(e) => setEditRealisation({ ...editRealisation, date: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input
                    type="checkbox"
                    checked={editRealisation.is_active}
                    onChange={(e) => setEditRealisation({ ...editRealisation, is_active: e.target.checked })}
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
        {isDeleteModalOpen && selectedRealisation && (
          <ModalContainer isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Supprimer la réalisation" size="md">
            <ModalBody>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer la réalisation{" "}
                <span className="font-medium">{selectedRealisation.titre}</span> ?
              </p>
              <ModalFooter>
                <ButtonPrimary
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Annuler
                </ButtonPrimary>
                <ButtonPrimary
                  onClick={handleDeleteRealisation}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Supprimer
                </ButtonPrimary>
              </ModalFooter>
            </ModalBody>
          </ModalContainer>
        )}

        {/* Modal de détails */}
        {isDetailsModalOpen && selectedRealisation && (
          <ModalContainer isOpen={isDetailsModalOpen} onClose={closeDetailsModal} title="Détails de la réalisation" size="lg">
            <ModalBody>
              <div className="space-y-2">
                <p className="text-lightText dark:text-darkText">
                  <strong>ID :</strong> {selectedRealisation.id}
                </p>
                <p className="text-lightText dark:text-darkText">
                  <strong>Service :</strong> {selectedRealisation.service.nom}
                </p>
                <p className="text-lightText dark:text-darkText">
                  <strong>Titre :</strong> {selectedRealisation.titre}
                </p>
                <p className="text-lightText dark:text-darkText">
                  <strong>Description :</strong> {selectedRealisation.description || "Aucune"}
                </p>
                <p className="text-lightText dark:text-darkText">
                  <strong>Date :</strong> {new Date(selectedRealisation.date).toLocaleDateString()}
                </p>
                <p className="text-lightText dark:text-darkText">
                  <strong>Statut :</strong> {selectedRealisation.is_active ? "Actif" : "Inactif"}
                </p>
                <div>
                  <strong className="text-lightText dark:text-darkText">Photos :</strong>
                  {selectedRealisation.photos.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedRealisation.photos.map((photo) => (
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
                    <p className="text-lightText dark:text-darkText">Aucune photo</p>
                  )}
                </div>
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
          </ModalContainer>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRealisationsPage;