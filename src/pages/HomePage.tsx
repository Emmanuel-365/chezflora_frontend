"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import {
  Truck,
  Flower,
  Heart,
  Star,
  Calendar,
  Gift,
  Clock,
  ArrowRight,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import HeroBanner from "../components/HeroBanner"
import FeaturedProducts from "../components/FeaturedProducts"
import ServicesOverview from "../components/ServicesOverview"
import UpcomingWorkshops from "../components/UpcomingWorkshops"
import RecentArticles from "../components/RecentArticles"
import FeaturedPromotions from "../components/FeaturedPromotions"
import { getProducts, getServices, getWorkshops, getArticles, getPromotions } from "../services/api"

// Définir les interfaces pour les données
interface Product {
  id: string
  nom: string
  prix: number
  prix_reduit?: number
  photos: Photo[]
  description: string
  categorie: Category
}

interface Photo {
  id: string
  image: string
}

interface Category {
  id: number
}

interface Service {
  title: string
  description: string
  icon: React.ReactNode
  link: string
}

interface Workshop {
  id: string
  title: string
  date: string
  places: number
  link: string
}

interface Article {
  id: string
  title: string
  excerpt: string
  imageUrl: string
  link: string
}

interface Promotion {
  id: string
  nom: string
  description: string
  produits: Product[]
}

interface Feature {
  title: string
  description: string
  icon: React.ReactNode
}

