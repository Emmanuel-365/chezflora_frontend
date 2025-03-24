import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { CreditCard, Search, Edit, ChevronLeft, ChevronRight, Plus, Truck, DollarSign, X } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Produit {
  id: string;
  nom: string;
  prix: string;
}

interface Abonnement {
  id: string;
  client: { id: string; username: string };
  type: string;
  produits: Produit[];
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedAbonnement, setSelectedAbonnement] = useState<Abonnement | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editAbonnement, setEditAbonnement] = useState({
    type: '', date_debut: '', date_fin: '', prix: '', paiement_statut: 'non_paye', is_active: true, prochaine_livraison: '', prochaine_facturation: ''
  });
  const [newAbonnement, setNewAbonnement] = useState({
    client_id: '', type: 'mensuel', date_debut: '', date_fin: '', produit_quantites: [{ produit_id: '', quantite: 1 }]
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
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/abonnements/', {
        params: { page: currentPage, per_page: abonnementsPerPage, search: searchQuery || undefined, type: filterType !== 'all' ? filterType : undefined },
      });
      setAbonnements(response.data.results);
      setTotalAbonnements(response.data.count);
      setTotalPages(Math.ceil(response.data.count / abonnementsPerPage));
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des abonnements.');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/abonnements/stats/');
      setStats(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques.');
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/utilisateurs/', { params: { role: 'client' } });
      setClients(response.data.results);
    } catch (err) {
      setError('Erreur lors du chargement des clients.');
    }
  };

  const fetchProduits = async () => {
    try {
      const response = await api.get('/produits/');
      setProduits(response.data.results);
    } catch (err) {
      setError('Erreur lors du chargement des produits.');
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

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const openEditModal = (abonnement: Abonnement) => {
    setSelectedAbonnement(abonnement);
    setEditAbonnement({
      type: abonnement.type,
      date_debut: abonnement.date_debut.split('T')[0],
      date_fin: abonnement.date_fin ? abonnement.date_fin.split('T')[0] : '',
      prix: abonnement.prix,
      paiement_statut: abonnement.paiement_statut,
      is_active: abonnement.is_active,
      prochaine_livraison: abonnement.prochaine_livraison ? abonnement.prochaine_livraison.split('T')[0] : '',
      prochaine_facturation: abonnement.prochaine_facturation ? abonnement.prochaine_facturation.split('T')[0] : '',
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => { setIsEditModalOpen(false); setSelectedAbonnement(null); };

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
      setIsEditModalOpen(false);
      fetchAbonnements();
      fetchStats();
    } catch (err) {
      setError('Erreur lors de la mise à jour de l’abonnement.');
    }
  };

  const handleGenerateOrder = async (abonnementId: string) => {
    try {
      await api.post(`/abonnements/${abonnementId}/generer_commande_manuelle/`);
      fetchAbonnements();
      alert('Commande générée avec succès.');
    } catch (err) {
      setError('Erreur lors de la génération de la commande.');
    }
  };

  const handleFacturer = async (abonnementId: string) => {
    try {
      await api.post(`/abonnements/${abonnementId}/facturer/`);
      fetchAbonnements();
      fetchStats();
      alert('Facturation effectuée avec succès.');
    } catch (err) {
      setError('Erreur lors de la facturation.');
    }
  };

  const handleAddAbonnement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...newAbonnement,
        produit_quantites: newAbonnement.produit_quantites.map(p => ({ produit_id: p.produit_id, quantite: p.quantite })),
        date_fin: newAbonnement.date_fin || null,
      };
      await api.post('/abonnements/', data);
      setIsAddModalOpen(false);
      setNewAbonnement({ client_id: '', type: 'mensuel', date_debut: '', date_fin: '', produit_quantites: [{ produit_id: '', quantite: 1 }] });
      fetchAbonnements();
      fetchStats();
    } catch (err) {
      setError('Erreur lors de la création de l’abonnement.');
    }
  };

  const addProduitField = () => {
    setNewAbonnement({
      ...newAbonnement,
      produit_quantites: [...newAbonnement.produit_quantites, { produit_id: '', quantite: 1 }],
    });
  };

  const removeProduitField = (index: number) => {
    setNewAbonnement({
      ...newAbonnement,
      produit_quantites: newAbonnement.produit_quantites.filter((_, i) => i !== index),
    });
  };

  const updateProduitQuantite = (index: number, field: 'produit_id' | 'quantite', value: string | number) => {
    const updatedProduits = newAbonnement.produit_quantites.map((pq, i) =>
      i === index ? { ...pq, [field]: value } : pq
    );
    setNewAbonnement({ ...newAbonnement, produit_quantites: updatedProduits });
  };

  const abonnementsChartData = {
    labels: stats ? stats.abonnements_by_type.map((item) => item.type) : [],
    datasets: [{ label: 'Abonnements par type', data: stats ? stats.abonnements_by_type.map((item) => item.total) : [], backgroundColor: '#2196F3' }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Abonnements actifs par type' } },
  };

  if (loading) return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText flex items-center">
            <CreditCard className="h-6 w-6 mr-2" /> Gestion des Abonnements
          </h1>
          <ButtonPrimary onClick={() => setIsAddModalOpen(true)} className="flex items-center">
            <Plus className="h-5 w-5 mr-1" /> Ajouter un abonnement
          </ButtonPrimary>
        </div>

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

        <div className="bg-lightCard dark:bg-darkCard p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-medium text-lightText dark:text-darkText mb-2">Abonnements par type</h2>
          <div className="h-48 sm:h-64"><Bar data={abonnementsChartData} options={chartOptions} /></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Produits</th>
                <th className="py-3 px-4">Début</th>
                <th className="py-3 px-4">Fin</th>
                <th className="py-3 px-4">Prix (FCFA)</th>
                <th className="py-3 px-4">Statut Paiement</th>
                <th className="py-3 px-4">Prochaine Livraison</th>
                <th className="py-3 px-4">Prochaine Facturation</th>
                <th className="py-3 px-4">Actif</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {abonnements.map((abonnement) => (
                <tr key={abonnement.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.client.username}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.type}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.produits.map(p => p.nom).join(', ')}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(abonnement.date_debut).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.date_fin ? new Date(abonnement.date_fin).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.prix}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.paiement_statut}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.prochaine_livraison ? new Date(abonnement.prochaine_livraison).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{abonnement.prochaine_facturation ? new Date(abonnement.prochaine_facturation).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${abonnement.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {abonnement.is_active ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary onClick={() => openEditModal(abonnement)} className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm">
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                    <ButtonPrimary onClick={() => handleGenerateOrder(abonnement.id)} className="px-2 py-1 bg-green-500 text-white hover:bg-green-600 flex items-center text-sm">
                      <Truck className="h-4 w-4 mr-1" /> Générer Commande
                    </ButtonPrimary>
                    <ButtonPrimary onClick={() => handleFacturer(abonnement.id)} className="px-2 py-1 bg-yellow-500 text-white hover:bg-yellow-600 flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-1" /> Facturer
                    </ButtonPrimary>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * abonnementsPerPage + 1} à {Math.min(currentPage * abonnementsPerPage, totalAbonnements)} sur {totalAbonnements} abonnements
          </p>
          <div className="flex gap-2">
            <ButtonPrimary onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
            </ButtonPrimary>
            <ButtonPrimary onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center">
              Suivant <ChevronRight className="h-5 w-5 ml-1" />
            </ButtonPrimary>
          </div>
        </div>

        {/* Modal de modification */}
        {isEditModalOpen && selectedAbonnement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier l’abonnement
              </h2>
              <form onSubmit={handleEditAbonnement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Type</label>
                  <select value={editAbonnement.type} onChange={(e) => setEditAbonnement({ ...editAbonnement, type: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="mensuel">Mensuel</option>
                    <option value="hebdomadaire">Hebdomadaire</option>
                    <option value="annuel">Annuel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date de début</label>
                  <input type="date" value={editAbonnement.date_debut} onChange={(e) => setEditAbonnement({ ...editAbonnement, date_debut: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date de fin</label>
                  <input type="date" value={editAbonnement.date_fin} onChange={(e) => setEditAbonnement({ ...editAbonnement, date_fin: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prix (FCFA)</label>
                  <input type="number" step="0.01" value={editAbonnement.prix} onChange={(e) => setEditAbonnement({ ...editAbonnement, prix: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Statut de paiement</label>
                  <select value={editAbonnement.paiement_statut} onChange={(e) => setEditAbonnement({ ...editAbonnement, paiement_statut: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="non_paye">Non payé</option>
                    <option value="paye_complet">Payé en une fois</option>
                    <option value="paye_mensuel">Payé mensuellement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prochaine livraison</label>
                  <input type="date" value={editAbonnement.prochaine_livraison} onChange={(e) => setEditAbonnement({ ...editAbonnement, prochaine_livraison: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prochaine facturation</label>
                  <input type="date" value={editAbonnement.prochaine_facturation} onChange={(e) => setEditAbonnement({ ...editAbonnement, prochaine_facturation: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={editAbonnement.is_active} onChange={(e) => setEditAbonnement({ ...editAbonnement, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeEditModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Enregistrer</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal d’ajout */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Plus className="h-5 w-5 mr-2" /> Ajouter un abonnement
              </h2>
              <form onSubmit={handleAddAbonnement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Client</label>
                  <select value={newAbonnement.client_id} onChange={(e) => setNewAbonnement({ ...newAbonnement, client_id: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Sélectionner un client</option>
                    {clients.map(client => <option key={client.id} value={client.id}>{client.username}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Type</label>
                  <select value={newAbonnement.type} onChange={(e) => setNewAbonnement({ ...newAbonnement, type: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="mensuel">Mensuel</option>
                    <option value="hebdomadaire">Hebdomadaire</option>
                    <option value="annuel">Annuel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date de début</label>
                  <input type="date" value={newAbonnement.date_debut} onChange={(e) => setNewAbonnement({ ...newAbonnement, date_debut: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date de fin</label>
                  <input type="date" value={newAbonnement.date_fin} onChange={(e) => setNewAbonnement({ ...newAbonnement, date_fin: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Produits</label>
                  {newAbonnement.produit_quantites.map((pq, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <select value={pq.produit_id} onChange={(e) => updateProduitQuantite(index, 'produit_id', e.target.value)} className="w-2/3 px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                        <option value="">Sélectionner un produit</option>
                        {produits.map(produit => <option key={produit.id} value={produit.id}>{produit.nom} ({produit.prix} FCFA)</option>)}
                      </select>
                      <input type="number" min="1" value={pq.quantite} onChange={(e) => updateProduitQuantite(index, 'quantite', parseInt(e.target.value))} className="w-1/3 px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                      {index > 0 && <ButtonPrimary onClick={() => removeProduitField(index)} className="px-2 py-1 bg-red-500 text-white hover:bg-red-600"><X className="h-4 w-4" /></ButtonPrimary>}
                    </div>
                  ))}
                  <ButtonPrimary type="button" onClick={addProduitField} className="mt-2 px-2 py-1 bg-green-500 text-white hover:bg-green-600 flex items-center text-sm">
                    <Plus className="h-4 w-4 mr-1" /> Ajouter un produit
                  </ButtonPrimary>
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Créer</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAbonnementsPage;