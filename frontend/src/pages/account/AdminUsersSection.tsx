import { useEffect, useMemo, useState } from 'react';
import type {
  CustomerOrigin,
  MembershipStatus,
  ShippingAddress,
  Usuario,
  UsuarioInput,
  UserRole,
  UserStatus,
} from '../../types/auth.types';
import { actualizarUsuario, crearUsuario, eliminarUsuario, obtenerUsuarios } from '../../services/usuarioService';
import { AccountSection } from './AccountSection';

interface Props {
  token: string;
}

interface UsuarioFormState {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl: string;
  addresses: ShippingAddress[];
  customerIsCustomer: boolean;
  customerOrigin: CustomerOrigin;
  customerSince: string;
  sportsIsAthlete: boolean;
  sportsIsFederated: boolean;
  sportsLicenseNumber: string;
  sportsFederationName: string;
  sportsClubName: string;
  membershipStatus: MembershipStatus;
  membershipMonthlyFee: string;
  membershipCurrency: string;
  membershipStartDate: string;
  membershipNextDueDate: string;
}

type UsuarioPayload = UsuarioInput & { password?: string };

const roles: UserRole[] = ['user', 'admin', 'premium'];
const estados: UserStatus[] = ['pendiente', 'activo', 'baneado'];
const origenesCliente: CustomerOrigin[] = ['regular', 'athlete', 'admin_created'];
const estadosMembresia: MembershipStatus[] = ['inactive', 'active', 'pending', 'expired'];

const direccionVacia = (esPredeterminada = false): ShippingAddress => ({
  calle: '',
  ciudad: '',
  provincia: '',
  codigoPostal: '',
  pais: 'España',
  esPredeterminada,
});

const usuarioVacio: UsuarioFormState = {
  username: '',
  email: '',
  password: '',
  role: 'user',
  status: 'activo',
  firstName: '',
  lastName: '',
  phone: '',
  avatarUrl: '',
  addresses: [direccionVacia(true)],
  customerIsCustomer: false,
  customerOrigin: 'regular',
  customerSince: '',
  sportsIsAthlete: false,
  sportsIsFederated: false,
  sportsLicenseNumber: '',
  sportsFederationName: '',
  sportsClubName: '',
  membershipStatus: 'inactive',
  membershipMonthlyFee: '0',
  membershipCurrency: 'EUR',
  membershipStartDate: '',
  membershipNextDueDate: '',
};

const fechaParaInput = (fecha?: string) => fecha?.slice(0, 10) ?? '';

const usuarioAFormulario = (usuario: Usuario): UsuarioFormState => {
  return {
    username: usuario.username,
    email: usuario.email ?? '',
    password: '',
    role: usuario.role,
    status: usuario.status,
    firstName: usuario.profile?.firstName ?? '',
    lastName: usuario.profile?.lastName ?? '',
    phone: usuario.profile?.phone ?? '',
    avatarUrl: usuario.profile?.avatarUrl ?? '',
    addresses: usuario.profile?.addresses?.length ? usuario.profile.addresses : [direccionVacia(true)],
    customerIsCustomer: usuario.customer?.isCustomer ?? false,
    customerOrigin: usuario.customer?.origin ?? 'regular',
    customerSince: fechaParaInput(usuario.customer?.since),
    sportsIsAthlete: usuario.sportsProfile?.isAthlete ?? false,
    sportsIsFederated: usuario.sportsProfile?.isFederated ?? false,
    sportsLicenseNumber: usuario.sportsProfile?.licenseNumber ?? '',
    sportsFederationName: usuario.sportsProfile?.federationName ?? '',
    sportsClubName: usuario.sportsProfile?.clubName ?? '',
    membershipStatus: usuario.membership?.status ?? 'inactive',
    membershipMonthlyFee: String(usuario.membership?.monthlyFee ?? 0),
    membershipCurrency: usuario.membership?.currency ?? 'EUR',
    membershipStartDate: fechaParaInput(usuario.membership?.startDate),
    membershipNextDueDate: fechaParaInput(usuario.membership?.nextDueDate),
  };
};

