"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getPublicParameters, getUserProfile, getCartCount } from "../services/api"
import {ShoppingCart, User, Menu, X, LogOut, Heart, Package, ChevronDown, Search } from "lucide-react"
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
  const navigate = useNavigate()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Effet de scroll pour changer l'apparence de la navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

          // recuperer le nombre de produits dans le panier d'un utilisateur 

          setCartCount(await getCartCount())
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error)
      }
    }
    fetchParamsAndUser()

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

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    setIsAuthenticated(false)
    setUserRole(null)
    setIsUserMenuOpen(false)
    navigate("/")
  }

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


  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-lg" : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
              <img src={logo} alt="Logo" width={200}/>
          </Link>

          {/* Navigation - Desktop */}
          <div className="hidden lg:flex items-center justify-center flex-1 max-w-3xl mx-8">
            <div className="flex space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors duration-200 group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </Link>
              ))}
            </div>
          </div>

          {/* Actions - Desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link 
              key={"/products#searchSection"}
              to={"/products"}
              className="p-2 rounded-full text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200">
              <Search className="h-5 w-5" />
            </Link>

            <Link
              to="/cart"
              className="p-2 rounded-full text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 p-2 rounded-full text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <User className="h-5 w-5" />
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-10 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm text-gray-500">Connecté en tant que</p>
                        <p className="text-sm font-medium text-gray-800 truncate"> {userName ?? 'utilisateur@exemple.com' } </p>
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
                      </div>

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
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              data-menu-toggle
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
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
              <div className="relative mx-2 my-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all duration-200"
                />
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block px-3 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 pb-1 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-xs font-medium text-gray-500">COMPTE UTILISATEUR</p>
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

export default NavBar

