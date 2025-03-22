import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TextFieldCustom from './TextFieldCustom';
import ButtonPrimary from './ButtonPrimary';

interface PaymentFormProps {
  onSubmit: (data: { cardNumber: string; cardHolder: string; expirationDate: string; cvv: string }) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ cardNumber, cardHolder, expirationDate, cvv });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-[#F5F5F5] rounded-xl shadow-md p-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-serif font-bold text-soft-brown mb-6">Informations de paiement</h2>
      <div className="space-y-4">
        <TextFieldCustom
          id="card-number"
          label="Numéro de carte"
          value={cardNumber}
          onChange={setCardNumber}
          placeholder="1234 5678 9012 3456"
          required
        />
        <TextFieldCustom
          id="card-holder"
          label="Titulaire de la carte"
          value={cardHolder}
          onChange={setCardHolder}
          placeholder="John Doe"
          required
        />
        <div className="flex space-x-4">
          <TextFieldCustom
            id="expiration-date"
            label="Date d'expiration"
            value={expirationDate}
            onChange={setExpirationDate}
            placeholder="MM/AA"
            required
          />
          <TextFieldCustom
            id="cvv"
            label="CVV"
            value={cvv}
            onChange={setCvv}
            placeholder="123"
            required
          />
        </div>
      </div>
      <ButtonPrimary type="submit" fullWidth className="mt-6">
        Confirmer le paiement
      </ButtonPrimary>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-floral-pattern bg-no-repeat bg-contain opacity-5 transform rotate-180" />
    </motion.form>
  );
};

export default PaymentForm;