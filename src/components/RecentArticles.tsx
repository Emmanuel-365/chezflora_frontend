"use client";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  Photo: Photo;
  link: string;
}

interface Photo {
  image: string;
}

interface RecentArticlesProps {
  articles: Article[];
}

export default function RecentArticles({ articles}: RecentArticlesProps) {
  return (
    <section className="bg-light-beige py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={article.link}>
                <div className="block relative h-48 overflow-hidden">
                  <img
                    src={article.Photo.image || "/images/article-placeholder.jpg"}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out transform hover:scale-105"
                  />
                </div>
              </Link>
              <div className="p-6">
                <h3 className="text-xl font-medium text-soft-brown mb-2">{article.title}</h3>
                <p className="text-soft-brown/70 mb-4 line-clamp-3">{article.excerpt}</p>
                <Link to={article.link}>
                  <span className="text-soft-green hover:underline">Lire la suite</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}