import './Footer.css';
import { useLocation } from 'react-router-dom';
import { NavLinks } from '../shared/NavLinks/NavLinks';
import { navItems } from '../shared/NavLinks/navItems';
import { footItems } from './footItems';

export const Footer = () => {
  const { pathname } = useLocation();

  return (
    <footer className='footer'>
      <ul className='foot_logos'>
        {footItems.map((item) => (
          <li className='footlinks_item' key={item.href}>
            <a className='footlinks_link' href={item.href} target='_blank' rel='noopener noreferrer'>
              <img src={item.imgSrc} alt={item.altText} />
            </a>
          </li>
        ))}
      </ul>
      <div className='foot_links'>
        <NavLinks items={navItems} activeHref={pathname} />
      </div>
    </footer>
  );
};
