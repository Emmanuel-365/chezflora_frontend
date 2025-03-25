"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import ButtonPrimary from "../components/ButtonPrimary"
import { getArticle, createCommentaire, getUserProfile } from "../services/api"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Clock,
  MessageCircle,
  Send,
  Share2,
  ChevronLeft,
  User,
  ThumbsUp,
  Reply,
  MoreHorizontal,
  Bookmark,
  AlertCircle,
  Loader2,
} from "lucide-react"

interface Commentaire {
  id: string
  client: string
  texte: string
  date: string
  reponses: Commentaire[]
}

interface Article {
  id: string
  titre: string
  contenu: string
  cover: string | null
  auteur: string
  date_publication: string
  commentaires?: Commentaire[]
}

const MAX_COMMENT_LENGTH = 500
const MAX_WORD_LENGTH = 50 // Limite pour un mot individuel sans espace

// Fonction pour générer une couleur basée sur une chaîne
const stringToColor = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = "#"
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ("00" + value.toString(16)).substr(-2)
  }
  return color
}

// Fonction pour obtenir les initiales d'un nom
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

// Fonction pour formater la date relative
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "à l'instant"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

// Fonction pour estimer le temps de lecture
const estimateReadingTime = (content: string) => {
  const wordsPerMinute = 200
  const textOnly = content.replace(/<[^>]*>/g, "")
  const wordCount = textOnly.split(/\s+/).length
  const readingTime = Math.ceil(wordCount / wordsPerMinute)
  return readingTime
}

