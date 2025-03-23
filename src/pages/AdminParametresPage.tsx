"use client";

import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { Settings, Search, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { ModalContainer, ModalBody, ModalFooter } from "../components/ModalContainer";

interface Parametre {
  id: number;
  cle: string;
  valeur: string;
  description: string | null;
  date_mise_a_jour: string;
}

interface ApiResponse {
  results: Parametre[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminParametresPage: React.FC = () => {
  const [parametres, setParametres] = useState<Parametre[]>([]);
  const [totalParametres, setTotalParametres] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParametre, setSelectedParametre] = useState<Parametre | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editParametre, setEditParametre] = useState({ cle: "", valeur: "", description: "" });
  const parametresPerPage = 10;

  useEffect(() => {
    fetchParametres();
  }, [currentPage, searchQuery]);

  const fetchParametres = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>("/parametres/", {
        params: { page: currentPage, per_page: parametresPerPage, search: searchQuery || undefined },
      });
      setParametres(response.data.results || []);
      setTotalParametres(response.data.count || 0);
      setTotalPages(Math.ceil((response.data.count || 0) / parametresPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des paramètres:", err.response?.data);
      setError("Erreur lors du chargement des paramètres.");
      setParametres([]);
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

  const openEditModal = (parametre: Parametre) => {
    setSelectedParametre(parametre);
    setEditParametre({
      cle: parametre.cle,
      valeur: parametre.valeur,
      description: parametre.description || "",
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedParametre(null);
  };

  const handleEditParametre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParametre) return;
    try {
      await api.put(`/parametres/${selectedParametre.id}/`, editParametre);
      closeEditModal();
      fetchParametres();
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du paramètre:", err.response?.data);
      setError("Erreur lors de la mise à jour du paramètre.");
    }
  };

  const otpParametres = parametres.filter((p) => p.cle.startsWith("otp_"));
  const otherParametres = parametres.filter((p) => !p.cle.startsWith("otp_"));

  const renderParametresPlaceholder = () => (
    <div className="space-y-8">
      {["Paramètres OTP", "Autres Paramètres"].map((section) => (
        <div key={section}>
          <div className="h-6 w-40 bg-gray-300 dark:bg-gray-600 rounded mb-4 animate-pulse"></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-lightCard dark:bg-darkCard">
                <tr className="border-b border-lightBorder dark:border-darkBorder">
                  {["ID", "Clé", "Valeur", "Description", "Dernière mise à jour", "Actions"].map((header) => (
                    <th key={header} className="py-3 px-4">
                      <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index} className="border-b border-lightBorder dark:border-darkBorder animate-pulse">
                    <td className="py-3 px-4"><div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <Settings className="h-6 w-6 mr-2" /> Gestion des Paramètres
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par clé ou valeur..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
            />
          </div>
        </div>

        {loading ? (
          renderParametresPlaceholder()
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <>
            {/* Section Paramètres OTP */}
            <div className="mb-8">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4">Paramètres OTP</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-lightCard dark:bg-darkCard">
                    <tr className="border-b border-lightBorder dark:border-darkBorder">
                      <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Clé</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Valeur</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Description</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Dernière mise à jour</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otpParametres.length > 0 ? (
                      otpParametres.map((parametre) => (
                        <tr
                          key={parametre.id}
                          className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{parametre.id}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{parametre.cle}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{parametre.valeur}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{parametre.description || "N/A"}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                            {new Date(parametre.date_mise_a_jour).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <ButtonPrimary
                              onClick={() => openEditModal(parametre)}
                              className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                            >
                              <Edit className="h-4 w-4 mr-1" /> Modifier
                            </ButtonPrimary>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                          Aucun paramètre OTP trouvé.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section Autres Paramètres */}
            <div className="mb-8">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4">Autres Paramètres</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-lightCard dark:bg-darkCard">
                    <tr className="border-b border-lightBorder dark:border-darkBorder">
                      <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Clé</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Valeur</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Description</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Dernière mise à jour</th>
                      <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherParametres.length > 0 ? (
                      otherParametres.map((parametre) => (
                        <tr
                          key={parametre.id}
                          className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{parametre.id}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{parametre.cle}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{parametre.valeur}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{parametre.description || "N/A"}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                            {new Date(parametre.date_mise_a_jour).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <ButtonPrimary
                              onClick={() => openEditModal(parametre)}
                              className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                            >
                              <Edit className="h-4 w-4 mr-1" /> Modifier
                            </ButtonPrimary>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                          Aucun autre paramètre trouvé.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de {(currentPage - 1) * parametresPerPage + 1} à{" "}
                {Math.min(currentPage * parametresPerPage, totalParametres)} sur {totalParametres} paramètres
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

        {/* Modal pour modifier un paramètre */}
        {isEditModalOpen && selectedParametre && (
          <ModalContainer
            isOpen={isEditModalOpen}
            onClose={closeEditModal}
            title={`Modifier le paramètre : ${selectedParametre.cle}`}
            size="md"
          >
            <ModalBody>
              <form onSubmit={handleEditParametre} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Clé</label>
                  <input
                    type="text"
                    value={editParametre.cle}
                    onChange={(e) => setEditParametre({ ...editParametre, cle: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green opacity-50 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Valeur</label>
                  <input
                    type={
                      editParametre.cle === "otp_length" || editParametre.cle === "otp_validity_minutes"
                        ? "number"
                        : "text"
                    }
                    value={editParametre.valeur}
                    onChange={(e) => setEditParametre({ ...editParametre, valeur: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                    min={
                      editParametre.cle === "otp_length"
                        ? 4
                        : editParametre.cle === "otp_validity_minutes"
                        ? 1
                        : undefined
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea
                    value={editParametre.description}
                    onChange={(e) => setEditParametre({ ...editParametre, description: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    rows={3}
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

export default AdminParametresPage;