"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, AlertCircle, AtSign, User, MessageSquare } from "lucide-react"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import ButtonPrimary from "../components/ButtonPrimary"
import { sendContactMessage } from "../services/api"

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [touched, setTouched] = useState({ name: false, email: false, message: false })
  const [formErrors, setFormErrors] = useState({ name: "", email: "", message: "" })

  // Validate form on input change
  useEffect(() => {
    validateForm()
  }, [formData, touched])

  const validateForm = () => {
    const errors = { name: "", email: "", message: "" }

    if (touched.name && !formData.name) {
      errors.name = "Le nom est requis"
    }

    if (touched.email) {
      if (!formData.email) {
        errors.email = "L'email est requis"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Veuillez entrer un email valide"
      }
    }

    if (touched.message && !formData.message) {
      errors.message = "Le message est requis"
    } else if (touched.message && formData.message.length < 10) {
      errors.message = "Le message doit contenir au moins 10 caractères"
    }

    setFormErrors(errors)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched to show validation errors
    setTouched({ name: true, email: true, message: true })

    // Check if there are any validation errors
    if (
      !formData.name ||
      !formData.email ||
      !formData.message ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ||
      formData.message.length < 10
    ) {
      setError("Veuillez corriger les erreurs dans le formulaire.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await sendContactMessage(formData)
      setSuccess(response.data.status || "Message envoyé avec succès !")
      setFormData({ name: "", email: "", message: "" })
      setTouched({ name: false, email: false, message: false })
    } catch (err: any) {
      console.error("Erreur lors de l'envoi:", err.response?.data)
      setError(err.response?.data?.error || "Erreur lors de l'envoi du message.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <NavBar />
      <PageContainer>
        <motion.div
          className="relative bg-soft-green/10 py-16 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
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

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h1
              className="text-4xl font-serif font-medium text-soft-brown mb-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Contactez-nous
            </motion.h1>

            <motion.p
              className="text-soft-brown/70 text-center mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Une question ? Une demande spéciale ? Envoyez-nous un message, nous vous répondrons dans les plus brefs
              délais !
            </motion.p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Information */}
              <motion.div
                className="lg:col-span-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="bg-white rounded-lg shadow-md p-6 h-full">
                  <h2 className="text-xl font-medium text-soft-brown mb-6">Nos coordonnées</h2>

                  <div className="space-y-6">
                    <motion.div
                      className="flex items-start space-x-3"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Mail className="w-5 h-5 text-soft-green mt-1" />
                      <div>
                        <p className="font-medium text-soft-brown">Email</p>
                        <a
                          href="mailto:support@chezflora.com"
                          className="text-soft-brown/70 hover:text-soft-green transition-colors duration-300"
                        >
                          support@chezflora.com
                        </a>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-start space-x-3"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Phone className="w-5 h-5 text-soft-green mt-1" />
                      <div>
                        <p className="font-medium text-soft-brown">Téléphone</p>
                        <a
                          href="tel:+33123456789"
                          className="text-soft-brown/70 hover:text-soft-green transition-colors duration-300"
                        >
                          +237 612 345 678
                        </a>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-start space-x-3"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <MapPin className="w-5 h-5 text-soft-green mt-1" />
                      <div>
                        <p className="font-medium text-soft-brown">Adresse</p>
                        <p className="text-soft-brown/70">
                          123 Avenue des Fleurs
                          <br />
                          99322 Yaoundé, Cameroun
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-soft-brown mb-4">Horaires d'ouverture</h3>
                    <ul className="space-y-2 text-soft-brown/70">
                      <li className="flex justify-between">
                        <span>Lundi - Vendredi</span>
                        <span>9h - 19h</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Samedi</span>
                        <span>10h - 18h</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Dimanche</span>
                        <span>Fermé</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-soft-brown font-medium mb-1">
                      Nom
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-soft-brown/40" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 p-3 border rounded-md focus:outline-none focus:ring-2 transition-all duration-300 ${
                          formErrors.name
                            ? "border-powder-pink focus:ring-powder-pink/50"
                            : "border-soft-brown/30 focus:ring-soft-green/50"
                        }`}
                        placeholder="Votre nom"
                        aria-invalid={!!formErrors.name}
                        aria-describedby={formErrors.name ? "name-error" : undefined}
                      />
                    </div>
                    <AnimatePresence>
                      {formErrors.name && (
                        <motion.p
                          id="name-error"
                          className="mt-1 text-sm text-powder-pink flex items-center"
                          {...fadeIn}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {formErrors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-soft-brown font-medium mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <AtSign className="h-5 w-5 text-soft-brown/40" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 p-3 border rounded-md focus:outline-none focus:ring-2 transition-all duration-300 ${
                          formErrors.email
                            ? "border-powder-pink focus:ring-powder-pink/50"
                            : "border-soft-brown/30 focus:ring-soft-green/50"
                        }`}
                        placeholder="votre@email.com"
                        aria-invalid={!!formErrors.email}
                        aria-describedby={formErrors.email ? "email-error" : undefined}
                      />
                    </div>
                    <AnimatePresence>
                      {formErrors.email && (
                        <motion.p
                          id="email-error"
                          className="mt-1 text-sm text-powder-pink flex items-center"
                          {...fadeIn}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {formErrors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-soft-brown font-medium mb-1">
                      Message
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <MessageSquare className="h-5 w-5 text-soft-brown/40" />
                      </div>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 p-3 border rounded-md focus:outline-none focus:ring-2 transition-all duration-300 h-32 resize-y ${
                          formErrors.message
                            ? "border-powder-pink focus:ring-powder-pink/50"
                            : "border-soft-brown/30 focus:ring-soft-green/50"
                        }`}
                        placeholder="Votre message..."
                        aria-invalid={!!formErrors.message}
                        aria-describedby={formErrors.message ? "message-error" : undefined}
                      />
                    </div>
                    <AnimatePresence>
                      {formErrors.message && (
                        <motion.p
                          id="message-error"
                          className="mt-1 text-sm text-powder-pink flex items-center"
                          {...fadeIn}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {formErrors.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className="bg-powder-pink/10 border border-powder-pink/20 text-powder-pink p-3 rounded-md flex items-center"
                        {...fadeIn}
                      >
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <p>{error}</p>
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        className="bg-soft-green/10 border border-soft-green/20 text-soft-green p-3 rounded-md flex items-center"
                        {...fadeIn}
                      >
                        <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <p>{success}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <ButtonPrimary
                    type="submit"
                    disabled={loading}
                    className="w-full bg-soft-green hover:bg-soft-green/90 flex items-center justify-center gap-2 py-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Envoyer
                      </>
                    )}
                  </ButtonPrimary>
                </form>
              </motion.div>
            </div>

            {/* Map Section */}
            <motion.div
              className="mt-12 bg-white rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="aspect-w-16 aspect-h-9 w-full h-64 bg-light-beige">
                <div className="w-full h-full relative">
                  <img
                    src="/placeholder.svg?height=400&width=800"
                    alt="Carte de localisation"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <p className="font-medium text-soft-brown">ChezFlora</p>
                      <p className="text-soft-brown/70 text-sm">123 Avenue des Fleurs, Yaoundé</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </PageContainer>
      <Footer />
    </>
  )
}

export default ContactPage;

