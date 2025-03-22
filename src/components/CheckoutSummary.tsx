import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Truck, Gift } from 'lucide-react';
import ButtonPrimary from './ButtonPrimary';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutSummaryProps {
  items: CartItem[];
  onCheckout: () => void;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ items, onCheckout }) => {
  const [subtotal, setSubtotal] = useState(0);
  const [shipping] = useState(5.99);
  const [total, setTotal] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setSubtotal(newSubtotal);
    setTotal(newSubtotal + shipping - discount);
  }, [items, shipping, discount]);

  const handlePromoCode = () => {
    if (promoCode.toLowerCase() === 'floral10') {
      const newDiscount = subtotal * 0.1;
      setDiscount(newDiscount);
    }
  };

  return (
    <motion.div
      className="bg-[#F5F5F5] rounded-xl shadow-md p-6 max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-serif font-bold text-soft-brown mb-6">Résumé de la commande</h2>
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <div className="flex items-center">
              <ShoppingBag className="w-4 h-4 text-soft-green mr-2" />
              <span className="text-soft-brown">{item.name}</span>
              <span className="text-soft-brown/60 ml-2">x{item.quantity}</span>
            </div>
            <span className="font-medium text-soft-brown">{(item.price * item.quantity).toFixed(2)} FCFA</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-soft-brown">Sous-total</span>
        <span className="font-medium text-soft-brown">{subtotal.toFixed(2)} FCFA</span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <Truck className="w-4 h-4 text-soft-green mr-2" />
          <span className="text-soft-brown">Livraison</span>
        </div>
        <span className="font-medium text-soft-brown">{shipping.toFixed(2)} FCFA</span>
      </div>
      <div className="flex items-center mb-4">
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="Code promo"
          className="flex-grow p-2 border border-[#F5E8C7] rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#A8D5BA]"
        />
        <button
          onClick={handlePromoCode}
          className="bg-[#A8D5BA] text-[#F5F5F5] px-4 py-2 rounded-r-md hover:bg-[#A8D5BA]/90 transition-colors"
        >
          Appliquer
        </button>
      </div>
      {discount > 0 && (
        <div className="flex justify-between items-center mb-2 text-powder-pink">
          <div className="flex items-center">
            <Gift className="w-4 h-4 mr-2" />
            <span>Réduction</span>
          </div>
          <span className="font-medium">-{discount.toFixed(2)} FCFA</span>
        </div>
      )}
      <div className="flex justify-between items-center mb-6 text-lg font-bold">
        <span className="text-soft-brown">Total</span>
        <span className="text-soft-brown">{total.toFixed(2)} FCFA</span>
      </div>
      <ButtonPrimary onClick={onCheckout} fullWidth>
        Procéder au paiement
      </ButtonPrimary>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-floral-pattern bg-no-repeat bg-contain opacity-5" />
    </motion.div>
  );
};

export default CheckoutSummary;