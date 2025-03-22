import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import ButtonPrimary from '../components/ButtonPrimary';
import { getCart, updateCartQuantity, removeFromCart } from '../services/api';
import { Trash2, Plus, Minus } from 'lucide-react';

interface Photo {
  image: string;
}

interface CartItem {
  id: string;
  produit: {
    id: string;
    nom: string;
    prix: number;
    prix_reduit?: number;
    photos: Photo[];
  };
  quantite: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  total: string;
}

const CartPage: React.FC = () => {
  
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('access_token');
      console.log('Token:', token); // Log du token
      if (!token) {
        navigate('/auth');
        return;
      }
      setCheckoutLoading(false);

      try {
        const response = await getCart();
        console.log('Réponse getCart:', response.data); // Log de la réponse
        setCart(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors de getCart:', err.response?.status, err.response?.data);
        setError('Erreur lors du chargement du panier.');
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/auth');
        }
      }
    };

    fetchCart();
  }, [navigate]);

  const handleQuantityChange = async (itemId: string, produitId: string, delta: number) => {
    if (!cart) return;
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantite + delta;
    if (newQuantity <= 0) return;

    try {
      await updateCartQuantity(cart.id, { produit_id: produitId, quantite: newQuantity });
      const response = await getCart();
      setCart(response.data);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la quantité:', err);
    }
  };

  const handleRemoveItem = async (produitId: string) => {
    if (!cart) return;
    try {
      await removeFromCart(cart.id, { produit_id: produitId });
      const response = await getCart();
      setCart(response.data);
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err);
    }
  };

  // const handleCheckout = async () => {
  //   if (!cart) return;
  //   setCheckoutLoading(true);
  //   try {
  //     await validateCart(cart.id);
  //     alert('Commande validée avec succès !');
  //     setCart(null);
  //   } catch (err) {
  //     alert('Erreur lors de la validation du panier.');
  //   } finally {
  //     setCheckoutLoading(false);
  //   }
  // };

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
          <h1 className="text-3xl font-serif font-medium text-soft-brown mb-6">Votre panier</h1>
          {cart && cart.items.length > 0 ? (
            <>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center bg-light-beige p-4 rounded-lg shadow-md">
                    <Link to={`/products/${item.produit.id}`}>
                      <img
                        src={item.produit.photos[0].image || '/images/placeholder-image.jpg'}
                        alt={item.produit.nom}
                        className="w-20 h-20 object-cover rounded-md mr-4 hover:opacity-80 transition-opacity"
                      />
                    </Link>
                    <div className="flex-grow">
                      <h2 className="text-lg font-medium text-soft-brown">{item.produit.nom}</h2>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center bg-white rounded-full px-2 py-1">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.produit.id, -1)}
                            disabled={item.quantite <= 1}
                            className="p-1 text-soft-brown hover:text-soft-green transition-colors disabled:opacity-50"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="w-12 text-center text-soft-brown font-medium">{item.quantite}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.produit.id, 1)}
                            className="p-1 text-soft-brown hover:text-soft-green transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-soft-brown">
                          {item.produit.prix_reduit ? (
                            <>
                              <span className="text-powder-pink font-bold">{item.produit.prix_reduit} FCFA</span>
                              <span className="text-soft-brown/60 line-through ml-2">{item.produit.prix} FCFA</span>
                            </>
                          ) : (
                            <span className="font-bold">{item.produit.prix.toFixed(2)} FCFA</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.produit.id)}
                      className="ml-4 text-soft-brown hover:text-powder-pink transition-colors"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-right">
                <p className="text-xl font-medium text-soft-brown">Total : {cart.total} FCFA</p>
                <ButtonPrimary
                  onClick={() => navigate('/checkout')}
                  disabled={checkoutLoading}
                  className="mt-4 bg-soft-green hover:bg-soft-green/90"
                >
                  Passer à la caisse
                </ButtonPrimary>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-soft-brown/70 mb-4">Votre panier est vide.</p>
              <Link to="/products">
                <ButtonPrimary className="bg-soft-green hover:bg-soft-green/90">
                  Continuer vos achats
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

export default CartPage;