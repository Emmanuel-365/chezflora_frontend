import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="text-center mb-6">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-powder-pink/20 rounded-full mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Flower2 className="h-8 w-8 text-powder-pink" />
        </motion.div>
        <h2 className="text-2xl font-serif font-medium text-soft-brown">Créer un compte</h2>
        <p className="text-soft-brown/70 mt-1">Rejoignez notre communauté florale</p>
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextFieldCustom
          id="username"
          label="Nom d'utilisateur"
          value={username}
          onChange={setUsername}
          placeholder="Choisissez un nom d'utilisateur"
          required
        />
        <TextFieldCustom
          id="email"
          label="Adresse email"
          value={email}
          onChange={setEmail}
          type="email"
          placeholder="Entrez votre adresse email"
          required
        />
        <div className="relative">
          <TextFieldCustom
            id="password"
            label="Mot de passe"
            value={password}
            onChange={setPassword}
            type={showPassword ? 'text' : 'password'}
            placeholder="Créez un mot de passe"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-soft-brown/60 hover:text-soft-brown transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {password.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-soft-brown/70">Force du mot de passe :</span>
              <span
                className={`font-medium ${
                  strengthInfo.label === 'Faible'
                    ? 'text-powder-pink'
                    : strengthInfo.label === 'Moyen'
                    ? 'text-soft-brown'
                    : 'text-soft-green'
                }`}
              >
                {strengthInfo.label}
              </span>
            </div>
            <div className="h-1.5 w-full bg-light-beige rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${strengthInfo.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
              <div className="flex items-center">
                {hasMinLength ? <Check className="h-3 w-3 text-soft-green mr-1" /> : <X className="h-3 w-3 text-powder-pink mr-1" />}
                <span className="text-soft-brown/70">8 caractères minimum</span>
              </div>
              <div className="flex items-center">
                {hasUpperCase ? <Check className="h-3 w-3 text-soft-green mr-1" /> : <X className="h-3 w-3 text-powder-pink mr-1" />}
                <span className="text-soft-brown/70">Une majuscule</span>
              </div>
              <div className="flex items-center">
                {hasLowerCase ? <Check className="h-3 w-3 text-soft-green mr-1" /> : <X className="h-3 w-3 text-powder-pink mr-1" />}
                <span className="text-soft-brown/70">Une minuscule</span>
              </div>
              <div className="flex items-center">
                {hasNumber ? <Check className="h-3 w-3 text-soft-green mr-1" /> : <X className="h-3 w-3 text-powder-pink mr-1" />}
                <span className="text-soft-brown/70">Un chiffre</span>
              </div>
              <div className="flex items-center">
                {hasSpecialChar ? <Check className="h-3 w-3 text-soft-green mr-1" /> : <X className="h-3 w-3 text-powder-pink mr-1" />}
                <span className="text-soft-brown/70">Un caractère spécial</span>
              </div>
            </div>
          </div>
        )}
        <div className="relative">
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
        </div>
        <div className="flex items-start mt-4">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-4 w-4 rounded border-light-beige text-soft-green focus:ring-soft-green/50"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="text-soft-brown/80">
              J'accepte les{' '}
              <a href="#" className="text-soft-green hover:underline">
                conditions générales
              </a>{' '}
              et la{' '}
              <a href="#" className="text-soft-green hover:underline">
                politique de confidentialité
              </a>
            </label>
          </div>
        </div>
        <ButtonPrimary type="submit" fullWidth disabled={isLoading} className="mt-6">
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
            <span className="flex items-center justify-center">
              <UserPlus className="mr-2 h-4 w-4" />
              S'inscrire
            </span>
          )}
        </ButtonPrimary>
        <div className="text-center mt-4">
          <p className="text-sm text-soft-brown/70">
            Vous avez déjà un compte?{' '}
            <a href="#" className="text-soft-green hover:underline">
              Connectez-vous
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default AuthRegisterForm;