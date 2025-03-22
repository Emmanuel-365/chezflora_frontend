"use client"

import React, { useState, useEffect } from 'react';
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
import LoadingSpinner from '../components/LoadingSpinner';
import { getProducts, getServices, getWorkshops, getArticles, getPromotions } from '../services/api';

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    products: true,
    services: true,
    workshops: true,
    articles: true,
    promotions: true,
  });
  const [error, setError] = useState<string | null>(null);

  const features = [
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
        setError('Erreur lors du chargement des produits');
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
        setError('Erreur lors du chargement des services');
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
        setError('Erreur lors du chargement des ateliers');
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
        setError('Erreur lors du chargement des articles');
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
        setError('Erreur lors du chargement des promotions');
      } finally {
        setLoadingStates(prev => ({ ...prev, promotions: false }));
      }
    };

    // Lancer les fetchs individuellement
    fetchProducts();
    fetchServices();
    fetchWorkshops();
    fetchArticles();
    fetchPromotions();
  }, []);

  // Si une erreur globale est détectée, afficher uniquement le message d'erreur
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-soft-green/10 to-white">
        <p className="text-powder-pink text-xl font-medium">{error}</p>
      </div>
    );
  }

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

          <section className="py-12">
            <h2 className="text-3xl font-serif text-soft-brown text-center mb-8">Nos offres spéciales</h2>
            {loadingStates.promotions ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              <FeaturedPromotions promotions={promotions} />
            )}
          </section>

          <section className="py-12 bg-light-beige">
            <h2 className="text-3xl font-serif text-soft-brown text-center mb-8">Nos produits phares</h2>
            {loadingStates.products ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              <FeaturedProducts products={products} />
            )}
          </section>

          <section className="py-12">
            <h2 className="text-3xl font-serif text-soft-brown text-center mb-8">Nos services</h2>
            {loadingStates.services ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              <ServicesOverview services={services} />
            )}
          </section>

          <section className="py-12 bg-light-beige">
            <h2 className="text-3xl font-serif text-soft-brown text-center mb-8">Ateliers à venir</h2>
            {loadingStates.workshops ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              <UpcomingWorkshops workshops={workshops} />
            )}
          </section>

          <section className="py-12">
            <h2 className="text-3xl font-serif text-soft-brown text-center mb-8">Nos derniers articles</h2>
            {loadingStates.articles ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              <RecentArticles articles={articles} />
            )}
          </section>

          <section className="py-12 bg-light-beige">
            <h2 className="text-3xl font-serif text-soft-brown text-center mb-8">Pourquoi choisir ChezFlora ?</h2>
            <WhyChooseUs features={features} />
          </section>
        </main>
      </PageContainer>
      <Footer />
    </>
  );
}