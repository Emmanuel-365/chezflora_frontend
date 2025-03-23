"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, useInView } from "framer-motion"
import { Search, ArrowRight, Loader2, CheckCircle, Users, Clock } from 'lucide-react'
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import ButtonPrimary from "../components/ButtonPrimary"
import { getServices } from "../services/api"

interface Service {
  id: string
  nom: string
  description: string
  photos: Photo[]
  is_active: boolean
  date_creation: string
  prix?: number
  duree?: string
  capacite?: number
  avantages?: string[]
}

interface Photo {
  image: string
}

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  
  const navigate = useNavigate()
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true })

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const response = await getServices()
        
        // Add some mock data for demonstration
        const servicesWithMockData = response.data.results.map((service: Service, index: number) => ({
          ...service,
          prix: [50, 75, 120, 200, 350][index % 5],
          duree: ["30 min", "1h", "2h", "3h", "Journée"][index % 5],
          capacite: [1, 2, 5, 10, 20][index % 5],
          avantages: [
            ["Personnalisé", "Livraison incluse", "Garantie fraîcheur"],
            ["Premium", "Sur mesure", "Service VIP", "Assistance 24/7"],
            ["Économique", "Rapide", "Efficace"],
            ["Professionnel", "Créatif", "Unique"]
          ][index % 4]
        }))
        
        setServices(servicesWithMockData)
        setFilteredServices(servicesWithMockData)
        setLoading(false)
      } catch (err: any) {
        console.error("Erreur lors du chargement des services:", err.response?.status, err.response?.data)
        setError("Erreur lors du chargement des services.")
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  // Filter services based on search and category
  useEffect(() => {
    if (services.length === 0) return
    
    let filtered = [...services]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        service => 
          service.nom.toLowerCase().includes(query) || 
          service.description.toLowerCase().includes(query)
      )
    }
    
    if (activeCategory) {
      // This is a mock implementation since we don't have real categories
      // In a real app, you would filter based on actual category data
      const priceRanges: {[key: string]: [number, number]} = {
        "economique": [0, 100],
        "standard": [100, 200],
        "premium": [200, Infinity]
      }
      
      if (priceRanges[activeCategory]) {
        const [min, max] = priceRanges[activeCategory]
        filtered = filtered.filter(service => 
          service.prix !== undefined && 
          service.prix >= min && 
          service.prix < max
        )
      }
    }
    
    setFilteredServices(filtered)
  }, [searchQuery, activeCategory, services])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleCategorySelect = (category: string | null) => {
    setActiveCategory(category)
  }

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
      <p className="text-gray-600 animate-pulse">Chargement des services...</p>
    </div>
  )

  const renderErrorState = () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md bg-white rounded-xl shadow-md p-8">
        <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-medium text-gray-800 mb-2">Oops !</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  )

  return (
    <>
      <NavBar />
      <PageContainer>
        {/* Hero Header */}
        <div ref={headerRef} className="relative bg-emerald-600 text-white py-20 mb-12 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path
                d="M0,20 L100,20 M0,40 L100,40 M0,60 L100,60 M0,80 L100,80 M20,0 L20,100 M40,0 L40,100 M60,0 L60,100 M80,0 L80,100"
                stroke="currentColor"
                strokeWidth="0.2"
              />
            </svg>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-serif font-medium mb-4">
                Nos services floraux
              </h1>
              <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg">
                Découvrez notre gamme complète de services floraux pour tous vos événements et occasions spéciales.
                Chaque service est conçu pour répondre à vos besoins spécifiques avec élégance et créativité.
              </p>
              
              {/* Search */}
              <div className="max-w-xl mx-auto">
                <form onSubmit={handleSearch} className="relative mb-6">
                  <input
                    type="search"
                    placeholder="Rechercher un service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 text-white placeholder-white/70"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
                </form>
                
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === null
                        ? 'bg-white text-emerald-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Tous les services
                  </button>
                  <button
                    onClick={() => handleCategorySelect("economique")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === "economique"
                        ? 'bg-white text-emerald-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Économique
                  </button>
                  <button
                    onClick={() => handleCategorySelect("standard")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === "standard"
                        ? 'bg-white text-emerald-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => handleCategorySelect("premium")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === "premium"
                        ? 'bg-white text-emerald-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Premium
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          {loading ? (
            renderLoadingState()
          ) : error ? (
            renderErrorState()
          ) : (
            <>
              {/* Results summary */}
              <div className="mb-8 flex justify-between items-center">
                <p className="text-gray-600">
                  {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} trouvé{filteredServices.length !== 1 ? 's' : ''}
                  {activeCategory && <span> dans <span className="font-medium">{activeCategory}</span></span>}
                  {searchQuery && <span> pour <span className="font-medium">"{searchQuery}"</span></span>}
                </p>
                
                {(activeCategory || searchQuery) && (
                  <button
                    onClick={() => {
                      setActiveCategory(null)
                      setSearchQuery('')
                    }}
                    className="text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
              
              {/* Services list */}
              {filteredServices.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredServices.map((service) => (
                    <motion.div
                      key={service.id}
                      variants={itemVariants}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        { service.photos && <img
                          src={service.photos[0].image || "/placeholder.svg?height=400&width=600"}
                          alt={service.nom}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />}
                        {!service.is_active && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Non disponible
                            </span>
                          </div>
                        )}
                        {service.prix && (
                          <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            À partir de {service.prix} FCFA
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6 flex-grow flex flex-col">
                        <h2 className="text-xl font-medium text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                          {service.nom}
                        </h2>
                        
                        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
                          {service.duree && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-emerald-500" />
                              <span>{service.duree}</span>
                            </div>
                          )}
                          
                          {service.capacite && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-emerald-500" />
                              <span>Jusqu'à {service.capacite} pers.</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{service.description}</p>
                        
                        {service.avantages && service.avantages.length > 0 && (
                          <div className="mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-2">Avantages inclus :</p>
                            <ul className="space-y-1">
                              {service.avantages.map((avantage, index) => (
                                <li key={index} className="flex items-start">
                                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                                  <span className="text-sm text-gray-600">{avantage}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <ButtonPrimary
                          onClick={() => navigate(`/services/${service.id}`)}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 transition-colors mt-auto flex items-center justify-center"
                          disabled={!service.is_active}
                        >
                          {service.is_active ? (
                            <>
                              En savoir plus
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          ) : (
                            "Non disponible"
                          )}
                        </ButtonPrimary>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-600 text-lg mb-2">Aucun service ne correspond à votre recherche.</p>
                  <p className="text-gray-500 mb-6">Essayez d'autres termes ou catégories.</p>
                  <button
                    onClick={() => {
                      setActiveCategory(null)
                      setSearchQuery('')
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                  >
                    Voir tous les services
                  </button>
                </div>
              )}
              
              {/* Call to Action */}
              <div className="mt-16 bg-emerald-50 rounded-xl p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-serif text-gray-800 mb-2">Besoin d'un service personnalisé ?</h3>
                    <p className="text-gray-600">Contactez-nous pour discuter de vos besoins spécifiques.</p>
                  </div>
                  <ButtonPrimary
                    onClick={() => navigate("/contact")}
                    className="whitespace-nowrap bg-emerald-600 hover:bg-emerald-500 transition-colors"
                  >
                    Nous contacter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </ButtonPrimary>
                </div>
              </div>
            </>
          )}
        </div>
      </PageContainer>
      <Footer />
    </>
  )
}

export default ServicesPage
