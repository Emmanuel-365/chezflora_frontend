import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Calendar, Search, Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAtelier, setSelectedAtelier] = useState<Atelier | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newAtelier, setNewAtelier] = useState({
    nom: '', description: '', date: '', duree: '', prix: '', places_totales: '', is_active: true,
  });
  const [editAtelier, setEditAtelier] = useState({
    nom: '', description: '', date: '', duree: '', prix: '', places_totales: '', is_active: true,
  });
  const ateliersPerPage = 10;

  useEffect(() => {
    fetchAteliers();
  }, [currentPage, searchQuery]);

  const fetchAteliers = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/ateliers/', {
        params: { page: currentPage, per_page: ateliersPerPage, search: searchQuery || undefined },
      });
      setAteliers(response.data.results);
      setTotalAteliers(response.data.count);
      setTotalPages(Math.ceil(response.data.count / ateliersPerPage));
      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors du chargement des ateliers.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const openAddModal = () => {
    setNewAtelier({ nom: '', description: '', date: '', duree: '', prix: '', places_totales: '', is_active: true });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => { setIsAddModalOpen(false); };

  const handleAddAtelier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const atelierData = {
        ...newAtelier,
        duree: parseInt(newAtelier.duree),
        prix: parseFloat(newAtelier.prix).toString(),
        places_totales: parseInt(newAtelier.places_totales),
      };
      await api.post('/ateliers/', atelierData);
      setIsAddModalOpen(false);
      fetchAteliers();
    } catch (err: any) {
      setError('Erreur lors de l’ajout de l’atelier.');
    }
  };

  const openEditModal = (atelier: Atelier) => {
    setSelectedAtelier(atelier);
    setEditAtelier({
      nom: atelier.nom,
      description: atelier.description,
      date: atelier.date.split('T')[0],
      duree: atelier.duree.toString(),
      prix: atelier.prix,
      places_totales: atelier.places_totales.toString(),
      is_active: atelier.is_active,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => { setIsEditModalOpen(false); setSelectedAtelier(null); };

  const handleEditAtelier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAtelier) return;
    try {
      const atelierData = {
        ...editAtelier,
        duree: parseInt(editAtelier.duree),
        prix: parseFloat(editAtelier.prix).toString(),
        places_totales: parseInt(editAtelier.places_totales),
      };
      await api.put(`/ateliers/${selectedAtelier.id}/`, atelierData);
      setIsEditModalOpen(false);
      fetchAteliers();
    } catch (err: any) {
      setError('Erreur lors de la mise à jour de l’atelier.');
    }
  };

  console.log(ateliers)

  const openDeleteModal = (atelier: Atelier) => { setSelectedAtelier(atelier); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setIsDeleteModalOpen(false); setSelectedAtelier(null); };

  const handleDeleteAtelier = async () => {
    if (!selectedAtelier) return;
    try {
      await api.delete(`/ateliers/${selectedAtelier.id}/`);
      setIsDeleteModalOpen(false);
      fetchAteliers();
    } catch (err: any) {
      setError('Erreur lors de la suppression de l’atelier.');
    }
  };

  if (loading) return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nom</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Durée (min)</th>
                <th className="py-3 px-4">Prix (FCFA)</th>
                <th className="py-3 px-4">Places Totales</th>
                <th className="py-3 px-4">Places Disponibles</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ateliers.map((atelier) => (
                <tr key={atelier.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.nom}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(atelier.date).toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.duree}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.prix}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.places_totales}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{atelier.places_disponibles}</td>                  
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${atelier.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {atelier.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary onClick={() => openEditModal(atelier)} className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm">
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                    <ButtonPrimary onClick={() => openDeleteModal(atelier)} className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm">
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
            Affichage de {(currentPage - 1) * ateliersPerPage + 1} à {Math.min(currentPage * ateliersPerPage, totalAteliers)} sur {totalAteliers} ateliers
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

        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un atelier
              </h2>
              <form onSubmit={handleAddAtelier} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                  <input type="text" value={newAtelier.nom} onChange={(e) => setNewAtelier({ ...newAtelier, nom: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea value={newAtelier.description} onChange={(e) => setNewAtelier({ ...newAtelier, description: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date</label>
                  <input type="datetime-local" value={newAtelier.date} onChange={(e) => setNewAtelier({ ...newAtelier, date: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Durée (minutes)</label>
                  <input type="number" value={newAtelier.duree} onChange={(e) => setNewAtelier({ ...newAtelier, duree: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prix (FCFA)</label>
                  <input type="number" step="0.01" value={newAtelier.prix} onChange={(e) => setNewAtelier({ ...newAtelier, prix: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Places totales</label>
                  <input type="number" value={newAtelier.places_totales} onChange={(e) => setNewAtelier({ ...newAtelier, places_totales: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={newAtelier.is_active} onChange={(e) => setNewAtelier({ ...newAtelier, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeAddModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Ajouter</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && selectedAtelier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier l’atelier
              </h2>
              <form onSubmit={handleEditAtelier} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Nom</label>
                  <input type="text" value={editAtelier.nom} onChange={(e) => setEditAtelier({ ...editAtelier, nom: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea value={editAtelier.description} onChange={(e) => setEditAtelier({ ...editAtelier, description: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date</label>
                  <input type="date" value={editAtelier.date} onChange={(e) => setEditAtelier({ ...editAtelier, date: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Durée (minutes)</label>
                  <input type="number" value={editAtelier.duree} onChange={(e) => setEditAtelier({ ...editAtelier, duree: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Prix (FCFA)</label>
                  <input type="number" step="0.01" value={editAtelier.prix} onChange={(e) => setEditAtelier({ ...editAtelier, prix: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Places totales</label>
                  <input type="number" value={editAtelier.places_totales} onChange={(e) => setEditAtelier({ ...editAtelier, places_totales: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={editAtelier.is_active} onChange={(e) => setEditAtelier({ ...editAtelier, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeEditModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Enregistrer</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && selectedAtelier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer l’atelier
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer l’atelier <span className="font-medium">{selectedAtelier.nom}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary type="button" onClick={closeDeleteModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                <ButtonPrimary onClick={handleDeleteAtelier} className="px-4 py-2 bg-red-500 text-white hover:bg-red-600">Supprimer</ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAteliersPage;