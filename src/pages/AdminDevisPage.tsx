"use client";

import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { FileText, Search, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { ModalContainer, ModalBody, ModalFooter } from "../components/ModalContainer";

interface Devis {
  id: string;
  client_username: string;
  service: { id: string; nom: string };
  description: string;
  date_creation: string;
  date_soumission: string | null;
  date_expiration: string | null;
  statut: "brouillon" | "soumis" | "en_cours" | "accepte" | "refuse" | "expire";
  prix_demande: string | null;
  prix_propose: string | null;
  commentaire_admin: string | null;
  date_mise_a_jour: string;
  is_active: boolean;
}

interface ApiResponse {
  results: Devis[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminDevisPage: React.FC = () => {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [totalDevis, setTotalDevis] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatut, setFilterStatut] = useState<string>("all");
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseForm, setResponseForm] = useState({
    prix_propose: "",
    statut: "en_cours",
    commentaire_admin: "",
  });
  const devisPerPage = 10;

  useEffect(() => {
    fetchDevis();
  }, [currentPage, searchQuery, filterStatut]);

  const fetchDevis = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>("/devis/", {
        params: {
          page: currentPage,
          per_page: devisPerPage,
          search: searchQuery || undefined,
          statut: filterStatut !== "all" ? filterStatut : undefined,
          ordering: "-date_creation", // Tri par date de création décroissante
        },
      });
      setDevis(response.data.results || []);
      setTotalDevis(response.data.count || 0);
      setTotalPages(Math.ceil((response.data.count || 0) / devisPerPage));
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des devis:", err.response?.data);
      setError("Erreur lors du chargement des devis.");
      setDevis([]);
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStatut = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatut(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openResponseModal = (devis: Devis) => {
    setSelectedDevis(devis);
    setResponseForm({
      prix_propose: devis.prix_propose || "",
      statut: devis.statut === "brouillon" || devis.statut === "soumis" ? "en_cours" : devis.statut,
      commentaire_admin: devis.commentaire_admin || "",
    });
    setIsResponseModalOpen(true);
  };

  const closeResponseModal = () => {
    setIsResponseModalOpen(false);
    setSelectedDevis(null);
    setSuccess(null);
    setError(null);
  };

  const handleProposerReponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevis) return;

    try {
      await api.post(`/devis/${selectedDevis.id}/proposer_reponse/`, {
        prix_propose: responseForm.prix_propose ? parseFloat(responseForm.prix_propose) : null,
        statut: responseForm.statut,
        commentaire_admin: responseForm.commentaire_admin || null,
      });
      setSuccess("Réponse enregistrée avec succès !");
      setTimeout(() => {
        closeResponseModal();
        fetchDevis();
      }, 1500);
    } catch (err: any) {
      console.error("Erreur lors de la proposition de réponse:", err.response?.data);
      setError("Erreur lors de l’enregistrement de la réponse.");
    }
  };

  const getStatutDisplay = (statut: string) => {
    switch (statut) {
      case "brouillon": return "Brouillon";
      case "soumis": return "Soumis";
      case "en_cours": return "En cours";
      case "accepte": return "Accepté";
      case "refuse": return "Refusé";
      case "expire": return "Expiré";
      default: return statut;
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "brouillon": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "soumis": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "en_cours": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "accepte": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "refuse": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "expire": return "bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const renderDevisPlaceholder = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-lightCard dark:bg-darkCard">
          <tr className="border-b border-lightBorder dark:border-darkBorder">
            {["ID", "Client", "Service", "Date", "Prix demandé", "Prix proposé", "Statut", "Actions"].map((header) => (
              <th key={header} className="py-3 px-4">
                <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index} className="border-b border-lightBorder dark:border-darkBorder animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <td key={i} className="py-3 px-4">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </td>
              ))}
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
          <FileText className="h-6 w-6 mr-2" /> Gestion des Devis
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Rechercher par client, service ou description..."
                className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
              />
            </div>
            <select
              value={filterStatut}
              onChange={handleFilterStatut}
              className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
            >
              <option value="all">Tous les statuts</option>
              <option value="brouillon">Brouillon</option>
              <option value="soumis">Soumis</option>
              <option value="en_cours">En cours</option>
              <option value="accepte">Accepté</option>
              <option value="refuse">Refusé</option>
              <option value="expire">Expiré</option>
            </select>
          </div>
        </div>

        {loading ? (
          renderDevisPlaceholder()
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-lightCard dark:bg-darkCard">
                  <tr className="border-b border-lightBorder dark:border-darkBorder">
                    <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Client</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Service</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Date création</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Prix demandé (FCFA)</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Prix proposé (FCFA)</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Statut</th>
                    <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devis.length > 0 ? (
                    devis.map((devisItem) => (
                      <tr
                        key={devisItem.id}
                        className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{devisItem.id}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{devisItem.client_username}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{devisItem.service.nom}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {new Date(devisItem.date_creation).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {devisItem.prix_demande ? parseFloat(devisItem.prix_demande).toLocaleString("fr-FR") : "N/A"}
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {devisItem.prix_propose ? parseFloat(devisItem.prix_propose).toLocaleString("fr-FR") : "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(devisItem.statut)}`}
                          >
                            {getStatutDisplay(devisItem.statut)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <ButtonPrimary
                            onClick={() => openResponseModal(devisItem)}
                            className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                          >
                            <Edit className="h-4 w-4 mr-1" /> Répondre
                          </ButtonPrimary>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                        Aucun devis trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de {(currentPage - 1) * devisPerPage + 1} à{" "}
                {Math.min(currentPage * devisPerPage, totalDevis)} sur {totalDevis} devis
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

        {/* Modal pour proposer une réponse */}
        {isResponseModalOpen && selectedDevis && (
          <ModalContainer
            isOpen={isResponseModalOpen}
            onClose={closeResponseModal}
            title={`Répondre au Devis #${selectedDevis.id}`}
            size="md"
          >
            <ModalBody>
              <form onSubmit={handleProposerReponse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prix proposé (FCFA)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={responseForm.prix_propose}
                    onChange={(e) => setResponseForm({ ...responseForm, prix_propose: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Statut</label>
                  <select
                    value={responseForm.statut}
                    onChange={(e) => setResponseForm({ ...responseForm, statut: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                  >
                    <option value="en_cours">En cours</option>
                    <option value="accepte">Accepté</option>
                    <option value="refuse">Refusé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Commentaire</label>
                  <textarea
                    value={responseForm.commentaire_admin}
                    onChange={(e) => setResponseForm({ ...responseForm, commentaire_admin: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    rows={3}
                  />
                </div>
                {success && <div className="text-green-500 text-sm">{success}</div>}
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <ModalFooter>
                  <ButtonPrimary
                    type="button"
                    onClick={closeResponseModal}
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

export default AdminDevisPage;