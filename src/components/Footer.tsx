"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Flower2,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Clock,
  ChevronRight,
  Heart,
  Send,
  Leaf,
  CreditCard,
  Truck,
  ShieldCheck,
} from "lucide-react"
import { Link } from "react-router-dom"
import { getPublicParameters } from "../services/api"

const Footer = () => {
  const [params, setParams] = useState<{ [key: string]: string }>({})
  const [email, setEmail] = useState("")
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  useEffect(() => {
    const fetchParams = async () => {
      try {
        const response = await getPublicParameters()
        const paramData = response.data.reduce(
          (acc: { [key: string]: string }, param: { cle: string; valeur: string }) => {
            acc[param.cle] = param.valeur
            return acc
          },
          {},
        )
        setParams(paramData)
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres publics:", error)
      }
    }
    fetchParams()
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) return

    setSubscribeStatus("loading")

    // Simulate API call
    setTimeout(() => {
      setSubscribeStatus("success")
      setEmail("")

      // Reset status after 3 seconds
      setTimeout(() => {
        setSubscribeStatus("idle")
      }, 3000)
    }, 1000)
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <footer className="bg-gradient-to-b from-white to-light-beige">
      {/* Newsletter Section */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-emerald-50 rounded-2xl p-8 md:p-10 shadow-sm"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
              <div className="lg:col-span-3">
                <h3 className="text-2xl font-serif font-medium text-emerald-800 mb-3">
                  Restez informé de nos nouveautés
                </h3>
                <p className="text-emerald-700/80 mb-4 max-w-xl">
                  Inscrivez-vous à notre newsletter pour recevoir des conseils d'entretien, des idées de décoration
                  florale et des offres exclusives.
                </p>
              </div>
              <div className="lg:col-span-2">
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Votre adresse email"
                      className="w-full px-4 py-3 rounded-lg border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      disabled={subscribeStatus === "loading" || subscribeStatus === "success"}
                      required
                    />
                    {subscribeStatus === "success" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={subscribeStatus === "loading" || subscribeStatus === "success"}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors duration-200 flex items-center justify-center whitespace-nowrap"
                  >
                    {subscribeStatus === "loading" ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        S'inscrire
                      </>
                    )}
                  </button>
                </form>
                <p className="text-emerald-700/60 text-sm mt-3">
                  Nous respectons votre vie privée. Vous pouvez vous désinscrire à tout moment.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                <Leaf className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-800 mb-1">Produits éco-responsables</h4>
              <p className="text-xs text-gray-500">Fleurs locales et emballages recyclables</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                <Truck className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-800 mb-1">Livraison rapide</h4>
              <p className="text-xs text-gray-500">Livraison le jour même disponible</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-800 mb-1">Paiement sécurisé</h4>
              <p className="text-xs text-gray-500">Transactions 100% sécurisées</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-800 mb-1">Satisfaction garantie</h4>
              <p className="text-xs text-gray-500">Remboursement si vous n'êtes pas satisfait</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="border-t border-gray-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center">
                <Flower2 className="h-8 w-8 text-emerald-600" />
                <span className="ml-2 text-2xl font-serif font-medium text-gray-800">
                  {params["site_name"] || "ChezFlora"}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {params["site_description"] ||
                  "Votre destination pour tout ce qui touche aux fleurs et plantes. Nous proposons des créations florales uniques pour tous vos événements spéciaux et votre quotidien."}
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Téléphone</p>
                    <a
                      href="tel:+33123456789"
                      className="text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                    >
                      +33 1 23 45 67 89
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Email</p>
                    <a
                      href="mailto:contact@chezflora.com"
                      className="text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                    >
                      contact@chezflora.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Adresse</p>
                    <p className="text-sm text-gray-600">
                      123 Avenue des Fleurs
                      <br />
                      75001 Paris, France
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Horaires d'ouverture</p>
                    <p className="text-sm text-gray-600">
                      Lun-Ven: 9h-19h | Sam: 10h-18h
                      <br />
                      Dimanche: Fermé
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors duration-300"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-gray-800 font-medium text-lg mb-4">Produits</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/products/flowers"
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-emerald-500" />
                    Fleurs fraîches
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products/plants"
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-emerald-500" />
                    Plantes d'intérieur
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products/bouquets"
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-emerald-500" />
                    Bouquets composés
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products/gifts"
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-emerald-500" />
                    Coffrets cadeaux
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products/seasonal"
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-emerald-500" />
                    Collections saisonnières
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-gray-800 font-medium text-lg mb-4">Services</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/services/events"
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-emerald-500" />
                    Décoration d'événements
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services/weddings"
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-emerald-500" />
                    Fleurs de mariage
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services/subscription"
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-emerald-500" />
                    Abonnements floraux
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services/corporate"
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-emerald-500" />
                    Services aux entreprises
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services/custom"
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-emerald-500" />
                    Créations sur mesure
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-gray-800 font-medium text-lg mb-4">Informations</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/about"
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-emerald-500" />À propos de nous
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-emerald-500" />
                    Contactez-nous
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shipping"
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-emerald-500" />
                    Livraison et retours
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-emerald-500" />
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-emerald-500" />
                    Conditions générales
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ChevronRight className="h-4 w-4 mr-1 text-emerald-500" />
                    Politique de confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {params["site_name"] || "ChezFlora"}. Tous droits réservés.
          </p>
          <div className="flex items-center mt-4 md:mt-0">
            <span className="text-gray-500 text-sm flex items-center">
              Fait avec <Heart className="h-4 w-4 text-red-500 mx-1" /> en France
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

