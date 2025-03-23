"use client";

import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { Wrench, Search, Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { ModalContainer, ModalBody, ModalFooter } from "../components/ModalContainer";

interface Service {
  id: string;
  nom: string;
  description: string;
  photos: string[];
  is_active: boolean;
  date_creation: string;
}

interface ApiResponse {
  results: Service[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [totalServices, setTotalServices] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    nom: "",
    description: "",
    photos: [] as File[],
    is_active: true,
  });
  const [editService, setEditService] = useState({
    nom: "",
    description: "",
    photos: [] as File[],
    is_active: true,
  });
  const servicesPerPage = 10;

  useEffect(() => {
    fetchServices();
  }, [currentPage, searchQuery]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>("/services/", {
        params: { page: currentPage, per_page: servicesPerPage, search: searchQuery || undefined },
      });
      setServices(response.data.results || []);
      setTotalServices(response.data.count || 0);
      setTotalPages(Math.ceil((response.data.count || 0) / servicesPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des services:", err.response?.data);
      setError("Erreur lors du chargement des services.");
      setServices([]);
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
    setNewService({ nom: "", description: "", photos: [], is_active: true });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddService = async (e: React.FormEvent | MouseEvent | undefined) => {
    e && e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("nom", newService.nom);
      formData.append("description", newService.description);
      formData.append("is_active", String(newService.is_active));
      newService.photos.forEach((photo) => formData.append("photos", photo));

      await api.post("/services/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      closeAddModal();
      fetchServices();
    } catch (err: any) {
      console.error("Erreur lors de l’ajout du service:", err.response?.data);
      setError("Erreur lors de l’ajout du service.");
    }
  };

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setEditService({
      nom: service.nom,
      description: service.description,
      photos: [], // Photos existantes non ré-éditées ici, nouvelles ajoutées via input
      is_active: service.is_active,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedService(null);
  };

  const handleEditService = async (e: React.FormEvent | MouseEvent | undefined) => {
    e && e.preventDefault();
    if (!selectedService) return;

    try {
      const formData = new FormData();
      formData.append("nom", editService.nom);
      formData.append("description", editService.description);
      formData.append("is_active", String(editService.is_active));
      editService.photos.forEach((photo) => formData.append("photos", photo));

      await api.put(`/services/${selectedService.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      closeEditModal();
      fetchServices();
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du service:", err.response?.data);
      setError("Erreur lors de la mise à jour du service.");
    }
  };

  const openDeleteModal = (service: Service) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedService(null);
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    try {
      await api.delete(`/services/${selectedService.id}/`);
      closeDeleteModal();
      fetchServices();
    } catch (err: any) {
      console.error("Erreur lors de la suppression du service:", err.response?.data);
      setError("Erreur lors de la suppression du service.");
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: "new" | "edit") => {
    const files = e.target.files;
    if (files) {
      const photoFiles = Array.from(files);
      if (type === "new") {
        setNewService({ ...newService, photos: photoFiles });
      } else {
        setEditService({ ...editService, photos: photoFiles });
      }
    }
  };

  const renderServicesPlaceholder = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-lightCard dark:bg-darkCard">
          <tr className="border-b border-lightBorder dark:border-darkBorder">
            {["ID", "Nom", "Photos", "Statut", "Actions"].map((header) => (
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
          <Wrench className="h-6 w-6 mr-2" /> Gestion des Services
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
          <ButtonPrimary
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un service
          </ButtonPrimary>
        </div>

        {loading ? (
          renderServicesPlaceholder()
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : services.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-lightCard dark:bg-darkCard">
                  <tr className="border-b border-lightBorder dark:border-darkBorder">
                    <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Nom</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Photos</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Statut</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr
                      key={service.id}
                      className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{service.id}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{service.nom}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{service.photos.length} photo(s)</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            service.is_active
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {service.is_active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <ButtonPrimary
                          onClick={() => openEditModal(service)}
                          className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                        >
                          <Edit className="h-4 w-4 mr-1" /> Modifier
                        </ButtonPrimary>
                        <ButtonPrimary
                          onClick={() => openDeleteModal(service)}
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
                Affichage de {(currentPage - 1) * servicesPerPage + 1} à{" "}
                {Math.min(currentPage * servicesPerPage, totalServices)} sur {totalServices} services
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
          <div className="text-center py-8 text-gray-700 dark:text-gray-300">Aucun service trouvé.</div>
        )}

        {/* Modal pour ajouter un service */}
        <ModalContainer isOpen={isAddModalOpen} onClose={closeAddModal} title="Ajouter un service" size="md">
          <ModalBody>
            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                <input
                  type="text"
                  value={newService.nom}
                  onChange={(e) => setNewService({ ...newService, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Photos</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handlePhotoChange(e, "new")}
                  className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-darkCard file:text-blue-700 dark:file:text-darkText hover:file:bg-blue-100 dark:hover:file:bg-gray-600"
                />
                {newService.photos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newService.photos.map((photo, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs flex items-center"
                      >
                        {photo.name}
                        <button
                          type="button"
                          onClick={() =>
                            setNewService({
                              ...newService,
                              photos: newService.photos.filter((_, i) => i !== index),
                            })
                          }
                          className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                <input
                  type="checkbox"
                  checked={newService.is_active}
                  onChange={(e) => setNewService({ ...newService, is_active: e.target.checked })}
                  className="h-5 w-5 text-soft-green dark:text-dark-soft-green focus:ring-soft-green dark:focus:ring-dark-soft-green border-lightBorder dark:border-darkBorder rounded"
                />
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
              onClick={(e) => handleAddService(e)}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600"
            >
              Ajouter
            </ButtonPrimary>
          </ModalFooter>
        </ModalContainer>

        {/* Modal pour modifier un service */}
        <ModalContainer isOpen={isEditModalOpen} onClose={closeEditModal} title="Modifier le service" size="md">
          {selectedService && (
            <>
              <ModalBody>
                <form onSubmit={handleEditService} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                    <input
                      type="text"
                      value={editService.nom}
                      onChange={(e) => setEditService({ ...editService, nom: e.target.value })}
                      className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                    <textarea
                      value={editService.description}
                      onChange={(e) => setEditService({ ...editService, description: e.target.value })}
                      className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">
                      Photos (nouvelles uniquement)
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handlePhotoChange(e, "edit")}
                      className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-darkCard file:text-blue-700 dark:file:text-darkText hover:file:bg-blue-100 dark:hover:file:bg-gray-600"
                    />
                    {editService.photos.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {editService.photos.map((photo, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs flex items-center"
                          >
                            {photo.name}
                            <button
                              type="button"
                              onClick={() =>
                                setEditService({
                                  ...editService,
                                  photos: editService.photos.filter((_, i) => i !== index),
                                })
                              }
                              className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {selectedService.photos.length > 0 && (
                      <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Photos existantes : {selectedService.photos.length} (non modifiables ici)
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                    <input
                      type="checkbox"
                      checked={editService.is_active}
                      onChange={(e) => setEditService({ ...editService, is_active: e.target.checked })}
                      className="h-5 w-5 text-soft-green dark:text-dark-soft-green focus:ring-soft-green dark:focus:ring-dark-soft-green border-lightBorder dark:border-darkBorder rounded"
                    />
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
                  onClick={(e) => handleEditService(e)}
                  className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600"
                >
                  Enregistrer
                </ButtonPrimary>
              </ModalFooter>
            </>
          )}
        </ModalContainer>

        {/* Modal pour supprimer un service */}
        <ModalContainer isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Supprimer le service" size="sm">
          {selectedService && (
            <>
              <ModalBody>
                <p className="text-lightText dark:text-darkText">
                  Êtes-vous sûr de vouloir supprimer le service{" "}
                  <span className="font-medium">{selectedService.nom}</span> ?
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
                  onClick={handleDeleteService}
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

export default AdminServicesPage;