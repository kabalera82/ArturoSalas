import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';
import { navItems } from '../../data/navItems';
import menu from '../../assets/menu.png';
import { NavLinks } from '../shared/NavLinks/NavLinks';
import { BotonUsuario } from './BotonUsuario/BotonUsuario';
import { BotonCarrito } from './BotonCarrito/BotonCarrito';

export const NavBar = () => {
  const { pathname } = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const alternarMenu = () => setMenuAbierto((v) => !v);
  const cerrarMenu   = () => setMenuAbierto(false);

  return (
    <header className='navbar'>

      <div className='navbar_deco'>
        <Link className='navbar_brand' to='/'>ARTURO SALAS</Link>
        <Link className='navbar_goals' to='/'>BJJ ENTRENADOR</Link>
      </div>

      <nav className={`navbar_menu ${menuAbierto ? 'open' : ''}`}>
        <NavLinks items={navItems} activeHref={pathname} onLinkClick={cerrarMenu} />
      </nav>

      <div className='navbar_actions'>
        <button
          className='navbar_toggle'
          type='button'
          aria-label='Abrir o cerrar menú'
          onClick={alternarMenu}
        >
          <img src={menu} alt='Menú' className='navbar_toggle-icon' />
        </button>

        <BotonUsuario />
        <BotonCarrito />
      </div>

    </header>
  );
};
