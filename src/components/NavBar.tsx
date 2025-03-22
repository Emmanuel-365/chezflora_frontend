"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { getPublicParameters, getUserProfile, getCartCount } from "../services/api"
import { ShoppingCart, User, Menu, X, LogOut, Heart, Package, ChevronDown, Search, Settings, HelpCircle, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

import logo from "../assets/logo.png";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [params, setParams] = useState<{ [key: string]: string }>({})
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Check if user is admin
  const isAdmin = userRole === 'admin'

  // Effect for scroll to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  console.log(params);


  // Effect to fetch user data and parameters
  useEffect(() => {
    const fetchParamsAndUser = async () => {
      try {
        const response = await getPublicParameters()
        const paramData = response.data.reduce(
          (acc: { [key: string]: string }, param: { cle: string; valeur: string }) => {
            acc[param.cle] = param.valeur
            return acc
          },
          {},
        )
        setParams(paramData)

        const token = localStorage.getItem("access_token")
        if (token) {
          const userRes = await getUserProfile()
          setIsAuthenticated(true)
          setUserRole(userRes.data.role)
          setUserName(userRes.data.username)

          // Get cart count
          const count = await getCartCount()
          setCartCount(count)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error)
      }
    }
    
    fetchParamsAndUser()

    // Close menus when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest("[data-menu-toggle]")
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Effect to close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
      setIsSearchFocused(false)
    }
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("access_token")
    setIsAuthenticated(false)
    setUserRole(null)
    setIsUserMenuOpen(false)
    navigate("/")
  }

  // Navigation links
  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "Produits", path: "/products" },
    { name: "Services", path: "/services" },
    { name: "Réalisations", path: "/realisations" },
    { name: "Blog", path: "/blog" },
    { name: "Atelier", path: "/ateliers"},
    { name: "À propos", path: "/about" },
    { name: "Contact", path: "/contact" },
  ]

  // Add admin link if user is admin
  if (isAdmin) {
    navLinks.push({ name: "Administration", path: "/admin" })
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg py-2" 
          : "bg-white/80 backdrop-blur-sm py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group relative z-10">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img src={logo || "/placeholder.svg"} alt="Logo" width={180} className="h-auto" />
            </motion.div>
          </Link>

          {/* Navigation - Desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || 
                (link.path !== "/" && location.pathname.startsWith(link.path));
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
                    isActive 
                      ? "text-emerald-600 bg-emerald-50" 
                      : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/50"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span 
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 mx-3"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}


            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 rounded-full text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 p-2 rounded-full text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium text-sm">
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-10 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm text-gray-500">Connecté en tant que</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{userName ?? 'utilisateur@exemple.com'}</p>
                        {isAdmin && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 mt-1">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Administrateur
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          to="/account"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <User className="h-4 w-4 mr-3 text-gray-400" />
                          Mon compte
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <Package className="h-4 w-4 mr-3 text-gray-400" />
                          Mes commandes
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <Heart className="h-4 w-4 mr-3 text-gray-400" />
                          Ma liste de souhaits
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <Settings className="h-4 w-4 mr-3 text-gray-400" />
                          Paramètres
                        </Link>
                        <Link
                          to="/help"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <HelpCircle className="h-4 w-4 mr-3 text-gray-400" />
                          Aide et support
                        </Link>
                      </div>

                      {isAdmin && (
                        <div className="py-1 border-t border-gray-100">
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                          >
                            <ShieldCheck className="h-4 w-4 mr-3 text-emerald-500" />
                            Panneau d'administration
                          </Link>
                        </div>
                      )}

                      <div className="py-1 border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <LogOut className="h-4 w-4 mr-3 text-gray-400" />
                          Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-500 transition-colors duration-200"
              >
                <User className="h-4 w-4 mr-2" />
                <span>Connexion</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <Link
              to="/cart"
              className="p-2 mr-2 rounded-full text-gray-600 hover:text-emerald-600 transition-colors duration-200 relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            <button
              data-menu-toggle
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Ouvrir le menu</span>
              <AnimatePresence mode="wait" initial={false}>
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="block h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="block h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-white shadow-lg"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSearch} className="relative mx-2 my-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Rechercher des produits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>

              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || 
                  (link.path !== "/" && location.pathname.startsWith(link.path));
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-base font-medium transition-colors duration-200 ${
                      isActive 
                        ? "text-emerald-600 bg-emerald-50" 
                        : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                    {link.path === "/admin" && (
                      <ShieldCheck className="ml-2 h-4 w-4 text-emerald-500" />
                    )}
                  </Link>
                );
              })}

              <div className="pt-4 pb-1 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium">
                        {userName ? userName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">{userName}</p>
                        {isAdmin && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 mt-1">
                            Administrateur
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      to="/account"
                      className="flex items-center px-3 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-3 text-gray-400" />
                      Mon compte
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center px-3 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Package className="h-5 w-5 mr-3 text-gray-400" />
                      Mes commandes
                    </Link>
                    <Link
                      to="/wishlist"
                      className="flex items-center px-3 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart className="h-5 w-5 mr-3 text-gray-400" />
                      Ma liste de souhaits
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-3 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5 mr-3 text-gray-400" />
                      Paramètres
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center w-full px-3 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                    >
                      <LogOut className="h-5 w-5 mr-3 text-gray-400" />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <div className="px-3 py-3">
                    <Link
                      to="/auth"
                      className="flex items-center justify-center w-full px-4 py-2.5 text-base font-medium text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-500 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-2" />
                      Connexion
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default NavBar;