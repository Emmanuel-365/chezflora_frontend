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

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3, delay: 0.1 }
    }
  };

  const modalVariants = {
    hidden: { scale: 0.9, opacity: 0, y: 20 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 30,
        delay: 0.1
      }
    },
    exit: { 
      scale: 0.9, 
      opacity: 0, 
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const successVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 20 
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <>
      <motion.button 
        onClick={handleOpenModal} 
        className={`text-sm text-soft-green hover:underline ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Mot de passe oublié ?
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-[#D2B48C]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-[#F5F5F5] rounded-xl shadow-lg max-w-md w-full relative overflow-hidden"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div 
                className="absolute top-0 right-0 w-32 h-32 bg-floral-pattern bg-no-repeat bg-contain opacity-10 pointer-events-none"
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                  opacity: [0.1, 0.15, 0.1]
                }}
                transition={{ 
                  duration: 10, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              />
              
              <motion.button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-soft-brown/60 hover:text-soft-brown transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5" />
              </motion.button>
              
              <div className="p-6">
                <motion.div 
                  className="text-center mb-6"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div 
                    className="inline-flex items-center justify-center w-12 h-12 bg-light-beige rounded-full mb-4"
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 17,
                      delay: 0.3
                    }}
                  >
                    <KeyRound className="h-6 w-6 text-soft-brown" />
                  </motion.div>
                  <motion.h3 
                    className="text-xl font-serif font-medium text-soft-brown"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Réinitialisation du mot de passe
                  </motion.h3>
                  {!isSuccess && (
                    <motion.p 
                      className="text-soft-brown/70 text-sm mt-1"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Entrez votre adresse email pour recevoir un lien de réinitialisation
                    </motion.p>
                  )}
                </motion.div>
                
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div 
                      variants={successVariants}
                      initial="hidden"
                      animate="visible"
                      className="text-center"
                    >
                      <motion.div 
                        className="inline-flex items-center justify-center w-12 h-12 bg-[#B2F2BB] rounded-full mb-4"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [0, 1.2, 1],
                          opacity: 1
                        }}
                        transition={{ 
                          type: "spring",
                          stiffness: 400,
                          damping: 15
                        }}
                      >
                        <Send className="h-6 w-6 text-soft-green" />
                      </motion.div>
                      <motion.p 
                        className="text-soft-brown mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        Un email a été envoyé à <span className="font-medium">{email}</span> avec les instructions.
                      </motion.p>
                      <motion.div
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <ButtonPrimary onClick={handleCloseModal}>Fermer</ButtonPrimary>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.form 
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <AnimatePresence>
                        {error && (
                          <motion.div 
                            className="bg-pastel-pink/80 border border-powder-pink rounded-lg p-3 mb-4 text-sm text-soft-brown"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <TextFieldCustom
                          id="reset-email"
                          label="Adresse email"
                          value={email}
                          onChange={setEmail}
                          type="email"
                          placeholder="Entrez votre adresse email"
                          required
                        />
                      </motion.div>
                      
                      <motion.div 
                        className="flex gap-3 mt-6"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <motion.div 
                          className="flex-1"
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <ButtonSecondary type="button" onClick={handleCloseModal} className="w-full">
                            Annuler
                          </ButtonSecondary>
                        </motion.div>
                        <motion.div 
                          className="flex-1"
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <ButtonPrimary type="submit" disabled={isLoading} className="w-full">
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
                        </motion.div>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AuthForgotPasswordLink;
