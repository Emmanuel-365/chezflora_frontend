import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Plus, Minus } from 'lucide-react';

interface LowStockItemProps {
  id: string;
  name: string;
  stock: number;
  threshold: number;
  onUpdateStock: (id: string, newStock: number) => void;
}

const LowStockItem: React.FC<LowStockItemProps> = ({ id, name, stock, threshold, onUpdateStock }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localStock, setLocalStock] = useState(stock);

  const handleStockChange = (change: number) => {
    const newStock = localStock + change;
    if (newStock >= 0) {
      setLocalStock(newStock);
    }
  };

  const handleUpdateStock = () => {
    setIsUpdating(true);
    onUpdateStock(id, localStock);
    setTimeout(() => setIsUpdating(false), 1000);
  };

  const stockPercentage = (stock / threshold) * 100;

  return (
    <motion.div
      className="bg-[#F5F5F5] rounded-lg shadow-sm p-4 mb-4 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <AlertTriangle className={`w-5 h-5 mr-2 ${stock === 0 ? 'text-powder-pink' : 'text-soft-brown'}`} />
          <h3 className="font-medium text-soft-brown">{name}</h3>
        </div>
        <span className={`text-sm font-medium ${stock === 0 ? 'text-powder-pink' : 'text-soft-brown'}`}>
          ID: {id}
        </span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleStockChange(-1)}
            className="p-1 rounded-full bg-light-beige text-soft-brown hover:bg-[#A8D5BA]/20 transition-colors"
            disabled={isUpdating}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-medium text-soft-brown">{localStock}</span>
          <button
            onClick={() => handleStockChange(1)}
            className="p-1 rounded-full bg-light-beige text-soft-brown hover:bg-[#A8D5BA]/20 transition-colors"
            disabled={isUpdating}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleUpdateStock}
          className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${isUpdating ? 'bg-[#A8D5BA]/20 text-soft-green cursor-not-allowed' : 'bg-[#A8D5BA] text-[#F5F5F5] hover:bg-[#A8D5BA]/90'}`}
          disabled={isUpdating}
        >
          {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
        </button>
      </div>
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block text-soft-brown">{stockPercentage.toFixed(0)}%</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-soft-brown">Seuil: {threshold}</span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#A8D5BA]/20">
          <motion.div
            style={{ width: `${stockPercentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-[#F5F5F5] justify-center bg-[#A8D5BA]"
            initial={{ width: 0 }}
            animate={{ width: `${stockPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-floral-pattern bg-no-repeat bg-contain opacity-5 transform rotate-90" />
    </motion.div>
  );
};

export default LowStockItem;