// Fonction pour vérifier la longueur des mots individuels
const hasOverlyLongWord = (text: string) => {
  const words = text.split(/\s+/)
  return words.some((word) => word.length > MAX_WORD_LENGTH)
}

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const commentSectionRef = useRef<HTMLDivElement>(null)

  const [article, setArticle] = useState<Article | null>(null)
  const [commentText, setCommentText] = useState("")
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({})
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [openReplyId, setOpenReplyId] = useState<string | null>(null)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
  const [bookmarked, setBookmarked] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const articleResponse = await getArticle(id!)
        setArticle(articleResponse.data)

        const token = localStorage.getItem("access_token")
        if (token) {
          await getUserProfile()
          setIsAuthenticated(true)
        }
        setLoading(false)
      } catch (err: any) {
        console.error("Erreur lors du chargement:", err.response?.status, err.response?.data)
        setError("Erreur lors du chargement de l'article.")
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleCommentSubmit = async () => {
    if (!isAuthenticated) {
      navigate("/auth")
      return
    }
    if (!commentText.trim()) {
      alert("Veuillez entrer un commentaire.")
      return
    }
    if (commentText.length > MAX_COMMENT_LENGTH) {
      alert(`Le commentaire ne peut pas dépasser ${MAX_COMMENT_LENGTH} caractères.`)
      return
    }
    if (hasOverlyLongWord(commentText)) {
      alert(`Aucun mot ne peut dépasser ${MAX_WORD_LENGTH} caractères sans espace.`)
      return
    }

    setSubmitting(true)
    try {
      await createCommentaire({ article: id!, texte: commentText })
      const updatedArticle = await getArticle(id!)
      setArticle(updatedArticle.data)
      setCommentText("")
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)

      if (commentSectionRef.current) {
        commentSectionRef.current.scrollIntoView({ behavior: "smooth" })
      }
    } catch (err: any) {
      console.error("Erreur lors de l'ajout du commentaire:", err.response?.data)
      alert("Erreur lors de l'ajout du commentaire.")
    } finally {
      setSubmitting(false)
    }
  }

  const toggleCommentExpand = (commentId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const handleReplySubmit = async (parentId: string) => {
    if (!isAuthenticated) {
      navigate("/auth")
      return
    }
    const reply = replyText[parentId]?.trim()
    if (!reply) {
      alert("Veuillez entrer une réponse.")
      return
    }
    if (reply.length > MAX_COMMENT_LENGTH) {
      alert(`La réponse ne peut pas dépasser ${MAX_COMMENT_LENGTH} caractères.`)
      return
    }
    if (hasOverlyLongWord(reply)) {
      alert(`Aucun mot ne peut dépasser ${MAX_WORD_LENGTH} caractères sans espace.`)
      return
    }

    setSubmitting(true)
    try {
      await createCommentaire({ article: id!, texte: reply, parent: parentId })
      const updatedArticle = await getArticle(id!)
      setArticle(updatedArticle.data)
      setReplyText((prev) => ({ ...prev, [parentId]: "" }))
      setOpenReplyId(null)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    } catch (err: any) {
      console.error("Erreur lors de l'ajout de la réponse:", err.response?.data)
      alert("Erreur lors de l'ajout de la réponse.")
    } finally {
      setSubmitting(false)
    }
  }

  const toggleLike = (commentId: string) => {
    setLikedComments((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const toggleBookmark = () => {
    setBookmarked(!bookmarked)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.titre || "Article",
        text: "Découvrez cet article intéressant !",
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Lien copié dans le presse-papiers !")
    }
  }

  const renderCommentAvatar = (name: string) => {
    const bgColor = stringToColor(name)
    return (
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
        style={{ backgroundColor: bgColor }}
      >
        {getInitials(name)}
      </div>
    )
  }

  const renderComments = (commentaires: Commentaire[], level = 0) => (
    <div className={`space-y-6 ${level > 0 ? "pl-6 md:pl-12 border-l-2 border-emerald-100 max-w-4xl" : ""}`}>
      {commentaires.map((comment) => {
        const isExpanded = expandedComments.has(comment.id)
        const hasReplies = comment.reponses.length > 0

        return (
          <div key={comment.id} className="relative">
            <div className="flex items-start gap-4">
              {renderCommentAvatar(comment.client)}
              <div className="flex-1 bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">{comment.client}</h4>
                    <p className="text-gray-500 text-xs">{formatRelativeTime(comment.date)}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
                {/* Mise à jour pour gérer les longues chaînes sans espaces */}
                <p className="mt-2 text-gray-700 break-all">{comment.texte}</p>
                <div className="mt-3 flex items-center gap-4">
                  <button
                    onClick={() => isAuthenticated && toggleLike(comment.id)}
                    className={`flex items-center gap-1 text-xs ${likedComments.has(comment.id) ? "text-emerald-600" : "text-gray-500"} hover:text-emerald-600 transition-colors`}
                  >
                    <ThumbsUp size={14} />
                    <span>{likedComments.has(comment.id) ? "Aimé" : "J'aime"}</span>
                  </button>
                  <button
                    onClick={() => isAuthenticated && setOpenReplyId(openReplyId === comment.id ? null : comment.id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-600 transition-colors"
                  >
                    <Reply size={14} />
                    <span>Répondre</span>
                  </button>
                  {hasReplies && (
                    <button
                      onClick={() => toggleCommentExpand(comment.id)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-600 transition-colors"
                    >
                      <span>
                        {isExpanded ? "Masquer" : "Afficher"} {comment.reponses.length} réponse
                        {comment.reponses.length > 1 ? "s" : ""}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {openReplyId === comment.id && isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-14 mt-3"
                >
                  <div className="bg-gray-50 rounded-lg p-3">
                    <textarea
                      value={replyText[comment.id] || ""}
                      onChange={(e) => setReplyText((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                      placeholder="Écrire une réponse..."
                      className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-700 text-sm break-all"
                      rows={3}
                      maxLength={MAX_COMMENT_LENGTH}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        {replyText[comment.id]?.length || 0}/{MAX_COMMENT_LENGTH}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setOpenReplyId(null)}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 rounded-md"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleReplySubmit(comment.id)}
                          disabled={submitting}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1"
                        >
                          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          <span>Répondre</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {hasReplies && (
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    {renderComments(comment.reponses, Math.min(level + 1, 3))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        )
      })}
    </div>
  )

  if (loading) {
    return (
      <>
        <NavBar />
        <PageContainer>
          <div className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
            <Loader2 size={40} className="text-emerald-600 animate-spin mb-4" />
            <p className="text-gray-600">Chargement de l'article...</p>
          </div>
        </PageContainer>
        <Footer />
      </>
    )
  }

  if (error || !article) {
    return (
      <>
        <NavBar />
        <PageContainer>
          <div className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-red-50 p-6 rounded-lg inline-flex flex-col items-center">
              <AlertCircle size={40} className="text-red-500 mb-4" />
              <h2 className="text-xl font-medium text-gray-800 mb-2">Oups !</h2>
              <p className="text-gray-600 mb-4">{error || "Article non trouvé"}</p>
              <Link to="/articles">
                <ButtonPrimary className="bg-emerald-600 hover:bg-emerald-700">Retour aux articles</ButtonPrimary>
              </Link>
            </div>
          </div>
        </PageContainer>
        <Footer />
      </>
    )
  }

  const readingTime = estimateReadingTime(article.contenu)

  return (
    <>
      <NavBar />

      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-md flex items-center"
          >
            <ThumbsUp className="w-5 h-5 mr-2 text-emerald-600" />
            <span>Votre message a été publié avec succès !</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-emerald-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl">
            <Link
              to="/articles"
              className="inline-flex items-center text-emerald-100 hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft size={16} className="mr-1" />
              <span>Retour aux articles</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif font-medium mb-4">{article.titre}</h1>
            <div className="flex flex-wrap items-center gap-4 text-emerald-100">
              <div className="flex items-center">
                <Calendar size={16} className="mr-1.5" />
                <span>
                  {new Date(article.date_publication).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <User size={16} className="mr-1.5" />
                <span>{article.auteur || "Anonyme"}</span>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-1.5" />
                <span>{readingTime} min de lecture</span>
              </div>
              <div className="flex items-center">
                <MessageCircle size={16} className="mr-1.5" />
                <span>
                  {article.commentaires?.length || 0} commentaire{(article.commentaires?.length || 0) > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PageContainer>
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {article.cover && (
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={article.cover || "/placeholder.svg"}
                      alt={article.titre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6 md:p-8">
                  <div
                    className="prose prose-emerald prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: article.contenu }}
                  />

                  <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex gap-4">
                      <button
                        onClick={handleShare}
                        className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 transition-colors"
                      >
                        <Share2 size={18} />
                        <span>Partager</span>
                      </button>
                      <button
                        onClick={toggleBookmark}
                        className={`flex items-center gap-1.5 ${bookmarked ? "text-emerald-600" : "text-gray-600 hover:text-emerald-600"} transition-colors`}
                      >
                        <Bookmark size={18} className={bookmarked ? "fill-emerald-600" : ""} />
                        <span>{bookmarked ? "Enregistré" : "Enregistrer"}</span>
                      </button>
                    </div>
                    <Link to="/articles" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                      Plus d'articles
                    </Link>
                  </div>
                </div>
              </motion.div>

              <div ref={commentSectionRef} className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif font-medium text-gray-800">
                    Commentaires ({article.commentaires?.length || 0})
                  </h2>
                </div>

                {isAuthenticated ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl shadow-sm p-6 mb-8"
                  >
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Ajouter un commentaire</h3>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Partagez votre avis sur cet article..."
                      className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 text-gray-700 break-all"
                      rows={4}
                      maxLength={MAX_COMMENT_LENGTH}
                    />
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs text-gray-500">
                        {commentText.length}/{MAX_COMMENT_LENGTH}
                      </span>
                      <ButtonPrimary
                        onClick={handleCommentSubmit}
                        disabled={submitting}
                        className="bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-2"
                      >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        Publier
                      </ButtonPrimary>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 text-center">
                    <p className="text-gray-600 mb-4">Connectez-vous pour participer à la discussion</p>
                    <Link to="/auth">
                      <ButtonPrimary className="bg-emerald-600 hover:bg-emerald-700">Se connecter</ButtonPrimary>
                    </Link>
                  </div>
                )}

                {article.commentaires && article.commentaires.length > 0 ? (
                  renderComments(article.commentaires)
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <MessageCircle size={40} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Aucun commentaire pour le moment</p>
                    <p className="text-gray-400 text-sm">Soyez le premier à partager votre avis !</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  )
}

export default ArticleDetailPage