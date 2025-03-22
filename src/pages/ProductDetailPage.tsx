import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import ProductCard from '../components/ProductCard';
import { getProduct, getProducts, addToCart, getCart, getWishlist, ajouterProduitWishlist, supprimerProduitWishlist } from '../services/api';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Minus, Plus } from 'lucide-react';


interface Photo {
  id:number;
  image: string;
}

interface Product {
  id: string;
  nom: string;
  prix: number;
  prix_reduit?: number;
  photos: Photo[];
  description: string;
  categorie: number;
  stock: number;
}

interface Wishlist {
  id: string;
  produits: { id: string }[];
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les détails du produit (non paginé, donc data direct)
        const productRes = await getProduct(id!);
        const productData = {
          id: productRes.data.id,
          nom: productRes.data.nom,
          prix: parseFloat(productRes.data.prix),
          prix_reduit: productRes.data.prix_reduit ? parseFloat(productRes.data.prix_reduit) : undefined,
          photos: productRes.data.photos || [],
          description: productRes.data.description || '',
          categorie: productRes.data.categorie,
          stock: productRes.data.stock,
        };
        setProduct(productData);

        // Récupérer les produits similaires (paginé, donc data.results)
        const productsRes = await getProducts({ categorie: productData.categorie });
        const related = productsRes.data.results // Changement ici : data.results au lieu de data
          .filter((p: any) => p.id !== id)
          .slice(0, 4)
          .map((p: any) => ({
            id: p.id,
            nom: p.nom,
            prix: parseFloat(p.prix),
            prix_reduit: p.prix_reduit ? parseFloat(p.prix_reduit) : undefined,
            photos: p.photos || [],
            description: p.description || '',
            categorie: p.categorie,
            stock: p.stock,
          }));
        setRelatedProducts(related);

        // Récupérer le panier et la wishlist (vérifier si paginé)
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const [cartRes, wishlistRes] = await Promise.all([getCart(), getWishlist()]);
            
            // Panier :假设 getCart renvoie un seul objet (non paginé)
            setCartId(cartRes.data.id);

