import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { Wrench, Search, Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Service {
  id: string;
  nom: string;
}

interface Realisation {
  id: string;
  service: Service;
  titre: string;
  description: string;
  photos: string[];
  date: string;
  admin: string;
  is_active: boolean;
}

interface Service {
  id: string;
  nom: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [selectedRealisation, setSelectedRealisation] = useState<Realisation | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newRealisation, setNewRealisation] = useState({ service: '', titre: '', description: '', photos: [] as File[], date: '', is_active: true });
  const [editRealisation, setEditRealisation] = useState({ service: '', titre: '', description: '', photos: [] as File[], date: '', is_active: true });
  const realisationsPerPage = 10;

  useEffect(() => {
    fetchRealisations();
    fetchServices();
  }, [currentPage, searchQuery]);

  const fetchRealisations = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/realisations/', {
        params: { page: currentPage, per_page: realisationsPerPage, search: searchQuery || undefined },
      });
      setRealisations(response.data.results);
      setTotalRealisations(response.data.count);
      setTotalPages(Math.ceil(response.data.count / realisationsPerPage));
      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors du chargement des réalisations.');
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get<{ results: Service[] }>('/services/');
      setServices(response.data.results);
      console.log(response.data)
    } catch (err: any) {
      setError('Erreur lors du chargement des services.');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const openAddModal = () => {
    setNewRealisation({ service: services[0]?.id || '', titre: '', description: '', photos: [], date: new Date().toISOString().split('T')[0], is_active: true });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => { setIsAddModalOpen(false); };

  const handleAddRealisation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('service', newRealisation.service);
      formData.append('titre', newRealisation.titre);
      formData.append('description', newRealisation.description);
      newRealisation.photos.forEach((photo) => formData.append('photos', photo));
      formData.append('date', newRealisation.date);
      formData.append('is_active', newRealisation.is_active.toString());
      await api.post('/realisations/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsAddModalOpen(false);
      fetchRealisations();
    } catch (err: any) {
      setError('Erreur lors de l’ajout de la réalisation.');
    }
  };

  const openEditModal = (realisation: Realisation) => {
    setSelectedRealisation(realisation);
    setEditRealisation({ service: realisation.service.nom, titre: realisation.titre, description: realisation.description, photos: [], date: realisation.date.split('T')[0], is_active: realisation.is_active });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => { setIsEditModalOpen(false); setSelectedRealisation(null); };

  const handleEditRealisation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRealisation) return;
    try {
      const formData = new FormData();
      formData.append('service', editRealisation.service);
      formData.append('titre', editRealisation.titre);
      formData.append('description', editRealisation.description);
      editRealisation.photos.forEach((photo) => formData.append('photos', photo));
      formData.append('date', editRealisation.date);
      formData.append('is_active', editRealisation.is_active.toString());
      await api.put(`/realisations/${selectedRealisation.id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsEditModalOpen(false);
      fetchRealisations();
    } catch (err: any) {
      setError('Erreur lors de la mise à jour de la réalisation.');
    }
  };

  const openDeleteModal = (realisation: Realisation) => { setSelectedRealisation(realisation); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setIsDeleteModalOpen(false); setSelectedRealisation(null); };

  const handleDeleteRealisation = async () => {
    if (!selectedRealisation) return;
    try {
      await api.delete(`/realisations/${selectedRealisation.id}/`);
      setIsDeleteModalOpen(false);
      fetchRealisations();
    } catch (err: any) {
      setError('Erreur lors de la suppression de la réalisation.');
    }
  };

  if (loading) return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

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
          <ButtonPrimary onClick={openAddModal} className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 flex items-center">
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter une réalisation
          </ButtonPrimary>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Titre</th>
                <th className="py-3 px-4">Photos</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {realisations.map((realisation) => (
                <tr key={realisation.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{realisation.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{realisation.service.nom}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{realisation.titre}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{realisation.photos.length}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(realisation.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${realisation.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {realisation.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary onClick={() => openEditModal(realisation)} className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm">
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                    <ButtonPrimary onClick={() => openDeleteModal(realisation)} className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm">
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
            Affichage de {(currentPage - 1) * realisationsPerPage + 1} à {Math.min(currentPage * realisationsPerPage, totalRealisations)} sur {totalRealisations} réalisations
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
                <PlusCircle className="h-5 w-5 mr-2" /> Ajouter une réalisation
              </h2>
              <form onSubmit={handleAddRealisation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Service</label>
                  <select value={newRealisation.service} onChange={(e) => setNewRealisation({ ...newRealisation, service: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>{service.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Titre</label>
                  <input type="text" value={newRealisation.titre} onChange={(e) => setNewRealisation({ ...newRealisation, titre: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea value={newRealisation.description} onChange={(e) => setNewRealisation({ ...newRealisation, description: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Photos</label>
                  <input type="file" multiple onChange={(e) => setNewRealisation({ ...newRealisation, photos: Array.from(e.target.files || []) })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date</label>
                  <input type="date" value={newRealisation.date} onChange={(e) => setNewRealisation({ ...newRealisation, date: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={newRealisation.is_active} onChange={(e) => setNewRealisation({ ...newRealisation, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeAddModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Ajouter</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && selectedRealisation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier la réalisation
              </h2>
              <form onSubmit={handleEditRealisation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Service</label>
                  <select value={editRealisation.service} onChange={(e) => setEditRealisation({ ...editRealisation, service: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>{service.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Titre</label>
                  <input type="text" value={editRealisation.titre} onChange={(e) => setEditRealisation({ ...editRealisation, titre: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Description</label>
                  <textarea value={editRealisation.description} onChange={(e) => setEditRealisation({ ...editRealisation, description: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Photos</label>
                  <input type="file" multiple onChange={(e) => setEditRealisation({ ...editRealisation, photos: Array.from(e.target.files || []) })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText" />
                  {selectedRealisation.photos.length > 0 && editRealisation.photos.length === 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {selectedRealisation.photos.map((photo, index) => (
                        <img key={index} src={photo} alt="Prévisualisation" className="h-16 w-16 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Date</label>
                  <input type="date" value={editRealisation.date} onChange={(e) => setEditRealisation({ ...editRealisation, date: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={editRealisation.is_active} onChange={(e) => setEditRealisation({ ...editRealisation, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeEditModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Enregistrer</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && selectedRealisation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer la réalisation
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer la réalisation <span className="font-medium">{selectedRealisation.titre}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary type="button" onClick={closeDeleteModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                <ButtonPrimary onClick={handleDeleteRealisation} className="px-4 py-2 bg-red-500 text-white hover:bg-red-600">Supprimer</ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRealisationsPage;