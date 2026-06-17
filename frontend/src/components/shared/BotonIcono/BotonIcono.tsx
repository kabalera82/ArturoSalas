import './BotonIcono.css';

interface Props {
  icono: string;
  etiqueta: string;
  alHacer: () => void;
  insignia?: number;
}

export const BotonIcono = ({ icono, etiqueta, alHacer, insignia }: Props) => (
  <button className='boton-icono' type='button' aria-label={etiqueta} onClick={alHacer}>
    <img src={icono} alt='' className='boton-icono__img' />
    {insignia != null && insignia > 0 && (
      <span className='boton-icono__insignia'>{insignia > 99 ? '99+' : insignia}</span>
    )}
  </button>
);
