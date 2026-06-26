import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerMiUsuario } from '../../services/usuarioService';

export const useAccountUser = () => {
  const { token, usuario, actualizarUsuario } = useAuth();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    let activo = true;
    setCargando(true);
    setError('');

    obtenerMiUsuario(token)
      .then((usuarioCompleto) => {
        if (activo) actualizarUsuario(usuarioCompleto);
      })
      .catch((err) => {
        if (activo) setError(err instanceof Error ? err.message : 'No se pudo cargar la cuenta');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [token]);

  return { usuario, cargando, error };
};
