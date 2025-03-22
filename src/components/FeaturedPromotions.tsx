"use client";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface Promotion {
  id: string;
  nom: string;
  description: string;
  produits: { id: string; nom: string; prix: number; prix_reduit?: number }[];
}

interface FeaturedPromotionsProps {
  promotions: Promotion[];
  title: string;
}

export default function FeaturedPromotions({ promotions, title }: FeaturedPromotionsProps) {
  return (
    <section className="bg-powder-pink/20 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-serif font-medium text-soft-brown mb-8 text-center">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {promotions.map((promotion, index) => (
            <motion.div
              key={promotion.id}
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="text-xl font-medium text-soft-brown mb-2">{promotion.nom}</h3>
              <p className="text-soft-brown/70 mb-4">{promotion.description}</p>
              <div className="space-y-2">
                {promotion.produits.map((produit) => (
                  <Link key={produit.id} to={`/products/${produit.id}`}>
                    <div className="flex justify-between items-center hover:bg-light-beige p-2 rounded">
                      <span className="text-soft-brown">{produit.nom}</span>
                      <div>
                        {produit.prix_reduit ? (
                          <>
                            <span className="text-powder-pink font-bold">{produit.prix_reduit.toFixed(2)} FCFA</span>
                            <span className="text-soft-brown/60 text-sm line-through ml-2">{produit.prix} FCFA</span>
                          </>
                        ) : (
                          <span className="text-soft-brown font-bold">{produit.prix} FCFA</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}