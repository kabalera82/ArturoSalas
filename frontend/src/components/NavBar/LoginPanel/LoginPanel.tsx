import { useState, FormEvent } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './LoginPanel.css';

interface Props {
  onClose: () => void;
}

export const LoginPanel = ({ onClose }: Props) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Error al iniciar sesión');
        return;
      }

      login(data.token, data.user);
      onClose();
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-panel'>
      <p className='login-panel__title'>Iniciar sesión</p>

      <form className='login-panel__form' onSubmit={handleSubmit}>
        <input
          className='login-panel__input'
          type='text'
          placeholder='Usuario'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
        />
        <input
          className='login-panel__input'
          type='password'
          placeholder='Contraseña'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className='login-panel__error'>{error}</p>}

        <button className='login-panel__submit' type='submit' disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <a className='login-panel__forgot' href='#forgot'>¿Olvidaste tu contraseña?</a>
    </div>
  );
};
