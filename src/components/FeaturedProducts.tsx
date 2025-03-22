"use client";

import ProductCard from "./ProductCard";

interface Product {
  id: string;
  nom: string;
  prix: number;
  prix_reduit?: number;
  photos: Photo[];
  description: string;
  categorie: Category;
}

interface Photo {
  image: string;
}

interface Category {
  id: number
}

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products}: FeaturedProductsProps) {
  return (
    <section className="bg-off-white py-16">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}