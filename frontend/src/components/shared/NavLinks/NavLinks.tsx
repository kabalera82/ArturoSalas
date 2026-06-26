import { Link } from 'react-router-dom';
import type { NavItem } from './navItems';
import './NavLinks.css';

type NavLinksProps = {
  items: NavItem[];
  activeHref?: string;
  onLinkClick?: () => void;
  className?: string;
};

export const NavLinks = ({ items, activeHref, onLinkClick, className }: NavLinksProps) => (
  <ul className={`navlinks_list ${className ?? ''}`}>
    {items.map((item) => {
      const claseActiva = `navlinks_link${item.href === activeHref ? ' active' : ''}`;
      return (
        <li className='navlinks_item' key={item.href}>
          {item.href.startsWith('#') ? (
            <a className={claseActiva} href={item.href} onClick={onLinkClick}>
              {item.label}
            </a>
          ) : (
            <Link className={claseActiva} to={item.href} onClick={onLinkClick}>
              {item.label}
            </Link>
          )}
        </li>
      );
    })}
  </ul>
);
