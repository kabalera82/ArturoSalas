# NavBar

Header responsive con marca, navegación y botón de cuenta.

## Estructura

```
header.navbar
├── div.navbar_deco        → marca (nombre + subtítulo)
├── nav.navbar_menu        → NavLinks con los navItems
└── div.navbar_actions     → toggle hamburguesa + Button CTA
```

## Comportamiento

- **Mobile** (< 1024px): el menú se oculta. El toggle hamburguesa abre/cierra el dropdown con estado local `isMenuOpen`. El botón "Mi cuenta" está oculto.
- **Desktop** (≥ 1024px): el toggle se oculta. El menú se muestra inline con links en fila. El botón "Mi cuenta" es visible.

## Props

Ninguna. Consume `navItems` directamente desde `./navItems`.

## Datos — navItems.ts

```ts
type NavItem = { label: string; href: string }
```

Items: Inicio, Entrenador, Noticias, Galería, Contacto, Tienda. Todos con anchors `#seccion`.

## CSS relevante

- `.navbar_menu.open` — dropdown visible en mobile
- `.navbar_menu .navlinks_list` — se sobreescribe a `flex-direction: row` en desktop vía media query `@media (min-width: 1024px)`
- `.navbar_menu .navlinks_item + .navlinks_item` — separador `border-left` entre links en desktop

## Dependencias

- `NavLinks` (shared)
- `Button` (shared), variante `cta`
- Asset: `../../assets/menu.png` (icono hamburguesa)
