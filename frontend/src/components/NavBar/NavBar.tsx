import { useState, useRef, useEffect } from 'react';
import './NavBar.css';
import { navItems } from './navItems';
import menu from '../../assets/menu.png';
import { NavLinks } from '../shared/NavLinks/NavLinks';
import { Button } from '../shared/Button/Button';
import { LoginPanel } from './LoginPanel/LoginPanel';
import { useAuth } from '../../context/AuthContext';

export const NavBar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen]   = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggleMenu  = () => setIsMenuOpen((v) => !v);
  const closeMenu   = () => setIsMenuOpen(false);
  const togglePanel = () => setIsPanelOpen((v) => !v);
  const closePanel  = () => setIsPanelOpen(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closePanel();
      }
    };
    if (isPanelOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPanelOpen]);

  return (
    <header className='navbar'>

      <div className='navbar_deco'>
        <a className='navbar_brand' href='#inicio'>ARTURO SALAS</a>
        <a className='navbar_goals' href='#inicio'>BJJ ENTRENADOR</a>
      </div>

      <nav className={`navbar_menu ${isMenuOpen ? 'open' : ''}`}>
        <NavLinks items={navItems} activeHref='#inicio' onLinkClick={closeMenu} />
      </nav>

      <div className='navbar_actions' ref={panelRef}>
        <button
          className='navbar_toggle'
          type='button'
          aria-label='Abrir o cerrar menú'
          onClick={toggleMenu}
        >
          <img src={menu} alt='Menú' className='navbar_toggle-icon' />
        </button>

        {isAuthenticated ? (
          <div className='navbar_user'>
            <span className='navbar_username'>{user?.username}</span>
            <Button variant='cta' onClick={logout}>Salir</Button>
          </div>
        ) : (
          <Button variant='cta' onClick={togglePanel}>Mi cuenta &gt;</Button>
        )}

        {isPanelOpen && !isAuthenticated && <LoginPanel onClose={closePanel} />}
      </div>

    </header>
  );
};
