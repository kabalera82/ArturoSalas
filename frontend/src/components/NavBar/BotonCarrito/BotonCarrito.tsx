import { useCarrito }        from '../../../context/CartContext';
import { usePanelFlotante }  from '../../../hooks/usePanelFlotante';
import { BotonIcono }        from '../../shared/BotonIcono/BotonIcono';
import bolsa                 from '../../../assets/shopping_bag_34dp_1F1F1F_FILL0_wght400_GRAD0_opsz40.svg';
import './BotonCarrito.css';

export const BotonCarrito = () => {
  const { items, totalItems, estaVacio, totalPrecio, quitarItem, disminuirCantidad, aumentarCantidad, vaciarCarrito } = useCarrito();
  const { abierto, alternar, cerrar, refContenedor } = usePanelFlotante();

  return (
    <div className='boton-carrito' ref={refContenedor}>
      <BotonIcono icono={bolsa} etiqueta='Ver carrito' alHacer={alternar} insignia={totalItems} />

      {abierto && (
        <div className='panel-lateral'>
          <div className='panel-lateral__cabecera'>
            <p className='panel-lateral__titulo'>Carrito</p>
            <button className='panel-lateral__cerrar' type='button' onClick={cerrar} aria-label='Cerrar carrito'>✕</button>
          </div>

          {estaVacio ? (
            <p className='boton-carrito__vacio'>Tu carrito está vacío</p>
          ) : (
            <>
              <ul className='boton-carrito__lista'>
                {items.map((item) => (
                  <li key={item.codigoArticulo} className='boton-carrito__item'>
                    <div className='boton-carrito__item-info'>
                      <span className='boton-carrito__item-nombre'>{item.nombre}</span>
                      <span className='boton-carrito__item-precio'>{(item.precio * item.cantidad).toFixed(2)} €</span>
                    </div>
                    <div className='boton-carrito__item-derecha'>
                      <img src={item.imagen} alt={item.nombre} className='boton-carrito__item-img' />
                      <div className='boton-carrito__item-controles'>
                        <button type='button' className='boton-carrito__qty-btn' aria-label='Disminuir' onClick={() => disminuirCantidad(item.codigoArticulo)}>−</button>
                        <span className='boton-carrito__qty-num'>{item.cantidad}</span>
                        <button type='button' className='boton-carrito__qty-btn' aria-label='Aumentar' onClick={() => aumentarCantidad(item.codigoArticulo)}>+</button>
                      </div>
                    </div>
                    <button className='boton-carrito__item-quitar' type='button' aria-label={`Quitar ${item.nombre}`} onClick={() => quitarItem(item.codigoArticulo)}>✕</button>
                  </li>
                ))}
              </ul>

              <div className='boton-carrito__footer'>
                <div className='boton-carrito__total-fila'>
                  <span className='boton-carrito__total-label'>Total</span>
                  <span className='boton-carrito__total-precio'>{totalPrecio.toFixed(2)} €</span>
                </div>
                <button className='boton-carrito__vaciar' type='button' onClick={() => { vaciarCarrito(); cerrar(); }}>
                  Vaciar carrito
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
