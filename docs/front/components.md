# Referencia de componentes

---

## NavBar

Header de navegación principal.

```
<header.navbar>
  <div.navbar_deco>        ← Logo + subtítulo
  <button.navbar_toggle>   ← Botón hamburguesa (solo mobile)
  <nav.navbar_menu>        ← Contenedor del menú
    <NavLinks />           ← Componente compartido de links
```

### Comportamiento responsive

| Pantalla           | Comportamiento                                               |
|--------------------|--------------------------------------------------------------|
| Mobile (< 1024px)  | Muestra botón hamburguesa — al hacer clic despliega el menú |
| Desktop (≥ 1024px) | Menú siempre visible en línea horizontal, botón oculto      |

### Archivos

| Archivo       | Propósito                                                            |
|---------------|----------------------------------------------------------------------|
| `NavBar.tsx`  | Lógica del toggle y estructura JSX                                   |
| `NavBar.css`  | Estilos del navbar + overrides de `.navlinks_*` en desktop           |
| `navItems.ts` | Array de links — **pendiente mover a `src/data/navItems.ts`**        |

### Dependencias

- `NavLinks` — `../shared/NavLinks`
- `navItems` — `./navItems` (ver nota arriba)
- `menu.png` — ícono del botón hamburguesa

---

## Footer

Pie de página con links de navegación y redes sociales.

```
<footer.footer>
  <NavLinks />   ← Mismos links del nav, estilos propios del footer
```

### Archivos

| Archivo        | Propósito                                  |
|----------------|--------------------------------------------|
| `Footer.tsx`   | Estructura del footer                      |
| `Footer.css`   | Estilos del footer + overrides de NavLinks |
| `footItems.ts` | Array de iconos y links de redes sociales  |

### Nota sobre footItems

Actualmente todos los `imgSrc` apuntan a `instagram.webp`.
Cada red social debería tener su propio ícono.

---

## shared/NavLinks

Lista de links de navegación reutilizable. La usa `NavBar` y `Footer`.

```tsx
<NavLinks items={navItems} activeHref='#inicio' onLinkClick={closeMenu} />
```

### Props

| Prop          | Tipo         | Requerido | Descripción                                                |
|---------------|--------------|-----------|------------------------------------------------------------|
| `items`       | `NavItem[]`  | Sí        | Array de links a renderizar                                |
| `activeHref`  | `string`     | No        | href del link activo — lo resalta con `--color-secundario` |
| `onLinkClick` | `() => void` | No        | Callback al hacer clic (útil para cerrar menú en mobile)   |
| `className`   | `string`     | No        | Clase extra para variantes de estilo por contexto          |

### Estilos por contexto

`NavLinks.css` define los estilos base. Cada componente padre sobreescribe lo que necesita desde su propio CSS.

```css
/* NavBar.css — desktop: links horizontales con separadores */
@media (min-width: 1024px) {
  .navbar_menu .navlinks_list { flex-direction: row; }
  .navbar_menu .navlinks_item + .navlinks_item { border-left: 1px solid var(--color-gris); }
}

/* Footer.css — links horizontales, sin estado activo */
.footer .navlinks_list { flex-direction: row; gap: 0; }
.footer .navlinks_link { opacity: 0.7; font-size: 0.85rem; }
```

### Nota sobre `activeHref`

Actualmente es un valor estático. Para que cambie según el scroll
se necesitaría un hook como `useActiveSection`.

---

## shared/Button

Botón polimórfico: renderiza como `<button>` o como `<a>` según si recibe `href`.

```tsx
<Button variant='cta'>Mi cuenta</Button>
<Button variant='outline' href='#contacto'>Contactar</Button>
```

### Props

| Prop        | Tipo                                   | Requerido | Descripción                              |
|-------------|----------------------------------------|-----------|------------------------------------------|
| `variant`   | `'primary' \| 'outline' \| 'cta' \| 'cuenta'` | Sí | Variante visual                |
| `children`  | `React.ReactNode`                      | Sí        | Contenido del botón                      |
| `onClick`   | `() => void`                           | No        | Handler de clic (solo cuando es button)  |
| `href`      | `string`                               | No        | Si se pasa, renderiza como `<a>`         |
| `className` | `string`                               | No        | Clase adicional                          |
