"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, useInView } from "framer-motion"
import { Trash2, Plus, Minus, ShoppingCart, ChevronLeft, ArrowRight, Loader2, AlertCircle, ShoppingBag } from 'lucide-react'
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import PageContainer from "../components/PageContainer"
import ButtonPrimary from "../components/ButtonPrimary"
import { getCart, updateCartQuantity, removeFromCart } from "../services/api"

interface Photo {
  image: string
}

interface CartItem {
  id: string
  produit: {
    id: string
    nom: string
    prix: number
    prix_reduit?: number
    photos: Photo[]
  }
  quantite: number
}

interface Cart {
  id: string
  items: CartItem[]
  total: string
}

const CartPage = () => {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const navigate = useNavigate()
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true })

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        navigate("/auth", { state: { from: "/cart" } })
        return
      }
      setCheckoutLoading(false)

      try {
        setLoading(true)
        const response = await getCart()
        setCart(response.data)
        setLoading(false)
      } catch (err: any) {
        console.error("Error loading cart:", err.response?.status, err.response?.data)
        setError("Error loading your cart.")
        setLoading(false)
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token")
          navigate("/auth", { state: { from: "/cart" } })
        }
      }
    }

    fetchCart()
  }, [navigate])

  const handleQuantityChange = async (itemId: string, productId: string, delta: number) => {
    if (!cart) return
    const item = cart.items.find((i) => i.id === itemId)
    if (!item) return

    const newQuantity = item.quantite + delta
    if (newQuantity <= 0) return

    setActionLoading(itemId)
    try {
      await updateCartQuantity(cart.id, { produit_id: productId, quantite: newQuantity })
      const response = await getCart()
      setCart(response.data)
    } catch (err) {
      console.error("Error updating quantity:", err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveItem = async (productId: string, itemId: string) => {
    if (!cart) return
    
    setActionLoading(itemId)
    try {
      await removeFromCart(cart.id, { produit_id: productId })
      const response = await getCart()
      setCart(response.data)
      
      // Show success message
      const successMessage = document.createElement("div")
      successMessage.className = "fixed top-4 right-4 bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-md z-50 flex items-center"
      successMessage.innerHTML = `
        <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Item removed from cart!</span>
      `
      document.body.appendChild(successMessage)
      
      setTimeout(() => {
        successMessage.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => document.body.removeChild(successMessage), 500)
      }, 3000)
    } catch (err) {
      console.error("Error removing product:", err)
    } finally {
      setActionLoading(null)
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
      <p className="text-gray-600 animate-pulse">Loading your cart...</p>
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
        <ShoppingCart className="h-10 w-10 text-emerald-300" />
      </div>
      <h2 className="text-2xl font-medium text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Looks like you haven't added any products to your cart yet.
      </p>
      <Link to="/products">
        <ButtonPrimary className="bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center">
          Browse Products
          <ShoppingBag className="ml-2 h-4 w-4" />
        </ButtonPrimary>
      </Link>
    </div>
  )

  // Calculate subtotal and total
  const calculateSubtotal = () => {
    if (!cart || !cart.items.length) return 0
    
    return cart.items.reduce((total, item) => {
      const price = item.produit.prix_reduit || item.produit.prix
      return total + (price * item.quantite)
    }, 0)
  }

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
                Votre Panier
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                revoyez vos produits, ajuster les quantités, ou procédez au payement
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          {/* Breadcrumb */}
          <nav className="flex mb-8 text-sm text-gray-500">
            <Link to="/" className="hover:text-emerald-600 transition-colors">Accueil</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">Panier</span>
          </nav>

          {loading ? (
            renderLoadingState()
          ) : error ? (
            renderErrorState()
          ) : (
            <>
              {cart && cart.items.length > 0 ? (
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                  {/* Cart Items */}
                  <div className="lg:col-span-8">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 lg:mb-0">
                      <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-medium text-gray-800">Shopping Cart ({cart.items.length} items)</h2>
                      </div>
                      
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="divide-y divide-gray-100"
                      >
                        {cart.items.map((item) => (
                          <motion.div
                            key={item.id}
                            variants={itemVariants}
                            className="p-6 flex flex-col sm:flex-row items-start sm:items-center"
                          >
                            <Link to={`/products/${item.produit.id}`} className="sm:w-20 sm:h-20 mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                              <img
                                src={item.produit.photos[0]?.image || "/placeholder.svg?height=80&width=80"}
                                alt={item.produit.nom}
                                className="w-full h-full object-cover rounded-md"
                              />
                            </Link>
                            
                            <div className="flex-grow">
                              <Link 
                                to={`/products/${item.produit.id}`}
                                className="text-lg font-medium text-gray-800 hover:text-emerald-600 transition-colors"
                              >
                                {item.produit.nom}
                              </Link>
                              
                              <div className="flex flex-wrap items-center justify-between mt-2">
                                <div className="flex items-center mt-2 sm:mt-0">
                                  <button
                                    onClick={() => handleQuantityChange(item.id, item.produit.id, -1)}
                                    disabled={item.quantite <= 1 || actionLoading === item.id}
                                    className="p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-10 text-center text-gray-800 font-medium">
                                    {actionLoading === item.id ? (
                                      <Loader2 className="w-4 h-4 mx-auto animate-spin" />
                                    ) : (
                                      item.quantite
                                    )}
                                  </span>
                                  <button
                                    onClick={() => handleQuantityChange(item.id, item.produit.id, 1)}
                                    disabled={actionLoading === item.id}
                                    className="p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                
                                <div className="mt-2 sm:mt-0 flex items-center">
                                  <div className="text-right">
                                    {item.produit.prix_reduit ? (
                                      <>
                                        <span className="text-emerald-600 font-bold">
                                          {(item.produit.prix_reduit * item.quantite).toFixed(2)} FCFA
                                        </span>
                                        <span className="text-gray-400 line-through text-sm ml-2">
                                          {(item.produit.prix * item.quantite).toFixed(2)} FCFA
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-gray-800 font-bold">
                                        {(item.produit.prix * item.quantite).toFixed(2)} FCFA
                                      </span>
                                    )}
                                  </div>
                                  
                                  <button
                                    onClick={() => handleRemoveItem(item.produit.id, item.id)}
                                    disabled={actionLoading === item.id}
                                    className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    aria-label="Remove item"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Order Summary */}
                  <div className="lg:col-span-4">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24">
                      <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-medium text-gray-800">Résumé de commande</h2>
                      </div>
                      
                      <div className="p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-800 font-medium">{calculateSubtotal().toFixed(2)} FCFA</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping</span>
                            <span className="text-gray-800 font-medium">Calculated at checkout</span>
                          </div>
                          <div className="border-t border-gray-100 pt-4 flex justify-between">
                            <span className="text-gray-800 font-medium">Total</span>
                            <span className="text-emerald-600 font-bold text-xl">{cart.total} FCFA</span>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <ButtonPrimary
                            onClick={() => navigate("/checkout")}
                            disabled={checkoutLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 transition-colors py-3 flex items-center justify-center"
                          >
                            {checkoutLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                Proceed to Checkout
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </ButtonPrimary>
                          
                          <Link 
                            to="/products" 
                            className="flex items-center justify-center mt-4 text-emerald-600 hover:text-emerald-700 transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Continue Shopping
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                renderEmptyState()
              )}
            </>
          )}
        </div>
      </PageContainer>
      <Footer />
    </>
  )
}

export default CartPage
