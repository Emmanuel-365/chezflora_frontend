"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import ProductCard from "../components/ProductCard"
import ButtonPrimary from "../components/ButtonPrimary"
import TextFieldCustom from "../components/TextFieldCustom"
import LoadingSpinner from "../components/LoadingSpinner"
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import { getProducts, getCategories } from "../services/api"

interface Product {
  id: string
  nom: string
  prix: number
  prix_reduit?: number
  photos: Photo[]
  description: string
  categorie: Category
}

interface Photo {
  image: string
}

interface Category {
  id: number
  nom: string
}

const PRODUCTS_PER_PAGE = 8

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | "">("")
  const [showPromotionsOnly, setShowPromotionsOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([getProducts(), getCategories()])
        setProducts(
          productsRes.data.results.map((p: any) => ({
            id: p.id,
            nom: p.nom,
            prix: Number.parseFloat(p.prix),
            prix_reduit: p.prix_reduit ? Number.parseFloat(p.prix_reduit) : undefined,
            photos: p.photos || [],
            description: p.description || "",
            categorie: p.categorie,
          }))
        )
        setCategories([{ id: -1, nom: "Toutes" }, ...categoriesRes.data.results])
        setLoading(false)
      } catch (err) {
        setError("Erreur lors du chargement des produits")
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nom.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "" || selectedCategory === -1 || product.categorie.id === selectedCategory
    const matchesPromotion = !showPromotionsOnly || product.prix_reduit !== undefined
    return matchesSearch && matchesCategory && matchesPromotion
  })

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-soft-green/10 to-white">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-soft-green/10 to-white">
        <p className="text-powder-pink text-xl mb-6 font-medium">{error}</p>
        <ButtonPrimary onClick={() => window.location.reload()}>Réessayer</ButtonPrimary>
      </div>
    )
  }

  return (
    <>
      <NavBar />
      <PageContainer>
        {/* En-tête amélioré */}
        <div className="relative h-72 bg-gradient-to-br from-soft-green to-powder-pink overflow-hidden rounded-b-3xl shadow-lg">
          <img
            src="/images/products-header.jpg"
            alt="Produits floraux"
            className="w-full h-full object-cover mix-blend-overlay opacity-40"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.h1
              className="text-5xl md:text-6xl font-serif text-white text-center drop-shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              Nos créations florales
            </motion.h1>
          </div>
        </div>

        <div className="py-12 px-4 sm:px-6 lg:px-8 flex gap-8">
          {/* Barre de filtres latérale */}
          <motion.div
            className="w-72 flex-shrink-0 bg-white p-6 rounded-2xl shadow-md border border-soft-brown/10 sticky top-24 h-fit"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl font-serif text-soft-brown mb-6">Filtres</h2>

            {/* Recherche */}
            <div className="relative mb-6">
              <TextFieldCustom
                id="search"
                label="Rechercher"
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher..."
                icon={<Search className="w-5 h-5 text-soft-brown/50" />}
              />
              {searchQuery && (
                <motion.button
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-powder-pink hover:text-soft-brown transition-colors"
                  onClick={() => setSearchQuery("")}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            {/* Catégories */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-soft-brown/80 mb-3">Catégories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id === -1 ? "" : category.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                      selectedCategory === (category.id === -1 ? "" : category.id)
                        ? "bg-soft-green text-white"
                        : "text-soft-brown hover:bg-soft-green/10"
                    }`}
                    whileHover={{ x: 5 }}
                  >
                    {category.nom}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Promotions */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={showPromotionsOnly}
                onChange={(e) => setShowPromotionsOnly(e.target.checked)}
                className="h-5 w-5 text-soft-green border-soft-brown/20 rounded focus:ring-soft-green"
                id="promotions-only"
              />
              <label htmlFor="promotions-only" className="text-soft-brown text-sm">
                Promotions uniquement
              </label>
            </div>

            {/* Bouton de réinitialisation */}
            {(searchQuery || selectedCategory !== "" || showPromotionsOnly) && (
              <motion.button
                className="mt-6 w-full py-2 text-sm text-powder-pink hover:text-soft-brown transition-colors"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("")
                  setShowPromotionsOnly(false)
                }}
                whileHover={{ scale: 1.02 }}
              >
                Réinitialiser les filtres
              </motion.button>
            )}
          </motion.div>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Grille de produits */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" layout>
              <AnimatePresence>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      layoutId={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))
                ) : (
                  <motion.p
                    className="text-center text-soft-brown/70 col-span-full text-lg py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    Aucun produit ne correspond à vos critères.
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <motion.button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full bg-soft-green/10 text-soft-brown disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <motion.button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-full text-sm font-medium ${
                        currentPage === page
                          ? "bg-soft-green text-white"
                          : "bg-light-beige text-soft-brown hover:bg-soft-green/20"
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {page}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full bg-soft-green/10 text-soft-brown disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  )
}

export default ProductsPage;