interface Testimonial {
  id: number
  name: string
  role: string
  content: string
  rating: number
  avatar?: string
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const ActionButton = ({
  text,
  href,
  icon,
  primary = true,
  className = "",
}: {
  text: string
  href: string
  icon?: React.ReactNode
  primary?: boolean
  className?: string
}) => (
  <motion.a
    href={href}
    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-sm ${
      primary
        ? "bg-soft-green text-white hover:bg-soft-green/90 hover:shadow-md"
        : "bg-white text-soft-brown border border-soft-brown/20 hover:border-soft-brown/40 hover:bg-light-beige/50"
    } ${className}`}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
  >
    {text}
    {icon || <ArrowRight className="w-4 h-4 ml-1" />}
  </motion.a>
)

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="text-center mb-12">
    <motion.h2 className="text-3xl md:text-4xl font-serif text-soft-brown mb-4" variants={fadeInUp}>
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p className="text-soft-brown/70 max-w-2xl mx-auto text-lg" variants={fadeInUp}>
        {subtitle}
      </motion.p>
    )}
  </div>
)

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loadingStates, setLoadingStates] = useState({
    products: true,
    services: true,
    workshops: true,
    articles: true,
    promotions: true,
  })
  const [errorStates, setErrorStates] = useState<{
    products: string | null
    services: string | null
    workshops: string | null
    articles: string | null
    promotions: string | null
  }>({
    products: null,
    services: null,
    workshops: null,
    articles: null,
    promotions: null,
  })

  // Refs for scroll animations
  const promotionsRef = useRef(null)
  const productsRef = useRef(null)
  const servicesRef = useRef(null)
  const workshopsRef = useRef(null)
  const articlesRef = useRef(null)
  const featuresRef = useRef(null)
  const testimonialsRef = useRef(null)
  const newsletterRef = useRef(null)

  // Check if sections are in view
  const promotionsInView = useInView(promotionsRef, { once: true, amount: 0.2 })
  const productsInView = useInView(productsRef, { once: true, amount: 0.2 })
  const servicesInView = useInView(servicesRef, { once: true, amount: 0.2 })
  const workshopsInView = useInView(workshopsRef, { once: true, amount: 0.2 })
  const articlesInView = useInView(articlesRef, { once: true, amount: 0.2 })
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 })
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.2 })
  const newsletterInView = useInView(newsletterRef, { once: true, amount: 0.2 })

  const features: Feature[] = [
    {
      title: "Qualité premium",
      description:
        "Nous sélectionnons les meilleures fleurs et plantes auprès de producteurs locaux et responsables. Chaque bouquet est confectionné à la main avec soin pour garantir fraîcheur et longévité.",
      icon: <Star className="w-6 h-6 text-soft-green" />,
    },
    {
      title: "Expertise florale",
      description:
        "Notre équipe de fleuristes passionnés cumule plus de 20 ans d'expérience. Formés aux techniques traditionnelles et modernes, ils créent des compositions uniques qui reflètent votre personnalité.",
      icon: <Flower className="w-6 h-6 text-soft-green" />,
    },
    {
      title: "Livraison rapide",
      description:
        "Service de livraison express disponible 7j/7 dans toute la ville. Vos fleurs sont livrées dans un emballage éco-responsable qui préserve leur fraîcheur et respecte l'environnement.",
      icon: <Truck className="w-6 h-6 text-soft-green" />,
    },
    {
      title: "Satisfaction garantie",
      description:
        "Nous nous engageons à vous offrir le meilleur service. Si vous n'êtes pas satisfait, nous remplacerons votre commande gratuitement ou vous rembourserons intégralement, sans question.",
      icon: <Heart className="w-6 h-6 text-soft-green" />,
    },
  ]

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Marie Dupont",
      role: "Cliente fidèle",
      content:
        "ChezFlora a transformé l'anniversaire de ma mère avec un bouquet magnifique. Le service personnalisé et la qualité des fleurs sont incomparables. Je ne commande plus ailleurs !",
      rating: 5,
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      name: "Thomas Laurent",
      role: "Événementiel",
      content:
        "Pour notre mariage, l'équipe de ChezFlora a créé des compositions florales qui ont émerveillé tous nos invités. Leur créativité et leur professionnalisme ont dépassé nos attentes.",
      rating: 5,
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 3,
      name: "Sophie Martin",
      role: "Entrepreneuse",
      content:
        "Je fais appel à ChezFlora pour décorer mon restaurant chaque semaine. Leurs arrangements sont toujours frais, originaux et parfaitement adaptés à mon espace. Un service exceptionnel !",
      rating: 5,
      avatar: "/placeholder.svg?height=80&width=80",
    },
  ]

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchProducts = async () => {
      try {
        const res = await getProducts({signal: signal})
        setProducts(
          res.data.results.slice(0, 4).map((p: any) => ({
            id: p.id,
            nom: p.nom,
            prix: Number.parseFloat(p.prix),
            prix_reduit: p.prix_reduit ? Number.parseFloat(p.prix_reduit) : undefined,
            photos: p.photos || [],
            description: p.description || "",
            categorie: p.categorie,
          })),
        )
      } catch (err) {
        if (!signal.aborted) {
          setErrorStates((prev) => ({ ...prev, products: "Erreur lors du chargement des produits" }))
        }
      } finally {
        if (!signal.aborted) {
          setLoadingStates((prev) => ({ ...prev, products: false }))
        }
      }
    }

    const fetchServices = async () => {
      try {
        const res = await getServices({signal: signal })
        setServices(
          res.data.results.slice(0, 3).map((s: any, index: number) => ({
            title: s.nom,
            description: s.description,
            icon: [
              <Truck key="truck" className="w-6 h-6 text-soft-green" />,
              <Flower key="flower" className="w-6 h-6 text-soft-green" />,
              <Heart key="heart" className="w-6 h-6 text-soft-green" />,
            ][index % 3],
            link: `/services/${s.id}`,
          })),
        )
      } catch (err) {
        if (!signal.aborted) {
          setErrorStates((prev) => ({ ...prev, services: "Erreur lors du chargement des services" }))
        }
      } finally {
        if (!signal.aborted) {
          setLoadingStates((prev) => ({ ...prev, services: false }))
        }
      }
    }

    const fetchWorkshops = async () => {
      try {
        const res = await getWorkshops({ signal: signal})
        setWorkshops(
          res.data.results.slice(0, 3).map((w: any) => ({
            id: w.id,
            title: w.titre,
            date: new Date(w.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }),
            places: w.places_disponibles,
            link: `/ateliers/${w.id}`,
          })),
        )
      } catch (err) {
        if (!signal.aborted) {
          setErrorStates((prev) => ({ ...prev, workshops: "Erreur lors du chargement des ateliers" }))
        }
      } finally {
        if (!signal.aborted) {
          setLoadingStates((prev) => ({ ...prev, workshops: false }))
        }
      }
    }

    const fetchArticles = async () => {
      try {
        const res = await getArticles({signal: signal})
        setArticles(
          res.data.results.slice(0, 3).map((a: any) => ({
            id: a.id,
            title: a.titre,
            excerpt: a.contenu.substring(0, 100) + "...",
            imageUrl: a.image || "/images/placeholder.jpg",
            link: `/blog/${a.id}`,
          })),
        )
      } catch (err) {
        if (!signal.aborted) {
          setErrorStates((prev) => ({ ...prev, articles: "Erreur lors du chargement des articles" }))
        }
      } finally {
        if (!signal.aborted) {
          setLoadingStates((prev) => ({ ...prev, articles: false }))
        }
      }
    }

    const fetchPromotions = async () => {
      try {
        const res = await getPromotions(signal)
        setPromotions(
          res.data.results.map((promo: any) => ({
            id: promo.id,
            nom: promo.nom,
            description: promo.description,
            produits: promo.produits.map((p: any) => ({
              id: p.id,
              nom: p.nom,
              prix: Number.parseFloat(p.prix),
              prix_reduit: p.prix_reduit ? Number.parseFloat(p.prix_reduit) : undefined,
              photos: p.photos || [],
            })),
          })),
        )
      } catch (err) {
        if (!signal.aborted) {
          setErrorStates((prev) => ({ ...prev, promotions: "Erreur lors du chargement des promotions" }))
        }
      } finally {
        if (!signal.aborted) {
          setLoadingStates((prev) => ({ ...prev, promotions: false }))
        }
      }
    }

    fetchProducts()
    fetchServices()
    fetchWorkshops()
    fetchArticles()
    fetchPromotions()

    return () => {
      controller.abort()
    }
  }, [])

  const SkeletonLoader = ({ count = 3, type = "card" }: { count?: number; type?: "card" | "feature" }) => (
    <div
      className={`grid grid-cols-1 ${type === "card" ? "sm:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"} gap-6`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-gray-100 rounded-xl p-4 animate-pulse">
          {type === "card" ? (
            <>
              <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </>
          ) : (
            <>
              <div className="h-10 w-10 bg-gray-200 rounded-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <>
      <NavBar />
      <PageContainer className="p-0">
        <main>
          {/* Hero Banner with Enhanced Content */}
          <HeroBanner
            title="Fleurissez votre quotidien avec ChezFlora"
            subtitle="Découvrez notre collection de bouquets artisanaux et plantes d'exception, confectionnés avec passion pour embellir chaque moment de votre vie"
            buttonText="Explorer nos créations"
            buttonLink="/products"
            backgroundImage="./images/hero-banner.jpg"
          />

          {/* Quick Actions Bar */}
          <motion.div
            className="bg-white py-4 px-4 sm:px-6 shadow-sm sticky top-0 z-10 border-b border-soft-brown/10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-soft-brown">
                <Clock className="w-4 h-4 text-soft-green" />
                <span className="text-sm hidden sm:inline">Livraison le jour même pour toute commande avant 14h</span>
                <span className="text-sm sm:hidden">Livraison jour même</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ActionButton
                  text="Commander"
                  href="/products"
                  icon={<ShoppingBag className="w-4 h-4" />}
                  className="text-sm py-2 px-4"
                />
                <ActionButton
                  text="Contacter"
                  href="/contact"
                  icon={<Phone className="w-4 h-4" />}
                  primary={false}
                  className="text-sm py-2 px-4"
                />
              </div>
            </div>
          </motion.div>

          {/* Promotions Section */}
          <section ref={promotionsRef} className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div variants={staggerContainer} initial="hidden" animate={promotionsInView ? "visible" : "hidden"}>
              <SectionTitle
                title="Offres spéciales limitées"
                subtitle="Profitez de nos promotions exclusives pour découvrir nos plus belles créations florales à prix réduits. Ne tardez pas, ces offres sont disponibles pour une durée limitée !"
              />

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
                  <motion.div key="promotions-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <FeaturedPromotions promotions={promotions} />

                    <motion.div className="mt-10 text-center" variants={fadeInUp}>
                      <p className="text-soft-brown/70 mb-4">
                        Ces offres exclusives sont disponibles pour une durée limitée. Commandez dès maintenant pour en
                        profiter !
                      </p>
                      <ActionButton
                        text="Voir toutes les promotions"
                        href="/promotions"
                        icon={<Gift className="w-5 h-5" />}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </section>

          {/* Products Section */}
          <section ref={productsRef} className="py-16 px-4 sm:px-6 lg:px-8 bg-light-beige">
            <div className="max-w-7xl mx-auto">
              <motion.div variants={staggerContainer} initial="hidden" animate={productsInView ? "visible" : "hidden"}>
                <SectionTitle
                  title="Nos créations florales d'exception"
                  subtitle="Chaque bouquet raconte une histoire unique, confectionné avec passion par nos artisans fleuristes. Découvrez nos compositions les plus appréciées et laissez-vous séduire par leur beauté naturelle."
                />

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
                    <motion.div key="products-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <FeaturedProducts products={products} />

                      <motion.div className="mt-10 text-center" variants={fadeInUp}>
                        <p className="text-soft-brown/70 mb-4">
                          Des bouquets pour toutes les occasions : anniversaires, mariages, déclarations d'amour ou
                          simplement pour le plaisir d'offrir.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                          <ActionButton
                            text="Explorer tous nos produits"
                            href="/products"
                            icon={<ShoppingBag className="w-5 h-5" />}
                          />
                          <ActionButton text="Créations personnalisées" href="/custom" primary={false} />
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </section>

          {/* Services Section */}
          <section ref={servicesRef} className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div variants={staggerContainer} initial="hidden" animate={servicesInView ? "visible" : "hidden"}>
                <SectionTitle
                  title="Services sur mesure"
                  subtitle="Chez ChezFlora, nous allons au-delà de la simple vente de fleurs. Découvrez nos services exclusifs conçus pour répondre à tous vos besoins floraux, des événements spéciaux aux abonnements réguliers."
                />

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
                    <motion.div key="services-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <ServicesOverview services={services} />

                      <motion.div className="mt-10 text-center" variants={fadeInUp}>
                        <p className="text-soft-brown/70 mb-4">
                          Nous proposons également des services de décoration florale pour les entreprises, restaurants
                          et hôtels. Des solutions sur mesure pour tous vos espaces.
                        </p>
                        <ActionButton text="Découvrir tous nos services" href="/services" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </section>

          {/* Call to Action Banner */}
          <motion.section
            className="py-16 px-4 sm:px-6 lg:px-8 bg-soft-green/10 relative overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="absolute inset-0 z-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path
                  d="M0,20 L100,20 M0,40 L100,40 M0,60 L100,60 M0,80 L100,80 M20,0 L20,100 M40,0 L40,100 M60,0 L60,100 M80,0 L80,100"
                  stroke="currentColor"
                  strokeWidth="0.2"
                />
              </svg>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-2xl md:text-3xl font-serif text-soft-brown mb-4">
                    Abonnement floral personnalisé
                  </h2>
                  <p className="text-soft-brown/70 max-w-3xl mx-auto">
                    Recevez régulièrement des créations florales fraîches directement chez vous ou offrez cet abonnement
                    à un être cher. Choisissez la fréquence, le style et le budget qui vous conviennent.
                  </p>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-light-beige p-6 rounded-xl text-center">
                    <h3 className="font-medium text-soft-brown mb-2">Mensuel</h3>
                    <p className="text-2xl font-bold text-soft-green mb-1">
                      29500FCFA<span className="text-sm font-normal text-soft-brown/60">/mois</span>
                    </p>
                    <p className="text-soft-brown/70 text-sm mb-4">Un bouquet par mois</p>
                    <ActionButton text="Choisir" href="/abonnement/mensuel" className="w-full" />
                  </div>

                  <div className="bg-soft-green/10 p-6 rounded-xl text-center border-2 border-soft-green relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-soft-green text-white text-xs py-1 px-3 rounded-full">
                      Le plus populaire
                    </div>
                    <h3 className="font-medium text-soft-brown mb-2">Bimensuel</h3>
                    <p className="text-2xl font-bold text-soft-green mb-1">
                      49500FCFA<span className="text-sm font-normal text-soft-brown/60">/mois</span>
                    </p>
                    <p className="text-soft-brown/70 text-sm mb-4">Deux bouquets par mois</p>
                    <ActionButton text="Choisir" href="/abonnement/bimensuel" className="w-full" />
                  </div>

                  <div className="bg-light-beige p-6 rounded-xl text-center">
                    <h3 className="font-medium text-soft-brown mb-2">Hebdomadaire</h3>
                    <p className="text-2xl font-bold text-soft-green mb-1">
                      76000FCFA<span className="text-sm font-normal text-soft-brown/60">/mois</span>
                    </p>
                    <p className="text-soft-brown/70 text-sm mb-4">Un bouquet chaque semaine</p>
                    <ActionButton text="Choisir" href="/abonnement/hebdomadaire" className="w-full" />
                  </div>
                </motion.div>

                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <p className="text-soft-brown/70 mb-4">
                    Tous nos abonnements sont sans engagement et peuvent être modifiés ou annulés à tout moment.
                    Livraison gratuite incluse et possibilité de personnaliser chaque livraison.
                  </p>
                  <ActionButton text="En savoir plus sur nos abonnements" href="/abonnements" primary={false} />
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* Workshops Section */}
          <section ref={workshopsRef} className="py-16 px-4 sm:px-6 lg:px-8 bg-light-beige">
            <div className="max-w-7xl mx-auto">
              <motion.div variants={staggerContainer} initial="hidden" animate={workshopsInView ? "visible" : "hidden"}>
                <SectionTitle
                  title="Ateliers floraux à venir"
                  subtitle="Apprenez l'art floral avec nos experts lors de nos ateliers interactifs. Une expérience enrichissante pour découvrir les techniques professionnelles et libérer votre créativité dans une ambiance conviviale."
                />

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
                    <motion.div key="workshops-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <UpcomingWorkshops workshops={workshops} />

                      <motion.div className="mt-10 text-center" variants={fadeInUp}>
                        <p className="text-soft-brown/70 mb-4">
                          Nos ateliers sont adaptés à tous les niveaux, du débutant à l'expert. Matériel fourni et
                          rafraîchissements offerts. Places limitées pour garantir une attention personnalisée.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                          <ActionButton
                            text="Voir tous les ateliers"
                            href="/ateliers"
                            icon={<Calendar className="w-5 h-5" />}
                          />
                          <ActionButton text="Offrir un atelier" href="/ateliers/offrir" primary={false} />
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </section>

          {/* Articles Section */}
          <section ref={articlesRef} className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <motion.div variants={staggerContainer} initial="hidden" animate={articlesInView ? "visible" : "hidden"}>
                <SectionTitle
                  title="Inspirations & Conseils"
                  subtitle="Découvrez nos articles pour tout savoir sur l'entretien de vos plantes, les tendances florales du moment et nos astuces de professionnels pour créer des compositions qui durent plus longtemps."
                />

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
                    <motion.div key="articles-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <RecentArticles articles={articles} />

                      <motion.div className="mt-10 text-center" variants={fadeInUp}>
                        <p className="text-soft-brown/70 mb-4">
                          Notre blog est régulièrement mis à jour avec des conseils d'entretien, des idées de décoration
                          et des interviews exclusives de nos fleuristes. Abonnez-vous à notre newsletter pour ne
                          manquer aucun article.
                        </p>
                        <ActionButton text="Explorer tous nos articles" href="/blog" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section ref={testimonialsRef} className="py-16 px-4 sm:px-6 lg:px-8 bg-soft-green/5">
            <div className="max-w-7xl mx-auto">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate={testimonialsInView ? "visible" : "hidden"}
              >
                <SectionTitle
                  title="Ce que nos clients disent"
                  subtitle="Découvrez les témoignages de nos clients satisfaits qui nous font confiance pour leurs moments importants. Leur satisfaction est notre plus grande récompense."
                />

                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8" variants={staggerContainer}>
                  {testimonials.map((testimonial) => (
                    <motion.div
                      key={testimonial.id}
                      className="bg-white p-6 rounded-xl shadow-sm"
                      variants={fadeInUp}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                          <img
                            src={testimonial.avatar || "/placeholder.svg"}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-soft-brown">{testimonial.name}</h3>
                          <p className="text-soft-brown/60 text-sm">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="flex mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < testimonial.rating ? "text-soft-green fill-soft-green" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <p className="text-soft-brown/80 italic">"{testimonial.content}"</p>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div className="mt-10 text-center" variants={fadeInUp}>
                  <p className="text-soft-brown/70 mb-4">
                    Rejoignez nos clients satisfaits et partagez votre expérience ChezFlora. Votre avis compte pour nous
                    !
                  </p>
                  <ActionButton text="Voir tous les témoignages" href="/temoignages" primary={false} />
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section ref={featuresRef} className="py-16 px-4 sm:px-6 lg:px-8 bg-light-beige">
            <div className="max-w-7xl mx-auto">
              <motion.div variants={staggerContainer} initial="hidden" animate={featuresInView ? "visible" : "hidden"}>
                <SectionTitle
                  title="Pourquoi choisir ChezFlora ?"
                  subtitle="Depuis plus de 10 ans, nous mettons notre expertise au service de votre bonheur floral. Découvrez ce qui fait de ChezFlora votre partenaire de confiance pour toutes vos occasions spéciales."
                />

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
                  variants={staggerContainer}
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="bg-white p-6 rounded-xl shadow-sm"
                      variants={fadeInUp}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <div className="w-12 h-12 bg-soft-green/10 rounded-full flex items-center justify-center mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-medium text-soft-brown mb-2">{feature.title}</h3>
                      <p className="text-soft-brown/70">{feature.description}</p>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div className="mt-10 text-center" variants={fadeInUp}>
                  <p className="text-soft-brown/70 mb-4">
                    Notre engagement pour la qualité et la satisfaction client nous a valu la confiance de milliers de
                    clients fidèles. Découvrez la différence ChezFlora dès aujourd'hui !
                  </p>
                  <ActionButton text="En savoir plus sur nous" href="/about" />
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Newsletter Section */}
          <section ref={newsletterRef} className="py-16 px-4 sm:px-6 lg:px-8 bg-soft-green/10">
            <div className="max-w-3xl mx-auto">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate={newsletterInView ? "visible" : "hidden"}
                className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
              >
                <motion.div variants={fadeInUp} className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-serif text-soft-brown mb-4">Restez inspiré</h2>
                  <p className="text-soft-brown/70">
                    Abonnez-vous à notre newsletter pour recevoir des conseils d'entretien, des idées de décoration
                    florale et des offres exclusives directement dans votre boîte mail.
                  </p>
                </motion.div>

                <motion.form
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row gap-3"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="email"
                    placeholder="Votre adresse email"
                    className="flex-grow px-4 py-3 rounded-full border border-soft-brown/20 focus:outline-none focus:ring-2 focus:ring-soft-green/50"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-soft-green text-white px-6 py-3 rounded-full font-medium hover:bg-soft-green/90 transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    S'abonner
                  </button>
                </motion.form>

                <motion.p variants={fadeInUp} className="text-soft-brown/60 text-sm text-center mt-4">
                  En vous inscrivant, vous acceptez de recevoir nos emails. Vous pouvez vous désabonner à tout moment.
                </motion.p>
              </motion.div>
            </div>
          </section>

          {/* Contact Quick Links */}
          <motion.section
            className="py-16 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                  className="bg-light-beige p-6 rounded-xl text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Phone className="w-8 h-8 text-soft-green mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-soft-brown mb-2">Appelez-nous</h3>
                  <p className="text-soft-brown/70 mb-4">Nous sommes disponibles du lundi au samedi de 9h à 19h</p>
                  <a href="tel:+33123456789" className="text-soft-green font-medium text-lg hover:underline">
                    +33 1 23 45 67 89
                  </a>
                </motion.div>

                <motion.div
                  className="bg-light-beige p-6 rounded-xl text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <Mail className="w-8 h-8 text-soft-green mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-soft-brown mb-2">Écrivez-nous</h3>
                  <p className="text-soft-brown/70 mb-4">
                    Une question ou une demande spéciale ? Contactez-nous par email
                  </p>
                  <a
                    href="mailto:contact@chezflora.com"
                    className="text-soft-green font-medium text-lg hover:underline"
                  >
                    contact@chezflora.com
                  </a>
                </motion.div>

                <motion.div
                  className="bg-light-beige p-6 rounded-xl text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <MapPin className="w-8 h-8 text-soft-green mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-soft-brown mb-2">Visitez-nous</h3>
                  <p className="text-soft-brown/70 mb-4">Venez découvrir notre boutique et rencontrer notre équipe</p>
                  <p className="text-soft-green font-medium">
                    123 Avenue des Fleurs
                    <br />
                    99322 Yaoundé, France
                  </p>
                </motion.div>
              </div>

              <motion.div
                className="mt-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <p className="text-soft-brown/70 mb-4">
                  Suivez-nous sur les réseaux sociaux pour découvrir nos dernières créations et actualités
                </p>
                <div className="flex justify-center gap-4">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white p-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-6 h-6 text-soft-brown" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white p-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-6 h-6 text-soft-brown" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white p-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-6 h-6 text-soft-brown" />
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.section>
        </main>
      </PageContainer>
      <Footer />
    </>
  )
}

