import './NavLinks.css';

type NavItem = { label: string; href: string };

type NavLinksProps = {
  items: NavItem[];
  activeHref?: string;
  onLinkClick?: () => void;
  className?: string;
};

export const NavLinks = ({ items, activeHref, onLinkClick, className }: NavLinksProps) => {
  return (
    <ul className={`navlinks_list ${className || ''}`}>
      {items.map((item) => (
        <li className='navlinks_item' key={item.href}>
          <a
            className={`navlinks_link${item.href === activeHref ? ' active' : ''}`}
            href={item.href}
            onClick={onLinkClick}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
};
