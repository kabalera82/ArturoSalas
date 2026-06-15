# 01 — Shared Components

> Componentes reutilizables sin lógica de negocio. Se usan en NavBar, Footer y páginas.
> Leer `00_ARQUITECTURA.md` antes de este archivo.

---

## Button

`src/components/shared/Button/Button.tsx`

Botón polimórfico: renderiza `<button>` o `<a>` según si recibe `href`.

```tsx
<Button variant="cta">Comenzar</Button>
<Button variant="primary" href="/tienda">Ver tienda</Button>
<Button variant="outline" onClick={fn}>Cancelar</Button>
```

### Props

| Prop | Tipo | Requerido | Descripción |
|---|---|---|---|
| `variant` | `'primary' \| 'outline' \| 'cta' \| 'cuenta'` | Sí | Estilo visual |
| `children` | `React.ReactNode` | Sí | Contenido del botón |
| `onClick` | `() => void` | No | Handler de click |
| `href` | `string` | No | Si se pasa, renderiza `<a>` |
| `className` | `string` | No | Clase adicional |

### Variantes

| Variante | Color | Uso |
|---|---|---|
| `primary` | `--color-terciario` (rojo) | Acción principal |
| `outline` | `--color-primario` (azul) | Acción secundaria |
| `cta` | `--color-secundario` (amarillo) | Call-to-action destacado |
| `cuenta` | `--color-blanco` | Acceso a cuenta |

---

## NavLinks

`src/components/shared/NavLinks/NavLinks.tsx`

Lista de links de navegación reutilizable en NavBar y Footer.

```tsx
<NavLinks
  items={navItems}
  activeHref="#inicio"
  onLinkClick={closeMenu}
/>
```

### Props

| Prop | Tipo | Requerido | Descripción |
|---|---|---|---|
| `items` | `NavItem[]` | Sí | Array de links |
| `activeHref` | `string` | No | Aplica clase `.active` al link coincidente |
| `onLinkClick` | `() => void` | No | Se llama al hacer click (para cerrar menú mobile) |
| `className` | `string` | No | Clase adicional para `ul` |

**CSS base:** `flex-direction: column`. NavBar y Footer lo sobreescriben a `row` desde su propio contexto.

---

## Card

`src/components/shared/Card/Card.tsx`

Card con video que se reproduce al hacer hover. Usada en `CardsSection`.

```tsx
<Card
  videoSrc="/videos/tecnica1.mp4"
  title="Técnica 1"
  description="Descripción breve"
  buttonLabel="Ver técnica"
/>
```

### Props

| Prop | Tipo | Requerido | Descripción |
|---|---|---|---|
| `videoSrc` | `string` | Sí | Ruta al `.mp4` en `/public/videos/` |
| `title` | `string` | Sí | Título de la card |
| `description` | `string` | Sí | Texto descriptivo |
| `buttonLabel` | `string` | Sí | Texto del botón |
| `onClick` | `() => void` | No | Handler del botón |

### Comportamiento hover

Usa `useRef<HTMLVideoElement>` para controlar el video:
- `onMouseEnter` → `.play()`
- `onMouseLeave` → `.pause()` + `.currentTime = 0`

El video requiere `muted` para que autoplay funcione en todos los navegadores.

### Importante

Los videos deben estar en `/public/videos/`, NO en `src/assets/`. Vite no procesa archivos grandes.
