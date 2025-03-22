"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Flower, Heart, Star } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import HeroBanner from '../components/HeroBanner';
import FeaturedProducts from '../components/FeaturedProducts';
import ServicesOverview from '../components/ServicesOverview';
import UpcomingWorkshops from '../components/UpcomingWorkshops';
import RecentArticles from '../components/RecentArticles';
import WhyChooseUs from '../components/WhyChooseUs';
import FeaturedPromotions from '../components/FeaturedPromotions';
import { getProducts, getServices, getWorkshops, getArticles, getPromotions } from '../services/api';

// Définir les interfaces pour les données
interface Product {
  id: string;
  nom: string;
  prix: number;
  prix_reduit?: number;
  photos: Photo[];
  description: string;
  categorie: Category;
}

interface Photo {
  id: string;
  image: string;
}

interface Category {
  id: number
}

interface Service {
  title: string;
  description: string;
  icon: JSX.Element;
  link: string;
}

interface Workshop {
  id: string;
  title: string;
  date: string;
  places: number;
  link: string;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  link: string;
}

interface Promotion {
  id: string;
  nom: string;
  description: string;
  produits: Product[];
}

interface Feature {
  title: string;
  description: string;
  icon: JSX.Element;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    products: true,
    services: true,
    workshops: true,
    articles: true,
    promotions: true,
  });
  const [errorStates, setErrorStates] = useState<{
    products: string | null;
    services: string | null;
    workshops: string | null;
    articles: string | null;
    promotions: string | null;
  }>({
    products: null,
    services: null,
    workshops: null,
    articles: null,
    promotions: null,
  });

  const features: Feature[] = [
    { title: 'Qualité premium', description: 'Nous sélectionnons les meilleures fleurs et plantes', icon: <Star className="w-6 h-6 text-soft-green" /> },
    { title: 'Expertise florale', description: 'Notre équipe de fleuristes passionnés à votre service', icon: <Flower className="w-6 h-6 text-soft-green" /> },
    { title: 'Satisfaction garantie', description: 'Nous nous engageons à vous offrir le meilleur service', icon: <Heart className="w-6 h-6 text-soft-green" /> },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProducts();
        setProducts(res.data.results.slice(0, 4).map((p: any) => ({
          id: p.id,
          nom: p.nom,
          prix: parseFloat(p.prix),
          prix_reduit: p.prix_reduit ? parseFloat(p.prix_reduit) : undefined,
          photos: p.photos || [],
          description: p.description || '',
        })));
      } catch (err) {
        setErrorStates(prev => ({ ...prev, products: 'Erreur lors du chargement des produits' }));
      } finally {
        setLoadingStates(prev => ({ ...prev, products: false }));
      }
    };

    const fetchServices = async () => {
      try {
        const res = await getServices();
        setServices(res.data.results.slice(0, 3).map((s: any, index: number) => ({
          title: s.nom,
          description: s.description,
          icon: [<Truck key="truck" className="w-6 h-6 text-soft-green" />, <Flower key="flower" className="w-6 h-6 text-soft-green" />, <Heart key="heart" className="w-6 h-6 text-soft-green" />][index % 3],
          link: `/services/${s.id}`,
        })));
      } catch (err) {
        setErrorStates(prev => ({ ...prev, services: 'Erreur lors du chargement des services' }));
      } finally {
        setLoadingStates(prev => ({ ...prev, services: false }));
      }
    };

    const fetchWorkshops = async () => {
      try {
        const res = await getWorkshops();
        setWorkshops(res.data.results.slice(0, 3).map((w: any) => ({
          id: w.id,
          title: w.titre,
          date: new Date(w.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
          places: w.places_disponibles,
          link: `/ateliers/${w.id}`,
        })));
      } catch (err) {
        setErrorStates(prev => ({ ...prev, workshops: 'Erreur lors du chargement des ateliers' }));
      } finally {
        setLoadingStates(prev => ({ ...prev, workshops: false }));
      }
    };

    const fetchArticles = async () => {
      try {
        const res = await getArticles();
        setArticles(res.data.results.slice(0, 3).map((a: any) => ({
          id: a.id,
          title: a.titre,
          excerpt: a.contenu.substring(0, 100) + '...',
          imageUrl: a.image || '/images/placeholder.jpg',
          link: `/blog/${a.id}`,
        })));
      } catch (err) {
        setErrorStates(prev => ({ ...prev, articles: 'Erreur lors du chargement des articles' }));
      } finally {
        setLoadingStates(prev => ({ ...prev, articles: false }));
      }
    };

    const fetchPromotions = async () => {
      try {
        const res = await getPromotions();
        setPromotions(res.data.results.map((promo: any) => ({
          id: promo.id,
          nom: promo.nom,
          description: promo.description,
          produits: promo.produits.map((p: any) => ({
            id: p.id,
            nom: p.nom,
            prix: parseFloat(p.prix),
            prix_reduit: p.prix_reduit ? parseFloat(p.prix_reduit) : undefined,
            photos: p.photos || [],
          })),
        })));
      } catch (err) {
        setErrorStates(prev => ({ ...prev, promotions: 'Erreur lors du chargement des promotions' }));
      } finally {
        setLoadingStates(prev => ({ ...prev, promotions: false }));
      }
    };

    fetchProducts();
    fetchServices();
    fetchWorkshops();
    fetchArticles();
    fetchPromotions();
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const SkeletonLoader = ({ count = 3 }: { count?: number }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-gray-100 rounded-xl p-4 animate-pulse">
          <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <NavBar />
      <PageContainer className="p-0">
        <main>
          <HeroBanner
            title="Bienvenue chez ChezFlora"
            subtitle="Découvrez notre sélection de fleurs et plantes pour embellir votre quotidien"
            buttonText="Découvrir nos produits"
            buttonLink="/products"
            backgroundImage="/images/hero-banner.jpg"
          />

          <motion.section
            className="py-12"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-3xl font-serif text-soft-brown text-center mb-8">Nos offres spéciales</h2>
            <AnimatePresence mode="wait">
              {loadingStates.promotions ? (
                <motion.div
                  key="promotions-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SkeletonLoader count={2} />
                </motion.div>
              ) : errorStates.promotions ? (
                <motion.p
                  key="promotions-error"
                  className="text-powder-pink text-center text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errorStates.promotions}
                </motion.p>
              ) : (
                <motion.div
                  key="promotions-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <FeaturedPromotions promotions={promotions} title="Nos produits phares"/>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          <motion.section
            className="py-12 bg-light-beige"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-3xl font-serif text-soft-brown text-center mb-8">Nos produits phares</h2>
            <AnimatePresence mode="wait">
              {loadingStates.products ? (
                <motion.div
                  key="products-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SkeletonLoader count={4} />
                </motion.div>
              ) : errorStates.products ? (
                <motion.p
                  key="products-error"
                  className="text-powder-pink text-center text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errorStates.products}
                </motion.p>
              ) : (
                <motion.div
                  key="products-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <FeaturedProducts products={products} title="Nos produits phares"/>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          <motion.section
            className="py-12"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-3xl font-serif text-soft-brown text-center mb-8">Nos services</h2>
            <AnimatePresence mode="wait">
              {loadingStates.services ? (
                <motion.div
                  key="services-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SkeletonLoader count={3} />
                </motion.div>
              ) : errorStates.services ? (
                <motion.p
                  key="services-error"
                  className="text-powder-pink text-center text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errorStates.services}
                </motion.p>
              ) : (
                <motion.div
                  key="services-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <ServicesOverview services={services} title="Nos services"/>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          <motion.section
            className="py-12 bg-light-beige"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-3xl font-serif text-soft-brown text-center mb-8">Ateliers à venir</h2>
            <AnimatePresence mode="wait">
              {loadingStates.workshops ? (
                <motion.div
                  key="workshops-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SkeletonLoader count={3} />
                </motion.div>
              ) : errorStates.workshops ? (
                <motion.p
                  key="workshops-error"
                  className="text-powder-pink text-center text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errorStates.workshops}
                </motion.p>
              ) : (
                <motion.div
                  key="workshops-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <UpcomingWorkshops workshops={workshops} title="Ateliers à venir"/>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          <motion.section
            className="py-12"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-3xl font-serif text-soft-brown text-center mb-8">Nos derniers articles</h2>
            <AnimatePresence mode="wait">
              {loadingStates.articles ? (
                <motion.div
                  key="articles-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SkeletonLoader count={3} />
                </motion.div>
              ) : errorStates.articles ? (
                <motion.p
                  key="articles-error"
                  className="text-powder-pink text-center text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errorStates.articles}
                </motion.p>
              ) : (
                <motion.div
                  key="articles-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <RecentArticles articles={articles} title="Nos derniers articles" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          <motion.section
            className="py-12 bg-light-beige"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-3xl font-serif text-soft-brown text-center mb-8">Pourquoi choisir ChezFlora ?</h2>
            <WhyChooseUs features={features} title="Pourquoi choisir ChezFlora ?" />
          </motion.section>
        </main>
      </PageContainer>
      <Footer />
    </>
  );
}