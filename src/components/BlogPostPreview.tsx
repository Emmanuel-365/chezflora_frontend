import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogPostPreviewProps {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  author: string;
  readTime: number;
}

const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({ id, title, excerpt, date, image, author, readTime }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="bg-[#F5F5F5] rounded-xl shadow-md overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-48">
        <img
          src={image || '/placeholder.svg'}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-serif font-bold text-soft-brown mb-2">{title}</h3>
        <p className="text-soft-brown/80 mb-4 line-clamp-3">{excerpt}</p>
        <div className="flex justify-between items-center text-soft-brown/70 text-sm mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{date}</span>
          </div>
          <span>{readTime} min de lecture</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-soft-brown/80">{author}</span>
          <Link to={`/blog/${id}`}>
            <motion.a
              className="flex items-center text-soft-green hover:underline"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              Lire l'article
              <ArrowRight className="w-4 h-4 ml-1" />
            </motion.a>
          </Link>
        </div>
      </div>
      <motion.div
        className="absolute top-0 left-0 w-24 h-24 bg-floral-pattern bg-no-repeat bg-contain opacity-10"
        initial={{ rotate: 0 }}
        animate={{ rotate: isHovered ? -90 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default BlogPostPreview;