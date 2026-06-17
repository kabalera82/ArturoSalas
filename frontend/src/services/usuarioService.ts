import type { RespuestaLogin } from '../types/auth.types';
import { API_BASE } from '../config/api';

export const login = async (username: string, password: string): Promise<RespuestaLogin> => {
  const res = await fetch(`${API_BASE}/users/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, password }),
  });

  const datos = await res.json();

  if (!res.ok) {
    throw new Error(datos.error ?? 'Error al iniciar sesión');
  }

  return datos;
};
