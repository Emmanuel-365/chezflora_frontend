import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  return (
    <>
      <NavBar />
      <PageContainer>
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-serif font-medium text-soft-brown mb-6 text-center">À propos de ChezFlora</h1>
            <p className="text-soft-brown/90 mb-6 leading-relaxed">
              Bienvenue chez ChezFlora, votre boutique florale dédiée à la beauté naturelle et à la créativité. Depuis notre création, nous nous efforçons d’apporter une touche de magie à chaque moment de votre vie grâce à nos compositions uniques et personnalisées.
            </p>
            <p className="text-soft-brown/90 mb-6 leading-relaxed">
              Notre mission est simple : célébrer la nature à travers des fleurs soigneusement sélectionnées et des services sur mesure. Que ce soit pour un bouquet quotidien, une occasion spéciale ou un atelier floral, nous mettons tout notre cœur à rendre chaque expérience mémorable.
            </p>
            <h2 className="text-2xl font-medium text-soft-brown mb-4">Notre histoire</h2>
            <p className="text-soft-brown/90 mb-6 leading-relaxed">
              Fondée par une équipe passionnée par l’art floral, ChezFlora est née d’un amour pour les fleurs et d’un désir de partager cette passion avec vous. Ce qui a commencé comme une petite boutique locale est aujourd’hui une référence pour les amateurs de beauté naturelle.
            </p>
            <h2 className="text-2xl font-medium text-soft-brown mb-4">Nos valeurs</h2>
            <ul className="list-disc list-inside text-soft-brown/90 mb-6 leading-relaxed">
              <li>Qualité : Des fleurs fraîches et durables, choisies avec soin.</li>
              <li>Créativité : Des designs uniques qui racontent une histoire.</li>
              <li>Proximité : Un service client chaleureux et attentif.</li>
            </ul>
            <div className="text-center">
              <img
                src="/images/chezflora-team.jpg"  // Remplacez par une vraie image
                alt="Équipe ChezFlora"
                className="w-full max-w-md mx-auto rounded-lg shadow-md mb-6"
              />
              <p className="text-soft-brown/70 italic">L’équipe ChezFlora, prête à fleurir votre quotidien.</p>
            </div>
          </motion.div>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default AboutPage;