"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import ProductCard from "../components/ProductCard"
import ButtonPrimary from "../components/ButtonPrimary"
import TextFieldCustom from "../components/TextFieldCustom"
import LoadingSpinner from "../components/LoadingSpinner"
import { Search, X } from "lucide-react"
import { getProducts, getCategories } from "../services/api"

interface Product {
  id: string
  nom: string
  prix: number
  prix_reduit?: number
  photos: string[]
  description: string
  categorie: number
}

interface Category {
  id: number
  nom: string
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | "">("")
  const [showPromotionsOnly, setShowPromotionsOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          })),
        )
        setCategories([{ id: -1, nom: "Toutes" }, ...categoriesRes.data.results]) // Ajout "Toutes" comme option
        setLoading(false)
      } catch (err) {
        setError("Erreur lors du chargement des produits")
        setLoading(false)
      }
    }

    fetchData()
  }, [])
  console.log(products)

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nom.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "" || selectedCategory === -1 || product.categorie.id === selectedCategory
    const matchesPromotion = !showPromotionsOnly || product.prix_reduit !== product.prix
    return matchesSearch && matchesCategory && matchesPromotion
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-powder-pink text-xl mb-4">{error}</p>
        <ButtonPrimary onClick={() => window.location.reload()}>Réessayer</ButtonPrimary>
      </div>
    )
  }

  return (
    <>
      <NavBar />
      <PageContainer>
        {/* En-tête */}
        <div className="relative h-64 bg-soft-green overflow-hidden">
          <img
            src="/images/products-header.jpg"
            alt="Produits floraux"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-soft-green/80 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.h1
              className="text-5xl font-serif font-medium text-white text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Nos créations florales
            </motion.h1>
          </div>
        </div>

        <div className=" mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Barre de filtres */}
          <motion.div
            className="bg-white p-4 rounded-xl shadow-lg mb-12 sticky top-4 z-10 border border-soft-brown/20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            id="searchSection"
          >
            <div className="flex flex-col space-y-4">
              {/* Première ligne: Recherche et réinitialisation */}
              <div className="flex items-center gap-3">
                {/* Recherche */}
                <div className="flex-grow relative">
                  <TextFieldCustom
                    id="search"
                    label="Rechercher"
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Rechercher un produit..."
                    icon={<Search className="w-5 h-5 text-soft-brown/60" />}
                  />

                  {/* Bouton de réinitialisation intégré */}
                  {(searchQuery || selectedCategory !== "" || showPromotionsOnly) && (
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-powder-pink/10 hover:bg-powder-pink/20 text-powder-pink transition-colors duration-200"
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCategory("")
                        setShowPromotionsOnly(false)
                      }}
                      title="Réinitialiser tous les filtres"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Deuxième ligne: Filtres de catégories et checkbox */}
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

              {/* Indicateur de filtres actifs */}
              {(searchQuery || selectedCategory !== "" || showPromotionsOnly) && (
                <div className="flex items-center pt-1">
                  <p className="text-xs text-soft-brown/60 italic">
                    Filtres actifs:
                    {searchQuery && <span className="ml-1">Recherche</span>}
                    {selectedCategory !== "" && <span className="ml-1">Catégorie</span>}
                    {showPromotionsOnly && <span className="ml-1">Promotions</span>}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Grille de produits */}
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" layout>
            <AnimatePresence>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    layoutId={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))
              ) : (
                <motion.p
                  className="text-center text-soft-brown/70 col-span-full text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Aucun produit ne correspond à vos critères.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </PageContainer>
      <Footer />
    </>
  )
}

export default ProductsPage

