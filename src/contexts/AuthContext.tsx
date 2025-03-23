import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getUserProfile, login, refreshToken } from "../services/api"; // Ajoute refreshToken
import { User, TokenResponse } from "../types/types";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginUser: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Vérifie l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const response = await getUserProfile();
          setUser(response.data);
        } catch (err) {
          console.error("Erreur lors de la vérification du profil:", err);
          await handleTokenRefresh(); // Essaie de rafraîchir le token
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Fonction pour rafraîchir le token
  const handleTokenRefresh = async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) {
      logout();
      return;
    }
    try {
      const response = await refreshToken(refresh); // Appel API pour rafraîchir le token
      const { access } = response.data;
      localStorage.setItem("access_token", access);
      const profileResponse = await getUserProfile();
      setUser(profileResponse.data);
    } catch (err) {
      console.error("Échec du rafraîchissement du token:", err);
      logout();
    }
  };

  const loginUser = async (username: string, password: string) => {
    try {
      setLoading(true);
      const response = await login({ username, password });
      const { access, refresh } = response.data as TokenResponse;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      const profileResponse = await getUserProfile();
      setUser(profileResponse.data);
      navigate("/");
    } catch (err: any) {
      console.error("Erreur de connexion:", err);
      throw err.response?.data || { detail: "Erreur de connexion" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    navigate("/auth");
  };

  // Intercepteur Axios pour gérer les erreurs 401
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            await handleTokenRefresh();
            // Réessaye la requête initiale avec le nouveau token
            error.config.headers["Authorization"] = `Bearer ${localStorage.getItem("access_token")}`;
            return axios(error.config);
          } catch (refreshErr) {
            logout();
            return Promise.reject(refreshErr);
          }
        }
        return Promise.reject(error);
      },
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loginUser,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};