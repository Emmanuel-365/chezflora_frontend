"use client";

import ProductCard from "./ProductCard";

interface Product {
  id: string;
  nom: string;
  prix: number;
  prix_reduit?: number;
  photos: string[];
}

interface FeaturedProductsProps {
  products: Product[];
  title: string;
}

export default function FeaturedProducts({ products, title }: FeaturedProductsProps) {
  return (
    <section className="bg-off-white py-16">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-serif font-medium text-soft-brown mb-8 text-center">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}