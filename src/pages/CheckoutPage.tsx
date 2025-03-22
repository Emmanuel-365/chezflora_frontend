import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import ButtonPrimary from '../components/ButtonPrimary';
import { getCart, validateCart, getAddresses, createAddress } from '../services/api';
import { AlertCircle, ChevronLeft } from 'lucide-react';

interface CartItem {
  id: string;
  produit: {
    id: string;
    nom: string;
    prix: number;
    prix_reduit?: number;
    photos: string[];
  };
  quantite: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  total: string;
}

interface Adresse {
  id: string;
  nom: string;
  rue: string;
  ville: string;
  code_postal: string;
  pays: string;
  is_default: boolean;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Adresse[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [newAddress, setNewAddress] = useState({ nom: '', rue: '', ville: '', code_postal: '', pays: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const [cartResponse, addressesResponse] = await Promise.all([getCart(), getAddresses()]);
        setCart(cartResponse.data);
        setAddresses(addressesResponse.data.results);
        if (addressesResponse.data.results.length > 0) {
          setSelectedAddress(addressesResponse.data.results[0].id);
        }
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement:', err.response?.status, err.response?.data);
        setError('Erreur lors du chargement des données.');
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/auth');
        }
      }
    };


    fetchData();
  }, [navigate]);

  const handleAddAddress = async () => {
    try {
      const response = await createAddress(newAddress);
      setAddresses([...addresses, response.data]);
      setSelectedAddress(response.data.id);
      setNewAddress({ nom: '', rue: '', ville: '', code_postal: '', pays: '' });
      alert('Adresse ajoutée avec succès !');
    } catch (err: any) {
      alert('Erreur lors de l’ajout de l’adresse : ' + (err.response?.data?.detail || 'Vérifiez vos entrées.'));
    }
  };

  const handleCheckout = async () => {
    if (!cart || !selectedAddress) return;
    setCheckoutLoading(true);
    try {
      await validateCart(cart.id, { adresse_id: selectedAddress });
      alert('Commande validée avec succès !');
      navigate('/orders');
    } catch (err: any) {
      console.error('Erreur lors de la validation:', err.response?.status, err.response?.data);
      alert('Erreur lors de la validation : ' + (err.response?.data?.error || 'Vérifiez votre connexion.'));
    } finally {
      setCheckoutLoading(false);
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
        <div className="max-w-6xl mx-auto py-10 flex flex-col lg:flex-row lg:space-x-12">
          {/* Sidebar - Résumé du panier */}
          <aside className="lg:w-1/3 mb-8 lg:mb-0">
            <div className="bg-light-beige p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-medium text-soft-brown mb-4">Résumé de la commande</h2>
              {cart && cart.items.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <img
                          src={item.produit.photos[0] || '/images/placeholder-image.jpg'}
                          alt={item.produit.nom}
                          className="w-16 h-16 object-cover rounded-md mr-4"
                        />
                        <div className="flex-grow">
                          <p className="text-soft-brown font-medium">{item.produit.nom}</p>
                          <p className="text-soft-brown/70">Quantité : {item.quantite}</p>
                          <p className="text-soft-brown">
                            {item.produit.prix_reduit ? (
                              <>{item.produit.prix_reduit.toFixed(2)} FCFA</>
                            ) : (
                              item.produit.prix.toFixed(2) + ' FCFA'
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-soft-brown/30 pt-4">
                    <p className="text-xl font-medium text-soft-brown text-right">Total : {cart.total} FCFA</p>
                  </div>
                </>
              ) : (
                <p className="text-soft-brown/70">Votre panier est vide.</p>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 lg:max-w-2xl">
            <div className="bg-light-beige p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-medium text-soft-brown mb-4">Finaliser la commande</h2>

              {/* Adresse de livraison */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-soft-brown mb-2">Adresse de livraison</h3>
                  {addresses.length > 0 ? (
                    <select
                      value={selectedAddress}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green bg-white text-soft-brown"
                    >
                      {addresses.map((adresse) => (
                        <option key={adresse.id} value={adresse.id}>
                          {adresse.nom} - {adresse.rue}, {adresse.ville} ({adresse.code_postal})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-soft-brown/70">Aucune adresse enregistrée.</p>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-soft-brown font-medium">Ajouter une nouvelle adresse</h4>
                  <input
                    type="text"
                    placeholder="Nom complet"
                    value={newAddress.nom}
                    onChange={(e) => setNewAddress({ ...newAddress, nom: e.target.value })}
                    className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green bg-white text-soft-brown"
                  />
                  <input
                    type="text"
                    placeholder="Rue"
                    value={newAddress.rue}
                    onChange={(e) => setNewAddress({ ...newAddress, rue: e.target.value })}
                    className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green bg-white text-soft-brown"
                  />
                  <input
                    type="text"
                    placeholder="Ville"
                    value={newAddress.ville}
                    onChange={(e) => setNewAddress({ ...newAddress, ville: e.target.value })}
                    className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green bg-white text-soft-brown"
                  />
                  <input
                    type="text"
                    placeholder="Code postal"
                    value={newAddress.code_postal}
                    onChange={(e) => setNewAddress({ ...newAddress, code_postal: e.target.value })}
                    className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green bg-white text-soft-brown"
                  />
                  <input
                    type="text"
                    placeholder="Pays"
                    value={newAddress.pays}
                    onChange={(e) => setNewAddress({ ...newAddress, pays: e.target.value })}
                    className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green bg-white text-soft-brown"
                  />
                  <ButtonPrimary onClick={handleAddAddress} className="bg-soft-green hover:bg-soft-green/90">
                    Ajouter l’adresse
                  </ButtonPrimary>
                </div>

                {/* Validation */}
                <div className="mt-6 border-t border-soft-brown/30 pt-6">
                  <ButtonPrimary
                    onClick={handleCheckout}
                    disabled={checkoutLoading || !selectedAddress || !cart?.items.length}
                    className="w-full bg-soft-green hover:bg-soft-green/90"
                  >
                    {checkoutLoading ? 'Validation...' : 'Valider la commande'}
                  </ButtonPrimary>
                  <Link to="/cart" className="flex items-center justify-center mt-4 text-soft-brown hover:text-soft-green">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Retour au panier
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default CheckoutPage;