import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import { ChevronRight, ShoppingCart, Calendar, Clock, Users } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Atelier } from '../types/types';

const AtelierDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [atelier, setAtelier] = useState<Atelier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInscrit, setIsInscrit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAtelier = async () => {
      try {
        const response = await api.get<Atelier>(`/ateliers/${id}/`);
        setAtelier(response.data);
        if (isAuthenticated && user) {
          const participantIds = response.data.participants.map((p) => p.utilisateur);
          setIsInscrit(participantIds.includes(user));
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erreur lors du chargement de l’atelier');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) fetchAtelier();
  }, [id, user, isAuthenticated, authLoading]);

  const handleInscription = async () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: `/ateliers/${id}` } });
      return;
    }
    try {
      setLoading(true);
      await api.post(`/ateliers/${id}/s_inscrire/`);
      setIsInscrit(true);
      setAtelier((prev) =>
        prev ? { ...prev, places_disponibles: prev.places_disponibles - 1 } : null
      );
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l’inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleDesinscription = async () => {
    try {
      setLoading(true);
      await api.post(`/ateliers/${id}/desinscription/`);
      setIsInscrit(false);
      setAtelier((prev) =>
        prev ? { ...prev, places_disponibles: prev.places_disponibles + 1 } : null
      );
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la désinscription');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (loading && !atelier)) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !atelier) {
    return (
      <Container maxWidth="md" className="py-8">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!atelier) return null; // Sécurité supplémentaire

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" className="py-8">
        <Box className="flex flex-col md:flex-row justify-between items-start mb-6">
          <Typography variant="h3" className="font-bold text-gray-800 dark:text-gray-100">
            {atelier.nom}
          </Typography>
          <Chip
            label={atelier.is_active ? 'Actif' : 'Annulé'}
            color={atelier.is_active ? 'success' : 'error'}
            className="mt-2 md:mt-0"
          />
        </Box>
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Box className="col-span-2">
            <Typography variant="body1" className="text-gray-600 dark:text-gray-300 mb-4">
              {atelier.description}
            </Typography>
            <Divider className="my-4" />
            <Box className="space-y-4">
              <Box className="flex items-center">
                <Calendar className="mr-2 text-gray-500" size={20} />
                <Typography variant="body2">
                  <strong>Date :</strong>{' '}
                  {new Date(atelier.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
              <Box className="flex items-center">
                <Clock className="mr-2 text-gray-500" size={20} />
                <Typography variant="body2">
                  <strong>Durée :</strong> {atelier.duree} heures
                </Typography>
              </Box>
              <Box className="flex items-center">
                <Users className="mr-2 text-gray-500" size={20} />
                <Typography variant="body2">
                  <strong>Places disponibles :</strong> {atelier.places_disponibles} /{' '}
                  {atelier.places_totales}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <Typography variant="h6" className="mb-4 text-center">
              <strong>Prix :</strong> {atelier.prix} FCFA
            </Typography>
            {atelier.places_disponibles > 0 && atelier.is_active ? (
              isInscrit ? (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={handleDesinscription}
                  disabled={loading}
                  startIcon={<ShoppingCart />}
                >
                  Se désinscrire
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleInscription}
                  disabled={loading}
                  startIcon={<ShoppingCart />}
                >
                  S’inscrire
                </Button>
              )
            ) : (
              <Typography variant="body2" className="text-red-500 text-center">
                {atelier.is_active ? 'Complet' : 'Atelier annulé'}
              </Typography>
            )}
            {error && (
              <Alert severity="error" className="mt-4">
                {error}
              </Alert>
            )}
          </Box>
        </Box>
        <Box className="mt-8">
          <Button
            variant="text"
            onClick={() => navigate('/ateliers')}
            startIcon={<ChevronRight className="rotate-180" />}
          >
            Retour à la liste des ateliers
          </Button>
        </Box>
      </Container>
    </motion.div>
  );
};

export default AtelierDetailPage;