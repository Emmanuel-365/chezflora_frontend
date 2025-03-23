"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { motion, AnimatePresence, useInView } from "framer-motion"
import {
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Share2,
  Tag,
  User,
  ArrowRight,
  X,
  Maximize2,
  Download,
  Heart,
  MessageSquare,
  Clock,
} from "lucide-react"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import ButtonPrimary from "../components/ButtonPrimary"
import { getRealisation, getRealisations } from "../services/api"

interface Photo {
  id: string
  image: string
  caption?: string
}

interface Service {
  id: string
  nom: string
}

interface Realisation {
  id: string
  titre: string
  description: string
  photos: Photo[]
  date_creation: string
  service: Service
  lieu?: string
  client?: string
  tags?: string[]
  duree?: string
}

const RealisationDetailPage = () => {
  const { id } = useParams<{ id: string }>()

  const [realisation, setRealisation] = useState<Realisation | null>(null)
  const [relatedRealisations, setRelatedRealisations] = useState<Realisation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true })
  const galleryRef = useRef(null)
  const isGalleryInView = useInView(galleryRef, { once: true })
  const detailsRef = useRef(null)
  const isDetailsInView = useInView(detailsRef, { once: true })
  const relatedRef = useRef(null)
  const isRelatedInView = useInView(relatedRef, { once: true })

  useEffect(() => {
    const fetchRealisation = async () => {
      if (!id) return

      try {
        setLoading(true)
        const response = await getRealisation(id)

        // Process the data
        const realisationData = {
          ...response.data,
          // Ensure photos is an array
          photos: Array.isArray(response.data.photos)
            ? response.data.photos
            : typeof response.data.photos === "string"
              ? JSON.parse(response.data.photos)
              : [],
          // Add mock tags if needed
          tags: response.data.tags || ["Floral", "Événement", "Mariage", "Entreprise"],
        }

        setRealisation(realisationData)

        // Fetch related realizations
        try {
          const relatedResponse = await getRealisations()
          const related = relatedResponse.data.results
            .filter((r: any) => r.id !== id)
            .slice(0, 3)
            .map((r: any) => ({
              ...r,
              photos: Array.isArray(r.photos) ? r.photos : typeof r.photos === "string" ? JSON.parse(r.photos) : [],
            }))

          setRelatedRealisations(related)
        } catch (err) {
          console.error("Error fetching related realizations:", err)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching realization:", err)
        setError("Erreur lors du chargement des détails de la réalisation")
        setLoading(false)
      }
    }

    fetchRealisation()
  }, [id])

  const handlePrevPhoto = () => {
    if (realisation && realisation.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : realisation.photos.length - 1))
    }
  }

  const handleNextPhoto = () => {
    if (realisation && realisation.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev < realisation.photos.length - 1 ? prev + 1 : 0))
    }
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
    // Prevent body scrolling when lightbox is open
    document.body.style.overflow = "hidden"
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    // Restore body scrolling
    document.body.style.overflow = "auto"
  }

  const handleLightboxPrev = () => {
    if (realisation && realisation.photos.length > 0) {
      setLightboxIndex((prev) => (prev > 0 ? prev - 1 : realisation.photos.length - 1))
    }
  }

  const handleLightboxNext = () => {
    if (realisation && realisation.photos.length > 0) {
      setLightboxIndex((prev) => (prev < realisation.photos.length - 1 ? prev + 1 : 0))
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: realisation?.titre || "Projet",
        text: realisation?.description || "Découvrez ce projet !",
        url: window.location.href,
      })
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Lien copié dans le presse-papier !")
    }
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
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

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
      <p className="text-gray-600 animate-pulse">Chargement des détails du projet...</p>
    </div>
  )

  const renderErrorState = () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md bg-white rounded-xl shadow-md p-8">
        <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-medium text-gray-800 mb-2">Oops !</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Réessayer
          </button>
          <Link
            to="/realisations"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Retour aux Réalisations
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <NavBar />
      <PageContainer>
        {loading && !realisation ? (
          renderLoadingState()
        ) : error && !realisation ? (
          renderErrorState()
        ) : realisation ? (
          <>
            {/* Hero Header */}
            <div ref={headerRef} className="relative bg-emerald-50 py-16 mb-12 overflow-hidden">
              <div className="absolute inset-0 z-0">
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
                  {/* Service badge */}
                  <div className="flex justify-center mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {realisation.service.nom}
                    </span>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-serif font-medium text-gray-800 mb-4">
                    {realisation.titre}
                  </h1>

                  <div className="flex flex-wrap justify-center gap-6 mb-8">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
                      <span className="text-gray-700">
                        {new Date(realisation.date_creation).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {realisation.lieu && (
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                        <span className="text-gray-700">{realisation.lieu}</span>
                      </div>
                    )}

                    {realisation.client && (
                      <div className="flex items-center">
                        <User className="w-5 h-5 mr-2 text-emerald-600" />
                        <span className="text-gray-700">Client: {realisation.client}</span>
                      </div>
                    )}

                    {realisation.duree && (
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-emerald-600" />
                        <span className="text-gray-700">Durée: {realisation.duree}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
              <nav className="flex text-sm text-gray-500">
                <Link to="/" className="hover:text-emerald-600 transition-colors">
                  Accueil
                </Link>
                <span className="mx-2">/</span>
                <Link to="/realisations" className="hover:text-emerald-600 transition-colors">
                  Réalisations
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-700">{realisation.titre}</span>
              </nav>
            </div>

            {/* Main Photo Gallery */}
            <div ref={galleryRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
              <motion.div
                variants={fadeIn}
                initial="hidden"
                animate={isGalleryInView ? "visible" : "hidden"}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {realisation.photos && realisation.photos.length > 0 ? (
                  <div className="relative">
                    {/* Main featured photo */}
                    <div className="relative aspect-w-16 aspect-h-9 bg-gray-100">
                      <img
                        src={realisation.photos[currentPhotoIndex]?.image || "/placeholder.svg?height=600&width=1200"}
                        alt={`${realisation.titre} - Photo ${currentPhotoIndex + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Caption overlay */}
                      {realisation.photos[currentPhotoIndex]?.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black text-white p-4">
                          <p>{realisation.photos[currentPhotoIndex].caption}</p>
                        </div>
                      )}

                      {/* Fullscreen button */}
                      <button
                        onClick={() => openLightbox(currentPhotoIndex)}
                        className="absolute top-4 right-4 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                        aria-label="Voir en plein écran"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>

                      {/* Navigation arrows */}
                      {realisation.photos.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevPhoto}
                            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors"
                            aria-label="Photo précédente"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={handleNextPhoto}
                            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors"
                            aria-label="Photo suivante"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </>
                      )}

                      {/* Photo counter */}
                      <div className="absolute bottom-4 right-4 bg-black text-white px-3 py-1 rounded-full text-sm">
                        {currentPhotoIndex + 1} / {realisation.photos.length}
                      </div>
                    </div>

                    {/* Thumbnail gallery */}
                    {realisation.photos.length > 1 && (
                      <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                          {realisation.photos.map((photo, index) => (
                            <button
                              key={photo.id || index}
                              onClick={() => setCurrentPhotoIndex(index)}
                              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                                index === currentPhotoIndex
                                  ? "border-emerald-500 shadow-md"
                                  : "border-transparent hover:border-emerald-200"
                              }`}
                            >
                              <img
                                src={photo.image || "/placeholder.svg?height=80&width=80"}
                                alt={`${realisation.titre} miniature ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-400">Aucune photo disponible</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Project Details */}
            <div ref={detailsRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content */}
                <motion.div
                  className="lg:col-span-2"
                  variants={fadeIn}
                  initial="hidden"
                  animate={isDetailsInView ? "visible" : "hidden"}
                >
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-2xl font-medium text-gray-800 mb-4">Détails du Projet</h2>

                      <div className="prose prose-emerald max-w-none mb-6">
                        <p className="text-gray-600">{realisation.description}</p>
                      </div>

                      {/* Project tags */}
                      {realisation.tags && realisation.tags.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-medium text-gray-800 mb-2">Étiquettes</h3>
                          <div className="flex flex-wrap gap-2">
                            {realisation.tags.map((tag, index) => (
                              <div
                                key={index}
                                className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Share button */}
                      <button
                        onClick={handleShare}
                        className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Partager ce projet
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Sidebar */}
                <motion.div
                  variants={fadeIn}
                  initial="hidden"
                  animate={isDetailsInView ? "visible" : "hidden"}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24">
                    <div className="p-6 border-b border-gray-100">
                      <h2 className="text-xl font-medium text-gray-800">Informations du Projet</h2>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Type de Service</h3>
                        <p className="text-gray-800">{realisation.service.nom}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Date</h3>
                        <p className="text-gray-800">
                          {new Date(realisation.date_creation).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      {realisation.lieu && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Lieu</h3>
                          <p className="text-gray-800">{realisation.lieu}</p>
                        </div>
                      )}

                      {realisation.client && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
                          <p className="text-gray-800">{realisation.client}</p>
                        </div>
                      )}

                      {realisation.duree && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Durée</h3>
                          <p className="text-gray-800">{realisation.duree}</p>
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <ButtonPrimary
                          onClick={() => {}}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          J'aime
                        </ButtonPrimary>

                        <ButtonPrimary
                          onClick={() => {}}
                          className="flex-1 bg-gray-600 hover:bg-gray-500 transition-colors flex items-center justify-center"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Commenter
                        </ButtonPrimary>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Related Projects */}
            {relatedRealisations.length > 0 && (
              <div ref={relatedRef} className="bg-gray-50 py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate={isRelatedInView ? "visible" : "hidden"}
                  >
                    <h2 className="text-2xl md:text-3xl font-serif font-medium text-gray-800 mb-8 text-center">
                      Projets Similaires
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {relatedRealisations.map((related) => (
                        <motion.div
                          key={related.id}
                          variants={fadeIn}
                          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                          whileHover={{ y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link to={`/realisations/${related.id}`} className="block">
                            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                              <img
                                src={related.photos[0]?.image || "/placeholder.svg?height=300&width=400"}
                                alt={related.titre}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </Link>

                          <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-medium text-gray-800 hover:text-emerald-600 transition-colors">
                                <Link to={`/realisations/${related.id}`}>{related.titre}</Link>
                              </h3>
                            </div>

                            <div className="flex items-center text-gray-500 text-sm mb-3">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                {new Date(related.date_creation).toLocaleDateString("fr-FR", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{related.description}</p>

                            <Link
                              to={`/realisations/${related.id}`}
                              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center"
                            >
                              Voir le Projet
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-10 text-center">
                      <Link to="/realisations">
                        <ButtonPrimary className="bg-emerald-600 hover:bg-emerald-500 transition-colors">
                          Voir Tous les Projets
                        </ButtonPrimary>
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Back button */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Link
                to="/realisations"
                className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Retour à Toutes les Réalisations
              </Link>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
              {lightboxOpen && realisation.photos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                  onClick={closeLightbox}
                >
                  <div
                    className="relative w-full h-full flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Close button */}
                    <button
                      onClick={closeLightbox}
                      className="absolute top-4 right-4 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors z-10"
                      aria-label="Fermer"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    {/* Download button */}
                    <a
                      href={realisation.photos[lightboxIndex]?.image}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 left-4 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors z-10"
                      aria-label="Télécharger l'image"
                    >
                      <Download className="w-6 h-6" />
                    </a>

                    {/* Navigation arrows */}
                    {realisation.photos.length > 1 && (
                      <>
                        <button
                          onClick={handleLightboxPrev}
                          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors z-10"
                          aria-label="Photo précédente"
                        >
                          <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button
                          onClick={handleLightboxNext}
                          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors z-10"
                          aria-label="Photo suivante"
                        >
                          <ChevronRight className="w-8 h-8" />
                        </button>
                      </>
                    )}

                    {/* Main image */}
                    <div className="max-w-7xl max-h-full p-4">
                      <img
                        src={realisation.photos[lightboxIndex]?.image || "/placeholder.svg"}
                        alt={`${realisation.titre} - Photo ${lightboxIndex + 1}`}
                        className="max-w-full max-h-[85vh] object-contain mx-auto"
                      />

                      {/* Caption */}
                      {realisation.photos[lightboxIndex]?.caption && (
                        <div className="text-white text-center mt-4 max-w-3xl mx-auto">
                          <p>{realisation.photos[lightboxIndex].caption}</p>
                        </div>
                      )}

                      {/* Counter */}
                      <div className="text-white text-center mt-2">
                        {lightboxIndex + 1} / {realisation.photos.length}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : null}
      </PageContainer>
      <Footer />
    </>
  )
}

export default RealisationDetailPage

