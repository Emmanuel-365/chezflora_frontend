"use client";

import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import ButtonPrimary from "../components/ButtonPrimary";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { CreditCard, Search, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { ModalContainer, ModalBody, ModalFooter } from "../components/ModalContainer";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Produit {
  id: string;
  nom: string;
}

interface Abonnement {
  id: string;
  client: string;
  type: string;
  produits: Produit[];
  date_debut: string;
  date_fin: string | null;
  prix: string;
  is_active: boolean;
  prochaine_livraison: string | null;
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
  const [errorAbonnements, setErrorAbonnements] = useState<string | null>(null);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedAbonnement, setSelectedAbonnement] = useState<Abonnement | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAbonnement, setEditAbonnement] = useState({
    type: "",
    date_debut: "",
    date_fin: "",
    prix: "",
    is_active: true,
    prochaine_livraison: "",
  });
  const abonnementsPerPage = 10;

  useEffect(() => {
    fetchAbonnements();
    fetchStats();
  }, [currentPage, searchQuery, filterType]);

  const fetchAbonnements = async () => {
    setLoadingAbonnements(true);
    try {
      const response = await api.get<ApiResponse>("/abonnements/", {
        params: {
          page: currentPage,
          per_page: abonnementsPerPage,
          search: searchQuery || undefined,
          type: filterType !== "all" ? filterType : undefined,
        },
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
      const response = await api.get<Stats>("/abonnements/stats/");
      setStats(response.data);
      setLoadingStats(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des statistiques:", err.response?.data);
      setErrorStats("Erreur lors du chargement des statistiques.");
      setLoadingStats(false);
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

  const openEditModal = (abonnement: Abonnement) => {
    setSelectedAbonnement(abonnement);
    setEditAbonnement({
      type: abonnement.type,
      date_debut: abonnement.date_debut.split("T")[0],
      date_fin: abonnement.date_fin ? abonnement.date_fin.split("T")[0] : "",
      prix: abonnement.prix,
      is_active: abonnement.is_active,
      prochaine_livraison: abonnement.prochaine_livraison ? abonnement.prochaine_livraison.split("T")[0] : "",
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

  const abonnementsChartData = {
    labels: stats?.abonnements_by_type.map((item) => item.type) || [],
    datasets: [
      {
        label: "Abonnements par type",
        data: stats?.abonnements_by_type.map((item) => item.total) || [],
        backgroundColor: "#2196F3",
      },
    ],
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
            {["ID", "Client", "Type", "Produits", "Début", "Fin", "Prix", "Prochaine Livraison", "Actif", "Actions"].map(
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
              <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
              <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
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

        {loadingStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-pulse">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md">
                <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : errorStats ? (
          <div className="text-center py-4 text-red-500 mb-6">{errorStats}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
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
          </div>
        </div>

        {loadingStats ? (
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md mb-6 animate-pulse">
            <div className="h-6 w-48 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-48 sm:h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ) : errorStats ? (
          <div className="text-center py-4 text-red-500 mb-6">{errorStats}</div>
        ) : (
          <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Abonnements par type</h2>
            <div className="h-48 sm:h-64">
              <Bar data={abonnementsChartData} options={chartOptions} />
            </div>
          </div>
        )}

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
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Prochaine Livraison</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Actif</th>
                  <th className="py-3 px-4 text-lightText dark:text-darkText">Actions</th>
                </tr>
              </thead>
              <tbody>
                {abonnements.map((abonnement) => (
                  <tr
                    key={abonnement.id}
                    className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.id}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.client}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.type}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.produits.length}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {new Date(abonnement.date_debut).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {abonnement.date_fin ? new Date(abonnement.date_fin).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.prix}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {abonnement.prochaine_livraison ? new Date(abonnement.prochaine_livraison).toLocaleDateString() : "N/A"}
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
                    <td className="py-3 px-4">
                      <ButtonPrimary
                        onClick={() => openEditModal(abonnement)}
                        className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm"
                      >
                        <Edit className="h-4 w-4 mr-1" /> Modifier
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
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prochaine livraison</label>
                  <input
                    type="date"
                    value={editAbonnement.prochaine_livraison}
                    onChange={(e) => setEditAbonnement({ ...editAbonnement, prochaine_livraison: e.target.value })}
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