            // Wishlist : Vérifier si paginé (data.results) ou non (data direct)
            const wishlistData = wishlistRes.data.results 
              ? wishlistRes.data.results[0] || { produits: [] } // Si paginé, prendre le premier élément
              : wishlistRes.data.length > 0 ? wishlistRes.data[0] : { produits: [] }; // Si non paginé
            setIsInWishlist(wishlistData.produits.some((p: { id: string }) => p.id === id));
          } catch (err: any) {
            console.error('Erreur lors de la récupération du panier ou wishlist:', err);
          }
        }

        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement du produit');
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handlePrevPhoto = () => {
    if (product && product.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : product.photos.length - 1));
    }
  };

  const handleNextPhoto = () => {
    if (product && product.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev < product.photos.length - 1 ? prev + 1 : 0));
    }
  };

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    setQuantity((prev) => {
      const newQty = prev + delta;
      return newQty > 0 && newQty <= product.stock ? newQty : prev;
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/auth');
      return;
    }

    setCartLoading(true);
    let currentCartId = cartId;
    if (!currentCartId) {
      try {
        const cartRes = await getCart();
        currentCartId = cartRes.data.id; // Non paginé, donc data direct
        setCartId(currentCartId);
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/auth');
        } else {
          alert('Erreur lors de la récupération du panier.');
        }
        setCartLoading(false);
        return;
      }
    }

    try {
      await addToCart(currentCartId!, { produit_id: product.id, quantite: quantity });
      alert(`${quantity} ${product.nom} ajouté(s) au panier !`);
      setQuantity(1);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/auth');
      } else {
        alert('Erreur lors de l’ajout au panier.');
      }
    } finally {
      setCartLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!id) return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/auth');
      return;
    }

    try {
      if (isInWishlist) {
        await supprimerProduitWishlist(id);
        setIsInWishlist(false);
        alert('Produit retiré de la liste de souhaits !');
      } else {
        await ajouterProduitWishlist(id);
        setIsInWishlist(true);
        alert('Produit ajouté à la liste de souhaits !');
      }
    } catch (err: any) {
      console.error('Erreur lors de la modification de la wishlist:', err.response?.data);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/auth');
      } else {
        alert('Erreur : ' + (err.response?.data?.error || 'Vérifiez votre connexion.'));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-soft-green"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-3xl font-serif text-powder-pink mb-4">{error || 'Produit non trouvé'}</div>
        <button
          onClick={() => window.history.back()}
          className="bg-soft-green text-white px-6 py-2 rounded-md hover:bg-soft-green/90 transition-colors"
        >
          Retour
        </button>
      </div>
    );
  }

  const currentPhoto = product.photos.length > 0 ? product.photos[currentPhotoIndex] : '/images/placeholder-image.jpg';

  return (
    <>
      <NavBar />
      <PageContainer>
        <motion.div
          className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumb */}
          <nav className="text-sm font-medium text-soft-brown/60 mb-8">
            <ol className="list-none p-0 inline-flex">
              <li className="flex items-center">
                <Link to="/" className="hover:text-soft-green transition-colors">
                  Accueil
                </Link>
                <ChevronRight className="w-4 h-4 mx-2" />
              </li>
              <li className="flex items-center">
                <Link to="/products" className="hover:text-soft-green transition-colors">
                  Produits
                </Link>
                <ChevronRight className="w-4 h-4 mx-2" />
              </li>
              <li>{product.nom}</li>
            </ol>
          </nav>

          {/* Détails du produit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="relative">
              <motion.img
                key={currentPhoto.image}
                src={currentPhoto.image}
                alt={`${product.nom} - Photo ${currentPhotoIndex + 1}`}
                className="w-full h-[500px] object-cover rounded-lg shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              {product.photos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 text-soft-brown p-2 rounded-full hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 text-soft-brown p-2 rounded-full hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {product.photos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentPhotoIndex ? 'bg-soft-green' : 'bg-white/60 hover:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-serif font-medium text-soft-brown mb-4">{product.nom}</h1>
                <p className="text-soft-brown/80 mb-6 text-lg leading-relaxed">{product.description}</p>
                <div className="flex items-baseline mb-4">
                  {product.prix_reduit && product.prix_reduit < product.prix ? (
                    <>
                      <span className="text-powder-pink text-3xl font-bold">{product.prix_reduit.toFixed(2)} FCFA</span>
                      <span className="text-soft-brown/60 text-xl line-through ml-4">{product.prix.toFixed(2)} FCFA</span>
                    </>
                  ) : (
                    <span className="text-soft-brown text-3xl font-bold">{product.prix.toFixed(2)} FCFA</span>
                  )}
                </div>
                <p className="text-soft-brown/70 mb-4">Stock restant : {product.stock}</p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Sélecteur de quantité */}
                <div className="flex items-center bg-light-beige rounded-full px-2 py-1">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-1 text-soft-brown hover:text-soft-green transition-colors disabled:opacity-50"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center text-soft-brown font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="p-1 text-soft-brown hover:text-soft-green transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading || product.stock === 0}
                  className={`flex-1 flex items-center justify-center text-lg font-medium px-6 py-3 rounded-md transition-colors ${
                    cartLoading || product.stock === 0
                      ? 'bg-soft-green/50 text-white cursor-not-allowed'
                      : 'bg-soft-green text-white hover:bg-soft-green/90'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {cartLoading ? 'Ajout en cours...' : product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`p-3 rounded-md transition-colors ${
                    isInWishlist ? 'bg-powder-pink text-white' : 'bg-powder-pink/20 text-powder-pink hover:bg-powder-pink/30'
                  }`}
                >
                  <Heart className="w-6 h-6" fill={isInWishlist ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <motion.div
              className="mt-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, Wdelay: 0.2 }}
            >
              <h2 className="text-3xl font-serif font-medium text-soft-brown mb-8">Produits similaires</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
          )}
        </motion.div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default ProductDetailPage;