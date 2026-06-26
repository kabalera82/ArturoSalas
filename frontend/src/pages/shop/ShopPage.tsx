import './ShopPage.css';
import { useState }     from 'react';
import { useProductos } from './useProductos';
import { ProductCard }  from './ProductCard/ProductCard';

const TODAS = 'TODAS';

const labelCategoria = (cat: string) =>
  cat === TODAS ? 'Todo' : cat.replace(/_/g, ' ').toLowerCase();

export const ShopPage = () => {
  const { productos, cargando, error } = useProductos();
  const [categoriaActiva, setCategoriaActiva] = useState(TODAS);

  if (cargando) return <div className='shop'><p className='shop__estado'>Cargando productos...</p></div>;
  if (error)    return <div className='shop'><p className='shop__estado shop__estado--error'>Error: {error}</p></div>;

  const categorias = [TODAS, ...Array.from(new Set(productos.map((p) => p.category)))];

  const productosFiltrados = categoriaActiva === TODAS
    ? productos
    : productos.filter((p) => p.category === categoriaActiva);

  return (
    <div className='shop'>
      <div className='shop__header'>
        <h1 className='shop__titulo'>Tienda</h1>
        <p className='shop__subtitulo'>Equipamiento y ropa de combate</p>
        <span className='shop__acento' />
      </div>

      <div className='shop__filtros'>
        {categorias.map((cat) => (
          <button
            key={cat}
            className={`shop__filtro${categoriaActiva === cat ? ' shop__filtro--activo' : ''}`}
            type='button'
            onClick={() => setCategoriaActiva(cat)}
          >
            {labelCategoria(cat)}
          </button>
        ))}
      </div>

      <div className='shop__grid'>
        {productosFiltrados.map((p) => (
          <ProductCard key={p.codigoArticulo} producto={p} />
        ))}
      </div>
    </div>
  );
};
