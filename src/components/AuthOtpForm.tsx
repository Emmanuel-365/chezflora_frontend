import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, ArrowRight } from 'lucide-react';
import ButtonPrimary from './ButtonPrimary';

interface AuthOtpFormProps {
  userId?: string;
  onSubmit?: (data: { userId: string; otp: string }) => void;
  isLoading?: boolean;
  error?: string;
  successMessage?: string;
  resendOtp?: () => void;
  className?: string;
}

const AuthOtpForm: React.FC<AuthOtpFormProps> = ({
  userId = '',
  onSubmit,
  isLoading = false,
  error,
  successMessage,
  resendOtp,
  className = '',
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [formError, setFormError] = useState<string | undefined>(error);
  const [formSuccess, setFormSuccess] = useState<string | undefined>(successMessage);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    setFormError(error);
    setFormSuccess(successMessage);
  }, [error, successMessage]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = [...otp];
    for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some((digit) => !digit)) {
      setFormError('Veuillez entrer le code complet');
      setFormSuccess('');
      return;
    }
    onSubmit?.({ userId, otp: otp.join('') });
  };

  const handleResend = () => {
    setFormError('');
    setFormSuccess('');
    resendOtp?.();
    setCountdown(30);
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const alertVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 500, damping: 30 }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className={`max-w-md mx-auto ${className}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="text-center mb-6" variants={itemVariants}>
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-light-beige rounded-full mb-4"
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 17,
            delay: 0.2
          }}
          whileHover={{ 
            scale: 1.05,
            rotate: 5,
            transition: { duration: 0.3 }
          }}
        >
          <KeyRound className="h-8 w-8 text-soft-brown" />
        </motion.div>
        <motion.h2 
          className="text-2xl font-serif font-medium text-soft-brown"
          variants={itemVariants}
        >
          Vérification
        </motion.h2>
        <motion.p 
          className="text-soft-brown/70 mt-1"
          variants={itemVariants}
        >
          Nous avons envoyé un code à 6 chiffres à votre adresse email
        </motion.p>
      </motion.div>

      <AnimatePresence>
        {formError && (
          <motion.div
            className="bg-pastel-pink/80 border border-powder-pink rounded-lg p-3 mb-4 text-sm text-soft-brown"
            variants={alertVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {formError}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {formSuccess && (
          <motion.div
            className="bg-pastel-green/80 border border-soft-green rounded-lg p-3 mb-4 text-sm text-soft-brown"
            variants={alertVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {formSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form onSubmit={handleSubmit} className="space-y-6" variants={itemVariants}>
        <motion.div className="flex justify-between gap-2" variants={itemVariants}>
          {otp.map((digit, index) => (
            <motion.div 
              key={index} 
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  delay: index * 0.05 + 0.3,
                  type: "spring",
                  stiffness: 400,
                  damping: 20
                }
              }}
            >
              <motion.div
                animate={digit ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <input
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  onFocus={() => handleFocus(index)}
                  onBlur={handleBlur}
                  maxLength={1}
                  className={`
                    w-full aspect-square text-center text-xl font-medium rounded-lg border
                    focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200
                    ${digit ? 'border-soft-green bg-pastel-green/20' : 'border-light-beige bg-off-white'}
                    focus:border-soft-green focus:ring-soft-green/50
                    ${focusedIndex === index ? 'shadow-[0_0_0_2px_rgba(168,213,186,0.3)]' : ''}
                  `}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <ButtonPrimary 
            type="submit" 
            fullWidth 
            disabled={isLoading || otp.some((digit) => !digit)}
          >
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
                Vérification en cours...
              </span>
            ) : (
              <motion.span 
                className="flex items-center justify-center"
                initial={{ x: -5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Vérifier
              </motion.span>
            )}
          </ButtonPrimary>
        </motion.div>

        <motion.div 
          className="text-center mt-4"
          variants={itemVariants}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm text-soft-brown/70">
            Vous n'avez pas reçu de code ?{' '}
            {countdown > 0 ? (
              <motion.span
                initial={{ opacity: 0.7 }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                Réessayez dans <motion.span 
                  key={countdown}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >{countdown}</motion.span> secondes
              </motion.span>
            ) : (
              <motion.button 
                type="button" 
                onClick={handleResend} 
                className="text-soft-green hover:underline"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Renvoyer le code
              </motion.button>
            )}
          </p>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default AuthOtpForm;
