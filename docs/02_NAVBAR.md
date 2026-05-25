# 02 — NavBar

> Header responsive con marca, navegación y botón de cuenta.
> Leer `00_ARQUITECTURA.md` y `01_SHARED.md` antes de este archivo.

---

## Estructura

```
header.navbar
├── div.navbar_deco        → marca (nombre + subtítulo)
├── nav.navbar_menu        → NavLinks con los navItems
└── div.navbar_actions     → toggle hamburguesa + Button CTA
```

## Comportamiento responsive

- **Mobile** (< 768px): menú oculto. Toggle hamburguesa abre/cierra dropdown con `isMenuOpen`. Botón "Mi cuenta" oculto.
- **Desktop** (≥ 768px): toggle oculto. Menú inline en fila. Botón "Mi cuenta" visible.

## navItems.ts

```ts
type NavItem = { label: string; href: string }
```

**IMPORTANTE:** Cuando se implemente React Router, los `href` deben cambiar de anchors (`#luchador`) a rutas reales (`/luchador`) y los `<a>` del NavLinks deben usar `<Link>` de react-router-dom.

Items actuales: Inicio, Luchador, Noticias, Patrocinadores, Contacto, Tienda.

## Dependencias

- `NavLinks` (shared)
- `Button` (shared), variante `cta`
- Asset: `../../assets/menu.png`

## Pendiente

- Cambiar `href="#seccion"` a rutas `/pagina` cuando se implemente el Router (ver `00_ARQUITECTURA.md`)
- Agregar `aria-expanded` al botón toggle para accesibilidad
- Unificar convención CSS: actualmente usa `navbar_deco` (guión bajo simple) — debe migrarse a BEM doble `navbar__deco`
