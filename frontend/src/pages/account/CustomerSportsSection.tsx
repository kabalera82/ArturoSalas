import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { actualizarUsuario as guardarUsuario } from '../../services/usuarioService';
import type { CustomerOrigin, Usuario } from '../../types/auth.types';
import { AccountSection } from './AccountSection';

interface Props {
  token: string;
  usuario: Usuario;
}

const origenes: CustomerOrigin[] = ['regular', 'athlete', 'admin_created'];
const fechaInput = (fecha?: string) => fecha?.slice(0, 10) ?? '';

export const CustomerSportsSection = ({ token, usuario }: Props) => {
  const { actualizarUsuario } = useAuth();
  const [customerIsCustomer, setCustomerIsCustomer] = useState(usuario.customer?.isCustomer ?? false);
  const [customerOrigin, setCustomerOrigin] = useState<CustomerOrigin>(usuario.customer?.origin ?? 'regular');
  const [customerSince, setCustomerSince] = useState(fechaInput(usuario.customer?.since));
  const [sportsIsAthlete, setSportsIsAthlete] = useState(usuario.sportsProfile?.isAthlete ?? false);
  const [sportsIsFederated, setSportsIsFederated] = useState(usuario.sportsProfile?.isFederated ?? false);
  const [sportsLicenseNumber, setSportsLicenseNumber] = useState(usuario.sportsProfile?.licenseNumber ?? '');
  const [sportsFederationName, setSportsFederationName] = useState(usuario.sportsProfile?.federationName ?? '');
  const [sportsClubName, setSportsClubName] = useState(usuario.sportsProfile?.clubName ?? '');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const usuarioId = usuario._id ?? usuario.id;

  useEffect(() => {
    setCustomerIsCustomer(usuario.customer?.isCustomer ?? false);
    setCustomerOrigin(usuario.customer?.origin ?? 'regular');
    setCustomerSince(fechaInput(usuario.customer?.since));
    setSportsIsAthlete(usuario.sportsProfile?.isAthlete ?? false);
    setSportsIsFederated(usuario.sportsProfile?.isFederated ?? false);
    setSportsLicenseNumber(usuario.sportsProfile?.licenseNumber ?? '');
    setSportsFederationName(usuario.sportsProfile?.federationName ?? '');
    setSportsClubName(usuario.sportsProfile?.clubName ?? '');
  }, [usuario]);

  const guardar = async () => {
    if (!usuarioId) return;

    setGuardando(true);
    setMensaje('');
    setError('');

    try {
      const usuarioActualizado = await guardarUsuario(token, usuarioId, {
        customer: {
          isCustomer: customerIsCustomer,
          origin: customerOrigin,
          since: customerSince || undefined,
        },
        sportsProfile: {
          isAthlete: sportsIsAthlete,
          isFederated: sportsIsFederated,
          licenseNumber: sportsLicenseNumber.trim() || undefined,
          federationName: sportsFederationName.trim() || undefined,
          clubName: sportsClubName.trim() || undefined,
        },
      });

      actualizarUsuario(usuarioActualizado);
      setMensaje('Datos de cliente y perfil deportivo actualizados correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar los datos');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AccountSection
      title='Cliente y deportista'
      description='Datos de relación con la academia, cliente, luchador/deportista y federación.'
    >
      <form className='admin-form' onSubmit={(e) => e.preventDefault()}>
        <h3>Cliente</h3>
        <div className='admin-form__grid'>
          <label className='admin-form__field admin-form__field--checkbox'>
            <input
              checked={customerIsCustomer}
              onChange={(e) => setCustomerIsCustomer(e.target.checked)}
              type='checkbox'
            />
            <span>Es cliente</span>
          </label>

          <label className='admin-form__field'>
            <span>Origen</span>
            <select value={customerOrigin} onChange={(e) => setCustomerOrigin(e.target.value as CustomerOrigin)}>
              {origenes.map((origen) => <option key={origen} value={origen}>{origen}</option>)}
            </select>
          </label>

          <label className='admin-form__field'>
            <span>Cliente desde</span>
            <input value={customerSince} onChange={(e) => setCustomerSince(e.target.value)} type='date' />
          </label>
        </div>

        <h3>Perfil deportivo</h3>
        <div className='admin-form__grid'>
          <label className='admin-form__field admin-form__field--checkbox'>
            <input
              checked={sportsIsAthlete}
              onChange={(e) => setSportsIsAthlete(e.target.checked)}
              type='checkbox'
            />
            <span>Es deportista</span>
          </label>

          <label className='admin-form__field admin-form__field--checkbox'>
            <input
              checked={sportsIsFederated}
              onChange={(e) => setSportsIsFederated(e.target.checked)}
              type='checkbox'
            />
            <span>Federado</span>
          </label>

          <label className='admin-form__field'>
            <span>Nº licencia</span>
            <input value={sportsLicenseNumber} onChange={(e) => setSportsLicenseNumber(e.target.value)} />
          </label>

          <label className='admin-form__field'>
            <span>Federación</span>
            <input value={sportsFederationName} onChange={(e) => setSportsFederationName(e.target.value)} />
          </label>

          <label className='admin-form__field'>
            <span>Club</span>
            <input value={sportsClubName} onChange={(e) => setSportsClubName(e.target.value)} />
          </label>
        </div>

        <div className='account-actions-row'>
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
