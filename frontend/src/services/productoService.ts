import type { ProductoTienda } from '../types/producto.types';
import { API_BASE } from '../config/api';

export const obtenerProductos = async (): Promise<ProductoTienda[]> => {
  const res = await fetch(`${API_BASE}/productos`);
  if (!res.ok) throw new Error('Error al cargar productos');
  const { data } = await res.json();
  return data;
};
