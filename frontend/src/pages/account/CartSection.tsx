import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCarrito } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { crearPedido } from '../../services/pedidoService';
import { AccountSection } from './AccountSection';

export const CartSection = () => {
  const { token, usuario } = useAuth();
  const {
    items,
    estaVacio,
    totalItems,
    totalPrecio,
    aumentarCantidad,
    disminuirCantidad,
    quitarItem,
    vaciarCarrito,
  } = useCarrito();
  const [comprando, setComprando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const comprar = async () => {
    if (!token) return;

    setComprando(true);
    setMensaje('');
    setError('');

    try {
      const direccion = usuario?.profile?.addresses?.find((address) => address.esPredeterminada)
        ?? usuario?.profile?.addresses?.[0];

      await crearPedido(token, {
        items: items.map((item) => ({
          codigoArticulo: item.codigoArticulo,
          name: item.nombre,
          quantity: item.cantidad,
          price: item.precio,
          image: item.imagen,
        })),
        total: totalPrecio,
        shippingAddress: direccion
          ? {
            calle: direccion.calle,
            ciudad: direccion.ciudad,
            provincia: direccion.provincia,
            codigoPostal: direccion.codigoPostal,
            pais: direccion.pais,
          }
          : undefined,
      });

      vaciarCarrito();
      setMensaje('Pedido creado correctamente. Podés verlo en la sección Pedidos.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el pedido');
    } finally {
      setComprando(false);
    }
  };

  return (
    <AccountSection title='Tienda y carrito' description='Productos que tenés preparados para comprar.'>
      {estaVacio ? (
        <div className='account-store-empty'>
          <p className='account-empty'>Tu carrito está vacío.</p>
          <Link className='account-link' to='/shop'>Ir a la tienda</Link>
        </div>
      ) : (
        <>
          <div className='account-card-list'>
            {items.map((item) => (
              <article className='account-card account-cart-item' key={item.codigoArticulo}>
                {item.imagen && <img src={item.imagen} alt={item.nombre} />}
                <div>
                  <h3>{item.nombre}</h3>
                  <p>{item.precio.toFixed(2)} € · Stock {item.stock}</p>
                  <div className='account-cart-item__actions'>
                    <button type='button' onClick={() => disminuirCantidad(item.codigoArticulo)}>-</button>
                    <span>{item.cantidad}</span>
                    <button type='button' onClick={() => aumentarCantidad(item.codigoArticulo)}>+</button>
                    <button type='button' onClick={() => quitarItem(item.codigoArticulo)}>Quitar</button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className='account-cart-summary'>
            <p>Total productos: <strong>{totalItems}</strong></p>
            <p>Total: <strong>{totalPrecio.toFixed(2)} €</strong></p>
            <div className='account-cart-summary__actions'>
              <button className='account-action primary' type='button' onClick={comprar} disabled={comprando}>
                {comprando ? 'Creando pedido...' : 'Comprar'}
              </button>
              <button className='account-action danger' type='button' onClick={vaciarCarrito}>
                Vaciar carrito
              </button>
            </div>
          </div>
        </>
      )}
      {mensaje && <p className='account-message'>{mensaje}</p>}
      {error && <p className='account-error'>{error}</p>}
    </AccountSection>
  );
};
