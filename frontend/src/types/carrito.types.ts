export interface ItemCarrito {
  codigoArticulo: number;
  nombre:         string;
  precio:         number;
  cantidad:       number;
  imagen:         string;
  stock:          number;
}

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
