"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import ButtonPrimary from "../components/ButtonPrimary"
import LoadingSpinner from "../components/LoadingSpinner"
import { getDevis } from "../services/api"
import { motion, AnimatePresence } from "framer-motion"
import { Flower, FileText, AlertCircle, ArrowRight, CheckCircle, XCircle, Clock } from "lucide-react"

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
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDevis = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        navigate("/auth")
        return
      }

      try {
        const response = await getDevis()
        console.log("Réponse getDevis:", response.data)
        setDevisList(response.data)
        setLoading(false)
      } catch (err: any) {
        console.error("Erreur lors du chargement des devis:", err.response?.status, err.response?.data)
        setError("Erreur lors du chargement des devis.")
        setLoading(false)
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token")
          navigate("/auth")
        }
      }
    }

    fetchDevis()
  }, [navigate])

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0 },
  }

  const titleVariants = {
    initial: { opacity: 0, y: -20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  }

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  }

  const emptyStateVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.2,
      },
    },
  }

  const errorVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  }

  // Helper function to get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "accepte":
        return {
          icon: <CheckCircle className="h-5 w-5 mr-2" />,
          color: "text-soft-green",
          bgColor: "bg-soft-green/10",
          label: "Accepté",
        }
      case "refuse":
        return {
          icon: <XCircle className="h-5 w-5 mr-2" />,
          color: "text-powder-pink",
          bgColor: "bg-powder-pink/10",
          label: "Refusé",
        }
      default:
        return {
          icon: <Clock className="h-5 w-5 mr-2" />,
          color: "text-soft-brown/70",
          bgColor: "bg-soft-brown/10",
          label: "En attente",
        }
    }
  }

  // Skeleton loader for devis cards
  const DevisSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-light-beige p-6 rounded-lg shadow-md animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-soft-brown/20 rounded w-1/3"></div>
            <div className="h-5 bg-soft-brown/20 rounded w-1/4"></div>
          </div>
          <div className="h-4 bg-soft-brown/20 rounded w-full mb-3"></div>
          <div className="h-4 bg-soft-brown/20 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-soft-brown/20 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-soft-brown/20 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  )

  return (
    <>
      <NavBar />
      <PageContainer>
        <motion.div
          className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
        >
          <motion.div className="flex items-center mb-8" variants={titleVariants}>
            <FileText className="h-7 w-7 text-soft-brown mr-3" />
            <motion.h1
              className="text-3xl font-serif font-medium text-soft-brown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Mes devis
            </motion.h1>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <LoadingSpinner size="large" />
              <motion.p
                className="mt-4 text-soft-brown/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Chargement de vos devis...
              </motion.p>
              <DevisSkeleton />
            </div>
          ) : error ? (
            <motion.div className="text-center py-16" variants={errorVariants}>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-powder-pink/20 rounded-full mb-4"
              >
                <AlertCircle className="h-8 w-8 text-powder-pink" />
              </motion.div>
              <motion.p
                className="text-soft-brown mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {error}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/auth">
                  <ButtonPrimary>Se connecter</ButtonPrimary>
                </Link>
              </motion.div>
            </motion.div>
          ) : devisList.length > 0 ? (
            <div className="space-y-6">
              <AnimatePresence>
                {devisList.map((devis, index) => {
                  const statusInfo = getStatusInfo(devis.statut)

                  return (
                    <motion.div
                      key={devis.id}
                      custom={index}
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      whileHover="hover"
                      className="bg-white border border-light-beige p-6 rounded-lg shadow-sm transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                        <div className="flex items-center mb-2 md:mb-0">
                          <motion.div
                            className="h-10 w-10 rounded-full bg-light-beige flex items-center justify-center mr-3"
                            whileHover={{ rotate: 15 }}
                          >
                            <Flower className="h-5 w-5 text-soft-brown" />
                          </motion.div>
                          <h2 className="text-lg font-medium text-soft-brown">{devis.service.nom}</h2>
                        </div>
                        <div
                          className={`flex items-center px-3 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}
                        >
                          {statusInfo.icon}
                          <span className="text-sm font-medium">{statusInfo.label}</span>
                        </div>
                      </div>

                      <div className="bg-light-beige/30 p-4 rounded-md mb-4">
                        <p className="text-soft-brown/90">{devis.description}</p>
                      </div>

                      <div className="flex flex-col md:flex-row md:justify-between">
                        <div className="mb-2 md:mb-0">
                          <p className="text-soft-brown font-medium">
                            Prix proposé:{" "}
                            {devis.prix_propose ? (
                              <span className="text-soft-green">
                                {Number(devis.prix_propose).toLocaleString("fr-FR")} FCFA
                              </span>
                            ) : (
                              <span className="text-powder-pink/70">Non spécifié</span>
                            )}
                          </p>
                        </div>
                        <div className="text-soft-brown/70 text-sm flex items-center">
                          <span className="mr-2">Devis #{devis.id}</span> •
                          <span className="ml-2">
                            {new Date(devis.date_demande).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div className="text-center py-16" variants={emptyStateVariants}>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-light-beige rounded-full mb-4"
              >
                <FileText className="h-8 w-8 text-soft-brown/70" />
              </motion.div>
              <motion.p
                className="text-soft-brown/70 mb-6 max-w-md mx-auto"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Vous n'avez aucun devis pour le moment. Découvrez nos services et demandez un devis personnalisé.
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/services">
                  <ButtonPrimary className="bg-soft-green hover:bg-soft-green/90 group">
                    <span className="flex items-center">
                      Découvrir nos services
                      <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "loop",
                          duration: 1.5,
                          repeatDelay: 1,
                        }}
                      >
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    </span>
                  </ButtonPrimary>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </PageContainer>
      <Footer />
    </>
  )
}

export default DevisPage

