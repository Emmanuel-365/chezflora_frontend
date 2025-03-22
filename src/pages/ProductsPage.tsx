"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Filter } from "lucide-react"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import ProductCard from "../components/ProductCard"
import ButtonPrimary from "../components/ButtonPrimary"
import TextFieldCustom from "../components/TextFieldCustom"
import LoadingSpinner from "../components/LoadingSpinner"
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

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | "">("")
  const [showPromotionsOnly, setShowPromotionsOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(true)

  // Fetch data with better error handling
  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchData = async () => {
      try {
        setLoading(true)
        const [productsRes, categoriesRes] = await Promise.all([
          getProducts(controller.signal),
          getCategories(controller.signal),
        ])

        if (!isMounted) return

        setProducts(
          productsRes.data.results.map((p: any) => ({
            id: p.id,
            nom: p.nom,
            prix: Number.parseFloat(p.prix),
            prix_reduit: p.prix_reduit ? Number.parseFloat(p.prix_reduit) : undefined,
            photos: p.photos || [],
            description: p.description || "",
            categorie: p.categorie,
          })),
        )
        setCategories([{ id: -1, nom: "Toutes" }, ...categoriesRes.data.results])
      } catch (err) {
        if (!isMounted) return
        setError("Erreur lors du chargement des produits")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  // Memoize filtered products to avoid unnecessary recalculations
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.nom.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === "" || selectedCategory === -1 || product.categorie.id === selectedCategory
      const matchesPromotion =
        !showPromotionsOnly || (product.prix_reduit !== undefined && product.prix_reduit < product.prix)
      return matchesSearch && matchesCategory && matchesPromotion
    })
  }, [products, searchQuery, selectedCategory, showPromotionsOnly])

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setShowPromotionsOnly(false)
  }

  const hasActiveFilters = searchQuery || selectedCategory !== "" || showPromotionsOnly

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="flex flex-col justify-center items-center h-[70vh]">
          <LoadingSpinner />
          <p className="mt-4 text-soft-brown/70 animate-pulse">Chargement des produits...</p>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-powder-pink text-xl mb-4">{error}</p>
            <ButtonPrimary onClick={() => window.location.reload()}>Réessayer</ButtonPrimary>
          </motion.div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <NavBar />
      <PageContainer>
        {/* Hero Header with Parallax Effect */}
        <motion.div
          className="relative h-64 sm:h-80 bg-soft-green overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <img
              src="/images/products-header.jpg"
              alt="Produits floraux"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-soft-green/80 to-transparent" />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.h1
              className="text-4xl sm:text-5xl font-serif font-medium text-white text-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Nos créations florales
            </motion.h1>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          {/* Filters Section */}
          <motion.div
            className="bg-white p-4 rounded-xl shadow-lg mb-8 sm:mb-12 sticky top-4 z-10 border border-soft-brown/20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            id="searchSection"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-soft-brown font-medium">Filtrer les produits</h2>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-2 rounded-full hover:bg-light-beige transition-colors duration-200"
                aria-expanded={isFilterOpen}
                aria-label={isFilterOpen ? "Masquer les filtres" : "Afficher les filtres"}
              >
                <Filter
                  className={`w-5 h-5 text-soft-brown transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  className="flex flex-col space-y-4"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Search Field */}
                  <div className="flex items-center gap-3">
                    <div className="flex-grow relative">
                      <TextFieldCustom
                        id="search"
                        label="Rechercher"
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Rechercher un produit..."
                        icon={<Search className="w-5 h-5 text-soft-brown/60" />}
                      />

                      {/* Reset button */}
                      <AnimatePresence>
                        {hasActiveFilters && (
                          <motion.button
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-powder-pink/10 hover:bg-powder-pink/20 text-powder-pink transition-colors duration-200"
                            onClick={resetFilters}
                            title="Réinitialiser tous les filtres"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Category Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex flex-wrap gap-2 flex-grow">
                      {categories.map((category) => (
                        <motion.button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id === -1 ? "" : category.id)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            selectedCategory === (category.id === -1 ? "" : category.id)
                              ? "bg-soft-green text-white shadow-md"
                              : "bg-light-beige text-soft-brown hover:bg-soft-green/20"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {category.nom}
                        </motion.button>
                      ))}
                    </div>

                    <motion.div
                      className="flex items-center ml-auto bg-light-beige px-3 py-2 rounded-full"
                      whileHover={{ scale: 1.05 }}
                    >
                      <input
                        type="checkbox"
                        checked={showPromotionsOnly}
                        onChange={(e) => setShowPromotionsOnly(e.target.checked)}
                        className="h-5 w-5 text-soft-green border-soft-brown/30 rounded focus:ring-soft-green mr-2"
                        id="promotions-only"
                      />
                      <label htmlFor="promotions-only" className="text-soft-brown text-sm whitespace-nowrap">
                        En promotion
                      </label>
                    </motion.div>
                  </div>

                  {/* Active Filters Indicator */}
                  <AnimatePresence>
                    {hasActiveFilters && (
                      <motion.div
                        className="flex items-center pt-1"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <p className="text-xs text-soft-brown/60 italic">
                          Filtres actifs:
                          {searchQuery && (
                            <span className="ml-1 bg-soft-green/10 text-soft-green px-2 py-0.5 rounded-full text-xs">
                              Recherche
                            </span>
                          )}
                          {selectedCategory !== "" && (
                            <span className="ml-1 bg-soft-green/10 text-soft-green px-2 py-0.5 rounded-full text-xs">
                              Catégorie
                            </span>
                          )}
                          {showPromotionsOnly && (
                            <span className="ml-1 bg-soft-green/10 text-soft-green px-2 py-0.5 rounded-full text-xs">
                              Promotions
                            </span>
                          )}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Summary */}
          <motion.div
            className="mb-6 flex justify-between items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-soft-brown">
              {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""} trouvé
              {filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </motion.div>

          {/* Products Grid with Staggered Animation */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      layout: { type: "spring", damping: 25, stiffness: 120 },
                    }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className="col-span-full py-16 flex flex-col items-center justify-center"
                  {...fadeIn}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-center text-soft-brown/70 text-lg mb-4">
                    Aucun produit ne correspond à vos critères.
                  </p>
                  <ButtonPrimary onClick={resetFilters}>Réinitialiser les filtres</ButtonPrimary>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Back to Top Button */}
          <motion.div
            className="fixed bottom-6 right-6 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="bg-soft-green text-white p-3 rounded-full shadow-lg hover:bg-soft-green/90 transition-colors duration-300"
              aria-label="Retour en haut"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </motion.div>
        </div>
      </PageContainer>
      <Footer />
    </>
  )
}

export default ProductsPage

