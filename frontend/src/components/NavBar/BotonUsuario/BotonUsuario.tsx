import { useAuth } from '../../../context/AuthContext';
import { usePanelFlotante } from '../../../hooks/usePanelFlotante';
import { BotonIcono } from '../../shared/BotonIcono/BotonIcono';
import { LoginPanel } from '../../Auth/LoginPanel';
import persona from '../../../assets/person_34dp_1F1F1F_FILL0_wght400_GRAD0_opsz40.svg';
import './BotonUsuario.css';

export const BotonUsuario = () => {
  const { estaAutenticado, usuario, cerrarSesion } = useAuth();
  const { abierto, alternar, cerrar, refContenedor } = usePanelFlotante();

  return (
    <div className='boton-usuario' ref={refContenedor}>
      <BotonIcono icono={persona} etiqueta='Cuenta de usuario' alHacer={alternar} />

      {abierto && (
        <div className='panel-lateral'>
          <div className='panel-lateral__cabecera'>
            <p className='panel-lateral__titulo'>Mi cuenta</p>
            <button className='panel-lateral__cerrar' type='button' onClick={cerrar} aria-label='Cerrar panel'>✕</button>
          </div>

          {estaAutenticado ? (
            <div className='boton-usuario__autenticado'>
              <p className='boton-usuario__saludo'>Hola, <strong>{usuario?.username}</strong></p>
              <button
                className='boton-usuario__salir'
                type='button'
                onClick={() => { cerrarSesion(); cerrar(); }}
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <LoginPanel alCerrar={cerrar} />
          )}
        </div>
      )}
    </div>
  );
};
