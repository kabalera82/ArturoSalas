import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { actualizarUsuario as guardarUsuario } from '../../services/usuarioService';
import type { ShippingAddress, Usuario } from '../../types/auth.types';
import { AccountSection } from './AccountSection';

interface Props {
  token: string;
  usuario: Usuario;
}

interface PersonalFormState {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl: string;
  addresses: ShippingAddress[];
}

const direccionVacia = (): ShippingAddress => ({
  calle: '',
  ciudad: '',
  provincia: '',
  codigoPostal: '',
  pais: 'España',
  esPredeterminada: false,
});

const crearFormulario = (usuario: Usuario): PersonalFormState => ({
  username: usuario.username,
  email: usuario.email ?? '',
  firstName: usuario.profile?.firstName ?? '',
  lastName: usuario.profile?.lastName ?? '',
  phone: usuario.profile?.phone ?? '',
  avatarUrl: usuario.profile?.avatarUrl ?? '',
  addresses: usuario.profile?.addresses?.length ? usuario.profile.addresses : [{ ...direccionVacia(), esPredeterminada: true }],
});

export const PersonalDataSection = ({ token, usuario }: Props) => {
  const { actualizarUsuario } = useAuth();
  const [formulario, setFormulario] = useState<PersonalFormState>(() => crearFormulario(usuario));
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const usuarioId = usuario._id ?? usuario.id;

  useEffect(() => {
    setFormulario(crearFormulario(usuario));
  }, [usuario]);

  const actualizarCampo = <Campo extends keyof PersonalFormState>(campo: Campo, valor: PersonalFormState[Campo]) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  };

  const actualizarDireccion = <Campo extends keyof ShippingAddress>(
    index: number,
    campo: Campo,
    valor: ShippingAddress[Campo]
  ) => {
    setFormulario((actual) => ({
      ...actual,
      addresses: actual.addresses.map((direccion, actualIndex) =>
        actualIndex === index ? { ...direccion, [campo]: valor } : direccion
      ),
    }));
  };

  const marcarPredeterminada = (index: number) => {
    setFormulario((actual) => ({
      ...actual,
      addresses: actual.addresses.map((direccion, actualIndex) => ({
        ...direccion,
        esPredeterminada: actualIndex === index,
      })),
    }));
  };

  const agregarDireccion = () => {
    setFormulario((actual) => ({
      ...actual,
      addresses: [...actual.addresses, direccionVacia()],
    }));
  };

  const eliminarDireccion = (index: number) => {
    setFormulario((actual) => ({
      ...actual,
      addresses: actual.addresses.filter((_, actualIndex) => actualIndex !== index),
    }));
  };

  const guardar = async () => {
    if (!usuarioId) return;

    setGuardando(true);
    setMensaje('');
    setError('');

    try {
      const usuarioActualizado = await guardarUsuario(token, usuarioId, {
        username: formulario.username.trim(),
        email: formulario.email.trim() || undefined,
        profile: {
          firstName: formulario.firstName.trim(),
          lastName: formulario.lastName.trim(),
          phone: formulario.phone.trim() || undefined,
          avatarUrl: formulario.avatarUrl.trim() || undefined,
          addresses: formulario.addresses
            .filter((direccion) => direccion.calle.trim() || direccion.ciudad.trim() || direccion.codigoPostal.trim())
            .map((direccion) => ({
              ...direccion,
              calle: direccion.calle.trim(),
              ciudad: direccion.ciudad.trim(),
              provincia: direccion.provincia.trim(),
              codigoPostal: direccion.codigoPostal.trim(),
              pais: direccion.pais.trim() || 'España',
            })),
        },
      });

      actualizarUsuario(usuarioActualizado);
      setMensaje('Datos personales actualizados correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar los datos personales');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AccountSection title='Datos personales' description='Datos principales, contacto y direcciones de envío editables.'>
      <form className='admin-form' onSubmit={(e) => e.preventDefault()}>
        <h3>Cuenta</h3>
        <div className='admin-form__grid'>
          <label className='admin-form__field'>
            <span>Usuario</span>
            <input value={formulario.username} onChange={(e) => actualizarCampo('username', e.target.value)} />
          </label>

          <label className='admin-form__field'>
            <span>Email</span>
            <input value={formulario.email} onChange={(e) => actualizarCampo('email', e.target.value)} type='email' />
          </label>

          <label className='admin-form__field'>
            <span>Rol</span>
            <input value={usuario.role} disabled />
          </label>

          <label className='admin-form__field'>
            <span>Estado</span>
            <input value={usuario.status} disabled />
          </label>
        </div>

        <h3>Perfil</h3>
        <div className='admin-form__grid'>
          <label className='admin-form__field'>
            <span>Nombre</span>
            <input value={formulario.firstName} onChange={(e) => actualizarCampo('firstName', e.target.value)} />
          </label>

          <label className='admin-form__field'>
            <span>Apellido</span>
            <input value={formulario.lastName} onChange={(e) => actualizarCampo('lastName', e.target.value)} />
          </label>

          <label className='admin-form__field'>
            <span>Teléfono</span>
            <input value={formulario.phone} onChange={(e) => actualizarCampo('phone', e.target.value)} />
          </label>

          <label className='admin-form__field'>
            <span>Avatar URL</span>
            <input value={formulario.avatarUrl} onChange={(e) => actualizarCampo('avatarUrl', e.target.value)} />
          </label>
        </div>

        <h3>Direcciones</h3>
        <div className='account-card-list'>
          {formulario.addresses.map((direccion, index) => (
            <article className='account-card' key={direccion._id ?? index}>
              <div className='admin-users__toolbar'>
                <p>Dirección {index + 1}</p>
                <button className='account-action danger' type='button' onClick={() => eliminarDireccion(index)}>
                  Eliminar
                </button>
              </div>

              <div className='admin-form__grid'>
                <label className='admin-form__field'>
                  <span>Calle</span>
                  <input value={direccion.calle} onChange={(e) => actualizarDireccion(index, 'calle', e.target.value)} />
                </label>

                <label className='admin-form__field'>
                  <span>Ciudad</span>
                  <input value={direccion.ciudad} onChange={(e) => actualizarDireccion(index, 'ciudad', e.target.value)} />
                </label>

                <label className='admin-form__field'>
                  <span>Provincia</span>
                  <input value={direccion.provincia} onChange={(e) => actualizarDireccion(index, 'provincia', e.target.value)} />
                </label>

                <label className='admin-form__field'>
                  <span>Código postal</span>
                  <input value={direccion.codigoPostal} onChange={(e) => actualizarDireccion(index, 'codigoPostal', e.target.value)} />
                </label>

                <label className='admin-form__field'>
                  <span>País</span>
                  <input value={direccion.pais} onChange={(e) => actualizarDireccion(index, 'pais', e.target.value)} />
                </label>

                <label className='admin-form__field admin-form__field--checkbox'>
                  <input
                    checked={direccion.esPredeterminada}
                    onChange={() => marcarPredeterminada(index)}
                    type='checkbox'
                  />
                  <span>Predeterminada</span>
                </label>
              </div>
            </article>
          ))}
        </div>

        <div className='account-actions-row'>
          <button className='account-action' type='button' onClick={agregarDireccion}>
            Añadir dirección
          </button>
          <button className='account-action primary' type='button' onClick={guardar} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar datos'}
          </button>
        </div>
      </form>

      {mensaje && <p className='account-message'>{mensaje}</p>}
      {error && <p className='account-error'>{error}</p>}
    </AccountSection>
  );
};
