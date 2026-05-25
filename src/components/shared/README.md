# Shared Components

Componentes reutilizables sin lógica de negocio. Se usan en NavBar y Footer.

## NavLinks

Renderiza una lista de links de navegación.

```tsx
<NavLinks
  items={navItems}       // NavItem[]  — requerido
  activeHref="#inicio"   // string     — aplica clase .active al link coincidente
  onLinkClick={fn}       // () => void — se llama al hacer click (útil para cerrar menú)
  className="extra"      // string     — se añade a ul.navlinks_list
/>
```

**CSS base:** `flex-direction: column`. Cada consumidor que necesite fila lo sobreescribe desde su propio contexto (ver NavBar y Footer).

---

## Button

Botón polimórfico: renderiza `<button>` o `<a>` según si recibe `href`.

```tsx
<Button variant="cta">Mi cuenta</Button>
<Button variant="primary" href="/tienda">Ver tienda</Button>
```

### Variantes

| Variante  | Color base           | Uso                        |
|-----------|----------------------|----------------------------|
| `primary` | `--color-terciario`  | Acción principal           |
| `outline` | `--color-primario`   | Acción secundaria          |
| `cta`     | `--color-secundario` | Call-to-action en navbar   |
| `cuenta`  | `--color-blanco`     | Acceso a cuenta de usuario |

Todos los estilos son outline-on-hover inverso (fondo sólido ↔ transparente).
