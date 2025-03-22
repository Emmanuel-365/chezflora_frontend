"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { Calendar, ChevronRight, Search, Filter, Loader2, MapPin, Clock, Tag, ArrowRight } from "lucide-react"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import ButtonPrimary from "../components/ButtonPrimary"
import { getAteliers, inscrireAtelier, desinscrireAtelier } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import type { Atelier } from "../types/types"

const AteliersPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [ateliers, setAteliers] = useState<Atelier[]>([])
  const [filteredAteliers, setFilteredAteliers] = useState<Atelier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])

  const navigate = useNavigate()
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true })

  // Fetch ateliers
  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return // Wait for authentication to be verified

      try {
        setLoading(true)
        const ateliersResponse = await getAteliers()
        const ateliersData = ateliersResponse.data.results || ateliersResponse.data

        // Add some mock data for demonstration
        const ateliersWithMockData = ateliersData.map((atelier: Atelier) => ({
          ...atelier,
          lieu: ["Yaoundé", "Garoua", "Douala", "Bertoua", "Ngaoundéré"][Math.floor(Math.random() * 5)],
          tags: ["débutant", "avancé", "enfants", "adultes", "saisonnier"][Math.floor(Math.random() * 5)],
          duree: ["1h", "1h30", "2h", "2h30", "3h"][Math.floor(Math.random() * 5)],
        }))

        setAteliers(ateliersWithMockData)
        setFilteredAteliers(ateliersWithMockData)
        setLoading(false)
      } catch (err: any) {
        console.error("Erreur lors du chargement:", err.response?.status, err.response?.data)
        setError("Erreur lors du chargement des ateliers.")
        setLoading(false)
        if (err.response?.status === 401) {
          navigate("/auth")
        }
      }
    }

    fetchData()
  }, [navigate, isAuthenticated, user, authLoading])

  // Filter ateliers based on search, month, and price
  useEffect(() => {
    if (ateliers.length === 0) return

    let filtered = [...ateliers]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (atelier) =>
          atelier.nom.toLowerCase().includes(query) ||
          atelier.description.toLowerCase().includes(query) ||
          (atelier.lieu && atelier.lieu.toLowerCase().includes(query)) ||
          (atelier.tags && atelier.tags.toLowerCase().includes(query)),
      )
    }

    if (selectedMonth) {
      const monthIndex = [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre",
      ].indexOf(selectedMonth.toLowerCase())

      if (monthIndex !== -1) {
        filtered = filtered.filter((atelier) => {
          const date = new Date(atelier.date)
          return date.getMonth() === monthIndex
        })
      }
    }

    filtered = filtered.filter((atelier) => {
      return atelier.prix >= priceRange[0] && atelier.prix <= priceRange[1]
    })

    setFilteredAteliers(filtered)
  }, [searchQuery, selectedMonth, priceRange, ateliers])

  // Handle inscription
  const handleInscription = async (atelierId: string) => {
    if (!isAuthenticated) {
      navigate("/auth", { state: { from: "/ateliers" } })
      return
    }

    setActionLoading(atelierId)

    try {
      await inscrireAtelier(atelierId)
      const updatedAteliers = await getAteliers()
      const updatedData = updatedAteliers.data.results || updatedAteliers.data

      setAteliers(updatedData)
      setFilteredAteliers((prevFiltered) => {
        return prevFiltered.map((atelier) => {
          if (atelier.id === atelierId) {
            const updatedAtelier = updatedData.find((a: Atelier) => a.id === atelierId)
            return updatedAtelier || atelier
          }
          return atelier
        })
      })

      // Show success message
      const successMessage = document.createElement("div")
      successMessage.className =
        "fixed top-4 right-4 bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-md z-50 flex items-center"
      successMessage.innerHTML = `
        <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Inscription réussie !</span>
      `
      document.body.appendChild(successMessage)

      setTimeout(() => {
        successMessage.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => document.body.removeChild(successMessage), 500)
      }, 3000)
    } catch (err: any) {
      console.error("Erreur lors de l'inscription:", err.response?.data)

      // Show error message
      const errorMessage = document.createElement("div")
      errorMessage.className =
        "fixed top-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-md z-50 flex items-center"
      errorMessage.innerHTML = `
        <svg class="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <span>Erreur lors de l'inscription : ${err.response?.data?.error || "Vérifiez votre connexion."}</span>
      `
      document.body.appendChild(errorMessage)

      setTimeout(() => {
        errorMessage.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => document.body.removeChild(errorMessage), 500)
      }, 5000)
    } finally {
      setActionLoading(null)
    }
  }

  // Handle desinscription
  const handleDesinscription = async (atelierId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir vous désinscrire de cet atelier ?")) return

    setActionLoading(atelierId)

    try {
      await desinscrireAtelier(atelierId)
      const updatedAteliers = await getAteliers()
      const updatedData = updatedAteliers.data.results || updatedAteliers.data

      setAteliers(updatedData)
      setFilteredAteliers((prevFiltered) => {
        return prevFiltered.map((atelier) => {
          if (atelier.id === atelierId) {
            const updatedAtelier = updatedData.find((a: Atelier) => a.id === atelierId)
            return updatedAtelier || atelier
          }
          return atelier
        })
      })

      // Show success message
      const successMessage = document.createElement("div")
      successMessage.className =
        "fixed top-4 right-4 bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-md z-50 flex items-center"
      successMessage.innerHTML = `
        <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Désinscription réussie.</span>
      `
      document.body.appendChild(successMessage)

      setTimeout(() => {
        successMessage.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => document.body.removeChild(successMessage), 500)
      }, 3000)
    } catch (err: any) {
      console.error("Erreur lors de la désinscription:", err.response?.data)

      // Show error message
      const errorMessage = document.createElement("div")
      errorMessage.className =
        "fixed top-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-md z-50 flex items-center"
      errorMessage.innerHTML = `
        <svg class="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <span>Erreur lors de la désinscription : ${err.response?.data?.error || "Vérifiez votre connexion."}</span>
      `
      document.body.appendChild(errorMessage)

      setTimeout(() => {
        errorMessage.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => document.body.removeChild(errorMessage), 500)
      }, 5000)
    } finally {
      setActionLoading(null)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleMonthSelect = (month: string | null) => {
    setSelectedMonth(month)
  }

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    setPriceRange((prev) => [prev[0], value])
  }

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
      <p className="text-gray-600 animate-pulse">Chargement des ateliers...</p>
    </div>
  )

  const renderErrorState = () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md bg-white rounded-xl shadow-md p-8">
        <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
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
          {error?.includes("connexion") && (
            <Link
              to="/auth"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Se connecter
            </Link>
          )}
        </div>
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
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-gray-800 mb-4">Ateliers Floraux</h1>
              <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                Découvrez nos ateliers floraux et apprenez l'art de la composition florale avec nos experts. Que vous
                soyez débutant ou confirmé, nous avons un atelier adapté à votre niveau.
              </p>

              {/* Search and Filters */}
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="relative mb-6">
                  <input
                    type="search"
                    placeholder="Rechercher un atelier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </form>

                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <button
                    onClick={() => handleMonthSelect(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedMonth === null
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Tous les mois
                  </button>
                  {[
                    "Janvier",
                    "Février",
                    "Mars",
                    "Avril",
                    "Mai",
                    "Juin",
                    "Juillet",
                    "Août",
                    "Septembre",
                    "Octobre",
                    "Novembre",
                    "Décembre",
                  ].map((month) => (
                    <button
                      key={month}
                      onClick={() => handleMonthSelect(month)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedMonth === month
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  {showFilters ? "Masquer les filtres" : "Plus de filtres"}
                </button>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mt-4"
                    >
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">Filtrer par prix</h3>
                        <div className="mb-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-xs text-gray-500">0 €</span>
                            <span className="text-xs text-gray-500">{priceRange[1]} €</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1000"
                            step="50"
                            value={priceRange[1]}
                            onChange={handlePriceRangeChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          {authLoading || loading ? (
            renderLoadingState()
          ) : error ? (
            renderErrorState()
          ) : (
            <>
              {/* Results summary */}
              <div className="mb-8 flex justify-between items-center">
                <p className="text-gray-600">
                  {filteredAteliers.length} atelier{filteredAteliers.length !== 1 ? "s" : ""} trouvé
                  {filteredAteliers.length !== 1 ? "s" : ""}
                  {selectedMonth && (
                    <span>
                      {" "}
                      en <span className="font-medium">{selectedMonth}</span>
                    </span>
                  )}
                  {searchQuery && (
                    <span>
                      {" "}
                      pour <span className="font-medium">"{searchQuery}"</span>
                    </span>
                  )}
                  {priceRange[1] < 1000 && (
                    <span>
                      {" "}
                      avec un prix max. de <span className="font-medium">{priceRange[1]} €</span>
                    </span>
                  )}
                </p>

                {(selectedMonth || searchQuery || priceRange[1] < 1000) && (
                  <button
                    onClick={() => {
                      setSelectedMonth(null)
                      setSearchQuery("")
                      setPriceRange([0, 1000])
                    }}
                    className="text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>

              {/* Ateliers list */}
              {filteredAteliers.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredAteliers.map((atelier) => {
                    const isInscrit = user && atelier.participants.some((p) => p.utilisateur.id === user.id)
                    const isAnnule = !atelier.is_active

                    return (
                      <motion.div
                        key={atelier.id}
                        variants={itemVariants}
                        className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full ${isAnnule ? "opacity-75" : ""}`}
                      >
                        {/* Status badge */}
                        {isInscrit && !isAnnule && (
                          <div className="absolute top-4 right-4 z-10">
                            <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                              Inscrit
                            </span>
                          </div>
                        )}
                        {isAnnule && (
                          <div className="absolute top-4 right-4 z-10">
                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                              Annulé
                            </span>
                          </div>
                        )}

                        {/* Image or placeholder */}
                        <div className="relative h-48 bg-emerald-100">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Calendar className="h-16 w-16 text-emerald-300" />
                          </div>
                          {isAnnule && (
                            <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                              <span className="text-white font-medium">Atelier annulé</span>
                            </div>
                          )}
                        </div>

                        <div className="p-6 flex-grow flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h2 className="text-lg font-medium text-gray-800">{atelier.nom}</h2>
                            <span
                              className={`text-sm font-semibold ${
                                atelier.places_disponibles > 0 ? "text-emerald-600" : "text-red-500"
                              }`}
                            >
                              {atelier.places_disponibles > 0 ? `${atelier.places_disponibles} places` : "Complet"}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-emerald-500" />
                              <span>
                                {new Date(atelier.date).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            </div>

                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-emerald-500" />
                              <span>
                                {new Date(atelier.date).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
                            {atelier.lieu && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1 text-emerald-500" />
                                <span>{atelier.lieu}</span>
                              </div>
                            )}

                            {atelier.duree && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-emerald-500" />
                                <span>{atelier.duree}</span>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{atelier.description}</p>

                          {atelier.tags && (
                            <div className="mb-4">
                              <Link
                                to={`/ateliers?tag=${atelier.tags}`}
                                className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {atelier.tags}
                              </Link>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                            <p className="text-emerald-600 font-semibold">{atelier.prix} €</p>

                            <Link
                              to={`/ateliers/${atelier.id}`}
                              className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                            >
                              Voir les détails <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                          </div>
                        </div>

                        {!isAnnule && (
                          <div className="px-6 pb-6">
                            <ButtonPrimary
                              onClick={() =>
                                isInscrit ? handleDesinscription(atelier.id) : handleInscription(atelier.id)
                              }
                              disabled={actionLoading === atelier.id || (!isInscrit && atelier.places_disponibles <= 0)}
                              className={`w-full ${
                                isInscrit ? "bg-red-500 hover:bg-red-600" : "bg-emerald-600 hover:bg-emerald-500"
                              } transition-colors flex items-center justify-center`}
                            >
                              {actionLoading === atelier.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : isInscrit ? (
                                "Se désinscrire"
                              ) : (
                                "S'inscrire"
                              )}
                            </ButtonPrimary>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </motion.div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-600 text-lg mb-2">Aucun atelier ne correspond à votre recherche.</p>
                  <p className="text-gray-500 mb-6">Essayez d'autres termes ou filtres.</p>
                  <button
                    onClick={() => {
                      setSelectedMonth(null)
                      setSearchQuery("")
                      setPriceRange([0, 1000])
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                  >
                    Voir tous les ateliers
                  </button>
                </div>
              )}

              {/* Call to Action */}
              <div className="mt-16 bg-emerald-50 rounded-xl p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-serif text-gray-800 mb-2">
                      Vous souhaitez organiser un atelier privé ?
                    </h3>
                    <p className="text-gray-600">
                      Contactez-nous pour organiser un atelier personnalisé pour votre groupe ou entreprise.
                    </p>
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

export default AteliersPage

