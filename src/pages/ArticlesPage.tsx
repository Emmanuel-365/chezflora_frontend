"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { Calendar, User, MessageCircle, Search, Tag, ArrowRight, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import ButtonPrimary from "../components/ButtonPrimary"
import { getArticles } from "../services/api"

interface Article {
  id: string
  titre: string
  contenu: string
  cover: string | null
  auteur: string
  date_publication: string
  commentaires_count?: number
  categorie?: string
  tags?: string[]
  temps_lecture?: number
}

const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true })

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const response = await getArticles()
        
        // Add some mock data for demonstration
        const articlesWithMockData = response.data.results.map((article: Article, index: number) => ({
          ...article,
          categorie: ["Conseils", "Tendances", "Tutoriels", "Événements"][index % 4],
          tags: ["fleurs", "plantes", "décoration", "saison", "entretien"].slice(0, (index % 3) + 1),
          temps_lecture: Math.floor(Math.random() * 10) + 3
        }))
        
        setArticles(articlesWithMockData)
        setFilteredArticles(articlesWithMockData)
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(articlesWithMockData.map((article: Article) => article.categorie))
        ).filter(Boolean) as string[]
        
        setCategories(uniqueCategories)
        setLoading(false)
      } catch (err: any) {
        console.error("Erreur lors du chargement:", err.response?.data)
        setError("Erreur lors du chargement des articles.")
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  // Filter articles based on search and category
  useEffect(() => {
    if (articles.length === 0) return
    
    let filtered = [...articles]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        article => 
          article.titre.toLowerCase().includes(query) || 
          article.contenu.toLowerCase().includes(query) ||
          (article.tags && article.tags.some(tag => tag.toLowerCase().includes(query)))
      )
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(article => article.categorie === selectedCategory)
    }
    
    setFilteredArticles(filtered)
  }, [searchQuery, selectedCategory, articles])

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

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category)
  }

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
      <p className="text-gray-600 animate-pulse">Chargement des articles...</p>
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
                Blog ChezFlora
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                Découvrez nos conseils, astuces et inspirations pour sublimer votre quotidien avec des fleurs et des plantes.
              </p>
              
              {/* Search and Filters */}
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="relative mb-6">
                  <input
                    type="search"
                    placeholder="Rechercher un article..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </form>
                
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === null
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tous
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  {showFilters ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Masquer les filtres avancés
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Afficher les filtres avancés
                    </>
                  )}
                </button>
                
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
                  {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} trouvé{filteredArticles.length !== 1 ? 's' : ''}
                  {selectedCategory && <span> dans <span className="font-medium">{selectedCategory}</span></span>}
                  {searchQuery && <span> pour <span className="font-medium">"{searchQuery}"</span></span>}
                </p>
                
                {(selectedCategory || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory(null)
                      setSearchQuery('')
                    }}
                    className="text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
              
              {/* Articles list */}
              {filteredArticles.length > 0 ? (
                <motion.div
                  className="space-y-10"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredArticles.map((article) => (
                    <motion.article
                      key={article.id}
                      variants={itemVariants}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="md:flex">
                        {article.cover && (
                          <div className="md:w-1/3 flex-shrink-0">
                            <Link to={`/blog/${article.id}`} className="block h-full">
                              <img
                                src={article.cover || "/placeholder.svg?height=400&width=600"}
                                alt={article.titre}
                                className="w-full h-64 md:h-full object-cover transition-transform duration-500 hover:scale-105"
                              />
                            </Link>
                          </div>
                        )}
                        <div className="p-6 md:p-8 flex flex-col flex-grow">
                          {article.categorie && (
                            <Link 
                              to={`/blog/category/${article.categorie.toLowerCase()}`}
                              className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full inline-block mb-3 hover:bg-emerald-100 transition-colors"
                            >
                              {article.categorie}
                            </Link>
                          )}
                          
                          <h2 className="text-2xl font-serif font-medium text-gray-800 mb-3 hover:text-emerald-600 transition-colors">
                            <Link to={`/blog/${article.id}`}>{article.titre}</Link>
                          </h2>
                          
                          <div className="flex flex-wrap items-center text-gray-500 text-sm mb-4 gap-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                {new Date(article.date_publication).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              <span>{article.auteur}</span>
                            </div>
                            
                            {article.commentaires_count !== undefined && (
                              <div className="flex items-center">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                <span>{article.commentaires_count} commentaire{article.commentaires_count !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                            
                            {article.temps_lecture && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{article.temps_lecture} min de lecture</span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">{article.contenu}</p>
                          
                          <div className="flex flex-wrap items-center justify-between mt-auto">
                            <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                              {article.tags && article.tags.map(tag => (
                                <Link 
                                  key={tag} 
                                  to={`/blog/tag/${tag}`}
                                  className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Link>
                              ))}
                            </div>
                            
                            <Link to={`/blog/${article.id}`}>
                              <ButtonPrimary className="bg-emerald-600 hover:bg-emerald-500 transition-colors duration-300 text-white font-medium py-2 px-4 rounded-full shadow-sm hover:shadow-md flex items-center">
                                Lire la suite
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </ButtonPrimary>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-600 text-lg mb-2">Aucun article ne correspond à votre recherche.</p>
                  <p className="text-gray-500 mb-6">Essayez d'autres termes ou catégories.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null)
                      setSearchQuery('')
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                  >
                    Voir tous les articles
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

export default ArticlesPage
