# shared/

Componentes reutilizables que no pertenecen a ninguna sección específica.

---

## NavLinks

Lista de links de navegación. Se usa en `NavBar` y `Footer`.

### Props

| Prop          | Tipo           | Requerido | Descripción                                              |
|---------------|----------------|-----------|----------------------------------------------------------|
| `items`       | `NavItem[]`    | ✅        | Array de links a renderizar                              |
| `activeHref`  | `string`       | ❌        | href del link activo — lo resalta con `--color-secundario` |
| `onLinkClick` | `() => void`   | ❌        | Callback al hacer click (útil para cerrar menú en mobile)|
| `className`   | `string`       | ❌        | Clase extra para variantes de estilo por contexto        |

### Uso

```tsx
<NavLinks
  items={navItems}
  activeHref='#inicio'
  onLinkClick={closeMenu}
/>
```

### Estilos base

`NavLinks.css` define los estilos genéricos del componente.
Cada contexto sobreescribe lo que necesita desde su propio CSS.

**Ejemplo — separadores solo en desktop (NavBar.css):**
```css
@media (min-width: 1024px) {
  .navlinks_item + .navlinks_item {
    border-left: 1px solid var(--color-secundario);
  }
}
```

### Nota sobre `activeHref`

Actualmente es un valor estático (`'#inicio'`). Para que cambie
según el scroll, se necesitaría un hook como `useActiveSection`.
