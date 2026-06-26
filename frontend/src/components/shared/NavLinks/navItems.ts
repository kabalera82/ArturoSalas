export interface NavItem {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: 'Inicio',          href: '/' },
  { label: 'Luchador',        href: '#luchador' },
  { label: 'Noticias',        href: '#noticias' },
  { label: 'Patrocinadores',  href: '#patrocinadores' },
  { label: 'Contacto',        href: '#contacto' },
  { label: 'Tienda',          href: '/shop' },
  { label: 'Cuenta',          href: '/cuenta' },
];
