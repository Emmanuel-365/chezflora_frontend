import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import ButtonPrimary from '../components/ButtonPrimary';
import { FileText, Search, Edit, Trash2, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Article {
  id: string;
  titre: string;
  contenu: string;
  cover: string | null;
  auteur: string;
  date_publication: string;
  is_active: boolean;
}

interface ApiResponse {
  results: Article[];
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({ titre: '', contenu: '', cover: null as File | null, is_active: true });
  const [editArticle, setEditArticle] = useState({ titre: '', contenu: '', cover: null as File | null, is_active: true });
  const articlesPerPage = 10;

  useEffect(() => {
    fetchArticles();
  }, [currentPage, searchQuery]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse>('/articles/', {
        params: { page: currentPage, per_page: articlesPerPage, search: searchQuery || undefined },
      });
      setArticles(response.data.results);
      setTotalArticles(response.data.count);
      setTotalPages(Math.ceil(response.data.count / articlesPerPage));
      setLoading(false);
    } catch (err: any) {
      setError('Erreur lors du chargement des articles.');
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
    setNewArticle({ titre: '', contenu: '', cover: null, is_active: true });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => { setIsAddModalOpen(false); };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('titre', newArticle.titre);
      formData.append('contenu', newArticle.contenu);
      if (newArticle.cover) formData.append('cover', newArticle.cover);
      formData.append('is_active', newArticle.is_active.toString());
      await api.post('/articles/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsAddModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      setError('Erreur lors de l’ajout de l’article.');
    }
  };

  const openEditModal = (article: Article) => {
    setSelectedArticle(article);
    setEditArticle({ titre: article.titre, contenu: article.contenu, cover: null, is_active: article.is_active });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => { setIsEditModalOpen(false); setSelectedArticle(null); };

  const handleEditArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) return;
    try {
      const formData = new FormData();
      formData.append('titre', editArticle.titre);
      formData.append('contenu', editArticle.contenu);
      if (editArticle.cover) formData.append('cover', editArticle.cover);
      formData.append('is_active', editArticle.is_active.toString());
      await api.put(`/articles/${selectedArticle.id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsEditModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      setError('Erreur lors de la mise à jour de l’article.');
    }
  };

  const openDeleteModal = (article: Article) => { setSelectedArticle(article); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setIsDeleteModalOpen(false); setSelectedArticle(null); };

  const handleDeleteArticle = async () => {
    if (!selectedArticle) return;
    try {
      await api.delete(`/articles/${selectedArticle.id}/`);
      setIsDeleteModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      setError('Erreur lors de la suppression de l’article.');
    }
  };

  if (loading) return <div className="text-center py-16 text-lightText dark:text-darkText">Chargement...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-lightText dark:text-darkText mb-6 flex items-center">
          <FileText className="h-6 w-6 mr-2" /> Gestion des Articles
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
            <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un article
          </ButtonPrimary>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-lightCard dark:bg-darkCard">
              <tr className="border-b border-lightBorder dark:border-darkBorder">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Titre</th>
                <th className="py-3 px-4">Auteur</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-lightBorder dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{article.id}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{article.titre}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{article.auteur}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(article.date_publication).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${article.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {article.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <ButtonPrimary onClick={() => openEditModal(article)} className="px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 flex items-center text-sm">
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </ButtonPrimary>
                    <ButtonPrimary onClick={() => openDeleteModal(article)} className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 flex items-center text-sm">
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
            Affichage de {(currentPage - 1) * articlesPerPage + 1} à {Math.min(currentPage * articlesPerPage, totalArticles)} sur {totalArticles} articles
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
                <PlusCircle className="h-5 w-5 mr-2" /> Ajouter un article
              </h2>
              <form onSubmit={handleAddArticle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Titre</label>
                  <input type="text" value={newArticle.titre} onChange={(e) => setNewArticle({ ...newArticle, titre: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Contenu</label>
                  <textarea value={newArticle.contenu} onChange={(e) => setNewArticle({ ...newArticle, contenu: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={5} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Image de couverture</label>
                  <input type="file" onChange={(e) => setNewArticle({ ...newArticle, cover: e.target.files?.[0] || null })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={newArticle.is_active} onChange={(e) => setNewArticle({ ...newArticle, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeAddModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Ajouter</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && selectedArticle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Edit className="h-5 w-5 mr-2" /> Modifier l’article
              </h2>
              <form onSubmit={handleEditArticle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Titre</label>
                  <input type="text" value={editArticle.titre} onChange={(e) => setEditArticle({ ...editArticle, titre: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Contenu</label>
                  <textarea value={editArticle.contenu} onChange={(e) => setEditArticle({ ...editArticle, contenu: e.target.value })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText focus:outline-none focus:ring-2 focus:ring-blue-500" rows={5} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Image de couverture</label>
                  <input type="file" onChange={(e) => setEditArticle({ ...editArticle, cover: e.target.files?.[0] || null })} className="w-full px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-lg bg-lightCard dark:bg-darkCard text-lightText dark:text-darkText" />
                  {selectedArticle.cover && !editArticle.cover && <img src={selectedArticle.cover} alt="Cover" className="mt-2 h-16 w-16 object-cover rounded" />}
                </div>
                <div>
                  <label className="block text-sm font-medium text-lightText dark:text-darkText mb-1">Actif</label>
                  <input type="checkbox" checked={editArticle.is_active} onChange={(e) => setEditArticle({ ...editArticle, is_active: e.target.checked })} className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-lightBorder dark:border-darkBorder rounded" />
                </div>
                <div className="flex gap-2 justify-end">
                  <ButtonPrimary type="button" onClick={closeEditModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                  <ButtonPrimary type="submit" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">Enregistrer</ButtonPrimary>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && selectedArticle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-lightBg dark:bg-darkBg p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-medium text-lightText dark:text-darkText mb-4 flex items-center">
                <Trash2 className="h-5 w-5 mr-2" /> Supprimer l’article
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer l’article <span className="font-medium">{selectedArticle.titre}</span> ?
              </p>
              <div className="flex gap-2 justify-end">
                <ButtonPrimary type="button" onClick={closeDeleteModal} className="px-4 py-2 bg-lightCard dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">Annuler</ButtonPrimary>
                <ButtonPrimary onClick={handleDeleteArticle} className="px-4 py-2 bg-red-500 text-white hover:bg-red-600">Supprimer</ButtonPrimary>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminArticlesPage;