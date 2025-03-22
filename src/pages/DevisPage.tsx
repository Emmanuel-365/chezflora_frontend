import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import ButtonPrimary from '../components/ButtonPrimary';
import { getDevis } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Devis {
  id: string;
  service: { id: string; nom: string };
  description: string;
  prix_propose: string | null;
  statut: 'en_attente' | 'accepte' | 'refuse';
  date_demande: string;
}

const DevisPage: React.FC = () => {
  
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevis = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const response = await getDevis();
        console.log('Réponse getDevis:', response.data); // Log pour vérifier
        setDevisList(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement des devis:', err.response?.status, err.response?.data);
        setError('Erreur lors du chargement des devis.');
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/auth');
        }
      }
    };

    fetchDevis();
  }, [navigate]);

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
          <h1 className="text-3xl font-serif font-medium text-soft-brown mb-6">Mes devis</h1>
          {devisList.length > 0 ? (
            <div className="space-y-6">
              <AnimatePresence>
                {devisList.map((devis) => (
                  <motion.div
                    key={devis.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="bg-light-beige p-4 rounded-lg shadow-md"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-soft-brown">Devis #{devis.id} - {devis.service.nom}</h2>
                      <p className={`text-sm ${devis.statut === 'accepte' ? 'text-soft-green' : devis.statut === 'refuse' ? 'text-powder-pink' : 'text-soft-brown/70'}`}>
                        Statut : {devis.statut === 'en_attente' ? 'En attente' : devis.statut === 'accepte' ? 'Accepté' : 'Refusé'}
                      </p>
                    </div>
                    <p className="text-soft-brown/90 mb-2">{devis.description}</p>
                    <p className="text-soft-brown mb-2">
                      Prix proposé : {devis.prix_propose ? `${Number(devis.prix_propose).toFixed(2)} FCFA` : 'Non spécifié'}
                    </p>
                    <p className="text-soft-brown/70 text-sm">
                      Demandé le : {new Date(devis.date_demande).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-soft-brown/70 mb-4">Vous n’avez aucun devis pour le moment.</p>
              <Link to="/services">
                <ButtonPrimary className="bg-soft-green hover:bg-soft-green/90">
                  Découvrir nos services
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

export default DevisPage;