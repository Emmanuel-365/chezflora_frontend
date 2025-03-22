// types.ts
export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    is_banned: boolean;
  }
  
  export interface Atelier {
    id: string;
    nom: string;
    description: string;
    date: string;
    duree: number;
    prix: number;
    places_disponibles: number;
    places_totales: number;
    is_active: boolean;
    participants: { utilisateur: string; date_inscription: string; statut: string }[];
  }
  
  // Typage pour le token JWT (retour de /token/)
  export interface TokenResponse {
    access: string;
    refresh: string;
  }
  
  // Typage pour les erreurs API
  export interface ApiError {
    detail?: string;
    error?: string;
    [key: string]: any;
  }