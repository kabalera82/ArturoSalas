export type PedidoEstado =
  | 'pendiente'
  | 'pagado'
  | 'preparando'
  | 'enviado'
  | 'entregado'
  | 'cancelado';

export interface PedidoItem {
  codigoArticulo: number;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface PedidoDireccion {
  calle: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
}

export interface PedidoUsuarioResumen {
  _id?: string;
  id?: string;
  username: string;
  email?: string;
}

export interface Pedido {
  _id?: string;
  id?: string;
  user: string | PedidoUsuarioResumen;
  items: PedidoItem[];
  total: number;
  status: PedidoEstado;
  shippingAddress?: PedidoDireccion;
  createdAt?: string;
  updatedAt?: string;
}

export interface PedidoInput {
  items: PedidoItem[];
  total: number;
  shippingAddress?: PedidoDireccion;
}
