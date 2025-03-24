"use client";

import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { CreditCard, Search, Edit, ChevronLeft, ChevronRight, PlusCircle, Truck, DollarSign, X } from "lucide-react";
import { ModalContainer, ModalBody, ModalFooter } from "../components/ModalContainer";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Produit {
  id: string;
  nom: string;
  prix: string;
}

interface AbonnementProduit {
  produit: Produit;
  quantite: number;
}

interface Abonnement {
  id: string;
  client: { id: string; username: string };
  type: string;
  abonnement_produits: AbonnementProduit[];
  date_debut: string;
  date_fin: string | null;
  prix: string;
  paiement_statut: string;
  is_active: boolean;
  prochaine_livraison: string | null;
  prochaine_facturation: string | null;
}

interface Stats {
  total_abonnements: number;
  active_abonnements: number;
  revenus: string;
  abonnements_by_type: { type: string; total: number }[];
}

interface ApiResponse {
  results: Abonnement[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminAbonnementsPage: React.FC = () => {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [totalAbonnements, setTotalAbonnements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingAbonnements, setLoadingAbonnements] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingProduits, setLoadingProduits] = useState(true);
  const [errorAbonnements, setErrorAbonnements] = useState<string | null>(null);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [errorClients, setErrorClients] = useState<string | null>(null);
  const [errorProduits, setErrorProduits] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedAbonnement, setSelectedAbonnement] = useState<Abonnement | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editAbonnement, setEditAbonnement] = useState({
    type: "",
    date_debut: "",
    date_fin: "",
    prix: "",
    paiement_statut: "non_paye",
    is_active: true,
    prochaine_livraison: "",
    prochaine_facturation: "",
  });
  const [newAbonnement, setNewAbonnement] = useState({
    client_id: "",
    type: "mensuel",
    date_debut: "",
    date_fin: "",
    produit_quantites: [{ produit_id: "", quantite: 1 }],
  });
  const [clients, setClients] = useState<{ id: string; username: string }[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const abonnementsPerPage = 10;

  useEffect(() => {
    fetchAbonnements();
    fetchStats();
    fetchClients();
    fetchProduits();
  }, [currentPage, searchQuery, filterType]);

  const fetchAbonnements = async () => {
    setLoadingAbonnements(true);
    try {
      const response = await api.get<ApiResponse>("/abonnements/", {
        params: { page: currentPage, per_page: abonnementsPerPage, search: searchQuery || undefined, type: filterType !== "all" ? filterType : undefined },
      });
      setAbonnements(response.data.results);
      setTotalAbonnements(response.data.count);
      setTotalPages(Math.ceil(response.data.count / abonnementsPerPage));
      setLoadingAbonnements(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des abonnements:", err.response?.data);
      setErrorAbonnements("Erreur lors du chargement des abonnements.");
      setLoadingAbonnements(false);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await api.get("/abonnements/stats/");
      setStats(response.data);
      setLoadingStats(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des statistiques:", err.response?.data);
      setErrorStats("Erreur lors du chargement des statistiques.");
      setLoadingStats(false);
    }
  };

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await api.get("/utilisateurs/", { params: { role: "client" } });
      setClients(response.data.results);
      setLoadingClients(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des clients:", err.response?.data);
      setErrorClients("Erreur lors du chargement des clients.");
      setLoadingClients(false);
    }
  };

  const fetchProduits = async () => {
    setLoadingProduits(true);
    try {
      const response = await api.get("/produits/");
      setProduits(response.data.results);
      setLoadingProduits(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des produits:", err.response?.data);
      setErrorProduits("Erreur lors du chargement des produits.");
      setLoadingProduits(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openAddModal = () => {
    setNewAbonnement({
      client_id: clients[0]?.id || "",
      type: "mensuel",
      date_debut: new Date().toISOString().split("T")[0],
      date_fin: "",
      produit_quantites: [{ produit_id: produits[0]?.id || "", quantite: 1 }],
    });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const openEditModal = (abonnement: Abonnement) => {
    setSelectedAbonnement(abonnement);
    setEditAbonnement({
      type: abonnement.type,
      date_debut: abonnement.date_debut.split("T")[0],
      date_fin: abonnement.date_fin ? abonnement.date_fin.split("T")[0] : "",
      prix: abonnement.prix,
      paiement_statut: abonnement.paiement_statut,
      is_active: abonnement.is_active,
      prochaine_livraison: abonnement.prochaine_livraison ? abonnement.prochaine_livraison.split("T")[0] : "",
      prochaine_facturation: abonnement.prochaine_facturation ? abonnement.prochaine_facturation.split("T")[0] : "",
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedAbonnement(null);
  };

  const handleEditAbonnement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAbonnement) return;
    try {
      const data = {
        ...editAbonnement,
        prix: parseFloat(editAbonnement.prix).toString(),
        date_fin: editAbonnement.date_fin || null,
        prochaine_livraison: editAbonnement.prochaine_livraison || null,
        prochaine_facturation: editAbonnement.prochaine_facturation || null,
      };
      await api.put(`/abonnements/${selectedAbonnement.id}/`, data);
      closeEditModal();
      fetchAbonnements();
      fetchStats();
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour de l’abonnement:", err.response?.data);
      setErrorAbonnements("Erreur lors de la mise à jour de l’abonnement.");
    }
  };

  const handleGenerateOrder = async (abonnementId: string) => {
    try {
      await api.post(`/abonnements/${abonnementId}/generer_commande_manuelle/`);
      fetchAbonnements();
      alert("Commande générée avec succès.");
    } catch (err: any) {
      console.error("Erreur lors de la génération de la commande:", err.response?.data);
      setErrorAbonnements("Erreur lors de la génération de la commande.");
    }
  };

  const handleFacturer = async (abonnementId: string) => {
    try {
      await api.post(`/abonnements/${abonnementId}/facturer/`);
      fetchAbonnements();
      fetchStats();
      alert("Facturation effectuée avec succès.");
    } catch (err: any) {
      console.error("Erreur lors de la facturation:", err.response?.data);
      setErrorAbonnements("Erreur lors de la facturation.");
    }
  };

  const handleAddAbonnement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...newAbonnement,
        produit_quantites: newAbonnement.produit_quantites.map((p) => ({ produit_id: p.produit_id, quantite: p.quantite })),
        date_fin: newAbonnement.date_fin || null,
      };
      await api.post("/abonnements/", data);
      closeAddModal();
      fetchAbonnements();
      fetchStats();
    } catch (err: any) {
      console.error("Erreur lors de la création de l’abonnement:", err.response?.data);
      setErrorAbonnements("Erreur lors de la création de l’abonnement.");
    }
  };

  const addProduitField = () => {
    setNewAbonnement({
      ...newAbonnement,
      produit_quantites: [...newAbonnement.produit_quantites, { produit_id: produits[0]?.id || "", quantite: 1 }],
    });
  };

  const removeProduitField = (index: number) => {
    setNewAbonnement({
      ...newAbonnement,
      produit_quantites: newAbonnement.produit_quantites.filter((_, i) => i !== index),
    });
  };

  const updateProduitQuantite = (index: number, field: "produit_id" | "quantite", value: string | number) => {
    const updatedProduits = newAbonnement.produit_quantites.map((pq, i) =>
      i === index ? { ...pq, [field]: value } : pq
    );
    setNewAbonnement({ ...newAbonnement, produit_quantites: updatedProduits });
  };

  const abonnementsChartData = {
    labels: stats ? stats.abonnements_by_type.map((item) => item.type) : [],
    datasets: [{ label: "Abonnements par type", data: stats ? stats.abonnements_by_type.map((item) => item.total) : [], backgroundColor: "#2196F3" }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" as const }, title: { display: true, text: "Abonnements actifs par type" } },
  };

  const renderAbonnementsPlaceholder = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-lightCard dark:bg-darkCard">
          <tr className="border-b border-lightBorder dark:border-darkBorder">
            {["ID", "Client", "Type", "Produits", "Début", "Fin", "Prix (FCFA)", "Statut Paiement", "Prochaine Livraison", "Prochaine Facturation", "Actif", "Actions"].map((header) => (
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
              <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
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
          <CreditCard className="h-6 w-6 mr-2" /> Gestion des Abonnements
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher par client..."
              className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={handleFilterType}
              className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="mensuel">Mensuel</option>
              <option value="hebdomadaire">Hebdomadaire</option>
              <option value="annuel">Annuel</option>
            </select>
            <ButtonPrimary onClick={openAddModal} className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center">
              <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un abonnement
            </ButtonPrimary>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {loadingStats ? (
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md animate-pulse">
                  <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </>
          ) : errorStats ? (
            <div className="col-span-3 text-center py-4 text-red-500">{errorStats}</div>
          ) : (
            <>
              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Total Abonnements</h2>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats?.total_abonnements}</p>
              </div>
              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Abonnements Actifs</h2>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats?.active_abonnements}</p>
              </div>
              <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Revenus (FCFA)</h2>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats?.revenus}</p>
              </div>
            </>
          )}
        </div>

        <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Abonnements par type</h2>
          {loadingStats ? (
            <div className="h-48 sm:h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : errorStats ? (
            <div className="text-center py-4 text-red-500">{errorStats}</div>
          ) : (
            <div className="h-48 sm:h-64"><Bar data={abonnementsChartData} options={chartOptions} /></div>
          )}
        </div>

        {loadingAbonnements ? (
          renderAbonnementsPlaceholder()
        ) : errorAbonnements ? (
          <div className="text-center py-8 text-red-500">{errorAbonnements}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-lightCard dark:bg-darkCard">
                <tr className="border-b border-lightBorder dark:border-darkBorder">
                  <th className="py-3 px-4 text-lightText dark:text-darkText">ID</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Client</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Type</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Produits</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Début</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Fin</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Prix (FCFA)</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Statut Paiement</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Prochaine Livraison</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Prochaine Facturation</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Actif</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
                </tr>
              </thead>
              <tbody>
                {abonnements.map((abonnement) => (
                  <tr key={abonnement.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.id}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.client.username}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.type}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {abonnement.abonnement_produits.map((ap) => `${ap.produit.nom} (x${ap.quantite})`).join(", ")}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(abonnement.date_debut).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {abonnement.date_fin ? new Date(abonnement.date_fin).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.prix}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.paiement_statut}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {abonnement.prochaine_livraison ? new Date(abonnement.prochaine_livraison).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {abonnement.prochaine_facturation ? new Date(abonnement.prochaine_facturation).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          abonnement.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {abonnement.is_active ? "Oui" : "Non"}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <ButtonPrimary
                        onClick={() => openEditModal(abonnement)}
                        className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                      >
                        <Edit className="h-4 w-4 mr-1" /> Modifier
                      </ButtonPrimary>
                      <ButtonPrimary
                        onClick={() => handleGenerateOrder(abonnement.id)}
                        className="px-2 py-1 bg-green-500 text-white hover:bg-green-600 flex items-center text-sm"
                      >
                        <Truck className="h-4 w-4 mr-1" /> Générer Commande
                      </ButtonPrimary>
                      <ButtonPrimary
                        onClick={() => handleFacturer(abonnement.id)}
                        className="px-2 py-1 bg-yellow-500 text-white hover:bg-yellow-600 flex items-center text-sm"
                      >
                        <DollarSign className="h-4 w-4 mr-1" /> Facturer
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
            Affichage de {(currentPage - 1) * abonnementsPerPage + 1} à{" "}
            {Math.min(currentPage * abonnementsPerPage, totalAbonnements)} sur {totalAbonnements} abonnements
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
          <ModalContainer isOpen={isAddModalOpen} onClose={closeAddModal} title="Ajouter un abonnement" size="md">
            <ModalBody>
              <form onSubmit={handleAddAbonnement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Client</label>
                  {loadingClients ? (
                    <div className="text-center py-2 text-gray-500 dark:text-gray-400">Chargement des clients...</div>
                  ) : errorClients ? (
                    <div className="text-center py-2 text-red-500">{errorClients}</div>
                  ) : (
                    <select
                      value={newAbonnement.client_id}
                      onChange={(e) => setNewAbonnement({ ...newAbonnement, client_id: e.target.value })}
                      className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                      required
                    >
                      <option value="">Sélectionner un client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.username}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Type</label>
                  <select
                    value={newAbonnement.type}
                    onChange={(e) => setNewAbonnement({ ...newAbonnement, type: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                  >
                    <option value="mensuel">Mensuel</option>
                    <option value="hebdomadaire">Hebdomadaire</option>
                    <option value="annuel">Annuel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date de début</label>
                  <input
                    type="date"
                    value={newAbonnement.date_debut}
                    onChange={(e) => setNewAbonnement({ ...newAbonnement, date_debut: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={newAbonnement.date_fin}
                    onChange={(e) => setNewAbonnement({ ...newAbonnement, date_fin: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Produits</label>
                  {loadingProduits ? (
                    <div className="text-center py-2 text-gray-500 dark:text-gray-400">Chargement des produits...</div>
                  ) : errorProduits ? (
                    <div className="text-center py-2 text-red-500">{errorProduits}</div>
                  ) : (
                    newAbonnement.produit_quantites.map((pq, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <select
                          value={pq.produit_id}
                          onChange={(e) => updateProduitQuantite(index, "produit_id", e.target.value)}
                          className="w-2/3 px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                          required
                        >
                          <option value="">Sélectionner un produit</option>
                          {produits.map((produit) => (
                            <option key={produit.id} value={produit.id}>
                              {produit.nom} ({produit.prix} FCFA)
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={pq.quantite}
                          onChange={(e) => updateProduitQuantite(index, "quantite", parseInt(e.target.value))}
                          className="w-1/3 px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                          required
                        />
                        {index > 0 && (
                          <ButtonPrimary
                            onClick={() => removeProduitField(index)}
                            className="px-2 py-1 bg-red-500 text-white hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </ButtonPrimary>
                        )}
                      </div>
                    ))
                  )}
                  <ButtonPrimary
                    type="button"
                    onClick={addProduitField}
                    className="mt-2 px-2 py-1 bg-green-500 text-white hover:bg-green-600 flex items-center text-sm"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" /> Ajouter un produit
                  </ButtonPrimary>
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
                    Créer
                  </ButtonPrimary>
                </ModalFooter>
              </form>
            </ModalBody>
          </ModalContainer>
        )}

        {/* Modal d'édition */}
        {isEditModalOpen && selectedAbonnement && (
          <ModalContainer isOpen={isEditModalOpen} onClose={closeEditModal} title="Modifier l’abonnement" size="md">
            <ModalBody>
              <form onSubmit={handleEditAbonnement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Type</label>
                  <select
                    value={editAbonnement.type}
                    onChange={(e) => setEditAbonnement({ ...editAbonnement, type: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                  >
                    <option value="mensuel">Mensuel</option>
                    <option value="hebdomadaire">Hebdomadaire</option>
                    <option value="annuel">Annuel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date de début</label>
                  <input
                    type="date"
                    value={editAbonnement.date_debut}
                    onChange={(e) => setEditAbonnement({ ...editAbonnement, date_debut: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={editAbonnement.date_fin}
                    onChange={(e) => setEditAbonnement({ ...editAbonnement, date_fin: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prix (FCFA)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editAbonnement.prix}
                    onChange={(e) => setEditAbonnement({ ...editAbonnement, prix: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Statut de paiement</label>
                  <select
                    value={editAbonnement.paiement_statut}
                    onChange={(e) => setEditAbonnement({ ...editAbonnement, paiement_statut: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                  >
                    <option value="non_paye">Non payé</option>
                    <option value="paye_complet">Payé en une fois</option>
                    <option value="paye_mensuel">Payé mensuellement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prochaine livraison</label>
                  <input
                    type="date"
                    value={editAbonnement.prochaine_livraison}
                    onChange={(e) => setEditAbonnement({ ...editAbonnement, prochaine_livraison: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prochaine facturation</label>
                  <input
                    type="date"
                    value={editAbonnement.prochaine_facturation}
                    onChange={(e) => setEditAbonnement({ ...editAbonnement, prochaine_facturation: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-soft-green dark:focus:ring-dark-soft-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input
                    type="checkbox"
                    checked={editAbonnement.is_active}
                    onChange={(e) => setEditAbonnement({ ...editAbonnement, is_active: e.target.checked })}
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
      </div>
    </AdminLayout>
  );
};

export default AdminAbonnementsPage;