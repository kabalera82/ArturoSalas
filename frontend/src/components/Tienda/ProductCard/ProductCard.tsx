import { useCarrito }          from '../../../context/CartContext';
import type { ProductoTienda } from '../../../types/producto.types';
import './ProductCard.css';

type Props = { producto: ProductoTienda };

export const ProductCard = ({ producto }: Props) => {
  const { agregarItem, items } = useCarrito();

  const enCarrito        = items.find((i) => i.codigoArticulo === producto.codigoArticulo);
  const cantidadEnCarrito = enCarrito?.cantidad ?? 0;
  const sinStock          = producto.stock === 0;
  const limiteAlcanzado   = cantidadEnCarrito >= producto.stock;

  const alAnadir = () => {
    if (limiteAlcanzado) return;
    agregarItem({
      codigoArticulo: producto.codigoArticulo,
      nombre:         producto.name,
      precio:         producto.price,
      imagen:         producto.imagenes[0] ?? '',
      stock:          producto.stock,
    });
  };

  return (
    <div className='product-card'>
      {producto.imagenes[0] && (
        <img
          className='product-card__img'
          src={producto.imagenes[0]}
          alt={producto.name}
        />
      )}

      {producto.stock > 0 && producto.stock <= 3 && (
        <span className='product-card__badge'>Últimas {producto.stock}</span>
      )}
      {sinStock && (
        <span className='product-card__badge'>Agotado</span>
      )}

      <div className='product-card__body'>
        {producto.marca && (
          <span className='product-card__marca'>{producto.marca}</span>
        )}
        <h3 className='product-card__nombre'>{producto.name}</h3>
        <p className='product-card__descripcion'>{producto.description}</p>

        <div className='product-card__footer'>
          <span className='product-card__precio'>{producto.price.toFixed(2)} €</span>
          <button
            className='product-card__btn'
            type='button'
            onClick={alAnadir}
            disabled={sinStock || limiteAlcanzado}
          >
            {sinStock ? 'Agotado' : limiteAlcanzado ? 'Máx.' : 'Añadir'}
          </button>
        </div>
      </div>
    </div>
  );
};
