import { useEffect, useMemo, useState } from 'react';
import type { ProductoTienda } from '../../types/producto.types';
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  obtenerProductos,
  subirImagenesProducto,
} from '../../services/productoService';
import { AccountSection } from './AccountSection';

interface Props {
  token: string;
}

interface ProductoFormState {
  codigoArticulo: string;
  name: string;
  price: string;
  stock: string;
  category: string;
  subcategoria: string;
  marca: string;
  description: string;
  tags: string;
}

const productoVacio: ProductoFormState = {
  codigoArticulo: '9001',
  name: '',
  price: '0',
  stock: '0',
  category: 'ACCESORIOS',
  subcategoria: 'General',
  marca: 'Artur Salas',
  description: '',
  tags: '',
};

const productoAFormulario = (producto: ProductoTienda): ProductoFormState => ({
  codigoArticulo: String(producto.codigoArticulo),
  name: producto.name,
  price: String(producto.price),
  stock: String(producto.stock),
  category: producto.category,
  subcategoria: producto.subcategoria,
  marca: producto.marca,
  description: producto.description,
  tags: producto.tags.join(', '),
});

const textoPorComasALista = (texto: string) => texto.split(',').map((valor) => valor.trim()).filter(Boolean);

export const AdminProductsSection = ({ token }: Props) => {
  const [productos, setProductos] = useState<ProductoTienda[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoTienda | null>(null);
  const [formulario, setFormulario] = useState<ProductoFormState>(productoVacio);
  const [modo, setModo] = useState<'crear' | 'editar'>('crear');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState<File[]>([]);

  const productosOrdenados = useMemo(
    () => [...productos].sort((a, b) => a.codigoArticulo - b.codigoArticulo),
    [productos]
  );

  const cargarProductos = async () => {
    setCargando(true);
    setError('');
    try {
      const datos = await obtenerProductos();
      setProductos(datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar productos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const actualizarCampo = (campo: keyof ProductoFormState, valor: string) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  };

  const prepararCreacion = () => {
    setModo('crear');
    setProductoSeleccionado(null);
    setFormulario(productoVacio);
    setImagenesSeleccionadas([]);
    setMensaje('');
    setError('');
  };

  const seleccionarProducto = (producto: ProductoTienda) => {
    setModo('editar');
    setProductoSeleccionado(producto);
    setFormulario(productoAFormulario(producto));
    setImagenesSeleccionadas([]);
    setMensaje('');
    setError('');
  };

  const seleccionarProductoPorCodigo = (codigo: string) => {
    const producto = productosOrdenados.find((item) => String(item.codigoArticulo) === codigo);
    if (producto) seleccionarProducto(producto);
  };

  const crearPayload = (): Partial<ProductoTienda> => {
    const codigoArticulo = Number(formulario.codigoArticulo);
    const price = Number(formulario.price);
    const stock = Number(formulario.stock);

    if (!Number.isFinite(codigoArticulo)) throw new Error('El código debe ser numérico');
    if (!formulario.name.trim()) throw new Error('El nombre es obligatorio');
    if (!Number.isFinite(price)) throw new Error('El precio debe ser numérico');
    if (!Number.isFinite(stock)) throw new Error('El stock debe ser numérico');

    return {
      codigoArticulo,
      name: formulario.name.trim(),
      price,
      stock,
      category: formulario.category.trim(),
      subcategoria: formulario.subcategoria.trim(),
      marca: formulario.marca.trim(),
      description: formulario.description.trim(),
      tags: textoPorComasALista(formulario.tags),
    };
  };

  const guardar = async () => {
    setMensaje('');
    setError('');
    setGuardando(true);

    try {
      const payload = crearPayload();
      const codigoArticulo = Number(payload.codigoArticulo);

      if (modo === 'crear') {
        await crearProducto(token, payload);
        if (imagenesSeleccionadas.length > 0) {
          await subirImagenesProducto(token, codigoArticulo, imagenesSeleccionadas);
        }
        setMensaje('Producto creado correctamente');
      } else {
        const codigoOriginal = productoSeleccionado?.codigoArticulo;
        if (!codigoOriginal) throw new Error('No hay producto seleccionado');
        const productoActualizado = await actualizarProducto(token, codigoOriginal, payload);
        const codigoParaImagenes = productoActualizado.codigoArticulo;
        if (imagenesSeleccionadas.length > 0) {
          await subirImagenesProducto(token, codigoParaImagenes, imagenesSeleccionadas);
        }
        setMensaje('Producto actualizado correctamente');
      }

      setImagenesSeleccionadas([]);
      await cargarProductos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!productoSeleccionado) return;

    setMensaje('');
    setError('');
    setGuardando(true);

    try {
      await eliminarProducto(token, productoSeleccionado.codigoArticulo);
      prepararCreacion();
      await cargarProductos();
      setMensaje('Producto eliminado correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar producto');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AccountSection title='Administración de tienda' description='CRUD completo de productos con formulario real, sin editar JSON a mano.'>
      <div className='admin-users'>
        <aside className='admin-users__list'>
          <button className='account-action' type='button' onClick={prepararCreacion}>
            Nuevo producto
          </button>

          <label className='admin-form__field'>
            <span>Seleccionar producto</span>
            <select value={productoSeleccionado?.codigoArticulo ?? ''} onChange={(e) => seleccionarProductoPorCodigo(e.target.value)}>
              <option value=''>Elegí un producto</option>
              {productosOrdenados.map((producto) => (
                <option key={producto.codigoArticulo} value={producto.codigoArticulo}>
                  {producto.codigoArticulo} · {producto.name}
                </option>
              ))}
            </select>
          </label>

          {cargando && <p className='account-empty'>Cargando productos...</p>}

          {productosOrdenados.map((producto) => (
            <button
              key={producto.codigoArticulo}
              className={`admin-users__item${producto.codigoArticulo === productoSeleccionado?.codigoArticulo ? ' active' : ''}`}
              type='button'
              onClick={() => seleccionarProducto(producto)}
            >
              <strong>{producto.codigoArticulo} · {producto.name}</strong>
              <span>{producto.category} · {producto.stock} uds.</span>
            </button>
          ))}
        </aside>

        <div className='admin-users__editor'>
          <div className='admin-users__toolbar'>
            <p>{modo === 'crear' ? 'Nuevo producto' : `Editando ${productoSeleccionado?.name}`}</p>
            <div>
              <button className='account-action' type='button' onClick={guardar} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              {modo === 'editar' && (
                <button className='account-action danger' type='button' onClick={eliminar} disabled={guardando}>
                  Eliminar
                </button>
              )}
            </div>
          </div>

          <form className='admin-form' onSubmit={(e) => e.preventDefault()}>
            <div className='admin-form__grid'>
              <label className='admin-form__field'>
                <span>Código</span>
                <input value={formulario.codigoArticulo} onChange={(e) => actualizarCampo('codigoArticulo', e.target.value)} inputMode='numeric' />
              </label>

              <label className='admin-form__field'>
                <span>Nombre</span>
                <input value={formulario.name} onChange={(e) => actualizarCampo('name', e.target.value)} />
              </label>

              <label className='admin-form__field'>
                <span>Precio</span>
                <input value={formulario.price} onChange={(e) => actualizarCampo('price', e.target.value)} inputMode='decimal' />
              </label>

              <label className='admin-form__field'>
                <span>Stock</span>
                <input value={formulario.stock} onChange={(e) => actualizarCampo('stock', e.target.value)} inputMode='numeric' />
              </label>

              <label className='admin-form__field'>
                <span>Categoría</span>
                <input value={formulario.category} onChange={(e) => actualizarCampo('category', e.target.value)} />
              </label>

              <label className='admin-form__field'>
                <span>Subcategoría</span>
                <input value={formulario.subcategoria} onChange={(e) => actualizarCampo('subcategoria', e.target.value)} />
              </label>

              <label className='admin-form__field'>
                <span>Marca</span>
                <input value={formulario.marca} onChange={(e) => actualizarCampo('marca', e.target.value)} />
              </label>

              <label className='admin-form__field admin-form__field--full'>
                <span>Descripción</span>
                <textarea value={formulario.description} onChange={(e) => actualizarCampo('description', e.target.value)} rows={4} />
              </label>

              <label className='admin-form__field admin-form__field--full'>
                <span>Imágenes del producto</span>
                <input
                  accept='image/png,image/jpeg,image/jpg,image/webp'
                  multiple
                  onChange={(e) => setImagenesSeleccionadas(Array.from(e.target.files ?? []))}
                  type='file'
                />
              </label>

              <div className='admin-form__field admin-form__field--full'>
                <span>Imágenes guardadas en Cloudinary</span>
                {productoSeleccionado?.imagenes?.length ? (
                  <div className='admin-product-images'>
                    {productoSeleccionado.imagenes.map((imagen) => (
                      <img key={imagen} src={imagen} alt={productoSeleccionado.name} />
                    ))}
                  </div>
                ) : (
                  <p className='account-empty'>Todavía no hay imágenes guardadas.</p>
                )}
              </div>

              {imagenesSeleccionadas.length > 0 && (
                <div className='admin-form__field admin-form__field--full'>
                  <span>Imágenes listas para subir</span>
                  <div className='admin-product-files'>
                    {imagenesSeleccionadas.map((imagen) => (
                      <p key={`${imagen.name}-${imagen.lastModified}`}>{imagen.name}</p>
                    ))}
                  </div>
                </div>
              )}

              <label className='admin-form__field admin-form__field--full'>
                <span>Tags (separados por comas)</span>
                <input value={formulario.tags} onChange={(e) => actualizarCampo('tags', e.target.value)} />
              </label>
            </div>
          </form>

          {mensaje && <p className='account-message'>{mensaje}</p>}
          {error && <p className='account-error'>{error}</p>}
        </div>
      </div>
    </AccountSection>
  );
};
