import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Eye, EyeOff, Flower } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import TextFieldCustom from "./TextFieldCustom";
import ButtonPrimary from "./ButtonPrimary";
import AuthForgotPasswordLink from "./AuthForgotPasswordLink";
import { getUserProfile } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface AuthLoginFormProps {
  className?: string;
}

const AuthLoginForm: React.FC<AuthLoginFormProps> = ({ className = "" }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setFormError("Veuillez remplir tous les champs");
      return;
    }
    setIsLoading(true);
    setIsSubmitting(true);
    setFormError("");
    console.log(isSubmitting)

    try {
      await loginUser(username, password);
      const userProfile = await getUserProfile();
      console.log("Profil récupéré:", userProfile.data);
      const userRole = userProfile.data.role;

      if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      console.error("Erreur dans handleSubmit:", err);
      if (!err.response) {
        setFormError("Erreur réseau : impossible de contacter le serveur");
      } else if (err.response.status === 401 && err.response.data?.detail === "Utilisateur non actif") {
        const userId = err.response.data.user_id;
        localStorage.setItem("pendingUserId", userId);
        navigate("/otp");
      } else {
        setFormError(err.response?.data?.detail || "Identifiants incorrects");
      }
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
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

  return (
    <motion.div 
      className={`max-w-md mx-auto ${className}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="text-center mb-6" variants={itemVariants}>
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 bg-soft-green/20 rounded-full mb-4"
          variants={iconVariants}
          whileHover="hover"
        >
          <Flower className="h-8 w-8 text-soft-green" />
        </motion.div>
        <motion.h2 
          className="text-2xl font-serif font-medium text-soft-brown"
          variants={itemVariants}
        >
          Bienvenue
        </motion.h2>
        <motion.p 
          className="text-soft-brown/70 mt-1"
          variants={itemVariants}
        >
          Connectez-vous à votre compte
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
            placeholder="Entrez votre nom d'utilisateur"
            required
          />
        </motion.div>

        <motion.div className="relative" variants={itemVariants}>
          <TextFieldCustom
            id="password"
            label="Mot de passe"
            value={password}
            onChange={setPassword}
            type={showPassword ? "text" : "password"}
            placeholder="Entrez votre mot de passe"
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

        <motion.div 
          className="flex items-center justify-between"
          variants={itemVariants}
        >
          <div className="flex items-center">
            <motion.input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-light-beige text-soft-green focus:ring-soft-green/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-soft-brown/80">
              Se souvenir de moi
            </label>
          </div>
          <AuthForgotPasswordLink />
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
                Connexion en cours...
              </span>
            ) : (
              <motion.span 
                className="flex items-center justify-center"
                initial={{ x: -5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Se connecter
              </motion.span>
            )}
          </ButtonPrimary>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default AuthLoginForm;
