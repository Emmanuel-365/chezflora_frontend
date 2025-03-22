"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { motion, AnimatePresence, useInView } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Loader2,
  AlertCircle,
  Check,
  Star,
  Truck,
  RefreshCw,
  Shield,
} from "lucide-react"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import ProductCard from "../components/ProductCard"
import ButtonPrimary from "../components/ButtonPrimary"
import {
  getProduct,
  getProducts,
  addToCart,
  getCart,
  getWishlist,
  ajouterProduitWishlist,
  supprimerProduitWishlist,
} from "../services/api"

interface Photo {
  id: number
  image: string
}

interface Product {
  id: string
  nom: string
  prix: number
  prix_reduit?: number
  photos: Photo[]
  description: string
  categorie: Category
  stock: number
}

interface Category {
  id: number
  nom?: string
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [cartId, setCartId] = useState<string | null>(null)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cartLoading, setCartLoading] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const navigate = useNavigate()
  const productRef = useRef(null)
  const isProductInView = useInView(productRef, { once: true })
  const relatedRef = useRef(null)
  const isRelatedInView = useInView(relatedRef, { once: true })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Get product details
        const productRes = await getProduct(id!)
        const productData = {
          id: productRes.data.id,
          nom: productRes.data.nom,
          prix: Number.parseFloat(productRes.data.prix),
          prix_reduit: productRes.data.prix_reduit ? Number.parseFloat(productRes.data.prix_reduit) : undefined,
          photos: productRes.data.photos || [],
          description: productRes.data.description || "",
          categorie: productRes.data.categorie,
          stock: productRes.data.stock,
        }
        setProduct(productData)

        // Get related products
        const productsRes = await getProducts({ categorie: productData.categorie })
        const related = productsRes.data.results
          .filter((p: any) => p.id !== id)
          .slice(0, 4)
          .map((p: any) => ({
            id: p.id,
            nom: p.nom,
            prix: Number.parseFloat(p.prix),
            prix_reduit: p.prix_reduit ? Number.parseFloat(p.prix_reduit) : undefined,
            photos: p.photos || [],
            description: p.description || "",
            categorie: p.categorie,
            stock: p.stock,
          }))
        setRelatedProducts(related)

        // Get cart and wishlist
        const token = localStorage.getItem("access_token")
        if (token) {
          try {
            const [cartRes, wishlistRes] = await Promise.all([getCart(), getWishlist()])

            // Cart
            setCartId(cartRes.data.id)

            // Wishlist
            const wishlistData = wishlistRes.data.results
              ? wishlistRes.data.results[0] || { produits: [] }
              : wishlistRes.data.length > 0
                ? wishlistRes.data[0]
                : { produits: [] }
            setIsInWishlist(wishlistData.produits.some((p: { id: string }) => p.id === id))
          } catch (err: any) {
            console.error("Error fetching cart or wishlist:", err)
          }
        }

        setLoading(false)
      } catch (err) {
        setError("Error loading product")
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id])

  const handlePrevPhoto = () => {
    if (product && product.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : product.photos.length - 1))
    }
  }

  const handleNextPhoto = () => {
    if (product && product.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev < product.photos.length - 1 ? prev + 1 : 0))
    }
  }

  const handleQuantityChange = (delta: number) => {
    if (!product) return
    setQuantity((prev) => {
      const newQty = prev + delta
      return newQty > 0 && newQty <= product.stock ? newQty : prev
    })
  }

  const handleAddToCart = async () => {
    if (!product) return
    const token = localStorage.getItem("access_token")
    if (!token) {
      navigate("/auth", { state: { from: `/products/${id}` } })
      return
    }

    setCartLoading(true)
    let currentCartId = cartId
    if (!currentCartId) {
      try {
        const cartRes = await getCart()
        currentCartId = cartRes.data.id
        setCartId(currentCartId)
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token")
          navigate("/auth", { state: { from: `/products/${id}` } })
        } else {
          // Show error message
          const errorMessage = document.createElement("div")
          errorMessage.className =
            "fixed top-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-md z-50 flex items-center"
          errorMessage.innerHTML = `
            <svg class="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <span>Error retrieving cart.</span>
          `
          document.body.appendChild(errorMessage)

          setTimeout(() => {
            errorMessage.classList.add("opacity-0", "transition-opacity", "duration-500")
            setTimeout(() => document.body.removeChild(errorMessage), 500)
          }, 5000)
        }
        setCartLoading(false)
        return
      }
    }

    try {
      await addToCart(currentCartId!, { produit_id: product.id, quantite: quantity })

      // Show success message
      const successMessage = document.createElement("div")
      successMessage.className =
        "fixed top-4 right-4 bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-md z-50 flex items-center"
      successMessage.innerHTML = `
        <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>${quantity} ${product.nom} added to cart!</span>
      `
      document.body.appendChild(successMessage)

      setTimeout(() => {
        successMessage.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => document.body.removeChild(successMessage), 500)
      }, 3000)

      setQuantity(1)
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token")
        navigate("/auth", { state: { from: `/products/${id}` } })
      } else {
        // Show error message
        const errorMessage = document.createElement("div")
        errorMessage.className =
          "fixed top-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-md z-50 flex items-center"
        errorMessage.innerHTML = `
          <svg class="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <span>Error adding to cart.</span>
        `
        document.body.appendChild(errorMessage)

        setTimeout(() => {
          errorMessage.classList.add("opacity-0", "transition-opacity", "duration-500")
          setTimeout(() => document.body.removeChild(errorMessage), 500)
        }, 5000)
      }
    } finally {
      setCartLoading(false)
    }
  }

  const handleToggleWishlist = async () => {
    if (!id) return
    const token = localStorage.getItem("access_token")
    if (!token) {
      navigate("/auth", { state: { from: `/products/${id}` } })
      return
    }

    setWishlistLoading(true)
    try {
      if (isInWishlist) {
        await supprimerProduitWishlist(id)
        setIsInWishlist(false)

        // Show success message
        const successMessage = document.createElement("div")
        successMessage.className =
          "fixed top-4 right-4 bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-md z-50 flex items-center"
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
      } else {
        await ajouterProduitWishlist(id)
        setIsInWishlist(true)

        // Show success message
        const successMessage = document.createElement("div")
        successMessage.className =
          "fixed top-4 right-4 bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-md z-50 flex items-center"
        successMessage.innerHTML = `
          <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Product added to wishlist!</span>
        `
        document.body.appendChild(successMessage)

        setTimeout(() => {
          successMessage.classList.add("opacity-0", "transition-opacity", "duration-500")
          setTimeout(() => document.body.removeChild(successMessage), 500)
        }, 3000)
      }
    } catch (err: any) {
      console.error("Error modifying wishlist:", err.response?.data)
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token")
        navigate("/auth", { state: { from: `/products/${id}` } })
      } else {
        // Show error message
        const errorMessage = document.createElement("div")
        errorMessage.className =
          "fixed top-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-md z-50 flex items-center"
        errorMessage.innerHTML = `
          <svg class="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <span>Error: ${err.response?.data?.error || "Please check your connection."}</span>
        `
        document.body.appendChild(errorMessage)

        setTimeout(() => {
          errorMessage.classList.add("opacity-0", "transition-opacity", "duration-500")
          setTimeout(() => document.body.removeChild(errorMessage), 500)
        }, 5000)
      }
    } finally {
      setWishlistLoading(false)
    }
  }

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
      <p className="text-gray-600 animate-pulse">Loading product details...</p>
    </div>
  )

  const renderErrorState = () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md bg-white rounded-xl shadow-md p-8">
        <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-medium text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-600 mb-4">{error || "Product not found"}</p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <>
        <NavBar />
        <PageContainer>{renderLoadingState()}</PageContainer>
        <Footer />
      </>
    )
  }

  if (error || !product) {
    return (
      <>
        <NavBar />
        <PageContainer>{renderErrorState()}</PageContainer>
        <Footer />
      </>
    )
  }

  const currentPhoto =
    product.photos.length > 0 ? product.photos[currentPhotoIndex].image : "/placeholder.svg?height=600&width=600"
  const discountPercentage =
    product.prix_reduit && product.prix ? Math.round(((product.prix - product.prix_reduit) / product.prix) * 100) : 0

  return (
    <>
      <NavBar />
      <PageContainer>
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="text-sm font-medium text-gray-500 mb-8">
            <ol className="list-none p-0 inline-flex">
              <li className="flex items-center">
                <Link to="/" className="hover:text-emerald-600 transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-4 h-4 mx-2" />
              </li>
              <li className="flex items-center">
                <Link to="/products" className="hover:text-emerald-600 transition-colors">
                  Products
                </Link>
                <ChevronRight className="w-4 h-4 mx-2" />
              </li>
              <li className="text-gray-700">{product.nom}</li>
            </ol>
          </nav>

          {/* Product Details */}
          <div ref={productRef} className="mb-24">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              initial={{ opacity: 0, y: 20 }}
              animate={isProductInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Product Images */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-xl shadow-lg bg-gray-100 aspect-square">
                  <motion.img
                    key={currentPhoto}
                    src={currentPhoto}
                    alt={`${product.nom} - Photo ${currentPhotoIndex + 1}`}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Discount badge */}
                  {discountPercentage > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                      -{discountPercentage}%
                    </div>
                  )}

                  {/* Stock badge */}
                  {product.stock <= 5 && (
                    <div
                      className={`absolute top-4 right-4 ${
                        product.stock > 0 ? "bg-amber-500" : "bg-red-500"
                      } text-white text-sm font-bold px-3 py-1 rounded-full shadow-md`}
                    >
                      {product.stock > 0 ? `Only ${product.stock} left` : "Out of stock"}
                    </div>
                  )}

                  {product.photos.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevPhoto}
                        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full hover:bg-white transition-colors shadow-md"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleNextPhoto}
                        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 text-gray-800 p-2 rounded-full hover:bg-white transition-colors shadow-md"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail navigation */}
                {product.photos.length > 1 && (
                  <div className="mt-4 flex justify-center space-x-2">
                    {product.photos.map((photo, index) => (
                      <button
                        key={photo.id}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                          index === currentPhotoIndex
                            ? "border-emerald-500 shadow-md"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={photo.image || "/placeholder.svg"}
                          alt={`${product.nom} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col">
                <div>
                  {product.categorie && product.categorie.nom && (
                    <Link
                      to={`/products/category/${product.categorie.id}`}
                      className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      {product.categorie.nom}
                    </Link>
                  )}

                  <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-800 mt-2 mb-4">{product.nom}</h1>

                  {/* Rating placeholder - can be replaced with actual ratings */}
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">(12 reviews)</span>
                  </div>

                  <div className="flex items-baseline mb-6">
                    {product.prix_reduit && product.prix_reduit < product.prix ? (
                      <>
                        <span className="text-3xl font-bold text-emerald-600">
                          {product.prix_reduit.toFixed(2)} FCFA
                        </span>
                        <span className="text-xl text-gray-400 line-through ml-4">{product.prix.toFixed(2)} FCFA</span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-gray-800">{product.prix.toFixed(2)} FCFA</span>
                    )}
                  </div>

                  <div className="prose prose-emerald max-w-none mb-8">
                    <p className="text-gray-600">{product.description}</p>
                  </div>

                  {/* Product features */}
                  <div className="mb-8 space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                        <Truck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">Free Shipping</h3>
                        <p className="text-xs text-gray-500">On orders over 10,000 FCFA</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                        <RefreshCw className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">Easy Returns</h3>
                        <p className="text-xs text-gray-500">30-day return policy</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                        <Shield className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">Satisfaction Guaranteed</h3>
                        <p className="text-xs text-gray-500">Or your money back</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add to cart section */}
                <div className="mt-auto">
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center mb-6">
                      <p className="text-gray-700 mr-4">Quantity:</p>
                      <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1 || product.stock === 0}
                          className="p-1 text-gray-600 hover:text-emerald-600 transition-colors disabled:opacity-50 disabled:hover:text-gray-600"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="w-12 text-center text-gray-800 font-medium">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= product.stock || product.stock === 0}
                          className="p-1 text-gray-600 hover:text-emerald-600 transition-colors disabled:opacity-50 disabled:hover:text-gray-600"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-gray-500 ml-4">
                        {product.stock > 0 ? (
                          <span className="flex items-center">
                            <Check className="w-4 h-4 text-emerald-500 mr-1" />
                            In Stock
                          </span>
                        ) : (
                          <span className="text-red-500">Out of Stock</span>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <ButtonPrimary
                        onClick={handleAddToCart}
                        disabled={cartLoading || product.stock === 0}
                        className={`flex-1 flex items-center justify-center text-lg font-medium px-6 py-3 ${
                          cartLoading || product.stock === 0
                            ? "bg-emerald-300 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-500"
                        } transition-colors`}
                      >
                        {cartLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : product.stock === 0 ? (
                          <>
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Out of Stock
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Add to Cart
                          </>
                        )}
                      </ButtonPrimary>

                      <button
                        onClick={handleToggleWishlist}
                        disabled={wishlistLoading}
                        className={`p-3 rounded-lg transition-colors ${
                          wishlistLoading
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : isInWishlist
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        {wishlistLoading ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <Heart className="w-6 h-6" fill={isInWishlist ? "currentColor" : "none"} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div ref={relatedRef} className="mt-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isRelatedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl md:text-3xl font-serif font-medium text-gray-800 mb-8">You May Also Like</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {relatedProducts.map((relatedProduct, index) => (
                      <motion.div
                        key={relatedProduct.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <ProductCard product={relatedProduct} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </PageContainer>
      <Footer />
    </>
  )
}

export default ProductDetailPage

