import { createContext, useContext } from 'react';
import type { ItemCarrito } from '../types/carrito.types';

export interface ContextoCarrito {
  items:               ItemCarrito[];
  totalItems:          number;
  estaVacio:           boolean;
  totalPrecio:         number;
  agregarItem:         (item: Omit<ItemCarrito, 'cantidad'>) => void;
  quitarItem:          (codigo: number) => void;
  disminuirCantidad:   (codigo: number) => void;
  aumentarCantidad:    (codigo: number) => void;
  vaciarCarrito:       () => void;
}

export const CartContext = createContext<ContextoCarrito | null>(null);

export const useCarrito = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de CartProvider');
  return ctx;
};
