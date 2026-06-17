import type { ProductoTienda } from '../types/producto.types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const obtenerProductos = async (): Promise<ProductoTienda[]> => {
  const res = await fetch(`${BASE}/productos`);
  if (!res.ok) throw new Error('Error al cargar productos');
  const { data } = await res.json();
  return data;
};
