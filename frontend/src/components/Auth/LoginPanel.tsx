import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/usuarioService';
import './LoginPanel.css';

interface Props {
  alCerrar: () => void;
}

export const LoginPanel = ({ alCerrar }: Props) => {
  const { iniciarSesion }                  = useAuth();
  const [usuario, setUsuario]              = useState('');
  const [contrasena, setContrasena]        = useState('');
  const [error, setError]                  = useState('');
  const [cargando, setCargando]            = useState(false);

  const alEnviar = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const datos = await login(usuario, contrasena);
      iniciarSesion(datos.token, datos.user);
      alCerrar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className='login-panel'>
      <p className='login-panel__title'>Iniciar sesión</p>

      <form className='login-panel__form' onSubmit={alEnviar}>
        <input
          className='login-panel__input'
          type='text'
          placeholder='Usuario'
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          autoFocus
        />
        <input
          className='login-panel__input'
          type='password'
          placeholder='Contraseña'
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />

        {error && <p className='login-panel__error'>{error}</p>}

        <button className='login-panel__submit' type='submit' disabled={cargando}>
          {cargando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <a className='login-panel__forgot' href='#forgot'>¿Olvidaste tu contraseña?</a>
    </div>
  );
};
