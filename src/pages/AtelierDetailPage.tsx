"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence, useInView } from "framer-motion"
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Tag,
  Share2,
  Info,
  ArrowRight,
} from "lucide-react"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import ButtonPrimary from "../components/ButtonPrimary"
import { getAtelier, inscrireAtelier, desinscrireAtelier } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import type { Atelier } from "../types/types"

const AtelierDetailPage = () => {
  const { id } = useParams<{ id: string }>()

  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [atelier, setAtelier] = useState<Atelier | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInscrit, setIsInscrit] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null)
  const [relatedAteliers, setRelatedAteliers] = useState<Atelier[]>([])

  const navigate = useNavigate()

  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true })
  const detailsRef = useRef(null)
  const isDetailsInView = useInView(detailsRef, { once: true })
  const relatedRef = useRef(null)
  const isRelatedInView = useInView(relatedRef, { once: true })

  useEffect(() => {
    const fetchAtelier = async () => {
      if (!id) return

      try {
        setLoading(true)
        const response = await getAtelier(id)
        const atelierData = response.data

        setAtelier(atelierData)

        // Check if user is registered
        if (isAuthenticated && user) {
          const isUserRegistered = atelierData.participants.some((p: any) => p.utilisateur.id === user.id)
          setIsInscrit(isUserRegistered)
        }

        // Mock related workshops
        // In a real app, you would fetch related workshops from the API
        setRelatedAteliers([
          {
            id: "1",
            nom: "Composition florale de printemps",
            description: "Apprenez à créer de magnifiques compositions florales de printemps",
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            prix: 45,
            places_disponibles: 8,
            places_totales: 12,
            is_active: true,
            duree: 2,
            participants: [],
            Photo: {image: "/placeholder.svg?height=300&width=400"},
            tags: "",
            lieu: ""
          },
          {
            id: "2",
            nom: "Art floral japonais",
            description: "Découvrez les techniques traditionnelles de l'ikebana",
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            prix: 60,
            places_disponibles: 5,
            places_totales: 10,
            is_active: true,
            duree: 3,
            participants: [],
            Photo: {image: "/placeholder.svg?height=300&width=400"},
            tags: "",
            lieu: ""          },
          {
            id: "3",
            nom: "Couronnes de Noël",
            description: "Créez votre propre couronne de Noël pour décorer votre porte",
            date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            prix: 50,
            places_disponibles: 3,
            places_totales: 15,
            is_active: true,
            duree: 2.5,
            participants: [],
            Photo: {image: "/placeholder.svg?height=300&width=400"},
            tags: "",
            lieu: ""          },
        ])

        setError(null)
        setLoading(false)
      } catch (err: any) {
        console.error("Error fetching workshop:", err)
        setError(err.response?.data?.error || "Error loading workshop details")
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchAtelier()
    }
  }, [id, user, isAuthenticated, authLoading])

  const handleInscription = async () => {
    if (!isAuthenticated) {
      navigate("/auth", { state: { from: `/ateliers/${id}` } })
      return
    }

    if (!atelier) return

    try {
      setActionLoading(true)
      await inscrireAtelier(id!)
      setIsInscrit(true)
      setAtelier({
        ...atelier,
        places_disponibles: atelier.places_disponibles - 1,
      })
      setShowSuccessMessage("You have successfully registered for this workshop!")
      setTimeout(() => setShowSuccessMessage(null), 5000)
      setError(null)
    } catch (err: any) {
      console.error("Error registering:", err)
      setError(err.response?.data?.error || "Error during registration")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDesinscription = async () => {
    if (!atelier) return

    // Confirm before unregistering
    if (!window.confirm("Are you sure you want to cancel your registration?")) {
      return
    }

    try {
      setActionLoading(true)
      await desinscrireAtelier(id!)
      setIsInscrit(false)
      setAtelier({
        ...atelier,
        places_disponibles: atelier.places_disponibles + 1,
      })
      setShowSuccessMessage("You have been unregistered from this workshop")
      setTimeout(() => setShowSuccessMessage(null), 5000)
      setError(null)
    } catch (err: any) {
      console.error("Error unregistering:", err)
      setError(err.response?.data?.error || "Error during unregistration")
    } finally {
      setActionLoading(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: atelier?.nom || "Workshop",
        text: atelier?.description || "Check out this workshop!",
        url: window.location.href,
      })
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
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

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
      <p className="text-gray-600 animate-pulse">Loading workshop details...</p>
    </div>
  )

  const renderErrorState = () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md bg-white rounded-xl shadow-md p-8">
        <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-medium text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Try Again
          </button>
          <Link
            to="/ateliers"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Workshops
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <NavBar />
      <PageContainer>
        {loading && !atelier ? (
          renderLoadingState()
        ) : error && !atelier ? (
          renderErrorState()
        ) : atelier ? (
          <>
            {/* Success message */}
            <AnimatePresence>
              {showSuccessMessage && (
                <motion.div
                  className="fixed top-20 right-4 z-50 bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-md flex items-center max-w-md"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
                  <span className="flex-grow">{showSuccessMessage}</span>
                  <button
                    onClick={() => setShowSuccessMessage(null)}
                    className="ml-2 text-emerald-500 hover:text-emerald-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

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
                  {/* Status badge */}
                  <div className="flex justify-center mb-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        atelier.is_active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {atelier.is_active ? "Active" : "Cancelled"}
                    </span>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-serif font-medium mb-4">{atelier.nom}</h1>

                  <div className="flex flex-wrap justify-center gap-6 mb-8">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span>
                        {new Date(atelier.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>{atelier.duree} hours</span>
                    </div>

                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      <span>
                        {atelier.places_disponibles} / {atelier.places_totales} spots available
                      </span>
                    </div>

                    {atelier.lieu && (
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span>{atelier.lieu}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    {atelier.places_disponibles > 0 && atelier.is_active ? (
                      isInscrit ? (
                        <ButtonPrimary
                          onClick={handleDesinscription}
                          disabled={actionLoading}
                          className="bg-red-500 hover:bg-red-600 transition-colors flex items-center"
                        >
                          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Cancel Registration</>}
                        </ButtonPrimary>
                      ) : (
                        <ButtonPrimary
                          onClick={handleInscription}
                          disabled={actionLoading}
                          className="bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center"
                        >
                          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Register Now</>}
                        </ButtonPrimary>
                      )
                    ) : (
                      <div
                        className={`px-6 py-3 rounded-lg ${
                          atelier.is_active ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {atelier.is_active ? "Workshop Full" : "Workshop Cancelled"}
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
                  Home
                </Link>
                <span className="mx-2">/</span>
                <Link to="/ateliers" className="hover:text-emerald-600 transition-colors">
                  Workshops
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-700">{atelier.nom}</span>
              </nav>
            </div>

            {/* Main content */}
            <div ref={detailsRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Workshop details */}
                <motion.div
                  className="lg:col-span-2"
                  variants={fadeIn}
                  initial="hidden"
                  animate={isDetailsInView ? "visible" : "hidden"}
                >
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Workshop image */}
                    {atelier.Photo.image && (
                      <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                        <img
                          src={atelier.Photo.image || "/placeholder.svg?height=400&width=800"}
                          alt={atelier.nom}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <h2 className="text-2xl font-medium text-gray-800 mb-4">About This Workshop</h2>

                      <div className="prose prose-emerald max-w-none mb-6">
                        <p className="text-gray-600">{atelier.description}</p>
                      </div>

                      {/* Workshop features */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-medium text-gray-800 mb-2">What You'll Learn</h3>
                          <ul className="space-y-2 text-gray-600">
                            <li className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>Professional floral arrangement techniques</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>Color theory and design principles</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>Flower selection and care</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-medium text-gray-800 mb-2">What's Included</h3>
                          <ul className="space-y-2 text-gray-600">
                            <li className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>All necessary materials and tools</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>Refreshments during the workshop</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>Your finished creation to take home</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Workshop tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          <Tag className="h-3 w-3 mr-1" />
                          Beginner Friendly
                        </div>
                        <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          <Tag className="h-3 w-3 mr-1" />
                          Hands-on
                        </div>
                        <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          <Tag className="h-3 w-3 mr-1" />
                          Creative
                        </div>
                      </div>

                      {/* Share button */}
                      <button
                        onClick={handleShare}
                        className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share this workshop
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Registration sidebar */}
                <motion.div
                  variants={fadeIn}
                  initial="hidden"
                  animate={isDetailsInView ? "visible" : "hidden"}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24">
                    <div className="p-6 border-b border-gray-100">
                      <h2 className="text-xl font-medium text-gray-800 mb-1">Registration</h2>
                      <p className="text-gray-500 text-sm">Secure your spot today</p>
                    </div>

                    <div className="p-6">
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Price</span>
                          <span className="text-2xl font-bold text-emerald-600">{atelier.prix} FCFA</span>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Date</span>
                          <span className="text-gray-800">
                            {new Date(atelier.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Time</span>
                          <span className="text-gray-800">
                            {new Date(atelier.date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Duration</span>
                          <span className="text-gray-800">{atelier.duree} hours</span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-emerald-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.max(0, 100 - (atelier.places_disponibles / atelier.places_totales) * 100)}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {atelier.places_disponibles} spots left out of {atelier.places_totales}
                        </p>
                      </div>

                      {atelier.places_disponibles > 0 && atelier.is_active ? (
                        isInscrit ? (
                          <div className="space-y-4">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start">
                              <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-emerald-800 font-medium">You're registered!</p>
                                <p className="text-emerald-600 text-sm">
                                  We look forward to seeing you at the workshop.
                                </p>
                              </div>
                            </div>

                            <ButtonPrimary
                              onClick={handleDesinscription}
                              disabled={actionLoading}
                              className="w-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
                            >
                              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cancel Registration"}
                            </ButtonPrimary>
                          </div>
                        ) : (
                          <ButtonPrimary
                            onClick={handleInscription}
                            disabled={actionLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center"
                          >
                            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register Now"}
                          </ButtonPrimary>
                        )
                      ) : (
                        <div
                          className={`w-full py-3 px-4 rounded-lg text-center ${
                            atelier.is_active ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {atelier.is_active ? "Workshop Full" : "Workshop Cancelled"}
                        </div>
                      )}

                      {/* Error message */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            className="mt-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Additional info */}
                    <div className="p-6 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-600">
                          Registration closes 24 hours before the workshop. Please arrive 15 minutes early.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Related workshops */}
            {relatedAteliers.length > 0 && (
              <div ref={relatedRef} className="bg-gray-50 py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div variants={fadeIn} initial="hidden" animate={isRelatedInView ? "visible" : "hidden"}>
                    <h2 className="text-2xl md:text-3xl font-serif font-medium text-gray-800 mb-8 text-center">
                      You Might Also Like
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {relatedAteliers.map((relatedAtelier) => (
                        <motion.div
                          key={relatedAtelier.id}
                          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                          whileHover={{ y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link to={`/ateliers/${relatedAtelier.id}`} className="block">
                            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                              {relatedAtelier.Photo.image && <img
                                src={relatedAtelier.Photo.image || "/placeholder.svg?height=300&width=400"}
                                alt={relatedAtelier.nom}
                                className="w-full h-full object-cover"
                              />}
                            </div>
                          </Link>

                          <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-medium text-gray-800 hover:text-emerald-600 transition-colors">
                                <Link to={`/ateliers/${relatedAtelier.id}`}>{relatedAtelier.nom}</Link>
                              </h3>
                              <span className="text-emerald-600 font-bold">{relatedAtelier.prix} FCFA</span>
                            </div>

                            <div className="flex items-center text-gray-500 text-sm mb-3">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                {new Date(relatedAtelier.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{relatedAtelier.description}</p>

                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">
                                {relatedAtelier.places_disponibles} spots left
                              </span>
                              <Link
                                to={`/ateliers/${relatedAtelier.id}`}
                                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center"
                              >
                                View Details
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-10 text-center">
                      <Link to="/ateliers">
                        <ButtonPrimary className="bg-emerald-600 hover:bg-emerald-500 transition-colors">
                          View All Workshops
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
                to="/ateliers"
                className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to All Workshops
              </Link>
            </div>
          </>
        ) : null}
      </PageContainer>
      <Footer />
    </>
  )
}

export default AtelierDetailPage

