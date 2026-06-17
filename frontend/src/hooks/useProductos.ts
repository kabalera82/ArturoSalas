import { useState, useEffect } from 'react';
import { obtenerProductos }    from '../services/productoService';
import type { ProductoTienda } from '../types/producto.types';

export const useProductos = () => {
  const [productos, setProductos] = useState<ProductoTienda[]>([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    obtenerProductos()
      .then(setProductos)
      .catch((e: Error) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  return { productos, cargando, error };
};
