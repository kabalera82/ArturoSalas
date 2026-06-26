import type { Usuario } from '../../types/auth.types';

export type AccountSectionId =
  | 'personal'
  | 'orders'
  | 'customer-sports'
  | 'membership'
  | 'cart'
  | 'admin-users'
  | 'admin-products';

export interface AccountSectionItem {
  id: AccountSectionId;
  label: string;
  adminOnly?: boolean;
  visible: (usuario: Usuario) => boolean;
}

export const accountSections: AccountSectionItem[] = [
  { id: 'personal', label: 'Datos personales', visible: () => true },
  { id: 'orders', label: 'Pedidos', visible: () => true },
  { id: 'customer-sports', label: 'Cliente y deportista', visible: () => true },
  {
    id: 'membership',
    label: 'Cuotas',
    visible: (usuario) => usuario.role === 'admin' || Boolean(usuario.customer?.isCustomer),
  },
  { id: 'cart', label: 'Tienda', visible: () => true },
  {
    id: 'admin-users',
    label: 'Administración',
    adminOnly: true,
    visible: (usuario) => usuario.role === 'admin',
  },
  {
    id: 'admin-products',
    label: 'Productos',
    adminOnly: true,
    visible: (usuario) => usuario.role === 'admin',
  },
];
