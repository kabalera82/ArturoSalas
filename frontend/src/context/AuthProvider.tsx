import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { Usuario } from '../types/auth.types';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken]       = useState<string | null>(() => localStorage.getItem('token'));
  const [usuario, setUsuario]   = useState<Usuario | null>(() => {
    const almacenado = localStorage.getItem('usuario');
    return almacenado ? JSON.parse(almacenado) : null;
  });

  const iniciarSesion = (nuevoToken: string, nuevoUsuario: Usuario) => {
    localStorage.setItem('token', nuevoToken);
    localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, iniciarSesion, cerrarSesion, estaAutenticado: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};
