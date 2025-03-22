import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import ButtonPrimary from './ButtonPrimary';

interface SubscriptionPlanCardProps {
  name: string;
  price: number;
  frequency: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  onSubscribe: () => void;
}

const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  name,
  price,
  frequency,
  features,
  isPopular = false,
  onSubscribe,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`bg-[#F5F5F5] rounded-xl shadow-md overflow-hidden relative ${isPopular ? 'border-2 border-soft-green' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isPopular && (
        <div className="absolute top-4 right-4 bg-[#A8D5BA] text-[#F5F5F5] text-xs font-bold px-3 py-1 rounded-full">
          Populaire
        </div>
      )}
      <div className="p-6">
        <h3 className="text-2xl font-serif font-bold text-soft-brown mb-2">{name}</h3>
        <div className="flex items-baseline mb-4">
          <span className="text-3xl font-bold text-soft-brown">{price}FCFA</span>
          <span className="text-soft-brown/70 ml-1">/{frequency === 'monthly' ? 'mois' : 'an'}</span>
        </div>
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-soft-brown/80">
              <Check className="w-5 h-5 text-soft-green mr-2" />
              {feature}
            </li>
          ))}
        </ul>
        <ButtonPrimary onClick={onSubscribe} fullWidth>
          S'abonner
        </ButtonPrimary>
      </div>
      <motion.div
        className="absolute bottom-0 left-0 w-32 h-32 bg-floral-pattern bg-no-repeat bg-contain opacity-10"
        initial={{ rotate: 0 }}
        animate={{ rotate: isHovered ? -90 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default SubscriptionPlanCard;