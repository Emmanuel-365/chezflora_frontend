import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Star, Edit2 } from 'lucide-react';
import ButtonSecondary from './ButtonSecondary';

interface ProfileInfoProps {
  username: string;
  email: string;
  role: string;
  onEdit: () => void;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ username, email, role, onEdit }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="bg-[#F5F5F5] rounded-xl shadow-md p-6 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 bg-[#A8D5BA]/20 rounded-full flex items-center justify-center mr-4">
          <User className="w-8 h-8 text-soft-green" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-soft-brown">{username}</h2>
          <p className="text-soft-brown/70">{role}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center">
          <Mail className="w-5 h-5 text-soft-green mr-2" />
          <span className="text-soft-brown">{email}</span>
        </div>
        <div className="flex items-center">
          <Star className="w-5 h-5 text-soft-green mr-2" />
          <span className="text-soft-brown">Membre depuis {new Date().getFullYear()}</span>
        </div>
      </div>
      <motion.div
        className="absolute top-4 right-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ButtonSecondary onClick={onEdit}>
          <Edit2 className="w-4 h-4 mr-2" />
          Modifier le profil
        </ButtonSecondary>
      </motion.div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-floral-pattern bg-no-repeat bg-contain opacity-5" />
    </motion.div>
  );
};

export default ProfileInfo;