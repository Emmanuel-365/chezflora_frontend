import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  id,
  name,
  price,
  quantity,
  image,
  onUpdateQuantity,
  onRemove,
}) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity > 0) {
      onUpdateQuantity(id, newQuantity);
    } else {
      handleRemove();
    }
  };

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(id), 300);
  };

  return (
    <motion.div
      className={`flex items-center p-4 bg-[#F5F5F5] rounded-lg shadow-sm mb-4 transition-all duration-300 ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="relative w-20 h-20 rounded-md overflow-hidden mr-4">
        <img src={image || '/placeholder.svg'} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-grow">
        <h3 className="text-soft-brown font-medium mb-1">{name}</h3>
        <p className="text-soft-brown/70 text-sm">{price.toFixed(2)} FCFA / unité</p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleQuantityChange(-1)}
          className="p-1 rounded-full bg-light-beige text-soft-brown hover:bg-[#A8D5BA]/20 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-medium text-soft-brown">{quantity}</span>
        <button
          onClick={() => handleQuantityChange(1)}
          className="p-1 rounded-full bg-light-beige text-soft-brown hover:bg-[#A8D5BA]/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="w-24 text-right">
        <p className="font-bold text-soft-brown">{(price * quantity).toFixed(2)} FCFA</p>
      </div>
      <button
        onClick={handleRemove}
        className="ml-4 p-2 text-soft-brown/60 hover:text-powder-pink transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-floral-pattern bg-no-repeat bg-contain opacity-5" />
    </motion.div>
  );
};

export default CartItem;