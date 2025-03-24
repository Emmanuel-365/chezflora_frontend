import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Eye, EyeOff, Flower2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TextFieldCustom from './TextFieldCustom';
import ButtonPrimary from './ButtonPrimary';
import { register } from '../services/api';

interface AuthRegisterFormProps {
  className?: string;
}

const AuthRegisterForm: React.FC<AuthRegisterFormProps> = ({ className = '' }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string>('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const navigate = useNavigate();
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const passwordStrength = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 2) return { label: 'Faible', color: 'bg-powder-pink' };
    if (passwordStrength <= 4) return { label: 'Moyen', color: 'bg-soft-brown' };
    return { label: 'Fort', color: 'bg-soft-green' };
  };

  const strengthInfo = getPasswordStrengthLabel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      setFormError('Veuillez remplir tous les champs');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas');
      return;
    }
    if (!acceptTerms) {
      setFormError('Vous devez accepter les conditions générales');
      return;
    }
    if (passwordStrength < 3) {
      setFormError('Votre mot de passe est trop faible');
      return;
    }
    setIsLoading(true);
    setFormError('');
    try {
      const response = await register({ username, email, password });
      localStorage.setItem('pendingUserId', response.data.user_id);
      navigate('/otp');
    } catch (err: any) {
      if (!err.response) {
        setFormError('Erreur réseau : impossible de contacter le serveur');
      } else if (err.response.status === 400 && err.response.data?.error === 'Utilisateur existe mais non actif') {
        const userId = err.response.data.user_id;
        localStorage.setItem('pendingUserId', userId);
        navigate('/otp');
      } else {
        setFormError(err.response.data?.error || 'Données invalides, vérifiez vos champs');
      }
    } finally {
      setIsLoading(false);
    }
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

  const iconVariants = {
    hidden: { rotate: -10, scale: 0.8, opacity: 0 },
    visible: { 
      rotate: 0, 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 17,
        delay: 0.2
      }
    },
    hover: { 
      scale: 1.05,
      rotate: 5,
      transition: { duration: 0.3 }
    }
  };

  const checkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 500, damping: 25 }
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
          className="inline-flex items-center justify-center w-16 h-16 bg-powder-pink/20 rounded-full mb-4"
          variants={iconVariants}
          whileHover="hover"
        >
          <Flower2 className="h-8 w-8 text-powder-pink" />
        </motion.div>
        <motion.h2 
          className="text-2xl font-serif font-medium text-soft-brown"
          variants={itemVariants}
        >
          Créer un compte
        </motion.h2>
        <motion.p 
          className="text-soft-brown/70 mt-1"
          variants={itemVariants}
        >
          Rejoignez notre communauté florale
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

      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-4"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <TextFieldCustom
            id="username"
            label="Nom d'utilisateur"
            value={username}
            onChange={setUsername}
            placeholder="Choisissez un nom d'utilisateur"
            required
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <TextFieldCustom
            id="email"
            label="Adresse email"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="Entrez votre adresse email"
            required
          />
        </motion.div>

        <motion.div className="relative" variants={itemVariants}>
          <TextFieldCustom
            id="password"
            label="Mot de passe"
            value={password}
            onChange={setPassword}
            type={showPassword ? 'text' : 'password'}
            placeholder="Créez un mot de passe"
            required
          />
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-soft-brown/60 hover:text-soft-brown transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {password.length > 0 && (
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-soft-brown/70">Force du mot de passe :</span>
                <motion.span
                  className={`font-medium ${
                    strengthInfo.label === 'Faible'
                      ? 'text-powder-pink'
                      : strengthInfo.label === 'Moyen'
                      ? 'text-soft-brown'
                      : 'text-soft-green'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={strengthInfo.label}
                >
                  {strengthInfo.label}
                </motion.span>
              </div>
              <div className="h-1.5 w-full bg-light-beige rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${strengthInfo.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <motion.div 
                className="grid grid-cols-2 gap-2 text-xs mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="flex items-center"
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  custom={0}
                >
                  <AnimatePresence mode="wait">
                    {hasMinLength ? (
                      <motion.div
                        key="check"
                        variants={checkVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <Check className="h-3 w-3 text-soft-green mr-1" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="x"
                        variants={checkVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <X className="h-3 w-3 text-powder-pink mr-1" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="text-soft-brown/70">8 caractères minimum</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center"
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  custom={1}
                >
                  <AnimatePresence mode="wait">
                    {hasUpperCase ? (
                      <motion.div
                        key="check"
                        variants={checkVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <Check className="h-3 w-3 text-soft-green mr-1" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="x"
                        variants={checkVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <X className="h-3 w-3 text-powder-pink mr-1" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="text-soft-brown/70">Une majuscule</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center"
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  custom={2}
                >
                  <AnimatePresence mode="wait">
                    {hasLowerCase ? (
                      <motion.div
                        key="check"
                        variants={checkVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <Check className="h-3 w-3 text-soft-green mr-1" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="x"
                        variants={checkVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <X className="h-3 w-3 text-powder-pink mr-1" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="text-soft-brown/70">Une minuscule</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center"
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  custom={3}
                >
                  <AnimatePresence mode="wait">
                    {hasNumber ? (
                      <motion.div
                        key="check"
                        variants={checkVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <Check className="h-3 w-3 text-soft-green mr-1" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="x"
                        variants={checkVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <X className="h-3 w-3 text-powder-pink mr-1" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="text-soft-brown/70">Un chiffre</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center"
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  custom={4}
                >
                  <AnimatePresence mode="wait">
                    {hasSpecialChar ? (
                      <motion.div
                        key="check"
                        variants={checkVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <Check className="h-3 w-3 text-soft-green mr-1" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="x"
                        variants={checkVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <X className="h-3 w-3 text-powder-pink mr-1" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="text-soft-brown/70">Un caractère spécial</span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="relative" variants={itemVariants}>
          <TextFieldCustom
            id="confirm-password"
            label="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={setConfirmPassword}
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirmez votre mot de passe"
            required
            error={confirmPassword && password !== confirmPassword ? 'Les mots de passe ne correspondent pas' : ''}
          />
        </motion.div>

        <motion.div 
          className="flex items-start mt-4"
          variants={itemVariants}
        >
          <div className="flex items-center h-5">
            <motion.input
              id="terms"
              name="terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-4 w-4 rounded border-light-beige text-soft-green focus:ring-soft-green/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="text-soft-brown/80">
              J'accepte les{' '}
              <motion.a 
                href="#" 
                className="text-soft-green hover:underline inline-block" // Déplacé display dans className
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                conditions générales
              </motion.a>{' '}
              et la{' '}
              <motion.a 
                href="#" 
                className="text-soft-green hover:underline inline-block" // Déplacé display dans className
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                politique de confidentialité
              </motion.a>
            </label>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ButtonPrimary 
            type="submit" 
            fullWidth 
            disabled={isLoading} 
            className="mt-6"
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
                Inscription en cours...
              </span>
            ) : (
              <motion.span 
                className="flex items-center justify-center"
                initial={{ x: -5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                S'inscrire
              </motion.span>
            )}
          </ButtonPrimary>
        </motion.div>

        <motion.div 
          className="text-center mt-4"
          variants={itemVariants}
        >
          <p className="text-sm text-soft-brown/70">
            Vous avez déjà un compte?{' '}
            <motion.a 
              href="#" 
              className="text-soft-green hover:underline inline-block" // Déplacé display dans className
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Connectez-vous
            </motion.a>
          </p>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default AuthRegisterForm;