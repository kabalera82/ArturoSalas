import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { CartContext } from './CartContext';
import type { ItemCarrito } from '../types/carrito.types';

const inicializarCarrito = (): ItemCarrito[] => {
  try {
    const almacenado = localStorage.getItem('carrito');
    return almacenado ? JSON.parse(almacenado) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ItemCarrito[]>(inicializarCarrito);

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items));
  }, [items]);

  const agregarItem = (item: Omit<ItemCarrito, 'cantidad'>) => {
    setItems((prev) => {
      const existente = prev.find((i) => i.codigoArticulo === item.codigoArticulo);
      if (existente) {
        if (existente.cantidad >= item.stock) return prev;
        return prev.map((i) =>
          i.codigoArticulo === item.codigoArticulo ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  };

  const quitarItem = (codigo: number) => {
    setItems((prev) => prev.filter((i) => i.codigoArticulo !== codigo));
  };

  const disminuirCantidad = (codigo: number) => {
    setItems((prev) => {
      const item = prev.find((i) => i.codigoArticulo === codigo);
      if (!item) return prev;
      if (item.cantidad <= 1) return prev.filter((i) => i.codigoArticulo !== codigo);
      return prev.map((i) =>
        i.codigoArticulo === codigo ? { ...i, cantidad: i.cantidad - 1 } : i
      );
    });
  };

  const aumentarCantidad = (codigo: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.codigoArticulo === codigo && i.cantidad < (i.stock ?? Infinity)
          ? { ...i, cantidad: i.cantidad + 1 }
          : i
      )
    );
  };

  const vaciarCarrito = () => setItems([]);

  const totalItems  = useMemo(() => items.reduce((acc, i) => acc + i.cantidad, 0), [items]);
  const estaVacio   = useMemo(() => items.length === 0, [items]);
  const totalPrecio = useMemo(() => items.reduce((acc, i) => acc + i.precio * i.cantidad, 0), [items]);

  return (
    <CartContext.Provider value={{
      items, totalItems, estaVacio, totalPrecio,
      agregarItem, quitarItem, disminuirCantidad, aumentarCantidad, vaciarCarrito,
    }}>
      {children}
    </CartContext.Provider>
  );
};
