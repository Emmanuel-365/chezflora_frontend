import { useState, useEffect } from 'react';
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

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [articles, setArticles] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const features = [
    { title: 'Qualité premium', description: 'Nous sélectionnons les meilleures fleurs et plantes', icon: <Star className="w-6 h-6 text-soft-green" /> },
    { title: 'Expertise florale', description: 'Notre équipe de fleuristes passionnés à votre service', icon: <Flower className="w-6 h-6 text-soft-green" /> },
    { title: 'Satisfaction garantie', description: 'Nous nous engageons à vous offrir le meilleur service', icon: <Heart className="w-6 h-6 text-soft-green" /> },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, servicesRes, workshopsRes, articlesRes, promotionsRes] = await Promise.all([
          getProducts(),
          getServices(),
          getWorkshops(),
          getArticles(),
          getPromotions(),
        ]);

        setProducts(productsRes.data.results.slice(0, 4).map((p: any) => ({
          id: p.id,
          nom: p.nom,
          prix: parseFloat(p.prix),
          prix_reduit: p.prix_reduit ? parseFloat(p.prix_reduit) : undefined,
          photos: p.photos || [],
          description: p.description || '',
        })));

        setServices(servicesRes.data.results.slice(0, 3).map((s: any, index: number) => ({
          title: s.nom,
          description: s.description,
          icon: [<Truck key="truck" className="w-6 h-6 text-soft-green" />, <Flower key="flower" className="w-6 h-6 text-soft-green" />, <Heart key="heart" className="w-6 h-6 text-soft-green" />][index % 3],
          link: `/services/${s.id}`,
        })));

        setWorkshops(workshopsRes.data.results.slice(0, 3).map((w: any) => ({
          id: w.id,
          title: w.titre,
          date: new Date(w.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
          places: w.places_disponibles,
          link: `/ateliers/${w.id}`,
        })));

        setArticles(articlesRes.data.results.slice(0, 3).map((a: any) => ({
          id: a.id,
          title: a.titre,
          excerpt: a.contenu.substring(0, 100) + '...',
          imageUrl: a.image || '/images/placeholder.jpg',
          link: `/blog/${a.id}`,
        })));

        setPromotions(promotionsRes.data.results.map((promo: any) => ({
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

        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  console.log(promotions)


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <p className="text-soft-brown text-xl">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <p className="text-powder-pink text-xl">{error}</p>
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
          <FeaturedPromotions promotions={promotions} title="Nos offres spéciales" />
          <FeaturedProducts products={products} title="Nos produits phares" />
          <ServicesOverview services={services} title="Nos services" />
          <UpcomingWorkshops workshops={workshops} title="Ateliers à venir" />
          <RecentArticles articles={articles} title="Nos derniers articles" />
          <WhyChooseUs features={features} title="Pourquoi choisir ChezFlora ?" />
        </main>
      </PageContainer>
      <Footer />
    </>
  );
}