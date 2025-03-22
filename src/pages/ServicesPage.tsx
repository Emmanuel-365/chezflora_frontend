import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import ButtonPrimary from '../components/ButtonPrimary';
import { getServices } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Service {
  id: string;
  nom: string;
  description: string;
  photos: string[];
  is_active: boolean;
  date_creation: string;
}

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServices();
        setServices(response.data.results);
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement des services:', err.response?.status, err.response?.data);
        setError('Erreur lors du chargement des services.');
        setLoading(false);
      }
    };

    fetchServices();
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
          {/* En-tête */}
          <div className="relative h-64 bg-soft-green overflow-hidden mb-12">
            <img
              src="/images/services-header.jpg"
              alt="Services floraux"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-soft-green/80 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.h1
                className="text-5xl font-serif font-medium text-white text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Nos services floraux
              </motion.h1>
            </div>
          </div>

          {/* Liste des services */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {services.length > 0 ? (
                services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="bg-light-beige p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                      <img
                        src={service.photos[0] || '/images/service-placeholder.jpg'}
                        alt={service.nom}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                      <h2 className="text-lg font-medium text-soft-brown mb-2">{service.nom}</h2>
                      <p className="text-soft-brown/70 mb-4 line-clamp-3">{service.description}</p>
                      <ButtonPrimary
                        onClick={() => navigate(`/services/${service.id}`)}
                        className="w-full bg-soft-green hover:bg-soft-green/90"
                      >
                        En savoir plus
                      </ButtonPrimary>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.p
                  className="text-center text-soft-brown/70 col-span-full text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Aucun service disponible pour le moment.
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

export default ServicesPage;