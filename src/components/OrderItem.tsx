import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Package, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItemProps {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: { name: string; quantity: number }[];
  onViewDetails: (id: string) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ id, date, status, total, items, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-[#D2B48C]/20 text-soft-brown';
      case 'processing':
        return 'bg-[#A8D5BA]/20 text-soft-green';
      case 'shipped':
        return 'bg-[#F8C1CC]/20 text-powder-pink';
      case 'delivered':
        return 'bg-[#B2F2BB]/40 text-soft-green';
      case 'cancelled':
        return 'bg-[#F8C1CC]/40 text-powder-pink';
      default:
        return 'bg-light-beige text-soft-brown';
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
          <Package className="w-6 h-6 text-soft-green" />
          <div>
            <h3 className="font-medium text-soft-brown">Commande #{id}</h3>
            <div className="flex items-center text-soft-brown/70 text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{date}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          <span className="font-bold text-soft-brown">{total.toFixed(2)} FCFA</span>
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
          <ul className="mt-2 space-y-2">
            {items.map((item, index) => (
              <li key={index} className="flex justify-between text-soft-brown/80">
                <span>{item.name}</span>
                <span>x{item.quantity}</span>
              </li>
            ))}
          </ul>
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

export default OrderItem;