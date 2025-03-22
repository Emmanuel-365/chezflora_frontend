"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Calendar, Heart, Leaf, Users, Award, Clock } from "lucide-react"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const AboutPage = () => {
  const historyRef = useRef(null)
  const valuesRef = useRef(null)
  const teamRef = useRef(null)

  const historyInView = useInView(historyRef, { once: true, amount: 0.3 })
  const valuesInView = useInView(valuesRef, { once: true, amount: 0.3 })
  const teamInView = useInView(teamRef, { once: true, amount: 0.3 })

  const timelineEvents = [
    { year: "2015", title: "Création", description: "Ouverture de notre première boutique à Yaoundé." },
    { year: "2017", title: "Expansion", description: "Lancement de notre service de livraison à domicile." },
    { year: "2019", title: "Innovation", description: "Début des ateliers floraux et événements créatifs." },
    {
      year: "2021",
      title: "Croissance",
      description: "Ouverture de notre deuxième boutique et lancement de notre site web.",
    },
    { year: "2023", title: "Aujourd'hui", description: "ChezFlora continue de fleurir et d'innover pour vous." },
  ]

  const teamMembers = [
    { name: "Sophie Martin", role: "Fondatrice & Directrice", image: "/placeholder.svg?height=200&width=200" },
    { name: "Thomas Dubois", role: "Chef Fleuriste", image: "/placeholder.svg?height=200&width=200" },
    { name: "Emma Laurent", role: "Responsable Événements", image: "/placeholder.svg?height=200&width=200" },
  ]

  return (
    <>
      <NavBar />
      <PageContainer>
        {/* Hero Section */}
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

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h1
                className="text-4xl font-serif font-medium text-soft-brown mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                À propos de ChezFlora
              </motion.h1>

              <motion.p
                className="text-soft-brown/90 mb-8 leading-relaxed max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Bienvenue chez ChezFlora, votre boutique florale dédiée à la beauté naturelle et à la créativité. Depuis
                notre création, nous nous efforçons d'apporter une touche de magie à chaque moment de votre vie grâce à
                nos compositions uniques et personnalisées.
              </motion.p>

              <motion.div
                className="flex flex-wrap justify-center gap-4 mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="bg-white px-6 py-3 rounded-full shadow-sm flex items-center gap-2 text-soft-brown">
                  <Calendar className="w-5 h-5 text-soft-green" />
                  <span>Depuis 2015</span>
                </div>
                <div className="bg-white px-6 py-3 rounded-full shadow-sm flex items-center gap-2 text-soft-brown">
                  <Users className="w-5 h-5 text-soft-green" />
                  <span>+20 Artisans Fleuristes</span>
                </div>
                <div className="bg-white px-6 py-3 rounded-full shadow-sm flex items-center gap-2 text-soft-brown">
                  <Heart className="w-5 h-5 text-soft-green" />
                  <span>+10,000 Clients Satisfaits</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Mission Section */}
            <motion.div
              className="bg-white rounded-lg shadow-md p-8 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-2xl font-medium text-soft-brown mb-4 flex items-center">
                <Leaf className="w-6 h-6 text-soft-green mr-2" />
                Notre mission
              </h2>
              <p className="text-soft-brown/90 leading-relaxed">
                Notre mission est simple : célébrer la nature à travers des fleurs soigneusement sélectionnées et des
                services sur mesure. Que ce soit pour un bouquet quotidien, une occasion spéciale ou un atelier floral,
                nous mettons tout notre cœur à rendre chaque expérience mémorable.
              </p>
            </motion.div>

            {/* History Timeline */}
            <div ref={historyRef} className="mb-12">
              <motion.div
                className="bg-white rounded-lg shadow-md p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={historyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-medium text-soft-brown mb-6 flex items-center">
                  <Clock className="w-6 h-6 text-soft-green mr-2" />
                  Notre histoire
                </h2>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-soft-green/20" />

                  {/* Timeline events */}
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate={historyInView ? "animate" : "initial"}
                    className="space-y-8"
                  >
                    {timelineEvents.map((event, index) => (
                      <motion.div key={index} className="relative pl-12" variants={fadeIn}>
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-soft-green border-4 border-white" />

                        <div className="bg-light-beige p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-soft-brown">{event.title}</h3>
                            <span className="text-soft-green font-medium">{event.year}</span>
                          </div>
                          <p className="text-soft-brown/80">{event.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Values Section */}
            <div ref={valuesRef} className="mb-12">
              <motion.div
                className="bg-white rounded-lg shadow-md p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-medium text-soft-brown mb-6 flex items-center">
                  <Award className="w-6 h-6 text-soft-green mr-2" />
                  Nos valeurs
                </h2>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="initial"
                  animate={valuesInView ? "animate" : "initial"}
                >
                  <motion.div className="bg-light-beige p-6 rounded-lg" variants={fadeIn}>
                    <div className="w-12 h-12 bg-soft-green/10 rounded-full flex items-center justify-center mb-4">
                      <Leaf className="w-6 h-6 text-soft-green" />
                    </div>
                    <h3 className="text-lg font-medium text-soft-brown mb-2">Qualité</h3>
                    <p className="text-soft-brown/80">Des fleurs fraîches et durables, choisies avec soin.</p>
                  </motion.div>

                  <motion.div className="bg-light-beige p-6 rounded-lg" variants={fadeIn}>
                    <div className="w-12 h-12 bg-soft-green/10 rounded-full flex items-center justify-center mb-4">
                      <Heart className="w-6 h-6 text-soft-green" />
                    </div>
                    <h3 className="text-lg font-medium text-soft-brown mb-2">Créativité</h3>
                    <p className="text-soft-brown/80">Des designs uniques qui racontent une histoire.</p>
                  </motion.div>

                  <motion.div className="bg-light-beige p-6 rounded-lg" variants={fadeIn}>
                    <div className="w-12 h-12 bg-soft-green/10 rounded-full flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-soft-green" />
                    </div>
                    <h3 className="text-lg font-medium text-soft-brown mb-2">Proximité</h3>
                    <p className="text-soft-brown/80">Un service client chaleureux et attentif.</p>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            {/* Team Section */}
            <div ref={teamRef} className="mb-12">
              <motion.div
                className="bg-white rounded-lg shadow-md p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={teamInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-medium text-soft-brown mb-6 flex items-center">
                  <Users className="w-6 h-6 text-soft-green mr-2" />
                  Notre équipe
                </h2>

                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="initial"
                  animate={teamInView ? "animate" : "initial"}
                >
                  {teamMembers.map((member, index) => (
                    <motion.div
                      key={index}
                      className="bg-light-beige rounded-lg overflow-hidden"
                      variants={fadeIn}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <div className="aspect-w-1 aspect-h-1">
                        <img
                          src={member.image || "/placeholder.svg"}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="font-medium text-soft-brown">{member.name}</h3>
                        <p className="text-soft-brown/70 text-sm">{member.role}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>

            {/* Team Photo */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={teamInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative rounded-lg overflow-hidden shadow-lg">
                <img
                  src="/images/chezflora-team.jpg" // Remplacez par une vraie image
                  alt="Équipe ChezFlora"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                  <p className="text-white italic p-6 w-full text-center">
                    L'équipe ChezFlora, prête à fleurir votre quotidien.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              className="bg-soft-green/10 rounded-lg p-8 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-2xl font-medium text-soft-brown mb-4">Rejoignez l'aventure ChezFlora</h2>
              <p className="text-soft-brown/80 mb-6">
                Découvrez nos créations florales et laissez-vous séduire par notre passion pour les fleurs.
              </p>
              <a
                href="/contact"
                className="inline-block bg-soft-green text-white px-6 py-3 rounded-full font-medium hover:bg-soft-green/90 transition-colors duration-300"
              >
                Contactez-nous
              </a>
            </motion.div>
          </div>
        </motion.div>
      </PageContainer>
      <Footer />
    </>
  )
}

export default AboutPage;

