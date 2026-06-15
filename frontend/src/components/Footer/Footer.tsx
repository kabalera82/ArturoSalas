import './Footer.css';
import { NavLinks } from '../shared/NavLinks/NavLinks';
import { navItems } from '../NavBar/navItems';
import { footItems } from './footItems';

export const Footer = () => {
    return (
        <footer className='footer'>
            <ul className='foot_logos'>
                {footItems.map((item) => (
                    <li className='footlinks_item' key={item.href}>
                        <a className='footlinks_link' href={item.href} target="_blank" rel="noopener noreferrer">
                            <img src={item.imgSrc} alt={item.altText} />
                        </a>
                    </li>
                ))}
            </ul>
            <div className='foot_links'>
                <NavLinks items={navItems} activeHref='#inicio' onLinkClick={() => {}} />
            </div>
        </footer>
    );
}