export const AdminUsersSection = ({ token }: Props) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [formulario, setFormulario] = useState<UsuarioFormState>(usuarioVacio);
  const [modo, setModo] = useState<'crear' | 'editar'>('crear');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const usuarioSeleccionadoId = usuarioSeleccionado?._id ?? usuarioSeleccionado?.id;

  const usuariosOrdenados = useMemo(
    () => [...usuarios].sort((a, b) => a.username.localeCompare(b.username)),
    [usuarios]
  );

  const cargarUsuarios = async () => {
    setCargando(true);
    setError('');
    try {
      const datos = await obtenerUsuarios(token);
      setUsuarios(datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar usuarios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, [token]);

  const actualizarCampo = <Campo extends keyof UsuarioFormState>(campo: Campo, valor: UsuarioFormState[Campo]) => {
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

  const marcarDireccionPredeterminada = (index: number) => {
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

  const seleccionarUsuario = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setModo('editar');
    setFormulario(usuarioAFormulario(usuario));
    setMensaje('');
    setError('');
  };

  const seleccionarUsuarioPorId = (id: string) => {
    const usuario = usuariosOrdenados.find((item) => (item._id ?? item.id ?? item.username) === id);
    if (usuario) seleccionarUsuario(usuario);
  };

  const prepararCreacion = () => {
    setUsuarioSeleccionado(null);
    setModo('crear');
    setFormulario(usuarioVacio);
    setMensaje('');
    setError('');
  };

  const crearPayload = (): UsuarioPayload => {
    if (!formulario.username.trim()) throw new Error('El username es obligatorio');

    const monthlyFee = Number(formulario.membershipMonthlyFee);
    if (!Number.isFinite(monthlyFee)) throw new Error('La cuota mensual debe ser numérica');

    const payload: UsuarioPayload = {
      username: formulario.username.trim(),
      email: formulario.email.trim() || undefined,
      role: formulario.role,
      status: formulario.status,
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
      customer: {
        isCustomer: formulario.customerIsCustomer,
        origin: formulario.customerOrigin,
        since: formulario.customerSince || undefined,
      },
      sportsProfile: {
        isAthlete: formulario.sportsIsAthlete,
        isFederated: formulario.sportsIsFederated,
        licenseNumber: formulario.sportsLicenseNumber.trim() || undefined,
        federationName: formulario.sportsFederationName.trim() || undefined,
        clubName: formulario.sportsClubName.trim() || undefined,
      },
      membership: {
        status: formulario.membershipStatus,
        monthlyFee,
        currency: formulario.membershipCurrency.trim() || 'EUR',
        startDate: formulario.membershipStartDate || undefined,
        nextDueDate: formulario.membershipNextDueDate || undefined,
      },
    };

    if (modo === 'crear' && formulario.password.trim()) {
      payload.password = formulario.password;
    }

    return payload;
  };

  const guardar = async () => {
    setMensaje('');
    setError('');
    setGuardando(true);

    try {
      const payload = crearPayload();

      if (modo === 'crear') {
        await crearUsuario(token, payload);
        setMensaje('Usuario creado correctamente');
      } else {
        if (!usuarioSeleccionadoId) throw new Error('No hay usuario seleccionado');
        await actualizarUsuario(token, usuarioSeleccionadoId, payload);
        setMensaje('Usuario actualizado correctamente');
      }

      await cargarUsuarios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el usuario');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!usuarioSeleccionadoId) return;

    setMensaje('');
    setError('');
    setGuardando(true);

    try {
      await eliminarUsuario(token, usuarioSeleccionadoId);
      prepararCreacion();
      await cargarUsuarios();
      setMensaje('Usuario eliminado correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar usuario');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AccountSection title='Administración de usuarios' description='CRUD completo para admins con formulario real. Nada de JSON pegado a mano: eso era una bomba de mantenimiento.'>
      <div className='admin-users'>
        <aside className='admin-users__list'>
          <button className='account-action' type='button' onClick={prepararCreacion}>
            Nuevo usuario
          </button>

          <label className='admin-form__field'>
            <span>Seleccionar usuario</span>
            <select value={usuarioSeleccionadoId ?? ''} onChange={(e) => seleccionarUsuarioPorId(e.target.value)}>
              <option value=''>Elegí un usuario</option>
              {usuariosOrdenados.map((usuario) => {
                const id = usuario._id ?? usuario.id ?? usuario.username;
                return (
                  <option key={id} value={id}>
                    {usuario.username}
                  </option>
                );
              })}
            </select>
          </label>

          {cargando && <p className='account-empty'>Cargando usuarios...</p>}

          {usuariosOrdenados.map((usuario) => (
            <button
              key={usuario._id ?? usuario.id ?? usuario.username}
              className={`admin-users__item${(usuario._id ?? usuario.id) === usuarioSeleccionadoId ? ' active' : ''}`}
              type='button'
              onClick={() => seleccionarUsuario(usuario)}
            >
              <strong>{usuario.username}</strong>
              <span>{usuario.role} · {usuario.status}</span>
            </button>
          ))}
        </aside>

        <div className='admin-users__editor'>
          <div className='admin-users__toolbar'>
            <p>{modo === 'crear' ? 'Nuevo usuario' : `Editando ${usuarioSeleccionado?.username}`}</p>
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
            <h3>Cuenta</h3>
            <div className='admin-form__grid'>
              <label className='admin-form__field'>
                <span>Username</span>
                <input value={formulario.username} onChange={(e) => actualizarCampo('username', e.target.value)} />
              </label>

              <label className='admin-form__field'>
                <span>Email</span>
                <input value={formulario.email} onChange={(e) => actualizarCampo('email', e.target.value)} type='email' />
              </label>

              {modo === 'crear' && (
                <label className='admin-form__field'>
                  <span>Password inicial (opcional)</span>
                  <input value={formulario.password} onChange={(e) => actualizarCampo('password', e.target.value)} type='password' />
                </label>
              )}

              <label className='admin-form__field'>
                <span>Rol</span>
                <select value={formulario.role} onChange={(e) => actualizarCampo('role', e.target.value as UserRole)}>
                  {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </label>

              <label className='admin-form__field'>
                <span>Estado</span>
                <select value={formulario.status} onChange={(e) => actualizarCampo('status', e.target.value as UserStatus)}>
                  {estados.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                </select>
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
                        onChange={() => marcarDireccionPredeterminada(index)}
                        type='checkbox'
                      />
                      <span>Predeterminada</span>
                    </label>
                  </div>
                </article>
              ))}
            </div>
            <button className='account-action' type='button' onClick={agregarDireccion}>
              Añadir dirección
            </button>

            <h3>Cliente</h3>
            <div className='admin-form__grid'>
              <label className='admin-form__field admin-form__field--checkbox'>
                <input
                  checked={formulario.customerIsCustomer}
                  onChange={(e) => actualizarCampo('customerIsCustomer', e.target.checked)}
                  type='checkbox'
                />
                <span>Es cliente</span>
              </label>

              <label className='admin-form__field'>
                <span>Origen</span>
                <select value={formulario.customerOrigin} onChange={(e) => actualizarCampo('customerOrigin', e.target.value as CustomerOrigin)}>
                  {origenesCliente.map((origen) => <option key={origen} value={origen}>{origen}</option>)}
                </select>
              </label>

              <label className='admin-form__field'>
                <span>Cliente desde</span>
                <input value={formulario.customerSince} onChange={(e) => actualizarCampo('customerSince', e.target.value)} type='date' />
              </label>
            </div>

            <h3>Perfil deportivo</h3>
            <div className='admin-form__grid'>
              <label className='admin-form__field admin-form__field--checkbox'>
                <input
                  checked={formulario.sportsIsAthlete}
                  onChange={(e) => actualizarCampo('sportsIsAthlete', e.target.checked)}
                  type='checkbox'
                />
                <span>Es deportista</span>
              </label>

              <label className='admin-form__field admin-form__field--checkbox'>
                <input
                  checked={formulario.sportsIsFederated}
                  onChange={(e) => actualizarCampo('sportsIsFederated', e.target.checked)}
                  type='checkbox'
                />
                <span>Federado</span>
              </label>

              <label className='admin-form__field'>
                <span>Número de licencia</span>
                <input value={formulario.sportsLicenseNumber} onChange={(e) => actualizarCampo('sportsLicenseNumber', e.target.value)} />
              </label>

              <label className='admin-form__field'>
                <span>Federación</span>
                <input value={formulario.sportsFederationName} onChange={(e) => actualizarCampo('sportsFederationName', e.target.value)} />
              </label>

              <label className='admin-form__field'>
                <span>Club</span>
                <input value={formulario.sportsClubName} onChange={(e) => actualizarCampo('sportsClubName', e.target.value)} />
              </label>
            </div>

            <h3>Membresía</h3>
            <div className='admin-form__grid'>
              <label className='admin-form__field'>
                <span>Estado</span>
                <select value={formulario.membershipStatus} onChange={(e) => actualizarCampo('membershipStatus', e.target.value as MembershipStatus)}>
                  {estadosMembresia.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                </select>
              </label>

              <label className='admin-form__field'>
                <span>Cuota mensual</span>
                <input value={formulario.membershipMonthlyFee} onChange={(e) => actualizarCampo('membershipMonthlyFee', e.target.value)} inputMode='decimal' />
              </label>

              <label className='admin-form__field'>
                <span>Moneda</span>
                <input value={formulario.membershipCurrency} onChange={(e) => actualizarCampo('membershipCurrency', e.target.value)} />
              </label>

              <label className='admin-form__field'>
                <span>Inicio</span>
                <input value={formulario.membershipStartDate} onChange={(e) => actualizarCampo('membershipStartDate', e.target.value)} type='date' />
              </label>

              <label className='admin-form__field'>
                <span>Próximo vencimiento</span>
                <input value={formulario.membershipNextDueDate} onChange={(e) => actualizarCampo('membershipNextDueDate', e.target.value)} type='date' />
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
