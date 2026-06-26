import type { Pedido, PedidoEstado, PedidoInput } from '../types/pedido.types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const headersConToken = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const leerData = async <T>(res: Response): Promise<T> => {
  const datos = await res.json();
  if (!res.ok) throw new Error(datos.error ?? 'Error en pedidos');
  return datos.data;
};

export const obtenerPedidos = async (token: string): Promise<Pedido[]> => {
  const res = await fetch(`${BASE}/pedidos`, {
    headers: headersConToken(token),
  });

  return leerData<Pedido[]>(res);
};

export const crearPedido = async (token: string, pedido: PedidoInput): Promise<Pedido> => {
  const res = await fetch(`${BASE}/pedidos`, {
    method: 'POST',
    headers: headersConToken(token),
    body: JSON.stringify(pedido),
  });

  return leerData<Pedido>(res);
};

export const actualizarEstadoPedido = async (
  token: string,
  id: string,
  status: PedidoEstado
): Promise<Pedido> => {
  const res = await fetch(`${BASE}/pedidos/${id}/status`, {
    method: 'PATCH',
    headers: headersConToken(token),
    body: JSON.stringify({ status }),
  });

  return leerData<Pedido>(res);
};
