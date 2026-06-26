import { useEffect, useMemo, useState } from 'react';
import { actualizarEstadoPedido, obtenerPedidos } from '../../services/pedidoService';
import type { Pedido, PedidoEstado, PedidoUsuarioResumen } from '../../types/pedido.types';
import type { Usuario } from '../../types/auth.types';
import { AccountSection } from './AccountSection';

interface Props {
  token: string;
  usuario: Usuario;
}

const estadosPedido: PedidoEstado[] = ['pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado'];

const nombreUsuarioPedido = (user: Pedido['user']) => {
  if (typeof user === 'string') return user;
  const usuarioResumen = user as PedidoUsuarioResumen;
  return usuarioResumen.username ?? usuarioResumen.email ?? usuarioResumen._id ?? 'Usuario';
};

export const OrdersSection = ({ token, usuario }: Props) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(false);
  const [guardandoId, setGuardandoId] = useState('');
  const [error, setError] = useState('');

  const esAdmin = usuario.role === 'admin';

  const pedidosOrdenados = useMemo(
    () => [...pedidos].sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? ''))),
    [pedidos]
  );

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError('');

    obtenerPedidos(token)
      .then((datos) => {
        if (activo) setPedidos(datos);
      })
      .catch((err) => {
        if (activo) setError(err instanceof Error ? err.message : 'No se pudieron cargar los pedidos');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [token]);

  const cambiarEstado = async (pedido: Pedido, status: PedidoEstado) => {
    const id = pedido._id ?? pedido.id;
    if (!id) return;

    setGuardandoId(id);
    setError('');

    try {
      const pedidoActualizado = await actualizarEstadoPedido(token, id, status);
      setPedidos((actuales) => actuales.map((item) => ((item._id ?? item.id) === id ? pedidoActualizado : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado del pedido');
    } finally {
      setGuardandoId('');
    }
  };

  return (
    <AccountSection
      title='Pedidos'
      description={esAdmin ? 'Listado de todos los pedidos y su estado.' : 'Listado de tus pedidos y su estado.'}
    >
      {cargando && <p className='account-empty'>Cargando pedidos...</p>}
      {error && <p className='account-error'>{error}</p>}

      {!cargando && pedidosOrdenados.length === 0 ? (
        <p className='account-empty'>No hay pedidos registrados.</p>
      ) : (
        <div className='account-card-list'>
          {pedidosOrdenados.map((pedido) => {
            const id = pedido._id ?? pedido.id ?? String(pedido.createdAt);

            return (
              <article className='account-card account-order-card' key={id}>
                <div className='account-order-card__header'>
                  <div>
                    <h3>Pedido {id.slice(-6).toUpperCase()}</h3>
                    <p>{pedido.createdAt ? new Date(pedido.createdAt).toLocaleString() : 'Sin fecha'}</p>
                    {esAdmin && <p>Usuario: {nombreUsuarioPedido(pedido.user)}</p>}
                  </div>

                  {esAdmin ? (
                    <label className='admin-form__field'>
                      <span>Estado</span>
                      <select
                        value={pedido.status}
                        onChange={(e) => cambiarEstado(pedido, e.target.value as PedidoEstado)}
                        disabled={guardandoId === id}
                      >
                        {estadosPedido.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                      </select>
                    </label>
                  ) : (
                    <span className={`account-status account-status--${pedido.status}`}>{pedido.status}</span>
                  )}
                </div>

                <div className='account-order-card__items'>
                  {pedido.items.map((item) => (
                    <p key={`${id}-${item.codigoArticulo}`}>
                      {item.quantity}x {item.name} · {(item.price * item.quantity).toFixed(2)} €
                    </p>
                  ))}
                </div>

                <strong>Total: {pedido.total.toFixed(2)} €</strong>
              </article>
            );
          })}
        </div>
      )}
    </AccountSection>
  );
};
