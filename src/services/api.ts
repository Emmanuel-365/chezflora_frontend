import axios from 'axios';

const API_URL = 'https://chezflora-api.onrender.com/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Gestion des requêtes avec token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token envoyé pour:', config.url);
    } else {
      console.log('Pas de token disponible pour:', config.url);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Vérifier si c'est une erreur 401 (Token expiré)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        localStorage.removeItem('access_token');
        window.location.href = '/auth';
        return Promise.reject(error);
      }

      try {
        // Rafraîchir le token
        const response = await axios.post(`${API_URL}token/refresh/`, { refresh: refreshToken });
        const { access } = response.data;

        // Mettre à jour le token dans localStorage et Axios
        localStorage.setItem('access_token', access);
        api.defaults.headers.Authorization = `Bearer ${access}`;
        originalRequest.headers.Authorization = `Bearer ${access}`;

        processQueue(null, access);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


// Fonctions exportées avec typage
import { TokenResponse, User } from '../types/types';

export const login = (data: { username: string; password: string }) =>
  api.post<TokenResponse>('/token/', data);
export const register = (data: { username: string; email: string; password: string }) =>
  api.post('/register/', data);
export const verifyOtp = (data: { user_id: string; code: string }) => api.post('/verify-otp/', data);
export const resendOtp = (data: { user_id: string }) => api.post('/resend-otp/', data);
export const resetPassword = (data: { email: string }) => api.post('/reset_password/', data);
export const getUserProfile = () => api.get<User>('/utilisateurs/me/');
export const getPublicParameters = () => api.get('/parametres/public/');
export const getProducts = (params?: { categorie?: number, signal?: AbortSignal }, ) => api.get('/produits/', { params });
export const getProduct = (id: string) => api.get(`/produits/${id}/`);
export const getCategories = (signal?: AbortSignal) => api.get('/categories/', {signal});
export const getServices = (params?: {signal: AbortSignal}) => api.get('/services/', {params});
export const getService = (id: string) => api.get(`/services/${id}/`);
export const getWorkshops = (params?:{}) => api.get('/ateliers/', {params});
export const getArticles = (params?:{}) => api.get('/articles/', {params});
export const getRealisations = () => api.get('/realisations/');
export const getRealisation = (id: string) => api.get(`/realisations/${id}`);
export const getPromotions = (params?:{}) => api.get('/promotions/', {params});
export const getCart = () => api.get('/paniers/mon_panier/');
export const addToCart = (panierId: string, data: { produit_id: string; quantite: number }) =>
  api.post(`/paniers/${panierId}/ajouter_produit/`, data);
export const validateCart = (panierId: string, data?: { adresse_id: string }) =>
  api.post(`/paniers/${panierId}/valider_panier/`, data || {});
export const updateCartQuantity = (panierId: string, data: { produit_id: string; quantite: number }) =>
  api.post(`/paniers/${panierId}/modifier_quantite/`, data);
export const getOrders = () => api.get('/commandes/');
export const getOrder = (id: string) => api.get(`/commandes/${id}/`);
export const removeFromCart = (panierId: string, data: { produit_id: string }) =>
  api.post(`/paniers/${panierId}/supprimer_produit/`, data);
export const updateUserProfile = (data: { username?: string; email?: string }) =>
  api.patch('/update-profile/', data);
export const changePassword = (data: {
  old_password: string;
  new_password: string;
  confirm_password: string;
}) => api.post('/change-password/', data);
export const deleteAccount = () => api.delete('/utilisateurs/me/');
export const getAddresses = () => api.get('/adresses/');
export const createAddress = (data: {
  nom: string;
  rue: string;
  ville: string;
  code_postal: string;
  pays: string;
}) => api.post('/adresses/', data);
export const createDevis = (data: { service: string; description: string; prix_propose: number | null }) =>
  api.post('/devis/', data);
export const getDevis = () => api.get('/devis');
export const getAbonnements = () => api.get('/abonnements/');
export const createAbonnement = (data: any) => api.post('/abonnements/', data);
export const cancelAbonnement = (id: string) => api.delete(`/abonnements/${id}/`);
export const getAteliers = () => api.get('/ateliers/');
export const getAtelier = (id: string) => api.get(`/ateliers/${id}`)
export const inscrireAtelier = (atelierId: string) => api.post(`/ateliers/${atelierId}/s_inscrire/`);
export const desinscrireAtelier = (atelierId: string) =>
  api.post(`/ateliers/${atelierId}/desinscription/`);
export const getWishlist = () => api.get('/wishlist/');
export const ajouterProduitWishlist = (produitId: string) =>
  api.post('/wishlist/ajouter_produit/', { produit_id: produitId });
export const supprimerProduitWishlist = (produitId: string) =>
  api.post('/wishlist/supprimer_produit/', { produit_id: produitId });
export const sendContactMessage = (data: { name: string; email: string; message: string }) =>
  api.post('/contact/', data);
export const cancelOrder = (id: string) => api.post(`/commandes/${id}/cancel/`);
export const getArticle = (id: string) => api.get(`/articles/${id}/`);
export const createCommentaire = (data: { article: string; texte: string; parent?: string }) =>
  api.post('/commentaires/', data);
export const getUsers = (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  is_active?: string;
  is_banned?: string;
}) => api.get('/utilisateurs/', { params });
export const createUser = (data: {
  email: string;
  username: string;
  password: string;
  role: string;
}) => api.post('/utilisateurs/', data);
export const updateUser = (
  id: string,
  data: { email?: string; username?: string; role?: string; is_active?: boolean; is_banned?: boolean }
) => api.put(`/utilisateurs/${id}/`, data);
export const deleteUser = (id: string) => api.delete(`/utilisateurs/${id}/`);
export const getUserStats = async (params: { days: number; endpoint?: string }) => {
  const endpoint = params.endpoint || "/utilisateurs/stats/"; // Endpoint par défaut
  return api.get(endpoint, { params: { days: params.days } });
};
export const deleteWishlist = (id: string) => api.delete(`/wishlist/${id}/`);
export const getCartCount = async () => {
  const cart = await api.get('/paniers');

  return cart.data.results[0].items.length;
};

export const refreshToken = (refresh: string) =>
  api.post("/token/refresh/", { refresh });

export default api;