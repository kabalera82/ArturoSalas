import './Footer.css';
import { NavLinks } from '../shared/NavLinks/NavLinks';
import { navItems } from '../NavBar/navItems';

export const Footer = () => {

    return (
        <footer className='footer'>
            <NavLinks items={navItems} activeHref='#inicio' onLinkClick={() => {}} />


        </footer>
    )

}