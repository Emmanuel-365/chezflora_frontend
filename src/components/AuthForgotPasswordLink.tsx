import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, X, Send } from 'lucide-react';
import TextFieldCustom from './TextFieldCustom';
import ButtonPrimary from './ButtonPrimary';
import ButtonSecondary from './ButtonSecondary';

interface AuthForgotPasswordLinkProps {
  onSubmit?: (email: string) => void;
  className?: string;
}

const AuthForgotPasswordLink: React.FC<AuthForgotPasswordLinkProps> = ({ onSubmit, className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEmail('');
      setIsSuccess(false);
      setError('');
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email');
      return;
    }
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      onSubmit?.(email);
    }, 1500);
  };

  return (
    <>
      <button onClick={handleOpenModal} className={`text-sm text-soft-green hover:underline ${className}`}>
        Mot de passe oublié ?
      </button>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-[#D2B48C]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-[#F5F5F5] rounded-xl shadow-lg max-w-md w-full relative overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-floral-pattern bg-no-repeat bg-contain opacity-10 pointer-events-none"></div>
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-soft-brown/60 hover:text-soft-brown transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-light-beige rounded-full mb-4">
                    <KeyRound className="h-6 w-6 text-soft-brown" />
                  </div>
                  <h3 className="text-xl font-serif font-medium text-soft-brown">Réinitialisation du mot de passe</h3>
                  {!isSuccess && (
                    <p className="text-soft-brown/70 text-sm mt-1">
                      Entrez votre adresse email pour recevoir un lien de réinitialisation
                    </p>
                  )}
                </div>
                {isSuccess ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-[#B2F2BB] rounded-full mb-4">
                      <Send className="h-6 w-6 text-soft-green" />
                    </div>
                    <p className="text-soft-brown mb-4">
                      Un email a été envoyé à <span className="font-medium">{email}</span> avec les instructions.
                    </p>
                    <ButtonPrimary onClick={handleCloseModal}>Fermer</ButtonPrimary>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div className="bg-pastel-pink/80 border border-powder-pink rounded-lg p-3 mb-4 text-sm text-soft-brown">
                        {error}
                      </div>
                    )}
                    <TextFieldCustom
                      id="reset-email"
                      label="Adresse email"
                      value={email}
                      onChange={setEmail}
                      type="email"
                      placeholder="Entrez votre adresse email"
                      required
                    />
                    <div className="flex gap-3 mt-6">
                      <ButtonSecondary type="button" onClick={handleCloseModal} className="flex-1">
                        Annuler
                      </ButtonSecondary>
                      <ButtonPrimary type="submit" disabled={isLoading} className="flex-1">
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Envoi...
                          </span>
                        ) : (
                          'Envoyer'
                        )}
                      </ButtonPrimary>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AuthForgotPasswordLink;