import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import ButtonPrimary from '../components/ButtonPrimary';
import { getOrders } from '../services/api';
import axios from 'axios';

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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('access_token');
      console.log('Token dans OrdersPage:', token);
      if (!token) {
        console.log('Pas de token, redirection vers /auth');
        navigate('/auth');
        return;
      }

      try {
        const response = await getOrders();
        console.log('Réponse getOrders:', response.data);
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
      const response = await axios.post(
        `http://localhost:8000/api/commandes/${orderId}/cancel/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Réponse annulation commande:', response.data);
      const updatedOrders = await getOrders();
      setOrders(updatedOrders.data.results);
      alert('Commande annulée avec succès.');
    } catch (err: any) {
      console.error('Erreur lors de l’annulation:', err.response?.data);
      alert('Erreur lors de l’annulation : ' + (err.response?.data?.error || 'Vérifiez votre connexion.'));
    } finally {
      setCancelLoading(null);
    }
  };

  if (loading) {
    return <div className="text-center py-16">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-16 text-powder-pink">
        {error} <Link to="/auth" className="underline">Connectez-vous</Link>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <PageContainer>
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif font-medium text-soft-brown mb-6">Mes commandes</h1>
          {orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => {
                const canCancel = ['en_attente', 'en_cours'].includes(order.statut);
                return (
                  <div key={order.id} className="bg-light-beige p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-soft-brown">Commande #{order.id}</h2>
                      <div className="text-right">
                        <p className="text-soft-brown/70">
                          {new Date(order.date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p className={`text-sm ${order.statut === 'validée' ? 'text-soft-green' : order.statut === 'annulee' ? 'text-powder-pink' : 'text-soft-brown'}`}>
                          Statut : {order.statut}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {order.lignes.map((ligne) => (
                        <div key={ligne.id} className="flex justify-between">
                          <span className="text-soft-brown">
                            {ligne.produit_nom} (x{ligne.quantite})
                          </span>
                          <span className="text-soft-brown">
                            {Number(ligne.prix_unitaire).toFixed(2)} FCFA
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-xl font-medium text-soft-brown">Total : {order.total} FCFA</p>
                      {canCancel && (
                        <ButtonPrimary
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancelLoading === order.id}
                          className="bg-powder-pink hover:bg-powder-pink/90"
                        >
                          {cancelLoading === order.id ? 'Annulation...' : 'Annuler la commande'}
                        </ButtonPrimary>
                      )}
                    </div>
                    <p className="text-sm text-soft-brown/70 mt-2">Mis à jour : {new Date(order.date_mise_a_jour).toLocaleDateString('fr-FR')}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-soft-brown/70 mb-4">Vous n’avez aucune commande pour le moment.</p>
              <Link to="/products">
                <ButtonPrimary className="bg-soft-green hover:bg-soft-green/90">
                  Commencer vos achats
                </ButtonPrimary>
              </Link>
            </div>
          )}
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default OrdersPage;