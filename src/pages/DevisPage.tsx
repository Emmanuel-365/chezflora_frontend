"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import ButtonPrimary from "../components/ButtonPrimary"
import { getDevis } from "../services/api"

interface Devis {
  id: string
  service: { id: string; nom: string }
  description: string
  prix_propose: string | null
  statut: "en_attente" | "accepte" | "refuse"
  date_demande: string
}

const DevisPage: React.FC = () => {
  const [devisList, setDevisList] = useState<Devis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<"tous" | "en_attente" | "accepte" | "refuse">("tous")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDevis = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        navigate("/auth")
        return
      }

      try {
        setLoading(true)
        const response = await getDevis()
        console.log("Réponse getDevis:", response.data)
        setDevisList(response.data)
        setError(null)
      } catch (err: any) {
        console.error("Erreur lors du chargement des devis:", err.response?.status, err.response?.data)
        setError("Erreur lors du chargement des devis.")
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token")
          navigate("/auth")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDevis()
  }, [navigate])

  const filteredDevis = activeFilter === "tous" ? devisList : devisList.filter((devis) => devis.statut === activeFilter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepte":
        return "bg-emerald-100 text-emerald-800"
      case "refuse":
        return "bg-red-100 text-red-800"
      default:
        return "bg-amber-100 text-amber-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepte":
        return <CheckCircle className="w-4 h-4" />
      case "refuse":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepte":
        return "Accepté"
      case "refuse":
        return "Refusé"
      default:
        return "En attente"
    }
  }

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
      <p className="text-gray-600">Chargement de vos devis...</p>
    </div>
  )

  const renderErrorState = () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md bg-white rounded-xl shadow-md p-8">
        <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-medium text-gray-800 mb-2">Oups !</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Réessayer
          </button>
          <Link
            to="/auth"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )

  const renderEmptyState = () => (
    <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-2xl mx-auto">
      <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <FileText className="h-10 w-10 text-emerald-500" />
      </div>
      <h2 className="text-2xl font-medium text-gray-800 mb-3">Aucun devis pour le moment</h2>
      <p className="text-gray-600 mb-6">
        Vous n'avez pas encore de devis. Découvrez nos services et demandez un devis personnalisé.
      </p>
      <Link to="/services">
        <ButtonPrimary className="bg-emerald-600 hover:bg-emerald-500 transition-colors">
          Découvrir nos services
        </ButtonPrimary>
      </Link>
    </div>
  )

  return (
    <>
      <NavBar />
      <PageContainer>
        {/* Hero section */}
        <div className="bg-emerald-600 text-white py-12 mb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-medium mb-2">Mes devis</h1>
                <p className="text-emerald-100">Suivez l'état de vos demandes de devis et consultez les propositions</p>
              </div>
              <Link
                to="/services"
                className="mt-4 md:mt-0 flex items-center text-emerald-100 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux services
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          {loading ? (
            renderLoadingState()
          ) : error ? (
            renderErrorState()
          ) : devisList.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {/* Filtres */}
              <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveFilter("tous")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === "tous"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Tous les devis
                  </button>
                  <button
                    onClick={() => setActiveFilter("en_attente")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === "en_attente"
                        ? "bg-amber-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    En attente
                  </button>
                  <button
                    onClick={() => setActiveFilter("accepte")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === "accepte"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Acceptés
                  </button>
                  <button
                    onClick={() => setActiveFilter("refuse")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === "refuse"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Refusés
                  </button>
                </div>
              </div>

              {/* Liste des devis */}
              <div className="space-y-6">
                <AnimatePresence>
                  {filteredDevis.length > 0 ? (
                    filteredDevis.map((devis) => (
                      <motion.div
                        key={devis.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-md overflow-hidden"
                      >
                        <div className="border-l-4 border-emerald-500 p-6">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                            <div>
                              <h2 className="text-xl font-medium text-gray-800 mb-1">{devis.service.nom}</h2>
                              <div className="flex items-center text-sm text-gray-500">
                                <FileText className="w-4 h-4 mr-1" />
                                <span>Devis #{devis.id.substring(0, 8)}</span>
                              </div>
                            </div>
                            <div
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(devis.statut)}`}
                            >
                              {getStatusIcon(devis.statut)}
                              <span className="ml-1">{getStatusText(devis.statut)}</span>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Description de la demande</h3>
                            <p className="text-gray-600">{devis.description}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h3 className="text-sm font-medium text-gray-700 mb-1">Prix proposé</h3>
                              <p className="text-xl font-bold text-emerald-600">
                                {devis.prix_propose
                                  ? `${Number(devis.prix_propose).toLocaleString("fr-FR")} FCFA`
                                  : "Non spécifié"}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h3 className="text-sm font-medium text-gray-700 mb-1">Date de demande</h3>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                                <p className="text-gray-800">
                                  {new Date(devis.date_demande).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>

                          {devis.statut === "accepte" && (
                            <div className="mt-4">
                              <Link
                                to={`/services/${devis.service.id}`}
                                className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
                              >
                                Voir le service
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Link>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-xl shadow-md p-8 text-center"
                    >
                      <p className="text-gray-600">Aucun devis ne correspond à ce filtre.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </PageContainer>
      <Footer />
    </>
  )
}

export default DevisPage

