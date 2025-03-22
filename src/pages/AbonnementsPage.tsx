import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import ButtonPrimary from '../components/ButtonPrimary';
import { getAbonnements, createAbonnement, getProducts } from '../services/api';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';

interface Abonnement {
  id: string;
  type: 'mensuel' | 'hebdomadaire' | 'annuel';
  produits: { id: string; nom: string; prix: number; photos: string[] }[];
  prix: string;
  date_debut: string;
  date_fin: string | null;
  prochaine_livraison: string | null;
  is_active: boolean;
}

interface Product {
  id: string;
  nom: string;
  prix: number;
  photos: string[];
}

const AbonnementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedType, setSelectedType] = useState<'mensuel' | 'hebdomadaire' | 'annuel'>('mensuel');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [dateDebut, setDateDebut] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dateFin, setDateFin] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const [abonnementsResponse, productsResponse] = await Promise.all([getAbonnements(), getProducts()]);
        console.log('Abonnements:', abonnementsResponse.data);
        console.log('Produits:', productsResponse.data);
        setAbonnements(abonnementsResponse.data);
        setProducts(productsResponse.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement:', err.response?.status, err.response?.data);
        setError('Erreur lors du chargement des abonnements ou produits.');
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/auth');
        }
      }
    };

    fetchData();
  }, [navigate]);

  const calculateEstimatedPrice = () => {
    const basePrice = products
      .filter((p) => selectedProducts.includes(p.id))
      .reduce((sum, p) => sum + p.prix, 0);
    return selectedType === 'hebdomadaire' ? basePrice * 4 
         : selectedType === 'mensuel' ? basePrice 
         : basePrice / 12;
  };

  const handleSubscribe = async () => {
    if (selectedProducts.length === 0) {
      alert('Veuillez sélectionner au moins un produit.');
      return;
    }

    if (dateFin && new Date(dateDebut) >= new Date(dateFin)) {
      alert('La date de début doit être antérieure à la date de fin.');
      return;
    }

    setSubscribeLoading(true);
    try {
      const data = {
        type: selectedType,
        produit_ids: selectedProducts,
        date_debut: dateDebut,
        ...(dateFin && { date_fin: dateFin }),
      };
      console.log('Envoi abonnement:', JSON.stringify(data));
      const response = await createAbonnement(data);
      console.log('Réponse création abonnement:', response.data);
      const updatedAbonnements = await getAbonnements();
      setAbonnements(updatedAbonnements.data);
      setSelectedProducts([]);
      setDateFin('');
      alert('Abonnement créé avec succès !');
    } catch (err: any) {
      console.error('Erreur lors de la création:', err.response?.data);
      alert('Erreur lors de la création de l’abonnement : ' + (err.response?.data?.error || 'Vérifiez votre connexion.'));
    } finally {
      setSubscribeLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cet abonnement ? Cela mettra fin à votre abonnement actif.')) return;
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `http://chezflora-api.onrender.com/api/abonnements/${id}/cancel/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Réponse annulation:', response.data);
      const updatedAbonnements = await getAbonnements();
      setAbonnements(updatedAbonnements.data);
      alert('Abonnement annulé avec succès.');
    } catch (err: any) {
      console.error('Erreur lors de l’annulation:', err.response?.data);
      alert('Erreur lors de l’annulation : ' + (err.response?.data?.error || 'Vérifiez votre connexion.'));
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
          <h1 className="text-3xl font-serif font-medium text-soft-brown mb-6">Mes abonnements</h1>

          {/* Formulaire d’abonnement */}
          <div className="bg-light-beige p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-medium text-soft-brown mb-4">Créer un abonnement</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-soft-brown font-medium mb-1">Type d’abonnement</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as 'mensuel' | 'hebdomadaire' | 'annuel')}
                  className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green bg-white text-soft-brown"
                >
                  <option value="mensuel">Mensuel</option>
                  <option value="hebdomadaire">Hebdomadaire</option>
                  <option value="annuel">Annuel</option>
                </select>
              </div>
              <div>
                <label className="block text-soft-brown font-medium mb-1">Date de début</label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green bg-white text-soft-brown"
                />
              </div>
              <div>
                <label className="block text-soft-brown font-medium mb-1">Date de fin (optionnel)</label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green bg-white text-soft-brown"
                />
              </div>
              <div>
                <label className="block text-soft-brown font-medium mb-2">Produits inclus</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-2 p-2 border border-soft-brown/30 rounded-md">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.id]);
                          } else {
                            setSelectedProducts(selectedProducts.filter((id) => id !== product.id));
                          }
                        }}
                        className="h-4 w-4 text-soft-green border-soft-brown/30 rounded focus:ring-soft-green"
                      />
                      <img src={product.photos[0] || '/images/placeholder-image.jpg'} alt={product.nom} className="w-10 h-10 object-cover rounded-md" />
                      <span className="text-soft-brown">{product.nom}</span>
                    </div>
                  ))}
                </div>
              </div>
              {selectedProducts.length > 0 && (
                <p className="text-soft-brown font-medium">
                  Prix estimé : {calculateEstimatedPrice()} FCFA
                </p>
              )}
              <ButtonPrimary
                onClick={handleSubscribe}
                disabled={subscribeLoading || selectedProducts.length === 0}
                className="w-full bg-soft-green hover:bg-soft-green/90"
              >
                {subscribeLoading ? 'Création...' : 'S’abonner'}
              </ButtonPrimary>
            </div>
          </div>

          {/* Liste des abonnements */}
          <div className="space-y-6">
            {abonnements.length > 0 ? (
              <AnimatePresence>
                {abonnements.map((abonnement) => (
                  <motion.div
                    key={abonnement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="bg-light-beige p-4 rounded-lg shadow-md"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-soft-brown">
                        Abonnement {abonnement.type.charAt(0).toUpperCase() + abonnement.type.slice(1)}
                      </h2>
                      <p className={`text-sm ${abonnement.is_active ? 'text-soft-green' : 'text-powder-pink'}`}>
                        {abonnement.is_active ? 'Actif' : 'Inactif'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {abonnement.produits.map((p) => (
                        <div key={p.id} className="flex items-center space-x-2">
                          <img src={p.photos[0] || '/images/placeholder-image.jpg'} alt={p.nom} className="w-8 h-8 object-cover rounded-md" />
                          <span className="text-soft-brown/90">{p.nom}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-soft-brown mb-2">Prix : {abonnement.prix} FCFA</p>
                    <p className="text-soft-brown/70 text-sm mb-2">Fréquence : {getFrequencyText(abonnement.type)}</p>
                    <p className="text-soft-brown/70 text-sm mb-2">
                      Début : {new Date(abonnement.date_debut).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-soft-brown/70 text-sm mb-2">
                      Fin : {abonnement.date_fin ? new Date(abonnement.date_fin).toLocaleDateString('fr-FR') : 'Non définie'}
                    </p>
                    <p className="text-soft-brown/70 text-sm mb-2">
                      Prochaine livraison : {abonnement.prochaine_livraison ? new Date(abonnement.prochaine_livraison).toLocaleDateString('fr-FR') : 'Non définie'}
                    </p>
                    {abonnement.is_active && (
                      <ButtonPrimary
                        onClick={() => handleCancel(abonnement.id)}
                        className="mt-2 bg-powder-pink hover:bg-powder-pink/90"
                      >
                        Annuler l’abonnement
                      </ButtonPrimary>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <p className="text-center text-soft-brown/70">Vous n’avez aucun abonnement actif.</p>
            )}
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default AbonnementsPage;