import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="text-center mb-6">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-light-beige rounded-full mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <KeyRound className="h-8 w-8 text-soft-brown" />
        </motion.div>
        <h2 className="text-2xl font-serif font-medium text-soft-brown">Vérification</h2>
        <p className="text-soft-brown/70 mt-1">Nous avons envoyé un code à 6 chiffres à votre adresse email</p>
      </div>
      {formError && (
        <motion.div
          className="bg-pastel-pink/80 border border-powder-pink rounded-lg p-3 mb-4 text-sm text-soft-brown"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          {formError}
        </motion.div>
      )}
      {formSuccess && (
        <motion.div
          className="bg-pastel-green/80 border border-soft-green rounded-lg p-3 mb-4 text-sm text-soft-brown"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {formSuccess}
        </motion.div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <div key={index} className="w-full">
              <input
                ref={(el) => {
                  inputRefs.current[index] = el; // Fonction void explicite
                }}
                type="text"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                maxLength={1}
                className={`
                  w-full aspect-square text-center text-xl font-medium rounded-lg border
                  focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200
                  ${digit ? 'border-soft-green bg-pastel-green/20' : 'border-light-beige bg-off-white'}
                  focus:border-soft-green focus:ring-soft-green/50
                `}
              />
            </div>
          ))}
        </div>
        <ButtonPrimary type="submit" fullWidth disabled={isLoading || otp.some((digit) => !digit)}>
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
            <span className="flex items-center justify-center">
              <ArrowRight className="mr-2 h-4 w-4" />
              Vérifier
            </span>
          )}
        </ButtonPrimary>
        <div className="text-center mt-4">
          <p className="text-sm text-soft-brown/70">
            Vous n'avez pas reçu de code ?{' '}
            {countdown > 0 ? (
              <span>Réessayez dans {countdown} secondes</span>
            ) : (
              <button type="button" onClick={handleResend} className="text-soft-green hover:underline">
                Renvoyer le code
              </button>
            )}
          </p>
        </div>
      </form>
    </div>
  );
};

export default AuthOtpForm;