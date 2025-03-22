import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import TextFieldCustom from './TextFieldCustom';
import ButtonPrimary from './ButtonPrimary';

interface BlogCommentFormProps {
  onSubmit: (comment: string) => void;
}

const BlogCommentForm: React.FC<BlogCommentFormProps> = ({ onSubmit }) => {
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(comment);
      setComment('');
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-[#F5F5F5] rounded-xl shadow-md p-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl font-serif font-bold text-soft-brown mb-4">Ajouter un commentaire</h3>
      <TextFieldCustom
        id="comment"
        label="Votre commentaire"
        value={comment}
        onChange={setComment}
        placeholder="Partagez vos pensées..."
        // multiline
        // rows={4}
        required
      />
      <div className="mt-4 flex justify-end">
        <ButtonPrimary type="submit" disabled={!comment.trim()}>
          <Send className="w-4 h-4 mr-2" />
          Publier
        </ButtonPrimary>
      </div>
      <div className="absolute top-0 left-0 w-24 h-24 bg-floral-pattern bg-no-repeat bg-contain opacity-5 transform -rotate-90" />
    </motion.form>
  );
};

export default BlogCommentForm;