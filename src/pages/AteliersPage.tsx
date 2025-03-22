import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import ButtonPrimary from '../components/ButtonPrimary';
import { getAteliers, inscrireAtelier, desinscrireAtelier} from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Atelier } from '../types/types';

const AteliersPage: React.FC = () => {
  
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [ateliers, setAteliers] = useState<Atelier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return; // Attend que l'authentification soit vérifiée

      try {
        const ateliersResponse = await getAteliers();
        setAteliers(ateliersResponse.data.results || ateliersResponse.data); // Adapte selon la structure de la réponse
        if (isAuthenticated && user) {
          // const userResponse = await getUserProfile();
          // setAteliers((prev) =>
          //   prev.map((atelier) => ({
          //     ...atelier,
          //     participants: atelier.participants || [],
          //   }))
          // );
        }
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement:', err.response?.status, err.response?.data);
        setError('Erreur lors du chargement des ateliers.');
        setLoading(false);
        if (err.response?.status === 401) {
          navigate('/auth');
        }
      }
    };

    fetchData();
  }, [navigate, isAuthenticated, user, authLoading]);

  const handleInscription = async (atelierId: string) => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: '/ateliers' } });
      return;
    }
    setActionLoading(atelierId);
    try {
      await inscrireAtelier(atelierId);
      const updatedAteliers = await getAteliers();
      setAteliers(updatedAteliers.data.results || updatedAteliers.data);
      alert('Inscription réussie !');
    } catch (err: any) {
      console.error('Erreur lors de l’inscription:', err.response?.data);
      alert('Erreur lors de l’inscription : ' + (err.response?.data?.error || 'Vérifiez votre connexion.'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDesinscription = async (atelierId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir vous désinscrire de cet atelier ?')) return;
    setActionLoading(atelierId);
    try {
      await desinscrireAtelier(atelierId);
      const updatedAteliers = await getAteliers();
      setAteliers(updatedAteliers.data.results || updatedAteliers.data);
      alert('Désinscription réussie.');
    } catch (err: any) {
      console.error('Erreur lors de la désinscription:', err.response?.data);
      alert('Erreur lors de la désinscription : ' + (err.response?.data?.error || 'Vérifiez votre connexion.'));
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-soft-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="text-center py-16 text-powder-pink">
          {error} <Link to="/auth" className="underline hover:text-soft-green">Connectez-vous</Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <>
      <NavBar />
      <PageContainer>
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-serif font-medium text-soft-brown mb-8 text-center"
          >
            Ateliers Floraux
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {ateliers.length > 0 ? (
                ateliers.map((atelier) => {
                  const isInscrit = user && atelier.participants.some(p => p.utilisateur.id == user.id);
                  const isAnnule = !atelier.is_active;

                  return (
                    <motion.div
                      key={atelier.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="bg-light-beige p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <h2 className="text-xl font-medium text-soft-brown">{atelier.nom}</h2>
                          <span
                            className={`text-sm font-semibold ${
                              atelier.places_disponibles > 0 ? 'text-soft-green' : 'text-powder-pink'
                            }`}
                          >
                            {atelier.places_disponibles > 0
                              ? `${atelier.places_disponibles} places`
                              : 'Complet'}
                          </span>
                        </div>
                        <p className="text-soft-brown/80 mb-4 line-clamp-3">{atelier.description}</p>
                        <div className="flex items-center text-soft-brown/70 text-sm mb-4">
                          <Calendar className="h-5 w-5 mr-2" />
                          {new Date(atelier.date).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <p className="text-soft-brown font-semibold mb-4">Prix : {atelier.prix} FCFA</p>
                        {isInscrit && !isAnnule && (
                          <p className="text-soft-green text-sm mb-4">Vous êtes inscrit.</p>
                        )}
                        {isAnnule && (
                          <p className="text-powder-pink text-sm mb-4">Atelier annulé</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {!isAnnule && (
                          <ButtonPrimary
                            onClick={() =>
                              isInscrit ? handleDesinscription(atelier.id) : handleInscription(atelier.id)
                            }
                            disabled={
                              actionLoading === atelier.id ||
                              (!isInscrit && atelier.places_disponibles <= 0)
                            }
                            className={`w-full ${
                              isInscrit
                                ? 'bg-powder-pink hover:bg-powder-pink/90'
                                : 'bg-soft-green hover:bg-soft-green/90'
                            }`}
                          >
                            {actionLoading === atelier.id
                              ? isInscrit
                                ? 'Désinscription...'
                                : 'Inscription...'
                              : isInscrit
                              ? 'Se désinscrire'
                              : 'S’inscrire'}
                          </ButtonPrimary>
                        )}
                        <Link
                          to={`/ateliers/${atelier.id}`}
                          className="flex items-center justify-center text-soft-brown hover:text-soft-green text-sm font-medium"
                        >
                          Voir les détails <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center text-soft-brown/70 py-8"
                >
                  Aucun atelier disponible pour le moment.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default AteliersPage;