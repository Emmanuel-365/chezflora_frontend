"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, useInView } from "framer-motion"
import { Heart, ShoppingCart, Trash2, Loader2, AlertCircle, ChevronLeft, ArrowRight, Eye } from 'lucide-react'
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import ButtonPrimary from "../components/ButtonPrimary"
import { getWishlist, supprimerProduitWishlist, addToCart, getCart } from "../services/api"

interface Photo {
  image: string
}

interface Produit {
  id: string
  nom: string
  prix: string
  photos: Photo[]
  description?: string
  categorie?: {
    id: number
    nom: string
  }
}

interface Wishlist {
  id: string
  produits: Produit[]
}

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [cartId, setCartId] = useState<string | null>(null)
  const [addToCartLoading, setAddToCartLoading] = useState<string | null>(null)
  
  const navigate = useNavigate()
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true })

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        navigate("/auth", { state: { from: "/wishlist" } })
        return
      }

      try {
        setLoading(true)
        const response = await getWishlist()
        
        // Get cart ID for add to cart functionality
        try {
          const cartResponse = await getCart()
          setCartId(cartResponse.data.id || (cartResponse.data.results && cartResponse.data.results[0]?.id))
        } catch (err) {
          console.error("Error fetching cart:", err)
        }
        
        setWishlist(response.data.results?.length > 0 
          ? response.data.results[0] 
          : { id: "", produits: [] })
        setLoading(false)
      } catch (err: any) {
        console.error("Error loading wishlist:", err.response?.status, err.response?.data)
        setError("Error loading your wishlist.")
        setLoading(false)
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token")
          navigate("/auth", { state: { from: "/wishlist" } })
        }
      }
    }

    fetchWishlist()
  }, [navigate])

  const handleRemoveProduct = async (productId: string) => {
    setActionLoading(productId)
    try {
      await supprimerProduitWishlist(productId)
      
      // Update wishlist after removal
      const response = await getWishlist()
      setWishlist(response.data.results?.length > 0 
        ? response.data.results[0] 
        : { id: "", produits: [] })
      
      // Show success message
      const successMessage = document.createElement("div")
      successMessage.className = "fixed top-4 right-4 bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-md z-50 flex items-center"
      successMessage.innerHTML = `
        <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Product removed from wishlist!</span>
      `
      document.body.appendChild(successMessage)
      
      setTimeout(() => {
        successMessage.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => document.body.removeChild(successMessage), 500)
      }, 3000)
    } catch (err: any) {
      console.error("Error removing product:", err.response?.data)
      
      // Show error message
      const errorMessage = document.createElement("div")
      errorMessage.className = "fixed top-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-md z-50 flex items-center"
      errorMessage.innerHTML = `
        <svg class="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <span>Error removing product: ${err.response?.data?.error || "Please check your connection."}</span>
      `
      document.body.appendChild(errorMessage)
      
      setTimeout(() => {
        errorMessage.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => document.body.removeChild(errorMessage), 500)
      }, 5000)
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddToCart = async (productId: string) => {
    if (!cartId) {
      try {
        const cartResponse = await getCart()
        const newCartId = cartResponse.data.id || (cartResponse.data.results && cartResponse.data.results[0]?.id)
        setCartId(newCartId)
        if (!newCartId) {
          throw new Error("Could not find or create cart")
        }
      } catch (err) {
        console.error("Error getting cart:", err)
        return
      }
    }
    
    setAddToCartLoading(productId)
    try {
      await addToCart(cartId!, { produit_id: productId, quantite: 1 })
      
      // Show success message
      const successMessage = document.createElement("div")
      successMessage.className = "fixed top-4 right-4 bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-md z-50 flex items-center"
      successMessage.innerHTML = `
        <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Product added to cart!</span>
      `
      document.body.appendChild(successMessage)
      
      setTimeout(() => {
        successMessage.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => document.body.removeChild(successMessage), 500)
      }, 3000)
    } catch (err: any) {
      console.error("Error adding to cart:", err.response?.data)
      
      // Show error message
      const errorMessage = document.createElement("div")
      errorMessage.className = "fixed top-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-md z-50 flex items-center"
      errorMessage.innerHTML = `
        <svg class="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <span>Error adding to cart: ${err.response?.data?.error || "Please check your connection."}</span>
      `
      document.body.appendChild(errorMessage)
      
      setTimeout(() => {
        errorMessage.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => document.body.removeChild(errorMessage), 500)
      }, 5000)
    } finally {
      setAddToCartLoading(null)
    }
  }

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

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
      <p className="text-gray-600 animate-pulse">Loading your wishlist...</p>
    </div>
  )

  const renderErrorState = () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md bg-white rounded-xl shadow-md p-8">
        <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-medium text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Try Again
          </button>
          <Link 
            to="/auth" 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )

  const renderEmptyState = () => (
    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart className="h-10 w-10 text-emerald-300" />
      </div>
      <h2 className="text-2xl font-medium text-gray-800 mb-2">Your wishlist is empty</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Save your favorite items to your wishlist so you can easily find them later.
      </p>
      <Link to="/products">
        <ButtonPrimary className="bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center">
          Explore Products
          <ArrowRight className="ml-2 h-4 w-4" />
        </ButtonPrimary>
      </Link>
    </div>
  )

  return (
    <>
      <NavBar />
      <PageContainer>
        {/* Hero Header */}
        <div ref={headerRef} className="relative bg-emerald-50 py-12 mb-8 overflow-hidden">
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
                My Wishlist
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Keep track of all your favorite items in one place. Add them to your cart whenever you're ready.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          {/* Breadcrumb */}
          <nav className="flex mb-8 text-sm text-gray-500">
            <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">Wishlist</span>
          </nav>

          {loading ? (
            renderLoadingState()
          ) : error ? (
            renderErrorState()
          ) : (
            <>
              {wishlist && wishlist.produits.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {wishlist.produits.map((produit) => (
                    <motion.div
                      key={produit.id}
                      variants={itemVariants}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/4 md:w-1/5">
                          <Link to={`/products/${produit.id}`} className="block h-full">
                            <div className="relative h-48 sm:h-full overflow-hidden bg-gray-100">
                              {produit.photos && produit.photos.length > 0 ? (
                                <img
                                  src={produit.photos[0].image || "/placeholder.svg?height=400&width=600"}
                                  alt={produit.nom}
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <span className="text-gray-400">No image available</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                                <div className="bg-white bg-opacity-90 rounded-full p-3">
                                  <Eye className="h-6 w-6 text-emerald-600" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                        
                        <div className="p-6 flex-grow flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="mb-4 sm:mb-0">
                            <Link 
                              to={`/products/${produit.id}`}
                              className="text-xl font-medium text-gray-800 hover:text-emerald-600 transition-colors"
                            >
                              {produit.nom}
                            </Link>
                            {produit.categorie && (
                              <p className="text-sm text-gray-500 mt-1">
                                Category: {produit.categorie.nom}
                              </p>
                            )}
                            {produit.description && (
                              <p className="text-gray-600 mt-2 line-clamp-2">
                                {produit.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex flex-col sm:items-end">
                            <p className="text-lg font-bold text-emerald-600 mb-4">
                              {parseFloat(produit.prix).toFixed(2)} FCFA
                            </p>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleAddToCart(produit.id)}
                                disabled={addToCartLoading === produit.id}
                                className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors disabled:bg-emerald-300"
                              >
                                {addToCartLoading === produit.id ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Add to Cart
                                  </>
                                )}
                              </button>
                              
                              <button
                                onClick={() => handleRemoveProduct(produit.id)}
                                disabled={actionLoading === produit.id}
                                className="flex items-center justify-center p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:bg-red-50 disabled:text-red-300"
                                aria-label="Remove from wishlist"
                              >
                                {actionLoading === produit.id ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                renderEmptyState()
              )}
              
              {/* Back to shopping button */}
              {wishlist && wishlist.produits.length > 0 && (
                <div className="mt-8 flex justify-between items-center">
                  <Link 
                    to="/products" 
                    className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Continue Shopping
                  </Link>
                  
                  <Link to="/cart">
                    <ButtonPrimary className="bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center">
                      View Cart
                      <ShoppingCart className="ml-2 h-4 w-4" />
                    </ButtonPrimary>
                  </Link>
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

export default WishlistPage
