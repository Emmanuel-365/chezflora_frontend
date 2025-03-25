import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import ButtonPrimary from '../components/ButtonPrimary';
import { getOrders } from '../services/api';
import axios from 'axios';
import { ChevronDown, ChevronUp, ShoppingBag, Clock, CheckCircle, XCircle, Truck, FileText, MessageCircle, AlertCircle, Loader2, Filter, Calendar, CreditCard } from 'lucide-react';

interface LigneCommande {
  id: string;
  produit: string;
  produit_nom: string;
  quantite: number;
  prix_unitaire: string;
}

interface Paiement {
  id: string;
  type_transaction: string;
  montant: string;
  date_creation: string;
}

interface Client {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface Commande {
  id: string;
  client: Client;
  date: string;
  statut: string;
  total: string;
  lignes: LigneCommande[];
  paiement: Paiement;
  is_active: boolean;
  date_mise_a_jour: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        setLoading(true);
        const response = await getOrders();
        setOrders(response.data.results);
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement des commandes:', err.response?.status, err.response?.data);
        setError('Erreur lors du chargement des commandes.');
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/auth');
        }
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;
    setCancelLoading(orderId);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `https://chezflora-api.onrender.com/api/commandes/${orderId}/cancel/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedOrders = await getOrders();
      setOrders(updatedOrders.data.results);
      
      // Afficher un message de succès
      const successMessage = document.getElementById('success-message');
      if (successMessage) {
        successMessage.classList.remove('hidden');
        setTimeout(() => {
          successMessage.classList.add('hidden');
        }, 3000);
      }
    } catch (err: any) {
      console.error("Erreur lors de l'annulation:", err.response?.data);
      alert("Erreur lors de l'annulation : " + (err.response?.data?.error || 'Vérifiez votre connexion.'));
    } finally {
      setCancelLoading(null);
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validée':
        return 'bg-emerald-100 text-emerald-800';
      case 'en_attente':
        return 'bg-amber-100 text-amber-800';
      case 'en_cours':
        return 'bg-blue-100 text-blue-800';
      case 'annulee':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validée':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'en_attente':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'en_cours':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'annulee':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPaymentMethodName = (type: string) => {
    switch (type) {
      case 'carte':
        return 'Carte bancaire';
      case 'paypal':
        return 'PayPal';
      case 'mobile_money':
        return 'Mobile Money';
      case 'especes':
        return 'Espèces à la livraison';
      default:
        return type;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    return order.statut === activeFilter;
  });

  const renderOrderTimeline = (status: string) => {
    const steps = [
      { id: 'en_attente', label: 'En attente', icon: <Clock className="w-4 h-4" /> },
      { id: 'en_cours', label: 'En préparation', icon: <ShoppingBag className="w-4 h-4" /> },
      { id: 'en_livraison', label: 'En livraison', icon: <Truck className="w-4 h-4" /> },
      { id: 'validée', label: 'Livrée', icon: <CheckCircle className="w-4 h-4" /> }
    ];

    const currentStepIndex = steps.findIndex(step => step.id === status);
    // const isCompleted = status === 'validée';
    const isCancelled = status === 'annulee';

    if (isCancelled) {
      return (
        <div className="flex items-center justify-center mt-4 mb-2">
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg flex items-center">
            <XCircle className="w-5 h-5 mr-2" />
            <span>Commande annulée</span>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= currentStepIndex 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.icon}
                </div>
                <span className={`text-xs mt-1 ${
                  index <= currentStepIndex ? 'text-emerald-600 font-medium' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`h-1 flex-grow mx-1 ${
                    index < currentStepIndex ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
      <p className="text-gray-600">Chargement de vos commandes...</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-medium text-gray-800 mb-2">Oups !</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      <div className="flex space-x-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
        >
          Réessayer
        </button>
        <Link
          to="/auth"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm p-8">
      <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag className="w-10 h-10 text-emerald-500" />
      </div>
      <h2 className="text-2xl font-medium text-gray-800 mb-2">Aucune commande</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Vous n'avez pas encore passé de commande. Découvrez notre sélection de produits et commencez vos achats dès maintenant.
      </p>
      <Link to="/products">
        <ButtonPrimary className="bg-emerald-600 hover:bg-emerald-500 transition-colors">
          Découvrir nos produits
        </ButtonPrimary>
      </Link>
    </div>
  );

  return (
    <>
      <NavBar />
      <PageContainer>
        {/* Hero section */}
        <div className="bg-emerald-600 text-white py-12 mb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-serif font-medium mb-4">Mes commandes</h1>
              <p className="text-emerald-100 max-w-2xl mx-auto">
                Suivez l'état de vos commandes, consultez l'historique et gérez vos achats en toute simplicité.
              </p>
            </div>
          </div>
        </div>

        {/* Message de succès */}
        <div id="success-message" className="hidden fixed top-20 right-4 z-50 bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-md flex items-center max-w-md">
          <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
          <span className="flex-grow">Commande annulée avec succès.</span>
          <button
            onClick={() => document.getElementById('success-message')?.classList.add('hidden')}
            className="ml-2 text-emerald-500 hover:text-emerald-700"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          {loading ? (
            renderLoadingState()
          ) : error ? (
            renderErrorState()
          ) : orders.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {/* Filtres */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex items-center mb-2">
                  <Filter className="w-5 h-5 text-gray-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-800">Filtrer par statut</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeFilter === 'all' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    Toutes
                  </button>
                  <button
                    onClick={() => setActiveFilter('en_attente')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeFilter === 'en_attente' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    En attente
                  </button>
                  <button
                    onClick={() => setActiveFilter('en_cours')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeFilter === 'en_cours' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    En cours
                  </button>
                  <button
                    onClick={() => setActiveFilter('validée')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeFilter === 'validée' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    Validées
                  </button>
                  <button
                    onClick={() => setActiveFilter('annulee')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeFilter === 'annulee' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    Annulées
                  </button>
                </div>
              </div>

              {/* Liste des commandes */}
              <AnimatePresence>
                {filteredOrders.length > 0 ? (
                  <div className="space-y-6">
                    {filteredOrders.map((order) => {
                      const canCancel = ['en_attente', 'en_cours'].includes(order.statut);
                      const isExpanded = expandedOrder === order.id;
                      
                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white rounded-xl shadow-sm overflow-hidden"
                        >
                          {/* En-tête de la commande */}
                          <div 
                            className={`p-4 border-l-4 ${
                              order.statut === 'validée' ? 'border-emerald-500' :
                              order.statut === 'en_attente' ? 'border-amber-500' :
                              order.statut === 'en_cours' ? 'border-blue-500' :
                              'border-red-500'
                            } cursor-pointer hover:bg-gray-50 transition-colors`}
                            onClick={() => toggleOrderDetails(order.id)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="mr-4">
                                  {getStatusIcon(order.statut)}
                                </div>
                                <div>
                                  <h2 className="text-lg font-medium text-gray-800">
                                    Commande #{order.id}...
                                  </h2>
                                  <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>
                                      {new Date(order.date).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div className="text-right mr-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.statut)}`}>
                                    {order.statut === 'en_attente' ? 'En attente' : 
                                     order.statut === 'en_cours' ? 'En cours' :
                                     order.statut === 'validée' ? 'Validée' : 'Annulée'}
                                  </span>
                                  <p className="text-lg font-bold text-gray-800 mt-1">
                                    {parseFloat(order.total).toLocaleString('fr-FR')} FCFA
                                  </p>
                                </div>
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Détails de la commande */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="border-t border-gray-200"
                              >
                                {/* Timeline de statut */}
                                {renderOrderTimeline(order.statut)}

