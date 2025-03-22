import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { FileText, Search, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

interface Devis {
  id: string;
  client: string;
  service: string;
  description: string;
  date_demande: string;
  statut: string;
  prix_propose: string | null;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDevis, setEditDevis] = useState({ description: '', prix_propose: '', statut: '', is_active: true });
  const devisPerPage = 10;

  useEffect(() => {
    fetchDevis();
  }, [currentPage, searchQuery, filterStatut]);

  const fetchDevis = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/devis/', {
        params: {
          page: currentPage,
          per_page: devisPerPage,
          search: searchQuery || undefined,
          statut: filterStatut !== 'all' ? filterStatut : undefined,
        },
      });
      setDevis(response.data.results);
      setTotalDevis(response.data.count);
      setTotalPages(Math.ceil(response.data.count / devisPerPage));
      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors du chargement des devis.');
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

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const openEditModal = (devis: Devis) => {
    setSelectedDevis(devis);
    setEditDevis({
      description: devis.description,
      prix_propose: devis.prix_propose || '',
      statut: devis.statut,
      is_active: devis.is_active,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => { setIsEditModalOpen(false); setSelectedDevis(null); };

  const handleEditDevis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevis) return;
    try {
      await api.put(`/devis/${selectedDevis.id}/`, {
        ...editDevis,
        prix_propose: editDevis.prix_propose ? parseFloat(editDevis.prix_propose).toString() : null,
      });
      setIsEditModalOpen(false);
      fetchDevis();
    } catch (err: any) {
      setError('Erreur lors de la mise à jour du devis.');
    }
  };

  if (loading) return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

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
                placeholder="Rechercher par client ou service..."
                className="w-full pl-10 pr-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatut}
              onChange={handleFilterStatut}
              className="px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightBg dark:bg-darkBg text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="accepte">Accepté</option>
              <option value="refuse">Refusé</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Prix proposé (FCFA)</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Actif</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devis.map((devisItem) => (
                <tr key={devisItem.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{devisItem.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{devisItem.client}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{devisItem.service}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(devisItem.date_demande).toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{devisItem.prix_propose || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${devisItem.statut === 'accepte' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : devisItem.statut === 'refuse' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                      {devisItem.statut}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${devisItem.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {devisItem.is_active ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <ButtonPrimary onClick={() => openEditModal(devisItem)} className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm">
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * devisPerPage + 1} à {Math.min(currentPage * devisPerPage, totalDevis)} sur {totalDevis} devis
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

        {isEditModalOpen && selectedDevis && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier le devis
              </h2>
              <form onSubmit={handleEditDevis} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea value={editDevis.description} onChange={(e) => setEditDevis({ ...editDevis, description: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prix proposé (FCFA)</label>
                  <input type="number" step="0.01" value={editDevis.prix_propose} onChange={(e) => setEditDevis({ ...editDevis, prix_propose: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Statut</label>
                  <select
                    value={editDevis.statut}
                    onChange={(e) => setEditDevis({ ...editDevis, statut: e.target.value })}
                    className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en_attente">En attente</option>
                    <option value="accepte">Accepté</option>
                    <option value="refuse">Refusé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={editDevis.is_active} onChange={(e) => setEditDevis({ ...editDevis, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeEditModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Enregistrer</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDevisPage;