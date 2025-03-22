import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface PaymentItemProps {
  id: string;
  date: string;
  amount: number;
  type: 'subscription' | 'one-time' | 'refund';
  cardLast4: string;
  onViewDetails: (id: string) => void;
}

const PaymentItem: React.FC<PaymentItemProps> = ({ id, date, amount, type, cardLast4, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeColor = () => {
    switch (type) {
      case 'subscription':
        return 'bg-[#A8D5BA]/20 text-soft-green';
      case 'one-time':
        return 'bg-[#F8C1CC]/20 text-powder-pink';
      case 'refund':
        return 'bg-[#D2B48C]/20 text-soft-brown';
      default:
        return 'bg-light-beige text-soft-brown';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'subscription':
        return 'Abonnement';
      case 'one-time':
        return 'Achat unique';
      case 'refund':
        return 'Remboursement';
      default:
        return 'Paiement';
    }
  };

  return (
    <motion.div
      className="bg-[#F5F5F5] rounded-xl shadow-sm overflow-hidden mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center space-x-4">
          <CreditCard className="w-6 h-6 text-soft-green" />
          <div>
            <h3 className="font-medium text-soft-brown">Paiement #{id}</h3>
            <div className="flex items-center text-soft-brown/70 text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{date}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor()}`}>{getTypeLabel()}</span>
          <span className="font-bold text-soft-brown">{amount.toFixed(2)} FCFA</span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-soft-brown" />
          ) : (
            <ChevronDown className="w-5 h-5 text-soft-brown" />
          )}
        </div>
      </div>
      {isExpanded && (
        <motion.div
          className="px-4 pb-4 border-t border-[#F5E8C7]"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mt-2 space-y-2 text-soft-brown/80">
            <p>Type de paiement : {getTypeLabel()}</p>
            <p>Carte utilisée : **** **** **** {cardLast4}</p>
          </div>
          <button
            onClick={() => onViewDetails(id)}
            className="mt-4 text-soft-green hover:underline focus:outline-none"
          >
            Voir les détails
          </button>
        </motion.div>
      )}
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-floral-pattern bg-no-repeat bg-contain opacity-5" />
    </motion.div>
  );
};

export default PaymentItem;