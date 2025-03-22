"use client";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface Photo {
  image: string;
}

interface Product {
  id: string;
  nom: string;
  prix: number;
  prix_reduit?: number;
  photos?: Photo[];
  description?: string; // Optionnel pour les vues où on ne montre pas la description
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Vérification pour éviter les erreurs si product ou photos est undefined
  if (!product) return null;

  const photoUrl = product.photos && product.photos.length > 0 
    ? product.photos[0].image 
    : "/images/placeholder-image.jpg";

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/products/${product.id}`}>
        <div className="block relative h-64 overflow-hidden">
        <img
            src={photoUrl}
            alt={product.nom}
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out transform hover:scale-105"
          />
          {product.prix_reduit != product.prix && product.prix_reduit && (
            <div className="absolute top-2 right-2 bg-powder-pink text-white text-xs font-bold px-2 py-1 rounded-full">
              Promo
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <h3 className="font-medium text-soft-brown mb-2">{product.nom}</h3>
        {product.description && (
          <p className="text-soft-brown/70 line-clamp-2 mb-2">{product.description}</p>
        )}
        <div className="flex items-baseline">
          {product.prix_reduit != product.prix && product.prix_reduit ? (
            <>
              <span className="text-powder-pink font-bold">{product.prix_reduit} FCFA</span>
              <span className="text-soft-brown/60 text-sm line-through ml-2">{product.prix} FCFA</span>
            </>
          ) : (
            <span className="text-soft-brown font-bold">{product.prix} FCFA</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}