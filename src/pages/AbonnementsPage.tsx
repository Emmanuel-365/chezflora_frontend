"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Package, CheckCircle, X, AlertCircle, Loader2, RefreshCw, Gift, Leaf, Plus, Minus } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import ButtonPrimary from '../components/ButtonPrimary';
import { getAbonnements, createAbonnement, getProducts } from '../services/api';
import axios from 'axios';

// Interfaces mises à jour
interface Abonnement {
  id: string;
  type: 'mensuel' | 'hebdomadaire' | 'annuel';
  prix: number; // Changé de string à number
  date_debut: string;
  date_fin: string | null;
  prochaine_livraison: string | null;
  prochaine_facturation: string | null; // Ajouté
  is_active: boolean;
  paiement_statut: 'paye_complet' | 'non_paye' | 'en_attente'; // Ajouté
  abonnement_produits: { produit: Product; quantite: number }[];
}

interface Product {
  id: string;
  nom: string;
  prix: number;
  photos: string[];
}

interface SelectedProduct {
  id: string;
  quantity: number;
}

const AbonnementsPage: React.FC = () => {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedType, setSelectedType] = useState<'mensuel' | 'hebdomadaire' | 'annuel'>('mensuel');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [dateDebut, setDateDebut] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dateFin, setDateFin] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mes-abonnements' | 'creer'>('mes-abonnements');
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('access_token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await getProducts();
        setProducts(productsResponse.data.results);

        if (isAuthenticated) {
          const abonnementsResponse = await getAbonnements();
          setAbonnements(abonnementsResponse.data.results);
          console.log("premiers abonnement: ", abonnementsResponse.data.results)
        } else {
          setActiveTab('creer');
        }
        setLoading(false);
      } catch (err: any) {
        setError('Erreur lors du chargement des données.');
        setLoading(false);
        if (err.response?.status === 401 && isAuthenticated) {
          localStorage.removeItem('access_token');
          navigate('/auth');
        }
      }
    };

    fetchData();
  }, [navigate, isAuthenticated]);

  const calculateEstimatedPrice = () => {
    const basePrice = selectedProducts.reduce((sum, item) => {
      const product = products.find(p => p.id === item.id);
      return sum + (product ? product.prix * item.quantity : 0);
    }, 0);

    let multiplier = 1;
    switch (selectedType) {
      case 'hebdomadaire':
        multiplier = 4; // Estimation pour 4 semaines
        break;
      case 'mensuel':
        multiplier = 1; // Une livraison par mois
        break;
      case 'annuel':
        multiplier = 12 * 0.9; // 12 mois avec 10% de réduction
        break;
    }
    return Math.round(basePrice * multiplier);
  };

  const handleProductQuantityChange = (productId: string, delta: number) => {
    const existing = selectedProducts.find(p => p.id === productId);
    if (existing) {
      const newQuantity = existing.quantity + delta;
      if (newQuantity <= 0) {
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
      } else {
        setSelectedProducts(selectedProducts.map(p =>
          p.id === productId ? { ...p, quantity: newQuantity } : p
        ));
      }
    } else if (delta > 0) {
      setSelectedProducts([...selectedProducts, { id: productId, quantity: 1 }]);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: '/abonnements' } });
      return;
    }

    if (selectedProducts.length === 0) {
      setError('Veuillez sélectionner au moins un produit.');
      return;
    }

    if (selectedProducts.some(p => p.quantity <= 0)) {
      setError('Les quantités doivent être supérieures à 0.');
      return;
    }

    const debut = new Date(dateDebut);
    const fin = dateFin ? new Date(dateFin) : null;
    if (fin && debut >= fin) {
      setError('La date de début doit être antérieure à la date de fin.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Réinitialise l'heure à minuit
    
    if (debut < today) {
      setError('La date de début ne peut pas être dans le passé.');
      return;
    }

    setSubscribeLoading(true);
    try {
      const data = {
        type: selectedType,
        produit_quantites: selectedProducts.map(p => ({
          produit_id: p.id,
          quantite: p.quantity,
        })),
        date_debut: dateDebut,
        ...(dateFin && { date_fin: dateFin }),
      };
      const response = await createAbonnement(data);
      const updatedAbonnements = await getAbonnements();
      setAbonnements(updatedAbonnements.data.results);
      console.log("deuxiemes abonnements: ", updatedAbonnements.data.results)
      setSelectedProducts([]);
      setDateFin('');
      setShowSuccessMessage(`Abonnement créé avec succès ! Prix : ${response.data.prix} FCFA`);
      setTimeout(() => setShowSuccessMessage(null), 5000);
      setActiveTab('mes-abonnements');
      setError(null);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.produit_quantites?.[0] ||
        'Une erreur est survenue lors de la création de l\'abonnement.'
      );
    } finally {
      setSubscribeLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cet abonnement ?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `https://chezflora-api.onrender.com/api/abonnements/${id}/cancel/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedAbonnements = await getAbonnements();
      setAbonnements(updatedAbonnements.data.results);
      setShowSuccessMessage('Votre abonnement a été annulé avec succès.');
      setTimeout(() => setShowSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'annulation de l\'abonnement.');
    }
  };

  const getFrequencyText = (type: string) => {
    switch (type) {
      case 'hebdomadaire': return 'Toutes les semaines';
      case 'mensuel': return 'Tous les mois';
      case 'annuel': return 'Tous les ans';
      default: return '';
    }
  };

  const getNextDeliveryDate = (prochaineLivraison: string | null) => {
    const date = prochaineLivraison ? new Date(prochaineLivraison) : new Date();
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <PageContainer>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Chargement de vos abonnements...</p>
          </div>
        </PageContainer>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <PageContainer>
        {/* Hero Section */}
        <div className="relative bg-emerald-600 text-white py-16 mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-emerald-700">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path
                d="M0,20 L100,20 M0,40 L100,40 M0,60 L100,60 M0,80 L100,80 M20,0 L20,100 M40,0 L40,100 M60,0 L60,100 M80,0 L80,100"
                stroke="currentColor"
                strokeWidth="0.2"
              />
            </svg>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-serif font-medium mb-4">Abonnements Floraux</h1>
              <p className="text-xl max-w-3xl mx-auto mb-8">
                Recevez régulièrement des fleurs fraîches et des créations florales uniques directement chez vous.
              </p>
              {!isAuthenticated && (
                <ButtonPrimary
                  onClick={() => navigate('/auth', { state: { from: '/abonnements' } })}
                  className="bg-white text-emerald-600 hover:bg-gray-100 transition-colors"
                >
                  Se connecter pour gérer vos abonnements
                </ButtonPrimary>
              )}
            </motion.div>
          </div>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {showSuccessMessage && (
            <motion.div
              className="fixed top-20 right-4 z-50 bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-md flex items-center max-w-md"
              initial={{ x: 20 }}
              animate={{ x: 0 }}
              exit={{ x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
              <span className="flex-grow">{showSuccessMessage}</span>
              <button onClick={() => setShowSuccessMessage(null)} className="ml-2 text-emerald-500 hover:text-emerald-700">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
          {error && (
            <motion.div
              className="fixed top-20 right-4 z-50 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-md flex items-center max-w-md"
              initial={{ x: 20 }}
              animate={{ x: 0 }}
              exit={{ x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
              <span className="flex-grow">{error}</span>
              <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          {/* Avantages */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-gray-800 mb-8 text-center">
              Pourquoi s'abonner chez Flora ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                className="bg-white rounded-xl shadow-sm p-6 text-center"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Livraison régulière</h3>
                <p className="text-gray-600">
                  Recevez automatiquement vos fleurs préférées selon la fréquence que vous choisissez.
                </p>
              </motion.div>
              <motion.div
                className="bg-white rounded-xl shadow-sm p-6 text-center"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Économies garanties</h3>
                <p className="text-gray-600">
                  Bénéficiez de tarifs préférentiels et de réductions exclusives sur nos créations.
                </p>
              </motion.div>
              <motion.div
                className="bg-white rounded-xl shadow-sm p-6 text-center"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Fraîcheur assurée</h3>
                <p className="text-gray-600">
                  Nos fleurs sont sélectionnées le jour même de la livraison pour une fraîcheur maximale.
                </p>
              </motion.div>
            </div>
          </div>

          {isAuthenticated && (
            <div className="mb-8">
              <div className="flex border-b border-gray-200">
                <button
                  className={`py-3 px-6 font-medium text-lg ${
                    activeTab === 'mes-abonnements'
                      ? 'text-emerald-600 border-b-2 border-emerald-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('mes-abonnements')}
                >
                  Mes abonnements
                </button>
                <button
                  className={`py-3 px-6 font-medium text-lg ${
                    activeTab === 'creer'
                      ? 'text-emerald-600 border-b-2 border-emerald-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('creer')}
                >
                  Créer un abonnement
                </button>
              </div>
            </div>
          )}

          {/* Mes abonnements */}
          {isAuthenticated && activeTab === 'mes-abonnements' && (
            <div className="space-y-6 mb-12">
              <h2 className="text-2xl font-serif font-medium text-gray-800 mb-6">Vos abonnements actifs</h2>
              {abonnements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence>
                    {abonnements.map((abonnement) => (
                      <motion.div
                        key={abonnement.id}
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        exit={{ y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-sm overflow-hidden"
                      >
                        <div className={`py-2 px-4 ${abonnement.is_active ? 'bg-emerald-600' : 'bg-gray-500'} text-white flex justify-between items-center`}>
                          <h3 className="font-medium">
                            Abonnement {abonnement.type.charAt(0).toUpperCase() + abonnement.type.slice(1)}
                          </h3>
                          <span className="text-sm px-2 py-1 rounded-full bg-white bg-opacity-20">
                            {abonnement.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        <div className="p-6">
                          <div className="mb-4">
                            <h4 className="text-sm text-gray-500 mb-2">Produits inclus</h4>
                            <div className="flex flex-wrap gap-2">
                              {abonnement.abonnement_produits.map((item) => (
                                <div key={item.produit.id} className="flex items-center bg-gray-50 rounded-lg p-2">
                                  <img
                                    src={item.produit.photos[0] || '/placeholder.svg?height=40&width=40'}
                                    alt={item.produit.nom}
                                    className="w-10 h-10 object-cover rounded-md mr-2"
                                  />
                                  <span className="text-gray-800 text-sm">
                                    {item.produit.nom} (x{item.quantite})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="text-sm text-gray-500 mb-1">Prix</h4>
                              <p className="text-lg font-medium text-emerald-600">{abonnement.prix} FCFA</p>
                            </div>
                            <div>
                              <h4 className="text-sm text-gray-500 mb-1">Fréquence</h4>
                              <p className="text-gray-800">{getFrequencyText(abonnement.type)}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="text-sm text-gray-500 mb-1">Date de début</h4>
                              <p className="text-gray-800">
                                {new Date(abonnement.date_debut).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm text-gray-500 mb-1">Date de fin</h4>
                              <p className="text-gray-800">
                                {abonnement.date_fin ? new Date(abonnement.date_fin).toLocaleDateString('fr-FR') : 'Non définie'}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="text-sm text-gray-500 mb-1">Statut du paiement</h4>
                              <p className={`text-gray-800 capitalize ${abonnement.paiement_statut === 'paye_complet' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {abonnement.paiement_statut.replace('_', ' ')}
                              </p>
                            </div>
                            {abonnement.is_active && (
                              <div>
                                <h4 className="text-sm text-gray-500 mb-1">Prochaine livraison</h4>
                                <p className="text-gray-800 flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-emerald-500" />
                                  {getNextDeliveryDate(abonnement.prochaine_livraison)}
                                </p>
                              </div>
                            )}
                          </div>
                          {abonnement.is_active && (
                            <ButtonPrimary
                              onClick={() => handleCancel(abonnement.id)}
                              className="w-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
                            >
                              Annuler l'abonnement
                            </ButtonPrimary>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">Aucun abonnement actif</h3>
                  <p className="text-gray-600 mb-6">
                    Vous n'avez pas encore d'abonnement. Créez votre premier abonnement dès maintenant !
                  </p>
                  <ButtonPrimary
                    onClick={() => setActiveTab('creer')}
                    className="bg-emerald-600 hover:bg-emerald-500 transition-colors"
                  >
                    Créer un abonnement
                  </ButtonPrimary>
                </div>
              )}
            </div>
          )}

          {/* Créer un abonnement */}
          {(activeTab === 'creer' || !isAuthenticated) && (
            <div className="mb-12">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-emerald-600 py-4 px-6 text-white">
                  <h2 className="text-2xl font-medium">
                    {isAuthenticated ? 'Créer un nouvel abonnement' : 'Créez votre abonnement sur mesure'}
                  </h2>
                  <p className="text-emerald-100">Personnalisez votre abonnement selon vos préférences</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">Type d'abonnement</label>
                        <div className="grid grid-cols-3 gap-4">
                          <button
                            type="button"
                            onClick={() => setSelectedType('hebdomadaire')}
                            className={`p-4 rounded-lg border ${
                              selectedType === 'hebdomadaire'
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50'
                            } transition-colors text-center`}
                          >
                            <RefreshCw className="h-6 w-6 mx-auto mb-2" />
                            <span className="block font-medium">Hebdomadaire</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedType('mensuel')}
                            className={`p-4 rounded-lg border ${
                              selectedType === 'mensuel'
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50'
                            } transition-colors text-center`}
                          >
                            <Calendar className="h-6 w-6 mx-auto mb-2" />
                            <span className="block font-medium">Mensuel</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedType('annuel')}
                            className={`p-4 rounded-lg border ${
                              selectedType === 'annuel'
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50'
                            } transition-colors text-center`}
                          >
                            <Gift className="h-6 w-6 mx-auto mb-2" />
                            <span className="block font-medium">Annuel</span>
                            <span className="text-xs text-emerald-600 mt-1">-10%</span>
                          </button>
                        </div>
                      </div>
                      <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">Date de début</label>
                        <input
                          type="date"
                          value={dateDebut}
                          onChange={(e) => setDateDebut(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">
                          Date de fin <span className="text-gray-500 font-normal">(optionnel)</span>
                        </label>
                        <input
                          type="date"
                          value={dateFin}
                          onChange={(e) => setDateFin(e.target.value)}
                          min={dateDebut}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Laissez vide pour un abonnement sans date de fin.
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">Produits à inclure</label>
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                          <div className="max-h-80 overflow-y-auto p-2">
                            {products.map((product) => {
                              const selected = selectedProducts.find(p => p.id === product.id);
                              return (
                                <div
                                  key={product.id}
                                  className={`flex items-center p-3 mb-2 rounded-lg border transition-colors ${
                                    selected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex-shrink-0 mr-3">
                                    <img
                                      src={product.photos[0] || '/placeholder.svg?height=60&width=60'}
                                      alt={product.nom}
                                      className="w-16 h-16 object-cover rounded-md"
                                    />
                                  </div>
                                  <div className="flex-grow">
                                    <h4 className="font-medium text-gray-800">{product.nom}</h4>
                                    <p className="text-emerald-600 font-medium">{product.prix} FCFA</p>
                                  </div>
                                  <div className="flex-shrink-0 ml-2 flex items-center space-x-2">
                                    {selected && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => handleProductQuantityChange(product.id, -1)}
                                          className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-emerald-100 flex items-center justify-center"
                                        >
                                          <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="text-gray-800 font-medium">{selected.quantity}</span>
                                      </>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleProductQuantityChange(product.id, 1)}
                                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        selected ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-emerald-100'
                                      }`}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {products.length === 0 && (
                            <div className="p-4 text-center text-gray-500">
                              Aucun produit disponible pour l'abonnement.
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedProducts.length > 0 && (
                        <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                          <h3 className="font-medium text-gray-800 mb-2">Récapitulatif</h3>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Produits sélectionnés:</span>
                            <span className="font-medium">{selectedProducts.length}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Type d'abonnement:</span>
                            <span className="font-medium capitalize">{selectedType}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-emerald-200">
                            <span className="text-gray-800 font-medium">Prix estimé:</span>
                            <span className="text-xl font-bold text-emerald-600">{calculateEstimatedPrice()} FCFA</span>
                          </div>
                          {selectedType === 'annuel' && (
                            <p className="text-sm text-emerald-600 mt-2">Économisez 10% avec l'abonnement annuel !</p>
                          )}
                        </div>
                      )}
                      <ButtonPrimary
                        onClick={handleSubscribe}
                        disabled={subscribeLoading || selectedProducts.length === 0}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center"
                      >
                        {subscribeLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Création en cours...
                          </>
                        ) : isAuthenticated ? (
                          "S'abonner maintenant"
                        ) : (
                          "Se connecter pour s'abonner"
                        )}
                      </ButtonPrimary>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-12">
            <div className="p-6">
              <h2 className="text-2xl font-serif font-medium text-gray-800 mb-6">Questions fréquentes</h2>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Comment fonctionne l'abonnement floral ?</h3>
                  <p className="text-gray-600">
                    Vous choisissez les produits et leurs quantités, la fréquence de livraison (hebdomadaire, mensuelle ou annuelle) et la date de début. Nous livrons automatiquement selon votre calendrier.
                  </p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Puis-je modifier mon abonnement ?</h3>
                  <p className="text-gray-600">
                    Pour l’instant, annulez votre abonnement actuel et créez-en un nouveau pour changer produits, quantités ou fréquence.
                  </p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Comment sont calculés les prix ?</h3>
                  <p className="text-gray-600">
                    Le prix dépend des produits, de leurs quantités et de la fréquence. Les abonnements annuels bénéficient d’une réduction de 10%.
                  </p>
                </div>
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Comment puis-je annuler mon abonnement ?</h3>
                  <p className="text-gray-600">
                    Annulez à tout moment depuis votre espace personnel. L’annulation est immédiate et stoppe les futures livraisons.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-emerald-50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-serif font-medium text-gray-800 mb-4">
              Prêt à recevoir des fleurs fraîches régulièrement ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Créez votre abonnement personnalisé dès aujourd’hui et profitez de fleurs fraîches livrées chez vous.
            </p>
            <ButtonPrimary
              onClick={() => {
                if (isAuthenticated) {
                  setActiveTab('creer');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate('/auth', { state: { from: '/abonnements' } });
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-500 transition-colors"
            >
              {isAuthenticated ? 'Créer mon abonnement' : 'Se connecter pour commencer'}
            </ButtonPrimary>
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default AbonnementsPage;