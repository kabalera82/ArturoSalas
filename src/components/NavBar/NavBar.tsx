import { useState } from 'react';
import './NavBar.css';
import menu from '../../assets/menu.png';
import { NavLinks } from '../shared/NavLinks/NavLinks';
import { Button } from '../shared/Button/Button';
import { navItems } from './navItems';

export const NavBar = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className='navbar'>

      <div className='navbar_deco'>
        <a className='navbar_brand' href='#inicio'>ARTURO SALAS</a>
        <a className='navbar_goals' href='#inicio'>BJJ ENTRENADOR</a>
      </div>

      <nav className={`navbar_menu ${isMenuOpen ? 'open' : ''}`}>
        <NavLinks items={navItems} activeHref='#inicio' onLinkClick={closeMenu} />
      </nav>

      <div className='navbar_actions'>
        <button
          className='navbar_toggle'
          type='button'
          aria-label='Abrir o cerrar menú'
          onClick={toggleMenu}
        >
          <img src={menu} alt='Menú' className='navbar_toggle-icon' />
        </button>

        <Button variant='cta'>Mi cuenta &gt;</Button>
      </div>

    </header>
  );
};
