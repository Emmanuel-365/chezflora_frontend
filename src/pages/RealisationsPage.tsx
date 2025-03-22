"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { Calendar, Search, Filter, Loader2, Eye, ArrowRight, MapPin, User } from 'lucide-react'
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import { getRealisations } from "../services/api"

interface Service {
  id: string
  nom: string
}

interface Realisation {
  id: string
  titre: string
  description: string
  photos: string[]
  date_creation: string
  service: Service
  lieu?: string
  client?: string
}

const RealisationsPage = () => {
  const [realisations, setRealisations] = useState<Realisation[]>([])
  const [filteredRealisations, setFilteredRealisations] = useState<Realisation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true })

  // Fetch realisations
  useEffect(() => {
    const fetchRealisations = async () => {
      try {
        setLoading(true)
        const response = await getRealisations()
        
        // Process the data
        const processedRealisations = response.data.results.map((r: any) => ({
          ...r,
          photos: typeof r.photos === 'string' ? JSON.parse(r.photos) : r.photos,
          // Add some mock data for demonstration
          lieu: ["Yaoundé", "Lyon", "Douala", "Bordeaux", "Lille"][Math.floor(Math.random() * 5)],
          client: ["Entreprise ABC", "Restaurant XYZ", "Hôtel Luxe", "Mariage Martin", "Événement Gala"][Math.floor(Math.random() * 5)]
        }))
        
        setRealisations(processedRealisations)
        setFilteredRealisations(processedRealisations)
        
        // Extract unique services
        const uniqueServices = Array.from<Service>(
          new Set(processedRealisations.map((r: Realisation) => r.service))
        ).reduce((acc: Service[], service) => {
          if (!acc.some(s => s.id === service.id)) {
            acc.push(service);
          }
          return acc;
        }, []);
        
        setServices(uniqueServices)
        setLoading(false)
      } catch (err: any) {
        console.error("Erreur lors du chargement:", err.response?.data)
        setError("Erreur lors du chargement des réalisations.")
        setLoading(false)
      }
    }

    fetchRealisations()
  }, [])

  // Filter realisations based on search and service
  useEffect(() => {
    if (realisations.length === 0) return
    
    let filtered = [...realisations]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        realisation => 
          realisation.titre.toLowerCase().includes(query) || 
          realisation.description.toLowerCase().includes(query) ||
          realisation.service.nom.toLowerCase().includes(query) ||
          (realisation.lieu && realisation.lieu.toLowerCase().includes(query)) ||
          (realisation.client && realisation.client.toLowerCase().includes(query))
      )
    }
    
    if (selectedService) {
      filtered = filtered.filter(realisation => realisation.service.id === selectedService)
    }
    
    setFilteredRealisations(filtered)
  }, [searchQuery, selectedService, realisations])

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

  const handleServiceSelect = (serviceId: string | null) => {
    setSelectedService(serviceId)
  }

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
      <p className="text-gray-600 animate-pulse">Chargement des réalisations...</p>
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
        <div ref={headerRef} className="relative bg-emerald-50 py-16 mb-8 overflow-hidden">
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

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-gray-800 mb-4">
                Nos réalisations
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                Découvrez nos créations florales pour des événements, mariages, et décorations d'intérieur.
                Chaque réalisation est unique et personnalisée selon les besoins de nos clients.
              </p>
              
              {/* Search and Filters */}
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="relative mb-6">
                  <input
                    type="search"
                    placeholder="Rechercher une réalisation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </form>
                
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <button
                    onClick={() => handleServiceSelect(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedService === null
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tous les services
                  </button>
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedService === service.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {service.nom}
                    </button>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    {showFilters ? "Masquer les filtres" : "Plus de filtres"}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded ${viewMode === "grid" ? "bg-emerald-100 text-emerald-600" : "text-gray-500 hover:text-emerald-600"}`}
                      aria-label="Vue en grille"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded ${viewMode === "list" ? "bg-emerald-100 text-emerald-600" : "text-gray-500 hover:text-emerald-600"}`}
                      aria-label="Vue en liste"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mt-4"
                    >
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-500 mb-2">Filtres supplémentaires à venir...</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  {filteredRealisations.length} réalisation{filteredRealisations.length !== 1 ? 's' : ''} trouvée{filteredRealisations.length !== 1 ? 's' : ''}
                  {selectedService && <span> dans <span className="font-medium">{services.find(s => s.id === selectedService)?.nom}</span></span>}
                  {searchQuery && <span> pour <span className="font-medium">"{searchQuery}"</span></span>}
                </p>
                
                {(selectedService || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedService(null)
                      setSearchQuery('')
                    }}
                    className="text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
              
              {/* Realisations list */}
              {filteredRealisations.length > 0 ? (
                viewMode === "grid" ? (
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredRealisations.map((realisation) => (
                      <motion.div
                        key={realisation.id}
                        variants={itemVariants}
                        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 group"
                      >
                        <Link to={`/realisations/${realisation.id}`} className="block relative">
                          <div className="relative h-56 overflow-hidden bg-gray-100">
                            {realisation.photos && realisation.photos.length > 0 ? (
                              <img
                                src={realisation.photos[0] || "/placeholder.svg?height=400&width=600"}
                                alt={realisation.titre}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <span className="text-gray-400">Image non disponible</span>
                              </div>
                            )}
                            
                            <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="bg-white bg-opacity-90 rounded-full p-3">
                                <Eye className="h-6 w-6 text-emerald-600" />
                              </div>
                            </div>
                          </div>
                        </Link>
                        
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h2 className="text-lg font-medium text-gray-800 group-hover:text-emerald-600 transition-colors">
                              <Link to={`/realisations/${realisation.id}`}>{realisation.titre}</Link>
                            </h2>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                              {realisation.service.nom}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-gray-500 text-sm mb-3">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(realisation.date_creation).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          
                          {realisation.lieu && (
                            <div className="flex items-center text-gray-500 text-sm mb-3">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{realisation.lieu}</span>
                            </div>
                          )}
                          
                          <p className="text-gray-600 mb-4 line-clamp-2">{realisation.description}</p>
                          
                          <Link 
                            to={`/realisations/${realisation.id}`}
                            className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                          >
                            Voir les détails
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredRealisations.map((realisation) => (
                      <motion.div
                        key={realisation.id}
                        variants={itemVariants}
                        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row"
                      >
                        <div className="md:w-1/3 flex-shrink-0">
                          <Link to={`/realisations/${realisation.id}`} className="block h-full">
                            <div className="relative h-56 md:h-full overflow-hidden bg-gray-100">
                              {realisation.photos && realisation.photos.length > 0 ? (
                                <img
                                  src={realisation.photos[0] || "/placeholder.svg?height=400&width=600"}
                                  alt={realisation.titre}
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <span className="text-gray-400">Image non disponible</span>
                                </div>
                              )}
                            </div>
                          </Link>
                        </div>
                        
                        <div className="p-6 flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <h2 className="text-xl font-medium text-gray-800 hover:text-emerald-600 transition-colors">
                              <Link to={`/realisations/${realisation.id}`}>{realisation.titre}</Link>
                            </h2>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                              {realisation.service.nom}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center text-gray-500 text-sm mb-3 gap-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                {new Date(realisation.date_creation).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            
                            {realisation.lieu && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{realisation.lieu}</span>
                              </div>
                            )}
                            
                            {realisation.client && (
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                <span>{realisation.client}</span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-4">{realisation.description}</p>
                          
                          <div className="flex justify-between items-center mt-auto">
                            <div className="flex">
                              {realisation.photos && realisation.photos.length > 1 && (
                                <div className="flex -space-x-2">
                                  {realisation.photos.slice(0, 3).map((photo, index) => (
                                    <div key={index} className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                                      <img 
                                        src={photo || "/placeholder.svg?height=100&width=100"} 
                                        alt={`${realisation.titre} - photo ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                  {realisation.photos.length > 3 && (
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-xs text-emerald-600 font-medium">
                                      +{realisation.photos.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <Link 
                              to={`/realisations/${realisation.id}`}
                              className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                            >
                              Voir les détails
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )
              ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-600 text-lg mb-2">Aucune réalisation ne correspond à votre recherche.</p>
                  <p className="text-gray-500 mb-6">Essayez d'autres termes ou catégories.</p>
                  <button
                    onClick={() => {
                      setSelectedService(null)
                      setSearchQuery('')
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                  >
                    Voir toutes les réalisations
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </PageContainer>
      <Footer />
    </>
  )
}

export default RealisationsPage