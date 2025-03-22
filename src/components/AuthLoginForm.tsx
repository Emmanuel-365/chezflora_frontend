import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, Flower } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TextFieldCustom from './TextFieldCustom';
import ButtonPrimary from './ButtonPrimary';
import AuthForgotPasswordLink from './AuthForgotPasswordLink';
import { login, getUserProfile } from '../services/api';

interface AuthLoginFormProps {
  className?: string;
}

const AuthLoginForm: React.FC<AuthLoginFormProps> = ({ className = '' }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setFormError('Veuillez remplir tous les champs');
      return;
    }
    setIsLoading(true);
    setFormError('');
    try {
      const response = await login({ username, password });
      localStorage.setItem('access_token', response.data.access);

      const userRole = (await getUserProfile()).data.role
      if(userRole == 'admin')
        navigate('/admin');
      else
        navigate('/');
    } catch (err: any) {
      if (!err.response) {
        setFormError('Erreur réseau : impossible de contacter le serveur');
      } else if (err.response.status === 401 && err.response.data?.detail === 'Utilisateur non actif') {
        const userId = err.response.data.user_id;
        localStorage.setItem('pendingUserId', userId);
        navigate('/otp');
      } else {
        setFormError(err.response.data?.detail || 'Identifiants incorrects');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="text-center mb-6">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-soft-green/20 rounded-full mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Flower className="h-8 w-8 text-soft-green" />
        </motion.div>
        <h2 className="text-2xl font-serif font-medium text-soft-brown">Bienvenue</h2>
        <p className="text-soft-brown/70 mt-1">Connectez-vous à votre compte</p>
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
          placeholder="Entrez votre nom d'utilisateur"
          required
        />
        <div className="relative">
          <TextFieldCustom
            id="password"
            label="Mot de passe"
            value={password}
            onChange={setPassword}
            type={showPassword ? 'text' : 'password'}
            placeholder="Entrez votre mot de passe"
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
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-light-beige text-soft-green focus:ring-soft-green/50"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-soft-brown/80">
              Se souvenir de moi
            </label>
          </div>
          <AuthForgotPasswordLink />
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
              Connexion en cours...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <LogIn className="mr-2 h-4 w-4" />
              Se connecter
            </span>
          )}
        </ButtonPrimary>
      </form>
    </div>
  );
};

export default AuthLoginForm;