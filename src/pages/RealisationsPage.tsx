import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import { getRealisations } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';

interface Service {
    id: string,
    nom: string
}

interface Realisation {
  id: string;
  titre: string;
  description: string;
  photos: string[];  // Supposons une liste d’URLs pour simplifier
  date_creation: string;
  service: Service;
}

const RealisationsPage: React.FC = () => {
  
  const [realisations, setRealisations] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchRealisations = async () => {
      try {
        const response = await getRealisations();
        // Si photos est une chaîne JSON ou séparée, on pourrait parser ici si besoin
        setRealisations(response.data.results.map((r: any) => ({
          ...r,
          photos: typeof r.photos === 'string' ? JSON.parse(r.photos) : r.photos,  // Ajuster selon le format
        })));
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement:', err.response?.data);
        setError('Erreur lors du chargement des réalisations.');
        setLoading(false);
      }
    };

    fetchRealisations();
  }, []);

  if (loading) {
    return <div className="text-center py-16">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-powder-pink">{error}</div>;
  }

  return (
    <>
      <NavBar />
      <PageContainer>
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif font-medium text-soft-brown mb-6">Nos réalisations</h1>

          {/* Grille des réalisations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {realisations.length > 0 ? (
              <AnimatePresence>
                {realisations.map((realisation, index) => (
                  <motion.div
                    key={realisation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-light-beige p-4 rounded-lg shadow-md"
                  >
                    {realisation.photos && realisation.photos.length > 0 ? (
                      <img
                        src={realisation.photos[0]}  // Première photo comme couverture
                        alt={realisation.titre}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    ) : (
                      <div className="w-full h-48 bg-soft-brown/10 rounded-md mb-4 flex items-center justify-center">
                        <span className="text-soft-brown/50">Aucune photo</span>
                      </div>
                    )}
                    <h2 className="text-xl font-medium text-soft-brown mb-2">{realisation.titre}</h2>
                    <p className="text-soft-brown/70 text-sm mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(realisation.date_creation).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-soft-brown/90 mb-2 line-clamp-2">{realisation.description}</p>
                    <p className="text-soft-brown/70 text-sm">Service : {realisation.service.nom}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <p className="text-center text-soft-brown/70 col-span-full">Aucune réalisation disponible pour le moment.</p>
            )}
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default RealisationsPage;