                                {/* Produits */}
                                <div className="px-6 py-4">
                                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                                    Produits commandés
                                  </h3>
                                  <div className="space-y-3">
                                    {order.lignes.map((ligne) => (
                                      <div key={ligne.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center">
                                          <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                                            <ShoppingBag className="w-5 h-5 text-gray-400" />
                                          </div>
                                          <div>
                                            <p className="text-gray-800 font-medium">{ligne.produit_nom}</p>
                                            <p className="text-gray-500 text-sm">Quantité: {ligne.quantite}</p>
                                          </div>
                                        </div>
                                        <p className="text-gray-800 font-medium">
                                          {parseFloat(ligne.prix_unitaire).toLocaleString('fr-FR')} FCFA
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Informations de paiement */}
                                <div className="px-6 py-4 bg-gray-50">
                                  <div className="flex justify-between mb-4">
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                                        Méthode de paiement
                                      </h3>
                                      <div className="flex items-center">
                                        <CreditCard className="w-4 h-4 text-gray-400 mr-1" />
                                        <span className="text-gray-800">
                                          {getPaymentMethodName(order.paiement?.type_transaction)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                                        Total
                                      </h3>
                                      <p className="text-xl font-bold text-gray-800">
                                        {parseFloat(order.total).toLocaleString('fr-FR')} FCFA
                                      </p>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex flex-wrap gap-3 mt-4">
                                    {canCancel && (
                                      <ButtonPrimary
                                        onClick={() => handleCancelOrder(order.id)}
                                        disabled={cancelLoading === order.id}
                                        className="bg-red-500 hover:bg-red-600 transition-colors"
                                      >
                                        {cancelLoading === order.id ? (
                                          <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Annulation...
                                          </>
                                        ) : (
                                          <>
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Annuler la commande
                                          </>
                                        )}
                                      </ButtonPrimary>
                                    )}
                                    
                                    {order.statut === 'en_cours' && (
                                      <ButtonPrimary className="bg-blue-500 hover:bg-blue-600 transition-colors">
                                        <Truck className="w-4 h-4 mr-2" />
                                        Suivre la livraison
                                      </ButtonPrimary>
                                    )}
                                    
                                    <ButtonPrimary className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">
                                      <FileText className="w-4 h-4 mr-2" />
                                      Télécharger la facture
                                    </ButtonPrimary>
                                    
                                    <ButtonPrimary className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors">
                                      <MessageCircle className="w-4 h-4 mr-2" />
                                      Contacter le support
                                    </ButtonPrimary>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <p className="text-gray-500">Aucune commande ne correspond à ce filtre.</p>
                    <button
                      onClick={() => setActiveFilter('all')}
                      className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Voir toutes les commandes
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default OrdersPage;
