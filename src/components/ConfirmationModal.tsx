import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import ButtonPrimary from './ButtonPrimary';
import ButtonSecondary from './ButtonSecondary';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#F5F5F5] rounded-xl shadow-lg p-6 w-full max-w-md relative overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-[#F8C1CC]/20 rounded-full flex items-center justify-center mr-3">
            <AlertTriangle className="w-6 h-6 text-powder-pink" />
          </div>
          <h2 className="text-xl font-serif font-bold text-soft-brown">{title}</h2>
        </div>
        <p className="text-soft-brown/80 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <ButtonSecondary onClick={onClose}>{cancelText}</ButtonSecondary>
          <ButtonPrimary onClick={onConfirm}>{confirmText}</ButtonPrimary>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-floral-pattern bg-no-repeat bg-contain opacity-5 transform rotate-90" />
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationModal;