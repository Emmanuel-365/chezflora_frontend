import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import ButtonPrimary from '../components/ButtonPrimary';
import { getWishlist, supprimerProduitWishlist } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Photo {
  image: string ;
}

interface Produit {
  id: string;
  nom: string;
  prix: string;
  photos: Photo[];
}

interface Wishlist {
  id: string;
  produits: Produit[];
}

const WishlistPage: React.FC = () => {
  
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const response = await getWishlist();
        console.log('Wishlist:', response.data);
        // Supposons que l’API renvoie une liste, prenons le premier élément (unique par utilisateur)
        setWishlist(response.data.results.length > 0 ? response.data.results[0] : { id: '', produits: [] });
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement:', err.response?.status, err.response?.data);
        setError('Erreur lors du chargement de la liste de souhaits.');
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/auth');
        }
      }
    };

    fetchWishlist();
  }, [navigate]);

  const handleSupprimerProduit = async (produitId: string) => {
    setActionLoading(produitId);
    try {
      await supprimerProduitWishlist(produitId);
      const response = await getWishlist();
      setWishlist(response.data.results.length > 0 ? response.data.results[0] : { id: '', produits: [] });
      alert('Produit supprimé de la liste de souhaits.');
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err.response?.data);
      alert('Erreur lors de la suppression : ' + (err.response?.data?.error || 'Vérifiez votre connexion.'));
    } finally {
      setActionLoading(null);
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
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif font-medium text-soft-brown mb-6">Ma liste de souhaits</h1>

          {/* Liste des produits dans la wishlist */}
          <div className="space-y-6">
            {wishlist && wishlist.produits.length > 0 ? (
              <AnimatePresence>
                {wishlist.produits.map((produit) => (
                  <motion.div
                    key={produit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="bg-light-beige p-4 rounded-lg shadow-md flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={produit.photos[0].image || '/images/placeholder-image.jpg'}
                        alt={produit.nom}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div>
                        <h2 className="text-lg font-medium text-soft-brown">{produit.nom}</h2>
                        <p className="text-soft-brown mb-2">Prix : {produit.prix} FCFA</p>
                      </div>
                    </div>
                    <ButtonPrimary
                      onClick={() => handleSupprimerProduit(produit.id)}
                      disabled={actionLoading === produit.id}
                      className="bg-powder-pink hover:bg-powder-pink/90"
                    >
                      {actionLoading === produit.id ? 'Suppression...' : 'Supprimer'}
                    </ButtonPrimary>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center">
                <p className="text-soft-brown/70 mb-4">Votre liste de souhaits est vide.</p>
                <Link to="/products">
                  <ButtonPrimary className="bg-soft-green hover:bg-soft-green/90">
                    Découvrir nos produits
                  </ButtonPrimary>
                </Link>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default WishlistPage;