import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Clock, Reply, Trash2 } from 'lucide-react';

interface BlogCommentProps {
  id: string;
  author: string;
  date: string;
  content: string;
  isAdmin: boolean;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
}

const BlogComment: React.FC<BlogCommentProps> = ({ id, author, date, content, isAdmin, onReply, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="bg-[#F5F5F5] rounded-lg p-4 mb-4 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 bg-[#A8D5BA]/20 rounded-full flex items-center justify-center mr-2">
          <User className="w-4 h-4 text-soft-green" />
        </div>
        <div>
          <h4 className="font-medium text-soft-brown">{author}</h4>
          <div className="flex items-center text-soft-brown/60 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            <span>{date}</span>
          </div>
        </div>
      </div>
      <p className="text-soft-brown/80 mb-4">{content}</p>
      <div className="flex justify-end space-x-2">
        <motion.button
          className="flex items-center text-soft-green hover:underline text-sm"
          onClick={() => onReply(id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Reply className="w-4 h-4 mr-1" />
          Répondre
        </motion.button>
        {isAdmin && (
          <motion.button
            className="flex items-center text-powder-pink hover:underline text-sm"
            onClick={() => onDelete(id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Supprimer
          </motion.button>
        )}
      </div>
      <motion.div
        className="absolute bottom-0 right-0 w-16 h-16 bg-floral-pattern bg-no-repeat bg-contain opacity-5"
        initial={{ rotate: 0 }}
        animate={{ rotate: isHovered ? 90 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default BlogComment;