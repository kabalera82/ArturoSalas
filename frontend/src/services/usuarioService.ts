import type { RespuestaLogin, Usuario, UsuarioInput } from '../types/auth.types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const headersConToken = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const leerRespuesta = async <T>(res: Response): Promise<T> => {
  const datos = await res.json();

  if (!res.ok) {
    throw new Error(datos.error ?? 'Error en la petición');
  }

  return datos;
};

export const login = async (username: string, password: string): Promise<RespuestaLogin> => {
  const res = await fetch(`${BASE}/users/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, password }),
  });

  return leerRespuesta<RespuestaLogin>(res);
};

export const obtenerMiUsuario = async (token: string): Promise<Usuario> => {
  const res = await fetch(`${BASE}/users/me`, {
    headers: headersConToken(token),
  });

  return leerRespuesta<Usuario>(res);
};

export const obtenerUsuarios = async (token: string): Promise<Usuario[]> => {
  const res = await fetch(`${BASE}/users`, {
    headers: headersConToken(token),
  });

  return leerRespuesta<Usuario[]>(res);
};

export const crearUsuario = async (token: string, usuario: UsuarioInput): Promise<Usuario> => {
  const res = await fetch(`${BASE}/users`, {
    method:  'POST',
    headers: headersConToken(token),
    body:    JSON.stringify(usuario),
  });

  return leerRespuesta<Usuario>(res);
};

export const actualizarUsuario = async (token: string, id: string, usuario: UsuarioInput): Promise<Usuario> => {
  const res = await fetch(`${BASE}/users/${id}`, {
    method:  'PUT',
    headers: headersConToken(token),
    body:    JSON.stringify(usuario),
  });

  return leerRespuesta<Usuario>(res);
};

export const eliminarUsuario = async (token: string, id: string): Promise<{ message: string }> => {
  const res = await fetch(`${BASE}/users/${id}`, {
    method:  'DELETE',
    headers: headersConToken(token),
  });

  return leerRespuesta<{ message: string }>(res);
};
