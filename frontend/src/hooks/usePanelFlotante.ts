import { useState, useRef, useEffect } from 'react';

export const usePanelFlotante = () => {
  const [abierto, setAbierto]     = useState(false);
  const refContenedor             = useRef<HTMLDivElement>(null);

  const alternar = () => setAbierto((v) => !v);
  const cerrar   = () => setAbierto(false);

  useEffect(() => {
    const alClickFuera = (e: MouseEvent) => {
      if (refContenedor.current && !refContenedor.current.contains(e.target as Node)) {
        cerrar();
      }
    };
    if (abierto) {
      document.addEventListener('mousedown', alClickFuera);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', alClickFuera);
      document.body.style.overflow = '';
    };
  }, [abierto]);

  return { abierto, alternar, cerrar, refContenedor };
};
