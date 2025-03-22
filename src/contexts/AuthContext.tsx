import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, login } from '../services/api';
import { User, TokenResponse } from '../types/types';

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
  

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await getUserProfile();
          setUser(response.data);
        } catch (err) {
          console.error('Erreur lors de la vérification du profil:', err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const loginUser = async (username: string, password: string) => {
    try {
      setLoading(true);
      const response = await login({ username, password });
      const { access, refresh } = response.data as TokenResponse;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh); // Stocke le refresh token
      const profileResponse = await getUserProfile();
      setUser(profileResponse.data);
      navigate('/');
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      throw err.response?.data || { detail: 'Erreur de connexion' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    navigate('/auth');
  };

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
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};