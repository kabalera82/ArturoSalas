import { createContext, useContext } from 'react';
import type { Usuario } from '../types/auth.types';

export interface ContextoAuth {
  usuario: Usuario | null;
  token: string | null;
  iniciarSesion: (token: string, usuario: Usuario) => void;
  cerrarSesion: () => void;
  estaAutenticado: boolean;
}

export const AuthContext = createContext<ContextoAuth | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
