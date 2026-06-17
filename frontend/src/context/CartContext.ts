import { createContext, useContext } from 'react';
import type { ItemCarrito, ContextoCarrito } from '../types/carrito.types';

export const CartContext = createContext<ContextoCarrito | null>(null);

export const useCarrito = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de CartProvider');
  return ctx;
};
