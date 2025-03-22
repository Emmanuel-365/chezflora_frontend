"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import ButtonPrimary from "../components/ButtonPrimary"
import { getArticles } from "../services/api"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, User, MessageCircle } from "lucide-react"

interface Article {
  id: string
  titre: string
  contenu: string
  cover: string | null
  auteur: string
  date_publication: string
  commentaires_count?: number
}

const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await getArticles()
        setArticles(response.data.results)
        setLoading(false)
      } catch (err: any) {
        console.error("Erreur lors du chargement:", err.response?.data)
        setError("Erreur lors du chargement des articles.")
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-beige">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-soft-green"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-beige">
        <div className="text-center py-16 text-powder-pink bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-serif mb-4">Oops !</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <NavBar />
      <PageContainer>
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-medium text-soft-brown mb-8 text-center">Blog ChezFlora</h1>

          <div className="space-y-12">
            {articles.length > 0 ? (
              <AnimatePresence>
                {articles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row items-center"
                  >
                    {article.cover && (
                      <img
                        src={article.cover || "/placeholder.svg"}
                        alt={article.titre}
                        className="w-full md:w-1/3 h-64 object-cover rounded-md mb-4 md:mb-0 md:mr-6"
                      />
                    )}
                    <div className="flex-1">
                      <h2 className="text-2xl font-serif font-medium text-soft-brown mb-3">{article.titre}</h2>
                      <div className="flex items-center text-soft-brown/70 text-sm mb-3">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(article.date_publication).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <User className="h-4 w-4 ml-4 mr-1" />
                        <span>{article.auteur}</span>
                        {article.commentaires_count !== undefined && (
                          <>
                            <MessageCircle className="h-4 w-4 ml-4 mr-1" />
                            <span>{article.commentaires_count} commentaire(s)</span>
                          </>
                        )}
                      </div>
                      <p className="text-soft-brown/90 mb-4 line-clamp-3">{article.contenu}</p>
                      <Link to={`/blog/${article.id}`}>
                        <ButtonPrimary className="bg-soft-green hover:bg-soft-green/90 transition-colors duration-300 text-white font-medium py-2 px-4 rounded-full shadow-md hover:shadow-lg">
                          Lire la suite
                        </ButtonPrimary>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <p className="text-soft-brown/70 text-lg">Aucun article disponible pour le moment.</p>
                <p className="text-soft-brown/50 mt-2">Revenez bientôt pour découvrir nos nouveaux articles !</p>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  )
}

export default ArticlesPage

