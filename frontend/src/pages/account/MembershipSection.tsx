import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { actualizarUsuario as guardarUsuario } from '../../services/usuarioService';
import type { MembershipStatus, Usuario } from '../../types/auth.types';
import { AccountSection } from './AccountSection';

interface Props {
  token: string;
  usuario: Usuario;
}

const estadosMembresia: MembershipStatus[] = ['inactive', 'active', 'pending', 'expired'];
const fechaInput = (fecha?: string) => fecha?.slice(0, 10) ?? '';

export const MembershipSection = ({ token, usuario }: Props) => {
  const { actualizarUsuario } = useAuth();
  const payments = usuario.membershipPayments ?? [];
  const esAdmin = usuario.role === 'admin';
  const [status, setStatus] = useState<MembershipStatus>(usuario.membership?.status ?? 'inactive');
  const [monthlyFee, setMonthlyFee] = useState(String(usuario.membership?.monthlyFee ?? 0));
  const [currency, setCurrency] = useState(usuario.membership?.currency ?? 'EUR');
  const [startDate, setStartDate] = useState(fechaInput(usuario.membership?.startDate));
  const [nextDueDate, setNextDueDate] = useState(fechaInput(usuario.membership?.nextDueDate));
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const usuarioId = usuario._id ?? usuario.id;

  useEffect(() => {
    setStatus(usuario.membership?.status ?? 'inactive');
    setMonthlyFee(String(usuario.membership?.monthlyFee ?? 0));
    setCurrency(usuario.membership?.currency ?? 'EUR');
    setStartDate(fechaInput(usuario.membership?.startDate));
    setNextDueDate(fechaInput(usuario.membership?.nextDueDate));
  }, [usuario]);

  const guardar = async () => {
    if (!usuarioId || !esAdmin) return;

    const fee = Number(monthlyFee);
    if (!Number.isFinite(fee)) {
      setError('La cuota mensual debe ser numérica');
      return;
    }

    setGuardando(true);
    setMensaje('');
    setError('');

    try {
      const usuarioActualizado = await guardarUsuario(token, usuarioId, {
        membership: {
          status,
          monthlyFee: fee,
          currency: currency.trim() || 'EUR',
          startDate: startDate || undefined,
          nextDueDate: nextDueDate || undefined,
        },
      });

      actualizarUsuario(usuarioActualizado);
      setMensaje('Cuota actualizada correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la cuota');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AccountSection
      title='Cuotas'
      description={esAdmin ? 'Estado actual de cuota editable por administración.' : 'Estado actual de cuota e historial de pagos.'}
    >
      {esAdmin ? (
        <form className='admin-form' onSubmit={(e) => e.preventDefault()}>
          <div className='admin-form__grid'>
            <label className='admin-form__field'>
              <span>Estado</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as MembershipStatus)}>
                {estadosMembresia.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
              </select>
            </label>

            <label className='admin-form__field'>
              <span>Cuota mensual</span>
              <input value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} inputMode='decimal' />
            </label>

            <label className='admin-form__field'>
              <span>Moneda</span>
              <input value={currency} onChange={(e) => setCurrency(e.target.value)} />
            </label>

            <label className='admin-form__field'>
              <span>Inicio</span>
              <input value={startDate} onChange={(e) => setStartDate(e.target.value)} type='date' />
            </label>

            <label className='admin-form__field'>
              <span>Próximo vencimiento</span>
              <input value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} type='date' />
            </label>
          </div>

          <div className='account-actions-row'>
            <button className='account-action primary' type='button' onClick={guardar} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar cuota'}
            </button>
          </div>
        </form>
      ) : (
        <dl className='account-grid'>
          <div><dt>Estado</dt><dd>{usuario.membership?.status ?? 'Sin estado'}</dd></div>
          <div><dt>Cuota mensual</dt><dd>{usuario.membership?.monthlyFee ?? 0} {usuario.membership?.currency ?? 'EUR'}</dd></div>
          <div><dt>Inicio</dt><dd>{usuario.membership?.startDate ? new Date(usuario.membership.startDate).toLocaleDateString() : 'Sin fecha'}</dd></div>
          <div><dt>Próximo vencimiento</dt><dd>{usuario.membership?.nextDueDate ? new Date(usuario.membership.nextDueDate).toLocaleDateString() : 'Sin fecha'}</dd></div>
        </dl>
      )}

      <h3 className='account-subtitle'>Pagos</h3>
      {payments.length === 0 ? (
        <p className='account-empty'>No hay pagos registrados.</p>
      ) : (
        <div className='account-card-list'>
          {payments.map((payment) => (
            <article className='account-card' key={payment._id ?? payment.period}>
              <h3>{payment.period}</h3>
              <p>{payment.amount} {payment.currency} · {payment.status}</p>
              <p>Vence: {new Date(payment.dueDate).toLocaleDateString()}</p>
              {payment.paidAt && <p>Pagado: {new Date(payment.paidAt).toLocaleDateString()}</p>}
              {payment.paymentMethod && <p>Método: {payment.paymentMethod}</p>}
              {payment.notes && <p>{payment.notes}</p>}
            </article>
          ))}
        </div>
      )}

      {mensaje && <p className='account-message'>{mensaje}</p>}
      {error && <p className='account-error'>{error}</p>}
    </AccountSection>
  );
};
