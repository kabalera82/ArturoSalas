# 07 — Páginas secundarias

> Cómo crear cada página que aparece en el navbar.
> Leer `00_ARQUITECTURA.md` y `04_LAYOUT.md` antes de este archivo.

---

## Patrón de cada página

Cada página es un componente en `src/pages/` que compone secciones propias.

```tsx
// pages/LuchadorPage.tsx
export const LuchadorPage = () => {
  return (
    <>
      {/* secciones específicas de esta página */}
    </>
  )
}
```

La página no importa NavBar ni Footer — eso lo hace `PageLayout`.

---

## Páginas planificadas

| Ruta | Archivo | Contenido |
|---|---|---|
| `/` | `HomePage.tsx` | HeroSection + CardsSection + CoachPresentation |
| `/luchador` | `LuchadorPage.tsx` | Palmarés, historia, logros |
| `/noticias` | `NoticiasPage.tsx` | Posts, videos recientes |
| `/contacto` | `ContactoPage.tsx` | Formulario de contacto |
| `/tienda` | `TiendaPage.tsx` | Productos, cursos |

---

## Estructura mínima para empezar

Mientras no se desarrolla el contenido real, crear páginas placeholder:

```tsx
// pages/LuchadorPage.tsx
export const LuchadorPage = () => {
  return (
    <section style={{ padding: '4rem 2rem', color: 'white' }}>
      <h1>Luchador</h1>
      <p>Contenido en construcción.</p>
    </section>
  )
}
```

Esto permite probar que el Router funciona antes de tener el diseño.

---

## Secciones compartidas entre páginas

Si dos páginas necesitan el mismo bloque (por ejemplo, un CTA de contacto al final de varias páginas), ese bloque va en `src/components/` como componente reutilizable, no se copia en cada página.

---

## Navegación activa en NavBar

Cuando se implemente React Router, usar `useLocation` o `NavLink` de react-router-dom para que el link activo en el navbar se marque automáticamente según la URL actual, en lugar de pasar `activeHref` manualmente.

```tsx
import { NavLink } from 'react-router-dom'

<NavLink
  to={item.href}
  className={({ isActive }) => `navlinks_link${isActive ? ' active' : ''}`}
>
  {item.label}
</NavLink>
```
