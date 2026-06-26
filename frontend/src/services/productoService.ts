import type { ProductoTienda } from '../types/producto.types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const headersConToken = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const leerData = async <T>(res: Response): Promise<T> => {
  const datos = await res.json();
  if (!res.ok) throw new Error(datos.error ?? 'Error en productos');
  return datos.data;
};

export const obtenerProductos = async (): Promise<ProductoTienda[]> => {
  const res = await fetch(`${BASE}/productos`);
  if (!res.ok) throw new Error('Error al cargar productos');
  const { data } = await res.json();
  return data;
};

export const crearProducto = async (token: string, producto: Partial<ProductoTienda>): Promise<ProductoTienda> => {
  const res = await fetch(`${BASE}/productos`, {
    method: 'POST',
    headers: headersConToken(token),
    body: JSON.stringify(producto),
  });

  return leerData<ProductoTienda>(res);
};

export const actualizarProducto = async (
  token: string,
  codigoArticulo: number,
  producto: Partial<ProductoTienda>
): Promise<ProductoTienda> => {
  const res = await fetch(`${BASE}/productos/${codigoArticulo}`, {
    method: 'PUT',
    headers: headersConToken(token),
    body: JSON.stringify(producto),
  });

  return leerData<ProductoTienda>(res);
};

export const eliminarProducto = async (token: string, codigoArticulo: number): Promise<{ message: string }> => {
  const res = await fetch(`${BASE}/productos/${codigoArticulo}`, {
    method: 'DELETE',
    headers: headersConToken(token),
  });

  const datos = await res.json();
  if (!res.ok) throw new Error(datos.error ?? 'Error eliminando producto');
  return { message: datos.message ?? 'Producto eliminado' };
};

export const subirImagenesProducto = async (
  token: string,
  codigoArticulo: number,
  imagenes: File[]
): Promise<ProductoTienda> => {
  const formData = new FormData();
  imagenes.forEach((imagen) => formData.append('imagenes', imagen));

  const res = await fetch(`${BASE}/productos/${codigoArticulo}/imagenes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return leerData<ProductoTienda>(res);
};
