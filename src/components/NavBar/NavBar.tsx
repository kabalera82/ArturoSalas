import { useState } from 'react';
import './NavBar.css';
import { navItems } from './navItems';
import menu from '../../assets/menu.png';

export const NavBar = () => {

// Visibilidad del menú en dispositivos móviles
const [isMenuOpen, setIsMenuOpen] = useState(false);

// Alternar vista del menú en móviles
const toggleMenu = () => {
  setIsMenuOpen((currentValue) => !currentValue);
};

// Cerrar el menú
const closeMenu = () => {
  setIsMenuOpen(false);
}

  return (
    <header className='navbar'>
      <div className='navbar_deco'>
        <a className='navbar_brand' href='#inicio' aria-label='Ir al inicio'>ARTURO SALAS</a>
        <a className='navbar_goals' href='#inicio' aria-label='Ir al inicio'>BJJ ENTRENADOR</a>
      </div>
      

    
      <nav 
        id='main-navigation'
        className={`navbar_menu ${isMenuOpen ? 'open' : ''}`}
        aria-label='Navegación principal'
      >
        <ul className='navbar_list'>
          {navItems.map((item) => (
            <li className= "navbar_item" key={item.href}>
              <a className='navbar_link' href={item.href} onClick= {closeMenu}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <button className='navbar_toggle'
        type='button'
        aria-label='Abrir o cerrar menú'
        aria-expanded={isMenuOpen}
        aria-controls="main-navigation"
        onClick={toggleMenu}
      >
        <img src={menu} alt='Abrir menú' className='navbar_toggle-icon' />
      </button>

    </header>

  )


}